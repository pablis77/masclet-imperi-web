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
 * Autentica un usuario con credenciales
 * @param credentials Credenciales del usuario
 * @returns Respuesta con token y datos de usuario
 */
export const login = async ({ username, password }: { username: string; password: string }): Promise<LoginResponse> => {
  try {
    console.log('Iniciando proceso de login para usuario:', username);
    
    // Enviar solicitud al proxy de autenticación
    const response = await fetch('/api/auth-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    console.log('Respuesta recibida del servidor con status:', response.status);
    
    // Para facilitar la depuración, primero obtenemos la respuesta como texto
    const responseText = await response.text();
    console.log('Respuesta como texto:', responseText);
    
    // Verificar que la respuesta no esté vacía
    if (!responseText) {
      throw new Error('La respuesta del servidor está vacía');
    }
    
    // Intentar parsear la respuesta como JSON
    let data: LoginResponse;
    try {
      data = JSON.parse(responseText) as LoginResponse;
      console.log('Respuesta parseada como JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error al parsear la respuesta como JSON:', e);
      throw new Error('Error al procesar la respuesta del servidor: ' + e);
    }
    
    // Verificar que tengamos un token de acceso
    if (!data.access_token) {
      console.error('La respuesta no contiene un token de acceso:', data);
      throw new Error('La respuesta no contiene un token de acceso');
    }
    
    // Verificar que tengamos información del usuario
    if (!data.user) {
      console.error('La respuesta no contiene información del usuario:', data);
      
      // Intentar construir un objeto de usuario si falta
      if (username === 'admin') {
        console.log('Creando un objeto de usuario para el administrador');
        data.user = {
          id: 1,
          username: username,
          is_active: true,
          is_superuser: true,
          role: 'administrador'
        };
      } else {
        throw new Error('La respuesta no contiene información del usuario');
      }
    }
    
    // Mostrar datos importantes de la respuesta (sin el token completo)
    console.log('Datos de la respuesta: token_type =', data.token_type);
    console.log('Usuario:', {
      id: data.user.id,
      username: data.user.username,
      role: data.user.role || 'No especificado',
      is_superuser: data.user.is_superuser
    });
    
    // Asignar el rol basado en los atributos del usuario si no viene en la respuesta
    if (!data.user.role) {
      if (data.user.is_superuser) {
        data.user.role = 'administrador';
      } else if (data.user.username === 'gerente') {
        data.user.role = 'gerente';
      } else if (data.user.username.includes('editor')) {
        data.user.role = 'editor';
      } else {
        data.user.role = 'usuario';
      }
      console.log('Rol asignado:', data.user.role);
    } else {
      // Convertir el formato "UserRole.XXXX" a nuestro formato interno
      const roleString = data.user.role.toString();
      if (roleString.includes('ADMIN')) {
        data.user.role = 'administrador';
      } else if (roleString.includes('GERENTE')) {
        data.user.role = 'gerente';
      } else if (roleString.includes('EDITOR')) {
        data.user.role = 'editor';
      } else if (roleString.includes('USUARIO')) {
        data.user.role = 'usuario';
      }
      console.log('Rol convertido de:', roleString, 'a:', data.user.role);
    }
    
    // Guardar token (solo en navegador)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      console.log('Token guardado en localStorage');
      // También guardar datos del usuario
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Datos de usuario guardados en localStorage');
    }
    
    return data;
  } catch (error) {
    console.error('Error durante el proceso de login:', error);
    throw error;
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
  
  const token = localStorage.getItem('token');
  return !!token; // Devuelve true si hay un token
};

/**
 * Obtiene el token de autenticación
 * @returns Token de autenticación o null si no está autenticado
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token');
};

/**
 * Obtiene los datos del usuario actual
 * @returns Datos del usuario o null si no está autenticado
 */
export const getCurrentUser = (): LoginResponse['user'] | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error al parsear datos de usuario en localStorage:', e);
    return null;
  }
};

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
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirigir a la página de login
  window.location.href = '/login';
};

/**
 * Obtiene la ruta de redirección para el usuario según su rol
 * @returns Ruta de redirección
 */
export const getRedirectPathForUser = (): string => {
  const userRole = getCurrentUserRole();
  
  console.log('Rol actual para redirección:', userRole);
  
  // Definir rutas por defecto según rol
  switch (userRole) {
    case 'administrador':
    case 'gerente':
      return '/dashboard';
    case 'editor':
    case 'usuario':
      return '/animals';
    default:
      return '/login';
  }
};

/**
 * Registra un nuevo usuario
 * @param userData Datos del nuevo usuario
 * @returns Datos del usuario creado
 */
export const register = async (userData: RegisterRequest): Promise<User> => {
  return await post<User>('/auth/register', userData);
};

/**
 * Actualiza la contraseña del usuario
 * @param oldPassword Contraseña actual
 * @param newPassword Nueva contraseña
 * @returns true si la operación fue exitosa
 */
export const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
  await post('/auth/update-password', { old_password: oldPassword, new_password: newPassword });
  return true;
};

/**
 * Obtiene el perfil del usuario actual
 */
export const getCurrentUserProfile = async (): Promise<User> => {
  return get<User>('/auth/me');
};

/**
 * Obtiene una lista paginada de usuarios (solo para administradores)
 */
export const getUsers = async (filters: UserFilter = {}): Promise<PaginatedUsers> => {
  // Construir query params
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
  
  return get<PaginatedUsers>(endpoint);
};

/**
 * Obtiene un usuario por su ID (solo para administradores)
 */
export const getUserById = async (id: number): Promise<User> => {
  return get<User>(`/users/${id}`);
};

/**
 * Actualiza un usuario (solo para administradores)
 */
export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  return post<User>(`/users/${id}`, userData);
};

/**
 * Elimina un usuario por su ID (solo para administradores)
 */
export const deleteUser = async (id: number): Promise<void> => {
  return post<void>(`/users/${id}/delete`, {});
};

/**
 * Cambia la contraseña del usuario actual
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
  return post<{ message: string }>('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword
  });
};

// Exportar todas las funciones del servicio
const authService = {
  login,
  logout,
  register,
  getCurrentUser,
  getRedirectPathForUser,
  isAuthenticated,
  getToken,
  getCurrentUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword
};

export default authService;
