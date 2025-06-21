// Servicio para gestionar las importaciones

// Importar servicios y configuraciones CENTRALIZADAS (como las demás páginas)
import { apiService } from './apiService.centralizado';
import { getApiBaseUrl } from '../config/apiConfig.centralizado';

// Interfaces y tipos
export interface ImportResult {
  // Campos originales de la interfaz
  success: boolean;
  message: string;
  total_processed?: number;
  total_imported?: number;
  total_errors?: number;
  errors?: string[];
  imported_ids?: number[];
  
  // Campos adicionales que devuelve el backend
  id?: number;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  records_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Estados posibles de una importación
export enum ImportStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

// Interfaces para el historial de importaciones
export interface ImportHistoryItem {
  id: number;
  filename: string;
  user_id: number;
  user_name?: string;
  import_type: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  status: 'completed' | 'failed' | 'processing' | 'pending';
  created_at: string;
  updated_at: string;
}

/**
 * Verifica si el usuario está autenticado y tiene permisos para importar
 */
const checkAuthStatus = (): { isAuthenticated: boolean; canImport: boolean; message: string } => {
  // En desarrollo asumimos que el usuario está autenticado y tiene permiso
  return { 
    isAuthenticated: true,
    canImport: true,
    message: ''
  };
};

// Interfaces para filtros de historial
export interface ImportHistoryFilters {
  status?: ImportStatus;
  startDate?: string;
  endDate?: string;
  fileName?: string;
  page?: number;
  limit?: number;
}

// Respuesta paginada del historial
export interface ImportHistoryResponse {
  items: ImportHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Rate limiting global para evitar múltiples llamadas
class RateLimiter {
  private lastCallTime: number = 0;
  private readonly minInterval: number = 2000; // 2 segundos mínimo entre llamadas
  private pendingCall: Promise<any> | null = null;

  async executeWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    // Si hay una llamada pendiente, esperar a que termine
    if (this.pendingCall) {
      console.log('[RateLimiter] Esperando llamada pendiente...');
      try {
        await this.pendingCall;
      } catch (e) {
        // Ignorar errores de llamadas pendientes
      }
    }

    // Si no ha pasado suficiente tiempo, esperar
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      console.log(`[RateLimiter] Esperando ${waitTime}ms antes de la siguiente llamada`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastCallTime = Date.now();
    this.pendingCall = fn();

    try {
      const result = await this.pendingCall;
      this.pendingCall = null;
      return result;
    } catch (error) {
      this.pendingCall = null;
      throw error;
    }
  }
}

// Instancia global del rate limiter
const rateLimiter = new RateLimiter();

// Servicio de importaciones
const importService = {
  /**
   * Obtiene el historial de importaciones con filtros opcionales
   * @param filters Filtros a aplicar (opcionales)
   */
  async getImportHistory(filters: ImportHistoryFilters = {}): Promise<ImportHistoryResponse> {
    return rateLimiter.executeWithRateLimit(async () => {
      try {
        // Construir query string para los filtros
        const queryParams = new URLSearchParams();
        
        if (filters.status) {
          queryParams.append('status', filters.status);
        }
        
        if (filters.startDate) {
          queryParams.append('start_date', filters.startDate);
        }
        
        if (filters.endDate) {
          queryParams.append('end_date', filters.endDate);
        }
        
        if (filters.fileName) {
          queryParams.append('file_name', filters.fileName);
        }
        
        // Paginación
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        console.log(`[ImportService] Consultando historial de importaciones con sistema centralizado`);
        
        // USAR SISTEMA CENTRALIZADO como las demás páginas
        const endpoint = `/imports/?${queryParams.toString()}`;
        const response = await apiService.get(endpoint);
        
        // El sistema centralizado devuelve directamente los datos
        if (response && response.items) {
          return {
            items: response.items || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.size || 10, // En la API se llama 'size', no 'limit'
            totalPages: response.totalPages || 1
          };
        } else {
          console.warn('Respuesta vacía o sin formato esperado:', response);
          return {
            items: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1
          };
        }
      } catch (error: any) {
        console.error('Error al obtener historial de importaciones:', error);
        
        // Manejo específico para diferentes tipos de error
        if (error.response?.status === 429) {
          console.warn('Rate limit excedido, devolviendo respuesta vacía temporal');
          return {
            items: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1
          };
        }
        
        return {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1
        };
      }
    });
  },
  
  /**
   * Importa animales desde un archivo CSV
   * @param formData FormData con el archivo y parámetros adicionales
   */
  async importAnimals(formData: FormData): Promise<ImportResult> {
    try {
      // Verificar autenticación
      const authStatus = checkAuthStatus();
      if (!authStatus.isAuthenticated || !authStatus.canImport) {
        return {
          success: false,
          message: authStatus.message,
          total_processed: 0,
          total_imported: 0,
          total_errors: 1,
          errors: [authStatus.message]
        };
      }
      
      // Extraer información del archivo para depuración
      let fileInfo = 'FormData sin archivo';
      const fileEntry = formData.get('file');
      if (fileEntry instanceof File) {
        fileInfo = `Archivo: ${fileEntry.name}, ${fileEntry.size} bytes, tipo: ${fileEntry.type}`;
      }
      
      console.log('[ImportService] Enviando petición de importación...');
      console.log('[ImportService] Contenido del FormData:', fileInfo);
      
      // USAR SISTEMA CENTRALIZADO como las demás páginas
      try {
        console.log('[ImportService] Usando sistema centralizado (apiService.centralizado)');
        
        // El sistema centralizado maneja automáticamente headers, auth y rutas
        const response = await apiService.post('/imports/csv', formData);
        
        console.log('[ImportService] Respuesta exitosa desde sistema centralizado:', response);
        return response;
        
      } catch (centralizedError: any) {
        console.error('[ImportService] Error en sistema centralizado:', centralizedError);
        
        // Si el sistema centralizado falla, usar método directo como backup para compatibilidad local
        console.log('[ImportService] Intentando método directo como backup...');
        
        const baseUrl = getApiBaseUrl();
        const directUrl = baseUrl.includes('/v1') 
          ? `${baseUrl}/imports/csv`  // Si baseUrl ya tiene /v1, no duplicar
          : `${baseUrl}/api/v1/imports/csv`;  // Si no, añadir la ruta completa
        
        console.log('[ImportService] Backup: URL directa:', directUrl);
        
        try {
          const response = await fetch(directUrl, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token_for_development'}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('[ImportService] Backup: Respuesta exitosa:', data);
            return data;
          }
          
          const errorText = await response.text();
          console.error('[ImportService] Backup: Error en petición:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          
          return {
            success: false,
            message: `Error HTTP ${response.status}: ${response.statusText}`,
            total_processed: 0,
            total_imported: 0,
            total_errors: 1,
            errors: [`Fallo al comunicarse con el backend: ${response.status}`]
          };
          
        } catch (fetchError: any) {
          console.error('[ImportService] Backup: Error en fetch:', fetchError);
          return {
            success: false,
            message: `Error de red: ${fetchError.message}`,
            total_processed: 0,
            total_imported: 0,
            total_errors: 1,
            errors: ['Error de conexión con el servidor']
          };
        }
      }
    } catch (error: any) {
      console.error('[ImportService] Error general al importar animales:', error);
      return {
        success: false,
        message: error.message || 'Error desconocido al importar animales',
        total_processed: 0,
        total_imported: 0,
        total_errors: 1,
        errors: [error.message || 'Error desconocido']
      };
    }
  },

  /**
   * Descarga la plantilla de animales
   */
  async downloadAnimalTemplate(): Promise<Blob> {
    try {
      // Datos de ejemplo para la plantilla
      const exampleData = [
        { 
          nom: 'NOMBRE_ANIMAL', 
          genere: 'F', 
          estado: 'OK', 
          alletar: '0',
          mare: 'NOMBRE_MADRE',
          pare: 'NOMBRE_PADRE',
          quadra: 'NOMBRE_CUADRA',
          cod: 'CODIGO',
          num_serie: 'NUMERO_SERIE',
          dob: 'DD/MM/YYYY'
        }
      ];
      
      // Convertir a CSV
      const headers = Object.keys(exampleData[0]).join(',');
      const rows = exampleData.map(item => Object.values(item).join(','));
      const csvContent = [headers, ...rows].join('\n');
      
      // Crear blob
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    } catch (error: any) {
      console.error('Error al generar plantilla:', error);
      throw error;
    }
  },

  /**
   * Descarga la plantilla de partos
   */
  async downloadPartoTemplate(): Promise<Blob> {
    try {
      // Datos de ejemplo para la plantilla
      const exampleData = [
        { 
          nom_animal: 'NOMBRE_VACA', 
          date_part: 'DD/MM/YYYY', 
          genere_t: 'M', 
          estado_t: 'OK'
        }
      ];
      
      // Convertir a CSV
      const headers = Object.keys(exampleData[0]).join(',');
      const rows = exampleData.map(item => Object.values(item).join(','));
      const csvContent = [headers, ...rows].join('\n');
      
      // Crear blob
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    } catch (error: any) {
      console.error('Error al generar plantilla:', error);
      throw error;
    }
  }
};

export default importService;