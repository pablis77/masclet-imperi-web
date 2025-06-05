#!/bin/bash
set -e

echo "=== DESPLEGANDO FRONTEND COMPILADO CON NODE.JS ==="

# Detener contenedor frontend existente si existe
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true

# Crear directorio de trabajo
mkdir -p frontend-deploy
cd frontend-deploy

# Extraer archivos compilados
echo "Extrayendo archivos compilados..."
unzip -o ../frontend-compiled.zip

# Construir imagen Docker con Node.js
echo "Construyendo imagen Docker con Node.js..."
docker build -t masclet-frontend:latest -f ../frontend-node.Dockerfile .

# Crear red si no existe
docker network inspect masclet-network >/dev/null 2>&1 || \
docker network create masclet-network

# Iniciar contenedor
echo "Iniciando contenedor frontend..."
docker run -d --name masclet-frontend \
  --restart always \
  --network masclet-network \
  -p 80:80 \
  masclet-frontend:latest

# Verificar estado
echo "Verificando estado del contenedor..."
docker ps | grep masclet-frontend

# Verificar logs para asegurarnos que arrancó correctamente
echo "Verificando logs del contenedor..."
sleep 3
docker logs masclet-frontend --tail 10

echo "=== FRONTEND DESPLEGADO EXITOSAMENTE ==="
echo "Frontend accesible en: http://$(curl -s ifconfig.me || echo "3.253.32.134")"