from collections import OrderedDict
import re
import inspect
import logging
from ._argtype import ArgType


find_type_hint_ret_type = "(?<!#)\\s->\\s+([^\n:]*)"

line_tag_regex = re.compile(r"^\s*:([^:]+):(.*)")

docstring_types = ["param", "type", "paramtype", "keyword", "rtype"]

docstring_type_keywords = ["type", "vartype", "paramtype"]

docstring_param_keywords = ["param", "ivar", "keyword"]

docstring_return_keywords = ["rtype"]


class DocstringParser:
    """This represents a parsed doc string which has list of positional and keyword arguements and return type
    """

    def __init__(self, docstring):
        self.pos_args = OrderedDict()
        self.kw_args = OrderedDict()
        self.ivars = OrderedDict()
        self.ret_type = None
        self.docstring = docstring
        self._parse()

    def _process_arg_tuple(self, tag, line1, line2):
        # When two items are found, it is either the name
        # or the type. Example:
        # :param name: The name of the thing.
        # :type name: str
        #
        # This method has an inherent limitation that type info
        # can only span one extra line, not more than one.
        (keyword, label) = tag
        if keyword in docstring_param_keywords:
            arg = ArgType(name=label, argtype=None)
            self._update_arg(arg, keyword)
            return (arg, True)
        elif keyword in docstring_type_keywords:
            arg = self._arg_for_type(label, keyword)
            # If there's only useful text in the current or next line, we must
            # assume that line contains the type info.
            if line1 and not line2:
                arg.argtype = line1
            elif line2 and not line1:
                arg.argtype = line2
            elif line_tag_regex.match(line2):
                # if line2 can be parsed into a tag, it can't 
                # have extra type info for line1.
                arg.argtype = line1
            else:
                # TODO: When this assumption breaks down, you will need to revist...
                # Assume both lines contain type info and concatenate
                arg.argtype = " ".join([line1, line2])

    def _arg_for_type(self, name, keyword) -> ArgType:
        if keyword == "type":
            return self.pos_args[name]
        elif keyword == "vartype":
            return self.ivars[name]
        elif keyword == "paramtype":
            return self.kw_args[name]
        else:
            logging.error(f"Unexpected keyword {keyword}.")
            return None

    def _process_arg_triple(self, tag):
        # When three items are found, all necessary info is found
        # and there can only be one simple type
        # Example: :param str name: The name of the thing.
        (keyword, typename, name) = tag
        arg = ArgType(name=name, argtype=typename)
        self._update_arg(arg, keyword)

    def _process_return_type(self, line1, line2):
        # If there's only useful text in the current or next line, we must
        # assume that line contains the type info.
        if line1 and not line2:
            self.ret_type = line1
        elif line2 and not line1:
            self.ret_type = line2
        else:
            # FIXME: How to distinguish between the case where
            # the type info is fully contained on one line and followed
            # by an irrelevant line from the case where the type info
            # is split across two lines.
            self.ret_type = " ".join([line1, line2])

    def _update_arg(self, arg, keyword):
        if keyword == "ivar":
            self.ivars[arg.argname] = arg
        elif keyword == "param":
            self.pos_args[arg.argname] = arg
        elif keyword == "keyword":
            self.kw_args[arg.argname] = arg
        else:
            logging.error(f"Unexpected keyword: {keyword}")

    def _parse(self):
        """Parses a docstring into an object."""
        if not self.docstring:
            logging.error("Unable to parse empty docstring.")
            return

        lines = [x.strip() for x in self.docstring.splitlines()]
        for line_no, line in enumerate(lines):

            tag_match = line_tag_regex.match(line)
            if not tag_match:
                continue

            (tag, line1) = tag_match.groups()
            split_tag = tag.split()
            if len(split_tag) == 3:
                self._process_arg_triple(split_tag)
                continue

            # retrieve next line, if available
            try:
                line2 = lines[line_no + 1].strip()
            except IndexError:
                line2 = None

            if len(split_tag) == 2:
                self._process_arg_tuple(split_tag, line1.strip(), line2)
            elif len(split_tag) == 1 and split_tag[0] == "rtype":
                self._process_return_type(line1.strip(), line2)

    def type_for(self, name):
        arg = (
            self.ivars.get(name, None) or
            self.pos_args.get(name, None) or
            self.kw_args.get(name, None)
        )
        return arg.argtype if arg else arg


class TypeHintParser:
    """TypeHintParser helps to find return type from type hint is type hint is available
    :param object: obj
    """

    def __init__(self, obj):
        self.obj = obj
        try:
            self.code = inspect.getsource(obj)
        except:
            self.code = None
            logging.error("Failed to get source of object {}".format(obj))

    def find_return_type(self):
        """Returns return type is type hint is available
        """
        if not self.code:
            return None

        # Find return type from type hint
        ret_type = re.search(find_type_hint_ret_type, self.code)
        # Don't return None as string literal
        if ret_type and ret_type != "None":
            return ret_type.groups()[-1]
        else:
            return None
