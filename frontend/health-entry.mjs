// Archivo que reemplazará dist/server/entry.mjs después de la construcción
import { createServer } from 'node:http';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Este código se ejecutará directamente cuando Render ejecute node ./dist/server/entry.mjs
console.log('🔥 Iniciando servidor con soporte para health check en 0.0.0.0:10000');

// Creamos un servidor Express básico
const app = express();

// Añadimos endpoint de health check explícito
app.get('/health', (req, res) => {
  console.log('✅ Health check solicitado - respondiendo 200 OK');
  res.status(200).send('OK');
});

// Añadimos todos los demás endpoints necesarios
try {
  const { handler } = await import('./entry.original.mjs');
  app.use(handler);
  console.log('✅ Handler de Astro importado correctamente');
} catch (error) {
  console.error('❌ Error al importar el handler de Astro:', error);
  
  // Fallback: servir contenido estático si el handler falla
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(join(__dirname, 'dist/client')));
  console.log('ℹ️ Sirviendo contenido estático como fallback');
  
  // Ruta de fallback para todas las demás
  app.get('*', (req, res) => {
    res.status(200).send('La aplicación está en mantenimiento. Por favor, inténtelo más tarde.');
  });
}

// Configuramos para que escuche explícitamente en 0.0.0.0
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado en http://0.0.0.0:${PORT}`);
  console.log(`ℹ️ Health check disponible en http://0.0.0.0:${PORT}/health`);
});

// Configurar tiempos de espera largos
server.timeout = 300000; // 5 minutos
server.keepAliveTimeout = 300000;
server.headersTimeout = 300000;

// Manejamos todos los errores posibles
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', promise, 'motivo:', reason);
});
