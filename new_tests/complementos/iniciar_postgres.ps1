# Script para iniciar el contenedor PostgreSQL de Masclet Imperi
# Ejecutar este script cuando se reinicie el equipo para garantizar que la base de datos esté disponible

Write-Host "=== INICIANDO CONTENEDOR POSTGRESQL PARA MASCLET IMPERI ===" -ForegroundColor Green

# Verificar si el contenedor existe
$container_exists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "masclet-db-new" -Quiet

if (-not $container_exists) {
    Write-Host "¡ERROR! No se encontró el contenedor 'masclet-db-new'" -ForegroundColor Red
    Write-Host "Asegúrate de que el contenedor exista. Revisa la documentación de configuración." -ForegroundColor Yellow
    exit 1
}

# Verificar si el contenedor ya está en ejecución
$is_running = docker ps --format "{{.Names}}" | Select-String -Pattern "masclet-db-new" -Quiet

if ($is_running) {
    Write-Host "El contenedor 'masclet-db-new' ya está en ejecución." -ForegroundColor Cyan
} else {
    Write-Host "Iniciando contenedor 'masclet-db-new'..." -ForegroundColor Yellow
    docker start masclet-db-new
    
    # Esperar a que el contenedor esté listo (5 segundos)
    Write-Host "Esperando a que el contenedor esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Verificar la conexión PostgreSQL
Write-Host "Verificando conexión a PostgreSQL..." -ForegroundColor Yellow
$pg_ready = docker exec -it masclet-db-new pg_isready -h localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexión establecida: PostgreSQL está aceptando conexiones" -ForegroundColor Green
} else {
    Write-Host "❌ Error al conectar con PostgreSQL. Código de salida: $LASTEXITCODE" -ForegroundColor Red
}

# Mostrar información del contenedor
Write-Host "`n=== INFORMACIÓN DEL CONTENEDOR ===" -ForegroundColor Green
docker ps --filter "name=masclet-db-new" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar el tamaño de la base de datos
Write-Host "`n=== TAMAÑO DE LA BASE DE DATOS ===" -ForegroundColor Green
$db_size = docker exec -it masclet-db-new psql -U postgres -d masclet_imperi -t -c "SELECT pg_size_pretty(pg_database_size('masclet_imperi')) as db_size;"
Write-Host "Tamaño de la base de datos: $db_size" -ForegroundColor Cyan

Write-Host "`n¡Contenedor PostgreSQL listo para usar!" -ForegroundColor Green
Write-Host "Ahora puedes iniciar la aplicación con:" -ForegroundColor Yellow
Write-Host "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload" -ForegroundColor White
