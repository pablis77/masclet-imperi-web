/**
 * Servicio API centralizado para Masclet Imperi
 * ==========================================
 * 
 * Esta versión ha sido actualizada para usar la configuración centralizada
 * de API a través del adaptador apiConfigAdapter.ts
 */

import axios from 'axios';
import { 
  API_BASE_URL,
  API_TIMEOUT,
  API_DEFAULT_HEADERS,
  environment,
  isProduction,
  isLocal,
  TOKEN_NAME
} from './apiConfigAdapter';

// Variables para mantener compatibilidad con código existente
let ENVIRONMENT: string = environment;
let USE_MOCK_DATA: boolean = false;

// Imprimir información de diagnóstico
console.log(`[ApiService] Entorno: ${ENVIRONMENT}`);
console.log(`[ApiService] API configurada para conectarse a: ${API_BASE_URL}`);

if (isProduction) {
  console.log('[ApiService] Ejecutando en modo PRODUCCIÓN');
} else {
  // Modo local (incluye localhost, 127.0.0.1, redes internas, etc.)
  console.log('[ApiService] Ejecutando en modo LOCAL');
}

// Credenciales fijas para desarrollo: admin/admin123
// Estas son las credenciales indicadas en los requisitos

// Mantener una copia local de la URL base para posibles modificaciones
let apiBaseUrl = API_BASE_URL;

// Crear instancia de axios con configuración base centralizada
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: API_TIMEOUT,
  headers: API_DEFAULT_HEADERS
});

// GESTIÓN UNIVERSAL DE PETICIONES API
api.interceptors.request.use(
  (config) => {
    const endpoint = config.url || '';
    
    // Debug para todas las peticiones
    // console.log(`[API] Procesando solicitud: ${endpoint}`);
    
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
    if (typeof localStorage !== 'undefined' && localStorage.getItem(TOKEN_NAME)) {
      config.headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_NAME)}`;
    }
    
    // NO activamos withCredentials en ningún entorno para evitar problemas CORS
    // Las cookies no son necesarias para nuestro esquema de autenticación JWT
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
        const token = localStorage.getItem(TOKEN_NAME);
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('Usando token JWT para autenticación');
        } else {
          console.warn('No se encontró token en localStorage');
          // Opcional: redirigir a login si no hay token
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
  apiBaseUrl = baseUrl; // Usar variable local en lugar de la importada
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
    // El backend está redirigiendo los endpoints con / al final a los que no lo tienen
    const finalEndpoint = (!apiEndpoint.includes('?') && apiEndpoint.endsWith('/')) 
      ? apiEndpoint.slice(0, -1) 
      : apiEndpoint;
    
    // IMPORTANTE: En producción, solo imprimir la ruta relativa
    if (isProduction) {
      // console.log(`Realizando petición GET a: ${finalEndpoint}`);
    } else {
      console.log(`Realizando petición GET a: ${finalEndpoint}`);
    }
    
    const response = await api.get<T>(finalEndpoint);
    
    // Registrar información detallada de la respuesta para depuración
    // console.log(`✅ Respuesta recibida de ${finalEndpoint}:`, {
    //   status: response.status,
    //   statusText: response.statusText,
    //   dataType: typeof response.data,
    //   isNull: response.data === null,
    //   isUndefined: response.data === undefined,
    //   dataLength: response.data && typeof response.data === 'object' ? Object.keys(response.data).length : 'N/A'
    // });
    
    // Si la data es undefined o null, registrar warning y devolver objeto vacío
    if (response.data === undefined || response.data === null) {
      // console.warn(`⚠️ Datos recibidos vacíos en ${finalEndpoint}`);
      
      // Devolver objeto vacío del tipo esperado para evitar errores
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
      // Solo mantenemos un log de error básico para diagnóstico
      console.error(`❌ Error en petición GET a ${endpoint}: ${error.message} (${error.response?.status || 'sin status'})`);
    } else {
      console.error(`❌ Error no relacionado con Axios en ${endpoint}: ${error}`);
    }
    
    // Mecanismo de reintento para errores 404
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Obtener la URL original que falló
      const originalUrl = error.config?.url || '';
      const absoluteUrl = error.config?.baseURL ? `${error.config.baseURL}${originalUrl}` : originalUrl;
      
      // Registrar el fallo para diagnóstico
      // console.warn(`⚠️ Error 404 en: ${absoluteUrl}`);
      
      // En desarrollo local, simplemente registramos el error y dejamos que falle normalmente
      if (!isProduction) {
        // console.warn(`Entorno de desarrollo: sin reintentos automáticos`);
      } else {
        // En producción, intentamos estrategias de recuperación
        
        // Estrategia 1: Convertir URL absoluta a relativa
        if (absoluteUrl.includes('://')) {
          try {
            // Extraer solo el path para hacer una petición relativa
            const urlObj = new URL(absoluteUrl);
            const relativePath = urlObj.pathname + urlObj.search;
            // console.log(`🔧 Detectada URL absoluta, reintentando con ruta relativa: ${relativePath}`);
            
            // Hacer una petición completamente relativa
            try {
              // Configurar manualmente para ignorar cualquier baseURL
              const retryResponse = await axios.get<T>(relativePath, {
                baseURL: '',
                headers: error.config?.headers
              });
              // console.log(`✅ Éxito con la ruta relativa!`);
              return retryResponse.data;
            } catch (retryError) {
              // console.error(`💥 Falló el intento con ruta relativa: ${relativePath}`);
            }
          } catch (e) {
            // console.warn(`No se pudo procesar la URL para reintento: ${absoluteUrl}`);
          }
        }
        
        // Estrategia 2: Corregir URLs mal formadas
        if (originalUrl.includes('//') || originalUrl.includes('api/api') || 
            (originalUrl.includes('/api/v1') && endpoint.includes('/api/v1'))) {
          
          // console.log(`🔧 Detectada URL mal formada, intentando corregir...`);
          
          // Corregir problemas comunes en las URLs
          let correctedUrl = endpoint.replace(/api\/api/g, 'api');
          correctedUrl = correctedUrl.replace(/\/api\/v1\/api\/v1/g, '/api/v1');
          correctedUrl = correctedUrl.replace(/\/\/api\/v1/g, '/api/v1');
          
          // Si la URL se corrige, intentar nuevamente
          if (correctedUrl !== endpoint) {
            // console.log(`🔨 Reintentando con URL corregida: ${correctedUrl}`);
            try {
              const retryResponse = await api.get<T>(correctedUrl);
              // console.log(`✅ Éxito con URL corregida!`);
              return retryResponse.data;
            } catch (retryError) {
              // console.error(`💥 También falló el reintento con URL corregida`);            
            }
          }
        }
        
        // Estrategia 3: Último intento con ruta absoluta desde raíz
        if (error.config?.baseURL) {
          try {
            let finalAttemptUrl = originalUrl;
            if (!finalAttemptUrl.startsWith('/api')) {
              finalAttemptUrl = `/api/v1/${finalAttemptUrl.startsWith('/') ? finalAttemptUrl.substring(1) : finalAttemptUrl}`;
            }
            
            // console.log(`🤖 Último intento con ruta absoluta: ${finalAttemptUrl}`);
            const lastResponse = await axios.get<T>(finalAttemptUrl, {
              baseURL: ''
            });
            // console.log(`✅ Éxito en el último intento!`);
            return lastResponse.data;
          } catch (lastError) {
            // console.error(`💥 Falló el último intento de recuperación`); 
          }
        }
      }
      
      // Si llegamos aquí, el reintento falló o no se intentó, devolver array vacío para endpoints de lista
      if (endpoint.includes('list') || 
          endpoint.includes('all') || 
          endpoint.includes('explotacions') || 
          endpoint.includes('animales')) {
        // console.warn(`Devolviendo array vacío para ${endpoint} debido a 404`);
        return [] as unknown as T;
      }
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
    // Normalizar endpoint
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    console.log(`Realizando petición PATCH a ${apiBaseUrl}${normalizedEndpoint}`);
    console.log('Datos enviados:', data);
    
    // Realizar petición utilizando URL base local
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
    // Verificar si hay un token en localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Opcionalmente, verificar la validez del token con el backend
      // await get('/auth/verify');
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
    // Crear los datos en formato application/x-www-form-urlencoded que espera OAuth2
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    
    // Ruta de login directa sin concatenar baseURL para evitar problemas
    const loginEndpoint = '/auth/login';
    
    // Determinar qué URL usar para el login
    let loginUrl = loginEndpoint;
    let useBaseUrlOverride = false;
    let baseUrlOverride = '';
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocalNetwork = 
        hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        /^192\.168\./.test(hostname) ||
        /^10\./.test(hostname) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(hostname);
      
      if (isLocalNetwork) {
        // Para redes locales usando IP, forzar conexión a localhost:8000
        useBaseUrlOverride = true;
        baseUrlOverride = 'http://127.0.0.1:8000/api/v1';
        loginUrl = '/auth/login'; // Sin api/v1 ya que está en baseUrlOverride
        console.log(`Realizando login a: ${baseUrlOverride}${loginUrl}`);
      } else if (isProduction) {
        console.log(`Realizando login a: /api/v1${loginEndpoint}`);
      } else {
        console.log(`Realizando login a: ${api.defaults.baseURL}${loginEndpoint}`);
      }
    } else {
      console.log(`Realizando login a: ${api.defaults.baseURL}${loginEndpoint}`);
    }
    
    // Realizar la solicitud con el formato correcto
    let response;
    if (useBaseUrlOverride) {
      // Crear una instancia de axios temporal para esta petición específica
      const tempAxios = axios.create({
        baseURL: baseUrlOverride,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      response = await tempAxios.post(loginUrl, formData);
    } else {
      // Usar configuración estándar
      response = await api.post(loginEndpoint, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }
    
    // Guardar el token en localStorage
    if (typeof window !== 'undefined' && window.localStorage && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
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
};

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
