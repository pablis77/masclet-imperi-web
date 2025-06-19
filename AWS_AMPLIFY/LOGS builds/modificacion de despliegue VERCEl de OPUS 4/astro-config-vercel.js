import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    output: 'server',
    adapter: vercel(),
    
    base: '/',

    // Configuración de desarrollo local
    server: {
        port: 3000,  // Solo para dev local
        host: '0.0.0.0',  // Solo para dev local
        
        // IMPORTANTE: El proxy SÍ funciona en producción
        proxy: {
            '/api/v1': {
                target: 'http://34.253.203.194:8000',  // Tu API en EC2
                changeOrigin: true,
                secure: false
            }
        }
    },

    integrations: [
        react(),
        tailwind({
            config: { path: './tailwind.config.mjs' },
        }),
        icon({
            include: {
                mdi: ['*']
            }
        }),
    ],

    vite: {
        server: {
            watch: {
                usePolling: true
            },
            host: '0.0.0.0',
            cors: true,
            strictPort: true,
            hmr: false
        },
        build: {
            minify: true,
            cssMinify: true,
            sourcemap: false,
            assetsInlineLimit: 4096,
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    }
                }
            }
        }
    }
});