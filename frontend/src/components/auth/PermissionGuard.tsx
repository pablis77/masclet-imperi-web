import React, { ReactNode } from 'react';
import { getCurrentRole } from '../../services/roleService';
import type { UserRole } from '../../services/roleService';

// Definición de las propiedades del componente
interface PermissionGuardProps {
  // Roles que tienen permiso para ver el contenido
  allowedRoles: UserRole[];
  // Contenido a mostrar si el usuario tiene permiso
  children: ReactNode;
  // Contenido alternativo a mostrar si el usuario no tiene permiso (opcional)
  fallback?: ReactNode;
  // Si es true, oculta completamente el elemento en lugar de mostrar el fallback
  hideCompletely?: boolean;
}

/**
 * Componente que controla la visibilidad de elementos basados en el rol del usuario
 * 
 * Ejemplo de uso:
 * <PermissionGuard allowedRoles={['administrador', 'gerente']}>
 *   <button>Acción restringida</button>
 * </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
  hideCompletely = false
}) => {
  // Obtener el rol del usuario actual
  const userRole = getCurrentRole();
  
  // Comprobar si el usuario tiene alguno de los roles permitidos
  const hasPermission = allowedRoles.includes(userRole);
  
  // Si el usuario tiene permiso, mostrar el contenido normal
  if (hasPermission) {
    return <>{children}</>;
  }
  
  // Si el usuario no tiene permiso y hideCompletely es true, no mostrar nada
  if (hideCompletely) {
    return null;
  }
  
  // Si el usuario no tiene permiso, mostrar el contenido alternativo
  return <>{fallback}</>;
};

export default PermissionGuard;
