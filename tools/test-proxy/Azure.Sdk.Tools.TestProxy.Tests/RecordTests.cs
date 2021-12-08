using Azure.Sdk.Tools.TestProxy.Common;
using Azure.Sdk.Tools.TestProxy.Matchers;
using Azure.Sdk.Tools.TestProxy.Sanitizers;
using Azure.Sdk.Tools.TestProxy.Transforms;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Azure.Sdk.Tools.TestProxy.Tests
{
    public class RecordTests
    {
        [Fact]
        public void TestStartRecordSimple()
        {
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["x-recording-file"] = "recordings/TestStartRecordSimple.json";

            var controller = new Record(testRecordingHandler)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = httpContext
                }
            };
            controller.Start();
            var recordingId = httpContext.Response.Headers["x-recording-id"].ToString();
            Assert.NotNull(recordingId);
            Assert.True(testRecordingHandler.RecordingSessions.ContainsKey(recordingId));
        }

        [Fact]
        public void TestStartRecordInMemory()
        {
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());
            var httpContext = new DefaultHttpContext();

            var controller = new Record(testRecordingHandler)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = httpContext
                }
            };
            controller.Start();
            var recordingId = httpContext.Response.Headers["x-recording-id"].ToString();

            var (fileName, session) = testRecordingHandler.RecordingSessions[recordingId];

            Assert.Empty(fileName);
        }

        [Fact]
        public void TestStopRecordingSimple()
        {
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());
            var httpContext = new DefaultHttpContext();
            var targetFile = "recordings/TestStartRecordSimple.json";
            httpContext.Request.Headers["x-recording-file"] = targetFile;

            var controller = new Record(testRecordingHandler)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = httpContext
                }
            };
            controller.Start();
            var recordingId = httpContext.Response.Headers["x-recording-id"].ToString();
            httpContext.Request.Headers["x-recording-id"] = recordingId;
            httpContext.Request.Headers.Remove("x-recording-file");

            controller.Stop();

            var fullPath = testRecordingHandler.GetRecordingPath(targetFile);
            Assert.True(File.Exists(fullPath));
        }

        [Fact]
        public void TestStopRecordingInMemory()
        {
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());

            var recordContext = new DefaultHttpContext();
            var recordController = new Record(testRecordingHandler)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = recordContext
                }
            };
            recordController.Start();
            var inMemId = recordContext.Response.Headers["x-recording-id"].ToString();
            recordContext.Request.Headers["x-recording-id"] = new string[] { inMemId
            };
            recordController.Stop();

            Assert.True(testRecordingHandler.InMemorySessions.Count() == 1);
            Assert.NotNull(testRecordingHandler.InMemorySessions[inMemId]);
        }

        [Fact]
        public async Task TestRecordAndMatchDifferentUriOrder()
        {
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());
            var playbackContext = new DefaultHttpContext();
            var targetFile = "Test.RecordEntries/request_with_subscriptionid.json";
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

            // prepare recording context
            playbackContext.Request.Headers.Clear();
            playbackContext.Response.Headers.Clear();
            var requestHeaders = new Dictionary<string, string>(){
                { ":authority", "localhost:5001" },
                { ":method", "POST" },
                { ":path", "/" },
                { ":scheme", "https" },
                { "Accept-Encoding", "gzip" },
                { "Content-Length", "0" },
                { "User-Agent", "Go-http-client/2.0" },
                { "x-recording-id", recordingId },
                { "x-recording-upstream-base-uri", "https://management.azure.com/" }
            };
            foreach (var kvp in requestHeaders)
            {
                playbackContext.Request.Headers.Add(kvp.Key, kvp.Value);
            }
            playbackContext.Request.Method = "POST";

            var queryString = "?uselessUriAddition=hellothere&api-version=2019-05-01";
            var path = "/subscriptions/12345678-1234-1234-5678-123456789010/providers/Microsoft.ContainerRegistry/checkNameAvailability";

            // set URI for the request, deliberately out of order
            playbackContext.Request.Host = new HostString("https://localhost:5001");
            playbackContext.Features.Get<IHttpRequestFeature>().RawTarget = path + queryString;

            await testRecordingHandler.HandlePlaybackRequest(recordingId, playbackContext.Request, playbackContext.Response);
            Assert.Equal("WESTUS:20210909T204819Z:f9a33867-6efc-4748-b322-303b2b933466", playbackContext.Response.Headers["x-ms-routing-request-id"].ToString());
        }

    }
}
