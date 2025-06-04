# Script para desplegar Masclet Imperi Frontend en AWS
# Version super final arreglada a las 3:12 de la madrugada

# Parámetros de conexión
$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_IP = "108.129.139.119"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-frontend"

Write-Host "🚀 Iniciando despliegue a las 3:14 AM" -ForegroundColor Green

# 1. Verificar archivos necesarios
Write-Host "🔍 Verificando archivos clave..." -ForegroundColor Cyan

$requiredFiles = @(
    "frontend\dist\client",
    "frontend\dist\server",
    "frontend\fix-server.js",
    "frontend\fix-api-urls.js",
    "frontend\client-hydration-fix.js",
    "deploy-fix.sh"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ No se encontró $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Archivos OK" -ForegroundColor Green

# 2. Crear directorio temporal
$TEMP_DIR = ".\deployment\temp-aws"
if (Test-Path $TEMP_DIR) { Remove-Item -Recurse -Force $TEMP_DIR }
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# 3. Preparar Dockerfile
$DOCKERFILE = @'
FROM node:18-alpine
WORKDIR /app
RUN npm init -y && npm install express compression http-proxy-middleware node-fetch
COPY ./dist/ /app/dist/
COPY ./fix-server.js /app/
COPY ./fix-api-urls.js /app/
COPY ./client-hydration-fix.js /app/
RUN node fix-api-urls.js
ENV NODE_ENV=production PORT=80 HOST=0.0.0.0 BACKEND_URL=http://masclet-api:8000
EXPOSE 80
CMD ["node", "fix-server.js"]
'@

# 4. Copiar archivos
Write-Host "📦 Copiando archivos..." -ForegroundColor Cyan
Copy-Item -Path ".\frontend\dist" -Destination "$TEMP_DIR\" -Recurse
Copy-Item -Path ".\frontend\fix-server.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\frontend\fix-api-urls.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\frontend\client-hydration-fix.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\deploy-fix.sh" -Destination "$TEMP_DIR\deploy.sh"
$DOCKERFILE | Out-File -FilePath "$TEMP_DIR\Dockerfile" -Encoding utf8

# 5. Comprimir y transferir
Write-Host "🗜️ Comprimiendo y enviando..." -ForegroundColor Cyan
$ZIP_FILE = "$TEMP_DIR\frontend-deploy.zip"
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $ZIP_FILE -Force

ssh -i $AWS_KEY "ec2-user@$EC2_IP" "mkdir -p $REMOTE_DIR"
scp -i $AWS_KEY $ZIP_FILE "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# 6. Ejecutar despliegue remoto
Write-Host "🚀 Ejecutando en AWS..." -ForegroundColor Cyan

ssh -i $AWS_KEY "ec2-user@$EC2_IP" "cd $REMOTE_DIR && rm -rf dist Dockerfile fix-*.js client-hydration-fix.js deploy.sh && unzip -o frontend-deploy.zip && chmod +x deploy.sh && ./deploy.sh"

Write-Host "✅ ¡Terminado!" -ForegroundColor Green
Write-Host "📱 Frontend: http://${EC2_IP}/" -ForegroundColor Yellow
Write-Host "🔧 API: http://${EC2_IP}:8000/docs" -ForegroundColor Yellow
