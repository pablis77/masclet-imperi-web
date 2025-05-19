// Archivo server.js para Render
import { handler as ssrHandler } from './dist/server/entry.mjs';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Endpoint de health check para Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Configuración para archivos estáticos
app.use(express.static(join(__dirname, 'dist/client')));

// Middleware para todas las rutas - usa el handler de Astro
app.use(ssrHandler);

// Obtener puerto del entorno o usar 10000 por defecto
const PORT = process.env.PORT || 10000;
// Escuchar EXPLÍCITAMENTE en 0.0.0.0 para que Render pueda acceder
const HOST = '0.0.0.0';

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', promise, 'motivo:', reason);
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Servidor iniciado en http://${HOST}:${PORT}`);
});

// Configurar tiempos de espera más largos
server.timeout = 120000; // 2 minutos
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
