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

    return await apiService.post('listados/', adaptedData);
  } catch (error) {
    console.error('Error al crear listado:', error);
    throw error;
  }
}

/**
 * Obtener todos los animales para el selector de listados
 */
export async function getAnimals() {
  try {
    console.log('Obteniendo animales desde el backend...');
    
    // Ahora podemos obtener hasta 1000 animales en una sola petición
    // Esto debería cubrir todas nuestras necesidades actuales y futuras
    const allAnimals: any[] = [];
    let offset = 0;
    const limit = 1000; // Nuevo límite máximo permitido por el backend
    let hasMoreAnimals = true;
    
    // Hacer peticiones paginadas hasta obtener todos los animales
    while (hasMoreAnimals) {
      try {
        const url = `animals/?offset=${offset}&limit=${limit}`;
        console.log(`Obteniendo lote de animales: ${url}`);
        
        const response = await apiService.get(url);
        let animalsInPage: any[] = [];
        
        // Extraer los animales de la respuesta según su formato
        if (response && typeof response === 'object') {
          if (response.status === 'success' && response.data) {
            // Formato {status: 'success', data: [...]} 
            if (Array.isArray(response.data)) {
              animalsInPage = response.data;
            } else if (response.data.items && Array.isArray(response.data.items)) {
              animalsInPage = response.data.items;
            }
          } else if (Array.isArray(response)) {
            // La respuesta es directamente un array
            animalsInPage = response;
          }
        }
        
        console.log(`Obtenidos ${animalsInPage.length} animales en esta página`);
        
        // Añadir los animales de esta página al total
        allAnimals.push(...animalsInPage);
        
        // Comprobar si hay más animales para obtener
        if (animalsInPage.length < limit) {
          hasMoreAnimals = false;
          console.log('No hay más animales para obtener');
        } else {
          offset += limit;
          console.log(`Avanzando a offset=${offset}`);
        }
      } catch (pageError) {
        console.error('Error al obtener página de animales:', pageError);
        hasMoreAnimals = false; // Detener el bucle en caso de error
      }
    }
    
    console.log(`Total de animales obtenidos: ${allAnimals.length}`);
    return allAnimals;
  } catch (error) {
    console.error('Error al obtener animales:', error);
    return [];
  }
}

/**
 * Actualizar los estados y observaciones de los animales de un listado
 */
/**
 * Actualiza un listado existente
 * @param id ID del listado a actualizar
 * @param listado Datos a actualizar
 * @returns Promise con el listado actualizado
 */
export async function updateListado(id: number, listado: any): Promise<any> {
  try {
    console.log(`📝 Actualizando listado ${id}:`, listado);
    const data = await apiService.put(`listados/${id}`, listado);
    console.log('✅ Listado actualizado:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al actualizar listado:', error);
    throw error;
  }
}

export async function updateListadoAnimales(id: string | number, animales: any[]) {
  try {
    return await apiService.put(`listados/${id}/animales`, { animales });
  } catch (error) {
    console.error(`Error al actualizar los animales del listado ${id}:`, error);
    throw error;
  }
}

/**
 * Eliminar un listado por su ID
 */
export async function deleteListado(id: string | number) {
  try {
    return await apiService.del(`listados/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el listado ${id}:`, error);
    throw error;
  }
}
