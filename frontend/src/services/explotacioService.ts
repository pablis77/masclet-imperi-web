// Servicio para gestionar las explotaciones
// Las explotaciones son simplemente un campo de los animales, no entidades independientes
import { mockExplotacions } from './mockData';
import { get } from './apiService';

// Interfaces
export interface Explotacio {
  id: number;
  explotacio: string;  // Identificador único de la explotación
  animal_count?: number; // Contador de animales en esta explotación
  created_at: string;
  updated_at: string;
}

// Interfaces para mantener compatibilidad con el código existente
export interface ExplotacioCreateDto {
  explotacio: string;  // Identificador único de la explotación
}

export interface ExplotacioUpdateDto extends Partial<ExplotacioCreateDto> {}

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
 * @returns Lista paginada de explotaciones
 */
export async function getExplotacions(filters: { search?: string; page?: number; limit?: number; } = {}): Promise<PaginatedResponse<Explotacio>> {
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/animals?${queryString}`;
    
    console.log(`Obteniendo explotaciones desde API: ${endpoint}`);
    
    // Obtener datos de la API
    const response = await get<any>(endpoint);
    
    // Extraer explotaciones únicas de los animales
    const uniqueExplotacions = new Map<string, Explotacio>();
    
    if (response && response.data && Array.isArray(response.data.items)) {
      response.data.items.forEach((animal: any) => {
        if (animal.explotacio && !uniqueExplotacions.has(animal.explotacio)) {
          uniqueExplotacions.set(animal.explotacio, {
            id: uniqueExplotacions.size + 1, // ID secuencial
            explotacio: animal.explotacio,
            animal_count: 1,
            created_at: animal.created_at || new Date().toISOString(),
            updated_at: animal.updated_at || new Date().toISOString()
          });
        } else if (animal.explotacio) {
          // Incrementar contador de animales
          const explotacio = uniqueExplotacions.get(animal.explotacio);
          if (explotacio) {
            explotacio.animal_count = (explotacio.animal_count || 0) + 1;
          }
        }
      });
    }
    
    // Convertir a array
    const explotacions = Array.from(uniqueExplotacions.values());
    
    // Aplicar paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExplotacions = explotacions.slice(startIndex, endIndex);
    
    return {
      items: paginatedExplotacions,
      total: explotacions.length,
      page: page,
      limit: limit,
      pages: Math.ceil(explotacions.length / limit)
    };
  } catch (error) {
    console.error('Error al obtener explotaciones desde API:', error);
    console.warn('Usando datos simulados como fallback');
    
    // Usar datos simulados como fallback
    let filteredExplotacions = [...mockExplotacions];
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      filteredExplotacions = filteredExplotacions.filter(e => 
        e.explotacio.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExplotacions = filteredExplotacions.slice(startIndex, endIndex);
    
    return {
      items: paginatedExplotacions,
      total: filteredExplotacions.length,
      page: page,
      limit: limit,
      pages: Math.ceil(filteredExplotacions.length / limit)
    };
  }
}

/**
 * Obtiene todas las explotaciones para selectores (sin paginación)
 * @returns Lista de todas las explotaciones
 */
export async function getAllExplotacions(): Promise<Explotacio[]> {
  try {
    console.log('Obteniendo todas las explotaciones desde API');
    
    // Obtener datos de la API con un límite alto para obtener todos los animales
    const response = await get<any>('/animals?limit=1000');
    
    // Extraer explotaciones únicas de los animales
    const uniqueExplotacions = new Map<string, Explotacio>();
    
    if (response && response.data && Array.isArray(response.data.items)) {
      response.data.items.forEach((animal: any) => {
        if (animal.explotacio && !uniqueExplotacions.has(animal.explotacio)) {
          uniqueExplotacions.set(animal.explotacio, {
            id: uniqueExplotacions.size + 1, // ID secuencial
            explotacio: animal.explotacio,
            animal_count: 1,
            created_at: animal.created_at || new Date().toISOString(),
            updated_at: animal.updated_at || new Date().toISOString()
          });
        } else if (animal.explotacio) {
          // Incrementar contador de animales
          const explotacio = uniqueExplotacions.get(animal.explotacio);
          if (explotacio) {
            explotacio.animal_count = (explotacio.animal_count || 0) + 1;
          }
        }
      });
    }
    
    // Convertir a array
    return Array.from(uniqueExplotacions.values());
  } catch (error) {
    console.error('Error al obtener todas las explotaciones desde API:', error);
    console.warn('Usando datos simulados como fallback');
    
    // Usar datos simulados como fallback
    return [...mockExplotacions];
  }
}

// Servicio de explotaciones
const explotacioService = {
  // Obtiene una lista paginada de explotaciones con filtros opcionales
  getExplotacions,
  
  // Obtiene todas las explotaciones para selectores
  getAllExplotacions,
  
  // Obtiene una explotación por su código (campo explotacio)
  async getExplotacioByCode(explotacion: string): Promise<Explotacio | null> {
    try {
      console.log(`Buscando explotación con código ${explotacion}`);
      
      // Intentar obtener la explotación de los datos de la API
      const allExplotacions = await getAllExplotacions();
      const explotacio = allExplotacions.find(e => e.explotacio === explotacion);
      
      if (!explotacio) {
        console.warn(`No se encontró la explotación con código ${explotacion}`);
        return null;
      }
      
      return explotacio;
    } catch (error) {
      console.error(`Error al buscar explotación con código ${explotacion}:`, error);
      console.warn('Usando datos simulados como fallback');
      
      // Usar datos simulados como fallback
      const mockExplotacio = mockExplotacions.find(e => e.explotacio === explotacion);
      if (!mockExplotacio) {
        console.warn(`No se encontró la explotación con código ${explotacion} en datos simulados`);
        return null;
      }
      
      return mockExplotacio;
    }
  },
  
  // Obtiene lista simple de explotaciones para select/dropdown
  async getExplotacionsDropdown(): Promise<Pick<Explotacio, 'id' | 'explotacio'>[]> {
    try {
      console.log('Obteniendo lista de explotaciones para dropdown');
      
      // Obtener todas las explotaciones
      const allExplotacions = await getAllExplotacions();
      
      // Mapear solo los campos necesarios
      return allExplotacions.map(e => ({
        id: e.id,
        explotacio: e.explotacio
      }));
    } catch (error) {
      console.error('Error al obtener explotaciones para dropdown:', error);
      console.warn('Usando datos simulados como fallback');
      
      // Usar datos simulados como fallback
      return mockExplotacions.map(e => ({ id: e.id, explotacio: e.explotacio }));
    }
  }
};

export default explotacioService;
