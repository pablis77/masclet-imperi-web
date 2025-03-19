import React, { useEffect, useState } from 'react';
import animalService from '../../services/animalService';
import type { Animal, AnimalCreateDto, AnimalUpdateDto } from '../../services/animalService';
import type { Explotacion } from '../../services/explotacionService';

interface AnimalFormProps {
  animalData?: Animal;
  explotaciones?: Explotacion[];
  isEditMode?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const AnimalForm: React.FC<AnimalFormProps> = ({ 
  animalData, 
  explotaciones = [], 
  isEditMode = false, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<AnimalCreateDto>({
    explotacio_id: 0,
    nom: '',
    genere: 'M',
    estat: 'ACT',
    alletar: 'NO',
  });
  
  const [potentialFathers, setPotentialFathers] = useState<Animal[]>([]);
  const [potentialMothers, setPotentialMothers] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Si estamos editando, establecer los datos del animal
        if (isEditMode && animalData) {
          console.log(`Cargando datos para animal ID: ${animalData.id}`);
          setFormData({
            explotacio_id: animalData.explotacio_id,
            nom: animalData.nom,
            genere: animalData.genere,
            estat: animalData.estat,
            alletar: animalData.alletar,
            pare_id: animalData.pare_id,
            mare_id: animalData.mare_id,
            quadra: animalData.quadra,
            cod: animalData.cod,
            num_serie: animalData.num_serie,
            dob: animalData.dob,
          });
          
          // Cargar padres y madres potenciales
          try {
            const [fathers, mothers] = await Promise.all([
              animalService.getPotentialFathers(animalData.explotacio_id),
              animalService.getPotentialMothers(animalData.explotacio_id)
            ]);
            
            setPotentialFathers(fathers);
            setPotentialMothers(mothers);
          } catch (parentError) {
            console.error('Error cargando padres/madres potenciales:', parentError);
            setError('No se pudieron cargar los padres/madres potenciales. Se mostrarán datos simulados.');
          }
        } else if (explotaciones.length > 0) {
          // Si no estamos editando y hay explotaciones, establecer la primera como predeterminada
          setFormData(prev => ({
            ...prev,
            explotacio_id: explotaciones[0].id
          }));
          
          // Cargar padres y madres potenciales para la explotación predeterminada
          if (explotaciones[0].id) {
            try {
              const [fathers, mothers] = await Promise.all([
                animalService.getPotentialFathers(explotaciones[0].id),
                animalService.getPotentialMothers(explotaciones[0].id)
              ]);
              
              setPotentialFathers(fathers);
              setPotentialMothers(mothers);
            } catch (parentError) {
              console.error('Error cargando padres/madres potenciales:', parentError);
              setError('No se pudieron cargar los padres/madres potenciales. Se mostrarán datos simulados.');
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
        console.error('Error cargando datos iniciales:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [isEditMode, animalData, explotaciones]);

  // Cargar padres y madres cuando cambia la explotación
  const handleExplotacionChange = async (explotacioId: number) => {
    try {
      setLoading(true);
      
      // Actualizar el formulario
      setFormData(prev => ({
        ...prev,
        explotacio_id: explotacioId,
        pare_id: undefined,
        mare_id: undefined
      }));
      
      // Cargar padres y madres potenciales
      const [fathers, mothers] = await Promise.all([
        animalService.getPotentialFathers(explotacioId),
        animalService.getPotentialMothers(explotacioId)
      ]);
      
      setPotentialFathers(fathers);
      setPotentialMothers(mothers);
    } catch (err: any) {
      setError(err.message || 'Error al cargar padres y madres');
      console.error('Error cargando padres y madres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Manejar checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Manejar selects numéricos
    if (name === 'explotacio_id' || name === 'pare_id' || name === 'mare_id') {
      const numValue = value === '' ? undefined : parseInt(value, 10);
      
      if (name === 'explotacio_id' && numValue) {
        handleExplotacionChange(numValue);
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
      return;
    }
    
    // Manejar inputs de texto
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      console.log('Enviando datos del formulario:', formData);
      
      if (isEditMode && animalData) {
        console.log(`Actualizando animal con ID: ${animalData.id}`);
        await animalService.updateAnimal(animalData.id, formData);
        console.log('Animal actualizado correctamente');
      } else {
        console.log('Creando nuevo animal');
        await animalService.createAnimal(formData);
        console.log('Animal creado correctamente');
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el animal');
      console.error('Error guardando animal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600 dark:text-dark-text-secondary">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 border border-gray-100 dark:border-dark-border">
      <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">
        {isEditMode ? 'Editar Animal' : 'Nuevo Animal'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Explotación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Explotación *
            </label>
            <select
              name="explotacio_id"
              value={formData.explotacio_id || ''}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            >
              <option value="">Seleccione una explotación</option>
              {explotaciones.map(explotacion => (
                <option key={explotacion.id} value={explotacion.id}>
                  {explotacion.nombre}
                </option>
              ))}
            </select>
          </div>
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            />
          </div>
          
          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Género *
            </label>
            <select
              name="genere"
              value={formData.genere}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            >
              <option value="M">Macho</option>
              <option value="F">Hembra</option>
            </select>
          </div>
          
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Estado *
            </label>
            <select
              name="estat"
              value={formData.estat}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            >
              <option value="ACT">Activo</option>
              <option value="DEF">Baja</option>
            </select>
          </div>
          
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Código
            </label>
            <input
              type="text"
              name="cod"
              value={formData.cod || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            />
          </div>
          
          {/* Número de serie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Número de serie
            </label>
            <input
              type="text"
              name="num_serie"
              value={formData.num_serie || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            />
          </div>
          
          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            />
          </div>
          
          {/* Cuadra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Cuadra
            </label>
            <input
              type="text"
              name="quadra"
              value={formData.quadra || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            />
          </div>
          
          {/* Padre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Padre
            </label>
            <select
              name="pare_id"
              value={formData.pare_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            >
              <option value="">Sin padre</option>
              {potentialFathers.map(father => (
                <option key={father.id} value={father.id}>
                  {father.nom} {father.cod ? `(${father.cod})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Madre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Madre
            </label>
            <select
              name="mare_id"
              value={formData.mare_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            >
              <option value="">Sin madre</option>
              {potentialMothers.map(mother => (
                <option key={mother.id} value={mother.id}>
                  {mother.nom} {mother.cod ? `(${mother.cod})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Amamantando (solo para hembras) */}
        {formData.genere === 'F' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Amamantando
            </label>
            <select
              name="alletar"
              value={formData.alletar}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            >
              <option value="NO">No</option>
              <option value="1">Sí, 1</option>
              <option value="2">Sí, 2</option>
            </select>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {submitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnimalForm;
