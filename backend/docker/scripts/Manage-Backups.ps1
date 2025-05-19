[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('new', 'restore', 'get')]
    [string]$Action = 'get',

    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"
$container = "masclet-db"
$database = "masclet_imperi"
$scriptPath = $PSScriptRoot
$backupPath = Join-Path $scriptPath "..\postgres\backups"

Write-Host "Script path: $scriptPath"
Write-Host "Backup path: $backupPath"

function Get-MascletBackup {
    Write-Host "Available backups:"
    if (Test-Path $backupPath) {
        Get-ChildItem -Path $backupPath -Filter "backup_*.sql" | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object Name, @{N='Size(MB)';E={[math]::Round($_.Length/1MB, 2)}}, LastWriteTime
    } else {
        Write-Host "Warning: Backup directory not found: $backupPath"
    }
}

function New-MascletBackup {
    Write-Host "Creating new backup..."
    
    function Test-ContainerHealth {
        try {
            $containerInfo = docker inspect $container 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Container '$container' not found. Starting services..."
                Set-Location ../compose
                docker-compose up -d
                Set-Location ../scripts
                Start-Sleep -Seconds 10
                return $false
            }

            $status = docker inspect $container --format "{{.State.Status}}"
            $health = docker inspect $container --format "{{.State.Health.Status}}" 2>$null

            if ($status -eq "running" -and ($health -eq "healthy" -or $null -eq $health)) {
                return $true
            }

            Write-Host "Container status: $status, Health: $health"
            return $false
        }
        catch {
            Write-Host "Error checking container: $_"
            return $false
        }
    }

    $maxAttempts = 10  # Aumentamos el número de intentos
    $attempt = 1
    $containerReady = $false

    while ($attempt -le $maxAttempts -and -not $containerReady) {
        Write-Host "Checking container status (Attempt $attempt of $maxAttempts)..."
        
        if (Test-ContainerHealth) {
            $containerReady = $true
            Write-Host "Container is healthy and ready"
        } else {
            Write-Host "Container not ready, waiting 30 seconds..."
            Start-Sleep -Seconds 30
            $attempt++
        }
    }

    if (-not $containerReady) {
        Write-Error "Container failed to start after $maxAttempts attempts"
        return
    }

    Write-Host "Container is ready, creating backup..."
    
    try {
        # Verificar que el script de backup existe
        $scriptExists = docker exec $container test -f /docker-entrypoint-initdb.d/backup.sh
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Backup script not found in container"
            return
        }

        # Asegurar permisos
        docker exec $container chmod +x /docker-entrypoint-initdb.d/backup.sh
        
        # Ejecutar backup
        $backupOutput = docker exec $container /docker-entrypoint-initdb.d/backup.sh 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backup created successfully"
            Write-Host $backupOutput
        } else {
            Write-Error "❌ Backup failed: $backupOutput"
        }
    } catch {
        Write-Error "❌ Error executing backup: $_"
    }
}

function Restore-MascletBackup {
    if (-not $BackupFile) {
        Write-Error "Backup file parameter required for restore"
        exit 1
    }
    
    $fullPath = Join-Path $backupPath $BackupFile
    if (-not (Test-Path $fullPath)) {
        Write-Error "Backup file not found: $fullPath"
        exit 1
    }

    Write-Host "Restoring backup: $BackupFile"
    Get-Content $fullPath | docker exec -i $container psql -U postgres -d $database
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Restore completed"
    } else {
        Write-Error "Failed to restore backup"
    }
}

# Main execution
switch ($Action) {
    'get' { Get-MascletBackup }
    'new' { New-MascletBackup }
    'restore' { Restore-MascletBackup }
}
