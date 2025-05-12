// Script para forzar que el servidor Astro escuche en 0.0.0.0
// Ejecutar con: node fix-server.js

import { createServer } from 'node:http';
import { createRequire } from 'module';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fixServer() {
  try {
    // Crea un servidor HTTP explícito que escuche en 0.0.0.0
    const server = createServer(async (req, res) => {
      console.log(`Solicitud recibida: ${req.url}`);
      
      // Health check explícito
      if (req.url === '/health') {
        console.log('Solicitud de health check recibida');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
      }
      
      try {
        // Importa el handler de Astro de manera dinámica
        const { handler } = await import('./dist/server/entry.mjs');
        // Pasa la solicitud al handler de Astro
        await handler(req, res);
      } catch (error) {
        console.error('Error al manejar la solicitud:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error interno del servidor');
        }
      }
    });
    
    // Escucha explícitamente en 0.0.0.0 y el puerto correcto
    const PORT = process.env.PORT || 10000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor iniciado en http://0.0.0.0:${PORT}`);
      console.log(`Health check disponible en http://0.0.0.0:${PORT}/health`);
    });
    
    // Configurar tiempos de espera largos
    server.timeout = 300000; // 5 minutos
    server.keepAliveTimeout = 300000;
    server.headersTimeout = 300000;
    
    // Manejar errores del servidor
    server.on('error', (err) => {
      console.error('Error del servidor:', err);
    });
    
    // Manejar excepciones no capturadas
    process.on('uncaughtException', (err) => {
      console.error('Error no capturado:', err);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Promesa rechazada no manejada:', promise, 'motivo:', reason);
    });
    
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Ejecuta la función principal
fixServer();
