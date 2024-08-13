// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
using System.Collections.Generic;
using APIViewWeb.LeanModels;
using CsvHelper.Configuration.Attributes;

namespace APIViewWeb.Models
{
    public class UserPreferenceModel
    {
        internal IEnumerable<string> _language;
        internal IEnumerable<string> _approvedLanguages;
        internal IEnumerable<APIRevisionType> _apiRevisionType;
        internal IEnumerable<string> _state;
        internal IEnumerable<string> _status;
        internal bool? _hideLineNumbers;
        internal bool? _hideLeftNavigation;
        internal bool? _showHiddenApis;
        internal bool? _showDocumentation;
        internal bool? _hideReviewPageOptions;
        internal bool? _hideIndexPageOptions;
        internal bool? _hideSamplesPageOptions;
        internal bool? _hideRevisionsPageOptions;
        internal bool? _showComments;
        internal bool? _showSystemComments;
        internal bool? _disableCodeLinesLazyLoading;
        internal bool? _useBetaIndexPage;
        internal string _theme;

        public string UserName { get; set; }

        [Name("Language")]
        public IEnumerable<string> Language { 
            get => _language ?? new List<string>();
            set => _language = value;
        }

        [Name("ApprovedLanguages")]
        public IEnumerable<string> ApprovedLanguages
        {
            get => _approvedLanguages ?? new List<string>();
            set => _approvedLanguages = value;
        }

        [Name("APIRevisionType")]
        public IEnumerable<APIRevisionType> APIRevisionType {
            get => _apiRevisionType ?? new List<APIRevisionType>();
            set => _apiRevisionType = value;
        }

        [Name("State")]
        public IEnumerable<string> State {
            get => _state ?? new List<string>();
            set => _state = value;
        }

        [Name("Status")]
        public IEnumerable<string> Status {
            get => _status ?? new List<string>();
            set => _status = value;
        }

        [Name("HideLineNumbers")]
        public bool? HideLineNumbers {
            get => _hideLineNumbers ?? false;
            set => _hideLineNumbers = value;
        }

        [Name("HideLeftNavigation")]
        public bool? HideLeftNavigation {
            get => _hideLeftNavigation ?? false;
            set => _hideLeftNavigation = value;
        }

        [Name("Theme")]
        public string Theme {
            get => _theme ?? "light-theme";
            set => _theme = value;
        }

        [Name("ShowHiddenApis")]
        public bool? ShowHiddenApis {
            get => _showHiddenApis ?? false;
            set => _showHiddenApis = value;
        }

        [Name("ShowDocumentation")]
        public bool? ShowDocumentation
        {
            get => _showDocumentation ?? false;
            set => _showDocumentation = value;
        }

        [Name("HideReviewPageOptions")]
        public bool? HideReviewPageOptions
        {
            get => _hideReviewPageOptions ?? false;
            set => _hideReviewPageOptions = value;
        }

        [Name("HideIndexPageOptions")]
        public bool? HideIndexPageOptions
        {
            get => _hideIndexPageOptions ?? false;
            set => _hideIndexPageOptions = value;
        }

        [Name("HideSamplesPageOptions")]
        public bool? HideSamplesPageOptions
        {
            get => _hideSamplesPageOptions ?? false;
            set => _hideSamplesPageOptions = value;
        }

        [Name("HideRevisionsPageOptions")]
        public bool? HideRevisionsPageOptions
        {
            get => _hideRevisionsPageOptions ?? false;
            set => _hideRevisionsPageOptions = value;
        }

        [Name("ShowComments")]
        public bool? ShowComments
        {
            get => _showComments ?? true;
            set => _showComments = value;
        }

        [Name("ShowSystemComments")]
        public bool? ShowSystemComments
        {
            get => _showSystemComments ?? true;
            set => _showSystemComments = value;
        }

        [Name("DisableCodeLinesLazyLoading")]
        public bool? DisableCodeLinesLazyLoading
        {
            get => _disableCodeLinesLazyLoading ?? false;
            set => _disableCodeLinesLazyLoading = value;
        }

        [Name("UseBetaIndexPage")]
        public bool? UseBetaIndexPage
        {
            get => _useBetaIndexPage ?? false;
            set => _useBetaIndexPage = value;
        }
    }
}
