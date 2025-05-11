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
    <div className="grid grid-cols-1 gap-4" id={id}>
      {/* Búsqueda consolidada */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Buscar
        </label>
        <div className="relative">
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, explotación, código..."
            className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 mt-2">
        <button
          type="button"
          onClick={handleClearFilters}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          BUSCAR
        </button>
      </div>
    </div>
  );
};

export default AnimalFilters;
