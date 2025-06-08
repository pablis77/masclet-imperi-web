/**
 * Configuración de la API corregida para AWS
 */
const apiConfig = {
  baseURL: '/api/v1',  // Prefijo unificado
  timeout: 30000,      // Tiempo de espera ampliado para entorno de producción
  withCredentials: true,
  backendURL: ''       // En producción, usamos rutas relativas
};

// Exportar para compatibilidad con módulos
if (typeof window !== 'undefined') {
  window.apiConfig = apiConfig;
  console.log('Configuración API inicializada para entorno de producción');
}

// Exportar como valor predeterminado
export default apiConfig;
