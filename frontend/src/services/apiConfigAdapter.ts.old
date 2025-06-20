/**
 * Adaptador para la configuración centralizada de API
 * Este archivo actúa como puente entre nuestra configuración centralizada
 * y los servicios API existentes, sin modificarlos directamente.
 */

import { API_CONFIG, AUTH_CONFIG } from '../config/apiConfig.centralizado';

// Exportar constantes adaptadas para servicios existentes
export const API_BASE_URL = API_CONFIG.baseUrl;
export const API_TIMEOUT = API_CONFIG.timeout;
export const API_DEFAULT_HEADERS = API_CONFIG.defaultHeaders;
export const API_ENDPOINTS = API_CONFIG.endpoints;

// Detectar entorno (compatible con api.ts y apiService.ts)
export const getEnvironment = (): 'server' | 'local' | 'production' => {
    if (typeof window === 'undefined') return 'server';
    
    const hostname = window.location.hostname;
    // Comprobar si estamos en localhost o red local
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.includes('192.168.') || 
        hostname.startsWith('10.') || 
        hostname.indexOf('.local') > -1 || 
        hostname.indexOf('.internal') > -1) {
        return 'local';
    }
    return 'production';
};

export const environment = getEnvironment();
export const isProduction = environment === 'production';
export const isLocal = environment === 'local';

// Función para normalizar rutas (compatible con api.ts)
export function normalizePath(path: string): string {
    // Eliminar barra inicial si existe
    path = path.startsWith('/') ? path.substring(1) : path;
    // Asegurar barra final
    return path.endsWith('/') ? path : `${path}/`;
}

// Función que proporciona la URL base para el entorno actual
// Esta función es compatible con getApiUrl() en apiService.ts
export function getApiUrl(): string {
    return API_CONFIG.baseUrl;
}

// Función para configurar la API (compatible con apiService.ts)
export function configureApi(baseUrl: string, useMockData: boolean = false): void {
    console.log(`API configurada con URL base: ${baseUrl}`);
    console.log(`Uso de datos simulados: ${useMockData ? 'SÍ' : 'NO'}`);
}

// Exportar configuración de autenticación
export const TOKEN_NAME = AUTH_CONFIG.tokenName;
export const REFRESH_TOKEN_NAME = AUTH_CONFIG.refreshTokenName;
export const AUTH_ENDPOINTS = AUTH_CONFIG.endpoints;

export default {
    API_BASE_URL,
    API_TIMEOUT,
    API_DEFAULT_HEADERS,
    API_ENDPOINTS,
    environment,
    isProduction,
    isLocal,
    normalizePath,
    getApiUrl,
    configureApi,
    TOKEN_NAME,
    REFRESH_TOKEN_NAME,
    AUTH_ENDPOINTS
};
