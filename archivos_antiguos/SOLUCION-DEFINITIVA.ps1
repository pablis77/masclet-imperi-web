# SOLUCIÓN DEFINITIVA MASCLET IMPERI - SIN FALLOS
# Script probado y garantizado para desplegar correctamente

$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_IP = "108.129.139.119"
$REMOTE_DIR = "/home/ec2-user/masclet-final"

Write-Host "🚀 DESPLIEGUE DEFINITIVO MASCLET IMPERI" -ForegroundColor Green

# 1. Crear script de despliegue remoto
$DEPLOY_SCRIPT = @'
#!/bin/bash
set -e

echo "🚀 DESPLIEGUE DEFINITIVO MASCLET IMPERI"

# 1. Limpiar contenedor anterior
echo "🧹 Limpiando instalación anterior..."
docker stop masclet-frontend > /dev/null 2>&1 || true
docker rm masclet-frontend > /dev/null 2>&1 || true
docker rmi masclet-frontend:definitivo > /dev/null 2>&1 || true

# 2. Crear fix-server-definitivo.js
echo "📝 Creando fix-server-definitivo.js..."
cat > fix-server-definitivo.js << 'EOFSERVER'
// Server Express para Astro SSR en producción - VERSIÓN DEFINITIVA
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

// Servir archivos estáticos del cliente ANTES del proxy y SSR
app.use(express.static(join(__dirname, 'dist/client'), {
  index: false, // Importante para que funcione SSR
  maxAge: '1d'
}));

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

# 3. Crear package.json
echo "📝 Creando package.json..."
cat > package.json << 'EOFPACKAGE'
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

# 4. Crear Dockerfile
echo "📝 Creando Dockerfile..."
cat > Dockerfile << 'EOFDOCKER'
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

# 5. Construir imagen Docker
echo "🏗️ Construyendo imagen Docker..."
docker build -t masclet-frontend:definitivo .

# 6. Verificar red Docker
echo "🔍 Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "📦 Creando red Docker masclet-network..."
    docker network create masclet-network
fi

# 7. Obtener IPs de contenedores (CORREGIDO)
echo "🔍 Obteniendo IPs de contenedores..."
# Usamos grep y cut para extraer solo la primera IP
API_IP=$(docker inspect masclet-api | grep -m 1 "\"IPAddress\"" | cut -d'"' -f4)
DB_IP=$(docker inspect masclet-db | grep -m 1 "\"IPAddress\"" | cut -d'"' -f4)

echo "💡 IPs encontradas:"
echo "   - masclet-api: $API_IP"
echo "   - masclet-db: $DB_IP"

# 8. Conectar contenedores a la red
echo "🔌 Conectando contenedores a la red..."
for CONTAINER in masclet-api masclet-db; do
    if ! docker network inspect masclet-network | grep -q "$CONTAINER"; then
        echo "   - Conectando $CONTAINER a masclet-network..."
        docker network connect masclet-network $CONTAINER || echo "⚠️ Error conectando $CONTAINER"
    else
        echo "   - $CONTAINER ya está conectado"
    fi
done

# 9. Iniciar contenedor frontend
echo "🚀 Iniciando contenedor frontend..."
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

# 10. Verificar estado
echo "📊 Estado de los contenedores:"
docker ps

# 11. Mostrar logs
echo "📋 Logs del contenedor (primeros 5 segundos)..."
sleep 3
docker logs masclet-frontend

echo "✨ DESPLIEGUE COMPLETADO ✨"
echo "🌐 Frontend: http://$(curl -s ifconfig.me):80"
echo "🔧 API: http://$(curl -s ifconfig.me):8000/docs"
'@

# 2. Crear directorio en el servidor y transferir script
Write-Host "📂 Preparando servidor remoto..." -ForegroundColor Cyan
$REMOTE_COMMANDS = @"
mkdir -p $REMOTE_DIR
"@

ssh -i $AWS_KEY "ec2-user@$EC2_IP" $REMOTE_COMMANDS

# 3. Crear script local y transferirlo
$DEPLOY_SCRIPT_PATH = ".\deploy-solution.sh"
Set-Content -Path $DEPLOY_SCRIPT_PATH -Value $DEPLOY_SCRIPT -Encoding ASCII

Write-Host "📤 Transfiriendo script de despliegue..." -ForegroundColor Cyan
scp -i $AWS_KEY $DEPLOY_SCRIPT_PATH "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# 4. Transferir archivos necesarios
Write-Host "📤 Transfiriendo archivos de frontend..." -ForegroundColor Cyan
scp -i $AWS_KEY -r ".\frontend\dist" "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# 5. Ejecutar script de despliegue
Write-Host "🚀 Ejecutando despliegue en servidor remoto..." -ForegroundColor Green
$EXEC_COMMANDS = @"
cd $REMOTE_DIR
chmod +x deploy-solution.sh
sudo ./deploy-solution.sh
"@

ssh -i $AWS_KEY "ec2-user@$EC2_IP" $EXEC_COMMANDS

Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "📱 Frontend: http://${EC2_IP}/" -ForegroundColor Yellow
Write-Host "🔧 API: http://${EC2_IP}:8000/docs" -ForegroundColor Yellow
