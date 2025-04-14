import React, { useState, useEffect, useRef } from 'react';
import animalService from '../../services/animalService';
import type { Animal, AnimalFilters, PaginatedResponse } from '../../services/animalService';

interface AnimalTableProps {
  initialFilters?: AnimalFilters;
  id?: string;
  canEdit?: boolean;
  canCreate?: boolean;
}

const AnimalTableSimple: React.FC<AnimalTableProps> = ({ initialFilters = {}, id, canEdit = false, canCreate = false }) => {
  // Estados para los datos
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalAnimals, setTotalAnimals] = useState<number>(0);
  const tableRef = useRef<HTMLDivElement>(null);

  // Cargar los animales desde el backend
  const loadAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Cargando animales - Página: ${currentPage}, Filtros:`, {...initialFilters});
      
      // Parámetros para la paginación
      const params = {
        ...initialFilters,
        page: currentPage,
        limit: 10
      };
      
      // Llamada directa al servicio
      console.log('Parámetros enviados a la API:', params);
      
      const response = await animalService.getAnimals(params);
      
      console.log('Respuesta del servidor:', response);
      setAnimals(response.items || []);
      setTotalAnimals(response.total || 0);
      setTotalPages(response.pages || 1);
      
      // Notificar que los datos se han cargado
      document.dispatchEvent(new CustomEvent('animals-loaded', {
        detail: {
          total: response.total,
          filtered: response.items.length,
          page: response.page,
          pages: response.pages
        }
      }));
    } catch (error: any) {
      console.error('Error cargando animales:', error);
      setError(error.message || 'Error al cargar los animales');
      setAnimals([]);
      setTotalAnimals(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAnimals();
  }, []);

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    
    console.log(`Cambiando de página ${currentPage} a ${page}`);
    setCurrentPage(page);
    
    // Scroll hasta la tabla
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Efecto para cargar animales cuando cambia la página
  useEffect(() => {
    loadAnimals();
  }, [currentPage]);

  // Renderizar la paginación
  const renderPaginacion = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex flex-col items-center mt-5 mb-5 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
        <div className="mb-2 text-gray-800 dark:text-gray-200">
          Página {currentPage} de {totalPages} (Total: {totalAnimals} vacas/toros)
        </div>
        <div className="flex space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            Inicio
          </button>
          
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          
          <div className="px-3 py-1 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md">
            {currentPage}
          </div>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            Final
          </button>
        </div>
      </div>
    );
  };

  // Función para renderizar el ícono del animal
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

  // Función para renderizar el estado del animal
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

  // Renderizar el componente
  return (
    <div ref={tableRef} className="w-full overflow-x-auto">
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
      
      {/* Indicador de carga */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando animales...</span>
        </div>
      ) : animals.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 text-lg">No se encontraron animales</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Intenta con otros filtros</p>
          <button 
            onClick={loadAnimals}
            className="mt-4 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Tabla de animales */}
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
          
          {/* Paginación */}
          {renderPaginacion()}
        </>
      )}
    </div>
  );
};

export default AnimalTableSimple;
