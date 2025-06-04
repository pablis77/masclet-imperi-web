#!/bin/pwsh
# Script único para desplegar el frontend en AWS
$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_HOST = "ec2-user@108.129.139.119"

Write-Host "🚀 Iniciando despliegue de Masclet Imperi Frontend en AWS..." -ForegroundColor Green

# 1. Preparar directorio local con los archivos necesarios
Write-Host "📦 Preparando archivos para despliegue..." -ForegroundColor Cyan
$TEMP_DIR = "deployment\temp-deploy"
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# Crear Dockerfile optimizado
$DOCKERFILE_CONTENT = @"
FROM node:18-alpine

# Instalar dependencias necesarias
RUN npm install -g serve

# Copiar archivos de la aplicación
WORKDIR /app
COPY ./frontend-files/ ./

# Configuración
ENV NODE_ENV=production
ENV PORT=80

# Exponer puerto
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["serve", "-s", "./", "-l", "80"]
"@

$DOCKERFILE_CONTENT | Out-File -FilePath "$TEMP_DIR\Dockerfile" -Encoding utf8

# 2. Copiar archivos de build de frontend
Write-Host "📂 Copiando archivos de la build..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$TEMP_DIR\frontend-files" | Out-Null
Copy-Item -Path "frontend\dist\*" -Destination "$TEMP_DIR\frontend-files\" -Recurse -Force

# 3. Crear script de despliegue para AWS
$DEPLOY_SCRIPT = @"
#!/bin/bash
# Script de despliegue en servidor AWS

echo "🧹 Limpiando contenedor anterior si existe..."
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true

echo "🏗️ Construyendo imagen Docker..."
docker build -t masclet-frontend:latest .

echo "🌐 Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
  echo "🔄 Creando red masclet-network..."
  docker network create masclet-network
fi

echo "🔗 Conectando contenedores a la red..."
for CONTAINER in masclet-api masclet-db; do
  if docker ps -q -f name=\$CONTAINER | grep -q .; then
    if ! docker network inspect masclet-network | grep -q \$CONTAINER; then
      echo "🔄 Conectando \$CONTAINER a masclet-network..."
      docker network connect masclet-network \$CONTAINER || true
    fi
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

echo "🔍 Verificando logs del contenedor..."
docker logs masclet-frontend

echo "🎉 ¡Despliegue completado!"
echo "📱 Frontend disponible en: http://108.129.139.119/"
echo "🔧 API disponible en: http://108.129.139.119:8000/docs"
"@

$DEPLOY_SCRIPT | Out-File -FilePath "$TEMP_DIR\deploy.sh" -Encoding utf8 -NoNewline

# 4. Comprimir archivos para transferencia
Write-Host "🗜️ Comprimiendo archivos..." -ForegroundColor Cyan
$CURRENT_DIR = Get-Location
Set-Location $TEMP_DIR
tar -czf frontend-deploy.tar.gz *
Set-Location $CURRENT_DIR

# 5. Transferir archivos a AWS
Write-Host "📤 Transfiriendo archivos a AWS..." -ForegroundColor Cyan
ssh -i $AWS_KEY $EC2_HOST "mkdir -p ~/masclet-frontend"
scp -i $AWS_KEY "$TEMP_DIR\frontend-deploy.tar.gz" "${EC2_HOST}:~/masclet-frontend/"

# 6. Desplegar en AWS
Write-Host "🚀 Ejecutando despliegue en AWS..." -ForegroundColor Cyan
ssh -i $AWS_KEY $EC2_HOST "cd ~/masclet-frontend && tar -xzf frontend-deploy.tar.gz && chmod +x deploy.sh && ./deploy.sh"

Write-Host "`n✅ ¡Despliegue completado!" -ForegroundColor Green
Write-Host "`n📱 Frontend: http://108.129.139.119/" -ForegroundColor Yellow
Write-Host "🔧 API: http://108.129.139.119:8000/docs" -ForegroundColor Yellow
