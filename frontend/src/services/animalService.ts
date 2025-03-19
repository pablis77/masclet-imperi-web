import { get, post, put, del } from './apiService';
import { mockAnimals } from './mockData';

const API_PATH = '/api/v1';

// Interfaces
export interface Animal {
  id: number;
  explotacio_id: number;
  nom: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar: 'NO' | '1' | '2';  // NO, 1 ternero, 2 terneros (solo para vacas)
  pare_id?: number | null;
  pare_nom?: string | null;
  mare_id?: number | null;
  mare_nom?: string | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnimalCreateDto {
  explotacio_id: number;
  nom: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar: 'NO' | '1' | '2';
  pare_id?: number | null;
  mare_id?: number | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null;
}

export interface AnimalUpdateDto extends Partial<AnimalCreateDto> {}

export interface AnimalFilters {
  explotacio_id?: number;
  genere?: 'M' | 'F';
  estado?: 'OK' | 'DEF';
  alletar?: boolean | 'NO' | '1' | '2';
  quadra?: string;
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

// Función para filtrar animales (usado para mock)
const getFilteredAnimals = (filters: AnimalFilters): Animal[] => {
  let filteredAnimals = [...mockAnimals];
  
  // Aplicar filtros
  if (filters.explotacio_id !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.explotacio_id === filters.explotacio_id);
  }
  
  if (filters.genere !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.genere === filters.genere);
  }
  
  if (filters.estado !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.estado === filters.estado);
  }
  
  if (filters.alletar !== undefined) {
    // Convertir boolean a string para comparar
    const alletarValue = filters.alletar;
    filteredAnimals = filteredAnimals.filter(a => 
      a.alletar === alletarValue
    );
  }
  
  if (filters.quadra !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.quadra === filters.quadra);
  }
  
  if (filters.search !== undefined && filters.search !== '') {
    const searchLower = filters.search.toLowerCase();
    filteredAnimals = filteredAnimals.filter(a => 
      a.nom.toLowerCase().includes(searchLower) || 
      (a.cod && a.cod.toLowerCase().includes(searchLower)) ||
      (a.num_serie && a.num_serie.toLowerCase().includes(searchLower))
    );
  }
  
  return filteredAnimals;
};

// Servicio de animales
const animalService = {
  // Obtiene una lista paginada de animales con filtros opcionales
  async getAnimals(filters: AnimalFilters = {}): Promise<PaginatedResponse<Animal>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    // Preparar query params
    const queryParams = new URLSearchParams();
    if (filters.explotacio_id !== undefined) queryParams.append('explotacio_id', filters.explotacio_id.toString());
    if (filters.genere !== undefined) queryParams.append('genere', filters.genere);
    if (filters.estado !== undefined) queryParams.append('estado', filters.estado);
    if (filters.alletar !== undefined) {
      // Convertir boolean a valor esperado por la API
      if (typeof filters.alletar === 'boolean') {
        if (filters.alletar) {
          // Si es true, no filtramos por alletar específico, solo que no sea NO
          queryParams.append('alletar_not', 'NO');
        }
      } else {
        // Si es un valor específico, lo pasamos tal cual
        queryParams.append('alletar', filters.alletar);
      }
    }
    if (filters.quadra !== undefined) queryParams.append('quadra', filters.quadra);
    if (filters.search !== undefined) queryParams.append('search', filters.search);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `${API_PATH}/animals${queryString ? `?${queryString}` : ''}`;
    
    try {
      // Intentar obtener datos reales
      return await get<PaginatedResponse<Animal>>(endpoint);
    } catch (error) {
      console.warn('Error al obtener datos de animales del API, usando datos simulados:', error);
      
      // Fallback a datos simulados
      const filteredAnimals = getFilteredAnimals(filters);
      const start = (page - 1) * limit;
      const end = page * limit;
      const paginatedItems = filteredAnimals.slice(start, end);
      const totalPages = Math.ceil(filteredAnimals.length / limit);
      
      return {
        items: paginatedItems,
        total: filteredAnimals.length,
        page,
        limit,
        pages: totalPages
      };
    }
  },
  
  // Obtiene un animal por su ID
  async getAnimalById(id: number): Promise<Animal> {
    const endpoint = `${API_PATH}/animals/${id}`;
    
    try {
      // Intentar obtener datos reales
      return await get<Animal>(endpoint);
    } catch (error) {
      console.warn(`Error al obtener animal con ID ${id} del API, usando datos simulados:`, error);
      
      // Fallback a datos simulados
      const mockAnimal = mockAnimals.find(a => a.id === id);
      if (!mockAnimal) {
        throw new Error(`Animal con ID ${id} no encontrado`);
      }
      
      return mockAnimal;
    }
  },
  
  // Crea un nuevo animal
  async createAnimal(animalData: AnimalCreateDto): Promise<Animal> {
    const endpoint = `${API_PATH}/animals`;
    
    try {
      // Intentar crear en API real
      return await post<Animal>(endpoint, animalData);
    } catch (error) {
      console.warn('Error al crear animal en API, usando simulación:', error);
      
      // Crear respuesta simulada
      const newId = Math.max(...mockAnimals.map(a => a.id)) + 1;
      const now = new Date().toISOString();
      
      const mockResponse: Animal = {
        id: newId,
        ...animalData,
        created_at: now,
        updated_at: now
      };
      
      return mockResponse;
    }
  },
  
  // Actualiza un animal existente
  async updateAnimal(id: number, animalData: AnimalUpdateDto): Promise<Animal> {
    const endpoint = `${API_PATH}/animals/${id}`;
    
    try {
      // Intentar actualizar en API real
      return await put<Animal>(endpoint, animalData);
    } catch (error) {
      console.warn(`Error al actualizar animal con ID ${id} en API, usando simulación:`, error);
      
      // Buscar en datos simulados
      const mockAnimal = mockAnimals.find(a => a.id === id);
      if (!mockAnimal) {
        throw new Error(`Animal con ID ${id} no encontrado`);
      }
      
      // Crear respuesta simulada con datos actualizados
      const mockResponse: Animal = {
        ...mockAnimal,
        ...animalData,
        updated_at: new Date().toISOString()
      };
      
      return mockResponse;
    }
  },
  
  // Elimina un animal (marcado como DEF)
  async deleteAnimal(id: number): Promise<void> {
    const endpoint = `${API_PATH}/animals/${id}`;
    
    try {
      // Intentar eliminar en API real
      return await del(endpoint);
    } catch (error) {
      console.warn(`Mock: Eliminando animal con ID ${id}`);
      return Promise.resolve();
    }
  },
  
  // Da de baja a un animal (cambia estado a DEF)
  async deactivateAnimal(id: number): Promise<Animal> {
    return this.updateAnimal(id, { estado: 'DEF' });
  },
  
  // Obtiene los posibles padres (machos) para selección en formularios
  async getPotentialFathers(explotacioId: number): Promise<Animal[]> {
    // Filtrar machos activos de la misma explotación
    const response = await this.getAnimals({
      explotacio_id: explotacioId,
      genere: 'M',
      estado: 'OK',
      limit: 100 // Obtener más resultados para tener buena selección
    });
    
    return response.items;
  },
  
  // Obtiene las posibles madres (hembras) para selección en formularios
  async getPotentialMothers(explotacioId: number): Promise<Animal[]> {
    // Filtrar hembras activas de la misma explotación
    const response = await this.getAnimals({
      explotacio_id: explotacioId,
      genere: 'F',
      estado: 'OK',
      limit: 100 // Obtener más resultados para tener buena selección
    });
    
    return response.items;
  },
  
  // Utilidades para iconos y visualización
  getAnimalIcon(animal: Animal): string {
    if (!animal) return '🐄';
    
    // Determinar el icono según género, estado y si está amamantando
    if (animal.estado === 'DEF') return '⚰️';
    
    if (animal.genere === 'M') {
      return '🐂'; // Toro
    } else {
      // Vacas
      if (animal.alletar === '1') return '🍼'; // Amamantando 1
      if (animal.alletar === '2') return '🥛'; // Amamantando 2
      return '🐄'; // Vaca normal
    }
  },
  
  getAnimalStatusClass(estado: string): string {
    return estado === 'OK' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  },
  
  // Obtiene texto para alletar
  getAlletarText(alletar: string): string {
    switch(alletar) {
      case 'NO': return 'No amamantando';
      case '1': return 'Amamantando 1 cría';
      case '2': return 'Amamantando 2 crías';
      default: return 'No especificado';
    }
  }
};

export default animalService;
