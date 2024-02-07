using System.CommandLine;
using YamlDotNet.Serialization;
using System.Text.RegularExpressions;
using System.ComponentModel.DataAnnotations;
using YamlDotNet.Serialization.NamingConventions;

namespace Azure.Sdk.PipelineTemplateConverter;

public enum TemplateType
{
    Stage,
    ArtifactTask,
    Converted,
    Ignore
}

public class BaseTemplate
{
    [YamlMember(Alias = "resources", Order = 0)]
    public Dictionary<string, object>? Resources { get; set; }

    [YamlMember(Alias = "parameters", Order = 1)]
    public object? Parameters { get; set; }

    [YamlMember(Alias = "trigger", Order = 2)]
    public object? Trigger { get; set; }

    [YamlMember(Alias = "pr", Order = 3)]
    public object? PullRequest { get; set; }

    [YamlMember(Alias = "variables", Order = 4)]
    public object? Variables { get; set; }

    private ISerializer Serializer { get; } = new SerializerBuilder()
        .ConfigureDefaultValuesHandling(DefaultValuesHandling.OmitNull)
        .DisableAliases()
        .WithIndentedSequences()
        .Build();

    public override string ToString()
    {
        return Serializer.Serialize(this) + Environment.NewLine;
    }
}

public class StageTemplate : BaseTemplate
{
    [YamlMember(Alias = "stages")]
    public List<Dictionary<string, object>>? Stages { get; set; }

    [YamlMember(Alias = "extends", Order = 11)]
    public Dictionary<string, object>? Extends { get; set; }

    [YamlMember(Alias = "pool", Order = 10)]
    public Dictionary<string, object>? Pool { get; set; }
}

public class Comment
{
    public List<string> Value { get; set; } = new List<string>();
    // NOTE: this won't handle duplicate lines, but probably not a case that will be hit
    public string AppearsBeforeLine { get; set; } = string.Empty;
    public string AppearsOnLine { get; set; } = string.Empty;
    public int LineInstance { get; set; } = 0;
    public bool NewLineBefore { get; set; } = false;

    public Comment(List<string> value)
    {
        Value = value;
    }

    public Comment(string value)
    {
        Value = new List<string> { value };
    }
}

public class Line
{
    public string Value { get; set; } = "";
    public int Instance { get; set; } = 0;
    public Comment? Comment { get; set; }
    public Comment? InlineComment { get; set; }
    public bool NewLineBefore { get; set; } = false;
    // YamlDotNet serialization removes quotes, but we want to preserve them
    // for line/comment lookup and reducing diff sizes
    public char? Quote { get; set; }
    public string LookupKey { get; set; }

    public Line(string line)
    {
        if (line.Contains('#'))
        {
            line = line[..line.IndexOf("#")];
        }

        var singleQuoted = new Regex(@"(^[ \t]*-?[ ]*\w*:[ ]*)'(.*)'[ ]*");
        var doubleQuoted = new Regex(@"(^[ \t]*-?[ ]*\w*:[ ]*)""(.*)""[ ]*");
        var singleQuotedMatch = singleQuoted.Match(line);
        var doubleQuotedMatch = doubleQuoted.Match(line);

        Value = line.Trim();

        if (singleQuotedMatch.Success)
        {
            Quote = '\'';
            var head = singleQuotedMatch.Groups[1].Value;
            var tail = singleQuotedMatch.Groups[2].Value;
            LookupKey = (head + tail).Trim();
        }
        else if (doubleQuotedMatch.Success)
        {
            Quote = '"';
            var head = doubleQuotedMatch.Groups[1].Value;
            var tail = doubleQuotedMatch.Groups[2].Value;
            LookupKey = (head + tail).Trim();
        }
        else
        {
            LookupKey = Value;
        }
    }
}

public class PublishArtifactTask
{
    public string PublishType
    {
        get
        {
            if (Task == "PublishPipelineArtifact@1")
            {
                return "pipeline";
            }
            if (Task == "PublishBuildArtifact@1")
            {
                return "build";
            }
            if (Task == "NugetCommand@2")
            {
                return "nuget";
            }
            return "";
        }
    }

    [YamlMember()]
    public string? Task { get; set; }

    [YamlMember()]
    public string? DisplayName { get; set; }

    [YamlMember()]
    public string? Condition { get; set; }

    [YamlMember()]
    public TaskInputs Inputs { get; set; } = new TaskInputs();

    public string ArtifactName
    {
        get
        {
            return Inputs.PackagesToPush ?? Inputs.Artifact ?? Inputs.ArtifactName ?? "";
        }
    }

    public string ArtifactPath
    {
        get
        {
            if (Inputs.PackageParentPath != null)
            {
                return Inputs.PackageParentPath;
            }
            if (Inputs.PackagesToPush != null)
            {
                // Hack since packagesToPush is required by the 1es nuget task
                // This assumes ALL our nuget paths use globs
                return Inputs.PackagesToPush.Split("/*")[0];
            }
            return Inputs.Path ?? Inputs.TargetPath ?? Inputs.PathToPublish ?? "";
        }
    }

    public class TaskInputs
    {

        [YamlMember()]
        public string? Artifact { get; set; }
        [YamlMember()]
        public string? ArtifactName { get; set; }

        [YamlMember()]
        public string? Path { get; set; }
        [YamlMember()]
        public string? TargetPath { get; set; }
        [YamlMember()]
        public string? PathToPublish { get; set; }

        // Nuget publish task options
        [YamlMember()]
        public string? PackagesToPush { get; set; }
        [YamlMember()]
        public string? PackageParentPath { get; set; }
        [YamlMember()]
        public string? NugetFeedType { get; set; }
        [YamlMember()]
        public string? PublishVstsFeed { get; set; }
        // Throwaway properties
        [YamlMember()]
        public string? Command { get; set; }
        [YamlMember()]
        public string? PublishFeedCredentials { get; set; }
    }

    public List<string> Convert()
    {
        var lines = new List<string>
        {
            $"- template: /eng/common/pipelines/templates/steps/publish-artifact.yml",
            $"  parameters:",
            $"    PublishType: {PublishType}",
            $"    ArtifactName: {ArtifactName}",
            $"    ArtifactPath: {ArtifactPath}",
        };

        if (Inputs.NugetFeedType != null)
        {
            lines.Add($"    NugetFeedType: {Inputs.NugetFeedType}");
        }
        if (Inputs.PublishVstsFeed != null)
        {
            lines.Add($"    PublishVstsFeed: {Inputs.PublishVstsFeed}");
        }
        if (DisplayName != null)
        {
            lines.Add($"    DisplayName: {DisplayName}");
        }
        if (Condition != null)
        {
            lines.Add($"    Condition: {Condition}");
        }

        return lines;
    }
}

public class PipelineTemplateConverter
{
    public static async Task<int> Main(string[] args)
    {
        var pipelineTemplate = new Option<FileInfo>(
            new[] { "-p", "--pipeline" },
            description: "The pipeline yaml template to convert");
        var pipelineTemplateDirectory = new Option<DirectoryInfo>(
            new[] { "-d", "--directory" },
            description: "The pipeline yaml directory to convert");
        var overwrite = new Option<Boolean>(
            new[] { "--overwrite" },
            description: "Write changes back to pipeline file");

        var rootCommand = new RootCommand("Pipeline template converter");
        rootCommand.AddOption(pipelineTemplate);
        rootCommand.AddOption(pipelineTemplateDirectory);
        rootCommand.AddOption(overwrite);
        rootCommand.AddValidator(result =>
        {
            var args = result.Children.Select(c => c.Symbol.Name).ToList();
            if (args.Contains("pipeline") && args.Contains("directory"))
            {
                result.ErrorMessage = "Cannot specify both --pipeline and --directory";
            }
            if (!args.Contains("pipeline") && !args.Contains("directory"))
            {
                result.ErrorMessage = "Must specify either --pipeline or --directory";
            }
        });

        rootCommand.SetHandler((file, directory, overwrite) =>
            {
                Run(file, directory, overwrite);
            },
            pipelineTemplate, pipelineTemplateDirectory, overwrite);

        return await rootCommand.InvokeAsync(args);
    }

    public static void Run(FileInfo pipelineTemplate, DirectoryInfo directory, bool overwrite)
    {
        var files = new List<FileInfo>();
        if (pipelineTemplate != null)
        {
            files.Add(pipelineTemplate);
        }
        else
        {
            foreach (var file in directory.GetFiles("*.yml", SearchOption.AllDirectories))
            {
                files.Add(file);
            }
        }
        foreach (var file in files)
        {
            Convert(file, overwrite);
        }
    }

    public static void Convert(FileInfo file, bool overwrite)
    {
        var deserializer = new DeserializerBuilder().Build();
        var contents = File.ReadAllText(file.FullName);

        var templateTypes = GetTemplateType(contents);
        if (templateTypes.Contains(TemplateType.Ignore))
        {
            return;
        }

        var processedLines = BackupCommentsAndFormatting(contents, templateTypes);
        var output = "";

        if (templateTypes.Contains(TemplateType.Converted))
        {
            Console.WriteLine($"Skipping {file.FullName} already converted");
            return;
        }

        if (templateTypes.Contains(TemplateType.Stage))
        {
            Console.WriteLine($"Converting {file.FullName} stage template");
            var template = deserializer.Deserialize<StageTemplate>(contents);
            ConvertStageTemplate(template);
            output = template.ToString();
            output = RestoreCommentsAndFormatting(output, processedLines);
        }

        if (templateTypes.Contains(TemplateType.ArtifactTask))
        {
            Console.WriteLine($"Converting {file.FullName} publish tasks");
            output = ConvertPublishTasks(output);
        }

        if (overwrite)
        {
            File.WriteAllText(file.FullName, output);
            return;
        }
        Console.WriteLine(output);
    }

    public static List<TemplateType> GetTemplateType(string template)
    {
        var convertedRegex = new Regex(@".*1ESPipelineTemplates.*");
        var stageRegex = new Regex(@".*stages:.*$", RegexOptions.Multiline);
        var publishRegex = new Regex(@"PublishPipelineArtifact@1.*$", RegexOptions.Multiline);
        var publishBuildRegex = new Regex(@"PublishBuildArtifact@1.*$", RegexOptions.Multiline);
        var nugetRegex = new Regex(@"^NugetCommand@2:.*$", RegexOptions.Multiline);

        var types = new List<TemplateType>();

        if (convertedRegex.IsMatch(template))
        {
            types.Add(TemplateType.Converted);
        }
        if (stageRegex.IsMatch(template))
        {
            types.Add(TemplateType.Stage);
        }
        if (publishRegex.IsMatch(template) || publishBuildRegex.IsMatch(template) || nugetRegex.IsMatch(template))
        {
            types.Add(TemplateType.ArtifactTask);
        }

        if (types.Count == 0)
        {
            types.Add(TemplateType.Ignore);
        }

        return types;
    }

    public static List<Line> BackupCommentsAndFormatting(string template, List<TemplateType> templateTypes)
    {
        var lineInstances = new Dictionary<string, int>();
        var lines = template.Split(Environment.NewLine);
        var processedLines = new List<Line>();

        for (var i = 0; i < lines.Length; i++)
        {
            var comment = new List<string>();
            var commentHasNewLineBefore = false;
            if (i > 0 && lines[i - 1].Trim().Length == 0)
            {
                commentHasNewLineBefore = true;
            }

            while (i < lines.Length && lines[i].TrimStart(' ').StartsWith("#"))
            {
                comment.Add(lines[i].Trim(' '));
                i++;
            }

            Line line;
            /*
            * What happens when a file simply ends on a comment? there's nowhere to associate the line
            * With. When that occurs, simply insert a new empty string. Files shouldn't end without
            * trailing whitespace anyway, so this is not a destructive update.
            */
            if (i < lines.Length)
            {
                line = new Line(lines[i]);
            }
            else
            {
                line = new Line(String.Empty);
            }

            lineInstances[line.LookupKey] = lineInstances.ContainsKey(line.LookupKey) ? lineInstances[line.LookupKey] + 1 : 1;
            line.Instance = lineInstances[line.LookupKey];

            if (comment.Count > 0)
            {
                line.Comment = new Comment(comment);
                line.Comment.NewLineBefore = commentHasNewLineBefore;
            }

            if (lines[i].Contains('#'))
            {
                var inlineComment = lines[i][lines[i].IndexOf("#")..];
                line.InlineComment = new Comment(inlineComment);
            }

            if (i > 0 && lines[i - 1].Trim().Length == 0)
            {
                line.NewLineBefore = true;
            }
            // Handle various special cases where we know whether we want a newline or not
            if (lines[i].StartsWith("parameters:") && templateTypes.Contains(TemplateType.Stage))
            {
                line.NewLineBefore = true;
            }
            if (lines[i].StartsWith("variables:") && templateTypes.Contains(TemplateType.Stage))
            {
                line.NewLineBefore = false;
            }

            processedLines.Add(line);
        }

        return processedLines;
    }

    public static string RestoreCommentsAndFormatting(string template, List<Line> processedLines)
    {
        var lines = new List<string>();
        var lineInstances = new Dictionary<string, int>();

        var lookup = new Dictionary<(string, int), Line>();
        foreach (var line in processedLines)
        {
            lookup.Add((line.LookupKey, line.Instance), line);
        }

        foreach (var _line in template.Split(Environment.NewLine))
        {
            var line = FixTemplateSpecialCharacters(_line);
            var parsed = new Line(line);
            lineInstances[parsed.LookupKey] = lineInstances.ContainsKey(parsed.LookupKey) ? lineInstances[parsed.LookupKey] + 1 : 1;
            if (!lookup.ContainsKey((parsed.LookupKey, lineInstances[parsed.LookupKey])))
            {
                // Fix preceding newline with newly added extends directive
                if (line.StartsWith("extends:"))
                {
                    lines.Add("");
                }
                lines.Add(line);
                continue;
            }

            var indentation = line[..^line.TrimStart(' ').Length];
            var original = lookup[(parsed.LookupKey, lineInstances[parsed.LookupKey])];
            if (original.NewLineBefore || original.Comment?.NewLineBefore == true)
            {
                lines.Add("");
            }

            // Comments in embedded strings get preserved during serialization so don't restore those
            var lineIsComment = original.Comment?.Value.Any(c => line.Contains(c)) ?? false;
            var lineHasInlineComment = original.InlineComment?.Value.Any(c => line.Contains(c)) ?? false;
            if (lineIsComment || lineHasInlineComment)
            {
                lines.Add(line);
                continue;
            }

            foreach (var commentLine in original.Comment?.Value ?? new List<string>())
            {
                lines.Add(indentation + commentLine);
            }

            var inlineComment = original.InlineComment?.Value.FirstOrDefault();
            if (inlineComment != null)
            {
                lines.Add(indentation + original.Value + "  " + inlineComment);
            }
            else
            {
                lines.Add(indentation + original.Value);
            }
        }

        return string.Join(Environment.NewLine, lines);
    }

    // Yaml serialization adds quotes when special characters are present,
    // such as ones used for azure pipelines templating logic.
    public static string FixTemplateSpecialCharacters(string line)
    {
        line = line.Replace("'${{", "${{");
        line = line.Replace("}}:':", "}}:");
        line = line.Replace("}}:'", "}}:");
        line = line.Replace("\"${{", "${{");
        line = line.Replace("}}:\":", "}}:");
        line = line.Replace("}}:\"", "}}:");
        return line;
    }

    public static string ConvertPublishTasks(string template)
    {
        var lines = template.Split(Environment.NewLine);
        var linesOut = new List<string>();
        for (var i = 0; i < lines.Length; i++)
        {
            if (!lines[i].Contains("task: PublishPipelineArtifact@1") &&
                !lines[i].Contains("task: PublishBuildArtifact@1") &&
                !lines[i].Contains("task: NugetCommand@2"))
            {
                linesOut.Add(lines[i]);
                continue;
            }

            var yaml = "";
            var indent = lines[i][..^lines[i].TrimStart(' ').Length].Length;
            var currIndent = indent;

            do {
                // The publish tasks have way to much casing variation across our yaml files
                // (e.g. PathToPublish, pathtoPublish)
                // so force lowercase the key here. YamlDotNet only supports lowercasing
                // class properties and not yaml keys.
                var lowercaseKey = lines[i].TrimStart(' ').Split(":")[0].ToLower();
                var line = new string(' ', currIndent) + lowercaseKey + ": " + string.Join("", lines[i].TrimStart(' ').Split(":")[1..]);
                yaml += line + Environment.NewLine;
                i++;
                if (i < lines.Length)
                {
                    currIndent = lines[i][..^lines[i].TrimStart(' ').Length].Length;
                }
            } while (i < lines.Length && currIndent > indent);

            var task = new DeserializerBuilder()
                            .WithNamingConvention(LowerCaseNamingConvention.Instance)
                            .Build()
                            .Deserialize<PublishArtifactTask[]>(yaml);

            foreach (var line in task[0].Convert())
            {
                linesOut.Add(new string(' ', indent) + line);
            }
        }

        return string.Join(Environment.NewLine, linesOut);
    }

    public static void ConvertStageTemplate(StageTemplate template)
    {
        var extends = new Dictionary<string, object>();
        var parameters = new Dictionary<string, object>();
        var repositories = template.Resources?["repositories"] as List<object> ?? new List<object>();

        var sdl = new Dictionary<string, object>
        {
            ["sourceAnalysisPool"] = new Dictionary<string, object>
            {
                ["name"] = "azsdk-pool-mms-win-2022-1es-pt",
                ["image"] = "azsdk-pool-mms-win-2022-1espt",
                ["os"] = "windows",
            }
        };

        var repository = new Dictionary<string, object>
        {
            ["repository"] = "1ESPipelineTemplates",
            ["type"] = "git",
            ["name"] = "1ESPipelineTemplates/1ESPipelineTemplates",
            ["ref"] = "refs/tags/release",
        };

        template.Resources ??= new Dictionary<string, object>();
        template.Resources["repositories"] = repositories.Prepend(repository);

        template.Extends = extends;
        template.Extends.Add("${{ if eq(variables['System.TeamProject'], 'internal') }}:", new Dictionary<string, object>
        {
            ["template"] = "v1/1ES.Official.PipelineTemplate.yml@1ESPipelineTemplates",
        });
        template.Extends.Add("${{ else }}:", new Dictionary<string, object>
        {
            ["template"] = "v1/1ES.Unofficial.PipelineTemplate.yml@1ESPipelineTemplates",
        });
        template.Extends.Add("parameters", parameters);

        parameters.Add("${{ if eq(variables['System.TeamProject'], 'internal') }}:", new Dictionary<string, object>
        {
            ["sdl"] = sdl
        });

        if (template.Stages != null && template.Stages.Count > 0)
        {
            if (template.Variables != null)
            {
                foreach (var stage in template.Stages)
                {
                    if (stage.ContainsKey("stage"))
                    {
                        stage["variables"] = template.Variables;
                    }
                }
            }
            parameters.Add("stages", template.Stages);
        }
        template.Stages = null;
        template.Variables = null;
    }
}
