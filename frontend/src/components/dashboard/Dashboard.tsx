import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import StatusDistribution from './StatusDistribution';
import ActivityFeed from './ActivityFeed';
import api, { fetchData, handleApiError } from '../../services/api';
import LoadingState from '../common/LoadingState';

// Tipos para las respuestas de la API
export interface DashboardParams {
  explotacio_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface DashboardResponse {
  explotacio_name: string;
  fecha_inicio: string;
  fecha_fin: string;
  animales: {
    total: number;
    machos: number;
    hembras: number;
    ratio_machos_hembras: number;
    por_estado: {
      [key: string]: number;
    };
    por_alletar: {
      [key: string]: number;
    };
    por_quadra: {
      [key: string]: number;
    };
  };
  partos: {
    total: number;
    ultimo_mes: number;
    ultimo_año: number;
    promedio_mensual: number;
    por_mes: {
      [key: string]: number;
    };
    tendencia_partos: {
      tendencia: number;
      promedio: number;
      valores: {
        [key: string]: number;
      };
    };
  };
}

// Datos simulados para desarrollo o como fallback
const mockData: DashboardResponse = {
  explotacio_name: '',
  fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  fecha_fin: new Date().toISOString(),
  animales: {
    total: 245,
    machos: 87,
    hembras: 158,
    ratio_machos_hembras: 0.55,
    por_estado: {
      'OK': 220,
      'DEF': 15,
      'VEN': 10
    },
    por_alletar: {
      '0': 120,
      '1': 38
    },
    por_quadra: {
      'Q1': 45,
      'Q2': 38,
      'Q3': 52,
      'Q4': 60,
      'Q5': 50
    }
  },
  partos: {
    total: 42,
    ultimo_mes: 5,
    ultimo_año: 38,
    promedio_mensual: 3.5,
    por_mes: {
      'ene': 3,
      'feb': 4,
      'mar': 2,
      'abr': 5,
      'may': 3,
      'jun': 2,
      'jul': 4,
      'ago': 5,
      'sep': 3,
      'oct': 4,
      'nov': 2,
      'dic': 5
    },
    tendencia_partos: {
      tendencia: 0.2,
      promedio: 3.5,
      valores: {
        '2023-01': 3,
        '2023-02': 4,
        '2023-03': 3,
        '2023-04': 5,
        '2023-05': 4,
        '2023-06': 3
      }
    }
  }
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardResponse | null>(mockData); // Inicializar con datos simulados
  const [useMockData, setUseMockData] = useState<boolean>(false);

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async (params: DashboardParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        // Si estamos en modo de datos simulados, usar mockData después de un pequeño retraso
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats(mockData);
        setLoading(false);
        return;
      }
      
      // Intentar obtener datos reales de la API
      const data = await fetchData('/api/v1/dashboard/stats', params);
      setStats(data);
      setUseMockData(false);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
      handleApiError(err, setError, 'Error al cargar las estadísticas del dashboard');
      
      // Si hay un error, usar datos simulados como fallback
      setStats(mockData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    // Cargar datos inmediatamente
    loadDashboardStats();
    
    // Establecer un intervalo para actualizar los datos cada 5 minutos
    const intervalId = setInterval(() => {
      loadDashboardStats();
    }, 5 * 60 * 1000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  // Formatear números para mostrar
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Datos de ejemplo para actividad reciente
  const recentActivities = [
    {
      id: '1',
      type: 'new_animal' as const,
      title: 'Nuevo animal registrado',
      description: 'Vaca ID: 2023-H-042 añadida a Explotación Norte',
      timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
      animalType: 'cow' as 'bull' | 'cow' | 'nursing-cow'
    },
    {
      id: '2',
      type: 'update_animal' as const,
      title: 'Actualización de estado',
      description: 'Vaca ID: 2022-H-018 ahora en estado de amamantamiento',
      timestamp: new Date(Date.now() - 18000000), // 5 horas atrás
      animalType: 'nursing-cow' as 'bull' | 'cow' | 'nursing-cow'
    },
    {
      id: '3',
      type: 'new_parto' as const,
      title: 'Nuevo parto registrado',
      description: 'Vaca ID: 2021-H-007 - Cría: 2023-M-043',
      code: 'PARTO-78',
      timestamp: new Date(Date.now() - 86400000), // 1 día atrás
      animalType: 'nursing-cow' as 'bull' | 'cow' | 'nursing-cow'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      {/* Usar el componente LoadingState para manejar estados de carga y error */}
      <LoadingState 
        isLoading={loading} 
        isError={!!error} 
        errorMessage={error || 'Error al cargar las estadísticas'} 
        loadingMessage="Cargando estadísticas..."
        onRetry={() => loadDashboardStats()}
      >
        {stats && (
          <>
            {/* Mensaje de datos simulados */}
            {useMockData && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    ⚠️
                  </div>
                  <div className="ml-3">
                    <h3 className="text-base sm:text-lg font-medium text-amber-800 dark:text-amber-300">Datos simulados</h3>
                    <div className="mt-2 text-amber-700 dark:text-amber-200">
                      <p className="text-sm">Mostrando datos de ejemplo debido a problemas de conexión con el servidor.</p>
                    </div>
                    <div className="mt-3 sm:mt-4">
                      <button 
                        onClick={() => {
                          setUseMockData(false);
                          loadDashboardStats();
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        🔄 Intentar cargar datos reales
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Estadísticas generales */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Estadísticas generales</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {stats.fecha_inicio && stats.fecha_fin && (
                  <>
                    Periodo: {new Date(stats.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(stats.fecha_fin).toLocaleDateString('es-ES')}
                  </>
                )}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Animales" 
                  value={formatNumber(stats.animales.total)} 
                  icon="🐄" 
                  subtitle="Todos los animales registrados"
                  color="primary"
                />
                
                <StatCard 
                  title="Machos" 
                  value={formatNumber(stats.animales.machos)} 
                  icon="🐂" 
                  subtitle={`${Math.round(stats.animales.machos / stats.animales.total * 100)}% del total`}
                  color="info"
                />
                
                <StatCard 
                  title="Hembras" 
                  value={formatNumber(stats.animales.hembras)} 
                  icon="🐄" 
                  subtitle={`${Math.round(stats.animales.hembras / stats.animales.total * 100)}% del total`}
                  color="success"
                />
                
                <StatCard 
                  title="Amamantando" 
                  value={formatNumber(stats.animales.por_alletar['1'] || 0)} 
                  icon="🍼" 
                  subtitle={`${Math.round((stats.animales.por_alletar['1'] || 0) / stats.animales.total * 100)}% del total`}
                  color="warning"
                />
              </div>
            </div>
            
            {/* Distribución por estado */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Distribución por estado</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                <StatusDistribution 
                  data={[
                    { label: 'Activos', value: stats.animales.por_estado['OK'] || 0, color: 'bg-green-500' },
                    { label: 'Fallecidos', value: stats.animales.por_estado['DEF'] || 0, color: 'bg-gray-500' },
                    { label: 'Vendidos', value: stats.animales.por_estado['VEN'] || 0, color: 'bg-blue-500' }
                  ]}
                />
              </div>
            </div>
            
            {/* Distribución por cuadra */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Distribución por cuadra</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(stats.animales.por_quadra).map(([quadra, cantidad]) => (
                  <div key={quadra} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">{quadra}</h3>
                    <p className="text-3xl font-bold text-primary">{cantidad}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round(cantidad / stats.animales.total * 100)}% del total</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actividad reciente */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Actividad reciente</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <ActivityFeed activities={recentActivities} />
              </div>
            </div>
          </>
        )}
      </LoadingState>
    </div>
  );
};

export default Dashboard;
