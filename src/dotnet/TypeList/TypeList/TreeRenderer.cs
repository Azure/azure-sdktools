﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TypeList
{
    public class TreeRenderer
    {
        private const int IndentSize = 4;

        public string Render(Assembly assembly)
        {
            return Render(assembly.GlobalNamespace);
        }

        private string Render(Event e, int indents = 0)
        {
            string indent = new string(' ', indents * IndentSize);

            //TODO: determine whether event is EventHandler or other type - and if it has type parameter(s)
            return indent + "public event EventHandler " + e.Name + ";";
        }

        private string Render(Field f, int indents = 0)
        {
            string indent = new string(' ', indents * IndentSize);

            StringBuilder returnString = new StringBuilder(indent + "public");

            if (f.IsConstant)
                returnString.Append(" const");

            if (f.IsStatic)
                returnString.Append(" static");

            if (f.IsReadOnly)
                returnString.Append(" readonly");

            if (f.IsVolatile)
                returnString.Append(" volatile");

            returnString.Append(" " + f.Type + " " + f.Name);

            if (f.IsConstant)
            {
                if (f.Value.GetType().Name.Equals("String"))
                    returnString.Append(" = \"" + f.Value + "\"");
                else
                    returnString.Append(" = " + f.Value);
            }

            returnString.Append(";");
            return returnString.ToString();
        }

        private string Render(Method m, int indents = 0)
        {
            string indent = new string(' ', indents * IndentSize);

            bool interfaceMethod = m.Symbol.ContainingType.TypeKind.ToString().ToLower().Equals("interface");

            StringBuilder returnString = new StringBuilder(indent);
            if (!m.Attributes.IsEmpty)
                returnString.Append("[" + m.Attributes[0].AttributeClass.Name + "]\n" + indent);

            if (!interfaceMethod)
                returnString.Append("public");

            if (m.IsStatic)
                returnString.Append(" static");
            if (m.IsVirtual)
                returnString.Append(" virtual");
            if (m.IsSealed)
                returnString.Append(" sealed");
            if (m.IsOverride)
                returnString.Append(" override");
            if (m.IsAbstract && !interfaceMethod)
                returnString.Append(" abstract");
            if (m.IsExtern)
                returnString.Append(" extern");

            returnString.Append(" " + m.ReturnType + " " + m.Name);
            if (m.TypeParameters.Length != 0)
            {
                returnString.Append("<");
                foreach (TypeParameter tp in m.TypeParameters)
                {
                    returnString.Append(Render(tp) + ", ");
                }
                returnString.Length = returnString.Length - 2;
                returnString.Append(">");
            }

            returnString.Append("(");
            if (m.Parameters.Length != 0)
            {
                foreach (Parameter p in m.Parameters)
                {
                    returnString.Append(Render(p) + ", ");
                }
                returnString.Length = returnString.Length - 2;
            }

            if (interfaceMethod)
                returnString.Append(");");
            else
                returnString.Append(") { }");

            return returnString.ToString();
        }

        private string Render(NamedType nt, int indents = 0)
        {
            string indent = new string(' ', indents * IndentSize);

            StringBuilder returnString = new StringBuilder(indent + "public " + nt.Type + " " + nt.Name + " ");

            // add any implemented types to string
            if (nt.Implementations.Length > 0)
            {
                returnString.Append(": ");
                foreach (var i in nt.Implementations)
                {
                    returnString.Append(i + ", ");
                }
                returnString.Length = returnString.Length - 2;
                returnString.Append(" ");
            }
            returnString.Append("{\n");

            // add any types declared in this type's body
            foreach (Field f in nt.Fields)
            {
                returnString.Append(Render(f, indents + 1) + "\n");
            }
            foreach (Property p in nt.Properties)
            {
                returnString.Append(Render(p, indents + 1) + "\n");
            }
            foreach (Event e in nt.Events)
            {
                returnString.Append(Render(e, indents + 1) + "\n");
            }
            foreach (Method m in nt.Methods)
            {
                returnString.Append(Render(m, indents + 1) + "\n");
            }
            foreach (NamedType n in nt.NamedTypes)
            {
                returnString.Append(Render(n, indents + 1) + "\n");
            }

            returnString.Append(indent + "}");

            return returnString.ToString();
        }

        private string Render(Namespace ns, int indents = 0)
        {
            string indent = new string(' ', indents * IndentSize);

            StringBuilder returnString = new StringBuilder("");

            if (ns.Name.Length != 0)
                returnString = new StringBuilder(indent + "namespace " + ns.Name + " {\n");

            foreach (NamedType nt in ns.NamedTypes)
            {
                returnString.Append(indent + Render(nt, indents + 1) + "\n");
            }
            foreach (Namespace n in ns.Namespaces)
            {
                if (ns.Name.Length != 0)
                    returnString.Append(indent + Render(n, indents + 1) + "\n");
                else
                    returnString.Append(indent + Render(n, indents) + "\n");
            }

            if (ns.Name.Length != 0)
                returnString.Append(indent + "}");

            return returnString.ToString();
        }

        private string Render(Parameter p, int indents = 0)
        {
            StringBuilder returnString = new StringBuilder(p.Type + " " + p.Name);
            if (p.HasExplicitDefaultValue)
            {
                if (p.Type.Equals("string"))
                    returnString.Append(" = \"" + p.ExplicitDefaultValue + "\"");
                else
                    returnString.Append(" = " + p.ExplicitDefaultValue);
            }
            return returnString.ToString();
        }

        private string Render(Property p, int indents = 0)
        {
            string indent = new string(' ', indents * IndentSize);

            StringBuilder returnString = new StringBuilder(indent + "public " + p.Type + " " + p.Name + " { get; ");
            if (p.HasSetMethod)
                returnString.Append("set; ");

            returnString.Append("}");
            return returnString.ToString();
        }

        private string Render(TypeParameter tp, int indents = 0)
        {
            StringBuilder returnString = new StringBuilder("");
            if (tp.Attributes.Length != 0)
                returnString.Append(tp.Attributes + " ");

            returnString.Append(tp.Name);
            return returnString.ToString();
        }
    }
}
