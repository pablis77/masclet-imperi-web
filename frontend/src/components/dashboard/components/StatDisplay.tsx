import React from 'react';

interface StatDisplayProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  formatter?: (value: number | string) => string;
}

/**
 * Componente para mostrar una estadística individual
 * Incluye soporte para título, valor, subtítulo, icono y tendencia
 */
const StatDisplay: React.FC<StatDisplayProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  formatter = (val) => val.toString()
}) => {
  // Determinar si el valor es un número
  const isNumeric = !isNaN(Number(value));
  
  // Formatear el valor si es numérico y hay un formateador
  const displayValue = isNumeric ? formatter(value) : value;

  return (
    <div className={`stat-display p-3 rounded-lg ${className}`}>
      <div className="flex justify-between items-start">
        <div className="stat-info">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{displayValue}</span>
            {trend && (
              <span 
                className={`ml-2 text-sm font-medium ${
                  trend.isPositive 
                    ? 'text-green-500 dark:text-green-400' 
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="stat-icon text-blue-500 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatDisplay;
