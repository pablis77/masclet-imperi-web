import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/UIComponents';
import apiService from '../../../services/api';
import type { ExplotacionInfo } from '../types';

interface ExplotacionesDetailedSectionProps {
  darkMode: boolean;
}

/**
 * Componente de explotaciones mejorado que obtiene datos directamente de la API
 * Muestra información detallada sobre toros y vacas con diferentes estados de amamantamiento
 */
const ExplotacionesDetailedSection: React.FC<ExplotacionesDetailedSectionProps> = ({ darkMode }) => {
  // Estados para gestionar los datos y el estado de carga
  const [explotaciones, setExplotaciones] = useState<ExplotacionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Función para cargar datos desde la API
  useEffect(() => {
    const fetchExplotacionesData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Obtener lista de todas las explotaciones
        const response = await apiService.get('/dashboard/explotacions');
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Tomar las 3 primeras explotaciones (o todas si hay menos de 3)
          const topExplotaciones = response.slice(0, Math.min(3, response.length));
          const explotacionesInfo: ExplotacionInfo[] = [];
          
          // 2. Para cada explotación, obtener información detallada
          for (const exp of topExplotaciones) {
            try {
              // Obtener información básica de la explotación
              const infoResponse = await apiService.get(`/dashboard/explotacions/${exp.explotacio}`);
              
              // Obtener estadísticas detalladas de animales (incluyendo alletar)
              const statsResponse = await apiService.get(`/dashboard/explotacions/${exp.explotacio}/stats`);
              
              // Extraer los conteos específicos que necesitamos
              const toros = statsResponse?.animales_por_genero?.M || 0;
              const alletar_0 = statsResponse?.alletar?.["0"] || 0; // Vacas sin amamantar
              const alletar_1 = statsResponse?.alletar?.["1"] || 0; // Vacas amamantando 1 ternero
              const alletar_2 = statsResponse?.alletar?.["2"] || 0; // Vacas amamantando 2 terneros
              
              // Calcular el total de animales
              const total_animales = toros + alletar_0 + alletar_1 + alletar_2;
              
              // 3. Construir el objeto de información completa de la explotación
              explotacionesInfo.push({
                id: infoResponse.id || 0,
                explotacio: exp.explotacio,
                total_animales: total_animales,
                total_partos: statsResponse?.total_partos || 0,
                ratio: (statsResponse?.total_partos || 0) / (total_animales || 1),
                activa: true,
                toros,
                alletar_0,
                alletar_1,
                alletar_2
              });
            } catch (error) {
              console.error(`Error obteniendo datos de explotación ${exp.explotacio}:`, error);
            }
          }
          
          // 4. Actualizar el estado con la información completa
          setExplotaciones(explotacionesInfo);
        } else {
          setError('No se encontraron explotaciones');
        }
      } catch (err) {
        console.error('Error al cargar datos de explotaciones:', err);
        setError('Error al cargar datos de explotaciones');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExplotacionesData();
  }, []);
  
  // Renderizado según el estado de carga
  if (loading) {
    return <div className="col-span-12 text-center py-4">Cargando información de explotaciones...</div>;
  }
  
  if (error) {
    return (
      <div className="col-span-12 text-center py-4 text-red-500">
        Error al cargar explotaciones: {error}
      </div>
    );
  }
  
  if (!explotaciones || explotaciones.length === 0) {
    return <div className="col-span-12 text-center py-4">No hay datos de explotaciones disponibles</div>;
  }

  return (
    <DashboardCard 
      title="Principales Explotaciones" 
      darkMode={darkMode}
      className="col-span-12"
    >
      <div className="overflow-x-auto">
        <table 
          className="w-full" 
          style={{
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr style={{
              backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
              borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
            }}>
              <th style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Explotación</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Total</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Toros</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Vacas (1 cría)</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Vacas (2 crías)</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Vacas (sin crías)</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Partos</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>Ratio</th>
            </tr>
          </thead>
          <tbody>
            {explotaciones.map((exp, index) => (
              <tr 
                key={exp.explotacio}
                style={{
                  borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  backgroundColor: index % 2 === 0 
                    ? (darkMode ? '#111827' : '#ffffff') 
                    : (darkMode ? '#1f2937' : '#f9fafb')
                }}
              >
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  fontWeight: '500'
                }}>{exp.explotacio}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>{exp.total_animales}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  backgroundColor: (exp.toros || 0) > ((exp.total_animales || 0) * 0.3) 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                    : 'transparent',
                  fontWeight: (exp.toros || 0) > ((exp.total_animales || 0) * 0.3) ? '600' : '400'
                }}>{exp.toros || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  backgroundColor: (exp.alletar_1 || 0) > ((exp.total_animales || 0) * 0.3) 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                    : 'transparent',
                  fontWeight: (exp.alletar_1 || 0) > ((exp.total_animales || 0) * 0.3) ? '600' : '400'
                }}>{exp.alletar_1 || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  backgroundColor: (exp.alletar_2 || 0) > ((exp.total_animales || 0) * 0.3) 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                    : 'transparent',
                  fontWeight: (exp.alletar_2 || 0) > ((exp.total_animales || 0) * 0.3) ? '600' : '400'
                }}>{exp.alletar_2 || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  backgroundColor: (exp.alletar_0 || 0) > ((exp.total_animales || 0) * 0.3) 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                    : 'transparent',
                  fontWeight: (exp.alletar_0 || 0) > ((exp.total_animales || 0) * 0.3) ? '600' : '400'
                }}>{exp.alletar_0 || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center'
                }}>{exp.total_partos || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  backgroundColor: ((exp.total_partos || 0) / (exp.total_animales || 1)) > 1.5 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                    : 'transparent',
                  fontWeight: ((exp.total_partos || 0) / (exp.total_animales || 1)) > 1.5 ? '600' : '400'
                }}>{((exp.total_partos || 0) / (exp.total_animales || 1)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
};

export default ExplotacionesDetailedSection;
