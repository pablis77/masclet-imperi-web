import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import StatusDistribution from './StatusDistribution';
import ActivityFeed from './ActivityFeed';
import { 
  getDashboardStats, 
  getExplotaciones,
  getExplotacionStats,
  getDashboardResumen,
  getPartosStats,
  getCombinedDashboard,
  getRecentActivities
} from '../../services/dashboardService';
import type {
  ExplotacionResponse,
  ExplotacionDetailResponse,
  PartosResponse,
  CombinedDashboardResponse,
  RecentActivityResponse,
  Activity,
  ActivityType
} from '../../services/dashboardService';
import LoadingState from '../common/LoadingState';
import { isAuthenticated, getToken, getStoredUser } from '../../services/authService';

// Interfaces
interface DashboardParams {
  explotacioId?: number;
  startDate?: string;
  endDate?: string;
}

interface DashboardResponse {
  explotacio_id?: number;
  explotacio_name?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  animales: {
    total: number;
    machos: number;
    hembras: number;
    ratio_machos_hembras: number;
    por_estado: Record<string, number>;
    por_quadra: Record<string, number>;
    por_alletar: Record<string, number>;
  };
  partos: {
    total: number;
    ultimo_mes: number;
    ultimo_año: number;
    promedio_mensual: number;
    por_mes?: Record<string, number>;
    tendencia_partos: {
      tendencia: number;
      promedio: number;
      valores: Record<string, number>;
      mensaje?: string;
    };
  };
}

interface DashboardProps {
  title?: string;
  showExplotacionSelector?: boolean;
}

/**
 * Componente Dashboard - IMPORTANTE: Este componente debe usarse con client:only en Astro
 * para evitar problemas de hidratación.
 */
const Dashboard: React.FC<DashboardProps> = ({ 
  title = 'Panel de Control', 
  showExplotacionSelector = false 
}) => {
  // Estado para la explotación seleccionada
  const [selectedExplotacion, setSelectedExplotacion] = useState<number | null>(null);
  
  // Estados para los datos
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [explotaciones, setExplotaciones] = useState<ExplotacionResponse[]>([]);
  const [explotacionData, setExplotacionData] = useState<ExplotacionDetailResponse | null>(null);
  const [resumen, setResumen] = useState<DashboardResponse | null>(null);
  const [partosStats, setPartosStats] = useState<PartosResponse | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedDashboardResponse | null>(null);
  const [recentActivitiesData, setRecentActivitiesData] = useState<RecentActivityResponse | null>(null);
  
  // Estados para controlar qué datos mostrar
  const [activeTab, setActiveTab] = useState<string>('stats');

  // Cargar datos al montar el componente
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('🚀 [Dashboard] Inicializando componente...');
        
        // Verificar autenticación
        const token = getToken();
        if (!token) {
          console.warn('⚠️ [Dashboard] Usuario no autenticado');
          setError('Debes iniciar sesión para ver el dashboard');
          setLoading(false);
          return;
        }
        
        console.log('✅ [Dashboard] Token de autenticación encontrado');
        
        // Verificar permisos
        const user = getStoredUser();
        console.log('👤 [Dashboard] Datos de usuario recuperados:', user);
        
        if (user && !['administrador', 'gerente'].includes(user.role)) {
          console.warn(`⛔ [Dashboard] Usuario sin permisos suficientes. Rol: ${user.role}`);
          setError(`No tienes permisos para acceder al dashboard. Tu rol actual es: ${user.role}`);
          setLoading(false);
          return;
        }
        
        setInitialized(true);
      } catch (error: any) {
        console.error('❌ [Dashboard] Error al inicializar:', error);
        setError(`Error al inicializar: ${error.message || 'Error desconocido'}`);
        setLoading(false);
      }
    };
    
    initializeDashboard();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Efecto separado para cargar datos cuando el componente está inicializado
  useEffect(() => {
    if (initialized) {
      console.log('🔄 [Dashboard] Componente inicializado, cargando datos...');
      loadAllDashboardData({
        explotacioId: selectedExplotacion || undefined
      });
    }
  }, [initialized, selectedExplotacion, activeTab]);

  // Cargar todos los datos del dashboard
  const loadAllDashboardData = async (params: DashboardParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar la lista de explotaciones primero
      await loadExplotaciones();
      
      // Cargar datos según la pestaña activa
      switch (activeTab) {
        case 'stats':
          await loadDashboardStats(params);
          break;
        case 'explotacion':
          if (selectedExplotacion) {
            await loadExplotacionDetail(selectedExplotacion, params);
          } else {
            setError('Debes seleccionar una explotación para ver sus detalles');
          }
          break;
        case 'resumen':
          await loadResumen();
          break;
        case 'partos':
          await loadPartosStats(params);
          break;
        case 'combined':
          await loadCombinedData(params);
          break;
        case 'recientes':
          await loadRecentActivities();
          break;
        default:
          await loadDashboardStats(params);
      }
    } catch (error: any) {
      console.error(' Error al cargar datos:', error);
      setError(`Error al cargar datos: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejar el cambio de explotación
  const handleExplotacionChange = (explotacionId: number | null) => {
    setSelectedExplotacion(explotacionId);
  };

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async (params: DashboardParams = {}, retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 [Dashboard] Iniciando carga de estadísticas con parámetros:`, params);
      console.log(`🔄 [Dashboard] Intento ${retryCount + 1}/3`);

      try {
        console.log('📊 [Dashboard] Llamando a getDashboardStats()...');
        const data = await getDashboardStats(params);
        console.log('✅ [Dashboard] Datos recibidos correctamente:', data);
        
        if (data) {
          console.log('💾 [Dashboard] Actualizando estado con datos recibidos');
          setDashboardData(data);
          return data;
        } else {
          throw new Error('Los datos recibidos están vacíos');
        }
      } catch (apiError: any) {
        console.error('❌ [Dashboard] Error al cargar estadísticas:', apiError);
        
        // Manejar errores específicos
        if (apiError.status === 403) {
          console.warn('⛔ [Dashboard] Error de permisos (403)');
          setError('No tienes permisos para acceder a las estadísticas del dashboard. Se requiere rol de administrador o gerente.');
          
          // Usar datos simulados como fallback
          setDashboardData(getMockDashboardData());
        } else if (apiError.status === 401) {
          console.warn('🔒 [Dashboard] Error de autenticación (401)');
          setError('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
          
          // Redirigir a la página de login después de un breve retraso
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (apiError.status === 404 || (apiError.message && apiError.message.includes('Network Error'))) {
          // Reintentar automáticamente hasta 3 veces para errores de red o 404
          if (retryCount < 2) {
            console.warn(`🔄 [Dashboard] Error de conexión. Reintentando (${retryCount + 1}/3)...`);
            
            // Esperar 2 segundos antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 2000));
            return loadDashboardStats(params, retryCount + 1);
          } else {
            console.warn('❌ [Dashboard] Error de red después de 3 intentos');
            setError('No se pudo conectar con el servidor después de varios intentos. Comprueba tu conexión a internet.');
            
            // Usar datos simulados como fallback
            setDashboardData(getMockDashboardData());
          }
        } else {
          console.warn('❓ [Dashboard] Error desconocido');
          setError(`Error al cargar las estadísticas: ${apiError.message || 'Error desconocido'}`);
          
          // Usar datos simulados como fallback
          setDashboardData(getMockDashboardData());
        }
      }
    } catch (error: any) {
      console.error('💥 [Dashboard] Error general:', error);
      setError(`Error general: ${error.message || 'Error desconocido'}`);
      
      // Usar datos simulados como fallback
      setDashboardData(getMockDashboardData());
    } finally {
      setLoading(false);
    }
  };

  // Datos simulados para fallback
  const getMockDashboardData = (): DashboardResponse => {
    console.log('🔄 [Dashboard] Generando datos simulados como fallback');
    return {
      explotacio_id: undefined,
      explotacio_name: undefined,
      fecha_inicio: undefined,
      fecha_fin: undefined,
      animales: {
        total: 120,
        machos: 45,
        hembras: 75,
        ratio_machos_hembras: 0.6,
        por_estado: {
          'ACTIVO': 80,
          'INACTIVO': 30,
          'FALLECIDO': 10
        },
        por_quadra: {
          'Quadra 1': 40,
          'Quadra 2': 35,
          'Quadra 3': 45
        },
        por_alletar: {
          'Si': 28,
          'No': 47
        }
      },
      partos: {
        total: 35,
        ultimo_mes: 5,
        ultimo_año: 30,
        promedio_mensual: 2.5,
        por_mes: {
          'Enero': 3,
          'Febrero': 2,
          'Marzo': 4,
          'Abril': 1,
          'Mayo': 3,
          'Junio': 2
        },
        tendencia_partos: {
          tendencia: 0.2,
          promedio: 2.5,
          valores: {
            'Enero': 3,
            'Febrero': 2,
            'Marzo': 4,
            'Abril': 1,
            'Mayo': 3,
            'Junio': 2
          },
          mensaje: 'Tendencia positiva en los últimos 6 meses'
        }
      }
    };
  };

  // Cargar lista de explotaciones
  const loadExplotaciones = async (retryCount = 0) => {
    try {
      console.log(' Cargando lista de explotaciones...');
      const data = await getExplotaciones();
      console.log(' Lista de explotaciones recibida:', data);
      setExplotaciones(data);
      return data;
    } catch (error: any) {
      console.error(' Error al cargar explotaciones:', error);
      
      // Reintentar si es necesario
      if (retryCount < 2 && (error.status === 404 || (error.message && error.message.includes('Network Error')))) {
        console.warn(` Reintentando cargar explotaciones (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadExplotaciones(retryCount + 1);
      }
      
      throw error;
    }
  };

  // Cargar detalles de una explotación
  const loadExplotacionDetail = async (explotacionId: number, params: DashboardParams = {}, retryCount = 0) => {
    try {
      console.log(` Cargando detalles de explotación ${explotacionId}...`);
      const data = await getExplotacionStats(explotacionId, params);
      console.log(' Detalles de explotación recibidos:', data);
      setExplotacionData(data);
      return data;
    } catch (error: any) {
      console.error(` Error al cargar detalles de explotación ${explotacionId}:`, error);
      
      // Reintentar si es necesario
      if (retryCount < 2 && (error.status === 404 || (error.message && error.message.includes('Network Error')))) {
        console.warn(` Reintentando cargar detalles de explotación (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadExplotacionDetail(explotacionId, params, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Cargar resumen básico
  const loadResumen = async (retryCount = 0) => {
    try {
      console.log(' Cargando resumen básico...');
      const data = await getDashboardResumen();
      console.log(' Resumen básico recibido:', data);
      setResumen(data);
      return data;
    } catch (error: any) {
      console.error(' Error al cargar resumen básico:', error);
      
      // Reintentar si es necesario
      if (retryCount < 2 && (error.status === 404 || (error.message && error.message.includes('Network Error')))) {
        console.warn(` Reintentando cargar resumen básico (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadResumen(retryCount + 1);
      }
      
      throw error;
    }
  };

  // Cargar estadísticas de partos
  const loadPartosStats = async (params: DashboardParams = {}, retryCount = 0) => {
    try {
      console.log(' Cargando estadísticas de partos...');
      const data = await getPartosStats(params);
      console.log(' Estadísticas de partos recibidas:', data);
      setPartosStats(data);
      return data;
    } catch (error: any) {
      console.error(' Error al cargar estadísticas de partos:', error);
      
      // Reintentar si es necesario
      if (retryCount < 2 && (error.status === 404 || (error.message && error.message.includes('Network Error')))) {
        console.warn(` Reintentando cargar estadísticas de partos (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadPartosStats(params, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Cargar datos combinados
  const loadCombinedData = async (params: DashboardParams = {}, retryCount = 0) => {
    try {
      console.log(' Cargando datos combinados...');
      const data = await getCombinedDashboard(params);
      console.log(' Datos combinados recibidos:', data);
      setCombinedData(data);
      return data;
    } catch (error: any) {
      console.error(' Error al cargar datos combinados:', error);
      
      // Reintentar si es necesario
      if (retryCount < 2 && (error.status === 404 || (error.message && error.message.includes('Network Error')))) {
        console.warn(` Reintentando cargar datos combinados (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadCombinedData(params, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Cargar actividades recientes
  const loadRecentActivities = async (limit: number = 10, retryCount = 0) => {
    try {
      console.log(` Cargando actividades recientes (límite: ${limit})...`);
      const data = await getRecentActivities(limit);
      console.log(' Actividades recientes recibidas:', data);
      
      setRecentActivitiesData(data);
      
      return data;
    } catch (error: any) {
      console.error(' Error al cargar actividades recientes:', error);
      
      // Reintentar si es necesario
      if (retryCount < 2 && (error.status === 404 || (error.message && error.message.includes('Network Error')))) {
        console.warn(` Reintentando cargar actividades recientes (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadRecentActivities(limit, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Convertir datos para StatusDistribution
  const convertToStatusData = (data: Record<string, number> = {}, colorMap: Record<string, string>, labelMap: Record<string, string>) => {
    return Object.entries(data).map(([key, value]) => ({
      label: labelMap[key] || key,
      value,
      color: colorMap[key] || 'bg-gray-500'
    }));
  };

  // Manejar el cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params: DashboardParams = {};
    if (selectedExplotacion) {
      params.explotacioId = selectedExplotacion;
    }
    loadAllDashboardData(params);
  };

  // Renderizar el componente
  return (
    <div className="space-y-6">
      {/* Información de conexión */}
      <div className={`text-sm font-medium ${
        loading ? 'text-blue-500' :
        error ? 'text-red-500' :
        'text-green-500'
      }`}>
        {loading ? 'Cargando...' :
        error ? 'Error al cargar datos' :
        'Datos cargados correctamente'}
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-2">
              <button 
                onClick={() => loadAllDashboardData()}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors"
              >
                Reintentar conexión
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Selector de explotación */}
      {showExplotacionSelector && explotaciones.length > 0 && (
        <div className="mb-4">
          <label htmlFor="explotacion-selector" className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Explotación
          </label>
          <select
            id="explotacion-selector"
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedExplotacion || ''}
            onChange={(e) => handleExplotacionChange(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todas las explotaciones</option>
            {explotaciones.map((explotacion) => (
              <option key={explotacion.id} value={explotacion.id}>
                {explotacion.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pestañas para los diferentes endpoints */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {[
            { id: 'stats', name: 'Estadísticas' },
            { id: 'explotacion', name: 'Explotación', disabled: !selectedExplotacion },
            { id: 'resumen', name: 'Resumen' },
            { id: 'partos', name: 'Partos' },
            { id: 'combined', name: 'Combinado' },
            { id: 'recientes', name: 'Actividad Reciente' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${
                tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <LoadingState message="Cargando datos..." />
      ) : (
        <div>
          {/* Contenido según la pestaña activa */}
          {activeTab === 'stats' && dashboardData && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">{title} {dashboardData.explotacio_name ? `- ${dashboardData.explotacio_name}` : ''}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Animales"
                  value={dashboardData.animales.total}
                  icon="🐄"
                  trend={0}
                  description="Animales registrados"
                />
                <StatCard
                  title="Machos"
                  value={dashboardData.animales.machos}
                  icon="♂️"
                  trend={0}
                  description={`${((dashboardData.animales.machos / dashboardData.animales.total) * 100).toFixed(1)}% del total`}
                />
                <StatCard
                  title="Hembras"
                  value={dashboardData.animales.hembras}
                  icon="♀️"
                  trend={0}
                  description={`${((dashboardData.animales.hembras / dashboardData.animales.total) * 100).toFixed(1)}% del total`}
                />
                <StatCard
                  title="Ratio M/H"
                  value={dashboardData.animales.ratio_machos_hembras.toFixed(2)}
                  icon="⚖️"
                  trend={0}
                  description="Ratio machos/hembras"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Distribución por Estado</h3>
                  <StatusDistribution 
                    data={convertToStatusData(
                      dashboardData.animales.por_estado,
                      {
                        'activo': 'bg-green-500',
                        'inactivo': 'bg-red-500',
                        'vendido': 'bg-blue-500',
                        'muerto': 'bg-gray-500'
                      },
                      {
                        'activo': 'Activo',
                        'inactivo': 'Inactivo',
                        'vendido': 'Vendido',
                        'muerto': 'Muerto'
                      }
                    )} 
                  />
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Distribución por Cuadra</h3>
                  <StatusDistribution 
                    data={convertToStatusData(
                      dashboardData.animales.por_quadra,
                      {
                        'A': 'bg-green-500',
                        'B': 'bg-blue-500',
                        'C': 'bg-yellow-500',
                        'D': 'bg-purple-500',
                        'E': 'bg-pink-500'
                      },
                      {
                        'A': 'Cuadra A',
                        'B': 'Cuadra B',
                        'C': 'Cuadra C',
                        'D': 'Cuadra D',
                        'E': 'Cuadra E'
                      }
                    )} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Partos"
                  value={dashboardData.partos.total}
                  icon="🐣"
                  trend={0}
                  description="Partos registrados"
                />
                <StatCard
                  title="Último Mes"
                  value={dashboardData.partos.ultimo_mes}
                  icon="📅"
                  trend={0}
                  description="Partos en el último mes"
                />
                <StatCard
                  title="Último Año"
                  value={dashboardData.partos.ultimo_año}
                  icon="📆"
                  trend={0}
                  description="Partos en el último año"
                />
                <StatCard
                  title="Promedio Mensual"
                  value={dashboardData.partos.promedio_mensual.toFixed(1)}
                  icon="📊"
                  trend={dashboardData.partos.tendencia_partos.tendencia}
                  description="Partos por mes"
                />
              </div>
            </div>
          )}
          
          {activeTab === 'explotacion' && explotacionData && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Detalles de Explotación: {explotacionData.nombre}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Animales"
                  value={explotacionData.total_animales}
                  icon="🐄"
                  trend={0}
                  description="Animales en esta explotación"
                />
                <StatCard
                  title="Total Partos"
                  value={explotacionData.total_partos}
                  icon="🐣"
                  trend={0}
                  description="Partos en esta explotación"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Información Adicional</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(explotacionData, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'resumen' && resumen && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Resumen Básico</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Animales"
                  value={resumen.animales.total}
                  icon="🐄"
                  trend={0}
                  description="Animales registrados"
                />
                <StatCard
                  title="Total Partos"
                  value={resumen.partos.total}
                  icon="🐣"
                  trend={0}
                  description="Partos registrados"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Datos Completos</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(resumen, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'partos' && partosStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Estadísticas de Partos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Partos"
                  value={partosStats.total}
                  icon="🐣"
                  trend={0}
                  description="Partos registrados"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Distribución por Mes</h3>
                <div className="h-64">
                  {/* Aquí iría un gráfico de barras con los datos de partosStats.por_mes */}
                  <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(partosStats.por_mes, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Distribución por Género</h3>
                <div className="h-64">
                  {/* Aquí iría un gráfico de pastel con los datos de partosStats.por_genero */}
                  <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(partosStats.por_genero, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'combined' && combinedData && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Datos Combinados</h2>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Datos Completos</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(combinedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'recientes' && recentActivitiesData && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Actividades Recientes</h2>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <ActivityFeed activities={recentActivitiesData.activities} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
