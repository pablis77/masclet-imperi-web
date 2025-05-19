/**
 * Servicio para gestionar backups del sistema
 */

// URL base de la API
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';

console.log('BackupService inicializado - URL de API:', API_URL);

/**
 * Obtiene la lista de backups disponibles
 * @returns {Promise<Array>} Lista de backups
 */
export async function getBackupsList() {
  try {
    const response = await fetch(`${API_URL}/backup/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener la lista de backups');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getBackupsList:', error);
    throw error;
  }
}

/**
 * Crea un nuevo backup del sistema
 * @param {Object} options Opciones de backup
 * @returns {Promise<Object>} Información del backup creado
 */
export async function createBackup(options = {}) {
  try {
    const response = await fetch(`${API_URL}/backup/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(options),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al crear el backup');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createBackup:', error);
    throw error;
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
      },
      credentials: 'include'
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
      },
      credentials: 'include'
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
