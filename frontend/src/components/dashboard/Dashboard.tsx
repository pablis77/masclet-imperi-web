import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import StatusDistribution from './StatusDistribution';
import ActivityFeed from './ActivityFeed';
import { getDashboardStats } from '../../services/dashboardService';
import { dashboardStats as mockDashboardData } from '../../services/mockData';
import LoadingState from '../common/LoadingState';
import { isAuthenticated, getToken, getStoredUser } from '../../services/authService';

// Tipos para las respuestas de la API
interface AnimalStats {
  total: number;
  machos: number;
  hembras: number;
  ratio_machos_hembras: number;
  por_estado: Record<string, number>;
  por_alletar: Record<string, number>;
  por_quadra: Record<string, number>;
}

interface PartoStats {
  total: number;
  ultimo_mes: number;
  ultimo_año: number;
  promedio_mensual: number;
  por_mes: Record<string, number>;
  tendencia_partos: {
    tendencia: number;
    promedio: number;
    valores: Record<string, number>;
  }
}

interface DashboardResponse {
  explotacio_name?: string;
  fecha_inicio: string;
  fecha_fin: string;
  animales: AnimalStats;
  partos: PartoStats;
}

interface DashboardParams {
  explotacioId?: number;
  startDate?: string;
  endDate?: string;
}

// Adaptador para convertir los datos simulados al formato esperado
const createMockDashboardResponse = (): DashboardResponse => {
  // Crear datos de partos por mes
  const partsByMonth: Record<string, number> = {
    'ene': 3,
    'feb': 5,
    'mar': 2,
    'abr': 7,
    'may': 4,
    'jun': 6,
    'jul': 3,
    'ago': 5,
    'sep': 8,
    'oct': 4,
    'nov': 2,
    'dic': 5
  };
  
  // Crear datos de tendencia de partos
  const partosTrend: Record<string, number> = {
    'ene': 2,
    'feb': 3,
    'mar': 2,
    'abr': 4,
    'may': 3,
    'jun': 5,
    'jul': 3,
    'ago': 4,
    'sep': 6,
    'oct': 5,
    'nov': 4,
    'dic': 5
  };
  
  return {
    fecha_inicio: '2024-01-01',
    fecha_fin: '2024-12-31',
    animales: {
      total: mockDashboardData.totalAnimals,
      machos: mockDashboardData.maleAnimals,
      hembras: mockDashboardData.femaleAnimals,
      ratio_machos_hembras: mockDashboardData.maleAnimals / mockDashboardData.femaleAnimals,
      por_estado: {
        'ACT': mockDashboardData.okAnimals,
        'DEF': mockDashboardData.defAnimals,
        'BAI': mockDashboardData.totalAnimals - mockDashboardData.okAnimals - mockDashboardData.defAnimals
      },
      por_alletar: {
        'SI': mockDashboardData.allettingAnimals,
        'NO': mockDashboardData.totalAnimals - mockDashboardData.allettingAnimals
      },
      por_quadra: {
        'Q1': Math.floor(mockDashboardData.totalAnimals * 0.3),
        'Q2': Math.floor(mockDashboardData.totalAnimals * 0.2),
        'Q3': Math.floor(mockDashboardData.totalAnimals * 0.25),
        'Q4': Math.floor(mockDashboardData.totalAnimals * 0.25)
      }
    },
    partos: {
      total: 54,
      ultimo_mes: 5,
      ultimo_año: 54,
      promedio_mensual: 4.5,
      por_mes: partsByMonth,
      tendencia_partos: {
        tendencia: 0.15,
        promedio: 3.8,
        valores: partosTrend
      }
    }
  };
};

// Datos simulados para cuando la API no está disponible
const mockData: DashboardResponse = createMockDashboardResponse();

// Datos de ejemplo para actividad reciente
const recentActivities = [
  {
    id: '1',
    type: 'new_animal' as const,
    title: 'Nuevo animal registrado',
    description: 'Vaca ID: 2023-H-042 añadida a Explotación Norte',
    timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
    animalType: 'cow' as 'bull' | 'cow' | 'nursing-cow' | 'deceased'
  },
  {
    id: '2',
    type: 'update_animal' as const,
    title: 'Actualización de estado',
    description: 'Vaca ID: 2022-H-018 ahora en estado de amamantamiento',
    timestamp: new Date(Date.now() - 18000000), // 5 horas atrás
    animalType: 'nursing-cow' as 'bull' | 'cow' | 'nursing-cow' | 'deceased'
  },
  {
    id: '3',
    type: 'new_parto' as const,
    title: 'Nuevo parto registrado',
    description: 'Vaca ID: 2021-H-007 - Cría: 2023-M-043',
    code: 'PARTO-78',
    timestamp: new Date(Date.now() - 86400000), // 1 día atrás
    animalType: 'nursing-cow' as 'bull' | 'cow' | 'nursing-cow' | 'deceased'
  }
];

interface DashboardProps {
  title?: string;
  showExplotacionSelector?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  title = 'Panel de Control', 
  showExplotacionSelector = false 
}) => {
  // Estado para la explotación seleccionada
  const [selectedExplotacion, setSelectedExplotacion] = useState<number | null>(null);
  
  // Estado para las estadísticas
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<string>('Inicializando...');
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<'authenticated' | 'unauthenticated' | 'checking'>('checking');
  const [retryCount, setRetryCount] = useState<number>(0);

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = isAuthenticated();
        setAuthStatus(isAuth ? 'authenticated' : 'unauthenticated');
        
        if (!isAuth) {
          console.log('Usuario no autenticado, redirigiendo a login');
          setError('No estás autenticado. Redirigiendo a la página de login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } else {
          console.log('Usuario autenticado, token disponible');
          // Si estamos autenticados, verificar el rol del usuario
          try {
            const user = getStoredUser();
            if (user) {
              // Verificar si el usuario tiene permisos para ver el dashboard
              const hasAccess = ['administrador', 'gerente'].includes(user.role);
              if (!hasAccess) {
                setError(`No tienes permisos para acceder al dashboard. Tu rol actual es: ${user.role}`);
                setConnectionInfo('Error de permisos: No tienes acceso a esta sección');
                setConnectionStatus('error');
              }
            }
          } catch (roleError) {
            console.error('Error al verificar el rol del usuario:', roleError);
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setAuthStatus('unauthenticated');
        setError('Error al verificar autenticación. Por favor, recarga la página.');
      }
    };
    
    checkAuth();
  }, []);

  // Cargar estadísticas del dashboard cuando cambia la autenticación
  useEffect(() => {
    if (authStatus === 'authenticated') {
      loadDashboardStats({
        explotacioId: selectedExplotacion || undefined
      });
    }
  }, [authStatus, selectedExplotacion]);

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async (params: DashboardParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('loading');
      
      if (authStatus === 'unauthenticated') {
        console.error('No hay token de autenticación disponible');
        setConnectionInfo('Error de autenticación: No hay token disponible');
        setConnectionStatus('error');
        setError('No estás autenticado. Por favor, inicia sesión.');
        setLoading(false);
        
        setStats(mockData);
        setUseMockData(true);
        return;
      }
      
      console.log('Obteniendo datos del dashboard con parámetros:', params);
      setConnectionInfo(`Conectando con la API para obtener estadísticas...`);
      
      const data = await getDashboardStats(params);
      console.log('Datos del dashboard recibidos:', data);
      setStats(data);
      setUseMockData(false);
      setConnectionInfo('Conexión exitosa con la API');
      setConnectionStatus('success');
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar estadísticas del dashboard:', err);
      setConnectionStatus('error');
      
      if (err.code === 'UNAUTHORIZED' || err.status === 401) {
        setConnectionInfo(`Error de autenticación: No tienes permisos para acceder a estos datos.`);
        setError(`No estás autenticado o tu sesión ha expirado. Por favor, inicia sesión nuevamente.`);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('conexión')) {
        setConnectionInfo(`Error de conexión: No se pudo conectar con la API. Usando datos simulados.`);
        setError(`No se pudo conectar con el servidor. Verifica que la API esté en ejecución en http://127.0.0.1:8000`);
        setStats(mockData);
        setUseMockData(true);
      } else if (err.code === 'ENDPOINT_NOT_FOUND' || err.status === 404) {
        setConnectionInfo(`Error 404: El endpoint no existe o requiere autenticación.`);
        setError(`El endpoint de estadísticas no existe en el servidor o requiere autenticación. Verifica la ruta correcta en la API y tu sesión.`);
        
        // Si es el primer intento, intentar de nuevo con un token renovado
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setConnectionInfo(`Reintentando conexión (${retryCount + 1}/3)...`);
          
          // Esperar 2 segundos antes de reintentar
          setTimeout(() => {
            console.log(`Reintentando conexión (${retryCount + 1}/3)...`);
            loadDashboardStats(params);
          }, 2000);
          return;
        }
        
        setStats(mockData);
        setUseMockData(true);
      } else {
        setConnectionInfo(`Error al obtener estadísticas: ${err.message || 'Error desconocido'}`);
        setError(`Error al obtener estadísticas: ${err.message || 'Error desconocido'}`);
        setStats(mockData);
        setUseMockData(true);
      }
      
      setLoading(false);
    }
  };

  // Función para reintentar la carga de datos
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
    const params: DashboardParams = {};
    if (selectedExplotacion) {
      params.explotacioId = selectedExplotacion;
    }
    loadDashboardStats(params);
  };

  // Cargar estadísticas al montar el componente o cambiar la explotación seleccionada
  useEffect(() => {
    if (authStatus === 'authenticated') {
      const params: DashboardParams = {};
      if (selectedExplotacion) {
        params.explotacioId = selectedExplotacion;
      }
      loadDashboardStats(params);
    } else if (authStatus === 'checking') {
      setLoading(true);
    } else {
      setStats(mockData);
      setUseMockData(true);
      setLoading(false);
    }
  }, [selectedExplotacion, authStatus, retryCount]);

  // Manejar el cambio de explotación
  const handleExplotacionChange = (explotacionId: number | null) => {
    setSelectedExplotacion(explotacionId);
  };

  // Convertir datos para StatusDistribution
  const convertToStatusData = (data: Record<string, number> = {}, colorMap: Record<string, string>, labelMap: Record<string, string>) => {
    return Object.entries(data).map(([key, value]) => ({
      label: labelMap[key] || key,
      value,
      color: colorMap[key] || 'bg-gray-500'
    }));
  };

  // Renderizar el componente
  return (
    <div className="space-y-6">
      {/* Información de conexión */}
      <div className={`text-sm font-medium ${
        connectionStatus === 'loading' ? 'text-blue-500' :
        connectionStatus === 'success' ? 'text-green-500' :
        'text-red-500'
      }`}>
        {connectionInfo}
        {useMockData && (
          <span className="ml-2 text-yellow-500 font-bold">
            (Usando datos simulados)
          </span>
        )}
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
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors"
                >
                  Reintentar conexión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <LoadingState message="Cargando estadísticas..." />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Animales" 
              value={stats.animales.total} 
              icon="🐄"
              color="primary"
            />
            <StatCard 
              title="Machos" 
              value={stats.animales.machos} 
              icon="♂️"
              color="info"
            />
            <StatCard 
              title="Hembras" 
              value={stats.animales.hembras} 
              icon="♀️"
              color="success"
            />
            <StatCard 
              title="Ratio M/H" 
              value={stats.animales.ratio_machos_hembras.toFixed(2)} 
              icon="⚖️"
              color="warning"
            />
          </div>

          {/* Distribución por estado y amamantamiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusDistribution 
              title="Distribución por Estado" 
              data={convertToStatusData(
                stats.animales.por_estado || {},
                {
                  'ACT': 'bg-green-500',
                  'DEF': 'bg-red-500',
                  'BAI': 'bg-yellow-500'
                },
                {
                  'ACT': 'Activos',
                  'DEF': 'Fallecidos',
                  'BAI': 'Bajas'
                }
              )}
            />
            <StatusDistribution 
              title="Distribución por Amamantamiento" 
              data={convertToStatusData(
                stats.animales.por_alletar || {},
                {
                  'SI': 'bg-blue-500',
                  'NO': 'bg-gray-500'
                },
                {
                  'SI': 'Amamantando',
                  'NO': 'No Amamantando'
                }
              )}
            />
          </div>

          {/* Estadísticas de partos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Partos" 
              value={stats.partos.total} 
              icon="🐣"
              color="success"
            />
            <StatCard 
              title="Partos Último Mes" 
              value={stats.partos.ultimo_mes} 
              icon="📅"
              color="warning"
            />
            <StatCard 
              title="Promedio Mensual" 
              value={stats.partos.promedio_mensual.toFixed(1)} 
              icon="📊"
              color="info"
            />
          </div>

          {/* Actividad reciente */}
          <ActivityFeed 
            activities={recentActivities}
            title="Actividad reciente"
          />
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay datos disponibles</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
