// Archivo server.js para Render
import { handler as ssrHandler } from './dist/server/entry.mjs';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Configuración para archivos estáticos
app.use(express.static(join(__dirname, 'dist/client')));

// Middleware para todas las rutas - usa el handler de Astro
app.use(ssrHandler);

// Obtener puerto del entorno o usar 10000 por defecto
const PORT = process.env.PORT || 10000;
// Escuchar en todas las interfaces (0.0.0.0) para que Render pueda acceder
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor iniciado en http://${HOST}:${PORT}`);
});
