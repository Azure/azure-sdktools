using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using Octokit;

namespace Azure.Sdk.Tools.GithubEventProcessor.GitHubPayload
{
    // In theory, we should be using deserializing the GitHubAction Payload Event into
    // Octokit's PullRequestEventPayload but it's missing the Label which we need for the
    // Labeled/Unlabeled PullRequest github action events.
    [DebuggerDisplay("{DebuggerDisplay,nq}")]
    public class PullRequestEventGitHubPayload : ActivityPayload
    {
        public string Action { get; private set; }
        public int Number { get; private set; }
        public PullRequest PullRequest { get; private set; }
        public Label Label { get; private set; }
    }
}
