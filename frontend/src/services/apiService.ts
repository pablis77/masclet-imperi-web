// Servicio API genérico con soporte para datos simulados
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as mockData from './mockData';

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// Funciones seguras para localStorage que verifican si estamos en un navegador
const safeStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error al acceder a localStorage.getItem:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error al acceder a localStorage.setItem:', error);
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error al acceder a localStorage.removeItem:', error);
    }
  }
};

// API URL desde variables de entorno o valor por defecto
const API_URL = isBrowser && import.meta.env.VITE_API_URL ? 
  import.meta.env.VITE_API_URL : 
  'http://127.0.0.1:8000'; // Usar IP explícita en lugar de localhost

// Prefijo API 
const API_PREFIX = '/api/v1';

// URL completa para la API
const FULL_API_URL = `${API_URL}${API_PREFIX}`;

// Comprobar si se debe usar datos simulados (desactivado por defecto)
const useMockData = isBrowser && (
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
  import.meta.env.VITE_USE_MOCK_DATA === true || 
  false // Forzar a false si no está definido en el entorno
);

console.log(`Conectando a API en: ${FULL_API_URL} | Datos simulados: ${useMockData ? 'SI' : 'NO'}`);


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
    'Accept': 'application/json',
  },
  withCredentials: false, // Desactivar envío de cookies para evitar problemas de CORS
  maxRedirects: 5, // Permitir seguir redirecciones automáticamente
});

// Función para configurar el token de autenticación
export const setupApiToken = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Token configurado correctamente');
};

// Configurar eventos para monitorear las solicitudes HTTP
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'object' && 'code' in event.reason) {
      console.error('Error de red no manejado:', event.reason);
    }
  });
}

// Inicializar token desde localStorage solo si estamos en el navegador
if (isBrowser) {
  const storedToken = safeStorage.getItem('token');
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
        safeStorage.removeItem('token');
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
      const token = safeStorage.getItem('token');
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

// Interceptor para manejar redirecciones y errores de autenticación
api.interceptors.response.use(
  (response) => {
    // Si recibimos una redirección con código 307, seguirla manualmente
    if (response.status === 307 && response.headers.location) {
      console.log(`Siguiendo redirección a: ${response.headers.location}`);
      return axios.get(response.headers.location);
    }
    return response;
  },
  (error) => {
    // Manejar redirecciones en caso de error
    if (error.response && error.response.status === 307 && error.response.headers.location) {
      console.log(`Siguiendo redirección desde error a: ${error.response.headers.location}`);
      return axios.get(error.response.headers.location);
    }
    
    // Manejar errores de autenticación
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      if (isBrowser) {
        safeStorage.removeItem('token');
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
      const errorMsg = `Error de red: ${error.message} al intentar conectar con ${error.config?.url || FULL_API_URL}`;
      console.error(errorMsg);
      logMessage('error', 'Error de red detallado:', { 
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      // Mostrar error detallado para diagnóstico
      const networkError = new Error(`Error de conexión con el servidor. URL: ${error.config?.url}. Detalles: ${error.message}`);
      (networkError as any).code = 'NETWORK_ERROR';
      (networkError as any).endpoint = error.config?.url;
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
          safeStorage.removeItem('token');
          safeStorage.removeItem('user');
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
 * Normaliza un endpoint para asegurar que tenga el formato correcto
 * @param endpoint Endpoint a normalizar
 * @returns Endpoint normalizado
 */
function normalizeEndpoint(endpoint: string): string {
  // Eliminar el prefijo API si existe
  let normalizedEndpoint = endpoint.replace(API_PREFIX, '');
  
  // Asegurarse de que comience con /
  if (!normalizedEndpoint.startsWith('/')) {
    normalizedEndpoint = `/${normalizedEndpoint}`;
  }
  
  // Asegurarse de que termine con / para endpoints específicos
  // Lista de patrones de endpoints que deben terminar con /
  const shouldEndWithSlash = [
    '/dashboard/stats',
    '/animals',
    '/explotacions',
    '/parts',
    '/users'
  ];
  
  // Verificar si el endpoint coincide con alguno de los patrones
  const needsTrailingSlash = shouldEndWithSlash.some(pattern => 
    normalizedEndpoint === pattern || 
    normalizedEndpoint.startsWith(`${pattern}/`) ||
    // Regex para detectar patrones como /animals/123 (sin barra final)
    new RegExp(`^${pattern.replace('/', '\\/')}\/\\d+$`).test(normalizedEndpoint)
  );
  
  // Añadir / al final si es necesario y no la tiene ya
  if (needsTrailingSlash && !normalizedEndpoint.endsWith('/')) {
    normalizedEndpoint = `${normalizedEndpoint}/`;
    console.log(`🔄 [API] Endpoint normalizado con barra final: ${normalizedEndpoint}`);
  }
  
  return normalizedEndpoint;
}

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
  
  // Normalizar el endpoint
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  
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
export async function fetchData<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  try {
    // Asegurarse de que el endpoint tenga el prefijo correcto
    let normalizedEndpoint = endpoint;
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }
    
    // Construir la URL completa
    // Usar directamente la URL del backend sin proxy
    let url = `${API_URL}${API_PREFIX}${normalizedEndpoint}`;
    
    // Añadir parámetros de consulta si existen
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Manejar arrays (por ejemplo, para filtros múltiples)
            value.forEach(v => queryParams.append(`${key}[]`, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      url = `${url}?${queryParams.toString()}`;
    }
    
    console.log(`🔍 [API] Iniciando solicitud a: ${url}`);
    
    // Intentar primero con axios
    try {
      console.log('🔄 [API] Intentando con axios...');
      // Configuración para axios
      const axiosConfig: AxiosRequestConfig = {
        method: 'GET',
        url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': '' // Campo vacío que se reemplazará si hay token
        },
        timeout: 15000,
        maxRedirects: 5,
        withCredentials: false // Desactivar cookies para evitar CORS
      };

      // Obtener el token de autenticación
      const token = safeStorage.getItem('token');
      if (token && axiosConfig.headers) {
        axiosConfig.headers['Authorization'] = `Bearer ${token}`;
      }

      // Realizar la petición con axios
      const axiosResponse = await axios(axiosConfig);
      console.log(`✅ [API] Axios - Respuesta exitosa de ${url}`, axiosResponse.data);
      return axiosResponse.data;
    } catch (axiosError: any) {
      // Si axios falla (especialmente con 307), intentar con fetch
      console.warn(`⚠️ [API] Axios falló:`, axiosError.message || 'Error desconocido');
      console.log('🔄 [API] Intentando con fetch nativo en modo manual de redirecciones...');
      
      // Headers para fetch
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Añadir el token de autenticación si existe
      const token = safeStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Configuración para seguir redirecciones manualmente
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        // Primera solicitud con modo manual de redirecciones
        let response = await fetch(url, {
          method: 'GET',
          headers,
          redirect: 'manual', // Crucial: manejar redirecciones manualmente
          signal: controller.signal,
          credentials: 'omit' // No enviar cookies para evitar CORS
        });
        
        // Seguir redirecciones manualmente (hasta 5 veces)
        let redirectCount = 0;
        while (redirectCount < 5 && 
              (response.status === 301 || response.status === 302 || 
               response.status === 307 || response.status === 308)) {
          
          // Obtener la URL de redirección
          const location = response.headers.get('Location');
          if (!location) {
            console.error('🚨 [API] Redirección sin URL de destino');
            break;
          }
          
          // Construir URL completa si es relativa
          const redirectUrl = location.startsWith('http') 
              ? location 
              : new URL(location, url).toString();
          
          console.log(`🔀 [API] Siguiendo redirección #${redirectCount + 1} a: ${redirectUrl}`);
          
          // Hacer la petición a la URL de redirección
          response = await fetch(redirectUrl, {
            method: 'GET',
            headers,
            redirect: 'manual',
            signal: controller.signal,
            credentials: 'omit'
          });
          
          redirectCount++;
        }
        
        clearTimeout(timeoutId);
        
        // Manejar la respuesta final
        if (response.status >= 200 && response.status < 300) {
          const data = await response.json();
          console.log(`✅ [API] Fetch - Respuesta exitosa después de ${redirectCount} redirecciones`);
          return data;
        } else {
          // Manejar errores
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.error('🚨 [API] Datos de error:', errorData);
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            console.error('🚨 [API] No se pudo parsear el error como JSON');
          }
          
          throw new Error(errorMessage);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error(`🚨 [API] Timeout en la petición a ${url}`);
          throw {
            message: 'La petición ha excedido el tiempo de espera.',
            status: 0,
            code: 'TIMEOUT_ERROR',
            endpoint
          };
        }
        throw fetchError;
      }
    }
  } catch (error: any) {
    console.error(`🚨 [API] Error en fetchData para ${endpoint}:`, error);
    
    // Intentar usar datos simulados como último recurso
    if (useMockData || 
        (error.message && 
         (error.message.includes('Failed to fetch') || 
          error.message.includes('Network Error')))) {
      
      console.warn(`⚠️ [API] Intentando usar datos simulados para ${endpoint}`);
      
      // Preparar endpoint para datos simulados
      const mockEndpoint = endpoint.replace(/^\//, '').replace(API_PREFIX, '');
      const mockResponse = getMockDataForEndpoint<T>(mockEndpoint);
      
      if (mockResponse) {
        console.warn(`⚠️ [API] Usando datos simulados como fallback para ${endpoint}`);
        return mockResponse;
      }
    }
    
    // Si no hay datos simulados, lanzar el error
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
    let normalizedEndpoint = endpoint;
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }
    
    // Construir la URL completa
    const url = `${API_URL}${API_PREFIX}${normalizedEndpoint}`;
    
    console.log(`📨 [API] Iniciando POST a: ${url}`);
    console.log(`📨 [API] Datos a enviar:`, data);
    
    // Obtener el token de autenticación
    const token = safeStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Añadir el token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 [API] Token de autenticación añadido a la petición');
    } else {
      console.warn('⚠️ [API] No hay token de autenticación disponible.');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    console.log(`📨 [API] Respuesta POST recibida con estado: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error(`🚨 [API] Datos de error en POST:`, errorData);
      } catch (e) {
        // Si no podemos parsear el JSON, usamos el mensaje de error por defecto
        console.error(`🚨 [API] No se pudo parsear la respuesta de error como JSON`);
      }
      
      console.error(`🚨 [API] Error en la petición POST: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log(`📦 [API] Datos recibidos de POST ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`🚨 [API] Error en post para ${endpoint}:`, error);
    
    // Verificar si es un error de red
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network Error'))) {
      console.warn(`⚠️ [API] Error de red al conectar con ${endpoint} (POST).`);
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
 * Realiza una petición PUT a la API
 * @param endpoint Endpoint de la API
 * @param data Datos a enviar
 * @returns Promesa con la respuesta
 */
export async function put<T = any>(endpoint: string, data: any): Promise<T> {
  try {
    // Asegurarse de que el endpoint tenga el prefijo correcto
    let normalizedEndpoint = endpoint;
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }
    
    // Construir la URL completa
    const url = `${API_URL}${API_PREFIX}${normalizedEndpoint}`;
    
    console.log(`🔄 [API] Iniciando PUT a: ${url}`);
    console.log(`🔄 [API] Datos a enviar:`, data);
    
    // Obtener el token de autenticación
    const token = safeStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Añadir el token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 [API] Token de autenticación añadido a la petición');
    } else {
      console.warn('⚠️ [API] No hay token de autenticación disponible.');
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    console.log(`🔄 [API] Respuesta PUT recibida con estado: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error(`🚨 [API] Datos de error en PUT:`, errorData);
      } catch (e) {
        // Si no podemos parsear el JSON, usamos el mensaje de error por defecto
        console.error(`🚨 [API] No se pudo parsear la respuesta de error como JSON`);
      }
      
      console.error(`🚨 [API] Error en la petición PUT: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log(`📦 [API] Datos recibidos de PUT ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`🚨 [API] Error en put para ${endpoint}:`, error);
    
    // Verificar si es un error de red
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network Error'))) {
      console.warn(`⚠️ [API] Error de red al conectar con ${endpoint} (PUT).`);
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
 * Realiza una petición DELETE a la API
 * @param endpoint Endpoint de la API
 * @returns Promesa con la respuesta
 */
export async function del<T = any>(endpoint: string): Promise<T> {
  try {
    // Asegurarse de que el endpoint tenga el prefijo correcto
    let normalizedEndpoint = endpoint;
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }
    
    // Construir la URL completa
    const url = `${API_URL}${API_PREFIX}${normalizedEndpoint}`;
    
    console.log(`🗑️ [API] Iniciando DELETE a: ${url}`);
    
    // Obtener el token de autenticación
    const token = safeStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Añadir el token de autenticación si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 [API] Token de autenticación añadido a la petición');
    } else {
      console.warn('⚠️ [API] No hay token de autenticación disponible.');
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    console.log(`🗑️ [API] Respuesta DELETE recibida con estado: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error(`🚨 [API] Datos de error en DELETE:`, errorData);
      } catch (e) {
        // Si no podemos parsear el JSON, usamos el mensaje de error por defecto
        console.error(`🚨 [API] No se pudo parsear la respuesta de error como JSON`);
      }
      
      console.error(`🚨 [API] Error en la petición DELETE: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log(`📦 [API] Datos recibidos de DELETE ${endpoint}:`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`🚨 [API] Error en del para ${endpoint}:`, error);
    
    // Verificar si es un error de red
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network Error'))) {
      console.warn(`⚠️ [API] Error de red al conectar con ${endpoint} (DELETE).`);
    }
    
    throw {
      message: error.message || 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
      status: error.status || 0,
      code: error.code || 'NETWORK_ERROR',
      endpoint
    };
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
        safeStorage.removeItem('token');
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

// Función para iniciar sesión
export const login = async (username: string, password: string): Promise<any> => {
  try {
    console.log('🔑 [apiService] Intentando iniciar sesión...');
    
    // Crear formData para OAuth2
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');
    
    // Hacer petición directa al backend
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [apiService] Error al iniciar sesión:', errorData);
      throw new Error(errorData.detail || 'Error al iniciar sesión');
    }
    
    const data = await response.json();
    console.log('✅ [apiService] Inicio de sesión exitoso');
    
    // Guardar token en localStorage
    if (data.access_token) {
      safeStorage.setItem('token', data.access_token);
      
      // Decodificar token para obtener información del usuario
      try {
        const tokenParts = data.access_token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Guardar información del usuario
          const user = {
            username: payload.sub || username,
            role: payload.role || 'usuario',
            id: payload.user_id || 0,
            is_active: true
          };
          
          safeStorage.setItem('user', JSON.stringify(user));
          console.log(`✅ [apiService] Información de usuario guardada: ${user.username} (${user.role})`);
        }
      } catch (error) {
        console.error('❌ [apiService] Error al decodificar token:', error);
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ [apiService] Error en login:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logout = (): void => {
  safeStorage.removeItem('token');
  safeStorage.removeItem('user');
  console.log('🔒 [apiService] Sesión cerrada');
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = safeStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Verificar si el token ha expirado
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = tokenData.exp * 1000; // Convertir a milisegundos
    
    if (Date.now() >= expirationTime) {
      console.log('⚠️ [apiService] Token expirado');
      localStorage.removeItem('token');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ [apiService] Error al verificar token:', error);
    return false;
  }
};

// Función para obtener el token
export const getToken = (): string | null => {
  return safeStorage.getItem('token');
};

// Función para obtener información del usuario
export const getUserInfo = (): any => {
  const userStr = safeStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('❌ [apiService] Error al obtener información del usuario:', error);
    return null;
  }
};
