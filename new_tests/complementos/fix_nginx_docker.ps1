# Script rápido para corregir configuración Nginx dentro del contenedor Docker
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

# 1. Conectar y verificar la configuración actual de Nginx
Write-Host "🔍 Verificando configuración actual..." -ForegroundColor Cyan
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf" | Out-File -FilePath "./current_nginx.conf" -Encoding utf8

# 2. Crear nueva configuración con proxy_pass corregido
Write-Host "📝 Creando nueva configuración..." -ForegroundColor Yellow
$nginxConfig = @"
server {
    listen 80;
    server_name _;
    
    # Nginx status endpoint
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
    
    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy - CORREGIDO: usar masclet-api en lugar de localhost
    location /api/ {
        proxy_pass http://masclet-api:8000/api/v1/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
"@

# 3. Guardar nueva configuración en archivo temporal
$configFile = New-TemporaryFile
$nginxConfig | Out-File -FilePath $configFile -Encoding utf8

# 4. Transferir archivo al servidor
Write-Host "📤 Transfiriendo configuración al servidor..." -ForegroundColor Yellow
$scpCommand = "scp -i `"$PEM_PATH`" `"$configFile`" ec2-user@${EC2_IP}:/tmp/new_nginx.conf"
Invoke-Expression $scpCommand

# 5. Copiar archivo al contenedor y reiniciar Nginx
Write-Host "🔄 Aplicando configuración y reiniciando Nginx..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP @"
docker cp /tmp/new_nginx.conf masclet-frontend:/etc/nginx/conf.d/default.conf
docker exec masclet-frontend nginx -t
docker exec masclet-frontend nginx -s reload
"@

# 6. Verificar configuración aplicada
Write-Host "✅ Verificando configuración aplicada..." -ForegroundColor Green
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf"

# 7. Limpiar archivo temporal
Remove-Item -Path $configFile -Force

Write-Host "`n✅ Corrección aplicada. Ahora prueba el login en la aplicación." -ForegroundColor Green
