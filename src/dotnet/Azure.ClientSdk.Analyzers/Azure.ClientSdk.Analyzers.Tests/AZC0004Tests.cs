// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Threading.Tasks;
using Xunit;
using Verifier = Azure.ClientSdk.Analyzers.Tests.AzureAnalyzerVerifier<Azure.ClientSdk.Analyzers.ClientMethodsAnalyzer>;

namespace Azure.ClientSdk.Analyzers.Tests
{
    public class AZC0004Tests
    {
        [Fact]
        public async Task AZC0004ProducedForMethodsWithoutSyncAlternative()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> {|AZC0004:GetAsync|}(CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForMethodsWithoutAsyncAlternative()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Response {|AZC0004:Get|}(CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForMethodsWithCancellationToken()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> GetAsync(CancellationToken cancellationToken = default)
        {
            return null;
        }
        public virtual Response Get(CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForMethodsWithOptionalRequestContext()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> GetAsync(RequestContext context = null)
        {
            return null;
        }
        public virtual Response Get(RequestContext context = null)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .WithDisabledDiagnostics("AZC0018")
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForMethodsWithRequiredRequestContext()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> GetAsync(RequestContext context)
        {
            return null;
        }
        public virtual Response Get(RequestContext context)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForMethodsNotMatch()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> {|AZC0004:GetAsync|}(string a, CancellationToken cancellationToken = default)
        {
            return null;
        }
        public virtual Response {|AZC0004:Get|}(string a, RequestContext context)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForMethodsWithNotMatchedRequestContext()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> {|AZC0004:GetAsync|}(RequestContext context = null)
        {
            return null;
        }
        public virtual Response {|AZC0004:Get|}(RequestContext context)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .WithDisabledDiagnostics("AZC0018")
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForGenericMethodsWithSyncAlternative()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> GetAsync(CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response Get(CancellationToken cancellationToken = default)
        {
            return null;
        }
        
        public virtual Task<Response> {|AZC0004:GetAsync|}<T>(CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForGenericMethodsWithSyncAlternative()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> GetAsync(CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response Get(CancellationToken cancellationToken = default)
        {
            return null;
        }
        
        public virtual Task<Response> GetAsync<T>(CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response Get<T>(CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForGenericMethodsTakingGenericArgWithoutSyncAlternative()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> GetAsync(CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response Get(CancellationToken cancellationToken = default)
        {
            return null;
        }
        
        public virtual Task<Response> {|AZC0004:GetAsync|}<T>(T item, CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForGenericMethodsTakingGenericArgWithSyncAlternative()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> GetAsync(CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response Get(CancellationToken cancellationToken = default)
        {
            return null;
        }
        
        public virtual Task<Response> GetAsync<T>(T item, CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response Get<T>(T item, CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NProducedForMethodsWithoutArgMatchedSyncAlternative()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;
namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> {|AZC0004:GetAsync|}(int sameNameDifferentType, CancellationToken cancellationToken = default)
        {
            return null;
        }
        public virtual Response {|AZC0004:Get|}(string sameNameDifferentType, CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
        await Verifier.CreateAnalyzer(code)
                .RunAsync();
    }

    [Fact]
        public async Task AZC0004NotProducedForGenericMethodsTakingGenericExpressionArgWithSyncAlternative()
        {
            const string code = @"
using Azure;
using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> QueryAsync<T>(Expression<Func<T, bool>> filter, CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response Query<T>(Expression<Func<T, bool>> filter, CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForGenericMethodsTakingGenericExpressionArgWithoutSyncAlternative()
        {
            const string code = @"
using Azure;
using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> {|AZC0004:QueryAsync|}<T>(Expression<Func<T, bool>> filter, CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response {|AZC0004:Query|}<T>(Expression<Func<T, string, bool>> filter, CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForArrayTypesWithSyncAlternative()
        {
            const string code = @"
using Azure;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> AppendAsync(
            byte[] arr,
            CancellationToken cancellationToken = default)
        {
            return null;
        }


        public virtual Response Append(
            byte[] arr,
            CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForArrayTypesWithoutSyncAlternative()
        {
            const string code = @"
using Azure;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> {|AZC0004:AppendAsync|}(
            byte[] arr,
            CancellationToken cancellationToken = default)
        {
            return null;
        }


        public virtual Response {|AZC0004:Append|}(
            string[] arr,
            CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004ProducedForMethodsWithoutSyncAlternativeWithMatchingArgNames()
        {
            const string code = @"
using Azure;
using System.Threading;
using System.Threading.Tasks;

namespace RandomNamespace
{
    public class SomeClient
    {
        public virtual Task<Response> {|AZC0004:GetAsync|}(int foo, CancellationToken cancellationToken = default)
        {
            return null;
        }

        public virtual Response {|AZC0004:Get|}(int differentName, CancellationToken cancellationToken = default)
        {
            return null;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForConstructorOrPropertyOrOverride()
        {
            const string code = @"
namespace RandomNamespace
{
    public class SomeClient
    {
        private string _id;
        public virtual string Id => _id;

        public override bool Equals(object obj) => base.Equals(obj);

        protected SomeClient()
        {
        }

        public SomeClient(string id)
        {
            _id = id;
        }
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }

        [Fact]
        public async Task AZC0004NotProducedForGetSubClientMethod()
        {
            const string code = @"
namespace RandomNamespace
{
    public class SomeClient
    {
        public Sub GetSubClient()
        {
            return null;
        }
    }

    public class Sub
    {
    }
}";
            await Verifier.CreateAnalyzer(code)
                .RunAsync();
        }
    }
}
