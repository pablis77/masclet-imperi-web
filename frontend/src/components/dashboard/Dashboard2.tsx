import React, { useEffect, useState } from 'react';
import { 
  getDashboardStats, 
  getRecentActivities, 
  getExplotaciones
} from '../../services/dashboardService';
import type { 
  DashboardResponse, 
  Activity, 
  RecentActivityResponse, 
  ExplotacionResponse
} from '../../services/dashboardService';
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
import { Bar, Doughnut } from 'react-chartjs-2';

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

// Componente principal del Dashboard
const Dashboard2: React.FC<{ showDebugInfo?: boolean }> = ({ showDebugInfo = false }) => {
  // Estados para almacenar datos
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [apiCalls, setApiCalls] = useState(0);
  const [explotaciones, setExplotaciones] = useState<ExplotacionResponse[]>([]);
  const [selectedExplotacion, setSelectedExplotacion] = useState<number | null>(null);

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      console.log('📊 [Dashboard] Cargando datos del dashboard...');
      setApiCalls(prev => prev + 1);
      setLoading(true);
      
      // Obtener lista de explotaciones
      console.log('📥 [Dashboard] Obteniendo lista de explotaciones...');
      const explotacionesData = await getExplotaciones();
      console.log('💡 [Dashboard] Explotaciones obtenidas:', explotacionesData);
      setExplotaciones(explotacionesData);
      
      // Establecer la explotación seleccionada si no hay ninguna seleccionada
      if (!selectedExplotacion && explotacionesData.length > 0) {
        console.log('🚨 [Dashboard] Seleccionando primera explotación automáticamente:', explotacionesData[0].id);
        setSelectedExplotacion(explotacionesData[0].id);
      }
      
      // Parámetros para las solicitudes
      const params = {
        explotacioId: selectedExplotacion || undefined
      };
      console.log('🔎 [Dashboard] Parámetros para obtener datos:', params);
      
      // Obtener estadísticas generales
      console.log('📊 [Dashboard] Obteniendo estadísticas generales...');
      const dashboardData = await getDashboardStats(params);
      console.log('📊 [Dashboard] Datos del dashboard recibidos:', JSON.stringify(dashboardData, null, 2));
      setStats(dashboardData);
      
      // Obtener actividades recientes
      console.log('💬 [Dashboard] Obteniendo actividades recientes...');
      const activitiesData = await getRecentActivities();
      console.log('💬 [Dashboard] Actividades recientes recibidas:', activitiesData);
      setActivities(activitiesData.activities || []);
      
      console.log('✅ [Dashboard] Datos cargados correctamente');
      setError(null);
    } catch (error: any) {
      console.error('❌ [Dashboard] Error al cargar datos:', error);
      setError({ message: `Error al cargar datos: ${error.message || 'Error desconocido'}` });
      setActivities([
        { 
          id: '0', 
          type: 'error', 
          title: 'Error',
          description: `Error al cargar actividades: ${error.message || 'Error desconocido'}`, 
          timestamp: new Date().toISOString() 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente o cuando cambia la explotación
  useEffect(() => {
    console.log('📊 [Dashboard] Efecto de carga activado, explotación seleccionada:', selectedExplotacion);
    loadDashboardData();
  }, [selectedExplotacion]);

  // Función para cambiar la explotación seleccionada
  const handleExplotacionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExplotacion(Number(event.target.value));
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Componente de tarjeta de estadísticas
  const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
    <div className={`stat-card ${color} p-4 rounded-lg shadow-md flex items-center`}>
      <div className="stat-icon mr-4 text-3xl">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  // Calcular el total de terneros basado en el estado de amamantamiento
  const calcularTotalTerneros = () => {
    if (!stats) return 0;
    
    console.log('🐄 [Dashboard] Calculando total de terneros, datos por_alletar:', stats.animales.por_alletar);
    
    // Si existe la propiedad por_alletar, la usamos para calcular el total de terneros
    if (stats.animales.por_alletar) {
      let total = 0;
      
      // Sumar todos los terneros según el estado de amamantamiento
      // Una vaca amamantando 1 ternero = 1 ternero
      // Una vaca amamantando 2 terneros = 2 terneros
      if (stats.animales.por_alletar['1']) {
        total += stats.animales.por_alletar['1']; // Vacas con 1 ternero
        console.log(`🐄 [Dashboard] Vacas con 1 ternero: ${stats.animales.por_alletar['1']}`);
      } else {
        console.log('🐄 [Dashboard] No hay vacas con 1 ternero');
      }
      
      if (stats.animales.por_alletar['2']) {
        total += stats.animales.por_alletar['2'] * 2; // Vacas con 2 terneros (cada una cuenta como 2)
        console.log(`🐄 [Dashboard] Vacas con 2 terneros: ${stats.animales.por_alletar['2']} (contando como ${stats.animales.por_alletar['2'] * 2})`);
      } else {
        console.log('🐄 [Dashboard] No hay vacas con 2 terneros');
      }
      
      console.log(`🐄 [Dashboard] Total de terneros calculado: ${total}`);
      return total;
    }
    
    console.log('🐄 [Dashboard] No hay datos de por_alletar, devolviendo 0 terneros');
    return 0;
  };

  // Datos para el gráfico de distribución de animales por estado
  const getAnimalDistributionData = () => {
    if (!stats) return null;
    
    const labels = Object.keys(stats.animales.por_estado);
    const data = labels.map(estado => stats.animales.por_estado[estado]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Distribución de Animales',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Datos para el gráfico de distribución de animales por quadra
  const getQuadraDistributionData = () => {
    if (!stats) return null;
    
    const labels = Object.keys(stats.animales.por_quadra);
    const data = labels.map(quadra => stats.animales.por_quadra[quadra]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Animales por Quadra',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };
  };

  // Datos para el gráfico de distribución por género
  const getGenderDistributionData = () => {
    if (!stats) return null;
    
    return {
      labels: ['Machos', 'Hembras'],
      datasets: [
        {
          label: 'Distribución por Género',
          data: [stats.animales.machos, stats.animales.hembras],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Datos para el gráfico de distribución por estado de amamantamiento
  const getAmamantatChartData = () => {
    if (!stats || !stats.animales.por_alletar) return null;
    
    const labels = ['Sin amamantar', 'Amamantando 1 ternero', 'Amamantando 2 terneros'];
    const data = [
      stats.animales.por_alletar['0'] || 0,
      stats.animales.por_alletar['1'] || 0,
      stats.animales.por_alletar['2'] || 0
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Estado de Amamantamiento',
          data,
          backgroundColor: [
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Opciones comunes para los gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Renderizar componente
  return (
    <div className="dashboard-container">
      {/* Cabecera del Dashboard */}
      <div className="dashboard-header mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard de Gestión Ganadera</h1>
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
            {/* Selector de explotación */}
            <div className="flex items-center">
              <label htmlFor="explotacion" className="mr-2 font-medium">Explotación:</label>
              <select
                id="explotacion"
                className="border rounded-md px-3 py-2"
                value={selectedExplotacion || ''}
                onChange={handleExplotacionChange}
                disabled={loading || explotaciones.length === 0}
              >
                {explotaciones.length === 0 ? (
                  <option value="">No hay explotaciones</option>
                ) : (
                  explotaciones.map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.nombre}</option>
                  ))
                )}
              </select>
            </div>
            
            {/* Botón de recarga */}
            <button 
              onClick={loadDashboardData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        
        {/* Información de explotación */}
        {stats && stats.explotacio_name && (
          <div className="bg-gray-100 p-3 rounded-md text-center">
            <p className="text-gray-700">
              Mostrando datos para la explotación <span className="font-semibold">{stats.explotacio_name}</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Mostrar loader mientras se cargan los datos */}
      {loading ? (
        <div className="loading-indicator flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error al cargar datos</h2>
          <p>{error.message}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas principales */}
          {stats && (
            <div className="stats-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                title="Total Animales" 
                value={stats.animales.total} 
                icon="🐄" 
                color="bg-blue-50"
              />
              <StatCard 
                title="Ratio Machos/Hembras" 
                value={`${stats.animales.machos}/${stats.animales.hembras}`} 
                icon="⚤" 
                color="bg-purple-50"
              />
              <StatCard 
                title="Total Terneros" 
                value={calcularTotalTerneros()} 
                icon="🐮" 
                color="bg-green-50"
              />
              <StatCard 
                title="Vacas Amamantando" 
                value={(stats.animales.por_alletar && (stats.animales.por_alletar['1'] || 0) + (stats.animales.por_alletar['2'] || 0)) || 0} 
                icon="🥛" 
                color="bg-yellow-50"
              />
            </div>
          )}
          
          {/* Gráficos principales */}
          <div className="dashboard-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de distribución por estado de amamantamiento */}
            <div className="chart-container bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Estado de Amamantamiento</h2>
              <div className="h-64 flex justify-center">
                {stats && stats.animales.por_alletar && getAmamantatChartData() && (
                  <Doughnut 
                    data={getAmamantatChartData()!} 
                    options={chartOptions} 
                  />
                )}
              </div>
            </div>
            
            {/* Gráfico de distribución por género */}
            <div className="chart-container bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Distribución por Género</h2>
              <div className="h-64 flex justify-center">
                {stats && getGenderDistributionData() && (
                  <Doughnut 
                    data={getGenderDistributionData()!} 
                    options={chartOptions} 
                  />
                )}
              </div>
            </div>
            
            {/* Gráfico de distribución por estado */}
            <div className="chart-container bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Distribución por Estado</h2>
              <div className="h-64">
                {stats && getAnimalDistributionData() && (
                  <Doughnut 
                    data={getAnimalDistributionData()!} 
                    options={chartOptions} 
                  />
                )}
              </div>
            </div>
            
            {/* Gráfico de distribución por quadra */}
            <div className="chart-container bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Animales por Quadra</h2>
              <div className="h-64">
                {stats && getQuadraDistributionData() && (
                  <Bar 
                    data={getQuadraDistributionData()!} 
                    options={chartOptions} 
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Sección de actividades recientes */}
          <div className="recent-activities bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Actividades Recientes</h2>
              <a href="/actividades" className="text-blue-500 hover:text-blue-700">Ver todas</a>
            </div>
            
            {activities.length > 0 ? (
              <div className="activities-list divide-y">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{activity.title || activity.type}</p>
                        <p className="text-gray-600">{activity.description}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay actividades recientes</p>
            )}
          </div>
          
          {/* Enlaces rápidos a otras secciones */}
          <div className="quick-links grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/animales" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-xl mr-2">🐄</span>
              <span className="font-medium">Gestión de Animales</span>
            </a>
            <a href="/explotaciones" className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-xl mr-2">🏡</span>
              <span className="font-medium">Explotaciones</span>
            </a>
          </div>
        </>
      )}
      
      {/* Información de depuración */}
      <div className="debug-info bg-gray-100 p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-semibold mb-2">Información de Depuración</h2>
        <p className="mb-1">Número de llamadas a la API: {apiCalls}</p>
        <p className="mb-1">Explotación seleccionada: {selectedExplotacion || 'Ninguna'}</p>
        <p className="mb-1">Total explotaciones disponibles: {explotaciones.length}</p>
        
        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">Estado de las propiedades clave:</h3>
          <ul className="list-disc pl-5">
            <li>stats: {stats ? '✅ Presente' : '❌ No disponible'}</li>
            <li>stats.animales: {stats?.animales ? '✅ Presente' : '❌ No disponible'}</li>
            <li>stats.animales.por_alletar: {stats?.animales?.por_alletar ? '✅ Presente' : '❌ No disponible'}</li>
            <li>stats.animales.por_estado: {stats?.animales?.por_estado ? '✅ Presente' : '❌ No disponible'}</li>
            <li>stats.animales.por_quadra: {stats?.animales?.por_quadra ? '✅ Presente' : '❌ No disponible'}</li>
            <li>stats.partos: {stats?.partos ? '✅ Presente' : '❌ No disponible'}</li>
            <li>stats.partos.por_mes: {stats?.partos?.por_mes ? '✅ Presente' : '❌ No disponible'}</li>
          </ul>
        </div>
        
        {stats && (
          <>
            <h3 className="text-md font-semibold mt-4 mb-2">Datos completos:</h3>
            <pre className="bg-gray-200 p-3 rounded-md overflow-auto max-h-60 text-xs">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </>
        )}
        
        {activities && activities.length > 0 && (
          <>
            <h3 className="text-md font-semibold mt-4 mb-2">Actividades:</h3>
            <pre className="bg-gray-200 p-3 rounded-md overflow-auto max-h-60 text-xs">
              {JSON.stringify(activities, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard2;
