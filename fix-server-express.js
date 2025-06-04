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

// IMPORTANTE: Configurar rutas API ANTES del handler SSR
// Esto asegura que las peticiones a la API se envíen al backend
// y no sean capturadas por el SSR
app.use('/api/v1', apiProxy);

// Servir archivos estáticos del cliente con caché
app.use(express.static(join(__dirname, 'dist/client'), {
  index: false,
  maxAge: '1d'
}));

// Añadir un middleware para verificar y loguear todas las peticiones
app.use((req, res, next) => {
  console.log(`>>> Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Handler para SSR con manejo de errores detallado
// IMPORTANTE: Este middleware debe ir DESPUÉS de la configuración del proxy API
app.use(async (req, res, next) => {
  // Evitar que las rutas de la API sean procesadas por SSR
  if (req.url.startsWith('/api/v1')) {
    console.log(`>>> Saltando SSR para ruta API: ${req.url}`);
    return next();
  }

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
