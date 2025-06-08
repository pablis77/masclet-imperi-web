# fix-healthcheck-simple.ps1
# Script simplificado para corregir el healthcheck del contenedor frontend
# Fecha: 07/06/2025

Write-Host "🔧 Corrigiendo healthcheck del contenedor frontend..." -ForegroundColor Green

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"
$CONTAINER_NAME = "masclet-frontend-node"

# 1. Verificar estado actual
Write-Host "1. Estado actual del contenedor:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker ps -a --filter name=$CONTAINER_NAME"

# 2. Crear un simple script de actualización en un solo bloque
$updateScript = @'
#!/bin/sh
set -e

echo "Deteniendo contenedor actual..."
docker stop masclet-frontend-node

echo "Guardando configuración como imagen..."
docker commit masclet-frontend-node masclet-frontend-node-fixed

echo "Eliminando contenedor actual..."
docker rm masclet-frontend-node

echo "Creando nuevo contenedor con healthcheck al backend..."
docker run -d --name masclet-frontend-node \
  --network masclet-network \
  --health-cmd "curl -f http://masclet-api:8000/api/v1/health || exit 1" \
  --health-interval=30s \
  --health-timeout=5s \
  --health-start-period=10s \
  --health-retries=3 \
  -p 3000:3000 \
  -e API_URL="http://masclet-api:8000" \
  -e API_PREFIX="/api/v1" \
  masclet-frontend-node-fixed

echo "Esperando 5 segundos para verificar el estado..."
sleep 5

echo "Estado del contenedor actualizado:"
docker ps -a --filter name=masclet-frontend-node
'@

# 3. Transferir y ejecutar el script - con tratamiento especial para finales de línea
$tempFile = New-TemporaryFile
$updateScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF) usando tr
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/fix-healthcheck.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "2. Ejecutando script de corrección en el servidor..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/fix-healthcheck.sh && /tmp/fix-healthcheck.sh"

# 4. Verificar el estado del healthcheck
Write-Host "3. Verificando estado final del healthcheck..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
ssh -i $KEY_PATH $SERVER "docker ps -a --filter name=$CONTAINER_NAME"
ssh -i $KEY_PATH $SERVER "docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME"

# 5. Verificar que la comunicación sigue funcionando
Write-Host "4. Verificando comunicación entre contenedores..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME curl -s http://masclet-api:8000/api/v1/health"

Write-Host "✅ Proceso completado. Verifica el estado del healthcheck." -ForegroundColor Green
