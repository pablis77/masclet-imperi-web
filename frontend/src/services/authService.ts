import axios from 'axios'; 
import api from './api';
import { post, get } from './apiService';
import  apiConfig from '../config/apiConfig';
import { jwtDecode } from 'jwt-decode';


// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// Obtener la URL base del API desde configuración centralizada
let API_URL = apiConfig.backendURL;
if (isBrowser) {
  // Intentar obtener desde variables de entorno (prioridad mayor que la configuración centralizada)
  if (import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL;
  }
  console.log('API URL configurada:', API_URL || 'usando rutas relativas');
}

// Definición de tipos común para toda la aplicación
export type UserRole = 'administrador' | 'Ramon' | 'editor' | 'usuario';

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
      console.warn('No se encontró información de usuario en localStorage');
      return null;
    }
    
    const user = JSON.parse(userJson) as User;
    
    // Verificar si el usuario es Ramon y corregir el rol si es necesario
    if (user.username && user.username.toLowerCase() === 'ramon') {
      if (user.role !== 'Ramon') {
        console.log('Corrigiendo rol para usuario Ramon (rol anterior: ' + user.role + ')');
        user.role = 'Ramon';
        // Guardar la corrección en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', 'Ramon');
        localStorage.setItem('ramonFix', 'true');
      }
    }
    
    // Asegurarse que el usuario tiene un rol válido
    if (!user.role) {
      // Si el usuario no tiene rol, asumimos que es 'usuario' normal
      console.warn('Usuario sin rol definido, asignando rol por defecto');
      user.role = 'usuario';
    }
    
    // Verificar si el usuario es admin o Ramon (antes 'gerente') para compatibilidad
    if (user.username === 'admin') {
      console.log('Usuario admin detectado, asegurando rol de administrador');
      user.role = 'administrador';
      // Guardar usuario actualizado
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    console.log('Usuario obtenido de localStorage:', user);
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
  // PRIORIDAD MÁXIMA: Verificar si es Ramon (comprobación directa)
  if (typeof window !== 'undefined') {
    // Verificar indicador específico para Ramon
    const ramonFix = localStorage.getItem('ramonFix');
    if (ramonFix === 'true') {
      console.log('🔴 Indicador ramonFix encontrado, asignando rol Ramon con máxima prioridad');
      return 'Ramon';
    }
    
    // Verificar usuario en localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.username && user.username.toLowerCase() === 'ramon') {
          console.log('🔴 Usuario Ramon detectado en localStorage, asignando rol Ramon');
          // Guardar indicador para futuras verificaciones
          localStorage.setItem('ramonFix', 'true');
          return 'Ramon';
        }
      } catch (e) {
        console.error('Error al verificar usuario en localStorage:', e);
      }
    }
    
    // Para el modo de prueba, intentar obtener el rol seleccionado en login
    let storedRole = localStorage.getItem('userRole');
    if (storedRole && (['administrador', 'Ramon', 'editor', 'usuario'].includes(storedRole) || storedRole === 'gerente')) {
      // Convertir 'gerente' a 'Ramon' para compatibilidad con código antiguo
      if (storedRole === 'gerente') {
        console.log('Convertiendo rol gerente a Ramon para compatibilidad');
        localStorage.setItem('userRole', 'Ramon');
        storedRole = 'Ramon';
      }
      console.log(`Usando rol guardado: ${storedRole}`);
      return storedRole as UserRole;
    }
    
    // Compatibilidad con implementación anterior
    let testRole = localStorage.getItem('user_role');
    if (testRole && (['administrador', 'Ramon', 'editor', 'usuario'].includes(testRole) || testRole === 'gerente')) {
      // Convertir 'gerente' a 'Ramon' para compatibilidad con código antiguo
      if (testRole === 'gerente') {
        console.log('Convertiendo rol gerente a Ramon para compatibilidad');
        localStorage.setItem('user_role', 'Ramon');
        testRole = 'Ramon';
      }
      console.log(`Usando rol de prueba: ${testRole}`);
      return testRole as UserRole;
    }
  }

  const user = getCurrentUser();
  if (!user) {
    return 'usuario'; // Por defecto, si no hay usuario o no tiene rol
  }
  
  // Si el rol es un enum convertido a cadena (UserRole.XXXX), extraer el valor
  if (user.role?.includes('UserRole.')) {
    const rolePart = user.role.split('.')[1]; // Obtener la parte después del punto
    if (rolePart === 'ADMIN') return 'administrador';
    if (rolePart === 'GERENTE') return 'Ramon';
    if (rolePart === 'EDITOR') return 'editor';
    if (rolePart === 'USUARIO') return 'usuario';
  }
  
  // Usar el rol ya procesado si está disponible
  if (user.role && typeof user.role === 'string') {
    if (['administrador', 'Ramon', 'editor', 'usuario'].includes(user.role)) {
      return user.role as UserRole;
    }
  }
  
  // Asignar rol por defecto basado en atributos del usuario
  if (user.is_superuser) {
    return 'administrador';
  } else if (user.username === 'ramon') {
    return 'Ramon';
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
    case 'Ramon':
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
    
    // Crear los datos en formato URLEncoded como espera el backend OAuth2
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    
    // Configurar cabeceras para enviar datos en formato correcto
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    
    // Realizar la petición de login al endpoint OAuth2 correcto
    // Usar la URL base configurada en apiConfig y añadir el endpoint de auth
    // apiConfig.baseURL ya contiene el prefijo correcto (/api/v1 en desarrollo o /api/api/v1 en producción)
    const loginUrl = API_URL ? `${API_URL}${apiConfig.baseURL.replace('/api/v1', '')}/auth/login` : `${apiConfig.baseURL}/auth/login`;
    console.log('URL de login utilizada:', loginUrl);
    const response = await axios.post<LoginResponse>(loginUrl, formData, config);
    const data = response.data;
    
    // Si llegamos aquí, la autenticación fue exitosa
    console.log('Inicio de sesión exitoso');
    
    // Guardar el token en localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('token', data.access_token);
        
        // Guardar datos del usuario con ajuste especial para Ramon
        if (data.user) {
          // IMPORTANTE: Verificar si es Ramon y ajustar el rol
          if (username.toLowerCase() === 'ramon') {
            console.log('CORRECCIÓN AUTOMÁTICA: Usuario Ramon detectado, forzando rol Ramon');
            data.user.role = 'Ramon';
            // Guardar indicador especial para Ramon
            localStorage.setItem('ramonFix', 'true');
            console.log('Indicador ramonFix guardado para verificaciones futuras');
          } else if (data.user.role === 'gerente') {
            console.log('CORRECCIÓN AUTOMÁTICA: Rol gerente detectado, convirtiendo a Ramon');
            data.user.role = 'Ramon';
          }
          
          // Guardar usuario con rol correcto
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Guardar también el rol por separado para mayor seguridad
          if (data.user.role) {
            localStorage.setItem('userRole', data.user.role);
            console.log(`Rol guardado: ${data.user.role}`);
            
            // Guardado adicional para Ramon
            if (data.user.role === 'Ramon') {
              localStorage.setItem('ramonFix', 'true');
              console.log('Rol Ramon guardado con indicador adicional de seguridad');
            }
          }
        }
      } catch (e) {
        console.warn('Error al guardar datos en localStorage:', e);
      }
    }
    
    return data;
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
  console.log('Actualizando usuario:', id, userData);
  // Usar PUT en lugar de POST para actualizar recursos
  try {
    // Usamos la ruta correcta para la API
    const response = await axios.put(`${API_URL}/api/v1/users/${id}`, userData, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Respuesta de actualización:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
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
  getStoredUser,
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

/**
 * Extrae el rol del token JWT para compatibilidad con tests
 * @returns Rol del usuario o 'usuario' si no se puede extraer
 */
export function extractRoleFromToken(): UserRole {
  console.log('extractRoleFromToken llamada desde authService');
  
  // PRIORIDAD MÁXIMA: Verificación directa de Ramon
  try {
    if (typeof window !== 'undefined') {
      // Verificar el indicador especial de Ramon
      const ramonFix = localStorage.getItem('ramonFix');
      if (ramonFix === 'true') {
        console.log('⭐ Indicador ramonFix encontrado, retornando rol Ramon');
        return 'Ramon';
      }
      
      // Verificar directamente en localStorage por nombre de usuario
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user.username && user.username.toLowerCase() === 'ramon') {
          console.log('⭐ Usuario Ramon detectado en extractRoleFromToken de authService');
          // Establecer el indicador para futuras verificaciones
          localStorage.setItem('ramonFix', 'true');
          // Asegurar que el rol esté guardado correctamente
          if (user.role !== 'Ramon') {
            user.role = 'Ramon';
            localStorage.setItem('user', JSON.stringify(user));
          }
          localStorage.setItem('userRole', 'Ramon');
          return 'Ramon';
        }
      }
      
      // Verificar por token JWT si está disponible
      const token = getToken();
      if (token) {
        try {
          // Decodificar el token JWT
          const decoded = jwtDecode<{ role?: string; username?: string; sub?: string }>(token);
          
          // Verificación específica para Ramon - PRIORIDAD MÁXIMA
          if (decoded.username && decoded.username.toLowerCase() === 'ramon') {
            console.log('⭐ USUARIO RAMON DETECTADO por username en token, asignando rol Ramon');
            localStorage.setItem('ramonFix', 'true');
            return 'Ramon';
          }
          
          if (decoded.sub && decoded.sub.toLowerCase() === 'ramon') {
            console.log('⭐ USUARIO RAMON DETECTADO por sub en token, asignando rol Ramon');
            localStorage.setItem('ramonFix', 'true');
            return 'Ramon';
          }
        } catch (e) {
          console.error('Error al decodificar el token JWT:', e);
        }
      }
      
      // Verificar en userRole como última opción
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'Ramon' || userRole === 'gerente') {
        if (userRole === 'gerente') {
          localStorage.setItem('userRole', 'Ramon');
        }
        return 'Ramon';
      }
    }
  } catch (e) {
    console.error('Error al verificar usuario Ramon:', e);
  }
  
  // Si no es Ramon, obtener el rol del usuario actual
  const role = getCurrentUserRole();
  return role;
}
