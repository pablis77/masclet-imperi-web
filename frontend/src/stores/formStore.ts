import { map } from 'nanostores';
import type { FormState, FormField } from '../types/types';
import formService from '../services/formService';

// Store para gestionar el estado de los formularios
export const formStore = map<Record<string, FormState>>({});

/**
 * Inicializa un formulario en el store
 * @param formId - Identificador único del formulario
 * @param fields - Campos iniciales del formulario
 */
export function initForm(formId: string, fields: Record<string, FormField>): void {
  formStore.setKey(formId, {
    fields,
    errors: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false
  });
}

/**
 * Actualiza el valor de un campo en un formulario
 * @param formId - Identificador del formulario
 * @param fieldId - Identificador del campo
 * @param value - Nuevo valor
 */
export function updateField(formId: string, fieldId: string, value: any): void {
  const form = formStore.get()[formId];
  if (!form) return;
  
  // Actualizar el campo
  const updatedFields = {
    ...form.fields,
    [fieldId]: {
      ...form.fields[fieldId],
      value
    }
  };
  
  // Comprobar si el formulario está "sucio" (tiene cambios)
  const isDirty = Object.values(updatedFields).some((field: FormField) => {
    const cambio = formService.detectarCambio(field);
    return cambio !== null;
  });
  
  // Validar el campo actualizado
  const fieldError = formService.validarCampo(updatedFields[fieldId]);
  const errors = {
    ...form.errors,
    [fieldId]: fieldError
  };
  
  // Eliminar errores nulos
  if (errors[fieldId] === null) {
    delete errors[fieldId];
  }
  
  // Actualizar el estado del formulario
  formStore.setKey(formId, {
    ...form,
    fields: updatedFields,
    errors,
    isValid: Object.keys(errors).length === 0,
    isDirty
  });
}

/**
 * Valida todos los campos de un formulario
 * @param formId - Identificador del formulario
 * @returns Si el formulario es válido
 */
export function validateForm(formId: string): boolean {
  const form = formStore.get()[formId];
  if (!form) return false;
  
  const errors = formService.validarFormulario(form);
  const isValid = Object.keys(errors).length === 0;
  
  formStore.setKey(formId, {
    ...form,
    errors,
    isValid
  });
  
  return isValid;
}

/**
 * Establece el estado de envío de un formulario
 * @param formId - Identificador del formulario
 * @param isSubmitting - Si el formulario está siendo enviado
 */
export function setSubmitting(formId: string, isSubmitting: boolean): void {
  const form = formStore.get()[formId];
  if (!form) return;
  
  formStore.setKey(formId, {
    ...form,
    isSubmitting
  });
}

/**
 * Recopila los cambios de un formulario para enviar al servidor
 * @param formId - Identificador del formulario
 * @returns Objeto con los cambios detectados
 */
export function getFormChanges(formId: string): Record<string, any> {
  const form = formStore.get()[formId];
  if (!form) return {};
  
  return formService.recopilarCambios(form);
}

/**
 * Actualiza los valores originales después de guardar
 * @param formId - Identificador del formulario
 * @param cambios - Cambios aplicados
 */
export function updateOriginalValues(formId: string, cambios: Record<string, any>): void {
  const form = formStore.get()[formId];
  if (!form) return;
  
  const updatedForm = formService.actualizarValoresOriginales(form, cambios);
  formStore.setKey(formId, updatedForm);
}

/**
 * Elimina un formulario del store
 * @param formId - Identificador del formulario
 */
export function removeForm(formId: string): void {
  const state = formStore.get();
  const { [formId]: _, ...rest } = state;
  formStore.set(rest);
}
