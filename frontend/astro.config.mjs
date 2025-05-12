import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';

export default defineConfig({
    // Directorio base donde se servirá la aplicación (si es en subpath)
    base: '/',

    // Configuración del servidor de desarrollo
    server: {
        port: 3000,
        host: '0.0.0.0',
        // Configuración del proxy para comunicación con backend
        proxy: {
            '/api/v1': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
                // No reescribir la ruta, mantener tal cual
                rewrite: (path) => path
            }
        }
    },

    // Integraciones
    integrations: [
        // Integración con React
        react(),
        // Integración con Tailwind CSS
        tailwind({
            // Configurar con archivo personalizado
            config: { path: './tailwind.config.mjs' },
        }),
        // Integración con astro-icon
        icon({
            include: {
                mdi: ['*']
            }
        }),
    ],

    // Configuración de build
    output: 'hybrid',  // Cambiado a modo estático para evitar problemas con SSR

    // Configuración de vite (bundler usado por Astro)
    vite: {
      // Configuración específica para entorno de desarrollo
      server: {
          watch: {
              usePolling: true
          }
      },
      // Excluir archivos de prueba
      build: {
        // Optimizaciones para producción
        minify: true,
        cssMinify: true,
        // Desactivar mapas de código fuente en producción
        sourcemap: process.env.NODE_ENV !== 'production',
        // Comprimir el output
        assetsInlineLimit: 4096, // Inline assets menores a 4kb
        rollupOptions: {
          external: [
            // Excluir todos los archivos que comienzan con _test
            /\/src\/.*\/_test.*\.astro$/
          ],
          output: {
            // Fragmentar los chunks para mejor caching
            manualChunks: (id) => {
              // Todos los módulos de node_modules en un chunk separado
              if (id.includes('node_modules')) {
                if (id.includes('react')) return 'vendor-react';
                if (id.includes('chart')) return 'vendor-charts';
                return 'vendor';
              }
            }
          }
        }
      }
    }
});