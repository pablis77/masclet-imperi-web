// Servicio API genérico con soporte para datos simulados
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as mockData from './mockData';

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// API URL desde variables de entorno o valor por defecto
const API_URL = isBrowser && import.meta.env.VITE_API_URL ? 
  import.meta.env.VITE_API_URL : 
  'http://127.0.0.1:8000';

// Prefijo API 
const API_PREFIX = '/api/v1';

// URL completa para la API
const FULL_API_URL = `${API_URL}${API_PREFIX}`;

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
  baseURL: FULL_API_URL,
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
    try {
      // Verificar si el token es válido antes de usarlo
      const tokenData = JSON.parse(atob(storedToken.split('.')[1]));
      const expiry = tokenData.exp * 1000; // Convertir a milisegundos
      
      if (expiry > Date.now()) {
        // Token válido, configurarlo
        setupApiToken(storedToken);
        logMessage('log', 'Token de autenticación configurado desde localStorage');
      } else {
        // Token expirado, eliminarlo
        localStorage.removeItem('token');
        logMessage('warn', 'Token de autenticación expirado, eliminado de localStorage');
      }
    } catch (error) {
      // Token inválido, eliminarlo
      localStorage.removeItem('token');
      logMessage('error', 'Token de autenticación inválido, eliminado de localStorage', error);
    }
  } else {
    logMessage('log', 'No hay token de autenticación en localStorage');
  }
}

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Verificar si hay token en localStorage en cada petición
    if (isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      if (isBrowser) {
        localStorage.removeItem('token');
        // Redirigir a login si es necesario
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Configurar interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Para errores de red (sin respuesta del servidor)
    if (!error.response) {
      logMessage('error', 'Error de red:', error.message);
      const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
      (networkError as any).code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }
    
    // Verificar si el error está relacionado con la columna estado_t
    const errorData = error.response.data;
    if (error.response.status === 500 && 
        errorData && 
        typeof errorData === 'object' && 
        'detail' in errorData && 
        typeof errorData.detail === 'string' && 
        errorData.detail.includes('estado_t')) {
      
      logMessage('error', 'Error específico de estado_t detectado:', errorData.detail);
      
      // Crear un error personalizado con información adicional
      const customError = new Error('Error en la base de datos: La columna estado_t no existe en la tabla animals. Este es un problema conocido que está siendo solucionado.');
      (customError as any).code = 'DB_COLUMN_ERROR';
      (customError as any).originalError = errorData;
      
      return Promise.reject(customError);
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
      
      case 422:
        logMessage('error', 'Error de validación:', error.response.data);
        return Promise.reject(new Error('Datos inválidos. Por favor, verifica la información proporcionada.'));
      
      default:
        logMessage('error', `Error del servidor (${error.response.status}):`, error.response.data);
        return Promise.reject(new Error('Error en el servidor. Inténtalo de nuevo más tarde.'));
    }
  }
);

/**
 * Añade el prefijo API a una ruta
 * @param endpoint Ruta de API sin prefijo
 * @returns Ruta completa con prefijo
 */
function addApiPrefix(endpoint: string): string {
  // Si ya tiene el prefijo, devolverlo tal cual
  if (endpoint.startsWith(API_PREFIX)) {
    return endpoint;
  }
  
  // Asegurarse de que el endpoint comience con /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Devolver la ruta completa
  return `${API_PREFIX}${normalizedEndpoint}`;
}

/**
 * Obtiene datos simulados para un endpoint específico
 * @param endpoint Ruta de la API sin el prefijo
 * @returns Datos simulados para el endpoint o null si no existen
 */
function getMockDataForEndpoint<T>(endpoint: string): T | null {
  // Eliminar el prefijo API y la barra inicial si existe
  const cleanEndpoint = endpoint.replace(API_PREFIX, '').replace(/^\//, '');
  
  // Verificar si hay datos específicos para este endpoint
  if (cleanEndpoint === 'animals') {
    return (mockData as any).animalsData as T;
  }
  
  if (cleanEndpoint === 'dashboard/stats') {
    return (mockData as any).dashboardStats as T;
  }
  
  if (cleanEndpoint === 'explotacions') {
    return (mockData as any).explotacionsData as T;
  }
  
  if (cleanEndpoint === 'parts') {
    return (mockData as any).partsData as T;
  }
  
  if (cleanEndpoint === 'import-history') {
    return (mockData as any).importHistory as T;
  }
  
  if (cleanEndpoint === 'users') {
    return (mockData as any).usersData as T;
  }
  
  // Para endpoints con ID, como animals/1, explotacions/2, etc.
  const animalMatch = cleanEndpoint.match(/^animals\/(\d+)$/);
  if (animalMatch && animalMatch[1]) {
    const animalId = parseInt(animalMatch[1], 10);
    return (mockData as any).getAnimalById(animalId) as T;
  }
  
  const explotacioMatch = cleanEndpoint.match(/^explotacions\/(\d+)$/);
  if (explotacioMatch && explotacioMatch[1]) {
    const explotacioId = parseInt(explotacioMatch[1], 10);
    return (mockData as any).getExplotacionById(explotacioId) as T;
  }
  
  const animalPartsMatch = cleanEndpoint.match(/^animals\/(\d+)\/parts$/);
  if (animalPartsMatch && animalPartsMatch[1]) {
    const animalId = parseInt(animalPartsMatch[1], 10);
    return (mockData as any).getPartsByAnimal(animalId) as T;
  }
  
  const explotacioAnimalsMatch = cleanEndpoint.match(/^explotacions\/(\d+)\/animals$/);
  if (explotacioAnimalsMatch && explotacioAnimalsMatch[1]) {
    const explotacioId = parseInt(explotacioAnimalsMatch[1], 10);
    return (mockData as any).getAnimalsByExplotacion(explotacioId) as T;
  }
  
  // Si no hay datos específicos, intentar obtener del objeto mockData
  return (mockData as any)[cleanEndpoint] as T || null;
}

/**
 * Realiza una petición GET a la API a través del proxy local
 * @param endpoint Endpoint de la API
 * @param params Parámetros de la petición
 * @returns Promesa con la respuesta
 */
export async function fetchData(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  try {
    // Construir la URL con los parámetros
    const queryParams = new URLSearchParams();
    
    // Asegurarse de que el endpoint tenga el prefijo correcto
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;
    queryParams.append('endpoint', fullEndpoint);
    
    // Añadir parámetros adicionales a la URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `/api/proxy?${queryParams.toString()}`;
    console.log(`Intentando conectar con: ${url}`);
    console.log(`Endpoint completo: ${fullEndpoint}`);
    console.log(`Parámetros:`, params);
    console.log(`API URL completa: ${API_URL}${fullEndpoint}`);

    // Obtener el token de autenticación
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Añadir el token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Token de autenticación añadido a la petición');
    } else {
      console.warn('No hay token de autenticación disponible. La petición podría fallar si requiere autenticación.');
    }

    // Realizar la petición con un timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Respuesta recibida con estado: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        let errorData;
        
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error(`Datos de error:`, errorData);
        } catch (e) {
          // Si no podemos parsear el JSON, usamos el mensaje de error por defecto
          console.error(`No se pudo parsear la respuesta de error como JSON`);
        }
        
        console.error(`Error en la petición: ${errorMessage}`);
        
        // Si es un 404, probablemente el endpoint no existe
        if (response.status === 404) {
          const error = {
            message: `El endpoint ${fullEndpoint} no existe o no está disponible`,
            status: 404,
            code: 'ENDPOINT_NOT_FOUND',
            endpoint: fullEndpoint,
            url: `${API_URL}${fullEndpoint}`
          };
          console.error('Error 404:', error);
          throw error;
        }
        
        // Si es un 401, el usuario no está autenticado
        if (response.status === 401) {
          // Intentar renovar el token (esto debería implementarse en un servicio de autenticación)
          console.warn('Error de autenticación. Intentando renovar token...');
          
          const error = {
            message: 'No estás autenticado. Por favor, inicia sesión.',
            status: 401,
            code: 'UNAUTHORIZED',
            endpoint: fullEndpoint
          };
          console.error('Error 401:', error);
          throw error;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`Datos recibidos de ${endpoint}:`, data);
      return data;
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        console.error(`La petición a ${endpoint} ha excedido el tiempo de espera.`);
        throw {
          message: 'La petición ha excedido el tiempo de espera.',
          status: 0,
          code: 'TIMEOUT_ERROR',
          endpoint
        };
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error(`Error en fetchData para ${endpoint}:`, error);
    
    // Verificar si es un error de red
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network Error'))) {
      console.warn(`Error de red al conectar con ${endpoint}. Utilizando datos simulados.`);
      
      // Intentar obtener datos simulados
      const mockEndpoint = endpoint.replace(API_PREFIX, '').replace(/^\//, '');
      const mockResponse = (mockData as any)[mockEndpoint];
      
      if (mockResponse) {
        console.warn(`Usando datos simulados como fallback para ${endpoint}`);
        return mockResponse;
      }
    }
    
    throw {
      message: error.message || 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
      status: error.status || 0,
      code: error.code || 'NETWORK_ERROR',
      endpoint
    };
  }
}

/**
 * Realiza una petición GET a la API
 * @param endpoint Endpoint de la API
 * @param options Opciones de la petición
 * @returns Promesa con la respuesta
 */
export async function get<T = any>(endpoint: string, options: { params?: Record<string, any> } = {}): Promise<T> {
  return fetchData(endpoint, options.params || {});
}

/**
 * Realiza una petición POST a la API
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @returns Promesa con la respuesta
 */
export async function post<T = any>(endpoint: string, data: any): Promise<T> {
  try {
    // Asegurarse de que el endpoint tenga el prefijo correcto
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;
    
    console.log(`Realizando POST a ${fullEndpoint} con datos:`, data);
    
    // Obtener el token de autenticación
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Añadir el token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No hay token de autenticación disponible. La petición podría fallar si requiere autenticación.');
    }
    
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        endpoint: fullEndpoint,
        data,
        method: 'POST'
      }),
    });
    
    console.log(`Respuesta POST recibida con estado: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error(`Datos de error POST:`, errorData);
      } catch (e) {
        console.error(`No se pudo parsear la respuesta de error POST como JSON`);
      }
      
      console.error(`Error en la petición POST: ${errorMessage}`);
      
      // Si es un 401, el usuario no está autenticado
      if (response.status === 401) {
        const error = {
          message: 'No estás autenticado. Por favor, inicia sesión.',
          status: 401,
          code: 'UNAUTHORIZED',
          endpoint: fullEndpoint
        };
        console.error('Error 401:', error);
        throw error;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log(`Datos POST recibidos de ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`Error en post para ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Realiza una petición PUT a la API
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @returns Promesa con la respuesta
 */
export async function put<T = any>(endpoint: string, data: any): Promise<T> {
  try {
    // Asegurarse de que el endpoint tenga el prefijo correcto
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;
    
    console.log(`Realizando PUT a ${fullEndpoint} con datos:`, data);
    
    // Obtener el token de autenticación
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Añadir el token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No hay token de autenticación disponible. La petición podría fallar si requiere autenticación.');
    }
    
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        endpoint: fullEndpoint,
        data,
        method: 'PUT'
      }),
    });
    
    console.log(`Respuesta PUT recibida con estado: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error(`Datos de error PUT:`, errorData);
      } catch (e) {
        console.error(`No se pudo parsear la respuesta de error PUT como JSON`);
      }
      
      console.error(`Error en la petición PUT: ${errorMessage}`);
      
      // Si es un 401, el usuario no está autenticado
      if (response.status === 401) {
        const error = {
          message: 'No estás autenticado. Por favor, inicia sesión.',
          status: 401,
          code: 'UNAUTHORIZED',
          endpoint: fullEndpoint
        };
        console.error('Error 401:', error);
        throw error;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log(`Datos PUT recibidos de ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`Error en put para ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Realiza una petición DELETE a la API
 * @param endpoint Endpoint de la API
 * @returns Promesa con la respuesta
 */
export async function del<T = any>(endpoint: string): Promise<T> {
  try {
    // Asegurarse de que el endpoint tenga el prefijo correcto
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;
    
    console.log(`Realizando DELETE a ${fullEndpoint}`);
    
    // Obtener el token de autenticación
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Añadir el token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No hay token de autenticación disponible. La petición podría fallar si requiere autenticación.');
    }
    
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        endpoint: fullEndpoint,
        data: {},
        method: 'DELETE'
      }),
    });
    
    console.log(`Respuesta DELETE recibida con estado: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error(`Datos de error DELETE:`, errorData);
      } catch (e) {
        console.error(`No se pudo parsear la respuesta de error DELETE como JSON`);
      }
      
      console.error(`Error en la petición DELETE: ${errorMessage}`);
      
      // Si es un 401, el usuario no está autenticado
      if (response.status === 401) {
        const error = {
          message: 'No estás autenticado. Por favor, inicia sesión.',
          status: 401,
          code: 'UNAUTHORIZED',
          endpoint: fullEndpoint
        };
        console.error('Error 401:', error);
        throw error;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log(`Datos DELETE recibidos de ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`Error en del para ${endpoint}:`, error);
    throw error;
  }
}

export const API_PATH = API_PREFIX;
export { useMockData };

function handleApiError(error: AxiosError) {
  // Si no hay respuesta, es probablemente un error de red
  if (!error.response) {
    logMessage('error', 'Error de red:', error.message);
    return;
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
      break;
    case 403:
      logMessage('error', 'Error de permisos:', error.response.data);
      break;
    case 404:
      logMessage('error', 'Recurso no encontrado:', error.response.data);
      break;
    case 422:
      logMessage('error', 'Error de validación:', error.response.data);
      break;
    default:
      logMessage('error', `Error del servidor (${error.response.status}):`, error.response.data);
  }
}
