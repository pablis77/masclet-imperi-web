/**
 * Servicio para obtener datos reales del dashboard
 * Usa los endpoints ya existentes en el backend 
 * Implementado con mismo patrón que animalService.ts para garantizar compatibilidad
 */

// Importar funciones básicas del servicio API
import { get, post, put, del, patch } from './apiService';

// Constantes para gestión de errores
const ERROR_TIMEOUT = 15000; // 15 segundos

// Función para invocar endpoints con log detallado y gestión de errores
async function callDashboardEndpoint(endpoint, params = {}) {
  try {
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir todos los parámetros proporcionados
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    // Añadir timestamp para evitar caché
    queryParams.append('_cache', new Date().getTime().toString());
    
    // Construir URL completa con parámetros
    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    console.log(`[Dashboard API] Llamando a: ${url}`);
    
    // Configurar timeout para evitar esperas infinitas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ERROR_TIMEOUT);
    
    // Usar la función get importada de apiService (igual que en animalService)
    const response = await get(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    console.log(`[Dashboard API] Respuesta recibida:`, response);
    
    return response;
  } catch (error) {
    console.error(`[Dashboard API ERROR] ${error.message || 'Error desconocido'}`);
    console.error(`Error en llamada a endpoint: ${endpoint}`, error);
    
    // Construir respuesta de error detallada
    const errorDetails = {
      error: true,
      message: error.message || 'Error de comunicación con el backend',
      code: error.code || 'UNKNOWN_ERROR',
      endpoint
    };
    
    // Re-lanzar el error con detalles para el componente
    throw errorDetails;
  }
}

// Servicio para el dashboard real - implementado con mismo patrón que animalService
const realDashboardService = {
  /**
   * Obtiene las estadísticas generales del dashboard
   * @param {Object} filters Filtros como explotacio, start_date, end_date
   */
  async getStats(filters = {}) {
    try {
      // Llamar igual que se hace en animalService.getAnimals
      return await callDashboardEndpoint('/dashboard/stats', filters);
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw error; // Propagar el error para que el componente lo maneje
    }
  },
  
  /**
   * Obtiene el resumen del dashboard
   * @param {Object} filters Filtros como explotacio, start_date, end_date
   */
  async getResumen(filters = {}) {
    try {
      return await callDashboardEndpoint('/dashboard/resumen', filters);
    } catch (error) {
      console.error('Error al obtener resumen del dashboard:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene las estadísticas de partos
   * @param {Object} filters Filtros como explotacio, start_date, end_date
   */
  async getPartos(filters = {}) {
    try {
      return await callDashboardEndpoint('/dashboard/partos', filters);
    } catch (error) {
      console.error('Error al obtener estadísticas de partos:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene todas las estadísticas combinadas del dashboard
   * @param {Object} filters Filtros como explotacio, start_date, end_date
   */
  async getCombined(filters = {}) {
    try {
      return await callDashboardEndpoint('/dashboard/combined', filters);
    } catch (error) {
      console.error('Error al obtener estadísticas combinadas:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene información de todas las explotaciones
   */
  async getAllExplotacions() {
    try {
      return await callDashboardEndpoint('/explotacions');
    } catch (error) {
      console.error('Error al obtener lista de explotaciones:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene información de un animal específico
   * @param {number} id Identificador del animal
   */
  async getAnimalById(id) {
    try {
      return await callDashboardEndpoint(`/animals/${id}`);
    } catch (error) {
      console.error(`Error al obtener información del animal ${id}:`, error);
      throw error;
    }
  }
};

// Crear funciones de nivel superior para exportar directamente
export async function getFullDashboardStats(filters = {}) {
  console.log('Llamando getFullDashboardStats directamente');
  return await get('/dashboard/stats');
}

export async function getDashboardResumen(filters = {}) {
  console.log('Llamando getDashboardResumen directamente');
  return await get('/dashboard/resumen');
}

export async function getPartosStats(filters = {}) {
  console.log('Llamando getPartosStats directamente');
  return await get('/dashboard/partos');
}

export async function getCombinedStats(filters = {}) {
  console.log('Llamando getCombinedStats directamente');
  return await get('/dashboard/combined');
}

export async function getAllExplotacions() {
  console.log('Llamando getAllExplotacions directamente');
  return await get('/explotacions');
}

export async function getAnimalById(id) {
  console.log(`Llamando getAnimalById(${id}) directamente`);
  return await get(`/animals/${id}`);
}

// Exportar el objeto completo como default (opcional)
export default realDashboardService;
