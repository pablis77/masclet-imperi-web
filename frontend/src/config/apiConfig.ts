/**
 * Configuración centralizada para las URLs de API
 * 
 * Este archivo gestiona las URLs de API para diferentes entornos:
 * - En desarrollo local: se conecta a localhost directamente
 * - En producción: usa rutas relativas que funcionan con el proxy
 */

// Detectar entorno (desarrollo vs producción)
const IS_PRODUCTION = import.meta.env.PROD || false;
const IS_VERCEL = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

// Determinar si estamos ejecutándolo localmente (localhost o IP en red local)
const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' ||
         /^192\.168\./.test(hostname) ||
         /^10\./.test(hostname) ||
         /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(hostname);
};

// Configuración de la API
export const API_CONFIG = {
  baseURL: '/api/v1',  // Prefijo unificado: /api/v1 en todos los entornos
  timeout: 15000,  // Tiempo máximo de espera para peticiones (en ms)
  withCredentials: true,  // Permite enviar cookies en peticiones cross-origin
  backendURL: (IS_PRODUCTION || IS_VERCEL) && !isLocalEnvironment() ? '' : 'http://127.0.0.1:8000'  // URL directa para importaciones y casos especiales
};

// Log para saber qué configuración estamos usando
const isLocal = isLocalEnvironment();
console.log(`[API Config] Hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'N/A'}`);
console.log(`[API Config] Usando modo: ${(IS_PRODUCTION || IS_VERCEL) && !isLocal ? 'PRODUCCIÓN' : 'DESARROLLO LOCAL'}`);
console.log(`[API Config] BackendURL: ${API_CONFIG.backendURL || 'relativo'}`); 
console.log(`[API Config] Base URL: ${API_CONFIG.baseURL}`); 
console.log(`[API Config] Es entorno local: ${isLocal ? 'SÍ' : 'NO'}`);
console.log(`[API Config] Es Vercel: ${IS_VERCEL ? 'SÍ' : 'NO'}`);
export default API_CONFIG;