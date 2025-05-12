// Archivo específico para despliegue en Render
import http from 'http';
import { handler } from './dist/server/entry.mjs';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Endpoint de health check para Render - EXPLÍCITO
app.get('/health', (req, res) => {
  console.log('Health check endpoint solicitado');
  res.status(200).send('OK');
});

// Configuración para archivos estáticos
app.use(express.static(join(__dirname, 'dist/client')));

// Middleware para todas las rutas - usa el handler de Astro
app.use(handler);

// Obtener puerto del entorno o usar 10000 por defecto
const PORT = process.env.PORT || 10000;
// FORZAR a escuchar en 0.0.0.0
const HOST = '0.0.0.0';

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', promise, 'motivo:', reason);
});

// Crea explícitamente un servidor HTTP
const server = http.createServer(app);

// Configurar tiempos de espera MUY largos
server.timeout = 300000; // 5 minutos
server.keepAliveTimeout = 300000;
server.headersTimeout = 300000;

server.listen(PORT, HOST, () => {
  console.log(`Servidor iniciado en http://${HOST}:${PORT}`);
  console.log(`Health check disponible en http://${HOST}:${PORT}/health`);
});
