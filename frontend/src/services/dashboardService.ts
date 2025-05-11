/**
 * Servicio para obtener datos del dashboard
 */

import { get } from './apiService';

// Interfaces para los parámetros de las peticiones
export interface DashboardParams {
  explotacioId?: number;
  startDate?: string;
  endDate?: string;
  _cache?: string; // Parámetro para evitar caché
}

// Interfaces para las respuestas
export interface AnimalStats {
  total: number;
  machos: number;
  hembras: number;
  ratio_machos_hembras: number;
  por_estado: Record<string, number>;
  por_alletar: Record<string, number>;
  por_quadra: Record<string, number>;
}

export interface PartoStats {
  total: number;
  ultimo_mes: number;
  ultimo_año: number;
  promedio_mensual: number;
  por_mes: Record<string, number>;
  tendencia_partos: {
    tendencia: number;
    promedio: number;
    valores: Record<string, number>;
  }
}

export interface DashboardResponse {
  explotacio_name?: string;
  fecha_inicio: string;
  fecha_fin: string;
  animales: AnimalStats;
  partos: PartoStats;
}

export interface ExplotacionResponse {
  id: number;
  nombre: string;
}

export interface ExplotacionDetailResponse {
  id: number;
  nombre: string;
  total_animales: number;
  total_partos: number;
  // Otros campos específicos de la explotación
}

export interface PartosResponse {
  total: number;
  por_mes: Record<string, number>;
  por_genero: Record<string, number>;
  tasas: Record<string, number>;
  // Otros campos específicos de partos
}

export interface CombinedDashboardResponse {
  resumen: DashboardResponse;
  explotaciones: ExplotacionDetailResponse[];
  partos: PartosResponse;
  // Otros datos combinados
}

// Definición de tipos para actividades
export type ActivityType = 'animal_created' | 'animal_updated' | 'parto_registered' | 'user_login' | 'system_event' | 'explotacion_updated' | string;

export interface Activity {
  id: string;
  type: string; // Mantenemos string en la respuesta de la API
  title: string;
  description: string;
  timestamp: string;
  entity_id?: number;
  entity_type?: string;
}

export interface RecentActivityResponse {
  activities: Activity[];
}

/**
 * Obtiene las estadísticas generales del dashboard
 */
export const getDashboardStats = async (params: DashboardParams = {}): Promise<DashboardResponse> => {
  console.log(' [dashboardService] Solicitando estadísticas del dashboard con parámetros:', params);
  
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir parámetros si existen
    if (params.startDate) queryParams.append('inicio', params.startDate);
    if (params.endDate) queryParams.append('fin', params.endDate);
    if (params.explotacioId) queryParams.append('explotacio_id', params.explotacioId.toString());
    
    // Añadir timestamp para evitar caché
    const cacheParam = params._cache || Date.now().toString();
    queryParams.append('_cache', cacheParam);
    
    console.log(` [dashboardService] Parámetros de consulta: ${Object.fromEntries(queryParams.entries())}`);
    
    // Usar el endpoint correcto según la documentación
    const endpoint = '/dashboard/stats';
    console.log(` [dashboardService] Usando endpoint: ${endpoint}`);
    
    const response = await get<DashboardResponse>(`${endpoint}?${queryParams.toString()}`);
    console.log(' [dashboardService] Estadísticas recibidas:', response);
    return response;
  } catch (error: any) {
    console.error(' [dashboardService] Error al obtener estadísticas del dashboard:', error);
    console.error(' [dashboardService] Detalles del error:', error.message, error.status, error.response);
    throw error;
  }
};

/**
 * Obtiene estadísticas detalladas de una explotación específica
 */
export const getExplotacionStats = async (explotacionId: number, params: DashboardParams = {}): Promise<ExplotacionDetailResponse> => {
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir parámetros si existen
    if (params.startDate) queryParams.append('inicio', params.startDate);
    if (params.endDate) queryParams.append('fin', params.endDate);
    
    // Añadir timestamp para evitar caché
    const cacheParam = params._cache || Date.now().toString();
    queryParams.append('_cache', cacheParam);
    
    console.log(` [Dashboard] Obteniendo estadísticas de la explotación ${explotacionId} con parámetros:`, Object.fromEntries(queryParams.entries()));
    
    const endpoint = `/dashboard/explotacions/${explotacionId}`;
    console.log(` [Dashboard] URL del endpoint: ${endpoint}`);
    
    const response = await get<ExplotacionDetailResponse>(`${endpoint}?${queryParams.toString()}`);
    console.log(' [Dashboard] Respuesta de explotación recibida correctamente:', response);
    
    return response;
  } catch (error: any) {
    console.error(` [Dashboard] Error al obtener estadísticas de la explotación ${explotacionId}:`, error);
    
    // Registrar información detallada del error para depuración
    if (error.status) {
      console.error(` [Dashboard] Código de estado HTTP: ${error.status}`);
    }
    if (error.message) {
      console.error(` [Dashboard] Mensaje de error: ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Obtiene la lista de explotaciones disponibles
 */
export const getExplotaciones = async (_cache?: string): Promise<ExplotacionResponse[]> => {
  console.log(' [dashboardService] Solicitando lista de explotaciones');
  
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir timestamp para evitar caché
    const cacheParam = _cache || Date.now().toString();
    queryParams.append('_cache', cacheParam);
    
    // Usar el endpoint correcto según la documentación
    const endpoint = '/dashboard/explotacions';
    console.log(` [dashboardService] Usando endpoint: ${endpoint}`);
    
    const response = await get<ExplotacionResponse[]>(`${endpoint}?${queryParams.toString()}`);
    console.log(' [dashboardService] Explotaciones recibidas:', response);
    return response;
  } catch (error: any) {
    console.error(' [dashboardService] Error al obtener explotaciones:', error);
    console.error(' [dashboardService] Detalles del error:', error.message, error.status, error.response);
    throw error;
  }
};

/**
 * Obtiene un resumen general del dashboard
 */
export const getDashboardResumen = async (_cache?: string): Promise<DashboardResponse> => {
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir timestamp para evitar caché
    const cacheParam = _cache || Date.now().toString();
    queryParams.append('_cache', cacheParam);
    
    console.log(' [Dashboard] Iniciando solicitud de resumen');
    
    const endpoint = '/dashboard/resumen';
    console.log(` [Dashboard] URL del endpoint: ${endpoint}`);
    
    const response = await get<DashboardResponse>(`${endpoint}?${queryParams.toString()}`);
    console.log(' [Dashboard] Resumen recibido correctamente:', response);
    
    return response;
  } catch (error: any) {
    console.error(' [Dashboard] Error al obtener resumen del dashboard:', error);
    
    // Registrar información detallada del error para depuración
    if (error.status) {
      console.error(` [Dashboard] Código de estado HTTP: ${error.status}`);
    }
    if (error.message) {
      console.error(` [Dashboard] Mensaje de error: ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Obtiene estadísticas de partos
 */
export const getPartosStats = async (params: DashboardParams = {}): Promise<PartosResponse> => {
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir parámetros si existen
    if (params.startDate) queryParams.append('inicio', params.startDate);
    if (params.endDate) queryParams.append('fin', params.endDate);
    if (params.explotacioId) queryParams.append('explotacio_id', params.explotacioId.toString());
    
    // Añadir timestamp para evitar caché
    const cacheParam = params._cache || Date.now().toString();
    queryParams.append('_cache', cacheParam);
    
    console.log(' [Dashboard] Iniciando solicitud de estadísticas de partos');
    console.log(` [Dashboard] Parámetros: ${Object.fromEntries(queryParams.entries())}`);
    
    const endpoint = '/dashboard/partos';
    console.log(` [Dashboard] URL del endpoint: ${endpoint}`);
    
    const response = await get<PartosResponse>(`${endpoint}?${queryParams.toString()}`);
    console.log(' [Dashboard] Estadísticas de partos recibidas correctamente:', response);
    
    return response;
  } catch (error: any) {
    console.error(' [Dashboard] Error al obtener estadísticas de partos:', error);
    
    // Registrar información detallada del error para depuración
    if (error.status) {
      console.error(` [Dashboard] Código de estado HTTP: ${error.status}`);
    }
    if (error.message) {
      console.error(` [Dashboard] Mensaje de error: ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Obtiene datos combinados del dashboard
 */
export const getCombinedDashboard = async (params: DashboardParams = {}): Promise<CombinedDashboardResponse> => {
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir parámetros si existen
    if (params.startDate) queryParams.append('inicio', params.startDate);
    if (params.endDate) queryParams.append('fin', params.endDate);
    if (params.explotacioId) queryParams.append('explotacio_id', params.explotacioId.toString());
    
    // Añadir timestamp para evitar caché
    const cacheParam = params._cache || Date.now().toString();
    queryParams.append('_cache', cacheParam);
    
    console.log(' [Dashboard] Iniciando solicitud de dashboard combinado');
    console.log(` [Dashboard] Parámetros: ${Object.fromEntries(queryParams.entries())}`);
    
    const endpoint = '/dashboard/combined';
    console.log(` [Dashboard] URL del endpoint: ${endpoint}`);
    
    const response = await get<CombinedDashboardResponse>(`${endpoint}?${queryParams.toString()}`);
    console.log(' [Dashboard] Dashboard combinado recibido correctamente:', response);
    
    return response;
  } catch (error: any) {
    console.error(' [Dashboard] Error al obtener dashboard combinado:', error);
    
    // Registrar información detallada del error para depuración
    if (error.status) {
      console.error(` [Dashboard] Código de estado HTTP: ${error.status}`);
    }
    if (error.message) {
      console.error(` [Dashboard] Mensaje de error: ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Obtiene actividades recientes
 */
export const getRecentActivities = async (_cache?: string, limit: number = 5): Promise<RecentActivityResponse> => {
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir parámetros
    queryParams.append('limit', limit.toString());
    
    // Añadir timestamp para evitar caché
    const cacheParam = _cache || Date.now().toString();
    queryParams.append('_cache', cacheParam);
    
    console.log(' [Dashboard] Iniciando solicitud de actividades recientes');
    console.log(` [Dashboard] Parámetros: ${Object.fromEntries(queryParams.entries())}`);
    
    const endpoint = '/dashboard/recientes';
    console.log(` [Dashboard] URL del endpoint: ${endpoint}`);
    
    const response = await get<RecentActivityResponse>(`${endpoint}?${queryParams.toString()}`);
    console.log(' [Dashboard] Actividades recientes recibidas correctamente:', response);
    
    return response;
  } catch (error: any) {
    console.error(' [Dashboard] Error al obtener actividades recientes:', error);
    
    // Registrar información detallada del error para depuración
    if (error.status) {
      console.error(` [Dashboard] Código de estado HTTP: ${error.status}`);
    }
    if (error.message) {
      console.error(` [Dashboard] Mensaje de error: ${error.message}`);
    }
    
    throw error;
  }
};
