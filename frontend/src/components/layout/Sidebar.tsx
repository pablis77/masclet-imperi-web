import React, { useState, useEffect } from 'react';
import OptimizedImage from '../ui/OptimizedImage';
import type { SidebarProps, MenuSection, UserRole } from './types';
import { AnimalIcon } from '../icons';

/**
 * Barra lateral con navegación organizada por secciones
 */
const Sidebar: React.FC<SidebarProps> = ({
  userRole = 'usuario',
  currentPath = '/',
  isOpen = false,
  onToggle
}) => {
  // Estructura del menú organizada por secciones
  const menuSections: MenuSection[] = [
    {
      title: "Principal",
      items: [
        { 
          name: "Dashboard", 
          url: "/", 
          icon: "bull",
          roles: ["administrador", "Ramon", "editor", "usuario"] as UserRole[] 
        },
        { 
          name: "Explotaciones", 
          url: "/explotacions", 
          icon: "cow",
          roles: ["administrador", "Ramon", "editor", "usuario"] as UserRole[] 
        }
      ]
    },
    {
      title: "Gestión",
      items: [
        { 
          name: "Animales", 
          url: "/animals", 
          icon: "nursing-cow", 
          roles: ["administrador", "Ramon", "editor", "usuario"] as UserRole[] 
        }
      ]
    },
    {
      title: "Administración",
      items: [
        { 
          name: "Importación", 
          url: "/imports", 
          icon: "📥", 
          roles: ["administrador"] as UserRole[] 
        },
        { 
          name: "Usuarios", 
          url: "/users", 
          icon: "👥", 
          roles: ["administrador", "Ramon"] as UserRole[] 
        },
        { 
          name: "Backup", 
          url: "/backup", 
          icon: "💾", 
          roles: ["administrador"] as UserRole[] 
        }
      ]
    }
  ];

  // Función para determinar si un elemento está activo
  const isActive = (itemUrl: string): boolean => {
    if (itemUrl === '/' && currentPath === '/') return true;
    if (itemUrl !== '/' && currentPath.startsWith(itemUrl)) return true;
    return false;
  };

  // Filtrar menú por rol
  const filteredSections = menuSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(userRole as UserRole))
    }))
    .filter(section => section.items.length > 0);

  // Renderizar el icono correcto para cada elemento
  const renderIcon = (icon: string) => {
    // Si el icono es una referencia a un tipo de animal
    if (['bull', 'cow', 'nursing-cow', 'deceased'].includes(icon)) {
      return (
        <AnimalIcon 
          type={icon as any} 
          size={24} 
          className="mr-3" 
        />
      );
    }
    
    // Para otros tipos de iconos (emojis)
    return <span className="mr-3 text-xl">{icon}</span>;
  };

  return (
    <aside 
      className={`masclet-sidebar w-64 bg-white dark:bg-gray-800 min-h-screen shadow-md border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } fixed md:relative`}
    >
      {/* Cabecera del sidebar con logo */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
        <div className="w-16 h-16 md:w-20 md:h-20 mb-3">
          <OptimizedImage src="/images/logo_masclet.png" alt="Masclet Imperi Logo" className="w-full h-full object-contain" priority={true} />
        </div>
        <p className="text-xs md:text-sm text-text-secondary dark:text-gray-300 text-center">Sistema de Gestión Ganadera</p>
      </div>

      {/* Botón para cerrar el sidebar en móvil */}
      {onToggle && (
        <button 
          onClick={onToggle}
          className="md:hidden absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          aria-label="Cerrar sidebar"
        >
          <span className="text-2xl">✕</span>
        </button>
      )}

      {/* Navegación principal */}
      <nav className="p-4 overflow-y-auto h-[calc(100vh-18rem)]">
        {filteredSections.map((section, sectionIndex) => (
          <div key={`sidebar-section-${sectionIndex}`} className="mb-6">
            <h3 className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <li key={`sidebar-item-${sectionIndex}-${itemIndex}`}>
                  <a 
                    href={item.url}
                    className={`flex items-center px-3 md:px-4 py-2.5 md:py-3 rounded-md text-sm transition-colors duration-150 ${
                      isActive(item.url)
                        ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-medium"
                        : "text-text-primary dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-light"
                    }`}
                    onClick={() => {
                      // En dispositivos móviles, cerrar el sidebar al hacer clic
                      if (window.innerWidth < 768 && onToggle) {
                        onToggle();
                      }
                    }}
                  >
                    {renderIcon(item.icon)}
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Pie con información de usuario */}
      <div className="p-3 md:p-4 mt-auto border-t border-gray-100 dark:border-gray-700 absolute bottom-0 w-full bg-white dark:bg-gray-800">
        <div className="flex flex-col space-y-2">
          {/* Rol del usuario */}
          <div className="flex items-center text-xs md:text-sm text-text-secondary dark:text-gray-300 rounded-md p-2 bg-tertiary/10 dark:bg-gray-700">
            <span className="mr-2">👤</span>
            <span className="font-medium">Rol: <span className="text-primary dark:text-primary-light capitalize">{userRole}</span></span>
          </div>
          
          {/* Indicador de versión */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            v1.0.0 - {new Date().getFullYear()} Masclet Imperi
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
