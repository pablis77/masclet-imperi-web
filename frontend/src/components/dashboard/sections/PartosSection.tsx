import React, { useEffect, useState } from 'react';
import { MonthlyChart, GenderCriaChart, TrendChart } from '../components/ChartComponents';
import { StatCard, DashboardCard, CardLabel } from '../components/UIComponents';
import type { DashboardStats, PartosStats } from '../types';
import { t } from '../../../i18n/config';

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
  // Obtener idioma actual del localStorage
  const [currentLang, setCurrentLang] = useState('es');
  
  // Obtener idioma actual cuando se carga el componente
  useEffect(() => {
    const lang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(lang);
    
    // Escuchar cambios en el idioma
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('userLanguage') || 'es';
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  if (loading) {
    return <div className="col-span-12 text-center py-4">{t('dashboard.loading', currentLang)}</div>;
  }
  
  if (error) {
    return (
      <div className="col-span-12 text-center py-4 text-red-500">
        {t('dashboard.loading_error', currentLang)}: {error}
      </div>
    );
  }
  
  if (!statsData || !partosData) {
    return <div className="col-span-12 text-center py-4">{t('common.no_results', currentLang)}</div>;
  }
  
  return (
    <>
      {/* Resumen de Partos */}
      <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.partos_analysis', currentLang)}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <StatCard
            title={t('dashboard.partos_count', currentLang)}
            value={statsData.partos.total}
            color="bg-blue-500"
            darkMode={darkMode}
            translationKey="dashboard.partos_count"
          />
          <StatCard
            title="Maig"
            value={statsData.partos.ultimo_mes}
            color="bg-cyan-500"
            darkMode={darkMode}
          />
        </div>
        
        <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {/* Usamos el mismo valor que mayo para el año 2025 */}
          <StatCard
            title="2025"
            value={statsData.partos.ultimo_mes}
            color="bg-cyan-500"
            darkMode={darkMode}
          />
          <StatCard
            title={currentLang === 'ca' ? "Supervivència" : "Supervivencia"}
            value={`${((statsData.partos.tasa_supervivencia || 0) * 100).toFixed(1)}%`}
            color="bg-emerald-500"
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Distribución Mensual de Partos */}
      <div className="dashboard-card" style={{ gridColumn: "span 8" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.monthly_distribution', currentLang)}</h3>
        <div style={{ height: "300px" }}>
          <MonthlyChart data={statsData.partos.por_mes} darkMode={darkMode} />
        </div>
        <div className="text-xs text-center mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          {currentLang === 'ca' ? `Promig mensual: ${statsData.partos.promedio_mensual.toFixed(1)} parts` : `Promedio mensual: ${statsData.partos.promedio_mensual.toFixed(1)} partos`}
        </div>
      </div>

      {/* Distribución por Género */}
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.gender_distribution', currentLang)}</h3>
        <div style={{ height: "300px", display: "flex", justifyContent: "center" }}>
          <GenderCriaChart data={statsData.partos.por_genero_cria} darkMode={darkMode} />
        </div>
        <div className="text-xs text-center mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          {currentLang === 'ca' ? "Gènere de les cries nascudes" : "Género de las crías nacidas"}
        </div>
        <div className="text-xs text-center mt-1" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          <span style={{ fontSize: '10px', fontStyle: 'italic' }}>
            {currentLang === 'ca' 
              ? `Nota: El gràfic mostra només els parts dins del període seleccionat (${statsData.partos.por_genero_cria?.M || 0} mascles + ${statsData.partos.por_genero_cria?.F || 0} femelles = ${(statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0)}). El total inclou tots els parts històrics (${statsData.partos.total}).`
              : `Nota: El gráfico muestra solo los partos dentro del período seleccionado (${statsData.partos.por_genero_cria?.M || 0} machos + ${statsData.partos.por_genero_cria?.F || 0} hembras = ${(statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0)}). El total incluye todos los partos históricos (${statsData.partos.total}).`
            }
          </span>
        </div>
      </div>

      {/* Evolución Anual */}
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.yearly_distribution', currentLang)}</h3>
        <div style={{ height: "300px" }}>
          <TrendChart data={statsData.partos.distribucion_anual} darkMode={darkMode} />
        </div>
        <div className="text-xs text-center mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          {currentLang === 'ca' ? "Tendència de parts al llarg del temps" : "Tendencia de partos a lo largo del tiempo"}
        </div>
      </div>
    </>
  );
};

export default PartosSection;
