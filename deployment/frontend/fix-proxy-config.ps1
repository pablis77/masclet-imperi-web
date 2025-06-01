# Script para corregir la configuración de proxy en el servidor
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

# Variables de entorno
$NGINX_CONFIG="/etc/nginx/conf.d/default.conf"
$BACKUP_DIR="/root/backups"
$DATE=$(Get-Date -Format "yyyyMMdd_HHmmss")

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# 1. Crear directorio de backup si no existe
Write-ColorText "🔄 Creando directorio de backup..." "Cyan"
# Asegurar que la ruta PEM se escape correctamente para espacios
$PemPathEscaped = $PEM_PATH -replace ' ', '\ '
$sshMkdirCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo mkdir -p $BACKUP_DIR'"
Invoke-Expression $sshMkdirCommand

# 2. Hacer copia de seguridad de archivos importantes
Write-ColorText "💾 Haciendo backup de la configuración actual..." "Cyan"
$sshBackupCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo cp $NGINX_CONFIG $BACKUP_DIR/nginx_$DATE.conf'"
Invoke-Expression $sshBackupCommand

# 3. Corregir configuración de proxy en Nginx
Write-ColorText "🔧 Actualizando configuración de proxy Nginx..." "Yellow"
$nginxConfig = @"
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Redirect all API calls to the backend
    location /api/ {
        # Usar localhost:8000 en lugar de masclet-api
        proxy_pass http://localhost:8000/api/v1/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Serve frontend static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
"@

# Escribir configuración a un archivo temporal
$tempFile = New-TemporaryFile
$nginxConfig | Out-File -FilePath $tempFile -Encoding utf8

# Transferir y aplicar configuración
$scpConfigCommand = "scp -i `"$PEM_PATH`" '$tempFile' ec2-user@${EC2_IP}:/tmp/nginx.conf"
Invoke-Expression $scpConfigCommand

$sshApplyCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo cp /tmp/nginx.conf $NGINX_CONFIG'"
Invoke-Expression $sshApplyCommand

# Eliminar archivo temporal
Remove-Item -Path $tempFile

# 4. Reiniciar Nginx para aplicar cambios
Write-ColorText "🔄 Reiniciando Nginx..." "Yellow"
$sshRestartCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo systemctl restart nginx'"
Invoke-Expression $sshRestartCommand

# 5. Mostrar verificación de cambios
Write-ColorText "✅ Configuración de Nginx actualizada. Verificando cambios..." "Green"
$sshVerifyCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo cat $NGINX_CONFIG'"
Invoke-Expression $sshVerifyCommand

Write-ColorText "`n🔄 Reiniciando servicios web..." "Yellow"
# 6. Reiniciar todos los servicios web para asegurar coherencia
$sshRestartAllCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo systemctl restart nginx && sudo docker-compose restart'"
Invoke-Expression $sshRestartAllCommand

Write-ColorText "`n✅ Cambios aplicados. Verifica ahora la aplicación en el navegador." "Green"
