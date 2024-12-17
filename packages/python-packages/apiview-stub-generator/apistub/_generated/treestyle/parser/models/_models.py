# coding=utf-8
# --------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.
# Code generated by Microsoft (R) Python Code Generator.
# Changes may cause incorrect behavior and will be lost if the code is regenerated.
# --------------------------------------------------------------------------

from typing import Any, Dict, List, Literal, Mapping, Optional, TYPE_CHECKING, Union, overload

from .. import _model_base
from .._model_base import rest_field

if TYPE_CHECKING:
    from .. import models as _models


class CodeDiagnostic(_model_base.Model):
    """System comment object is to add system generated comment. It can be one of the 4 different
    types of system comments.


    :ivar diagnostic_id: Diagnostic ID is auto generated ID by CSharp analyzer.
    :vartype diagnostic_id: str
    :ivar target_id: Id of ReviewLine object where this diagnostic needs to be displayed. Required.
    :vartype target_id: str
    :ivar text: Auto generated system comment to be displayed under targeted line. Required.
    :vartype text: str
    :ivar level: Required. Known values are: 1, 2, 3, and 4.
    :vartype level: int or ~treestyle.parser.models.CodeDiagnosticLevel
    :ivar help_link_uri:
    :vartype help_link_uri: str
    """

    diagnostic_id: Optional[str] = rest_field(name="DiagnosticId")
    """Diagnostic ID is auto generated ID by CSharp analyzer."""
    target_id: str = rest_field(name="TargetId")
    """Id of ReviewLine object where this diagnostic needs to be displayed. Required."""
    text: str = rest_field(name="Text")
    """Auto generated system comment to be displayed under targeted line. Required."""
    level: Union[int, "_models.CodeDiagnosticLevel"] = rest_field(name="Level")
    """Required. Known values are: 1, 2, 3, and 4."""
    help_link_uri: Optional[str] = rest_field(name="HelpLinkUri")

    @overload
    def __init__(
        self,
        *,
        target_id: str,
        text: str,
        level: Union[int, "_models.CodeDiagnosticLevel"],
        diagnostic_id: Optional[str] = None,
        help_link_uri: Optional[str] = None,
    ): ...

    @overload
    def __init__(self, mapping: Mapping[str, Any]):
        """
        :param mapping: raw JSON to initialize the model.
        :type mapping: Mapping[str, Any]
        """

    def __init__(self, *args: Any, **kwargs: Any) -> None:  # pylint: disable=useless-super-delegation
        super().__init__(*args, **kwargs)


class CodeFile(_model_base.Model):
    """ReviewFile represents entire API review object. This will be processed to render review lines.


    :ivar package_name: Required.
    :vartype package_name: str
    :ivar package_version: Required.
    :vartype package_version: str
    :ivar parser_version: version of the APIview language parser used to create token file.
     Required.
    :vartype parser_version: str
    :ivar language: Required. Is one of the following types: Literal["C"], Literal["C++"],
     Literal["C#"], Literal["Go"], Literal["Java"], Literal["JavaScript"], Literal["Kotlin"],
     Literal["Python"], Literal["Swagger"], Literal["Swift"], Literal["TypeSpec"]
    :vartype language: str or str or str or str or str or str or str or str or str or str or str
    :ivar language_variant: Language variant is applicable only for java variants. Is one of the
     following types: Literal["None"], Literal["Spring"], Literal["Android"]
    :vartype language_variant: str or str or str
    :ivar cross_language_package_id:
    :vartype cross_language_package_id: str
    :ivar review_lines: Required.
    :vartype review_lines: list[~treestyle.parser.models.ReviewLine]
    :ivar diagnostics: Add any system generated comments. Each comment is linked to review line ID.
    :vartype diagnostics: list[~treestyle.parser.models.CodeDiagnostic]
    :ivar navigation: Navigation items are used to create a tree view in the navigation panel. Each
     navigation item is linked to a review line ID. This is optional.
     If navigation items are not provided then navigation panel will be automatically generated
     using the review lines. Navigation items should be provided only if you want to customize the
     navigation panel.
    :vartype navigation: list[~treestyle.parser.models.NavigationItem]
    """

    package_name: str = rest_field(name="PackageName")
    """Required."""
    package_version: str = rest_field(name="PackageVersion")
    """Required."""
    parser_version: str = rest_field(name="ParserVersion")
    """version of the APIview language parser used to create token file. Required."""
    language: Literal[
        "C", "C++", "C#", "Go", "Java", "JavaScript", "Kotlin", "Python", "Swagger", "Swift", "TypeSpec"
    ] = rest_field(name="Language")
    """Required. Is one of the following types: Literal[\"C\"], Literal[\"C++\"], Literal[\"C#\"],
     Literal[\"Go\"], Literal[\"Java\"], Literal[\"JavaScript\"], Literal[\"Kotlin\"],
     Literal[\"Python\"], Literal[\"Swagger\"], Literal[\"Swift\"], Literal[\"TypeSpec\"]"""
    language_variant: Optional[Literal["None", "Spring", "Android"]] = rest_field(name="LanguageVariant")
    """Language variant is applicable only for java variants. Is one of the following types:
     Literal[\"None\"], Literal[\"Spring\"], Literal[\"Android\"]"""
    cross_language_package_id: Optional[str] = rest_field(name="CrossLanguagePackageId")
    review_lines: List["_models.ReviewLine"] = rest_field(name="ReviewLines")
    """Required."""
    diagnostics: Optional[List["_models.CodeDiagnostic"]] = rest_field(name="Diagnostics")
    """Add any system generated comments. Each comment is linked to review line ID."""
    navigation: Optional[List["_models.NavigationItem"]] = rest_field(name="Navigation")
    """Navigation items are used to create a tree view in the navigation panel. Each navigation item
     is linked to a review line ID. This is optional.
     If navigation items are not provided then navigation panel will be automatically generated
     using the review lines. Navigation items should be provided only if you want to customize the
     navigation panel."""

    @overload
    def __init__(
        self,
        *,
        package_name: str,
        package_version: str,
        parser_version: str,
        language: Literal[
            "C", "C++", "C#", "Go", "Java", "JavaScript", "Kotlin", "Python", "Swagger", "Swift", "TypeSpec"
        ],
        review_lines: List["_models.ReviewLine"],
        language_variant: Optional[Literal["None", "Spring", "Android"]] = None,
        cross_language_package_id: Optional[str] = None,
        diagnostics: Optional[List["_models.CodeDiagnostic"]] = None,
        navigation: Optional[List["_models.NavigationItem"]] = None,
    ): ...

    @overload
    def __init__(self, mapping: Mapping[str, Any]):
        """
        :param mapping: raw JSON to initialize the model.
        :type mapping: Mapping[str, Any]
        """

    def __init__(self, *args: Any, **kwargs: Any) -> None:  # pylint: disable=useless-super-delegation
        super().__init__(*args, **kwargs)


class NavigationItem(_model_base.Model):
    """NavigationItem.


    :ivar text: Required.
    :vartype text: str
    :ivar navigation_id: Required.
    :vartype navigation_id: str
    :ivar child_items: Required.
    :vartype child_items: list[~treestyle.parser.models.NavigationItem]
    :ivar tags: Required.
    :vartype tags: dict[str, str]
    """

    text: str = rest_field(name="Text")
    """Required."""
    navigation_id: str = rest_field(name="NavigationId")
    """Required."""
    child_items: List["_models.NavigationItem"] = rest_field(name="ChildItems")
    """Required."""
    tags: Dict[str, str] = rest_field(name="Tags")
    """Required."""

    @overload
    def __init__(
        self,
        *,
        text: str,
        navigation_id: str,
        child_items: List["_models.NavigationItem"],
        tags: Dict[str, str],
    ): ...

    @overload
    def __init__(self, mapping: Mapping[str, Any]):
        """
        :param mapping: raw JSON to initialize the model.
        :type mapping: Mapping[str, Any]
        """

    def __init__(self, *args: Any, **kwargs: Any) -> None:  # pylint: disable=useless-super-delegation
        super().__init__(*args, **kwargs)


class ReviewLine(_model_base.Model):
    """ReviewLine object corresponds to each line displayed on API review. If an empty line is
    required then add a code line object without any token.


    :ivar line_id: lineId is only required if we need to support commenting on a line that contains
     this token.
     Usually code line for documentation or just punctuation is not required to have lineId. lineId
     should be a unique value within
     the review token file to use it assign to review comments as well as navigation Id within the
     review page.
     for e.g Azure.Core.HttpHeader.Common, azure.template.template_main.
    :vartype line_id: str
    :ivar cross_language_id:
    :vartype cross_language_id: str
    :ivar tokens: list of tokens that constructs a line in API review. Required.
    :vartype tokens: list[~treestyle.parser.models.ReviewToken]
    :ivar children: Add any child lines as children. For e.g. all classes and namespace level
     methods are added as a children of namespace(module) level code line.
     Similarly all method level code lines are added as children of it's class code line.
    :vartype children: list[~treestyle.parser.models.ReviewLine]
    :ivar is_hidden: Set current line as hidden code line by default. .NET has hidden APIs and
     architects don't want to see them by default.
    :vartype is_hidden: bool
    :ivar is_context_end_line: Set current line as context end line. For e.g. line with token } or
     empty line after the class or function/method to mark end of context.
    :vartype is_context_end_line: bool
    :ivar related_to_line: Set ID of related line to ensure current line is not visible when a
     related line is hidden.
     One e.g. is a code line for class attribute that should set class line's Line ID as related
     line ID.
     OR a method line decorator that should set method's line ID as related line ID.
    :vartype related_to_line: str
    """

    line_id: Optional[str] = rest_field(name="LineId")
    """lineId is only required if we need to support commenting on a line that contains this token.
     Usually code line for documentation or just punctuation is not required to have lineId. lineId
     should be a unique value within
     the review token file to use it assign to review comments as well as navigation Id within the
     review page.
     for e.g Azure.Core.HttpHeader.Common, azure.template.template_main."""
    cross_language_id: Optional[str] = rest_field(name="CrossLanguageId")
    tokens: List["_models.ReviewToken"] = rest_field(name="Tokens")
    """list of tokens that constructs a line in API review. Required."""
    children: Optional[List["_models.ReviewLine"]] = rest_field(name="Children")
    """Add any child lines as children. For e.g. all classes and namespace level methods are added as
     a children of namespace(module) level code line.
     Similarly all method level code lines are added as children of it's class code line."""
    is_hidden: Optional[bool] = rest_field(name="IsHidden")
    """Set current line as hidden code line by default. .NET has hidden APIs and architects don't want
     to see them by default."""
    is_context_end_line: Optional[bool] = rest_field(name="IsContextEndLine")
    """Set current line as context end line. For e.g. line with token } or empty line after the class
     or function/method to mark end of context."""
    related_to_line: Optional[str] = rest_field(name="RelatedToLine")
    """Set ID of related line to ensure current line is not visible when a related line is hidden.
     One e.g. is a code line for class attribute that should set class line's Line ID as related
     line ID.
     OR a method line decorator that should set method's line ID as related line ID."""

    @overload
    def __init__(
        self,
        *,
        tokens: List["_models.ReviewToken"],
        line_id: Optional[str] = None,
        cross_language_id: Optional[str] = None,
        children: Optional[List["_models.ReviewLine"]] = None,
        is_hidden: Optional[bool] = None,
        is_context_end_line: Optional[bool] = None,
        related_to_line: Optional[str] = None,
    ): ...

    @overload
    def __init__(self, mapping: Mapping[str, Any]):
        """
        :param mapping: raw JSON to initialize the model.
        :type mapping: Mapping[str, Any]
        """

    def __init__(self, *args: Any, **kwargs: Any) -> None:  # pylint: disable=useless-super-delegation
        super().__init__(*args, **kwargs)


class ReviewToken(_model_base.Model):
    """Token corresponds to each component within a code line. A separate token is required for
    keyword, punctuation, type name, text etc.


    :ivar kind: Required. Known values are: 0, 1, 2, 3, 4, 5, 6, 7, and 8.
    :vartype kind: int or ~treestyle.parser.models.TokenKind
    :ivar value: Required.
    :vartype value: str
    :ivar navigation_display_name: NavigationDisplayName is used to create a tree node in the
     navigation panel. Navigation nodes will be created only if token contains navigation display
     name.
    :vartype navigation_display_name: str
    :ivar navigate_to_id: navigateToId should be set if the underlying token is required to be
     displayed as HREF to another type within the review.
     For e.g. a param type which is class name in the same package.
    :vartype navigate_to_id: str
    :ivar skip_diff: Set skipDiff to true if underlying token needs to be ignored from diff
     calculation. For e.g. package metadata or dependency versions
     are usually excluded when comparing two revisions to avoid reporting them as API changes.
    :vartype skip_diff: bool
    :ivar is_deprecated: This is set if API is marked as deprecated.
    :vartype is_deprecated: bool
    :ivar has_suffix_space: Set this to false if there is no suffix space required before next
     token. For e.g, punctuation right after method name.
    :vartype has_suffix_space: bool
    :ivar has_prefix_space: Set this to true if there is a prefix space required before current
     token. For e.g, space before token for =.
    :vartype has_prefix_space: bool
    :ivar is_documentation: Set isDocumentation to true if current token is part of documentation.
    :vartype is_documentation: bool
    :ivar render_classes: Language specific style css class names. To render navigation icons, one
     of the following must be specified:
     "namespace", "class", "method", "enum". If NavigationDisplayName is specified, then this field
     should be set.
    :vartype render_classes: list[str]
    """

    kind: Union[int, "_models.TokenKind"] = rest_field(name="Kind")
    """Required. Known values are: 0, 1, 2, 3, 4, 5, 6, 7, and 8."""
    value: str = rest_field(name="Value")
    """Required."""
    navigation_display_name: Optional[str] = rest_field(name="NavigationDisplayName")
    """NavigationDisplayName is used to create a tree node in the navigation panel. Navigation nodes
     will be created only if token contains navigation display name."""
    navigate_to_id: Optional[str] = rest_field(name="NavigateToId")
    """navigateToId should be set if the underlying token is required to be displayed as HREF to
     another type within the review.
     For e.g. a param type which is class name in the same package."""
    skip_diff: Optional[bool] = rest_field(name="SkipDiff")
    """Set skipDiff to true if underlying token needs to be ignored from diff calculation. For e.g.
     package metadata or dependency versions
     are usually excluded when comparing two revisions to avoid reporting them as API changes."""
    is_deprecated: Optional[bool] = rest_field(name="IsDeprecated")
    """This is set if API is marked as deprecated."""
    has_suffix_space: Optional[bool] = rest_field(name="HasSuffixSpace")
    """Set this to false if there is no suffix space required before next token. For e.g, punctuation
     right after method name."""
    has_prefix_space: Optional[bool] = rest_field(name="HasPrefixSpace")
    """Set this to true if there is a prefix space required before current token. For e.g, space
     before token for =."""
    is_documentation: Optional[bool] = rest_field(name="IsDocumentation")
    """Set isDocumentation to true if current token is part of documentation."""
    render_classes: Optional[List[str]] = rest_field(name="RenderClasses")
    """Language specific style css class names. To render navigation icons, one of the following must
     be specified:
     \"namespace\", \"class\", \"method\", \"enum\". If NavigationDisplayName is specified, then
     this field should be set."""

    @overload
    def __init__(
        self,
        *,
        kind: Union[int, "_models.TokenKind"],
        value: str,
        navigation_display_name: Optional[str] = None,
        navigate_to_id: Optional[str] = None,
        skip_diff: Optional[bool] = None,
        is_deprecated: Optional[bool] = None,
        has_suffix_space: Optional[bool] = None,
        has_prefix_space: Optional[bool] = None,
        is_documentation: Optional[bool] = None,
        render_classes: Optional[List[str]] = None,
    ): ...

    @overload
    def __init__(self, mapping: Mapping[str, Any]):
        """
        :param mapping: raw JSON to initialize the model.
        :type mapping: Mapping[str, Any]
        """

    def __init__(self, *args: Any, **kwargs: Any) -> None:  # pylint: disable=useless-super-delegation
        super().__init__(*args, **kwargs)
