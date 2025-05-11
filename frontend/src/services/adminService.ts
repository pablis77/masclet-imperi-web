// Servicio para funciones administrativas

/**
 * Servicio para operaciones administrativas avanzadas
 */
const adminService = {
  /**
   * Resetea la base de datos (solo desarrollo)
   */
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      // URL del backend
      const BACKEND_URL = 'http://localhost:8000';
      
      // Token de desarrollo
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token_for_development'
      };
      
      // Llamar al endpoint de reinicio
      const response = await fetch(`${BACKEND_URL}/api/v1/reset-database`, {
        method: 'POST',
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Base de datos reiniciada con éxito:', data);
        return {
          success: true,
          message: 'Base de datos reiniciada con éxito'
        };
      }
      
      const errorText = await response.text();
      console.error('Error al reiniciar la base de datos:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return {
        success: false,
        message: `Error al reiniciar la base de datos: ${response.status} ${response.statusText}`
      };
    } catch (error: any) {
      console.error('Error general al reiniciar la base de datos:', error);
      return {
        success: false,
        message: error.message || 'Error desconocido al reiniciar la base de datos'
      };
    }
  }
};

export default adminService;
