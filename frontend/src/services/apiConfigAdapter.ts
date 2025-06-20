/**
 * Adaptador para la configuración centralizada de API
 * Este archivo actúa como puente entre nuestra configuración centralizada
 * y los servicios API existentes, sin modificarlos directamente.
 */

import { API_CONFIG, AUTH_CONFIG, isLocalEnvironment, isProductionEnvironment } from '../config/apiConfig.centralizado';

// Exportar constantes adaptadas para servicios existentes
export const API_BASE_URL = API_CONFIG.baseUrl;
export const API_TIMEOUT = API_CONFIG.timeout;
export const API_DEFAULT_HEADERS = API_CONFIG.defaultHeaders;
export const API_ENDPOINTS = API_CONFIG.endpoints;

// Detectar entorno (compatible con api.ts y apiService.ts)
export const getEnvironment = (): 'server' | 'local' | 'production' => {
    if (typeof window === 'undefined') return 'server';
    
    if (isLocalEnvironment()) return 'local';
    return 'production';
};

export const environment = getEnvironment();
export const isProduction = isProductionEnvironment();
export const isLocal = isLocalEnvironment();

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

// Exportar configuración de autenticación
export const TOKEN_NAME = AUTH_CONFIG.tokenName;
export const REFRESH_TOKEN_NAME = AUTH_CONFIG.refreshTokenName;
export const AUTH_ENDPOINTS = AUTH_CONFIG.endpoints;

// Función para configurar la API (compatible con apiService.ts)
export function configureApi(baseUrl: string) {
    // No hacemos nada aquí porque la configuración ya viene del centralizado
    console.log(`[apiConfigAdapter] Configuración solicitada para: ${baseUrl}`);
    return API_CONFIG;
}
