import React from 'react';

interface LoadingStateProps {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  children?: React.ReactNode;
  loadingMessage?: string;
  onRetry?: (() => void) | null;
  message?: string;
}

/**
 * Componente para mostrar diferentes estados de carga
 * @returns {React.ReactElement}
 */
export default function LoadingState({ 
  isLoading = false, 
  isError = false, 
  errorMessage = 'Ha ocurrido un error al cargar los datos.', 
  children, 
  loadingMessage = 'Cargando datos...',
  onRetry = null,
  message
}: LoadingStateProps) {
  // Si se proporciona un mensaje simple, mostrar solo el estado de carga con ese mensaje
  if (message) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-center">{message}</p>
      </div>
    );
  }
  
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
