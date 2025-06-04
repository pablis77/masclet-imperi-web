# Script para diagnosticar y arreglar problemas con el servidor API
# Uso: .\fix_api_server.ps1 -EC2_IP "108.129.139.119" -PEM_PATH "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🔍 DIAGNÓSTICO Y REPARACIÓN DEL SERVIDOR API" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Iniciando diagnóstico en servidor: $EC2_IP" -ForegroundColor Yellow

# 1. Verificar conexión SSH
Write-Host "`n🔑 Verificando conexión SSH..." -ForegroundColor Yellow
$sshTest = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "echo Conexión SSH exitosa"
if (-not $?) {
    Write-Host "❌ Error en conexión SSH. Verifica IP y clave PEM." -ForegroundColor Red
    exit 1
}

# 2. Verificar estado de Docker y contenedores
Write-Host "`n📦 Verificando estado de contenedores Docker..." -ForegroundColor Yellow
$dockerPs = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker ps -a"
Write-Host $dockerPs -ForegroundColor Gray

# 3. Verificar logs del contenedor API
Write-Host "`n📝 Verificando logs del contenedor API (últimas 30 líneas)..." -ForegroundColor Yellow
$apiLogs = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker logs masclet-api --tail 30 2>&1"
Write-Host $apiLogs -ForegroundColor Gray

# 4. Verificar configuración nginx
Write-Host "`n🔧 Verificando configuración nginx..." -ForegroundColor Yellow
$nginxConfig = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo 'No se pudo acceder a la configuración de nginx'"
Write-Host $nginxConfig -ForegroundColor Gray

# 5. Revisar configuración de la API en el backend
Write-Host "`n🔧 Verificando configuración de la API en backend..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker exec masclet-api ls -la /app/app/core/ 2>/dev/null || echo 'No se pudo acceder al directorio core'"
$apiConfig = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker exec masclet-api cat /app/app/core/auth.py 2>/dev/null || echo 'No se pudo acceder a auth.py'"
Write-Host $apiConfig -ForegroundColor Gray

# 6. Verificar si hay error en el servidor
Write-Host "`n🧪 Verificando si hay errores en el servidor..." -ForegroundColor Yellow
$errorCheck = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "curl -s http://localhost:8000/api/v1/health 2>&1 || echo 'Error al acceder a la API'"
Write-Host "Respuesta API Health: $errorCheck" -ForegroundColor Gray

# 7. Corregir problemas detectados
Write-Host "`n🔧 Iniciando corrección de problemas..." -ForegroundColor Yellow

# 7.1 Reiniciar contenedor API
Write-Host "   - Reiniciando contenedor API..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker restart masclet-api"

# 7.2 Verificar si es necesario corregir la configuración de Nginx
Write-Host "   - Verificando si es necesario corregir configuración de Nginx..." -ForegroundColor Yellow
$needToFixNginx = $nginxConfig -match "api/api" -or $nginxConfig -match "api/v1/api"
if ($needToFixNginx) {
    Write-Host "   - Se detectó duplicación de rutas API en Nginx. Corrigiendo..." -ForegroundColor Red
    
    # Crear archivo de configuración corregido temporalmente
    $tempConfigFile = "$env:TEMP\nginx_fixed.conf"
    $nginxConfig -replace "api/api", "api" -replace "api/v1/api", "api/v1" | Out-File -FilePath $tempConfigFile -Encoding utf8
    
    # Transferir archivo corregido al servidor
    & scp -i "$PEM_PATH" $tempConfigFile "ec2-user@${EC2_IP}:/home/ec2-user/fixed_nginx.conf"
    
    # Aplicar la corrección
    ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker cp /home/ec2-user/fixed_nginx.conf masclet-frontend:/etc/nginx/conf.d/default.conf && sudo docker restart masclet-frontend"
    
    Write-Host "   - Configuración de Nginx corregida y contenedor reiniciado" -ForegroundColor Green
}

# 7.3 Verificar y corregir prefijos de API en el archivo de configuración frontend
Write-Host "   - Verificando configuración de rutas API en frontend..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP @"
if [ -f /home/ec2-user/masclet-imperi/frontend/src/config.js ]; then
    echo "Archivo config.js encontrado. Verificando rutas API..."
    grep -A 3 "API_URL" /home/ec2-user/masclet-imperi/frontend/src/config.js
else
    echo "No se encontró el archivo config.js"
fi
"@

# 8. Esperar a que los servicios estén disponibles de nuevo
Write-Host "`n⏳ Esperando a que los servicios estén disponibles (15 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 9. Verificar si la API responde ahora
Write-Host "`n🧪 Verificando si la API responde ahora..." -ForegroundColor Yellow
$newCheck = ssh -i "$PEM_PATH" ec2-user@$EC2_IP @"
echo "Verificando ruta /api/v1/health:"
curl -s http://localhost:8000/api/v1/health || echo "Error al acceder a la API"
echo ""
echo "Verificando ruta /api/v1/animales:"
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzQ4Nzk5NTM1fQ.iPU2XxCDoSun8_1f5GZd0i6_Du_u1IK9b1J2zv2_j74" http://localhost:8000/api/v1/animales || echo "Error al acceder a la API"
"@
Write-Host $newCheck -ForegroundColor Gray

# 10. Resumen y recomendaciones
Write-Host "`n✅ RESUMEN DEL DIAGNÓSTICO Y REPARACIÓN" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

if ($newCheck -match "Error") {
    Write-Host "❌ La API sigue sin responder correctamente después de las correcciones." -ForegroundColor Red
    Write-Host "Recomendaciones:" -ForegroundColor Yellow
    Write-Host "1. Verificar los logs del contenedor para más detalles" -ForegroundColor Yellow
    Write-Host "2. Puede ser necesario reconstruir el contenedor de la API" -ForegroundColor Yellow
    Write-Host "3. Ejecuta: sudo docker exec -it masclet-api bash para entrar al contenedor y verificar configuración" -ForegroundColor Yellow
} else {
    Write-Host "✅ La API ahora responde correctamente." -ForegroundColor Green
    Write-Host "Recomendaciones:" -ForegroundColor Yellow
    Write-Host "1. Ejecutar el script de diagnóstico para verificar que todo funciona" -ForegroundColor Yellow
    Write-Host "2. Verificar que el frontend puede conectarse a la API correctamente" -ForegroundColor Yellow
}

Write-Host "`nScript de diagnóstico y reparación completado." -ForegroundColor Cyan
