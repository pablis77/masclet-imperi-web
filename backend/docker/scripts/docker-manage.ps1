param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start','stop','restart','status','backup','clean','restore','verify','init-test','tag')]
    [string]$Action,
    [Parameter(Mandatory=$false)]
    [string]$BackupFile,
    [Parameter(Mandatory=$false)]
    [string]$ImageName,
    [Parameter(Mandatory=$false)]
    [string]$NewTag,
    [Parameter(Mandatory=$false)]
    [switch]$IncludeVolumes,
    [Parameter(Mandatory=$false)]
    [string]$BackupName
)

$ErrorActionPreference = 'Stop'
$ProjectName = "masclet-imperi"
$BackupDir = Join-Path $PSScriptRoot "../docker/postgres/backups"
$DockerComposePath = Join-Path $PSScriptRoot "../docker-compose.yml"
# Añadir ruta completa a Docker
$DockerPath = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

if (-not (Test-Path $DockerPath)) {
    Write-Error "Docker not found at $DockerPath. Please ensure Docker Desktop is installed."
    exit 1
}

# Verificar que Docker está corriendo
try {
    & $DockerPath ps > $null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running. Please start Docker Desktop."
        exit 1
    }
} catch {
    Write-Error "Error checking Docker status: $_"
    exit 1
}

function Test-DockerHealth {
    try {
        $dbHealth = & $DockerPath inspect masclet_imperi_db --format "{{.State.Health.Status}}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Database container not found" -ForegroundColor Yellow
            return $false
        }
        return ($dbHealth -eq "healthy")
    }
    catch {
        Write-Host "Error checking container health: $_" -ForegroundColor Red
        return $false
    }
}

function Test-DockerConfig {
    Write-Host "Validating Docker configuration..."
    
    # Check Docker service
    $dockerService = Get-Service 'com.docker.service'
    if ($dockerService.Status -ne 'Running') {
        Write-Host "Docker service is not running. Starting service..."
        Start-Service 'com.docker.service'
        Start-Sleep -Seconds 10
    }

    # Check .env file
    $envPath = Join-Path $PSScriptRoot "../.env"
    if (-not (Test-Path $envPath)) {
        Write-Host "Creating default .env file..."
        @"
# PostgreSQL Settings
POSTGRES_DB=masclet_imperi
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1234
POSTGRES_PORT=5432

# Resource Limits
POSTGRES_CPU_LIMIT=1
POSTGRES_MEM_LIMIT=1G
POSTGRES_MEM_RESERVATION=512M

# Logging
LOG_MAX_SIZE=10m
LOG_MAX_FILE=3
"@ | Out-File $envPath -Encoding UTF8
    }

    # Check required directories
    $dirs = @(
        "../docker/postgres/init",
        "../docker/postgres/logs",
        "../docker/postgres/backups"
    )
    
    foreach ($dir in $dirs) {
        $fullPath = Join-Path $PSScriptRoot $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force
            Write-Host "Created directory: $fullPath"
        }
    }

    return $true
}

function New-Backup {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = Join-Path $PSScriptRoot "../docker/postgres/backups"
    $backupFile = Join-Path $backupDir "backup_$timestamp.sql"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force
    }

    Write-Host "Creating backup at: $backupFile"
    Write-Host "Running pg_dump..."
    
    try {
        # Redirect stderr to a log file
        $logFile = Join-Path $backupDir "backup_$timestamp.log"
        & $DockerPath exec masclet_imperi_db pg_dump -U postgres masclet_imperi > $backupFile 2>$logFile

        # Verificar integridad del backup
        if (Test-Path $backupFile) {
            $size = (Get-Item $backupFile).Length
            $tables = (Get-Content $backupFile | Select-String "CREATE TABLE").Count
            Write-Host "`nBackup Summary:"
            Write-Host "-------------"
            Write-Host "- Size: $([math]::Round($size/1KB, 2)) KB"
            Write-Host "- Tables found: $tables"
            Write-Host "- Location: $backupFile"
            
            if (Test-Path $logFile) {
                $logContent = Get-Content $logFile
                Write-Host "`nBackup Log:"
                Write-Host "----------"
                $logContent | ForEach-Object { Write-Host "  $_" }
            }
            
            # Mantener solo las últimas 4 copias
            $oldBackups = Get-ChildItem $backupDir -Filter "backup_*.sql" | 
                Sort-Object CreationTime -Descending | 
                Select-Object -Skip 4
            if ($oldBackups) {
                Write-Host "`nCleaning old backups:"
                $oldBackups | ForEach-Object {
                    Write-Host "- Removing $_"
                    Remove-Item $_.FullName -Force
                }
            }

            return $true
        } else {
            Write-Error "Backup file was not created!"
            return $false
        }
    }
    catch {
        Write-Error "Backup failed: $_"
        return $false
    }
}

function Test-BackupIntegrity {
    param([string]$BackupPath)
    
    Write-Host "Verifying backup integrity: $BackupPath"
    
    if (-not (Test-Path $BackupPath)) {
        Write-Error "Backup file not found!"
        return $false
    }
    
    $content = Get-Content $BackupPath
    $contentString = $content -join "`n"
    
    # Updated pattern matching for PostgreSQL dumps
    $checks = @{
        "PostgreSQL Header" = $contentString -match "--\s*PostgreSQL database dump"
        "Tables Found" = ($content | Select-String "CREATE TABLE").Count
        "Data Inserts" = ($content | Select-String "INSERT INTO|COPY").Count
        "File Size (KB)" = [math]::Round((Get-Item $BackupPath).Length/1KB, 2)
        "Schema Info" = $contentString -match "SELECT pg_catalog.set_config\('search_path'"
        "Encoding" = $contentString -match "SET client_encoding = 'UTF8'"
    }

    Write-Host "`nBackup Analysis:"
    Write-Host "---------------"
    foreach ($check in $checks.GetEnumerator()) {
        $value = $check.Value
        # Using simple ASCII characters
        $status = if ($value -gt 0 -or $value -eq $true) { "[OK]" } else { "[X]" }
        Write-Host "- $($check.Key): $value $status"
    }
    
    # Updated validation criteria
    $isValid = $checks["PostgreSQL Header"] -and 
               ($checks["Tables Found"] -gt 0 -or $checks["Data Inserts"] -gt 0) -and
               $checks["Schema Info"] -and
               $checks["Encoding"]
    
    Write-Host "`nBackup Status:"
    if ($isValid) {
        Write-Host "Valid [OK]" -ForegroundColor Green
    } else {
        Write-Host "Invalid [ERROR]" -ForegroundColor Red
        Write-Host "`nFailed Checks:"
        foreach ($check in $checks.GetEnumerator()) {
            if (-not ($check.Value -gt 0 -or $check.Value -eq $true)) {
                Write-Host "- Missing $($check.Key)" -ForegroundColor Yellow
            }
        }
    }
    
    return $isValid
}

function Restore-Backup {
    param([string]$BackupPath)
    
    if (-not (Test-BackupIntegrity $BackupPath)) {
        Write-Error "Backup integrity check failed!"
        return
    }
    
    Write-Host "Creating pre-restore backup..."
    New-Backup
    
    Write-Host "Restoring from backup: $BackupPath"
    # Cambiado el método de restauración para evitar el operador <
    Get-Content $BackupPath | docker exec -i masclet_imperi_db psql -U postgres -d masclet_imperi
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Restore completed successfully"
    } else {
        Write-Error "Restore failed!"
    }
}

function Initialize-TestData {
    Write-Host "Initializing test data..."
    $sqlFile = Join-Path $PSScriptRoot "../docker/postgres/init/01_test_data.sql"
    
    if (Test-Path $sqlFile) {
        Write-Host "Executing test data script..."
        Get-Content $sqlFile | & $DockerPath exec -i masclet_imperi_db psql -U postgres -d masclet_imperi
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Test data initialized successfully"
            
            # Verify data
            & $DockerPath exec masclet_imperi_db psql -U postgres -d masclet_imperi -c "SELECT COUNT(*) FROM test_animals;"
        } else {
            Write-Error "Failed to initialize test data"
        }
    } else {
        Write-Error "Test data SQL file not found at: $sqlFile"
    }
}
function New-ContainerBackup {
    param(
        [string]$BackupName = (Get-Date -Format "yyyyMMdd_HHmmss")
    )
    
    $backupDir = Join-Path $PSScriptRoot "../docker/backups/containers"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force
    }

    $containers = @(
        @{Name="masclet_imperi_db"; Image="postgres:17"},
        @{Name="masclet_imperi_cache"; Image="redis:alpine"}
    )

    foreach ($container in $containers) {
        if (& $DockerPath ps -q -f name=$($container.Name)) {
            $backupPath = Join-Path $backupDir "$($container.Name)_${BackupName}.tar"
            Write-Host "Creating backup for $($container.Name) at: $backupPath"
            
            # Commit container to image
            $tempTag = "backup_$($container.Name):$BackupName"
            & $DockerPath commit $($container.Name) $tempTag

            # Save image to file
            & $DockerPath save -o $backupPath $tempTag

            # Remove temporary image
            & $DockerPath rmi $tempTag -f

            if ($LASTEXITCODE -eq 0) {
                Write-Host "Container $($container.Name) backed up successfully" -ForegroundColor Green
            } else {
                Write-Error "Failed to backup container $($container.Name)"
            }
        } else {
            Write-Warning "Container $($container.Name) not found, skipping backup"
        }
    }
}

function New-VolumeBackup {
    param(
        [string]$BackupName = (Get-Date -Format "yyyyMMdd_HHmmss")
    )
    
    $backupDir = Join-Path $PSScriptRoot "../docker/backups/volumes"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force
    }

    # First, create database dump
    $dbBackupPath = Join-Path $backupDir "db_dump_${BackupName}.sql"
    Write-Host "Creating database dump at: $dbBackupPath"
    & $DockerPath exec masclet_imperi_db pg_dump -U postgres masclet_imperi > $dbBackupPath

    $volumes = @(
        "masclet_imperi_data",
        "masclet_imperi_cache"
    )

    foreach ($volume in $volumes) {
        if (& $DockerPath volume ls -q -f name=$volume) {
            $backupPath = Join-Path $backupDir "${volume}_${BackupName}.tar"
            Write-Host "Backing up volume $volume to $backupPath..."

            # Use busybox instead of alpine for smaller image
            & $DockerPath run --rm -v ${volume}:/data -v ${backupDir}:/backup busybox tar cvf /backup/$(Split-Path $backupPath -Leaf) -C /data .

            if ($LASTEXITCODE -eq 0) {
                Write-Host "Volume $volume backed up successfully" -ForegroundColor Green
            } else {
                Write-Error "Failed to backup volume $volume"
            }
        } else {
            Write-Warning "Volume $volume not found, skipping backup"
        }
    }
}

function Restore-FromBackup {
    param(
        [string]$BackupName
    )
    
    $containerBackupDir = Join-Path $PSScriptRoot "../docker/backups/containers"
    $volumeBackupDir = Join-Path $PSScriptRoot "../docker/backups/volumes"

    # Stop containers
    Write-Host "Stopping containers..."
    & $DockerPath compose -f $DockerComposePath down

    # Restore containers
    Get-ChildItem $containerBackupDir -Filter "*${BackupName}.tar" | ForEach-Object {
        Write-Host "Restoring container from $($_.Name)..."
        & $DockerPath load -i $_.FullName
    }

    # Restore volumes
    Get-ChildItem $volumeBackupDir -Filter "*${BackupName}.tar" | ForEach-Object {
        $volumeName = ($_.BaseName -split '_')[0,1] -join '_'
        Write-Host "Restoring volume $volumeName..."
        
        # Remove existing volume
        & $DockerPath volume rm $volumeName -f
        & $DockerPath volume create $volumeName
        
        # Restore data
        & $DockerPath run --rm -v ${volumeName}:/data -v $($_.FullName):/backup.tar busybox sh -c "cd /data && tar xf /backup.tar"
    }

    # Start containers
    Write-Host "Starting containers..."
    & $DockerPath compose -f $DockerComposePath up -d

    Write-Host "Restore completed" -ForegroundColor Green
}

switch ($Action) {
    'start' {
        if (-not (Test-DockerConfig)) {
            Write-Error "Configuration validation failed"
            exit 1
        }
        Write-Host "Pulling required images..."
        & $DockerPath pull postgres:17
        
        Write-Host "`nStarting containers..."
        & $DockerPath compose -f $DockerComposePath up -d
        
        $retries = 0
        while (-not (Test-DockerHealth) -and $retries -lt 5) {
            Write-Host "Waiting for database to be healthy..."
            Start-Sleep -Seconds 5
            $retries++ 
        }
    }
    'stop' {
        Write-Host "Stopping containers..."
        & $DockerPath compose -f $DockerComposePath down
    }
    'restart' {
        Write-Host "Restarting containers..."
        & $DockerPath compose -f $DockerComposePath restart
        
        $retries = 0
        while (-not (Test-DockerHealth) -and $retries -lt 5) {
            Write-Host "Waiting for database to be healthy..."
            Start-Sleep -Seconds 5
            $retries++
        }
        
        if (Test-DockerHealth) {
            Write-Host "Restart completed successfully" -ForegroundColor Green
        } else {
            Write-Host "Warning: Database might not be fully healthy" -ForegroundColor Yellow
        }
    }
    'status' {
        Write-Host "Container status:"
        Write-Host "----------------"
        
        # Show all related containers
        Write-Host "`nAll project containers:"
        & $DockerPath ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | 
            Select-String -Pattern "masclet|postgres|redis"
        
        Write-Host "`nNetwork status:"
        & $DockerPath network inspect masclet_network --format "{{range .Containers}}{{.Name}} ({{.IPv4Address}}){{println}}{{end}}"
        
        Write-Host "`nHealth status:"
        Write-Host "--------------"
        $dbHealth = & $DockerPath inspect masclet_imperi_db --format "{{.State.Health.Status}}"
        $redisHealth = & $DockerPath inspect masclet_imperi_cache --format "{{.State.Health.Status}}"
        
        Write-Host "Database: $dbHealth" -ForegroundColor $(if($dbHealth -eq "healthy"){"Green"}else{"Red"})
        Write-Host "Cache: $redisHealth" -ForegroundColor $(if($redisHealth -eq "healthy"){"Green"}else{"Red"})
    }
    'backup' {
        New-ContainerBackup
        if ($IncludeVolumes) {
            New-VolumeBackup
        }
    }
    'clean' {
        Write-Host "Cleaning unused resources..."
        & "C:\Program Files\Docker\Docker\resources\bin\docker.exe" system prune -af --volumes
    }
    'verify' {
        Write-Host "Verifying backup..."
        if (-not $BackupFile) {
            $BackupFile = Get-ChildItem (Join-Path $PSScriptRoot "../docker/postgres/backups") -Filter "backup_*.sql" | 
                Sort-Object CreationTime -Descending | 
                Select-Object -First 1 -ExpandProperty FullName
        }
        Test-BackupIntegrity $BackupFile
    }
    'restore' {
        if ($BackupName) {
            Write-Host "Restoring from backup set: $BackupName"
            Restore-FromBackup -BackupName $BackupName
        }
        elseif ($BackupFile) {
            Write-Host "Restoring from SQL backup file..."
            Restore-Backup -BackupPath $BackupFile
        }
        else {
            Write-Error "Either BackupName or BackupFile parameter is required for restore!"
            return
        }
    }
    'init-test' {
        Initialize-TestData
    }
    'tag' {
        if (-not $ImageName -or -not $NewTag) {
            Write-Error "Both ImageName and NewTag parameters are required for tag action"
            return
        }
        Write-Host "Tagging image $ImageName as $NewTag..."
        & $DockerPath tag $ImageName $NewTag
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Image tagged successfully" -ForegroundColor Green
            # Show updated image list
            Write-Host "`nUpdated images:"
            & $DockerPath images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | 
                Select-String -Pattern ($ImageName -split ':')[0]
        } else {
            Write-Error "Failed to tag image"
        }
    }
}