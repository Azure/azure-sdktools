using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Azure.Sdk.Tools.CodeOwnersParser
{
    /// <summary>
    /// Represents a CODEOWNERS file entry that matched to targetPath from
    /// the list of entries, assumed to have been parsed from CODEOWNERS file.
    ///
    /// This is a new matcher, compared to the old one, located in:
    /// CodeOwnersFile.FindOwnersForClosestMatchLegacyImpl()
    /// This new matcher supports matching against wildcards, while the old one doesn't.
    /// This new matcher is designed to work with CODEOWNERS file validation:
    /// https://github.com/Azure/azure-sdk-tools/issues/4859
    ///
    /// To use this class, construct it.
    /// 
    /// To obtain the value of the matched entry, reference "Value" member.
    ///
    /// Reference:
    /// https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-syntax
    /// https://git-scm.com/docs/gitignore#_pattern_format
    /// </summary>
    internal class MatchedCodeOwnerEntry
    {
        public readonly CodeOwnerEntry Value;

        /// <summary>
        /// The entry is valid if it obeys following conditions:
        /// - The Value was obtained with a call to Azure.Sdk.Tools.CodeOwnersParser.CodeOwnersFile.ParseContent().
        ///   - As a consequence, in the case of no match, the entry is not valid.
        /// - the Value.PathExpression starts with "/".
        ///
        /// Once the validation described in the following issue is implemented:
        /// https://github.com/Azure/azure-sdk-tools/issues/4859
        /// To be valid, the entry will also have to obey following conditions:
        /// - if the Value.PathExpression ends with "/", at least one corresponding
        /// directory exists in the repository
        /// - if the Value.PathExpression does not end with "/", at least one corresponding
        /// file exists in the repository.
        /// </summary>
        public bool IsValid => this.Value.PathExpression.StartsWith("/");

        /// <summary>
        /// Any CODEOWNERS path with these characters will be skipped.
        /// Note these are valid parts of file paths, but we are not supporting
        /// them to simplify the matcher logic.
        /// </summary>
        private static readonly char[] unsupportedChars = { '[', ']', '!', '?' };

        public MatchedCodeOwnerEntry(List<CodeOwnerEntry> entries, string targetPath)
        {
            this.Value = FindOwnersForClosestMatch(entries, targetPath);
        }

        /// <summary>
        /// Returns a CodeOwnerEntry from codeOwnerEntries that matches targetPath
        /// per algorithm described in the GitHub CODEOWNERS reference,
        /// as linked to in this class comment.
        ///
        /// If there is no match, returns "new CodeOwnerEntry()".
        /// </summary>
        private static CodeOwnerEntry FindOwnersForClosestMatch(
            List<CodeOwnerEntry> codeownersEntries,
            string targetPath)
        {
            // targetPath is assumed to be absolute w.r.t. repository root, hence we ensure
            // it starts with "/" to denote that.
            if (!targetPath.StartsWith("/"))
                targetPath = "/" + targetPath;

            // Note we cannot add or trim the slash at the end of targetPath.
            // Slash at the end of target path denotes it is a directory, not a file,
            // so it can not match against a CODEOWNERS entry that is guaranteed to be a file,
            // by the virtue of not ending with "/".

            
            CodeOwnerEntry matchedEntry = codeownersEntries
                .Where(entry => !ContainsUnsupportedCharacters(entry.PathExpression))
                // Entries listed in CODEOWNERS file below take precedence, hence we read the file from the bottom up.
                // By convention, entries in CODEOWNERS should be sorted top-down in the order of:
                // - 'RepoPath',
                // - 'ServicePath'
                // - and then 'PackagePath'.
                // However, due to lack of validation, as of 12/29/2022 this is not always the case.
                .Reverse()
                .FirstOrDefault(
                    entry => Matches(targetPath, entry), 
                    // assert: none of the codeownersEntries matched targetPath
                    new CodeOwnerEntry());

            return matchedEntry;
        }

        private static bool ContainsUnsupportedCharacters(string codeownersPath)
            => unsupportedChars.Any(codeownersPath.Contains);

        private static bool Matches(string targetPath, CodeOwnerEntry entry)
        {
            string codeownersPath = entry.PathExpression;

            targetPath = NormalizeTargetPath(targetPath, codeownersPath);

            Regex regex = ConvertToRegex(codeownersPath);
            return regex.IsMatch(targetPath);
        }

        private static string NormalizeTargetPath(string targetPath, string codeownersPath)
        {
            // If the considered CODEOWNERS path ends with "/", it means we can
            // assume targetPath also is a path to directory.
            //
            // This works in all 3 cases, which are:
            //
            // 1. The targetPath is the same as the CODEOWNERS path, except
            // the targetPath doesn't have "/" at the end. If so,
            // it might be a path to a file or directory,
            // but the exact path match with CODEOWNERS path and our validation
            // guarantees it is an existing directory, hence we can append "/".
            //
            // 2. The targetPath is a prefix path of CODEOWNERS path. In such case
            // there won't be a match, and appending "/" won't change that.
            //
            // 3. The CODEOWNERS path is a prefix path of targetPath. In such case
            // there will be a match, and appending "/" won't change that.
            if (codeownersPath.EndsWith("/") && !targetPath.EndsWith("/"))
                targetPath += "/";

            return targetPath;
        }

        private static Regex ConvertToRegex(string codeownersPath)
        {
            // CODEOWNERS paths that do not start with "/" are relative and considered invalid.
            // However, here we handle such cases to accomodate for parsing CODEOWNERS file
            // paths that somehow slipped through validation. We do so by instead treating
            // such paths as if they were absolute to repository root, i.e. starting with "/".
            if (!codeownersPath.StartsWith("/"))
                codeownersPath = "/" + codeownersPath;

            string pattern = codeownersPath;

            // Kind of hoping here that the CODEOWNERS path will never have
            // "_DOUBLE_STAR_" or "_SINGLE_STAR_" strings in it.
            pattern = pattern.Replace("**", "_DOUBLE_STAR_");
            pattern = pattern.Replace("*", "_SINGLE_STAR_");

            pattern = Regex.Escape(pattern);

            // Denote that all paths are absolute by prepending "beginning of string" symbol.
            pattern = "^" + pattern;

            // Lack of slash at the end denotes the path is a path to a file,
            // per our validation logic.
            // Note we assume this is the case even if the path is invalid,
            // even though in such case it might not necessarily be true.
            if (!(pattern.EndsWith("/") 
                  || pattern.EndsWith("_DOUBLE_STAR_")))
            {
                // Append "end of string", symbol, denoting the match has to be exact,
                // not a substring, as we are dealing with a file.
                pattern += "$";
            }

            // Note that the "/**/" case is implicitly covered by "**/".
            pattern = pattern.Replace("_DOUBLE_STAR_/", "(.*)");
            // This case is necessary to cover suffix case, e.g. "/foo/bar/**".
            pattern = pattern.Replace("/_DOUBLE_STAR_", "(.*)");
            // This case is necessary to cover inline **, e.g. "/a**b/".
            pattern = pattern.Replace("_DOUBLE_STAR_", "(.*)");
            pattern = pattern.Replace("_SINGLE_STAR_", "([^/]*)");
            return new Regex(pattern);
        }
    }
}
