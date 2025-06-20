/**
 * Servicio de autenticación centralizado para Masclet Imperi
 * Gestiona todo lo relacionado con login, logout, tokens y sesión de usuario
 */

import { AUTH_CONFIG } from '../config/apiConfig.centralizado';
import apiService from './apiService.centralizado';

// Definición de tipos
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  user?: User;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  is_active?: boolean;
  full_name?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VETERINARIO = 'veterinario',
  USER = 'user',
  GUEST = 'guest',
}

class AuthService {
  private static instance: AuthService;
  
  /**
   * Constructor privado - sigue patrón Singleton
   */
  private constructor() {
    console.log('🔐 AuthService inicializado');
  }
  
  /**
   * Obtener la instancia única del servicio (patrón Singleton)
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Intenta autenticar al usuario
   */
  public async login({ username, password }: LoginRequest): Promise<LoginResponse> {
    try {
      if (!username || !password) {
        throw new Error('Usuario y contraseña son obligatorios');
      }
      
      console.log('🔑 Intentando login para usuario:', username);
      
      // Preparar datos para enviar al API
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      // Hacer petición al endpoint de login
      const response = await fetch(AUTH_CONFIG.endpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error en login: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Guardar token en localStorage
      this.setToken(data.access_token);
      
      // Si hay refresh token, guardarlo también
      if (data.refresh_token) {
        localStorage.setItem(AUTH_CONFIG.refreshTokenName, data.refresh_token);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }
  
  /**
   * Cierra la sesión del usuario
   */
  public logout(): void {
    console.log('🚪 Cerrando sesión de usuario');
    
    // Eliminar tokens
    localStorage.removeItem(AUTH_CONFIG.tokenName);
    localStorage.removeItem(AUTH_CONFIG.refreshTokenName);
    
    // También eliminar información de usuario
    localStorage.removeItem('user');
    
    // Redirigir a login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  
  /**
   * Comprueba si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
  
  /**
   * Obtiene el token JWT
   */
  public getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem(AUTH_CONFIG.tokenName);
  }
  
  /**
   * Guarda el token JWT
   */
  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.tokenName, token);
    }
  }
  
  /**
   * Obtiene el usuario actual desde el localStorage
   */
  public getStoredUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
      return null;
    }
  }
  
  /**
   * Guarda información del usuario en localStorage
   */
  public setStoredUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  /**
   * Obtiene el perfil del usuario actual
   */
  public async getCurrentUserProfile(): Promise<User> {
    try {
      const user = await apiService.get<User>(AUTH_CONFIG.endpoints.me);
      this.setStoredUser(user);
      return user;
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el rol del usuario actual
   */
  public getCurrentUserRole(): UserRole {
    // Prioridad alta: Verificar si es Ramon (comprobación directa)
    if (typeof window !== 'undefined') {
      // Verificar indicador específico para Ramon
      const ramonFix = localStorage.getItem('ramonFix');
      if (ramonFix === 'true') {
        console.log('🔑 Detectado usuario especial: Ramon');
        return UserRole.ADMIN;
      }
    }
    
    // Para el resto de usuarios, obtener del almacenamiento
    const user = this.getStoredUser();
    if (user && user.role) {
      return user.role;
    }
    
    // Por defecto, usuario básico
    return UserRole.USER;
  }
}

// Exportar instancia única
export const authService = AuthService.getInstance();

// También exportamos métodos individuales para facilitar su uso
export const { 
  login, 
  logout, 
  isAuthenticated, 
  getToken, 
  setToken,
  getStoredUser,
  setStoredUser,
  getCurrentUserProfile,
  getCurrentUserRole
} = authService;

export default authService;
