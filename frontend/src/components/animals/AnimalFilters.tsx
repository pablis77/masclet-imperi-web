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
  const [isOpen, setIsOpen] = useState<boolean>(false);
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

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

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
    <div className="relative" id={id}>
      <button 
        onClick={handleOpen}
        className="btn btn-secondary flex items-center"
      >
        <span className="mr-1">🔍</span> Filtros
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-4 z-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-3">Filtros</h3>
          
          {loading ? (
            <div className="text-center py-2">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-1 text-sm text-gray-600 dark:text-dark-text-secondary">Cargando...</p>
            </div>
          ) : (
            <form>
              {/* Explotación */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Explotación
                </label>
                <select
                  name="explotacio_id"
                  value={filters.explotacio_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Género
                </label>
                <select
                  name="genere"
                  value={filters.genere || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
                >
                  <option value="">Todos</option>
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                </select>
              </div>

              {/* Estado */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={filters.estado || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
                >
                  <option value="">Todos</option>
                  <option value="OK">Activo</option>
                  <option value="DEF">Baja</option>
                </select>
              </div>

              {/* Amamantando */}
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="alletar"
                    checked={!!filters.alletar}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-dark-text-secondary">
                    Solo amamantando
                  </span>
                </label>
              </div>

              {/* Búsqueda */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search || ''}
                  onChange={handleInputChange}
                  placeholder="Nombre, código..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:text-gray-500"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Aplicar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimalFilters;
