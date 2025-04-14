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
        host: true,
        // No usamos proxy para evitar problemas de acceso desde dispositivos externos
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
    output: 'server',  // Cambiar de 'static' a 'server' para habilitar API routes

    // Configuración de vite (bundler usado por Astro)
    vite: {
      // Configuración específica para entorno de desarrollo
      server: {
          watch: {
              usePolling: true
          }
      }
    }
});