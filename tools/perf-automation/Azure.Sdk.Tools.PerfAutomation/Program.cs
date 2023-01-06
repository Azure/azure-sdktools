using Azure.Sdk.Tools.PerfAutomation.Models;
using CommandLine;
using CommandLine.Text;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using YamlDotNet.Core;
using YamlDotNet.Serialization;

namespace Azure.Sdk.Tools.PerfAutomation
{
    public static class Program
    {
        public const string PackageVersionSource = "source";

        public static Config Config { get; set; }

        private static Dictionary<Language, ILanguage> _languages = new Dictionary<Language, ILanguage>
        {
            { Language.Java, new Java() },
            { Language.JS, new JavaScript() },
            { Language.Net, new Net() },
            { Language.Python, new Python() },
            { Language.Cpp, new Cpp() }
        };

        public static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            Converters =
            {
                new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
            },
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            WriteIndented = true,
        };

        public class Options
        {
            [Option('a', "arguments", HelpText = "Regex of arguments to run")]
            public string Arguments { get; set; }

            [Option('d', "debug")]
            public bool Debug { get; set; }

            [Option('n', "dry-run")]
            public bool DryRun { get; set; }

            [Option("insecure", HelpText = "Allow untrusted SSL certs")]
            public bool Insecure { get; set; }

            [Option('i', "iterations", Default = 1)]
            public int Iterations { get; set; }

            [Option('l', "language")]
            public Language Language { get; set; }

            [Option("no-async")]
            public bool NoAsync { get; set; }

            [Option("no-cleanup", HelpText = "Disables test cleanup")]
            public bool NoCleanup { get; set; }

            [Option("no-sync")]
            public bool NoSync { get; set; }

            [Option('o', "output-file-prefix", Default = "results/results")]
            public string OutputFilePrefix { get; set; }

            [Option('p', "package-versions", HelpText = "Regex of package versions to run")]
            public string PackageVersions { get; set; }

            [Option("profile", HelpText = "Enables capture of profiling data")]
            public bool Profile { get; set; }

            [Option("repo-root", HelpText = "Path to root of repository in which to run tests")]
            public string RepoRoot { get; set; }

            // TODO: Configure YAML serialization to print URI values
            [Option('x', "test-proxies", Separator = ';', HelpText = "URIs of TestProxy Servers")]
            [YamlMember(typeof(string))]
            public IEnumerable<Uri> TestProxies { get; set; }

            [Option("test-proxy", HelpText = "URI of TestProxy Server")]
            [YamlMember(typeof(string))]
            public Uri TestProxy { get; set; }

            [Option('t', "tests", HelpText = "Regex of tests to run")]
            public string Tests { get; set; }

            [Option("tests-file", Required = true)]
            public string TestsFile { get; set; }
        }

        public static async Task Main(string[] args)
        {
            var parser = new CommandLine.Parser(settings =>
            {
                settings.CaseSensitive = false;
                settings.CaseInsensitiveEnumValues = true;
                settings.HelpWriter = null;
            });

            var parserResult = parser.ParseArguments<Options>(args);

            await parserResult.MapResult(
                (Options options) => Run(options),
                errors => DisplayHelp(parserResult)
            );
        }

        static Task DisplayHelp<T>(ParserResult<T> result)
        {
            var helpText = HelpText.AutoBuild(result, settings =>
            {
                settings.AddEnumValuesToHelpText = true;
                return settings;
            });

            Console.Error.WriteLine(helpText);

            return Task.CompletedTask;
        }

        private static async Task Run(Options options)
        {
                //                PackageVersions = p.Value.PackageVersions.Where(d =>
                //                    String.IsNullOrEmpty(options.PackageVersions) || Regex.IsMatch(d[p.Value.PrimaryPackage], options.PackageVersions)),
                //                PrimaryPackage = p.Value.PrimaryPackage,
                //            }),
                //        Tests = s.Tests
                //            .Where(t => String.IsNullOrEmpty(options.Tests) || Regex.IsMatch(t.Test, options.Tests, RegexOptions.IgnoreCase))
                //            .Select(t => new TestInfo
                //            {
                //                Test = t.Test,
                //                Arguments = t.Arguments.Where(a =>
                //                    String.IsNullOrEmpty(options.Arguments) || Regex.IsMatch(a, options.Arguments, RegexOptions.IgnoreCase)),
                //                TestNames = t.TestNames.Where(n => !options.Languages.Any() || options.Languages.Contains(n.Key))
                //                            .ToDictionary(p => p.Key, p => p.Value)
                //            })
                //            .Where(t => t.TestNames.Any())
                //            .Where(t => t.Arguments.Any()),
                //    })
                //    .Where(s => s.Tests.Any());

            var input = DeserializeYaml<LanguageServiceInput>(options.TestsFile);

            // TODO: Filter package versions and tests based on options
            var selectedPackageVersions = input.PackageVersions;
            var selectedTests = input.Tests;

            var serializer = new Serializer();
            Console.WriteLine("=== Options ===");
            serializer.Serialize(Console.Out, options);

            Console.WriteLine();

            Console.WriteLine("=== Test Plan ===");
            serializer.Serialize(Console.Out, new LanguageServiceInput() {
                Service = input.Service,
                Project = input.Project,
                PackageVersions = selectedPackageVersions,
                Tests = selectedTests,
            });

            if (options.DryRun)
            {
                Console.WriteLine();
                Console.Write("Press 'y' to continue, or any other key to exit: ");
                var key = Console.ReadKey();
                Console.WriteLine();
                Console.WriteLine();
                if (char.ToLowerInvariant(key.KeyChar) != 'y')
                {
                    return;
                }
            }

            var outputFiles = Util.GetUniquePaths(options.OutputFilePrefix, ".json", ".csv", ".txt", ".md");

            // Create output file early so user sees it immediately
            foreach (var outputFile in outputFiles)
            {
                Directory.CreateDirectory(Path.GetDirectoryName(outputFile));
                using (File.Create(outputFile)) { }
            }

            var outputJson = outputFiles[0];
            var outputCsv = outputFiles[1];
            var outputTxt = outputFiles[2];
            var outputMd = outputFiles[3];

            var results = new List<Result>();
            var profileDirectories = new List<DirectoryInfo>();

            var language = options.Language;

            if (options.Profile)
            {
                // For each language create a directory name "{language name}-profile" that will be used to contain
                // all profiling data for a performance run by that language.
                // Later this directory will be zipped to create ZIP file that can be retained with the name "{language name}-profile.zip".
                string profileDirectory = Path.Combine(Program.Config.WorkingDirectories[language], language + "-profile");
                if (!Directory.Exists(profileDirectory))
                {
                    profileDirectories.Add(Directory.CreateDirectory(profileDirectory));
                }
            }

            var languageInfo = selectedLanguages[language];

            foreach (var languageVersion in languageInfo.DefaultVersions.Concat(languageInfo.OptionalVersions))
            {

                foreach (var packageVersions in serviceLanugageInfo.PackageVersions)
                {
                    await RunPackageVersion(options, outputJson, outputCsv, outputTxt, outputMd, results, input.Service,
                        language, serviceLanugageInfo, languageVersion, packageVersions);
                }
            }

            if (options.Profile) 
            {
                // For each language that ran create a ZIP file containing all profiling data collected.
                // This can be retained for in-depth performance analysis.
                foreach (var profileDirectory in profileDirectories)
                {
                    ZipFile.CreateFromDirectory(profileDirectory.FullName, Path.Combine(profileDirectory.Parent.FullName, profileDirectory.Name + ".zip"));
                }
            }
        }

        private static async Task RunPackageVersion(Options options, string outputJson, string outputCsv, string outputTxt,
            string outputMd, List<Result> results, string service, Language language, ServiceLanguageInfo serviceLanguageInfo,
            string languageVersion, IDictionary<string, string> packageVersions)
        {
            try
            {
                Console.WriteLine($"SetupAsync({serviceLanguageInfo.Project}, {languageVersion}, " +
                    $"{JsonSerializer.Serialize(packageVersions)})");
                Console.WriteLine();

                string setupOutput = null;
                string setupError = null;
                object context = null;
                string setupException = null;

                try
                {
                    (setupOutput, setupError, context) = await _languages[language].SetupAsync(
                        serviceLanguageInfo.Project, languageVersion, serviceLanguageInfo.PrimaryPackage, packageVersions);
                }
                catch (Exception e)
                {
                    setupException = e.ToString();

                    Console.WriteLine(e);
                    Console.WriteLine();
                }

                foreach (var test in service.Tests)
                {
                    IEnumerable<string> selectedArguments;
                    if (!options.NoAsync && !options.NoSync)
                    {
                        selectedArguments = test.Arguments.SelectMany(a => new string[] { a, a + " --sync" });
                    }
                    else if (!options.NoSync)
                    {
                        selectedArguments = test.Arguments.Select(a => a + " --sync");
                    }
                    else if (!options.NoAsync)
                    {
                        selectedArguments = test.Arguments;
                    }
                    else
                    {
                        throw new InvalidOperationException("Cannot set both --no-sync and --no-async");
                    }

                    foreach (var arguments in selectedArguments)
                    {
                        var allArguments = arguments;

                        if (serviceLanguageInfo.AdditionalArguments != null)
                        {
                            foreach (var kvp in serviceLanguageInfo.AdditionalArguments)
                            {
                                var (name, value) = (kvp.Key, kvp.Value);

                                if (arguments == null || !arguments.Contains($"--{name} "))
                                {
                                    allArguments += $" --{name} {value}";
                                }
                            }
                        }

                        if (options.Insecure)
                        {
                            allArguments += " --insecure";
                        }

                        if (options.TestProxies != null && options.TestProxies.Any())
                        {
                            allArguments += $" --test-proxies {String.Join(';', options.TestProxies)}";
                        }

                        if (options.TestProxy != null)
                        {
                            allArguments += $" --test-proxy {options.TestProxy}";
                        }

                        var result = new Result
                        {
                            Service = service.Service,
                            Test = test.Test,
                            Start = DateTime.Now,
                            Language = language,
                            LanguageVersion = languageVersion,
                            Project = serviceLanguageInfo.Project,
                            LanguageTestName = test.TestNames[language],
                            Arguments = allArguments,
                            PrimaryPackage = serviceLanguageInfo.PrimaryPackage,
                            PackageVersions = packageVersions,
                            SetupStandardOutput = setupOutput,
                            SetupStandardError = setupError,
                            SetupException = setupException,
                        };

                        results.Add(result);

                        await WriteResults(outputJson, outputCsv, outputTxt, outputMd, results);
                        if (setupException == null)
                        {
                            for (var i = 0; i < options.Iterations; i++)
                            {
                                IterationResult iterationResult;
                                try
                                {
                                    Console.WriteLine($"RunAsync({serviceLanguageInfo.Project}, {languageVersion}, " +
                                        $"{test.TestNames[language]}, {allArguments}, {context}, {options.Profile})");
                                    Console.WriteLine();

                                    iterationResult = await _languages[language].RunAsync(
                                        serviceLanguageInfo.Project,
                                        languageVersion,
                                        serviceLanguageInfo.PrimaryPackage,
                                        packageVersions,
                                        test.TestNames[language],
                                        allArguments,
                                        options.Profile,
                                        context
                                    );
                                }
                                catch (Exception e)
                                {
                                    iterationResult = new IterationResult
                                    {
                                        OperationsPerSecond = double.MinValue,
                                        Exception = e.ToString(),
                                    };

                                    Console.WriteLine(e);
                                    Console.WriteLine();
                                }

                                // Replace non-finite values with minvalue, since non-finite values
                                // are not JSON serializable
                                if (!double.IsFinite(iterationResult.OperationsPerSecond))
                                {
                                    iterationResult.OperationsPerSecond = double.MinValue;
                                }

                                result.Iterations.Add(iterationResult);

                                await WriteResults(outputJson, outputCsv, outputTxt, outputMd, results);
                            }
                        }

                        result.End = DateTime.Now;
                    }
                }
            }
            finally
            {
                if (!options.NoCleanup)
                {
                    Console.WriteLine($"CleanupAsync({serviceLanguageInfo.Project})");
                    Console.WriteLine();

                    try
                    {
                        await _languages[language].CleanupAsync(serviceLanguageInfo.Project);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        Console.WriteLine();
                    }
                }
            }
        }

        private static async Task WriteResults(string outputJson, string outputCsv, string outputTxt, string outputMd, List<Result> results)
        {
            using (var stream = File.OpenWrite(outputJson))
            {
                await JsonSerializer.SerializeAsync(stream, results, JsonOptions);
            }

            using (var streamWriter = new StreamWriter(outputCsv))
            {
                await WriteResultsSummary(streamWriter, results, OutputFormat.Csv);
            }

            using (var streamWriter = new StreamWriter(outputTxt))
            {
                await WriteResultsSummary(streamWriter, results, OutputFormat.Txt);
            }

            using (var streamWriter = new StreamWriter(outputMd))
            {
                await WriteResultsSummary(streamWriter, results, OutputFormat.Md);
            }
        }

        public static async Task WriteResultsSummary(StreamWriter streamWriter, IEnumerable<Result> results, OutputFormat outputFormat)
        {
            var groups = results.GroupBy(r => (r.Language, r.LanguageVersion, r.Service, r.Test, r.Arguments));

            var resultSummaries = groups.Select(g =>
            {
                var requestedPackageVersions = g.Select(r => r.PackageVersions).Distinct(new DictionaryEqualityComparer<string, string>());

                var runtimePackageVersions = requestedPackageVersions.Select(req =>
                    g.Where(r => r.PackageVersions == req).First().Iterations.FirstOrDefault()?.PackageVersions);

                var resultSummary = new ResultSummary()
                {
                    Language = g.Key.Language,
                    LanguageVersion = g.Key.LanguageVersion,
                    Service = g.Key.Service,
                    Test = g.Key.Test,
                    Arguments = g.Key.Arguments,
                    PrimaryPackage = g.First().PrimaryPackage,
                    RequestedPackageVersions = requestedPackageVersions,
                    RuntimePackageVersions = runtimePackageVersions,
                };

                var operationsPerSecondMax = new List<(string version, double operationsPerSecond)>();
                var operationsPerSecondMean = new List<(string version, double operationsPerSecond)>();

                foreach (var result in g)
                {
                    var primaryPackageVersion = result.PackageVersions?[resultSummary.PrimaryPackage];
                    operationsPerSecondMax.Add((primaryPackageVersion, result.OperationsPerSecondMax));
                    operationsPerSecondMean.Add((primaryPackageVersion, result.OperationsPerSecondMean));
                }

                resultSummary.OperationsPerSecondMax = operationsPerSecondMax;
                resultSummary.OperationsPerSecondMean = operationsPerSecondMean;

                return resultSummary;
            });

            var languageServiceGroups = resultSummaries.GroupBy(r => (r.Language, r.LanguageVersion, r.Service));
            foreach (var group in languageServiceGroups)
            {
                await WriteResultsSummaryThroughput(streamWriter, group, "Max", r => r.OperationsPerSecondMax,
                    r => r.OperationsPerSecondMaxDifferences, outputFormat);

                await WriteResultsSummaryThroughput(streamWriter, group, "Mean", r => r.OperationsPerSecondMean,
                    r => r.OperationsPerSecondMeanDifferences, outputFormat);

                await WriteHeader(streamWriter, "Package Versions", outputFormat);

                var versionHeaders = new string[] { "Name", "Requested", "Runtime" };
                var versionTable = new List<IList<IList<string>>>();

                var primaryPackage = group.First().PrimaryPackage;

                var runtimePackageVersions = group.First().RuntimePackageVersions
                    .Select(p => _languages[group.Key.Language].FilterRuntimePackageVersions(p));

                var packageVersions = group.First().RequestedPackageVersions.Zip(runtimePackageVersions);

                foreach (var (requested, runtime) in packageVersions)
                {
                    // requested is guaranteed to be non-null, runtime may be null

                    var versionRows = new List<IList<string>>();

                    // Primary package first, azure core second, remaining sorted alphabetically
                    var packageNames = requested.Keys.Concat(runtime?.Keys ?? Enumerable.Empty<string>())
                        .Distinct()
                        .OrderBy(n => (n == primaryPackage) ? $"__{n}" :
                            ((n.Contains("core", StringComparison.OrdinalIgnoreCase) &&
                              n.Contains("azure", StringComparison.OrdinalIgnoreCase)) ? $"_{n}" : n));

                    foreach (var packageName in packageNames)
                    {
                        requested.TryGetValue(packageName, out var requestedPackageVersion);

                        string runtimePackageVersion = null;
                        runtime?.TryGetValue(packageName, out runtimePackageVersion);

                        versionRows.Add(new List<string>
                        {
                            packageName,
                            requestedPackageVersion ?? "none",
                            runtimePackageVersion ?? "unknown"
                        });
                    }

                    versionTable.Add(versionRows);
                }

                await streamWriter.WriteLineAsync(TableGenerator.Generate(versionHeaders, versionTable, outputFormat));

                await WriteHeader(streamWriter, "Metadata", outputFormat);
                var metadataHeaders = new string[] { "Name", "Value" };
                var metadataTable = new List<IList<IList<string>>>();
                var metadataRowSets = new List<IList<string>>();
                metadataRowSets.Add(new List<string>(new string[] { "Language", $"{group.Key.Language} ({group.Key.LanguageVersion})" }));
                metadataRowSets.Add(new List<string>(new string[] { "Service", $"{group.Key.Service}" }));
                metadataTable.Add(metadataRowSets);

                await streamWriter.WriteLineAsync(TableGenerator.Generate(metadataHeaders, metadataTable, outputFormat));
            }
        }

        private static async Task WriteHeader(StreamWriter streamWriter, string header, OutputFormat outputFormat)
        {
            await streamWriter.WriteLineAsync($"## {header}");
        }

        private static async Task WriteResultsSummaryThroughput(
            StreamWriter streamWriter,
            IEnumerable<ResultSummary> resultSummaries,
            string aggregateType,
            Func<ResultSummary, IEnumerable<(string version, double operationsPerSecond)>> operationsPerSecond,
            Func<ResultSummary, IEnumerable<double>> operationsPerSecondDifferences,
            OutputFormat outputFormat)
        {
            var versions = operationsPerSecond(resultSummaries.First()).Select(o => o.version);
            var headers = versions.Take(1).Concat(versions.Skip(1).Zip(Enumerable.Repeat("%Change", versions.Count() - 1),
                (f, s) => new[] { f, s }).SelectMany(f => f));

            var testGroups = resultSummaries.GroupBy(g => g.Test);

            await WriteHeader(streamWriter, $"{aggregateType} throughput (ops/sec)", outputFormat);

            headers = headers.Prepend("Arguments").Prepend("Test");

            var table = new List<IList<IList<string>>>();

            foreach (var testGroup in testGroups)
            {
                var rowSet = new List<IList<string>>();
                foreach (var resultSummary in testGroup)
                {
                    var row = new List<string>();
                    row.Add(resultSummary.Test);
                    row.Add(resultSummary.Arguments);

                    var operationsPerSecondStrings = operationsPerSecond(resultSummary)
                        .Select(o => $"{NumberFormatter.Format(o.operationsPerSecond, 4, groupSeparator: outputFormat != OutputFormat.Csv)}");
                    var operationsPerSecondDifferencesStrings = operationsPerSecondDifferences(resultSummary).Select(o => $"{o * 100:N1}%");

                    var values = operationsPerSecondStrings.Take(1).Concat(operationsPerSecondStrings.Skip(1)
                        .Zip(operationsPerSecondDifferencesStrings, (f, s) => new[] { f, s }).SelectMany(f => f));

                    row.AddRange(values);

                    rowSet.Add(row);
                }
                table.Add(rowSet);
            }

            await streamWriter.WriteLineAsync(TableGenerator.Generate(headers.ToList(), table, outputFormat));
        }

        private static T DeserializeYaml<T>(string path)
        {
            using var fileReader = File.OpenText(path);
            var parser = new MergingParser(new YamlDotNet.Core.Parser(fileReader));
            return new Deserializer().Deserialize<T>(parser);
        }
    }
}
