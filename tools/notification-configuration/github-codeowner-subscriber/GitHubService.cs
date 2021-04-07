﻿using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace GitHubCodeownerSubscriber
{
    /// <summary>
    /// Interface for interacting with GitHub
    /// </summary>
    public class GitHubService
    {
        private static HttpClient httpClient = new HttpClient();
        private static MemoryCache memoryCache = new MemoryCache(new MemoryCacheOptions());

        private readonly ILogger<GitHubService> logger;

        /// <summary>
        /// Creates a new GitHubService
        /// </summary>
        /// <param name="logger">Logger</param>
        public GitHubService(ILogger<GitHubService> logger)
        {
            this.logger = logger;
        }

        /// <summary>
        /// Looks for CODEOWNERS in the master branch of the given repo URL using cache
        /// </summary>
        /// <param name="repoUrl">GitHub repository URL</param>
        /// <returns>Contents fo the located CODEOWNERS file</returns>
        public async Task<string> GetCodeownersFile(Uri repoUrl)
        {
            string result;
            if (memoryCache.TryGetValue(repoUrl.ToString(), out result))
            {
                return result; 
            }

            result = await GetCodeownersFileImpl(repoUrl);
            memoryCache.Set(repoUrl.ToString(), result);
            return result;
        }

        /// <summary>
        /// Looks for CODEOWNERS in the master branch of the given repo URL
        /// </summary>
        /// <param name="repoUrl"></param>
        /// <returns></returns>
        private async Task<string> GetCodeownersFileImpl(Uri repoUrl)
        {
            // Gets the repo path from the URL
            var relevantPathParts = repoUrl.Segments.Skip(1).Take(2);
            var repoPath = string.Join("", relevantPathParts);

            var codeOwnersUrl = $"https://raw.githubusercontent.com/{repoPath}/master/.github/CODEOWNERS";
            var result = await httpClient.GetAsync(codeOwnersUrl);
            if (result.IsSuccessStatusCode)
            {
                logger.LogInformation("Retrieved CODEOWNERS file URL = {0}", codeOwnersUrl);
                return await result.Content.ReadAsStringAsync();
            }

            logger.LogWarning("Could not retrieve CODEOWNERS file URL = {0} ResponseCode = {1}", codeOwnersUrl, result.StatusCode);
            return default;
        }

    }
}
