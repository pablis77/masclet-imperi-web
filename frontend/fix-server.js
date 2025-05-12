// Script DEFINITIVO para forzar que el servidor escuche en 0.0.0.0 correctamente
// Ejecutar con: node fix-server.js

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function iniciarServidor() {
  try {
    console.log('>>> Iniciando servidor personalizado con soporte para health check...');
    
    // Crear una aplicación Express
    const app = express();
    
    // Configurar middleware básico
    app.use(express.json());
    
    // Añadir endpoint de health check ANTES de cualquier otro middleware
    app.get('/health', (req, res) => {
      console.log('>>> Health check solicitado - respondiendo 200 OK');
      res.status(200).send('OK');
    });
    
    // Servir archivos estáticos (cliente)
    app.use(express.static(join(__dirname, 'dist/client')));
    
    // Importar el handler de Astro
    let astroHandler;
    try {
      const { handler } = await import('./dist/server/entry.mjs');
      astroHandler = handler;
      console.log('>>> Handler de Astro importado correctamente');
    } catch (error) {
      console.error('>>> Error al importar el handler de Astro:', error);
      // Continuar de todos modos, manejaremos las rutas manualmente si es necesario
    }
    
    // Middleware que procesa todas las demás rutas a través del handler de Astro
    app.use(async (req, res, next) => {
      if (astroHandler) {
        try {
          await astroHandler(req, res);
        } catch (error) {
          console.error('>>> Error en el handler de Astro:', error);
          if (!res.headersSent) {
            res.status(500).send('Error interno del servidor');
          }
        }
      } else {
        // Si no tenemos handler de Astro, intentamos manejar rutas básicas
        res.status(200).send(`
          <html>
            <head>
              <title>Masclet Imperi Web</title>
              <style>
                body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>Masclet Imperi Web</h1>
              <p>El servidor está funcionando correctamente, pero el handler de Astro no pudo cargarse.</p>
              <p>Por favor, inténtelo de nuevo más tarde o contacte con el administrador.</p>
            </body>
          </html>
        `);
      }
    });
    
    // Crear un servidor HTTP explícito
    const server = createServer(app);
    
    // Configurar tiempos de espera largos
    server.timeout = 300000; // 5 minutos
    server.keepAliveTimeout = 300000;
    server.headersTimeout = 300000;
    
    // Escuchar explícitamente en 0.0.0.0
    const PORT = process.env.PORT || 10000;
    const HOST = '0.0.0.0';
    
    server.listen(PORT, HOST, () => {
      console.log(`>>> Servidor iniciado exitosamente en http://${HOST}:${PORT}`);
      console.log(`>>> Health check disponible en http://${HOST}:${PORT}/health`);
    });
    
    // Manejar errores del servidor
    server.on('error', (err) => {
      console.error('>>> Error del servidor:', err);
    });
    
    // Manejar excepciones no capturadas
    process.on('uncaughtException', (err) => {
      console.error('>>> Error no capturado:', err);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('>>> Promesa rechazada no manejada:', promise, 'motivo:', reason);
    });
    
  } catch (error) {
    console.error('>>> Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
iniciarServidor();
