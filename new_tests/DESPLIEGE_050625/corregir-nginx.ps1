# Corregir configuración Nginx para conexión con API backend
# Autor: Equipo Masclet Imperi

Write-Host "🔧 Corrigiendo configuración de proxy en Nginx..." -ForegroundColor Green

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear un script para corregir la configuración
$fixNginxScript = @'
#!/bin/sh
set -e

echo "Creando copia de seguridad de la configuración actual..."
docker exec masclet-frontend cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak

echo "Actualizando configuración de Nginx..."
docker exec masclet-frontend sed -i 's/http:\/\/masclet-backend:8000/http:\/\/masclet-api:8000/g' /etc/nginx/conf.d/default.conf

echo "Verificando cambios..."
docker exec masclet-frontend grep -A 2 "proxy_pass" /etc/nginx/conf.d/default.conf

echo "Recargando configuración de Nginx..."
docker exec masclet-frontend nginx -s reload

echo "Configuración actualizada y recargada correctamente."
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$fixNginxScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/fix-nginx.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "Configurando permisos y ejecutando script..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/fix-nginx.sh && sh /tmp/fix-nginx.sh"

Write-Host "Verificando estado final del contenedor..." -ForegroundColor Cyan  
ssh -i $KEY_PATH $SERVER "docker ps -a --filter name=masclet-frontend"

Write-Host "✅ Proceso completado. Ahora la web debería mostrar los datos correctamente." -ForegroundColor Green
Write-Host "Por favor, recarga la página del navegador para ver los cambios." -ForegroundColor Yellow
