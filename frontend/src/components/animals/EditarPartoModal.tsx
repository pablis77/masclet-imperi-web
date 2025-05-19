import React, { useState, useEffect } from 'react';

interface EditarPartoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partoData: PartoData) => Promise<void>;
  partoData: PartoData;
  animalId: number;
}

export interface PartoData {
  id: number;
  part: string; // fecha en formato YYYY-MM-DD
  GenereT: string;
  EstadoT: string;
  observacions?: string;
  numero_part?: number;
  // Otros campos que puedan ser necesarios
}

const EditarPartoModal: React.FC<EditarPartoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partoData,
  animalId
}) => {
  const [formData, setFormData] = useState<PartoData>({
    id: 0,
    part: '',
    GenereT: '',
    EstadoT: 'OK',
    observacions: '',
    numero_part: 1
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (partoData) {
      // Convertir fecha de DD/MM/YYYY a YYYY-MM-DD para el input date
      let formattedDate = partoData.part;
      if (partoData.part && partoData.part.includes('/')) {
        const parts = partoData.part.split('/');
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      setFormData({
        ...partoData,
        part: formattedDate
      });
    }
  }, [partoData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY para la API
      let apiFormData = { ...formData };
      if (formData.part && formData.part.includes('-')) {
        const parts = formData.part.split('-');
        apiFormData.part = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      await onSave(apiFormData);
      onClose();
    } catch (err) {
      console.error('Error al guardar el parto:', err);
      setError('Ha ocurrido un error al guardar el parto. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Centrar modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Contenido del modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute right-4 top-4">
            <button
              type="button"
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
              Editar Parto
            </h3>
            <div className="mt-4">
              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Fecha del parto */}
                  <div>
                    <label htmlFor="part" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha del parto
                    </label>
                    <input
                      type="date"
                      name="part"
                      id="part"
                      required
                      value={formData.part}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                  
                  {/* Género del ternero */}
                  <div>
                    <label htmlFor="GenereT" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Género del ternero
                    </label>
                    <select
                      name="GenereT"
                      id="GenereT"
                      required
                      value={formData.GenereT}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    >
                      <option value="">Selecciona un género</option>
                      <option value="M">Macho</option>
                      <option value="F">Hembra</option>
                      <option value="esforrada">Esforrada</option>
                    </select>
                  </div>
                  
                  {/* Estado del ternero */}
                  <div>
                    <label htmlFor="EstadoT" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado del ternero
                    </label>
                    <select
                      name="EstadoT"
                      id="EstadoT"
                      required
                      value={formData.EstadoT}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    >
                      <option value="OK">Vivo</option>
                      <option value="DEF">Fallecido</option>
                    </select>
                  </div>
                  
                  {/* Número de parto */}
                  <div>
                    <label htmlFor="numero_part" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Número de parto
                    </label>
                    <input
                      type="number"
                      name="numero_part"
                      id="numero_part"
                      min="1"
                      value={formData.numero_part || 1}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                  
                  {/* Observaciones */}
                  <div>
                    <label htmlFor="observacions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Observaciones
                    </label>
                    <textarea
                      name="observacions"
                      id="observacions"
                      rows={3}
                      value={formData.observacions || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      placeholder="Añade observaciones relevantes sobre el parto o el ternero..."
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
                      loading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    }`}
                  >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPartoModal;
