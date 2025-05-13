import React, { useState } from 'react';
import ImportForm from './ImportForm';
import type { ImportResult } from '../../services/importService';

/**
 * Componente contenedor que gestiona el estado compartido entre
 * el formulario de importación y el historial de importaciones
 */
const ImportContainer: React.FC = () => {
  // Estado para controlar la actualización del historial
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

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
      
      {/* Historial de importaciones - Temporalmente deshabilitado */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white">
          Historial de Importaciones
          <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-normal">(Próximamente)</span>
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Historial de importaciones</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Esta funcionalidad estará disponible en próximas actualizaciones.
          </p>
        </div>
      </div>
    </>
  );
};

export default ImportContainer;
