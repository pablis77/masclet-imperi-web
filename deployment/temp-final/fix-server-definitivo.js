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
