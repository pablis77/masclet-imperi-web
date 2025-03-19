# Test Import Preview Script

# 1. Mover los parámetros antes del try-catch de assemblies
param (
    [string]$FilePath = "..\data\test_import.csv",
    [string]$Uri = "http://localhost:8000/api/v1/imports/preview",
    [string]$Editor = "code"  # VS Code command
)

# 2. Cargar assemblies con manejo de errores mejorado
try {
    Add-Type -AssemblyName "System.Net.Http" -ErrorAction Stop
    Add-Type -AssemblyName "System.Web" -ErrorAction Stop
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
}
catch {
    Write-Error "Error loading required assemblies: $_"
    exit 1
}

# Ensure error actions are stopping
$ErrorActionPreference = "Stop"

# 3. Mejorar el manejo de variables y recursos
$client = $null
$multipartContent = $null
$fileContent = $null
$fileStream = $null

try {
    # Verify and create directory if it doesn't exist
    $directory = Split-Path $FilePath
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force
    }

    # Verify file exists
    if (-not (Test-Path $FilePath)) {
        $defaultContent = @"
Alletar,explotació,NOM,Genere,Pare,Mare,Quadra,COD,Nº Serie,DOB,Estado,part,GenereT,EstadoT
si,Gurans,Test Vaca 1,F,Toro 123,Vaca 456,Q1,V001,ES123456789,24/02/2024,OK,,,
si,Gurans,Test Vaca 2,F,Toro 123,Vaca 457,Q1,V002,ES123456790,25/02/2024,OK,,,
no,Madrid,Test Toro 1,M,Toro 124,Vaca 458,Q2,T001,ES123456791,26/02/2024,OK,,,
"@
        $defaultContent | Out-File -FilePath $FilePath -Encoding utf8
        Write-Host "Created new file with default content: $FilePath"
    }

    Write-Host "Reading file: $FilePath"
    $absolutePath = Resolve-Path $FilePath

    # Create HTTP client with appropriate headers
    $client = New-Object System.Net.Http.HttpClient
    $client.DefaultRequestHeaders.Accept.Clear()
    $client.DefaultRequestHeaders.Accept.Add(
        [System.Net.Http.Headers.MediaTypeWithQualityHeaderValue]::new("application/json")
    )
    
    $multipartContent = New-Object System.Net.Http.MultipartFormDataContent

    # Setup file content using FileStream for proper resource management
    $fileStream = [System.IO.File]::OpenRead($absolutePath)
    $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("text/csv")
    $fileName = Split-Path $FilePath -Leaf
    $multipartContent.Add($fileContent, "file", $fileName)

    Write-Host "Sending request to $Uri..."
    $result = $client.PostAsync($Uri, $multipartContent).GetAwaiter().GetResult()
    
    $responseContent = $result.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    
    if (-not $result.IsSuccessStatusCode) {
        throw "Request failed with status $($result.StatusCode): $responseContent"
    }

    # Save and display response
    $responseFile = Join-Path $directory "response.json"
    $responseContent | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Out-File $responseFile -Encoding utf8
    Write-Host "`nResponse content:"
    Get-Content $responseFile | Write-Host
    Write-Host "`nResponse saved to: $responseFile"
    
    # Open both files in VS Code
    & $Editor $FilePath $responseFile
}
catch {
    Write-Error "Error occurred: $_"
    exit 1
}
finally {
    # Cleanup all resources in reverse order
    if ($null -ne $fileStream) {
        $fileStream.Dispose()
        Write-Host "Disposed fileStream"
    }
    if ($null -ne $fileContent) {
        $fileContent.Dispose()
        Write-Host "Disposed fileContent"
    }
    if ($null -ne $multipartContent) {
        $multipartContent.Dispose()
        Write-Host "Disposed multipartContent"
    }
    if ($null -ne $client) {
        $client.Dispose()
        Write-Host "Disposed client"
    }
}