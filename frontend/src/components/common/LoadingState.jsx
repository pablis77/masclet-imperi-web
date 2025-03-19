import React from 'react';

/**
 * Componente para mostrar diferentes estados de carga
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isLoading - Indica si está cargando
 * @param {boolean} props.isError - Indica si hay un error
 * @param {string} props.errorMessage - Mensaje de error
 * @param {React.ReactNode} props.children - Contenido a mostrar cuando no está cargando
 * @param {string} props.loadingMessage - Mensaje de carga personalizado
 * @param {Function} props.onRetry - Función para reintentar la carga
 * @returns {React.ReactElement}
 */
export default function LoadingState({ 
  isLoading = false, 
  isError = false, 
  errorMessage = 'Ha ocurrido un error al cargar los datos.', 
  children, 
  loadingMessage = 'Cargando datos...',
  onRetry = null
}) {
  // Si está cargando, mostrar el estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-center">{loadingMessage}</p>
      </div>
    );
  }
  
  // Si hay un error, mostrar el mensaje de error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-red-500">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Error de conexión</h3>
        <p className="text-gray-700 dark:text-gray-300 text-center mb-4">{errorMessage}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }
  
  // Si no está cargando ni hay error, mostrar el contenido
  return children;
}
