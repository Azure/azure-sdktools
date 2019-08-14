﻿using Microsoft.CodeAnalysis;
using ApiView;
using Xunit;

namespace APIViewTest
{
    public class TypeParameterTests
    {
        [Fact]
        public void TypeParameterTestCreation()
        {
            var methodSymbol = (IMethodSymbol)TestResource.GetTestMember("TestLibrary.PublicInterface`1", "TypeParamParamsMethod");
            MethodApiv method = new MethodApiv(methodSymbol);

            Assert.Single(method.TypeParameters);
            Assert.Equal("T", method.TypeParameters[0].Name);
        }
    }
}
