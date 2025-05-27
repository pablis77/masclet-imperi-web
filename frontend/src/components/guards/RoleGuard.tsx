import React, { useEffect, useState } from 'react';
import { getCurrentRole } from '../../services/roleService';
import type { UserRole } from '../../services/roleService';
import { isAuthenticated } from '../../services/authService';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectToLogin?: boolean;
}

/**
 * Componente para proteger rutas basado en roles de usuario
 * Verifica si el usuario tiene alguno de los roles permitidos para acceder al contenido
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
  redirectToLogin = true
}) => {
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Solo intentamos redirigir en el navegador
    if (typeof window === 'undefined') return;
    
    // Si el usuario no está autenticado y se solicita redirección
    if (!isAuthenticated() && redirectToLogin) {
      console.log('Usuario no autenticado, redirigiendo a login');
      window.location.href = '/login';
      return;
    }
    
    // Verificar rol del usuario
    const currentRole = getCurrentRole();
    console.log('Rol actual:', currentRole);
    console.log('Roles permitidos:', allowedRoles);
    
    const hasAccess = allowedRoles.includes(currentRole);
    console.log('¿Tiene acceso?', hasAccess);
    
    setCanAccess(hasAccess);
    setLoading(false);
    
    if (!hasAccess && redirectToLogin) {
      console.log(`Acceso denegado: se requiere uno de estos roles [${allowedRoles.join(', ')}]`);
      // No redirigimos automáticamente, solo mostramos mensaje de acceso denegado
    }
  }, [allowedRoles, redirectToLogin]);

  // Mostrar indicador de carga mientras se verifica el acceso
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mostrar el contenido si tiene acceso, o el fallback si no
  return canAccess ? (
    <>{children}</>
  ) : (
    <>
      {fallback || (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded shadow-md" role="alert">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div>
              <p className="font-bold">Acceso denegado</p>
              <p>No tienes los permisos necesarios para acceder a esta página.</p>
              <p className="mt-2 text-sm">Se requiere uno de estos roles: {allowedRoles.join(', ')}</p>
              <p className="mt-2 text-sm">Tu rol actual: {getCurrentRole()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleGuard;
