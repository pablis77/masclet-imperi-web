import React, { useState } from 'react';
import adminService from '../../services/adminService';

/**
 * Botón para resetear la base de datos con confirmación doble
 */
const ResetDatabaseButton: React.FC = () => {
  // Estados
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSecondConfirmation, setShowSecondConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Manejador para el primer nivel de confirmación
  const handleFirstConfirmClick = () => {
    setShowConfirmation(true);
    setResult(null);
  };

  // Manejador para el segundo nivel de confirmación
  const handleSecondConfirmClick = () => {
    setShowSecondConfirmation(true);
  };

  // Manejador para cancelar la operación
  const handleCancelClick = () => {
    setShowConfirmation(false);
    setShowSecondConfirmation(false);
  };

  // Manejador para resetear la base de datos
  const handleResetDatabase = async () => {
    setLoading(true);
    try {
      const result = await adminService.resetDatabase();
      setResult(result);
      
      // Si es exitoso, cerrar los diálogos después de un tiempo
      if (result.success) {
        setTimeout(() => {
          setShowConfirmation(false);
          setShowSecondConfirmation(false);
        }, 3000);
        
        // Disparar evento para notificar a otros componentes
        const event = new CustomEvent('database-reset', { detail: result });
        document.dispatchEvent(event);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error desconocido al resetear la base de datos'
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el componente
  return (
    <div className="reset-database-container">
      {/* Botón principal */}
      {!showConfirmation && (
        <button
          onClick={handleFirstConfirmClick}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200"
          title="Esta acción borrará TODOS los datos"
        >
          <span className="mr-2">🗑️</span>
          <span>Resetear Base de Datos</span>
        </button>
      )}

      {/* Primera confirmación */}
      {showConfirmation && !showSecondConfirmation && (
        <div className="confirmation-dialog bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-700 dark:text-red-300 font-medium mb-2">¿Estás seguro?</h3>
          <p className="text-sm text-red-600 dark:text-red-200 mb-4">
            Esta acción eliminará TODOS los datos de la base de datos. Esta operación no se puede deshacer.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleSecondConfirmClick}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200"
              disabled={loading}
            >
              Sí, continuar
            </button>
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Segunda confirmación */}
      {showConfirmation && showSecondConfirmation && (
        <div className="confirmation-dialog bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-700 dark:text-red-300 font-medium mb-2">
            ¡ÚLTIMA ADVERTENCIA!
          </h3>
          <p className="text-sm text-red-600 dark:text-red-200 mb-4">
            <strong>¿Estás ABSOLUTAMENTE seguro?</strong> Todos los animales, partos y registros históricos serán eliminados permanentemente.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleResetDatabase}
              className={`px-4 py-2 text-white font-medium rounded-md transition-colors duration-200 ${
                loading 
                  ? 'bg-red-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Sí, RESETEAR TODO'}
            </button>
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de resultado */}
      {result && (
        <div className={`mt-3 p-3 rounded-md ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm font-medium ${
            result.success 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResetDatabaseButton;
