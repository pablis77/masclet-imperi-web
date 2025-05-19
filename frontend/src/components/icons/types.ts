/**
 * Tipos para componentes de iconos
 */

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  title?: string;
}

export type AnimalType = 'bull' | 'cow' | 'nursing-cow' | 'deceased';
export type AnimalStatus = 'OK' | 'DEF';
export type AnimalGender = 'M' | 'F';

export interface AnimalIconProps extends IconProps {
  type: AnimalType;
  status?: AnimalStatus;
  nursing?: boolean; // para vacas que están amamantando
}

// Tipos de explotación (si es necesario en el futuro)
export type ExplotacionType = 'standard' | 'premium' | 'organic';
