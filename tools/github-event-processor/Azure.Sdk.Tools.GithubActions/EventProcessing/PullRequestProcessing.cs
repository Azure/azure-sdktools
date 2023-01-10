using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Azure.Sdk.Tools.GitHubEventProcessor.GitHubAuth;
using Octokit.Internal;
using Octokit;
using System.Threading.Tasks;
using Azure.Sdk.Tools.GitHubEventProcessor.GitHubPayload;
using Azure.Sdk.Tools.GitHubEventProcessor.Utils;
using System.Reflection.Emit;
using System.Linq;
using Azure.Sdk.Tools.GitHubEventProcessor.Constants;

namespace Azure.Sdk.Tools.GitHubEventProcessor.EventProcessing
{
    internal class PullRequestProcessing
    {
        internal static async Task ProcessPullRequestEvent(GitHubClient gitHubClient, PullRequestEventGitHubPayload prEventPayload)
        {
            IssueUpdate issueUpdate = null;

            issueUpdate = await PullRequestTriage(gitHubClient, prEventPayload, issueUpdate);
            ResetPullRequestActivity(gitHubClient, prEventPayload, ref issueUpdate);
            await ResetApprovalsForUntrustedChanges(gitHubClient, prEventPayload);

            // If any of the rules have made _issueUpdate changes, it needs to be updated
            if (null != issueUpdate)
            {
                await EventUtils.UpdateIssueOrPullRequest(gitHubClient, prEventPayload.Repository.Id, prEventPayload.PullRequest.Number, issueUpdate);
            }
        }


        /// <summary>
        /// Pull Request Triage https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#pull-request-triage
        /// Trigger: pull request opened
        /// Conditions: Pull request has no labels
        /// Resulting Action: 
        ///     Evaluate the path for each file in the PR, if the path has a label, add the label to the issue
        ///     If the sender is not a Collaborator OR, if they are a collaborator without Write/Admin permissions
        ///         Add "customer-reported" label
        ///         Add "Community Contribution" label
        ///         Create issue comment: "Thank you for your contribution @{issueAuthor} ! We will review the pull request and get back to you soon."
        /// </summary>
        /// <param name="gitHubClient">Authenticated GitHubClient</param>
        /// <param name="prEventPayload">Pull Request event payload</param>
        /// <param name="issueUpdate">The issue update object</param>
        /// <returns></returns>
        internal static async Task<IssueUpdate> PullRequestTriage(GitHubClient gitHubClient,
                                                                  PullRequestEventGitHubPayload prEventPayload,
                                                                  IssueUpdate issueUpdate)
        {
            if (prEventPayload.Action == ActionConstants.Opened)
            {
                if (prEventPayload.PullRequest.Labels.Count == 0)
                {
                    var prFileList = await EventUtils.GetFilesForPullRequest(gitHubClient, prEventPayload.Repository.Id, prEventPayload.PullRequest.Number);
                    var prLabels = CodeOwnerUtils.getPRAutoLabelsForFilePaths(prEventPayload.PullRequest.Labels, prFileList);
                    if (prLabels.Count > 0)
                    {
                        issueUpdate = EventUtils.GetIssueUpdate(prEventPayload.PullRequest, issueUpdate);
                        foreach (var prLabel in prLabels)
                        {
                            issueUpdate.AddLabel(prLabel);
                        }
                    }

                    bool hasAdminOrWritePermission = await AuthUtils.DoesUserHaveAdminOrWritePermission(gitHubClient, prEventPayload.Repository.Id, prEventPayload.PullRequest.User.Login);
                    // The sender will only have Write or Admin permssion if they are a collaborator
                    if (hasAdminOrWritePermission)
                    {
                        issueUpdate = EventUtils.GetIssueUpdate(prEventPayload.PullRequest, issueUpdate);
                        issueUpdate.AddLabel(LabelConstants.CustomerReported);
                        issueUpdate.AddLabel(LabelConstants.CommunityContribution);
                        string prComment = $"Thank you for your contribution @{prEventPayload.PullRequest.User.Login}! We will review the pull request and get back to you soon.";
                        await EventUtils.CreateComment(gitHubClient, prEventPayload.Repository.Id, prEventPayload.PullRequest.Number, prComment);
                    }
                }
            }
            return issueUpdate;
        }

        /// <summary>
        /// Reset Pull Request Activity https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#reset-pull-request-activity
        /// See Common_ResetPullRequestActivity function for details
        /// </summary>
        /// <param name="gitHubClient">Authenticated GitHubClient</param>
        /// <param name="prEventPayload">Pull Request event payload</param>
        /// <param name="issueUpdate">The issue update object</param>
        /// <returns></returns>
        internal static void ResetPullRequestActivity(GitHubClient gitHubClient,
                                                      PullRequestEventGitHubPayload prEventPayload,
                                                      ref IssueUpdate issueUpdate)
        {
            Common_ResetPullRequestActivity(gitHubClient, 
                                            prEventPayload.Action, 
                                            prEventPayload.PullRequest, 
                                            prEventPayload.Repository, 
                                            prEventPayload.Sender, 
                                            ref issueUpdate);
        }

        /// <summary>
        /// Reset Pull Request Activity https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#reset-pull-request-activity
        /// This action has triggers from 3 different events: pull_request and pull_request_review and issue_comment
        /// Note: issue_comment, had to be a different function. While the issue_comment does have a PullRequest on
        /// the issue, it's not a complete PullRequest like what comes in with a pull_request or pull_request_review event.
        /// This function only covers pull_request and pull_request_review
        /// Trigger: 
        ///     pull_request reopened, synchronize (changes pushed), review_requested, merged
        ///     pull_request_review submitted
        /// Conditions for all triggers
        ///     Pull request has "no-recent-activity" label
        ///     User modifying the pull request is not a bot
        /// Conditions for pull request triggers, except for merge
        ///     Pull request is open.
        ///     Action is reopen, synchronize or review requested
        /// Conditions for pull request merged
        ///     Pull request is closed
        ///     Pull request payload, github.event.pull_request.merged, will be true
        /// Resulting Action: 
        ///     Remove "no-recent-activity" label
        ///     Reopen pull request
        /// </summary>
        /// <param name="gitHubClient">Authenticated GitHubClient</param>
        /// <param name="action">The action being performed, from the payload object</param>
        /// <param name="pullRequest">Octokit.PullRequest object from the respective payload</param>
        /// <param name="sender">Octokit.User object from the respective payload. This will be the Sender that initiated the event.</param>
        /// <param name="comment">The comment, if triggered by comment, null otherwise</param>
        /// <param name="issueUpdate">The issue update object</param>
        public static void Common_ResetPullRequestActivity(GitHubClient gitHubClient,
                                                           string action,
                                                           PullRequest pullRequest,
                                                           Repository repository,
                                                           User sender,
                                                           ref IssueUpdate issueUpdate)
        {
            // Normally the action would be checked first but the various events and their conditions
            // all have two checks in common which are quick and would alleviate the need to check anything
            // else.
            // 1. The sender is not a bot.
            // 2. The Pull request has "no-recent-activity" label
            if (sender.Type != AccountType.Bot && 
                LabelUtils.HasLabel(pullRequest.Labels, LabelConstants.NoRecentActivity))
            {
                bool removeLabel = false;
                // Pull request conditions AND the pull request needs to be in an opened state
                if ((action == ActionConstants.Reopened ||
                     action == ActionConstants.Synchronize ||
                     action == ActionConstants.ReviewRequested) &&
                     pullRequest.State == ItemState.Open)
                {
                    removeLabel = true;
                }
                // Pull reqeust merged conditions, the merged flag would be true and the PR would be closed
                else if (action == ActionConstants.Closed &&
                         pullRequest.Merged)
                {
                    removeLabel = true;
                }
                if (removeLabel)
                {
                    issueUpdate = EventUtils.GetIssueUpdate(pullRequest, issueUpdate);
                    issueUpdate.RemoveLabel(LabelConstants.NoRecentActivity);
                    issueUpdate.State = ItemState.Open;
                }
            }
        }

        /// <summary>
        /// Reset auto-merge approvals on untrusted changes https://gist.github.com/jsquire/cfff24f50da0d5906829c5b3de661a84#reset-auto-merge-approvals-on-untrusted-changes
        /// Trigger: pull request synchronized
        /// Conditions:
        ///     Pull request is open
        ///     Pull request has auto-merge enabled
        ///     User who pushed the changes does NOT have a collaborator association
        ///     User who pushed changes does NOT have write permission
        ///     User who pushed changes does NOT have admin permission
        /// Resulting Action: 
        ///     Reset all approvals
        ///     Create issue comment: "Hi @{issueAuthor}.  We've noticed that new changes have been pushed to this pull request.  Because it is set to automatically merge, we've reset the approvals to allow the opportunity to review the updates."
        /// </summary>
        /// <param name="gitHubClient"></param>
        /// <param name="prEventPayload"></param>
        /// <returns></returns>
        internal static async Task ResetApprovalsForUntrustedChanges(GitHubClient gitHubClient,
                                                                     PullRequestEventGitHubPayload prEventPayload)
        {
            if (prEventPayload.Action == ActionConstants.Synchronize)
            {
                if (prEventPayload.PullRequest.State== ItemState.Open &&
                    prEventPayload.AutoMergeEnabled)
                {
                    bool hasAdminOrWritePermission = await AuthUtils.DoesUserHaveAdminOrWritePermission(gitHubClient, prEventPayload.Repository.Id, prEventPayload.PullRequest.User.Login);
                    // The sender will only have Write or Admin permssion if they are a collaborator
                    if (!hasAdminOrWritePermission)
                    {
                        // In this case, get all of the reviews 
                        var reviews = await gitHubClient.PullRequest.Review.GetAll(prEventPayload.Repository.Id, prEventPayload.PullRequest.Number);
                        foreach (var review in reviews)
                        {
                            // For each review that has approved the pull_request, dismiss it
                            if (review.State == PullRequestReviewState.Approved)
                            {
                                // Every dismiss needs a dismiss message. Might as well make it personalized.
                                var prReview = new PullRequestReviewDismiss();
                                prReview.Message = $"Hi @{review.User.Login}.  We've noticed that new changes have been pushed to this pull request.  Because it is set to automatically merge, we've reset the approvals to allow the opportunity to review the updates.";
                                await gitHubClient.PullRequest.Review.Dismiss(prEventPayload.Repository.Id, 
                                                                              prEventPayload.PullRequest.Number,
                                                                              review.Id, 
                                                                              prReview);
                            }
                        }

                        string prComment = $"Hi @{prEventPayload.PullRequest.User.Login}. We've noticed that new changes have been pushed to this pull request.  Because it is set to automatically merge, we've reset the approvals to allow the opportunity to review the updates.";
                        await EventUtils.CreateComment(gitHubClient, prEventPayload.Repository.Id, prEventPayload.PullRequest.Number, prComment);
                    }
                }
            }
            return;
        }
    }
}
