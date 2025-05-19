/**
 * authApi.ts
 * Módulo moderno de comunicación Backend-For-Frontend (BFF) para autenticación
 * Implementa un patrón consolidado para la comunicación segura con backends
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// Tipos para la API de autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser?: boolean;
    role?: string;
  };
}

/**
 * Clase AuthApi - API moderna para gestión de autenticación
 * Implementa un BFF (Backend For Frontend) para comunicación segura
 */
class AuthApi {
  private api: AxiosInstance;
  private static instance: AuthApi;

  // Constructor privado (patrón Singleton)
  private constructor() {
    // Crear instancia de axios configurada
    this.api = axios.create({
      baseURL: 'http://localhost:8000',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      }
    });

    // Interceptor para procesar solicitudes
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[AuthApi] Enviando solicitud a: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[AuthApi] Error en solicitud:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para procesar respuestas
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[AuthApi] Respuesta recibida de: ${response.config.url}`);
        return response;
      },
      (error) => {
        // Mejorar el diagnóstico de errores
        if (error.response) {
          // El servidor respondió con un código de error
          console.error('[AuthApi] Error del servidor:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error('[AuthApi] No se recibió respuesta:', error.request);
        } else {
          // Error al configurar la solicitud
          console.error('[AuthApi] Error de configuración:', error.message);
        }
        
        // Capturar específicamente errores CORS
        if (error.message && error.message.includes('Network Error')) {
          console.error('[AuthApi] Posible error CORS - Verificar configuración del servidor');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Método para obtener la instancia única (Singleton)
  public static getInstance(): AuthApi {
    if (!AuthApi.instance) {
      AuthApi.instance = new AuthApi();
    }
    return AuthApi.instance;
  }

  /**
   * Método de login con formato optimizado para FastAPI OAuth
   * @param credentials Credenciales de usuario
   * @returns Respuesta con token JWT y datos de usuario
   */
  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('[AuthApi] Iniciando proceso de autenticación:', credentials.username);
    
    try {
      // Preparar datos exactamente como la prueba exitosa
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      // Crear solicitud directa usando fetch para evitar problemas con axios
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[AuthApi] Autenticación exitosa:', data);
      
      // Si el backend no devuelve datos de usuario, construir un objeto compatible
      if (!data.user) {
        // Extraer información del token JWT
        const token = data.access_token;
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        data.user = {
          id: 1,
          username: credentials.username,
          email: `${credentials.username}@mascletimperi.com`,
          full_name: credentials.username,
          is_active: true,
          is_superuser: payload.role === 'UserRole.ADMIN',
          role: payload.role
        };
      }
      
      return data as LoginResponse;
    } catch (error) {
      console.error('[AuthApi] Error durante autenticación:', error);
      throw error;
    }
  }

  /**
   * Verifica si el token actual es válido
   * @param token Token JWT a verificar
   */
  public async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await this.api.get('/api/v1/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('[AuthApi] Error validando token:', error);
      return false;
    }
  }
}

// Exportar instancia única
export const authApi = AuthApi.getInstance();
export default authApi;
