#!/bin/pwsh
# Script para desplegar frontend en AWS como contenedor único
# Configuración
$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_HOST = "ec2-user@108.129.139.119"
$CONTAINER_NAME = "masclet-frontend"

Write-Host "🚀 Iniciando despliegue de frontend en AWS..." -ForegroundColor Cyan

# 1. Crear Dockerfile optimizado para producción
$dockerfile = @"
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de la build
COPY ./dist/ /app/

# Instalar servidor ligero (serve)
RUN npm install -g serve

# Variables de entorno para configuración
ENV PORT=80
ENV NODE_ENV=production
ENV BACKEND_URL=http://masclet-api:8000
ENV API_PREFIX=""

# Exponer puerto
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["serve", "-s", "-l", "80"]
"@

Write-Host "✅ Dockerfile generado" -ForegroundColor Green

# Crear directorio temporal
Write-Host "🔧 Creando estructura de archivos para despliegue..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "deployment\aws-frontend\deploy-package" | Out-Null
New-Item -ItemType Directory -Force -Path "deployment\aws-frontend\deploy-package\dist" | Out-Null

# Escribir Dockerfile
$dockerfile | Out-File -FilePath "deployment\aws-frontend\deploy-package\Dockerfile" -Encoding utf8

# Escribir script de despliegue para ejecutar en el servidor
$deploy_script = @"
#!/bin/bash
# Script de despliegue para ejecutar en el servidor AWS

echo "🔍 Verificando si existe contenedor anterior..."
if docker ps -a --filter name=masclet-frontend --format '{{.Names}}' | grep -q masclet-frontend; then
    echo "⚠️ Eliminando contenedor anterior..."
    docker stop masclet-frontend || true
    docker rm masclet-frontend || true
fi

echo "🔧 Construyendo imagen Docker..."
docker build -t masclet-frontend:latest .

echo " Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo " Creando red masclet-network..."
    docker network create masclet-network
fi

# Conectar contenedores existentes a la red si no están ya conectados
for container in masclet-api masclet-db
do
    if docker ps -q -f name=$container | grep -q .
    then
        if ! docker network inspect masclet-network | grep -q $container
        then
            echo " Conectando $container a masclet-network..."
            docker network connect masclet-network $container || true
        fi
    fi
done

# Obtener IP del host para mostrar URLs
HOST_IP=$(hostname -I | cut -d' ' -f1)

echo " Iniciando contenedor frontend..."
docker run -d --name masclet-frontend \
    --network masclet-network \
    -p 80:80 \
    -e "NODE_ENV=production" \
    -e "BACKEND_URL=http://masclet-api:8000" \
    -e "API_PREFIX=" \
    --restart unless-stopped \
    masclet-frontend:latest

echo "✅ Verificando estado del contenedor..."
docker ps -a --filter name=masclet-frontend

echo "🎉 ¡Despliegue completado!"
echo "📋 Información:"
echo "   - Frontend: http://$HOST_IP:80"
echo "   - Backend: http://$HOST_IP:8000"
"@

$deploy_script | Out-File -FilePath "deployment\aws-frontend\deploy-package\deploy.sh" -Encoding utf8 -NoNewline

# Copiar archivos de la build al directorio de despliegue
Write-Host "📦 Copiando archivos de build..." -ForegroundColor Cyan
Copy-Item -Path "frontend\dist\*" -Destination "deployment\aws-frontend\deploy-package\dist" -Recurse -Force

# Crear archivo TAR.GZ para transferencia
Write-Host "📦 Empaquetando archivos..." -ForegroundColor Cyan
$current_dir = Get-Location
Set-Location "deployment\aws-frontend"
tar -czf frontend-deploy.tar.gz -C deploy-package .
Set-Location $current_dir

# Transferir a AWS
Write-Host "📤 Transfiriendo archivos a AWS..." -ForegroundColor Cyan
ssh -i $AWS_KEY $EC2_HOST "mkdir -p ~/frontend-deploy"
scp -i $AWS_KEY "deployment\aws-frontend\frontend-deploy.tar.gz" "${EC2_HOST}:~/frontend-deploy/"

# Ejecutar despliegue en AWS
Write-Host "🚀 Ejecutando despliegue en AWS..." -ForegroundColor Cyan
ssh -i $AWS_KEY $EC2_HOST @"
cd ~/frontend-deploy && 
tar -xzf frontend-deploy.tar.gz && 
chmod +x deploy.sh &&
./deploy.sh
"@

Write-Host "`n🎉 ¡Despliegue completado!" -ForegroundColor Green
Write-Host "`n📋 El frontend ahora debería estar disponible en: http://108.129.139.119/" -ForegroundColor Cyan
Write-Host "   Backend API: http://108.129.139.119:8000/docs" -ForegroundColor Cyan
