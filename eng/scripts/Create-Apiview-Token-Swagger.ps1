[CmdletBinding()]
param (
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,
  [Parameter(Mandatory = $true)]
  [string]$OutPath,
  [string]$ParserPath
)

Write-Host "Generating API review token file: $($SourcePath)"
$FileName = Split-Path -Leaf $SourcePath
$OutFileName = $FileName -replace ".swagger", "_swagger.json"
$OutFilePath = Join-Path -Path $OutPath $OutFileName
Write-Host "Converting Swagger file $($SourcePath) to APIview code file $($OutFilePath)"
if ($ParserPath -eq $null)
{
  $ParserPath = Join-Path -Path $env:Pipeline.Workspace "SwaggerApiParser"
}
Write-Host "Parser Path: $($ParserPath)"
Get-Item $ParserPath
&$($ParserPath/SwaggerApiParser) $SourcePath --output $OutFilePath