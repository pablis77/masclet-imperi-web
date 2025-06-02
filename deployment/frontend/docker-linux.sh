#!/bin/bash

echo "🚀 Configurando contenedores Docker..."

# Detener y eliminar contenedores existentes si existen
echo "Limpiando contenedores anteriores si existen..."
docker stop masclet-frontend-node masclet-frontend 2>/dev/null || true
docker rm masclet-frontend-node masclet-frontend 2>/dev/null || true

# Crear contenedor Node.js para la aplicación Astro SSR
echo "Creando contenedor Node.js para Astro SSR..."
docker run -d \
    --name masclet-frontend-node \
    --network masclet-imperi_default \
    -p 10000:10000 \
    -v /home/ec2-user/masclet-imperi-frontend:/app \
    -e BACKEND_URL=http://108.129.139.119:8000 \
    -e NODE_ENV=production \
    -e API_PREFIX="" \
    -w /app \
    node:18-alpine \
    sh -c "cd /app && \
        npm install --legacy-peer-deps && \
        npm install jspdf html2canvas @react-pdf/renderer --legacy-peer-deps && \
        echo '🔌 API URL configurada como: '\$BACKEND_URL && \
        node fix-api-urls.js && \
        node fix-server.js"

# Esperar a que el contenedor Node inicie
echo "⏳ Esperando a que el servidor Node.js inicie..."
sleep 5

# Crear contenedor Nginx como proxy inverso
echo "Creando contenedor Nginx como proxy inverso..."
docker run -d \
    --name masclet-frontend \
    --network masclet-imperi_default \
    -p 80:80 \
    -v /home/ec2-user/nginx.conf:/etc/nginx/conf.d/default.conf \
    nginx:alpine

# Verificar que los contenedores estén corriendo
echo "✅ Verificando estado de los contenedores..."
docker ps | grep masclet

echo "✅ Despliegue completado"
