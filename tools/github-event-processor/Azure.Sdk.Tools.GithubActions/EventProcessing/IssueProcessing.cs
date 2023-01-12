using System;
using System.IO;
using System.Collections.Generic;
using System.Text;
using Octokit.Internal;
using Octokit;
using Azure.Sdk.Tools.GitHubEventProcessor.GitHubAuth;
using System.Threading.Tasks;
using Azure.Sdk.Tools.GitHubEventProcessor.GitHubPayload;
using Azure.Sdk.Tools.GitHubEventProcessor.Constants;
using Azure.Sdk.Tools.GitHubEventProcessor.Utils;
using static System.Collections.Specialized.BitVector32;
using System.Reflection.Emit;

namespace Azure.Sdk.Tools.GitHubEventProcessor.EventProcessing
{
    internal class IssueProcessing
    {
        /// <summary>
        /// Issue rules can be found on the gist, https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#issue-rules
        /// Every rule will have it's own function that will be called here.
        /// </summary>
        /// <param name="gitHubEventClient"></param>
        /// <param name="rawJson"></param>
        /// <returns></returns>
        internal static async Task ProcessIssueEvent(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            await InitialIssueTriage(gitHubEventClient, issueEventPayload);
            ManualIssueTriage(gitHubEventClient, issueEventPayload);
            ServiceAttention(gitHubEventClient, issueEventPayload);
            CXPAttention(gitHubEventClient, issueEventPayload);
            ManualTriageAfterExternalAssignment(gitHubEventClient, issueEventPayload);
            RequireAttentionForNonMilestone(gitHubEventClient, issueEventPayload);
            AuthorFeedbackNeeded(gitHubEventClient, issueEventPayload);
            IssueAddressed(gitHubEventClient, issueEventPayload);
            IssueAddressedReset(gitHubEventClient, issueEventPayload);

            // After all of the rules have been processed, call to process pending updates
            int numUpdates = await gitHubEventClient.ProcessPendingUpdates(issueEventPayload.Repository.Id, issueEventPayload.Issue.Number);
        }

        // Processing functions should always do the following, in order
        // 1. If the rule is based upon an Action (event), verify the rule action matches the action
        // 2. If #1 is true, verify all of the conditions
        // 3. If using an IssueUpdate, it'll be a ref parameter (if non-async), otherwise the funtion will
        //    return an updated IssueUpdate
        /// <summary>
        /// Initial Issue Triage https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#initial-issue-triage
        /// Trigger: issue opened
        /// Conditions: Issue has no labels
        ///             Issue has no assignee
        /// Resulting Action: JRS-TBD, I need the AI service to query
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        /// <returns></returns>
        internal static async Task InitialIssueTriage(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            // JRS-RuleCheck
            if (issueEventPayload.Action == ActionConstants.Opened)
            {
                // If there are no labels and no assignees
                if ((issueEventPayload.Issue.Labels.Count == 0) && (issueEventPayload.Issue.Assignee == null))
                {
                    // JRS - IF creator is NOT an Azure SDK team owner - 
                    bool isMember = await gitHubEventClient.IsUserMemberOfOrg(OrgConstants.Azure, issueEventPayload.Sender.Login);
                    bool isCollaborator = await gitHubEventClient.IsUserCollaborator(issueEventPayload.Repository.Id, issueEventPayload.Sender.Login);
                    if (!isMember && !isCollaborator)
                    {
                        var issueUpdate = gitHubEventClient.GetIssueUpdate(issueEventPayload.Issue);
                        issueUpdate.AddLabel(LabelConstants.NeedsTriage);
                    }
                }
                /* JRS The AI label service does not exist yet
                Query AI label service for suggestions:
                IF labels were predicted:
                    - Assign returned labels to the issue
                    - Add "needs-team-attention" label to the issue
                    IF service label is associated with an Azure SDK team member:
                        IF a single team member:
                            - Assign team member to the issue
                        ELSE
                            - Assign a random team member from the set to the issue
                            - Add a comment mentioning the other team members from the set
                        - Add comment indicating issue was routed for assistance  
                            (text: "Thank you for your feedback.  Tagging and routing to the team member best able to assist.")
                    ELSE
                        - Add "CXP Attention" label to the issue
                        - Create a comment mentioning (content from .NET rule #30)
                ELSE
                    - Add "needs-triage" label to the issue
                */
            }
        }

        /// <summary>
        /// Manual Issue Triage https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#manual-issue-triage
        /// Trigger: issue labeled
        /// Conditions: Issue is open
        ///             Issue has "needs-triage" label
        ///             Label being added is NOT "needs-triage"
        /// Resulting Action: Remove "needs-triage" label
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        internal static void ManualIssueTriage(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            // JRS-RulecCheck
            if (issueEventPayload.Action == ActionConstants.Labeled)
            {
                // if the issue is open, has needs-triage label and label being added is not needs-triage
                // then remove the needs-triage label
                if (issueEventPayload.Issue.State == ItemState.Open &&
                    LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.NeedsTriage) &&
                    !issueEventPayload.Label.Name.Equals(LabelConstants.NeedsTriage))
                {
                    var issueUpdate = gitHubEventClient.GetIssueUpdate(issueEventPayload.Issue);
                    issueUpdate.RemoveLabel(LabelConstants.NeedsTriage);
                }
            }
        }

        /// <summary>
        /// Service Attention https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#service-attention
        /// This does not use issue update, it creates a comment
        /// Trigger: issue labeled
        /// Conditions: Issue is open
        ///             Label being added is "Service Attention"
        /// Resulting Action: Add issue comment
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        /// <returns></returns>
        internal static void ServiceAttention(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            if (issueEventPayload.Action == ActionConstants.Labeled)
            {
                // JRS - what to do if ServiceAttention is the only label, there will be no
                // CodeOwnerEntries found?
                // if the issue is open, and the label being added is ServiceAttention
                if (issueEventPayload.Issue.State == ItemState.Open &&
                    issueEventPayload.Label.Name.Equals(LabelConstants.ServiceAttention))
                {
                    string partiesToMention = CodeOwnerUtils.GetPartiesToMentionForServiceAttention(issueEventPayload.Issue.Labels);
                    if (null != partiesToMention)
                    {
                        string issueComment = $"Thanks for the feedback! We are routing this to the appropriate team for follow-up. cc ${partiesToMention}.";
                        gitHubEventClient.CreateComment(issueEventPayload.Repository.Id, issueEventPayload.Issue.Number, issueComment);
                    }
                    else
                    {
                        // If there are no codeowners found then output the issue URL so it's in the logs for the event
                        Console.WriteLine($"There were no parties to mention for issue: {issueEventPayload.Issue.Url}");
                    }
                }
            }
        }

        /// <summary>
        /// CXP Attention https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#cxp-attention
        /// This does not use issue update, it creates a comment.
        /// Trigger: issue labeled
        /// Conditions: Issue is open
        ///             Label being added is "CXP-Attention"
        ///             Does not have "Service-Attention" label
        /// Resulting Action: Add issue comment
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        /// <returns></returns>
        internal static void CXPAttention(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            if (issueEventPayload.Action == ActionConstants.Labeled)
            {

                if (issueEventPayload.Issue.State == ItemState.Open &&
                issueEventPayload.Label.Name.Equals(LabelConstants.CXPAttention) &&
                !LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.ServiceAttention))
                {
                    string issueComment = "Thank you for your feedback.  This has been routed to the support team for assistance.";
                    gitHubEventClient.CreateComment(issueEventPayload.Repository.Id, issueEventPayload.Issue.Number, issueComment);
                }
            }
        }

        /// <summary>
        /// Manual Triage After External Assignment https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#manual-triage-after-external-assignment
        /// Trigger: issue unlabeled
        /// Conditions: Issue is open
        ///             Has "customer-reported" label
        ///             Label removed is "Service Attention" OR "CXP Attention"
        /// Resulting Action: Add "needs-team-triage" label
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        internal static void ManualTriageAfterExternalAssignment(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            if (issueEventPayload.Action == ActionConstants.Unlabeled)
            {
                if (issueEventPayload.Issue.State == ItemState.Open &&
                LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.CustomerReported) &&
                (issueEventPayload.Label.Name.Equals(LabelConstants.CXPAttention) ||
                 issueEventPayload.Label.Name.Equals(LabelConstants.ServiceAttention)))
                {
                    var issueUpdate = gitHubEventClient.GetIssueUpdate(issueEventPayload.Issue);
                    issueUpdate.AddLabel(LabelConstants.NeedsTeamTriage);
                }
            }
        }

        /// <summary>
        /// Reset Issue Activity https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#reset-issue-activity
        /// See Common_ResetIssueActivity comments
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        internal static void ResetIssueActivity(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            Common_ResetIssueActivity(gitHubEventClient, issueEventPayload.Action, issueEventPayload.Issue, issueEventPayload.Sender);
        }

        /// <summary>
        /// Common function for Reset Issue Activity
        /// Trigger: issue reopened/edited, issue_comment created
        /// Conditions: Issue is open OR Issue is being reopened
        ///             Issue has "no-recent-activity" label
        ///             User modifying the issue is NOT a known bot 
        /// Resulting Action: Add "needs-team-triage" label
        /// </summary>
        /// </summary>
        /// <param name="_gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="action">The action being performed, from the payload object</param>
        /// <param name="user">Octokit.User object from the respective payload.</param>
        public static void Common_ResetIssueActivity(GitHubEventClient gitHubEventClient, string action, Issue issue, User sender)
        {
            // Is this enabled?
            if ((issue.State == ItemState.Open || action == ActionConstants.Reopened) &&
                LabelUtils.HasLabel(issue.Labels, LabelConstants.NoRecentActivity) &&
                // If a user is a known GitHub bot, the user's AccountType will be Bot
                sender.Type != AccountType.Bot)
            {
                var issueUpdate = gitHubEventClient.GetIssueUpdate(issue);
                issueUpdate.AddLabel(LabelConstants.NeedsTeamTriage);
            }
        }

        /// <summary>
        /// Require Attention For Non Milestone https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#require-attention-for-non-milestone
        /// Trigger: issue labeled/unlabeled
        /// Conditions: Issue is open
        ///             Issue has label "customer-reported"
        ///             Issue does NOT have label "needs-team-attention"
        ///             Issue does NOT have label "needs-triage"
        ///             Issue does NOT have label "needs-team-triage"
        ///             Issue does NOT have label "needs-author-feedback"
        ///             Issue does NOT have label "issue-addressed"
        ///             Issue is not in a milestone
        /// Resulting Action: Add "needs-team-attention" label
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        internal static void RequireAttentionForNonMilestone(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            if (issueEventPayload.Action == ActionConstants.Labeled || issueEventPayload.Action == ActionConstants.Unlabeled)
            {
                if (issueEventPayload.Issue.State == ItemState.Open &&
                    LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.CustomerReported) &&
                    !LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.NeedsTeamAttention) &&
                    !LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.NeedsTriage) &&
                    !LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.NeedsTeamTriage) &&
                    !LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.NeedsAuthorFeedback) &&
                    !LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.IssueAddressed) &&
                    null == issueEventPayload.Issue.Milestone)
                {
                    var issueUpdate = gitHubEventClient.GetIssueUpdate(issueEventPayload.Issue);
                    issueUpdate.AddLabel(LabelConstants.NeedsTeamAttention);
                }
            }
        }

        /// <summary>
        /// Author Feedback Needed https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#author-feedback-needed
        /// Trigger: issue labeled
        /// Conditions: Issue is open
        ///             Label added is "needs-author-feedback"
        /// Resulting Action: 
        ///             Add "needs-team-attention" label
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        internal static void AuthorFeedbackNeeded(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            if (issueEventPayload.Action == ActionConstants.Labeled)
            {
                if (issueEventPayload.Issue.State == ItemState.Open &&
                    issueEventPayload.Label.Name == LabelConstants.NeedsAuthorFeedback)
                {
                    var issueUpdate = gitHubEventClient.GetIssueUpdate(issueEventPayload.Issue);
                    issueUpdate.AddLabel(LabelConstants.NeedsTeamAttention);
                }
            }
        }
        // 
        /// <summary>
        /// Issue Addressed https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#issue-addressed
        /// Trigger: issue labeled
        /// Conditions: Issue is open
        ///             Label added is "needs-author-feedback"
        /// Resulting Action: 
        ///     Remove "needs-triage" label
        ///     Remove "needs-team-triage" label
        ///     Remove "needs-team-attention" label
        ///     Remove "needs-author-feedback" label
        ///     Remove "no-recent-activity" label
        ///     Add issue comment
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        internal static void IssueAddressed(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            if (issueEventPayload.Action == ActionConstants.Labeled)
            {
                if (issueEventPayload.Issue.State == ItemState.Open &&
                    issueEventPayload.Label.Name == LabelConstants.NeedsAuthorFeedback)
                {
                    var issueUpdate = gitHubEventClient.GetIssueUpdate(issueEventPayload.Issue);
                    issueUpdate.RemoveLabel(LabelConstants.NeedsTriage);
                    issueUpdate.RemoveLabel(LabelConstants.NeedsTeamAttention);
                    issueUpdate.RemoveLabel(LabelConstants.NeedsAuthorFeedback);
                    issueUpdate.RemoveLabel(LabelConstants.NoRecentActivity);
                    string issueComment = $"Hi {issueEventPayload.Issue.User.Login}.  Thank you for opening this issue and giving us the opportunity to assist.  We believe that this has been addressed.  If you feel that further discussion is needed, please add a comment with the text \"/unresolve\" to remove the \"issue-addressed\" label and continue the conversation.";
                    gitHubEventClient.CreateComment(issueEventPayload.Repository.Id, issueEventPayload.Issue.Number, issueComment);
                }
            }
        }

        /// <summary>
        /// Issue Addressed Reset https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#issue-addressed-reset
        /// Trigger: issue labeled
        /// Conditions: Issue is open
        ///             Issue has label "issue-addressed"
        ///             Label added is any one of:
        ///                 "needs-team-attention"
        ///                 "needs-author-feedback"
        ///                 "Service Attention"
        ///                 "CXP Attention"
        ///                 "needs-triage"
        ///                 "needs-team-triage"
        /// Resulting Action: 
        ///     Remove "issue-addressed" label
        /// </summary>
        /// <param name="gitHubEventClient">Authenticated gitHubEventClient</param>
        /// <param name="issueEventPayload">Issue event payload</param>
        internal static void IssueAddressedReset(GitHubEventClient gitHubEventClient, IssueEventGitHubPayload issueEventPayload)
        {
            if (issueEventPayload.Action == ActionConstants.Labeled)
            {
                if (issueEventPayload.Issue.State == ItemState.Open &&
                    LabelUtils.HasLabel(issueEventPayload.Issue.Labels, LabelConstants.IssueAddressed))
                {
                    if (issueEventPayload.Label.Name == LabelConstants.NeedsTeamAttention ||
                        issueEventPayload.Label.Name == LabelConstants.NeedsAuthorFeedback ||
                        issueEventPayload.Label.Name == LabelConstants.ServiceAttention ||
                        issueEventPayload.Label.Name == LabelConstants.CXPAttention ||
                        issueEventPayload.Label.Name == LabelConstants.NeedsTriage ||
                        issueEventPayload.Label.Name == LabelConstants.NeedsTeamTriage)
                    {
                        var issueUpdate = gitHubEventClient.GetIssueUpdate(issueEventPayload.Issue);
                        issueUpdate.RemoveLabel(LabelConstants.IssueAddressed);
                    }
                }
            }
        }
    }
}
