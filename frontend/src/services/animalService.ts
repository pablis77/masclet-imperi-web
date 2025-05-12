import * as apiService from './apiService';
import { mockAnimals, mockExplotacions } from './mockData';
import api from './api';

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

const animalService = {
  // Obtiene una lista paginada de animales con filtros opcionales
  async getAnimals(filters: AnimalFilters = {}): Promise<PaginatedResponse<Animal>> {
    try {
      console.log('🐄 [Animal] Obteniendo animales con filtros:', filters);
      
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      // Añadir filtros a los parámetros de la consulta
      if (filters.explotacio) queryParams.append('explotacio', filters.explotacio);
      if (filters.genere) queryParams.append('genere', filters.genere);
      if (filters.estado) queryParams.append('estado', filters.estado);
      if (filters.alletar) queryParams.append('alletar', filters.alletar);
      if (filters.quadra) queryParams.append('quadra', filters.quadra);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      
      try {
        // Intentar obtener datos reales de la API
        // Probar con diferentes formatos de endpoint para mayor compatibilidad
        const endpoints = [
          `/animals?${queryString}`,
          `/dashboard/animals?${queryString}`
        ];
        
        let response = null;
        let successEndpoint = '';
        
        // Intentar cada endpoint hasta que uno funcione
        for (const endpoint of endpoints) {
          try {
            console.log(`🐄 [Animal] Intentando endpoint: ${endpoint}`);
            response = await apiService.get(endpoint);
            successEndpoint = endpoint;
            console.log(`🐄 [Animal] Respuesta recibida de ${endpoint}`);
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
        
        // Manejo de diferentes formatos de respuesta
        let items: Animal[] = [];
        let total = 0;
        let page = filters.page || 1;
        let limit = filters.limit || 10;
        let pages = 1;
        
        // CASO 1: Respuesta es un array directo
        if (Array.isArray(response)) {
          console.log(`🐄 [Animal] Procesando respuesta como array directo de ${response.length} elementos`);
          items = response;
          total = response.length;
          pages = Math.ceil(total / limit);
        }
        // CASO 2: Respuesta es un objeto con propiedad 'items' (formato paginado)
        else if (response && typeof response === 'object' && 'items' in response && Array.isArray(response.items)) {
          console.log(`🐄 [Animal] Procesando respuesta como objeto paginado con ${response.items.length} elementos`);
          items = response.items;
          total = response.total || items.length;
          page = response.page || page;
          limit = response.limit || limit;
          pages = response.pages || Math.ceil(total / limit);
        }
        // CASO 3: Respuesta es un objeto con propiedad 'data' (otro formato común)
        else if (response && typeof response === 'object' && 'data' in response) {
          if (Array.isArray(response.data)) {
            console.log(`🐄 [Animal] Procesando respuesta como objeto con data[] que contiene ${response.data.length} elementos`);
            items = response.data;
            total = response.total || items.length;
            page = response.page || page;
            limit = response.limit || limit;
            pages = response.pages || Math.ceil(total / limit);
          } 
          else if (response.data && typeof response.data === 'object' && 'items' in response.data && Array.isArray(response.data.items)) {
            console.log(`🐄 [Animal] Procesando respuesta como objeto con data.items[] que contiene ${response.data.items.length} elementos`);
            items = response.data.items;
            total = response.data.total || items.length;
            page = response.data.page || page;
            limit = response.data.limit || limit;
            pages = response.data.pages || Math.ceil(total / limit);
          }
        }
        
        // Si después de todo no tenemos items válidos, lanzar error
        if (!items || !Array.isArray(items)) {
          console.error('🔴 Error: items no es un array válido:', items);
          throw new Error('No se pudieron extraer datos válidos de la respuesta');
        }
        
        console.log(`🐄 [Animal] Procesados ${items.length} animales correctamente`);
        
        return {
          items,
          total,
          page,
          limit,
          pages
        };
        
      } catch (innerError) {
        console.error('🔴 [Animal] Error al obtener animales desde API:', innerError);
        throw innerError; // Propagar el error para el manejo del fallback
      }
    } catch (error) {
      console.error('🔴 [Animal] Error en obtención de animales:', error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      console.warn('⚠️ [Animal] Usando datos simulados debido a error en conexión con backend');
      
      // Filtrar datos mock usando la misma lógica
      const filteredMock = getFilteredAnimals(filters);
      
      // Calcular paginación para datos simulados
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredMock.slice(startIndex, endIndex);
      
      console.log(`🐄 [Animal] Devolviendo ${paginatedItems.length} animales simulados (de ${filteredMock.length} filtrados)`);
      
      return {
        items: paginatedItems,
        total: filteredMock.length,
        page,
        limit,
        pages: Math.ceil(filteredMock.length / limit)
      };
    }
  },
  
  // Obtiene un animal por su ID
  async getAnimalById(id: number): Promise<Animal> {
    try {
      console.log(`Intentando cargar animal con ID: ${id}`);
      // Usar la ruta correcta sin duplicar el prefijo /api/v1 que ya está en la URL base
      const responseData = await apiService.get(`/animals/${id}`);
      console.log('Animal cargado:', responseData);
      
      let animalData: Animal;
      
      // Comprobamos si la respuesta tiene el formato esperado {status, data}
      if (responseData && responseData.status === 'success' && responseData.data) {
        animalData = responseData.data as Animal;
      } 
      // Si la respuesta es directamente el animal
      else if (responseData && responseData.id) {
        animalData = responseData as Animal;
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
      // Añadir barra diagonal al final para que coincida con el endpoint del backend
      const responseData = await apiService.post('/animals/', animalData);
      console.log('Animal creado:', responseData);
      return responseData;
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
  
  // Actualiza un animal existente usando PATCH (actualización parcial)
  async updateAnimal(id: number, animalData: any): Promise<Animal> {
    try {
      console.log(`[PATCH] Actualizando animal con ID ${id}:`, animalData);
      
      // IMPORTANTE: Solo procesamos los campos que realmente se han enviado
      // No clonamos todo el objeto para evitar enviar campos innecesarios
      const datosNormalizados: Record<string, any> = {};
      
      // Lista de campos que pueden ser nulos
      const camposNulables = ['mare', 'pare', 'quadra', 'cod', 'num_serie', 'dob'];
      
      // Procesar solo los campos que se han proporcionado
      for (const campo in animalData) {
        // Comprobar si el campo existe en animalData
        if (Object.prototype.hasOwnProperty.call(animalData, campo)) {
          // Si es un campo nullable y está vacío, establecerlo como null
          if (camposNulables.includes(campo) && animalData[campo] === '') {
            datosNormalizados[campo] = null;
          } else if (campo === 'alletar' && animalData[campo] !== undefined) {
            // Tratar alletar como caso especial
            datosNormalizados[campo] = String(animalData[campo]) as '0' | '1' | '2';
          } else if (campo === 'dob' && animalData[campo]) {
            // Formatear fecha siempre al formato esperado por el backend: DD/MM/YYYY
            try {
              let fechaFinal;
              
              // Si la fecha ya está en formato DD/MM/YYYY, la dejamos igual
              if (typeof animalData[campo] === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(animalData[campo])) {
                fechaFinal = animalData[campo];
              }
              // Si es formato YYYY-MM-DD (desde inputs HTML)
              else if (typeof animalData[campo] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(animalData[campo])) {
                const [year, month, day] = animalData[campo].split('-');
                fechaFinal = `${day}/${month}/${year}`;
              }
              // Cualquier otro formato, intentamos parsearlo
              else {
                const fecha = new Date(animalData[campo]);
                if (!isNaN(fecha.getTime())) {
                  const day = fecha.getDate().toString().padStart(2, '0');
                  const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
                  const year = fecha.getFullYear();
                  fechaFinal = `${day}/${month}/${year}`;
                } else {
                  // Si no se puede parsear, usamos el valor original 
                  fechaFinal = animalData[campo];
                }
              }
              
              console.log(`Fecha convertida: ${animalData[campo]} -> ${fechaFinal}`);
              datosNormalizados[campo] = fechaFinal;
            } catch (err) {
              console.error('Error al formatear fecha:', err);
              // En caso de error, usar el valor original
              datosNormalizados[campo] = animalData[campo];
            }
          } else {
            // Para cualquier otro campo, usar el valor tal cual
            datosNormalizados[campo] = animalData[campo];
          }
        }
      }
      
      // Verificar que hay campos para actualizar
      const camposAActualizar = Object.keys(datosNormalizados);
      if (camposAActualizar.length === 0) {
        throw new Error('No se detectaron cambios para actualizar');
      }
      
      console.log(`[PATCH] Campos a actualizar: ${camposAActualizar.join(', ')}`);
      console.log('[PATCH] Datos finales:', datosNormalizados);
      
      // Ya no necesitamos manejar el token manualmente
      // La función patch del apiService se encarga de añadir los headers de autenticación
      
      // IMPORTANTE: Usar PATCH y la ruta correcta
      console.log(`[PATCH] Enviando petición a /animals/${id}`);
      console.log('Datos normalizados:', JSON.stringify(datosNormalizados, null, 2));
      
      // Usar el servicio API para garantizar coherencia
      console.log('Iniciando patch...');
      const responseData = await apiService.patch(`/animals/${id}`, datosNormalizados);
      console.log('PATCH completado con éxito');
      
      // El método patch de apiService ya maneja los errores y parsea la respuesta
      return responseData.data || responseData;

    } catch (error: any) {
      console.error(`[PATCH] Error al actualizar animal con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Elimina un animal (marcado como DEF)
  async deleteAnimal(id: number): Promise<Animal> {
    try {
      console.log(`Intentando eliminar animal con ID ${id}`);
      
      // Llamar al endpoint de eliminación (en realidad, marcar como DEF)
      // Usar la ruta correcta sin duplicar el prefijo /api/v1 que ya está en la URL base
      const response = await apiService.del(`/animals/${id}`);
      console.log(`Respuesta al eliminar animal con ID ${id}:`, response);
      
      return response;
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
      console.error(`Error al obtener posibles padres${explotacioId ? ` para explotación ${explotacioId}` : ''}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      console.warn('Usando datos simulados para posibles padres debido a error en el backend');
      
      // Filtrar animales simulados (machos activos)
      const filteredFathers = mockAnimals.filter(a => 
        a.genere === 'M' && 
        a.estado === 'OK' && 
        (!explotacioId || explotacioId === 'undefined' || a.explotacio === String(explotacioId)));
      
      return filteredFathers;
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
      console.error(`Error al obtener posibles madres${explotacioId ? ` para explotación ${explotacioId}` : ''}:`, error);
      
      // Si es un error de red o cualquier otro error, usar datos simulados como fallback
      console.warn('Usando datos simulados para posibles madres debido a error en el backend');
      
      // Filtrar animales simulados (hembras activas)
      const filteredMothers = mockAnimals.filter(a => 
        a.genere === 'F' && 
        a.estado === 'OK' && 
        (!explotacioId || explotacioId === 'undefined' || a.explotacio === String(explotacioId)));
      
      return filteredMothers;
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
          `/animals?explotacio=${encodeURIComponent(explotacionId)}&limit=100`
        ];
        
        let response = null;
        let successEndpoint = '';
        
        // Intentar cada endpoint hasta que uno funcione
        for (const endpoint of endpoints) {
          try {
            console.log(`🐄 [Animal] Intentando endpoint: ${endpoint}`);
            response = await apiService.get(endpoint);
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
  
  // Método simplificado para obtener valores únicos de explotaciones
  async getExplotacions(): Promise<{id: number, explotacio: string}[]> {
    try {
      console.log('Obteniendo lista de explotaciones');
      
      // Intentar primero obtener directamente del endpoint de dashboard/explotacions
      try {
        // Usar el endpoint correcto de dashboard para explotaciones
        const responseData = await apiService.get('/dashboard/explotacions');
        
        // Procesamos la respuesta para devolver el formato esperado
        if (responseData && responseData.status === 'success' && responseData.data && Array.isArray(responseData.data.items)) {
          const items = responseData.data.items;
          return items.map((item: any, index: number) => ({
            id: index + 1, // Usamos un ID secuencial ya que no hay un ID real en la respuesta
            explotacio: item.explotacio || ""
          }));
        }
      } catch (explotacioError) {
        console.warn('No se pudo obtener explotaciones del dashboard, intentando alternativa', explotacioError);
        // Continuar con el método alternativo
      }
      
      // Método alternativo: extraer de los animales existentes
      const response = await this.getAnimals({ page: 1, limit: 100 });
      
      // Extraer valores únicos de explotaciones
      const uniqueExplotacions = new Set<string>();
      
      if (response && response.items) {
        response.items.forEach((animal: Animal) => {
          if (animal.explotacio) {
            uniqueExplotacions.add(animal.explotacio);
          }
        });
      }
      
      // Si no hay datos, usar valores predefinidos
      if (uniqueExplotacions.size === 0) {
        return [
          { id: 1, explotacio: 'Madrid' },
          { id: 2, explotacio: 'Barcelona' },
          { id: 3, explotacio: 'Valencia' },
          { id: 4, explotacio: 'Guadalajara' }
        ];
      }
      
      // Convertir a array de objetos con id y explotacio
      return Array.from(uniqueExplotacions).map((explotacio, index) => ({
        id: index + 1,
        explotacio
      }));
    } catch (error: any) {
      console.error('Error al obtener explotaciones:', error);
      console.log('Usando datos simulados');
      return mockExplotacions;
    }
  }
};

// Exportar funciones individuales para facilitar su uso
export const getAnimalById = (id: number) => animalService.getAnimalById(id);

// Exportar el objeto completo para uso avanzado
export default animalService;
