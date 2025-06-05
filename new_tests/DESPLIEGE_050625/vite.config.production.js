import { defineConfig } from 'vite';

export default defineConfig({
  // Optimizaciones para build en producción
  build: {
    // Desactivamos source maps para acelerar la compilación
    sourcemap: false,
    // Minificación agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Chunks más grandes para menos solicitudes HTTP
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      },
      external: [
        // Excluir archivos de prueba
        /.*\/_test.*\.astro$/
      ]
    },
  },
  // Optimización para entorno Docker
  server: {
    host: '0.0.0.0',
    strictPort: true,
    // Desactivamos HMR para producción
    hmr: false
  }
});
