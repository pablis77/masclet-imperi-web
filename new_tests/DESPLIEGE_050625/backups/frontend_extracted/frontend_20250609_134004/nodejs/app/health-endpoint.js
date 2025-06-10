#!/usr/bin/env node
/**
 * health-endpoint.js - Endpoint sencillo para responder correctamente al healthcheck de Docker
 * Este script crea un servidor HTTP simple que responde 200 OK al endpoint /health
 */
const http = require('http');
const port = 3000;

// Crear un servidor HTTP básico
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // Log para diagnóstico
  console.log([] Healthcheck recibió petición: );
  
  // Responder al endpoint /health con un 200 OK
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok',
      container: 'masclet-frontend-node',
      timestamp: Date.now()
    }));
    return;
  }
  
  // Para cualquier otra ruta, pasar al servidor principal
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Iniciar el servidor HTTP para el health endpoint
server.listen(3000, '0.0.0.0', () => {
  console.log([] Servidor de healthcheck iniciado en puerto );
});

// No interferir con el proceso principal
process.on('SIGTERM', () => {
  console.log('Señal SIGTERM recibida, cerrando servidor de healthcheck');
  server.close(() => {
    console.log('Servidor de healthcheck cerrado');
  });
});
