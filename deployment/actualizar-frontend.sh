#!/bin/bash

# Script para actualizar el frontend de Masclet Imperi en AWS
# Este script reconstruye la imagen del frontend con las dependencias actualizadas

echo "==== INICIANDO ACTUALIZACIÓN DEL FRONTEND ===="
echo "Instalando dependencias..."

# Detener contenedores actuales
docker stop masclet-frontend
docker stop masclet-frontend-node

# Eliminar contenedores anteriores
docker rm masclet-frontend
docker rm masclet-frontend-node

# Crear dirección temporal para la construcción
mkdir -p /tmp/masclet-build
cd /tmp/masclet-build

# Clonar el repositorio (asumiendo que está en GitHub y es público)
# Si es privado, necesitarías credenciales
echo "Clonando repositorio..."
git clone https://github.com/pablis77/masclet-imperi-web.git .

# Navegar al directorio del frontend
cd frontend

# Actualizar package.json para incluir las dependencias faltantes
echo "Añadiendo dependencias faltantes..."
sed -i 's/"react-router-dom": "\^7.3.0"/"react-router-dom": "\^7.3.0",\n        "jspdf": "\^2.5.1",\n        "jspdf-autotable": "\^3.8.1"/g' package.json

# Instalar dependencias y construir el frontend
echo "Instalando dependencias y construyendo..."
npm install
npm run build

# Construir la nueva imagen Docker del frontend
echo "Construyendo imagen Docker del frontend Node..."
cd ..
docker build -t masclet-frontend-node:latest -f deployment/frontend/Dockerfile.node .

# Construir la nueva imagen Docker de NGINX
echo "Construyendo imagen Docker de NGINX..."
docker build -t masclet-frontend:latest -f deployment/frontend/Dockerfile.nginx .

# Iniciar los nuevos contenedores
echo "Iniciando nuevos contenedores..."
docker run -d --name masclet-frontend-node -p 10000:10000 --network masclet-network masclet-frontend-node:latest
docker run -d --name masclet-frontend -p 80:80 --network masclet-network masclet-frontend:latest

echo "==== ACTUALIZACIÓN DEL FRONTEND COMPLETADA ===="
echo "Verificando logs del contenedor frontend-node:"
docker logs masclet-frontend-node --tail 20

# Limpiar directorio temporal
cd /
rm -rf /tmp/masclet-build

echo "==== PROCESO FINALIZADO ===="
