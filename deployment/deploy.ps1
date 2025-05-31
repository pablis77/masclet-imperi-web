# Script de despliegue para Masclet Imperi en EC2
# Uso: .\deploy.ps1 -EC2_IP <ip-publica-ec2> -PEM_PATH <ruta-clave-pem>

param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🚀 Iniciando despliegue en $EC2_IP..." -ForegroundColor Cyan

# 1. Verificar conexión SSH
Write-Host "🔑 Verificando conexión SSH..." -ForegroundColor Yellow
$sshTest = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "echo Conexion SSH exitosa"
if (-not $?) {
    Write-Host "❌ Error en conexión SSH. Verifica IP y clave PEM." -ForegroundColor Red
    exit 1
}

# 2. Crear directorios necesarios en EC2
Write-Host "📁 Creando directorios para logs y uploads..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "mkdir -p /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads && chmod -R 777 /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads"

# 3. Copiar archivos de configuración
Write-Host "📦 Copiando archivos de configuración..." -ForegroundColor Yellow
scp -i "$PEM_PATH" "$(Get-Location)\docker-compose.prod.yml" ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/docker-compose.yml
scp -i "$PEM_PATH" "$(Get-Location)\Dockerfile.prod" ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/backend/Dockerfile
scp -i "$PEM_PATH" "$(Get-Location)\.env.prod" ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/.env
scp -i "$PEM_PATH" "$(Get-Location)\requirements.prod.txt" ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/backend/requirements.txt

# 4. Identificar la red Docker de la base de datos
Write-Host "🔍 Identificando red Docker..." -ForegroundColor Yellow
$DOCKER_NETWORK = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker network ls | grep masclet-imperi | awk '{print \`$2}'"
Write-Host "   Red Docker detectada: $DOCKER_NETWORK" -ForegroundColor Green

# 5. Detener y eliminar contenedor API existente si existe
Write-Host "🛑 Deteniendo contenedor API existente..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker stop masclet-api 2>/dev/null || true && sudo docker rm masclet-api 2>/dev/null || true"

# 6. Construir y ejecutar el contenedor API
Write-Host "🏗️ Construyendo nueva imagen API..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "cd /home/ec2-user/masclet-imperi && sudo docker build -t masclet-imperi-api ./backend"

Write-Host "▶️ Iniciando contenedor API..." -ForegroundColor Yellow
$dockerRunCmd = "cd /home/ec2-user/masclet-imperi && sudo docker run -d --name masclet-api --restart unless-stopped -p 8000:8000 -v /home/ec2-user/masclet-imperi/backend:/app -v /home/ec2-user/masclet-imperi/logs:/app/logs --env-file /home/ec2-user/masclet-imperi/.env --network $DOCKER_NETWORK masclet-imperi-api"
ssh -i "$PEM_PATH" ec2-user@$EC2_IP $dockerRunCmd

# 7. Verificar estado de contenedores
Write-Host "✅ Verificando estado de contenedores..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker ps"

# 8. Probar endpoint de animales
Write-Host "🧪 Probando endpoint de animales..." -ForegroundColor Yellow
try {
    $RESPONSE = Invoke-WebRequest -Uri "http://$EC2_IP:8000/api/v1/animals/" -UseBasicParsing
    if ($RESPONSE.Content -like "*success*") {
        Write-Host "✅ API funcionando correctamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Advertencia: Respuesta inesperada del endpoint de animales." -ForegroundColor Yellow
        Write-Host "   Respuesta: $($RESPONSE.Content.Substring(0, [Math]::Min(100, $RESPONSE.Content.Length)))..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error al probar el endpoint de animales: $_" -ForegroundColor Red
}

# 9. Crear respaldo de la imagen funcional
Write-Host "💾 Creando respaldo de imagen funcional..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker commit masclet-api masclet-imperi-api:production && sudo docker images"

Write-Host "🎉 Despliegue completado!" -ForegroundColor Green
Write-Host "   API disponible en: http://$EC2_IP:8000/api/v1/" -ForegroundColor Cyan
