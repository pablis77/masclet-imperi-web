import React, { useState, useRef } from 'react';
import { Button, Form, Alert, Spinner, Card } from 'react-bootstrap';
import { downloadAnimalTemplate, importAnimals } from '../../services/importService';
import type { ImportResult } from '../../services/importService';

// Props para el componente ImportForm
interface ImportFormProps {
  onImportComplete?: (result: ImportResult) => void;
}

/**
 * Componente para gestionar la importación de animales desde archivos CSV
 */
const ImportForm: React.FC<ImportFormProps> = ({ onImportComplete }) => {
  // Referencias
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Formato aceptado
  const acceptedFormat = '.csv';
  
  // Manejador para seleccionar archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
      setDebugInfo(`Archivo seleccionado: ${files[0].name}\nTamaño: ${files[0].size} bytes\nTipo: ${files[0].type}`);
    }
  };
  
  // Manejador para resetear todo
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setDebugInfo("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Manejador para descargar plantilla
  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      
      // Descargar plantilla de animales
      const blob = await downloadAnimalTemplate();
      const filename = 'plantilla_animales.csv';
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (err: any) {
      console.error('Error al descargar plantilla:', err);
      setError(`Error al descargar plantilla: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejador para importar datos
  const handleImport = async () => {
    if (!file) {
      setError("Debes seleccionar un archivo CSV para importar");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Verificar si hay token de autenticación en localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Si no hay token, mostrar advertencia y crear uno mock para pruebas
        setDebugInfo(prev => prev + "\n\nADVERTENCIA: No se encontró token de autenticación en localStorage.");
        // Para propósitos de desarrollo, podemos almacenar un token de prueba
        localStorage.setItem('auth_token', 'test_token_for_development');
        setDebugInfo(prev => prev + "\nSe ha creado un token de prueba para desarrollo.");
      } else {
        setDebugInfo(prev => prev + `\n\nToken de autenticación encontrado: ${token.substring(0, 10)}...`);
      }

      // Importar los datos usando el servicio
      const importResult = await importAnimals(file);
      
      console.log('Resultado de la importación:', JSON.stringify(importResult, null, 2));
      
      // Almacenar resultado
      setResult(importResult);
      
      // Actualizar debug info
      setDebugInfo(prev => prev + `\n\nResultado de importación: ${JSON.stringify(importResult, null, 2)}`);
      
      // Callback si hay
      if (onImportComplete) {
        onImportComplete(importResult);
      }
    } catch (err: any) {
      console.error('Error al importar animales:', err);
      
      setError(`Error al importar archivo: ${err.message || "Error desconocido"}`);
      setDebugInfo(prev => prev + `\n\nERROR CAPTURADO: ${err.message || "Error sin mensaje"}`);
      
      if (err.stack) {
        setDebugInfo(prev => prev + `\n\nStack trace: ${err.stack}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejador directo para importar sin autenticación
  const handleDirectImport = async () => {
    if (!file) {
      setError("Debes seleccionar un archivo CSV para importar");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Verificar si hay token de autenticación en localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Para propósitos de desarrollo, almacenar un token de prueba
        localStorage.setItem('auth_token', 'test_token_for_development');
        setDebugInfo("No se encontró token de autenticación. Se ha creado un token de prueba para desarrollo.");
      } else {
        setDebugInfo(`Token de autenticación encontrado: ${token.substring(0, 10)}...`);
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', 'Importación de animales');

      // URL del endpoint (usando el proxy de Astro)
      const endpoint = `/api/v1/imports/csv`;

      // Debug info
      setDebugInfo(`Enviando petición a: ${endpoint}\nArchivo: ${file.name} (${file.size} bytes)\nTipo: ${file.type}`);
      console.log('Iniciando importación directa...');
      console.log('Enviando petición a:', endpoint);
      console.log('Archivo:', file.name, '- Tamaño:', file.size, 'bytes', '- Tipo:', file.type);

      // Obtener token actualizado (por si cambió)
      const currentToken = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
        setDebugInfo(prev => prev + `\nSe añade header de autorización: Bearer ${currentToken.substring(0, 10)}...`);
      }

      // Realizar petición directamente
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers,
      });

      // Procesar respuesta
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta HTTP:', response.status, response.statusText, errorText);
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}. Detalle: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Respuesta completa del servidor:', JSON.stringify(responseData, null, 2));

      // Actualizar estado
      setResult({
        success: responseData.status === 'COMPLETED' && responseData.result?.errors === 0,
        message: responseData.result?.errors === 0 
          ? `Importación completada con éxito. Se importaron ${responseData.result?.success} animales.` 
          : `Importación completada con advertencias. Se importaron ${responseData.result?.success} animales, pero hubo ${responseData.result?.errors} errores.`,
        total_processed: responseData.result?.total || 0,
        total_imported: responseData.result?.success || 0,
        total_errors: responseData.result?.errors || 0,
        errors: responseData.result?.error_details?.map((detail: any) => 
          `Fila ${detail.row}: ${detail.error}`
        ) || [],
      });

      setDebugInfo(prev => prev + `\n\nRespuesta: ${JSON.stringify(responseData, null, 2)}`);
    } catch (error: any) {
      console.error('Error en importación directa:', error);
      
      let errorMessage = 'Error desconocido';
      let errorDetails: string[] = [];
      
      if (error instanceof Error) {
        errorMessage = error.message || 'Error sin mensaje';
        errorDetails = [error.stack || error.toString()];
      } else if (typeof error === 'string') {
        errorMessage = error;
        errorDetails = [error];
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
          errorDetails = Object.entries(error).map(([key, value]) => `${key}: ${value}`);
        } catch (e) {
          errorMessage = 'Error al serializar el objeto de error';
          errorDetails = ['No se pudieron obtener detalles del error'];
        }
      }
      
      setError(`Error al importar: ${errorMessage}`);
      setResult({
        success: false,
        message: `Error al importar: ${errorMessage}`,
        total_processed: 0,
        total_imported: 0,
        total_errors: 1,
        errors: errorDetails,
      });
      
      setDebugInfo(prev => prev + `\n\nError: ${errorMessage}\nDetalles: ${JSON.stringify(errorDetails, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-full">
      <Card className="border rounded shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="mb-3">Importar Animales</Card.Title>
          
          <Card.Text className="text-gray-600 mb-4">
            Importa animales desde un archivo CSV. El archivo debe tener el formato correcto.
          </Card.Text>
          
          <hr className="my-4" />
          
          {/* Mensaje de error */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          
          {/* Información de depuración */}
          {debugInfo && (
            <Alert variant="info" className="mb-4">
              <Alert.Heading>Información de depuración</Alert.Heading>
              <p className="overflow-auto" style={{ maxHeight: '200px' }}>{debugInfo}</p>
            </Alert>
          )}
          
          {/* Resultado de importación */}
          {result && (
            <Alert variant={result.success ? "success" : "warning"} className="mb-4">
              <Alert.Heading>{result.success ? "Importación Exitosa" : "Importación con Advertencias"}</Alert.Heading>
              <p>{result.message}</p>
              
              {result.total_processed !== undefined && (
                <div className="mt-3">
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-primary p-2 me-2">
                      Procesados: {result.total_processed}
                    </span>
                    <span className="badge bg-success p-2 me-2">
                      Importados: {result.total_imported || 0}
                    </span>
                    <span className="badge bg-danger p-2">
                      Errores: {result.total_errors || 0}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Mostrar errores si hay */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <h6>Errores encontrados:</h6>
                  <ul className="list-group list-group-flush">
                    {result.errors.map((error, index) => (
                      <li key={index} className="list-group-item list-group-item-danger">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}
          
          {/* Selector de archivo */}
          <Form.Group className="mb-4 mt-3">
            <Form.Label htmlFor="import-file-input">Seleccionar archivo CSV</Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept={acceptedFormat}
              onChange={handleFileChange}
              id="import-file-input"
              disabled={loading}
            />
            
            {file && (
              <p className="text-secondary mt-2 small">
                Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </Form.Group>
        </Card.Body>
        
        <Card.Footer className="bg-light d-flex justify-content-between">
          <div>
            <Button
              variant="secondary"
              onClick={handleDownloadTemplate}
              disabled={loading}
              className="d-flex align-items-center gap-2 me-2"
            >
              {loading && <Spinner animation="border" size="sm" />}
              <span>Descargar Plantilla</span>
            </Button>
          </div>
          
          <div>
            <Button 
              variant="outline-secondary"
              onClick={handleReset} 
              disabled={loading || (!file && !result)}
              className="me-2"
            >
              Reiniciar
            </Button>
            
            <Button
              variant="info"
              onClick={handleDirectImport}
              disabled={loading || !file}
              className="me-2"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Importación...
                </>
              ) : 'Importación Directa'}
            </Button>
            
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Importando...
                </>
              ) : 'Importar'}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ImportForm;
