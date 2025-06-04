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

echo "🔍 Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "⚠️ Creando red masclet-network..."
    docker network create masclet-network
fi

# Conectar contenedores existentes a la red
for container in masclet-api masclet-db
do
    if docker ps -q -f name=\ | grep -q .
    then
        if ! docker network inspect masclet-network | grep -q \
        then
            echo "⚠️ Conectando \ a masclet-network..."
            docker network connect masclet-network \ || true
        fi
    fi
done

# Obtener IP para mostrar en URLs
HOST_IP="108.129.139.119"

echo "🚀 Iniciando contenedor frontend..."
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
echo "   - Frontend: http://\"
echo "   - Backend: http://\"