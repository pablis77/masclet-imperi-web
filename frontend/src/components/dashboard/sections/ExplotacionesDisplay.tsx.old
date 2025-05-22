import React from 'react';
import DashboardCard from '../components/DashboardCard';
import type { ExplotacionInfo } from '../types';

interface ExplotacionesDisplayProps {
  data: ExplotacionInfo[];
  loading: boolean;
  error: string | null;
  className?: string;
}

/**
 * Sección que muestra información sobre las explotaciones
 */
const ExplotacionesDisplay: React.FC<ExplotacionesDisplayProps> = ({
  data,
  loading,
  error,
  className = ''
}) => {
  // Formatear números para mejor legibilidad
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return '0';
    return new Intl.NumberFormat('es-ES').format(value);
  };
  
  return (
    <DashboardCard 
      title="Explotaciones" 
      loading={loading}
      error={error}
      className={`explotaciones-display ${className}`}
    >
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay información disponible sobre explotaciones.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Explotación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Animales
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Partos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ratio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {data.map((explotacion, index) => {
                // Calcular ratio de partos por animal
                const total_animales = explotacion.total_animales || 0;
                const total_partos = explotacion.total_partos || 0;
                const ratio = total_animales > 0 ? (total_partos / total_animales).toFixed(2) : '0.00';
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {explotacion.explotacio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {explotacion.nombre || 'Sin nombre'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      {formatNumber(explotacion.total_animales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                      {formatNumber(explotacion.total_partos)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right font-medium">
                      {ratio}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
};

export default ExplotacionesDisplay;
