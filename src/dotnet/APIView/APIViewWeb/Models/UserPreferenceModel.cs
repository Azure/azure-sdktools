// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
using System.Collections.Generic;
using CsvHelper.Configuration.Attributes;
using Newtonsoft.Json;

namespace APIViewWeb.Models
{
    public class UserPreferenceModel
    {
        internal IEnumerable<string> _language;
        internal IEnumerable<string> _approvedLanguages;
        internal IEnumerable<ReviewType> _filterType;
        internal IEnumerable<string> _state;
        internal IEnumerable<string> _status;
        internal IEnumerable<string> _firstReleaseApproval;
        internal bool? _hideLineNumbers;
        internal bool? _hideLeftNavigation;
        internal bool? _showHiddenApis;
        internal bool? _hideReviewPageOptions;
        internal bool? _hideIndexPageOptions;
        internal bool? _showComments;
        internal bool? _showSystemComments;
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

        [Name("FilterType")]
        public IEnumerable<ReviewType> FilterType {
            get => _filterType ?? new List<ReviewType>();
            set => _filterType = value;
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

        [Name("FirstReleaseApproval")]
        public IEnumerable<string> FirstReleaseApproval
        {
            get => _firstReleaseApproval ?? new List<string>();
            set => _firstReleaseApproval = value;
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
    }
}
