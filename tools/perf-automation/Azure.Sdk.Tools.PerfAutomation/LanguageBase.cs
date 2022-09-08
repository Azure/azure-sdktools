﻿using Azure.Sdk.Tools.PerfAutomation.Models;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.PerfAutomation
{
    public abstract class LanguageBase : ILanguage
    {
        protected abstract Language Language { get; }
        protected string WorkingDirectory => Program.Config.WorkingDirectories[Language];
        protected string ProfileDirectory => Path.GetFullPath(Path.Combine(WorkingDirectory, Language + "-profile"));

        public abstract Task CleanupAsync(string project);

        public abstract Task<IterationResult> RunAsync(
            string project,
            string languageVersion,
            IDictionary<string, string> packageVersions,
            string testName,
            string arguments,
            string context,
            bool profile);

        public abstract Task<(string output, string error, string context)> SetupAsync(
            string project,
            string languageVersion,
            IDictionary<string, string> packageVersions);

        public virtual IDictionary<string, string> FilterRuntimePackageVersions(IDictionary<string, string> runtimePackageVersions)
            => runtimePackageVersions;
    }
}
