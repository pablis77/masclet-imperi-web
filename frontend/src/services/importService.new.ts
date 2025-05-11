// Servicio para gestionar las importaciones
import { ImportResult, ImportStatus } from '../types/imports';

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

// Servicio de importaciones
const importService = {
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
      
      // URLs para intentar
      const BACKEND_URL = 'http://localhost:8000';
      console.log('Enviando petición al endpoint con URL relativa: /api/v1/imports/csv');
      console.log('Contenido del FormData:', fileInfo);
      
      // Primero intentamos con la URL relativa (a través del proxy)
      try {
        const response = await fetch('/api/v1/imports/csv', {
          method: 'POST',
          body: formData,
          headers: headers
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Respuesta exitosa con URL relativa:', data);
          return data;
        }
        
        const errorText = await response.text();
        console.error('Error con URL relativa:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Si tenemos un 404, intentamos con URL absoluta
        if (response.status === 404) {
          console.log('Intentando con URL absoluta como alternativa...');
          const directResponse = await fetch(`${BACKEND_URL}/api/v1/imports/csv`, {
            method: 'POST',
            body: formData,
            headers: headers
          });
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('Respuesta exitosa con URL directa:', directData);
            return directData;
          }
          
          const directErrorText = await directResponse.text();
          console.error('Error también con URL directa:', {
            status: directResponse.status,
            statusText: directResponse.statusText,
            error: directErrorText
          });
          
          return {
            success: false,
            message: `Error HTTP ${directResponse.status}: ${directResponse.statusText}`,
            total_processed: 0,
            total_imported: 0,
            total_errors: 1,
            errors: [`Fallo al comunicarse con el backend: ${directResponse.status}`]
          };
        }
        
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
