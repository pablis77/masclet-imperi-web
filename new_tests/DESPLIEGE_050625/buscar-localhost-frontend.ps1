# buscar-localhost-frontend.ps1
# Script para buscar y listar todas las referencias a "localhost" en el contenedor frontend
# Fecha: 07/06/2025
# Autor: Equipo de Despliegue Masclet Imperi Web

Write-Host "🔍 Buscando referencias a 'localhost' en contenedor frontend Node.js..." -ForegroundColor Green

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"
$CONTAINER_NAME = "masclet-frontend-node"

# 1. Buscar archivos con referencias a localhost
Write-Host "1. Buscando archivos JavaScript/TypeScript con referencias a 'localhost'..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME find /app -type f -name '*.js' -o -name '*.ts' -o -name '*.jsx' -o -name '*.tsx' -o -name '*.json' | xargs grep -l 'localhost' 2>/dev/null || echo 'No se encontraron archivos con localhost'"

# 2. Buscar en archivos de configuración
Write-Host "2. Buscando en archivos de configuración..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME find /app -type f -name '*.conf' -o -name '*.config' -o -name '*.env*' -o -name 'conf*' | xargs grep -l 'localhost' 2>/dev/null || echo 'No se encontraron archivos de configuración con localhost'"

# 3. Buscar configuraciones específicas relevantes para healthcheck
Write-Host "3. Revisando configuración de healthcheck en Dockerfile o scripts de inicio..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker inspect $CONTAINER_NAME | grep -A 5 Healthcheck"

# 4. Listar variables de entorno para identificar configuraciones de API y servicios
Write-Host "4. Verificando variables de entorno..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME env | grep -i 'api\|host\|url\|server\|endpoint'"

# 5. Revisar los archivos de configuración principales
Write-Host "5. Contenido de los archivos de configuración de API (si existen)..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME ls -la /app/src/config 2>/dev/null || echo 'No existe directorio /app/src/config'"
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME cat /app/src/config/apiConfig.ts 2>/dev/null || echo 'No existe archivo apiConfig.ts'"
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME cat /app/src/config/api.ts 2>/dev/null || echo 'No existe archivo api.ts'"

# 6. Revisar los scripts personalizados que gestionan la configuración de API
Write-Host "6. Revisando scripts de Docker para configuración de API..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME find /app -name 'docker-api*' 2>/dev/null || echo 'No se encontraron scripts docker-api*'"
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME cat /app/docker-api-config.js 2>/dev/null || echo 'No existe archivo docker-api-config.js'"

# 7. Revisar startup.sh para ver cómo se inicia la aplicación
Write-Host "7. Verificando script de inicio..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME cat /app/startup.sh 2>/dev/null || echo 'No existe archivo startup.sh'"

# 8. Ejecutar un comando curl al servidor en el puerto de la aplicación para ver qué responde
Write-Host "8. Verificando la respuesta de la aplicación a una solicitud básica..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME curl -s http://localhost:3000/ | head -20"

Write-Host "✅ Análisis de referencias a localhost completado" -ForegroundColor Green
Write-Host "⚠️  Recomendación: Modificar el healthcheck en la configuración Docker para que apunte a un endpoint existente" -ForegroundColor Yellow
