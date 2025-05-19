$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "C:\Proyectos\claude\masclet-imperi-web\backend\backups"
$backupFile = "$backupPath\backup_masclet_imperi_$timestamp.sql"

# Crear directorio de backups si no existe
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-Host "Directorio de backups creado: $backupPath"
}

# Verificar que el contenedor de la base de datos está activo
$dbRunning = docker ps --filter "name=masclet-db" --format "{{.Names}}"
if (-not $dbRunning) {
    Write-Host "ERROR: El contenedor masclet-db no está en ejecución. Intentando iniciar..."
    docker start masclet-db
    Start-Sleep -Seconds 10
}

# Ejecutar backup
Write-Host "Iniciando backup de base de datos a $backupFile..."
docker exec masclet-db pg_dump -U postgres -d masclet_imperi > $backupFile

# Verificar que el backup se ha creado correctamente
if (Test-Path $backupFile) {
    $backupSize = (Get-Item $backupFile).Length / 1MB
    Write-Host "✅ Backup completado: $backupFile ($($backupSize.ToString('0.00')) MB)"
    
    # Verificar contenido mínimo del backup
    $backupContent = Get-Content $backupFile -First 100 -ErrorAction SilentlyContinue
    if ($backupContent -match "CREATE TABLE" -or $backupContent -match "PostgreSQL database dump") {
        Write-Host "✅ Verificación de contenido: OK"
    } else {
        Write-Host "⚠️ ADVERTENCIA: El archivo de backup podría estar vacío o corrupto."
    }
} else {
    Write-Host "❌ ERROR: No se pudo crear el archivo de backup."
    exit 1
}

Write-Host "Proceso de backup completado. Ahora es seguro proceder con la optimización."
