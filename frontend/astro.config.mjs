import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';
// Adaptador de Vercel para SSR
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    // Permitir todas las conexiones
    output: 'server',
    
    // Configuración del adaptador Vercel para SSR
    adapter: vercel({
        analytics: true,  // Para obtener estadísticas de rendimiento
        imagesConfig: {
            sizes: [640, 750, 828, 1080, 1200],
            minimumCacheTTL: 60
        },
        includeFiles: [
            './public/**/*'  // Incluir todos los archivos estáticos
        ],
        // Regiones (Europa - más cercana a tu EC2)
        regions: ["cdg1"],
    }),
    
    // Directorio base donde se servirá la aplicación (si es en subpath)
    base: '/',

    // Configuración unificada del servidor de desarrollo
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

    // Ya configurado el adaptador Vercel al inicio del archivo
    // No se necesita duplicar la configuración del adaptador

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
              '192.168.68.54'
              ],
          // CRUCIAL: DESACTIVAR HMR para túneles - esto es lo que causa el problema
          hmr: false
      },
      // Excluir archivos de prueba
      build: {
        // Optimizaciones para producción
        minify: true,
        // Aumentar el límite de advertencia para chunks grandes
        chunkSizeWarningLimit: 2000, // 2MB en lugar de 500KB por defecto
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
            // CONSOLIDACIÓN DE CHUNKS: Unificamos todos en vendor para evitar errores de inicialización
            manualChunks: (id) => {
              // Todos los módulos de node_modules en un chunk separado
              if (id.includes('node_modules')) {
                // FIX para "ReferenceError: Cannot access 'X' before initialization"
                // Unificamos todos los chunks en un solo vendor para evitar problemas
                // de dependencias circulares e inicialización fuera de orden
                return 'vendor';
              }
            }
          }
        }
      }
    }
});