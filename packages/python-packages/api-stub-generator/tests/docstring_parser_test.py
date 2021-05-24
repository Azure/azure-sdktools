# -------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for
# license information.
# --------------------------------------------------------------------------

from apistub.nodes import DocstringParser
from apistub.nodes import ArgType

docstring_standard_return_type = """
Dummy docstring to verify standard return types and param types
:rtype: str
"""

docstring_Union_return_type1 = """
Dummy docstring to verify standard return types and param types
:rtype: Union[str, int]
"""

docstring_Union_return_type2 = """
Dummy docstring to verify standard return types and param types
:rtype: Union(str, int)
Dummy string at new line
"""

docstring_union_return_type3 = """
Dummy docstring to verify standard return types and param types
:rtype: union[str, int]
"""

docstring_multi_ret_type = """
Dummy docstring to verify standard return types and param types
:rtype: str or ~azure.test.testclass or None
"""

docstring_dict_ret_type = """
Dummy docstring to verify standard return types and param types
:rtype: dict[str, int]
"""

docstring_param_type = """
:param str name: Dummy name param
:param val: Value type
:type val: str
"""

docstring_param_type1 = """
:param str name: Dummy name param
:param val: Value type
:type val: str
:param ~azure.core.pipeline pipeline: dummy pipeline param
:param pipe_id: pipeline id
:type pipe_id: Union[str, int]
:param data: Dummy data
:type data: str or
~azure.dummy.datastream
"""

docstring_param_typing_optional = """
:param group: Optional group to check if user exists in.
:type group: typing.Optional[str]
"""

docstring_param_nested_union = """
:param dummyarg: Optional group to check if user exists in.
:type dummyarg: typing.Union[~azure.eventhub.EventDataBatch, List[~azure.eventhub.EventData]]
"""

docstring_multi_complex_type = """
        :param documents: The set of documents to process as part of this batch.
            If you wish to specify the ID and country_hint on a per-item basis you must
            use as input a list[:class:`~azure.ai.textanalytics.DetectLanguageInput`] or a list of
            dict representations of :class:`~azure.ai.textanalytics.DetectLanguageInput`, like
            `{"id": "1", "country_hint": "us", "text": "hello world"}`.
        :type documents:
            list[str] or list[~azure.ai.textanalytics.DetectLanguageInput] or list[dict[str, str]]
        :keyword str country_hint: A country hint for the entire batch. Accepts two
            letter country codes specified by ISO 3166-1 alpha-2. Per-document
            country hints will take precedence over whole batch hints. Defaults to
            "US". If you don't want to use a country hint, pass the string "none".
        :keyword str model_version: This value indicates which model will
            be used for scoring, e.g. "latest", "2019-10-01". If a model-version
            is not specified, the API will default to the latest, non-preview version.
        :keyword bool show_stats: If set to true, response will contain document
            level statistics.
        :return: The combined list of :class:`~azure.ai.textanalytics.DetectLanguageResult` and
            :class:`~azure.ai.textanalytics.DocumentError` in the order the original documents were
            passed in.
        :rtype: list[~azure.ai.textanalytics.DetectLanguageResult,
            ~azure.ai.textanalytics.DocumentError]
        :raises ~azure.core.exceptions.HttpResponseError or TypeError or ValueError:
        .. admonition:: Example:
            .. literalinclude:: ../samples/sample_detect_language.py
                :start-after: [START batch_detect_language]
                :end-before: [END batch_detect_language]
                :language: python
                :dedent: 8
                :caption: Detecting language in a batch of documents.
"""

docstring_multi_complex_type2 = """ Validate the attestation token based on the options specified in the
         :class:`TokenValidationOptions`.

        :param azure.security.attestation.TokenValidationOptions options: Options to be used when validating
            the token.
        :keyword list[azure.security.attestation.AttestationSigner] signers: Potential signers for the token.
            If the signers parameter is specified, validate_token will only
            consider the signers as potential signatories for the token, otherwise
            it will consider attributes in the header of the token.
        :return bool: Returns True if the token successfully validated, False
            otherwise.

        :raises: azure.security.attestation.AttestationTokenValidationException
        """

docstring_param_type_private = """
:param str name: Dummy name param
:param client: Value type
:type client: ~azure.search.documents._search_index_document_batching_client_base.SearchIndexDocumentBatchingClientBase
"""

docstring_sync_paging = """
:rtype: ~azure.core.paging.ItemPaged[~azure.containerregistry.ArtifactTagProperties]
"""

docstring_async_paging = """
:rtype: ~azure.core.async_paging.AsyncItemPaged[~azure.containerregistry.ArtifactManifestProperties]
"""


class TestDocStringParser:

    def _test_return_type(self, docstring, expected):
        docstring_parser = DocstringParser(docstring)
        assert expected == docstring_parser.find_return_type()

    def _test_variable_type(self, docstring, varname, expected):
        docstring_parser = DocstringParser(docstring)
        assert expected == docstring_parser.find_type("(type|keywordtype|paramtype|vartype)", varname)

    def _test_find_args(self, docstring, expected_args, is_keyword=False):
        parser = DocstringParser(docstring)
        expected = {arg.argname: arg for arg in expected_args}
        for arg in parser.find_args('keyword' if is_keyword else 'param'):
            assert arg.argname in expected and arg.argtype == expected[arg.argname].argtype

    def _test_keyword_type(self, docstring, varname, expected):
        parser = DocstringParser(docstring)
        args = parser.find_args(arg_type="keyword")
        assert args is not None
        for arg in args:
            if arg.argname == varname:
                assert arg.argtype == expected

    def test_return_builtin_return_type(self):
        self._test_return_type(docstring_standard_return_type, "str")

    def test_return_union_return_type(self):
        self._test_return_type(docstring_Union_return_type1, "Union[str, int]")

    def test_return_union_return_type1(self):
        self._test_return_type(docstring_Union_return_type2, "Union(str, int)")

    def test_return_union_lower_case_return_type(self):
        self._test_return_type(docstring_union_return_type3, "union[str, int]")

    def test_multi_return_type(self):
        self._test_return_type(docstring_multi_ret_type, "str or ~azure.test.testclass or None")

    def test_dict_return_type(self):
        self._test_return_type(docstring_dict_ret_type, "dict[str, int]")

    def test_param_type(self):
        self._test_variable_type(docstring_param_type, "val", "str")

    def test_param_type_private(self):
        self._test_variable_type(docstring_param_type_private, "client", "~azure.search.documents._search_index_document_batching_client_base.SearchIndexDocumentBatchingClientBase")

    def test_params(self):
        args = [ArgType("name", "str"), ArgType("val", "str")]
        self._test_find_args(docstring_param_type, args)

    def test_param_optional_type(self):
        self._test_variable_type(docstring_param_type1, "pipe_id", "Union[str, int]")

    def test_param_or_type(self):
        self._test_variable_type(docstring_param_type1, "data", "str or ~azure.dummy.datastream")
        self._test_variable_type(docstring_param_type1, "pipeline", None)

    def test_type_typing_optional(self):
        self._test_variable_type(docstring_param_typing_optional, "group", "typing.Optional[str]")

    def test_nested_union_type(self):
        self._test_variable_type(docstring_param_nested_union, "dummyarg", "typing.Union[~azure.eventhub.EventDataBatch, List[~azure.eventhub.EventData]]")

    def test_multi_text_analytics_type(self):
        self._test_variable_type(docstring_multi_complex_type, "documents", "list[str] or list[~azure.ai.textanalytics.DetectLanguageInput] or list[dict[str, str]]")
        self._test_keyword_type(docstring_multi_complex_type, "model_version", "str")

    def test_multi_attestation_type(self):
        self._test_keyword_type(docstring_multi_complex_type2, "options", "azure.security.attestation.TokenValidationOptions")
        self._test_keyword_type(docstring_multi_complex_type2, "signers", "list[azure.security.attestation.AttestationSigner]")

    def test_paging_type(self):
        docstring_parser = DocstringParser(docstring_sync_paging)
        expected = "ItemPaged[ArtifactManifestProperties]"
        assert expected == docstring_parser.find_return_type()

    def test_async_paging_type(self):
        docstring_parser = DocstringParser(docstring_async_paging)
        expected = "AsyncItemPaged[ArtifactManifestProperties]"
        assert expected == docstring_parser.find_return_type()
