import React from 'react';

export const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    // Redirigir a la página de logout
    window.location.href = '/logout';
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn bg-white/10 hover:bg-white/20 text-sm px-3 py-1 text-white rounded"
    >
      Cerrar sesión
    </button>
  );
};
