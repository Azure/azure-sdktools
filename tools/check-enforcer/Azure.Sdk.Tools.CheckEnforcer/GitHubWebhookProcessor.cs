﻿using Azure.Core;
using Azure.Identity;
using Azure.Sdk.Tools.CheckEnforcer.Configuration;
using Azure.Sdk.Tools.CheckEnforcer.Handlers;
using Azure.Sdk.Tools.CheckEnforcer.Integrations.GitHub;
using Azure.Security.KeyVault.Keys;
using Azure.Security.KeyVault.Keys.Cryptography;
using Azure.Security.KeyVault.Secrets;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using Octokit;
using Octokit.Internal;
using Polly;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.CheckEnforcer
{
    public class GitHubWebhookProcessor
    {
        public GitHubWebhookProcessor(IGlobalConfigurationProvider globalConfigurationProvider, IGitHubClientProvider gitHubClientProvider, IRepositoryConfigurationProvider repositoryConfigurationProvider, SecretClient secretClient)
        {
            this.globalConfigurationProvider = globalConfigurationProvider;
            this.gitHubClientProvider = gitHubClientProvider;
            this.repositoryConfigurationProvider = repositoryConfigurationProvider;
            this.secretClient = secretClient;
        }
        
        public IGlobalConfigurationProvider globalConfigurationProvider;
        public IGitHubClientProvider gitHubClientProvider;
        private IRepositoryConfigurationProvider repositoryConfigurationProvider;
        private SecretClient secretClient;

        private const string GitHubEventHeader = "X-GitHub-Event";

        private string gitHubAppWebhookSecret;
        private object gitHubAppWebhookSecretLock = new object();

        private string GetGitHubAppWebhookSecret()
        {
            if (gitHubAppWebhookSecret == null)
            {
                lock (gitHubAppWebhookSecretLock)
                {
                    if (gitHubAppWebhookSecret == null)
                    {
                        var gitHubAppWebhookSecretName = globalConfigurationProvider.GetGitHubAppWebhookSecretName();
                        KeyVaultSecret secret = secretClient.GetSecret(gitHubAppWebhookSecretName);
                        gitHubAppWebhookSecret = secret.Value;
                    }
                }
            }

            return gitHubAppWebhookSecret;
        }

        private SecretClient GetSecretClient()
        {
            var keyVaultUri = globalConfigurationProvider.GetKeyVaultUri();
            var credential = new DefaultAzureCredential();

            if (secretClient == null)
            {
                secretClient = new SecretClient(new Uri(keyVaultUri), credential);
            }

            return secretClient;
        }

        private async Task<string> ReadAndVerifyBodyAsync(HttpRequest request, CancellationToken cancellationToken)
        {
            using (var reader = new StreamReader(request.Body))
            {
                var json = await reader.ReadToEndAsync();
                var jsonBytes = Encoding.UTF8.GetBytes(json);

                if (request.Headers.TryGetValue(GitHubWebhookSignatureValidator.GitHubWebhookSignatureHeader, out StringValues signature))
                {
                    var secret = GetGitHubAppWebhookSecret();

                    var isValid = GitHubWebhookSignatureValidator.IsValid(jsonBytes, signature, secret);
                    if (isValid)
                    {
                        return json;
                    }
                    else
                    {
                        throw new CheckEnforcerSecurityException("Webhook signature validation failed.");
                    }
                }
                else
                {
                    throw new CheckEnforcerSecurityException("Webhook missing event signature.");
                }
            }
        }

        public async Task ProcessWebhookAsync(string eventName, string json, ILogger logger, CancellationToken cancellationToken)
        {
            await Policy
                .Handle<AbuseException>()
                .RetryAsync(3, async (ex, retryCount) =>
                {
                    logger.LogWarning("Abuse exception detected, attempting retry.");
                    var abuseEx = (AbuseException)ex;

                    logger.LogInformation("Waiting for {seconds} before retrying.", abuseEx.RetryAfterSeconds);
                    await Task.Delay(TimeSpan.FromSeconds((double)abuseEx.RetryAfterSeconds));
                })
                .ExecuteAsync(async () =>
                {
                    if (eventName == "check_run")
                    {
                        var handler = new CheckRunHandler(globalConfigurationProvider, gitHubClientProvider, repositoryConfigurationProvider, logger);
                        await handler.HandleAsync(json, cancellationToken);
                    }
                    else if (eventName == "issue_comment")
                    {
                        var handler = new IssueCommentHandler(globalConfigurationProvider, gitHubClientProvider, repositoryConfigurationProvider, logger);
                        await handler.HandleAsync(json, cancellationToken);
                    }
                    else if (eventName == "pull_request")
                    {
                        var handler = new PullRequestHandler(globalConfigurationProvider, gitHubClientProvider, repositoryConfigurationProvider, logger);
                        await handler.HandleAsync(json, cancellationToken);
                    }
                });
        }
    }
}
