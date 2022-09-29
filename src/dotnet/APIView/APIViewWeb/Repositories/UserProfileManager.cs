﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using APIViewWeb.Models;
using APIViewWeb.Repositories;
using Microsoft.AspNetCore.Authorization;
using Octokit;

namespace APIViewWeb
{
    public class UserProfileManager
    {
        private CosmosUserProfileRepository _UserProfileRepository;

        public UserProfileManager(CosmosUserProfileRepository UserProfileRepository)
        {
            _UserProfileRepository = UserProfileRepository;
        }

        public async Task createUserProfileAsync(ClaimsPrincipal User, string Email, HashSet<string> Langauges = null)
        {
            await _UserProfileRepository.upsertUserProfileAsync(User, new UserProfileModel(User, Email, Langauges));
        }

        public async Task<UserProfileModel> tryGetUserProfileAsync(ClaimsPrincipal User)
        {   
            return await _UserProfileRepository.tryGetUserProfileAsync(User);
        }

        public async Task<UserProfileModel> tryGetUserProfileByNameAsync(string UserName)
        {
            return await _UserProfileRepository.tryGetUserProfileByNameAsync(UserName);
        }

        public async Task updateEmailAsync(ClaimsPrincipal User, string email)
        {
            UserProfileModel UserProfile = await tryGetUserProfileAsync(User);
            if (UserProfile.UserName == null)
            {
                return;
            }

            UserProfile.Email = email;
            await _UserProfileRepository.upsertUserProfileAsync(User, UserProfile);
        }

        public async Task updateLanguagesAsync(ClaimsPrincipal User, HashSet<string> languages)
        {
            UserProfileModel UserProfile = await tryGetUserProfileAsync(User);
            if (UserProfile.UserName == null)
            {
                return;
            }

            if(languages != null)
            {
                UserProfile.Languages = languages;
            }
            else
            {
                UserProfile.Languages = new HashSet<string>();
            }
            await _UserProfileRepository.upsertUserProfileAsync(User, UserProfile);
        }

        // TESTING ONLY - REMOVE BEFORE PR
        public async Task removeUserProfile(ClaimsPrincipal User)
        {
            await _UserProfileRepository.deleteUserProfileAsync(User);
        }

    }
}
