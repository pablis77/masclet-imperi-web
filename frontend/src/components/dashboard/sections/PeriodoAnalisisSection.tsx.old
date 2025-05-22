import React from 'react';
import { DashboardCard } from '../components/UIComponents';

// Sección de Período de Análisis extraída directamente del dashboard original
// EXACTAMENTE con la misma estructura visual
interface PeriodoAnalisisSectionProps {
  fechaInicio: string;
  fechaFin: string;
  setFechaInicio: (fecha: string) => void;
  setFechaFin: (fecha: string) => void;
  onFilterChange: () => void;
  darkMode: boolean;
}

const PeriodoAnalisisSection: React.FC<PeriodoAnalisisSectionProps> = ({ 
  fechaInicio, 
  fechaFin, 
  setFechaInicio, 
  setFechaFin, 
  onFilterChange,
  darkMode
}) => {
  return (
    <DashboardCard 
      title="Período de Análisis" 
      darkMode={darkMode}
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label 
            htmlFor="fecha_inicio" 
            className="block mb-2 text-sm font-medium"
            style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}
          >
            Fecha de inicio
          </label>
          <input 
            type="date" 
            id="fecha_inicio"
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full p-2 text-sm rounded-md"
            style={{
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#f9fafb' : '#111827',
              border: darkMode ? '1px solid #374151' : '1px solid #d1d5db'
            }}
          />
        </div>
        <div className="flex-1">
          <label 
            htmlFor="fecha_fin" 
            className="block mb-2 text-sm font-medium"
            style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}
          >
            Fecha de fin
          </label>
          <input 
            type="date" 
            id="fecha_fin"
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full p-2 text-sm rounded-md"
            style={{
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#f9fafb' : '#111827',
              border: darkMode ? '1px solid #374151' : '1px solid #d1d5db'
            }}
          />
        </div>
        <button 
          onClick={onFilterChange}
          className="px-4 py-2 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
          style={{ 
            minWidth: '120px',
            marginBottom: '1px' // Para alinear bien con los inputs
          }}
        >
          Aplicar Filtros
        </button>
      </div>
    </DashboardCard>
  );
};

export default PeriodoAnalisisSection;
