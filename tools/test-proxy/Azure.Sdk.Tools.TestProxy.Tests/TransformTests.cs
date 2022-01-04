﻿using Azure.Sdk.Tools.TestProxy.Common;
using Azure.Sdk.Tools.TestProxy.Transforms;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using Xunit;

namespace Azure.Sdk.Tools.TestProxy.Tests
{
    public class TransformTests
    {
        [Fact]
        public async Task ConditionalTransformAppliesForRegex()
        {
            var clientIdTransform = new StorageRequestIdTransform(condition: new ApplyCondition() { UriRegex = @".+/Tables.*" });
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());
            testRecordingHandler.Transforms.Clear();
            testRecordingHandler.Transforms.Add(clientIdTransform);

            var playbackContext = new DefaultHttpContext();
            var targetHeaderKey = "x-ms-client-request-id";
            var targetFile = "Test.RecordEntries/response_with_xml_body.json";

            var transformedEntry = TestHelpers.LoadRecordSession(targetFile).Session.Entries[0];
            var clientId = transformedEntry.Request.Headers[targetHeaderKey][0];
            var untransformedEntry = TestHelpers.LoadRecordSession(targetFile).Session.Entries[1];

            // start playback
            playbackContext.Request.Headers["x-recording-file"] = targetFile;
            var controller = new Playback(testRecordingHandler)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = playbackContext
                }
            };
            await controller.Start();
            var recordingId = playbackContext.Response.Headers["x-recording-id"].ToString();

            // transform should apply only to first/last request
            HttpRequest transformedRequest = TestHelpers.CreateRequestFromEntry(transformedEntry);
            HttpResponse transformedResponse = new DefaultHttpContext().Response;
            await testRecordingHandler.HandlePlaybackRequest(recordingId, transformedRequest, transformedResponse);
            Assert.Contains(clientId, transformedResponse.Headers["x-ms-client-request-id"].ToString());

            // this one should not add the x-ms-client-request-id to the response, the transform should NOT apply
            HttpRequest nonTransformedRequest = TestHelpers.CreateRequestFromEntry(untransformedEntry);
            HttpResponse nonTransformedresponse = new DefaultHttpContext().Response;
            await testRecordingHandler.HandlePlaybackRequest(recordingId, nonTransformedRequest, nonTransformedresponse);

            Assert.False(nonTransformedresponse.Headers.ContainsKey(targetHeaderKey));
        }

        [Fact]
        public async Task CanApplyHeaderTransform()
        {
            var headerTransform = new HeaderTransform("Location", "http://localhost", valueRegex: @".*/Tables\(.*");
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());
            testRecordingHandler.Transforms.Clear();
            testRecordingHandler.Transforms.Add(headerTransform);

            var playbackContext = new DefaultHttpContext();
            var targetFile = "Test.RecordEntries/response_with_header_to_transform.json";
            var transformedEntry = TestHelpers.LoadRecordSession(targetFile).Session.Entries[0];
            var untransformedEntry = TestHelpers.LoadRecordSession(targetFile).Session.Entries[1];

            // start playback
            playbackContext.Request.Headers["x-recording-file"] = targetFile;
            var controller = new Playback(testRecordingHandler)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = playbackContext
                }
            };
            await controller.Start();
            var recordingId = playbackContext.Response.Headers["x-recording-id"].ToString();

            // transform should apply only to first request
            HttpRequest request = TestHelpers.CreateRequestFromEntry(transformedEntry);
            HttpResponse response = new DefaultHttpContext().Response;
            await testRecordingHandler.HandlePlaybackRequest(recordingId, request, response);
            Assert.Equal("http://localhost", response.Headers["Location"]);

            // this one should keep the original Location value
            request = TestHelpers.CreateRequestFromEntry(untransformedEntry);
            response = new DefaultHttpContext().Response;
            await testRecordingHandler.HandlePlaybackRequest(recordingId, request, response);
            var originalLocation = untransformedEntry.Response.Headers["Location"];

            Assert.Equal(originalLocation, response.Headers["Location"]);
        }
    }
}
