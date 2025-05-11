/**
 * Servicio de autenticación simplificado para Masclet Imperi
 */

// URL base para endpoints de autenticación (ajustar según API real)
const AUTH_URL = '/api/auth';

// Rol por defecto para desarrollo
const DEFAULT_ROLE = 'admin';

// Comprobar si estamos en el navegador
const isBrowser = typeof window !== 'undefined';

/**
 * Servicio de autenticación
 */
const authService = {
  /**
   * Comprobar si el usuario está autenticado
   * @returns {boolean} Estado de autenticación
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Obtener token de autenticación
   * @returns {string|null} Token JWT o null si no está autenticado
   */
  getToken() {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        return localStorage.getItem('token');
      } catch (e) {
        console.warn('Error accediendo a localStorage:', e);
      }
    }
    // Valor predeterminado para desarrollo, tanto en servidor como en cliente
    return 'token-desarrollo-12345';
  },

  /**
   * Guardar token en localStorage
   * @param {string} token Token JWT
   */
  saveToken(token) {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        localStorage.setItem('token', token);
      } catch (e) {
        console.warn('Error guardando en localStorage:', e);
      }
    }
  },

  /**
   * Eliminar token (cerrar sesión)
   */
  removeToken() {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        localStorage.removeItem('token');
      } catch (e) {
        console.warn('Error eliminando de localStorage:', e);
      }
    }
  },

  /**
   * Verificar y restaurar sesión cuando sea necesario
   * @returns {Promise<boolean>} Estado de autenticación
   */
  async ensureAuthenticated() {
    // En desarrollo, simular siempre autenticación exitosa
    if (!this.getToken()) {
      this.saveToken('token-desarrollo-12345');
      console.info('Token de desarrollo generado automáticamente');
    }
    return true;
  },

  /**
   * Obtener encabezados de autenticación para peticiones API
   * @returns {Object} Headers con token de autenticación
   */
  getAuthHeaders() {
    const token = this.getToken() || 'token-desarrollo-12345';
    return { 'Authorization': `Bearer ${token}` };
  },
  
  /**
   * Obtener el rol del usuario actual
   * @returns {string} Rol del usuario (admin, user, etc.)
   */
  getCurrentUserRole() {
    // Solo acceder a localStorage en el navegador
    if (isBrowser) {
      try {
        // En un entorno real, esto podría decodificar el JWT para obtener el rol
        // o hacer una solicitud al servidor para obtener el perfil del usuario
        return localStorage.getItem('userRole') || DEFAULT_ROLE;
      } catch (e) {
        console.warn('Error al obtener rol de usuario:', e);
      }
    }
    // Siempre devolver un valor por defecto para el servidor
    return DEFAULT_ROLE;
  }
};

// Auto-generar token para desarrollo si se usa directamente
if (isBrowser) {
  setTimeout(() => {
    try {
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', 'token-desarrollo-12345');
        console.info('Token de desarrollo generado automáticamente');
      }
      
      if (!localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', DEFAULT_ROLE);
        console.info('Rol de usuario por defecto establecido:', DEFAULT_ROLE);
      }
    } catch (e) {
      console.warn('Error inicializando valores por defecto:', e);
    }
  }, 100);
}

export default authService;
