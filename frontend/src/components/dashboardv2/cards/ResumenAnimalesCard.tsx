/**
 * ResumenAnimalesCard.tsx
 * ======================
 * [DASHBOARDV2] Componente para mostrar el resumen de animales en el dashboard v2.
 * Muestra el total de animales, toros activos, toros fallecidos, 
 * vacas activas y vacas fallecidas.
 * 
 * Este componente es parte de la nueva implementación del dashboard (v2) que
 * proporciona una vista más modular y fácil de mantener del estado de los animales.
 */

import React from 'react';
import type { DashboardStats } from '../../dashboard/types/dashboard';

interface ResumenAnimalesCardProps {
  statsData: DashboardStats | null;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
}

const ResumenAnimalesCard: React.FC<ResumenAnimalesCardProps> = ({ 
  statsData, 
  loading, 
  error, 
  darkMode 
}) => {
  // Valores por defecto
  const animales = statsData?.animales || {
    total: 0,
    toros_activos: 0,
    toros_fallecidos: 0,
    vacas_activas: 0,
    vacas_fallecidas: 0
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

  return (
    <div style={cardStyle}>
      <h3 className="text-md font-semibold p-2">Resumen de Animales</h3>
      
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
          {renderStatCard('Total de animales', animales.total, 'bg-purple-500')}
          {renderStatCard('Toros activos', animales.toros_activos, 'bg-blue-500')}
          {renderStatCard('Toros fallecidos', animales.toros_fallecidos, 'bg-red-500')}
          {renderStatCard('Vacas activas', animales.vacas_activas, 'bg-pink-500')}
          {renderStatCard('Vacas fallecidas', animales.vacas_fallecidas, 'bg-orange-500')}
        </>
      )}
    </div>
  );
};

export default ResumenAnimalesCard;
