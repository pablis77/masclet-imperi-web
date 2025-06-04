# Script definitivo para desplegar el frontend de Masclet Imperi en AWS
# Sin parches, sin chapuzas, un despliegue correcto

$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_HOST = "ec2-user@108.129.139.119"

# 1. Verificar la estructura de archivos local
Write-Host "🔍 Verificando estructura de archivos local..." -ForegroundColor Cyan

# Verificar que existe la carpeta dist
if (-Not (Test-Path -Path "frontend\dist")) {
    Write-Host "❌ ERROR: No se encuentra la carpeta frontend\dist" -ForegroundColor Red
    Write-Host "⚠️ Ejecuta primero 'npm run build' en la carpeta frontend" -ForegroundColor Yellow
    exit 1
}

# 2. Crear directorio temporal para la transferencia
$TEMP_DIR = "deployment\frontend-deploy"
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# 3. Copiar los archivos de la build
Write-Host "📦 Preparando archivos para el despliegue..." -ForegroundColor Cyan
Copy-Item -Path "frontend\dist\*" -Destination "$TEMP_DIR\" -Recurse

# 4. Crear el Dockerfile correcto
$DOCKERFILE = @"
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de la aplicación
COPY . /app/

# Instalar dependencias
RUN npm install -g serve

# Variables de entorno
ENV NODE_ENV=production

# Exponer puerto
EXPOSE 80

# Servir la aplicación
CMD ["serve", "-s", "client", "-l", "80"]
"@

$DOCKERFILE | Out-File -FilePath "$TEMP_DIR\Dockerfile" -Encoding utf8

# 5. Crear script de despliegue para AWS
$DEPLOY_SCRIPT = @"
#!/bin/bash
# Script de despliegue en servidor AWS

echo "🧹 Limpiando instalación anterior..."
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true
docker rmi masclet-frontend:latest 2>/dev/null || true

echo "🏗️ Construyendo imagen Docker..."
docker build -t masclet-frontend:latest .

echo "🌐 Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
  echo "🔄 Creando red masclet-network..."
  docker network create masclet-network
fi

echo "🔄 Verificando contenedores existentes..."
for CONTAINER in masclet-api masclet-db; do
  if docker ps -a | grep -q \$CONTAINER; then
    echo "🔄 Asegurando que \$CONTAINER está conectado a masclet-network..."
    docker network connect masclet-network \$CONTAINER 2>/dev/null || true
  fi
done

echo "🚀 Iniciando contenedor frontend..."
docker run -d --name masclet-frontend \
  --network masclet-network \
  -p 80:80 \
  -e "NODE_ENV=production" \
  -e "BACKEND_URL=http://masclet-api:8000" \
  --restart unless-stopped \
  masclet-frontend:latest

echo "✅ Verificando estado de contenedores..."
docker ps | grep masclet

echo "🌍 Aplicación disponible en:"
echo "  - Frontend: http://108.129.139.119/"
echo "  - API: http://108.129.139.119:8000/docs"
"@

$DEPLOY_SCRIPT | Out-File -FilePath "$TEMP_DIR\deploy.sh" -Encoding utf8 -NoNewline

# 6. Comprimir archivos para transferencia
Write-Host "🗜️ Comprimiendo archivos..." -ForegroundColor Cyan
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath "$TEMP_DIR\frontend-deploy.zip" -Force

# 7. Verificar que tenemos todos los archivos
Write-Host "🔍 Verificando archivos a transferir..." -ForegroundColor Cyan
if (-Not (Test-Path -Path "$TEMP_DIR\frontend-deploy.zip")) {
    Write-Host "❌ ERROR: No se pudo crear el archivo frontend-deploy.zip" -ForegroundColor Red
    exit 1
}

# 8. Transferir archivos a AWS
Write-Host "📤 Transfiriendo archivos a AWS..." -ForegroundColor Cyan
ssh -i $AWS_KEY $EC2_HOST "mkdir -p ~/masclet-frontend-deploy"
scp -i $AWS_KEY "$TEMP_DIR\frontend-deploy.zip" "${EC2_HOST}:~/masclet-frontend-deploy/"

# 9. Ejecutar despliegue en AWS
Write-Host "🚀 Ejecutando despliegue en AWS..." -ForegroundColor Cyan
$SSH_COMMAND = @"
cd ~/masclet-frontend-deploy && 
rm -rf * && 
unzip frontend-deploy.zip && 
chmod +x deploy.sh && 
./deploy.sh
"@

ssh -i $AWS_KEY $EC2_HOST $SSH_COMMAND

Write-Host "`n✅ ¡Despliegue completado!" -ForegroundColor Green
Write-Host "🌍 La aplicación está disponible en:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://108.129.139.119/" -ForegroundColor Yellow
Write-Host "  - API: http://108.129.139.119:8000/docs" -ForegroundColor Yellow
