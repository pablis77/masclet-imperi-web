import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { Pie, Bar, Line } from 'react-chartjs-2';
import type { DashboardStats, AnimalStats } from '../types';

interface AnimalesAnalisisProps {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  darkMode?: boolean;
  className?: string;
}

/**
 * Sección que muestra análisis detallado de los animales
 */
const AnimalesAnalisis: React.FC<AnimalesAnalisisProps> = ({
  data,
  loading,
  error,
  darkMode = false,
  className = ''
}) => {
  // Formatear números para mejor legibilidad
  const formatNumber = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0' : new Intl.NumberFormat('es-ES').format(numValue);
  };

  // Extraer datos de animales para facilitar el acceso
  const animalesData = data?.animales;
  
  return (
    <div className={`animales-analisis grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Distribución por Género */}
      <DashboardCard
        title="Distribución por Género"
        loading={loading}
        error={error}
      >
        {animalesData && (
          <div className="flex flex-col items-center">
            <div className="stats-container grid grid-cols-2 gap-4 w-full mb-4">
              <div className="stat-item">
                <div className="text-2xl font-bold">{formatNumber(animalesData.machos)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Machos</div>
              </div>
              <div className="stat-item">
                <div className="text-2xl font-bold">{formatNumber(animalesData.hembras)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Hembras</div>
              </div>
            </div>
            <div className="chart-container h-56 w-full">
              <div className="flex justify-center h-full">
                <div className="w-56 h-56">
                  <Pie 
                    data={{
                      labels: ['Machos', 'Hembras'],
                      datasets: [
                        {
                          data: [animalesData.machos, animalesData.hembras],
                          backgroundColor: ['#0891b2', '#be185d'],
                          borderColor: darkMode ? '#111827' : '#ffffff',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Distribución por Estado */}
      <DashboardCard
        title="Distribución por Estado"
        loading={loading}
        error={error}
      >
        {animalesData?.por_estado && Object.keys(animalesData.por_estado).length > 0 && (
          <div className="flex flex-col items-center h-full justify-center">
            <div className="chart-container w-full h-56">
              <Pie 
                data={{
                  labels: Object.keys(animalesData.por_estado),
                  datasets: [
                    {
                      data: Object.values(animalesData.por_estado),
                      backgroundColor: [
                        '#0891b2', // cian para OK
                        '#be185d', // rosa para DEF
                        '#4f46e5', // indigo para otros posibles estados
                        '#d97706', // ámbar
                        '#84cc16', // lima
                      ],
                      borderColor: darkMode ? '#111827' : '#ffffff',
                      borderWidth: 1
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Distribución por Estado de Amamantamiento (sólo para vacas) */}
      <DashboardCard
        title="Estado de Amamantamiento"
        subtitle="Sólo para vacas (hembras)"
        loading={loading}
        error={error}
      >
        {animalesData?.por_alletar && Object.keys(animalesData.por_alletar).length > 0 && (
          <div className="flex flex-col items-center">
            <div className="chart-container w-full h-56">
              <Pie 
                data={{
                  labels: [
                    'Sin amamantar (0)',
                    'Amamantando (1)',
                    'Amamantando doble (2)'
                  ],
                  datasets: [
                    {
                      data: [
                        animalesData.por_alletar['0'] || 0,
                        animalesData.por_alletar['1'] || 0,
                        animalesData.por_alletar['2'] || 0
                      ],
                      backgroundColor: [
                        '#84cc16', // lima para sin amamantar
                        '#0891b2', // cian para amamantando
                        '#4f46e5', // indigo para amamantando doble
                      ],
                      borderColor: darkMode ? '#111827' : '#ffffff',
                      borderWidth: 1
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Distribución por Quadra */}
      <DashboardCard
        title="Distribución por Quadra"
        loading={loading}
        error={error}
      >
        {animalesData?.por_quadra && Object.keys(animalesData.por_quadra).length > 0 && (
          <div className="flex flex-col items-center">
            <div className="chart-container w-full h-56">
              <Bar 
                data={{
                  labels: Object.keys(animalesData.por_quadra),
                  datasets: [
                    {
                      label: 'Animales',
                      data: Object.values(animalesData.por_quadra),
                      backgroundColor: '#0891b2',
                      borderColor: '#0891b2',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default AnimalesAnalisis;
