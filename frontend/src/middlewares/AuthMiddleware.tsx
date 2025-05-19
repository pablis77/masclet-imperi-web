import React, { useState, useEffect } from 'react';

interface AuthMiddlewareProps {
  children: React.ReactNode;
  currentPath?: string;
}

/**
 * Middleware de autenticación para proteger rutas
 * VERSION SIMPLIFICADA: En desarrollo, todos los usuarios tienen acceso completo
 * Las verificaciones de roles se han desactivado temporalmente
 */
const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [authorized, setAuthorized] = useState(true); // Siempre autorizado en modo desarrollo

  useEffect(() => {
    // Versión simplificada para desarrollo
    try {
      // Si no hay token, crear uno temporal para desarrollo
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.x');
        console.log('Token JWT de desarrollo generado automáticamente');
      }
      
      // En desarrollo siempre estamos autorizados
      setAuthorized(true);
    } catch (error) {
      console.error('Error en AuthMiddleware:', error);
      // En desarrollo, permitir acceso incluso si hay errores
      setAuthorized(true);
    }
    
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

  // En modo desarrollo, siempre retornamos los hijos (authorized es siempre true)
  return <>{children}</>;
  
  /* La siguiente lógica se implementará cuando se active la validación de roles
  return (
    <>
      {!authorized ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h3 className="text-xl font-bold text-red-700 mb-2">Acceso no autorizado</h3>
          <p className="text-red-600 mb-4">No tienes permiso para acceder a esta página.</p>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            onClick={() => {
              localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.x');
              window.location.reload();
            }}
          >
            Iniciar sesión
          </button>
        </div>
      ) : (
        children
      )}
    </>
  );
  */
};

export default AuthMiddleware;
