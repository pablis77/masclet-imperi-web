# Script de backup programado para Masclet Imperi
# Este script se puede programar para ejecutarse automáticamente en el Programador de tareas de Windows
# o como tarea programada en un entorno AWS
#
# Uso:
#   - Para backup diario (2:00 AM): ./backup_programado.ps1
#   - Para backup tras cambios: ./backup_programado.ps1 -AfterChange
#
# Configuración recomendada para AWS:
#   - Tarea programada en EC2 o mediante EventBridge
#   - Los backups se pueden almacenar en EFS y/o S3

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
$dayOfWeek = (Get-Date).DayOfWeek

# Si es domingo (DayOfWeek = 0) y no es tras un cambio, hacemos backup semanal
$backupType = if ($AfterChange) { 
    "cambio-sistema" 
} elseif ($dayOfWeek -eq 0) { 
    "semanal" 
} else { 
    "diario-auto" 
}

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
    docker exec masclet-db-new pg_dump -U $dbUser $dbName | Out-File -FilePath $backupPath -Encoding utf8
    
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
    
    # Limpiar backups antiguos según nuestro protocolo
    # Mantener los últimos 7 backups diarios y los últimos 7 backups semanales
    $maxDailyBackups = 7
    $maxWeeklyBackups = 7
    
    # Separar backups por tipo
    $dailyBackups = Get-ChildItem -Path $backupDir -Filter "backup_masclet_imperi_*_diario-auto.sql" | 
                   Sort-Object -Property LastWriteTime -Descending
    
    $weeklyBackups = Get-ChildItem -Path $backupDir -Filter "backup_masclet_imperi_*_semanal.sql" | 
                    Sort-Object -Property LastWriteTime -Descending
    
    $changeBackups = Get-ChildItem -Path $backupDir -Filter "backup_masclet_imperi_*_cambio-sistema.sql" | 
                    Sort-Object -Property LastWriteTime -Descending
    
    Write-Log "Backups encontrados: $($dailyBackups.Count) diarios, $($weeklyBackups.Count) semanales, $($changeBackups.Count) por cambios"
    
    # Mantener solo los backups más recientes según el tipo
    # Limpiar backups diarios excedentes
    if ($dailyBackups.Count -gt $maxDailyBackups) {
        $dailyToDelete = $dailyBackups.Count - $maxDailyBackups
        Write-Log "Limpiando $dailyToDelete backups diarios antiguos..."
        
        $dailyBackups | Select-Object -Last $dailyToDelete | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Log "Backup diario antiguo eliminado: $($_.Name)"
        }
    }
    
    # Limpiar backups semanales excedentes
    if ($weeklyBackups.Count -gt $maxWeeklyBackups) {
        $weeklyToDelete = $weeklyBackups.Count - $maxWeeklyBackups
        Write-Log "Limpiando $weeklyToDelete backups semanales antiguos..."
        
        $weeklyBackups | Select-Object -Last $weeklyToDelete | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Log "Backup semanal antiguo eliminado: $($_.Name)"
        }
    }
    
    # Limpiar backups por cambios excedentes (mantener solo los 5 más recientes)
    $maxChangeBackups = 5
    if ($changeBackups.Count -gt $maxChangeBackups) {
        $changeToDelete = $changeBackups.Count - $maxChangeBackups
        Write-Log "Limpiando $changeToDelete backups por cambios antiguos..."
        
        $changeBackups | Select-Object -Last $changeToDelete | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Log "Backup por cambios antiguo eliminado: $($_.Name)"
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
