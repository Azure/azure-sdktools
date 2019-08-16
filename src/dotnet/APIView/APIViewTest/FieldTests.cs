﻿using Microsoft.CodeAnalysis;
using ApiView;
using Xunit;
using System.Text;
using System.Collections.Generic;
using System.Linq;

namespace APIViewTest
{
    public class FieldTests
    {
        [Fact]
        public void FieldTestReadOnly()
        {
            var fieldSymbol = (IFieldSymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "publicField");
            FieldApiView field = new FieldApiView(fieldSymbol);
            
            Assert.Equal("publicField", field.Name);
            Assert.Equal("int", field.Type.Tokens[0].DisplayString);
            Assert.Equal("public", field.Accessibility);
            Assert.False(field.IsConstant);
            Assert.True(field.IsReadOnly);
            Assert.False(field.IsStatic);
            Assert.False(field.IsVolatile);
            Assert.Null(field.Value);
        }

        [Fact]
        public void FieldTestReadOnlyStringRep()
        {
            var fieldSymbol = (IFieldSymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "publicField");
            FieldApiView field = new FieldApiView(fieldSymbol);

            Assert.Equal("public readonly int publicField;", field.ToString());
        }

        [Fact]
        public void FieldTestConstant()
        {
            var fieldSymbol = (IFieldSymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "publicString");
            FieldApiView field = new FieldApiView(fieldSymbol);

            Assert.Equal("publicString", field.Name);
            Assert.Equal("string", field.Type.Tokens[0].DisplayString);
            Assert.Equal("public", field.Accessibility);
            Assert.True(field.IsConstant);
            Assert.False(field.IsReadOnly);
            Assert.True(field.IsStatic);
            Assert.False(field.IsVolatile);
            Assert.Equal("constant string", field.Value);
        }

        [Fact]
        public void FieldTestConstantStringRep()
        {
            var fieldSymbol = (IFieldSymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "publicString");
            FieldApiView field = new FieldApiView(fieldSymbol);

            Assert.Equal("public static const string publicString = \"constant string\";", field.ToString());
        }

        [Fact]
        public void FieldTestProtected()
        {
            var fieldSymbol = (IFieldSymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "protectedField");
            FieldApiView field = new FieldApiView(fieldSymbol);

            Assert.Equal("protectedField", field.Name);
            Assert.Equal("int", field.Type.Tokens[0].DisplayString);
            Assert.Equal("protected", field.Accessibility);
            Assert.False(field.IsConstant);
            Assert.False(field.IsReadOnly);
            Assert.False(field.IsStatic);
            Assert.False(field.IsVolatile);
            Assert.Null(field.Value);
        }

        [Fact]
        public void FieldTestProtectedStringRep()
        {
            var fieldSymbol = (IFieldSymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "protectedField");
            FieldApiView field = new FieldApiView(fieldSymbol);

            Assert.Equal("protected int protectedField;", field.ToString());
        }

        [Fact]
        public void FieldTestHTMLRender()
        {
            var f = new FieldApiView
            {
                Accessibility = "public",
                Type = new TypeReferenceApiView(new TokenApiView[] { new TokenApiView("string", TypeReferenceApiView.TokenType.BuiltInType) }),
                IsConstant = true,
                IsReadOnly = false,
                IsStatic = true,
                IsVolatile = false,
                Value = "constant string",
                Name = "publicString"
            };
            f.Type.IsString = true;
            var renderer = new HtmlRendererApiView();
            var list = new StringListApiView();
            renderer.Render(f, list);
            Assert.Equal("<span class=\"keyword\">public</span> <span class=\"keyword\">static</span> <span class=\"keyword\">const</span> <span class=\"keyword\">string</span>" +
                " <a id=\"\" class=\"name commentable\">publicString</a> = <span class=\"value\">\"constant string\"</span>;", list.ToString());
        }
    }
}
