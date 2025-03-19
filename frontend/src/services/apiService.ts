// Servicio API genérico con soporte para datos simulados
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as mockData from './mockData';

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// API URL desde variables de entorno
const API_URL = isBrowser && import.meta.env.VITE_API_URL ? 
  import.meta.env.VITE_API_URL : 
  'http://localhost:8000';

// Prefijo API 
const API_PREFIX = '/api/v1';

// Comprobar si se debe usar datos simulados
const useMockData = isBrowser && (
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
  import.meta.env.VITE_USE_MOCK_DATA === true
);

// Comprobar si se deben mostrar logs detallados
const showDetailedLogs = isBrowser && (
  import.meta.env.VITE_SHOW_API_LOGS === 'true' || 
  import.meta.env.VITE_SHOW_API_LOGS === true
);

// Función para mostrar logs solo si está habilitado
const logMessage = (type: 'log' | 'warn' | 'error', message: string, data?: any) => {
  if (!showDetailedLogs && useMockData) return;
  
  switch (type) {
    case 'log':
      console.log(message, data);
      break;
    case 'warn':
      console.warn(message, data);
      break;
    case 'error':
      console.error(message, data);
      break;
  }
};

// Instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Habilitar envío de cookies y headers de autenticación
});

// Función para configurar el token de autenticación
export const setupApiToken = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Inicializar token desde localStorage solo si estamos en el navegador
if (isBrowser) {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    setupApiToken(storedToken);
  }
}

// Configurar interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si estamos en desarrollo y hay un error, intentar usar datos simulados
    if (useMockData) {
      logMessage('warn', 'Error al conectar con API. Usando datos simulados:', error);
      return Promise.reject(error);
    }
    
    // Para errores de red (sin respuesta del servidor)
    if (!error.response) {
      logMessage('error', 'Error de red:', error.message);
      return Promise.reject(new Error('Error de conexión. Verifica tu conexión a internet.'));
    }
    
    // Manejar errores según código de estado
    switch (error.response.status) {
      case 401:
        logMessage('error', 'Error de autenticación:', error.response.data);
        // Si estamos en el navegador, eliminar credenciales
        if (isBrowser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return Promise.reject(new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
      
      case 403:
        logMessage('error', 'Error de permisos:', error.response.data);
        return Promise.reject(new Error('No tienes permisos para realizar esta acción.'));
      
      case 404:
        logMessage('error', 'Recurso no encontrado:', error.response.data);
        return Promise.reject(new Error('El recurso solicitado no existe.'));
      
      case 500:
        logMessage('error', 'Error del servidor:', error.response.data);
        return Promise.reject(new Error('Error en el servidor. Inténtalo de nuevo más tarde.'));
      
      default:
        logMessage('error', `Error HTTP ${error.response.status}:`, error.response.data);
        return Promise.reject(error);
    }
  }
);

/**
 * Añade el prefijo API a una ruta
 * @param endpoint Ruta de API sin prefijo
 * @returns Ruta completa con prefijo
 */
export const addApiPrefix = (endpoint: string): string => {
  // Si ya tiene el prefijo o es una URL completa, devolverla sin cambios
  if (endpoint.startsWith(API_PREFIX) || endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Asegurarse de que el endpoint comienza con /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${API_PREFIX}${normalizedEndpoint}`;
};

/**
 * Petición GET genérica
 * @param endpoint Ruta de la API
 * @param config Configuración adicional para axios
 * @returns Promesa con la respuesta tipada
 */
export async function get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.get<T>(endpoint, config);
    return response.data;
  } catch (error) {
    // Si estamos usando datos simulados, intentar obtener datos de mockData
    if (useMockData) {
      const mockEndpoint = endpoint.replace(API_PREFIX, '').replace(/^\//, '');
      const mockResponse = (mockData as any)[mockEndpoint];
      
      if (mockResponse) {
        logMessage('log', `Usando datos simulados para GET ${endpoint}`);
        return Promise.resolve(mockResponse as T);
      }
    }
    
    logMessage('error', `Error en petición GET ${endpoint}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Petición POST genérica
 * @param endpoint Ruta de la API
 * @param data Datos a enviar
 * @param config Configuración adicional para axios
 * @returns Promesa con la respuesta tipada
 */
export async function post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.post<T>(endpoint, data, config);
    return response.data;
  } catch (error) {
    // Si estamos usando datos simulados, intentar obtener datos de mockData
    if (useMockData) {
      const mockEndpoint = `${endpoint.replace(API_PREFIX, '').replace(/^\//, '')}_post`;
      const mockResponse = (mockData as any)[mockEndpoint];
      
      if (mockResponse) {
        logMessage('log', `Usando datos simulados para POST ${endpoint}`);
        return Promise.resolve(mockResponse as T);
      }
    }
    
    logMessage('error', `Error en petición POST ${endpoint}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Petición PUT genérica
 * @param endpoint Ruta de la API
 * @param data Datos a enviar
 * @param config Configuración adicional para axios
 * @returns Promesa con la respuesta tipada
 */
export async function put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.put<T>(endpoint, data, config);
    return response.data;
  } catch (error) {
    // Si estamos usando datos simulados, intentar obtener datos de mockData
    if (useMockData) {
      const mockEndpoint = `${endpoint.replace(API_PREFIX, '').replace(/^\//, '')}_put`;
      const mockResponse = (mockData as any)[mockEndpoint];
      
      if (mockResponse) {
        logMessage('log', `Usando datos simulados para PUT ${endpoint}`);
        return Promise.resolve(mockResponse as T);
      }
    }
    
    logMessage('error', `Error en petición PUT ${endpoint}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Petición DELETE genérica
 * @param endpoint Ruta de la API
 * @param config Configuración adicional para axios
 * @returns Promesa con la respuesta tipada
 */
export async function del<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.delete<T>(endpoint, config);
    return response.data;
  } catch (error) {
    // Si estamos usando datos simulados, intentar obtener datos de mockData
    if (useMockData) {
      const mockEndpoint = `${endpoint.replace(API_PREFIX, '').replace(/^\//, '')}_delete`;
      const mockResponse = (mockData as any)[mockEndpoint];
      
      if (mockResponse) {
        logMessage('log', `Usando datos simulados para DELETE ${endpoint}`);
        return Promise.resolve(mockResponse as T);
      }
    }
    
    logMessage('error', `Error en petición DELETE ${endpoint}:`, error);
    return Promise.reject(error);
  }
}

export const API_PATH = API_PREFIX;
export { useMockData };
