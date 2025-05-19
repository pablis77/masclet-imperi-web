# Script para integrar el historial de animales con el sistema de backup
# Autor: Cascade AI
# Fecha: 19/05/2025

param(
    [Parameter(Mandatory=$false)]
    [switch]$AfterChange,
    
    [Parameter(Mandatory=$false)]
    [string]$HistoryId,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "Backup automático"
)

# Configuración
$backupDir = "C:\Proyectos\claude\masclet-imperi-web\backend\backups"
$backupLogFile = "C:\Proyectos\claude\masclet-imperi-web\backend\backups\backup_log.json"
$dbContainer = "masclet-db-new"
$dbName = "masclet_imperi"
$dbUser = "postgres"

# Crear carpeta de backups si no existe
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Carpeta de backups creada: $backupDir" -ForegroundColor Green
}

# Generar nombre de archivo con timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "backup_masclet_imperi_$timestamp.sql"
$backupFilePath = Join-Path $backupDir $backupFileName

# Función para crear el backup
function Create-Backup {
    param (
        [string]$outputFile,
        [string]$historyId,
        [string]$description
    )
    
    Write-Host "Iniciando backup de la base de datos..." -ForegroundColor Yellow
    
    try {
        # Ejecutar pg_dump dentro del contenedor Docker para crear el backup
        docker exec $dbContainer pg_dump -U $dbUser $dbName -f /tmp/$backupFileName
        
        # Copiar el archivo desde el contenedor a la máquina host
        docker cp "$dbContainer:/tmp/$backupFileName" $outputFile
        
        # Verificar que el backup se creó correctamente
        if (Test-Path $outputFile) {
            $fileSize = (Get-Item $outputFile).Length / 1MB
            Write-Host "Backup creado correctamente en: $outputFile (Tamaño: $($fileSize.ToString('0.00')) MB)" -ForegroundColor Green
            
            # Registrar el backup en el log con referencia al historial
            Log-Backup -filePath $outputFile -historyId $historyId -description $description
            
            return $true
        } else {
            Write-Host "ERROR: No se pudo crear el archivo de backup" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para registrar el backup en el log
function Log-Backup {
    param (
        [string]$filePath,
        [string]$historyId,
        [string]$description
    )
    
    $logEntry = @{
        "timestamp" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        "file" = $filePath
        "size_bytes" = (Get-Item $filePath).Length
        "description" = $description
        "history_id" = $historyId
    }
    
    # Cargar log existente o crear uno nuevo
    if (Test-Path $backupLogFile) {
        $backupLog = Get-Content $backupLogFile | ConvertFrom-Json
    } else {
        $backupLog = @()
    }
    
    # Añadir nueva entrada
    $backupLog += $logEntry
    
    # Guardar log actualizado
    $backupLog | ConvertTo-Json | Set-Content $backupLogFile
    
    Write-Host "Backup registrado en el log con ID de historial: $historyId" -ForegroundColor Green
}

# Función para eliminar backups antiguos (más de 7 días)
function Clean-OldBackups {
    $cutoffDate = (Get-Date).AddDays(-7)
    $backupFiles = Get-ChildItem $backupDir -Filter "backup_*.sql"
    
    foreach ($file in $backupFiles) {
        if ($file.LastWriteTime -lt $cutoffDate) {
            Write-Host "Eliminando backup antiguo: $($file.Name)" -ForegroundColor Yellow
            Remove-Item $file.FullName -Force
        }
    }
}

# Ejecutar el backup
if ($AfterChange) {
    Write-Host "Ejecutando backup después de un cambio en los datos" -ForegroundColor Cyan
    Create-Backup -outputFile $backupFilePath -historyId $HistoryId -description "Backup automático después de cambio en animal"
} else {
    Write-Host "Ejecutando backup programado" -ForegroundColor Cyan
    Create-Backup -outputFile $backupFilePath -historyId $null -description $Description
}

# Limpiar backups antiguos
Clean-OldBackups

Write-Host "Proceso de backup completado" -ForegroundColor Green
