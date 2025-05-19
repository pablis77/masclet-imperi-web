import axios from 'axios'; 
import api from './api';
import { post, get } from './apiService';
import authApi from '../api/authApi';
import type { LoginResponse as ApiLoginResponse } from '../api/authApi';

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// Obtener la URL base del API 
let API_URL = 'http://localhost:8000';
if (isBrowser) {
  // Intentar obtener desde variables de entorno
  if (import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL;
  }
  console.log('API URL configurada:', API_URL);
}

// Definición de tipos común para toda la aplicación
export type UserRole = 'administrador' | 'gerente' | 'editor' | 'usuario';

// Definición de usuario base con campos obligatorios
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_superuser?: boolean;
}

// Interfaces para peticiones
export interface LoginRequest {
  username: string;
  password: string;
}

// Respuesta de login del backend
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email?: string;
    is_active: boolean;
    is_superuser?: boolean;
    role?: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserFilter {
  role?: UserRole;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Obtiene los datos del usuario actual
 * @returns Datos del usuario o null si no está autenticado
 */
export function getCurrentUser(): LoginResponse['user'] | null {
  if (typeof window === 'undefined') {
    return null; // No hay usuario en el servidor
  }
  
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return null;
    }
    
    const user = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
}

/**
 * Obtiene el token de autenticación
 * @returns Token de autenticación o null si no está autenticado
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    // Si no hay token, no estamos autenticados
    if (!token) {
      return null;
    }
    
    // Verificar si el token ha expirado
    try {
      // Un token JWT tiene 3 partes separadas por puntos
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token con formato inválido');
        return null;
      }
      
      // Decodificar la parte de payload (la segunda parte)
      const payload = JSON.parse(atob(parts[1]));
      
      // Verificar si el token ha expirado
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('Token expirado');
        return null;
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return token; // Devolver el token aunque no se pueda verificar
    }
    
    return token;
  } catch (e) {
    console.warn('Error al acceder a localStorage:', e);
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns true si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // No autenticado en el servidor
  }
  
  const token = getToken();
  return !!token; // Devuelve true si hay un token válido
};

/**
 * Obtiene el objeto de usuario completo
 * @returns El objeto de usuario completo o null si no existe
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') {
    return null; // No hay usuario en el servidor
  }
  
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return null;
    }
    
    const user = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Error al obtener el usuario almacenado:', error);
    return null;
  }
}

/**
 * Obtiene el rol del usuario actual
 * @returns Rol del usuario actual
 */
export const getCurrentUserRole = (): UserRole => {
  const user = getCurrentUser();
  if (!user) {
    return 'usuario'; // Por defecto, si no hay usuario o no tiene rol
  }
  
  // Si el rol es un enum convertido a cadena (UserRole.XXXX), extraer el valor
  if (user.role?.includes('UserRole.')) {
    const rolePart = user.role.split('.')[1]; // Obtener la parte después del punto
    if (rolePart === 'ADMIN') return 'administrador';
    if (rolePart === 'GERENTE') return 'gerente';
    if (rolePart === 'EDITOR') return 'editor';
    if (rolePart === 'USUARIO') return 'usuario';
  }
  
  // Usar el rol ya procesado si está disponible
  if (user.role && typeof user.role === 'string') {
    if (['administrador', 'gerente', 'editor', 'usuario'].includes(user.role)) {
      return user.role as UserRole;
    }
  }
  
  // Asignar rol por defecto basado en atributos del usuario
  if (user.is_superuser) {
    return 'administrador';
  } else if (user.username === 'gerente') {
    return 'gerente';
  } else if (user.username.includes('editor')) {
    return 'editor';
  }
  
  return 'usuario'; // Valor por defecto
};

/**
 * Cierra la sesión del usuario
 */
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Redirigir a la página de login
      window.location.href = '/login';
    } catch (e) {
      console.warn('Error al acceder a localStorage durante logout:', e);
    }
  }
};

/**
 * Obtiene la ruta de redirección para el usuario según su rol
 * @returns Ruta de redirección
 */
export const getRedirectPathForUser = (): string => {
  const userRole = getCurrentUserRole();
  
  switch (userRole) {
    case 'administrador':
      return '/dashboard';
    case 'gerente':
      return '/dashboard';
    case 'editor':
      return '/animals';
    default:
      return '/animals';
  }
};

/**
 * Autentica un usuario con credenciales
 * @param credentials Credenciales del usuario
 * @returns Respuesta con token y datos de usuario
 */
export const login = async ({ username, password }: LoginRequest): Promise<LoginResponse> => {
  try {
    if (!username || !password) {
      throw new Error('Usuario y contraseña son obligatorios');
    }
    
    console.log(`Intentando iniciar sesión con usuario: ${username}`);
    
    // Realizar la petición de login
    const response = await post<LoginResponse>('/login', { username, password });
    
    // Si llegamos aquí, la autenticación fue exitosa
    console.log('Inicio de sesión exitoso:', response);
    
    // Guardar el token en localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('token', response.access_token);
        
        // Guardar datos del usuario
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (e) {
        console.warn('Error al guardar datos en localStorage:', e);
      }
    }
    
    return response;
  } catch (error: any) {
    console.error('Error durante el inicio de sesión:', error);
    
    // Construir mensaje de error más descriptivo
    let errorMessage = 'Error al iniciar sesión';
    
    if (error.response) {
      // Error de respuesta del servidor
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        errorMessage = 'Credenciales incorrectas';
      } else if (status === 403) {
        errorMessage = 'No tiene permisos para acceder';
      } else if (status === 404) {
        errorMessage = 'Servicio de autenticación no disponible';
      } else if (data && data.detail) {
        errorMessage = data.detail;
      }
    } else if (error.request) {
      // Error de red (no se recibió respuesta)
      errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else if (error.message) {
      // Error de configuración de la petición
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Registra un nuevo usuario
 * @param userData Datos del nuevo usuario
 * @returns Datos del usuario creado
 */
export const register = async (userData: RegisterRequest): Promise<User> => {
  return await post<User>('/users', userData);
};

/**
 * Actualiza la contraseña del usuario
 * @param oldPassword Contraseña actual
 * @param newPassword Nueva contraseña
 * @returns true si la operación fue exitosa
 */
export const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
  try {
    await post('/users/me/change-password', { old_password: oldPassword, new_password: newPassword });
    return true;
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw error;
  }
};

/**
 * Obtiene el perfil del usuario actual
 */
export const getCurrentUserProfile = async (): Promise<User> => {
  try {
    return await get<User>('/users/me');
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
};

/**
 * Obtiene una lista paginada de usuarios (solo para administradores)
 */
export const getUsers = async (filters: UserFilter = {}): Promise<PaginatedUsers> => {
  try {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await get<PaginatedUsers>(`/users${queryString}`);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID (solo para administradores)
 */
export const getUserById = async (id: number): Promise<User> => {
  return await get<User>(`/users/${id}`);
};

/**
 * Actualiza un usuario (solo para administradores)
 */
export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  return await post<User>(`/users/${id}`, userData);
};

/**
 * Elimina un usuario por su ID (solo para administradores)
 */
export const deleteUser = async (id: number): Promise<void> => {
  return await post<void>(`/users/${id}/delete`, {});
};

/**
 * Cambia la contraseña del usuario actual
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
  return await post<{ message: string }>('/users/me/change-password', {
    old_password: oldPassword,
    new_password: newPassword
  });
};

// Exportar todas las funciones del servicio
const authService = {
  login,
  logout,
  isAuthenticated,
  getToken,
  getCurrentUser,
  getCurrentUserRole,
  getRedirectPathForUser,
  register,
  updatePassword,
  getCurrentUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
};

export default authService;
