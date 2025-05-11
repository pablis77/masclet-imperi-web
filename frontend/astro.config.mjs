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
    output: 'server',  // Usando modo servidor para permitir rutas dinámicas

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
        rollupOptions: {
          external: [
            // Excluir todos los archivos que comienzan con _test
            /\/src\/.*\/_test.*\.astro$/
          ]
        }
      }
    }
});