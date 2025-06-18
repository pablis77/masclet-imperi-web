import axios from 'axios';
import { e as environment, A as API_BASE_URL, i as isProduction, a as API_DEFAULT_HEADERS, b as API_TIMEOUT, T as TOKEN_NAME } from './apiConfigAdapter_DF5Xcq8a.mjs';

let ENVIRONMENT = environment;
console.log(`[ApiService] Entorno: ${ENVIRONMENT}`);
console.log(`[ApiService] API configurada para conectarse a: ${API_BASE_URL}`);
if (isProduction) {
  console.log("[ApiService] Ejecutando en modo PRODUCCIÓN");
} else {
  console.log("[ApiService] Ejecutando en modo LOCAL");
}
let apiBaseUrl = API_BASE_URL;
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: API_TIMEOUT,
  headers: API_DEFAULT_HEADERS
});
api.interceptors.request.use(
  (config) => {
    config.url || "";
    const finalUrl = `${config.baseURL || ""}${config.url || ""}`;
    if (finalUrl.includes("/api/v1/api/v1/")) {
      console.log(`[API] Corrigiendo URL duplicada: ${finalUrl}`);
      const fixedUrl = finalUrl.replace("/api/v1/api/v1/", "/api/v1/");
      const baseUrlPart = config.baseURL || "";
      config.url = fixedUrl.replace(baseUrlPart, "");
      console.log(`[API] URL corregida: ${baseUrlPart}${config.url}`);
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem(TOKEN_NAME)) {
      config.headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_NAME)}`;
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
        const token = localStorage.getItem(TOKEN_NAME);
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
function configureApi(baseUrl, useMockData = false) {
  apiBaseUrl = baseUrl;
  api.defaults.baseURL = baseUrl;
  console.log(`API configurada con URL base: ${baseUrl}`);
  console.log(`Uso de datos simulados: ${useMockData ? "SÍ" : "NO"}`);
}
async function get(endpoint) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let apiEndpoint = normalizedEndpoint;
    const baseUrlHasPrefix = apiBaseUrl.includes("/api/v1");
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
      if (!isProduction) ; else {
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
async function post(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await api.post(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición POST a ${endpoint}:`, error);
    throw error;
  }
}
async function put(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await api.put(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PUT a ${endpoint}:`, error);
    throw error;
  }
}
async function patch(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    console.log(`Realizando petición PATCH a ${apiBaseUrl}${normalizedEndpoint}`);
    console.log("Datos enviados:", data);
    const response = await api.patch(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PATCH a ${endpoint}:`, error);
    throw error;
  }
}
async function del(endpoint) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await api.delete(normalizedEndpoint);
    return response.data;
  } catch (error) {
    console.error(`Error en petición DELETE a ${endpoint}:`, error);
    throw error;
  }
}
async function isAuthenticated() {
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
async function getUserInfo() {
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
async function login(username, password) {
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
function getBaseUrl() {
  return apiBaseUrl;
}
const apiService = {
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

export { apiService as a };
//# sourceMappingURL=apiService_BTDQ39hA.mjs.map
