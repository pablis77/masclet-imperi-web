#!/bin/bash
# Script para arreglar las dependencias de React en el contenedor frontend
# Este script se centra específicamente en el problema de las dependencias faltantes

echo ">>> INICIANDO ARREGLO DE DEPENDENCIAS DE REACT <<<"

# Crear un directorio temporal para la solución
mkdir -p temp_react_fix
cd temp_react_fix

# Crear package.json con React 18.2.0 (downgrade desde 19.0.0)
echo ">>> Creando package.json con React 18.2.0..."
cat > package.json << 'EOL'
{
  "name": "masclet-imperi-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@astrojs/node": "^8.3.4",
    "@astrojs/react": "^4.2.1",
    "@astrojs/tailwind": "^5.0.0",
    "@iconify-json/mdi": "^1.2.3",
    "@tremor/react": "^3.18.7",
    "astro-icon": "^1.1.5",
    "axios": "^1.4.0",
    "bootstrap": "^5.3.3",
    "chart.js": "^4.3.0",
    "compression": "^1.7.4",
    "express": "^4.21.2",
    "http-proxy-middleware": "^3.0.5",
    "jwt-decode": "^4.0.0",
    "nanostores": "^1.0.1",
    "node-fetch": "^3.3.2",
    "postcss-nesting": "^12.0.2",
    "react": "^18.2.0",
    "react-bootstrap": "^2.10.9",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.5.2",
    "react-icons": "^5.5.0",
    "react-router-dom": "^6.22.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1"
  }
}
EOL

# Crear servidor Express simplificado
echo ">>> Creando servidor Express simplificado..."
cat > server.js << 'EOL'
// Server Express para Astro SSR en producción
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

// Configuración básica
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_URL = process.env.BACKEND_URL || 'http://masclet-api:8000';

console.log(`>>> Iniciando servidor en ${HOST}:${PORT}`);
console.log(`>>> Configurando proxy API hacia: ${BACKEND_URL}`);
console.log(`>>> Directorio actual: ${__dirname}`);

// Compresión para mejorar rendimiento
app.use(compression());

// Configurar proxy para backend - SIN DUPLICACIÓN DE RUTAS
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1': '/api/v1' },
  secure: false,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Error en proxy API:', err);
    res.status(500).send('Error al conectar con el backend');
  }
});

// Servir archivos estáticos del cliente con caché
app.use(express.static(join(__dirname, 'dist/client'), { 
  index: false,
  maxAge: '1d'
}));

// Configurar rutas API
app.use('/api/v1', apiProxy);

// Handler para SSR con manejo de errores detallado
app.use(async (req, res, next) => {
  try {
    console.log(`>>> Procesando petición SSR: ${req.url}`);
    
    // Verificar que existen los módulos necesarios
    try {
      console.log('>>> Verificando módulo react...');
      await import('react');
      console.log('>>> React cargado correctamente');
    } catch (err) {
      console.error('>>> Error al cargar React:', err);
      throw new Error('No se pudo cargar React. Verifica la instalación de dependencias.');
    }
    
    try {
      console.log('>>> Cargando handler SSR...');
      const { handler } = await import('./dist/server/entry.mjs');
      console.log('>>> Handler SSR cargado correctamente');
      return handler(req, res, next);
    } catch (err) {
      console.error('>>> Error al cargar el handler SSR:', err);
      throw err;
    }
  } catch (error) {
    console.error('Error en SSR:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>Masclet Imperi Web</title>
          <style>body{font-family:system-ui;text-align:center;padding:2rem}</style>
        </head>
        <body>
          <h1>Masclet Imperi Web</h1>
          <p>El servidor está en mantenimiento. Por favor, intente de nuevo en unos minutos.</p>
          <p><small>Error: ${error.message}</small></p>
        </body>
      </html>
    `);
  }
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`>>> Servidor iniciado en http://${HOST}:${PORT}`);
  console.log(`>>> Proxy API configurado hacia ${BACKEND_URL}`);
});
EOL

# Crear Dockerfile optimizado con verificación de dependencias
echo ">>> Creando Dockerfile optimizado..."
cat > Dockerfile << 'EOL'
# Usar Node.js LTS (no Alpine para evitar problemas)
FROM node:18

WORKDIR /app

# Copiar package.json y servidor Express
COPY package.json server.js ./

# Instalar dependencias con verificación
RUN npm install && \
    echo ">>> Verificando instalación de React..." && \
    node -e "require('react'); console.log('React instalado correctamente: ' + require('react').version);" && \
    echo ">>> Verificando instalación de React DOM..." && \
    node -e "require('react-dom'); console.log('React DOM instalado correctamente: ' + require('react-dom').version);"

# Copiar la build de Astro desde el host
COPY dist/ ./dist/

# Exponer puerto
EXPOSE 80

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://masclet-api:8000

# Comando para iniciar el servidor Express
CMD ["node", "server.js"]
EOL

# Copiar la carpeta dist desde el frontend
echo ">>> Copiando la carpeta dist desde el frontend..."
cp -r ../frontend/dist ./

# Construir la imagen Docker con verificación
echo ">>> Construyendo imagen Docker..."
docker build -t masclet-frontend:react18 .

# Detener el contenedor anterior
echo ">>> Deteniendo contenedor frontend anterior si existe..."
docker stop masclet-frontend || true
docker rm masclet-frontend || true

# Ejecutar el nuevo contenedor
echo ">>> Ejecutando el nuevo contenedor..."
docker run -d \
  --name masclet-frontend \
  --network masclet-network \
  -p 80:80 \
  -e NODE_ENV=production \
  -e BACKEND_URL=http://masclet-api:8000 \
  --restart always \
  masclet-frontend:react18

echo ">>> VERIFICACIÓN DE INSTALACIÓN <<<"
echo ">>> Esperando 5 segundos para que el contenedor se inicie..."
sleep 5
echo ">>> Verificando instalación de React en el contenedor..."
docker exec masclet-frontend ls -la /app/node_modules/react || echo "ERROR: React no está instalado correctamente"
docker exec masclet-frontend node -e "console.log('Versión de React: ' + require('react').version)" || echo "ERROR: No se puede cargar React"

echo ">>> Verificando logs del contenedor..."
docker logs masclet-frontend --tail 20

echo ">>> ARREGLO COMPLETADO <<<"
echo ">>> Para ver los logs completos del contenedor:"
echo "docker logs masclet-frontend"
