using Azure.Sdk.Tools.TestProxy.Common;
using Azure.Sdk.Tools.TestProxy.Common.Exceptions;
using Azure.Sdk.Tools.TestProxy.Sanitizers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Xunit;

namespace Azure.Sdk.Tools.TestProxy.Tests
{
    /// <summary>
    /// This test is provided as a preface to a "real" response in helping folks understand why their regex aren't working as they expect
    /// 
    /// Users should modify "Test.RecordEntries/sample_entry.json" to match their request or response, then use the function below to test
    /// the regex they are attempting to register.
    /// 
    /// Below a generalRegexSanitizer is being used, feel free to replace with any sanitizer provided in Azure.Sdk.Tools.TestProxy.Sanitizers.
    /// </summary>
    public class SanitizerTestExample
    {
        
        [Fact]
        public async Task ThisShouldWork()
        {
            var session = TestHelpers.LoadRecordSession("Test.RecordEntries/sample_entry.json");

            // this is what your json body will look like coming over the wire. Notice the double escapes to prevent JSON parse break.
            // it is an identical sanitizer registration to the one above
            var overTheWire = "{ \"value\": \"REDACTED\", \"jsonPath\": \"$..to\" }";

            // Target the type of sanitizer using this. (This is similar to selecting a constructor above)
            var sanitizerName = "BodyKeySanitizer";

    
            #region API registration and running of sanitizer
            // feel free to ignore this setup, bunch of implementation details to register as if coming from external request
            RecordingHandler testRecordingHandler = new RecordingHandler(Directory.GetCurrentDirectory());
            testRecordingHandler.Sanitizers.Clear();
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["x-abstraction-identifier"] = sanitizerName;
            httpContext.Request.Body = TestHelpers.GenerateStreamRequestBody(overTheWire);
            httpContext.Request.ContentLength = httpContext.Request.Body.Length;
            var controller = new Admin(testRecordingHandler, new NullLoggerFactory())
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = httpContext
                }
            };
            await controller.AddSanitizer();
            var registeredSanitizer = testRecordingHandler.Sanitizers[0];
            Assert.NotNull(registeredSanitizer);
            #endregion

            session.Session.Sanitize(registeredSanitizer);
            var newBody = Encoding.UTF8.GetString(session.Session.Entries[0].Response.Body);
            System.Console.WriteLine(newBody);
            Assert.Contains("REDACTED", newBody);
        }

        [Fact]
        public void TestSetRecordingOptionsValidTlsCert()
        {
            var certValue = "-----BEGIN CERTIFICATE-----\nMIIBgTCCASegAwIBAgIRAP8o8bVU8taW6SIlq68ooFAwCgYIKoZIzj0EAwIwFjEU\nMBIGA1UEAwwLQ0NGIE5ldHdvcmswHhcNMjMwNzE5MTQzNTM4WhcNMjMxMDE3MTQz\nNTM3WjAWMRQwEgYDVQQDDAtDQ0YgTmV0d29yazBZMBMGByqGSM49AgEGCCqGSM49\nAwEHA0IABD4ujJba2GkR0bAD+AS+dbUBenPAC6iqXJbM2q+JJWCN1O/GdUfmVZag\nan5OQxn417cKp4dGiExyVpEdeg0/LyKjVjBUMBIGA1UdEwEB/wQIMAYBAf8CAQAw\nHQYDVR0OBBYEFBHQ0lGEDifiYVaYfZkjOCLf2maTMB8GA1UdIwQYMBaAFBHQ0lGE\nDifiYVaYfZkjOCLf2maTMAoGCCqGSM49BAMCA0gAMEUCIDyeyrpYZLGrklG9Z1jy\naKX0U/P5CBmL2jE+1boYEFeyAiEA/hPrtNfhdYX9JrVz8MDWzlojkCClSGwbjn1H\nZMW/wNY=\n-----END CERTIFICATE-----";
            var inputObj = string.Format("{{\"Transport\": {{\"TLSValidationCert\": \"{0}\"}}}}", certValue);
            var testRecordingHandler = new RecordingHandler(Path.Join(Path.GetTempPath(), Guid.NewGuid().ToString()));
            var inputBody = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(inputObj, SerializerOptions);

            testRecordingHandler.SetRecordingOptions(inputBody, null);
        }    
    }
}
