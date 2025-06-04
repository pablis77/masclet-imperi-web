// SOLUCIÓN FINAL DEFINITIVA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fetch from 'node-fetch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Configuración de middleware básico
app.use(express.json());

// Middleware para servir archivos estáticos
app.use(express.static(join(__dirname, 'dist/client')));

// Servir especialmente nuestro script de corrección de hidratación
app.get('/client-hydration-fix.js', (req, res) => {
  res.sendFile(join(__dirname, 'client-hydration-fix.js'));
});

// Endpoint de health check (para Render)
app.get('/health', (req, res) => {
  console.log('>>> Health check solicitado - respondiendo 200 OK');
  res.status(200).send('OK');
});

// SOLUCIÓN DEFINITIVA MÁXIMA: Proxy global para eliminar 100% de problemas CORS
const BACKEND_URL = process.env.BACKEND_URL || 'https://masclet-imperi-web-backend.onrender.com';
console.log(`>>> Configurando proxy API hacia: ${BACKEND_URL}`);

// MEGA PROXY: Configurar un middleware que intercepta TODAS las peticiones API
// y las redirige al backend correctamente, sin problemas de CORS
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,          // Esencial para cambiar el origen
  secure: false,               // Permitir HTTPS sin verificar certificados
  pathRewrite: function(path) {
    // NO reescribir las rutas /api/v1/
    // Las dejamos tal cual para que lleguen correctamente al backend
    console.log(`>>> [PROXY] Enviando ruta sin modificar: ${path}`);
    return path;
  },
  onProxyReq: (proxyReq, req, res) => {
    // Depurar la solicitud
    console.log(`>>> [PROXY] Procesando: ${req.method} ${req.url}`);
    
    // Configurar host correcto
    proxyReq.setHeader('host', new URL(BACKEND_URL).host);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Agregar siempre encabezados CORS a las respuestas
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    
    console.log(`>>> [PROXY] Respuesta: ${proxyRes.statusCode} para ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`>>> [ERROR PROXY]: ${err.message}`);
    console.error(`>>> URL original: ${req.method} ${req.url}`);
    
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: `Error de conexión con API: ${err.message}`,
        url: req.url
      }));
    }
  }
});

// Manejador de preflight OPTIONS para CORS - Responde automáticamente a todas las solicitudes OPTIONS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(204);
  console.log(`>>> [CORS] Respondiendo a OPTIONS para: ${req.url}`);
});

// REGISTRAR EL PROXY SOLO PARA RUTAS API - Esto es crítico
console.log(`>>> Configurando proxy en /api y /api/v1 hacia ${BACKEND_URL}`);
app.use('/api', apiProxy);         // Captura /api/*
app.use('/api/v1', apiProxy);      // Captura /api/v1/*

// Ya no agregamos rutas específicas para evitar conflictos con las rutas del frontend
console.log(`>>> IMPORTANTE: No interceptando rutas directas para evitar conflictos con el frontend`);

// El proxy ya está configurado arriba, no necesitamos líneas duplicadas
// Esto asegura que no haya conflictos entre los distintos middlewares de proxy

// La ruta de autenticación ya está configurada arriba en las rutas específicas

// Servir archivos estáticos del cliente
app.use(express.static(join(__dirname, 'dist/client'), { index: false }));

// Función para manejar la renderización del lado del servidor
async function handleSSR(req, res) {
  // Guardar la función original para enviar respuestas
  const originalSend = res.send;
  
  // Sobreescribir la función de envío para inyectar nuestro script de corrección
  res.send = function(body) {
    // Solo modificar respuestas HTML
    if (typeof body === 'string' && body.includes('<html')) {
      console.log('>>> Inyectando script de corrección de hidratación');
      // Inyectar nuestro script antes de </head>
      const scriptTag = '<script src="/client-hydration-fix.js"></script>';
      body = body.replace('</head>', scriptTag + '</head>');
    }
    // Llamar a la función original
    return originalSend.call(this, body);
  };
  
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

