import api from './api';

// Interfaces
export interface Explotacion {
  id: number;
  nombre: string;
  codigo: string;
  direccion?: string;
  municipio?: string;
  provincia?: string;
  cp?: string;
  telefono?: string;
  email?: string;
  responsable?: string;
  created_at: string;
  updated_at: string;
}

export interface ExplotacionCreateDto {
  nombre: string;
  codigo: string;
  direccion?: string;
  municipio?: string;
  provincia?: string;
  cp?: string;
  telefono?: string;
  email?: string;
  responsable?: string;
}

export interface ExplotacionUpdateDto extends Partial<ExplotacionCreateDto> {}

export interface ExplotacionFilters {
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

// Métodos del servicio
/**
 * Obtiene una lista paginada de explotaciones con filtros opcionales
 */
export const getExplotaciones = async (filters: ExplotacionFilters = {}): Promise<PaginatedResponse<Explotacion>> => {
  const params = new URLSearchParams();
  
  // Añadir filtros a los parámetros de consulta
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  
  const response = await api.get<PaginatedResponse<Explotacion>>(`/explotacions?${params.toString()}`);
  return response.data;
};

/**
 * Obtiene todas las explotaciones (sin paginación) para selectores
 */
export const getAllExplotaciones = async (): Promise<Explotacion[]> => {
  // Usar el endpoint de listado pero con un límite alto para obtener todas
  const response = await api.get<PaginatedResponse<Explotacion>>('/explotacions?limit=1000');
  return response.data.items;
};

/**
 * Obtiene una explotación por su ID
 */
export const getExplotacionById = async (id: number): Promise<Explotacion> => {
  const response = await api.get<Explotacion>(`/explotacions/${id}`);
  return response.data;
};

/**
 * Crea una nueva explotación
 */
export const createExplotacion = async (explotacionData: ExplotacionCreateDto): Promise<Explotacion> => {
  const response = await api.post<Explotacion>('/explotacions', explotacionData);
  return response.data;
};

/**
 * Actualiza una explotación existente
 */
export const updateExplotacion = async (id: number, explotacionData: ExplotacionUpdateDto): Promise<Explotacion> => {
  const response = await api.put<Explotacion>(`/explotacions/${id}`, explotacionData);
  return response.data;
};

/**
 * Elimina una explotación
 */
export const deleteExplotacion = async (id: number): Promise<void> => {
  await api.delete(`/explotacions/${id}`);
};
