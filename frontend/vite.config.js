import { defineConfig } from 'vite';

export default defineConfig({
  // Configuración para ignorar archivos de prueba
  build: {
    rollupOptions: {
      external: [
        // Excluir todos los archivos que comienzan con _test
        /.*\/_test.*\.astro$/
      ]
    }
  },
  // Permitir el acceso desde cualquier host (túneles)
  server: {
    host: true,
    cors: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    // Lista de hosts permitidos
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'specialty-tobacco-peace-felt.trycloudflare.com',
      '.trycloudflare.com'
    ]
  }
});
