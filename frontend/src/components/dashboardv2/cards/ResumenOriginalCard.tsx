import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

// Interfaces
interface ResumenOriginalCardProps {
  darkMode?: boolean;
}

// Componente principal
const ResumenOriginalCard: React.FC<ResumenOriginalCardProps> = ({
  darkMode = false
}) => {
  // Estados para datos
  const [stats, setStats] = useState<any>(null);
  const [animalesDetallados, setAnimalesDetallados] = useState<any>(null);
  const [periodoData, setPeriodoData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Obteniendo datos para ResumenOriginalCard...');
        
        // Cargar datos de estadísticas
        const statsResponse = await apiService.get('/dashboard/stats');
        console.log('DATOS DE ESTADÍSTICAS:', statsResponse);
        setStats(statsResponse);
        
        // Cargar datos detallados de animales
        const animalesResponse = await apiService.get('/dashboard-detallado/animales-detallado');
        console.log('DATOS DETALLADOS DE ANIMALES:', animalesResponse);
        setAnimalesDetallados(animalesResponse);
        
        // Cargar periodo dinámico
        const periodoResponse = await apiService.get('/dashboard-periodo/periodo-dinamico');
        console.log('PERÍODO DINÁMICO:', periodoResponse);
        setPeriodoData(periodoResponse);
        
        setLoading(false);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`Error cargando datos: ${errorMsg}`);
        setError(errorMsg);
        setLoading(false);
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

  // Calcular totales
  const totalAnimals = stats?.animales?.total || 0;
  const activeMales = stats?.animales?.toros_activos || 0;
  const inactiveMales = stats?.animales?.toros_fallecidos || 0;
  const activeFemales = stats?.animales?.vacas_activas || 0;
  const inactiveFemales = stats?.animales?.vacas_fallecidas || 0;
  const activeAnimals = activeMales + activeFemales;
  const inactiveAnimals = inactiveMales + inactiveFemales;
  
  // Datos de amamantamiento
  const nursing0 = stats?.animales?.por_alletar?.['0'] || 0;
  const nursing1 = stats?.animales?.por_alletar?.['1'] || 0;
  const nursing2 = stats?.animales?.por_alletar?.['2'] || 0;

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
        <h3 className="text-lg font-semibold">Resumen general</h3>
        {periodoData && (
          <div className="text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1">
            Período: {formatDate(periodoData.inicio)} a {formatDate(periodoData.fin)}
            {periodoData.dinamico && <span className="ml-2 font-semibold">• Dinámico</span>}
          </div>
        )}
      </div>
      
      {/* Primera fila - 3 tarjetas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        {/* Tarjeta 1 - Resumen de Animales */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
          <h3 className={`text-md font-semibold p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Resumen de Animales</h3>
          
          <div className="bg-purple-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Total de animales</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{totalAnimals}</p>
          </div>
          
          <div className="bg-green-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Animales activos</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeAnimals}</p>
          </div>
          
          <div className="bg-blue-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Machos activos</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeMales}</p>
          </div>
        </div>
        
        {/* Tarjeta 2 - Distribución por Género */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
          <h3 className={`text-md font-semibold p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Distribución por Género</h3>
          
          <div className="bg-blue-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Total machos</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeMales + inactiveMales}</p>
            <div className="w-full bg-blue-600 h-1 mt-2"></div>
            <div className="flex justify-between text-blue-100 text-xs mt-1">
              <span>Activos: {activeMales}</span>
              <span>Fallecidos: {inactiveMales}</span>
            </div>
          </div>
          
          <div className="bg-fuchsia-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Total hembras</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeFemales + inactiveFemales}</p>
            <div className="w-full bg-fuchsia-600 h-1 mt-2"></div>
            <div className="flex justify-between text-fuchsia-100 text-xs mt-1">
              <span>Activas: {activeFemales}</span>
              <span>Fallecidas: {inactiveFemales}</span>
            </div>
          </div>
          
          <div className="bg-gray-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Proporción M/F</h3>
            <div className="flex items-center space-x-1">
              <div className="bg-blue-600 h-6 rounded-l" style={{width: `${(activeMales + inactiveMales) / totalAnimals * 100}%`}}></div>
              <div className="bg-fuchsia-600 h-6 rounded-r" style={{width: `${(activeFemales + inactiveFemales) / totalAnimals * 100}%`}}></div>
            </div>
            <div className="flex justify-between text-gray-100 text-xs mt-1">
              <span>Machos: {Math.round((activeMales + inactiveMales) / totalAnimals * 100)}%</span>
              <span>Hembras: {Math.round((activeFemales + inactiveFemales) / totalAnimals * 100)}%</span>
            </div>
          </div>
        </div>
        
        {/* Tarjeta 3 - Amamantamiento */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white' }}>
          <h3 className={`text-md font-semibold p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Estado de Amamantamiento</h3>
          
          <div className="bg-amber-500" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Sin amamantar</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing0}</p>
          </div>
          
          <div className="bg-amber-600" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>1 ternero</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing1}</p>
          </div>
          
          <div className="bg-amber-700" style={{ width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>2 terneros</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing2}</p>
          </div>
        </div>
      </div>
      
      {/* Datos adicionales */}
      <div className="mt-4 text-xs text-gray-500">
        Última actualización: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default ResumenOriginalCard;
