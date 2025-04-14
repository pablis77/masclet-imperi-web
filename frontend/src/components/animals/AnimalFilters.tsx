import React, { useState } from 'react';
import type { AnimalFilters as AnimalFiltersType } from '../../services/animalService';

interface AnimalFiltersProps {
  onApplyFilters?: (filters: AnimalFiltersType) => void;
  initialFilters?: AnimalFiltersType;
  id?: string;
}

const AnimalFilters: React.FC<AnimalFiltersProps> = ({ 
  onApplyFilters, 
  initialFilters = {},
  id
}) => {
  const [filters, setFilters] = useState<AnimalFiltersType>(initialFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Actualizar los filtros con el valor de búsqueda
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };
  
  // Manejar la pulsación de Enter en el campo de búsqueda
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleApplyFilters = () => {
    // Si hay una función onApplyFilters proporcionada, llamarla
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    // Emitir un evento personalizado para que otros componentes puedan escucharlo
    document.dispatchEvent(new CustomEvent('filters-applied', {
      detail: filters
    }));
  };

  const handleClearFilters = () => {
    const emptyFilters: AnimalFiltersType = {};
    setFilters(emptyFilters);
    
    // Aplicar los filtros vacíos
    if (onApplyFilters) {
      onApplyFilters(emptyFilters);
    }
    
    // Emitir evento con filtros vacíos
    document.dispatchEvent(new CustomEvent('filters-applied', {
      detail: emptyFilters
    }));
    
    // Recargar la lista de animales
    document.dispatchEvent(new CustomEvent('reload-animals'));
  };

  return (
    <div className="grid grid-cols-1 gap-2" id={id}>
      {/* Búsqueda optimizada para móviles */}
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Buscar
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 text-xs">🔍</span>
          </div>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Nombre, código, explotación..."
            className="w-full px-2 py-1 pl-7 text-xs border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Botones optimizados para móviles */}
      <div className="flex justify-end space-x-1 mt-1">
        <button
          type="button"
          onClick={handleClearFilters}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          BUSCAR
        </button>
      </div>
    </div>
  );
};

export default AnimalFilters;
