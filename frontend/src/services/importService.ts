// Servicio para gestionar las importaciones

// Importar configuración centralizada
import apiConfig from '../config/apiConfig';

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

/**
 * Obtener token de autenticación
 */
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
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

// Servicio de importaciones
const importService = {
  /**
   * Obtiene el historial de importaciones con filtros opcionales
   * @param filters Filtros a aplicar (opcionales)
   */
  async getImportHistory(filters: ImportHistoryFilters = {}): Promise<ImportHistoryResponse> {
    try {
      // Usar la URL del backend de configuración centralizada
      const BACKEND_URL = apiConfig.backendURL;
      
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
      
      // Token de desarrollo
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token_for_development'
      };
      
      // Llamar al endpoint
      const response = await fetch(`${BACKEND_URL}/api/v1/imports?${queryParams.toString()}`, {
        method: 'GET',
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          items: data.items || [],
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 10,
          totalPages: data.total_pages || 1
        };
      }
      
      console.error('Error al obtener historial de importaciones:', {
        status: response.status,
        statusText: response.statusText
      });
      
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      };
    } catch (error: any) {
      console.error('Error general al obtener historial de importaciones:', error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      };
    }
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
      
      // Obtener token de autenticación
      const token = getAuthToken();
      console.log('Token de autenticación:', token ? 'Presente' : 'No hay token');
      
      // Configurar headers con token de autenticación
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Para desarrollo, usar token de desarrollo
        headers['Authorization'] = 'Bearer test_token_for_development';
        console.log('Usando token de desarrollo para pruebas');
      }
      
      // Extraer información del archivo para depuración
      let fileInfo = 'FormData sin archivo';
      const fileEntry = formData.get('file');
      if (fileEntry instanceof File) {
        fileInfo = `Archivo: ${fileEntry.name}, ${fileEntry.size} bytes, tipo: ${fileEntry.type}`;
      }
      
      // Usar la URL del backend de configuración centralizada
      const BACKEND_URL = apiConfig.backendURL;
      console.log('Enviando petición directa al backend:', `${BACKEND_URL}/api/v1/imports/csv`);
      console.log('Contenido del FormData:', fileInfo);
      
      // Usar directamente la URL absoluta al backend en lugar de depender del proxy
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/imports/csv`, {
          method: 'POST',
          body: formData,
          headers: headers
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Respuesta exitosa desde el backend:', data);
          return data;
        }
        
        const errorText = await response.text();
        console.error('Error en la petición al backend:', {
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
        console.error('Error en la petición fetch:', fetchError);
        return {
          success: false,
          message: `Error de red: ${fetchError.message}`,
          total_processed: 0,
          total_imported: 0,
          total_errors: 1,
          errors: ['Error de conexión con el servidor']
        };
      }
    } catch (error: any) {
      console.error('Error general al importar animales:', error);
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
