﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Azure.Sdk.Tools.TestProxy.Common;
using Azure.Sdk.Tools.TestProxy.Common.Exceptions;
using Azure.Sdk.Tools.TestProxy.Store;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.TestProxy
{
    [ApiController]
    [Route("[controller]/[action]")]
    public sealed class Record : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly RecordingHandler _recordingHandler;

        public Record(RecordingHandler recordingHandler, ILoggerFactory loggerFactory)
        {
            _recordingHandler = recordingHandler;
            _logger = loggerFactory.CreateLogger<Record>();
        }

        [HttpPost]
        public async Task Start()
        {
            var body = await HttpRequestInteractions.GetBody(Request);

            string file = HttpRequestInteractions.GetBodyKey(body, "x-recording-file", allowNulls: true);

            var assetsJson = RecordingHandler.GetAssetsJsonLocation(
                HttpRequestInteractions.GetBodyKey(body, "x-recording-assets-file", allowNulls: true),
                _recordingHandler.ContextDirectory);

            await _recordingHandler.StartRecordingAsync(file, Response, assetsJson);
        }


        [HttpPost]
        public async Task Push([FromBody()] IDictionary<string, object> options = null)
        {
            await DebugLogger.LogRequestDetailsAsync(_logger, Request);

            var pathToAssets = RecordingHandler.GetAssetsJsonLocation(StoreResolver.ParseAssetsJsonBody(options), _recordingHandler.ContextDirectory);

            await _recordingHandler.Store.Push(pathToAssets);
        }

        [HttpPost]
        [AllowEmptyBody]
        public void Stop([FromBody()] IDictionary<string, string> variables = null)
        {
            string id = RecordingHandler.GetHeader(Request, "x-recording-id");
            bool save = true;
            EntryRecordMode mode = RecordingHandler.GetRecordMode(Request);

            if (mode != EntryRecordMode.Record && mode != EntryRecordMode.DontRecord)
            {
                throw new HttpException(HttpStatusCode.BadRequest, "When stopping a recording and providing a \"x-recording-skip\" value, only value \"request-response\" is accepted.");
            }

            if (mode == EntryRecordMode.DontRecord)
            {
                save = false;
            }

            _recordingHandler.StopRecording(id, variables: variables, saveRecording: save);
        }

        public async Task HandleRequest()
        {
            string id = RecordingHandler.GetHeader(Request, "x-recording-id");

            await _recordingHandler.HandleRecordRequestAsync(id, Request, Response);
        }
    }
}
