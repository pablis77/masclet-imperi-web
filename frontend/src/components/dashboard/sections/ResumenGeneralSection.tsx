import React, { useEffect, useState } from 'react';
import { GenderChart, StatusChart } from '../components/ChartComponents';
import { StatCard, DashboardCard, CardLabel } from '../components/UIComponents';
import type { DashboardStats } from '../types';
import { t } from '../../../i18n/config';

// Definir colores constantes para reutilización
const COLORS = {
  TOTAL: "#8b5cf6",      // Morado
  ACTIVE: "#10b981",     // Verde
  MALES: "#3b82f6",      // Azul
  FEMALES: "#ec4899",    // Rosa
  NURSING_0: "#f59e0b",  // Ámbar
  NURSING_1: "#06b6d4",  // Cyan
  NURSING_2: "#ef4444"    // Rojo
};

// Sección de Resumen General extraída directamente del dashboard original SOLO SON VALI
// EXACTAMENTE con la misma estructura visual
interface ResumenGeneralSectionProps {
  statsData: DashboardStats | null;
  darkMode: boolean;
  loading: boolean;
  error: string | null;
}

const ResumenGeneralSection: React.FC<ResumenGeneralSectionProps> = ({ 
  statsData, 
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
  
  if (!statsData) {
    return <div className="col-span-12 text-center py-4">No hay datos disponibles</div>;
  }
  
  return (
    <>
      {/* Tarjeta de resumen de animales */}
      <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.section_animals_summary', currentLang)}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div style={{
            backgroundColor: COLORS.TOTAL,
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t('dashboard.animals_count', currentLang)}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.total}</div>
          </div>
          <div style={{
            backgroundColor: COLORS.ACTIVE,
            padding: "1rem", 
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t('dashboard.active_animals', currentLang)}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {statsData.animales.por_estado?.OK || 0}
            </div>
          </div>
          <div style={{
            backgroundColor: COLORS.MALES,
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t('dashboard.males', currentLang)} activos (♂)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {/* Usar el contador directo de machos activos del backend */}
              {statsData.animales.machos_activos || 0}
            </div>
          </div>
          <div style={{
            backgroundColor: COLORS.FEMALES,
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t('dashboard.females', currentLang)} activas (♀)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {/* Usar el contador directo de hembras activas del backend */}
              {statsData.animales.hembras_activas || 0}
            </div>
          </div>
        </div>
        
        {/* No mostramos Ratio aquí ya que irá en Análisis Poblacional */}
      </div>
      
      {/* Tarjeta de estado de amamantamiento */}
      <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.section_nursing_status', currentLang)}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Mostramos directamente los valores de por_alletar */}
          <div style={{
            backgroundColor: COLORS.NURSING_0,
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
              {currentLang === 'ca' ? 'vaques no alletant' : 'vacas no amamantando'}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {statsData.animales.por_alletar?.['0'] || 0}
            </div>
          </div>
          
          <div style={{
            backgroundColor: COLORS.NURSING_1,
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
              {currentLang === 'ca' ? 'vaques alletant 1 vedell' : 'vacas amamantando 1 ternero'}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {statsData.animales.por_alletar?.['1'] || 0}
            </div>
          </div>
          
          <div style={{
            backgroundColor: COLORS.NURSING_2,
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
              {currentLang === 'ca' ? 'vaques alletant 2 vedells' : 'vacas amamantando 2 terneros'}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {statsData.animales.por_alletar?.['2'] || 0}
            </div>
          </div>

        </div>
      </div>
      
      {/* Tarjeta de análisis poblacional */}
      <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.population_analysis', currentLang)} (Total)</h3>
        <div className="h-64 flex items-center justify-center">
          <GenderChart 
            data={{
              // Datos de toros y vacas (activos)
              'Toros': (() => {
                const totalAnimales = statsData.animales.total || 0;
                const animalesActivos = statsData.animales.por_estado?.OK || 0;
                const totalMachos = statsData.animales.machos || 0;
                const propActivos = totalAnimales > 0 ? animalesActivos / totalAnimales : 0;
                return Math.round(totalMachos * propActivos);
              })(),
              'Vacas': statsData.animales.hembras_activas || 0,  // Usar el contador de hembras activas
              // Fallecidos global (no separado por tipo)
              'Fallecidos': statsData.animales.por_estado?.DEF || 0
            }}
            darkMode={darkMode}
          />
        </div>
        <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.875rem", color: darkMode ? "#9ca3af" : "#6b7280" }}>
          {t('dashboard.male_female_ratio', currentLang)}: <span style={{ fontWeight: "bold" }}>{statsData.animales.ratio_m_h.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
};

export default ResumenGeneralSection;
