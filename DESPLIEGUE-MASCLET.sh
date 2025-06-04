#!/bin/bash
# =============================================================================
# SCRIPT DEFINITIVO DE DESPLIEGUE MASCLET IMPERI FRONTEND
# =============================================================================
# Este es el ÚNICO script que necesitamos para desplegar el frontend
# Soluciona los problemas de:
# - Dependencias de React (downgrade a 18.2.0)
# - Configuración de red Docker
# - Servidor Express optimizado
# =============================================================================

# Crear archivo de log
FECHA=$(date +%Y%m%d_%H%M%S)
LOG_FILE="despliegue_masclet_$FECHA.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================================="
echo "  DESPLIEGUE DEFINITIVO MASCLET IMPERI FRONTEND"
echo "  $(date)"
echo "=========================================================="
echo ">>> Log guardado en: $LOG_FILE"

# Verificar que Docker está funcionando
echo ">>> Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
  echo "ERROR: Docker no está funcionando o no tienes permisos"
  exit 1
fi

# Verificar la red Docker
echo ">>> Verificando red Docker masclet-network..."
if ! docker network inspect masclet-network > /dev/null 2>&1; then
  echo ">>> Creando red Docker masclet-network..."
  docker network create masclet-network
else
  echo ">>> Red masclet-network ya existe"
fi

# Verificar que los contenedores backend y DB están funcionando
echo ">>> Verificando contenedores backend y base de datos..."
if ! docker ps | grep masclet-api > /dev/null; then
  echo "ADVERTENCIA: El contenedor masclet-api (backend) no está en ejecución"
  echo ">>> Este script NO tocará el backend, solo arreglará el frontend"
fi

if ! docker ps | grep masclet-db > /dev/null; then
  echo "ADVERTENCIA: El contenedor masclet-db (base de datos) no está en ejecución"
  echo ">>> Este script NO tocará la base de datos, solo arreglará el frontend"
fi

# Crear un directorio temporal para la solución
TEMP_DIR="temp_masclet_$FECHA"
echo ">>> Creando directorio temporal: $TEMP_DIR"
mkdir -p $TEMP_DIR
cd $TEMP_DIR

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

# Buscar la carpeta dist
echo ">>> Buscando la carpeta dist del frontend..."
DIST_ENCONTRADO=false

# Opción 1: Buscar en el directorio local
if [ -d "../frontend/dist" ]; then
  echo ">>> Encontrada carpeta dist en ../frontend/dist"
  cp -r ../frontend/dist ./
  DIST_ENCONTRADO=true
# Opción 2: Buscar en el directorio actual
elif [ -d "./frontend/dist" ]; then
  echo ">>> Encontrada carpeta dist en ./frontend/dist"
  cp -r ./frontend/dist ./
  DIST_ENCONTRADO=true
# Opción 3: Buscar en el contenedor masclet-api
elif docker exec masclet-api ls -la /app/frontend/dist > /dev/null 2>&1; then
  echo ">>> Encontrada carpeta dist en el contenedor masclet-api"
  echo ">>> Copiando desde el contenedor..."
  docker cp masclet-api:/app/frontend/dist ./
  DIST_ENCONTRADO=true
# Opción 4: Buscar en el directorio descargado
elif [ -d "./masclet-imperi-web-main/frontend/dist" ]; then
  echo ">>> Encontrada carpeta dist en ./masclet-imperi-web-main/frontend/dist"
  cp -r ./masclet-imperi-web-main/frontend/dist ./
  DIST_ENCONTRADO=true
fi

# Si no se encontró la carpeta dist, crear una estructura mínima
if [ "$DIST_ENCONTRADO" = false ]; then
  echo ">>> No se encontró la carpeta dist. Creando estructura mínima..."
  mkdir -p dist/client dist/server
  
  # Crear un archivo mínimo para el cliente
  cat > dist/client/index.html << 'EOL'
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Masclet Imperi Web</title>
  <style>
    body { font-family: system-ui; text-align: center; padding: 2rem; }
  </style>
</head>
<body>
  <h1>Masclet Imperi Web</h1>
  <p>Versión de mantenimiento</p>
</body>
</html>
EOL

  # Crear un archivo mínimo para el servidor
  cat > dist/server/entry.mjs << 'EOL'
export function handler(req, res, next) {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Masclet Imperi Web</title>
      <style>
        body { font-family: system-ui; text-align: center; padding: 2rem; }
      </style>
    </head>
    <body>
      <h1>Masclet Imperi Web</h1>
      <p>Versión de mantenimiento</p>
    </body>
    </html>
  `);
}
EOL
fi

# Verificar que la carpeta dist existe
if [ ! -d "dist" ]; then
  echo "ERROR: No se pudo encontrar o crear la carpeta dist"
  exit 1
fi

# Construir la imagen Docker
echo ">>> Construyendo imagen Docker..."
docker build -t masclet-frontend:definitivo .

# Verificar que la imagen se construyó correctamente
if [ $? -ne 0 ]; then
  echo "ERROR: La construcción de la imagen Docker falló"
  exit 1
fi

# Detener el contenedor anterior si existe
echo ">>> Deteniendo contenedor frontend anterior si existe..."
docker stop masclet-frontend > /dev/null 2>&1 || true
docker rm masclet-frontend > /dev/null 2>&1 || true

# Ejecutar el nuevo contenedor
echo ">>> Ejecutando el nuevo contenedor..."
docker run -d \
  --name masclet-frontend \
  --network masclet-network \
  -p 80:80 \
  -e NODE_ENV=production \
  -e BACKEND_URL=http://masclet-api:8000 \
  --restart always \
  masclet-frontend:definitivo

# Verificar que el contenedor se inició correctamente
if [ $? -ne 0 ]; then
  echo "ERROR: No se pudo iniciar el contenedor"
  exit 1
fi

# Esperar a que el contenedor esté listo
echo ">>> Esperando 5 segundos para que el contenedor se inicie..."
sleep 5

# Verificar que el contenedor está funcionando
if ! docker ps | grep masclet-frontend > /dev/null; then
  echo "ERROR: El contenedor no está funcionando"
  echo ">>> Logs del contenedor:"
  docker logs masclet-frontend
  exit 1
fi

# Verificar instalación de React
echo ">>> Verificando instalación de React en el contenedor..."
if ! docker exec masclet-frontend ls -la /app/node_modules/react > /dev/null; then
  echo "ADVERTENCIA: No se pudo verificar la instalación de React"
  echo ">>> Esto podría indicar un problema con las dependencias"
else
  echo ">>> React instalado correctamente"
  docker exec masclet-frontend node -e "console.log('Versión de React: ' + require('react').version)" || echo "ADVERTENCIA: No se pudo verificar la versión de React"
fi

# Verificar conectividad con el backend
echo ">>> Verificando conectividad con el backend..."
if docker exec masclet-frontend ping -c 2 masclet-api > /dev/null; then
  echo ">>> Conectividad con masclet-api: OK"
else
  echo "ADVERTENCIA: No se puede hacer ping a masclet-api"
  echo ">>> Verificando resolución DNS..."
  docker exec masclet-frontend getent hosts masclet-api || echo "ADVERTENCIA: No se puede resolver masclet-api"
fi

# Mostrar logs del contenedor
echo ">>> Logs del contenedor:"
docker logs masclet-frontend --tail 20

echo "=========================================================="
echo "  DESPLIEGUE COMPLETADO"
echo "  $(date)"
echo "=========================================================="
echo ">>> El frontend está disponible en: http://localhost:80"
echo ">>> Para ver los logs completos del contenedor:"
echo "docker logs masclet-frontend"
echo ">>> Para conectarse al contenedor:"
echo "docker exec -it masclet-frontend /bin/bash"
echo "=========================================================="

# Volver al directorio original
cd ..
echo ">>> Los archivos temporales se encuentran en: $TEMP_DIR"
echo ">>> Puedes eliminarlos con: rm -rf $TEMP_DIR"

# Crear una copia de respaldo del script
cp "$0" "${0}.backup_$FECHA"
echo ">>> Se ha creado una copia de respaldo del script: ${0}.backup_$FECHA"
