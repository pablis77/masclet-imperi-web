// Servicio para gestionar las explotaciones
import { get, post, put, del } from './apiService';
import { mockExplotacions, mockAnimals } from './mockData';

const API_PATH = '/api/v1';

// Interfaces
export interface Explotacio {
  id: number;
  nombre: string;
  direccion?: string;
  codigo?: string;
  responsable?: string;
  telefono?: string;
  email?: string;
  animal_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ExplotacioCreateDto {
  nombre: string;
  direccion?: string;
  codigo?: string;
  responsable?: string;
  telefono?: string;
  email?: string;
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

// Servicio de explotaciones
const explotacioService = {
  // Obtiene una lista paginada de explotaciones con filtros opcionales
  async getExplotacions(filters: ExplotacioFilters = {}): Promise<PaginatedResponse<Explotacio>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    // Preparar query params
    const queryParams = new URLSearchParams();
    if (filters.search !== undefined) queryParams.append('search', filters.search);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `${API_PATH}/explotacions${queryString ? `?${queryString}` : ''}`;
    
    // Filtrar según búsqueda si existe
    let filteredExplotacions = [...mockExplotacions];
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      filteredExplotacions = filteredExplotacions.filter(e => 
        e.nombre.toLowerCase().includes(searchLower) || 
        (e.codigo && e.codigo.toLowerCase().includes(searchLower)) ||
        (e.responsable && e.responsable.toLowerCase().includes(searchLower))
      );
    }
    
    // Paginación
    const start = (page - 1) * limit;
    const end = page * limit;
    const paginatedItems = filteredExplotacions.slice(start, end);
    const totalPages = Math.ceil(filteredExplotacions.length / limit);
    
    // Calcular conteo de animales para cada explotación
    paginatedItems.forEach(explotacio => {
      explotacio.animal_count = mockAnimals.filter(a => a.explotacio_id === explotacio.id).length;
    });
    
    const mockResponse: PaginatedResponse<Explotacio> = {
      items: paginatedItems,
      total: filteredExplotacions.length,
      page,
      limit,
      pages: totalPages
    };
    
    return get<PaginatedResponse<Explotacio>>(endpoint, mockResponse);
  },
  
  // Obtiene una explotación por su ID
  async getExplotacioById(id: number): Promise<Explotacio> {
    const endpoint = `${API_PATH}/explotacions/${id}`;
    
    // Buscar en datos simulados
    const mockExplotacio = mockExplotacions.find(e => e.id === id);
    if (!mockExplotacio) {
      throw new Error(`Explotación con ID ${id} no encontrada`);
    }
    
    // Calcular conteo de animales
    const animalCount = mockAnimals.filter(a => a.explotacio_id === id).length;
    const mockResponse = {
      ...mockExplotacio,
      animal_count: animalCount
    };
    
    return get<Explotacio>(endpoint, mockResponse);
  },
  
  // Crea una nueva explotación
  async createExplotacio(explotacioData: ExplotacioCreateDto): Promise<Explotacio> {
    const endpoint = `${API_PATH}/explotacions`;
    
    // Crear respuesta simulada
    const newId = Math.max(...mockExplotacions.map(e => e.id)) + 1;
    const now = new Date().toISOString();
    
    const mockResponse: Explotacio = {
      id: newId,
      ...explotacioData,
      animal_count: 0,
      created_at: now,
      updated_at: now
    };
    
    return post<Explotacio>(endpoint, explotacioData, mockResponse);
  },
  
  // Actualiza una explotación existente
  async updateExplotacio(id: number, explotacioData: ExplotacioUpdateDto): Promise<Explotacio> {
    const endpoint = `${API_PATH}/explotacions/${id}`;
    
    // Buscar en datos simulados
    const mockExplotacio = mockExplotacions.find(e => e.id === id);
    if (!mockExplotacio) {
      throw new Error(`Explotación con ID ${id} no encontrada`);
    }
    
    // Calcular conteo de animales
    const animalCount = mockAnimals.filter(a => a.explotacio_id === id).length;
    
    // Crear respuesta simulada con datos actualizados
    const mockResponse: Explotacio = {
      ...mockExplotacio,
      ...explotacioData,
      animal_count: animalCount,
      updated_at: new Date().toISOString()
    };
    
    return put<Explotacio>(endpoint, explotacioData, mockResponse);
  },
  
  // Elimina una explotación
  async deleteExplotacio(id: number): Promise<void> {
    const endpoint = `${API_PATH}/explotacions/${id}`;
    
    // Verificar que no haya animales asociados
    const hasAnimals = mockAnimals.some(a => a.explotacio_id === id);
    if (hasAnimals) {
      throw new Error('No se puede eliminar una explotación con animales asociados');
    }
    
    return del<void>(endpoint, undefined);
  },
  
  // Obtiene lista simple de explotaciones para select/dropdown
  async getExplotacionsDropdown(): Promise<Pick<Explotacio, 'id' | 'nombre'>[]> {
    const endpoint = `${API_PATH}/explotacions/dropdown`;
    
    // Crear respuesta simplificada para dropdown
    const mockResponse = mockExplotacions.map(e => ({
      id: e.id,
      nombre: e.nombre
    }));
    
    return get<Pick<Explotacio, 'id' | 'nombre'>[]>(endpoint, mockResponse);
  }
};

export default explotacioService;
