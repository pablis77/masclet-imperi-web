// Servicio para gestionar las importaciones
import { get, post, del } from './apiService';
import { mockImportHistory } from './mockData';

// URL base para las peticiones API utilizando el proxy configurado en Astro
const API_PATH = '/api/v1';

// Interfaces
export interface ImportResult {
  success: boolean;
  message: string;
  total_processed?: number;
  total_imported?: number;
  total_errors?: number;
  errors?: string[];
  imported_ids?: number[];
}

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

export interface ImportHistoryFilters {
  status?: string;
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

// Enumeración para estados de importación (debe coincidir con el backend)
export enum ImportStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

/**
 * Verifica si el usuario está autenticado y tiene permisos para importar
 */
export const checkAuthStatus = (): { isAuthenticated: boolean; canImport: boolean; message: string } => {
  // Desactivamos verificaciones para desarrollo
  return { 
    isAuthenticated: true, 
    canImport: true, 
    message: 'Usuario autenticado con permisos para importar.' 
  };
};

// Función para crear un archivo CSV con datos
export const createCsvFile = (data: any[], headers: string[]): Blob => {
  // Crear contenido CSV con separador ;
  let csvContent = headers.join(';') + '\n';
  
  // Añadir filas
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] !== undefined ? row[header] : '';
      // Escapar punto y coma y comillas
      if (typeof value === 'string' && (value.includes(';') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += values.join(';') + '\n';
  });
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

// Obtener JWT token del localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

// Servicio de importaciones
const importService = {
  /**
   * Importa animales desde un archivo CSV
   */
  async importAnimals(file: File): Promise<ImportResult> {
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
      console.log('Token de autenticación:', token ? `${token.substring(0, 10)}...` : 'No hay token');
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', 'Importación de animales');
      
      // Realizar petición directamente con fetch para evitar problemas con axios
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Enviando petición al endpoint:', `${API_PATH}/imports/csv`);
      console.log('Tamaño del archivo:', file.size, 'bytes');
      console.log('Tipo del archivo:', file.type);
      console.log('Nombre del archivo:', file.name);
      console.log('Headers:', JSON.stringify(headers));
      
      // Usamos la ruta relativa que pasará por el proxy configurado en Astro
      const response = await fetch(`${API_PATH}/imports/csv`, {
        method: 'POST',
        body: formData,
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta HTTP:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Verificar si es un error de autenticación
        if (response.status === 401 || response.status === 403) {
          console.error('Error de autenticación. Puede ser necesario iniciar sesión de nuevo.');
          // Intentar verificar si hay token en localStorage
          try {
            const storedToken = localStorage.getItem('auth_token');
            console.log('Token en localStorage:', storedToken ? 'Presente' : 'No existe');
          } catch (e) {
            console.error('Error al acceder a localStorage:', e);
          }
        }
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}. Detalle: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Respuesta del servidor:', JSON.stringify(data, null, 2));
      
      // Transformar la respuesta al formato esperado por la interfaz
      return {
        success: data.status === ImportStatus.COMPLETED && data.result?.errors === 0,
        message: data.result?.errors === 0 
          ? `Importación completada con éxito. Se importaron ${data.result?.success} animales.` 
          : `Importación completada con advertencias. Se importaron ${data.result?.success} animales, pero hubo ${data.result?.errors} errores.`,
        total_processed: data.result?.total || 0,
        total_imported: data.result?.success || 0,
        total_errors: data.result?.errors || 0,
        errors: data.result?.error_details?.map((detail: any) => 
          `Fila ${detail.row}: ${detail.error}`
        ) || [],
      };
    } catch (error: any) {
      console.error('Error al importar animales:', error);
      
      let errorMessage = 'Error desconocido';
      let errorDetails: string[] = [];
      
      if (error instanceof Error) {
        errorMessage = error.message || 'Error sin mensaje';
        errorDetails = [error.stack || error.toString()];
      } else if (typeof error === 'string') {
        errorMessage = error;
        errorDetails = [error];
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
          errorDetails = Object.entries(error).map(([key, value]) => `${key}: ${value}`);
        } catch (e) {
          errorMessage = 'Error al serializar el objeto de error';
          errorDetails = ['No se pudieron obtener detalles del error'];
        }
      }
      
      // Devolver un objeto de resultado con error
      return {
        success: false,
        message: `Error al importar: ${errorMessage}`,
        total_processed: 0,
        total_imported: 0,
        total_errors: 1,
        errors: errorDetails
      };
    }
  },

  /**
   * Descarga la plantilla CSV para importación de animales
   */
  async downloadAnimalTemplate(): Promise<Blob> {
    try {
      // Crear plantilla de ejemplo
      const headers = ['nom', 'genere', 'estado', 'alletar', 'mare', 'pare', 'quadra', 'cod', 'num_serie', 'data_naixement'];
      const exampleData = [
        {
          nom: 'Ejemplo',
          genere: 'M',
          estado: 'VIVO',
          alletar: '1',
          mare: 'Madre Ejemplo',
          pare: 'Padre Ejemplo',
          quadra: 'A1',
          cod: 'ABCD123',
          num_serie: 'SN12345',
          data_naixement: '01/01/2020'
        }
      ];
      
      return createCsvFile(exampleData, headers);
    } catch (error) {
      console.error('Error al crear plantilla de animales:', error);
      throw error;
    }
  },

  /**
   * Descarga la plantilla CSV para importación de partos
   */
  async downloadPartoTemplate(): Promise<Blob> {
    try {
      // Crear plantilla de ejemplo
      const headers = ['nom_animal', 'date_part', 'genere_t', 'estado_t'];
      const exampleData = [
        {
          nom_animal: 'Nombre del Animal',
          date_part: '01/01/2020',
          genere_t: 'M',
          estado_t: 'VIVO'
        }
      ];
      
      return createCsvFile(exampleData, headers);
    } catch (error) {
      console.error('Error al crear plantilla de partos:', error);
      throw error;
    }
  }
};

export default importService;
// Exportar funciones individuales para usar con componentes
export const { 
  importAnimals,
  downloadAnimalTemplate,
  downloadPartoTemplate
} = importService;
