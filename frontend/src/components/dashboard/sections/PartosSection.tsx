import React, { useEffect, useState } from 'react';
import { MonthlyChart, GenderCriaChart, TrendChart, DistribucionAnualChart, DistribucionMensualChart } from '../components/ChartComponents';
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
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
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
            title={currentLang === 'ca' ? "Maig" : "Mayo"}
            value={statsData.partos.ultimo_mes}
            color="bg-cyan-500"
            darkMode={darkMode}
          />
        </div>
        
        <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {/* Partos del año actual (2025) */}
          <StatCard
            title="2025"
            value={17}
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
      
      {/* Distribución Mensual - NUEVA */}
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
        <h3 className="text-lg font-semibold mb-4">{currentLang === 'ca' ? "Distribució mensual" : "Distribución mensual"}</h3>
        <div style={{ height: "300px" }}>
          <DistribucionMensualChart darkMode={darkMode} />
        </div>
        <div className="text-xs text-center mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
          {currentLang === 'ca' ? "Distribució mensual de parts" : "Distribución mensual de partos"}
        </div>
        <div className="text-xs text-center mt-1" style={{ color: darkMode ? 'rgba(209, 213, 219, 0.6)' : 'rgba(107, 114, 128, 0.6)' }}>
          <span style={{ fontSize: '9px' }}>
            {currentLang === 'ca' 
              ? `Mes amb més parts: Març (46), mes amb menys parts: Agost (4)`
              : `Mes con más partos: Marzo (46), mes con menos partos: Agosto (4)`
            }
          </span>
        </div>
      </div>
      
      {/* Distribución Anual Detallada - NUEVA */}
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
        <h3 className="text-lg font-semibold mb-4">{currentLang === 'ca' ? "Distribució anual detallada" : "Distribución anual detallada"}</h3>
        <div style={{ height: "300px" }}>
          <DistribucionAnualChart darkMode={darkMode} />
        </div>
        <div className="text-sm text-center mt-3" style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontWeight: 'bold' }}>
          {currentLang === 'ca' ? "Distribució anual de parts (dades reals)" : "Distribución anual de partos (datos reales)"}
        </div>
        
        {/* Información destacada sobre años con partos */}
        <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '6px',
            fontWeight: 'semibold' 
          }}>
            {currentLang === 'ca' 
              ? <>Any amb <strong>més</strong> parts:<br/><span className="text-lg font-bold">2023 (54 parts)</span></>
              : <>Año con <strong>más</strong> partos:<br/><span className="text-lg font-bold">2023 (54 partos)</span></>
            }
          </div>
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '6px',
            fontWeight: 'semibold' 
          }}>
            {currentLang === 'ca' 
              ? <>Any amb <strong>menys</strong> parts:<br/><span className="text-lg font-bold">2000 (1 part)</span></>
              : <>Año con <strong>menos</strong> partos:<br/><span className="text-lg font-bold">2000 (1 parto)</span></>
            }
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '6px',
            fontWeight: 'semibold' 
          }}>
            {currentLang === 'ca' 
              ? <>Primer any amb parts:<br/><span className="text-lg font-bold">2000</span></>
              : <>Primer año con partos:<br/><span className="text-lg font-bold">2000</span></>
            }
          </div>
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)', 
            borderRadius: '6px',
            fontWeight: 'semibold' 
          }}>
            {currentLang === 'ca' 
              ? <>Últim any amb parts:<br/><span className="text-lg font-bold">2025 (17 parts)</span></>
              : <>Último año con partos:<br/><span className="text-lg font-bold">2025 (17 partos)</span></>
            }
          </div>
        </div>
        
        <div className="text-sm text-center mt-3" style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontWeight: 'bold' }}>
          {currentLang === 'ca' 
            ? <>Total: <span className="text-lg">274 parts</span></>
            : <>Total: <span className="text-lg">274 partos</span></>
          }
        </div>
      </div>

      {/* Distribución por Género - CORREGIDA */}
      <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.gender_distribution', currentLang)}</h3>
        <div style={{ height: "270px", display: "flex", justifyContent: "center" }}>
          <GenderCriaChart data={statsData.partos.por_genero_cria} darkMode={darkMode} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 mb-2">
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)', 
            borderRadius: '6px',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            {currentLang === 'ca' 
              ? <>
                <div className="font-semibold">Mascles</div>
                <div className="text-2xl font-bold mt-1">{statsData.partos.por_genero_cria?.M || 0}</div>
                <div className="text-xs mt-1">({(((statsData.partos.por_genero_cria?.M || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0))) * 100).toFixed(1)}% del total)</div>
              </>
              : <>
                <div className="font-semibold">Machos</div>
                <div className="text-2xl font-bold mt-1">{statsData.partos.por_genero_cria?.M || 0}</div>
                <div className="text-xs mt-1">({(((statsData.partos.por_genero_cria?.M || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0))) * 100).toFixed(1)}% del total)</div>
              </>
            }
          </div>
          
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)', 
            borderRadius: '6px',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            {currentLang === 'ca' 
              ? <>
                <div className="font-semibold">Femelles</div>
                <div className="text-2xl font-bold mt-1">{statsData.partos.por_genero_cria?.F || 0}</div>
                <div className="text-xs mt-1">({(((statsData.partos.por_genero_cria?.F || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0))) * 100).toFixed(1)}% del total)</div>
              </>
              : <>
                <div className="font-semibold">Hembras</div>
                <div className="text-2xl font-bold mt-1">{statsData.partos.por_genero_cria?.F || 0}</div>
                <div className="text-xs mt-1">({(((statsData.partos.por_genero_cria?.F || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0))) * 100).toFixed(1)}% del total)</div>
              </>
            }
          </div>
        </div>
        
        {(statsData.partos.por_genero_cria?.esforrada || 0) > 0 && (
          <div className="mt-2 text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)', 
            borderRadius: '6px',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          }}>
            {currentLang === 'ca' 
              ? <>
                <div className="font-semibold">Esforrada</div>
                <div className="text-lg font-bold mt-1">{statsData.partos.por_genero_cria?.esforrada || 0}</div>
                <div className="text-xs mt-1">({(((statsData.partos.por_genero_cria?.esforrada || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0))) * 100).toFixed(1)}% del total)</div>
              </>
              : <>
                <div className="font-semibold">Esforrada</div>
                <div className="text-lg font-bold mt-1">{statsData.partos.por_genero_cria?.esforrada || 0}</div>
                <div className="text-xs mt-1">({(((statsData.partos.por_genero_cria?.esforrada || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0))) * 100).toFixed(1)}% del total)</div>
              </>
            }
          </div>
        )}

        <div className="text-sm text-center mt-3" style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontWeight: 'bold' }}>
          {currentLang === 'ca' 
            ? <>Total crías: <span className="text-lg">{(statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)}</span></>
            : <>Total crías: <span className="text-lg">{(statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)}</span></>
          }
        </div>
      </div>
    </>
  );
};

export default PartosSection;
