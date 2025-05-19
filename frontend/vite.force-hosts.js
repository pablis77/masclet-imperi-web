import fs from 'fs';
import path from 'path';

// Crear un archivo con la configuración correcta
const config = `
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    cors: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    allowedHosts: 'all'
  }
});
`;

// Escribir al archivo vite.config.js
fs.writeFileSync(path.join(__dirname, 'vite.config.js'), config, 'utf8');
console.log('✅ vite.config.js actualizado para permitir todos los hosts');
