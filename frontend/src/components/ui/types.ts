/**
 * Tipos base para los componentes UI
 */

// Tamaños estándar para componentes
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Variantes de color para componentes
export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

// Propiedades base para todos los componentes
export interface BaseProps {
  className?: string;
  id?: string;
  testId?: string;
}

// Propiedades específicas para botones
export interface ButtonProps extends BaseProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Propiedades para inputs
export interface InputProps extends BaseProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: Size;
}

// Propiedades para modales
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

// Propiedades para tarjetas
export interface CardProps extends BaseProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  variant?: Variant;
  footer?: React.ReactNode;
}
