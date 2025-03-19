import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

// Extender la interfaz AxiosInstance para incluir nuestros métodos personalizados
declare module 'axios' {
  interface AxiosInstance {
    fetchData: (endpoint: string, params?: Record<string, any>) => Promise<any>;
    postData: (endpoint: string, data?: Record<string, any>, method?: string) => Promise<any>;
    putData: (endpoint: string, data?: Record<string, any>) => Promise<any>;
    deleteData: (endpoint: string, data?: Record<string, any>) => Promise<any>;
    handleApiError: (error: any, setError: (message: string) => void, defaultMessage?: string) => void;
  }
}

// Configuración base
const baseURL = 'http://localhost:8000/api/v1';
const API_BASE_URL = '/api'; // Para el proxy local

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Evita problemas con CORS
});

// Interceptor para agregar el token JWT a las solicitudes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Si la API devuelve datos en la propiedad 'data', lo extraemos
        if (response.data && response.data.hasOwnProperty('data')) {
            return response.data.data;
        }

        return response.data;
    },
    (error: AxiosError) => {
        // Manejar errores específicos por código
        if (error.response) {
            // Error de autenticación
            if (error.response.status === 401) {
                // Limpiar token y redirigir a login
                localStorage.removeItem('token');
                window.location.href = '/login';
            }

            // Formatear respuestas de error para uso en UI
            const errorData = error.response.data as any;
            const errorMsg = errorData.detail || errorData.message || 'Error desconocido';

            return Promise.reject({
                message: errorMsg,
                status: error.response.status,
                code: errorData.code || 'ERROR'
            });
        }

        // Error de red
        if (error.request) {
            return Promise.reject({
                message: 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
                status: 0,
                code: 'NETWORK_ERROR'
            });
        }

        // Error general
        return Promise.reject({
            message: error.message || 'Ocurrió un error al procesar la solicitud',
            status: 500,
            code: 'UNKNOWN_ERROR'
        });
    }
);

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
    queryParams.append('endpoint', endpoint);
    
    // Añadir parámetros adicionales a la URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${API_BASE_URL}/proxy?${queryParams.toString()}`;
    console.log(`Fetching data from: ${url}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`Error en fetchData (${endpoint}):`, error);
    throw {
      message: error.message || 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
      status: error.status || 0,
      code: error.code || 'NETWORK_ERROR'
    };
  }
}

/**
 * Realiza una petición POST a la API a través del proxy local
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @param method Método HTTP (POST, PUT, DELETE)
 * @returns Promesa con la respuesta
 */
export async function postData(endpoint: string, data: Record<string, any> = {}, method: string = 'POST'): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        data,
        method
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`Error en postData (${endpoint}):`, error);
    throw {
      message: error.message || 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
      status: error.status || 0,
      code: error.code || 'NETWORK_ERROR'
    };
  }
}

/**
 * Realiza una petición PUT a la API a través del proxy local
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @returns Promesa con la respuesta
 */
export async function putData(endpoint: string, data: Record<string, any> = {}): Promise<any> {
  return postData(endpoint, data, 'PUT');
}

/**
 * Realiza una petición DELETE a la API a través del proxy local
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @returns Promesa con la respuesta
 */
export async function deleteData(endpoint: string, data: Record<string, any> = {}): Promise<any> {
  return postData(endpoint, data, 'DELETE');
}

/**
 * Maneja los errores de la API de forma consistente
 * @param error Error capturado
 * @param setError Función para establecer el error en el estado
 * @param defaultMessage Mensaje por defecto
 */
export function handleApiError(error: any, setError: (message: string) => void, defaultMessage: string = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.'): void {
  console.error('API Error:', error);
  
  if (error.code === 'NETWORK_ERROR') {
    setError('No se pudo conectar con el servidor. Por favor, verifique su conexión.');
  } else if (error.message) {
    setError(error.message);
  } else {
    setError(defaultMessage);
  }
}

// Agregar los métodos al objeto api para mantener compatibilidad
api.fetchData = fetchData;
api.postData = postData;
api.putData = putData;
api.deleteData = deleteData;
api.handleApiError = handleApiError;

export default api;