// SOLUCIÓN FINAL DEFINITIVA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Configuración de middleware básico
app.use(express.json());

// Endpoint de health check (para Render)
app.get('/health', (req, res) => {
  console.log('>>> Health check solicitado - respondiendo 200 OK');
  res.status(200).send('OK');
});

// Servir archivos estáticos del cliente
app.use(express.static(join(__dirname, 'dist/client'), { index: false }));

// Función para manejar la renderización del lado del servidor
async function handleSSR(req, res) {
  try {
    // Intentar importar el handler de Astro
    const { handler } = await import('./dist/server/entry.mjs');
    // Delegar en el handler de Astro
    await handler(req, res);
  } catch (error) {
    console.error('>>> Error en la renderización SSR:', error);
    // Si hay un error y no se ha enviado respuesta, enviar respaldo
    if (!res.headersSent) {
      // Intentar servir el HTML estático como respaldo
      try {
        const fallbackHtml = fs.readFileSync(join(__dirname, 'dist/client/index.html'), 'utf8');
        res.status(200).type('text/html').send(fallbackHtml);
      } catch (fallbackError) {
        // Último respaldo - página simple
        res.status(500).send(`
          <html>
            <head>
              <title>Masclet Imperi Web</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>Masclet Imperi Web</h1>
              <p>El servidor está en mantenimiento. Por favor, intente de nuevo en unos minutos.</p>
            </body>
          </html>
        `);
      }
    }
  }
}

// Todas las demás rutas las maneja el SSR de Astro
app.use(handleSSR);

// Puerto e interfaz para escuchar
const PORT = process.env.PORT || 10000;
const FALLBACK_PORTS = [10001, 10002, 10003, 3000, 3001, 8080];
const HOST = '0.0.0.0';

// Función para intentar iniciar el servidor en diferentes puertos
function startServer(port, fallbackPorts = []) {
  const server = app.listen(port, HOST)
    .on('listening', () => {
      console.log(`>>> Servidor iniciado en http://${HOST}:${port}`);
      console.log(`>>> Health check disponible en http://${HOST}:${port}/health`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`>>> Puerto ${port} ya está en uso, intentando otro...`);
        if (fallbackPorts.length > 0) {
          const nextPort = fallbackPorts.shift();
          startServer(nextPort, fallbackPorts);
        } else {
          console.error('>>> No hay más puertos disponibles para intentar');
          process.exit(1);
        }
      } else {
        console.error('>>> Error al iniciar el servidor:', err);
        process.exit(1);
      }
    });
}

// Iniciar el servidor con el primer puerto
startServer(PORT, FALLBACK_PORTS);

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
  console.error('>>> Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('>>> Promesa rechazada no manejada:', promise, 'motivo:', reason);
});

