import React from 'react';
import type { ButtonProps } from './types';

/**
 * Componente Button reutilizable con diferentes variantes y tamaños
 * 
 * @param variant - Variante de color del botón
 * @param size - Tamaño del botón
 * @param disabled - Estado deshabilitado
 * @param loading - Estado de carga
 * @param onClick - Función al hacer clic
 * @param type - Tipo de botón HTML
 * @param fullWidth - Si debe ocupar todo el ancho disponible
 * @param children - Contenido del botón
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  // Mapeo de variantes a clases Tailwind
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/80 text-white',
    secondary: 'bg-secondary hover:bg-secondary-dark text-white',
    success: 'bg-success hover:bg-success-dark text-white',
    danger: 'bg-danger hover:bg-danger-dark text-white',
    warning: 'bg-warning hover:bg-warning-dark text-text-primary',
    info: 'bg-info hover:bg-info-dark text-white',
    light: 'bg-gray-100 hover:bg-gray-200 text-text-primary',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white',
  };

  // Mapeo de tamaños a clases Tailwind
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
  };

  return (
    <button
      type={type}
      className={`
        font-medium rounded-full transition-all duration-200 ease-in-out
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${variant === 'light' || variant === 'warning' ? 'gray-400' : variant}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
