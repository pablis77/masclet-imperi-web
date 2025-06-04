# Script ultra-simplificado para desplegar Masclet Imperi Frontend en AWS
# Versión "a las 3 AM"

# Parámetros de conexión
$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_IP = "108.129.139.119"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-frontend"

Write-Host "🚀 Iniciando despliegue a las 3:16 AM" -ForegroundColor Green

# 1. Crear directorio temporal
$TEMP_DIR = ".\deployment\temp-aws"
if (Test-Path $TEMP_DIR) { Remove-Item -Recurse -Force $TEMP_DIR }
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# 2. Copiar archivos
Write-Host "📦 Copiando archivos..." -ForegroundColor Cyan
Copy-Item -Path ".\frontend\dist" -Destination "$TEMP_DIR\" -Recurse
Copy-Item -Path ".\frontend\fix-server.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\frontend\fix-api-urls.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\frontend\client-hydration-fix.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\deploy-fix-final.sh" -Destination "$TEMP_DIR\deploy.sh"
Copy-Item -Path ".\Dockerfile-final" -Destination "$TEMP_DIR\Dockerfile"

# 3. Comprimir y transferir
Write-Host "🗜️ Comprimiendo y enviando..." -ForegroundColor Cyan
$ZIP_FILE = "$TEMP_DIR\frontend-deploy.zip"
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $ZIP_FILE -Force

ssh -i $AWS_KEY "ec2-user@$EC2_IP" "mkdir -p $REMOTE_DIR"
scp -i $AWS_KEY $ZIP_FILE "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# 4. Ejecutar despliegue remoto
Write-Host "🚀 Ejecutando en AWS..." -ForegroundColor Cyan

ssh -i $AWS_KEY "ec2-user@$EC2_IP" "cd $REMOTE_DIR && rm -rf dist Dockerfile fix-*.js client-hydration-fix.js deploy.sh && unzip -o frontend-deploy.zip && chmod +x deploy.sh && ./deploy.sh"

Write-Host "✅ ¡Por fin!" -ForegroundColor Green
Write-Host "📱 Frontend: http://${EC2_IP}/" -ForegroundColor Yellow
Write-Host "🔧 API: http://${EC2_IP}:8000/docs" -ForegroundColor Yellow
