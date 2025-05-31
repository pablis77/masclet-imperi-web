# Script de despliegue para el Frontend de Masclet Imperi en EC2
# Uso: .\deploy.ps1 -EC2_IP <ip-publica-ec2> -PEM_PATH <ruta-clave-pem>

param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🚀 Iniciando despliegue del FRONTEND en $EC2_IP..." -ForegroundColor Cyan

# 1. Verificar conexión SSH
Write-Host "🔑 Verificando conexión SSH..." -ForegroundColor Yellow
$sshTest = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "echo Conexion SSH exitosa"
if (-not $?) {
    Write-Host "❌ Error en conexión SSH. Verifica IP y clave PEM." -ForegroundColor Red
    exit 1
}

# 2. Crear directorios necesarios en EC2 (si no existen ya)
Write-Host "📁 Creando directorios para frontend..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "mkdir -p /home/ec2-user/masclet-imperi/frontend"

# 3. Copiar archivos de configuración
Write-Host "📦 Copiando archivos de configuración..." -ForegroundColor Yellow
scp -i "$PEM_PATH" "$(Get-Location)\docker-compose.prod.yml" "ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi/docker-compose.frontend.yml"
scp -i "$PEM_PATH" "$(Get-Location)\Dockerfile.prod" "ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi/frontend/Dockerfile"

# 4. Identificar la red Docker existente
Write-Host "🔍 Identificando red Docker..." -ForegroundColor Yellow
$DOCKER_NETWORK = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker network ls | grep masclet-imperi | awk '{print \`$2}'"
Write-Host "   Red Docker detectada: $DOCKER_NETWORK" -ForegroundColor Green

# 5. Detener y eliminar contenedor Frontend existente si existe
Write-Host "🛑 Deteniendo contenedor Frontend existente..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker stop masclet-frontend 2>/dev/null || true && sudo docker rm masclet-frontend 2>/dev/null || true"

# 6. Comprimir el código fuente del frontend
Write-Host "📦 Comprimiendo código fuente del frontend..." -ForegroundColor Yellow
$tempZip = "$(Get-Location)\frontend-temp.zip"
if (Test-Path $tempZip) {
    Remove-Item $tempZip -Force
}
Compress-Archive -Path "$((Get-Item -Path (Join-Path -Path $PSScriptRoot -ChildPath "..\..\frontend")).FullName)\*" -DestinationPath $tempZip -Force

# 7. Transferir código fuente a EC2
Write-Host "📤 Transfiriendo código fuente a EC2..." -ForegroundColor Yellow
scp -i "$PEM_PATH" $tempZip "ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi/frontend-temp.zip"
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "cd /home/ec2-user/masclet-imperi && unzip -o frontend-temp.zip -d frontend-source && rm frontend-temp.zip"

# 8. Construir y ejecutar el contenedor Frontend
Write-Host "🏗️ Construyendo nueva imagen Frontend..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "cd /home/ec2-user/masclet-imperi && sudo docker build -t masclet-imperi-frontend -f frontend/Dockerfile ."

Write-Host "▶️ Iniciando contenedor Frontend..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "cd /home/ec2-user/masclet-imperi && sudo docker run -d --name masclet-frontend --restart unless-stopped -p 80:3000 -e API_URL=http://masclet-api:8000/api/v1 --network $DOCKER_NETWORK masclet-imperi-frontend"

# 9. Verificar estado de contenedores
Write-Host "✅ Verificando estado de contenedores..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker ps"

# 10. Probar acceso al frontend
Write-Host "🧪 Probando acceso al frontend..." -ForegroundColor Yellow
try {
    $RESPONSE = Invoke-WebRequest -Uri "http://$EC2_IP/" -UseBasicParsing -TimeoutSec 10
    if ($RESPONSE.StatusCode -eq 200) {
        Write-Host "✅ Frontend funcionando correctamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Advertencia: Respuesta inesperada del frontend (código ${$RESPONSE.StatusCode})." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error al probar el frontend: $_" -ForegroundColor Red
}

# 11. Crear respaldo de la imagen funcional
Write-Host "💾 Creando respaldo de imagen funcional..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker commit masclet-frontend masclet-imperi-frontend:production && sudo docker images"

# 12. Limpiar archivos temporales
Remove-Item $tempZip -Force

Write-Host "🎉 Despliegue del frontend completado!" -ForegroundColor Green
Write-Host "   Aplicación disponible en: http://$EC2_IP/" -ForegroundColor Cyan
Write-Host "   API disponible en: http://$EC2_IP:8000/api/v1/" -ForegroundColor Cyan
