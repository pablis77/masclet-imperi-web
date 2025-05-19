import React, { useEffect, useState } from 'react';
import { GenderChart, StatusChart } from '../components/ChartComponents';
import { StatCard, DashboardCard, CardLabel } from '../components/UIComponents';
import type { DashboardStats } from '../types';
import { t } from '../../../i18n/config';

// Sección de Resumen General extraída directamente del dashboard original
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
            backgroundColor: "#3b82f6",
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t('dashboard.animals_count', currentLang)}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.total}</div>
          </div>
          <div style={{
            backgroundColor: "#10b981",
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
            backgroundColor: "#3b82f6",
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t('dashboard.males', currentLang)} (♂)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.machos}</div>
          </div>
          <div style={{
            backgroundColor: "#ec4899",
            padding: "1rem",
            borderRadius: "0.5rem",
            color: "white"
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t('dashboard.females', currentLang)} (♀)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.hembras}</div>
          </div>
        </div>
        
        {/* No mostramos Ratio aquí ya que irá en Análisis Poblacional */}
      </div>
      
      {/* Tarjeta de estado de amamantamiento */}
      <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.section_nursing_status', currentLang)}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Calculamos la proporción de vacas activas respecto al total */}
          {(() => {
            // Obtenemos el total de animales activos y el total general
            const animalesActivos = statsData.animales.por_estado?.OK || 0;
            const totalAnimales = statsData.animales.total || 0;
            
            // Calculamos la proporción de hembras activas
            const totalHembras = statsData.animales.hembras || 0;
            const propHembrasActivas = totalAnimales > 0 ? animalesActivos / totalAnimales : 0;
            const hembrasActivas = Math.round(totalHembras * propHembrasActivas);
            
            // Calculamos la distribución por alletar solo de vacas activas
            const aletar0Raw = statsData.animales.por_alletar?.['0'] || 0;
            const aletar1Raw = statsData.animales.por_alletar?.['1'] || 0;
            const aletar2Raw = statsData.animales.por_alletar?.['2'] || 0;
            
            const propAletar0 = totalHembras > 0 ? aletar0Raw / totalHembras : 0;
            const propAletar1 = totalHembras > 0 ? aletar1Raw / totalHembras : 0;
            const propAletar2 = totalHembras > 0 ? aletar2Raw / totalHembras : 0;
            
            const aletar0Activas = Math.round(hembrasActivas * propAletar0);
            const aletar1Activas = Math.round(hembrasActivas * propAletar1);
            const aletar2Activas = Math.round(hembrasActivas * propAletar2);
            
            return (
              <>
                <div style={{
                  backgroundColor: "#f59e0b", /* Color ámbar */
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {currentLang === 'ca' ? 'vaques no alletant' : 'vacas no amamantando'}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{aletar0Activas}</div>
                </div>
                
                <div style={{
                  backgroundColor: "#f59e0b", /* Color ámbar */
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {currentLang === 'ca' ? 'vaques alletant 1 vedell' : 'vacas amamantando 1 ternero'}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{aletar1Activas}</div>
                </div>
                
                <div style={{
                  backgroundColor: "#ef4444", /* Color rojo */
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {currentLang === 'ca' ? 'vaques alletant 2 vedells' : 'vacas amamantando 2 terneros'}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{aletar2Activas}</div>
                </div>
              </>
            );
          })()}

        </div>
      </div>
      
      {/* Tarjeta de análisis poblacional */}
      <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.population_analysis', currentLang)}</h3>
        <div className="h-64 flex items-center justify-center">
          <GenderChart 
            data={{
              'Toros': statsData.animales.machos,
              'Vacas': statsData.animales.hembras,
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
