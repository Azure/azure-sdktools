using Xunit;
using FluentAssertions;
using YamlDotNet.Serialization;

namespace Azure.Sdk.PipelineTemplateConverter.Tests;

public class PipelineConverterTests
{
    [Fact]
    public void TestGenerateStageTemplateNet()
    {
        File.Copy("./assets/net.archetype-sdk-client.before.yml", "./assets/net.archetype-sdk-client.converted.yml", true);
        PipelineTemplateConverter.Convert(new FileInfo("./assets/net.archetype-sdk-client.converted.yml"), true);
        var converted = File.ReadAllLines("./assets/net.archetype-sdk-client.converted.yml");
        var after = File.ReadAllLines("./assets/net.archetype-sdk-client.after.yml");
        for (var i = 0; i < after.Length - 1; i++)
        {
            after[i].Should().Be(converted[i]);
        }
    }

    [Fact]
    public void TestGenerateStageTemplateJs()
    {
        File.Copy("./assets/js.archetype-sdk-client.before.yml", "./assets/js.archetype-sdk-client.converted.yml", true);
        PipelineTemplateConverter.Convert(new FileInfo("./assets/js.archetype-sdk-client.converted.yml"), true);
        var converted = File.ReadAllLines("./assets/js.archetype-sdk-client.converted.yml");
        var after = File.ReadAllLines("./assets/js.archetype-sdk-client.after.yml");
        for (var i = 0; i < after.Length - 1; i++)
        {
            after[i].Should().Be(converted[i]);
        }
    }

    [Fact]
    public void TestGetTemplateType()
    {
        var contents = File.ReadAllText("./assets/net.archetype-sdk-client.before.yml");
        var templateType = PipelineTemplateConverter.GetTemplateType(contents);
        templateType.Should().Equal(new List<TemplateType> { TemplateType.Stage });

        contents = File.ReadAllText("./assets/net.aggregate-reports.before.yml");
        templateType = PipelineTemplateConverter.GetTemplateType(contents);
        templateType.Should().Equal(new List<TemplateType> { TemplateType.Stage, TemplateType.ArtifactTask });

        contents = File.ReadAllText("./assets/net.aggregate-reports.converted.yml");
        templateType = PipelineTemplateConverter.GetTemplateType(contents);
        templateType.Should().Equal(new List<TemplateType> { TemplateType.Converted, TemplateType.Stage });
    }

    [Fact]
    public void TestRestoreQuotes()
    {
        var contents = @"
              steps:
                - a: ""comment""  # inline comment
                - foo: bar
                - foo: 'bar'
                - baz: 'qux'
                - quux: ""corge""".TrimStart(Environment.NewLine.ToCharArray());

        // Test indent change as well
        var serialized = @"
              steps:
                - a: comment
                - foo: bar
                - foo: bar
                - baz: qux
                - quux: corge".TrimStart(Environment.NewLine.ToCharArray());

        var processedLines = PipelineTemplateConverter.BackupCommentsAndFormatting(
                                contents, new List<TemplateType> { TemplateType.Stage });
        var output = PipelineTemplateConverter.RestoreCommentsAndFormatting(serialized, processedLines);
        output.Should().Be(contents);
    }

    [Fact]
    public void TestRestoreComments()
    {
        var contents = @"
                    # This is a comment
                    steps:  # this is an inline comment
                      - pwsh: |
                          Write-Host 'Hello, world!'
                          # This is an embedded string comment that should not be duplicated
                          Write-Host 'Goodbye, world!'  # embedded inline comment
                      # This is a comment above the second pwsh line
                      - pwsh: |
                          Write-Host 'Hello, world!'
                          # This is an embedded string comment that should not be duplicated
                          Write-Host 'Goodbye, world!'  # embedded inline comment
                      - foo: bar

                      - foo: bar  # this is an inline comment on the third matching line
                      - baz: qux".TrimStart(Environment.NewLine.ToCharArray());

        var serialized = @"
                    steps:
                      - pwsh: |
                          Write-Host 'Hello, world!'
                          Write-Host 'Goodbye, world!'
                      - pwsh: |
                          Write-Host 'Hello, world!'
                          Write-Host 'Goodbye, world!'
                      - foo: bar
                      - foo: bar
                      - baz: qux".TrimStart(Environment.NewLine.ToCharArray());

        var processedLines = PipelineTemplateConverter.BackupCommentsAndFormatting(
                                contents, new List<TemplateType> { TemplateType.Stage });
        var output = PipelineTemplateConverter.RestoreCommentsAndFormatting(serialized, processedLines);
        output.Should().Be(contents);
    }

    [Fact]
    public void TestFixTemplateSpecialCharacters()
    {
        var contents = @"
          extends:
            ""${{ if eq(variables['System.TeamProject'], 'internal') }}:"":
              template: v1/1ES.Official.PipelineTemplate.yml@1ESPipelineTemplates
            ${{ else }}:
              template: v1/1ES.Unofficial.PipelineTemplate.yml@1ESPipelineTemplates
            parameters:
          ";

        var expected = @"
          extends:
            ${{ if eq(variables['System.TeamProject'], 'internal') }}:
              template: v1/1ES.Official.PipelineTemplate.yml@1ESPipelineTemplates
            ${{ else }}:
              template: v1/1ES.Unofficial.PipelineTemplate.yml@1ESPipelineTemplates
            parameters:
          ";

        var template = PipelineTemplateConverter.FixTemplateSpecialCharacters(contents);
        template.Should().Be(expected);
    }

    [Fact]
    public void TestConvertPublishTasksPipelineArtifact()
    {
        var contents = @"
              - task: PublishPipelineArtifact@1
                condition: succeeded()
                displayName: Test Publish
                inputs:
                  artifactName: drop
                  targetPath: $(Build.ArtifactStagingDirectory)";
        var expected = @"
              - template: /eng/common/pipelines/templates/steps/publish-artifact.yml
                parameters:
                  PublishType: pipeline
                  ArtifactName: drop
                  ArtifactPath: $(Build.ArtifactStagingDirectory)
                  DisplayName: Test Publish
                  Condition: succeeded()";

        var output = PipelineTemplateConverter.ConvertPublishTasks(contents);
        output.Should().Be(expected);
    }

    [Fact]
    public void TestConvertPublishTasksBuildArtifact()
    {
        var contents = @"
              - task: PublishBuildArtifact@1
                condition: succeeded()
                displayName: Test Publish
                inputs:
                  artifactName: drop
                  pathtoPublish: $(Build.ArtifactStagingDirectory)";
        var expected = @"
              - template: /eng/common/pipelines/templates/steps/publish-artifact.yml
                parameters:
                  PublishType: build
                  ArtifactName: drop
                  ArtifactPath: $(Build.ArtifactStagingDirectory)
                  DisplayName: Test Publish
                  Condition: succeeded()";

        var output = PipelineTemplateConverter.ConvertPublishTasks(contents);
        output.Should().Be(expected);
    }

    [Fact]
    public void TestConvertPublishTasksNugetCommand()
    {
        var contents = @"
              - task: NugetCommand@2
                condition: succeeded()
                displayName: Test Publish
                inputs:
                  command: push
                  packagesToPush: '$(Pipeline.Workspace)/packages/**/*.nupkg'
                  nuGetFeedType: external
                  publishFeedCredentials: Nuget.org";
        var expected = @"
              - template: /eng/common/pipelines/templates/steps/publish-artifact.yml
                parameters:
                  PublishType: nuget
                  ArtifactName: $(Pipeline.Workspace)/packages/**/*.nupkg
                  ArtifactPath: $(Pipeline.Workspace)/packages
                  NugetFeedType: external
                  DisplayName: Test Publish
                  Condition: succeeded()";

        var output = PipelineTemplateConverter.ConvertPublishTasks(contents);
        output.Should().Be(expected);

        contents = @"
              - task: NugetCommand@2
                condition: succeeded()
                displayName: Test Publish
                inputs:
                  command: push
                  packagesToPush: '$(Pipeline.Workspace)/packages/**/*.nupkg'
                  publishVstsFeed: $(DevopsFeedId)";
        expected = @"
              - template: /eng/common/pipelines/templates/steps/publish-artifact.yml
                parameters:
                  PublishType: nuget
                  ArtifactName: $(Pipeline.Workspace)/packages/**/*.nupkg
                  ArtifactPath: $(Pipeline.Workspace)/packages
                  PublishVstsFeed: $(DevopsFeedId)
                  DisplayName: Test Publish
                  Condition: succeeded()";

        output = PipelineTemplateConverter.ConvertPublishTasks(contents);
        output.Should().Be(expected);
    }

    [Fact]
    public void TestPreserveBlockChompFormatting()
    {
        var contents = @"
          - stages:
            - stage: Build
              jobs:
                - job: Build
                  steps:
                    - task: Powershell@2
                      inputs:
                        pwsh: true
                        filePath: foobar.ps1
                        arguments: >-
                          -WorkingDirectory foo
                          -Foobar baz
                          -SkipThings true".TrimStart(Environment.NewLine.ToCharArray());

        var serialized = @"
          - stages:
            - stage: Build
              jobs:
                - job: Build
                  steps:
                    - task: Powershell@2
                      inputs:
                        pwsh: true
                        filePath: foobar.ps1
                        arguments: -WorkingDirectory foo -Foobar baz -SkipThings true".TrimStart(Environment.NewLine.ToCharArray());

        var processedLines = PipelineTemplateConverter.BackupCommentsAndFormatting(
                                contents, new List<TemplateType> { TemplateType.Stage });
        var output = PipelineTemplateConverter.RestoreCommentsAndFormatting(serialized, processedLines);
        output.Should().Be(contents);
    }
}