import React from 'react';

interface AnimalIconProps {
  type: 'all' | 'macho' | 'hembra';
  status?: 'OK' | 'DEF' | 'VEN' | 'alletar';
  className?: string;
}

/**
 * Componente que muestra un icono representativo de un animal según su tipo y estado
 */
const AnimalIcon: React.FC<AnimalIconProps> = ({ type, status, className = '' }) => {
  // Determinar qué icono mostrar según el tipo y estado
  const getIcon = () => {
    // Fallecido (tiene prioridad sobre el tipo)
    if (status === 'DEF') {
      return '⚰️';
    }
    
    // Vendido
    if (status === 'VEN') {
      return '💰';
    }
    
    // Por tipo de animal
    switch (type) {
      case 'macho':
        return '🐂'; // Toro
      case 'hembra':
        // Si está amamantando
        if (status === 'alletar') {
          return '🍼'; // Vaca amamantando
        }
        return '🐄'; // Vaca normal
      case 'all':
      default:
        return '🐮'; // Icono genérico
    }
  };
  
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {getIcon()}
    </span>
  );
};

export default AnimalIcon;
