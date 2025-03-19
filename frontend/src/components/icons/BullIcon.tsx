import React from 'react';
import type { IconProps } from './types';

/**
 * Icono para representar toros (bull)
 */
const BullIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  className = '',
  title = 'Toro'
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <title>{title}</title>
      <path 
        d="M4 4C4 3.45 4.45 3 5 3C5.55 3 6 3.45 6 4C6 4.55 5.55 5 5 5C4.45 5 4 4.55 4 4Z" 
        fill={color}
      />
      <path 
        d="M18 4C18 3.45 18.45 3 19 3C19.55 3 20 3.45 20 4C20 4.55 19.55 5 19 5C18.45 5 18 4.55 18 4Z" 
        fill={color}
      />
      <path 
        d="M3 7C3 6 3.5 5 5 5C6.5 5 7 6 7 7H3Z" 
        fill={color}
      />
      <path 
        d="M17 7C17 6 17.5 5 19 5C20.5 5 21 6 21 7H17Z" 
        fill={color}
      />
      <path 
        d="M7 7H17V8C17 11.31 14.31 14 11 14H13C16.31 14 19 11.31 19 8V7H21C21 12 17 16 12 16C7 16 3 12 3 7H7Z" 
        fill={color}
      />
      <path 
        d="M10 9.5C10 10.33 9.33 11 8.5 11C7.67 11 7 10.33 7 9.5C7 8.67 7.67 8 8.5 8C9.33 8 10 8.67 10 9.5Z" 
        fill={color}
      />
      <path 
        d="M17 9.5C17 10.33 16.33 11 15.5 11C14.67 11 14 10.33 14 9.5C14 8.67 14.67 8 15.5 8C16.33 8 17 8.67 17 9.5Z" 
        fill={color}
      />
      <path 
        d="M9 13C9 12.45 9.45 12 10 12H14C14.55 12 15 12.45 15 13C15 13.55 14.55 14 14 14H10C9.45 14 9 13.55 9 13Z" 
        fill={color}
      />
      <path 
        d="M8 17L10 16H14L16 17L17 21H7L8 17Z" 
        fill={color}
      />
    </svg>
  );
};

export default BullIcon;
