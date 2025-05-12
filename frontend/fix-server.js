// SOLUCIÓN ULTRA SIMPLE (fix-server.js)
import http from 'http';

// Crear el servidor más sencillo posible
const server = http.createServer((req, res) => {
  // Registrar cada solicitud
  console.log(`[${new Date().toISOString()}] Solicitud recibida: ${req.method} ${req.url}`);
  
  // Responder OK a CUALQUIER ruta
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
});

// Asegurarnos de escuchar en TODAS las interfaces
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 10000;

server.listen(PORT, HOST, () => {
  console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
  console.log('Health check: ACTIVO - Responde 200 OK a cualquier ruta');
});

// Manejar cualquier error
server.on('error', (err) => {
  console.error('Error del servidor:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

