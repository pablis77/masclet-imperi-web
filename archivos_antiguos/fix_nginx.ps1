param (
    [string]$EC2_IP = "108.129.139.119",
    [string]$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
)

Write-Host "🔧 Creando archivo de configuración..." -ForegroundColor Yellow

$config = @"
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

$config | Out-File -FilePath "nginx.conf" -Encoding utf8

Write-Host "📤 Subiendo configuración..." -ForegroundColor Yellow
& scp -i "$PEM_PATH" nginx.conf ec2-user@$EC2_IP`:/tmp/nginx.conf

Write-Host "🔄 Aplicando configuración..." -ForegroundColor Yellow
& ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker cp /tmp/nginx.conf masclet-frontend:/etc/nginx/conf.d/default.conf && sudo docker exec masclet-frontend nginx -t && sudo docker exec masclet-frontend nginx -s reload"

Remove-Item -Path "nginx.conf" -Force

Write-Host "✅ Configuración aplicada. Ahora prueba el login en la aplicación." -ForegroundColor Green
