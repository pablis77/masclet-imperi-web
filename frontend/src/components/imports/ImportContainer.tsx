import React, { useState, useEffect } from 'react';
import ImportForm from './ImportForm';
import ImportHistory from './ImportHistory';
import type { ImportResult } from '../../services/importService';

/**
 * Componente contenedor que gestiona el estado compartido entre
 * el formulario de importación y el historial de importaciones
 */
const ImportContainer: React.FC = () => {
  // Estado para controlar la actualización del historial
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Estado para el idioma
  const [currentLang, setCurrentLang] = useState<string>('es');

  // Traducciones
  const translations = {
    es: {
      historyTitle: "Historial de Importaciones"
    },
    ca: {
      historyTitle: "Historial d'Importacions"
    }
  };

  // Efecto para detectar cambios de idioma
  useEffect(() => {
    // Obtener el idioma inicial
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);

    // Función para actualizar el idioma cuando cambia en localStorage
    const handleLangChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };

    // Escuchar cambios
    window.addEventListener('storage', handleLangChange);

    // Limpiar
    return () => {
      window.removeEventListener('storage', handleLangChange);
    };
  }, []);

  // Función que se ejecuta cuando se completa una importación
  const handleImportComplete = (result: ImportResult) => {
    console.log('Importación completada. Actualizando historial...', result);
    // Incrementar el trigger para forzar la recarga del historial
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      {/* Formulario de importación */}
      <ImportForm onImportComplete={handleImportComplete} />
      
      {/* Historial de importaciones con trigger de actualización */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white">
          {translations[currentLang as keyof typeof translations]?.historyTitle || translations.es.historyTitle}
        </h2>
        <ImportHistory refreshTrigger={refreshTrigger} />
      </div>
    </>
  );
};

export default ImportContainer;
