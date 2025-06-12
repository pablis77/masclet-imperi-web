/**
 * Servicio de API centralizado para Masclet Imperi
 * Este servicio proporciona métodos unificados para realizar peticiones HTTP
 * usando la configuración centralizada de API.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/apiConfig.centralizado';

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  
  /**
   * Constructor privado - sigue patrón Singleton
   */
  private constructor() {
    // Crear instancia de Axios con configuración base
    this.api = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.defaultHeaders,
    });
    
    // Configurar interceptores
    this.setupInterceptors();
    
    console.log('🔄 ApiService inicializado con URL base:', API_CONFIG.baseUrl);
  }
  
  /**
   * Obtener la instancia única del servicio (patrón Singleton)
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  /**
   * Configura los interceptores para manejar tokens y errores
   */
  private setupInterceptors(): void {
    // Interceptor de peticiones - añadir token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = localStorage.getItem(AUTH_CONFIG.tokenName);
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        console.error('❌ Error en interceptor de petición:', error);
        return Promise.reject(error);
      }
    );
    
    // Interceptor de respuestas - manejar errores comunes
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Normalizar respuestas: extraer datos directamente si es posible
        return response.data;
      },
      async (error) => {
        if (axios.isAxiosError(error)) {
          // Manejar error 401 - Token expirado
          if (error.response?.status === 401) {
            console.warn('🔑 Sesión expirada o token inválido');
            
            // Intentar refresh token o redirigir al login
            if (typeof window !== 'undefined') {
              // Limpiar sesión y redirigir a login
              localStorage.removeItem(AUTH_CONFIG.tokenName);
              localStorage.removeItem(AUTH_CONFIG.refreshTokenName);
              
              // Redirigir solo si estamos en el navegador
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
          }
          
          // Mejorar mensaje de error para el usuario
          const statusCode = error.response?.status;
          const errorMessage = error.response?.data?.detail || error.message;
          
          console.error(`❌ Error API (${statusCode}): ${errorMessage}`);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Realiza una petición GET
   */
  public async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      return await this.api.get(endpoint, { params });
    } catch (error) {
      console.error(`Error en GET ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Realiza una petición POST
   */
  public async post<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      return await this.api.post(endpoint, data);
    } catch (error) {
      console.error(`Error en POST ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Realiza una petición PUT
   */
  public async put<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      return await this.api.put(endpoint, data);
    } catch (error) {
      console.error(`Error en PUT ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Realiza una petición PATCH
   */
  public async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      return await this.api.patch(endpoint, data);
    } catch (error) {
      console.error(`Error en PATCH ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Realiza una petición DELETE
   */
  public async delete<T = any>(endpoint: string): Promise<T> {
    try {
      return await this.api.delete(endpoint);
    } catch (error) {
      console.error(`Error en DELETE ${endpoint}:`, error);
      throw error;
    }
  }
}

// Exportar instancia única
export const apiService = ApiService.getInstance();

// También exportamos métodos individuales para facilitar su uso
export const { get, post, put, patch, delete: del } = apiService;

export default apiService;
