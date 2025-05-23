/**
 * Servicio específico para la gestión de listados
 * 
 * Este servicio utiliza el apiService general pero encapsula
 * toda la lógica específica para gestionar listados sin modificar
 * el servicio principal.
 */

// Importamos el servicio API general pero NO lo modificamos
import apiService from './apiService';

/**
 * Obtener todos los listados
 */
export async function getListados() {
  try {
    // Asegurarse de usar la barra diagonal final
    return await apiService.get('listados/');
  } catch (error) {
    console.error('Error al obtener listados:', error);
    // Devolver array vacío en caso de error para evitar errores en la UI
    return [];
  }
}

/**
 * Obtener un listado específico por ID
 */
export async function getListado(id: string | number) {
  try {
    return await apiService.get(`listados/${id}`);
  } catch (error) {
    console.error(`Error al obtener listado ${id}:`, error);
    // Devolver objeto vacío en caso de error
    return {};
  }
}

/**
 * Crear un nuevo listado
 */
export async function createListado(data: any) {
  try {
    // Adaptar los nombres de campos al formato que espera el backend
    const adaptedData = {
      nombre: data.name || '',
      descripcion: data.description || '',
      categoria: data.category || '',
      is_completed: data.is_completed || false,
      animales: data.animals || []
    };
    
    console.log('Enviando datos al backend:', adaptedData);
    return await apiService.post('listados', adaptedData);
  } catch (error) {
    console.error('Error al crear listado:', error);
    throw error;
  }
}

/**
 * Actualizar un listado existente
 */
export async function updateListado(id: string | number, data: any) {
  try {
    return await apiService.put(`listados/${id}`, data);
  } catch (error) {
    console.error(`Error al actualizar listado ${id}:`, error);
    throw error;
  }
}

/**
 * Eliminar un listado
 */
export async function deleteListado(id: string | number) {
  try {
    return await apiService.del(`listados/${id}`);
  } catch (error) {
    console.error(`Error al eliminar listado ${id}:`, error);
    throw error;
  }
}

/**
 * Obtener todos los animales para el selector de listados
 */
export async function getAnimals() {
  try {
    console.log('Obteniendo animales desde el backend...');
    // Solicitar un número grande de animales para asegurarnos de obtener todos
    // Usar offset en lugar de skip (según vemos en los logs exitosos)
    const response = await apiService.get('animals/?offset=0&limit=1000');
    console.log('Respuesta del servidor:', response);
    
    // Procesar la respuesta según el formato que devuelve el backend
    let animals = [];
    
    // Verificar si la respuesta tiene el formato {status: 'success', data: {...}}
    if (response && response.status === 'success' && response.data) {
      console.log('Formato de respuesta detectado: {status, data}');
      
      // Verificar si data es un array o tiene una propiedad items
      if (Array.isArray(response.data)) {
        animals = response.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        animals = response.data.items;
      } else if (response.data.animals && Array.isArray(response.data.animals)) {
        animals = response.data.animals;
      } else {
        // Si data es un objeto con propiedades que podrían ser animales
        console.log('Intentando extraer animales de data:', response.data);
        try {
          // Convertir el objeto a array si parece contener animales
          const possibleAnimals = Object.values(response.data);
          if (possibleAnimals.length > 0 && possibleAnimals[0].id) {
            animals = possibleAnimals;
          }
        } catch (e) {
          console.error('Error al procesar data como animales:', e);
        }
      }
    } else if (Array.isArray(response)) {
      // Si la respuesta es directamente un array
      animals = response;
    } else if (response && response.items && Array.isArray(response.items)) {
      // Si la respuesta tiene una propiedad items que es un array
      animals = response.items;
    }
    
    console.log(`Se han obtenido ${animals.length} animales`);
    console.log('Muestra de los primeros 3 animales (si hay):', animals.slice(0, 3));
    return animals;
  } catch (error) {
    console.error('Error al obtener animales:', error);
    return [];
  }
}

// Exportamos todas las funciones para usarlas en las páginas
export default {
  getListados,
  getListado,
  createListado,
  updateListado,
  deleteListado,
  getAnimals
};
