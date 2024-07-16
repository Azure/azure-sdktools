using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using ApiView;
using APIViewWeb.Helpers;

namespace APIViewWeb
{
    public abstract class LanguageProcessor: LanguageService
    {
        public abstract string ProcessName { get; }
        public abstract string VersionString { get; }
        public abstract string GetProcessorArguments(string originalName, string tempDirectory, string jsonPath);

        public override bool CanUpdate(string versionString)
        {
            return versionString != VersionString;
        }

        public override async Task<CodeFile> GetCodeFileAsync(string originalName, Stream stream, bool runAnalysis)
        {
            var tempPath = Path.GetTempPath();
            var randomSegment = Guid.NewGuid().ToString("N");
            var tempDirectory = Path.Combine(tempPath, "ApiView", randomSegment);
            Directory.CreateDirectory(tempDirectory);
            originalName = Path.GetFileName(originalName);
            // Replace spaces and parentheses in the file name to remove invalid file name in cosmos DB.
            // temporary work around. We need to make sure FileName is set for all requests.
            originalName = originalName.Replace(" ", "_").Replace("(", "").Replace(")","");
            var originalFilePath = Path.Combine(tempDirectory, originalName);

            var jsonFilePath = (LanguageServiceHelpers.UseTreeStyleParser(this.Name)) ? Path.ChangeExtension(originalFilePath, ".json.tgz") : Path.ChangeExtension(originalFilePath, ".json");

            using (var file = File.Create(originalFilePath))
            {
                await stream.CopyToAsync(file);
            }

            try
            {
                var arguments = GetProcessorArguments(originalName, tempDirectory, jsonFilePath);
                var processStartInfo = new ProcessStartInfo(ProcessName, arguments);
                processStartInfo.WorkingDirectory = tempDirectory;
                processStartInfo.RedirectStandardError = true;
                processStartInfo.RedirectStandardOutput = true;

                using (var process = Process.Start(processStartInfo))
                {
                    process.WaitForExit();
                    if (process.ExitCode != 0)
                    {
                        throw new InvalidOperationException(
                            "Processor failed: " + Environment.NewLine +
                            "stdout: " + Environment.NewLine +
                            process.StandardOutput.ReadToEnd() + Environment.NewLine +
                            "stderr: " + Environment.NewLine +
                            process.StandardError.ReadToEnd() + Environment.NewLine);
                    }
                }

                using (var codeFileStream = new FileStream(jsonFilePath, FileMode.Open, FileAccess.Read, FileShare.None))
                {
                    CodeFile codeFile = await CodeFile.DeserializeAsync(stream: codeFileStream, doTreeStyleParserDeserialization: LanguageServiceHelpers.UseTreeStyleParser(this.Name));
                    codeFile.VersionString = VersionString;
                    codeFile.Language = Name;
                    return codeFile;
                }
            }
            finally
            {
                await Task.Delay(1000);
                try
                {
                    Directory.Delete(tempDirectory, true);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to delete directory: {ex.Message}");
                }
            }
        }
    }
}
