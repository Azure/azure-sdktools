﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ApiView;

namespace APIViewWeb.Respositories
{
    public class ReviewManager
    {
        private readonly CosmosReviewRepository _reviewsRepository;

        private readonly BlobCodeFileRepository _codeFileRepository;

        private readonly BlobOriginalsRepository _originalsRepository;

        private readonly CosmosCommentsRepository _commentsRepository;

        private readonly IEnumerable<ILanguageService> _languageServices;

        public ReviewManager(
            CosmosReviewRepository reviewsRepository,
            BlobCodeFileRepository codeFileRepository,
            BlobOriginalsRepository originalsRepository,
            CosmosCommentsRepository commentsRepository,
            IEnumerable<ILanguageService> languageServices)
        {
            _reviewsRepository = reviewsRepository;
            _codeFileRepository = codeFileRepository;
            _originalsRepository = originalsRepository;
            _commentsRepository = commentsRepository;
            _languageServices = languageServices;
        }

        public async Task<ReviewModel> CreateReviewAsync(ClaimsPrincipal user, string originalName, Stream fileStream, bool runAnalysis)
        {


            ReviewModel reviewModel = new ReviewModel();
            reviewModel.Author = user.GetGitHubLogin();
            reviewModel.CreationDate = DateTime.UtcNow;

            reviewModel.RunAnalysis = runAnalysis;

            var reviewCodeFileModel = await CreateFileAsync(originalName, fileStream, runAnalysis);

            reviewModel.Files = new[] { reviewCodeFileModel };

            reviewModel.Name = reviewCodeFileModel.Name;

            await _reviewsRepository.UpsertReviewAsync(reviewModel);

            return reviewModel;
        }

        public Task<IEnumerable<ReviewModel>> GetReviewsAsync()
        {
            return _reviewsRepository.GetReviewsAsync();
        }

        public async Task DeleteReviewAsync(string id)
        {

            var reviewModel = await _reviewsRepository.GetReviewAsync(id);
            await _reviewsRepository.DeleteReviewAsync(reviewModel);

            foreach (var reviewCodeFileModel in reviewModel.Files)
            {
                if (reviewCodeFileModel.HasOriginal)
                {
                    await _originalsRepository.DeleteOriginalAsync(reviewCodeFileModel.ReviewFileId);
                }
                await _codeFileRepository.DeleteCodeFileAsync(reviewCodeFileModel.ReviewFileId);
            }

            await _commentsRepository.DeleteCommentsAsync(id);
        }

        public async Task<ReviewModel> GetReviewAsync(ClaimsPrincipal user, string id)
        {
            if (user == null)
            {
                throw new UnauthorizedAccessException();
            }

            var review = await _reviewsRepository.GetReviewAsync(id);
            review.UpdateAvailable = user.GetGitHubLogin() == review.Author &&
                                     review.Files.Any(f => f.HasOriginal && GetLanguageService(f.Language).CanUpdate(f.VersionString));
            return review;
        }

        internal async Task UpdateReviewAsync(ClaimsPrincipal user, string id)
        {
            var review = await GetReviewAsync(user, id);
            foreach (var file in review.Files)
            {
                if (!file.HasOriginal)
                {
                    continue;
                }

                var fileOriginal = await _originalsRepository.GetOriginalAsync(file.ReviewFileId);
                var languageService = GetLanguageService(file.Language);

                var codeFile = await languageService.GetCodeFileAsync(file.Name, fileOriginal, file.RunAnalysis);
                await _codeFileRepository.UpsertCodeFileAsync(file.ReviewFileId, codeFile);

                InitializeFromCodeFile(file, codeFile);
            }

            await _reviewsRepository.UpsertReviewAsync(review);
        }

        private void InitializeFromCodeFile(ReviewCodeFileModel file, CodeFile codeFile)
        {
            file.Language = codeFile.Language;
            file.VersionString = codeFile.VersionString;
        }

        private ILanguageService GetLanguageService(string language)
        {
            return _languageServices.Single(service => service.Name == language);
        }

        public async Task AddFileAsync(ClaimsPrincipal user, string id, string originalName, Stream fileStream)
        {
            var review = await GetReviewAsync(user, id);
            review.Files = review.Files.Concat(new[] { await CreateFileAsync(originalName, fileStream, review.RunAnalysis) }).ToArray();
            await _reviewsRepository.UpsertReviewAsync(review);
        }

        private async Task<ReviewCodeFileModel> CreateFileAsync(string originalName, Stream fileStream, bool runAnalysis)
        {
            var originalNameExtension = Path.GetExtension(originalName);
            var languageService = _languageServices.Single(s => s.IsSupportedExtension(originalNameExtension));

            var reviewCodeFileModel = new ReviewCodeFileModel();
            reviewCodeFileModel.HasOriginal = true;
            reviewCodeFileModel.Name = originalName;

            using (var memoryStream = new MemoryStream())
            {
                await fileStream.CopyToAsync(memoryStream);

                memoryStream.Position = 0;

                CodeFile codeFile = await languageService.GetCodeFileAsync(originalName, memoryStream, runAnalysis);

                InitializeFromCodeFile(reviewCodeFileModel, codeFile);

                memoryStream.Position = 0;
                await _originalsRepository.UploadOriginalAsync(reviewCodeFileModel.ReviewFileId, memoryStream);
                await _codeFileRepository.UpsertCodeFileAsync(reviewCodeFileModel.ReviewFileId, codeFile);
            }

            return reviewCodeFileModel;
        }
    }
}