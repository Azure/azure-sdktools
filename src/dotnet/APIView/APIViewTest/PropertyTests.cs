﻿using Microsoft.CodeAnalysis;
using ApiView;
using Xunit;

namespace APIViewTest
{
    public class PropertyTests
    {
        [Fact]
        public void PropertyTestNoSetter()
        {
            var propertySymbol = (IPropertySymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "propertyGet");
            PropertyApiv property = new PropertyApiv(propertySymbol);
            
            Assert.Equal("propertyGet", property.Name);
            Assert.Equal("uint", property.Type.Tokens[0].DisplayString);
            Assert.False(property.HasSetMethod);
        }

        [Fact]
        public void PropertyTestNoSetterStringRep()
        {
            var propertySymbol = (IPropertySymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "propertyGet");
            PropertyApiv property = new PropertyApiv(propertySymbol);

            Assert.Equal("public uint propertyGet { get; }", property.ToString());
        }

        [Fact]
        public void PropertyTestHasSetter()
        {
            var propertySymbol = (IPropertySymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "propertyBoth");
            PropertyApiv property = new PropertyApiv(propertySymbol);
            
            Assert.Equal("propertyBoth", property.Name);
            Assert.Equal("int", property.Type.Tokens[0].DisplayString);
            Assert.True(property.HasSetMethod);
        }

        [Fact]
        public void PropertyTestHasSetterStringRep()
        {
            var propertySymbol = (IPropertySymbol)TestResource.GetTestMember("TestLibrary.PublicClass", "propertyBoth");
            PropertyApiv property = new PropertyApiv(propertySymbol);

            Assert.Equal("public int propertyBoth { get; set; }", property.ToString());
        }
    }
}
