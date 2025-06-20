/**
 * Servicio API centralizado para Masclet Imperi
 * ==========================================
 * 
 * Esta versión ha sido actualizada para usar la configuración centralizada
 * de API directamente sin adaptador
 */

import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/apiConfig.centralizado';

// Variables para mantener compatibilidad con código existente
let ENVIRONMENT: string = 'production';
let USE_MOCK_DATA: boolean = false;

// Detectar entorno
const isProduction = import.meta.env.PROD || false;
const isLocal = !isProduction;

// Imprimir información de diagnóstico
console.log(`[ApiService] Entorno: ${ENVIRONMENT}`);
console.log(`[ApiService] API configurada para conectarse a: ${API_CONFIG.baseUrl}`);

if (isProduction) {
  console.log('[ApiService] Ejecutando en modo PRODUCCIÓN');
} else {
  // Modo local (incluye localhost, 127.0.0.1, redes internas, etc.)
  console.log('[ApiService] Ejecutando en modo LOCAL');
}

// Mantener una copia local de la URL base para posibles modificaciones
let apiBaseUrl = API_CONFIG.baseUrl;

// Crear instancia de axios con configuración base centralizada
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.defaultHeaders
});

// GESTIÓN UNIVERSAL DE PETICIONES API
api.interceptors.request.use(
  (config) => {
    const endpoint = config.url || '';
    
    // Evitar duplicación de prefijos /api/v1
    const finalUrl = `${config.baseURL || ''}${config.url || ''}`;
    if (finalUrl.includes('/api/v1/api/v1/')) {
      console.log(`[API] Corrigiendo URL duplicada: ${finalUrl}`);
      const fixedUrl = finalUrl.replace('/api/v1/api/v1/', '/api/v1/');
      const baseUrlPart = config.baseURL || '';
      config.url = fixedUrl.replace(baseUrlPart, '');
      console.log(`[API] URL corregida: ${baseUrlPart}${config.url}`);
    }
    
    // Asegurar encabezados AUTH
    if (typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_CONFIG.tokenName)) {
      config.headers.Authorization = `Bearer ${localStorage.getItem(AUTH_CONFIG.tokenName)}`;
    }
    
    // NO activamos withCredentials en ningún entorno para evitar problemas CORS
    config.withCredentials = false;
    
    // Si estamos en producción, configuración adicional
    if (isProduction) {
      // En producción, asegurar que todas las peticiones son seguras
      if (config.url && config.url.startsWith('http:')) {
        config.url = config.url.replace('http:', 'https:');
      }
      
      // Asegurar que baseURL es HTTPS en producción
      if (config.baseURL && config.baseURL.startsWith('http:')) {
        config.baseURL = config.baseURL.replace('http:', 'https:');
      }
      
      console.log(`[PROD] URL final: ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para añadir credenciales a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Intentar usar el token JWT del localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const token = localStorage.getItem(AUTH_CONFIG.tokenName);
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('Usando token JWT para autenticación');
        } else {
          console.warn('No se encontró token en localStorage');
        }
      } catch (e) {
        console.warn('No se pudo acceder a localStorage:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para configurar la API
export function configureApi(baseUrl: string, useMockData: boolean = false) {
  apiBaseUrl = baseUrl;
  USE_MOCK_DATA = useMockData;
  api.defaults.baseURL = baseUrl;
  
  console.log(`API configurada con URL base: ${baseUrl}`);
  console.log(`Uso de datos simulados: ${useMockData ? 'SÍ' : 'NO'}`);
}

// Función para realizar peticiones GET
export async function get<T = any>(endpoint: string): Promise<T> {
  try {
    // Normalizar endpoint asegurando que empiece con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // IMPORTANTE: Añadir prefijo /api/v1 si no está presente y no hay ya un prefijo en la URL base
    let apiEndpoint = normalizedEndpoint;
    // Comprobar si ya hay un prefijo en la URL base (config.baseURL) o si ya hay un prefijo en el endpoint
    const baseUrlHasPrefix = apiBaseUrl.includes('/api/v1');
    if (!apiEndpoint.startsWith('/api/v1') && !baseUrlHasPrefix) {
      apiEndpoint = `/api/v1${normalizedEndpoint}`;
      console.log(`Añadiendo prefijo a endpoint: ${normalizedEndpoint} -> ${apiEndpoint}`);
    }
    
    // Quitar / al final si el endpoint lo tiene y no contiene query params
    const finalEndpoint = (!apiEndpoint.includes('?') && apiEndpoint.endsWith('/')) 
      ? apiEndpoint.slice(0, -1) 
      : apiEndpoint;
    
    if (isProduction) {
      // console.log(`Realizando petición GET a: ${finalEndpoint}`);
    } else {
      console.log(`Realizando petición GET a: ${finalEndpoint}`);
    }
    
    const response = await api.get<T>(finalEndpoint);
    
    // Si la data es undefined o null, registrar warning y devolver objeto vacío
    if (response.data === undefined || response.data === null) {
      if (Array.isArray(response.data)) {
        return [] as unknown as T;
      } else {
        return {} as T;
      }
    }
    
    return response.data;
  } catch (error) {
    // Mejorar el log de errores para facilitar la depuración
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error en petición GET a ${endpoint}: ${error.message} (${error.response?.status || 'sin status'})`);
    } else {
      console.error(`❌ Error no relacionado con Axios en ${endpoint}: ${error}`);
    }
    
    // Devolver objeto vacío para evitar que la UI se rompa
    return {} as T;
  }
}

// Función para realizar peticiones POST
export async function post<T = any>(endpoint: string, data: any): Promise<T> {
  try {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await api.post<T>(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición POST a ${endpoint}:`, error);
    throw error;
  }
}

// Función para realizar peticiones PUT
export async function put<T = any>(endpoint: string, data: any): Promise<T> {
  try {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await api.put<T>(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PUT a ${endpoint}:`, error);
    throw error;
  }
}

// Función para realizar peticiones PATCH
export async function patch<T = any>(endpoint: string, data: any): Promise<T> {
  try {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    console.log(`Realizando petición PATCH a ${apiBaseUrl}${normalizedEndpoint}`);
    console.log('Datos enviados:', data);
    
    const response = await api.patch<T>(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PATCH a ${endpoint}:`, error);
    throw error;
  }
}

// Función para realizar peticiones DELETE
export async function del<T = any>(endpoint: string): Promise<T> {
  try {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await api.delete<T>(normalizedEndpoint);
    return response.data;
  } catch (error) {
    console.error(`Error en petición DELETE a ${endpoint}:`, error);
    throw error;
  }
}

// Función para verificar si el usuario está autenticado
export async function isAuthenticated(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem(AUTH_CONFIG.tokenName);
      if (!token) return false;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
}

// Función para obtener información del usuario actual
export async function getUserInfo() {
  try {
    if (await isAuthenticated()) {
      return await get('/users/me');
    }
    return null;
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return null;
  }
}

// Función para iniciar sesión usando el formato OAuth2 requerido
export async function login(username: string, password: string) {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    
    const loginEndpoint = '/auth/login';
    
    const response = await api.post(loginEndpoint, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Guardar el token en localStorage
    if (typeof window !== 'undefined' && window.localStorage && response.data.access_token) {
      localStorage.setItem(AUTH_CONFIG.tokenName, response.data.access_token);
      console.log('Token guardado correctamente');
    }
    
    return response;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}

// Función para obtener la URL base de la API (para depuración)
export function getBaseUrl(): string {
  return apiBaseUrl;
}

export default {
  get,
  post,
  put,
  patch,
  del,
  isAuthenticated,
  getUserInfo,
  login,
  configureApi,
  getBaseUrl
};