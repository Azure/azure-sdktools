﻿using System.Text;

namespace APIView
{
    public class HTMLRendererAPIV : TreeRendererAPIV
    {
        protected override void RenderClass(StringBuilder builder, string word)
        {
            builder.Append("<font class=\"class\">").Append(word).Append("</font>");
        }

        protected override void RenderKeyword(StringBuilder builder, string word)
        {
            builder.Append("<font class=\"keyword\">").Append(word).Append("</font>");
        }

        protected override void RenderName(StringBuilder builder, string word)
        {
            builder.Append("<font class=\"name\">").Append(word).Append("</font>");
        }

        protected override void RenderNewline(StringBuilder builder)
        {
            builder.Append("<br />");
        }

        protected override void RenderSpecialName(StringBuilder builder, string word)
        {
            builder.Append("<font class=\"specialName\">").Append(word).Append("</font>");
        }

        protected override void RenderType(StringBuilder builder, string word)
        {
            builder.Append("<font class=\"type\">").Append(word).Append("</font>");
        }

        protected override void RenderValue(StringBuilder builder, string word)
        {
            builder.Append("<font class=\"value\">").Append(word).Append("</font>");
        }
    }
}
