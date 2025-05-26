import React, { useEffect, useState } from 'react';
import { currentUserHasRole, UserRole } from '../../services/roleService';
import { isAuthenticated } from '../../services/authService';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectToLogin?: boolean;
}

/**
 * Componente para proteger rutas basado en roles de usuario
 * Verifica si el usuario tiene el rol requerido para acceder al contenido
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  children,
  fallback = null,
  redirectToLogin = true
}) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar acceso solo del lado del cliente
    if (typeof window !== 'undefined') {
      // Verificar si el usuario está autenticado
      const auth = isAuthenticated();
      if (!auth) {
        // Si no está autenticado y se requiere redirección
        if (redirectToLogin) {
          console.log('Usuario no autenticado, redirigiendo a login...');
          window.location.href = '/login';
          return;
        }
        
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Verificar si el usuario tiene el rol requerido
      const access = currentUserHasRole(requiredRole);
      console.log(`Verificando acceso: Rol requerido [${requiredRole}], Tiene acceso: ${access}`);
      
      setHasAccess(access);
      
      // Si no tiene acceso y se requiere redirección a login
      if (!access && redirectToLogin) {
        console.log('Usuario sin permisos suficientes, redirigiendo a home...');
        window.location.href = '/';
      }
      
      setLoading(false);
    }
  }, [requiredRole, redirectToLogin]);

  // Mostrar indicador de carga mientras se verifica el acceso
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mostrar el contenido si tiene acceso, o el fallback si no
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
