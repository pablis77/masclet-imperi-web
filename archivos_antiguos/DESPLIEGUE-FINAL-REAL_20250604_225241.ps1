# DESPLIEGUE FINAL REAL - SOLUCIÓN DEFINITIVA
# Sin parches, sin chapuzas, sin mierdas

$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_IP = "108.129.139.119"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-final"

Write-Host "🚀 DESPLIEGUE DEFINITIVO MASCLET IMPERI" -ForegroundColor Green

# 1. Crear directorio temporal
$TEMP_DIR = ".\deployment\temp-final"
if (Test-Path $TEMP_DIR) { Remove-Item -Recurse -Force $TEMP_DIR }
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# 2. Crear fix-server-definitivo.js
Write-Host "📝 Creando fix-server-definitivo.js..." -ForegroundColor Cyan
$FIX_SERVER_CONTENT = @'
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
'@
Set-Content -Path "$TEMP_DIR\fix-server-definitivo.js" -Value $FIX_SERVER_CONTENT

# 3. Crear package.json
Write-Host "📝 Creando package.json..." -ForegroundColor Cyan
$PACKAGE_JSON_CONTENT = @'
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
'@
Set-Content -Path "$TEMP_DIR\package.json" -Value $PACKAGE_JSON_CONTENT

# 4. Crear Dockerfile
Write-Host "📝 Creando Dockerfile..." -ForegroundColor Cyan
$DOCKERFILE_CONTENT = @'
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
'@
Set-Content -Path "$TEMP_DIR\Dockerfile" -Value $DOCKERFILE_CONTENT

# 5. Crear script de despliegue remoto
Write-Host "📝 Creando script de despliegue remoto..." -ForegroundColor Cyan
$DEPLOY_SCRIPT_CONTENT = @'
#!/bin/bash

echo "🚀 DESPLIEGUE DEFINITIVO MASCLET IMPERI"

# 1. Limpiar contenedor anterior
echo "🧹 Limpiando instalación anterior..."
docker stop masclet-frontend > /dev/null 2>&1
docker rm masclet-frontend > /dev/null 2>&1
docker rmi masclet-frontend:definitivo > /dev/null 2>&1

# 2. Construir imagen Docker
echo "🏗️ Construyendo imagen Docker..."
docker build -t masclet-frontend:definitivo .

# 3. Verificar red Docker
echo "🔍 Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "📦 Creando red Docker masclet-network..."
    docker network create masclet-network
fi

# 4. Obtener IPs de contenedores (una por una para evitar concatenación)
echo "🔍 Obteniendo IP de masclet-api..."
API_IP=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" masclet-api | tr -d '\r\n')
echo "🔍 Obteniendo IP de masclet-db..."
DB_IP=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" masclet-db | tr -d '\r\n')

echo "💡 IPs encontradas:"
echo "   - masclet-api: $API_IP"
echo "   - masclet-db: $DB_IP"

# 5. Conectar contenedores a la red
echo "🔌 Conectando contenedores a la red..."
for CONTAINER in masclet-api masclet-db; do
    if ! docker network inspect masclet-network | grep -q "$CONTAINER"; then
        echo "   - Conectando $CONTAINER a masclet-network..."
        docker network connect masclet-network $CONTAINER || echo "⚠️ Error conectando $CONTAINER"
    else
        echo "   - $CONTAINER ya está conectado"
    fi
done

# 6. Iniciar contenedor frontend
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

# 7. Verificar estado
echo "📊 Estado de los contenedores:"
docker ps

# 8. Mostrar logs
echo "📋 Logs del contenedor (primeros 5 segundos)..."
sleep 3
docker logs masclet-frontend

echo "✨ DESPLIEGUE COMPLETADO ✨"
echo "🌐 Frontend: http://$(curl -s ifconfig.me):80"
echo "🔧 API: http://$(curl -s ifconfig.me):8000/docs"
'@
Set-Content -Path "$TEMP_DIR\deploy.sh" -Value $DEPLOY_SCRIPT_CONTENT -Encoding ASCII

# 6. Copiar archivos necesarios
Write-Host "📂 Copiando archivos necesarios..." -ForegroundColor Cyan
Copy-Item -Path ".\frontend\dist" -Destination "$TEMP_DIR\" -Recurse
Copy-Item -Path ".\frontend\client-hydration-fix.js" -Destination "$TEMP_DIR\"

# 7. Comprimir y transferir
Write-Host "🗜️ Comprimiendo y transfiriendo..." -ForegroundColor Cyan
$ZIP_FILE = "$TEMP_DIR\frontend-deploy-final.zip"
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $ZIP_FILE -Force

# 8. Crear directorio remoto y transferir
Write-Host "📤 Transfiriendo a servidor AWS..." -ForegroundColor Cyan
ssh -i $AWS_KEY "ec2-user@$EC2_IP" "mkdir -p $REMOTE_DIR"
scp -i $AWS_KEY $ZIP_FILE "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# 9. Ejecutar despliegue remoto
Write-Host "🚀 Ejecutando despliegue remoto..." -ForegroundColor Green
ssh -i $AWS_KEY "ec2-user@$EC2_IP" "cd $REMOTE_DIR && unzip -o frontend-deploy-final.zip && chmod +x deploy.sh && sudo ./deploy.sh"

Write-Host "✅ DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "📱 Frontend: http://${EC2_IP}/" -ForegroundColor Yellow
Write-Host "🔧 API: http://${EC2_IP}:8000/docs" -ForegroundColor Yellow
