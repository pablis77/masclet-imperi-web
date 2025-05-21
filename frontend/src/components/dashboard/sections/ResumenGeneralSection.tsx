import React, { useEffect, useState } from 'react';
import { GenderChart } from '../components/ChartComponents';
import { StatCard } from '../components/UIComponents';
import { t } from '../../../i18n/config';
import type { DashboardStats, AnimalStats } from '../types/dashboard';

// Interfaz para las props del componente
export interface ResumenGeneralSectionProps {
  statsData: DashboardStats | null;
  darkMode: boolean;
  loading: boolean;
  error: string | null;
}

// Componente principal del resumen general
const ResumenGeneralSection: React.FC<ResumenGeneralSectionProps> = ({ 
  statsData, 
  darkMode,
  loading: externalLoading,
  error: externalError
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Actualizar los estados cuando cambien los props
  useEffect(() => {
    setLoading(externalLoading);
  }, [externalLoading]);

  useEffect(() => {
    setError(externalError);
  }, [externalError]);

  useEffect(() => {
    setStats(statsData);
  }, [statsData]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Calcular totales EXACTAMENTE como lo hace el script verificar_contadores.py
  // Inicializar variables
  let totalAnimals = 0;
  let activeMales = 0; // toros_activos
  let inactiveMales = 0; // toros_fallecidos
  let activeFemales = 0; // vacas_activas
  let inactiveFemales = 0; // vacas_fallecidas
  let totalMales = 0; // total de machos (activos + inactivos)
  let totalFemales = 0; // total de hembras (activas + inactivas)
  
  // Estadísticas directamente de la respuesta del backend
  if (stats && stats.animales) {
    // Total de animales
    totalAnimals = stats.animales.total || 0;
    totalMales = stats.animales.machos || 0;
    totalFemales = stats.animales.hembras || 0;
    
    // Usar el endpoint exactamente igual que el script verificar_contadores.py
    // Obtener datos por género y estado directamente del backend
    // Toros activos = genere="M" + estado="OK"
    // Toros fallecidos = genere="M" + estado="DEF"
    if (stats.animales.por_genero_estado) {
      activeMales = stats.animales.por_genero_estado?.['M']?.['OK'] || 0;
      inactiveMales = stats.animales.por_genero_estado?.['M']?.['DEF'] || 0;
      
      // Vacas activas = genere="F" + estado="OK"
      // Vacas fallecidas = genere="F" + estado="DEF"
      activeFemales = stats.animales.por_genero_estado?.['F']?.['OK'] || 0;
      inactiveFemales = stats.animales.por_genero_estado?.['F']?.['DEF'] || 0;
    }
    // Si no tenemos datos exactos por género y estado, hacemos una estimación
    else {
      // Si conocemos el porcentaje de animales activos, aplicarlo proporcionalmente por género
      const activeRatio = stats.animales.por_estado && totalAnimals > 0 ? 
        (stats.animales.por_estado['OK'] / totalAnimals) : 0;
      
      // Calcular activos por género usando la misma proporción
      activeMales = Math.round(totalMales * activeRatio);
      activeFemales = Math.round(totalFemales * activeRatio);
      inactiveMales = totalMales - activeMales;
      inactiveFemales = totalFemales - activeFemales;
    }
  }
  
  // Calcular el total de animales activos - exactamente como lo hace verificar_contadores.py
  const activeAnimals = activeMales + activeFemales;
  const inactiveAnimals = inactiveMales + inactiveFemales;
  
  // Datos de amamantamiento - usar exactamente como lo hace el script
  const nursing0 = stats.animales?.por_alletar?.['0'] || 0;
  const nursing1 = stats.animales?.por_alletar?.['1'] || 0;
  const nursing2 = stats.animales?.por_alletar?.['2'] || 0;

  return (
    <div className="dashboard-card" style={{ gridColumn: "span 12" }}>
      <h3 className="text-lg font-semibold mb-4">Resumen general</h3>
      
      {/* Primera fila - 2 tarjetas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        {/* Tarjeta 1 - Resumen de Animales */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <h3 className="text-md font-semibold p-2">Resumen de Animales</h3>
          
          <div className="bg-purple-500" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Total de animales</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{totalAnimals}</p>
          </div>
          
          <div className="bg-green-500" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Animales activos</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeAnimals}</p>
          </div>
          
          <div className="bg-blue-500" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Machos activos ({activeMales})</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeMales}</p>
          </div>
          
          <div className="bg-pink-500" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Hembras activas ({activeFemales})</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{activeFemales}</p>
          </div>
        </div>
        
        {/* Tarjeta 2 - Estado de Amamantamiento */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <h3 className="text-md font-semibold p-2">Estado de Amamantamiento</h3>
          
          <div className="bg-amber-500" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Vacas no amamantando</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing0}</p>
          </div>
          
          <div className="bg-cyan-500" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Vacas amamantando 1 ternero</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing1}</p>
          </div>
          
          <div className="bg-red-500" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '0.5rem', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>Vacas amamantando 2 terneros</h3>
            <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{nursing2}</p>
          </div>
        </div>
        
        {/* Tarjeta 3 - Análisis Poblacional */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <h3 className="text-md font-semibold p-2">Análisis Poblacional (Total)</h3>
          
          <div className="h-60 p-2">
            <GenderChart 
              data={{
                'Toros': totalMales,
                'Vacas': totalFemales,
                'Fallecidos': inactiveAnimals
              }} 
              darkMode={darkMode}
            />
          </div>
          
          <div className="text-center mt-2 text-sm text-gray-600 pb-2">
            Ratio Machos/Hembras: {totalMales && totalFemales ? (totalMales / totalFemales).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenGeneralSection;
