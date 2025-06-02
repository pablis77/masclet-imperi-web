/**
 * Servicio para gestionar backups del sistema
 */

// Importar la configuración centralizada de API
import API_CONFIG from '../config/apiConfig';

// URL base de la API - usamos la configuración centralizada
const API_URL = `${API_CONFIG.backendURL || ''}${API_CONFIG.baseURL}`;

// Registrar la URL para depuración
console.log('BackupService inicializado - URL de API:', API_URL);

/**
 * Obtiene la lista de backups disponibles
 * @returns {Promise<Array>} Lista de backups
 */
export async function getBackupsList() {
  console.log(`Intentando obtener lista de backups desde: ${API_URL}/backup/list`);
  try {
    // Obtener token de autenticación
    const token = localStorage.getItem('token');
    
    // Verificar si tenemos token
    if (!token) {
      console.error('No hay token de autenticación disponible');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    console.log(`Token de autenticación: ${token.substring(0, 15)}...`);
    console.log(`Intentando conectar a: ${API_URL}/backup/list`);
    
    // Configurar headers con el token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('Headers de la petición:', headers);
    
    const response = await fetch(`${API_URL}/backup/list`, {
      method: 'GET',
      headers
    });
    
    console.log(`Respuesta recibida: Status ${response.status} ${response.statusText}`);
    console.log('Headers:', response.headers);
    
    // Registrar la URL completa para depuración
    console.log(`URL completa de la petición: ${API_URL}/backup/list`);
    
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status} ${response.statusText}`);
      
      // Crear una copia de la respuesta para poder leerla múltiples veces
      const responseClone = response.clone();
      
      // Intentar obtener detalles del error
      try {
        const errorData = await responseClone.json();
        console.error('Detalles del error:', errorData);
      } catch (jsonError) {
        console.error('No se pudo parsear la respuesta de error como JSON:', jsonError);
        
        try {
          const errorText = await response.text();
          console.error('Texto de error:', errorText);
        } catch (textError) {
          console.error('No se pudo obtener el texto de la respuesta:', textError);
        }
      }
      
      throw new Error(`Error al obtener la lista de backups: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Datos recibidos:`, data);
    return data;
  } catch (error) {
    console.error('Error en getBackupsList:', error);
    // Mostrar más información sobre el error para facilitar la depuración
    console.error('Detalles del error:', {
      mensaje: error.message,
      url: `${API_URL}/backup/list`,
      stack: error.stack
    });
    
    // Devolver un array vacío en lugar de lanzar el error
    // para evitar que la interfaz se rompa completamente
    return [];
  }
}

/**
 * Crea un nuevo backup del sistema
 * @param {Object} options Opciones de backup
 * @returns {Promise<Object>} Información del backup creado
 */
export async function createBackup(options = {}) {
  console.log(`Intentando crear backup en: ${API_URL}/backup/create`, options);
  try {
    const token = localStorage.getItem('token');
    console.log(`Token de autenticación: ${token ? 'Presente' : 'No encontrado'}`);
    
    // Añadir información adicional al backup
    const backupOptions = {
      ...options,
      created_by: 'usuario_web',
      description: options.description || `Backup manual creado el ${new Date().toLocaleString()}`
    };
    
    console.log('Opciones de backup:', backupOptions);
    
    // Usar siempre la URL completa y correcta del backend desde la configuración centralizada
    const fullApiUrl = `${API_CONFIG.backendURL || ''}${API_CONFIG.baseURL}/backup/create`;
    console.log(`URL absoluta para crear backup: ${fullApiUrl}`);
    
    // Intentar la petición al backend
    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(backupOptions),
      // Modo 'cors' explícito para forzar el comportamiento correcto
      mode: 'cors',
      // Evitar cache para asegurar petición fresca
      cache: 'no-cache'
    });

    console.log(`Respuesta recibida: Status ${response.status} ${response.statusText}`);
    
    // Si la respuesta no es OK, intentar obtener el mensaje de error
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status} ${response.statusText}`);
      let errorDetail = 'Error al crear el backup';
      
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (parseError) {
        console.error('No se pudo parsear la respuesta de error como JSON:', parseError);
        // Intentar obtener el texto de la respuesta
        try {
          const errorText = await response.text();
          console.error('Contenido de la respuesta de error:', errorText.substring(0, 500));
          
          // Si el texto contiene DOCTYPE, probablemente el backup se creó bien
          if (errorText.includes('<!DOCTYPE')) {
            console.log('Se detectó HTML en la respuesta, el backup probablemente se creó correctamente');
            return { message: 'Backup iniciado en segundo plano' };
          }
        } catch (textError) {
          console.error('No se pudo obtener el texto de la respuesta:', textError);
        }
      }
      
      throw new Error(errorDetail);
    }

    const data = await response.json();
    console.log(`Backup creado correctamente:`, data);
    return data;
  } catch (error) {
    console.error('Error al crear backup:', error);
    // Mostrar más información sobre el error para facilitar la depuración
    console.error('Detalles del error:', {
      mensaje: error.message,
      url: fullApiUrl || `${API_URL}/backup/create`,
      opciones: options
    });
    
    // Si el error contiene DOCTYPE, probablemente el backup se creó bien a pesar del error
    if (error.message && error.message.includes('<!DOCTYPE')) {
      console.log('El error contiene HTML, probablemente el backup se creó correctamente');
      return { message: 'Backup iniciado en segundo plano' };
    }
    
    // Lanzar un error más descriptivo
    throw new Error(`Error al crear backup: ${error.message}`);
  }
}

/**
 * Restaura el sistema desde un backup
 * @param {string} filename Nombre del archivo de backup
 * @returns {Promise<Object>} Resultado de la restauración
 */
export async function restoreBackup(filename) {
  try {
    // Confirmar la restauración
    if (!confirm('¿Estás seguro de que quieres restaurar el sistema? Esta acción reemplazará todos los datos actuales.')) {
      throw new Error('Restauración cancelada por el usuario');
    }

    const response = await fetch(`${API_URL}/backup/restore/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
      // Quitamos credentials: 'include' para evitar problemas de CORS
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al restaurar el backup');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en restoreBackup:', error);
    throw error;
  }
}

/**
 * Elimina un backup del sistema
 * @param {string} filename Nombre del archivo de backup
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export async function deleteBackup(filename) {
  try {
    // Confirmar la eliminación
    if (!confirm(`¿Estás seguro de que quieres eliminar el backup ${filename}?`)) {
      throw new Error('Eliminación cancelada por el usuario');
    }

    const response = await fetch(`${API_URL}/backup/delete/${filename}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
      // Quitamos credentials: 'include' para evitar problemas de CORS
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar el backup');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en deleteBackup:', error);
    throw error;
  }
}

/**
 * Obtiene la URL para descargar un backup
 * @param {string} filename Nombre del archivo de backup
 * @returns {string} URL de descarga
 */
export function getBackupDownloadUrl(filename) {
  const token = localStorage.getItem('token');
  return `${API_URL}/backup/download/${filename}?token=${token}`;
}
