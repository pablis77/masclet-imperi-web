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
  // URL base para la API
  baseURL: IS_PRODUCTION || IS_RENDER 
    ? '/api/v1'  // En producción, usar ruta relativa (funciona con proxy)
    : 'http://localhost:8000/api/v1', // En desarrollo, conectar directamente
  
  // URL para el backend (sin /api/v1)
  backendURL: IS_PRODUCTION || IS_RENDER 
    ? ''  // En producción, usar ruta relativa (funciona con proxy)
    : 'http://localhost:8000', // En desarrollo, conectar directamente
    
  // Configuración de headers por defecto
  headers: {
    'Content-Type': 'application/json',
  }
};

// Log para saber qué configuración estamos usando
console.log(`[API Config] Usando modo: ${IS_PRODUCTION || IS_RENDER ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`[API Config] Base URL: ${apiConfig.baseURL}`);

export default apiConfig;
