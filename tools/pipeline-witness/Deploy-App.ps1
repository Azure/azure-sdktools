<#
.SYNOPSIS
    Builds and deploys the dotnet app.
#>
param(
  [Parameter(Mandatory)]
  [validateSet('staging', 'test')]
  [string]$Target
)

$repoRoot = Resolve-Path "$PSScriptRoot/../.."
. "$repoRoot/eng/common/scripts/Helpers/CommandInvocation-Helpers.ps1"

Push-Location $PSScriptRoot
try {
    $subscriptionName = $Target -eq 'test' ? 'Azure SDK Developer Playground' : 'Azure SDK Engineering System'
    $parametersFile = "./infrastructure/bicep/parameters.$Target.json"
      
    $parameters = (Get-Content -Path $parametersFile -Raw | ConvertFrom-Json).parameters
    $resourceGroupName = $parameters.appResourceGroupName.value
    $resourceName = $parameters.webAppName.value
  
    Write-Host "Deploying web app to:`n" + `
    "  Subscription: $subscriptionName`n" + `
    "  Resource Group: $resourceGroupName`n" + `
    "  Resource: $resourceName`n"

    $artifactsPath = "$repoRoot/artifacts"
    $publishPath = "$artifactsPath/bin/Azure.Sdk.Tools.PipelineWitness.Tests/Release/net7.0/publish"

    Invoke-LoggedCommand "dotnet publish --configuration Release"

    Compress-Archive -Path "$publishPath/*" -DestinationPath "$artifactsPath/pipeline-witness.zip" -Force
    if($?) {
        Write-Host "pipeline-witness.zip created"
    } else {
        Write-Error "Failed to create pipeline-witness.zip"
        exit 1
    }

    Invoke-LoggedCommand "az webapp deploy --src-path '$artifactsPath/pipeline-witness.zip' --subscription '$subscriptionName' --resource-group '$resourceGroupName' --name '$resourceName'"
}
finally {
    Pop-Location
}
