import React, { useState, useEffect } from 'react';
import type { AnimalFilters as AnimalFiltersType } from '../../services/animalService';
import { getAllExplotaciones } from '../../services/explotacionService';
import type { Explotacion } from '../../services/explotacionService';

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
  const [explotaciones, setExplotaciones] = useState<Explotacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Cargar explotaciones al montar el componente
  useEffect(() => {
    const loadExplotaciones = async () => {
      try {
        setLoading(true);
        const data = await getAllExplotaciones();
        setExplotaciones(data);
      } catch (error) {
        console.error('Error al cargar explotaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExplotaciones();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Manejar checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Manejar selects numéricos
    if (name === 'explotacio_id') {
      const numValue = value === '' ? undefined : parseInt(value, 10);
      setFilters(prev => ({
        ...prev,
        [name]: numValue
      }));
      return;
    }
    
    // Manejar selects y inputs de texto
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
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
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id={id}>
      {loading ? (
        <div className="col-span-full flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando opciones...</span>
        </div>
      ) : (
        <>
          {/* Explotación */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Explotación
            </label>
            <select
              name="explotacio_id"
              value={filters.explotacio_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas</option>
              {explotaciones.map(explotacion => (
                <option key={explotacion.id} value={explotacion.id}>
                  {explotacion.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Género */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Género
            </label>
            <select
              name="genere"
              value={filters.genere || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="M">Macho</option>
              <option value="F">Hembra</option>
            </select>
          </div>

          {/* Estado */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              name="estat"
              value={filters.estat || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="ACT">Activo</option>
              <option value="DEF">Baja</option>
            </select>
          </div>

          {/* Amamantando */}
          <div className="mb-3">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                name="alletar"
                checked={!!filters.alletar}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-2">
                Solo amamantando
              </span>
            </label>
          </div>

          {/* Búsqueda */}
          <div className="mb-3 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search || ''}
                onChange={handleInputChange}
                placeholder="Nombre, código..."
                className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="col-span-full flex justify-end space-x-2 mt-2">
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
              Aplicar filtros
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnimalFilters;
