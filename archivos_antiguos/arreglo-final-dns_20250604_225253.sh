#!/bin/bash

echo "🚀 ARREGLO DEFINITIVO - Solución de todos los problemas de una vez"

# 1. CORRECCIÓN DE CONFIGURACIÓN DE SERVIDOR EXPRESS Y PROXY
echo "📝 Creando fix-server-definitivo.js con configuración correcta..."

cat > /tmp/fix-server-definitivo.js << 'EOFSERVER'
// Server Express para Astro SSR en producción - VERSIÓN CORREGIDA DEFINITIVA
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import fs from 'fs';

// Configuración básica
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_URL = process.env.BACKEND_URL || 'http://masclet-api:8000';

console.log(`>>> Masclet Imperi - Servidor de producción`);
console.log(`>>> Configurando proxy API hacia: ${BACKEND_URL}`);
console.log(`>>> __dirname: ${__dirname}`);

// Comprobar si existen directorios importantes
if (fs.existsSync(join(__dirname, 'dist/client'))) {
  console.log('✅ Directorio dist/client encontrado');
} else {
  console.error('❌ ERROR: Directorio dist/client NO ENCONTRADO');
}

if (fs.existsSync(join(__dirname, 'dist/server'))) {
  console.log('✅ Directorio dist/server encontrado');
} else {
  console.error('❌ ERROR: Directorio dist/server NO ENCONTRADO');
}

// Compresión para mejorar rendimiento
app.use(compression());

// Ruta de verificación simple
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Configurar proxy para backend - CORREGIDO SIN DUPLICACIÓN DE RUTAS
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1': '/api/v1' }, // No duplicamos rutas
  secure: false,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Error en proxy:', err);
    res.status(500).send('Error conectando con la API. Detalles: ' + err.message);
  }
});

// Servir archivos estáticos del cliente ANTES del proxy y SSR
app.use(express.static(join(__dirname, 'dist/client'), {
  index: false, // Importante para que funcione SSR
  maxAge: '1d'
}));

// Configurar rutas API - EVITAMOS DUPLICACIÓN DE PREFIJOS
console.log(">>> Configurando proxy en /api/v1 hacia " + BACKEND_URL);
app.use('/api/v1', apiProxy);

// Ruta para depuración
app.get('/debug-info', (req, res) => {
  const info = {
    dirname: __dirname,
    backendUrl: BACKEND_URL,
    clientDirExists: fs.existsSync(join(__dirname, 'dist/client')),
    serverDirExists: fs.existsSync(join(__dirname, 'dist/server')),
    staticFilesExample: fs.existsSync(join(__dirname, 'dist/client/_astro')) 
      ? fs.readdirSync(join(__dirname, 'dist/client/_astro')).slice(0, 5) 
      : 'No encontrado'
  };
  res.json(info);
});

// Handler para SSR - DESPUÉS de archivos estáticos y proxy
app.use(async (req, res, next) => {
  try {
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
          <p>Error: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Iniciar servidor con manejo de errores
try {
  app.listen(PORT, HOST, () => {
    console.log(`>>> Servidor iniciado en http://${HOST}:${PORT}`);
  });
} catch (err) {
  console.error('Error fatal al iniciar servidor:', err);
}
EOFSERVER

# 2. OBTENER IPS Y DETENER CONTENEDOR ACTUAL
echo "🔍 Obteniendo IPs de contenedores..."
API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' masclet-api)
DB_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' masclet-db)

echo "💡 Encontradas: masclet-api=$API_IP, masclet-db=$DB_IP"

echo "🛑 Deteniendo el contenedor frontend..."
docker stop masclet-frontend > /dev/null 2>&1
docker rm masclet-frontend > /dev/null 2>&1

# 3. CREAR NUEVO DOCKERFILE CON TODOS LOS ARREGLOS
echo "📝 Creando Dockerfile definitivo..."
cat > /tmp/Dockerfile-definitivo << 'EOFDOCKER'
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copia archivos de configuración
COPY package.json ./

# Instala dependencias
RUN npm install

# Copia archivos de aplicación
COPY dist/ ./dist/
COPY fix-server-definitivo.js ./
COPY ./client-hydration-fix.js ./

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://masclet-api:8000

# Puerto expuesto
EXPOSE 80

# Comando de inicio
CMD ["node", "fix-server-definitivo.js"]
EOFDOCKER

# 4. CONSTRUIR IMAGEN DEFINITIVA Y EJECUTARLA
echo "🔧 Creando package.json definitivo..."
cat > /tmp/package.json << 'EOFPACKAGE'
{
  "name": "masclet-frontend",
  "version": "1.0.0",
  "main": "fix-server-definitivo.js",
  "type": "module",
  "scripts": {
    "start": "node fix-server-definitivo.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "http-proxy-middleware": "^2.0.6",
    "node-fetch": "^3.3.0"
  }
}
EOFPACKAGE

# 5. CREAR DIRECTORIO TEMPORAL Y COPIAR ARCHIVOS NECESARIOS
echo "📂 Preparando archivos para imagen definitiva..."
mkdir -p /tmp/masclet-fix
cp -r /home/ec2-user/masclet-imperi-frontend/dist /tmp/masclet-fix/
cp -r /home/ec2-user/masclet-imperi-frontend/client-hydration-fix.js /tmp/masclet-fix/
cp /tmp/fix-server-definitivo.js /tmp/masclet-fix/
cp /tmp/package.json /tmp/masclet-fix/
cp /tmp/Dockerfile-definitivo /tmp/masclet-fix/Dockerfile

# 6. CONSTRUIR Y EJECUTAR CONTENEDOR DEFINITIVO
echo "🏗️ Construyendo imagen Docker definitiva..."
cd /tmp/masclet-fix
docker build -t masclet-frontend:definitivo .

echo "🚀 Ejecutando contenedor frontend definitivo..."
docker run -d --name masclet-frontend \
    -p 80:80 \
    -e NODE_ENV=production \
    -e PORT=80 \
    -e HOST=0.0.0.0 \
    -e BACKEND_URL=http://masclet-api:8000 \
    --add-host=masclet-api:$API_IP \
    --add-host=masclet-db:$DB_IP \
    --network masclet-network \
    --restart unless-stopped \
    masclet-frontend:definitivo

# 7. VERIFICAR RESOLUCIÓN DNS Y LOGS
echo "📊 Estado de los contenedores:"
docker ps

echo "✅ Mostrando logs del contenedor nuevo (3 segundos):"
sleep 3
docker logs masclet-frontend

echo "🔍 Verificando resolución DNS dentro del contenedor..."
docker exec masclet-frontend cat /etc/hosts

echo "✨ DESPLIEGUE DEFINITIVO COMPLETADO ✨"
echo "🌐 Frontend disponible en: http://$(curl -s ifconfig.me):80"
echo "📚 API docs disponibles en: http://$(curl -s ifconfig.me):8000/api/v1/docs"
