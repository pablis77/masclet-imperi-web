import React, { useEffect, useState } from 'react';
import { DashboardCard, CardLabel } from '../components/UIComponents';
import type { ExplotacionInfo } from '../types';
import { t } from '../../../i18n/config';

// Asegurarnos de que los campos necesarios están disponibles
declare module '../types' {
  interface ExplotacionInfo {
    ratio?: string | number;
    total_animales_activos?: number;
    toros_activos?: number;
    toros?: number;
    alletar_0?: number;
    alletar_1?: number;
    alletar_2?: number;
    alletar_0_activas?: number;
    alletar_1_activas?: number;
    alletar_2_activas?: number;
    partos?: number;
    activa?: boolean;
  }
}

// Sección de Explotaciones extraída directamente del dashboard original
// EXACTAMENTE con la misma estructura visual
interface ExplotacionesSectionProps {
  explotaciones: ExplotacionInfo[];
  darkMode: boolean;
  loading: boolean;
  error: string | null;
}

const ExplotacionesSection: React.FC<ExplotacionesSectionProps> = ({ 
  explotaciones, 
  darkMode, 
  loading, 
  error 
}) => {
  // Estado para el idioma actual
  const [currentLang, setCurrentLang] = useState('es');
  
  // Obtener el idioma actual del localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);
    
    // Escuchar cambios de idioma
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);
  if (loading) {
    return <div className="col-span-12 text-center py-4">{t('dashboard.loading_exploitations', currentLang)}</div>;
  }
  
  if (error) {
    return (
      <div className="col-span-12 text-center py-4 text-red-500">
        Error al cargar explotaciones: {error}
      </div>
    );
  }
  
  if (!explotaciones || explotaciones.length === 0) {
    return <div className="col-span-12 text-center py-4">{t('dashboard.no_exploitations_data', currentLang)}</div>;
  }

  return (
    <DashboardCard 
      title={t('dashboard.exploitations', currentLang)} 
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
              }}>{t('dashboard.exploitation', currentLang)}</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>{t('dashboard.total_active', currentLang)}</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>{t('dashboard.active_bulls', currentLang)}</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>{t('dashboard.cows_nursing_one', currentLang)}</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>{t('dashboard.cows_nursing_two', currentLang)}</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>{t('dashboard.cows_not_nursing', currentLang)}</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>{t('dashboard.births', currentLang)}</th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: darkMode ? '#f9fafb' : '#111827'
              }}>{t('dashboard.ratio', currentLang)}</th>
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
                }}>
                  {/* Solo mostrar animales activos (excluyendo fallecidos) */}
                  {exp.total_animales_activos || exp.total_animales}
                </td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  backgroundColor: (exp.toros_activos || exp.toros || 0) > ((exp.total_animales_activos || exp.total_animales || 0) * 0.3) 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                    : 'transparent',
                  fontWeight: (exp.toros_activos || exp.toros || 0) > ((exp.total_animales_activos || exp.total_animales || 0) * 0.3) ? '600' : '400'
                }}>{exp.toros_activos || exp.toros || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center'
                }}>{exp.alletar_1_activas || exp.alletar_1 || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center'
                }}>{exp.alletar_2_activas || exp.alletar_2 || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center'
                }}>{exp.alletar_0_activas || exp.alletar_0 || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center'
                }}>{exp.partos || 0}</td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: darkMode ? '#f9fafb' : '#111827',
                  textAlign: 'center',
                  backgroundColor: ((exp.partos || 0) / (exp.total_animales_activos || exp.total_animales || 1)) > 1.5 
                    ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') 
                    : 'transparent',
                  fontWeight: ((exp.partos || 0) / (exp.total_animales_activos || exp.total_animales || 1)) > 1.5 ? '600' : '400'
                }}>
                  {typeof exp.ratio === 'string' ? exp.ratio : ((exp.partos || 0) / (exp.total_animales_activos || exp.total_animales || 1)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
};

export default ExplotacionesSection;
