# Script de backup para Windows
$ErrorActionPreference = "Stop"

# Configuración
$DB_NAME = "masclet_imperi"
$DB_USER = "postgres"
$BACKUP_DIR = ".\backups\db"
$DATE = Get-Date -Format "yyyyMMdd"

Write-Host "🚀 Iniciando backup de prueba..."

# Crear directorio si no existe
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

# Backup diario (solo tablas principales)
$DAILY_BACKUP = "$BACKUP_DIR\daily_$DATE.sql"

Write-Host "📦 Realizando backup diario..."
docker exec masclet-db pg_dump -U $DB_USER -t animals -t parts $DB_NAME > $DAILY_BACKUP

# Comprimir backup
Write-Host "🗜️ Comprimiendo backup..."
Compress-Archive -Path $DAILY_BACKUP -DestinationPath "$DAILY_BACKUP.zip" -Force

# Verificaciones
Write-Host "🔍 Verificando backup..."

# Comprobar existencia
if (-not (Test-Path "$DAILY_BACKUP.zip")) {
    Write-Host "❌ Error: Backup no creado"
    exit 1
}

# Verificar tamaño
$size = (Get-Item "$DAILY_BACKUP.zip").Length
Write-Host "📊 Tamaño del backup: $size bytes"

if ($size -lt 100) {
    Write-Host "❌ Error: Backup sospechosamente pequeño"
    exit 1
}

# Intentar extraer para verificar integridad
try {
    Expand-Archive -Path "$DAILY_BACKUP.zip" -DestinationPath "$BACKUP_DIR\test" -Force
    Remove-Item -Path "$BACKUP_DIR\test" -Recurse -Force
    Write-Host "✅ Backup comprimido correctamente"
} catch {
    Write-Host "❌ Error: Archivo corrupto"
    exit 1
}

Write-Host "✅ Backup creado y verificado correctamente: $DAILY_BACKUP.zip"