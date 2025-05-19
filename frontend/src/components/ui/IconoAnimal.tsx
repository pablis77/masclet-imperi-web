import React from 'react';

// Propiedades para nuestro componente de icono de animal
interface IconoAnimalProps {
  tipo: 'toro' | 'vaca' | 'vaca_amamantando';
  tamaño?: number;
  className?: string;
}

/**
 * Componente que muestra el icono correspondiente según el tipo de animal
 * 
 * @param tipo - Tipo de animal: 'toro', 'vaca' o 'vaca_amamantando'
 * @param tamaño - Tamaño del icono en píxeles (opcional, por defecto 24px)
 * @param className - Clases CSS adicionales (opcional)
 */
const IconoAnimal: React.FC<IconoAnimalProps> = ({ 
  tipo, 
  tamaño = 24, 
  className = '' 
}) => {
  // Ruta base para nuestros iconos
  const rutaIcono = `/icons/animals/${tipo}.svg`;
  
  return (
    <img 
      src={rutaIcono}
      alt={`Icono de ${tipo}`}
      width={tamaño}
      height={tamaño}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default IconoAnimal;
