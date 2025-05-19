// Archivo proxy para redirigir a fix-server.js
// Este archivo se debería ejecutar cuando Render use el comando "node ./dist/server/entry.mjs"

import { createServer } from 'node:http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Servidor de emergencia que escucha en 0.0.0.0:10000
const server = createServer((req, res) => {
  if (req.url === '/health') {
    console.log('>>> Health check solicitado - respondiendo 200 OK');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  // Para todas las demás rutas, mostrar una página simple
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
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
        <p>El servidor está en modo de emergencia respondiendo al health check.</p>
        <p>Por favor, modifique la configuración en Render para usar <code>node fix-server.js</code> como comando de inicio.</p>
      </body>
    </html>
  `);
});

// Configurar tiempos de espera largos
server.timeout = 300000;
server.keepAliveTimeout = 300000;
server.headersTimeout = 300000;

// Escuchar explícitamente en 0.0.0.0
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Servidor de emergencia iniciado en http://0.0.0.0:${PORT}`);
  console.log(`>>> Health check disponible en http://0.0.0.0:${PORT}/health`);
});

// Intentar cargar fix-server.js si existe
const __dirname = dirname(fileURLToPath(import.meta.url));
const fixServerPath = join(__dirname, 'fix-server.js');

console.log(`>>> Intentando cargar ${fixServerPath}...`);
try {
  // Intentar importar fix-server.js
  import('./fix-server.js').catch(err => {
    console.error('>>> No se pudo cargar fix-server.js:', err);
  });
} catch (error) {
  console.error('>>> Error al intentar cargar fix-server.js:', error);
}
