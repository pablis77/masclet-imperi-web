# =========================================================================
# Script para iniciar el frontend de Masclet Imperi Web en AWS
# Fecha: 07/06/2025
# =========================================================================
# Este script inicia los contenedores del frontend usando las imágenes
# existentes en el servidor AWS. No realiza ninguna compilación.
# 
# IMPORTANTE: Este script asume que:
# 1. Las imágenes del frontend ya están en el servidor
# 2. La red Docker masclet-network ya existe
# 3. La API y la base de datos ya están funcionando
# =========================================================================

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

# Verificar imágenes disponibles
Write-Host "Verificando imágenes disponibles..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker images | grep masclet"

# Detener y eliminar contenedores anteriores del frontend si existen
Write-Host "Limpiando contenedores anteriores del frontend..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker stop masclet-frontend masclet-frontend-node || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-frontend masclet-frontend-node || true"

# Iniciar el contenedor de Node.js para SSR
Write-Host "Iniciando contenedor de Node.js para SSR..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-frontend-node --network masclet-network --restart unless-stopped masclet-imperi-web-deploy-masclet-frontend-node"

# Iniciar el contenedor de Nginx como proxy inverso
Write-Host "Iniciando contenedor de Nginx..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-frontend --network masclet-network -p 80:80 --restart unless-stopped --link masclet-frontend-node:masclet-frontend-node masclet-imperi-web-deploy-masclet-frontend-nginx"

# Verificar que todos los contenedores estén funcionando
Write-Host "Verificando que todos los contenedores estén funcionando..." -ForegroundColor Cyan
ssh -i $key ec2-user@$host_ip "docker ps -a"

Write-Host "============================================================" -ForegroundColor Green
Write-Host "FRONTEND INICIADO" -ForegroundColor Green
Write-Host "Si todos los contenedores aparecen como 'Up', el despliegue ha sido exitoso." -ForegroundColor Green
Write-Host "Puedes acceder al frontend en: http://$host_ip" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
