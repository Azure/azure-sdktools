using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Azure.Sdk.Tools.CodeOwnersParser.Constants;

namespace Azure.Sdk.Tools.CodeownersLinter.Utils
{
    public static class MonikerUtils
    {
        /// <summary>
        /// Given a CODEOWNERS line, parse the moniker from the line if one exists.
        /// </summary>
        /// <param name="line">The CODEOWNERS line to parse.</param>
        /// <returns>String, the moniker if there was one on the line, null otherwise.</returns>
        public static string ParseMonikerFromLine(string line)
        {
            if (line.StartsWith(SeparatorConstants.Comment))
            {
                // Strip off the starting # and trim the result. Note, replacing tabs with
                // spaces isn't necessary as Trim would trim off any leading or trailing tabs.
                string strippedLine = line.Substring(1).Trim();
                var monikers = typeof(MonikerConstants)
                              .GetFields(BindingFlags.Public | BindingFlags.Static)
                              .Where(field => field.IsLiteral)
                              .Where(field => field.FieldType == typeof(string))
                              .Select(field => field.GetValue(null) as string);
                foreach (string tempMoniker in monikers)
                {
                    // In theory, the line start with "<Moniker>:" but /<NotInRepo>/ has no colon
                    if (strippedLine.StartsWith($"{tempMoniker}"))
                    {
                        return tempMoniker;
                    }
                }
            }
            // Anything that doesn't match an existing moniker is treated as a comment
            return null;
        }

        /// <summary>
        /// Check whether a line is one of our Monikers.
        /// </summary>
        /// <param name="line">string, the line to check</param>
        /// <returns>true if the line contains a moniker, false otherwise</returns>
        public static bool IsMonikerLine(string line)
        {
            if (line.StartsWith(SeparatorConstants.Comment))
            {
                // Strip off the #
                string strippedLine = line.Substring(1).Replace('\t', ' ').Trim();
                var monikers = typeof(MonikerConstants)
                              .GetFields(BindingFlags.Public | BindingFlags.Static)
                              .Where(field => field.IsLiteral)
                              .Where(field => field.FieldType == typeof(string))
                              .Select(field => field.GetValue(null) as string);
                foreach (string tempMoniker in monikers)
                {
                    // In theory, the line start with "<Moniker>:" but /<NotInRepo>/ has no colon
                    if (strippedLine.StartsWith($"{tempMoniker}"))
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        /// <summary>
        /// Check whether or not a given CODEOWNERS line is a moniker or source line.
        /// </summary>
        /// <param name="line">string, the line to check</param>
        /// <returns>true if the line is a moniker or source line, false otherwise</returns>
        public static bool IsMonikerOrSourceLine(string line)
        {
            // If the line is blank or whitespace. Note, 
            if (string.IsNullOrWhiteSpace(line))
            {
                return false;
            }
            // if the line isn't blank or whitespace and isn't a comment then
            // it's a source path line
            else if (!line.StartsWith(SeparatorConstants.Comment)) 
            {
                return true;
            }
            // At this point it's either a moniker or a comment
            else
            {
                return IsMonikerLine(line);
            }
        }
    }
}
