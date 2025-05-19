import React, { useEffect } from 'react';

export const ClearLocalStorage: React.FC = () => {
  useEffect(() => {
    // Limpiar localStorage para forzar un nuevo login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('LocalStorage limpiado, redirigiendo a login');
    
    // Redirigir a la página de login después de un breve retraso
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">Cerrando sesión...</p>
    </div>
  );
};
