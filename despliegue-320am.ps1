# Script ultra-definitivo - Creado a las 3:20 AM
# Sin rodeos, sin teorías, solo despliegue que funcione

$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_IP = "108.129.139.119"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-frontend"

Write-Host "🚀 Despliegue DEFINITIVO a las 3:20 AM" -ForegroundColor Green

# 1. Crear directorio temporal
$TEMP_DIR = ".\deployment\temp-aws"
if (Test-Path $TEMP_DIR) { Remove-Item -Recurse -Force $TEMP_DIR }
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# 2. Copiar archivos necesarios
Write-Host "📦 Copiando archivos esenciales..." -ForegroundColor Cyan
Copy-Item -Path ".\frontend\dist" -Destination "$TEMP_DIR\" -Recurse
Copy-Item -Path ".\frontend\fix-server.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\frontend\client-hydration-fix.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\arreglo-definitivo.sh" -Destination "$TEMP_DIR\arreglo-definitivo.sh"

# 3. Comprimir y transferir
Write-Host "🗜️ Comprimiendo y transfiriendo..." -ForegroundColor Cyan
$ZIP_FILE = "$TEMP_DIR\frontend-deploy-final.zip"
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $ZIP_FILE -Force

ssh -i $AWS_KEY "ec2-user@$EC2_IP" "mkdir -p $REMOTE_DIR"
scp -i $AWS_KEY $ZIP_FILE "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# 4. Ejecutar despliegue remoto - COMANDO DIRECTO SIN VARIABLES
Write-Host "🚀 Ejecutando comandos directamente en AWS..." -ForegroundColor Cyan

# Extraer archivos y ejecutar script
ssh -i $AWS_KEY "ec2-user@$EC2_IP" "cd $REMOTE_DIR && rm -rf dist fix-*.js client-hydration-fix.js package.json Dockerfile && unzip -o frontend-deploy-final.zip && chmod +x arreglo-definitivo.sh && ./arreglo-definitivo.sh"

Write-Host "✅ ¡DESPLIEGUE TERMINADO!" -ForegroundColor Green
Write-Host "📱 Frontend: http://${EC2_IP}/" -ForegroundColor Yellow
Write-Host "🔧 API: http://${EC2_IP}:8000/docs" -ForegroundColor Yellow
