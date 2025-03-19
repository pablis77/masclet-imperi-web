import { get, post, put, del } from './apiService';
import { mockAnimals } from './mockData';

// Interfaces
export interface Animal {
  id: number;
  explotacio_id: number;
  nom: string;
  genere: 'M' | 'F';
  estat: 'ACT' | 'DEF';  // Cambiado de 'estado' a 'estat' y de 'OK' a 'ACT'
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
  estat: 'ACT' | 'DEF';  // Cambiado de 'estado' a 'estat' y de 'OK' a 'ACT'
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
  estat?: 'ACT' | 'DEF';  // Cambiado de 'estado' a 'estat' y de 'OK' a 'ACT'
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
  
  if (filters.estat !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.estat === filters.estat);
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
    try {
      // Construir parámetros de consulta
      const params: Record<string, any> = {
        page: filters.page || 1,
        limit: filters.limit || 10
      };
      
      // Añadir filtros opcionales si están presentes
      if (filters.explotacio_id) params.explotacio_id = filters.explotacio_id;
      if (filters.genere) params.genere = filters.genere;
      if (filters.estat) params.estat = filters.estat;
      if (filters.alletar && filters.alletar !== 'NO') params.alletar = filters.alletar;
      if (filters.quadra) params.quadra = filters.quadra;
      if (filters.search) params.search = filters.search;
      
      console.log('Obteniendo animales con parámetros:', params);
      
      // Realizar petición a la API
      const response = await get<PaginatedResponse<Animal>>('/animals', { params });
      console.log('Respuesta de animales recibida:', response);
      return response;
    } catch (error: any) {
      console.error('Error en petición GET /animals:', error);
      
      // Verificar si es el error específico de estado_t
      if (error.code === 'DB_COLUMN_ERROR' || (error.message && error.message.includes('estado_t'))) {
        console.warn('Usando datos simulados debido al error de estado_t en el backend');
        
        // Filtrar datos simulados según los filtros proporcionados
        const filteredAnimals = getFilteredAnimals(filters);
        
        // Calcular paginación
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);
        
        // Devolver respuesta paginada simulada
        return {
          items: paginatedAnimals,
          total: filteredAnimals.length,
          page,
          limit,
          pages: Math.ceil(filteredAnimals.length / limit)
        };
      }
      
      // Si es un error de red, también usar datos simulados
      if (error.code === 'NETWORK_ERROR') {
        console.warn('Usando datos simulados debido a error de conexión');
        
        // Filtrar datos simulados según los filtros proporcionados
        const filteredAnimals = getFilteredAnimals(filters);
        
        // Calcular paginación
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);
        
        // Devolver respuesta paginada simulada
        return {
          items: paginatedAnimals,
          total: filteredAnimals.length,
          page,
          limit,
          pages: Math.ceil(filteredAnimals.length / limit)
        };
      }
      
      // Si no es un error de estado_t o de red, propagar el error
      throw error;
    }
  },
  
  // Obtiene un animal por su ID
  async getAnimalById(id: number): Promise<Animal> {
    try {
      console.log(`Intentando cargar animal con ID: ${id}`);
      const response = await get<Animal>(`/animals/${id}`);
      console.log('Animal cargado:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al obtener animal con ID ${id}:`, error);
      
      // Verificar si es el error específico de estado_t o un error de red
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados debido a error en el backend');
        
        // Buscar en datos simulados
        const animal = mockAnimals.find(a => a.id === id);
        if (animal) {
          return animal;
        }
        
        throw new Error(`No se encontró el animal con ID ${id} en los datos simulados`);
      }
      
      // Si no es un error de estado_t o no se encuentra el animal, propagar el error
      throw error;
    }
  },
  
  // Crea un nuevo animal
  async createAnimal(animalData: AnimalCreateDto): Promise<Animal> {
    try {
      const endpoint = '/animals';
      return await post<Animal>(endpoint, animalData);
    } catch (error) {
      console.error('Error al crear animal:', error);
      
      // Simular creación para desarrollo
      const newAnimal: Animal = {
        id: Math.max(...mockAnimals.map(a => a.id)) + 1,
        ...animalData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockAnimals.push(newAnimal);
      return newAnimal;
    }
  },
  
  // Actualiza un animal existente
  async updateAnimal(id: number, animalData: AnimalUpdateDto): Promise<Animal> {
    try {
      const endpoint = `/animals/${id}`;
      return await put<Animal>(endpoint, animalData);
    } catch (error) {
      console.error(`Error al actualizar animal con ID ${id}:`, error);
      
      // Simular actualización para desarrollo
      const animalIndex = mockAnimals.findIndex(a => a.id === id);
      if (animalIndex === -1) {
        throw new Error(`No se encontró el animal con ID ${id}`);
      }
      
      mockAnimals[animalIndex] = {
        ...mockAnimals[animalIndex],
        ...animalData,
        updated_at: new Date().toISOString()
      };
      
      return mockAnimals[animalIndex];
    }
  },
  
  // Elimina un animal (marcado como DEF)
  async deleteAnimal(id: number): Promise<void> {
    try {
      const endpoint = `/animals/${id}`;
      await del(endpoint);
    } catch (error) {
      console.error(`Error al eliminar animal con ID ${id}:`, error);
      
      // Simular eliminación para desarrollo
      const animalIndex = mockAnimals.findIndex(a => a.id === id);
      if (animalIndex !== -1) {
        mockAnimals.splice(animalIndex, 1);
      }
    }
  },
  
  // Da de baja a un animal (cambia estado a DEF)
  async deactivateAnimal(id: number): Promise<Animal> {
    return this.updateAnimal(id, { estat: 'DEF' });
  },
  
  // Obtiene los posibles padres (machos) para selección en formularios
  async getPotentialFathers(explotacioId: number): Promise<Animal[]> {
    try {
      const endpoint = `/animals/potential-fathers?explotacio_id=${explotacioId}`;
      return await get<Animal[]>(endpoint);
    } catch (error) {
      console.error('Error al obtener potenciales padres:', error);
      
      // Devolver datos simulados para desarrollo
      return mockAnimals.filter(a => a.genere === 'M' && a.estat === 'ACT' && a.explotacio_id === explotacioId);
    }
  },
  
  // Obtiene las posibles madres (hembras) para selección en formularios
  async getPotentialMothers(explotacioId: number): Promise<Animal[]> {
    try {
      const endpoint = `/animals/potential-mothers?explotacio_id=${explotacioId}`;
      return await get<Animal[]>(endpoint);
    } catch (error) {
      console.error('Error al obtener potenciales madres:', error);
      
      // Devolver datos simulados para desarrollo
      return mockAnimals.filter(a => a.genere === 'F' && a.estat === 'ACT' && a.explotacio_id === explotacioId);
    }
  },
  
  // Utilidades para iconos y visualización
  getAnimalIcon(animal: Animal): string {
    if (!animal) return '🐂';
    
    if (animal.estat === 'DEF') return '⚰️';
    
    if (animal.genere === 'M') return '🐂';
    
    // Para hembras, depende de si está amamantando
    if (animal.alletar === 'NO') return '🐄';
    if (animal.alletar === '1') return '🐄👶';
    if (animal.alletar === '2') return '🐄👶👶';
    
    return '🐄';
  },
  
  getAnimalStatusClass(estat: string): string {
    switch (estat) {
      case 'ACT': return 'bg-green-100 text-green-800';
      case 'DEF': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },
  
  // Obtiene texto para alletar
  getAlletarText(alletar: string): string {
    switch (alletar) {
      case 'NO': return 'No amamantando';
      case '1': return 'Amamantando 1 ternero';
      case '2': return 'Amamantando 2 terneros';
      default: return 'Desconocido';
    }
  },

  // Obtiene todas las explotaciones para selectores
  async getAllExplotaciones() {
    try {
      const endpoint = '/explotacions?limit=100';
      const response = await get<any>(endpoint);
      return response.items || [];
    } catch (error) {
      console.error('Error al obtener todas las explotaciones:', error);
      
      // Devolver datos simulados para desarrollo
      return [
        { id: 1, nombre: 'Explotación 1', codigo: 'EXP001' },
        { id: 2, nombre: 'Explotación 2', codigo: 'EXP002' },
        { id: 3, nombre: 'Explotación 3', codigo: 'EXP003' }
      ];
    }
  }
};

export default animalService;
export { getFilteredAnimals };
