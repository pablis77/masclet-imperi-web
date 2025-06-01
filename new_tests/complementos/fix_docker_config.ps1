# Script para corregir la configuración de Docker Compose para incluir la ruta API
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🔍 Examinando configuración Docker Compose actual..." -ForegroundColor Cyan
$comando = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'cat /home/ec2-user/masclet-imperi/docker-compose.frontend.yml'"
Invoke-Expression $comando | Out-File -FilePath "./current_docker_compose.yml" -Encoding utf8

# Crear una nueva configuración Nginx
Write-Host "📝 Creando nueva configuración Nginx..." -ForegroundColor Yellow
$nginxConfig = @"
server {
    listen 80;
    server_name localhost;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API proxy - NUEVA RUTA PARA API
    location /api/ {
        proxy_pass http://masclet-api:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log;
}
"@

# Guardar configuración en archivo temporal
$configFile = New-TemporaryFile
$nginxConfig | Out-File -FilePath $configFile -Encoding utf8

# Transferir archivo al servidor
Write-Host "📤 Transfiriendo configuración al servidor..." -ForegroundColor Yellow
$scpCommand = "scp -i `"$PEM_PATH`" `"$configFile`" ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi/nginx.conf"
Invoke-Expression $scpCommand

# Crear un script para detener, modificar y reiniciar los contenedores
$deployScript = @"
#!/bin/bash
set -e

cd /home/ec2-user/masclet-imperi

echo "📦 Deteniendo contenedores frontend..."
docker-compose -f docker-compose.frontend.yml down

echo "🔧 Creando volumen para la configuración Nginx..."
mkdir -p ./nginx_config
cp ./nginx.conf ./nginx_config/default.conf

# Modificar docker-compose.frontend.yml para montar el archivo de configuración
if ! grep -q "nginx_config" docker-compose.frontend.yml; then
    echo "📝 Actualizando docker-compose.frontend.yml con volumen para Nginx..."
    sed -i '/masclet-frontend:/,/depends_on/s/volumes:/volumes:\n      - \.\\/nginx_config:\\/etc\\/nginx\\/conf.d:rw/' docker-compose.frontend.yml
fi

echo "▶️ Reiniciando contenedores con nueva configuración..."
docker-compose -f docker-compose.frontend.yml up -d

echo "✅ Esperando a que los servicios estén listos..."
sleep 5

echo "🔍 Verificando configuración aplicada..."
docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf

echo "🔍 Verificando logs de Nginx..."
docker logs --tail 10 masclet-frontend
"@

# Guardar script en archivo temporal
$scriptFile = New-TemporaryFile
$deployScript | Out-File -FilePath $scriptFile -Encoding utf8

# Transferir script al servidor
Write-Host "📤 Transfiriendo script de despliegue al servidor..." -ForegroundColor Yellow
$scpCommand = "scp -i `"$PEM_PATH`" `"$scriptFile`" ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi/fix_nginx.sh"
Invoke-Expression $scpCommand

# Ejecutar script en el servidor
Write-Host "🚀 Ejecutando script de corrección..." -ForegroundColor Cyan
$sshCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'chmod +x /home/ec2-user/masclet-imperi/fix_nginx.sh && /home/ec2-user/masclet-imperi/fix_nginx.sh'"
Invoke-Expression $sshCommand

# Limpiar archivos temporales
Remove-Item -Path $configFile -Force
Remove-Item -Path $scriptFile -Force

Write-Host "`n✅ Configuración aplicada." -ForegroundColor Green
Write-Host "   Prueba el login en http://$EC2_IP/" -ForegroundColor Cyan
