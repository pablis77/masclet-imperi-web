import api from './api';

// Interfaces
export interface Parto {
  id: number;
  animal_id: number;
  fecha: string;
  num_crias: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface PartoCreateDto {
  animal_id: number;
  fecha: string;
  num_crias: number;
  observaciones?: string;
}

export interface PartoUpdateDto extends Partial<PartoCreateDto> {}

export interface PartoFilters {
  animal_id?: number;
  explotacio_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
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

// Métodos del servicio
/**
 * Obtiene una lista paginada de partos con filtros opcionales
 */
export const getPartos = async (filters: PartoFilters = {}): Promise<PaginatedResponse<Parto>> => {
  const params = new URLSearchParams();
  
  // Añadir filtros a los parámetros de consulta
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  
  const response = await api.get<PaginatedResponse<Parto>>(`/partos?${params.toString()}`);
  return response.data;
};

/**
 * Obtiene un parto por su ID
 */
export const getPartoById = async (id: number): Promise<Parto> => {
  const response = await api.get<Parto>(`/partos/${id}`);
  return response.data;
};

/**
 * Obtiene todos los partos de un animal específico
 */
export const getPartosByAnimal = async (animalId: number): Promise<Parto[]> => {
  const response = await api.get<Parto[]>(`/animals/${animalId}/partos`);
  return response.data;
};

/**
 * Crea un nuevo registro de parto
 */
export const createParto = async (partoData: PartoCreateDto): Promise<Parto> => {
  const response = await api.post<Parto>('/partos', partoData);
  return response.data;
};

/**
 * Actualiza un registro de parto existente
 */
export const updateParto = async (id: number, partoData: PartoUpdateDto): Promise<Parto> => {
  const response = await api.put<Parto>(`/partos/${id}`, partoData);
  return response.data;
};

/**
 * Elimina un registro de parto
 */
export const deleteParto = async (id: number): Promise<void> => {
  await api.delete(`/partos/${id}`);
};
