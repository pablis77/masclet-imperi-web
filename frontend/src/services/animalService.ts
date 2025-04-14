import { get, post, put, del } from './apiService';
import { mockAnimals, mockExplotacions } from './mockData';

// Interfaces
export interface Parto {
  id?: number;
  animal_id?: number;
  animal_nom?: string;
  part?: string | null;  // Fecha del parto (DD/MM/YYYY)
  GenereT?: 'M' | 'F' | 'esforrada' | null;
  EstadoT?: 'OK' | 'DEF' | null;
  created_at?: string;
  updated_at?: string;
}

export interface Animal {
  id: number;
  explotacio: string;
  nom: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar: '0' | '1' | '2';  // 0: No amamanta, 1: Un ternero, 2: Dos terneros (solo para vacas)
  pare?: string | null;
  mare?: string | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null;
  created_at: string;
  updated_at: string;
  partos?: Parto[] | { items: Parto[] };
  parts?: Parto[];  // Soporte para nombre anterior (retrocompatibilidad)
  estat?: 'OK' | 'DEF';  // Soporte para nombre anterior (retrocompatibilidad)
}

export interface AnimalCreateDto {
  explotacio: string;
  nom: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar: '0' | '1' | '2';
  pare?: string | null;
  mare?: string | null;
  quadra?: string | null;
  cod?: string | null;
  num_serie?: string | null;
  dob?: string | null;
}

export interface AnimalUpdateDto extends Partial<AnimalCreateDto> {}

export interface AnimalFilters {
  explotacio?: string;
  genere?: 'M' | 'F';
  estado?: 'OK' | 'DEF';
  alletar?: '0' | '1' | '2';
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
  if (filters.explotacio !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.explotacio === filters.explotacio);
  }
  
  if (filters.genere !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.genere === filters.genere);
  }
  
  if (filters.estado !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.estado === filters.estado);
  }
  
  if (filters.alletar !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.alletar === filters.alletar);
  }
  
  if (filters.quadra !== undefined) {
    filteredAnimals = filteredAnimals.filter(a => a.quadra === filters.quadra);
  }
  
  if (filters.search !== undefined && filters.search !== '') {
    const searchLower = filters.search.toLowerCase().trim();
    console.log(`Filtrando por término de búsqueda: "${searchLower}"`);
    
    // Primero obtenemos todos los animales que coinciden con el término de búsqueda
    let matchingAnimals = filteredAnimals.filter(a => {
      // Búsqueda por nom (principal)
      const matchesNom = a.nom.toLowerCase().includes(searchLower);
      
      // Búsqueda por código identificativo
      const matchesCod = a.cod && a.cod.toLowerCase().includes(searchLower);
      
      // Búsqueda por número de serie
      const matchesNumSerie = a.num_serie && a.num_serie.toLowerCase().includes(searchLower);
      
      // Búsqueda por explotación 
      const matchesExplotacio = a.explotacio.toLowerCase().includes(searchLower);
      
      // Búsqueda por padre o madre
      const matchesPare = a.pare && a.pare.toLowerCase().includes(searchLower);
      const matchesMare = a.mare && a.mare.toLowerCase().includes(searchLower);
      
      // Animal coincide si cualquiera de los campos coincide
      return matchesNom || matchesCod || matchesNumSerie || matchesExplotacio || matchesPare || matchesMare;
    });
    
    // Vamos a asignar valores de prioridad a cada animal en función de dónde coincide el término
    const animalScores = matchingAnimals.map(animal => {
      let score = 0;
      
      // Prioridad máxima: Coincidencia EXACTA en nom (mismo texto)
      if (animal.nom.toLowerCase() === searchLower) {
        score += 1000;
      }
      // Prioridad alta: Coincidencia al INICIO del nombre (empieza por)
      else if (animal.nom.toLowerCase().startsWith(searchLower)) {
        score += 800;
      }
      // Prioridad media-alta: Nombre CONTIENE el término de búsqueda
      else if (animal.nom.toLowerCase().includes(searchLower)) {
        score += 500;
      }
      
      // Prioridad media: Coincidencia en código o número de serie (identificadores)
      if (animal.cod && animal.cod.toLowerCase().includes(searchLower)) {
        score += 300;
      }
      if (animal.num_serie && animal.num_serie.toLowerCase().includes(searchLower)) {
        score += 300;
      }
      
      // Prioridad baja: Coincidencia en padres, madre, explotación (relaciones)
      if (animal.pare && animal.pare.toLowerCase().includes(searchLower)) {
        score += 100;
      }
      if (animal.mare && animal.mare.toLowerCase().includes(searchLower)) {
        score += 100;
      }
      if (animal.explotacio && animal.explotacio.toLowerCase().includes(searchLower)) {
        score += 50;
      }
      
      return { animal, score };
    });
    
    // Ordenar por puntuación (mayor a menor) y luego por fecha de actualización
    animalScores.sort((a, b) => {
      // Primero por puntuación
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      
      // Si tienen la misma puntuación, ordenar por fecha de actualización (más reciente primero)
      return new Date(b.animal.updated_at).getTime() - new Date(a.animal.updated_at).getTime();
    });
    
    // Extraer solo los animales del array ordenado de puntuaciones
    matchingAnimals = animalScores.map(item => item.animal);
    
    // Opcional: Mostrar en la consola para depuración
    console.log('Animales ordenados por relevancia:', animalScores.map(item => `${item.animal.nom} (${item.score})`));
    
    // Tercero, consolidamos registros duplicados basados en el mismo animal
    // Consideramos que dos animales son el mismo si tienen el mismo nombre y código
    const uniqueAnimals: Animal[] = [];
    const processedKeys = new Set<string>();
    
    matchingAnimals.forEach(animal => {
      // Creamos una clave única basada en nombre y código para identificar registros duplicados
      // Si el código contiene un timestamp, lo eliminamos para considerar todas las versiones como un mismo animal
      const baseCode = animal.cod ? animal.cod.split('_')[0] : '';
      const uniqueKey = `${animal.nom.toLowerCase()}_${baseCode}`.trim();
      
      // Si no hemos procesado este animal antes, lo agregamos a la lista de únicos
      if (!processedKeys.has(uniqueKey)) {
        processedKeys.add(uniqueKey);
        uniqueAnimals.push(animal);
      }
    });
    
    filteredAnimals = uniqueAnimals;
    console.log(`Se encontraron ${filteredAnimals.length} animales únicos que coinciden con la búsqueda`);
  }
  
  return filteredAnimals;
};

// Funciones auxiliares para la UI
export const getAnimalStatusClass = (estado: string) => {
  return estado === 'OK' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

export const getAnimalIcon = (animal: Animal) => {
  if (animal.genere === 'M') {
    return '🐂'; // Toro
  } else {
    if (animal.alletar !== '0') {
      return '🐄'; // Vaca amamantando
    } else {
      return '🐮'; // Vaca
    }
  }
};

export const getAlletarText = (alletar: string) => {
  if (alletar === '0') return 'No amamantando';
  if (alletar === '1') return 'Amamantando 1 ternero';
  if (alletar === '2') return 'Amamantando 2 terneros';
  return 'Desconocido';
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
      if (filters.explotacio) params.append('explotacio', filters.explotacio);
      if (filters.genere) params.append('genere', filters.genere);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.alletar) params.append('alletar', filters.alletar);
      if (filters.quadra) params.append('quadra', filters.quadra);
      
      // Búsqueda por nombre y otros campos (nom, cod, num_serie)
      if (filters.search) {
        params.append('search', filters.search);
        console.log(`Buscando animales que coincidan con: "${filters.search}"`);
      }
      
      console.log('Obteniendo animales con parámetros:', Object.fromEntries(params.entries()));
      
      // Realizar petición a la API
      const apiResponse = await get<any>(`/animals?${params.toString()}`);
      console.log('Respuesta RAW de animales recibida:', apiResponse);
      
      // Transformar la estructura de respuesta del backend a nuestro formato esperado
      let processedResponse: PaginatedResponse<Animal>;
      
      // Verificar si la respuesta tiene el formato {status, data}
      if (apiResponse && apiResponse.status === 'success' && apiResponse.data) {
        console.log('Detectada respuesta con formato {status, data}. Procesando correctamente...');
        
        const { total, offset, limit, items } = apiResponse.data;
        
        processedResponse = {
          items: items || [],
          total: total || 0,
          page: Math.floor(offset / limit) + 1, // Calcular página en base a offset y limit
          limit: limit || 10,
          pages: Math.ceil((total || 0) / (limit || 10))
        };
      } else {
        // Si ya tiene el formato esperado o no conocemos el formato
        console.log('Usando respuesta en formato directo');
        processedResponse = apiResponse as PaginatedResponse<Animal>;
      }
      
      console.log('Respuesta procesada de animales:', processedResponse);
      
      // Notificar al usuario que los datos son reales
      if (filters.search) {
        document.dispatchEvent(new CustomEvent('search-completed', {
          detail: {
            term: filters.search,
            count: processedResponse.items.length,
            total: processedResponse.total,
            usedMock: false
          }
        }));
      }
      
      return processedResponse;
    } catch (error: any) {
      console.error('Error en petición GET /animals:', error);
      
      // Usar datos simulados en caso de error
      let useMockReason = '';
      
      // Verificar el tipo de error
      if (error.code === 'DB_COLUMN_ERROR' || (error.message && error.message.includes('estado_t'))) {
        useMockReason = 'error en la estructura de la tabla en el backend';
      } else if (error.code === 'NETWORK_ERROR') {
        useMockReason = 'error de conexión al servidor';
      } else {
        // Si no es un error específico conocido, seguir usando datos simulados pero con otro mensaje
        useMockReason = 'error en el servidor';
      }
      
      console.warn(`Usando datos simulados debido a: ${useMockReason}`);
      
      // Filtrar datos simulados según los filtros proporcionados
      const filteredAnimals = getFilteredAnimals(filters);
      
      // Calcular paginación
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);
      
      // Notificar al usuario que los datos son simulados si es una búsqueda
      if (filters.search) {
        document.dispatchEvent(new CustomEvent('search-completed', {
          detail: {
            term: filters.search,
            count: paginatedAnimals.length,
            total: filteredAnimals.length,
            usedMock: true,
            reason: useMockReason
          }
        }));
      }
      
      // Devolver respuesta paginada simulada
      return {
        items: paginatedAnimals,
        total: filteredAnimals.length,
        page,
        limit,
        pages: Math.ceil(filteredAnimals.length / limit)
      };
    }
  },
  
  // Obtiene un animal por su ID
  async getAnimalById(id: number): Promise<Animal> {
    try {
      console.log(`Intentando cargar animal con ID: ${id}`);
      const response = await get<any>(`/animals/${id}`);
      console.log('Animal cargado:', response);
      
      let animalData: Animal;
      
      // Comprobamos si la respuesta tiene el formato esperado {status, data}
      if (response && response.status === 'success' && response.data) {
        animalData = response.data as Animal;
      } 
      // Si la respuesta es directamente el animal
      else if (response && response.id) {
        animalData = response as Animal;
      }
      else {
        throw new Error('Formato de respuesta inválido');
      }
      
      // Normalizar estructura de partos si existe
      if (animalData) {
        // Asegurarnos de que partos sea siempre un array
        if (!animalData.partos) {
          animalData.partos = [];
        } else if (!Array.isArray(animalData.partos)) {
          // Si no es un array, pero tiene items, usamos eso
          if (animalData.partos.items && Array.isArray(animalData.partos.items)) {
            animalData.partos = animalData.partos.items;
          } else {
            // Si no tiene formato esperado, inicializar como array vacío
            animalData.partos = [];
          }
        }
        
        // Asegurarse de que existe 'estado' y no 'estat'
        if (!animalData.estado && animalData['estat']) {
          animalData.estado = animalData['estat'];
        }
      }
      
      return animalData;
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
        
        const now = new Date().toISOString();
        const currentAnimal = mockAnimals.find(a => a.id === id);
        
        if (!currentAnimal) {
          throw new Error(`No se encontró el animal con ID ${id}`);
        }
        
        // Actualizar los campos en el animal simulado
        const updatedAnimal = {
          ...currentAnimal,
          ...animalData,
          updated_at: now
        };
        
        // Actualizar el animal en el array de animales simulados
        const index = mockAnimals.findIndex(a => a.id === id);
        if (index !== -1) {
          mockAnimals[index] = updatedAnimal;
        }
        
        return updatedAnimal;
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Elimina un animal (marcado como DEF)
  async deleteAnimal(id: number): Promise<Animal> {
    try {
      console.log(`Eliminando animal con ID ${id}`);
      await del(`/animals/${id}`);
      console.log('Animal eliminado correctamente');
      
      // Marcar como DEF en el frontend (el backend realmente no lo borra)
      return this.updateAnimal(id, { estado: 'DEF' });
    } catch (error: any) {
      console.error(`Error al eliminar animal con ID ${id}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para eliminar animal debido a error en el backend');
        
        // Marcar como DEF en el frontend (el backend realmente no lo borra)
        return this.updateAnimal(id, { estado: 'DEF' });
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Obtiene los posibles padres (machos) para selección en formularios
  async getPotentialFathers(explotacioId: number | string): Promise<Animal[]> {
    try {
      console.log(`Obteniendo posibles padres para explotación ${explotacioId}`);
      const response = await get<Animal[]>(`/animals/fathers?explotacio=${explotacioId}`);
      console.log('Posibles padres recibidos:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al obtener posibles padres para explotación ${explotacioId}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para posibles padres debido a error en el backend');
        // Filtrar animales simulados (machos activos de la misma explotación)
        return mockAnimals.filter(a => 
          a.genere === 'M' && 
          a.estado === 'OK' && 
          a.explotacio === String(explotacioId));
      }
      
      // Si no es un error manejable, propagar el error
      throw error;
    }
  },
  
  // Obtiene las posibles madres (hembras) para selección en formularios
  async getPotentialMothers(explotacioId: number | string): Promise<Animal[]> {
    try {
      console.log(`Obteniendo posibles madres para explotación ${explotacioId}`);
      const response = await get<Animal[]>(`/animals/mothers?explotacio=${explotacioId}`);
      console.log('Posibles madres recibidas:', response);
      return response;
    } catch (error: any) {
      console.error(`Error al obtener posibles madres para explotación ${explotacioId}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      if (error.code === 'DB_COLUMN_ERROR' || error.code === 'NETWORK_ERROR' || 
          (error.message && (error.message.includes('estado_t') || error.message.includes('conexión')))) {
        console.warn('Usando datos simulados para posibles madres debido a error en el backend');
        // Filtrar animales simulados (hembras activas de la misma explotación)
        return mockAnimals.filter(a => 
          a.genere === 'F' && 
          a.estado === 'OK' && 
          a.explotacio === String(explotacioId));
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
      const mockAnimalsFiltered = mockAnimals.filter(a => a.explotacio === String(explotacionId));
      console.log(`🐄 [Animal] Devolviendo ${mockAnimalsFiltered.length} animales simulados para explotación ${explotacionId}`);
      return mockAnimalsFiltered;
    }
  },
  
  // Utilidades para iconos y visualización
  getAnimalIcon(animal: Animal): string {
    if (animal.genere === 'M') {
      return '🐂'; // Toro
    } else {
      if (animal.alletar !== '0') {
        return '🐄'; // Vaca amamantando
      } else {
        return '🐮'; // Vaca
      }
    }
  },
  
  getAnimalStatusClass(estado: string): string {
    if (estado === 'OK') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (estado === 'DEF') {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  },
  
  // Obtiene texto para alletar
  getAlletarText(alletar: string): string {
    if (alletar === '0') return 'No amamantando';
    if (alletar === '1') return 'Amamantando 1 ternero';
    if (alletar === '2') return 'Amamantando 2 terneros';
    return 'Desconocido';
  },
  
  // Esta función se ha movido a explotacioService.ts
  // Ya no está disponible en animalService
};

export default animalService;
