import React from 'react';
import { MonthlyChart, GenderCriaChart, TrendChart } from '../components/ChartComponents';
import { StatCard, DashboardCard, CardLabel } from '../components/UIComponents';
import type { DashboardStats, PartosStats } from '../types';

// Sección de Partos extraída directamente del dashboard original
// EXACTAMENTE con la misma estructura visual
interface PartosSectionProps {
  statsData: DashboardStats | null;
  partosData: PartosStats | null;
  darkMode: boolean;
  loading: boolean;
  error: string | null;
}

const PartosSection: React.FC<PartosSectionProps> = ({ 
  statsData, 
  partosData,
  darkMode, 
  loading, 
  error 
}) => {
  if (loading) {
    return <div className="col-span-12 text-center py-4">Cargando análisis de partos...</div>;
  }
  
  if (error) {
    return (
      <div className="col-span-12 text-center py-4 text-red-500">
        Error al cargar estadísticas de partos: {error}
      </div>
    );
  }
  
  if (!statsData || !partosData) {
    return <div className="col-span-12 text-center py-4">No hay datos de partos disponibles</div>;
  }
  
  return (
    <>
      {/* Resumen de Partos */}
      <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
        <h3 className="text-lg font-semibold mb-4">Resumen de Partos</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <StatCard
            title="Total Partos"
            value={statsData.partos.total}
            color="bg-blue-500"
            darkMode={darkMode}
          />
          <StatCard
            title="mayo"
            value={statsData.partos.ultimo_mes}
            color="bg-cyan-500"
            darkMode={darkMode}
          />
        </div>
        
        <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <StatCard
            title="2025"
            value={statsData.partos.ultimo_mes}
            color="bg-cyan-500"
            darkMode={darkMode}
          />
          <StatCard
            title="Supervivencia"
            value={`${((statsData.partos.tasa_supervivencia || 0) * 100).toFixed(1)}%`}
            color="bg-emerald-500"
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Distribución Mensual de Partos */}
      <div className="dashboard-card" style={{ gridColumn: "span 8" }}>
        <h3 className="text-lg font-semibold mb-4">Distribución Mensual de Partos</h3>
        <div style={{ height: "300px" }}>
          <MonthlyChart data={statsData.partos.por_mes} darkMode={darkMode} />
        </div>
        <div className="text-xs text-center mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          Promedio mensual: {statsData.partos.promedio_mensual.toFixed(1)} partos
        </div>
      </div>

      {/* Distribución por Género */}
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
        <h3 className="text-lg font-semibold mb-4">Distribución por Género</h3>
        <div style={{ height: "300px", display: "flex", justifyContent: "center" }}>
          <GenderCriaChart data={statsData.partos.por_genero_cria} darkMode={darkMode} />
        </div>
        <div className="text-xs text-center mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          Género de las crías nacidas
        </div>
      </div>

      {/* Evolución Anual */}
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
        <h3 className="text-lg font-semibold mb-4">Evolución Anual</h3>
        <div style={{ height: "300px" }}>
          <TrendChart data={statsData.partos.distribucion_anual} darkMode={darkMode} />
        </div>
        <div className="text-xs text-center mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          Tendencia de partos a lo largo del tiempo
        </div>
      </div>
    </>
  );
};

export default PartosSection;
