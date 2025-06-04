#!/bin/bash
# Script directo para arreglar el problema de las IPs

# Parar y eliminar el contenedor frontend si existe
docker stop masclet-frontend
docker rm masclet-frontend

# Conectar a la red
docker network connect masclet-network masclet-api
docker network connect masclet-network masclet-db

# SOLUCIÓN DIRECTA: Usar IPs hardcodeadas que funcionan siempre
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
