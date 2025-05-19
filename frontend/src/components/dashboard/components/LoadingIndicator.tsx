import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente para mostrar un indicador de carga
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Cargando...', 
  size = 'md',
  className = '' 
}) => {
  // Determinar tamaño del spinner
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];

  // Determinar tamaño del texto
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      <div className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-blue-500`}></div>
      {message && <p className={`mt-2 ${textSize} text-gray-600 dark:text-gray-300`}>{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
