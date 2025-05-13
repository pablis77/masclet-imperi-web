import React, { useState, useEffect } from 'react';
import { mockImportHistory } from '../../services/mockData';
import type { ImportHistoryItem, ImportHistoryFilters } from '../../services/importService';
import { Alert, Button, Card, Table, Badge, Pagination } from 'react-bootstrap';

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
        return <Badge bg="success">Completado</Badge>;
      case 'failed':
        return <Badge bg="danger">Error</Badge>;
      case 'processing':
        return <Badge bg="primary">Procesando</Badge>;
      case 'pending':
        return <Badge bg="warning">Pendiente</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <Card.Title className="mb-0">Historial de Importaciones</Card.Title>
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          {isLoading && history.length === 0 ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando historial de importaciones...</p>
            </div>
          ) : history.length > 0 ? (
            <>
              <Table responsive hover className="border">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Archivo</th>
                    <th>Fecha</th>
                    <th>Registros</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{item.filename}</span>
                          <small className="text-muted">
                            Por: {item.user_name || `Usuario ${item.user_id}`}
                          </small>
                        </div>
                      </td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>Total: {item.total_records}</span>
                          <div>
                            <small className="text-success me-2">
                              Éxito: {item.successful_records}
                            </small>
                            {item.failed_records > 0 && (
                              <small className="text-danger">
                                Errores: {item.failed_records}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td>
                        {item.failed_records > 0 && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDownloadErrors(item.id)}
                          >
                            Descargar errores
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)} 
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-4 border rounded bg-light">
              <p className="mb-0">No hay registros de importaciones</p>
            </div>
          )}
        </Card.Body>
        
        {isLoading && history.length > 0 && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImportHistory;
