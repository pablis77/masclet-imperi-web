/**
 * EstadoAmamantamientoCard.tsx
 * ======================
 * [DASHBOARDV2] Componente para mostrar el estado de amamantamiento de las vacas en el dashboard v2.
 * Muestra la distribución de vacas según su estado de amamantamiento:
 * - Sin amamantar (0)
 * - 1 ternero (1)
 * - 2 terneros (2)
 * 
 * Este componente es parte de la nueva implementación del dashboard (v2) que
 * proporciona una vista más modular y fácil de mantener del estado de amamantamiento.
 */

import React from 'react';
import type { DashboardStats } from '../../dashboard/types/dashboard';

interface EstadoAmamantamientoCardProps {
  statsData: DashboardStats | null;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
}

const EstadoAmamantamientoCard: React.FC<EstadoAmamantamientoCardProps> = ({ 
  statsData, 
  loading, 
  error, 
  darkMode 
}) => {
  // Valores por defecto
  const por_alletar = statsData?.animales?.por_alletar || {
    0: 0,
    1: 0,
    2: 0
  };
  
  // Total de terneros amamantando (igual al número de vacas con 1 ternero + 2 veces el número de vacas con 2 terneros)
  const totalTerneros = por_alletar[1] + (por_alletar[2] * 2);

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

  return (
    <div style={cardStyle}>
      <h3 className="text-md font-semibold p-2">Estado de Amamantamiento</h3>
      
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
          {renderStatCard('Sin amamantar (0)', por_alletar[0], 'bg-gray-500')}
          {renderStatCard('1 ternero (1)', por_alletar[1], 'bg-green-500')}
          {renderStatCard('2 terneros (2)', por_alletar[2], 'bg-yellow-500')}
          {renderStatCard('Total de terneros', totalTerneros, 'bg-teal-500')}
          
          {/* Espacio adicional para mantener la misma altura que la tarjeta de Resumen de Animales */}
          <div style={{ height: '90px' }}></div>
        </>
      )}
    </div>
  );
};

export default EstadoAmamantamientoCard;
