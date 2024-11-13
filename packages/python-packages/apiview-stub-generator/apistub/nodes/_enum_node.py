from typing import TYPE_CHECKING

from ._base_node import NodeEntityBase
from .._generated.treestyle.parser.models import ReviewToken as Token, TokenKind

if TYPE_CHECKING:
    from .._generated.treestyle.parser.models._patch import ReviewLine

class EnumNode(NodeEntityBase):
    """Enum node represents any Enum value
    """

    def __init__(self, *, name, namespace, parent_node, obj):
        super().__init__(namespace, parent_node, obj)
        self.name = name
        self.value = obj.value
        self.namespace_id = self.generate_id()

    def generate_tokens(self, review_lines):
        """Generates token for the node and it's children recursively and add it to apiview
        :param ApiView: apiview
        """
        line = review_lines.create_review_line(line_id=self.namespace_id)
        line.add_text(self.name)
        line.add_punctuation("=")
        if isinstance(self.value, str):
            line.add_string_literal(self.value)
        else:
            line.add_literal(str(self.value))
        for err in self.pylint_errors:
            err.generate_tokens(review_lines, self.namespace_id)
        review_lines.append(line)
