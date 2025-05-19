import React from 'react';
import DashboardCard from '../components/DashboardCard';
import StatDisplay from '../components/StatDisplay';
import GenderChart from '../charts/GenderChart';
import MonthlyDistributionChart from '../charts/MonthlyDistributionChart';
import YearlyDistributionChart from '../charts/YearlyDistributionChart';
import type { PartosStats } from '../../dashboard/types';

interface PartosAnalisisProps {
  data: PartosStats | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

/**
 * Sección que muestra el análisis detallado de partos
 */
const PartosAnalisis: React.FC<PartosAnalisisProps> = ({
  data,
  loading,
  error,
  className = ''
}) => {
  // Formatear números para mejor legibilidad
  const formatNumber = (value: string | number): string => {
    // Convertir a número si es string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Verificar si es un número válido
    return isNaN(numValue) ? '0' : new Intl.NumberFormat('es-ES').format(numValue);
  };
  
  // Formatear porcentajes
  const formatPercent = (value: string | number): string => {
    // Convertir a número si es string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Verificar si es un número válido
    return isNaN(numValue) ? '0%' : `${numValue.toFixed(1)}%`;
  };
  
  return (
    <DashboardCard 
      title="Análisis de Partos" 
      loading={loading}
      error={error}
      className={`partos-analisis ${className}`}
    >
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <StatDisplay 
          title="Total Partos"
          value={data?.total ?? 0}
          formatter={formatNumber}
        />
        
        <StatDisplay 
          title="Partos Último Mes"
          value={data?.ultimo_mes ?? 0}
          formatter={formatNumber}
        />
        
        <StatDisplay 
          title="Partos Último Año"
          value={data?.ultimo_año ?? 0}
          formatter={formatNumber}
        />
        
        <StatDisplay 
          title="Tasa de Supervivencia"
          value={(data?.tasa_supervivencia ?? 0) * 100}
          formatter={formatPercent}
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Distribución por género */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
            Distribución por Género
          </h4>
          <GenderChart 
            data={data?.por_genero_cria ?? {}} 
            title="" 
          />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="text-blue-600 dark:text-blue-400">
              <div className="text-lg font-bold">{data?.por_genero_cria?.M ?? 0}</div>
              <div className="text-xs">Machos</div>
            </div>
            <div className="text-pink-600 dark:text-pink-400">
              <div className="text-lg font-bold">{data?.por_genero_cria?.F ?? 0}</div>
              <div className="text-xs">Hembras</div>
            </div>
            <div className="text-yellow-600 dark:text-yellow-400">
              <div className="text-lg font-bold">{data?.por_genero_cria?.esforrada ?? 0}</div>
              <div className="text-xs">Otros</div>
            </div>
          </div>
        </div>
        
        {/* Distribución mensual */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg lg:col-span-2">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
            Distribución Mensual
          </h4>
          <MonthlyDistributionChart 
            data={data?.por_mes ?? {}} 
            title=""
            height={250}
          />
        </div>
      </div>
      
      {/* Distribución anual */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-3">
          Evolución Anual
        </h4>
        <YearlyDistributionChart 
          data={data?.distribucion_anual ?? {}} 
          title=""
          height={250}
        />
      </div>
    </DashboardCard>
  );
};

export default PartosAnalisis;
