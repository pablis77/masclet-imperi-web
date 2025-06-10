import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Definición de tipos
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: number;
    username: string;
    email?: string;
    role?: string;
    fullname?: string;
  };
}

// Configuración del entorno
const getEnvironment = () => {
  if (typeof window === 'undefined') return 'server';
  const hostname = window.location.hostname;
  
  // DOCKER: Siempre usar masclet-api en producción/Docker
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return 'production';
  }
  
  // Para desarrollo local
  return 'local';
};

// Configurar API según el entorno
const getApiConfig = () => {
  const env = getEnvironment();
  
  switch (env) {
    case 'production':
    case 'server':
      // DOCKER: Usar siempre la URL del servicio Docker
      return {
        baseURL: 'http://masclet-api:8000/api/v1',
        timeout: 30000,
        useRelativeUrls: false,
      };
    case 'local':
    default:
      // Development - localhost
      return {
        baseURL: 'http://localhost:8000/api/v1',
        timeout: 10000,
        useRelativeUrls: true,
      };
  }
};

// Crear y configurar la instancia de Axios
const config = getApiConfig();
const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las solicitudes
api.interceptors.request.use(
  (config) => {
    // Añadir token de autenticación si existe
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log para diagnóstico
    const finalUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${finalUrl}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Log para diagnóstico
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    // Obtener información del error para diagnóstico
    const originalUrl = error.config?.url || '';
    const status = error.response?.status;
    
    console.error(`❌ API Error: ${status} ${originalUrl}`, error.response?.data || error.message);
    
    // Si es error 401 (no autorizado), podría ser token expirado
    if (status === 401) {
      // Limpiar tokens y redirigir a login si estamos en el navegador
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        console.log('🔑 Sesión expirada. Redirigiendo a login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Solo redirigir si no estamos ya en la página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones auxiliares para llamadas a la API
const fetchData = async <T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> => {
  try {
    const response = await api.get<T>(endpoint, config);
    return response.data;
  } catch (error: any) {
    throw parseError(error);
  }
};

const postData = async <T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> => {
  try {
    const response = await api.post<T>(endpoint, data, config);
    return response.data;
  } catch (error: any) {
    throw parseError(error);
  }
};

const updateData = async <T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> => {
  try {
    const response = await api.put<T>(endpoint, data, config);
    return response.data;
  } catch (error: any) {
    throw parseError(error);
  }
};

const deleteData = async <T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> => {
  try {
    const response = await api.delete<T>(endpoint, config);
    return response.data;
  } catch (error: any) {
    throw parseError(error);
  }
};

// Función específica para login (tratamiento especial)
const login = async (username: string, password: string): Promise<LoginResponse> => {
  const loginEndpoint = '/auth/login';
  
  try {
    // Para entorno Docker (producción)
    if (getEnvironment() === 'production' || getEnvironment() === 'server') {
      console.log(`Realizando login a través del proxy API: /api/auth-proxy`);
      
      // Usar el proxy local que maneja el formulario correctamente
      const response = await fetch('/api/auth-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error(`Error de autenticación: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } else {
      // Para desarrollo local directo al backend
      console.log(`Realizando login a: ${api.defaults.baseURL}${loginEndpoint}`);
      
      // Configurar datos para OAuth2
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('grant_type', 'password');
      
      const response = await api.post<LoginResponse>(loginEndpoint, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return response.data;
    }
  } catch (error: any) {
    throw parseError(error);
  }
};

// Función para parsear errores de API
const parseError = (error: any): ApiError => {
  if (error.response) {
    // La solicitud fue realizada pero el servidor respondió con un código de error
    return {
      message: error.response.data.detail || error.response.data.message || `Error: ${error.response.status}`,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // La solicitud fue realizada pero no se recibió respuesta
    return {
      message: 'No se recibió respuesta del servidor',
    };
  } else {
    // Error al configurar la solicitud
    return {
      message: error.message || 'Error desconocido',
    };
  }
};

// Exportar el servicio API completo
const apiService = {
  fetch: fetchData,
  post: postData,
  update: updateData,
  delete: deleteData,
  login,
  api,
  getEnvironment,
};

export default apiService;
