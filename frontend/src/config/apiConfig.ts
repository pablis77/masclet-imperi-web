/**
 * Configuración centralizada para las URLs de API
 * 
 * Este archivo gestiona las URLs de API para diferentes entornos:
 * - En desarrollo local: se conecta a localhost directamente
 * - En producción: usa rutas relativas que funcionan con el proxy
 */

// Detectar entorno (desarrollo vs producción)
const IS_PRODUCTION = import.meta.env.PROD || false;
const IS_RENDER = typeof window !== 'undefined' && window.location.hostname.includes('render.com');

// Configuración de URLs de API
let apiConfig = {
  // URL base para la API - SIEMPRE usar rutas relativas para evitar CORS
  baseURL: '/api/v1',  // Usar ruta relativa en todos los entornos (proxy)
  
  // URL para el backend (sin /api/v1)
  backendURL: IS_PRODUCTION ? '' : 'http://localhost:8000', // En desarrollo usar URL absoluta al backend
    
  // Configuración de headers por defecto
  headers: {
    'Content-Type': 'application/json',
  }
};

// Log para saber qué configuración estamos usando
console.log(`[API Config] Usando modo: ${IS_PRODUCTION || IS_RENDER ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`[API Config] Base URL: ${apiConfig.baseURL}`);

export default apiConfig;
