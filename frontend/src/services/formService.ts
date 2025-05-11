import type { FormField, FormState, AnimalUpdateDto } from '../types/types';
import { normalizar } from '../utils/formHelpers';
import { updateAnimal } from '../utils/apiHelpers';

/**
 * Servicio para gestionar formularios
 */
class FormService {
  /**
   * Detecta cambios en un campo del formulario
   * @param field - Campo del formulario
   * @returns Objeto con el nombre del campo en la API y su valor si hay cambio, null si no hay cambio
   */
  detectarCambio(field: FormField): { nombre: string; valor: any } | null {
    // Normalizar valores para comparación
    const valorActual = normalizar(field.value);
    const valorOriginal = normalizar(field.originalValue);
    
    // Comparación estricta para detectar cambios reales
    if (valorActual !== valorOriginal) {
      console.log(`¡DETECTADO CAMBIO EN ${field.id.toUpperCase()}!`);
      
      // Determinar el valor a enviar
      let valorFinal;
      if (valorActual === '') {
        // Para campos nulables, enviar null cuando están vacíos
        const camposNulables = ['mare', 'pare', 'quadra', 'cod', 'num_serie', 'dob'];
        if (camposNulables.includes(field.apiField || field.name)) {
          valorFinal = null;
        } else {
          valorFinal = valorActual;
        }
      } else {
        valorFinal = valorActual;
      }
      
      return { nombre: field.apiField || field.name, valor: valorFinal };
    }
    return null;
  }

  /**
   * Recopila los cambios de un formulario
   * @param formState - Estado del formulario
   * @returns Objeto con los cambios detectados
   */
  recopilarCambios(formState: FormState): Record<string, any> {
    const cambios: Record<string, any> = {};
    
    Object.values(formState.fields).forEach(field => {
      const cambio = this.detectarCambio(field);
      if (cambio) {
        cambios[cambio.nombre] = cambio.valor;
      }
    });
    
    return cambios;
  }

  /**
   * Valida un campo del formulario
   * @param field - Campo a validar
   * @returns Mensaje de error o null si es válido
   */
  validarCampo(field: FormField): string | null {
    // Si el campo tiene un validador personalizado, usarlo
    if (field.validator) {
      return field.validator(field.value);
    }
    
    // Validación estándar para campos requeridos
    if (field.required && (field.value === null || field.value === undefined || field.value === '')) {
      return `El campo ${field.label} es obligatorio`;
    }
    
    return null;
  }

  /**
   * Valida todo el formulario
   * @param formState - Estado del formulario
   * @returns Objeto con errores por campo
   */
  validarFormulario(formState: FormState): Record<string, string | null> {
    const errores: Record<string, string | null> = {};
    
    Object.values(formState.fields).forEach(field => {
      const error = this.validarCampo(field);
      if (error) {
        errores[field.id] = error;
      }
    });
    
    return errores;
  }

  /**
   * Actualiza un animal con los cambios del formulario
   * @param animalId - ID del animal
   * @param cambios - Cambios a aplicar
   * @returns Promesa con el resultado de la actualización
   */
  async actualizarAnimal(animalId: number, cambios: AnimalUpdateDto): Promise<any> {
    try {
      // Verificar que hay cambios para enviar
      if (Object.keys(cambios).length === 0) {
        return { success: true, message: 'No hay cambios para guardar' };
      }
      
      // Enviar cambios a la API
      const resultado = await updateAnimal(animalId, cambios);
      return { success: true, data: resultado };
    } catch (error: any) {
      console.error('Error al actualizar animal:', error);
      return { 
        success: false, 
        message: error.message || 'Error al actualizar animal',
        error
      };
    }
  }

  /**
   * Actualiza los valores originales de los campos después de guardar
   * @param formState - Estado del formulario
   * @param cambios - Cambios aplicados
   * @returns Estado del formulario actualizado
   */
  actualizarValoresOriginales(formState: FormState, cambios: Record<string, any>): FormState {
    const nuevoEstado = { ...formState };
    
    // Actualizar los valores originales con los nuevos valores
    Object.entries(cambios).forEach(([nombreApi, valor]) => {
      // Buscar el campo que corresponde al nombre de la API
      const campo = Object.values(nuevoEstado.fields).find(
        field => (field.apiField || field.name) === nombreApi
      );
      
      if (campo) {
        nuevoEstado.fields[campo.id] = {
          ...nuevoEstado.fields[campo.id],
          originalValue: valor
        };
      }
    });
    
    // Restablecer el estado de "sucio" del formulario
    nuevoEstado.isDirty = false;
    
    return nuevoEstado;
  }
}

// Exportar una instancia única del servicio
const formService = new FormService();
export default formService;
