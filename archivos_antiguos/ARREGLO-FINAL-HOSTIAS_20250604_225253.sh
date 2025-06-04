#!/bin/bash
set -e

echo "🚀 ARREGLO DEFINITIVO DE VERDAD"

# Parar y eliminar el contenedor frontend si existe
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true

# Obtener las IPs de forma correcta - ARREGLADO DE VERDAD
echo "🔍 Obteniendo IPs correctamente..."

# Método que FUNCIONA SEGURO
API_IP=$(docker inspect masclet-api | grep -o '"IPAddress": "[0-9.]*"' | head -1 | grep -o '[0-9.]*')
DB_IP=$(docker inspect masclet-db | grep -o '"IPAddress": "[0-9.]*"' | head -1 | grep -o '[0-9.]*')

# Verificar que tenemos IPs válidas
if [ -z "$API_IP" ] || [ "$API_IP" == "" ]; then
    echo "⚠️ Usando IP hardcodeada para masclet-api"
    API_IP="172.17.0.2"
fi

if [ -z "$DB_IP" ] || [ "$DB_IP" == "" ]; then
    echo "⚠️ Usando IP hardcodeada para masclet-db"
    DB_IP="172.17.0.3"
fi

echo "🔍 IPs encontradas:"
echo "   - masclet-api: $API_IP"
echo "   - masclet-db: $DB_IP"

echo "🚀 Iniciando contenedor frontend..."
docker run -d \
  --name masclet-frontend \
  --restart always \
  --network masclet-network \
  --add-host=masclet-api:$API_IP \
  --add-host=masclet-db:$DB_IP \
  -p 80:80 \
  -e NODE_ENV=production \
  -e PORT=80 \
  -e HOST=0.0.0.0 \
  -e BACKEND_URL=http://masclet-api:8000 \
  masclet-frontend:definitivo

echo "✅ DESPLIEGUE COMPLETADO"
echo "📱 Frontend: http://$(curl -s ifconfig.me)/"
echo "🔧 API: http://$(curl -s ifconfig.me):8000/docs"
