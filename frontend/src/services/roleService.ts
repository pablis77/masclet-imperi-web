/**
 * Servicio para gestión de roles y permisos
 * Este servicio complementa a authService para ofrecer funcionalidades
 * específicas de validación de roles y permisos
 */

import { jwtDecode } from 'jwt-decode';
import { getCurrentUser } from './authService';

// Obtener token directamente para evitar dependencias circulares
const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem('token');
  } catch (e) {
    console.warn('Error al acceder a localStorage:', e);
    return null;
  }
};

// Definición de roles en el sistema
export type UserRole = 'administrador' | 'gerente' | 'editor' | 'usuario';

// Definición de acciones permitidas (según config.py del backend)
export type UserAction = 
  'consultar' | 
  'actualizar' | 
  'crear' | 
  'gestionar_usuarios' | 
  'borrar_usuarios' |
  'cambiar_contraseñas' |
  'gestionar_explotaciones' |
  'importar_datos' |
  'ver_estadisticas' |
  'exportar_datos';

// Jerarquía de roles (prioridad descendente)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'administrador': 4,
  'gerente': 3,
  'editor': 2,
  'usuario': 1
};

// Matriz de permisos por rol (debe coincidir con backend/app/core/config.py)
export const ROLE_PERMISSIONS: Record<UserRole, UserAction[]> = {
  'administrador': [
    'consultar', 
    'actualizar', 
    'crear',
    'gestionar_usuarios', 
    'borrar_usuarios',
    'cambiar_contraseñas',
    'gestionar_explotaciones',
    'importar_datos', 
    'ver_estadisticas', 
    'exportar_datos'
  ],
  'gerente': [
    'consultar', 
    'actualizar', 
    'crear',
    'gestionar_usuarios',
    'borrar_usuarios',
    'cambiar_contraseñas',
    'gestionar_explotaciones', 
    'ver_estadisticas',
    'exportar_datos'
  ],
  'editor': [
    'consultar', 
    'actualizar', 
    'ver_estadisticas'
  ],
  'usuario': [
    'consultar'
  ]
};

/**
 * Extrae el rol del token JWT
 * @returns Rol del usuario o 'usuario' si no se puede extraer
 */
export function extractRoleFromToken(): UserRole {
  try {
    const token = getToken();
    if (!token) return 'usuario';

    // Decodificar el token JWT
    const decoded = jwtDecode<{ role?: string }>(token);
    
    // Extraer el rol del token (puede venir como UserRole.XXXX o directamente)
    if (decoded.role) {
      // Si el rol es un enum convertido a cadena (UserRole.XXXX), extraer el valor
      if (decoded.role.includes('UserRole.')) {
        const rolePart = decoded.role.split('.')[1]; // Obtener la parte después del punto
        if (rolePart === 'ADMIN') return 'administrador';
        if (rolePart === 'GERENTE') return 'gerente';
        if (rolePart === 'EDITOR') return 'editor';
        if (rolePart === 'USER') return 'usuario';
      }
      
      // Si el rol ya está normalizado, verificar que sea válido
      if (['administrador', 'gerente', 'editor', 'usuario'].includes(decoded.role)) {
        return decoded.role as UserRole;
      }
    }
    
    // Valor por defecto
    return 'usuario';
  } catch (error) {
    console.error('Error al extraer rol del token:', error);
    return 'usuario';
  }
}

/**
 * Obtiene el rol del usuario actual, intentando múltiples fuentes
 * @returns Rol del usuario
 */
export function getCurrentRole(): UserRole {
  // 1. Intenta obtener del localStorage (para modo de prueba)
  if (typeof window !== 'undefined') {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole && ['administrador', 'gerente', 'editor', 'usuario'].includes(storedRole)) {
      return storedRole as UserRole;
    }
  }
  
  // 2. Intenta extraer del token JWT
  const tokenRole = extractRoleFromToken();
  if (tokenRole !== 'usuario') {
    return tokenRole;
  }
  
  // 3. Intenta obtener del objeto usuario
  const user = getCurrentUser();
  if (user?.role) {
    // Si el rol es un enum convertido a cadena (UserRole.XXXX), extraer el valor
    if (typeof user.role === 'string' && user.role.includes('UserRole.')) {
      const rolePart = user.role.split('.')[1]; // Obtener la parte después del punto
      if (rolePart === 'ADMIN') return 'administrador';
      if (rolePart === 'GERENTE') return 'gerente';
      if (rolePart === 'EDITOR') return 'editor';
      if (rolePart === 'USER') return 'usuario';
    }
    
    // Si el rol ya está normalizado, verificar que sea válido
    if (typeof user.role === 'string' && 
        ['administrador', 'gerente', 'editor', 'usuario'].includes(user.role)) {
      return user.role as UserRole;
    }
  }
  
  // 4. Determinar por nombre de usuario (fallback)
  if (user?.username) {
    if (user.username === 'admin') return 'administrador';
    if (user.username === 'ramon') return 'gerente';
    if (user.username.includes('editor')) return 'editor';
  }
  
  // Valor por defecto
  return 'usuario';
}

/**
 * Verifica si un rol tiene un nivel jerárquico igual o superior al requerido
 * @param userRole Rol del usuario
 * @param requiredRole Rol requerido para la acción
 * @returns true si el usuario tiene el nivel jerárquico requerido
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Verifica si un rol tiene permiso para realizar una acción específica
 * @param userRole Rol del usuario
 * @param action Acción que se intenta realizar
 * @returns true si el usuario tiene permiso para la acción
 */
export function hasPermission(userRole: UserRole, action: UserAction): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(action);
}

/**
 * Verifica si el usuario actual tiene un rol igual o superior al requerido
 * @param requiredRole Rol mínimo requerido
 * @returns true si el usuario actual tiene el nivel jerárquico requerido
 */
export function currentUserHasRole(requiredRole: UserRole): boolean {
  const currentRole = getCurrentRole();
  return hasRoleLevel(currentRole, requiredRole);
}

/**
 * Verifica si el usuario actual tiene permiso para realizar una acción
 * @param action Acción que se intenta realizar
 * @returns true si el usuario actual tiene permiso para la acción
 */
export function currentUserHasPermission(action: UserAction): boolean {
  const currentRole = getCurrentRole();
  return hasPermission(currentRole, action);
}

export default {
  getCurrentRole,
  hasRoleLevel,
  hasPermission,
  currentUserHasRole,
  currentUserHasPermission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS
};
