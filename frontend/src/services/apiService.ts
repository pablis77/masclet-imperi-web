import axios from 'axios';

// Configuración global usando variables de entorno
const getApiUrl = (): string => {
  // Obtener URL de API de las variables de entorno
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // Si existe una URL configurada, usarla
  if (envApiUrl) {
    return envApiUrl;
  }

  // LOG del entorno
  console.log(`Detectado entorno: ${ENVIRONMENT}`);
  
  // En producción o entorno con dominio personalizado, SIEMPRE usar ruta relativa
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // Si estamos en producción (Render) o cualquier entorno que no sea local
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      console.log(`[ApiService] Detectado entorno de producción o externo: ${currentHost}`);
      console.log(`[ApiService] API configurada para conectarse a: /api/v1`);
      
      // USAR SIEMPRE ruta relativa en entornos de producción (esto es crítico)
      return '/api/v1'; 
    }
  }
  
  // Solo para entornos locales (localhost/127.0.0.1) usar URL completa
  const serverHost = 'localhost';
  const port = '8000';
  const protocol = 'http';
  
  console.log(`[ApiService] Usando URL local: ${protocol}://${serverHost}:${port}/api/v1`);
  return `${protocol}://${serverHost}:${port}/api/v1`;
};

// Opciones de entorno
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const ENABLE_LOGGING = import.meta.env.VITE_ENABLE_LOGGING === 'true';
const TOKEN_EXPIRE_MINUTES = parseInt(import.meta.env.VITE_TOKEN_EXPIRE_MINUTES || '30');

// Configurar valores iniciales
let API_BASE_URL = getApiUrl();
let USE_MOCK_DATA = false;

// Solo mostrar log en desarrollo o si el logging está habilitado
if (ENVIRONMENT === 'development' || ENABLE_LOGGING) {
  console.log(`[ApiService] Entorno: ${ENVIRONMENT}`);
  console.log(`[ApiService] API configurada para conectarse a: ${API_BASE_URL}`);
}

// Credenciales fijas para desarrollo: admin/admin123
// Estas son las credenciales indicadas en los requisitos

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir credenciales a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Intentar usar el token JWT del localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const token = localStorage.getItem('token');
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
  API_BASE_URL = baseUrl;
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
    
    // Quitar / al final si el endpoint lo tiene y no contiene query params
    // El backend está redirigiendo los endpoints con / al final a los que no lo tienen
    const finalEndpoint = (!normalizedEndpoint.includes('?') && normalizedEndpoint.endsWith('/')) 
      ? normalizedEndpoint.slice(0, -1) 
      : normalizedEndpoint;
    
    console.log(`Realizando petición GET a: ${API_BASE_URL}${finalEndpoint}`);
    
    const response = await api.get<T>(finalEndpoint);
    
    // Registrar información detallada de la respuesta para depuración
    console.log(`✅ Respuesta recibida de ${finalEndpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      isNull: response.data === null,
      isUndefined: response.data === undefined,
      dataLength: response.data && typeof response.data === 'object' ? Object.keys(response.data).length : 'N/A'
    });
    
    // Si la data es undefined o null, registrar warning y devolver objeto vacío
    if (response.data === undefined || response.data === null) {
      console.warn(`⚠️ Datos recibidos vacíos en ${finalEndpoint}`);
      
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
      console.error(`❌ Error en petición GET a ${endpoint}:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } else {
      console.error(`❌ Error no relacionado con Axios en ${endpoint}:`, error);
    }
    
    // En caso de error 404, devolver array vacío si parece ser un endpoint que devuelve lista
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      if (endpoint.includes('list') || 
          endpoint.includes('all') || 
          endpoint.includes('explotacions') || 
          endpoint.includes('animales')) {
        console.warn(`Devolviendo array vacío para ${endpoint} debido a 404`);
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
    console.log(`Realizando petición PATCH a ${API_BASE_URL}${normalizedEndpoint}`);
    console.log('Datos enviados:', data);
    
    // Realizar petición
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
    
    // Realizar la solicitud con el formato correcto
    const response = await axios.post(`${api.defaults.baseURL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
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

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  configureApi,
  isAuthenticated,
  getUserInfo,
  login
};
