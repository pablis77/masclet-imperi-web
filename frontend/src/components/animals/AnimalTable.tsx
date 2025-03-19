import React, { useEffect, useState, useRef } from 'react';
import animalService from '../../services/animalService';
import type { Animal, AnimalFilters, PaginatedResponse } from '../../services/animalService';

interface AnimalTableProps {
  initialFilters?: AnimalFilters;
  id?: string;
  canEdit?: boolean;
  canCreate?: boolean;
}

const AnimalTable: React.FC<AnimalTableProps> = ({ initialFilters = {}, id, canEdit = false, canCreate = false }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnimalFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalAnimals, setTotalAnimals] = useState<number>(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Establecer un timeout para evitar carga indefinida
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      loadTimeoutRef.current = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError('Tiempo de espera agotado. Por favor, intenta de nuevo.');
        }
      }, 10000); // 10 segundos de timeout
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await animalService.getAnimals({
        ...filters,
        page: currentPage,
        limit: 10
      });
      
      setAnimals(response.items);
      setTotalAnimals(response.total);
      setTotalPages(response.pages);
      
      document.dispatchEvent(new CustomEvent('animals-loaded', {
        detail: {
          total: response.total,
          filtered: response.items.length,
          page: response.page,
          pages: response.pages
        }
      }));
    } catch (err: any) {
      console.error('Error cargando animales:', err);
      setError(err.message || 'Error al cargar los animales');
      setAnimals([]);
      setTotalAnimals(0);
      setTotalPages(0);
    } finally {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentPage > 1 || Object.keys(filters).length > 0) {
      loadAnimals();
    }
  }, [filters, currentPage]);

  useEffect(() => {
    const handleApplyFilters = (event: CustomEvent<AnimalFilters>) => {
      setFilters(event.detail);
      setCurrentPage(1); 
    };

    const handleRefreshAnimals = () => {
      loadAnimals();
    };

    document.addEventListener('refresh-animals', handleRefreshAnimals);

    const rootElement = document.getElementById(id || '');
    if (rootElement) {
      rootElement.addEventListener('apply-filters', handleApplyFilters as EventListener);
    } else {
      document.addEventListener('filters-applied', handleApplyFilters as EventListener);
    }

    return () => {
      document.removeEventListener('refresh-animals', handleRefreshAnimals);
      if (rootElement) {
        rootElement.removeEventListener('apply-filters', handleApplyFilters as EventListener);
      } else {
        document.removeEventListener('filters-applied', handleApplyFilters as EventListener);
      }
    };
  }, [id]);

  useEffect(() => {
    const totalAnimalsContainer = document.getElementById('totalAnimalsContainer');
    if (totalAnimalsContainer) {
      if (loading) {
        totalAnimalsContainer.innerHTML = `
          <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
            Cargando...
          </span>
        `;
      } else {
        totalAnimalsContainer.innerHTML = `
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Total: ${totalAnimals} animales
          </span>
        `;
      }
    }
  }, [totalAnimals, loading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnimalDeactivation = async (animalId: number) => {
    try {
      await animalService.deactivateAnimal(animalId);
      loadAnimals();
    } catch (err) {
      console.error('Error al dar de baja al animal:', err);
      alert('No se pudo dar de baja al animal. Por favor, inténtalo de nuevo.');
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 mr-1 disabled:opacity-50"
      >
        &laquo;
      </button>
    );
    
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 mr-1"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-700 dark:text-gray-200">...</span>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded border mr-1 ${
            i === currentPage
              ? 'bg-primary text-white border-primary'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-700 dark:text-gray-200">...</span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 mr-1"
        >
          {totalPages}
        </button>
      );
    }
    
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 ml-1 disabled:opacity-50"
      >
        &raquo;
      </button>
    );
    
    return (
      <div className="flex flex-wrap justify-center mt-4">
        {pages}
      </div>
    );
  };

  const getAnimalIcon = (animal: Animal) => {
    return animalService.getAnimalIcon(animal);
  };

  const getStatusClass = (estat: string) => {
    return animalService.getAnimalStatusClass(estat);
  };

  return (
    <div ref={tableRef}>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={loadAnimals}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando animales...</span>
        </div>
      ) : animals.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 text-lg">No se encontraron animales</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Intenta con otros filtros o importa datos de prueba</p>
          <button 
            onClick={loadAnimals}
            className="mt-4 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                    Explotación
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {animals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-2xl" title={animalService.getAlletarText(animal.alletar)}>
                        {getAnimalIcon(animal)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {animal.nom}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {animal.genere === 'M' ? 'Macho' : 'Hembra'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        {animal.cod || '-'}
                      </div>
                      {animal.num_serie && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Serie: {animal.num_serie}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        {animal.explotacio_id}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(animal.estat)}`}>
                        {animal.estat === 'ACT' ? 'Activo' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a 
                          href={`/animals/${animal.id}`}
                          className="inline-flex items-center px-2 py-1 bg-primary text-white rounded hover:bg-primary/80"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver
                        </a>
                        {canEdit && animal.estat === 'ACT' && (
                          <a 
                            href={`/animals/update/${animal.id}`}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Actualizar
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AnimalTable;
