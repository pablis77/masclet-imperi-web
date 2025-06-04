#!/bin/bash
# SOLUCIÓN DEFINITIVA PARA MASCLET IMPERI FRONTEND
# Este script resuelve el problema de dependencias de React en el contenedor Docker

echo ">>> INICIANDO SOLUCIÓN DEFINITIVA PARA MASCLET IMPERI FRONTEND <<<"
echo ">>> Deteniendo contenedor frontend anterior si existe..."
docker stop masclet-frontend || true
docker rm masclet-frontend || true

# Crear un directorio temporal para la solución
mkdir -p temp_solution
cd temp_solution

# Crear package.json con todas las dependencias necesarias
echo ">>> Creando package.json con todas las dependencias necesarias..."
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

# Crear servidor Express optimizado
echo ">>> Creando servidor Express optimizado..."
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
    const { handler } = await import('./dist/server/entry.mjs');
    return handler(req, res, next);
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

# Crear Dockerfile optimizado
echo ">>> Creando Dockerfile optimizado..."
cat > Dockerfile << 'EOL'
# Usar Node.js LTS (no Alpine para evitar problemas)
FROM node:18

WORKDIR /app

# Copiar package.json y servidor Express
COPY package.json server.js ./

# Instalar dependencias (incluyendo las de desarrollo para SSR)
RUN npm install

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

# Construir la imagen Docker
echo ">>> Construyendo imagen Docker..."
docker build -t masclet-frontend:definitivo .

# Ejecutar el contenedor
echo ">>> Ejecutando el contenedor..."
docker run -d \
  --name masclet-frontend \
  --network masclet-network \
  -p 80:80 \
  -e NODE_ENV=production \
  -e BACKEND_URL=http://masclet-api:8000 \
  --restart always \
  masclet-frontend:definitivo

echo ">>> Limpiando archivos temporales..."
cd ..
# Mantener la carpeta temp_solution para referencia

echo ">>> SOLUCIÓN COMPLETADA <<<"
echo ">>> Verificando estado del contenedor..."
docker ps | grep masclet-frontend

echo ">>> Para ver los logs del contenedor:"
echo "docker logs masclet-frontend"
