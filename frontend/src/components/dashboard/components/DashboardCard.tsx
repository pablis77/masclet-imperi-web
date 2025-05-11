import React from 'react';
import type { ReactNode } from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  footerContent?: ReactNode;
}

/**
 * Componente reutilizable para mostrar una tarjeta en el dashboard
 * Incluye manejo de estados de carga y error
 */
const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  subtitle,
  children, 
  className = '', 
  loading = false,
  error = null,
  footerContent
}) => {
  return (
    <div className={`dashboard-card p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div className="card-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
