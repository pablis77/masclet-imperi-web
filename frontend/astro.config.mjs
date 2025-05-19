import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';
import node from '@astrojs/node';

export default defineConfig({
    // Permitir todas las conexiones
    output: 'server',
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
    
    // Directorio base donde se servirá la aplicación (si es en subpath)
    base: '/',

    // Configuración del servidor de desarrollo
    server: {
        port: 3000,
        host: '0.0.0.0',
        cors: {
            origin: ['*']
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        // Configuración del proxy para comunicación con backend
        proxy: {
            '/api/v1': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
                // No reescribir la ruta, mantener tal cual
                rewrite: (path) => path
            },
            // Proxy para el túnel - esto facilita las conexiones remotas
            '/.netloc/api/v1': {
                target: 'https://api-masclet-imperi.loca.lt',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace('/.netloc', '')
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

    // Configuración para modo completamente de servidor
    output: 'server',
    
    // Adaptador para servidor Node.js (requerido para modo híbrido)
    adapter: node({
        mode: 'standalone',
        host: '0.0.0.0', // IMPORTANTE: Escuchar en todas las interfaces, no solo localhost
        port: process.env.PORT || 10000,
        // Añadimos middleware personalizado para el health check
        middleware: async (context, next) => {
            // Interceptamos las peticiones al endpoint de health check
            if (context.url.pathname === '/health') {
                console.log('✅ Health check solicitado - respondiendo 200 OK');
                return new Response('OK', { status: 200 });
            }
            // Para el resto de rutas, continuamos con el flujo normal
            return next();
        }
    }),

    // Configuración de vite (bundler usado por Astro)
    vite: {
      // Configuración específica para entorno de desarrollo
      server: {
          watch: {
              usePolling: true
          },
          // IMPORTANTE: Permitir explícitamente el host de LocalTunnel
          host: '0.0.0.0',
          cors: true,
          strictPort: true,
          allowedHosts: [
              'localhost',
              '127.0.0.1',
              '0.0.0.0',
              '192.168.68.54',
              'masclet-imperi-web-frontend-2025.loca.lt',
              '.loca.lt'
          ],
          // CRUCIAL: DESACTIVAR HMR para túneles - esto es lo que causa el problema
          hmr: false
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