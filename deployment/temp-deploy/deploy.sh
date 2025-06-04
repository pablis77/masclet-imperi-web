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
  if docker ps -q -f name=\ | grep -q .; then
    if ! docker network inspect masclet-network | grep -q \; then
      echo "🔄 Conectando \ a masclet-network..."
      docker network connect masclet-network \ || true
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