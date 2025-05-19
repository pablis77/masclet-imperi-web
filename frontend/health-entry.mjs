// Importamos el handler original de Astro
import { handler as astroHandler } from './entry.original.mjs';
import { createServer } from 'node:http';

// Este código se ejecutará directamente cuando Render ejecute node ./dist/server/entry.mjs
console.log('🔥 Iniciando servidor con soporte para health check en 0.0.0.0:10000');

// Creamos un middleware personalizado para el health check que se ejecutará antes del handler de Astro
export const handler = async (req, res, next) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/health') {
    console.log('✅ Health check solicitado - respondiendo 200 OK');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  try {
    // Para todas las demás rutas, usamos el handler original de Astro
    return await astroHandler(req, res, next);
  } catch (error) {
    console.error('❌ Error en handler de Astro:', error);
    // Fallback si hay error
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('La aplicación está en mantenimiento. Por favor, inténtelo más tarde.');
    }
  }
};

// Manejamos todos los errores posibles
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', promise, 'motivo:', reason);
});
