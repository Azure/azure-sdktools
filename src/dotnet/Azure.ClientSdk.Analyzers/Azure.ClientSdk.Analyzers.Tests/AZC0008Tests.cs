﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
using System.Threading.Tasks;
using Xunit;

namespace Azure.ClientSdk.Analyzers.Tests
{
    public class AZC0008Tests
    {
        private readonly DiagnosticAnalyzerRunner _runner = new DiagnosticAnalyzerRunner(new ClientOptionsAnalyzer());

        [Fact]
        public async Task AZC0008ProducedForClientsOptionsWithoutServiceVersionEnum()
        {
            var testSource = TestSource.Read(@"
namespace RandomNamespace
{
    public class /*MM*/SomeClientOptions { 

//        public enum ServiceVersion
//        {
//#pragma warning disable CA1707 // Identifiers should not contain underscores
//            V2018_11_09 = 0
//#pragma warning restore CA1707 // Identifiers should not contain underscores
//        }
    }
}
");
            var diagnostics = await _runner.GetDiagnosticsAsync(testSource.Source);

            var diagnostic = Assert.Single(diagnostics);

            Assert.Equal("AZC0008", diagnostic.Id);
            AnalyzerAssert.DiagnosticLocation(testSource.DefaultMarkerLocation, diagnostics[0].Location);
        }

        [Fact]
        public async Task AZC0008NotProducedForClientsOptionsWithoutServiceVersionEnum()
        {
            var testSource = TestSource.Read(@"
namespace RandomNamespace
{
    public class /*MM*/SomeClientOptions { 

        public enum ServiceVersion
        {
            V2018_11_09 = 0
        }
    }
}
");
            var diagnostics = await _runner.GetDiagnosticsAsync(testSource.Source);
            Assert.Empty(diagnostics);
        }
    }
}
