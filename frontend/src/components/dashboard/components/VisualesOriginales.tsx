import React from 'react';

/**
 * Componentes visuales exactamente iguales al dashboard original
 * Solo extraídos para mejorar la organización del código
 */

// Renderizar título de sección con número circular
export const SectionTitle = ({ 
  number, 
  title, 
  darkMode = false 
}: { 
  number: string, 
  title: string,
  darkMode?: boolean
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      marginTop: '1rem',
      padding: '0.5rem',
      // Verde lima corporativo más claro que el principal
      backgroundColor: darkMode ? '#7cb518' : '#a4cc44', // Verde lima en modo oscuro, verde lima claro en modo claro
      border: 'none',
      borderRadius: '0.25rem', // Añadir bordes redondeados
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.5rem',
        height: '1.5rem',
        borderRadius: '9999px',
        backgroundColor: '#fff', // Fondo blanco
        color: '#88c425', // Color verde lima corporativo para el número
        fontWeight: 'bold',
        marginRight: '0.5rem',
      }}>
        {number}
      </div>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'white', // Texto blanco para ambos modos
      }}>{title}</h2>
    </div>
  );
};

// Renderizar tarjeta de estadísticas
export const StatCard = ({ 
  title, 
  value, 
  color, 
  darkMode = false 
}: { 
  title: string, 
  value: number | string, 
  color: string,
  darkMode?: boolean
}) => {
  return (
    <div 
      className={`${color}`} 
      style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: '0.5rem',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{title}</h3>
      <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{value}</p>
    </div>
  );
};

// Renderizar tarjeta de dashboard para gráficos
export const DashboardCard = ({ 
  title, 
  children, 
  className = '',
  darkMode = false
}: { 
  title: string, 
  children: React.ReactNode, 
  className?: string,
  darkMode?: boolean
}) => {
  return (
    <div 
      style={{
        backgroundColor: darkMode ? '#111827' : '#ffffff',
        color: darkMode ? '#f9fafb' : '#111827',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1rem',
        border: darkMode ? '1px solid #374151' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      className={className}
      data-component-name="DashboardVisuals"
    >
      <h3 
        style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: darkMode ? '#f9fafb' : '#111827',
        }}
        data-component-name="DashboardVisuals"
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

// Renderizar etiqueta para tarjeta
export const CardLabel = ({ 
  children,
  darkMode = false
}: { 
  children: React.ReactNode,
  darkMode?: boolean
}) => {
  return (
    <div 
      style={{
        color: darkMode ? '#d1d5db' : '#4b5563',
        fontSize: '0.875rem',
        fontWeight: '500',
        marginBottom: '0.25rem'
      }}
      data-component-name="DashboardVisuals"
    >
      {children}
    </div>
  );
};

// Renderizar divisor para tarjeta
export const CardDivider = ({ 
  children,
  darkMode = false
}: { 
  children: React.ReactNode,
  darkMode?: boolean
}) => {
  return (
    <div 
      style={{
        borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        paddingBottom: '0.5rem',
        marginBottom: '0.5rem'
      }}
      data-component-name="DashboardVisuals"
    >
      {children}
    </div>
  );
};
