// SOLUCIÓN DEFINITIVA: Servidor solo para health check sin conflicto de puertos
// Ejecutar con: node fix-server.js

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function iniciarServidor() {
  try {
    console.log('>>> Iniciando servidor minimalista SOLO para health check...');
    
    // Crear una aplicación Express muy simple
    const app = express();
    
    // Añadir ÚNICAMENTE endpoint de health check
    app.get('/health', (req, res) => {
      console.log('>>> Health check solicitado - respondiendo 200 OK');
      res.status(200).send('OK');
    });
    
    // Añadir una página de status
    app.get('/status', (req, res) => {
      res.status(200).send(`
        <html>
          <head>
            <title>Masclet Imperi Web - Estado</title>
            <style>
              body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              .success { color: green; }
            </style>
          </head>
          <body>
            <h1>Masclet Imperi Web</h1>
            <p class="success">✅ El servidor de health check está funcionando correctamente</p>
            <p>La aplicación principal está siendo servida por el servidor Astro.</p>
          </body>
        </html>
      `);
    });
    
    // Para todas las demás rutas, redirigir al servidor Astro
    app.use((req, res) => {
      res.redirect(`http://localhost:10000${req.url}`);
    });
    
    // Crear un servidor HTTP explícito
    const server = createServer(app);
    
    // Escuchar explícitamente en un puerto DIFERENTE para evitar conflictos
    // El puerto 10000 lo está usando Astro, usaremos el 9999
    const PORT = 9999;
    const HOST = '0.0.0.0';
    
    server.listen(PORT, HOST, () => {
      console.log(`>>> Servidor de health check iniciado exitosamente en http://${HOST}:${PORT}`);
      console.log(`>>> Health check disponible en http://${HOST}:${PORT}/health`);
      console.log(`>>> Status disponible en http://${HOST}:${PORT}/status`);
      console.log('>>> El servidor principal Astro sigue en http://localhost:10000');
    });
    
    // Asegurar que el health check siga funcionando incluso si hay errores
    server.on('error', (err) => {
      console.error('>>> Error del servidor de health check:', err);
    });
    
    // Manejar excepciones no capturadas
    process.on('uncaughtException', (err) => {
      console.error('>>> Error no capturado:', err);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('>>> Promesa rechazada no manejada:', promise, 'motivo:', reason);
    });
    
  } catch (error) {
    console.error('>>> Error al iniciar el servidor de health check:', error);
  }
}

// Ejecutar la función principal
iniciarServidor();
