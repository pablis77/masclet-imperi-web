import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { t, getCurrentLanguage } from '../../../i18n/config';

// Registrar componentes de Chart.js necesarios para el gráfico circular
ChartJS.register(ArcElement, Tooltip, Legend);

// Interfaces
interface ResumenOriginalCardProps {
  darkMode?: boolean;
}

// Componente principal
const ResumenOriginalCard: React.FC<ResumenOriginalCardProps> = ({
  darkMode = false
}) => {
  // Obtener el idioma actual
  const currentLang = getCurrentLanguage();
  // Estados para datos
  const [stats, setStats] = useState<any>(null);
  const [animalesDetallados, setAnimalesDetallados] = useState<any>(null);
  const [periodoData, setPeriodoData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente usando el nuevo endpoint optimizado
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Obteniendo datos para ResumenOriginalCard desde endpoint optimizado...');
        
        // IMPORTANTE: Usar el nuevo endpoint optimizado que combina las tres llamadas en una sola
        // Esto mejora significativamente el rendimiento manteniendo datos dinámicos y reales
        const optimizedResponse = await apiService.get('/dashboard/resumen-card');
        
        // Guardar resultados desde la respuesta combinada
        setStats(optimizedResponse.stats);
        setAnimalesDetallados(optimizedResponse.animales_detallados);
        setPeriodoData(optimizedResponse.periodo);
        
        console.log('Datos obtenidos correctamente desde endpoint optimizado');
        setLoading(false);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`Error cargando datos desde endpoint optimizado: ${errorMsg}`);
        console.error('Intentando fallback a peticiones individuales...');
        
        // Si el nuevo endpoint falla, volvemos al método anterior como fallback
        try {
          const [statsResponse, animalesResponse, periodoResponse] = await Promise.all([
            apiService.get('/dashboard/stats'),
            apiService.get('/dashboard-detallado/animales-detallado'),
            apiService.get('/dashboard-periodo/periodo-dinamico')
          ]);
          
          setStats(statsResponse);
          setAnimalesDetallados(animalesResponse);
          setPeriodoData(periodoResponse);
          setLoading(false);
          setError(null);
        } catch (fallbackErr) {
          const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : 'Error desconocido';
          console.error(`Fallback también ha fallado: ${fallbackMsg}`);
          setError('Error cargando datos del dashboard. Por favor, intenta de nuevo.');
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="dashboard-card" style={{ gridColumn: "span 12" }}>
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando datos del panel de control...</span>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="dashboard-card" style={{ gridColumn: "span 12" }}>
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Calcular totales usando los datos detallados (usando la estructura correcta del endpoint)
  const totalAnimals = animalesDetallados?.total || 0;
  const activeMales = animalesDetallados?.por_genero?.machos?.activos || 0;
  const inactiveMales = animalesDetallados?.por_genero?.machos?.fallecidos || 0;
  const activeFemales = animalesDetallados?.por_genero?.hembras?.activas || 0;
  const inactiveFemales = animalesDetallados?.por_genero?.hembras?.fallecidas || 0;
  const activeAnimals = animalesDetallados?.general?.activos || 0;
  const inactiveAnimals = animalesDetallados?.general?.fallecidos || 0;
  
  // Datos de amamantamiento
  const nursing0 = animalesDetallados?.por_alletar?.['0'] || 0;
  const nursing1 = animalesDetallados?.por_alletar?.['1'] || 0;
  const nursing2 = animalesDetallados?.por_alletar?.['2'] || 0;
  
  // Imprimir datos para debugging
  console.log('DATOS DETALLADOS USADOS:', {
    totalAnimals,
    activeMales,
    inactiveMales,
    activeFemales,
    inactiveFemales,
    activeAnimals,
    inactiveAnimals,
    nursing0,
    nursing1,
    nursing2
  });
  
  // También imprimir la respuesta original para verificar la estructura
  console.log('RESPUESTA ORIGINAL:', animalesDetallados);

  // Formato para fechas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`dashboard-card ${darkMode ? 'bg-gray-800 text-white' : ''}`} style={{ gridColumn: "span 12" }}>
      {/* Cabecera con período */}
      <div className="flex justify-between items-center mb-4">
        {/* Título eliminado para evitar duplicación */}
        {periodoData && (
          <div className="text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1">
            {t('dashboard.summary_card.period', currentLang)}: {periodoData.formato_fecha_inicio || 'N/A'} a {periodoData.formato_fecha_fin || 'N/A'}
            {periodoData.dias && <span className="ml-2 font-semibold">• {periodoData.dias} {t('dashboard.summary_card.days', currentLang)}</span>}
          </div>
        )}
      </div>
      
      {/* Primera fila - 3 tarjetas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        {/* Tarjeta 1 - Resumen de Animales */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
          <h3 className={`text-md font-semibold p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{t('dashboard.summary_card.animals_summary', currentLang)}</h3>
          
          <div className="bg-purple-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{t('dashboard.summary_card.total_animals', currentLang)}</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{totalAnimals}</p>
          </div>
          
          <div className="bg-green-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{t('dashboard.summary_card.active_animals', currentLang)}</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeAnimals}</p>
          </div>
          
          <div className="bg-blue-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{t('dashboard.summary_card.active_males', currentLang)}</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeMales}</p>
          </div>
          
          <div className="bg-fuchsia-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{t('dashboard.summary_card.active_females', currentLang)}</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeFemales}</p>
          </div>
        </div>
        
        {/* Tarjeta 2 - Amamantamiento */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
          <h3 className={`text-md font-semibold p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{t('dashboard.summary_card.nursing_status', currentLang)}</h3>
          
          <div className="bg-orange-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{t('dashboard.summary_card.cows_not_nursing', currentLang)}</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing0}</p>
          </div>
          
          <div className="bg-cyan-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{t('dashboard.summary_card.nursing_one_calf', currentLang)}</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing1}</p>
          </div>
          
          <div className="bg-red-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{t('dashboard.summary_card.nursing_two_calves', currentLang)}</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing2}</p>
          </div>
        </div>
        
        {/* Tarjeta 3 - Distribución por Género con gráfico circular */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
          <h3 className={`text-md font-semibold p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{t('dashboard.summary_card.population_analysis', currentLang)}</h3>
          
          <div style={{ padding: '0.75rem', height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Pie 
              data={{
                labels: [t('dashboard.summary_card.bulls', currentLang), t('dashboard.summary_card.cows', currentLang), t('dashboard.summary_card.deceased', currentLang)],
                datasets: [
                  {
                    data: [activeMales, activeFemales, inactiveAnimals],
                    backgroundColor: [
                      '#3b82f6', // azul para toros
                      '#ec4899', // fucsia para vacas
                      '#6b7280', // gris para fallecidos
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: darkMode ? '#fff' : '#000',
                      font: {
                        size: 12
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.label || '';
                        let value = context.raw || 0;
                        let total = context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0);
                        let percentage = Math.round((Number(value) / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          
          <div className="text-xs text-center mt-1" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
            {t('dashboard.summary_card.male_female_ratio', currentLang)}: {activeMales}:{activeFemales} ({activeMales && activeFemales ? (activeMales / activeFemales).toFixed(2) : 'N/A'})
          </div>
        </div>
      </div>
      
      {/* Datos adicionales */}
      <div className="mt-4 text-xs text-gray-500">
        {t('dashboard.summary_card.last_update', currentLang)}: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default ResumenOriginalCard;
