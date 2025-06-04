#!/bin/bash
# Script para desplegar el frontend en AWS

echo "🧹 Deteniendo y eliminando contenedor anterior..."
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true

echo "🔧 Construyendo imagen Docker..."
docker build -t masclet-frontend:latest .

echo "🔍 Verificando la red Docker..."
if ! docker network ls | grep -q masclet-network
then
    echo "🌐 Creando red masclet-network..."
    docker network create masclet-network
fi

echo "🔄 Conectando contenedores a la red..."
for CONTAINER in masclet-api masclet-db
do
    if docker ps -a | grep -q $CONTAINER
    then
        echo "🔗 Conectando $CONTAINER a masclet-network..."
        docker network connect masclet-network $CONTAINER 2>/dev/null || echo "Ya conectado"
    fi
done

echo "🚀 Iniciando contenedor frontend..."
docker run -d --name masclet-frontend \
    --network masclet-network \
    -p 80:80 \
    -e "NODE_ENV=production" \
    -e "BACKEND_URL=http://masclet-api:8000" \
    -e "PORT=80" \
    -e "HOST=0.0.0.0" \
    --restart unless-stopped \
    masclet-frontend:latest

echo "✅ Verificando contenedores activos..."
docker ps | grep masclet

echo "📋 Comprobando logs del contenedor..."
sleep 2
docker logs masclet-frontend | tail -n 20

echo "🎉 ¡Despliegue completado!"
echo "📱 Frontend disponible en: http://108.129.139.119/"
echo "🔧 API disponible en: http://108.129.139.119:8000/docs"
