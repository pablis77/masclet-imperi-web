// Servicio para gestionar los partos
import { get, post, put, del } from './apiService';
import { mockParts, mockAnimals } from './mockData';

const API_PATH = '/api/v1';

// Interfaces
export interface Part {
  id: number;
  animal_id: number;
  animal_nom?: string;
  data: string; // fecha del parto
  num_cries: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  cries?: Animal[]; // Lista de crías asociadas
}

export interface Animal {
  id: number;
  nom: string;
  genere: string;
  cod?: string | null;
  estado: string;
  // Otros campos relevantes de Animal
}

export interface PartCreateDto {
  animal_id: number;
  data: string;
  num_cries: number;
  notes?: string;
  cries_ids?: number[]; // IDs de las crías asociadas
}

export interface PartUpdateDto extends Partial<PartCreateDto> {}

export interface PartFilters {
  animal_id?: number;
  explotacio_id?: number;
  startDate?: string;
  endDate?: string;
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

// Función para filtrar partos (usado para mock)
const getFilteredParts = (filters: PartFilters): Part[] => {
  let filteredParts = [...mockParts];
  
  // Aplicar filtros
  if (filters.animal_id !== undefined) {
    filteredParts = filteredParts.filter(p => p.animal_id === filters.animal_id);
  }
  
  if (filters.explotacio_id !== undefined) {
    // Buscar los IDs de animales de esta explotación
    const animalsFromExplotacio = mockAnimals.filter(a => a.explotacio_id === filters.explotacio_id);
    const animalIds = animalsFromExplotacio.map(a => a.id);
    
    // Filtrar partos por animal_id
    filteredParts = filteredParts.filter(p => animalIds.includes(p.animal_id));
  }
  
  if (filters.startDate !== undefined) {
    const startDate = new Date(filters.startDate);
    filteredParts = filteredParts.filter(p => new Date(p.data) >= startDate);
  }
  
  if (filters.endDate !== undefined) {
    const endDate = new Date(filters.endDate);
    filteredParts = filteredParts.filter(p => new Date(p.data) <= endDate);
  }
  
  return filteredParts;
};

// Encontrar crías simuladas para cada parto (solo para desarrollo)
const getMockCriesForPart = (partId: number): Animal[] => {
  // En datos reales, esto vendría del backend
  // Para simulación, usamos un subconjunto de los animales como crías
  const criasCount = Math.floor(Math.random() * 3) + 1; // 1-3 crías al azar
  
  return mockAnimals
    .filter(animal => animal.dob) // Filtrar animales que tienen fecha de nacimiento
    .slice(0, criasCount)
    .map(animal => ({
      id: animal.id,
      nom: animal.nom,
      genere: animal.genere,
      cod: animal.cod,
      estado: animal.estado
    } as Animal));
};

// Servicio de partos
const partService = {
  // Obtiene una lista paginada de partos con filtros opcionales
  async getParts(filters: PartFilters = {}): Promise<PaginatedResponse<Part>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    // Preparar query params
    const queryParams = new URLSearchParams();
    if (filters.animal_id !== undefined) queryParams.append('animal_id', filters.animal_id.toString());
    if (filters.explotacio_id !== undefined) queryParams.append('explotacio_id', filters.explotacio_id.toString());
    if (filters.startDate !== undefined) queryParams.append('start_date', filters.startDate);
    if (filters.endDate !== undefined) queryParams.append('end_date', filters.endDate);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `${API_PATH}/parts${queryString ? `?${queryString}` : ''}`;
    
    try {
      // Intentar obtener datos reales de la API
      const response = await get<PaginatedResponse<Part>>(endpoint);
      
      // Si llegamos aquí, la llamada a la API fue exitosa
      return response;
    } catch (error) {
      console.warn('Error al obtener partos de la API, usando datos simulados', error);
      
      // Filtrar según filtros
      const filteredParts = getFilteredParts(filters);
      
      // Paginación
      const start = (page - 1) * limit;
      const end = page * limit;
      const paginatedItems = filteredParts.slice(start, end);
      const totalPages = Math.ceil(filteredParts.length / limit);
      
      // Añadir crías simuladas a cada parto
      const partsWithCries = paginatedItems.map(part => ({
        ...part,
        cries: getMockCriesForPart(part.id)
      }));
      
      return {
        items: partsWithCries,
        total: filteredParts.length,
        page,
        limit,
        pages: totalPages
      };
    }
  },
  
  // Obtiene un parto por su ID
  async getPartById(id: number): Promise<Part> {
    const endpoint = `${API_PATH}/parts/${id}`;
    
    try {
      // Intentar obtener datos reales
      const response = await get<Part>(endpoint);
      return response;
    } catch (error) {
      console.warn(`Error al obtener parto con ID ${id}, usando datos simulados`, error);
      
      // Buscar en datos simulados
      const mockPart = mockParts.find(p => p.id === id);
      if (!mockPart) {
        throw new Error(`Parto con ID ${id} no encontrado`);
      }
      
      // Añadir crías simuladas
      return {
        ...mockPart,
        cries: getMockCriesForPart(id)
      };
    }
  },
  
  // Obtiene los partos de un animal específico
  async getPartsByAnimalId(animalId: number): Promise<Part[]> {
    const endpoint = `${API_PATH}/animals/${animalId}/parts`;
    
    try {
      // Intentar obtener datos reales
      const response = await get<Part[]>(endpoint);
      return response;
    } catch (error) {
      console.warn(`Error al obtener partos del animal ${animalId}, usando datos simulados`, error);
      
      // Filtrar por animal_id
      const animalParts = mockParts.filter(p => p.animal_id === animalId);
      
      // Añadir crías simuladas a cada parto
      return animalParts.map(part => ({
        ...part,
        cries: getMockCriesForPart(part.id)
      }));
    }
  },
  
  // Crea un nuevo parto
  async createPart(partData: PartCreateDto): Promise<Part> {
    const endpoint = `${API_PATH}/parts`;
    
    try {
      // Intentar crear en la API real
      const response = await post<Part>(endpoint, partData);
      return response;
    } catch (error) {
      console.warn('Error al crear parto en la API, utilizando simulación', error);
      
      // Verificar que el animal existe
      const animal = mockAnimals.find(a => a.id === partData.animal_id);
      if (!animal) {
        throw new Error(`Animal con ID ${partData.animal_id} no encontrado`);
      }
      
      // Crear respuesta simulada
      const newId = Math.max(...mockParts.map(p => p.id), 0) + 1;
      const now = new Date().toISOString();
      
      const mockResponse: Part = {
        id: newId,
        ...partData,
        animal_nom: animal.nom,
        created_at: now,
        updated_at: now,
        cries: partData.cries_ids ? 
          partData.cries_ids.map(id => {
            const cria = mockAnimals.find(a => a.id === id);
            return cria ? {
              id: cria.id,
              nom: cria.nom,
              genere: cria.genere,
              cod: cria.cod,
              estado: cria.estado
            } as Animal : null;
          }).filter(Boolean) as Animal[] : 
          getMockCriesForPart(newId)
      };
      
      return mockResponse;
    }
  },
  
  // Actualiza un parto existente
  async updatePart(id: number, partData: PartUpdateDto): Promise<Part> {
    const endpoint = `${API_PATH}/parts/${id}`;
    
    try {
      // Intentar actualizar en la API real
      const response = await put<Part>(endpoint, partData);
      return response;
    } catch (error) {
      console.warn(`Error al actualizar parto con ID ${id}, utilizando simulación`, error);
      
      // Buscar en datos simulados
      const mockPart = mockParts.find(p => p.id === id);
      if (!mockPart) {
        throw new Error(`Parto con ID ${id} no encontrado`);
      }
      
      // Si se cambia el animal, verificar que existe
      let animalNom = mockPart.animal_nom;
      if (partData.animal_id && partData.animal_id !== mockPart.animal_id) {
        const animal = mockAnimals.find(a => a.id === partData.animal_id);
        if (!animal) {
          throw new Error(`Animal con ID ${partData.animal_id} no encontrado`);
        }
        animalNom = animal.nom;
      }
      
      // Crear respuesta simulada con datos actualizados
      const mockResponse: Part = {
        ...mockPart,
        ...partData,
        animal_nom: animalNom,
        updated_at: new Date().toISOString(),
        cries: partData.cries_ids ? 
          partData.cries_ids.map(id => {
            const cria = mockAnimals.find(a => a.id === id);
            return cria ? {
              id: cria.id,
              nom: cria.nom,
              genere: cria.genere,
              cod: cria.cod,
              estado: cria.estado
            } as Animal : null;
          }).filter(Boolean) as Animal[] : 
          (mockPart as any).cries || getMockCriesForPart(id)
      };
      
      return mockResponse;
    }
  },
  
  // Elimina un parto
  async deletePart(id: number): Promise<void> {
    const endpoint = `${API_PATH}/parts/${id}`;
    
    try {
      // Intentar eliminar en la API real
      await del(endpoint);
    } catch (error) {
      console.warn(`Error al eliminar parto con ID ${id}, utilizando simulación`, error);
      
      // Verificar que existe
      const partExists = mockParts.some(p => p.id === id);
      if (!partExists) {
        throw new Error(`Parto con ID ${id} no encontrado`);
      }
      
      // En una implementación real, este parto sería eliminado de la base de datos
      console.log(`Simulación: Parto con ID ${id} eliminado correctamente`);
    }
  }
};

export default partService;
