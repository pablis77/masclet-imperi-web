import React from 'react';
import { Card } from '../ui';

interface StatusData {
  label: string;
  value: number;
  color: string;
}

interface StatusDistributionProps {
  data: StatusData[];
  title?: string;
  className?: string;
}

/**
 * Componente para mostrar la distribución por estado de los animales
 */
const StatusDistribution: React.FC<StatusDistributionProps> = ({
  data,
  title = 'Distribución por estado',
  className = '',
}) => {
  // Calcular el total para los porcentajes
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={`${className} h-full`}>
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">{title}</h3>
        
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3 sm:py-4">
            No hay datos disponibles
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Gráfico visual */}
            <div className="flex h-6 sm:h-8 rounded-md overflow-hidden">
              {data.map((item, index) => (
                <div 
                  key={`status-bar-${index}`}
                  className="h-full transition-all duration-500 ease-in-out"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${(item.value / total) * 100}%` 
                  }}
                  title={`${item.label}: ${item.value} (${((item.value / total) * 100).toFixed(1)}%)`}
                />
              ))}
            </div>
            
            {/* Leyenda */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {data.map((item, index) => (
                <div key={`status-legend-${index}`} className="flex items-center">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm mr-2 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatusDistribution;
