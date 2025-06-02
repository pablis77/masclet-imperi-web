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

// Configuración de la API
export const API_CONFIG = {
  baseURL: '/api/v1',  // Prefijo unificado: /api/v1 en todos los entornos
  timeout: 15000,  // Tiempo máximo de espera para peticiones (en ms)
  withCredentials: true,  // Permite enviar cookies en peticiones cross-origin
  backendURL: IS_PRODUCTION || IS_RENDER ? '' : 'http://127.0.0.1:8000'  // URL directa para importaciones y casos especiales
};

// Log para saber qué configuración estamos usando
console.log(`[API Config] Usando modo: ${IS_PRODUCTION || IS_RENDER ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`[API Config] Base URL: ${API_CONFIG.baseURL}`);
export default API_CONFIG;
