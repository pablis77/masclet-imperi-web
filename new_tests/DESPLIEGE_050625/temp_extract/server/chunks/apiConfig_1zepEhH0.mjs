typeof window !== "undefined" && window.location.hostname.includes("render.com");
const API_CONFIG = {
  baseURL: "/api/v1",
  // Prefijo unificado: /api/v1 en todos los entornos
  timeout: 15e3,
  // Tiempo máximo de espera para peticiones (en ms)
  withCredentials: true,
  // Permite enviar cookies en peticiones cross-origin
  backendURL: "" 
  // URL directa para importaciones y casos especiales
};
console.log(`[API Config] Usando modo: ${"PRODUCCIÓN" }`);
console.log(`[API Config] Base URL: ${API_CONFIG.baseURL}`);

export { API_CONFIG as A };
