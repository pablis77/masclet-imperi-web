import React, { useState, useEffect, useCallback } from 'react';
import importService from '../../services/importService';
import type { ImportHistoryItem, ImportHistoryFilters } from '../../services/importService';

interface ImportHistoryProps {
  className?: string;
  defaultFilters?: ImportHistoryFilters;
  refreshTrigger?: number;
}

// Hook personalizado para debounce
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
  const [currentLang, setCurrentLang] = useState<string>('es');
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  // Debounce para el refreshTrigger para evitar llamadas múltiples
  const debouncedRefreshTrigger = useDebounce(refreshTrigger, 300);

  // Rate limiting: mínimo 1 segundo entre llamadas
  const RATE_LIMIT_MS = 1000;

  // Traducciones
  const translations = {
    es: {
      loadingError: "No se pudo cargar el historial de importaciones",
      noImports: "No hay importaciones registradas",
      filename: "Nombre de archivo",
      importDate: "Fecha de importación",
      status: "Estado",
      records: "Registros",
      actions: "Acciones",
      loading: "Cargando historial...",
      viewDetails: "Ver detalles",
      downloadReport: "Descargar reporte",
      statusCompleted: "Completado",
      statusCompletedErrors: "Completado con errores",
      statusFailed: "Error",
      statusProcessing: "Procesando",
      statusPending: "Pendiente",
      prev: "Anterior",
      next: "Siguiente",
      page: "Página",
      of: "de",
      total: "Total",
      first: "Primera"
    },
    ca: {
      loadingError: "No s'ha pogut carregar l'historial d'importacions",
      noImports: "No hi ha importacions registrades",
      filename: "Nom d'arxiu",
      importDate: "Data d'importació",
      status: "Estat",
      records: "Registres",
      actions: "Accions", 
      loading: "Carregant historial...",
      viewDetails: "Veure detalls",
      downloadReport: "Descarregar informe",
      statusCompleted: "Completat",
      statusCompletedErrors: "Completat amb errors",
      statusFailed: "Error",
      statusProcessing: "Processant",
      statusPending: "Pendent",
      prev: "Anterior",
      next: "Següent",
      page: "Pàgina",
      of: "de",
      total: "Total",
      first: "Primera"
    }
  };
  
  // Efecto para detectar cambios de idioma
  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);

    const handleLangChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };

    window.addEventListener('storage', handleLangChange);
    return () => {
      window.removeEventListener('storage', handleLangChange);
    };
  }, []);

  // Función de carga con rate limiting
  const loadHistory = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Rate limiting: no cargar si ha pasado menos de 1 segundo desde la última carga
    if (!force && (now - lastLoadTime) < RATE_LIMIT_MS) {
      console.log('[ImportHistory] Rate limit aplicado, saltando carga');
      return;
    }

    // Evitar múltiples cargas simultáneas
    if (isLoading) {
      console.log('[ImportHistory] Ya está cargando, saltando carga');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastLoadTime(now);
    
    try {
      const apiFilters: ImportHistoryFilters = {
        ...filters,
        page: currentPage,
        limit: limit
      };
      
      console.log('[ImportHistory] Consultando API con filtros:', apiFilters);
      
      const response = await importService.getImportHistory(apiFilters);
      
      setHistory(response.items);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error al cargar el historial de importaciones:', err);
      
      // Manejo específico para error 429
      if (err.response?.status === 429) {
        setError('Demasiadas solicitudes. Esperando antes de reintentar...');
        // Reintentar después de 3 segundos
        setTimeout(() => {
          loadHistory(true);
        }, 3000);
      } else {
        setError(translations[currentLang as keyof typeof translations]?.loadingError || translations.es.loadingError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, limit, lastLoadTime, isLoading, currentLang]);

  // Efecto para cargar datos con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [filters, currentPage, debouncedRefreshTrigger]);

  // Cambiar página con rate limiting
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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

  // Obtener color y estilo según estado (estilos Tailwind)
  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';
    let text = '';
    
    switch (status) {
      case 'completed':
        bgColor = 'bg-green-100 dark:bg-green-800';
        textColor = 'text-green-800 dark:text-green-100';
        text = translations[currentLang as keyof typeof translations]?.statusCompleted || translations.es.statusCompleted;
        break;
      case 'completed_err':
        bgColor = 'bg-amber-100 dark:bg-amber-800'; 
        textColor = 'text-amber-800 dark:text-amber-100';
        text = translations[currentLang as keyof typeof translations]?.statusCompletedErrors || translations.es.statusCompletedErrors;
        break;
      case 'failed':
        bgColor = 'bg-red-100 dark:bg-red-800';
        textColor = 'text-red-800 dark:text-red-100';
        text = translations[currentLang as keyof typeof translations]?.statusFailed || translations.es.statusFailed;
        break;
      case 'processing':
        bgColor = 'bg-blue-100 dark:bg-blue-800';
        textColor = 'text-blue-800 dark:text-blue-100';
        text = translations[currentLang as keyof typeof translations]?.statusProcessing || translations.es.statusProcessing;
        break;
      case 'pending':
        bgColor = 'bg-amber-100 dark:bg-amber-800';
        textColor = 'text-amber-800 dark:text-amber-100';
        text = translations[currentLang as keyof typeof translations]?.statusPending || translations.es.statusPending;
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-800 dark:text-gray-100';
        text = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {text}
      </span>
    );
  };

  // Descargar errores con rate limiting
  const handleDownloadErrors = useCallback(async (importId: number) => {
    try {
      setIsLoading(true);
      
      const headers = ['Línea', 'Columna', 'Valor', 'Error'];
      const data = [
        { 'Línea': '2', 'Columna': 'Genere', 'Valor': 'X', 'Error': 'Valor no válido para género. Use M o F.' },
        { 'Línea': '3', 'Columna': 'Data Naixement', 'Valor': '32/01/2020', 'Error': 'Fecha no válida' },
        { 'Línea': '5', 'Columna': 'Mare', 'Valor': '999', 'Error': 'Animal madre no encontrado' }
      ];
      
      let csvContent = headers.join(';') + '\n';
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header as keyof typeof row] || '';
          return typeof value === 'string' && (value.includes(';') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        });
        csvContent += values.join(';') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `errores_importacion_${importId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error al descargar errores:', err);
      setError('Error al descargar el archivo de errores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className={`${className}`}>
      {error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-100 dark:border-red-800 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-600 dark:text-gray-300">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 font-medium">{translations[currentLang as keyof typeof translations]?.loading || translations.es.loading}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 text-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {translations[currentLang as keyof typeof translations]?.noImports || translations.es.noImports}
          </p>
          <p className="text-gray-500 dark:text-gray-400">Las importaciones que realices aparecerán aquí.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations[currentLang as keyof typeof translations]?.filename || translations.es.filename}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations[currentLang as keyof typeof translations]?.importDate || translations.es.importDate}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations[currentLang as keyof typeof translations]?.records || translations.es.records}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations[currentLang as keyof typeof translations]?.status || translations.es.status}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations[currentLang as keyof typeof translations]?.actions || translations.es.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {history.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.id}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.filename}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Por: {item.user_name || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white">Total: {item.total_records}</span>
                        <div className="flex mt-1 text-xs">
                          {item.successful_records > 0 && (
                            <span className="text-green-600 dark:text-green-400 mr-2">
                              Éxito: {item.successful_records}
                            </span>
                          )}
                          {item.failed_records > 0 && (
                            <span className="text-red-600 dark:text-red-400">
                              Errores: {item.failed_records}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {item.failed_records > 0 && (
                        <button 
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 dark:border-red-700 text-xs font-medium rounded 
                                   text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
                          onClick={() => handleDownloadErrors(item.id)}
                        >
                          {translations[currentLang as keyof typeof translations]?.downloadReport || translations.es.downloadReport}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación con estilo Tailwind */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 space-x-1">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className={`inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === 1 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <span className="sr-only">{translations[currentLang as keyof typeof translations]?.first || 'Primera'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className={`inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === 1 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <span className="sr-only">{translations[currentLang as keyof typeof translations]?.prev || translations.es.prev}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Números de página */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Mostrar solo algunas páginas si hay muchas
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md 
                                ${pageNumber === currentPage 
                                  ? 'bg-primary/10 dark:bg-primary/30 text-primary border-primary/20 dark:border-primary/40' 
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={`ellipsis-${pageNumber}`} className="px-1 text-gray-500 dark:text-gray-400">...</span>;
                }
                return null;
              })}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === totalPages 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <span className="sr-only">Siguiente</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === totalPages 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <span className="sr-only">Última</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImportHistory;