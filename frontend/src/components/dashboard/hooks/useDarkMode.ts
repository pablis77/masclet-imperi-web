import { useState, useEffect, useCallback } from 'react';
import { ThemeState } from '../types';

/**
 * Hook personalizado para gestionar el tema oscuro
 * Sincroniza el estado con la clase 'dark' en el elemento html
 */
export const useDarkMode = (): ThemeState => {
  // Estado para el tema
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Efecto para sincronizar con el tema global al cargar
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
    
    // Observar cambios en el tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Función para cambiar el tema
  const toggleTheme = useCallback(() => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, [darkMode]);

  return { darkMode, toggleTheme };
};

export default useDarkMode;
