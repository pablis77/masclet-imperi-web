#!/bin/bash
# Script para solucionar DEFINITIVAMENTE el problema de rutas API duplicadas

# 1. Conectar al contenedor Nginx y corregir su configuración
echo "Corrigiendo configuración Nginx..."
docker exec masclet-nginx bash -c "sed -i 's|proxy_pass http://masclet-frontend-node:4321/api/v1/|proxy_pass http://masclet-frontend-node:4321/|g' /etc/nginx/conf.d/default.conf"

# 2. Reiniciar solo el contenedor Nginx para aplicar cambios
echo "Reiniciando Nginx..."
docker restart masclet-nginx

# 3. Corregir la configuración del frontend para usar la ruta API correcta
echo "Corrigiendo archivos JS del frontend..."
cd /home/ec2-user/frontend
find ./dist -type f -name "*.js" -exec sed -i 's|/api/v1/api/v1/|/api/v1/|g' {} \;

# 4. Reiniciar el contenedor frontend para aplicar cambios
echo "Reiniciando frontend..."
docker restart masclet-frontend-node

echo "¡Corrección de rutas duplicadas completada!"
echo "Espere 10 segundos para que los servicios se inicien correctamente..."
sleep 10
