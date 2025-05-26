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
    patchData: (endpoint: string, data?: Record<string, any>) => Promise<any>;
  }
}

// Detectar si estamos en LocalTunnel o entorno local
const isLocalTunnel = typeof window !== 'undefined' && window.location.hostname.includes('loca.lt');

// Configuración base según el entorno
const baseURL = isLocalTunnel 
    ? 'https://api-masclet-imperi.loca.lt/api/v1' 
    : 'http://localhost:8000/api/v1';
    
const API_BASE_URL = '/api'; // Para el proxy local

// Funciones de utilidad
function normalizePath(path: string): string {
    // Eliminar barra inicial si existe
    path = path.startsWith('/') ? path.substring(1) : path;
    // Asegurar barra final
    return path.endsWith('/') ? path : `${path}/`;
}

// Logs para depuración
console.log('🌐 Modo de conexión:', isLocalTunnel ? 'Local Tunnel' : 'Local');
console.log('🔌 API Base URL:', baseURL);

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'X-Environment': isLocalTunnel ? 'tunnel' : 'local'
    },
    withCredentials: false // Evita problemas con CORS
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
        // Primero, loguear información detallada sobre la respuesta
        console.log('Respuesta del servidor recibida:', {
            url: response.config.url,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            contentType: response.headers['content-type']
        });
        
        // Inspeccionar el cuerpo de la respuesta en detalle
        console.log('Cuerpo completo de la respuesta:', response);
        console.log('Datos de la respuesta (data):', response.data);
        console.log('Tipo de data:', typeof response.data);
        
        // Si la respuesta es un string JSON, intentar parsearlo
        if (typeof response.data === 'string' && response.data.trim().startsWith('{')) {
            try {
                console.log('Intentando parsear respuesta como JSON...');
                const parsedData = JSON.parse(response.data);
                console.log('Datos parseados:', parsedData);
                return parsedData;
            } catch (e) {
                console.warn('Error al parsear respuesta como JSON:', e);
            }
        }
        
        // Manejar caso de respuesta indefinida (probablemente un error en la comunicación)
        if (response.data === undefined) {
            console.warn('Respuesta con data undefined, verificando respuesta bruta...');
            
            // Si hay un código de estado 200, pero data es undefined, extraer de otra parte
            if (response.status === 200) {
                // Intentar diferentes propiedades donde podrían estar los datos
                if (response.request && response.request.response) {
                    try {
                        console.log('Intentando extraer datos de request.response...');
                        const rawData = response.request.response;
                        if (typeof rawData === 'string') {
                            const parsedData = JSON.parse(rawData);
                            console.log('Datos extraídos de request.response:', parsedData);
                            return parsedData;
                        }
                    } catch (e) {
                        console.warn('Error al procesar request.response:', e);
                    }
                }
                
                // Si llegamos aquí y no hay datos, devolver un objeto vacío en lugar de undefined
                console.warn('No se pudieron extraer datos de la respuesta, devolviendo objeto vacío');
                return {};
            }
        }
        
        // Si la API devuelve datos en la propiedad 'data', lo extraemos
        if (response.data && typeof response.data === 'object' && response.data.hasOwnProperty('data')) {
            console.log('Extrayendo datos de response.data.data');
            return response.data.data;
        }

        // En cualquier otro caso, devolver los datos como vienen
        return response.data || {}; // Evitar devolver undefined
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
 * Realiza una petición GET a la API
 * @param endpoint Endpoint de la API
 * @param params Parámetros de la petición
 * @returns Promesa con la respuesta
 */
export async function fetchData(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  try {
    // Construir la URL con los parámetros
    const queryParams = new URLSearchParams();
    
    // Añadir parámetros adicionales a la URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    // Construir la URL según el entorno
    let url;
    if (isLocalTunnel) {
      // En LocalTunnel, llamamos directamente al backend
      const normalizedEndpoint = normalizePath(endpoint);
      url = `${baseURL}${normalizedEndpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    } else {
      // En local, usamos el proxy
      queryParams.append('endpoint', endpoint);
      url = `${API_BASE_URL}/proxy?${queryParams.toString()}`;
    }
    
    console.log(`🔍 Fetching data [${isLocalTunnel ? 'TUNNEL' : 'LOCAL'}]:`, url);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`❌ Error ${response.status} en GET ${endpoint}:`, errorData);
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Respuesta GET ${endpoint}:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ Error en fetchData (${endpoint}):`, error);
    throw {
      message: error.message || 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
      status: error.status || 0,
      code: error.code || 'NETWORK_ERROR'
    };
  }
}

/**
 * Realiza una petición POST a la API
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @param method Método HTTP (POST, PUT, DELETE)
 * @returns Promesa con la respuesta
 */
export async function postData(endpoint: string, data: Record<string, any> = {}, method: string = 'POST'): Promise<any> {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    let url;
    let requestBody;
    
    if (isLocalTunnel) {
      // En LocalTunnel, llamamos directamente al backend
      const normalizedEndpoint = normalizePath(endpoint);
      url = `${baseURL}${normalizedEndpoint}`;
      requestBody = JSON.stringify(data);
    } else {
      // En local, usamos el proxy
      url = `${API_BASE_URL}/proxy`;
      requestBody = JSON.stringify({
        endpoint,
        data,
        method
      });
    }
    
    console.log(`📤 ${method} [${isLocalTunnel ? 'TUNNEL' : 'LOCAL'}]:`, url, data);
    
    const response = await fetch(url, {
      method: isLocalTunnel ? method : 'POST',
      headers,
      body: requestBody
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`❌ Error ${response.status} en ${method} ${endpoint}:`, errorData);
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log(`✅ Respuesta ${method} ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`❌ Error en ${method} (${endpoint}):`, error);
    throw {
      message: error.message || 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
      status: error.status || 0,
      code: error.code || 'NETWORK_ERROR'
    };
  }
}

/**
 * Realiza una petición PATCH a la API
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @returns Promesa con la respuesta
 */
export async function patchData(endpoint: string, data: Record<string, any> = {}): Promise<any> {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    let url;
    let requestBody = JSON.stringify(data);
    
    if (isLocalTunnel) {
      // En LocalTunnel, llamamos directamente al backend
      const normalizedEndpoint = normalizePath(endpoint);
      url = `${baseURL}${normalizedEndpoint}`;
    } else {
      // En local, usamos el proxy
      url = `${API_BASE_URL}${endpoint}`;
    }
    
    console.log(`🔧 PATCH [${isLocalTunnel ? 'TUNNEL' : 'LOCAL'}]:`, url, data);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: requestBody
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`❌ Error ${response.status} en PATCH ${endpoint}:`, errorData);
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log(`✅ Respuesta PATCH ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`Error en patchData (${endpoint}):`, error);
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
    // Error general
    setError(error.message || defaultMessage);
  }
}

// Agregar los métodos al objeto api para mantener compatibilidad
api.fetchData = fetchData;
api.postData = postData;
api.putData = putData;
api.deleteData = deleteData;
api.handleApiError = handleApiError;
api.patchData = patchData;

export default api;