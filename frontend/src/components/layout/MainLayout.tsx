import React, { useState, useEffect } from 'react';
import type { MainLayoutProps } from '.';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Layout principal de la aplicación que integra todos los componentes de navegación
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  userRole = 'administrador', // Por defecto administrador para desarrollo
  currentPath = '/',
  title = 'Masclet Imperi',
  version = '1.0.0',
  children
}) => {
  // Estado para controlar si el sidebar está abierto en dispositivos móviles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Cierra el sidebar cuando se cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Función para alternar el estado del sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Cerrar sidebar al hacer clic fuera de él
  const handleOverlayClick = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar en la parte superior */}
      <Navbar userRole={userRole} currentPath={currentPath} title={title} />
      
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar 
          userRole={userRole} 
          currentPath={currentPath} 
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        
        {/* Overlay para cerrar el sidebar en móvil */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}
        
        {/* Toggle del sidebar para móvil (fuera del sidebar) */}
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 z-40 md:hidden bg-primary hover:bg-primary/80 text-white rounded-full p-3 shadow-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        {/* Contenido principal */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 ml-0 md:ml-64 transition-all duration-300">
          {/* Título de la página visible en todos los dispositivos */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
          
          {/* Contenido de la página */}
          <div className="pb-16 md:pb-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer en la parte inferior */}
      <div className="mt-auto ml-0 md:ml-64">
        <Footer showVersion={true} version={version} />
      </div>
    </div>
  );
};

export default MainLayout;
