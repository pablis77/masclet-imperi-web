import axios from 'axios';

// Constantes de entorno
let ENVIRONMENT: string = 'development';
let API_BASE_URL: string = '';
let USE_MOCK_DATA: boolean = false; // Variable faltante

// Configuración global usando variables de entorno
const getApiUrl = (): string => {
  // Obtener URL de API de las variables de entorno
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // Si existe una URL configurada, usarla (pero verificar si estamos en producción)
  if (envApiUrl) {
    return envApiUrl;
  }

  // LOG del entorno
  console.log(`Detectado entorno: ${ENVIRONMENT}`);
  
  // En producción o entorno con dominio personalizado, usar URL directa al backend
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // Si estamos en producción (Render) o cualquier entorno que no sea local
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      console.log(`[ApiService] Detectado entorno de producción o externo: ${currentHost}`);
      
      // ESTRATEGIA DIRECTA: Usar la URL completa al backend en lugar de proxy
      const backendURL = 'https://masclet-imperi-web-backend.onrender.com/api/v1';
      console.log(`[ApiService] API configurada para conectarse directamente al backend: ${backendURL}`);
      return backendURL; 
    }
  }
  
  // Solo para entornos locales (localhost/127.0.0.1) usar URL completa local
  const serverHost = 'localhost';
  const port = '8000';
  const protocol = 'http';
  
  console.log(`[ApiService] Usando URL local: ${protocol}://${serverHost}:${port}/api/v1`);
  return `${protocol}://${serverHost}:${port}/api/v1`;
};

// Opciones de entorno
if (import.meta.env.PROD) {
  ENVIRONMENT = 'production';
} else {
  ENVIRONMENT = 'development';
}

// Configurar la URL base de la API
API_BASE_URL = getApiUrl();

console.log(`[ApiService] Entorno: ${ENVIRONMENT}`);
console.log(`[ApiService] API configurada para conectarse a: ${API_BASE_URL}`);

// IMPORTANTE: Detectar si estamos en producción para forzar rutas relativas
// y evitar problemas de CORS
let isProduction = false;
if (typeof window !== 'undefined') {
  const currentHost = window.location.hostname;
  isProduction = currentHost !== 'localhost' && currentHost !== '127.0.0.1';
}

// Si estamos en producción, SIEMPRE sobrescribir la baseURL para garantizar URLs relativas
if (isProduction) {
  API_BASE_URL = '/api/v1';
  console.log(`[ApiService] FORZANDO ruta relativa en producción: ${API_BASE_URL}`);
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

// CONEXIÓN DIRECTA AL BACKEND: No usamos proxy en producción, vamos directo al backend
api.interceptors.request.use(
  (config) => {
    const endpoint = config.url || '';
    
    // Si estamos en entorno de desarrollo local, NO modificar las URLs
    // (permitir URLs absolutas para localhost/127.0.0.1)
    if (!isProduction) {
      console.log(`[DEV] Usando URL original en desarrollo: ${endpoint}`);
      return config;
    }
    
    // A partir de aquí, solo se ejecuta en producción
    console.log(`[PROD] Procesando URL para entorno de producción: ${endpoint}`);
    
    // Añadir cabeceras CORS para comunicación cross-origin directa
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    
    // En producción, no modificamos las URLs ya que la baseURL ya apunta al backend
    // Solo normalizamos para asegurarnos que no hay doble /api/v1
    if (endpoint.startsWith('/api/v1') || endpoint.startsWith('api/v1')) {
      // Si la URL ya incluye /api/v1, extraerla para evitar duplicados
      const pathRegex = /^\/?(api\/v1)\/?(.*)$/;
      const match = endpoint.match(pathRegex);
      
      if (match) {
        // Extraer solo la parte después de /api/v1
        const path = match[2];
        console.log(`[URL-API] Evitando duplicado de /api/v1 en: ${endpoint}`);
        config.url = path;
      } else {
        // Caso improbable: la regex no coincidió
        console.log(`[URL-API] URL sin cambios: ${endpoint}`);
      }
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
    
    // IMPORTANTE: En producción, solo imprimir la ruta relativa
    if (isProduction) {
      console.log(`Realizando petición GET a: /api/v1${finalEndpoint}`);
    } else {
      console.log(`Realizando petición GET a: ${finalEndpoint}`);
    }
    
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
    
    // Mecanismo de reintento para errores 404
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Obtener la URL original que falló
      const originalUrl = error.config?.url || '';
      const absoluteUrl = error.config?.baseURL ? `${error.config.baseURL}${originalUrl}` : originalUrl;
      
      // Registrar el fallo para diagnóstico
      console.warn(`⚠️ Error 404 en: ${absoluteUrl}`);
      
      // En desarrollo local, simplemente registramos el error y dejamos que falle normalmente
      if (!isProduction) {
        console.warn(`Entorno de desarrollo: sin reintentos automáticos`);
      } else {
        // En producción, intentamos estrategias de recuperación
        
        // Estrategia 1: Convertir URL absoluta a relativa
        if (absoluteUrl.includes('://')) {
          try {
            // Extraer solo el path para hacer una petición relativa
            const urlObj = new URL(absoluteUrl);
            const relativePath = urlObj.pathname + urlObj.search;
            console.log(`🔧 Detectada URL absoluta, reintentando con ruta relativa: ${relativePath}`);
            
            // Hacer una petición completamente relativa
            try {
              // Configurar manualmente para ignorar cualquier baseURL
              const retryResponse = await axios.get<T>(relativePath, {
                baseURL: '',
                headers: error.config?.headers
              });
              console.log(`✅ Éxito con la ruta relativa!`);
              return retryResponse.data;
            } catch (retryError) {
              console.error(`💥 Falló el intento con ruta relativa: ${relativePath}`);
            }
          } catch (e) {
            console.warn(`No se pudo procesar la URL para reintento: ${absoluteUrl}`);
          }
        }
        
        // Estrategia 2: Corregir URLs mal formadas
        if (originalUrl.includes('//') || originalUrl.includes('api/api') || 
            (originalUrl.includes('/api/v1') && endpoint.includes('/api/v1'))) {
          
          console.log(`🔧 Detectada URL mal formada, intentando corregir...`);
          
          // Corregir problemas comunes en las URLs
          let correctedUrl = endpoint.replace(/api\/api/g, 'api');
          correctedUrl = correctedUrl.replace(/\/api\/v1\/api\/v1/g, '/api/v1');
          correctedUrl = correctedUrl.replace(/\/\/api\/v1/g, '/api/v1');
          
          // Si la URL se corrige, intentar nuevamente
          if (correctedUrl !== endpoint) {
            console.log(`🔨 Reintentando con URL corregida: ${correctedUrl}`);
            try {
              const retryResponse = await api.get<T>(correctedUrl);
              console.log(`✅ Éxito con URL corregida!`);
              return retryResponse.data;
            } catch (retryError) {
              console.error(`💥 También falló el reintento con URL corregida`);            
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
            
            console.log(`🤖 Último intento con ruta absoluta: ${finalAttemptUrl}`);
            const lastResponse = await axios.get<T>(finalAttemptUrl, {
              baseURL: ''
            });
            console.log(`✅ Éxito en el último intento!`);
            return lastResponse.data;
          } catch (lastError) {
            console.error(`💥 Falló el último intento de recuperación`); 
          }
        }
      }
      
      // Si llegamos aquí, el reintento falló o no se intentó, devolver array vacío para endpoints de lista
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
    
    // Ruta de login directa sin concatenar baseURL para evitar problemas
    const loginEndpoint = '/auth/login';
    
    // En producción, usar siempre rutas relativas para el login
    if (isProduction) {
      console.log(`Realizando login a: /api/v1${loginEndpoint}`);
    } else {
      console.log(`Realizando login a: ${api.defaults.baseURL}${loginEndpoint}`);
    }
    
    // Realizar la solicitud con el formato correcto
    const response = await api.post(loginEndpoint, formData, {
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
