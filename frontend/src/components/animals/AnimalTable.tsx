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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnimalFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalAnimals, setTotalAnimals] = useState<number>(0);
  const tableRef = useRef<HTMLDivElement>(null);

  // Cargar animales desde la API
  const loadAnimals = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await animalService.getAnimals({
        ...filters,
        page: currentPage,
        limit: 10
      });
      
      setAnimals(response.items);
      setTotalAnimals(response.total);
      setTotalPages(response.pages);
      
      // Dispatch evento para actualizar contador en la página
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
      setLoading(false);
    }
  };

  // Iniciar carga de animales cuando se monta el componente
  useEffect(() => {
    setLoading(true); // Iniciar estado de carga
    loadAnimals();
  }, []);

  // Cargar animales cuando cambian los filtros o la página
  useEffect(() => {
    if (!loading) { // Solo cargar si no está ya cargando
      loadAnimals();
    }
  }, [filters, currentPage]);

  // Configurar listeners para eventos personalizados
  useEffect(() => {
    const handleApplyFilters = (event: CustomEvent<AnimalFilters>) => {
      setFilters(event.detail);
      setCurrentPage(1); // Resetear a la primera página al aplicar filtros
    };

    const handleRefreshAnimals = () => {
      loadAnimals();
    };

    // Escuchar eventos en el documento
    document.addEventListener('refresh-animals', handleRefreshAnimals);

    // Escuchar eventos en el elemento raíz del componente si está disponible
    const rootElement = document.getElementById(id || '');
    if (rootElement) {
      rootElement.addEventListener('apply-filters', handleApplyFilters as EventListener);
    } else {
      // Fallback: escuchar en el documento
      document.addEventListener('filters-applied', handleApplyFilters as EventListener);
    }

    // Limpiar listeners al desmontar
    return () => {
      document.removeEventListener('refresh-animals', handleRefreshAnimals);
      if (rootElement) {
        rootElement.removeEventListener('apply-filters', handleApplyFilters as EventListener);
      } else {
        document.removeEventListener('filters-applied', handleApplyFilters as EventListener);
      }
    };
  }, [id]);

  // Actualizar el contador de animales en el DOM
  useEffect(() => {
    const totalAnimalsContainer = document.getElementById('totalAnimalsContainer');
    if (totalAnimalsContainer) {
      totalAnimalsContainer.innerHTML = `
        <span class="text-sm text-gray-500 dark:text-dark-text-secondary">
          Total: ${totalAnimals} animales
        </span>
      `;
    }
  }, [totalAnimals]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Hacer scroll al inicio de la tabla
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

  // Renderizar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Botón anterior
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border mr-1 disabled:opacity-50"
      >
        &laquo;
      </button>
    );
    
    // Primera página
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border mr-1"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2">...</span>
        );
      }
    }
    
    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded border mr-1 ${
            i === currentPage
              ? 'bg-primary text-white border-primary'
              : 'border-gray-300 dark:border-dark-border'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2">...</span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border mr-1"
        >
          {totalPages}
        </button>
      );
    }
    
    // Botón siguiente
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border ml-1 disabled:opacity-50"
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

  // Obtener el icono para un animal
  const getAnimalIcon = (animal: Animal) => {
    return animalService.getAnimalIcon(animal);
  };

  // Obtener la clase para el estado
  const getStatusClass = (estado: string) => {
    return animalService.getAnimalStatusClass(estado);
  };

  // Renderizar la tabla de animales
  return (
    <div ref={tableRef}>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-dark-text-secondary">Cargando animales...</span>
        </div>
      ) : animals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-dark-text-secondary text-lg">No se encontraron animales</p>
          <p className="text-gray-500 dark:text-dark-text-secondary mt-2">Intenta con otros filtros o importa datos de prueba</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-card-light">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Explotación
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {animals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-dark-card-light">
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-2xl" title={animalService.getAlletarText(animal.alletar)}>
                        {getAnimalIcon(animal)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                        {animal.nom}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                        {animal.genere === 'M' ? 'Macho' : 'Hembra'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-dark-text">
                        {animal.cod || '-'}
                      </div>
                      {animal.num_serie && (
                        <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                          Serie: {animal.num_serie}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-dark-text">
                        {animal.explotacio_id}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(animal.estado)}`}>
                        {animal.estado === 'OK' ? 'Activo' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a 
                          href={`/animals/${animal.id}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          Ver
                        </a>
                        {canEdit && animal.estado === 'OK' && (
                          <>
                            <a 
                              href={`/animals/edit/${animal.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Editar
                            </a>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Estás seguro de dar de baja a ${animal.nom}?`)) {
                                  handleAnimalDeactivation(animal.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Baja
                            </button>
                          </>
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
