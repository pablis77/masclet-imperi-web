#!/bin/bash
# Script de despliegue directo para ejecutar en el servidor AWS

echo "🔍 Verificando si existe contenedor anterior..."
if docker ps -a --filter name=masclet-frontend --format '{{.Names}}' | grep -q masclet-frontend; then
    echo "⚠️ Eliminando contenedor anterior..."
    docker stop masclet-frontend || true
    docker rm masclet-frontend || true
fi

echo "🔧 Creando Dockerfile..."
cat > Dockerfile << 'EOL'
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de la build
COPY ./dist/ /app/

# Instalar servidor ligero (serve)
RUN npm install -g serve

# Variables de entorno para configuración
ENV PORT=80
ENV NODE_ENV=production
ENV BACKEND_URL=http://masclet-api:8000
ENV API_PREFIX=""

# Exponer puerto
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["serve", "-s", "-l", "80"]
EOL

echo "🔧 Construyendo imagen Docker..."
docker build -t masclet-frontend:latest .

echo "🔍 Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "⚠️ Creando red masclet-network..."
    docker network create masclet-network
fi

# Conectar contenedores existentes a la red
for container in masclet-api masclet-db; do
    if docker ps -q -f name=$container | grep -q .; then
        if ! docker network inspect masclet-network | grep -q $container; then
            echo "⚠️ Conectando $container a masclet-network..."
            docker network connect masclet-network $container || true
        fi
    fi
done

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
docker ps -a | grep masclet-frontend

echo "🎉 ¡Despliegue completado!"
echo "📋 Información:"
echo "   - Frontend: http://108.129.139.119:80"
echo "   - Backend: http://108.129.139.119:8000"
