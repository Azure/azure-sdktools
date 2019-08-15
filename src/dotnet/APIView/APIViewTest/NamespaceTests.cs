﻿using ApiView;
using System;
using Xunit;

namespace APIViewTest
{
    public class NamespaceTests
    {
        [Fact]
        public void NamespaceTestGlobalNoNamedTypesSomenamespaces()
        {
            AssemblyApiv assembly = new AssemblyApiv(TestResource.GetAssemblySymbol());
            Assert.Equal("TestLibrary", assembly.Name);

            NamespaceApiv globalNamespace = assembly.GlobalNamespace;
            Assert.Empty(globalNamespace.NamedTypes);
            Assert.Single(globalNamespace.Namespaces);
        }

        [Fact]
        public void NamespaceTestNonGlobalSomeNamedTypesNonamespaces()
        {
            AssemblyApiv assembly = new AssemblyApiv(TestResource.GetAssemblySymbol());
            Assert.Equal("TestLibrary", assembly.Name);

            NamespaceApiv globalNamespace = assembly.GlobalNamespace;
            NamespaceApiv nestedNamespace = globalNamespace.Namespaces[0];

            Assert.Equal("TestLibrary", nestedNamespace.Name);

            Assert.NotEmpty(nestedNamespace.NamedTypes);
            Assert.Empty(nestedNamespace.Namespaces);
        }

        [Fact]
        public void NamespaceTestNonGlobalSomeNamedTypesNonamespacesStringRep()
        {
            AssemblyApiv assembly = new AssemblyApiv(TestResource.GetAssemblySymbol());
            Assert.Equal("TestLibrary", assembly.Name);

            NamespaceApiv globalNamespace = assembly.GlobalNamespace;
            NamespaceApiv nestedNamespace = globalNamespace.Namespaces[0];

            Assert.Contains("namespace TestLibrary {", nestedNamespace.ToString());
        }

        [Fact]
        public void NamespaceTestEmptyImplementingHTMLRender()
        {
            var ns = new NamespaceApiv
            {
                Name = "TestNamespace",
                NamedTypes = new NamedTypeApiv[] { },
                Namespaces = new NamespaceApiv[] { }
            };
            var renderer = new HTMLRendererApiv();
            var list = new StringListApiv();
            renderer.Render(ns, list);
            Assert.Equal("", list.ToString());
        }

        [Fact]
        public void NamespaceTestImplementingHTMLRender()
        {
            var ns = new NamespaceApiv
            {
                Name = "TestNamespace",
                NamedTypes = new NamedTypeApiv[] {
                    new NamedTypeApiv() {
                        Accessibility = "public",
                        Events = new EventApiv[] { },
                        Fields = new FieldApiv[] { },
                        Id = "",
                        Implementations = new TypeReferenceApiv[] { },
                        IsSealed = false,
                        IsStatic = false,
                        Methods = new MethodApiv[] { },
                        Name = "TestNamedType",
                        NamedTypes = new NamedTypeApiv[] { },
                        Properties = new PropertyApiv[] { },
                        TypeKind = "class",
                        TypeParameters = new TypeParameterApiv[] { }
                    } 
                },
                Namespaces = new NamespaceApiv[] { }
            };
            var renderer = new HTMLRendererApiv();
            var list = new StringListApiv();
            renderer.Render(ns, list);
            Assert.Equal("<span class=\"keyword\">namespace</span> <a id=\"\" class=\"name commentable\">TestNamespace</a> {" 
                + Environment.NewLine + "    <span class=\"keyword\">public</span> <span class=\"keyword\">class</span> <a h"
                + "ref=\"#\" id=\"\" class=\"class commentable\">TestNamedType</a> {" + Environment.NewLine + "    }" 
                + Environment.NewLine + "}", list.ToString());
        }
    }
}
