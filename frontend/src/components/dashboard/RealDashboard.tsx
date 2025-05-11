import React, { useEffect, useState } from 'react';
import {
  getFullDashboardStats,
  getDashboardResumen,
  getPartosStats,
  getCombinedStats
} from '../../services/realDashboardService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Componente principal del Dashboard Real
const RealDashboard: React.FC = () => {
  // Estados para almacenar datos
  const [stats, setStats] = useState<any>(null);
  const [partos, setPartos] = useState<any>(null);
  const [resumen, setResumen] = useState<any>(null);
  const [combined, setCombined] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('resumen');

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar datos del resumen primero (es el más ligero)
      const resumenData = await getDashboardResumen();
      setResumen(resumenData);

      // Luego cargar estadísticas completas
      const statsData = await getFullDashboardStats();
      setStats(statsData);

      // Cargar datos de partos
      const partosData = await getPartosStats();
      setPartos(partosData);

      // Finalmente, cargar datos combinados
      const combinedData = await getCombinedStats();
      setCombined(combinedData);
    } catch (err: any) {
      console.error('Error al cargar datos del dashboard:', err);
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar datos del gráfico de partos por mes
  const getPartosPorMesChartData = () => {
    if (!stats || !stats.partos || !stats.partos.por_mes) return null;

    const months = Object.keys(stats.partos.por_mes);
    const values = Object.values(stats.partos.por_mes) as number[];

    return {
      labels: months,
      datasets: [
        {
          label: 'Partos por Mes',
          data: values,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        }
      ]
    };
  };

  // Función para generar datos del gráfico de animales por estado
  const getAnimalesPorEstadoChartData = () => {
    if (!stats || !stats.animales || !stats.animales.por_estado) return null;

    const estados = Object.keys(stats.animales.por_estado);
    const counts = Object.values(stats.animales.por_estado) as number[];

    return {
      labels: estados,
      datasets: [
        {
          label: 'Animales por Estado',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // Función para generar datos del gráfico de distribución por cuadra
  const getAnimalesPorCuadraChartData = () => {
    if (!stats || !stats.animales || !stats.animales.por_quadra) return null;

    const cuadras = Object.keys(stats.animales.por_quadra);
    const counts = Object.values(stats.animales.por_quadra) as number[];

    return {
      labels: cuadras,
      datasets: [
        {
          label: 'Animales por Cuadra',
          data: counts,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Panel de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg font-semibold dark:text-white">Cargando estadísticas reales...</p>
      </div>
    );
  }

  // Panel de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error al cargar datos</h2>
        <p className="text-red-600 dark:text-red-300 text-center">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Panel para cuando no hay datos
  if (!stats && !resumen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No hay datos disponibles</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">No se encontraron estadísticas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Panel de navegación */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'resumen'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('animales')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'animales'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Animales
        </button>
        <button
          onClick={() => setActiveTab('partos')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'partos'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Partos
        </button>
        <button
          onClick={() => setActiveTab('cuadras')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'cuadras'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Cuadras
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'raw'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Datos Raw
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      <div className="p-4">
        {/* Resumen */}
        {activeTab === 'resumen' && resumen && (
          <div>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Resumen General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Total Animales */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total Animales</h3>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {resumen.animales?.total || 0}
                </p>
              </div>
              
              {/* Machos/Hembras */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Machos / Hembras</h3>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {resumen.animales?.machos || 0} / {resumen.animales?.hembras || 0}
                </p>
              </div>
              
              {/* Total Partos */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Total Partos</h3>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {resumen.partos?.total || 0}
                </p>
              </div>
            </div>
            
            {/* Gráfico principal */}
            {getPartosPorMesChartData() && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Partos por Mes</h3>
                <div className="h-64">
                  <Bar 
                    data={getPartosPorMesChartData() || {labels: [], datasets: []}} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        },
                        x: {
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Animales */}
        {activeTab === 'animales' && stats && (
          <div>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Estadísticas de Animales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Distribución por Estado */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Distribución por Estado</h3>
                <div className="h-64">
                  {getAnimalesPorEstadoChartData() ? (
                    <Pie 
                      data={getAnimalesPorEstadoChartData() || {labels: [], datasets: []}}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right' as const,
                            labels: {
                              color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Datos Adicionales */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Información Detallada</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Distribución por Género</h4>
                    <div className="flex items-center">
                      <div className="w-1/2 bg-gray-200 dark:bg-gray-600 rounded-l-full h-4">
                        <div 
                          className="bg-blue-500 h-4 rounded-l-full"
                          style={{ 
                            width: `${stats.animales && stats.animales.total ? 
                              (stats.animales.machos / stats.animales.total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="w-1/2 bg-gray-200 dark:bg-gray-600 rounded-r-full h-4">
                        <div 
                          className="bg-pink-500 h-4 rounded-r-full ml-auto"
                          style={{ 
                            width: `${stats.animales && stats.animales.total ? 
                              (stats.animales.hembras / stats.animales.total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-blue-600 dark:text-blue-400">Machos: {stats.animales?.machos || 0}</span>
                      <span className="text-pink-600 dark:text-pink-400">Hembras: {stats.animales?.hembras || 0}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Distribución por Amamantamiento</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">No Amamantan</p>
                        <p className="text-lg font-semibold dark:text-white">{stats.animales?.por_alletar?.['0'] || 0}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Un Ternero</p>
                        <p className="text-lg font-semibold dark:text-white">{stats.animales?.por_alletar?.['1'] || 0}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dos Terneros</p>
                        <p className="text-lg font-semibold dark:text-white">{stats.animales?.por_alletar?.['2'] || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partos */}
        {activeTab === 'partos' && partos && (
          <div>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Estadísticas de Partos</h2>
            
            {/* Información general de partos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Total Partos Registrados</h3>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {partos.total || 0}
                </p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Partos Último Mes</h3>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {partos.ultimo_mes || 0}
                </p>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Promedio Mensual</h3>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {partos.promedio_mensual?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
            
            {/* Gráfico de partos por mes */}
            {getPartosPorMesChartData() && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Partos a lo Largo del Tiempo</h3>
                <div className="h-64">
                  <Bar 
                    data={getPartosPorMesChartData() || {labels: [], datasets: []}} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        },
                        x: {
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cuadras */}
        {activeTab === 'cuadras' && stats && (
          <div>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Distribución por Cuadras</h2>
            
            {/* Gráfico de distribución por cuadra */}
            {getAnimalesPorCuadraChartData() && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Animales por Cuadra</h3>
                <div className="h-64">
                  <Bar 
                    data={getAnimalesPorCuadraChartData() || {labels: [], datasets: []}} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        },
                        x: {
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Datos Raw */}
        {activeTab === 'raw' && (
          <div>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Datos Raw</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Estadísticas Completas</h3>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Resumen</h3>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(resumen, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Partos</h3>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(partos, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealDashboard;
