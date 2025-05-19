// Utilidades para gestión de roles y permisos
import type { UserRole } from '../services/authService';

// Enum para valores de rol
export enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GERENTE = 'GERENTE',
  EDITOR = 'EDITOR',
  USUARIO = 'USUARIO'
}

// Mapa de permisos según la matriz por rol
const rolePermissions: Record<string, string[]> = {
  [Role.ADMINISTRADOR]: [
    'animals.view',
    'animals.edit',
    'animals.create',
    'explotacions.view',
    'explotacions.edit',
    'explotacions.create',
    'users.view',
    'users.edit',
    'users.create',
    'imports.view',
    'imports.create',
    'backups.view',
    'backups.create',
    'dashboard.view'
  ],
  [Role.GERENTE]: [
    'animals.view',
    'animals.edit',
    'animals.create',
    'explotacions.view',
    'users.view',
    'users.edit',
    'users.create',
    'dashboard.view'
  ],
  [Role.EDITOR]: [
    'animals.view',
    'animals.edit',
    'explotacions.view',
    'dashboard.view'
  ],
  [Role.USUARIO]: [
    'animals.view',
    'explotacions.view',
    'dashboard.view'
  ]
};

/**
 * Comprueba si un rol tiene acceso a una ruta específica
 * @param route Ruta o permiso a comprobar
 * @param role Rol del usuario
 * @returns true si tiene acceso, false en caso contrario
 */
export const hasAccessToRoute = (route: string, role?: UserRole | null): boolean => {
  // Si no hay rol, no tiene acceso
  if (!role) return false;
  
  // Convertir a mayúsculas para normalizar
  const normalizedRole = role.toUpperCase() as keyof typeof Role;
  
  // Verificar que sea un rol válido
  if (!Object.values(Role).includes(normalizedRole as Role)) {
    console.warn(`Rol '${role}' no reconocido`);
    return false;
  }
  
  // Obtener permisos para este rol
  const permissions = rolePermissions[normalizedRole];
  
  // Si no hay permisos definidos, no tiene acceso
  if (!permissions) return false;
  
  // Comprobar si tiene el permiso específico
  return permissions.includes(route);
};

/**
 * Obtiene todos los permisos de un rol
 * @param role Rol del usuario
 * @returns Array con los permisos del rol
 */
export const getRolePermissions = (role?: UserRole | null): string[] => {
  if (!role) return [];
  
  // Convertir a mayúsculas para normalizar
  const normalizedRole = role.toUpperCase() as keyof typeof Role;
  
  // Verificar que sea un rol válido
  if (!Object.values(Role).includes(normalizedRole as Role)) {
    console.warn(`Rol '${role}' no reconocido`);
    return [];
  }
  
  return rolePermissions[normalizedRole] || [];
};

/**
 * Comprueba si un usuario tiene múltiples permisos
 * @param routes Array de rutas o permisos a comprobar
 * @param role Rol del usuario
 * @returns true si tiene todos los permisos, false en caso contrario
 */
export const hasAllPermissions = (routes: string[], role?: UserRole | null): boolean => {
  if (!role || !routes.length) return false;
  
  // Comprobar que tiene todos los permisos
  return routes.every(route => hasAccessToRoute(route, role));
};

/**
 * Comprueba si un usuario tiene al menos uno de los permisos
 * @param routes Array de rutas o permisos a comprobar
 * @param role Rol del usuario
 * @returns true si tiene al menos un permiso, false en caso contrario
 */
export const hasAnyPermission = (routes: string[], role?: UserRole | null): boolean => {
  if (!role || !routes.length) return false;
  
  // Comprobar que tiene al menos un permiso
  return routes.some(route => hasAccessToRoute(route, role));
};

/**
 * Comprueba si un rol puede realizar una acción específica sobre animales
 * @param action Acción a comprobar: 'view', 'edit', 'create'
 * @param role Rol del usuario
 * @returns true si puede realizar la acción, false en caso contrario
 */
export const canManageAnimals = (action: 'view' | 'edit' | 'create', role?: UserRole | null): boolean => {
  return hasAccessToRoute(`animals.${action}`, role);
};

/**
 * Comprueba si un rol puede realizar una acción específica sobre explotaciones
 * @param action Acción a comprobar: 'view', 'edit', 'create'
 * @param role Rol del usuario
 * @returns true si puede realizar la acción, false en caso contrario
 */
export const canManageExplotacions = (action: 'view' | 'edit' | 'create', role?: UserRole | null): boolean => {
  return hasAccessToRoute(`explotacions.${action}`, role);
};

/**
 * Comprueba si un rol puede realizar una acción específica sobre usuarios
 * @param action Acción a comprobar: 'view', 'edit', 'create'
 * @param role Rol del usuario
 * @returns true si puede realizar la acción, false en caso contrario
 */
export const canManageUsers = (action: 'view' | 'edit' | 'create', role?: UserRole | null): boolean => {
  return hasAccessToRoute(`users.${action}`, role);
};

/**
 * Comprueba si un rol puede ver o crear importaciones
 * @param action Acción a comprobar: 'view', 'create'
 * @param role Rol del usuario
 * @returns true si puede realizar la acción, false en caso contrario
 */
export const canManageImports = (action: 'view' | 'create', role?: UserRole | null): boolean => {
  return hasAccessToRoute(`imports.${action}`, role);
};

/**
 * Comprueba si un rol puede ver o crear backups
 * @param action Acción a comprobar: 'view', 'create'
 * @param role Rol del usuario
 * @returns true si puede realizar la acción, false en caso contrario
 */
export const canManageBackups = (action: 'view' | 'create', role?: UserRole | null): boolean => {
  return hasAccessToRoute(`backups.${action}`, role);
};
