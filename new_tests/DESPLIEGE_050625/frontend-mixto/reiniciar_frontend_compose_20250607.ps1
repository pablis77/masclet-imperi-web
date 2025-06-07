# =========================================================================
# Script para reiniciar el frontend de Masclet Imperi Web en AWS usando docker-compose
# Fecha: 07/06/2025
# =========================================================================
# Este script copia el archivo docker-compose modificado al servidor AWS
# y lo ejecuta para iniciar los contenedores del frontend.
# 
# IMPORTANTE: Este script asume que:
# 1. Las imágenes del frontend ya están en el servidor
# 2. La red Docker masclet-network ya existe
# 3. La API y la base de datos ya están funcionando
# =========================================================================

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"
$compose_file = "docker-compose-aws-20250607.yml"

# Copiar el archivo docker-compose al servidor
Write-Host "Copiando archivo docker-compose al servidor..." -ForegroundColor Yellow
# En PowerShell, usamos un enfoque diferente para evitar problemas con el carácter ':'
$destino = "ec2-user@" + $host_ip + ":/home/ec2-user/docker-compose.yml"
scp -i $key $compose_file $destino

# Detener y eliminar contenedores anteriores del frontend si existen
Write-Host "Limpiando contenedores anteriores del frontend..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker stop masclet-frontend masclet-frontend-node || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-frontend masclet-frontend-node || true"

# Iniciar los contenedores con docker-compose
Write-Host "Iniciando contenedores con docker-compose..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip "docker compose up -d"

# Verificar que todos los contenedores estén funcionando
Write-Host "Esperando 5 segundos para que los contenedores se inicien..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Write-Host "Verificando que todos los contenedores estén funcionando..." -ForegroundColor Cyan
ssh -i $key ec2-user@$host_ip "docker ps -a"

# Verificar los logs del contenedor frontend-node
Write-Host "Logs del contenedor frontend-node..." -ForegroundColor Cyan
ssh -i $key ec2-user@$host_ip "docker logs masclet-frontend-node --tail 20 2>&1 || echo 'No se pudieron obtener logs'"

Write-Host "============================================================" -ForegroundColor Green
Write-Host "FRONTEND INICIADO" -ForegroundColor Green
Write-Host "Si todos los contenedores aparecen como 'Up', el despliegue ha sido exitoso." -ForegroundColor Green
Write-Host "Puedes acceder al frontend en: http://$host_ip" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
