import React, { useState, useEffect } from 'react';
import { mockImportHistory } from '../../services/mockData';
import type { ImportHistoryItem, ImportHistoryFilters } from '../../services/importService';

interface ImportHistoryProps {
  className?: string;
  defaultFilters?: ImportHistoryFilters;
  refreshTrigger?: number; // Un valor que cambia para forzar la actualización
}

const ImportHistory: React.FC<ImportHistoryProps> = ({ 
  className = '', 
  defaultFilters = {}, 
  refreshTrigger = 0 
}) => {
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [filters, setFilters] = useState<ImportHistoryFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Cargar historial de importaciones
  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // SIMPLIFICADO: Usamos directamente los datos de mockImportHistory para evitar errores
      // hasta que se implemente completamente la API de historial
      
      // Filtrado simple
      let filteredHistory = [...mockImportHistory];
      
      // Aplicar filtros si hay
      if (filters.status) {
        filteredHistory = filteredHistory.filter(item => item.status === filters.status);
      }
      
      // Paginación
      const start = (currentPage - 1) * limit;
      const end = currentPage * limit;
      const paginatedItems = filteredHistory.slice(start, end);
      const totalPages = Math.ceil(filteredHistory.length / limit);
      
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setHistory(paginatedItems);
      setTotalItems(filteredHistory.length);
      setTotalPages(totalPages);
    } catch (err) {
      console.error('Error al cargar el historial de importaciones:', err);
      setError('No se pudo cargar el historial de importaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando cambian los filtros, la página o el refreshTrigger
  useEffect(() => {
    loadHistory();
  }, [filters, currentPage, refreshTrigger]);

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color según estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
            ✅ Completado
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
            ❌ Error
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            ⏳ Procesando
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {status}
          </span>
        );
    }
  };

  // Simulación: descargar errores
  const handleDownloadErrors = async (importId: number) => {
    try {
      setIsLoading(true);
      
      // Crear un archivo CSV de errores de ejemplo
      const headers = ['Línea', 'Columna', 'Valor', 'Error'];
      const data = [
        { 'Línea': '2', 'Columna': 'Genere', 'Valor': 'X', 'Error': 'Valor no válido para género. Use M o F.' },
        { 'Línea': '3', 'Columna': 'Data Naixement', 'Valor': '32/01/2020', 'Error': 'Fecha no válida' },
        { 'Línea': '5', 'Columna': 'Mare', 'Valor': '999', 'Error': 'Animal madre no encontrado' }
      ];
      
      // Crear CSV
      let csvContent = headers.join(';') + '\n';
      data.forEach(row => {
        const values = headers.map(header => {
          // Utilizar indexación con tipo correctamente
          const value = row[header as keyof typeof row] || '';
          return typeof value === 'string' && (value.includes(';') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        });
        csvContent += values.join(';') + '\n';
      });
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `errores_importacion_${importId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error al descargar errores:', err);
      setError('No se pudieron descargar los errores');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`import-history ${className}`}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-xl">🚨</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando historial de importaciones...</p>
        </div>
      ) : history.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Archivo</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registros</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.filename}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Por: {item.user_name || `Usuario ${item.user_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white">Total: {item.total_records}</span>
                        <div className="flex space-x-2 text-xs">
                          <span className="text-green-600 dark:text-green-400">
                            Éxito: {item.successful_records}
                          </span>
                          {item.failed_records > 0 && (
                            <span className="text-red-600 dark:text-red-400">
                              Errores: {item.failed_records}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {item.failed_records > 0 && (
                          <button
                            onClick={() => handleDownloadErrors(item.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-red-300 dark:border-red-700 text-xs font-medium rounded text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Descargar errores"
                          >
                            <span className="mr-1">📥</span>
                            <span>Errores</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando <span className="font-medium">{(currentPage - 1) * limit + 1}</span> a <span className="font-medium">{Math.min(currentPage * limit, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                        currentPage === 1 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      &laquo; Anterior
                    </button>
                    
                    {/* Números de página */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          page === currentPage
                            ? 'z-10 bg-primary border-primary text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Siguiente &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center border border-gray-100 dark:border-gray-700">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay importaciones</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron registros de importaciones en el sistema.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImportHistory;
