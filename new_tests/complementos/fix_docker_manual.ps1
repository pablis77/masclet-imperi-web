# Script para corregir la configuración de Nginx manualmente
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🔍 Verificando estado actual..." -ForegroundColor Cyan
$comando = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'docker ps'"
Invoke-Expression $comando

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
$scpCommand = "scp -i `"$PEM_PATH`" `"$configFile`" ec2-user@${EC2_IP}:/home/ec2-user/nginx.conf"
Invoke-Expression $scpCommand

# Crear el volumen manualmente y montar la configuración
Write-Host "🔧 Aplicando configuración manualmente..." -ForegroundColor Yellow
$sshCommands = @"
# Crear directorio de configuración si no existe
mkdir -p /home/ec2-user/nginx_config

# Copiar el archivo de configuración
cp /home/ec2-user/nginx.conf /home/ec2-user/nginx_config/default.conf

# Copiar el archivo de docker-compose para edición
cd /home/ec2-user/masclet-imperi
cp docker-compose.frontend.yml docker-compose.frontend.yml.bak

# Intentar reemplazar el contenedor Nginx con la nueva configuración
docker stop masclet-frontend || true
docker rm masclet-frontend || true

# Iniciar contenedor Nginx con el volumen montado manualmente
docker run -d --name masclet-frontend \\
  --network masclet-network \\
  -p 80:80 \\
  -v /home/ec2-user/nginx_config:/etc/nginx/conf.d:ro \\
  --restart unless-stopped \\
  nginx:alpine

# Verificar logs
echo "Verificando logs de Nginx:"
sleep 2
docker logs --tail 10 masclet-frontend
"@

$sshCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP '$sshCommands'"
Invoke-Expression $sshCommand

# Limpiar archivos temporales
Remove-Item -Path $configFile -Force

# Verificar la configuración final
Write-Host "`n✅ Verificando configuración final..." -ForegroundColor Green
$comando = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf'"
Invoke-Expression $comando

Write-Host "`n✅ Configuración aplicada." -ForegroundColor Green
Write-Host "   Prueba el login en http://$EC2_IP/" -ForegroundColor Cyan
