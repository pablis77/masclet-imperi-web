import { get, post, put, del, patch } from './apiService';

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
      
      // Búsqueda por nombre y otros campos
      if (filters.search) {
        params.append('search', filters.search);
        console.log(`Buscando animales que coincidan con: "${filters.search}"`);
      }
      
      console.log('Obteniendo animales con parámetros:', Object.fromEntries(params.entries()));
      
      // Realizar petición a la API
      const apiResponse = await get<any>(`/api/v1/animals/?${params.toString()}`);
      
      // Transformar la estructura de respuesta del backend a nuestro formato esperado
      let processedResponse: PaginatedResponse<Animal>;
      
      // Verificar si la respuesta tiene el formato {status, data}
      if (apiResponse && apiResponse.status === 'success' && apiResponse.data) {
        console.log('Detectada respuesta con formato {status, data}. Procesando...');
        
        const { total, offset, limit, items } = apiResponse.data;
        
        processedResponse = {
          items: items || [],
          total: total || 0,
          page: Math.floor(offset / limit) + 1,
          limit: limit || 10,
          pages: Math.ceil((total || 0) / (limit || 10))
        };
      } else {
        // Si ya tiene el formato esperado
        processedResponse = apiResponse as PaginatedResponse<Animal>;
      }
      
      return processedResponse;
    } catch (error: any) {
      console.error('Error en petición GET /api/v1/animals:', error);
      throw error;
    }
  },
  
  // Obtiene un animal por su ID
  async getAnimalById(id: number): Promise<Animal> {
    try {
      console.log(`Obteniendo animal con ID: ${id}`);
      const response = await get<any>(`/api/v1/animals/${id}`);
      
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
          if ('items' in animalData.partos && Array.isArray(animalData.partos.items)) {
            animalData.partos = animalData.partos.items;
          } else {
            // Si no tiene formato esperado, inicializar como array vacío
            animalData.partos = [];
          }
        }
      }
      
      return animalData;
    } catch (error: any) {
      console.error(`Error al obtener animal con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Crea un nuevo animal
  async createAnimal(animalData: AnimalCreateDto): Promise<Animal> {
    try {
      console.log('Creando nuevo animal:', animalData);
      const response = await post<Animal>('/api/v1/animals/', animalData);
      console.log('Animal creado:', response);
      return response;
    } catch (error: any) {
      console.error('Error al crear animal:', error);
      throw error;
    }
  },
  
  // Actualiza un animal existente - MÉTODO COMPLETO
  async updateAnimal(id: number, animalData: any): Promise<Animal> {
    try {
      console.log(`Actualizando animal con ID ${id}:`, animalData);
      
      // Preparación de datos - solo procesamos lo esencial
      const datosNormalizados = { ...animalData };
      
      // Convertir cadenas vacías a null para campos que pueden ser nulos
      const camposNulables = ['mare', 'pare', 'quadra', 'cod', 'num_serie', 'dob'];
      for (const campo of camposNulables) {
        if (datosNormalizados[campo] === '') {
          datosNormalizados[campo] = null;
        }
      }
      
      // Asegurar que alletar sea string si está definido
      if (datosNormalizados.alletar !== undefined) {
        datosNormalizados.alletar = String(datosNormalizados.alletar) as '0' | '1' | '2';
      }
      
      // Formatear fecha si es necesario
      if (datosNormalizados.dob && typeof datosNormalizados.dob === 'string' && !datosNormalizados.dob.includes('/')) {
        try {
          const fecha = new Date(datosNormalizados.dob);
          if (!isNaN(fecha.getTime())) {
            const day = fecha.getDate().toString().padStart(2, '0');
            const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const year = fecha.getFullYear();
            datosNormalizados.dob = `${day}/${month}/${year}`;
          }
        } catch (err) {
          console.error('Error al formatear fecha:', err);
        }
      }
      
      // Verificar que hay campos para actualizar
      const camposAActualizar = Object.keys(datosNormalizados);
      if (camposAActualizar.length === 0) {
        throw new Error('No se detectaron cambios para actualizar');
      }
      
      console.log(`Campos a actualizar: ${camposAActualizar.join(', ')}`);
      console.log('Datos finales:', datosNormalizados);
      
      // Usar fetch directamente - similar a test_patch.py
      const token = localStorage.getItem('token');
      
      // Configurar headers exactamente igual que en test_patch.py
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Evitar caché
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/v1/animals/${id}?_t=${timestamp}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(datosNormalizados),
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error en PATCH /api/v1/animals/${id}:`, errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        } catch (e) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      console.log('Respuesta exitosa:', responseData);
      
      // Extraer el animal de la respuesta
      if (responseData && responseData.data) {
        return responseData.data;
      }
      
      return responseData;
    } catch (error: any) {
      console.error(`Error al actualizar animal con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Actualiza solo un campo específico de un animal - MÉTODO ESPECIALIZADO PARA ACTUALIZACIONES PARCIALES
  async updateAnimalField(id: number, fieldName: string, fieldValue: any): Promise<Animal> {
    try {
      console.log(`Actualizando campo '${fieldName}' del animal con ID ${id} a:`, fieldValue);
      
      // Crear objeto con solo el campo a actualizar
      const updateData: Record<string, any> = {};
      updateData[fieldName] = fieldValue === '' ? null : fieldValue;
      
      // Usar el método general de actualización
      return await this.updateAnimal(id, updateData);
    } catch (error: any) {
      console.error(`Error al actualizar campo '${fieldName}' del animal con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Obtiene los posibles padres (machos) para selección en formularios
  async getPotentialFathers(explotacioId?: number | string): Promise<Animal[]> {
    try {
      console.log(`Obteniendo posibles padres${explotacioId ? ` para explotación ${explotacioId}` : ''}`);
      
      // Usar el endpoint general de animales con filtros
      const filters: AnimalFilters = {
        genere: 'M',
        estado: 'OK'
      };
      
      // Añadir filtro de explotación si se proporciona
      if (explotacioId && explotacioId !== 'undefined') {
        filters.explotacio = String(explotacioId);
      }
      
      // Obtener animales filtrados
      const response = await this.getAnimals(filters);
      
      // Extraer los items si es una respuesta paginada
      const fathers = Array.isArray(response) ? response : (response.items || []);
      console.log('Posibles padres recibidos:', fathers);
      return fathers;
    } catch (error: any) {
      console.error(`Error al obtener posibles padres:`, error);
      throw error;
    }
  },
  
  // Obtiene las posibles madres (hembras) para selección en formularios
  async getPotentialMothers(explotacioId?: number | string): Promise<Animal[]> {
    try {
      console.log(`Obteniendo posibles madres${explotacioId ? ` para explotación ${explotacioId}` : ''}`);
      
      // Usar el endpoint general de animales con filtros
      const filters: AnimalFilters = {
        genere: 'F',
        estado: 'OK'
      };
      
      // Añadir filtro de explotación si se proporciona
      if (explotacioId && explotacioId !== 'undefined') {
        filters.explotacio = String(explotacioId);
      }
      
      // Obtener animales filtrados
      const response = await this.getAnimals(filters);
      
      // Extraer los items si es una respuesta paginada
      const mothers = Array.isArray(response) ? response : (response.items || []);
      console.log('Posibles madres recibidas:', mothers);
      return mothers;
    } catch (error: any) {
      console.error(`Error al obtener posibles madres:`, error);
      throw error;
    }
  },
  
  // Obtiene todos los animales de una explotación
  async getAnimalsByExplotacion(explotacioId: number | string): Promise<Animal[]> {
    try {
      console.log(`Obteniendo animales para explotación ${explotacioId}`);
      
      const filters: AnimalFilters = {
        explotacio: String(explotacioId),
        limit: 100 // Aumentamos el límite para obtener más animales
      };
      
      const response = await this.getAnimals(filters);
      
      // Extraer los items si es una respuesta paginada
      const animals = Array.isArray(response) ? response : (response.items || []);
      console.log(`Obtenidos ${animals.length} animales para explotación ${explotacioId}`);
      return animals;
    } catch (error: any) {
      console.error(`Error al obtener animales para explotación ${explotacioId}:`, error);
      throw error;
    }
  },
  
  // Método simplificado para obtener valores únicos de explotaciones
  async getExplotacions(): Promise<{id: number, explotacio: string}[]> {
    try {
      console.log('Obteniendo valores únicos de explotaciones');
      
      // Obtener animales con un límite razonable
      const response = await this.getAnimals({ page: 1, limit: 50 });
      
      // Extraer valores únicos de explotaciones
      const uniqueExplotacions = new Set<string>();
      
      if (response && response.items) {
        response.items.forEach((animal: Animal) => {
          if (animal.explotacio) {
            uniqueExplotacions.add(animal.explotacio);
          }
        });
      }
      
      // Convertir a array de objetos con id y explotacio
      return Array.from(uniqueExplotacions).map((explotacio, index) => ({
        id: index + 1,
        explotacio
      }));
    } catch (error) {
      console.error('Error al obtener explotaciones:', error);
      throw error;
    }
  }
};

export default animalService;
