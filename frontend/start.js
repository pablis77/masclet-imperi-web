// Archivo para sobreescribir el comando de inicio de Render
import http from 'http';
import { createServer } from 'node:http';

// Primero iniciamos un servidor HTTP simple en el puerto 10000 que responda a /health
const healthServer = createServer((req, res) => {
  console.log(`Solicitud recibida: ${req.url}`);
  
  if (req.url === '/health') {
    console.log('Solicitud de health check recibida. Enviando respuesta 200 OK');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    // Para cualquier otra ruta, iniciaremos el servidor Astro
    console.log('Solicitud para otra ruta recibida. Iniciando servidor Astro...');
    
    // Importamos el servidor Astro de manera asíncrona después de responder a /health
    import('./dist/server/entry.mjs').then(({ handler }) => {
      // Pasamos la solicitud al handler de Astro
      handler(req, res);
    }).catch(err => {
      console.error('Error al importar el handler de Astro:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });
  }
});

// Explícitamente escuchamos en 0.0.0.0 (todas las interfaces)
healthServer.listen(10000, '0.0.0.0', () => {
  console.log('Servidor iniciado en http://0.0.0.0:10000');
  console.log('Health check disponible en http://0.0.0.0:10000/health');
});

// Manejamos errores
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', promise, 'motivo:', reason);
});
