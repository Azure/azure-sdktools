# Clone document source repository
function Clone-Repository {
    param (
        [Parameter(Position = 0)]
        [ValidateNotNullOrEmpty()]
        [string] $RepoUrl,
        [Parameter(Position = 1)]
        [ValidateNotNullOrEmpty()]
        [string] $RootFolder
    )
    try {
        Push-Location $RootFolder
        # Clone repository
        git clone $RepoUrl
    }
    catch {
        Write-Error "Failed to clone repository: {$RepoUrl} with exception:`n$_ "
        return $false
    }
    finally {
        Pop-Location
    }
    return $true
}

function Download-AzureBlob {
    param (
        [Parameter(Position = 0)]
        [ValidateNotNullOrEmpty()]
        [string] $StorageAccountName,
        
        [Parameter(Position = 1)]
        [ValidateNotNullOrEmpty()]
        [string] $ContainerName,
        
        [Parameter(Position = 2)]
        [ValidateNotNullOrEmpty()]
        [string] $BlobName,
        
        [Parameter(Position = 3)]
        [ValidateNotNullOrEmpty()]
        [string] $DestinationPath
    )
    
    $storageAccountKey = $env:AZURE_STORAGE_ACCOUNT_KEY
    if (-not $storageAccountKey) {
        Write-Error "Please set the environment variable 'AZURE_STORAGE_ACCOUNT_KEY'."
        return $false
    }
    try {
        $context = New-AzStorageContext -StorageAccountName $StorageAccountName -StorageAccountKey $storageAccountKey
        
        $blob = Get-AzStorageBlob -Context $context -Container $ContainerName -Blob $BlobName
        
        $destinationFile = Join-Path -Path $DestinationPath -ChildPath $BlobName
        
        $blob | Get-AzStorageBlobContent -Destination $destinationFile -Force
        return $true
    }
    catch {
        Write-Error "Failed to download Azure blob: $BlobName with exception:`n$_"
    }
    return $false
}

function Build-Embeddings {
    param (
        [Parameter(Position = 0)]
        [ValidateNotNullOrEmpty()]
        [string] $EmbeddingToolFolder
    )

    if(-not (Test-Path $embeddingToolFolder)){
        Write-Error "The embedding tool folder does not exist: $embeddingToolFolder"
        return $false
    }
    $stopwatch = Measure-Command {
        Write-Host "Building embeddings..."
        try {
            Push-Location $embeddingToolFolder
            # setup python environment and install required packages
            Write-Host "Setting up python environment"
            python -m pip install --upgrade pip
    
            Write-Host "Installing required packages"
            pip install -r requirements.txt
    
            Write-Host "Starts building"
            python main.py
        }
        catch {
            Write-Error "Failed to build embeddings with exception:`n$_"
            return $false
        }
        finally {
            Pop-Location
        }
    }
    
    Write-Host "Finishes building with time: $($stopwatch.TotalSeconds) seconds"
    return $true
}

function Upload-AzureBlob {
    param (
        [Parameter(Position = 0)]
        [ValidateNotNullOrEmpty()]
        [string] $StorageAccountName,
        
        [Parameter(Position = 1)]
        [ValidateNotNullOrEmpty()]
        [string] $ContainerName,
        
        [Parameter(Position = 2)]
        [ValidateNotNullOrEmpty()]
        [string] $BlobName,
        
        [Parameter(Position = 3)]
        [ValidateNotNullOrEmpty()]
        [string] $SourceFile
    )
    
    $storageAccountKey = $env:AZURE_STORAGE_ACCOUNT_KEY
    if (-not $storageAccountKey) {
        Write-Error "Please set the environment variable 'AZURE_STORAGE_ACCOUNT_KEY'."
        return $false
    }
    try {
        $context = New-AzStorageContext -StorageAccountName $StorageAccountName -StorageAccountKey $storageAccountKey
        
        $blob = Set-AzStorageBlobContent -Context $context -Container $ContainerName -Blob $BlobName -File $SourceFile -Force
        return $true
    }
    catch {
        Write-Error "Failed to upload Azure blob: $BlobName with exception:`n$_"
    }
    return $false
}
