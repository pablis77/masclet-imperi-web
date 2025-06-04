#!/bin/bash
# Script completo para arreglar el despliegue de Masclet Imperi

# Parar y eliminar el contenedor frontend si existe
docker stop masclet-frontend
docker rm masclet-frontend

echo "📝 Creando package.json con todas las dependencias..."
cat > package.json << 'EOF'
{
  "name": "masclet-imperi-frontend",
  "type": "module",
  "version": "1.0.0",
  "description": "Frontend para Masclet Imperi",
  "main": "fix-server-definitivo.js",
  "scripts": {
    "start": "node fix-server-definitivo.js"
  },
  "dependencies": {
    "@astrojs/internal-helpers": "^0.2.0",
    "@astrojs/node": "^8.2.0",
    "compression": "^1.7.4",
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6"
  }
}
EOF

echo "🔨 Reconstruyendo imagen Docker..."
docker build -t masclet-frontend:definitivo .

echo "🚀 Iniciando contenedor frontend..."
docker run -d \
  --name masclet-frontend \
  --restart always \
  --network masclet-network \
  -p 80:80 \
  -e NODE_ENV=production \
  -e PORT=80 \
  -e HOST=0.0.0.0 \
  -e BACKEND_URL=http://masclet-api:8000 \
  masclet-frontend:definitivo

echo "✅ DESPLIEGUE COMPLETADO"
