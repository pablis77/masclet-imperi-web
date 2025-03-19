import React, { useState, useRef, useEffect } from 'react';
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

      // Crear FormData para la solicitud
      const formData = new FormData();
      formData.append('file', file);
      
      // Opciones adicionales (simuladas para desarrollo)
      formData.append('validate_only', 'false');
      formData.append('skip_errors', 'false');
      
      // Llamar al servicio de importación
      const importResult = await importAnimals(formData);
      
      setResult(importResult);
      
      // Notificar al componente padre si hay callback
      if (onImportComplete) {
        onImportComplete(importResult);
      }
      
      // Disparar evento personalizado para notificar a otros componentes
      const event = new CustomEvent('import-complete', { detail: importResult });
      document.dispatchEvent(event);
      
    } catch (err: any) {
      console.error('Error al importar datos:', err);
      setError(`Error al importar datos: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejador para importación directa (sin validación)
  const handleDirectImport = async () => {
    if (!file) {
      setError("Debes seleccionar un archivo CSV para importar");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Crear FormData para la solicitud
      const formData = new FormData();
      formData.append('file', file);
      
      // Opciones para importación directa
      formData.append('validate_only', 'false');
      formData.append('skip_errors', 'true');
      formData.append('direct_import', 'true');
      
      // Llamar al servicio de importación
      const importResult = await importAnimals(formData);
      
      setResult(importResult);
      
      // Notificar al componente padre si hay callback
      if (onImportComplete) {
        onImportComplete(importResult);
      }
      
      // Disparar evento personalizado para notificar a otros componentes
      const event = new CustomEvent('import-complete', { detail: importResult });
      document.dispatchEvent(event);
      
    } catch (err: any) {
      console.error('Error en importación directa:', err);
      setError(`Error en importación directa: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar eventos del documento
  useEffect(() => {
    // Evento para resetear el formulario
    const handleResetEvent = () => {
      handleReset();
    };
    
    // Evento para importación directa
    const handleDirectImportEvent = () => {
      handleDirectImport();
    };
    
    // Evento para importación normal
    const handleImportEvent = () => {
      handleImport();
    };
    
    // Registrar listeners
    document.addEventListener('reset-import-form', handleResetEvent);
    document.addEventListener('direct-import', handleDirectImportEvent);
    document.addEventListener('import-animals', handleImportEvent);
    
    // Limpiar listeners al desmontar
    return () => {
      document.removeEventListener('reset-import-form', handleResetEvent);
      document.removeEventListener('direct-import', handleDirectImportEvent);
      document.removeEventListener('import-animals', handleImportEvent);
    };
  }, [file]); // Dependencia en file para que los handlers tengan acceso al archivo actual

  return (
    <div className="import-form">
      {/* Selector de archivo */}
      <div className="mb-6">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Seleccionar archivo CSV
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow">
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <input
                id="file-upload"
                type="file"
                accept={acceptedFormat}
                onChange={handleFileChange}
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              
              <div className="text-center">
                <div className="text-2xl mb-2">📁</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {file ? file.name : `Arrastra un archivo CSV o haz clic para seleccionar`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {file 
                    ? `${(file.size / 1024).toFixed(2)} KB - ${file.type || 'text/csv'}` 
                    : `Solo se permiten archivos CSV`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Información de depuración (solo en desarrollo) */}
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Información de depuración:</h4>
          <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-500 dark:text-red-400 text-lg">🚨</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Resultado de importación */}
      {result && (
        <div className={`mb-6 p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-lg">
                {result.success ? '✅' : '⚠️'}
              </span>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                result.success 
                  ? 'text-green-800 dark:text-green-300' 
                  : 'text-yellow-800 dark:text-yellow-300'
              }`}>
                {result.success ? 'Importación completada' : 'Importación con advertencias'}
              </h3>
              <div className={`mt-2 text-sm ${
                result.success 
                  ? 'text-green-700 dark:text-green-200' 
                  : 'text-yellow-700 dark:text-yellow-200'
              }`}>
                <p>Registros procesados: {result.total_records}</p>
                <p>Registros importados: {result.successful_records}</p>
                {result.failed_records > 0 && (
                  <p>Registros con errores: {result.failed_records}</p>
                )}
                {result.message && (
                  <p className="mt-2 font-medium">{result.message}</p>
                )}
              </div>
              
              {/* Acciones adicionales */}
              {result.failed_records > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Lógica para descargar errores
                      console.log('Descargar errores de importación');
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 text-xs font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <span className="mr-1">📥</span>
                    Descargar errores
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de carga */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Procesando importación</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Esto puede tardar unos momentos dependiendo del tamaño del archivo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportForm;
