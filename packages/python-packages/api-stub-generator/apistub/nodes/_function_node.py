import logging
import inspect
from collections import OrderedDict
import astroid
import re
from astroid import NodeNG

from ._astroid_parser import AstroidFunctionParser
from ._docstring_parser import DocstringParser
from ._base_node import NodeEntityBase, get_qualified_name
from ._argtype import ArgType


VALIDATION_REQUIRED_DUNDER = ["__init__",]
KWARG_NOT_REQUIRED_METHODS = ["close",]
TYPEHINT_NOT_REQUIRED_METHODS = ["close", "__init__"]
REGEX_ITEM_PAGED = "(~[\w.]*\.)?([\w]*)\s?[\[\(][^\n]*[\]\)]"
PAGED_TYPES = ["ItemPaged", "AsyncItemPaged",]
# Methods that are implementation of known interface should be excluded from lint check
# for e.g. get, update, keys
LINT_EXCLUSION_METHODS = [
    "get",
    "has_key",
    "items",
    "keys",
    "update",
    "values",
    "close",    
]
# Find types like ~azure.core.paging.ItemPaged and group returns ItemPaged.
# Regex is used to find shorten such instances in complex type
# for e,g, ~azure.core.ItemPaged.ItemPaged[~azure.communication.chat.ChatThreadInfo] to ItemPaged[ChatThreadInfo]
REGEX_FIND_LONG_TYPE = "((?:~?)[\w.]+\.+([\w]+))"


def is_kwarg_mandatory(func_name):
    return not func_name.startswith("_") and func_name not in KWARG_NOT_REQUIRED_METHODS


def is_typehint_mandatory(func_name):
    return not func_name.startswith("_") and func_name not in TYPEHINT_NOT_REQUIRED_METHODS


class FunctionNode(NodeEntityBase):
    """Function node class represents parsed function signature.
    Keyword args will be parsed and added to signature if docstring is available.
    :param str: namespace
    :param NodeEntityBase: parent_node
    :param function: obj
    :param astroid.FunctionDef: node
    :param bool: is_module_level
    """

    def __init__(self, namespace, parent_node, *, obj=None, node: astroid.FunctionDef=None, is_module_level=False):
        super().__init__(namespace, parent_node, obj)
        if not obj and node:
            self.name = node.name
            self.display_name = node.name
        self.annotations = []

        # Track **kwargs and *args separately, the way astroid does
        self.special_kwarg = None
        self.special_vararg = None

        self.args = OrderedDict()
        self.kwargs = OrderedDict()
        self.posargs = OrderedDict()

        self.return_type = None
        self.namespace_id = self.generate_id()
        # Set name space level ID as full name
        # Name space ID will be later updated for async methods
        self.full_name = self.namespace_id
        self.is_class_method = False
        self.is_module_level = is_module_level
        # Some of the methods wont be listed in API review
        # For e.g. ABC methods if class implements all ABC methods
        self.hidden = False
        self.node = node or astroid.extract_node(inspect.getsource(obj))
        self._inspect()


    def _inspect(self):
        logging.debug("Processing function {0}".format(self.name))

        self.is_async = isinstance(self.node, astroid.AsyncFunctionDef)
        self.def_key = "async def" if self.is_async else "def"

        # Update namespace ID to reflect async status. Otherwise ID will conflict between sync and async methods
        if self.is_async:
            self.namespace_id += ":async"
        
        # Turn any decorators into annotation
        if self.node.decorators:
            self.annotations = [f"@{x.as_string(preserve_quotes=True)}" for x in self.node.decorators.nodes]

        self.is_class_method = "@classmethod" in self.annotations
        self._parse_function()


    def _parse_function(self):
        """
        Find positional and keyword arguements, type and default value and return type of method
        Parsing logic will follow below order to identify these information
        1. Identify args, types, default and ret type using inspect
        2. Parse type annotations if inspect doesn't have complete info
        3. Parse docstring to find keyword arguements
        4. Parse type hints
        """
        # Add cls as first arg for class methods in API review tool
        if "@classmethod" in self.annotations:
            self.args["cls"] = ArgType(name="cls", argtype=None, default=inspect.Parameter.empty, keyword=None)

        parser = AstroidFunctionParser(self.node, self.namespace, self)
        self.args = parser.args
        self.posargs = parser.posargs
        self.kwargs = parser.kwargs
        self.return_type = get_qualified_name(parser.return_type, self.namespace)
        self.special_kwarg = parser.special_kwarg
        self.special_vararg = parser.special_vararg
        self._parse_docstring()


    def _parse_docstring(self):
        # Parse docstring to get list of keyword args, type and default value for both positional and
        # kw args and return type( if not already found in signature)
        docstring = ""
        if hasattr(self.obj, "__doc__"):
            docstring = getattr(self.obj, "__doc__")
        # Refer docstring at class if this is constructor and docstring is missing for __init__
        if (
            not docstring
            and self.name == "__init__"
            and hasattr(self.parent_node.obj, "__doc__")
        ):
            docstring = getattr(self.parent_node.obj, "__doc__")

        if docstring:
            #  Parse doc string to find missing types, kwargs and return type
            parsed_docstring = DocstringParser(docstring)

            # Set return type if not already set
            if not self.return_type and parsed_docstring.ret_type:
                logging.debug(
                    "Setting return type from docstring for method {}".format(self.name)
                )
                self.return_type = parsed_docstring.ret_type

            # Update positional argument metadata from the docstring; otherwise, stick with
            # what was parsed from the signature.
            for argname, signature_arg in self.args.items():
                docstring_match = parsed_docstring.pos_args.get(argname, None)
                if not docstring_match:
                    continue
                signature_arg.argtype = docstring_match.argtype or signature_arg.argtype
                signature_arg.default = docstring_match.default or signature_arg.default

            # Update keyword argument metadata from the docstring; otherwise, stick with
            # what was parsed from the signature.
            remaining_docstring_kwargs = set(parsed_docstring.kw_args.keys())
            for argname, kw_arg in self.kwargs.items():
                docstring_match = parsed_docstring.kw_args.get(argname, None)
                if not docstring_match:
                    continue
                remaining_docstring_kwargs.remove(argname)
                if not kw_arg.is_required:
                    kw_arg.argtype = kw_arg.argtype or docstring_match.argtype 
                    kw_arg.default = kw_arg.default or docstring_match.default
            
            # ensure any kwargs described only in the docstrings are added
            for argname in remaining_docstring_kwargs:
                self.kwargs[argname] = parsed_docstring.kw_args[argname]

    def _has_any_args(self) -> bool:
        return any([self.args, self.kwargs, self.special_kwarg, self.special_vararg, self.posargs])

    def _generate_short_type(self, long_type):
        short_type = long_type
        groups = re.findall(REGEX_FIND_LONG_TYPE, short_type)
        for g in groups:
            short_type = short_type.replace(g[0], g[1])
        return short_type

    def _generate_args_for_collection(self, items, apiview, use_multi_line):
        for item in items.values():
            # Add new line if args are listed in new line
            if use_multi_line:
                apiview.add_newline()
                apiview.add_whitespace()
            item.generate_tokens(apiview, self.namespace_id, add_line_marker=use_multi_line)
            apiview.add_punctuation(",", False, True)

    def _generate_signature_token(self, apiview):
        apiview.add_punctuation("(")

        # Show args in individual line if method has more than 4 args and use two tabs to properly aign them
        use_multi_line = (len(self.args) + len(self.kwargs)) > 2
        if use_multi_line:
            apiview.begin_group()
            apiview.begin_group()

        self._generate_args_for_collection(self.posargs, apiview, use_multi_line)
        # add postional-only marker if any posargs
        if self.posargs:
            apiview.add_text(text="/", id=self.namespace_id)
            apiview.add_punctuation(",", False, True)

        self._generate_args_for_collection(self.args, apiview, use_multi_line)
        if self.special_vararg:
            self.special_vararg.generate_tokens(apiview, self.namespace_id, add_line_marker=use_multi_line, prefix="*")
            apiview.add_punctuation(",", False, True)

        # add keyword argument marker        
        if self.kwargs:
            apiview.add_text(text="*", id=self.namespace_id)
            apiview.add_punctuation(",", False, True)

        self._generate_args_for_collection(self.kwargs, apiview, use_multi_line)
        if self.special_kwarg:
            self.special_kwarg.generate_tokens(apiview, self.namespace_id, add_line_marker=use_multi_line, prefix="**")
            apiview.add_punctuation(",", False, True)

        # pop the final ", " tokens
        if self._has_any_args():
            apiview.tokens.pop()
            apiview.tokens.pop()

        if use_multi_line:
            apiview.add_newline()
            apiview.end_group()
            apiview.add_whitespace()
            apiview.add_punctuation(")")
            apiview.end_group()
        else:
            apiview.add_punctuation(")")


    def generate_tokens(self, apiview):
        """Generates token for function signature
        :param ApiView: apiview
        """
        parent_id = self.parent_node.namespace_id if self.parent_node else "???"
        logging.info(f"Processing method {self.name} in class {parent_id}")
        # Add tokens for annotations
        for annot in self.annotations:
            apiview.add_whitespace()
            apiview.add_keyword(annot)
            apiview.add_newline()

        apiview.add_whitespace()
        apiview.add_line_marker(self.namespace_id)
        if self.is_async:
            apiview.add_keyword("async", False, True)

        apiview.add_keyword("def", False, True)
        # Show fully qualified name for module level function and short name for instance functions
        apiview.add_text(
            self.namespace_id, self.full_name if self.is_module_level else self.name,
            add_cross_language_id=True
        )
        # Add parameters
        self._generate_signature_token(apiview)
        if self.return_type:
            apiview.add_punctuation("->", True, True)
            # Add line marker id if signature is displayed in multi lines
            if len(self.args) > 2:
                line_id = "{}.returntype".format(self.namespace_id)
                apiview.add_line_marker(line_id)
            apiview.add_type(self.return_type)
        apiview.add_newline()

        if self.errors:
            for e in self.errors:
                apiview.add_diagnostic(e, self.namespace_id)

    def add_error(self, error_msg):
        # Ignore errors for lint check excluded methods
        if self.name in LINT_EXCLUSION_METHODS:
            return

        # Hide all diagnostics for now for dunder methods
        # These are well known protocol implementation
        if not self.name.startswith("_") or self.name in VALIDATION_REQUIRED_DUNDER:
            self.errors.append(error_msg)
        

    def print_errors(self):
        if self.errors:
            print("  method: {}".format(self.name))
            for e in self.errors:
                print("      {}".format(e))
