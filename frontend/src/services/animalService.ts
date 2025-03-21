import { get, post, put, del } from './apiService';
import { mockAnimals, mockExplotacions } from './mockData';

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
      const params = new URLSearchParams();
      params.append('page', (filters.page || 1).toString());
      params.append('limit', (filters.limit || 10).toString());
      
      // Añadir filtros opcionales si están presentes
      if (filters.explotacio_id) params.append('explotacio_id', filters.explotacio_id.toString());
      if (filters.genere) params.append('genere', filters.genere);
      if (filters.estat) params.append('estat', filters.estat);
      if (filters.alletar && filters.alletar !== 'NO') params.append('alletar', filters.alletar.toString());
      if (filters.quadra) params.append('quadra', filters.quadra);
      if (filters.search) params.append('search', filters.search);
      
      console.log('Obteniendo animales con parámetros:', Object.fromEntries(params.entries()));
      
      // Realizar petición a la API
      const response = await get<PaginatedResponse<Animal>>(`/animals?${params.toString()}`);
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
        
        throw new Error(`Animal con ID ${id} no encontrado en los datos simulados`);
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Crea un nuevo animal
  async createAnimal(animalData: AnimalCreateDto): Promise<Animal> {
    try {
      console.log('Creando nuevo animal:', animalData);
      const response = await post<Animal>('/animals', animalData);
      console.log('Animal creado:', response);
      return response;
    } catch (error: any) {
      console.error('Error al crear animal:', error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para crear animal debido a error en el backend');
        
        // Crear respuesta simulada
        const newId = Math.max(...mockAnimals.map(a => a.id)) + 1;
        const now = new Date().toISOString();
        
        return {
          id: newId,
          ...animalData,
          pare_nom: animalData.pare_id ? mockAnimals.find(a => a.id === animalData.pare_id)?.nom || null : null,
          mare_nom: animalData.mare_id ? mockAnimals.find(a => a.id === animalData.mare_id)?.nom || null : null,
          created_at: now,
          updated_at: now
        };
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Actualiza un animal existente
  async updateAnimal(id: number, animalData: AnimalUpdateDto): Promise<Animal> {
    try {
      console.log(`Actualizando animal con ID ${id}:`, animalData);
      const response = await put<Animal>(`/animals/${id}`, animalData);
      console.log('Animal actualizado:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al actualizar animal con ID ${id}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para actualizar animal debido a error en el backend');
        
        // Buscar en datos simulados
        const animal = mockAnimals.find(a => a.id === id);
        if (!animal) {
          throw new Error(`Animal con ID ${id} no encontrado en los datos simulados`);
        }
        
        // Actualizar datos simulados
        const updatedAnimal = {
          ...animal,
          ...animalData,
          pare_nom: animalData.pare_id ? mockAnimals.find(a => a.id === animalData.pare_id)?.nom || animal.pare_nom : animal.pare_nom,
          mare_nom: animalData.mare_id ? mockAnimals.find(a => a.id === animalData.mare_id)?.nom || animal.mare_nom : animal.mare_nom,
          updated_at: new Date().toISOString()
        };
        
        return updatedAnimal;
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Elimina un animal (marcado como DEF)
  async deleteAnimal(id: number): Promise<void> {
    try {
      console.log(`Eliminando animal con ID ${id}`);
      await del(`/animals/${id}`);
      console.log('Animal eliminado correctamente');
    } catch (error: any) {
      console.error(`Error al eliminar animal con ID ${id}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para eliminar animal debido a error en el backend');
        return;
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Da de baja a un animal (cambia estado a DEF)
  async deactivateAnimal(id: number): Promise<Animal> {
    return this.updateAnimal(id, { estat: 'DEF' });
  },
  
  // Obtiene los posibles padres (machos) para selección en formularios
  async getPotentialFathers(explotacioId: number): Promise<Animal[]> {
    try {
      console.log(`Obteniendo posibles padres para explotación ${explotacioId}`);
      const response = await get<Animal[]>(`/animals/fathers?explotacio_id=${explotacioId}`);
      console.log('Posibles padres recibidos:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al obtener posibles padres para explotación ${explotacioId}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para posibles padres debido a error en el backend');
        return mockAnimals.filter(a => a.explotacio_id === explotacioId && a.genere === 'M' && a.estat === 'ACT');
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Obtiene las posibles madres (hembras) para selección en formularios
  async getPotentialMothers(explotacioId: number): Promise<Animal[]> {
    try {
      console.log(`Obteniendo posibles madres para explotación ${explotacioId}`);
      const response = await get<Animal[]>(`/animals/mothers?explotacio_id=${explotacioId}`);
      console.log('Posibles madres recibidas:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al obtener posibles madres para explotación ${explotacioId}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para posibles madres debido a error en el backend');
        return mockAnimals.filter(a => a.explotacio_id === explotacioId && a.genere === 'F' && a.estat === 'ACT');
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Obtiene todos los animales de una explotación
  async getAnimalsByExplotacion(explotacionId: number | string): Promise<Animal[]> {
    try {
      // Intentar obtener datos reales de la API
      try {
        console.log(`🐄 [Animal] Solicitando animales para explotación ${explotacionId}`);
        
        // Probar con diferentes formatos de endpoint para mayor compatibilidad
        const endpoints = [
          `/animals?explotacio_id=${explotacionId}`,
          `/animals?explotacio=${explotacionId}`,
          `/animals/explotacio/${explotacionId}`
        ];
        
        let response = null;
        let successEndpoint = '';
        
        // Intentar cada endpoint hasta que uno funcione
        for (const endpoint of endpoints) {
          try {
            console.log(`🐄 [Animal] Intentando endpoint: ${endpoint}`);
            response = await get<any>(endpoint);
            successEndpoint = endpoint;
            console.log(`🐄 [Animal] Respuesta recibida de ${endpoint}:`, response);
            break; // Si llegamos aquí, la petición fue exitosa
          } catch (endpointError) {
            console.warn(`🐄 [Animal] Error con endpoint ${endpoint}:`, endpointError);
            // Continuar con el siguiente endpoint
          }
        }
        
        if (!response) {
          throw new Error('Todos los endpoints fallaron');
        }
        
        console.log(`🐄 [Animal] Endpoint exitoso: ${successEndpoint}`);
        
        // Si es un array, devolverlo directamente
        if (Array.isArray(response)) {
          console.log(`🐄 [Animal] Devolviendo array de ${response.length} animales`);
          return response;
        }
        
        // Si no es un array, verificar si es un objeto con propiedad 'items' (formato paginado)
        if (response && typeof response === 'object' && 'items' in response) {
          console.log(`🐄 [Animal] Devolviendo ${response.items.length} animales desde respuesta paginada`);
          return response.items as Animal[];
        }
        
        // Si es un objeto con propiedad 'data' (otro formato común)
        if (response && typeof response === 'object' && 'data' in response) {
          if (Array.isArray(response.data)) {
            console.log(`🐄 [Animal] Devolviendo ${response.data.length} animales desde response.data`);
            return response.data as Animal[];
          }
        }
        
        // Si no encontramos animales, devolver array vacío
        console.warn(`🐄 [Animal] No se pudo interpretar la respuesta:`, response);
        return [];
      } catch (innerError) {
        console.error(`🐄 [Animal] Error al obtener animales para explotación ${explotacionId}:`, innerError);
        throw innerError;
      }
    } catch (error: any) {
      console.error(`🐄 [Animal] Error en petición para obtener animales de explotación ${explotacionId}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      console.warn(`🐄 [Animal] Usando datos simulados para animales de explotación ${explotacionId}`);
      
      // Filtrar animales simulados por explotación
      const mockAnimalsFiltered = mockAnimals.filter(a => a.explotacio_id === Number(explotacionId));
      console.log(`🐄 [Animal] Devolviendo ${mockAnimalsFiltered.length} animales simulados para explotación ${explotacionId}`);
      return mockAnimalsFiltered;
    }
  },
  
  // Utilidades para iconos y visualización
  getAnimalIcon(animal: Animal): string {
    if (!animal) return '🐄';
    
    if (animal.genere === 'M') {
      return '♂️';
    } else if (animal.alletar !== 'NO') {
      return '🐄';
    } else {
      return '♀️';
    }
  },
  
  getAnimalStatusClass(estat: string): string {
    switch (estat) {
      case 'ACT': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'DEF': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  },
  
  // Obtiene texto para alletar
  getAlletarText(alletar: string): string {
    switch (alletar) {
      case '1': return 'Amamantando (1)';
      case '2': return 'Amamantando (2)';
      case 'NO':
      default: return 'No amamantando';
    }
  },
  
  // Obtiene todas las explotaciones para selectores
  async getAllExplotaciones() {
    try {
      const response = await get<any[]>('/explotacions?limit=1000');
      return response.map(explotacion => ({
        id: explotacion.id,
        nombre: explotacion.nom || 'Sin nombre', 
        codigo: explotacion.explotaci || '-'     
      }));
    } catch (error) {
      console.error('Error al obtener explotaciones:', error);
      
      // Usar datos simulados en caso de error
      return mockExplotacions.map(explotacion => ({
        id: explotacion.id,
        nombre: explotacion.nom || 'Sin nombre', 
        codigo: explotacion.explotaci || '-'     
      }));
    }
  },
  
  // ...
};

export default animalService;
export { getFilteredAnimals };
