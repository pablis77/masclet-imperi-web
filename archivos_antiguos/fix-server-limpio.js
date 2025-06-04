// Server Express para Astro SSR en producción
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

console.log(`>>> Configurando proxy API hacia: ${BACKEND_URL}`);

// Compresión para mejorar rendimiento
app.use(compression());

// Configurar proxy para backend - CORREGIDO SIN DUPLICACIÓN DE RUTAS
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1': '/api/v1' }, // No duplicamos las rutas
  secure: false,
  logLevel: 'debug'
});

// Servir archivos estáticos del cliente
app.use(express.static(join(__dirname, 'dist/client')));

// Configurar rutas API - EVITAMOS DUPLICACIÓN DE PREFIJOS
console.log(">>> Configurando proxy en /api y /api/v1 hacia " + BACKEND_URL);
console.log(">>> IMPORTANTE: No interceptando rutas directas para evitar conflictos con el frontend");
app.use('/api/v1', apiProxy);

// Handler para SSR
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
        </body>
      </html>
    `);
  }
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`>>> Servidor iniciado en http://${HOST}:${PORT}`);
});
