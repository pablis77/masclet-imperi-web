# Script para probar localmente el entorno Docker exactamente como estaría en AWS
# Este script simula todo el proceso de despliegue pero en local

# Definir variables
$PROYECTO_DIR = "C:\Proyectos\claude\masclet-imperi-web"
$FRONTEND_DIR = "$PROYECTO_DIR\frontend"
$TEST_DIR = "$PROYECTO_DIR\new_tests\complementos\test_docker_local"

# Crear directorio de prueba si no existe
if (-not (Test-Path $TEST_DIR)) {
    New-Item -ItemType Directory -Path $TEST_DIR -Force
}

Write-Host "🧪 Preparando entorno de prueba Docker local..." -ForegroundColor Cyan

# 1. Copiar los archivos necesarios a la carpeta de prueba
Write-Host "📂 Copiando archivos frontend compilados..." -ForegroundColor Cyan
Copy-Item -Path "$FRONTEND_DIR\dist" -Destination "$TEST_DIR\" -Recurse -Force

# 2. Copiar scripts de corrección
Write-Host "📄 Copiando scripts de corrección..." -ForegroundColor Cyan
Copy-Item -Path "$FRONTEND_DIR\fix-api-urls-enhanced.cjs" -Destination "$TEST_DIR\" -Force
Copy-Item -Path "$FRONTEND_DIR\fix-server.js" -Destination "$TEST_DIR\" -Force

# 3. Crear archivo package.json mínimo
$packageJson = @"
{
    "name": "masclet-imperi-frontend-test",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "dependencies": {
        "express": "^4.21.2",
        "http-proxy-middleware": "^3.0.5",
        "node-fetch": "^3.3.2",
        "cookie": "^0.6.0",
        "express-session": "^1.18.0",
        "@astrojs/internal-helpers": "^0.2.1"
    }
}
"@
$packageJson | Out-File -FilePath "$TEST_DIR\package.json" -Encoding utf8

# 4. Crear archivo nginx.conf
$nginxConf = @"
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://masclet-frontend-node-test:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $$host;
        proxy_cache_bypass $$http_upgrade;
    }
}
"@
$nginxConf | Out-File -FilePath "$TEST_DIR\nginx.conf" -Encoding utf8

# 5. Crear Dockerfile para Node.js
$dockerfileNode = @"
FROM node:18-alpine

WORKDIR /app

COPY . /app/

RUN npm install --legacy-peer-deps

# Ejecutar los scripts de corrección
RUN node fix-api-urls-enhanced.cjs
ENV NODE_ENV=production
ENV BACKEND_URL=http://108.129.139.119:8000
ENV API_PREFIX=""

CMD ["node", "fix-server.js"]

EXPOSE 10000
"@
$dockerfileNode | Out-File -FilePath "$TEST_DIR\Dockerfile.node" -Encoding utf8

# 6. Crear script docker-compose.yml
$dockerCompose = @"
version: '3'

services:
  masclet-frontend-node:
    build:
      context: .
      dockerfile: Dockerfile.node
    container_name: masclet-frontend-node-test
    ports:
      - "10000:10000"
    environment:
      - BACKEND_URL=http://108.129.139.119:8000
      - NODE_ENV=production
      - API_PREFIX=""

  masclet-frontend:
    image: nginx:alpine
    container_name: masclet-frontend-test
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - masclet-frontend-node
"@
$dockerCompose | Out-File -FilePath "$TEST_DIR\docker-compose.yml" -Encoding utf8

# 7. Crear un script para limpiar y ejecutar todo
$runScript = @"
# Limpiar y ejecutar contenedores
Write-Host "🧹 Limpiando contenedores anteriores..." -ForegroundColor Yellow
docker-compose down
docker-compose rm -f

Write-Host "🚀 Construyendo y levantando contenedores..." -ForegroundColor Green
docker-compose up --build
"@
$runScript | Out-File -FilePath "$TEST_DIR\run.ps1" -Encoding utf8

Write-Host "✅ Entorno de prueba Docker preparado en: $TEST_DIR" -ForegroundColor Green
Write-Host "⚙️ Para ejecutar la prueba: cd $TEST_DIR && .\run.ps1" -ForegroundColor Yellow
