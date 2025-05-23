import api from './api';

// Interfaces
export interface Listado {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  animales_count: number;
}

export interface ListadoDetalle extends Listado {
  animales: Array<any>; // Podríamos usar la interfaz Animal si la importamos
}

export interface ListadoCreateDto {
  nombre: string;
  descripcion?: string;
  categoria?: string;
  is_completed?: boolean;
  animales?: number[];
}

export interface ListadoUpdateDto extends Partial<ListadoCreateDto> {}

export interface ExportConfig {
  formato?: 'pdf' | 'excel';
  orientacion?: 'portrait' | 'landscape';
  incluir_observaciones?: boolean;
}

const listadosService = {
  /**
   * Obtiene todos los listados disponibles
   * @param params Parámetros de filtrado opcional
   * @returns Promise con la lista de listados
   */
  getListados: async (params: Record<string, any> = {}): Promise<Listado[]> => {
    try {
      console.log('🔍 Obteniendo listados con parámetros:', params);
      const data = await api.fetchData('listados', params);
      console.log('📋 Listados obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener listados:', error);
      throw error;
    }
  },

  /**
   * Obtiene un listado específico por su ID
   * @param id ID del listado
   * @returns Promise con el detalle del listado
   */
  getListadoById: async (id: number): Promise<ListadoDetalle> => {
    try {
      console.log(`🔍 Obteniendo listado con ID: ${id}`);
      const data = await api.fetchData(`listados/${id}`);
      console.log('📋 Detalle del listado:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener listado ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo listado personalizado
   * @param listado Datos del nuevo listado
   * @returns Promise con el listado creado
   */
  createListado: async (listado: ListadoCreateDto): Promise<Listado> => {
    try {
      console.log('📝 Creando nuevo listado:', listado);
      const data = await api.postData('listados', listado);
      console.log('✅ Listado creado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al crear listado:', error);
      throw error;
    }
  },

  /**
   * Actualiza un listado existente
   * @param id ID del listado a actualizar
   * @param listado Datos a actualizar
   * @returns Promise con el listado actualizado
   */
  updateListado: async (id: number, listado: ListadoUpdateDto): Promise<Listado> => {
    try {
      console.log(`📝 Actualizando listado ${id}:`, listado);
      const data = await api.putData(`listados/${id}`, listado);
      console.log('✅ Listado actualizado:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al actualizar listado ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un listado
   * @param id ID del listado a eliminar
   * @returns Promise con la respuesta de confirmación
   */
  deleteListado: async (id: number): Promise<{ mensaje: string }> => {
    try {
      console.log(`🗑️ Eliminando listado ${id}`);
      const data = await api.deleteData(`listados/${id}`);
      console.log('✅ Listado eliminado:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al eliminar listado ${id}:`, error);
      throw error;
    }
  },

  /**
   * Añade animales a un listado existente
   * @param listadoId ID del listado
   * @param animalIds Array de IDs de animales a añadir
   * @returns Promise con el listado actualizado
   */
  addAnimales: async (listadoId: number, animalIds: number[]): Promise<ListadoDetalle> => {
    try {
      console.log(`➕ Añadiendo animales al listado ${listadoId}:`, animalIds);
      const data = await api.postData(`listados/${listadoId}/animals`, animalIds);
      console.log('✅ Animales añadidos:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al añadir animales al listado ${listadoId}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un animal de un listado
   * @param listadoId ID del listado
   * @param animalId ID del animal a eliminar
   * @returns Promise con el listado actualizado
   */
  removeAnimal: async (listadoId: number, animalId: number): Promise<ListadoDetalle> => {
    try {
      console.log(`➖ Eliminando animal ${animalId} del listado ${listadoId}`);
      const data = await api.deleteData(`listados/${listadoId}/animals/${animalId}`);
      console.log('✅ Animal eliminado del listado:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al eliminar animal ${animalId} del listado ${listadoId}:`, error);
      throw error;
    }
  },

  /**
   * Exporta un listado a PDF
   * @param listadoId ID del listado a exportar
   * @param config Configuración de exportación
   * @returns Promise con la respuesta de la API
   */
  exportListado: async (listadoId: number, config: ExportConfig = {}): Promise<any> => {
    try {
      console.log(`📄 Exportando listado ${listadoId} con configuración:`, config);
      // Usamos fetchData con parámetros de consulta para la configuración
      const data = await api.fetchData(`listados/${listadoId}/export-pdf`, config);
      console.log('✅ Listado exportado:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al exportar listado ${listadoId}:`, error);
      throw error;
    }
  }
};

export default listadosService;
