import.meta.env = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SITE": undefined, "SSR": false};import axios from "/node_modules/.vite/deps/axios.js?v=5e89932e";
let ENVIRONMENT = "development";
let API_BASE_URL = "";
let USE_MOCK_DATA = false;
const API_CONFIG = {
  development: {
    protocol: "http",
    host: "127.0.0.1",
    // Usar IP literal en lugar de localhost para mayor estabilidad
    port: "8000",
    path: "/api/v1"
    // Restaurado '/api/v1' para que funcione el desarrollo local
  },
  production: {
    // Usar variable de entorno o valor por defecto para el backend
    protocol: "https",
    host: import.meta.env.VITE_BACKEND_HOST || "masclet-imperi-web-backend.onrender.com",
    port: "",
    // No usamos puerto en producción con HTTPS
    path: ""
    // En producción, las rutas del backend NO empiezan con /api/v1
  }
};
const getApiUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  let isLocal = false;
  let isTunnel = false;
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    isTunnel = hostname.includes("loca.lt");
    isLocal = hostname === "localhost" || hostname === "127.0.0.1" || isTunnel;
  } else {
    isLocal = ENVIRONMENT !== "production";
  }
  if (typeof window !== "undefined" && window.location.hostname.includes("loca.lt")) {
    isTunnel = true;
  }
  let isLocalNetwork = false;
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    isLocalNetwork = hostname === "localhost" || hostname === "127.0.0.1" || /^192\.168\./.test(hostname) || /^10\./.test(hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(hostname);
  }
  const config = isLocal || isLocalNetwork ? API_CONFIG.development : API_CONFIG.production;
  if (isLocalNetwork && !isLocal) {
    console.log("[ApiService] Modo desarrollo forzado por detección de red local:", window.location.hostname);
  }
  if (isTunnel) {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("loca.lt")) {
        let backendTunnelUrl = import.meta.env.VITE_BACKEND_TUNNEL_URL || "https://api-masclet-imperi.loca.lt/api/v1";
        const savedBackendUrl = localStorage.getItem("backend_tunnel_url");
        if (savedBackendUrl) {
          backendTunnelUrl = savedBackendUrl;
        }
        return backendTunnelUrl;
      }
    }
    const tunnelBackendUrl = "https://api-masclet-imperi.loca.lt/api/v1";
    return tunnelBackendUrl;
  }
  const baseUrl = `${config.protocol}://${config.host}${config.port ? ":" + config.port : ""}${config.path}`;
  return baseUrl;
};
if (import.meta.env.PROD) {
  ENVIRONMENT = "production";
} else {
  ENVIRONMENT = "development";
}
API_BASE_URL = getApiUrl();
let isProduction = false;
if (typeof window !== "undefined") {
  const currentHost = window.location.hostname;
  const isLocalNetwork = currentHost === "localhost" || currentHost === "127.0.0.1" || /^192\.168\./.test(currentHost) || /^10\./.test(currentHost) || /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(currentHost);
  isProduction = !isLocalNetwork;
  console.log(`[ApiService] Host: ${currentHost}, Es red local: ${isLocalNetwork}, Modo producción: ${isProduction}`);
}
if (isProduction) {
  if (API_BASE_URL.includes("/api/v1/api/v1")) {
    API_BASE_URL = API_BASE_URL.replace("/api/v1/api/v1", "/api/v1");
    console.log(`[ApiService] Corregida duplicación de prefijo en URL: ${API_BASE_URL}`);
  }
}
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use(
  (config) => {
    const endpoint = config.url || "";
    if (typeof window !== "undefined" && window.location.hostname.includes("loca.lt")) {
      const tunnelMessageShown = localStorage.getItem("tunnelMessageShown") === "true";
      if (!tunnelMessageShown && !document.getElementById("tunnel-auth-message")) {
        localStorage.setItem("tunnelMessageShown", "true");
        const msgDiv = document.createElement("div");
        msgDiv.id = "tunnel-auth-message";
        msgDiv.style.position = "fixed";
        msgDiv.style.top = "50px";
        msgDiv.style.left = "50%";
        msgDiv.style.transform = "translateX(-50%)";
        msgDiv.style.backgroundColor = "#f8d7da";
        msgDiv.style.color = "#721c24";
        msgDiv.style.padding = "15px 20px";
        msgDiv.style.borderRadius = "5px";
        msgDiv.style.zIndex = "9999";
        msgDiv.style.maxWidth = "80%";
        msgDiv.style.textAlign = "center";
        msgDiv.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
        msgDiv.innerHTML = `
          <h3 style="margin-top: 0;">Autenticación de túnel necesaria</h3>
          <p>Para usar el túnel correctamente, necesitas autenticar ambos túneles manualmente.</p>
          <p><strong>1.</strong> Haz clic en este botón para abrir el túnel del backend:</p>
          <a href="https://api-masclet-imperi.loca.lt/api/v1/health" target="_blank" 
             style="display: inline-block; background: #28a745; color: white; text-decoration: none; 
                    padding: 8px 15px; margin: 10px 0; border-radius: 4px;">
            Autenticar Túnel Backend
          </a>
          <p><strong>2.</strong> En la nueva pestaña, completa cualquier autenticación que solicite LocalTunnel</p>
          <p><strong>3.</strong> Cierra esa pestaña y vuelve aquí</p>
          <p><strong>4.</strong> Recarga esta página</p>
          <button id="close-tunnel-msg" style="background: #6c757d; border: none; color: white; padding: 5px 10px; 
                                             border-radius: 3px; margin-top: 10px; cursor: pointer;">
            Cerrar este mensaje
          </button>
        `;
        document.body.appendChild(msgDiv);
        document.getElementById("close-tunnel-msg")?.addEventListener("click", () => {
          msgDiv.style.display = "none";
        });
      }
      if (!endpoint.startsWith("/api/v1") && !endpoint.startsWith("api/v1")) {
        const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
        config.url = `/api/v1${path}`;
        console.log(`[TÚNEL] Añadiendo prefijo: ${endpoint} -> ${config.url}`);
      }
      const finalUrl = `${config.baseURL || ""}${config.url || ""}`;
      if (finalUrl.includes("/api/v1/api/v1/")) {
        console.log(`[TÚNEL] Corrigiendo URL duplicada: ${finalUrl}`);
        const fixedUrl = finalUrl.replace("/api/v1/api/v1/", "/api/v1/");
        const baseUrlPart = config.baseURL || "";
        config.url = fixedUrl.replace(baseUrlPart, "");
        console.log(`[TÚNEL] URL corregida: ${baseUrlPart}${config.url}`);
      }
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("token")) {
      config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }
    config.withCredentials = false;
    if (isProduction) {
      if (config.url && config.url.startsWith("http:")) {
        config.url = config.url.replace("http:", "https:");
      }
      if (config.baseURL && config.baseURL.startsWith("http:")) {
        config.baseURL = config.baseURL.replace("http:", "https:");
      }
      console.log(`[PROD] URL final: ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
          console.log("Usando token JWT para autenticación");
        } else {
          console.warn("No se encontró token en localStorage");
        }
      } catch (e) {
        console.warn("No se pudo acceder a localStorage:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export function configureApi(baseUrl, useMockData = false) {
  API_BASE_URL = baseUrl;
  USE_MOCK_DATA = useMockData;
  api.defaults.baseURL = baseUrl;
}
export async function get(endpoint) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let apiEndpoint = normalizedEndpoint;
    const baseUrlHasPrefix = API_BASE_URL.includes("/api/v1");
    if (!apiEndpoint.startsWith("/api/v1") && !baseUrlHasPrefix) {
      apiEndpoint = `/api/v1${normalizedEndpoint}`;
      console.log(`Añadiendo prefijo a endpoint: ${normalizedEndpoint} -> ${apiEndpoint}`);
    }
    const finalEndpoint = !apiEndpoint.includes("?") && apiEndpoint.endsWith("/") ? apiEndpoint.slice(0, -1) : apiEndpoint;
    if (isProduction) {
    } else {
      console.log(`Realizando petición GET a: ${finalEndpoint}`);
    }
    const response = await api.get(finalEndpoint);
    if (response.data === void 0 || response.data === null) {
      if (Array.isArray(response.data)) {
        return [];
      } else {
        return {};
      }
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error en petición GET a ${endpoint}: ${error.message} (${error.response?.status || "sin status"})`);
    } else {
      console.error(`❌ Error no relacionado con Axios en ${endpoint}: ${error}`);
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const originalUrl = error.config?.url || "";
      const absoluteUrl = error.config?.baseURL ? `${error.config.baseURL}${originalUrl}` : originalUrl;
      if (!isProduction) {
      } else {
        if (absoluteUrl.includes("://")) {
          try {
            const urlObj = new URL(absoluteUrl);
            const relativePath = urlObj.pathname + urlObj.search;
            try {
              const retryResponse = await axios.get(relativePath, {
                baseURL: "",
                headers: error.config?.headers
              });
              return retryResponse.data;
            } catch (retryError) {
            }
          } catch (e) {
          }
        }
        if (originalUrl.includes("//") || originalUrl.includes("api/api") || originalUrl.includes("/api/v1") && endpoint.includes("/api/v1")) {
          let correctedUrl = endpoint.replace(/api\/api/g, "api");
          correctedUrl = correctedUrl.replace(/\/api\/v1\/api\/v1/g, "/api/v1");
          correctedUrl = correctedUrl.replace(/\/\/api\/v1/g, "/api/v1");
          if (correctedUrl !== endpoint) {
            try {
              const retryResponse = await api.get(correctedUrl);
              return retryResponse.data;
            } catch (retryError) {
            }
          }
        }
        if (error.config?.baseURL) {
          try {
            let finalAttemptUrl = originalUrl;
            if (!finalAttemptUrl.startsWith("/api")) {
              finalAttemptUrl = `/api/v1/${finalAttemptUrl.startsWith("/") ? finalAttemptUrl.substring(1) : finalAttemptUrl}`;
            }
            const lastResponse = await axios.get(finalAttemptUrl, {
              baseURL: ""
            });
            return lastResponse.data;
          } catch (lastError) {
          }
        }
      }
      if (endpoint.includes("list") || endpoint.includes("all") || endpoint.includes("explotacions") || endpoint.includes("animales")) {
        return [];
      }
    }
    return {};
  }
}
export async function post(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await api.post(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición POST a ${endpoint}:`, error);
    throw error;
  }
}
export async function put(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await api.put(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PUT a ${endpoint}:`, error);
    throw error;
  }
}
export async function patch(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    console.log(`Realizando petición PATCH a ${API_BASE_URL}${normalizedEndpoint}`);
    console.log("Datos enviados:", data);
    const response = await api.patch(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PATCH a ${endpoint}:`, error);
    throw error;
  }
}
export async function del(endpoint) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await api.delete(normalizedEndpoint);
    return response.data;
  } catch (error) {
    console.error(`Error en petición DELETE a ${endpoint}:`, error);
    throw error;
  }
}
export async function isAuthenticated() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = localStorage.getItem("token");
      if (!token) return false;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    return false;
  }
}
export async function getUserInfo() {
  try {
    if (await isAuthenticated()) {
      return await get("/users/me");
    }
    return null;
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return null;
  }
}
export async function login(username, password) {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("grant_type", "password");
    const loginEndpoint = "/auth/login";
    let loginUrl = loginEndpoint;
    let useBaseUrlOverride = false;
    let baseUrlOverride = "";
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocalNetwork = hostname === "localhost" || hostname === "127.0.0.1" || /^192\.168\./.test(hostname) || /^10\./.test(hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(hostname);
      if (isLocalNetwork) {
        useBaseUrlOverride = true;
        baseUrlOverride = "http://127.0.0.1:8000/api/v1";
        loginUrl = "/auth/login";
        console.log(`Realizando login a: ${baseUrlOverride}${loginUrl}`);
      } else if (isProduction) {
        console.log(`Realizando login a: /api/v1${loginEndpoint}`);
      } else {
        console.log(`Realizando login a: ${api.defaults.baseURL}${loginEndpoint}`);
      }
    } else {
      console.log(`Realizando login a: ${api.defaults.baseURL}${loginEndpoint}`);
    }
    let response;
    if (useBaseUrlOverride) {
      const tempAxios = axios.create({
        baseURL: baseUrlOverride,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      response = await tempAxios.post(loginUrl, formData);
    } else {
      response = await api.post(loginEndpoint, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
    }
    if (typeof window !== "undefined" && window.localStorage && response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      console.log("Token guardado correctamente");
    }
    return response;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}
const getBaseUrl = () => {
  return API_BASE_URL;
};
export default {
  get,
  post,
  put,
  patch,
  del,
  isAuthenticated,
  getUserInfo,
  login,
  configureApi,
  getBaseUrl
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaVNlcnZpY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDCocKhwqFBRFZFUlRFTkNJQSEhISAtIE5PIE1PRElGSUNBUiBFU1RFIEFSQ0hJVk9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFxuICogRXN0ZSBhcmNoaXZvIGVzIENSw41USUNPIHBhcmEgZWwgZnVuY2lvbmFtaWVudG8gZGUgdG9kYSBsYSBhcGxpY2FjacOzbi5cbiAqIE1vZGlmaWNhcmxvIHB1ZWRlIHJvbXBlciBsYSBjb25leGnDs24gZW50cmUgZnJvbnRlbmQgeSBiYWNrZW5kLlxuICogXG4gKiBSRUdMQVMgRVNUUklDVEFTOlxuICogMS4gTlVOQ0EgbW9kaWZpY2FyIGVzdGUgYXJjaGl2byBkaXJlY3RhbWVudGUgLSBjcmVhciBzZXJ2aWNpb3MgaW5kZXBlbmRpZW50ZXMgc2kgZXMgbmVjZXNhcmlvXG4gKiAyLiBOVU5DQSBjYW1iaWFyIGxhIGVzdHJ1Y3R1cmEgZXhpc3RlbnRlIGRlIGxsYW1hZGFzIEFQSSBxdWUgZnVuY2lvbmFuXG4gKiAzLiBOVU5DQSB0b2NhciBsYSBjb25maWd1cmFjacOzbiBkZSBjb25leGnDs24sIFVSTHMgYmFzZSBvIGxvcyBpbnRlcmNlcHRvcnNcbiAqIDQuIFNpIG5lY2VzaXRhcyBpbXBsZW1lbnRhciBudWV2YXMgZnVuY2lvbmFsaWRhZGVzLCBoYXpsbyBlbiBhcmNoaXZvcyBzZXBhcmFkb3NcbiAqIFxuICogU2kgYXBhcmVjZW4gZXJyb3JlcyBjb21vIFwiRVJSX05FVFdPUktfQ0hBTkdFRFwiIG8gcHJvYmxlbWFzIGRlIENPUlMgdHJhcyBtb2RpZmljYWNpb25lcyxcbiAqIHJlc3RhdXJhciBpbm1lZGlhdGFtZW50ZSBlc3RlIGFyY2hpdm8geSByZXZpc2FyIGxhIGNvbmZpZ3VyYWNpw7NuIENPUlMgZW4gYmFja2VuZC9hcHAvbWFpbi5weVxuICovXG5cbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5cbi8vIENvbnN0YW50ZXMgZGUgZW50b3Jub1xubGV0IEVOVklST05NRU5UOiBzdHJpbmcgPSAnZGV2ZWxvcG1lbnQnO1xubGV0IEFQSV9CQVNFX1VSTDogc3RyaW5nID0gJyc7XG5sZXQgVVNFX01PQ0tfREFUQTogYm9vbGVhbiA9IGZhbHNlOyAvLyBWYXJpYWJsZSBmYWx0YW50ZVxuXG4vLyBVUkxzIGNvbmZpZ3VyYWJsZXMgcGFyYSBkaWZlcmVudGVzIGVudG9ybm9zXG5jb25zdCBBUElfQ09ORklHID0ge1xuICBkZXZlbG9wbWVudDoge1xuICAgIHByb3RvY29sOiAnaHR0cCcsXG4gICAgaG9zdDogJzEyNy4wLjAuMScsIC8vIFVzYXIgSVAgbGl0ZXJhbCBlbiBsdWdhciBkZSBsb2NhbGhvc3QgcGFyYSBtYXlvciBlc3RhYmlsaWRhZFxuICAgIHBvcnQ6ICc4MDAwJyxcbiAgICBwYXRoOiAnL2FwaS92MScgIC8vIFJlc3RhdXJhZG8gJy9hcGkvdjEnIHBhcmEgcXVlIGZ1bmNpb25lIGVsIGRlc2Fycm9sbG8gbG9jYWxcbiAgfSxcbiAgcHJvZHVjdGlvbjoge1xuICAgIC8vIFVzYXIgdmFyaWFibGUgZGUgZW50b3JubyBvIHZhbG9yIHBvciBkZWZlY3RvIHBhcmEgZWwgYmFja2VuZFxuICAgIHByb3RvY29sOiAnaHR0cHMnLFxuICAgIGhvc3Q6IGltcG9ydC5tZXRhLmVudi5WSVRFX0JBQ0tFTkRfSE9TVCB8fCAnbWFzY2xldC1pbXBlcmktd2ViLWJhY2tlbmQub25yZW5kZXIuY29tJyxcbiAgICBwb3J0OiAnJywgIC8vIE5vIHVzYW1vcyBwdWVydG8gZW4gcHJvZHVjY2nDs24gY29uIEhUVFBTXG4gICAgcGF0aDogJycgICAvLyBFbiBwcm9kdWNjacOzbiwgbGFzIHJ1dGFzIGRlbCBiYWNrZW5kIE5PIGVtcGllemFuIGNvbiAvYXBpL3YxXG4gIH1cbn07XG5cbi8vIENvbmZpZ3VyYWNpw7NuIGdsb2JhbCB1c2FuZG8gdmFyaWFibGVzIGRlIGVudG9ybm9cbmNvbnN0IGdldEFwaVVybCA9ICgpOiBzdHJpbmcgPT4ge1xuICAvLyBPYnRlbmVyIFVSTCBkZSBBUEkgZGUgbGFzIHZhcmlhYmxlcyBkZSBlbnRvcm5vIChwcmlvcmlkYWQgbcOheGltYSlcbiAgY29uc3QgZW52QXBpVXJsID0gaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBJX1VSTDtcbiAgXG4gIC8vIFNpIGV4aXN0ZSB1bmEgVVJMIGV4cGzDrWNpdGEgY29uZmlndXJhZGEsIHVzYXJsYVxuICBpZiAoZW52QXBpVXJsKSB7XG4gICAgLy8gY29uc29sZS5sb2coYFtBcGlTZXJ2aWNlXSBVc2FuZG8gVVJMIGV4cGzDrWNpdGEgZGUgdmFyaWFibGUgZGUgZW50b3JubzogJHtlbnZBcGlVcmx9YCk7XG4gICAgcmV0dXJuIGVudkFwaVVybDtcbiAgfVxuXG4gIC8vIExPRyBkZWwgZW50b3JubyBkZXRlY3RhZG9cbiAgLy8gY29uc29sZS5sb2coYFtBcGlTZXJ2aWNlXSBFbnRvcm5vIGRldGVjdGFkbzogJHtFTlZJUk9OTUVOVH1gKTtcbiAgXG4gIC8vIERldGVjdGFyIGV4cGzDrWNpdGFtZW50ZSBlbnRvcm5vIGxvY2FsIHZzIHByb2R1Y2Npw7NuXG4gIGxldCBpc0xvY2FsID0gZmFsc2U7XG4gIGxldCBpc1R1bm5lbCA9IGZhbHNlO1xuICBcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29uc3QgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gICAgLy8gQ29tcHJvYmFyIHNpIGVzdGFtb3MgZW4gTG9jYWxUdW5uZWxcbiAgICBpc1R1bm5lbCA9IGhvc3RuYW1lLmluY2x1ZGVzKCdsb2NhLmx0Jyk7XG4gICAgLy8gQ29tcHJvYmFyIHNpIGVzdGFtb3MgZW4gbG9jYWxob3N0IG8gZW4gdHVubmVsXG4gICAgaXNMb2NhbCA9IGhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fCBob3N0bmFtZSA9PT0gJzEyNy4wLjAuMScgfHwgaXNUdW5uZWw7XG4gICAgLy8gY29uc29sZS5sb2coYFtBcGlTZXJ2aWNlXSBIb3N0bmFtZSBkZXRlY3RhZG86ICR7aG9zdG5hbWV9LCBpc0xvY2FsOiAke2lzTG9jYWx9LCBpc1R1bm5lbDogJHtpc1R1bm5lbH1gKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBTaSB3aW5kb3cgbm8gZXN0w6EgZGVmaW5pZG8gKFNTUiksIHVzYXIgdmFyaWFibGUgZGUgZW50b3Jub1xuICAgIGlzTG9jYWwgPSBFTlZJUk9OTUVOVCAhPT0gJ3Byb2R1Y3Rpb24nO1xuICAgIC8vIGNvbnNvbGUubG9nKGBbQXBpU2VydmljZV0gU1NSLCB1c2FuZG8gRU5WSVJPTk1FTlQ6ICR7RU5WSVJPTk1FTlR9LCBpc0xvY2FsOiAke2lzTG9jYWx9YCk7XG4gIH1cbiAgXG4gIC8vIEZPUlpBUiBNT0RPIFRVTk5FTCBTSSBMQSBVUkwgSU5DTFVZRSBsb2NhLmx0XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoJ2xvY2EubHQnKSkge1xuICAgIGlzVHVubmVsID0gdHJ1ZTtcbiAgICAvLyBjb25zb2xlLmxvZygnW0FwaVNlcnZpY2VdIE1vZG8gdHVubmVsIGZvcnphZG8gcG9ycXVlIGxhIFVSTCBjb250aWVuZSBsb2NhLmx0Jyk7XG4gIH1cbiAgXG4gIC8vIFNlbGVjY2lvbmFyIGNvbmZpZ3VyYWNpw7NuIHNlZ8O6biBlbnRvcm5vXG4gIC8vIFBhcmEgcmVkZXMgbG9jYWxlcywgU0lFTVBSRSB1c2FyIGNvbmZpZ3VyYWNpw7NuIGRlIGRlc2Fycm9sbG9cbiAgLy8gQ29tcHJvYmFjacOzbiBhZGljaW9uYWw6IHNpIGVzdGFtb3MgZW4gdW5hIElQIGRlIHJlZCBsb2NhbFxuICBsZXQgaXNMb2NhbE5ldHdvcmsgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29uc3QgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gICAgaXNMb2NhbE5ldHdvcmsgPSBcbiAgICAgIGhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fCBcbiAgICAgIGhvc3RuYW1lID09PSAnMTI3LjAuMC4xJyB8fFxuICAgICAgL14xOTJcXC4xNjhcXC4vLnRlc3QoaG9zdG5hbWUpIHx8XG4gICAgICAvXjEwXFwuLy50ZXN0KGhvc3RuYW1lKSB8fFxuICAgICAgL14xNzJcXC4oMVs2LTldfDJbMC05XXwzWzAtMV0pLy50ZXN0KGhvc3RuYW1lKTtcbiAgfVxuICBcbiAgLy8gU2kgZXMgcmVkIGxvY2FsLCBGT1JaQVIgbW9kbyBkZXNhcnJvbGxvIGluZGVwZW5kaWVudGVtZW50ZSBkZSBvdHJhcyB2YXJpYWJsZXNcbiAgY29uc3QgY29uZmlnID0gKGlzTG9jYWwgfHwgaXNMb2NhbE5ldHdvcmspID8gQVBJX0NPTkZJRy5kZXZlbG9wbWVudCA6IEFQSV9DT05GSUcucHJvZHVjdGlvbjtcbiAgXG4gIGlmIChpc0xvY2FsTmV0d29yayAmJiAhaXNMb2NhbCkge1xuICAgIGNvbnNvbGUubG9nKCdbQXBpU2VydmljZV0gTW9kbyBkZXNhcnJvbGxvIGZvcnphZG8gcG9yIGRldGVjY2nDs24gZGUgcmVkIGxvY2FsOicsIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSk7XG4gIH1cbiAgXG4gIC8vIFNPTFVDScOTTiBESVJFQ1RBIFBBUkEgVMOaTkVMRVM6IERFVEVDVEFSIERJTsOBTUlDQU1FTlRFIExBIFVSTFxuICBpZiAoaXNUdW5uZWwpIHtcbiAgICAvLyBPYnRlbmVyIGxhIFVSTCBkZWwgZnJvbnRlbmQgeSBjb25zdHJ1aXIgbGEgVVJMIGRlbCBiYWNrZW5kIGJhc2FkYSBlbiBlbGxhXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBFeHRyYWVyIGVsIHN1YmRvbWluaW8gZGVsIGZyb250ZW5kXG4gICAgICBjb25zdCBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgICAgIC8vIFNpIGVsIGZyb250ZW5kIGVzdMOhIGVuIGxvY2EubHQsIGNvbnN0cnVpciBsYSBVUkwgZGVsIGJhY2tlbmRcbiAgICAgIGlmIChob3N0bmFtZS5pbmNsdWRlcygnbG9jYS5sdCcpKSB7XG4gICAgICAgIC8vIFVSTCBhY3R1YWwgZGUgTG9jYWxUdW5uZWwgZGVsIGJhY2tlbmQgKGRlc2RlIGVudG9ybm8gbyDDumx0aW1vIGNvbm9jaWRvKVxuICAgICAgICBsZXQgYmFja2VuZFR1bm5lbFVybCA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0JBQ0tFTkRfVFVOTkVMX1VSTCB8fCAnaHR0cHM6Ly9hcGktbWFzY2xldC1pbXBlcmkubG9jYS5sdC9hcGkvdjEnO1xuICAgICAgICBcbiAgICAgICAgLy8gU2kgdGVuZW1vcyB1bmEgVVJMIGRlIGJhY2tlbmQgZW4gZWwgYWxtYWNlbmFtaWVudG8gbG9jYWwsIHVzYXJsYVxuICAgICAgICBjb25zdCBzYXZlZEJhY2tlbmRVcmwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYmFja2VuZF90dW5uZWxfdXJsJyk7XG4gICAgICAgIGlmIChzYXZlZEJhY2tlbmRVcmwpIHtcbiAgICAgICAgICBiYWNrZW5kVHVubmVsVXJsID0gc2F2ZWRCYWNrZW5kVXJsO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgW0FwaVNlcnZpY2VdIMKhVVNBTkRPIFVSTCBDT01QTEVUQSBERSBMT0NBTFRVTk5FTCE6ICR7YmFja2VuZFR1bm5lbFVybH1gKTtcbiAgICAgICAgcmV0dXJuIGJhY2tlbmRUdW5uZWxVcmw7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIEZhbGxiYWNrIGEgbGEgVVJMIGNvbm9jaWRhIHNpIG5vIHBvZGVtb3MgY29uc3RydWlybGEgZGluw6FtaWNhbWVudGVcbiAgICBjb25zdCB0dW5uZWxCYWNrZW5kVXJsID0gJ2h0dHBzOi8vYXBpLW1hc2NsZXQtaW1wZXJpLmxvY2EubHQvYXBpL3YxJztcbiAgICAvLyBjb25zb2xlLmxvZyhgW0FwaVNlcnZpY2VdIMKhVVNBTkRPIFVSTCBDT01QTEVUQSBERSBMT0NBTFRVTk5FTCAoZmFsbGJhY2spITogJHt0dW5uZWxCYWNrZW5kVXJsfWApO1xuICAgIHJldHVybiB0dW5uZWxCYWNrZW5kVXJsO1xuICB9XG4gIFxuICAvLyBQYXJhIGNvbmV4aW9uZXMgbm9ybWFsZXMsIGNvbnN0cnVpciBVUkwgZXN0w6FuZGFyXG4gIGNvbnN0IGJhc2VVcmwgPSBgJHtjb25maWcucHJvdG9jb2x9Oi8vJHtjb25maWcuaG9zdH0ke2NvbmZpZy5wb3J0ID8gJzonICsgY29uZmlnLnBvcnQgOiAnJ30ke2NvbmZpZy5wYXRofWA7XG4gIFxuICAvLyBjb25zb2xlLmxvZyhgW0FwaVNlcnZpY2VdIEFQSSBjb25maWd1cmFkYSBwYXJhIGVudG9ybm8gJHtpc0xvY2FsID8gJ2Rlc2Fycm9sbG8nIDogJ3Byb2R1Y2Npw7NuJ306ICR7YmFzZVVybH1gKTtcbiAgcmV0dXJuIGJhc2VVcmw7XG59O1xuXG4vLyBPcGNpb25lcyBkZSBlbnRvcm5vXG5pZiAoaW1wb3J0Lm1ldGEuZW52LlBST0QpIHtcbiAgRU5WSVJPTk1FTlQgPSAncHJvZHVjdGlvbic7XG59IGVsc2Uge1xuICBFTlZJUk9OTUVOVCA9ICdkZXZlbG9wbWVudCc7XG59XG5cbi8vIENvbmZpZ3VyYXIgbGEgVVJMIGJhc2UgZGUgbGEgQVBJXG5BUElfQkFTRV9VUkwgPSBnZXRBcGlVcmwoKTtcblxuLy8gY29uc29sZS5sb2coYFtBcGlTZXJ2aWNlXSBFbnRvcm5vOiAke0VOVklST05NRU5UfWApO1xuLy8gY29uc29sZS5sb2coYFtBcGlTZXJ2aWNlXSBBUEkgY29uZmlndXJhZGEgcGFyYSBjb25lY3RhcnNlIGE6ICR7QVBJX0JBU0VfVVJMfWApO1xuXG4vLyBJTVBPUlRBTlRFOiBEZXRlY3RhciBzaSBlc3RhbW9zIGVuIHByb2R1Y2Npw7NuIHBhcmEgZm9yemFyIHJ1dGFzIHJlbGF0aXZhc1xuLy8geSBldml0YXIgcHJvYmxlbWFzIGRlIENPUlNcbmxldCBpc1Byb2R1Y3Rpb24gPSBmYWxzZTtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICBjb25zdCBjdXJyZW50SG9zdCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgLy8gRGV0ZWN0YXIgcmVkZXMgbG9jYWxlcyAoaWd1YWwgcXVlIGVuIGFwaUNvbmZpZy50cylcbiAgY29uc3QgaXNMb2NhbE5ldHdvcmsgPSBcbiAgICBjdXJyZW50SG9zdCA9PT0gJ2xvY2FsaG9zdCcgfHwgXG4gICAgY3VycmVudEhvc3QgPT09ICcxMjcuMC4wLjEnIHx8XG4gICAgL14xOTJcXC4xNjhcXC4vLnRlc3QoY3VycmVudEhvc3QpIHx8XG4gICAgL14xMFxcLi8udGVzdChjdXJyZW50SG9zdCkgfHxcbiAgICAvXjE3MlxcLigxWzYtOV18MlswLTldfDNbMC0xXSkvLnRlc3QoY3VycmVudEhvc3QpO1xuICBcbiAgaXNQcm9kdWN0aW9uID0gIWlzTG9jYWxOZXR3b3JrO1xuICBjb25zb2xlLmxvZyhgW0FwaVNlcnZpY2VdIEhvc3Q6ICR7Y3VycmVudEhvc3R9LCBFcyByZWQgbG9jYWw6ICR7aXNMb2NhbE5ldHdvcmt9LCBNb2RvIHByb2R1Y2Npw7NuOiAke2lzUHJvZHVjdGlvbn1gKTtcbn1cblxuLy8gSU1QT1JUQU5URTogRW4gcHJvZHVjY2nDs24sIGRlYmVtb3MgZXZpdGFyIGxhIGR1cGxpY2FjacOzbiBkZSAvYXBpL3YxXG4vLyBWZXJpZmljYW1vcyBzaSBsYSBVUkwgeWEgY29udGllbmUgL2FwaS92MSB5IHNpIHlhIGVzdMOhIGltcG9ydGFuZG8gYXBpQ29uZmlnLnRzXG5pZiAoaXNQcm9kdWN0aW9uKSB7XG4gIC8vIFNpIGVzdGFtb3MgZW4gcHJvZHVjY2nDs24geSBsYSBVUkwgYmFzZSB0aWVuZSAvYXBpL3YxL2FwaS92MSwgY29ycmVnaW1vc1xuICBpZiAoQVBJX0JBU0VfVVJMLmluY2x1ZGVzKCcvYXBpL3YxL2FwaS92MScpKSB7XG4gICAgQVBJX0JBU0VfVVJMID0gQVBJX0JBU0VfVVJMLnJlcGxhY2UoJy9hcGkvdjEvYXBpL3YxJywgJy9hcGkvdjEnKTtcbiAgICBjb25zb2xlLmxvZyhgW0FwaVNlcnZpY2VdIENvcnJlZ2lkYSBkdXBsaWNhY2nDs24gZGUgcHJlZmlqbyBlbiBVUkw6ICR7QVBJX0JBU0VfVVJMfWApO1xuICB9XG59XG5cbi8vIENyZWRlbmNpYWxlcyBmaWphcyBwYXJhIGRlc2Fycm9sbG86IGFkbWluL2FkbWluMTIzXG4vLyBFc3RhcyBzb24gbGFzIGNyZWRlbmNpYWxlcyBpbmRpY2FkYXMgZW4gbG9zIHJlcXVpc2l0b3NcblxuLy8gQ3JlYXIgaW5zdGFuY2lhIGRlIGF4aW9zIGNvbiBjb25maWd1cmFjacOzbiBiYXNlXG5jb25zdCBhcGkgPSBheGlvcy5jcmVhdGUoe1xuICBiYXNlVVJMOiBBUElfQkFTRV9VUkwsXG4gIGhlYWRlcnM6IHtcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH1cbn0pO1xuXG4vLyBHRVNUScOTTiBVTklWRVJTQUwgREUgUEVUSUNJT05FUyBBUElcbmFwaS5pbnRlcmNlcHRvcnMucmVxdWVzdC51c2UoXG4gIChjb25maWcpID0+IHtcbiAgICBjb25zdCBlbmRwb2ludCA9IGNvbmZpZy51cmwgfHwgJyc7XG4gICAgXG4gICAgLy8gRGVidWcgcGFyYSB0b2RhcyBsYXMgcGV0aWNpb25lc1xuICAgIC8vIGNvbnNvbGUubG9nKGBbQVBJXSBQcm9jZXNhbmRvIHNvbGljaXR1ZDogJHtlbmRwb2ludH1gKTtcbiAgICBcbiAgICAvLyBTT0xVQ0nDk04gUEFSQSBUw5pORUxFUyBERSBMT0NBTFRVTk5FTFxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoJ2xvY2EubHQnKSkge1xuICAgICAgLy8gU2kgZXMgbGEgcHJpbWVyYSB2ZXogcXVlIGRldGVjdGFtb3MgdW4gZXJyb3IgNTExLCBtb3N0cmFyIG1lbnNhamUgaW5mb3JtYXRpdm9cbiAgICAgIGNvbnN0IHR1bm5lbE1lc3NhZ2VTaG93biA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0dW5uZWxNZXNzYWdlU2hvd24nKSA9PT0gJ3RydWUnO1xuICAgICAgaWYgKCF0dW5uZWxNZXNzYWdlU2hvd24gJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0dW5uZWwtYXV0aC1tZXNzYWdlJykpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3R1bm5lbE1lc3NhZ2VTaG93bicsICd0cnVlJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBNb3N0cmFyIG1lbnNhamUgcGFyYSBhdXRlbnRpY2FyIGVsIHTDum5lbCBtYW51YWxtZW50ZVxuICAgICAgICBjb25zdCBtc2dEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbXNnRGl2LmlkID0gJ3R1bm5lbC1hdXRoLW1lc3NhZ2UnO1xuICAgICAgICBtc2dEaXYuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICBtc2dEaXYuc3R5bGUudG9wID0gJzUwcHgnO1xuICAgICAgICBtc2dEaXYuc3R5bGUubGVmdCA9ICc1MCUnO1xuICAgICAgICBtc2dEaXYuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTUwJSknO1xuICAgICAgICBtc2dEaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmOGQ3ZGEnO1xuICAgICAgICBtc2dEaXYuc3R5bGUuY29sb3IgPSAnIzcyMWMyNCc7XG4gICAgICAgIG1zZ0Rpdi5zdHlsZS5wYWRkaW5nID0gJzE1cHggMjBweCc7XG4gICAgICAgIG1zZ0Rpdi5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNXB4JztcbiAgICAgICAgbXNnRGl2LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgbXNnRGl2LnN0eWxlLm1heFdpZHRoID0gJzgwJSc7XG4gICAgICAgIG1zZ0Rpdi5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgbXNnRGl2LnN0eWxlLmJveFNoYWRvdyA9ICcwIDNweCAxMHB4IHJnYmEoMCwwLDAsMC4yKSc7XG4gICAgICAgIG1zZ0Rpdi5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgPGgzIHN0eWxlPVwibWFyZ2luLXRvcDogMDtcIj5BdXRlbnRpY2FjacOzbiBkZSB0w7puZWwgbmVjZXNhcmlhPC9oMz5cbiAgICAgICAgICA8cD5QYXJhIHVzYXIgZWwgdMO6bmVsIGNvcnJlY3RhbWVudGUsIG5lY2VzaXRhcyBhdXRlbnRpY2FyIGFtYm9zIHTDum5lbGVzIG1hbnVhbG1lbnRlLjwvcD5cbiAgICAgICAgICA8cD48c3Ryb25nPjEuPC9zdHJvbmc+IEhheiBjbGljIGVuIGVzdGUgYm90w7NuIHBhcmEgYWJyaXIgZWwgdMO6bmVsIGRlbCBiYWNrZW5kOjwvcD5cbiAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9hcGktbWFzY2xldC1pbXBlcmkubG9jYS5sdC9hcGkvdjEvaGVhbHRoXCIgdGFyZ2V0PVwiX2JsYW5rXCIgXG4gICAgICAgICAgICAgc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGJhY2tncm91bmQ6ICMyOGE3NDU7IGNvbG9yOiB3aGl0ZTsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogOHB4IDE1cHg7IG1hcmdpbjogMTBweCAwOyBib3JkZXItcmFkaXVzOiA0cHg7XCI+XG4gICAgICAgICAgICBBdXRlbnRpY2FyIFTDum5lbCBCYWNrZW5kXG4gICAgICAgICAgPC9hPlxuICAgICAgICAgIDxwPjxzdHJvbmc+Mi48L3N0cm9uZz4gRW4gbGEgbnVldmEgcGVzdGHDsWEsIGNvbXBsZXRhIGN1YWxxdWllciBhdXRlbnRpY2FjacOzbiBxdWUgc29saWNpdGUgTG9jYWxUdW5uZWw8L3A+XG4gICAgICAgICAgPHA+PHN0cm9uZz4zLjwvc3Ryb25nPiBDaWVycmEgZXNhIHBlc3Rhw7FhIHkgdnVlbHZlIGFxdcOtPC9wPlxuICAgICAgICAgIDxwPjxzdHJvbmc+NC48L3N0cm9uZz4gUmVjYXJnYSBlc3RhIHDDoWdpbmE8L3A+XG4gICAgICAgICAgPGJ1dHRvbiBpZD1cImNsb3NlLXR1bm5lbC1tc2dcIiBzdHlsZT1cImJhY2tncm91bmQ6ICM2Yzc1N2Q7IGJvcmRlcjogbm9uZTsgY29sb3I6IHdoaXRlOyBwYWRkaW5nOiA1cHggMTBweDsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAzcHg7IG1hcmdpbi10b3A6IDEwcHg7IGN1cnNvcjogcG9pbnRlcjtcIj5cbiAgICAgICAgICAgIENlcnJhciBlc3RlIG1lbnNhamVcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgYDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtc2dEaXYpO1xuICAgICAgICBcbiAgICAgICAgLy8gQcOxYWRpciBtYW5lamFkb3IgcGFyYSBjZXJyYXIgZWwgbWVuc2FqZVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvc2UtdHVubmVsLW1zZycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICBtc2dEaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEZvcm1hdGVhciBjb3JyZWN0YW1lbnRlIGxhIFVSTFxuICAgICAgaWYgKCFlbmRwb2ludC5zdGFydHNXaXRoKCcvYXBpL3YxJykgJiYgIWVuZHBvaW50LnN0YXJ0c1dpdGgoJ2FwaS92MScpKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBlbmRwb2ludC5zdGFydHNXaXRoKCcvJykgPyBlbmRwb2ludCA6IGAvJHtlbmRwb2ludH1gO1xuICAgICAgICBjb25maWcudXJsID0gYC9hcGkvdjEke3BhdGh9YDtcbiAgICAgICAgY29uc29sZS5sb2coYFtUw5pORUxdIEHDsWFkaWVuZG8gcHJlZmlqbzogJHtlbmRwb2ludH0gLT4gJHtjb25maWcudXJsfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBFdml0YXIgZHVwbGljYWNpw7NuIGRlIHByZWZpam9zIC9hcGkvdjFcbiAgICAgIGNvbnN0IGZpbmFsVXJsID0gYCR7Y29uZmlnLmJhc2VVUkwgfHwgJyd9JHtjb25maWcudXJsIHx8ICcnfWA7XG4gICAgICBpZiAoZmluYWxVcmwuaW5jbHVkZXMoJy9hcGkvdjEvYXBpL3YxLycpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbVMOaTkVMXSBDb3JyaWdpZW5kbyBVUkwgZHVwbGljYWRhOiAke2ZpbmFsVXJsfWApO1xuICAgICAgICBjb25zdCBmaXhlZFVybCA9IGZpbmFsVXJsLnJlcGxhY2UoJy9hcGkvdjEvYXBpL3YxLycsICcvYXBpL3YxLycpO1xuICAgICAgICBjb25zdCBiYXNlVXJsUGFydCA9IGNvbmZpZy5iYXNlVVJMIHx8ICcnO1xuICAgICAgICBjb25maWcudXJsID0gZml4ZWRVcmwucmVwbGFjZShiYXNlVXJsUGFydCwgJycpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1TDmk5FTF0gVVJMIGNvcnJlZ2lkYTogJHtiYXNlVXJsUGFydH0ke2NvbmZpZy51cmx9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFzZWd1cmFyIGVuY2FiZXphZG9zIEFVVEhcbiAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJykpIHtcbiAgICAgIGNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSBgQmVhcmVyICR7bG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyl9YDtcbiAgICB9XG4gICAgXG4gICAgLy8gTk8gYWN0aXZhbW9zIHdpdGhDcmVkZW50aWFscyBlbiBuaW5nw7puIGVudG9ybm8gcGFyYSBldml0YXIgcHJvYmxlbWFzIENPUlNcbiAgICAvLyBMYXMgY29va2llcyBubyBzb24gbmVjZXNhcmlhcyBwYXJhIG51ZXN0cm8gZXNxdWVtYSBkZSBhdXRlbnRpY2FjacOzbiBKV1RcbiAgICBjb25maWcud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG4gICAgXG4gICAgLy8gU2kgZXN0YW1vcyBlbiBwcm9kdWNjacOzbiwgY29uZmlndXJhY2nDs24gYWRpY2lvbmFsXG4gICAgaWYgKGlzUHJvZHVjdGlvbikge1xuICAgICAgLy8gRW4gcHJvZHVjY2nDs24sIGFzZWd1cmFyIHF1ZSB0b2RhcyBsYXMgcGV0aWNpb25lcyBzb24gc2VndXJhc1xuICAgICAgaWYgKGNvbmZpZy51cmwgJiYgY29uZmlnLnVybC5zdGFydHNXaXRoKCdodHRwOicpKSB7XG4gICAgICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsLnJlcGxhY2UoJ2h0dHA6JywgJ2h0dHBzOicpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBBc2VndXJhciBxdWUgYmFzZVVSTCBlcyBIVFRQUyBlbiBwcm9kdWNjacOzblxuICAgICAgaWYgKGNvbmZpZy5iYXNlVVJMICYmIGNvbmZpZy5iYXNlVVJMLnN0YXJ0c1dpdGgoJ2h0dHA6JykpIHtcbiAgICAgICAgY29uZmlnLmJhc2VVUkwgPSBjb25maWcuYmFzZVVSTC5yZXBsYWNlKCdodHRwOicsICdodHRwczonKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coYFtQUk9EXSBVUkwgZmluYWw6ICR7Y29uZmlnLmJhc2VVUkx9JHtjb25maWcudXJsfWApO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gY29uZmlnO1xuICB9LFxuICAoZXJyb3IpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG4pO1xuXG4vLyBJbnRlcmNlcHRvciBwYXJhIGHDsWFkaXIgY3JlZGVuY2lhbGVzIGEgdG9kYXMgbGFzIHBldGljaW9uZXNcbmFwaS5pbnRlcmNlcHRvcnMucmVxdWVzdC51c2UoXG4gIChjb25maWcpID0+IHtcbiAgICAvLyBJbnRlbnRhciB1c2FyIGVsIHRva2VuIEpXVCBkZWwgbG9jYWxTdG9yYWdlXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIGNvbmZpZy5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBgQmVhcmVyICR7dG9rZW59YDtcbiAgICAgICAgICBjb25zb2xlLmxvZygnVXNhbmRvIHRva2VuIEpXVCBwYXJhIGF1dGVudGljYWNpw7NuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZSBlbmNvbnRyw7MgdG9rZW4gZW4gbG9jYWxTdG9yYWdlJyk7XG4gICAgICAgICAgLy8gT3BjaW9uYWw6IHJlZGlyaWdpciBhIGxvZ2luIHNpIG5vIGhheSB0b2tlblxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignTm8gc2UgcHVkbyBhY2NlZGVyIGEgbG9jYWxTdG9yYWdlOicsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29uZmlnO1xuICB9LFxuICAoZXJyb3IpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG4pO1xuXG4vLyBGdW5jacOzbiBwYXJhIGNvbmZpZ3VyYXIgbGEgQVBJXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlQXBpKGJhc2VVcmw6IHN0cmluZywgdXNlTW9ja0RhdGE6IGJvb2xlYW4gPSBmYWxzZSkge1xuICBBUElfQkFTRV9VUkwgPSBiYXNlVXJsO1xuICBVU0VfTU9DS19EQVRBID0gdXNlTW9ja0RhdGE7XG4gIGFwaS5kZWZhdWx0cy5iYXNlVVJMID0gYmFzZVVybDtcbiAgXG4gIC8vIGNvbnNvbGUubG9nKGBBUEkgY29uZmlndXJhZGEgY29uIFVSTCBiYXNlOiAke2Jhc2VVcmx9YCk7XG4gIC8vIGNvbnNvbGUubG9nKGBVc28gZGUgZGF0b3Mgc2ltdWxhZG9zOiAke3VzZU1vY2tEYXRhID8gJ1PDjScgOiAnTk8nfWApO1xufVxuXG4vLyBGdW5jacOzbiBwYXJhIHJlYWxpemFyIHBldGljaW9uZXMgR0VUXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0PFQgPSBhbnk+KGVuZHBvaW50OiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBOb3JtYWxpemFyIGVuZHBvaW50IGFzZWd1cmFuZG8gcXVlIGVtcGllY2UgY29uIC9cbiAgICBjb25zdCBub3JtYWxpemVkRW5kcG9pbnQgPSBlbmRwb2ludC5zdGFydHNXaXRoKCcvJykgPyBlbmRwb2ludCA6IGAvJHtlbmRwb2ludH1gO1xuICAgIFxuICAgIC8vIElNUE9SVEFOVEU6IEHDsWFkaXIgcHJlZmlqbyAvYXBpL3YxIHNpIG5vIGVzdMOhIHByZXNlbnRlIHkgbm8gaGF5IHlhIHVuIHByZWZpam8gZW4gbGEgVVJMIGJhc2VcbiAgICBsZXQgYXBpRW5kcG9pbnQgPSBub3JtYWxpemVkRW5kcG9pbnQ7XG4gICAgLy8gQ29tcHJvYmFyIHNpIHlhIGhheSB1biBwcmVmaWpvIGVuIGxhIFVSTCBiYXNlIChjb25maWcuYmFzZVVSTCkgbyBzaSB5YSBoYXkgdW4gcHJlZmlqbyBlbiBlbCBlbmRwb2ludFxuICAgIGNvbnN0IGJhc2VVcmxIYXNQcmVmaXggPSBBUElfQkFTRV9VUkwuaW5jbHVkZXMoJy9hcGkvdjEnKTtcbiAgICBpZiAoIWFwaUVuZHBvaW50LnN0YXJ0c1dpdGgoJy9hcGkvdjEnKSAmJiAhYmFzZVVybEhhc1ByZWZpeCkge1xuICAgICAgYXBpRW5kcG9pbnQgPSBgL2FwaS92MSR7bm9ybWFsaXplZEVuZHBvaW50fWA7XG4gICAgICBjb25zb2xlLmxvZyhgQcOxYWRpZW5kbyBwcmVmaWpvIGEgZW5kcG9pbnQ6ICR7bm9ybWFsaXplZEVuZHBvaW50fSAtPiAke2FwaUVuZHBvaW50fWApO1xuICAgIH1cbiAgICBcbiAgICAvLyBRdWl0YXIgLyBhbCBmaW5hbCBzaSBlbCBlbmRwb2ludCBsbyB0aWVuZSB5IG5vIGNvbnRpZW5lIHF1ZXJ5IHBhcmFtc1xuICAgIC8vIEVsIGJhY2tlbmQgZXN0w6EgcmVkaXJpZ2llbmRvIGxvcyBlbmRwb2ludHMgY29uIC8gYWwgZmluYWwgYSBsb3MgcXVlIG5vIGxvIHRpZW5lblxuICAgIGNvbnN0IGZpbmFsRW5kcG9pbnQgPSAoIWFwaUVuZHBvaW50LmluY2x1ZGVzKCc/JykgJiYgYXBpRW5kcG9pbnQuZW5kc1dpdGgoJy8nKSkgXG4gICAgICA/IGFwaUVuZHBvaW50LnNsaWNlKDAsIC0xKSBcbiAgICAgIDogYXBpRW5kcG9pbnQ7XG4gICAgXG4gICAgLy8gSU1QT1JUQU5URTogRW4gcHJvZHVjY2nDs24sIHNvbG8gaW1wcmltaXIgbGEgcnV0YSByZWxhdGl2YVxuICAgIGlmIChpc1Byb2R1Y3Rpb24pIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBSZWFsaXphbmRvIHBldGljacOzbiBHRVQgYTogJHtmaW5hbEVuZHBvaW50fWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhgUmVhbGl6YW5kbyBwZXRpY2nDs24gR0VUIGE6ICR7ZmluYWxFbmRwb2ludH1gKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuZ2V0PFQ+KGZpbmFsRW5kcG9pbnQpO1xuICAgIFxuICAgIC8vIFJlZ2lzdHJhciBpbmZvcm1hY2nDs24gZGV0YWxsYWRhIGRlIGxhIHJlc3B1ZXN0YSBwYXJhIGRlcHVyYWNpw7NuXG4gICAgLy8gY29uc29sZS5sb2coYOKchSBSZXNwdWVzdGEgcmVjaWJpZGEgZGUgJHtmaW5hbEVuZHBvaW50fTpgLCB7XG4gICAgLy8gICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAvLyAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgLy8gICBkYXRhVHlwZTogdHlwZW9mIHJlc3BvbnNlLmRhdGEsXG4gICAgLy8gICBpc051bGw6IHJlc3BvbnNlLmRhdGEgPT09IG51bGwsXG4gICAgLy8gICBpc1VuZGVmaW5lZDogcmVzcG9uc2UuZGF0YSA9PT0gdW5kZWZpbmVkLFxuICAgIC8vICAgZGF0YUxlbmd0aDogcmVzcG9uc2UuZGF0YSAmJiB0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcgPyBPYmplY3Qua2V5cyhyZXNwb25zZS5kYXRhKS5sZW5ndGggOiAnTi9BJ1xuICAgIC8vIH0pO1xuICAgIFxuICAgIC8vIFNpIGxhIGRhdGEgZXMgdW5kZWZpbmVkIG8gbnVsbCwgcmVnaXN0cmFyIHdhcm5pbmcgeSBkZXZvbHZlciBvYmpldG8gdmFjw61vXG4gICAgaWYgKHJlc3BvbnNlLmRhdGEgPT09IHVuZGVmaW5lZCB8fCByZXNwb25zZS5kYXRhID09PSBudWxsKSB7XG4gICAgICAvLyBjb25zb2xlLndhcm4oYOKaoO+4jyBEYXRvcyByZWNpYmlkb3MgdmFjw61vcyBlbiAke2ZpbmFsRW5kcG9pbnR9YCk7XG4gICAgICBcbiAgICAgIC8vIERldm9sdmVyIG9iamV0byB2YWPDrW8gZGVsIHRpcG8gZXNwZXJhZG8gcGFyYSBldml0YXIgZXJyb3Jlc1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVzcG9uc2UuZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIFtdIGFzIHVua25vd24gYXMgVDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7fSBhcyBUO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBNZWpvcmFyIGVsIGxvZyBkZSBlcnJvcmVzIHBhcmEgZmFjaWxpdGFyIGxhIGRlcHVyYWNpw7NuXG4gICAgaWYgKGF4aW9zLmlzQXhpb3NFcnJvcihlcnJvcikpIHtcbiAgICAgIC8vIFNvbG8gbWFudGVuZW1vcyB1biBsb2cgZGUgZXJyb3IgYsOhc2ljbyBwYXJhIGRpYWduw7NzdGljb1xuICAgICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIGVuIHBldGljacOzbiBHRVQgYSAke2VuZHBvaW50fTogJHtlcnJvci5tZXNzYWdlfSAoJHtlcnJvci5yZXNwb25zZT8uc3RhdHVzIHx8ICdzaW4gc3RhdHVzJ30pYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBubyByZWxhY2lvbmFkbyBjb24gQXhpb3MgZW4gJHtlbmRwb2ludH06ICR7ZXJyb3J9YCk7XG4gICAgfVxuICAgIFxuICAgIC8vIE1lY2FuaXNtbyBkZSByZWludGVudG8gcGFyYSBlcnJvcmVzIDQwNFxuICAgIGlmIChheGlvcy5pc0F4aW9zRXJyb3IoZXJyb3IpICYmIGVycm9yLnJlc3BvbnNlPy5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgLy8gT2J0ZW5lciBsYSBVUkwgb3JpZ2luYWwgcXVlIGZhbGzDs1xuICAgICAgY29uc3Qgb3JpZ2luYWxVcmwgPSBlcnJvci5jb25maWc/LnVybCB8fCAnJztcbiAgICAgIGNvbnN0IGFic29sdXRlVXJsID0gZXJyb3IuY29uZmlnPy5iYXNlVVJMID8gYCR7ZXJyb3IuY29uZmlnLmJhc2VVUkx9JHtvcmlnaW5hbFVybH1gIDogb3JpZ2luYWxVcmw7XG4gICAgICBcbiAgICAgIC8vIFJlZ2lzdHJhciBlbCBmYWxsbyBwYXJhIGRpYWduw7NzdGljb1xuICAgICAgLy8gY29uc29sZS53YXJuKGDimqDvuI8gRXJyb3IgNDA0IGVuOiAke2Fic29sdXRlVXJsfWApO1xuICAgICAgXG4gICAgICAvLyBFbiBkZXNhcnJvbGxvIGxvY2FsLCBzaW1wbGVtZW50ZSByZWdpc3RyYW1vcyBlbCBlcnJvciB5IGRlamFtb3MgcXVlIGZhbGxlIG5vcm1hbG1lbnRlXG4gICAgICBpZiAoIWlzUHJvZHVjdGlvbikge1xuICAgICAgICAvLyBjb25zb2xlLndhcm4oYEVudG9ybm8gZGUgZGVzYXJyb2xsbzogc2luIHJlaW50ZW50b3MgYXV0b23DoXRpY29zYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBFbiBwcm9kdWNjacOzbiwgaW50ZW50YW1vcyBlc3RyYXRlZ2lhcyBkZSByZWN1cGVyYWNpw7NuXG4gICAgICAgIFxuICAgICAgICAvLyBFc3RyYXRlZ2lhIDE6IENvbnZlcnRpciBVUkwgYWJzb2x1dGEgYSByZWxhdGl2YVxuICAgICAgICBpZiAoYWJzb2x1dGVVcmwuaW5jbHVkZXMoJzovLycpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4dHJhZXIgc29sbyBlbCBwYXRoIHBhcmEgaGFjZXIgdW5hIHBldGljacOzbiByZWxhdGl2YVxuICAgICAgICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTChhYnNvbHV0ZVVybCk7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSB1cmxPYmoucGF0aG5hbWUgKyB1cmxPYmouc2VhcmNoO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYPCflKcgRGV0ZWN0YWRhIFVSTCBhYnNvbHV0YSwgcmVpbnRlbnRhbmRvIGNvbiBydXRhIHJlbGF0aXZhOiAke3JlbGF0aXZlUGF0aH1gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSGFjZXIgdW5hIHBldGljacOzbiBjb21wbGV0YW1lbnRlIHJlbGF0aXZhXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBDb25maWd1cmFyIG1hbnVhbG1lbnRlIHBhcmEgaWdub3JhciBjdWFscXVpZXIgYmFzZVVSTFxuICAgICAgICAgICAgICBjb25zdCByZXRyeVJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0PFQ+KHJlbGF0aXZlUGF0aCwge1xuICAgICAgICAgICAgICAgIGJhc2VVUkw6ICcnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGVycm9yLmNvbmZpZz8uaGVhZGVyc1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOKchSDDiXhpdG8gY29uIGxhIHJ1dGEgcmVsYXRpdmEhYCk7XG4gICAgICAgICAgICAgIHJldHVybiByZXRyeVJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9IGNhdGNoIChyZXRyeUVycm9yKSB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoYPCfkqUgRmFsbMOzIGVsIGludGVudG8gY29uIHJ1dGEgcmVsYXRpdmE6ICR7cmVsYXRpdmVQYXRofWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUud2FybihgTm8gc2UgcHVkbyBwcm9jZXNhciBsYSBVUkwgcGFyYSByZWludGVudG86ICR7YWJzb2x1dGVVcmx9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBFc3RyYXRlZ2lhIDI6IENvcnJlZ2lyIFVSTHMgbWFsIGZvcm1hZGFzXG4gICAgICAgIGlmIChvcmlnaW5hbFVybC5pbmNsdWRlcygnLy8nKSB8fCBvcmlnaW5hbFVybC5pbmNsdWRlcygnYXBpL2FwaScpIHx8IFxuICAgICAgICAgICAgKG9yaWdpbmFsVXJsLmluY2x1ZGVzKCcvYXBpL3YxJykgJiYgZW5kcG9pbnQuaW5jbHVkZXMoJy9hcGkvdjEnKSkpIHtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg8J+UpyBEZXRlY3RhZGEgVVJMIG1hbCBmb3JtYWRhLCBpbnRlbnRhbmRvIGNvcnJlZ2lyLi4uYCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQ29ycmVnaXIgcHJvYmxlbWFzIGNvbXVuZXMgZW4gbGFzIFVSTHNcbiAgICAgICAgICBsZXQgY29ycmVjdGVkVXJsID0gZW5kcG9pbnQucmVwbGFjZSgvYXBpXFwvYXBpL2csICdhcGknKTtcbiAgICAgICAgICBjb3JyZWN0ZWRVcmwgPSBjb3JyZWN0ZWRVcmwucmVwbGFjZSgvXFwvYXBpXFwvdjFcXC9hcGlcXC92MS9nLCAnL2FwaS92MScpO1xuICAgICAgICAgIGNvcnJlY3RlZFVybCA9IGNvcnJlY3RlZFVybC5yZXBsYWNlKC9cXC9cXC9hcGlcXC92MS9nLCAnL2FwaS92MScpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFNpIGxhIFVSTCBzZSBjb3JyaWdlLCBpbnRlbnRhciBudWV2YW1lbnRlXG4gICAgICAgICAgaWYgKGNvcnJlY3RlZFVybCAhPT0gZW5kcG9pbnQpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDwn5SoIFJlaW50ZW50YW5kbyBjb24gVVJMIGNvcnJlZ2lkYTogJHtjb3JyZWN0ZWRVcmx9YCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCByZXRyeVJlc3BvbnNlID0gYXdhaXQgYXBpLmdldDxUPihjb3JyZWN0ZWRVcmwpO1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg4pyFIMOJeGl0byBjb24gVVJMIGNvcnJlZ2lkYSFgKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJldHJ5UmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHJldHJ5RXJyb3IpIHtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihg8J+SpSBUYW1iacOpbiBmYWxsw7MgZWwgcmVpbnRlbnRvIGNvbiBVUkwgY29ycmVnaWRhYCk7ICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBFc3RyYXRlZ2lhIDM6IMOabHRpbW8gaW50ZW50byBjb24gcnV0YSBhYnNvbHV0YSBkZXNkZSByYcOtelxuICAgICAgICBpZiAoZXJyb3IuY29uZmlnPy5iYXNlVVJMKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBmaW5hbEF0dGVtcHRVcmwgPSBvcmlnaW5hbFVybDtcbiAgICAgICAgICAgIGlmICghZmluYWxBdHRlbXB0VXJsLnN0YXJ0c1dpdGgoJy9hcGknKSkge1xuICAgICAgICAgICAgICBmaW5hbEF0dGVtcHRVcmwgPSBgL2FwaS92MS8ke2ZpbmFsQXR0ZW1wdFVybC5zdGFydHNXaXRoKCcvJykgPyBmaW5hbEF0dGVtcHRVcmwuc3Vic3RyaW5nKDEpIDogZmluYWxBdHRlbXB0VXJsfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDwn6SWIMOabHRpbW8gaW50ZW50byBjb24gcnV0YSBhYnNvbHV0YTogJHtmaW5hbEF0dGVtcHRVcmx9YCk7XG4gICAgICAgICAgICBjb25zdCBsYXN0UmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQ8VD4oZmluYWxBdHRlbXB0VXJsLCB7XG4gICAgICAgICAgICAgIGJhc2VVUkw6ICcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDinIUgw4l4aXRvIGVuIGVsIMO6bHRpbW8gaW50ZW50byFgKTtcbiAgICAgICAgICAgIHJldHVybiBsYXN0UmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICB9IGNhdGNoIChsYXN0RXJyb3IpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoYPCfkqUgRmFsbMOzIGVsIMO6bHRpbW8gaW50ZW50byBkZSByZWN1cGVyYWNpw7NuYCk7IFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBTaSBsbGVnYW1vcyBhcXXDrSwgZWwgcmVpbnRlbnRvIGZhbGzDsyBvIG5vIHNlIGludGVudMOzLCBkZXZvbHZlciBhcnJheSB2YWPDrW8gcGFyYSBlbmRwb2ludHMgZGUgbGlzdGFcbiAgICAgIGlmIChlbmRwb2ludC5pbmNsdWRlcygnbGlzdCcpIHx8IFxuICAgICAgICAgIGVuZHBvaW50LmluY2x1ZGVzKCdhbGwnKSB8fCBcbiAgICAgICAgICBlbmRwb2ludC5pbmNsdWRlcygnZXhwbG90YWNpb25zJykgfHwgXG4gICAgICAgICAgZW5kcG9pbnQuaW5jbHVkZXMoJ2FuaW1hbGVzJykpIHtcbiAgICAgICAgLy8gY29uc29sZS53YXJuKGBEZXZvbHZpZW5kbyBhcnJheSB2YWPDrW8gcGFyYSAke2VuZHBvaW50fSBkZWJpZG8gYSA0MDRgKTtcbiAgICAgICAgcmV0dXJuIFtdIGFzIHVua25vd24gYXMgVDtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gRGV2b2x2ZXIgb2JqZXRvIHZhY8OtbyBwYXJhIGV2aXRhciBxdWUgbGEgVUkgc2Ugcm9tcGFcbiAgICByZXR1cm4ge30gYXMgVDtcbiAgfVxufVxuXG4vLyBGdW5jacOzbiBwYXJhIHJlYWxpemFyIHBldGljaW9uZXMgUE9TVFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3Q8VCA9IGFueT4oZW5kcG9pbnQ6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxUPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEVuZHBvaW50ID0gZW5kcG9pbnQuc3RhcnRzV2l0aCgnLycpID8gZW5kcG9pbnQgOiBgLyR7ZW5kcG9pbnR9YDtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5wb3N0PFQ+KG5vcm1hbGl6ZWRFbmRwb2ludCwgZGF0YSk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgZW4gcGV0aWNpw7NuIFBPU1QgYSAke2VuZHBvaW50fTpgLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLy8gRnVuY2nDs24gcGFyYSByZWFsaXphciBwZXRpY2lvbmVzIFBVVFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1dDxUID0gYW55PihlbmRwb2ludDogc3RyaW5nLCBkYXRhOiBhbnkpOiBQcm9taXNlPFQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBub3JtYWxpemVkRW5kcG9pbnQgPSBlbmRwb2ludC5zdGFydHNXaXRoKCcvJykgPyBlbmRwb2ludCA6IGAvJHtlbmRwb2ludH1gO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnB1dDxUPihub3JtYWxpemVkRW5kcG9pbnQsIGRhdGEpO1xuICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGVuIHBldGljacOzbiBQVVQgYSAke2VuZHBvaW50fTpgLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLy8gRnVuY2nDs24gcGFyYSByZWFsaXphciBwZXRpY2lvbmVzIFBBVENIXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGF0Y2g8VCA9IGFueT4oZW5kcG9pbnQ6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxUPiB7XG4gIHRyeSB7XG4gICAgLy8gTm9ybWFsaXphciBlbmRwb2ludFxuICAgIGNvbnN0IG5vcm1hbGl6ZWRFbmRwb2ludCA9IGVuZHBvaW50LnN0YXJ0c1dpdGgoJy8nKSA/IGVuZHBvaW50IDogYC8ke2VuZHBvaW50fWA7XG4gICAgY29uc29sZS5sb2coYFJlYWxpemFuZG8gcGV0aWNpw7NuIFBBVENIIGEgJHtBUElfQkFTRV9VUkx9JHtub3JtYWxpemVkRW5kcG9pbnR9YCk7XG4gICAgY29uc29sZS5sb2coJ0RhdG9zIGVudmlhZG9zOicsIGRhdGEpO1xuICAgIFxuICAgIC8vIFJlYWxpemFyIHBldGljacOzblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnBhdGNoPFQ+KG5vcm1hbGl6ZWRFbmRwb2ludCwgZGF0YSk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgZW4gcGV0aWNpw7NuIFBBVENIIGEgJHtlbmRwb2ludH06YCwgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8vIEZ1bmNpw7NuIHBhcmEgcmVhbGl6YXIgcGV0aWNpb25lcyBERUxFVEVcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWw8VCA9IGFueT4oZW5kcG9pbnQ6IHN0cmluZyk6IFByb21pc2U8VD4ge1xuICB0cnkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRFbmRwb2ludCA9IGVuZHBvaW50LnN0YXJ0c1dpdGgoJy8nKSA/IGVuZHBvaW50IDogYC8ke2VuZHBvaW50fWA7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuZGVsZXRlPFQ+KG5vcm1hbGl6ZWRFbmRwb2ludCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgZW4gcGV0aWNpw7NuIERFTEVURSBhICR7ZW5kcG9pbnR9OmAsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vLyBGdW5jacOzbiBwYXJhIHZlcmlmaWNhciBzaSBlbCB1c3VhcmlvIGVzdMOhIGF1dGVudGljYWRvXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIC8vIFZlcmlmaWNhciBzaSBoYXkgdW4gdG9rZW4gZW4gbG9jYWxTdG9yYWdlXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XG4gICAgICBpZiAoIXRva2VuKSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIC8vIE9wY2lvbmFsbWVudGUsIHZlcmlmaWNhciBsYSB2YWxpZGV6IGRlbCB0b2tlbiBjb24gZWwgYmFja2VuZFxuICAgICAgLy8gYXdhaXQgZ2V0KCcvYXV0aC92ZXJpZnknKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgdmVyaWZpY2FyIGF1dGVudGljYWNpw7NuOicsIGVycm9yKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gRnVuY2nDs24gcGFyYSBvYnRlbmVyIGluZm9ybWFjacOzbiBkZWwgdXN1YXJpbyBhY3R1YWxcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRVc2VySW5mbygpIHtcbiAgdHJ5IHtcbiAgICBpZiAoYXdhaXQgaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgIHJldHVybiBhd2FpdCBnZXQoJy91c2Vycy9tZScpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBvYnRlbmVyIGluZm9ybWFjacOzbiBkZWwgdXN1YXJpbzonLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8gRnVuY2nDs24gcGFyYSBpbmljaWFyIHNlc2nDs24gdXNhbmRvIGVsIGZvcm1hdG8gT0F1dGgyIHJlcXVlcmlkb1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ2luKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICAvLyBDcmVhciBsb3MgZGF0b3MgZW4gZm9ybWF0byBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQgcXVlIGVzcGVyYSBPQXV0aDJcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ3VzZXJuYW1lJywgdXNlcm5hbWUpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG4gICAgZm9ybURhdGEuYXBwZW5kKCdncmFudF90eXBlJywgJ3Bhc3N3b3JkJyk7XG4gICAgXG4gICAgLy8gUnV0YSBkZSBsb2dpbiBkaXJlY3RhIHNpbiBjb25jYXRlbmFyIGJhc2VVUkwgcGFyYSBldml0YXIgcHJvYmxlbWFzXG4gICAgY29uc3QgbG9naW5FbmRwb2ludCA9ICcvYXV0aC9sb2dpbic7XG4gICAgXG4gICAgLy8gRGV0ZXJtaW5hciBxdcOpIFVSTCB1c2FyIHBhcmEgZWwgbG9naW5cbiAgICBsZXQgbG9naW5VcmwgPSBsb2dpbkVuZHBvaW50O1xuICAgIGxldCB1c2VCYXNlVXJsT3ZlcnJpZGUgPSBmYWxzZTtcbiAgICBsZXQgYmFzZVVybE92ZXJyaWRlID0gJyc7XG4gICAgXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgICAgIGNvbnN0IGlzTG9jYWxOZXR3b3JrID0gXG4gICAgICAgIGhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fCBcbiAgICAgICAgaG9zdG5hbWUgPT09ICcxMjcuMC4wLjEnIHx8XG4gICAgICAgIC9eMTkyXFwuMTY4XFwuLy50ZXN0KGhvc3RuYW1lKSB8fFxuICAgICAgICAvXjEwXFwuLy50ZXN0KGhvc3RuYW1lKSB8fFxuICAgICAgICAvXjE3MlxcLigxWzYtOV18MlswLTldfDNbMC0xXSkvLnRlc3QoaG9zdG5hbWUpO1xuICAgICAgXG4gICAgICBpZiAoaXNMb2NhbE5ldHdvcmspIHtcbiAgICAgICAgLy8gUGFyYSByZWRlcyBsb2NhbGVzIHVzYW5kbyBJUCwgZm9yemFyIGNvbmV4acOzbiBhIGxvY2FsaG9zdDo4MDAwXG4gICAgICAgIHVzZUJhc2VVcmxPdmVycmlkZSA9IHRydWU7XG4gICAgICAgIGJhc2VVcmxPdmVycmlkZSA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL3YxJztcbiAgICAgICAgbG9naW5VcmwgPSAnL2F1dGgvbG9naW4nOyAvLyBTaW4gYXBpL3YxIHlhIHF1ZSBlc3TDoSBlbiBiYXNlVXJsT3ZlcnJpZGVcbiAgICAgICAgY29uc29sZS5sb2coYFJlYWxpemFuZG8gbG9naW4gYTogJHtiYXNlVXJsT3ZlcnJpZGV9JHtsb2dpblVybH1gKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNQcm9kdWN0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBSZWFsaXphbmRvIGxvZ2luIGE6IC9hcGkvdjEke2xvZ2luRW5kcG9pbnR9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgUmVhbGl6YW5kbyBsb2dpbiBhOiAke2FwaS5kZWZhdWx0cy5iYXNlVVJMfSR7bG9naW5FbmRwb2ludH1gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coYFJlYWxpemFuZG8gbG9naW4gYTogJHthcGkuZGVmYXVsdHMuYmFzZVVSTH0ke2xvZ2luRW5kcG9pbnR9YCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFJlYWxpemFyIGxhIHNvbGljaXR1ZCBjb24gZWwgZm9ybWF0byBjb3JyZWN0b1xuICAgIGxldCByZXNwb25zZTtcbiAgICBpZiAodXNlQmFzZVVybE92ZXJyaWRlKSB7XG4gICAgICAvLyBDcmVhciB1bmEgaW5zdGFuY2lhIGRlIGF4aW9zIHRlbXBvcmFsIHBhcmEgZXN0YSBwZXRpY2nDs24gZXNwZWPDrWZpY2FcbiAgICAgIGNvbnN0IHRlbXBBeGlvcyA9IGF4aW9zLmNyZWF0ZSh7XG4gICAgICAgIGJhc2VVUkw6IGJhc2VVcmxPdmVycmlkZSxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgdGVtcEF4aW9zLnBvc3QobG9naW5VcmwsIGZvcm1EYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNhciBjb25maWd1cmFjacOzbiBlc3TDoW5kYXJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgYXBpLnBvc3QobG9naW5FbmRwb2ludCwgZm9ybURhdGEsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgLy8gR3VhcmRhciBlbCB0b2tlbiBlbiBsb2NhbFN0b3JhZ2VcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2FsU3RvcmFnZSAmJiByZXNwb25zZS5kYXRhLmFjY2Vzc190b2tlbikge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuJywgcmVzcG9uc2UuZGF0YS5hY2Nlc3NfdG9rZW4pO1xuICAgICAgY29uc29sZS5sb2coJ1Rva2VuIGd1YXJkYWRvIGNvcnJlY3RhbWVudGUnKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGluaWNpYXIgc2VzacOzbjonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLy8gRnVuY2nDs24gcGFyYSBvYnRlbmVyIGxhIFVSTCBiYXNlIGRlIGxhIEFQSSAocGFyYSBkZXB1cmFjacOzbilcbmNvbnN0IGdldEJhc2VVcmwgPSAoKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIEFQSV9CQVNFX1VSTDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ2V0LFxuICBwb3N0LFxuICBwdXQsXG4gIHBhdGNoLFxuICBkZWwsXG4gIGlzQXV0aGVudGljYXRlZCxcbiAgZ2V0VXNlckluZm8sXG4gIGxvZ2luLFxuICBjb25maWd1cmVBcGksXG4gIGdldEJhc2VVcmxcbn07XG4iXSwibWFwcGluZ3MiOiJBQWlCQSxPQUFPLFdBQVc7QUFHbEIsSUFBSSxjQUFzQjtBQUMxQixJQUFJLGVBQXVCO0FBQzNCLElBQUksZ0JBQXlCO0FBRzdCLE1BQU0sYUFBYTtBQUFBLEVBQ2pCLGFBQWE7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsRUFDUjtBQUFBLEVBQ0EsWUFBWTtBQUFBO0FBQUEsSUFFVixVQUFVO0FBQUEsSUFDVixNQUFN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