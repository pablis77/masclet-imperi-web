/**
 * Utilidad auxiliar para gestionar parámetros de ordenación en URLs
 */

export type SortDirection = 'asc' | 'desc';

/**
 * Añade parámetros de ordenación a una URL
 * @param baseUrl URL base a la que añadir los parámetros
 * @param sortField Campo por el que ordenar
 * @param sortDirection Dirección de ordenación
 * @returns URL con parámetros de ordenación
 */
export const addSortParams = (baseUrl: string, sortField?: string, sortDirection?: SortDirection): string => {
  if (!sortField) return baseUrl;
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  
  return `${baseUrl}${separator}sort_by=${sortField}&sort_order=${sortDirection || 'asc'}`;
};

/**
 * Construye una URL para obtener animales con filtros y ordenación
 */
export const buildAnimalListUrl = (
  baseUrl: string = '/api/v1/animals',
  params: {
    page?: number;
    limit?: number;
    search?: string;
    explotacio?: string;
    genere?: string;
    estado?: string;
    sort_by?: string;
    sort_order?: SortDirection;
  } = {}
): string => {
  const urlSearchParams = new URLSearchParams();
  
  // Paginación
  if (params.page && params.page > 1) {
    const offset = ((params.page || 1) - 1) * (params.limit || 10);
    urlSearchParams.append('offset', offset.toString());
  }
  if (params.limit) urlSearchParams.append('limit', params.limit.toString());
  
  // Filtros
  if (params.search) urlSearchParams.append('search', params.search);
  if (params.explotacio) urlSearchParams.append('explotacio', params.explotacio);
  if (params.genere) urlSearchParams.append('genere', params.genere);
  if (params.estado) urlSearchParams.append('estado', params.estado);
  
  // Ordenación
  if (params.sort_by) urlSearchParams.append('sort_by', params.sort_by);
  if (params.sort_order) urlSearchParams.append('sort_order', params.sort_order);
  
  const queryString = urlSearchParams.toString();
  if (!queryString) return baseUrl;
  
  return `${baseUrl}?${queryString}`;
};
