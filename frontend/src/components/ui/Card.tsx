import React from 'react';
import type { CardProps } from './types';

/**
 * Componente Card para mostrar contenido en tarjetas con un diseño moderno
 * 
 * @param title - Título opcional de la tarjeta
 * @param children - Contenido de la tarjeta
 * @param variant - Variante de color (por defecto: light)
 * @param footer - Contenido opcional del pie de la tarjeta
 */
const Card: React.FC<CardProps> = ({
  title,
  children,
  variant = 'light',
  footer,
  className = '',
  ...props
}) => {
  // Mapeo de variantes a clases Tailwind para el borde superior
  const variantClasses = {
    primary: 'border-t-4 border-primary',
    secondary: 'border-t-4 border-secondary',
    success: 'border-t-4 border-success',
    danger: 'border-t-4 border-danger',
    warning: 'border-t-4 border-warning',
    info: 'border-t-4 border-info',
    light: '',
    dark: 'border-t-4 border-gray-800'
  };

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden
        dark:border-gray-700 dark:shadow-gray-900/10
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className="p-6">{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
