/**
 * DashboardOptimized.tsx
 * =====================
 * 
 * PLAN DE DESPLIEGUE - PUNTO 1.2: OPTIMIZACIÓN DEL COMPONENTE DASHBOARD
 * 
 * Versión optimizada del DashboardEnhanced que utiliza los componentes
 * ya creados en las carpetas:
 * - charts/ - Componentes de gráficos específicos
 * - components/ - Componentes de UI reutilizables
 * - sections/ - Secciones completas del dashboard
 * 
 * Este componente mantiene la gestión de estado y la lógica de comunicación con la API,
 * mientras que la renderización se ha delegado a componentes más específicos.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiService from '../../services/apiService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import type { DateParams } from './hooks/useDashboardData';
import './dashboardStyles.css';

// Importar componentes de secciones
import ResumenGeneral from './sections/ResumenGeneral';
import PartosAnalisis from './sections/PartosAnalisis';
import ExplotacionesDisplay from './sections/ExplotacionesDisplay';

// Importar componentes UI reutilizables
import DashboardCard from './components/DashboardCard';

// Importar tipos
import type { 
  DashboardResumen, 
  DashboardStats, 
  PartosStats, 
  CombinedStats,
  ExplotacionInfo,
  AnimalStats
} from './types';

// Registrar los componentes de ChartJS necesarios
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

/**
 * Componente Dashboard Optimizado
 * - Mantiene la misma funcionalidad que DashboardEnhanced
 * - Utiliza componentes más pequeños y reutilizables
 * - Optimiza la estructura y organización del código
 */
const DashboardOptimized: React.FC = () => {
  // Estados para los diferentes endpoints
  const [resumenData, setResumenData] = useState<DashboardResumen | null>(null);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [partosData, setPartosData] = useState<PartosStats | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedStats | null>(null);
  const [explotaciones, setExplotaciones] = useState<ExplotacionInfo[]>([]);
  const [animalStats, setAnimalStats] = useState<AnimalStats>({
    total: 0,
    machos: 0,
    hembras: 0,
    ratio_m_h: 0,
    por_estado: {},
    por_alletar: {},
    por_quadra: {},
    edades: {}
  });
  
  // Estados generales
  const [loading, setLoading] = useState<Record<string, boolean>>({
    resumen: true,
    stats: true,
    partos: true,
    combined: true,
    explotaciones: true
  });
  
  // Estados para los filtros de fecha
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [error, setError] = useState<Record<string, string | null>>({
    resumen: null,
    stats: null,
    partos: null,
    combined: null,
    explotaciones: null
  });
  const [requestLogs, setRequestLogs] = useState<string[]>([]);
  
  // Estado para el tema (sincronizado con tema global)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Estado para indicar si el dashboard está completamente cargado
  const [dashboardReady, setDashboardReady] = useState<boolean>(false);

  // Efecto para sincronizar con el tema global al cargar
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
    
    // Observar cambios en el tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Función para añadir logs de depuración - solo en desarrollo
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setRequestLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    // Solo mostrar logs en modo desarrollo
    if (import.meta.env.DEV) {
      console.log(`[Dashboard] ${message}`);
    }
  };

  // Cambiar tema
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  // Función para cargar datos del dashboard
  useEffect(() => {
    // Cargar todos los datos al montar el componente
    fetchDashboardData();
  }, []);

  // Refrescar datos con fechas filtradas
  const aplicarFiltroFechas = () => {
    fetchDashboardData();
  };

  // Función principal para cargar datos del dashboard
  const fetchDashboardData = async () => {
    // Construir parámetros de fecha si están presentes
    const params: Record<string, string> = {};
    if (fechaInicio) params.inicio = fechaInicio;
    if (fechaFin) params.fin = fechaFin;

    // Limpiar errores previos
    setError({
      resumen: null,
      stats: null,
      partos: null,
      combined: null,
      explotaciones: null
    });

    // Iniciar carga
    setLoading({
      resumen: true,
      stats: true,
      partos: true,
      combined: true,
      explotaciones: true
    });

    // Marcar que el dashboard no está listo durante la carga
    setDashboardReady(false);

    // Cargar datos de todos los endpoints paralelamente
    try {
      await Promise.all([
        fetchResumenData(params),
        fetchStatsData(params),
        fetchPartosData(params),
        fetchCombinedData(params),
        fetchExplotacionesData(),
      ]);
      addLog('✅ Todos los datos cargados correctamente');
      
      // Marcar que el dashboard está completamente cargado
      setDashboardReady(true);
    } catch (err) {
      addLog('❌ Error al cargar datos del dashboard');
      
      // Marcar que el dashboard está cargado aunque haya errores
      setDashboardReady(true);
    }
  };

  // Cargar datos de resumen
  const fetchResumenData = async (params: Record<string, string> = {}) => {
    try {
      addLog('Iniciando petición a /dashboard/resumen usando apiService');
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, resumen: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, resumen: false }));
        return;
      }
      
      const response = await apiService.get('/dashboard/resumen');
      
      addLog('✅ Datos de resumen recibidos correctamente');
      setResumenData(response.data);
      setError(prev => ({ ...prev, resumen: null }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en resumen: ${err.message}`);
        setError(prev => ({ ...prev, resumen: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en resumen: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, resumen: 'Error procesando datos de resumen' }));
      }
    }
    setLoading(prev => ({ ...prev, resumen: false }));
  };

  // Cargar datos de estadísticas
  const fetchStatsData = async (params: Record<string, string> = {}) => {
    try {
      addLog('Iniciando petición a /dashboard/stats usando apiService');
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, stats: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, stats: false }));
        return;
      }
      
      const response = await apiService.get('/dashboard/stats');
      
      addLog('✅ Estadísticas recibidas correctamente');
      setStatsData(response.data);
      
      // Actualizar estadísticas de animales para uso en componentes
      if (response.data.animales) {
        setAnimalStats({
          total: response.data.animales.total || 0,
          machos: response.data.animales.machos || 0,
          hembras: response.data.animales.hembras || 0,
          ratio_m_h: response.data.animales.ratio_m_h || 0,
          por_estado: response.data.animales.por_estado || {},
          por_alletar: response.data.animales.por_alletar || {},
          por_quadra: response.data.animales.por_quadra || {},
          edades: response.data.animales.edades || {}
        });
      }
      
      setError(prev => ({ ...prev, stats: null }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en stats: ${err.message}`);
        setError(prev => ({ ...prev, stats: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en stats: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, stats: 'Error procesando estadísticas' }));
      }
    }
    setLoading(prev => ({ ...prev, stats: false }));
  };

  // Cargar datos de partos
  const fetchPartosData = async (params: Record<string, string> = {}) => {
    try {
      addLog('Iniciando petición a /dashboard/partos usando apiService');
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, partos: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, partos: false }));
        return;
      }
      
      const response = await apiService.get('/dashboard/partos');
      
      addLog('✅ Datos de partos recibidos correctamente');
      setPartosData(response.data);
      setError(prev => ({ ...prev, partos: null }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en partos: ${err.message}`);
        setError(prev => ({ ...prev, partos: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en partos: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, partos: 'Error procesando datos de partos' }));
      }
    }
    setLoading(prev => ({ ...prev, partos: false }));
  };

  // Cargar datos combinados
  const fetchCombinedData = async (params: Record<string, string> = {}) => {
    try {
      addLog('Iniciando petición a /dashboard/combined usando apiService');
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, combined: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, combined: false }));
        return;
      }
      
      try {
        const response = await apiService.get('/dashboard/combined');
        
        addLog('✅ Datos combinados recibidos correctamente');
        
        const dashboardData = response.data;
        setCombinedData(dashboardData);
      } catch (err) {
        console.error('Error procesando datos combinados:', err);
        addLog(`❌ Error desconocido en combined: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, combined: 'Error procesando datos combinados' }));
      }
      setLoading(prev => ({ ...prev, combined: false }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en combined: ${err.message}`);
        setError(prev => ({ ...prev, combined: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en combined: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, combined: 'Error procesando datos combinados' }));
      }
      setLoading(prev => ({ ...prev, combined: false }));
    }
  };

  // Cargar datos de explotaciones
  const fetchExplotacionesData = async () => {
    try {
      addLog('Iniciando petición a /dashboard/explotacions usando apiService');
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, explotaciones: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, explotaciones: false }));
        return;
      }
      
      const response = await apiService.get('/dashboard/explotacions');
      
      addLog('✅ Lista de explotaciones recibida');
      setExplotaciones(response.data);
      setError(prev => ({ ...prev, explotaciones: null }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en explotaciones: ${err.message}`);
        setError(prev => ({ ...prev, explotaciones: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en explotaciones: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, explotaciones: 'Error procesando datos de explotaciones' }));
      }
    }
    setLoading(prev => ({ ...prev, explotaciones: false }));
  };

  // Comprobar si todas las llamadas han finalizado (con éxito o error)
  const allLoaded = Object.values(loading).every(isLoading => isLoading === false);

  return (
    <div 
      className={`dashboard-container ${darkMode ? 'theme-dark' : 'theme-light'} ${allLoaded ? 'dashboard-ready' : ''}`} 
      data-component-name="DashboardOptimized"
      id="dashboard-container"
    >
      {/* Botón para cambiar tema */}
      <button 
        onClick={toggleTheme} 
        className="fixed bottom-24 left-4 bg-primary text-white p-3 rounded-full shadow-lg z-20 border-none cursor-pointer text-xl"
        aria-label="Cambiar tema"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Sección 1: Resumen General */}
      <div className="mb-8">
        <h2 className="flex items-center text-xl font-bold mb-4 p-2 bg-primary text-white rounded">
          <span className="flex items-center justify-center w-6 h-6 bg-white text-primary rounded-full mr-2 font-bold">
            1
          </span>
          Resumen General
        </h2>
        
        <ResumenGeneral 
          data={resumenData} 
          loading={loading.resumen}
          error={error.resumen}
        />
      </div>

      {/* Sección 2: Análisis de Animales */}
      <div className="mb-8">
        <h2 className="flex items-center text-xl font-bold mb-4 p-2 bg-primary text-white rounded">
          <span className="flex items-center justify-center w-6 h-6 bg-white text-primary rounded-full mr-2 font-bold">
            2
          </span>
          Análisis de Animales
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Distribución por Género"
            loading={loading.stats}
            error={error.stats}
          >
            {statsData?.animales && (
              <div className="flex flex-col items-center">
                <div className="stats-container grid grid-cols-2 gap-4 w-full mb-4">
                  <div className="stat-item">
                    <div className="text-2xl font-bold">{statsData.animales.machos}</div>
                    <div className="text-sm text-gray-500">Machos</div>
                  </div>
                  <div className="stat-item">
                    <div className="text-2xl font-bold">{statsData.animales.hembras}</div>
                    <div className="text-sm text-gray-500">Hembras</div>
                  </div>
                </div>
                <div className="chart-container h-56 w-full">
                  <div className="flex justify-center h-full">
                    <div className="w-56 h-56">
                      <Pie 
                        data={{
                          labels: ['Machos', 'Hembras'],
                          datasets: [
                            {
                              data: [statsData.animales.machos, statsData.animales.hembras],
                              backgroundColor: ['#0891b2', '#be185d'],
                              borderColor: darkMode ? '#111827' : '#ffffff',
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="Distribución por Estado"
            loading={loading.stats}
            error={error.stats}
          >
            {statsData?.animales?.por_estado && Object.keys(statsData.animales.por_estado).length > 0 && (
              <div className="flex flex-col items-center h-full justify-center">
                <div className="chart-container w-full h-56">
                  <Pie 
                    data={{
                      labels: Object.keys(statsData.animales.por_estado),
                      datasets: [
                        {
                          data: Object.values(statsData.animales.por_estado),
                          backgroundColor: [
                            '#0891b2', // cian para OK
                            '#be185d', // rosa para DEF
                            '#4f46e5', // indigo para otros posibles estados
                            '#d97706', // ámbar
                            '#84cc16', // lima
                          ],
                          borderColor: darkMode ? '#111827' : '#ffffff',
                          borderWidth: 1
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* Sección 3: Análisis de Partos */}
      <div className="mb-8">
        <h2 className="flex items-center text-xl font-bold mb-4 p-2 bg-primary text-white rounded">
          <span className="flex items-center justify-center w-6 h-6 bg-white text-primary rounded-full mr-2 font-bold">
            3
          </span>
          Análisis de Partos
        </h2>
        
        <PartosAnalisis 
          data={partosData}
          loading={loading.partos}
          error={error.partos}
        />
      </div>

      {/* Sección 4: Explotaciones */}
      <div className="mb-8">
        <h2 className="flex items-center text-xl font-bold mb-4 p-2 bg-primary text-white rounded">
          <span className="flex items-center justify-center w-6 h-6 bg-white text-primary rounded-full mr-2 font-bold">
            4
          </span>
          Explotaciones
        </h2>
        
        <ExplotacionesDisplay 
          data={explotaciones}
          loading={loading.explotaciones}
          error={error.explotaciones}
        />
      </div>

      {/* Período de análisis con selectores */}
      <div className="dashboard-card mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Período de Análisis</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({resumenData?.periodo?.inicio ? new Date(resumenData.periodo.inicio).toLocaleDateString() : '01/01/2010'} - {resumenData?.periodo?.fin ? new Date(resumenData.periodo.fin).toLocaleDateString() : new Date().toLocaleDateString()})
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <div className="w-1/2">
            <div className="card-label">Desde</div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="w-full p-2 border rounded-md text-sm"
                value={fechaInicio || ''}
                onChange={(e) => setFechaInicio(e.target.value)}
                min="2010-01-01"
                max={fechaFin || new Date().toISOString().split('T')[0]}
              />
              {fechaInicio && (
                <button 
                  onClick={() => setFechaInicio('')}
                  className="text-gray-500 hover:text-red-500"
                  title="Limpiar fecha"
                >
                  ❌
                </button>
              )}
            </div>
          </div>
          <div className="w-1/2">
            <div className="card-label">Hasta</div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="w-full p-2 border rounded-md text-sm"
                value={fechaFin || ''}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || '2010-01-01'}
                max={new Date().toISOString().split('T')[0]}
              />
              {fechaFin && (
                <button 
                  onClick={() => setFechaFin('')}
                  className="text-gray-500 hover:text-red-500"
                  title="Limpiar fecha"
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors duration-150"
            onClick={aplicarFiltroFechas}
          >
            Aplicar Filtro
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOptimized;
