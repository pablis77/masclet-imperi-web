typeof window !== "undefined" && window.location.hostname.includes("render.com");
const isLocalEnvironment = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || /^192\.168\./.test(hostname) || /^10\./.test(hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(hostname);
};
const API_CONFIG = {
  baseURL: "/api/v1",
  // Prefijo unificado: /api/v1 en todos los entornos
  timeout: 15e3,
  // Tiempo máximo de espera para peticiones (en ms)
  withCredentials: true,
  // Permite enviar cookies en peticiones cross-origin
  backendURL: !isLocalEnvironment() ? "" : "http://127.0.0.1:8000"
  // URL directa para importaciones y casos especiales
};
const isLocal = isLocalEnvironment();
console.log(`[API Config] Hostname: ${typeof window !== "undefined" ? window.location.hostname : "N/A"}`);
console.log(`[API Config] Usando modo: ${!isLocal ? "PRODUCCIÓN" : "DESARROLLO LOCAL"}`);
console.log(`[API Config] BackendURL: ${API_CONFIG.backendURL || "relativo"}`);
console.log(`[API Config] Base URL: ${API_CONFIG.baseURL}`);
console.log(`[API Config] Es entorno local: ${isLocal ? "SÍ" : "NO"}`);

export { API_CONFIG as A };
//# sourceMappingURL=apiConfig_Qu2HXU2s.mjs.map
