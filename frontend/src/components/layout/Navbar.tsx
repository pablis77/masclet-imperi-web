import React, { useState, useEffect } from 'react';
import type { NavbarProps, MenuItem, UserRole } from './types';
import { AnimalIcon } from '../icons';
import OptimizedImage from '../ui/OptimizedImage';

/**
 * Barra de navegación principal con soporte para modo responsive
 */
const Navbar: React.FC<NavbarProps> = ({ 
  userRole = 'usuario',
  currentPath = '/',
  title = 'Masclet Imperi'
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Menú de navegación según rol
  const menuItems: MenuItem[] = [
    { 
      name: "Dashboard", 
      url: "/", 
      icon: "bull", 
      iconClass: "w-6 h-6", 
      roles: ["administrador", "Ramon", "editor", "usuario"] as UserRole[] 
    },
    { 
      name: "Explotaciones", 
      url: "/explotacions", 
      icon: "cow", 
      iconClass: "w-6 h-6", 
      roles: ["administrador", "Ramon", "editor", "usuario"] as UserRole[] 
    },
    { 
      name: "Animales", 
      url: "/animals", 
      icon: "nursing-cow", 
      iconClass: "w-6 h-6", 
      roles: ["administrador", "Ramon", "editor", "usuario"] as UserRole[] 
    },
    { 
      name: "Usuarios", 
      url: "/users", 
      icon: "users", 
      iconClass: "", 
      roles: ["administrador", "Ramon"] as UserRole[] 
    },
    { 
      name: "Importación", 
      url: "/imports", 
      icon: "import", 
      iconClass: "", 
      roles: ["administrador"] as UserRole[] 
    },
    { 
      name: "Backup", 
      url: "/backup", 
      icon: "backup", 
      iconClass: "", 
      roles: ["administrador"] as UserRole[] 
    },
    { 
      name: "Mi Perfil", 
      url: "/profile", 
      icon: "user", 
      iconClass: "", 
      roles: ["administrador", "Ramon", "editor", "usuario"] as UserRole[] 
    },
  ];

  // Filtrar menú por rol
  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole as UserRole));

  // Función para determinar si un elemento está activo
  const isActive = (itemUrl: string): boolean => {
    if (itemUrl === '/' && currentPath === '/') return true;
    if (itemUrl !== '/' && currentPath.startsWith(itemUrl)) return true;
    return false;
  };

  // Toggle del menú móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle del tema oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Aplicar modo oscuro al documento
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Toggle del alto contraste
  const toggleHighContrast = () => {
    const newHighContrast = !isHighContrast;
    setIsHighContrast(newHighContrast);
    
    // Aplicar alto contraste al documento
    if (newHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  };

  // Cargar preferencias guardadas al montar el componente
  useEffect(() => {
    // Cargar preferencia de tema oscuro
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Cargar preferencia de alto contraste
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    setIsHighContrast(savedHighContrast);
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  // Renderizar el icono adecuado para cada elemento del menú
  const renderIcon = (item: MenuItem) => {
    // Si el icono es una referencia a un tipo de animal
    if (['bull', 'cow', 'nursing-cow'].includes(item.icon)) {
      return (
        <AnimalIcon 
          type={item.icon as any} 
          size={24} 
          className={`${item.iconClass || ''} mr-2`}
        />
      );
    }
    
    // Si es otro tipo de icono (custom o emoji)
    if (item.icon.startsWith('/')) {
      // Es una URL de imagen
      return <img src={item.icon} alt={item.name} className={`${item.iconClass || ''} mr-2`} />;
    } else {
      // Es un emoji u otro tipo de texto
      return <span className="mr-2 text-xl">{item.icon}</span>;
    }
  };

  return (
    <header className="bg-primary text-white shadow-lg relative z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo y título */}
        <div className="flex items-center space-x-2">
          <a href="/" className="font-bold text-xl flex items-center truncate">
            <OptimizedImage src="/images/logo_masclet.png" alt="Masclet Imperi" className="h-10 w-auto mr-2" priority={true} />
            <span className="hidden xs:inline">MASCLET IMPERI</span>
          </a>
        </div>

        {/* Título de la página actual (solo visible en móvil) */}
        <div className="md:hidden text-center font-medium truncate max-w-[140px]">
          {title}
        </div>

        {/* Menú de navegación (visible solo en escritorio) */}
        <nav className="hidden md:flex space-x-4 lg:space-x-6">
          {filteredMenu.map((item, index) => (
            <a 
              key={`desktop-nav-${index}`}
              href={item.url} 
              className={`
                flex items-center transition-colors duration-150 px-4 py-2 rounded-md text-base
                ${isActive(item.url) 
                  ? "bg-primary-dark text-white font-medium" 
                  : "hover:bg-primary/20"}
              `}
            >
              {renderIcon(item)}
              {item.name}
              {item.badge && (
                <span className="ml-1.5 bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Controles de la derecha */}
        <div className="flex items-center">
          {/* Controles de tema visible en móvil */}
          <div className="flex items-center mr-2 md:hidden">
            <button 
              onClick={toggleDarkMode}
              className="text-white hover:text-alletar transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              <span className={!isDarkMode ? "hidden" : ""}>🌞</span>
              <span className={isDarkMode ? "hidden" : ""}>🌙</span>
            </button>
          </div>
          
          {/* Botón de menú móvil */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-white text-2xl p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
          
          {/* Controles de escritorio */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Toggle de tema */}
            <button 
              onClick={toggleDarkMode}
              className="text-white hover:text-alletar transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              <span className={!isDarkMode ? "hidden" : ""}>🌞</span>
              <span className={isDarkMode ? "hidden" : ""}>🌙</span>
            </button>
            
            {/* Toggle de alto contraste */}
            <button 
              onClick={toggleHighContrast}
              className="text-white hover:text-alletar transition-colors p-2 hidden xs:block focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label={isHighContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
            >
              <span>👁️</span>
            </button>
            
            {/* Indicador de rol */}
            <span className="text-sm capitalize bg-primary-dark/30 px-3 py-1 rounded-full">
              {userRole}
            </span>
            
            {/* Botón de cierre de sesión */}
            <button 
              className="bg-white/10 hover:bg-white/20 transition-colors text-white px-3 py-1.5 rounded-md text-sm font-medium"
              onClick={() => {
                // Limpiar token y redirigir al login
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil (oculto por defecto) */}
      <div 
        className={`md:hidden bg-primary-dark absolute top-full left-0 right-0 shadow-lg z-40 transition-all duration-200 ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="container mx-auto px-4 py-2">
          <nav className="flex flex-col">
            {filteredMenu.map((item, index) => (
              <a 
                key={`mobile-nav-${index}`}
                href={item.url} 
                className={`
                  flex items-center py-4 px-4 border-b border-white/10 transition-colors text-base
                  ${isActive(item.url) 
                    ? "bg-white/10 font-medium" 
                    : "hover:bg-white/5"}
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {renderIcon(item)}
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
            
            <div className="flex flex-wrap justify-between items-center mt-3 pt-2 px-4 gap-2">
              {/* Toggle de tema en menú móvil */}
              <button 
                onClick={toggleDarkMode}
                className="flex items-center py-3 focus:outline-none"
              >
                <span>{isDarkMode ? "🌞" : "🌙"}</span>
                <span className="ml-3">{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
              </button>
              
              {/* Toggle de contraste en menú móvil */}
              <button 
                onClick={toggleHighContrast}
                className="flex items-center py-3 focus:outline-none"
              >
                <span>👁️</span>
                <span className="ml-3">
                  {isHighContrast ? "Desactivar contraste" : "Alto contraste"}
                </span>
              </button>
            </div>
            
            <div className="border-t border-white/20 mt-2 pt-2 px-4 flex flex-wrap justify-between items-center gap-2">
              <span className="text-sm capitalize bg-white/10 px-3 py-1 rounded-full">
                {userRole}
              </span>
              <button 
                className="bg-white/10 hover:bg-white/20 transition-colors text-white px-3 py-1.5 rounded-md text-sm font-medium"
                onClick={() => {
                  // Limpiar token y redirigir al login
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
