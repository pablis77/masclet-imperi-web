/**
 * DashboardV2.tsx
 * ======================
 * SOLO SON VALIDOS LOS DATOS DINAMICOS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * 
 * [DASHBOARDV2] Nueva versión del Dashboard completamente rediseñada para solucionar problemas
 * de rendimiento y visualización de datos. Esta versión es más modular, limpia
 * y fácil de mantener.
 * 
 * Características principales:
 * - Diseño más modular con componentes de tarjetas independientes
 * - Mejor manejo de errores y estados de carga
 * - Logs de diagnóstico para facilitar la depuración
 * - Optimización del consumo de API
 * - Compatible con temas claro/oscuro
 * - Navegación entre versiones del dashboard
 * - Integración con Tremor para visualizaciones más avanzadas
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/apiService';

// Importar y registrar los componentes de Chart.js
import { registerChartComponents } from '../../utils/chartConfig';

// Registrar los componentes al inicio para asegurar que estén disponibles
registerChartComponents();

// Importar componentes UI reutilizables
import { SectionTitle } from '../dashboard/components/UIComponents';

// Importar componente PartosSection
import PartosSection from '../dashboard/sections/PartosSection';

// Importar ResumenOriginalCard
import ResumenOriginalCard from './cards/ResumenOriginalCard';

// Importar componente de diagnóstico para visualizar datos crudos
import DiagnosticoDataCard from './cards/DiagnosticoDataCard';

// Importar tipos
import type { 
  DashboardStats, 
  PartosStats
} from '../dashboard/types/dashboard';

/**
 * DashboardV2 - Versión optimizada y modular
 * 
 * Implementación desde cero con énfasis en simplicidad y rendimiento.
 * Consume directamente los endpoints necesarios sin middleware.
 */
/**
 * [DASHBOARDV2] Componente principal de la nueva versión del dashboard
 * 
 * Implementado desde cero como una nueva versión alternativa que puede
 * coexistir con el Dashboard original sin afectarlo.
 */
const DashboardV2: React.FC = () => {
  // [DASHBOARDV2] No usamos useNavigate() porque puede causar problemas si se renderiza fuera del Router
  // Estado para almacenar datos de la API
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [partosData, setPartosData] = useState<PartosStats | null>(null);
  
  // Estados para gestionar la carga y errores
  const [loading, setLoading] = useState({
    stats: true,
    partos: true
  });
  const [error, setError] = useState({
    stats: null as string | null,
    partos: null as string | null
  });

  // Estado para el tema oscuro/claro
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Logs para diagnóstico
  const [logs, setLogs] = useState<string[]>([]);

  // Función para agregar logs
  const addLog = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${isError ? '❌ ' : ''}${message}`;
    setLogs(prev => [formattedMessage, ...prev]);
    
    if (isError) {
      console.error(`[DashboardV2] ${message}`);
    } else {
      console.log(`[DashboardV2] ${message}`);
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        addLog('Iniciando carga de datos del dashboard v2');
        
        // Cargar estadísticas
        setLoading(prev => ({ ...prev, stats: true }));
        try {
          addLog('Obteniendo datos de estadísticas...');
          const statsResponse = await apiService.get('/dashboard/stats');
          
          // Diagnóstico detallado
          console.log('DATOS RECIBIDOS STATS:', statsResponse);
          if (statsResponse?.animales) {
            console.log('DATOS DE ANIMALES:', statsResponse.animales);
            console.log('- toros_activos:', statsResponse.animales.toros_activos);
            console.log('- toros_fallecidos:', statsResponse.animales.toros_fallecidos);
            console.log('- vacas_activas:', statsResponse.animales.vacas_activas);
            console.log('- vacas_fallecidas:', statsResponse.animales.vacas_fallecidas);
            console.log('- por_alletar:', statsResponse.animales.por_alletar);
          }
          
          setStatsData(statsResponse);
          setLoading(prev => ({ ...prev, stats: false }));
          setError(prev => ({ ...prev, stats: null }));
          addLog('✅ Datos de estadísticas cargados correctamente');
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
          addLog(`Error obteniendo estadísticas: ${errorMsg}`, true);
          setError(prev => ({ ...prev, stats: errorMsg }));
          setLoading(prev => ({ ...prev, stats: false }));
        }
        
        // Cargar datos de partos
        setLoading(prev => ({ ...prev, partos: true }));
        try {
          addLog('Obteniendo datos de partos...');
          const partosResponse = await apiService.get('/dashboard/partos');
          setPartosData(partosResponse);
          setLoading(prev => ({ ...prev, partos: false }));
          setError(prev => ({ ...prev, partos: null }));
          addLog('✅ Datos de partos cargados correctamente');
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
          addLog(`Error obteniendo partos: ${errorMsg}`, true);
          setError(prev => ({ ...prev, partos: errorMsg }));
          setLoading(prev => ({ ...prev, partos: false }));
        }
        
      } catch (error) {
        console.error('Error general cargando datos:', error);
      }
    };
    
    loadDashboardData();
    
    // Detectar tema oscuro
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
    
    // Observer para cambios en el tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Función para cambiar tema
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <div 
      className={`dashboard-container ${darkMode ? 'theme-dark' : 'theme-light'}`}
      data-component-name="DashboardV2"
    >
      {/* [DASHBOARDV2] Enlace para volver al Dashboard original */}
      <a 
        href="/dashboard" 
        className="fixed top-4 right-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50 flex items-center gap-2"
      >
        <span>Volver al Dashboard</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </a>
      
      {/* [DASHBOARDV2] Botón para cambiar tema */}
      <button 
        onClick={toggleTheme} 
        style={{
          position: 'fixed',
          bottom: '6rem',
          left: '1rem',
          backgroundColor: darkMode ? '#374151' : '#e5e7eb',
          color: darkMode ? 'white' : 'black',
          padding: '0.75rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 20,
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
        }}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      
      {/* Cabecera */}
      <div className="dashboard-header">
        <h1 className="text-2xl font-bold mb-6">BIENVENIDO A MASCLET IMPERI</h1>
      </div>
      
      {/* SECCIÓN 1: Resumen General (Con estilo original) */}
      <SectionTitle number="1" title="Resumen General" darkMode={darkMode} translationKey="dashboard.summary" />
      <div className="stats-grid-lg">
        {/* Componente visual con el estilo original que funcionaba correctamente */}
        <ResumenOriginalCard
          darkMode={darkMode}
        />
      </div>
      
      {/* SECCIÓN 2: Análisis de Partos */}
      <SectionTitle number="2" title="Análisis de Partos" darkMode={darkMode} translationKey="dashboard.partos_analysis" />
      <div className="combined-stats-grid">
        {/* Wrapper para que el PartosSection ocupe la mitad del ancho */}
        <div style={{ display: 'contents' }}>
          <PartosSection 
            statsData={statsData} 
            partosData={partosData}
            darkMode={darkMode} 
            loading={loading.stats || loading.partos} 
            error={error.stats || error.partos} 
          />
        </div>
        {/* Espacio vacío para equilibrar la cuadrícula */}
        <div></div>
      </div>
      
      {/* SECCIÓN 3: Diagnóstico de Datos */}
      <SectionTitle number="3" title="Diagnóstico de Datos" darkMode={darkMode} translationKey="dashboard.diagnostico" />
      <div className="stats-grid-lg">
        {/* Componente de diagnóstico para visualizar datos crudos */}
        <DiagnosticoDataCard />
      </div>

      {/* Panel de logs de diagnóstico (visible solo en desarrollo) */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Logs de diagnóstico</h3>
        <div 
          className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-700 p-2 rounded"
          style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
        >
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={`py-1 border-b border-gray-200 dark:border-gray-700 ${log.includes('❌') ? 'text-red-600 dark:text-red-400' : ''}`}
              >
                {log}
              </div>
            ))
          ) : (
            <p>No hay logs disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardV2;
