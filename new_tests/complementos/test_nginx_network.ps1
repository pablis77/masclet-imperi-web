# Script para probar la configuración de Nginx en una red Docker completa
# Esta prueba simula el entorno real de AWS con los contenedores interconectados

$TEST_DIR = ".\new_tests\complementos\test_nginx_network"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Limpieza previa si existe el directorio
if (Test-Path $TEST_DIR) {
    Write-ColorText "Limpiando prueba anterior..." "Yellow"
    Remove-Item -Recurse -Force $TEST_DIR
}

# Crear estructura de directorios para la prueba
Write-ColorText "Creando directorio para prueba..." "Cyan"
New-Item -ItemType Directory -Path $TEST_DIR | Out-Null

# Crear configuración Nginx exactamente igual a la de AWS
Write-ColorText "Creando configuración Nginx para prueba de red..." "Cyan"

# Configuración nginx.conf
@'
server {
    listen 80;
    server_name localhost;
    
    # Root para archivos estáticos (favicon, etc)
    root /usr/share/nginx/html;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Configurar tiempo de espera más largo para SSR
        proxy_read_timeout 120s;
    }

    # Configuración mínima para la prueba
    location /api/ {
        proxy_pass http://masclet-api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Configuración de logs
    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log debug;
}
'@ | Out-File -FilePath "$TEST_DIR\nginx.conf" -Encoding utf8

# Crear un archivo index.html simple para Node.js
@'
<!DOCTYPE html>
<html>
<head>
    <title>Test Node.js Server</title>
</head>
<body>
    <h1>Test Node.js Server</h1>
    <p>This is a test server for Nginx proxy configuration</p>
</body>
</html>
'@ | Out-File -FilePath "$TEST_DIR\index.html" -Encoding utf8

# Crear un archivo server.js simple para Node.js
@'
// Simple Express server para simular el servidor Node.js
const express = require('express');
const app = express();
const port = 10000;

app.use(express.static(__dirname));

app.get('/api/test', (req, res) => {
  res.json({ status: 'success', message: 'Node.js API test endpoint' });
});

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
'@ | Out-File -FilePath "$TEST_DIR\server.js" -Encoding utf8

# Crear un package.json simple
@'
{
  "name": "test-node-server",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
'@ | Out-File -FilePath "$TEST_DIR\package.json" -Encoding utf8

# Crear Dockerfile para Node.js
@'
FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY server.js .
COPY index.html .

RUN npm install

EXPOSE 10000

CMD ["node", "server.js"]
'@ | Out-File -FilePath "$TEST_DIR\Dockerfile.node" -Encoding utf8

# Crear Dockerfile para API simulada
@'
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Crear endpoints simulados
RUN mkdir -p api
RUN echo '{"status":"success","message":"API test endpoint"}' > /usr/share/nginx/html/api/index.html

# Configurar nginx para escuchar en puerto 8000
RUN echo 'server { listen 8000; location / { root /usr/share/nginx/html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]
'@ | Out-File -FilePath "$TEST_DIR\Dockerfile.api" -Encoding utf8

# Crear docker-compose.yml
@'
version: '3.8'

services:
  masclet-api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: masclet-api
    networks:
      - masclet-network

  masclet-frontend-node:
    build:
      context: .
      dockerfile: Dockerfile.node
    container_name: masclet-frontend-node
    networks:
      - masclet-network

  masclet-frontend:
    image: nginx:alpine
    container_name: masclet-frontend
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    networks:
      - masclet-network
    depends_on:
      - masclet-api
      - masclet-frontend-node

networks:
  masclet-network:
    driver: bridge
'@ | Out-File -FilePath "$TEST_DIR\docker-compose.yml" -Encoding utf8

# Crear script de diagnóstico
@'
#!/bin/sh

echo "==== DIAGNÓSTICO DE RED NGINX ===="

echo "\n1. Comprobando estado de contenedores..."
docker ps

echo "\n2. Verificando sintaxis de Nginx..."
docker exec masclet-frontend nginx -t

echo "\n3. Verificando logs de error de Nginx..."
docker exec masclet-frontend cat /var/log/nginx/masclet_error.log

echo "\n4. Pruebas de conectividad interna..."
docker exec masclet-frontend ping -c 2 masclet-frontend-node
docker exec masclet-frontend ping -c 2 masclet-api

echo "\n5. Verificando contenido del proxy_pass..."
docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf | grep proxy_pass

echo "\n6. Verificando estado del servicio Nginx..."
docker exec masclet-frontend service nginx status

echo "\nDiagnóstico completado."
'@ | Out-File -FilePath "$TEST_DIR\diagnose.sh" -Encoding utf8

# Construir y ejecutar la red de prueba
Set-Location -Path $TEST_DIR

Write-ColorText "Construyendo entorno completo de red Docker..." "Green"
docker-compose up -d

# Esperar a que los contenedores estén listos
Write-ColorText "Esperando a que los contenedores estén listos..." "Yellow"
Start-Sleep -Seconds 10

# Ejecutar pruebas
Write-ColorText "Ejecutando pruebas de red y conectividad..." "Cyan"
docker exec masclet-frontend nginx -t
docker exec masclet-frontend cat /var/log/nginx/masclet_error.log

Write-ColorText "Probando acceso a la aplicación web..." "Cyan"
Start-Process "http://localhost:8080/"

# Dar instrucciones para pruebas manuales
Write-ColorText "`n🔍 Para diagnóstico detallado, ejecutar:" "Magenta"
Write-ColorText "cd $TEST_DIR" "Gray"
Write-ColorText "sh diagnose.sh" "Gray"

# Instrucciones para limpiar
Write-ColorText "`n🧹 Para limpiar la prueba:" "Yellow"
Write-ColorText "docker-compose down" "Gray"
Write-ColorText "cd ../.." "Gray"
Write-ColorText "Remove-Item -Recurse -Force $TEST_DIR" "Gray"

# Instrucciones para acceder a la aplicación
Write-ColorText "`n🌐 La aplicación está disponible en: http://localhost:8080/" "Cyan"
