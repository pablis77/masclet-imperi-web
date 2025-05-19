/**
 * Utilidades para comunicación con la API
 */

// URL relativa para funcionar con el proxy en producción y desarrollo
const API_BASE_URL = '/api/v1';

/**
 * Realiza una petición PATCH para actualizar parcialmente un animal
 * @param {number} animalId - ID del animal a actualizar
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Respuesta de la API
 */
export async function updateAnimal(animalId, datos) {
  console.log(`Enviando petición PATCH a: ${API_BASE_URL}/animals/${animalId}`);
  
  try {
    // Obtener token de localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    console.log('Datos a enviar:', JSON.stringify(datos, null, 2));
    
    // Usar fetch directamente como en test_patch.py
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    });
    
    console.log('Respuesta del servidor:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const responseData = await response.json();
    return responseData.data || responseData;
  } catch (error) {
    console.error('Error en la petición PATCH:', error);
    throw error;
  }
}

/**
 * Obtiene un animal por su ID
 * @param {number} animalId - ID del animal
 * @returns {Promise<Object>} - Datos del animal
 */
export async function getAnimal(animalId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const responseData = await response.json();
    return responseData.data || responseData;
  } catch (error) {
    console.error('Error al obtener animal:', error);
    throw error;
  }
}
