# Script para desplegar Masclet Imperi Frontend en AWS
# Optimizado para aplicación Astro SSR

# Parámetros de conexión
$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_IP = "108.129.139.119"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-frontend"

Write-Host "🚀 Iniciando despliegue de Masclet Imperi Frontend en AWS" -ForegroundColor Green

# 1. Verificar archivos necesarios
Write-Host "🔍 Verificando archivos necesarios..." -ForegroundColor Cyan

$requiredFiles = @(
    "frontend\dist\client",
    "frontend\dist\server",
    "frontend\fix-server.js",
    "frontend\fix-api-urls.js",
    "frontend\client-hydration-fix.js",
    "deploy-fix.sh"  # Usamos el script corregido que ya funciona
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Error: No se encontró $file - Abortando despliegue" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Todos los archivos necesarios encontrados" -ForegroundColor Green

# 2. Crear Dockerfile para el despliegue
$DOCKERFILE = @"
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias
RUN npm init -y && \
    npm install express compression http-proxy-middleware node-fetch

# Copiar archivos necesarios
COPY ./dist/ /app/dist/
COPY ./fix-server.js /app/
COPY ./fix-api-urls.js /app/
COPY ./client-hydration-fix.js /app/

# Ejecutar script para corregir URLs de API
RUN node fix-api-urls.js

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://masclet-api:8000

# Puerto expuesto
EXPOSE 80

# Comando de inicio
CMD ["node", "fix-server.js"]
"@

# 4. Crear directorio temporal para el despliegue
$TEMP_DIR = ".\deployment\temp-aws"
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# 5. Preparar archivos para el despliegue
Write-Host "📦 Preparando archivos para el despliegue..." -ForegroundColor Cyan

# Copiar archivos compilados
Copy-Item -Path ".\frontend\dist" -Destination "$TEMP_DIR\" -Recurse
Copy-Item -Path ".\frontend\fix-server.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\frontend\fix-api-urls.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\frontend\client-hydration-fix.js" -Destination "$TEMP_DIR\"
Copy-Item -Path ".\deploy-fix.sh" -Destination "$TEMP_DIR\deploy.sh"

# Guardar Dockerfile
$DOCKERFILE | Out-File -FilePath "$TEMP_DIR\Dockerfile" -Encoding utf8

# 6. Comprimir archivos para transferencia
Write-Host "🗜️ Comprimiendo archivos..." -ForegroundColor Cyan
$ZIP_FILE = "$TEMP_DIR\frontend-deploy.zip"
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $ZIP_FILE -Force

# 7. Transferir archivos a AWS
Write-Host "📤 Transfiriendo archivos a AWS..." -ForegroundColor Cyan

# Crear directorio remoto si no existe
ssh -i $AWS_KEY "ec2-user@$EC2_IP" "mkdir -p $REMOTE_DIR"

# Transferir archivo ZIP
scp -i $AWS_KEY $ZIP_FILE "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# 8. Ejecutar despliegue en AWS
Write-Host "🚀 Ejecutando despliegue en AWS..." -ForegroundColor Cyan

$REMOTE_COMMANDS = @"
cd $REMOTE_DIR && 
rm -rf dist Dockerfile fix-server.js fix-api-urls.js client-hydration-fix.js deploy.sh && 
unzip -o frontend-deploy.zip && 
chmod +x deploy.sh && 
./deploy.sh
"@

ssh -i $AWS_KEY "ec2-user@$EC2_IP" $REMOTE_COMMANDS

Write-Host "`n✅ ¡Despliegue completado!" -ForegroundColor Green
Write-Host "📱 Frontend disponible en: http://${EC2_IP}/" -ForegroundColor Yellow
Write-Host "🔧 API disponible en: http://${EC2_IP}:8000/docs" -ForegroundColor Yellow
