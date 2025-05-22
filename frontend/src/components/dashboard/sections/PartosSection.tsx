import React, { useEffect, useState } from 'react';
import { MonthlyChart, GenderCriaChart, TrendChart, DistribucionAnualChart, DistribucionMensualChart } from '../components/ChartComponents';
import { StatCard, DashboardCard, CardLabel } from '../components/UIComponents';
import type { DashboardStats, PartosStats } from '../types';
import { t } from '../../../i18n/config';

// Función para obtener el año con más partos
const getMaxYear = (distribucion?: Record<string, number>) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return 'N/A';
  }

  const entries = Object.entries(distribucion);
  if (entries.length === 0) return 'N/A';
  
  const maxEntry = entries.reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  }, entries[0]);
  
  return `${maxEntry[0]} (${maxEntry[1]} partos)`;
};

// Función para obtener el año con menos partos
const getMinYear = (distribucion?: Record<string, number>) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return 'N/A';
  }

  // Filtrar valores mayores que 0
  const entriesConValor = Object.entries(distribucion).filter(entry => entry[1] > 0);
  
  if (entriesConValor.length === 0) return 'N/A';
  
  const minEntry = entriesConValor.reduce((min, current) => {
    return current[1] < min[1] ? current : min;
  }, entriesConValor[0]);
  
  return `${minEntry[0]} (${minEntry[1]} parto${minEntry[1] !== 1 ? 's' : ''})`;
};

// Función para obtener el primer año con partos
const getFirstYear = (distribucion?: Record<string, number>) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return 'N/A';
  }

  // Filtrar años con al menos un parto
  const añosConPartos = Object.entries(distribucion)
    .filter(([_, value]) => value > 0)
    .map(([year]) => year);
  
  if (añosConPartos.length === 0) return 'N/A';
  
  // Ordenar años numéricamente
  const primerAño = añosConPartos.sort((a, b) => parseInt(a) - parseInt(b))[0];
  
  return primerAño;
};

// Función para obtener el último año con partos
const getLastYear = (distribucion?: Record<string, number>) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return 'N/A';
  }

  // Filtrar años con al menos un parto
  const añosConPartos = Object.entries(distribucion)
    .filter(([_, value]) => value > 0)
    .map(([year]) => year);
  
  if (añosConPartos.length === 0) return 'N/A';
  
  // Ordenar años numéricamente
  const ultimoAño = añosConPartos.sort((a, b) => parseInt(b) - parseInt(a))[0];
  const partosUltimoAño = distribucion[ultimoAño];
  
  return `${ultimoAño} (${partosUltimoAño} parto${partosUltimoAño !== 1 ? 's' : ''})`;
};

// Función para obtener los partos del año actual
const getPartosCurrentYear = (distribucion?: Record<string, number>) => {
  if (!distribucion) return 0;
  
  const currentYear = new Date().getFullYear().toString();
  return distribucion[currentYear] || 0;
};

// Función para obtener el total de partos
const getTotalPartos = (distribucion?: Record<string, number>) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return 0;
  }

  return Object.values(distribucion).reduce((total, count) => total + count, 0);
};

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
    const userLanguage = localStorage.getItem('userLanguage');
    if (userLanguage) {
      setCurrentLang(userLanguage);
    }
    
    // Función para manejar cambios de idioma
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    
    return () => {
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);
  
  // DEPURACIÓN: Ver exactamente qué datos están llegando
  useEffect(() => {
    if (statsData && statsData.partos) {
      console.log('DATOS MENSUALES RECIBIDOS:', statsData.partos.por_mes);
      console.log('TIPO DE DATOS:', typeof statsData.partos.por_mes);
      console.log('CLAVES:', Object.keys(statsData.partos.por_mes || {}));
      console.log('VALORES:', Object.values(statsData.partos.por_mes || {}));
      
      console.log('DATOS ANUALES RECIBIDOS:', statsData.partos.distribucion_anual);
      console.log('TIPO DE DATOS:', typeof statsData.partos.distribucion_anual);
      console.log('CLAVES:', Object.keys(statsData.partos.distribucion_anual || {}));
    }
  }, [statsData]);
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Resumen de Partos */}
      <div className="dashboard-card">
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
            title={new Date().getFullYear().toString()}
            value={getPartosCurrentYear(statsData.partos.distribucion_anual)}
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
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">{currentLang === 'ca' ? "Distribució mensual" : "Distribución mensual"}</h3>
        <div style={{ height: "300px" }}>
          <DistribucionMensualChart darkMode={darkMode} data={statsData.partos.por_mes} />
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
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">{currentLang === 'ca' ? "Distribució anual detallada" : "Distribución anual detallada"}</h3>
        {/* Mostrar los datos de distribución anual que vienen directamente del backend */}
        <div style={{ height: "300px" }}>
          <DistribucionAnualChart 
            darkMode={darkMode} 
            data={statsData.partos.distribucion_anual} 
          />
        </div>
        
        {/* DEPURACIÓN: Verificamos que estamos recibiendo los datos correctos del API */}
        <pre style={{ display: 'none', fontSize: '8px', maxHeight: '80px', overflow: 'auto', margin: '0', padding: '4px', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px' }}>
          {JSON.stringify(statsData.partos.distribucion_anual, null, 2)}
        </pre>
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
              ? <>Any amb <strong>més</strong> parts:<br/><span className="text-lg font-bold">{getMaxYear(statsData.partos.distribucion_anual)}</span></>
              : <>Año con <strong>más</strong> partos:<br/><span className="text-lg font-bold">{getMaxYear(statsData.partos.distribucion_anual)}</span></>
            }
          </div>
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '6px',
            fontWeight: 'semibold' 
          }}>
            {currentLang === 'ca' 
              ? <>Any amb <strong>menys</strong> parts:<br/><span className="text-lg font-bold">{getMinYear(statsData.partos.distribucion_anual)}</span></>
              : <>Año con <strong>menos</strong> partos:<br/><span className="text-lg font-bold">{getMinYear(statsData.partos.distribucion_anual)}</span></>
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
              ? <>Primer any amb parts:<br/><span className="text-lg font-bold">{getFirstYear(statsData.partos.distribucion_anual)}</span></>
              : <>Primer año con partos:<br/><span className="text-lg font-bold">{getFirstYear(statsData.partos.distribucion_anual)}</span></>
            }
          </div>
          <div className="text-sm text-center p-2" style={{ 
            backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)', 
            borderRadius: '6px',
            fontWeight: 'semibold' 
          }}>
            {currentLang === 'ca' 
              ? <>Últim any amb parts:<br/><span className="text-lg font-bold">{getLastYear(statsData.partos.distribucion_anual)}</span></>
              : <>Último año con partos:<br/><span className="text-lg font-bold">{getLastYear(statsData.partos.distribucion_anual)}</span></>
            }
          </div>
        </div>
        
        <div className="text-sm text-center mt-3" style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontWeight: 'bold' }}>
          {currentLang === 'ca' 
            ? <>Total: <span className="text-lg">{statsData.partos.total} parts</span></>
            : <>Total: <span className="text-lg">{statsData.partos.total} partos</span></>
          }
        </div>
      </div>

      {/* Distribución por Género - CORREGIDA */}
      <div className="dashboard-card">
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
    </div>
  );
};

export default PartosSection;
