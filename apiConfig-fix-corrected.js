/**
 * Configuración de la API corregida para AWS
 */
const apiConfig = {
  baseURL: "/api/v1",  // Prefijo unificado
  timeout: 30000,      // Tiempo de espera ampliado para entorno de producción
  withCredentials: true,
  backendURL: "http://masclet-api:8000"  // En producción con Docker, usamos el nombre del servicio
};

// Exportar para compatibilidad con módulos
if (typeof window !== 'undefined') {
  window.apiConfig = apiConfig;
  console.log("Configuración API inicializada para entorno de producción Docker:");
  console.log("- backendURL:", apiConfig.backendURL);
  console.log("- baseURL:", apiConfig.baseURL);
}

// Exportar como valor predeterminado
export default apiConfig;
