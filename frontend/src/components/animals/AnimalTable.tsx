import React, { useState, useEffect, useRef } from 'react';
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
  const [useMockData, setUseMockData] = useState(false);
  const [searchInfo, setSearchInfo] = useState<{
    term: string;
    count: number;
    total: number;
    usedMock: boolean;
    reason?: string;
  } | null>(null);
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
      
      // Pequeña pausa para asegurar que la UI se actualice correctamente
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Cargando animales - Página: ${currentPage}, Filtros:`, {...filters});
      
      // Asegurarnos de usar siempre la página correcta en los parámetros
      const pageParams = {
        ...filters,
        page: currentPage,
        limit: 10
      };
      
      console.log('Parámetros enviados al API:', pageParams);
      
      // Llamada al API con los parámetros completos
      const response = await animalService.getAnimals(pageParams);
      
      // Aplicar priorización local adicional si hay término de búsqueda
      let orderedAnimals = [...response.items];
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.trim().toLowerCase();
        // Ordenar los resultados localmente por nombre coincidente
        orderedAnimals.sort((a, b) => {
          // Coincidencia exacta de nombre (máxima prioridad)
          const aExactMatch = a.nom.toLowerCase() === searchTerm;
          const bExactMatch = b.nom.toLowerCase() === searchTerm;
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          // Coincide al inicio del nombre (segunda prioridad)
          const aStartsWith = a.nom.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.nom.toLowerCase().startsWith(searchTerm);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Coincide en cualquier parte del nombre (tercera prioridad)
          const aContains = a.nom.toLowerCase().includes(searchTerm);
          const bContains = b.nom.toLowerCase().includes(searchTerm);
          if (aContains && !bContains) return -1;
          if (!aContains && bContains) return 1;
          
          // Si los criterios son iguales, mantener el orden original
          return 0;
        });
        
        console.log('Animales ordenados localmente:', orderedAnimals.map(a => a.nom));
      }
      
      setAnimals(orderedAnimals);
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
      
      // Manejar específicamente el error de estado_t
      if (err.code === 'DB_COLUMN_ERROR' || (err.message && err.message.includes('estado_t'))) {
        setError('La columna "estado_t" no existe en la tabla de animales. Este es un problema conocido del backend que está siendo solucionado. Mientras tanto, se mostrarán datos simulados si están disponibles.');
        setUseMockData(true);
      } else {
        setError(err.message || 'Error al cargar los animales');
      }
      
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

  // Cargar datos iniciales
  useEffect(() => {
    console.log('Cargando datos iniciales...');
    loadAnimals();
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  // Recargar datos cuando cambia la página o los filtros
  useEffect(() => {
    console.log('Cambiando a página:', currentPage, 'con filtros:', filters);
    loadAnimals();
  }, [filters, currentPage]);

  useEffect(() => {
    const handleApplyFilters = (event: CustomEvent<AnimalFilters>) => {
      setFilters(event.detail);
      setCurrentPage(1); 
      // Limpiar la información de búsqueda cuando se aplican nuevos filtros
      if (!event.detail.search) {
        setSearchInfo(null);
      }
    };

    const handleRefreshAnimals = () => {
      loadAnimals();
      setSearchInfo(null); // Limpiar información de búsqueda al refrescar
    };
    
    const handleSearchCompleted = (event: CustomEvent<{
      term: string;
      count: number;
      total: number;
      usedMock: boolean;
      reason?: string;
    }>) => {
      setSearchInfo(event.detail);
      setUseMockData(event.detail.usedMock);
      
      if (event.detail.usedMock) {
        setError(`Nota: Mostrando resultados simulados debido a un ${event.detail.reason}. Se encontraron ${event.detail.count} coincidencias para "${event.detail.term}".`);
      } else {
        // Si la búsqueda fue exitosa, limpiar mensaje de error
        setError(null);
      }
    };

    document.addEventListener('refresh-animals', handleRefreshAnimals);
    document.addEventListener('reload-animals', handleRefreshAnimals); // Añadir listener para el nuevo evento
    document.addEventListener('search-completed', handleSearchCompleted as EventListener);

    const rootElement = document.getElementById(id || '');
    if (rootElement) {
      rootElement.addEventListener('apply-filters', handleApplyFilters as EventListener);
    } else {
      document.addEventListener('filters-applied', handleApplyFilters as EventListener);
    }

    return () => {
      document.removeEventListener('refresh-animals', handleRefreshAnimals);
      document.removeEventListener('reload-animals', handleRefreshAnimals); // Eliminar listener al desmontar
      document.removeEventListener('search-completed', handleSearchCompleted as EventListener);
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
        // Si hay información de búsqueda, mostrarla
        if (searchInfo && searchInfo.term) {
          const mockBadge = searchInfo.usedMock ? 
            '<span class="ml-1 px-1 py-0.5 text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 rounded">DATOS SIMULADOS</span>' : 
            '';
          
          totalAnimalsContainer.innerHTML = `
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Total: ${totalAnimals} animales | Búsqueda: "${searchInfo.term}" (${searchInfo.count} coincidencias) ${mockBadge}
            </span>
          `;
        } else {
          // Mensaje normal sin búsqueda
          const mockBadge = useMockData ? 
            '<span class="ml-1 px-1 py-0.5 text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 rounded">DATOS SIMULADOS</span>' : 
            '';
          
          totalAnimalsContainer.innerHTML = `
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Total: ${totalAnimals} animales ${mockBadge}
            </span>
          `;
        }
      }
    }
  }, [totalAnimals, loading, searchInfo, useMockData]);

  // Función mejorada para cambiar de página
  const handlePageChange = (page: number) => {
    if (page === currentPage) return; // Evitar recargas innecesarias
    
    console.log(`Cambiando de página ${currentPage} a ${page}`);
    
    // Actualizar estado
    setCurrentPage(page);
    
    // Pequeña pausa para asegurar que el estado se actualiza antes de cargar
    setTimeout(() => {
      // Preservar los filtros existentes incluyendo términos de búsqueda
      const paginationParams = {
        ...filters,
        page: page
      };
      
      console.log('Cargando página con parámetros:', paginationParams);
      
      // Usar la función loadAnimals para mantener toda la lógica existente
      loadAnimals();
    }, 100);
    
    // Scroll hasta la tabla
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnimalDeactivation = async (animalId: number) => {
    try {
      await animalService.deleteAnimal(animalId);
      loadAnimals();
    } catch (err) {
      console.error('Error al dar de baja al animal:', err);
      alert('No se pudo dar de baja al animal. Por favor, inténtalo de nuevo.');
    }
  };

  // Paginación que respeta el tema oscuro y es más intuitiva
  const renderNavigation = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
        <div className="text-center mb-2 text-gray-800 dark:text-gray-200">
          <span className="font-semibold">Página {currentPage} de {totalPages}</span> 
          <span className="ml-2 text-gray-600 dark:text-gray-400">(Total: {totalAnimals} animales)</span>
        </div>
        
        <div className="flex justify-center gap-2">
          {/* Primera página */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ir a primera página"
          >
            <span aria-hidden="true">«</span>
          </button>
          
          {/* Página anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Página anterior"
          >
            Anterior
          </button>
          
          {/* Página actual */}
          <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600">
            {currentPage}
          </span>
          
          {/* Página siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
          
          {/* Última página */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ir a última página"
          >
            <span aria-hidden="true">»</span>
          </button>
        </div>
      </div>
    );
  };
  };

  const getAnimalIcon = (animal: Animal) => {
    const iconClass = "text-2xl";
    
    if (animal.genere === 'M') {
      return <span className={iconClass}>🐂</span>; // Toro
    } else {
      if (animal.alletar !== '0') {
        return <span className={iconClass}>🐄</span>; // Vaca amamantando
      } else {
        return <span className={iconClass}>🐮</span>; // Vaca
      }
    }
  };

  const renderStatusBadge = (animal: Animal) => {
    const statusClass = animal.estado === 'OK' ?
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {animal.estado === 'OK' ? 'Activo' : 'Baja'}
      </span>
    );
  };

  return (
    <div ref={tableRef} className="w-full overflow-x-auto">
      {/* Mensaje de datos simulados */}
      {useMockData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Mostrando datos simulados. No se pudo conectar con el servidor. Los animales mostrados son de ejemplo y no reflejan datos reales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
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
          <div className="overflow-x-auto w-full">
            <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="w-[12%] px-1 sm:px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="w-[25%] px-1 sm:px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="w-[21%] px-1 sm:px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                  <th scope="col" className="w-[15%] px-1 sm:px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Explotación</th>
                  <th scope="col" className="w-[12%] px-1 sm:px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="w-[15%] px-1 sm:px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {animals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-1 sm:px-2 py-2 whitespace-nowrap text-center w-[12%]">
                      <span className="text-xl sm:text-2xl" title={animal.alletar === '0' ? 'No amamantando' : animal.alletar === '1' ? 'Amamantando 1 ternero' : 'Amamantando 2 terneros'}>
                        {getAnimalIcon(animal)}
                      </span>
                    </td>
                    <td className="px-1 sm:px-2 py-2 whitespace-nowrap w-[25%]">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-200">
                        {animal.nom}
                      </div>
                      {animal.genere && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {animal.genere === 'M' ? 'Macho' : 'Hembra'}
                        </div>
                      )}
                    </td>
                    <td className="px-1 sm:px-2 py-2 whitespace-nowrap w-[21%]">
                      <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-200">{animal.cod || '-'}</div>
                      {animal.num_serie && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Serie: {animal.num_serie}
                        </div>
                      )}
                    </td>
                    <td className="px-1 sm:px-2 py-2 whitespace-nowrap w-[15%] hidden sm:table-cell">
                      <div className="text-xs sm:text-sm text-gray-900 dark:text-gray-200">{animal.explotacio || '-'}</div>
                    </td>
                    <td className="px-1 sm:px-2 py-2 whitespace-nowrap w-[12%]">
                      {renderStatusBadge(animal)}
                    </td>
                    <td className="px-1 sm:px-2 py-2 whitespace-nowrap text-right w-[15%]">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <a
                          href={`/animals/${animal.id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Ver detalles"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        {canEdit && animal.estado === 'OK' && (
                          <a 
                            href={`/animals/update/${animal.id}`}
                            className="inline-flex items-center px-1 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden xs:inline">Editar</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderNavigation()}
        </>
      )}
    </div>
  );
};

export default AnimalTable;
