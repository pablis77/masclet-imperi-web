#!/bin/bash
# Script para arreglar el frontend en AWS

# Crear un Dockerfile que funcione correctamente con Vite
cat <<EOF > Dockerfile.fixed
FROM node:18-alpine

# Instalar dependencias
RUN npm install -g http-server

# Copiar los archivos compilados
WORKDIR /app
COPY ./frontend-files/ ./

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0

# Puerto
EXPOSE 80

# Comando para servir la aplicación
CMD ["sh", "-c", "cd client && http-server -p 80 --cors --gzip"]
EOF

# Detener y eliminar contenedor anterior
docker stop masclet-frontend
docker rm masclet-frontend

# Construir nueva imagen con el Dockerfile corregido
docker build -t masclet-frontend:fixed -f Dockerfile.fixed .

# Ejecutar el contenedor
docker run -d --name masclet-frontend \
  --network masclet-network \
  -p 80:80 \
  -e "NODE_ENV=production" \
  -e "BACKEND_URL=http://masclet-api:8000" \
  --restart unless-stopped \
  masclet-frontend:fixed

echo "✅ Frontend corregido y desplegado"
docker ps | grep masclet-frontend
