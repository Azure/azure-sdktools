﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using APIViewWeb.Filters;
using APIViewWeb.Respositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace APIViewWeb.Controllers
{
    [TypeFilter(typeof(ApiKeyAuthorizeAsyncFilter))]
    public class AutoReviewController : Controller
    {
        private readonly ReviewManager _reviewManager;

        public AutoReviewController(ReviewManager reviewManager)
        {
            _reviewManager = reviewManager;
        }

        [HttpPost]
        public async Task<ActionResult> UploadAutoReview([FromForm] IFormFile file)
        {
            if (file != null)
            {
                using (var openReadStream = file.OpenReadStream())
                {
                    var review = await _reviewManager.CreateMasterReviewAsync(User, file.FileName, "Auto Review", openReadStream, false);
                    if(review != null)
                    {
                        //Return 200 OK if last revision is approved and 201 if revision is not yet approved.
                        var result = review.Revisions.Last().Approvers.Count > 0 ? Ok() : StatusCode(statusCode: StatusCodes.Status201Created);
                        return result;
                    }
                }
            }
            // Return internal server error for any unknown error
            return StatusCode(statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
