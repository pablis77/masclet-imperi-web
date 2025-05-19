param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"
$container = "masclet-db"
$database = "masclet_imperi"

# Validate backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Error "❌ Backup file not found: $BackupFile"
    exit 1
}

try {
    Write-Host "🔄 Restaurando backup: $BackupFile"
    Get-Content $BackupFile | docker exec -i $container psql -U postgres -d $database
    Write-Host "✅ Restauración completada"
} catch {
    Write-Error "❌ Error durante la restauración: $_"
    exit 1
}