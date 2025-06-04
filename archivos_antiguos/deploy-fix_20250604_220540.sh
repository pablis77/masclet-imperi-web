#!/bin/bash
# Script de despliegue corregido

# Detener y eliminar contenedor anterior
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true

# Construir imagen
docker build -t masclet-frontend:latest .

# Verificar red
if ! docker network ls | grep -q masclet-network; then
  docker network create masclet-network
fi

# Conectar contenedores existentes a la red
for CONTAINER in masclet-api masclet-db
do
  if docker ps -q -f name=$CONTAINER | grep -q .
  then
    docker network connect masclet-network $CONTAINER 2>/dev/null || true
  fi
done

# Iniciar contenedor
docker run -d --name masclet-frontend \
  --network masclet-network \
  -p 80:80 \
  -e "NODE_ENV=production" \
  -e "BACKEND_URL=http://masclet-api:8000" \
  --restart unless-stopped \
  masclet-frontend:latest

# Mostrar estado
docker ps | grep masclet

echo "🎉 ¡Despliegue completado!"
echo "📱 Frontend: http://108.129.139.119/"
