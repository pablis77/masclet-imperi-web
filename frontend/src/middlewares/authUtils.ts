import { getCurrentUser, getCurrentUserRole } from '../services/authService';
import type { UserRole } from '../services/authService';

/**
 * Rutas protegidas por rol
 * Cada rol puede acceder a ciertas rutas
 */
const protectedRoutes: { [key: string]: UserRole[] } = {
  '/dashboard': ['administrador', 'gerente'],
  '/users': ['administrador', 'gerente'],
  '/animals': ['administrador', 'gerente', 'editor', 'usuario'],
  '/animals/create': ['administrador', 'gerente'],
  '/animals/edit': ['administrador', 'gerente', 'editor'],
  '/explotacions': ['administrador', 'gerente', 'editor', 'usuario'],
  '/explotacions/create': ['administrador', 'gerente'],
  '/explotacions/edit': ['administrador', 'gerente', 'editor'],
  '/imports': ['administrador'],
  '/backup': ['administrador']
};

/**
 * Verifica si una ruta es protegida (requiere autenticación)
 * @param route Ruta a verificar
 * @returns true si la ruta es protegida
 */
export const isProtectedRoute = (route: string): boolean => {
  // Todas las rutas excepto login y error son protegidas
  if (route === '/login' || route === '/unauthorized') {
    return false;
  }
  return true;
};

/**
 * Verifica si un usuario tiene acceso a una ruta específica
 * @param route Ruta a verificar
 * @param role Rol del usuario (opcional, si no se proporciona lo obtiene del usuario actual)
 * @returns true si el usuario tiene acceso a la ruta
 */
export const hasAccessToRoute = (route: string, role?: UserRole): boolean => {
  // MODO DESARROLLO: Permitir acceso a todas las rutas
  return true;
  
  // El código siguiente se deja comentado hasta que se implementen los permisos por roles
  /*
  // Si no se proporciona rol, obtenerlo del usuario actual
  const userRole = role || getCurrentUserRole();
  
  // El administrador tiene acceso a todo
  if (userRole === 'administrador') {
    return true;
  }
  
  // Verificar acceso para cada patrón de ruta
  for (const [routePattern, allowedRoles] of Object.entries(protectedRoutes)) {
    if (route.startsWith(routePattern) && allowedRoles.includes(userRole)) {
      return true;
    }
  }
  
  return false;
  */
};

/**
 * Obtener la ruta de redirección basada en el rol del usuario
 */
export function getRedirectPathForUser(): string {
  // MODO DESARROLLO: Redireccionar al dashboard para todos los usuarios
  return '/dashboard';
  
  /*
  const user = getCurrentUser();
  if (!user) return '/login';

  switch (user.role) {
    case 'administrador':
      return '/dashboard';
    case 'gerente':
      return '/dashboard';
    case 'editor':
      return '/animals';
    case 'usuario':
      return '/animals';
    default:
      return '/login';
  }
  */
}
