import React, { useEffect, useState } from 'react';
import { currentUserHasPermission, UserAction } from '../../services/roleService';

interface PermissionGuardProps {
  requiredPermission: UserAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para proteger elementos de UI basado en permisos específicos
 * Verifica si el usuario tiene el permiso requerido para mostrar el contenido
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  children,
  fallback = null
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar permiso solo del lado del cliente
    if (typeof window !== 'undefined') {
      // Verificar si el usuario tiene el permiso requerido
      const permission = currentUserHasPermission(requiredPermission);
      console.log(`Verificando permiso: Acción [${requiredPermission}], Tiene permiso: ${permission}`);
      
      setHasPermission(permission);
      setLoading(false);
    }
  }, [requiredPermission]);

  // Mientras verifica, no mostrar nada
  if (loading) {
    return null;
  }

  // Mostrar el contenido si tiene permiso, o el fallback si no
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
