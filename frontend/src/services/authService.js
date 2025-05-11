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
   * Iniciar sesión
   * @param {Object} credentials Credenciales del usuario
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async login(credentials) {
    // Simulación de login para desarrollo
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const user = {
        id: 1,
        username: 'admin',
        role: 'administrador',
        fullName: 'Administrador'
      };
      const token = 'token-simulado-admin-12345';
      
      this.saveToken(token);
      this.saveUser(user);
      
      return { user, token };
    }
    
    // En producción, usar llamada real a la API
    // const response = await fetch(`${AUTH_URL}/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials)
    // });
    // const data = await response.json();
    // 
    // if (!response.ok) {
    //   throw new Error(data.detail || 'Error de autenticación');
    // }
    // 
    // this.saveToken(data.token);
    // this.saveUser(data.user);
    // 
    // return data;
    
    throw new Error('Credenciales inválidas');
  },
  
  /**
   * Cerrar sesión
   */
  logout() {
    this.removeToken();
    this.removeUser();
  },
  
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData Datos del nuevo usuario
   * @returns {Promise<Object>} Datos del usuario creado
   */
  async register(userData) {
    // En producción, usar llamada real a la API
    // const response = await fetch(`${AUTH_URL}/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // });
    // return await response.json();
    
    // Simulación para desarrollo
    return {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString()
    };
  },
  
  /**
   * Actualizar datos de un usuario
   * @param {number} userId ID del usuario
   * @param {Object} userData Nuevos datos
   * @returns {Promise<Object>} Datos actualizados
   */
  async updateUser(userId, userData) {
    // En producción, usar llamada real a la API
    // const response = await fetch(`${AUTH_URL}/users/${userId}`, {
    //   method: 'PUT',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     ...this.getAuthHeaders()
    //   },
    //   body: JSON.stringify(userData)
    // });
    // return await response.json();
    
    // Simulación para desarrollo
    return {
      id: userId,
      ...userData,
      updated_at: new Date().toISOString()
    };
  },
  
  /**
   * Obtener usuario almacenado en localStorage
   * @returns {Object|null} Datos del usuario o null
   */
  getStoredUser() {
    if (isBrowser) {
      try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.warn('Error obteniendo usuario de localStorage:', e);
        return null;
      }
    }
    return null;
  },
  
  /**
   * Guardar datos de usuario en localStorage
   * @param {Object} user Datos del usuario
   */
  saveUser(user) {
    if (isBrowser && user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role || 'usuario');
      } catch (e) {
        console.warn('Error guardando usuario en localStorage:', e);
      }
    }
  },
  
  /**
   * Eliminar datos de usuario de localStorage
   */
  removeUser() {
    if (isBrowser) {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      } catch (e) {
        console.warn('Error eliminando usuario de localStorage:', e);
      }
    }
  },
  
  /**
   * Obtener usuario actual (desde localStorage o API)
   * @returns {Promise<Object|null>} Datos del usuario o null
   */
  async getCurrentUser() {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      return storedUser;
    }
    
    // En una aplicación real, verificaríamos con la API
    // if (this.isAuthenticated()) {
    //   try {
    //     const response = await fetch(`${AUTH_URL}/me`, {
    //       headers: this.getAuthHeaders()
    //     });
    //     if (response.ok) {
    //       const userData = await response.json();
    //       this.saveUser(userData);
    //       return userData;
    //     }
    //   } catch (e) {
    //     console.error('Error obteniendo usuario actual:', e);
    //   }
    // }
    
    return null;
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
        console.warn('Error guardando token:', e);
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

// Exportar funciones individuales para compatibilidad con imports existentes
export const isAuthenticated = () => authService.isAuthenticated();
export const login = async (credentials) => authService.login(credentials);
export const logout = () => authService.logout();
export const register = async (userData) => authService.register(userData);
export const updateUser = async (userId, userData) => authService.updateUser(userId, userData);
export const getStoredUser = () => authService.getStoredUser();
export const getCurrentUser = () => authService.getCurrentUser();
export const getUserRole = () => authService.getCurrentUserRole();
export const getRedirectPathForUser = (user) => {
  const role = user?.role || 'usuario';
  return role === 'administrador' ? '/dashboard' : '/';
};

// Exportar el objeto completo para usos avanzados
export default authService;
