import React from 'react';
import type { FooterProps } from './types';

/**
 * Componente de pie de página con información de versión y controles de accesibilidad
 */
const Footer: React.FC<FooterProps> = ({
  showVersion = true,
  version = "1.0.0"
}) => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);
  const currentYear = new Date().getFullYear();

  // Toggle para el modo de alto contraste
  const toggleHighContrast = () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    
    if (newState) {
      document.documentElement.classList.add('high-contrast-mode');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
      localStorage.setItem('highContrast', 'false');
    }
  };

  // Cargar preferencia guardada al montar el componente
  React.useEffect(() => {
    const savedPreference = localStorage.getItem('highContrast') === 'true';
    setIsHighContrast(savedPreference);
    
    if (savedPreference) {
      document.documentElement.classList.add('high-contrast-mode');
    }
  }, []);

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative z-30">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-col xs:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-300">
          <div className="text-center xs:text-left mb-2 xs:mb-0">
            &copy; {currentYear} Masclet Imperi - Todos los derechos reservados
          </div>
          
          {showVersion && (
            <div className="flex space-x-3 items-center">
              <span className="text-sm">
                Versión {version}
              </span>
              
              {/* Toggle de alto contraste para móvil (visible solo en móvil) */}
              <button 
                onClick={toggleHighContrast}
                className="xs:hidden p-1.5 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label={isHighContrast ? "Desactivar alto contraste" : "Activar alto contraste"}
              >
                <span className="text-xs">👁️</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
