﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Threading.Tasks;
using Xunit;
using Verifier = Azure.ClientSdk.Analyzers.Tests.AzureAnalyzerVerifier<Azure.ClientSdk.Analyzers.ClientMethodsAnalyzer>;

namespace Azure.ClientSdk.Analyzers.Tests
{
    public class AZC0015Tests
    {
        [Theory]
        [InlineData("public Task<Operation<int>> [|ClientMethodAsync|]() { return default; }")]
        [InlineData("public Task<Pageable<int>> [|ClientMethodAsync|]() { return default; }")]
        [InlineData("public int [|ClientMethodAsync|]() { return default; }")]
        [InlineData("public ValueTask<Response<int>> [|ClientMethodAsync|]() { return default; }")]
        [InlineData("public string [|ClientMethodAsync|]() { return default; }")]
        public async Task AZC0015ProducedForInvalidClientMethodReturnTypes(string usage)
        {
            string code = $@"
using System;
using System.Threading.Tasks;
using Azure;

namespace RandomNamespace
{{
    public class SomeClient
    {{
        {usage}       
    }}
}}";
            var analyzer = Verifier.CreateAnalyzer(code, "AZC0015");
            analyzer.DisabledDiagnostics.AddRange(new [] { "AZC0002", "AZC0003", "AZC0004" });
            await analyzer.RunAsync();
        }

        [Theory]
        [InlineData("public Operation<int> ClientMethodAsync() { return default; }")]
        [InlineData("public Pageable<int> ClientMethodAsync() { return default; }")]
        [InlineData("public AsyncPageable<int> ClientMethodAsync() { return default; }")]
        [InlineData("public Response<int> ClientMethodAsync() { return default; }")]
        [InlineData("public Response ClientMethodAsync() { return default; }")]
        [InlineData("public SomeClient ClientMethod() { return default; }")]
        public async Task AZC0015NotProducedForValidReturnTypes(string usage)
        {
            string code = $@"
using System;
using System.Threading.Tasks;
using Azure;

namespace RandomNamespace
{{
    public class SomeClient
    {{
        {usage}       
    }}
}}";
            var analyzer = Verifier.CreateAnalyzer(code);
            analyzer.DisabledDiagnostics.AddRange(new [] { "AZC0002", "AZC0003", "AZC0004" });
            await analyzer.RunAsync();
        }

    }
}