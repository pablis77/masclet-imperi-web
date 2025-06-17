import axios from 'axios';

const isLocalTunnel = typeof window !== "undefined" && window.location.hostname.includes("loca.lt");
const baseURL = isLocalTunnel ? "https://api-masclet-imperi.loca.lt/api/v1" : "http://localhost:8000/api/v1";
const API_BASE_URL = "/api";
function normalizePath(path) {
  path = path.startsWith("/") ? path.substring(1) : path;
  return path.endsWith("/") ? path : `${path}/`;
}
console.log("🌐 Modo de conexión:", isLocalTunnel ? "Local Tunnel" : "Local");
console.log("🔌 API Base URL:", baseURL);
const api = axios.create({
  baseURL,
  timeout: 15e3,
  headers: {
    "Content-Type": "application/json",
    "X-Environment": isLocalTunnel ? "tunnel" : "local"
  },
  withCredentials: false
  // Evita problemas con CORS
});
api.interceptors.request.use(
  (config) => {
    console.log("Usando token JWT para autenticación");
    let token = null;
    const possibleKeys = ["token", "accessToken", "jwt", "access_token"];
    if (typeof window !== "undefined" && window.localStorage) {
      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          token = value;
          console.log(`Token encontrado en localStorage['${key}']`);
          break;
        }
      }
    }
    if (!token && typeof window !== "undefined" && window.sessionStorage) {
      for (const key of possibleKeys) {
        const value = sessionStorage.getItem(key);
        if (value) {
          token = value;
          console.log(`Token encontrado en sessionStorage['${key}']`);
          break;
        }
      }
    }
    if (token && config.headers) {
      if (token.startsWith("Bearer ")) {
        config.headers["Authorization"] = token;
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      config.headers["X-Auth-Token"] = token;
      console.log("🔐 Token JWT añadido correctamente a las cabeceras");
    } else {
      console.warn("⚠️ No se encontró token JWT para autenticar la petición");
      console.log("URL de la petición:", config.url);
      console.log("Método:", config.method);
      console.log("Headers actuales:", config.headers);
      if (typeof window !== "undefined") {
        console.log("Contenido de localStorage:");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            console.log(`- ${key}: ${value ? value.substring(0, 20) + "..." : "null"}`);
          }
        }
      }
    }
    return config;
  },
  (error) => {
    console.error("Error en interceptor de peticiones:", error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    console.log("Respuesta del servidor recibida:", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      contentType: response.headers["content-type"]
    });
    console.log("Cuerpo completo de la respuesta:", response);
    console.log("Datos de la respuesta (data):", response.data);
    console.log("Tipo de data:", typeof response.data);
    if (typeof response.data === "string" && response.data.trim().startsWith("{")) {
      try {
        console.log("Intentando parsear respuesta como JSON...");
        const parsedData = JSON.parse(response.data);
        console.log("Datos parseados:", parsedData);
        return parsedData;
      } catch (e) {
        console.warn("Error al parsear respuesta como JSON:", e);
      }
    }
    if (response.data === void 0) {
      console.warn("Respuesta con data undefined, verificando respuesta bruta...");
      if (response.status === 200) {
        if (response.request && response.request.response) {
          try {
            console.log("Intentando extraer datos de request.response...");
            const rawData = response.request.response;
            if (typeof rawData === "string") {
              const parsedData = JSON.parse(rawData);
              console.log("Datos extraídos de request.response:", parsedData);
              return parsedData;
            }
          } catch (e) {
            console.warn("Error al procesar request.response:", e);
          }
        }
        console.warn("No se pudieron extraer datos de la respuesta, devolviendo objeto vacío");
        return {};
      }
    }
    if (response.data && typeof response.data === "object" && response.data.hasOwnProperty("data")) {
      console.log("Extrayendo datos de response.data.data");
      return response.data.data;
    }
    return response.data || {};
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      const errorData = error.response.data;
      const errorMsg = errorData.detail || errorData.message || "Error desconocido";
      return Promise.reject({
        message: errorMsg,
        status: error.response.status,
        code: errorData.code || "ERROR"
      });
    }
    if (error.request) {
      return Promise.reject({
        message: "No se pudo conectar con el servidor. Por favor, verifique su conexión.",
        status: 0,
        code: "NETWORK_ERROR"
      });
    }
    return Promise.reject({
      message: error.message || "Ocurrió un error al procesar la solicitud",
      status: 500,
      code: "UNKNOWN_ERROR"
    });
  }
);
async function fetchData(endpoint, params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    let url;
    if (isLocalTunnel) {
      const normalizedEndpoint = normalizePath(endpoint);
      url = `${baseURL}${normalizedEndpoint}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    } else {
      queryParams.append("endpoint", endpoint);
      url = `${API_BASE_URL}/proxy?${queryParams.toString()}`;
    }
    console.log(`🔍 Fetching data [${isLocalTunnel ? "TUNNEL" : "LOCAL"}]:`, url);
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      headers
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`❌ Error ${response.status} en GET ${endpoint}:`, errorData);
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`✅ Respuesta GET ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error en fetchData (${endpoint}):`, error);
    throw {
      message: error.message || "No se pudo conectar con el servidor. Por favor, verifica tu conexión.",
      status: error.status || 0,
      code: error.code || "NETWORK_ERROR"
    };
  }
}
async function postData(endpoint, data = {}, method = "POST") {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    let url;
    let requestBody;
    if (isLocalTunnel) {
      const normalizedEndpoint = normalizePath(endpoint);
      url = `${baseURL}${normalizedEndpoint}`;
      requestBody = JSON.stringify(data);
    } else {
      url = `${API_BASE_URL}/proxy`;
      requestBody = JSON.stringify({
        endpoint,
        data,
        method
      });
    }
    console.log(`📤 ${method} [${isLocalTunnel ? "TUNNEL" : "LOCAL"}]:`, url, data);
    const response = await fetch(url, {
      method: isLocalTunnel ? method : "POST",
      headers,
      body: requestBody
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`❌ Error ${response.status} en ${method} ${endpoint}:`, errorData);
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    const responseData = await response.json();
    console.log(`✅ Respuesta ${method} ${endpoint}:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`❌ Error en ${method} (${endpoint}):`, error);
    throw {
      message: error.message || "No se pudo conectar con el servidor. Por favor, verifica tu conexión.",
      status: error.status || 0,
      code: error.code || "NETWORK_ERROR"
    };
  }
}
async function patchData(endpoint, data = {}) {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    let url;
    let requestBody = JSON.stringify(data);
    if (isLocalTunnel) {
      const normalizedEndpoint = normalizePath(endpoint);
      url = `${baseURL}${normalizedEndpoint}`;
    } else {
      url = `${API_BASE_URL}${endpoint}`;
    }
    console.log(`🔧 PATCH [${isLocalTunnel ? "TUNNEL" : "LOCAL"}]:`, url, data);
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: requestBody
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`❌ Error ${response.status} en PATCH ${endpoint}:`, errorData);
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    const responseData = await response.json();
    console.log(`✅ Respuesta PATCH ${endpoint}:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`Error en patchData (${endpoint}):`, error);
    throw {
      message: error.message || "No se pudo conectar con el servidor. Por favor, verifique su conexión.",
      status: error.status || 0,
      code: error.code || "NETWORK_ERROR"
    };
  }
}
async function putData(endpoint, data = {}) {
  return postData(endpoint, data, "PUT");
}
async function deleteData(endpoint, data = {}) {
  return postData(endpoint, data, "DELETE");
}
function handleApiError(error, setError, defaultMessage = "Ha ocurrido un error. Por favor, inténtelo de nuevo.") {
  console.error("API Error:", error);
  if (error.code === "NETWORK_ERROR") {
    setError("No se pudo conectar con el servidor. Por favor, verifique su conexión.");
  } else if (error.message) {
    setError(error.message);
  } else {
    setError(error.message || defaultMessage);
  }
}
api.fetchData = fetchData;
api.postData = postData;
api.putData = putData;
api.deleteData = deleteData;
api.handleApiError = handleApiError;
api.patchData = patchData;

export { api as a };
