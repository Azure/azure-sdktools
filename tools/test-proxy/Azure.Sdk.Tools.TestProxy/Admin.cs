﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Azure.Sdk.Tools.TestProxy.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.TestProxy
{
    [ApiController]
    [Route("[controller]/[action]")]
    public sealed class Admin : ControllerBase
    {
        private readonly RecordingHandler _recordingHandler;

        public Admin(RecordingHandler recordingHandler) => _recordingHandler = recordingHandler;

        [HttpPost]
        public void StartSession()
        {
            // to begin with, recordings should still be located in their home repository
            if (Request.Headers.TryGetValue("x-recording-sha", out var sha))
            {
                _recordingHandler.Checkout(sha);
            }
        }

        [HttpPost]
        public void StopSession()
        {
            // so far, nothing necessary here
        }


        [HttpPost]
        public void AddTransform(string recordingId)
        {
            // with recordingId passed, the transform will be associated with a specific testId
            
            throw new NotImplementedException();
        }

        [HttpPost]
        public void AddSanitizer()
        {
            throw new NotImplementedException();
        }
    }
}
