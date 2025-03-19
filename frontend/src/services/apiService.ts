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

// Instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Habilitar envío de cookies y headers de autenticación
});

// Comprobar si se debe usar datos simulados
const useMockData = isBrowser && (
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
  import.meta.env.VITE_USE_MOCK_DATA === true
);

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
      console.warn('Error al conectar con API. Usando datos simulados:', error);
      return Promise.reject(error);
    }
    
    // Para errores de red (sin respuesta del servidor)
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject(new Error('Error de conexión. Verifica tu conexión a internet.'));
    }
    
    // Manejar errores según código de estado
    switch (error.response.status) {
      case 401:
        console.error('Error de autenticación:', error.response.data);
        // Si estamos en el navegador, eliminar credenciales
        if (isBrowser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return Promise.reject(new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
      
      case 403:
        console.error('Error de permisos:', error.response.data);
        return Promise.reject(new Error('No tienes permisos para realizar esta acción.'));
      
      case 404:
        console.error('Recurso no encontrado:', error.response.data);
        return Promise.reject(new Error('El recurso solicitado no existe.'));
      
      case 500:
        console.error('Error del servidor:', error.response.data);
        return Promise.reject(new Error('Error en el servidor. Inténtalo de nuevo más tarde.'));
      
      default:
        console.error(`Error HTTP ${error.response.status}:`, error.response.data);
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
  
  // Asegurar que haya una barra al inicio del endpoint si no la tiene
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_PREFIX}${normalizedEndpoint}`;
};

/**
 * Función genérica para hacer peticiones HTTP con soporte para mock
 * @param method Método HTTP (GET, POST, etc.)
 * @param endpoint Ruta del endpoint
 * @param data Datos para enviar (opcional)
 * @param mockResponse Respuesta simulada (opcional)
 * @param config Configuración adicional para axios
 * @returns Promesa con la respuesta
 */
export const request = async <T>(
  method: string, 
  endpoint: string, 
  data?: any, 
  mockResponse?: T,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Construir ruta completa con prefijo API
    const prefixedEndpoint = addApiPrefix(endpoint);
    
    // Si estamos en modo simulado y hay una respuesta mock disponible, usarla
    if (useMockData && mockResponse !== undefined) {
      console.log(`[MOCK] ${method} ${prefixedEndpoint}`);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockResponse;
    }
    
    // Si no hay respuesta mock o no estamos en modo simulado, hacer petición real
    console.log(`[API] ${method} ${API_URL}${prefixedEndpoint}`);
    
    const response = await api.request<T>({
      method,
      url: prefixedEndpoint,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
      ...config
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error en petición ${method} ${endpoint}:`, error);
    throw error;
  }
};

// Funciones específicas para cada tipo de petición
export const get = <T>(endpoint: string, mockResponse?: T, config?: AxiosRequestConfig): Promise<T> => 
  request<T>('GET', endpoint, undefined, mockResponse, config);

export const post = <T>(endpoint: string, data?: any, mockResponse?: T, config?: AxiosRequestConfig): Promise<T> => 
  request<T>('POST', endpoint, data, mockResponse, config);

export const put = <T>(endpoint: string, data?: any, mockResponse?: T, config?: AxiosRequestConfig): Promise<T> => 
  request<T>('PUT', endpoint, data, mockResponse, config);

export const patch = <T>(endpoint: string, data?: any, mockResponse?: T, config?: AxiosRequestConfig): Promise<T> => 
  request<T>('PATCH', endpoint, data, mockResponse, config);

export const del = <T>(endpoint: string, mockResponse?: T, config?: AxiosRequestConfig): Promise<T> => 
  request<T>('DELETE', endpoint, undefined, mockResponse, config);

export default api;
