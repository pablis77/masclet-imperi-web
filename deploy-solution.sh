#!/bin/bash
set -e

echo "🚀 DESPLIEGUE DEFINITIVO MASCLET IMPERI"
echo "🧹 Limpiando instalación anterior..."
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true
docker rmi masclet-frontend:definitivo 2>/dev/null || true

echo "📝 Creando fix-server-definitivo.js..."
cat > fix-server-definitivo.js << 'EOF'
// fix-server-definitivo.js - Servidor Express optimizado para Masclet Imperi
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

// Configuración
const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_URL = process.env.BACKEND_URL || 'http://masclet-api:8000';
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(`🚀 Iniciando servidor en ${HOST}:${PORT}`);
console.log(`🔌 Backend configurado en: ${BACKEND_URL}`);

const app = express();

// Compresión para mejorar rendimiento
app.use(compression());

// Configuración de proxy para API
// IMPORTANTE: No duplicamos /api/v1 en pathRewrite
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1': '/api/v1' }, // Mantiene la ruta igual
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error');
  }
});

// Aplicar proxy solo a rutas /api/v1
app.use('/api/v1', apiProxy);

// Servir archivos estáticos con cache
app.use(express.static(join(__dirname, 'dist/client'), { 
  index: false, 
  maxAge: '1d'
}));

// Manejo de SSR para todas las demás rutas
app.use(async (req, res, next) => {
  try {
    const { handler } = await import('./dist/server/entry.mjs');
    await handler(req, res, next);
  } catch (error) {
    console.error('Error en SSR:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`✅ Servidor corriendo en http://${HOST}:${PORT}`);
});
EOF

echo "📝 Creando package.json..."
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
    "compression": "^1.7.4",
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6"
  }
}
EOF

echo "📝 Creando Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY dist/ ./dist/
COPY fix-server-definitivo.js ./

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://masclet-api:8000

EXPOSE 80

CMD ["node", "fix-server-definitivo.js"]
EOF

echo "🔨 Construyendo imagen Docker..."
docker build -t masclet-frontend:definitivo .

echo "🌐 Verificando red Docker..."
docker network inspect masclet-network >/dev/null 2>&1 || docker network create masclet-network

# SOLUCIÓN GARANTIZADA: Obtener IPs con formato correcto
echo "🔍 Obteniendo IPs de contenedores..."

# Método 1: Usar docker inspect con formato específico y grep para extraer solo la IP
API_IP=$(docker inspect masclet-api | grep -o '"IPAddress": "[0-9.]*"' | head -1 | cut -d'"' -f4)
DB_IP=$(docker inspect masclet-db | grep -o '"IPAddress": "[0-9.]*"' | head -1 | cut -d'"' -f4)

# Verificar que tenemos IPs válidas
if [ -z "$API_IP" ]; then
    echo "⚠️ No se pudo obtener la IP de masclet-api, usando método alternativo..."
    # Método alternativo
    API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' masclet-api | tr -d '\n' | cut -d' ' -f1)
fi

if [ -z "$DB_IP" ]; then
    echo "⚠️ No se pudo obtener la IP de masclet-db, usando método alternativo..."
    # Método alternativo
    DB_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' masclet-db | tr -d '\n' | cut -d' ' -f1)
fi

echo "🔍 IPs encontradas:"
echo "   - masclet-api: $API_IP"
echo "   - masclet-db: $DB_IP"

# Verificar que tenemos IPs válidas antes de continuar
if [ -z "$API_IP" ] || [ -z "$DB_IP" ]; then
    echo "❌ ERROR: No se pudieron obtener IPs válidas. Usando IPs hardcodeadas de respaldo."
    # IPs de respaldo (comunes en redes Docker)
    API_IP="172.17.0.2"
    DB_IP="172.17.0.3"
    echo "   - Usando IP de respaldo para masclet-api: $API_IP"
    echo "   - Usando IP de respaldo para masclet-db: $DB_IP"
fi

echo "🔌 Conectando contenedores a la red..."
docker network connect masclet-network masclet-api 2>/dev/null || echo "   - masclet-api ya está conectado"
docker network connect masclet-network masclet-db 2>/dev/null || echo "   - masclet-db ya está conectado"

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
