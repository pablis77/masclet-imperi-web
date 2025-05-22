/**
 * AnalisisPoblacionalCard.tsx
 * ======================
 * [DASHBOARDV2] Componente para mostrar el análisis poblacional de animales en el dashboard v2.
 * Muestra la distribución por edades y por estado.
 * 
 * Este componente es parte de la nueva implementación del dashboard (v2) que
 * proporciona una vista más modular y fácil de mantener de la distribución poblacional
 * de los animales, agrupados por edades y estados.
 */

import React from 'react';
import type { DashboardStats } from '../../dashboard/types/dashboard';

interface AnalisisPoblacionalCardProps {
  statsData: DashboardStats | null;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
}

const AnalisisPoblacionalCard: React.FC<AnalisisPoblacionalCardProps> = ({ 
  statsData, 
  loading, 
  error, 
  darkMode 
}) => {
  // Valores por defecto
  const edades = statsData?.animales?.por_edad || {
    menos_1_año: 0,
    "1_2_años": 0,
    "2_5_años": 0,
    mas_5_años: 0
  };
  
  const estados = statsData?.animales?.por_estado || {
    OK: 0,
    DEF: 0
  };

  // Estilo de tarjeta base
  const cardStyle = {
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '0.5rem',
    padding: '1rem',
    height: '100%',
    backgroundColor: darkMode ? '#1F2937' : 'white',
    color: darkMode ? 'white' : 'black'
  };

  // Estilo para indicadores numéricos
  const statCardStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    marginBottom: '0.5rem',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  // Función para renderizar una tarjeta de estadística
  const renderStatCard = (title: string, value: number, bgColor: string) => (
    <div className={bgColor} style={statCardStyle}>
      <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem' }}>
        {title}
      </h3>
      <p style={{ color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
        {loading ? '...' : value}
      </p>
    </div>
  );

  // Función para renderizar una sección con título
  const renderSection = (title: string) => (
    <div className="mt-4 mb-2">
      <h3 className="text-sm font-semibold" style={{ color: darkMode ? '#D1D5DB' : '#4B5563' }}>
        {title}
      </h3>
      <div className="w-full h-px bg-gray-300 dark:bg-gray-700 my-1"></div>
    </div>
  );

  return (
    <div style={cardStyle}>
      <h3 className="text-md font-semibold p-2">Análisis Poblacional</h3>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && !loading && (
        <div className="text-red-500 p-4 text-center">
          Error: {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          {renderSection('Distribución por Edades')}
          
          {renderStatCard('< 1 año', edades.menos_1_año, 'bg-indigo-500')}
          {renderStatCard('1-2 años', edades['1_2_años'], 'bg-indigo-400')}
          {renderStatCard('2-5 años', edades['2_5_años'], 'bg-indigo-300')}
          {renderStatCard('> 5 años', edades.mas_5_años, 'bg-indigo-200')}
          
          {renderSection('Estado de Animales')}
          
          {renderStatCard('Activos (OK)', estados.OK, 'bg-green-500')}
          {renderStatCard('Fallecidos (DEF)', estados.DEF, 'bg-red-500')}
        </>
      )}
    </div>
  );
};

export default AnalisisPoblacionalCard;
