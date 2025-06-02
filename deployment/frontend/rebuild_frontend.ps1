# Script para reconstruir completamente el frontend con todas las dependencias
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# 1. Crear los archivos necesarios
Write-Host "Creando archivos Dockerfile y docker-compose para el nuevo frontend..." -ForegroundColor Cyan

# Crear nuevo Dockerfile optimizado
$dockerfileContent = @'
# Dockerfile para el frontend (imagen completa)
FROM node:18

WORKDIR /app

# Instalar dependencias globales
RUN npm install -g npm@latest

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias con --legacy-peer-deps para evitar problemas de compatibilidad
RUN npm install --legacy-peer-deps

# Asegurarnos de instalar módulos específicos que sabemos que dan problemas
RUN npm install es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

# Copiar el resto de archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 10000

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=10000

# Iniciar aplicación
CMD ["node", "./dist/server/entry.mjs"]
'@

# Archivo docker-compose para facilitar la actualización
$dockerComposeContent = @'
version: '3'

services:
  masclet-frontend-node:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: masclet-frontend-node:latest
    container_name: masclet-frontend-node
    restart: unless-stopped
    ports:
      - "10000:10000"
    environment:
      - NODE_ENV=production
      - API_URL=http://masclet-api:8000
    networks:
      - masclet-network

  masclet-frontend:
    image: nginx:latest
    container_name: masclet-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - masclet-frontend-node
    networks:
      - masclet-network

networks:
  masclet-network:
    external: true
'@

# Configuración de Nginx optimizada
$nginxConfigContent = @'
server {
    listen 80;
    server_name localhost;

    # Proxy for Node.js frontend
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Proxy for API endpoints
    location /api {
        proxy_pass http://masclet-api:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static files directly
    location /assets {
        proxy_pass http://masclet-frontend-node:10000/assets;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # favicon
    location = /favicon.ico {
        proxy_pass http://masclet-frontend-node:10000/favicon.ico;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
        log_not_found off;
        expires max;
    }

    # Increase body size for file uploads
    client_max_body_size 100M;
}
'@

# Crear directorios remotos
$createDirsCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'mkdir -p ~/frontend ~/nginx'"
Write-Host "Creando directorios en el servidor..." -ForegroundColor Yellow
Invoke-Expression $createDirsCommand

# Guardar archivos localmente primero
$dockerfilePath = ".\deployment\frontend\Dockerfile.new"
$dockerComposePath = ".\deployment\frontend\docker-compose.yml"
$nginxConfigPath = ".\deployment\frontend\nginx.conf"

Set-Content -Path $dockerfilePath -Value $dockerfileContent
Set-Content -Path $dockerComposePath -Value $dockerComposeContent
Set-Content -Path $nginxConfigPath -Value $nginxConfigContent

# Transferir archivos al servidor
Write-Host "Transfiriendo archivos al servidor..." -ForegroundColor Yellow
$scpDockerfileCmd = "scp -i `"$PEM_PATH`" `"$dockerfilePath`" ec2-user@$EC2_IP`:~/frontend/Dockerfile"
$scpDockerComposeCmd = "scp -i `"$PEM_PATH`" `"$dockerComposePath`" ec2-user@$EC2_IP`:~/docker-compose.yml"
$scpNginxConfigCmd = "scp -i `"$PEM_PATH`" `"$nginxConfigPath`" ec2-user@$EC2_IP`:~/nginx/default.conf"

Invoke-Expression $scpDockerfileCmd
Invoke-Expression $scpDockerComposeCmd
Invoke-Expression $scpNginxConfigCmd

# 2. Copiar el frontend actual al servidor
Write-Host "Preparando el código frontend para subir al servidor..." -ForegroundColor Cyan
$frontendDir = ".\frontend"

# Comprimir el frontend para transferencia rápida
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$zipFile = "frontend_$timestamp.zip"
$zipPath = ".\deployment\frontend\$zipFile"

Write-Host "Comprimiendo archivos frontend..." -ForegroundColor Yellow
Compress-Archive -Path "$frontendDir\*" -DestinationPath $zipPath -Force

# Transferir el archivo zip
Write-Host "Subiendo frontend al servidor (puede tardar unos minutos)..." -ForegroundColor Yellow
$scpFrontendCmd = "scp -i `"$PEM_PATH`" `"$zipPath`" ec2-user@$EC2_IP`:~/frontend.zip"
Invoke-Expression $scpFrontendCmd

# Descomprimir en el servidor
Write-Host "Descomprimiendo archivos en el servidor..." -ForegroundColor Yellow
$unzipCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'cd ~/frontend && rm -rf * && unzip -q ../frontend.zip -d . && rm ../frontend.zip'"
Invoke-Expression $unzipCmd

# 3. Detener los contenedores actuales
Write-Host "Deteniendo contenedores actuales..." -ForegroundColor Yellow
$stopContainersCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker stop masclet-frontend masclet-frontend-node'"
Invoke-Expression $stopContainersCmd

# 4. Reconstruir y arrancar con docker-compose
Write-Host "Reconstruyendo contenedores frontend..." -ForegroundColor Green
$rebuildCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'cd ~/ && sudo docker-compose up -d --build masclet-frontend-node masclet-frontend'"
Invoke-Expression $rebuildCmd

# 5. Verificar estado
Write-Host "Esperando 30 segundos para que los contenedores se inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Verificando estado de los contenedores..." -ForegroundColor Cyan
$checkContainersCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker ps | grep masclet-frontend'"
Invoke-Expression $checkContainersCmd

Write-Host "Verificando logs del contenedor frontend..." -ForegroundColor Cyan
$checkLogsCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker logs masclet-frontend-node --tail 20'"
Invoke-Expression $checkLogsCmd

Write-Host "Verificando acceso al frontend..." -ForegroundColor Green
$checkFrontendCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'curl -s http://localhost/ | head -10'"
Invoke-Expression $checkFrontendCmd

Write-Host "`nReconstrucción completa. Ejecutando diagnóstico completo..." -ForegroundColor Green
python .\new_tests\complementos\comprobar_despliegue.py -u http://$EC2_IP -v
