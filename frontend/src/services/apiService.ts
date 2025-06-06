/**
 * ¡¡¡ADVERTENCIA!!! - NO MODIFICAR ESTE ARCHIVO
 * ========================================
 * 
 * Este archivo es CRÍTICO para el funcionamiento de toda la aplicación.
 * Modificarlo puede romper la conexión entre frontend y backend.
 * 
 * REGLAS ESTRICTAS:
 * 1. NUNCA modificar este archivo directamente - crear servicios independientes si es necesario
 * 2. NUNCA cambiar la estructura existente de llamadas API que funcionan
 * 3. NUNCA tocar la configuración de conexión, URLs base o los interceptors
 * 4. Si necesitas implementar nuevas funcionalidades, hazlo en archivos separados
 * 
 * Si aparecen errores como "ERR_NETWORK_CHANGED" o problemas de CORS tras modificaciones,
 * restaurar inmediatamente este archivo y revisar la configuración CORS en backend/app/main.py
 */

import axios from 'axios';

// Constantes de entorno
let ENVIRONMENT: string = 'development';
let API_BASE_URL: string = '';
let USE_MOCK_DATA: boolean = false; // Variable faltante

// URLs configurables para diferentes entornos
const API_CONFIG = {
  development: {
    protocol: 'http',
    host: '127.0.0.1', // Usar IP literal en lugar de localhost para mayor estabilidad
    port: '8000',
    path: '/api/v1'  // Restaurado '/api/v1' para que funcione el desarrollo local
  },
  production: {
    // Usar variable de entorno o valor por defecto para el backend
    protocol: 'https',
    host: import.meta.env.VITE_BACKEND_HOST || 'masclet-imperi-web-backend.onrender.com',
    port: '',  // No usamos puerto en producción con HTTPS
    path: ''   // En producción, las rutas del backend NO empiezan con /api/v1
  }
};

// Configuración global usando variables de entorno
const getApiUrl = (): string => {
  // Obtener URL de API de las variables de entorno (prioridad máxima)
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // Si existe una URL explícita configurada, usarla
  if (envApiUrl) {
    // console.log(`[ApiService] Usando URL explícita de variable de entorno: ${envApiUrl}`);
    return envApiUrl;
  }

  // LOG del entorno detectado
  // console.log(`[ApiService] Entorno detectado: ${ENVIRONMENT}`);
  
  // Detectar explícitamente entorno local vs producción
  let isLocal = false;
  let isTunnel = false;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Comprobar si estamos en LocalTunnel
    isTunnel = hostname.includes('loca.lt');
    // Comprobar si estamos en localhost o en tunnel
    isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || isTunnel;
    // console.log(`[ApiService] Hostname detectado: ${hostname}, isLocal: ${isLocal}, isTunnel: ${isTunnel}`);
  } else {
    // Si window no está definido (SSR), usar variable de entorno
    isLocal = ENVIRONMENT !== 'production';
    // console.log(`[ApiService] SSR, usando ENVIRONMENT: ${ENVIRONMENT}, isLocal: ${isLocal}`);
  }
  
  // FORZAR MODO TUNNEL SI LA URL INCLUYE loca.lt
  if (typeof window !== 'undefined' && window.location.hostname.includes('loca.lt')) {
    isTunnel = true;
    // console.log('[ApiService] Modo tunnel forzado porque la URL contiene loca.lt');
  }
  
  // Seleccionar configuración según entorno
  // Para redes locales, SIEMPRE usar configuración de desarrollo
  // Comprobación adicional: si estamos en una IP de red local
  let isLocalNetwork = false;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    isLocalNetwork = 
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(hostname);
  }
  
  // Si es red local, FORZAR modo desarrollo independientemente de otras variables
  const config = (isLocal || isLocalNetwork) ? API_CONFIG.development : API_CONFIG.production;
  
  if (isLocalNetwork && !isLocal) {
    console.log('[ApiService] Modo desarrollo forzado por detección de red local:', window.location.hostname);
  }
  
  // SOLUCIÓN DIRECTA PARA TÚNELES: DETECTAR DINÁMICAMENTE LA URL
  if (isTunnel) {
    // Obtener la URL del frontend y construir la URL del backend basada en ella
    if (typeof window !== 'undefined') {
      // Extraer el subdominio del frontend
      const hostname = window.location.hostname;
      // Si el frontend está en loca.lt, construir la URL del backend
      if (hostname.includes('loca.lt')) {
        // URL actual de LocalTunnel del backend (desde entorno o último conocido)
        let backendTunnelUrl = import.meta.env.VITE_BACKEND_TUNNEL_URL || 'https://api-masclet-imperi.loca.lt/api/v1';
        
        // Si tenemos una URL de backend en el almacenamiento local, usarla
        const savedBackendUrl = localStorage.getItem('backend_tunnel_url');
        if (savedBackendUrl) {
          backendTunnelUrl = savedBackendUrl;
        }
        
        // console.log(`[ApiService] ¡USANDO URL COMPLETA DE LOCALTUNNEL!: ${backendTunnelUrl}`);
        return backendTunnelUrl;
      }
    }
    
    // Fallback a la URL conocida si no podemos construirla dinámicamente
    const tunnelBackendUrl = 'https://api-masclet-imperi.loca.lt/api/v1';
    // console.log(`[ApiService] ¡USANDO URL COMPLETA DE LOCALTUNNEL (fallback)!: ${tunnelBackendUrl}`);
    return tunnelBackendUrl;
  }
  
  // Para conexiones normales, construir URL estándar
  const baseUrl = `${config.protocol}://${config.host}${config.port ? ':' + config.port : ''}${config.path}`;
  
  // console.log(`[ApiService] API configurada para entorno ${isLocal ? 'desarrollo' : 'producción'}: ${baseUrl}`);
  return baseUrl;
};

// Opciones de entorno
if (import.meta.env.PROD) {
  ENVIRONMENT = 'production';
} else {
  ENVIRONMENT = 'development';
}

// Configurar la URL base de la API
API_BASE_URL = getApiUrl();

// console.log(`[ApiService] Entorno: ${ENVIRONMENT}`);
// console.log(`[ApiService] API configurada para conectarse a: ${API_BASE_URL}`);

// IMPORTANTE: Detectar si estamos en producción para forzar rutas relativas
// y evitar problemas de CORS
let isProduction = false;
if (typeof window !== 'undefined') {
  const currentHost = window.location.hostname;
  // Detectar redes locales (igual que en apiConfig.ts)
  const isLocalNetwork = 
    currentHost === 'localhost' || 
    currentHost === '127.0.0.1' ||
    /^192\.168\./.test(currentHost) ||
    /^10\./.test(currentHost) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(currentHost);
  
  isProduction = !isLocalNetwork;
  console.log(`[ApiService] Host: ${currentHost}, Es red local: ${isLocalNetwork}, Modo producción: ${isProduction}`);
}

// IMPORTANTE: En producción, debemos evitar la duplicación de /api/v1
// Verificamos si la URL ya contiene /api/v1 y si ya está importando apiConfig.ts
if (isProduction) {
  // Si estamos en producción y la URL base tiene /api/v1/api/v1, corregimos
  if (API_BASE_URL.includes('/api/v1/api/v1')) {
    API_BASE_URL = API_BASE_URL.replace('/api/v1/api/v1', '/api/v1');
    console.log(`[ApiService] Corregida duplicación de prefijo en URL: ${API_BASE_URL}`);
  }
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

// GESTIÓN UNIVERSAL DE PETICIONES API
api.interceptors.request.use(
  (config) => {
    const endpoint = config.url || '';
    
    // Debug para todas las peticiones
    // console.log(`[API] Procesando solicitud: ${endpoint}`);
    
    // SOLUCIÓN PARA TÚNELES DE LOCALTUNNEL
    if (typeof window !== 'undefined' && window.location.hostname.includes('loca.lt')) {
      // Si es la primera vez que detectamos un error 511, mostrar mensaje informativo
      const tunnelMessageShown = localStorage.getItem('tunnelMessageShown') === 'true';
      if (!tunnelMessageShown && !document.getElementById('tunnel-auth-message')) {
        localStorage.setItem('tunnelMessageShown', 'true');
        
        // Mostrar mensaje para autenticar el túnel manualmente
        const msgDiv = document.createElement('div');
        msgDiv.id = 'tunnel-auth-message';
        msgDiv.style.position = 'fixed';
        msgDiv.style.top = '50px';
        msgDiv.style.left = '50%';
        msgDiv.style.transform = 'translateX(-50%)';
        msgDiv.style.backgroundColor = '#f8d7da';
        msgDiv.style.color = '#721c24';
        msgDiv.style.padding = '15px 20px';
        msgDiv.style.borderRadius = '5px';
        msgDiv.style.zIndex = '9999';
        msgDiv.style.maxWidth = '80%';
        msgDiv.style.textAlign = 'center';
        msgDiv.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        msgDiv.innerHTML = `
          <h3 style="margin-top: 0;">Autenticación de túnel necesaria</h3>
          <p>Para usar el túnel correctamente, necesitas autenticar ambos túneles manualmente.</p>
          <p><strong>1.</strong> Haz clic en este botón para abrir el túnel del backend:</p>
          <a href="https://api-masclet-imperi.loca.lt/api/v1/health" target="_blank" 
             style="display: inline-block; background: #28a745; color: white; text-decoration: none; 
                    padding: 8px 15px; margin: 10px 0; border-radius: 4px;">
            Autenticar Túnel Backend
          </a>
          <p><strong>2.</strong> En la nueva pestaña, completa cualquier autenticación que solicite LocalTunnel</p>
          <p><strong>3.</strong> Cierra esa pestaña y vuelve aquí</p>
          <p><strong>4.</strong> Recarga esta página</p>
          <button id="close-tunnel-msg" style="background: #6c757d; border: none; color: white; padding: 5px 10px; 
                                             border-radius: 3px; margin-top: 10px; cursor: pointer;">
            Cerrar este mensaje
          </button>
        `;
        document.body.appendChild(msgDiv);
        
        // Añadir manejador para cerrar el mensaje
        document.getElementById('close-tunnel-msg')?.addEventListener('click', () => {
          msgDiv.style.display = 'none';
        });
      }
      
      // Formatear correctamente la URL
      if (!endpoint.startsWith('/api/v1') && !endpoint.startsWith('api/v1')) {
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        config.url = `/api/v1${path}`;
        console.log(`[TÚNEL] Añadiendo prefijo: ${endpoint} -> ${config.url}`);
      }
      
      // Evitar duplicación de prefijos /api/v1
      const finalUrl = `${config.baseURL || ''}${config.url || ''}`;
      if (finalUrl.includes('/api/v1/api/v1/')) {
        console.log(`[TÚNEL] Corrigiendo URL duplicada: ${finalUrl}`);
        const fixedUrl = finalUrl.replace('/api/v1/api/v1/', '/api/v1/');
        const baseUrlPart = config.baseURL || '';
        config.url = fixedUrl.replace(baseUrlPart, '');
        console.log(`[TÚNEL] URL corregida: ${baseUrlPart}${config.url}`);
      }
    }
    // Asegurar encabezados AUTH
    if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
      config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
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
  
  // console.log(`API configurada con URL base: ${baseUrl}`);
  // console.log(`Uso de datos simulados: ${useMockData ? 'SÍ' : 'NO'}`);
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
      // console.log(`Realizando petición GET a: /api/v1${finalEndpoint}`);
    } else {
      // console.log(`Realizando petición GET a: ${finalEndpoint}`);
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
const getBaseUrl = (): string => {
  return API_BASE_URL;
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
