#!/bin/bash

# Script de despliegue para Masclet Imperi Frontend v3.0 (arreglado)
# Ejecuta en AWS para desplegar el frontend SSR

echo "🧹 Deteniendo y eliminando contenedor anterior..."
docker stop masclet-frontend >/dev/null 2>&1
docker rm masclet-frontend >/dev/null 2>&1

echo "🔧 Construyendo imagen Docker..."
docker build -t masclet-frontend . --no-cache

echo "🔍 Verificando la red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "📦 Creando red Docker masclet-network..."
    docker network create masclet-network
fi

echo "🔄 Conectando contenedores a la red..."

echo "🔗 Conectando masclet-api a masclet-network..."
if docker network inspect masclet-network | grep -q "masclet-api"; then
    echo "Ya conectado"
else
    docker network connect masclet-network masclet-api || echo "❌ Error: No se pudo conectar masclet-api"
fi

echo "🔗 Conectando masclet-db a masclet-network..."
if docker network inspect masclet-network | grep -q "masclet-db"; then
    echo "Ya conectado"
else
    docker network connect masclet-network masclet-db || echo "❌ Error: No se pudo conectar masclet-db"
fi

echo "🚀 Iniciando contenedor frontend..."
docker run -d --name masclet-frontend \
    -p 80:80 \
    -e NODE_ENV=production \
    -e PORT=80 \
    -e HOST=0.0.0.0 \
    -e BACKEND_URL=http://masclet-api:8000 \
    --network masclet-network \
    --restart unless-stopped \
    masclet-frontend

echo "✅ Verificando contenedores activos..."
docker ps

echo "📋 Comprobando logs del contenedor..."
sleep 2
docker logs masclet-frontend
