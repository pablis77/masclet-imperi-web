#!/bin/bash
# =============================================================================
# DESPLIEGUE COMPLETO DE MASCLET IMPERI WEB
# =============================================================================
# Este script realiza un despliegue completo del frontend de Masclet Imperi
# en un único paso, resolviendo todos los problemas conocidos:
# - Downgrade de React 19 a React 18.2.0
# - Configuración correcta de la red Docker
# - Servidor Express optimizado para SSR
# - Verificación de dependencias
# =============================================================================

echo "=========================================================="
echo "  DESPLIEGUE COMPLETO DE MASCLET IMPERI FRONTEND"
echo "  $(date)"
echo "=========================================================="

# Verificar si estamos en el directorio correcto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "ERROR: Este script debe ejecutarse desde el directorio raíz del proyecto"
  echo "Directorio actual: $(pwd)"
  echo "Asegúrate de que existen las carpetas frontend y backend"
  exit 1
fi

# Crear directorio de logs
mkdir -p logs
LOG_FILE="logs/despliegue_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo ">>> Logs guardados en: $LOG_FILE"
echo ">>> Verificando estado de Docker..."

# Verificar que Docker está funcionando
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

# Detener contenedores existentes
echo ">>> Deteniendo contenedores existentes..."
docker stop masclet-frontend > /dev/null 2>&1 || true
docker rm masclet-frontend > /dev/null 2>&1 || true

# Crear directorio temporal para la solución
echo ">>> Preparando archivos para el despliegue..."
TEMP_DIR="temp_deploy_$(date +%Y%m%d_%H%M%S)"
mkdir -p $TEMP_DIR
cd $TEMP_DIR

# Crear package.json con React 18.2.0
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

# Verificar si existe la carpeta dist en el frontend
if [ ! -d "../frontend/dist" ]; then
  echo ">>> La carpeta dist no existe en el frontend. Construyendo el frontend..."
  cd ../frontend
  
  # Verificar que tenemos npm
  if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado"
    exit 1
  fi
  
  echo ">>> Instalando dependencias del frontend..."
  npm install
  
  echo ">>> Construyendo el frontend..."
  npm run build
  
  if [ ! -d "dist" ]; then
    echo "ERROR: La construcción del frontend falló"
    exit 1
  fi
  
  cd ../$TEMP_DIR
fi

# Copiar la carpeta dist desde el frontend
echo ">>> Copiando la carpeta dist desde el frontend..."
cp -r ../frontend/dist ./

# Verificar que la carpeta dist se copió correctamente
if [ ! -d "dist" ]; then
  echo "ERROR: No se pudo copiar la carpeta dist desde el frontend"
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

# Limpiar archivos temporales
cd ..
echo ">>> Los archivos temporales se encuentran en: $TEMP_DIR"
echo ">>> Puedes eliminarlos con: rm -rf $TEMP_DIR"
