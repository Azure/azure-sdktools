﻿using Microsoft.CodeAnalysis;
using System.Collections.Immutable;
using System.Collections.ObjectModel;
using System.Text;

namespace TypeList
{
    public class NamedType
    {
        private readonly string name;
        private readonly string type;

        private readonly ImmutableArray<Event> events;
        private readonly ImmutableArray<Field> fields;
        private readonly ImmutableArray<Method> methods;
        private readonly ImmutableArray<NamedType> namedTypes;

        /// <summary>
        /// Construct a new NamedType instance, represented by the provided symbol.
        /// </summary>
        /// <param name="symbol">The symbol representing the named type.</param>
        public NamedType(INamedTypeSymbol symbol)
        {
            this.name = symbol.Name;
            this.type = symbol.TypeKind.ToString().ToLower();

            Collection<Event> events = new Collection<Event>();
            Collection<Field> fields = new Collection<Field>();
            Collection<Method> methods = new Collection<Method>();
            Collection<NamedType> namedTypes = new Collection<NamedType>();

            foreach (var memberSymbol in symbol.GetMembers())
            {
                if (memberSymbol.DeclaredAccessibility != Accessibility.Public) continue;

                switch (memberSymbol)
                {
                    case IEventSymbol e:
                        events.Add(new Event(e));
                        break;

                    case IFieldSymbol f:
                        fields.Add(new Field(f));
                        break;

                    case IMethodSymbol m:
                        methods.Add(new Method(m));
                        break;

                    case INamedTypeSymbol n:
                        namedTypes.Add(new NamedType(n));
                        break;
                }
            }

            this.events = events.ToImmutableArray();
            this.fields = fields.ToImmutableArray();
            this.methods = methods.ToImmutableArray();
            this.namedTypes = namedTypes.ToImmutableArray();
        }

        public string GetName()
        {
            return name;
        }

        public string GetNamedType()
        {
            return type;
        }

        public ImmutableArray<Event> GetEvents()
        {
            return events;
        }

        public ImmutableArray<Field> GetFields()
        {
            return fields;
        }

        public ImmutableArray<Method> GetMethods()
        {
            return methods;
        }

        public ImmutableArray<NamedType> GetNamedTypes()
        {
            return namedTypes;
        }

        public override string ToString()
        {
            StringBuilder returnString = new StringBuilder("public " + type + " " + name + " {\n\n");

            foreach (Field f in fields)
            {
                returnString.Append("    " + f.ToString() + "\n");
            }
            foreach (Event e in events)
            {
                returnString.Append("    " + e.ToString() + "\n");
            }
            foreach (Method m in methods)
            {
                returnString.Append("    " + m.ToString() + "\n");
            }
            foreach (NamedType n in namedTypes)
            {
                returnString.Append("    " + n.ToString() + "\n");
            }

            returnString.Append("}\n");

            return returnString.ToString();
        }
    }
}