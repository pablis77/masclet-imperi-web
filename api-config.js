// Archivo de configuración API
const API_CONFIG = {
  baseURL: "/api/v1",
  timeout: 15000,
  withCredentials: true,
  backendURL: "http://masclet-api:8000"
};

console.log("[API Config] Modo: PRODUCCIÓN");
console.log("[API Config] BackendURL: " + API_CONFIG.backendURL);
console.log("[API Config] Base URL: " + API_CONFIG.baseURL);

export { API_CONFIG as A };
