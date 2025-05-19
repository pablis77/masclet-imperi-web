# Script de backup programado para Masclet Imperi
# Este script se puede programar para ejecutarse automáticamente en el Programador de tareas de Windows

param (
    [switch]$AfterChange = $false
)

$ErrorActionPreference = "Stop"

# Función para escribir mensajes con timestamp
function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "$timestamp [$Level] $Message"
}

# Ruta base del proyecto
$proyectoBase = "C:\Proyectos\claude\masclet-imperi-web"
# Directorio de backups
$backupDir = "$proyectoBase\backend\backups"

# Verificar que existe el directorio de backups
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Log "Directorio de backups creado: $backupDir"
}

# Verificar si Docker está disponible
$dockerInstalled = $null -ne (Get-Command "docker" -ErrorAction SilentlyContinue)
if (-not $dockerInstalled) {
    Write-Log "Docker no está disponible en el sistema" "ERROR"
    exit 1
}

# Identificar el tipo de backup
$backupType = if ($AfterChange) { "post-cambio" } else { "programado" }
Write-Log "Iniciando backup $backupType de la base de datos Masclet Imperi"

# Verificar si el contenedor PostgreSQL está en ejecución
$containerRunning = $false
try {
    $containerCheck = docker ps --filter "name=masclet-db-new" --format "{{.Names}}"
    $containerRunning = $containerCheck -eq "masclet-db-new"
} catch {
    Write-Log "Error al verificar el estado del contenedor: $_" "ERROR"
}

if (-not $containerRunning) {
    Write-Log "El contenedor masclet-db-new no está en ejecución. Intentando iniciarlo..." "WARN"
    try {
        docker start masclet-db-new
        Start-Sleep -Seconds 5  # Esperar a que el contenedor inicie completamente
        $containerCheck = docker ps --filter "name=masclet-db-new" --format "{{.Names}}"
        $containerRunning = $containerCheck -eq "masclet-db-new"
    } catch {
        Write-Log "Error al iniciar el contenedor: $_" "ERROR"
    }
    
    if (-not $containerRunning) {
        Write-Log "No se pudo iniciar el contenedor PostgreSQL" "ERROR"
        exit 1
    }
}

# Crear timestamp y nombre de archivo
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$description = if ($AfterChange) { "cambio-sistema" } else { "diario-auto" }
$filename = "backup_masclet_imperi_${timestamp}_$description.sql"
$backupPath = Join-Path -Path $backupDir -ChildPath $filename

try {
    # Obtener credenciales de la base de datos
    $dbUser = "postgres"  # Podríamos leerlo de .env pero por ahora es fijo
    $dbName = "masclet_imperi"  # Podríamos leerlo de .env pero por ahora es fijo
    
    Write-Log "Iniciando backup de la base de datos $dbName en $backupPath..."
    
    # Ejecutar pg_dump dentro del contenedor
    $process = docker exec masclet-db-new pg_dump -U $dbUser $dbName | Out-File -FilePath $backupPath -Encoding utf8
    
    # Verificar que el archivo de backup existe y tiene contenido
    if (-not (Test-Path $backupPath) -or (Get-Item $backupPath).Length -eq 0) {
        Write-Log "El archivo de backup está vacío o no se creó correctamente" "ERROR"
        exit 1
    }
    
    # Obtener información del backup
    $fileSize = (Get-Item $backupPath).Length
    $formattedSize = "{0:N2} MB" -f ($fileSize / 1MB)
    
    Write-Log "Backup completado exitosamente: $filename"
    Write-Log "Tamaño del backup: $formattedSize"
    
    # Limpiar backups antiguos
    # Mantener solo los últimos 7 backups
    $maxBackups = 7
    $backupFiles = Get-ChildItem -Path $backupDir -Filter "backup_masclet_imperi_*.sql" | 
                   Sort-Object -Property LastWriteTime
    
    if ($backupFiles.Count -gt $maxBackups) {
        $backupsToDelete = $backupFiles.Count - $maxBackups
        Write-Log "Limpiando $backupsToDelete backups antiguos..."
        
        $backupFiles | Select-Object -First $backupsToDelete | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Log "Backup antiguo eliminado: $($_.Name)"
        }
    }
    
    Write-Log "Proceso de backup completado exitosamente"
    exit 0
} catch {
    Write-Log "Error durante el proceso de backup: $_" "ERROR"
    # Si se creó un archivo parcial, eliminarlo
    if (Test-Path $backupPath) {
        Remove-Item $backupPath -Force
    }
    exit 1
}
