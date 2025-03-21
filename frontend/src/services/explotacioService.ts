// Servicio para gestionar las explotaciones
import { get, post, put, del } from './apiService';
import { mockExplotacions, mockAnimals } from './mockData';

// Interfaces
export interface Explotacio {
  id: number;
  nom: string;  
  explotaci?: string;  
  direccion?: string;
  responsable?: string;
  telefono?: string;
  email?: string;
  animal_count?: number;
  region?: string;
  activa?: boolean;  
  created_at: string;
  updated_at: string;
}

export interface ExplotacioCreateDto {
  nom: string;  
  explotaci?: string;  
  direccion?: string;
  responsable?: string;
  telefono?: string;
  email?: string;
  activa?: boolean;  
}

export interface ExplotacioUpdateDto extends Partial<ExplotacioCreateDto> {}

export interface ExplotacioFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Obtiene una lista paginada de explotaciones con filtros opcionales
 * @param filters Filtros opcionales (búsqueda, paginación)
 * @returns Lista paginada de explotaciones o array de explotaciones
 */
export async function getExplotacions(filters: ExplotacioFilters = {}): Promise<PaginatedResponse<Explotacio> | Explotacio[]> {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    // Preparar query params
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters.search !== undefined) params.append('search', filters.search);
    
    console.log(`🔍 [Explotacio] Solicitando explotaciones con params: ${params.toString()}`);
    
    // Intentar obtener datos reales de la API
    try {
      // Probar con diferentes formatos de endpoint para mayor compatibilidad
      const endpoints = [
        '/explotacions',
        '/explotaciones',
        '/explotacions/',
        '/explotaciones/'
      ];
      
      let response = null;
      let successEndpoint = '';
      
      // Intentar cada endpoint hasta que uno funcione
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 [Explotacio] Intentando endpoint: ${endpoint}`);
          response = await get<any>(endpoint);
          successEndpoint = endpoint;
          console.log(`🔍 [Explotacio] Respuesta recibida de ${endpoint}:`, response);
          break; // Si llegamos aquí, la petición fue exitosa
        } catch (endpointError) {
          console.warn(`🔍 [Explotacio] Error con endpoint ${endpoint}:`, endpointError);
          // Continuar con el siguiente endpoint
        }
      }
      
      if (!response) {
        throw new Error('Todos los endpoints fallaron');
      }
      
      console.log(`🔍 [Explotacio] Endpoint exitoso: ${successEndpoint}`);
      
      // Si es un array, devolverlo directamente
      if (Array.isArray(response)) {
        console.log(`🔍 [Explotacio] Devolviendo array de ${response.length} explotaciones`);
        return response;
      }
      
      // Si no es un array, verificar si es un objeto con propiedad 'items' (formato paginado)
      if (response && typeof response === 'object' && 'items' in response) {
        console.log(`🔍 [Explotacio] Devolviendo respuesta paginada con ${response.items.length} explotaciones`);
        return response as PaginatedResponse<Explotacio>;
      }
      
      // Si no es ninguno de los anteriores, intentar como objeto simple
      if (response && typeof response === 'object') {
        console.log('🔍 [Explotacio] Respuesta es un objeto, intentando convertir a array');
        // Intentar convertir el objeto a un array si es posible
        if ('data' in response) {
          const data = response.data;
          if (Array.isArray(data)) {
            console.log(`🔍 [Explotacio] Devolviendo array de ${data.length} explotaciones desde response.data`);
            return data;
          }
        }
        
        // Si no hay una propiedad data que sea un array, devolver un array con el objeto
        console.log('🔍 [Explotacio] Devolviendo array con el objeto de respuesta');
        return [response as Explotacio];
      }
      
      // Si llegamos aquí, no pudimos interpretar la respuesta
      console.error('🔍 [Explotacio] No se pudo interpretar la respuesta:', response);
      return [];
    } catch (innerError) {
      console.error('🔍 [Explotacio] Error al obtener explotaciones:', innerError);
      throw innerError;
    }
  } catch (error: any) {
    console.error('🔍 [Explotacio] Error en petición GET /explotacions:', error);
    
    // Si es un error de red o cualquier otro error, usar datos simulados como fallback
    console.warn('🔍 [Explotacio] Usando datos simulados para explotaciones debido a error en el backend');
    
    // Filtrar según búsqueda si existe
    let filteredExplotacions = [...mockExplotacions];
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      filteredExplotacions = filteredExplotacions.filter(e => 
        e.nom.toLowerCase().includes(searchLower) || 
        (e.explotaci && e.explotaci.toLowerCase().includes(searchLower)) ||
        (e.responsable && e.responsable.toLowerCase().includes(searchLower))
      );
    }
    
    // Aplicar paginación
    const startIndex = ((filters.page || 1) - 1) * (filters.limit || 10);
    const endIndex = startIndex + (filters.limit || 10);
    const paginatedExplotacions = filteredExplotacions.slice(startIndex, endIndex);
    
    // Devolver como respuesta paginada
    return {
      items: paginatedExplotacions,
      total: filteredExplotacions.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
      pages: Math.ceil(filteredExplotacions.length / (filters.limit || 10))
    };
  }
}

/**
 * Obtiene todas las explotaciones para selectores (sin paginación)
 * @returns Lista de todas las explotaciones
 */
export async function getAllExplotacions(): Promise<Explotacio[]> {
  try {
    console.log('Obteniendo todas las explotaciones para selector');
    try {
      // Primero intentamos obtener como respuesta paginada
      const response = await get<PaginatedResponse<Explotacio>>('/explotacions?limit=1000');
      console.log('Respuesta de todas las explotaciones recibida (paginada):', response);
      return response.items;
    } catch (innerError) {
      // Si falla, intentamos obtener como array
      console.log('Intentando obtener todas las explotaciones como array...');
      const items = await get<Explotacio[]>('/explotacions?limit=1000');
      console.log('Respuesta de todas las explotaciones recibida (array):', items);
      
      if (Array.isArray(items)) {
        return items;
      }
      
      // Si no es un array, propagar el error original
      throw innerError;
    }
  } catch (error: any) {
    console.error('Error en petición GET /explotacions (all):', error);
    
    // Si es un error de red o cualquier otro error, usar datos simulados como fallback
    if (error.code === 'NETWORK_ERROR' || error.code === 'DB_COLUMN_ERROR' || 
        (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
      console.warn('Usando datos simulados para todas las explotaciones debido a error en el backend');
      return [...mockExplotacions];
    }
    
    // Si no es un error manejable, propagar el error
    throw error;
  }
}

// Servicio de explotaciones
const explotacioService = {
  // Obtiene una lista paginada de explotaciones con filtros opcionales
  getExplotacions,
  
  // Obtiene todas las explotaciones para selectores
  getAllExplotacions,
  
  // Obtiene una explotación por su ID
  async getExplotacioById(id: number): Promise<Explotacio> {
    try {
      console.log(`Intentando cargar explotación con ID: ${id}`);
      const response = await get<Explotacio>(`/explotacions/${id}`);
      console.log('Explotación cargada:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al obtener explotación con ID ${id}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'NETWORK_ERROR' || error.code === 'DB_COLUMN_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para explotación debido a error en el backend');
        
        // Buscar en datos simulados
        const mockExplotacio = mockExplotacions.find(e => e.id === id);
        if (!mockExplotacio) {
          throw new Error(`Explotación con ID ${id} no encontrada en los datos simulados`);
        }
        
        return mockExplotacio;
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Crea una nueva explotación
  async createExplotacio(explotacioData: ExplotacioCreateDto): Promise<Explotacio> {
    try {
      console.log('Creando nueva explotación:', explotacioData);
      const response = await post<Explotacio>('/explotacions', explotacioData);
      console.log('Explotación creada:', response);
      return response;
    } catch (error: any) {
      console.error('Error al crear explotación:', error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'NETWORK_ERROR' || error.code === 'DB_COLUMN_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para crear explotación debido a error en el backend');
        
        // Crear respuesta simulada
        const newId = Math.max(...mockExplotacions.map(e => e.id)) + 1;
        const now = new Date().toISOString();
        
        const newExplotacio: Explotacio = {
          id: newId,
          nom: explotacioData.nom,
          explotaci: explotacioData.explotaci,
          direccion: explotacioData.direccion,
          responsable: explotacioData.responsable,
          telefono: explotacioData.telefono,
          email: explotacioData.email,
          activa: explotacioData.activa !== undefined ? explotacioData.activa : true,
          animal_count: 0,
          created_at: now,
          updated_at: now
        };
        
        // Añadir a datos simulados
        mockExplotacions.push(newExplotacio);
        
        return newExplotacio;
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Actualiza una explotación existente
  async updateExplotacio(id: number, explotacioData: ExplotacioUpdateDto): Promise<Explotacio> {
    try {
      console.log(`Actualizando explotación con ID ${id}:`, explotacioData);
      const response = await put<Explotacio>(`/explotacions/${id}`, explotacioData);
      console.log('Explotación actualizada:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al actualizar explotación con ID ${id}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'NETWORK_ERROR' || error.code === 'DB_COLUMN_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para actualizar explotación debido a error en el backend');
        
        // Buscar en datos simulados
        const explotacioIndex = mockExplotacions.findIndex(e => e.id === id);
        if (explotacioIndex === -1) {
          throw new Error(`Explotación con ID ${id} no encontrada en los datos simulados`);
        }
        
        // Actualizar datos
        const now = new Date().toISOString();
        mockExplotacions[explotacioIndex] = {
          ...mockExplotacions[explotacioIndex],
          ...explotacioData,
          updated_at: now
        };
        
        return mockExplotacions[explotacioIndex];
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Elimina una explotación
  async deleteExplotacio(id: number): Promise<void> {
    try {
      console.log(`Eliminando explotación con ID ${id}`);
      await del(`/explotacions/${id}`);
      console.log(`Explotación con ID ${id} eliminada correctamente`);
    } catch (error: any) {
      console.error(`Error al eliminar explotación con ID ${id}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'NETWORK_ERROR' || error.code === 'DB_COLUMN_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para eliminar explotación debido a error en el backend');
        
        // Buscar en datos simulados
        const explotacioIndex = mockExplotacions.findIndex(e => e.id === id);
        if (explotacioIndex === -1) {
          throw new Error(`Explotación con ID ${id} no encontrada en los datos simulados`);
        }
        
        // Eliminar de datos simulados
        mockExplotacions.splice(explotacioIndex, 1);
        return;
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Obtiene lista simple de explotaciones para select/dropdown
  async getExplotacionsDropdown(): Promise<Pick<Explotacio, 'id' | 'nom'>[]> {
    try {
      console.log('Obteniendo explotaciones para dropdown');
      const response = await get<PaginatedResponse<Explotacio>>('/explotacions?limit=1000');
      console.log('Explotaciones para dropdown cargadas:', response);
      
      // Mapear solo los campos necesarios
      return response.items.map(explotacio => ({
        id: explotacio.id,
        nom: explotacio.nom
      }));
    } catch (error: any) {
      console.error('Error al obtener explotaciones para dropdown:', error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'NETWORK_ERROR' || error.code === 'DB_COLUMN_ERROR') {
        console.warn('Usando datos simulados para dropdown de explotaciones debido a error en el backend');
        
        return mockExplotacions.map(explotacio => ({
          id: explotacio.id,
          nom: explotacio.nom
        }));
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  }
};

export default explotacioService;
