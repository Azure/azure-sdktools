﻿using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using ApiView;

namespace APIViewWeb
{
    public abstract class LanguageProcessor: ILanguageService
    {
        public abstract string Name { get; }
        public abstract string Extension { get; }
        public abstract string ProcessName { get; }
        public abstract string VersionString { get; }
        public abstract string GetProccessorArguments(string originalName, string tempDirectory, string jsonPath);        

        public bool IsSupportedExtension(string extension)
        {
            return string.Equals(extension, Extension, comparisonType: StringComparison.OrdinalIgnoreCase);
        }

        public bool CanUpdate(string versionString)
        {
            return versionString != VersionString;
        }

        public async Task<CodeFile> GetCodeFileAsync(string originalName, Stream stream, bool runAnalysis)
        {
            var tempPath = Path.GetTempPath();
            var randomSegment = Guid.NewGuid().ToString("N");
            var tempDirectory = Path.Combine(tempPath, "ApiView", randomSegment);
            Directory.CreateDirectory(tempDirectory);
            var originalFilePath = Path.Combine(tempDirectory, originalName);

            var jsonFilePath = Path.ChangeExtension(originalFilePath, ".json");

            using (var file = File.Create(originalFilePath))
            {
                await stream.CopyToAsync(file);
            }

            try
            {
                var arguments = GetProccessorArguments(originalName, tempDirectory, jsonFilePath);
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

                using (var codeFileStream = File.OpenRead(jsonFilePath))
                {
                    var codeFile = await CodeFile.DeserializeAsync(codeFileStream);
                    codeFile.VersionString = VersionString;
                    codeFile.Language = Name;
                    return codeFile;
                }
            }
            finally
            {
                Directory.Delete(tempDirectory, true);
            }
        }
    }
}
