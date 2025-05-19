import React, { forwardRef } from 'react';
import type { InputProps } from './types';

/**
 * Componente Input reutilizable con soporte para validación y diferentes tamaños
 * 
 * @param name - Nombre del input (requerido)
 * @param label - Etiqueta para el input
 * @param placeholder - Texto de marcador de posición
 * @param value - Valor del input
 * @param onChange - Función al cambiar el valor
 * @param type - Tipo de input HTML
 * @param error - Mensaje de error para validación
 * @param disabled - Estado deshabilitado
 * @param required - Si el campo es requerido
 * @param size - Tamaño del input
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  name,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  disabled = false,
  required = false,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  // Mapeo de tamaños a clases Tailwind
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
  };

  const inputClasses = `
    block w-full rounded-md
    ${error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-gray-300 focus:border-primary focus:ring-primary'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}
    ${sizeClasses[size]}
    transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-opacity-20 shadow-sm
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
