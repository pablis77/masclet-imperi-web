import React, { useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import StatDisplay from '../components/StatDisplay';
import type { DashboardResumen, DashboardStats } from '../types';
import { Pie } from 'react-chartjs-2';

interface ResumenGeneralProps {
  data: DashboardResumen | null;
  loading: boolean;
  error: string | null;
  className?: string;
  statsData?: DashboardStats | null;
}

/**
 * Sección que muestra el resumen general del dashboard
 * Replicando exactamente el formato visual del dashboard original
 */
const ResumenGeneral: React.FC<ResumenGeneralProps> = ({
  data,
  loading,
  error,
  className = '',
  statsData
}) => {
  // Estado para controlar las pestañas activas
  const [activeTab, setActiveTab] = useState<string>('resumen');
  // Formatear números para mejor legibilidad
  const formatNumber = (value: string | number): string => {
    // Convertir a número si es string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Verificar si es un número válido
    return isNaN(numValue) ? '0' : new Intl.NumberFormat('es-ES').format(numValue);
  };
  
  // Calcular tendencia comparando mes actual con anterior
  const calcularTendencia = () => {
    if (!data || !data.tendencias) return null;
    
    const { partos_actual, partos_mes_anterior } = data.tendencias;
    
    if (partos_mes_anterior === 0 || !partos_mes_anterior) return null;
    
    const cambio = ((partos_actual || 0) - partos_mes_anterior) / partos_mes_anterior * 100;
    
    return {
      value: Math.abs(Math.round(cambio)),
      isPositive: cambio >= 0
    };
  };
  
  // Renderizar gráfico de distribución por género
  const renderGenderChart = () => {
    if (!statsData?.animales?.por_estado) return null;
    
    const data = statsData.animales.por_estado;
    const colorMap: Record<string, string> = {
      'M': 'rgba(59, 130, 246, 0.7)', // Azul para machos
      'F': 'rgba(236, 72, 153, 0.7)', // Rosa para hembras
      'OK': 'rgba(16, 185, 129, 0.7)', // Verde para activos
      'DEF': 'rgba(239, 68, 68, 0.7)', // Rojo para fallecidos
    };
    
    const chartData = {
      labels: Object.keys(data).map(key => {
        if (key === 'M') return 'Machos';
        if (key === 'F') return 'Hembras';
        if (key === 'OK') return 'Activos';
        if (key === 'DEF') return 'Fallecidos';
        return key;
      }),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: Object.keys(data).map(key => colorMap[key] || 'rgba(156, 163, 175, 0.7)'),
          borderColor: Object.keys(data).map(key => colorMap[key]?.replace('0.7', '1') || 'rgba(107, 114, 128, 1)'),
          borderWidth: 1,
        },
      ],
    };
    
    return <Pie data={chartData} />
  };

  // Renderizar una tarjeta de estadística con fondo de color
  const renderStatCard = (title: string, value: number | string, color: string) => (
    <div className={`${color} w-full p-3 rounded-lg flex flex-col justify-center mb-2 shadow-sm`}>
      <h3 className="text-white font-bold mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold m-0">{value}</p>
    </div>
  );

  return (
    <DashboardCard 
      title="Resumen General" 
      loading={loading}
      error={error}
      className={`resumen-general ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1: Resumen de Animales */}
        <div className="dashboard-card border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
              className={`flex-1 py-2 px-4 text-center font-medium ${activeTab === 'resumen' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
              onClick={() => setActiveTab('resumen')}
            >
              Resumen de Animales
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-center font-medium ${activeTab === 'alletar' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
              onClick={() => setActiveTab('alletar')}
            >
              Estado de Amamantamiento
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-center font-medium ${activeTab === 'poblacion' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
              onClick={() => setActiveTab('poblacion')}
            >
              Análisis Poblacional
            </button>
          </div>
          
          <div className="p-4">
            {activeTab === 'resumen' && (
              <div className="grid grid-cols-2 gap-3">
                {renderStatCard('Total Animales', data?.total_animales ?? 0, 'bg-blue-500')}
                {renderStatCard('Animales Vivos', statsData?.animales?.por_estado?.['OK'] ?? 0, 'bg-green-500')}
                {renderStatCard('Toros', statsData?.animales?.machos ?? 0, 'bg-indigo-600')}
                {renderStatCard('Vacas', statsData?.animales?.hembras ?? 0, 'bg-purple-500')}
              </div>
            )}
            
            {activeTab === 'alletar' && (
              <div className="flex flex-col gap-3">
                {renderStatCard('Vacas Sin Amamantar', statsData?.animales?.por_alletar?.['0'] ?? 0, 'bg-amber-500')}
                {renderStatCard('Vacas con Un Ternero', statsData?.animales?.por_alletar?.['1'] ?? 0, 'bg-orange-500')}
                {renderStatCard('Vacas con Dos Terneros', statsData?.animales?.por_alletar?.['2'] ?? 0, 'bg-red-500')}
              </div>
            )}
            
            {activeTab === 'poblacion' && (
              <div className="flex justify-center items-center h-44">
                {renderGenderChart()}
                <div className="text-center mt-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ratio Machos/Hembras: {(data && 'ratio_m_h' in data && typeof data.ratio_m_h === 'number') ? data.ratio_m_h.toFixed(2) : '0.00'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Tarjeta 2: Estadísticas de Partos */}
        <div className="dashboard-card border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Estadísticas de Partos</h3>
          <div className="grid grid-cols-1 gap-3">
            <StatDisplay 
              title="Total Partos"
              value={data?.total_partos ?? 0}
              subtitle="Histórico"
              formatter={formatNumber}
            />
            
            <StatDisplay 
              title="Partos Este Mes"
              value={data?.tendencias?.partos_actual ?? 0}
              trend={calcularTendencia() || undefined}
              subtitle={`vs. ${formatNumber(data?.tendencias?.partos_mes_anterior ?? 0)} el mes anterior`}
              formatter={formatNumber}
            />
            
            <StatDisplay 
              title="Tasa de Supervivencia"
              value={(data && 'tasa_supervivencia' in data && typeof data.tasa_supervivencia === 'number') ? data.tasa_supervivencia * 100 : 0}
              subtitle="% de terneros vivos"
              formatter={(val) => `${Number(val).toFixed(1)}%`}
            />
          </div>
        </div>
        
        {/* Tarjeta 3: Métricas Adicionales */}
        <div className="dashboard-card border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Métricas Adicionales</h3>
          <div className="grid grid-cols-1 gap-3">
            <StatDisplay 
              title="Ratio Partos/Animal"
              value={data?.ratio_partos_animal ?? 0}
              subtitle="Media de partos por animal"
              formatter={(val) => Number(val).toFixed(2)}
            />
            
            <StatDisplay 
              title="Total Terneros"
              value={data?.total_terneros ?? 0}
              formatter={formatNumber}
            />
            
            <StatDisplay 
              title="Explotaciones"
              value={data?.explotaciones?.count ?? 0}
              formatter={formatNumber}
            />
            
            <StatDisplay 
              title="Nacimientos Promedio"
              value={data?.tendencias?.nacimientos_promedio ?? 0}
              subtitle="Por mes"
              formatter={(val) => Number(val).toFixed(1)}
            />
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default ResumenGeneral;
