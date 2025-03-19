import React, { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No hay token, redirigiendo a login');
      // No hay token, redirigir a login
      window.location.href = '/login';
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Mientras se verifica la autenticación, mostrar un indicador de carga
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si está autenticado, mostrar los hijos
  return <>{children}</>;
};
