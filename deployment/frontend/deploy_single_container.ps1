# SOLUCIÓN DEFINITIVA DE DESPLIEGUE - UN SOLO CONTENEDOR NODE.JS
# Script profesional y funcional

# Configuración
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$FRONTEND_DIR = "C:\Proyectos\claude\masclet-imperi-web\frontend"

# Crear Dockerfile optimizado
$dockerfile = @'
FROM node:18

WORKDIR /app

# Copiar solo los archivos de configuración primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias con --legacy-peer-deps para resolver conflictos
RUN npm install --legacy-peer-deps

# Instalar explícitamente las dependencias problemáticas
RUN npm install mrmime es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

# Variables de entorno cruciales
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
# IMPORTANTE: No incluir /api/v1 aquí para evitar duplicación de rutas
ENV VITE_API_URL=http://108.129.139.119:8000
ENV PUBLIC_API_URL=http://108.129.139.119:8000

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto HTTP
EXPOSE 80

# Ejecutar en modo producción
CMD ["node", "./dist/server/entry.mjs"]
'@

# Guardar Dockerfile en directorio frontend
$dockerfilePath = "$FRONTEND_DIR\Dockerfile"
$dockerfile | Out-File -FilePath $dockerfilePath -Encoding utf8

# Crear .dockerignore para reducir tamaño de contexto
$dockerignore = @'
node_modules
dist
.git
.github
docs
*.log
'@
$dockerignorePath = "$FRONTEND_DIR\.dockerignore"
$dockerignore | Out-File -FilePath $dockerignorePath -Encoding utf8

Write-Host "--- DESPLEGANDO FRONTEND CON UN ÚNICO CONTENEDOR NODE.JS ---" -ForegroundColor Cyan

# Script a ejecutar en el servidor
$serverScript = @'
#!/bin/bash
set -e

echo "=== INICIANDO DESPLIEGUE DE FRONTEND ==="

# 1. Detener y eliminar contenedores existentes
echo "Limpiando contenedores existentes..."
sudo docker stop masclet-frontend masclet-frontend-node 2>/dev/null || true
sudo docker rm masclet-frontend masclet-frontend-node 2>/dev/null || true

# 2. Ir al directorio de despliegue
cd ~/frontend

# 3. Construir la imagen con caché desactivada para forzar reconstrucción
echo "Construyendo imagen Docker..."
sudo docker build --no-cache -t masclet-frontend:latest .

# 4. Ejecutar el contenedor conectado a la red de masclet
echo "Ejecutando nuevo contenedor..."
sudo docker run -d --name masclet-frontend --network masclet-network -p 80:80 masclet-frontend:latest

# 5. Verificar estado
echo "Verificando estado del contenedor..."
sudo docker ps | grep masclet-frontend
sudo docker logs masclet-frontend --tail 20

# 6. Probar acceso al frontend
echo "Probando acceso al frontend..."
curl -s http://localhost/ | head -20

echo "=== DESPLIEGUE COMPLETADO ==="
echo "El frontend debe estar accesible en http://108.129.139.119"
echo "Verificando acceso a la API backend..."
curl -s http://108.129.139.119:8000/docs | head -5
'@

# Crear archivo temporal con el script para el servidor
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$serverScript | Out-File -FilePath $tempScript -Encoding utf8

# Preparar directorio temporal para transferencia
Write-Host "Preparando archivos para transferencia..." -ForegroundColor Yellow
$tempDir = Join-Path $env:TEMP "masclet-deploy-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Preparar directorio temporal con solo archivos necesarios para frontend
Write-Host "Preparando archivos necesarios para frontend..." -ForegroundColor Yellow
$frontendZip = "$env:TEMP\frontend-deploy.zip"
$tempFrontendDir = "$env:TEMP\frontend-temp-deploy"

# Crear directorio temporal
if (Test-Path $tempFrontendDir) { Remove-Item -Path $tempFrontendDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempFrontendDir -Force | Out-Null

# Copiar solo archivos necesarios (sin node_modules ni dist)
Get-ChildItem -Path $FRONTEND_DIR -Exclude "node_modules", "dist", ".git" | 
    ForEach-Object { 
        if ($_.PSIsContainer) {
            Copy-Item -Path $_.FullName -Destination "$tempFrontendDir\$($_.Name)" -Recurse
        } else {
            Copy-Item -Path $_.FullName -Destination "$tempFrontendDir\$($_.Name)"
        }
    }

# Comprimir el directorio temporal que ya tiene la selección correcta
Compress-Archive -Path "$tempFrontendDir\*" -DestinationPath $frontendZip -Force

# Verificar SSH y directorio remoto
Write-Host "Verificando conexión SSH..." -ForegroundColor Yellow
$sshTestCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'echo Conexión SSH exitosa && mkdir -p ~/frontend'"
Invoke-Expression $sshTestCommand

# Transferir archivos al servidor
Write-Host "Transfiriendo archivos al servidor..." -ForegroundColor Cyan
$scpCommand = "scp -i `"$PEM_PATH`" `"$frontendZip`" ec2-user@$EC2_IP`:~/frontend-deploy.zip"
$scpScriptCommand = "scp -i `"$PEM_PATH`" `"$tempScript`" ec2-user@$EC2_IP`:~/deploy-frontend.sh"
Invoke-Expression $scpCommand
Invoke-Expression $scpScriptCommand

# Ejecutar despliegue en el servidor
Write-Host "Ejecutando despliegue en el servidor..." -ForegroundColor Green
$sshCommand = @"
ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'cd ~ && 
rm -rf ~/frontend/* && 
unzip -o ~/frontend-deploy.zip -d ~/frontend && 
chmod +x ~/deploy-frontend.sh && 
~/deploy-frontend.sh'
"@
Invoke-Expression $sshCommand

# Limpiar archivos temporales
Remove-Item -Path $tempScript -Force
Remove-Item -Path $frontendZip -Force
Remove-Item -Path $tempDir -Recurse -Force
Remove-Item -Path $tempFrontendDir -Recurse -Force

Write-Host "`n--- DESPLIEGUE FINALIZADO ---" -ForegroundColor Green
Write-Host "El frontend está desplegado en: http://$EC2_IP" -ForegroundColor Green
Write-Host "Backend API disponible en: http://$EC2_IP:8000" -ForegroundColor Green
