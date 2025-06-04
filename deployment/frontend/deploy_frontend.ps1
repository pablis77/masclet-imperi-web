# Script para desplegar el frontend de Masclet Imperi
# Ejecutar desde el directorio raíz del proyecto

# Variables de configuración
$IMAGE_NAME = "masclet-frontend"
$IMAGE_TAG = "latest"
$CONTAINER_NAME = "masclet-frontend"
$NETWORK_NAME = "masclet-network"
$PORT = 80

# Asegurar que estamos en el directorio correcto
Write-Host "🔍 Verificando ubicación del proyecto..." -ForegroundColor Cyan
if (-not (Test-Path ".\frontend\dist")) {
    Write-Host "❌ ERROR: No se encontró el directorio de build. Ejecute primero 'npm run build' en el directorio frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Directorio de build verificado correctamente" -ForegroundColor Green

# Construir la imagen Docker
Write-Host "🔧 Construyendo imagen Docker del frontend..." -ForegroundColor Cyan
docker build -f deployment/frontend/Dockerfile.frontend.optimized -t "${IMAGE_NAME}:${IMAGE_TAG}" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: No se pudo construir la imagen Docker" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Imagen Docker construida correctamente" -ForegroundColor Green

# Verificar si existe la red masclet-network
Write-Host "🔍 Verificando red Docker 'masclet-network'..." -ForegroundColor Cyan
$networkExists = docker network ls --filter name=$NETWORK_NAME --format '{{.Name}}' | Select-String -Pattern $NETWORK_NAME
if (-not $networkExists) {
    Write-Host "⚠️ La red '$NETWORK_NAME' no existe. Creándola..." -ForegroundColor Yellow
    docker network create $NETWORK_NAME
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: No se pudo crear la red Docker" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Red Docker creada correctamente" -ForegroundColor Green
} else {
    Write-Host "✅ La red '$NETWORK_NAME' ya existe" -ForegroundColor Green
}

# Eliminar el contenedor anterior si existe
Write-Host "🔍 Verificando si existe un contenedor anterior..." -ForegroundColor Cyan
$containerExists = docker ps -a --filter name=$CONTAINER_NAME --format '{{.Names}}' | Select-String -Pattern $CONTAINER_NAME
if ($containerExists) {
    Write-Host "⚠️ Eliminando contenedor anterior '$CONTAINER_NAME'..." -ForegroundColor Yellow
    docker rm -f $CONTAINER_NAME
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: No se pudo eliminar el contenedor anterior" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Contenedor anterior eliminado correctamente" -ForegroundColor Green
}

# Desplegar el nuevo contenedor
Write-Host "🚀 Desplegando nuevo contenedor frontend..." -ForegroundColor Cyan
docker run -d --name $CONTAINER_NAME `
    --network $NETWORK_NAME `
    -p "${PORT}:80" `
    -e "NODE_ENV=production" `
    -e "BACKEND_URL=http://masclet-api:8000" `
    -e "API_PREFIX=" `
    --restart unless-stopped `
    "${IMAGE_NAME}:${IMAGE_TAG}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: No se pudo desplegar el contenedor" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Contenedor desplegado correctamente" -ForegroundColor Green

# Verificar que el contenedor está ejecutándose
Write-Host "🔍 Verificando estado del contenedor..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
$containerRunning = docker ps --filter name=$CONTAINER_NAME --format '{{.Status}}' | Select-String -Pattern "Up"
if (-not $containerRunning) {
    Write-Host "❌ ERROR: El contenedor no está en ejecución. Verificando logs..." -ForegroundColor Red
    docker logs $CONTAINER_NAME
    exit 1
}
Write-Host "✅ Contenedor ejecutándose correctamente" -ForegroundColor Green

# Mostrar información de acceso
Write-Host "`n🎉 ¡Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "`n📋 Información del despliegue:" -ForegroundColor Cyan
Write-Host "   - Frontend disponible en: http://localhost:$PORT" -ForegroundColor White
Write-Host "   - Contenedor: $CONTAINER_NAME" -ForegroundColor White
Write-Host "   - Red Docker: $NETWORK_NAME" -ForegroundColor White
Write-Host "   - Backend conectado a: http://masclet-api:8000" -ForegroundColor White
Write-Host "`n📌 Para verificar los logs: docker logs $CONTAINER_NAME" -ForegroundColor Cyan
