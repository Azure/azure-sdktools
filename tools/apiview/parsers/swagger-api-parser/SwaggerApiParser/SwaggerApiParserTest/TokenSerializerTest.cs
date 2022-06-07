using System.Collections.Generic;
using System.Threading.Tasks;
using APIView;
using SwaggerApiParser;
using Xunit;
using Xunit.Abstractions;

namespace SwaggerApiParserTest;

public class TokenSerializerTest
{
    private readonly ITestOutputHelper output;

    public TokenSerializerTest(ITestOutputHelper output)
    {
        this.output = output;
    }

    [Fact]
    public Task TestTokenSerializerPrimitiveType()
    {
        const string text = "hello";
        var ret = TokenSerializer.TokenSerialize(text);
        
        Assert.Equal(CodeFileTokenKind.Whitespace, ret[0].Kind);
        Assert.Equal(CodeFileTokenKind.Literal, ret[1].Kind);
        Assert.Equal("hello", ret[1].Value);
        return Task.CompletedTask;
    } 

    [Fact]
    public Task TestTokenSerializerGeneral()
    {
        var general = new SwaggerApiViewGeneral {swagger = "2.0", info = {description = "sample", title = "sample swagger"}};

        var ret = TokenSerializer.TokenSerialize(general);

        // Assert first line format. 
        Assert.Equal(CodeFileTokenKind.Whitespace, ret[0].Kind);
        Assert.Equal(CodeFileTokenKind.Literal, ret[1].Kind);
        Assert.Equal("swagger", ret[1].Value);
        Assert.Equal(":", ret[2].Value);
        Assert.Equal("2.0", ret[3].Value);

        return Task.CompletedTask;
    }

    [Fact]
    public Task TestTokenSerializerListObject()
    {
        var general = new SwaggerApiViewGeneral {swagger = "2.0", info = {description = "sample", title = "sample swagger"}, consumes = new List<string>{"application/json", "text/json"}};
        this.output.WriteLine(general.ToString());

        var ret = TokenSerializer.TokenSerialize(general);
        
        return Task.CompletedTask;
    }
}
