import { useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import { hasAccessToRoute } from './authUtils';
import type { UserRole } from '../services/authService';

interface AuthMiddlewareProps {
  children: React.ReactNode;
  currentPath?: string;
}

/**
 * Middleware de autenticación para proteger rutas
 * Verifica si el usuario está autenticado y tiene permisos para acceder a la ruta actual
 * NOTA: Durante desarrollo, se ha simplificado para permitir acceso a todas las rutas
 */
const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [authorized, setAuthorized] = useState(true); // Siempre autorizado en modo desarrollo
  const [loading, setLoading] = useState(false); // No mostrar carga en modo desarrollo

  useEffect(() => {
    // MODO DESARROLLO: Permitir acceso a todas las rutas sin verificaciones
    console.log('Modo desarrollo: Acceso permitido a todas las rutas');
    
    /* El código de verificación se deja comentado para implementarlo más adelante
    // Obtener la ruta actual
    const currentPath = window.location.pathname;
    console.log('Verificando acceso a ruta:', currentPath);
    
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
      console.log('Usuario no autenticado, redirigiendo al login');
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }

    // Verificar si tiene acceso a la ruta actual
    const user = getCurrentUser();
    // Asegurar que el rol del usuario sea de tipo UserRole
    const userRole = (user?.role as UserRole) || 'usuario';
    
    const hasAccess = hasAccessToRoute(currentPath, userRole);
    console.log('¿Usuario tiene acceso a la ruta?', hasAccess, 'con rol:', userRole);
    
    if (!hasAccess) {
      console.log('Usuario no autorizado para esta ruta, redirigiendo');
      // Redirigir a página de error o página principal según su rol
      window.location.href = '/unauthorized';
      return;
    }

    // Si todo está correcto, autorizar
    setAuthorized(true);
    setLoading(false);
    */
  }, []);

  // En modo desarrollo, siempre mostrar el contenido sin espera
  return <>{children}</>;
};

export default AuthMiddleware;
