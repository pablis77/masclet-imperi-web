import React from 'react';
import { AnimalIconProps } from './types';
import BullIcon from './BullIcon';
import CowIcon from './CowIcon';
import NursingCowIcon from './NursingCowIcon';
import DeceasedAnimalIcon from './DeceasedAnimalIcon';

/**
 * Componente inteligente para mostrar el icono correcto según el tipo y estado del animal
 */
const AnimalIcon: React.FC<AnimalIconProps> = ({
  type,
  status = 'OK',
  nursing = false,
  size = 24,
  color,
  className = '',
  title,
}) => {
  // Si el animal está muerto, mostrar el icono de fallecido independientemente del tipo
  if (status === 'DEF') {
    return (
      <DeceasedAnimalIcon
        size={size}
        color={color || '#FF5252'} // Rojo por defecto para animales fallecidos
        className={className}
        title={title || 'Animal fallecido'}
      />
    );
  }

  // Color por defecto según el tipo
  let defaultColor = 'currentColor';
  if (!color) {
    switch (type) {
      case 'bull':
        defaultColor = '#3949AB'; // Azul para toros
        break;
      case 'cow':
        defaultColor = '#7B1FA2'; // Púrpura para vacas
        break;
      case 'nursing-cow':
        defaultColor = '#00897B'; // Verde azulado para vacas amamantando
        break;
      default:
        defaultColor = 'currentColor';
    }
  }

  // Determinar el tipo de icono a mostrar
  switch (type) {
    case 'bull':
      return (
        <BullIcon
          size={size}
          color={color || defaultColor}
          className={className}
          title={title || 'Toro'}
        />
      );
    case 'nursing-cow':
      return (
        <NursingCowIcon
          size={size}
          color={color || defaultColor}
          className={className}
          title={title || 'Vaca amamantando'}
        />
      );
    case 'cow':
      // Si la vaca está amamantando pero se pasó el tipo 'cow', usar NursingCowIcon
      if (nursing) {
        return (
          <NursingCowIcon
            size={size}
            color={color || '#00897B'} // Verde azulado para vacas amamantando
            className={className}
            title={title || 'Vaca amamantando'}
          />
        );
      }
      return (
        <CowIcon
          size={size}
          color={color || defaultColor}
          className={className}
          title={title || 'Vaca'}
        />
      );
    default:
      return null;
  }
};

export default AnimalIcon;
