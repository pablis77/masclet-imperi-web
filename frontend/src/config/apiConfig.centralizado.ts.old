/**
 * Configuración centralizada de APIs para Masclet Imperi
 * Este archivo proporciona una configuración unificada para todas las conexiones a APIs,
 * permitiendo un fácil cambio entre entornos de desarrollo y producción.
 */

// Detección del entorno actual
const IS_PRODUCTION = import.meta.env.PROD || false;
const IS_DEVELOPMENT = !IS_PRODUCTION;

/**
 * Detecta si estamos en una red local (localhost, 127.0.0.1, etc)
 */
export const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.indexOf('.local') > -1 ||
    hostname.indexOf('.internal') > -1
  );
};

/**
 * Detecta si estamos en un ambiente de producción (AWS Amplify)
 */
export const isProductionEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !isLocalEnvironment();
};

/**
 * Obtiene la URL base de la API según el entorno
 */
export const getApiBaseUrl = (): string => {
  // 1. Prioridad máxima: variable de entorno específica de la API
  const configuredApiUrl = import.meta.env.VITE_API_URL;
  if (configuredApiUrl) {
    console.log('✅ Usando URL de API configurada:', configuredApiUrl);
    return configuredApiUrl;
  }
  
  // 2. En producción (AWS Amplify): usar URL relativa (mismo dominio)
  if (IS_PRODUCTION || isProductionEnvironment()) {
    // La API está en el mismo dominio, pero en la ruta /api/v1
    return '/api/v1';
  }
  
  // 3. En desarrollo local: siempre usar localhost
  return 'http://localhost:8000/api/v1';
};

/**
 * Obtiene la URL completa para un endpoint específico
 */
export const getApiEndpoint = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Normalizar endpoint para evitar dobles barras
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${baseUrl}/${normalizedEndpoint}`;
};

/**
 * Configuración para servicios de autenticación
 */
export const AUTH_CONFIG = {
  // URL base para endpoints de autenticación
  baseUrl: `${getApiBaseUrl()}/auth`,
  
  // Endpoints específicos
  endpoints: {
    login: `${getApiBaseUrl()}/auth/login`,
    logout: `${getApiBaseUrl()}/auth/logout`,
    refresh: `${getApiBaseUrl()}/auth/refresh`,
    me: `${getApiBaseUrl()}/users/me`,
  },
  
  // Tokens
  tokenName: 'token',
  refreshTokenName: 'refresh_token',
  tokenExpire: 24 * 60 * 60 * 1000, // 24 horas en ms
};

/**
 * Configuración para el API general
 */
export const API_CONFIG = {
  // URL base de la API
  baseUrl: getApiBaseUrl(),
  
  // Timeout para peticiones (ms)
  timeout: 30000,
  
  // Headers por defecto
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints más utilizados (organizados por entidad)
  endpoints: {
    animals: {
      list: 'animals',
      detail: (id: string | number) => `animals/${id}`,
      partos: (id: string | number) => `animals/${id}/partos`,
      history: (id: string | number) => `animals/${id}/history`,
    },
    explotacions: {
      list: 'explotacions',
      detail: (id: string | number) => `explotacions/${id}`,
    },
    dashboard: {
      stats: 'dashboard/stats',
      recuentos: 'dashboard/recuentos',
      explotacions: 'dashboard/explotacions',
    },
    backup: {
      list: 'backup/list',
      create: 'backup/create',
      restore: (filename: string) => `backup/restore/${filename}`,
    },
    users: {
      list: 'users',
      detail: (id: string | number) => `users/${id}`,
      me: 'users/me',
    }
  },
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  getApiBaseUrl,
  getApiEndpoint,
  isLocalEnvironment,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
};
