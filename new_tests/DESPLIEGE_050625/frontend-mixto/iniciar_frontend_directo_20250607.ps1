# =========================================================================
# Script para iniciar directamente los contenedores del frontend
# Fecha: 07/06/2025
# =========================================================================
# Este script inicia los contenedores del frontend con comandos directos
# 
# IMPORTANTE: Este script asume que:
# 1. Las imágenes del frontend ya están en el servidor
# 2. La red Docker masclet-network ya existe
# 3. La API y la base de datos ya están funcionando
# =========================================================================

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

# Detener y eliminar contenedores anteriores del frontend si existen
Write-Host "Limpiando contenedores anteriores del frontend..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker stop masclet-frontend masclet-frontend-node || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-frontend masclet-frontend-node || true"

# Iniciar el contenedor de Node.js para SSR
Write-Host "Iniciando contenedor de Node.js para SSR..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip 'docker run -d --name masclet-frontend-node --network masclet-network -e NODE_ENV=production -e API_URL=http://34.253.203.194:8000 --restart unless-stopped masclet-imperi-web-deploy-masclet-frontend-node:latest'

# Esperar un momento para que el contenedor Node se inicie
Write-Host "Esperando a que el contenedor Node se inicie..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Iniciar el contenedor de Nginx como proxy inverso
Write-Host "Iniciando contenedor de Nginx..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip 'docker run -d --name masclet-frontend --network masclet-network -p 80:80 --restart unless-stopped masclet-imperi-web-deploy-masclet-frontend-nginx:latest'

# Verificar que todos los contenedores estén funcionando
Write-Host "Verificando que todos los contenedores estén funcionando..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
ssh -i $key ec2-user@$host_ip "docker ps -a"

# Ver los logs para diagnóstico
Write-Host "Logs del contenedor Node.js..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker logs masclet-frontend-node 2>&1 | tail -20 || echo 'No hay logs disponibles'"

Write-Host "Logs del contenedor Nginx..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker logs masclet-frontend 2>&1 | tail -20 || echo 'No hay logs disponibles'"

Write-Host "============================================================" -ForegroundColor Green
Write-Host "Frontend INICIADO" -ForegroundColor Green
Write-Host "Si todos los contenedores aparecen como 'Up', el despliegue ha sido exitoso." -ForegroundColor Green
Write-Host "Puedes acceder al frontend en: http://$host_ip" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
