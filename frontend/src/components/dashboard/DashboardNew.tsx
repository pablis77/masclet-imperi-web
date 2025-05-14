import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Importar traducciones
import esTranslations from '../../i18n/locales/es.json';
import caTranslations from '../../i18n/locales/ca.json';

// Registrar componentes Chart.js necesarios
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Interface para el tipo de respuesta del endpoint /api/v1/dashboard/resumen/
 * Basado en lo que el backend realmente devuelve
 */
interface DashboardResumen {
  total_animales: number;
  total_terneros: number;
  total_partos: number;
  ratio_partos_animal: number;
  tendencias: {
    partos_mes_anterior: number;
    partos_actual: number;
    nacimientos_promedio: number;
  };
  terneros: {
    total: number;
  };
  explotaciones: {
    count: number;
  };
  partos: {
    total: number;
  };
  periodo: {
    inicio: string;
    fin: string;
  };
}

/**
 * Componente Dashboard nuevo para depurar problemas de comunicación
 */
const DashboardNew: React.FC = () => {
  // Estados
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [requestLogs, setRequestLogs] = useState<string[]>([]);
  const [currentLang, setCurrentLang] = useState<string>('es');
  
  // Función para obtener traducciones
  const t = (key: string) => {
    const translationsMap: {[key: string]: any} = {
      'es': esTranslations,
      'ca': caTranslations
    };
    
    // Función auxiliar para obtener un valor anidado
    const getNestedValue = (obj: any, path: string) => {
      const keys = path.split('.');
      return keys.reduce((o, k) => (o || {})[k], obj) || key;
    };
    
    return getNestedValue(translationsMap[currentLang], key);
  };
  
  // Efecto para detectar cambios de idioma
  useEffect(() => {
    // Obtener idioma inicial
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);
    
    // Escuchar cambios en el idioma
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);

  // Función para añadir logs de depuración
  const addLog = (message: string) => {
    setRequestLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
    console.log(`[DashboardNew] ${message}`);
  };

  // Función para obtener datos del dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    addLog('Iniciando petición a /api/v1/dashboard/resumen/');

    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        addLog('⚠️ No se encontró token en localStorage');
        setError('No hay sesión activa. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      addLog(`Token encontrado: ${token.substring(0, 15)}...`);

      // Realizar petición con el token JWT
      const response = await axios.get('http://localhost:8000/api/v1/dashboard/resumen/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      addLog(`✅ Respuesta recibida con status: ${response.status}`);
      addLog(`Datos recibidos: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
      // Guardar datos
      setData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        addLog(`❌ Error en la petición: ${status} - ${err.message}`);
        
        if (status === 401) {
          setError('Error de autenticación. Por favor inicie sesión nuevamente.');
        } else {
          setError(`Error al obtener datos: ${err.message}`);
        }
      } else {
        addLog(`❌ Error inesperado: ${String(err)}`);
        setError('Error inesperado al obtener datos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Renderizar información de depuración
  const renderDebugInfo = () => (
    <div className="bg-gray-100 p-4 mt-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Información de depuración</h3>
      <button 
        onClick={fetchDashboardData}
        className="bg-blue-500 text-white px-3 py-1 rounded mb-3 hover:bg-blue-600"
      >
        Recargar datos
      </button>
      <div className="bg-white p-3 rounded shadow overflow-auto max-h-48">
        {requestLogs.map((log, index) => (
          <div key={index} className="text-xs font-mono mb-1">{log}</div>
        ))}
      </div>
    </div>
  );

  // Renderizar tarjetas de estadísticas con colores e íconos
  const renderStatCards = () => {
    if (!data) return null;
    
    const cards = [
      {
        title: t('dashboard.animals_count'),
        value: data.total_animales,
        icon: "🐄",
        color: "bg-blue-100 border-blue-500",
        textColor: "text-blue-700"
      },
      {
        title: t('dashboard.terneros_count') || "Total Terneros",
        value: data.total_terneros,
        icon: "🐑",
        color: "bg-green-100 border-green-500",
        textColor: "text-green-700"
      },
      {
        title: t('dashboard.partos_count'),
        value: data.total_partos,
        icon: "🔄",
        color: "bg-purple-100 border-purple-500",
        textColor: "text-purple-700"
      },
      {
        title: "Ratio Partos/Animal",
        value: data.ratio_partos_animal,
        icon: "📊",
        color: "bg-yellow-100 border-yellow-500",
        textColor: "text-yellow-700"
      }
    ];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className={`p-4 rounded-lg shadow border-l-4 ${card.color}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-700 text-sm font-medium">{card.title}</h3>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar tendencias con gráficos
  const renderTendencias = () => {
    if (!data || !data.tendencias) return null;
    
    // Datos para gráfico de tendencias
    const chartData = {
      labels: ['Mes Anterior', 'Mes Actual'],
      datasets: [
        {
          label: 'Partos por Mes',
          data: [data.tendencias.partos_mes_anterior, data.tendencias.partos_actual],
          backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
          borderColor: ['rgb(54, 162, 235)', 'rgb(75, 192, 192)'],
          borderWidth: 1,
        },
      ],
    };
    
    // Opciones para el gráfico
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Evolución de Partos',
        },
      },
    };
    
    // Datos para gráfico circular de distribuciones
    const pieData = {
      labels: ['Terneros', 'Resto de Animales'],
      datasets: [
        {
          data: [data.total_terneros, data.total_animales - data.total_terneros],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Calcular variación porcentual
    const variacion = data.tendencias.partos_mes_anterior > 0 
      ? ((data.tendencias.partos_actual - data.tendencias.partos_mes_anterior) / data.tendencias.partos_mes_anterior * 100).toFixed(1)
      : "0";
      
    const variacionColor = parseFloat(variacion) >= 0 ? 'text-green-600' : 'text-red-600';
    const variacionIcono = parseFloat(variacion) >= 0 ? '↑' : '↓';
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mt-8 mb-4">{t('dashboard.trends')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-gray-600 text-sm font-medium">{t('dashboard.previous_month_births')}</h4>
              <p className="text-xl font-bold">{data.tendencias.partos_mes_anterior}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-gray-600 text-sm font-medium">{t('dashboard.current_month_births')}</h4>
              <p className="text-xl font-bold">{data.tendencias.partos_actual}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-gray-600 text-sm font-medium">{t('dashboard.variation')}</h4>
              <p className={`text-xl font-bold ${variacionColor}`}>{variacionIcono} {Math.abs(parseFloat(variacion))}%</p>
            </div>
          </div>
          
          <div className="h-60">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.animals_distribution')}</h2>
          
          <div className="flex items-center justify-center h-60">
            <Pie data={pieData} />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              {t('dashboard.average_births_per_month')}: <span className="font-bold">{data.tendencias.nacimientos_promedio}</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar período e info de explotaciones
  const renderPeriodo = () => {
    if (!data || !data.periodo) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('dashboard.analysis_period')}</h3>
            <p className="text-gray-700">
              {t('dashboard.from')} <span className="font-medium text-indigo-700">{data.periodo.inicio}</span> {t('dashboard.to')} <span className="font-medium text-indigo-700">{data.periodo.fin}</span>
            </p>
          </div>
          
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-2">{t('dashboard.exploitations')}</h3>
            <p className="text-gray-700">
              {t('dashboard.total')}: <span className="font-medium text-indigo-700">{data.explotaciones.count}</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar resumen adicional de actividad
  const renderResumenActividad = () => {
    if (!data) return null;
    
    // Cálculos adicionales
    const porcentajeTerneros = data.total_animales > 0 
      ? ((data.total_terneros / data.total_animales) * 100).toFixed(1) 
      : 0;
      
    return (
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('dashboard.summary')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 mb-1">{t('dashboard.calves_proportion')}</p>
            <p className="text-2xl font-bold">{porcentajeTerneros}%</p>
            <p className="text-sm text-blue-200 mt-1">{data.total_terneros} de {data.total_animales} {t('dashboard.animals')}</p>
          </div>
          
          <div>
            <p className="text-blue-100 mb-1">{t('dashboard.average_births_per_cow')}</p>
            <p className="text-2xl font-bold">{data.ratio_partos_animal}</p>
            <p className="text-sm text-blue-200 mt-1">{t('dashboard.total_births')}: {data.total_partos}</p>
          </div>
          
          <div>
            <p className="text-blue-100 mb-1">{t('dashboard.active_exploitations')}</p>
            <p className="text-2xl font-bold">{data.explotaciones.count}</p>
            <p className="text-sm text-blue-200 mt-1">{t('dashboard.with_activity_in_period')}</p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar componente principal
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('dashboard.title')}</h2>
        <button 
          onClick={fetchDashboardData}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>{t('dashboard.refresh')}</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg shadow">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">{t('dashboard.loading_data')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          {renderStatCards()}
          {renderResumenActividad()}
          {renderTendencias()}
          {renderPeriodo()}
        </>
      )}
      
      {/* Mostrar información de depuración solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && renderDebugInfo()}
      
      {/* Mostrar datos JSON completos para depuración solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && data && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Datos JSON completos</h3>
            <span className="text-xs text-gray-500">Solo visible en modo desarrollo</span>
          </div>
          <pre className="bg-white p-3 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DashboardNew;
