// Archivo para sobreescribir el comando de inicio de Render
import http from 'http';
import { createServer } from 'node:http';

// Preparar el servidor HTTP para health check y proxy Astro
const healthServer = createServer((req, res) => {
  console.log(`>>> Solicitud recibida: ${req.url}`);
  
  if (req.url === '/health') {
    console.log('>>> Health check solicitado - respondiendo 200 OK');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    // Para cualquier otra ruta, iniciaremos el servidor Astro
    console.log('>>> Solicitud para ruta: ' + req.url);
    
    // Importamos el servidor Astro de manera asíncrona después de responder a /health
    import('./dist/server/entry.mjs').then(({ handler }) => {
      try {
        // Pasamos la solicitud al handler de Astro
        handler(req, res);
      } catch (err) {
        console.error('>>> Error al manejar solicitud Astro:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }
    }).catch(err => {
      console.error('>>> Error al importar el handler de Astro:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  }
});

// Intentamos diferentes puertos, comenzando con el 9999 que probablemente no está en uso
const puertosAIntentar = [9999, 8099, 7099, 6099];

// Función para intentar iniciar el servidor en diferentes puertos
function intentarPuerto(indice) {
  if (indice >= puertosAIntentar.length) {
    console.error('>>> No se pudo iniciar el servidor en ningún puerto disponible');
    process.exit(1);
    return;
  }
  
  const puerto = puertosAIntentar[indice];
  
  try {
    healthServer.listen(puerto, '0.0.0.0', () => {
      console.log(`>>> Servidor iniciado en http://0.0.0.0:${puerto}`);
      console.log(`>>> Health check disponible en http://0.0.0.0:${puerto}/health`);
    });
    
    // Manejar errores de escucha
    healthServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`>>> Puerto ${puerto} ya en uso, intentando otro...`);
        healthServer.close();
        intentarPuerto(indice + 1);
      } else {
        console.error('>>> Error al iniciar el servidor:', err);
      }
    });
  } catch (err) {
    console.error(`>>> Error al intentar iniciar en puerto ${puerto}:`, err);
    intentarPuerto(indice + 1);
  }
}

// Comenzar intento de puertos
intentarPuerto(0);

// Mejorar manejo de errores a nivel de proceso
process.on('uncaughtException', (err) => {
  console.error('>>> Error no capturado:', err);
  // No terminamos el proceso para permitir que el servidor siga funcionando
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('>>> Promesa rechazada no manejada:', promise, 'motivo:', reason);
  // No terminamos el proceso para permitir que el servidor siga funcionando
});
