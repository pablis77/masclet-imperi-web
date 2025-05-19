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
  // Configuración para permitir acceso desde cualquier lugar
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: {
      origin: '*', // Permitir todas las conexiones
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    hmr: {
      clientPort: 443,
      host: 'localhost'
    },
    // Lista de hosts permitidos explícitamente
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '192.168.68.54',
      'masclet-imperi-web-frontend-2025.loca.lt',
      '.loca.lt' // Permitir todos los subdominios de loca.lt
    ]
  }
});
