import React from 'react';

/**
 * Componentes de Skeleton Loader ultra-ligeros para la aplicación
 * 
 * Versión optimizada sin animaciones complejas para evitar sobrecargar el navegador
 */

// Componente de Skeleton para la sección de estadísticas generales
const StatsSectionSkeleton: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  const bgColor = darkMode ? '#374151' : '#e5e7eb';
  const fgColor = darkMode ? '#4B5563' : '#D1D5DB';
  
  return (
    <div style={{ 
      width: '100%', 
      height: '220px', 
      backgroundColor: bgColor, 
      borderRadius: '8px',
      opacity: 0.5,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ height: '24px', width: '50%', backgroundColor: fgColor, borderRadius: '4px' }} />
      <div style={{ height: '120px', width: '100%', backgroundColor: fgColor, borderRadius: '4px', marginTop: '8px' }} />
      <div style={{ height: '16px', width: '30%', backgroundColor: fgColor, borderRadius: '4px', marginTop: 'auto' }} />
    </div>
  );
};

// Componente de Skeleton para la sección de partos
const PartosSectionSkeleton: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  const bgColor = darkMode ? '#374151' : '#e5e7eb';
  const fgColor = darkMode ? '#4B5563' : '#D1D5DB';
  
  return (
    <div style={{ 
      width: '100%', 
      height: '180px', 
      backgroundColor: bgColor, 
      borderRadius: '8px',
      opacity: 0.5,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ height: '20px', width: '60%', backgroundColor: fgColor, borderRadius: '4px' }} />
      <div style={{ height: '100px', width: '100%', backgroundColor: fgColor, borderRadius: '4px', marginTop: '8px' }} />
    </div>
  );
};

// Exportamos los componentes
export { StatsSectionSkeleton, PartosSectionSkeleton };
