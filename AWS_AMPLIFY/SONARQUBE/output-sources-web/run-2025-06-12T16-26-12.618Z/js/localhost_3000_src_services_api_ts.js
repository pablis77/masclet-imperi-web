import axios from "/node_modules/.vite/deps/axios.js?v=5e89932e";
const getEnvironment = () => {
  if (typeof window === "undefined") return "server";
  const hostname = window.location.hostname;
  if (hostname.includes("loca.lt")) return "localtunnel";
  if (hostname === "localhost" || hostname.includes("192.168.")) return "local";
  return "production";
};
const environment = getEnvironment();
const isLocalTunnel = environment === "localtunnel";
let baseURL;
let useRelativeUrls = false;
switch (environment) {
  case "localtunnel":
    baseURL = "https://api-masclet-imperi.loca.lt/api/v1";
    break;
  case "local":
    baseURL = "http://localhost:8000/api/v1";
    break;
  case "production":
    baseURL = "/api/v1";
    useRelativeUrls = true;
    break;
  default:
    baseURL = "http://localhost:8000/api/v1";
}
const API_BASE_URL = baseURL;
console.log("🌎 Modo de conexión:", environment);
console.log("🔌 API Base URL:", baseURL);
console.log("🔗 URLs Relativas:", useRelativeUrls ? "SÍ" : "NO");
function normalizePath(path) {
  path = path.startsWith("/") ? path.substring(1) : path;
  return path.endsWith("/") ? path : `${path}/`;
}
console.log("🌎 Modo de conexión:", environment);
console.log("🔌 API Base URL:", baseURL || "URL relativa");
const api = axios.create({
  baseURL,
  timeout: 15e3,
  headers: {
    "Content-Type": "application/json",
    "X-Environment": environment
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
export async function fetchData(endpoint, params = {}) {
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
export async function postData(endpoint, data = {}, method = "POST") {
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
export async function patchData(endpoint, data = {}) {
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
export async function putData(endpoint, data = {}) {
  return postData(endpoint, data, "PUT");
}
export async function deleteData(endpoint, data = {}) {
  return postData(endpoint, data, "DELETE");
}
export function handleApiError(error, setError, defaultMessage = "Ha ocurrido un error. Por favor, inténtelo de nuevo.") {
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
export default api;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHR5cGUgeyBBeGlvc0Vycm9yLCBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UsIEF4aW9zSW5zdGFuY2UgfSBmcm9tICdheGlvcyc7XG5cbi8vIEV4dGVuZGVyIGxhIGludGVyZmF6IEF4aW9zSW5zdGFuY2UgcGFyYSBpbmNsdWlyIG51ZXN0cm9zIG3DqXRvZG9zIHBlcnNvbmFsaXphZG9zXG5kZWNsYXJlIG1vZHVsZSAnYXhpb3MnIHtcbiAgaW50ZXJmYWNlIEF4aW9zSW5zdGFuY2Uge1xuICAgIGZldGNoRGF0YTogKGVuZHBvaW50OiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIGFueT4pID0+IFByb21pc2U8YW55PjtcbiAgICBwb3N0RGF0YTogKGVuZHBvaW50OiBzdHJpbmcsIGRhdGE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBtZXRob2Q/OiBzdHJpbmcpID0+IFByb21pc2U8YW55PjtcbiAgICBwdXREYXRhOiAoZW5kcG9pbnQ6IHN0cmluZywgZGF0YT86IFJlY29yZDxzdHJpbmcsIGFueT4pID0+IFByb21pc2U8YW55PjtcbiAgICBkZWxldGVEYXRhOiAoZW5kcG9pbnQ6IHN0cmluZywgZGF0YT86IFJlY29yZDxzdHJpbmcsIGFueT4pID0+IFByb21pc2U8YW55PjtcbiAgICBoYW5kbGVBcGlFcnJvcjogKGVycm9yOiBhbnksIHNldEVycm9yOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkLCBkZWZhdWx0TWVzc2FnZT86IHN0cmluZykgPT4gdm9pZDtcbiAgICBwYXRjaERhdGE6IChlbmRwb2ludDogc3RyaW5nLCBkYXRhPzogUmVjb3JkPHN0cmluZywgYW55PikgPT4gUHJvbWlzZTxhbnk+O1xuICB9XG59XG5cbi8vIFRpcG9zIHBhcmEgZWwgZW50b3JubyBkZSBlamVjdWNpw7NuXG50eXBlIEVudmlyb25tZW50ID0gJ3NlcnZlcicgfCAnbG9jYWx0dW5uZWwnIHwgJ2xvY2FsJyB8ICdwcm9kdWN0aW9uJztcblxuLy8gRGV0ZWN0YXIgZWwgZW50b3JubyBhY3R1YWxcbmNvbnN0IGdldEVudmlyb25tZW50ID0gKCk6IEVudmlyb25tZW50ID0+IHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnc2VydmVyJztcbiAgICBcbiAgICBjb25zdCBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoJ2xvY2EubHQnKSkgcmV0dXJuICdsb2NhbHR1bm5lbCc7XG4gICAgaWYgKGhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fCBob3N0bmFtZS5pbmNsdWRlcygnMTkyLjE2OC4nKSkgcmV0dXJuICdsb2NhbCc7XG4gICAgcmV0dXJuICdwcm9kdWN0aW9uJztcbn07XG5cbmNvbnN0IGVudmlyb25tZW50ID0gZ2V0RW52aXJvbm1lbnQoKTtcbmNvbnN0IGlzTG9jYWxUdW5uZWwgPSBlbnZpcm9ubWVudCA9PT0gJ2xvY2FsdHVubmVsJzsgLy8gUGFyYSBjb21wYXRpYmlsaWRhZCBjb24gY8OzZGlnbyBleGlzdGVudGVcblxuLy8gQ29uZmlndXJhY2nDs24gYmFzZSBzZWfDum4gZWwgZW50b3Jub1xubGV0IGJhc2VVUkw6IHN0cmluZztcbmxldCB1c2VSZWxhdGl2ZVVybHMgPSBmYWxzZTtcblxuc3dpdGNoKGVudmlyb25tZW50KSB7XG4gICAgY2FzZSAnbG9jYWx0dW5uZWwnOlxuICAgICAgICBiYXNlVVJMID0gJ2h0dHBzOi8vYXBpLW1hc2NsZXQtaW1wZXJpLmxvY2EubHQvYXBpL3YxJztcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9jYWwnOlxuICAgICAgICAvLyBFbiBsb2NhbCwgc2llbXByZSB1c2FyIGxhIFVSTCBhYnNvbHV0YSBkZWwgYmFja2VuZFxuICAgICAgICBiYXNlVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEnO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlICdwcm9kdWN0aW9uJzpcbiAgICAgICAgLy8gRW4gcHJvZHVjY2nDs24sIHVzYXIgcnV0YXMgcmVsYXRpdmFzIHBhcmEgZXZpdGFyIHByb2JsZW1hcyBkZSBDT1JTXG4gICAgICAgIC8vIFBFUk8gc2llbXByZSBhc2VndXJhcnNlIGRlIHF1ZSBpbmNsdXlhbiBlbCBwcmVmaWpvIC9hcGkvdjFcbiAgICAgICAgYmFzZVVSTCA9ICcvYXBpL3YxJztcbiAgICAgICAgdXNlUmVsYXRpdmVVcmxzID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgICAgLy8gRW4gY2FzbyBkZSBkdWRhLCB1c2FyIGxhIFVSTCBhYnNvbHV0YSBsb2NhbCBwYXJhIGRlc2Fycm9sbG9cbiAgICAgICAgYmFzZVVSTCA9ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL3YxJztcbn1cblxuLy8gVVJMIGJhc2UgcGFyYSBlbCBwcm94eSBsb2NhbCAodXNhZG8gZW4gZGVzYXJyb2xsbylcbmNvbnN0IEFQSV9CQVNFX1VSTCA9IGJhc2VVUkw7XG5cbi8vIEltcHJpbWlyIGluZm9ybWFjacOzbiBpbXBvcnRhbnRlIGRlIGRlcHVyYWNpw7NuXG5jb25zb2xlLmxvZygn8J+MjiBNb2RvIGRlIGNvbmV4acOzbjonLCBlbnZpcm9ubWVudCk7XG5jb25zb2xlLmxvZygn8J+UjCBBUEkgQmFzZSBVUkw6JywgYmFzZVVSTCk7XG5jb25zb2xlLmxvZygn8J+UlyBVUkxzIFJlbGF0aXZhczonLCB1c2VSZWxhdGl2ZVVybHMgPyAnU8ONJyA6ICdOTycpO1xuXG4vLyBGdW5jaW9uZXMgZGUgdXRpbGlkYWRcbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBFbGltaW5hciBiYXJyYSBpbmljaWFsIHNpIGV4aXN0ZVxuICAgIHBhdGggPSBwYXRoLnN0YXJ0c1dpdGgoJy8nKSA/IHBhdGguc3Vic3RyaW5nKDEpIDogcGF0aDtcbiAgICAvLyBBc2VndXJhciBiYXJyYSBmaW5hbFxuICAgIHJldHVybiBwYXRoLmVuZHNXaXRoKCcvJykgPyBwYXRoIDogYCR7cGF0aH0vYDtcbn1cblxuLy8gTG9ncyBwYXJhIGRlcHVyYWNpw7NuXG5jb25zb2xlLmxvZygn8J+MjiBNb2RvIGRlIGNvbmV4acOzbjonLCBlbnZpcm9ubWVudCk7XG5jb25zb2xlLmxvZygn8J+UjCBBUEkgQmFzZSBVUkw6JywgYmFzZVVSTCB8fCAnVVJMIHJlbGF0aXZhJyk7XG5cbi8vIENyZWFyIGluc3RhbmNpYSBkZSBheGlvcyBjb24gY29uZmlndXJhY2nDs24gYmFzZVxuY29uc3QgYXBpID0gYXhpb3MuY3JlYXRlKHtcbiAgICBiYXNlVVJMLFxuICAgIHRpbWVvdXQ6IDE1MDAwLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ1gtRW52aXJvbm1lbnQnOiBlbnZpcm9ubWVudFxuICAgIH0sXG4gICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSAvLyBFdml0YSBwcm9ibGVtYXMgY29uIENPUlNcbn0pO1xuXG4vLyBJbnRlcmNlcHRvciBwYXJhIGFncmVnYXIgZWwgdG9rZW4gSldUIGEgbGFzIHNvbGljaXR1ZGVzXG5hcGkuaW50ZXJjZXB0b3JzLnJlcXVlc3QudXNlKFxuICAgIChjb25maWcpID0+IHtcbiAgICAgICAgLy8gVmVyc2nDs24gTUVKT1JBREEgZGVsIGludGVyY2VwdG9yIGRlIHRva2VuXG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2FuZG8gdG9rZW4gSldUIHBhcmEgYXV0ZW50aWNhY2nDs24nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIDEuIE9CVEVORVIgVE9LRU46IFByb2JhciB0b2RhcyBsYXMgZnVlbnRlcyBwb3NpYmxlc1xuICAgICAgICBsZXQgdG9rZW4gPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gUHJvYmFyIGxvY2FsU3RvcmFnZSAodmFyaWFzIGNsYXZlcyBwb3NpYmxlcylcbiAgICAgICAgY29uc3QgcG9zc2libGVLZXlzID0gWyd0b2tlbicsICdhY2Nlc3NUb2tlbicsICdqd3QnLCAnYWNjZXNzX3Rva2VuJ107XG4gICAgICAgIFxuICAgICAgICAvLyBCw7pzcXVlZGEgZXhoYXVzdGl2YSBlbiBsb2NhbFN0b3JhZ2VcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHBvc3NpYmxlS2V5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFRva2VuIGVuY29udHJhZG8gZW4gbG9jYWxTdG9yYWdlWycke2tleX0nXWApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNpIG5vIGhheSB0b2tlbiBlbiBsb2NhbFN0b3JhZ2UsIGJ1c2NhciBlbiBzZXNzaW9uU3RvcmFnZVxuICAgICAgICBpZiAoIXRva2VuICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5zZXNzaW9uU3RvcmFnZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgcG9zc2libGVLZXlzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBUb2tlbiBlbmNvbnRyYWRvIGVuIHNlc3Npb25TdG9yYWdlWycke2tleX0nXWApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIDIuIFVTQVIgRUwgVE9LRU46IEHDsWFkaXJsbyBhIGxhcyBjYWJlY2VyYXMgc2kgZXhpc3RlXG4gICAgICAgIGlmICh0b2tlbiAmJiBjb25maWcuaGVhZGVycykge1xuICAgICAgICAgICAgLy8gSU1QT1JUQU5URTogQXNlZ3VyYXIgcXVlIGVsIHRva2VuIG5vIHRlbmdhICdCZWFyZXInIGR1cGxpY2Fkb1xuICAgICAgICAgICAgaWYgKHRva2VuLnN0YXJ0c1dpdGgoJ0JlYXJlciAnKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSB0b2tlbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSA9IGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYW1iacOpbiBhw7FhZGlyIHRva2VuIGNvbW8gWC1BdXRoLVRva2VuIHBvciBzaSBhY2Fzb1xuICAgICAgICAgICAgY29uZmlnLmhlYWRlcnNbJ1gtQXV0aC1Ub2tlbiddID0gdG9rZW47XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfwn5SQIFRva2VuIEpXVCBhw7FhZGlkbyBjb3JyZWN0YW1lbnRlIGEgbGFzIGNhYmVjZXJhcycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCfimqDvuI8gTm8gc2UgZW5jb250csOzIHRva2VuIEpXVCBwYXJhIGF1dGVudGljYXIgbGEgcGV0aWNpw7NuJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEHDsWFkaXIgaW5mb3JtYWNpw7NuIGRlIGRlcHVyYWNpw7NuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVVJMIGRlIGxhIHBldGljacOzbjonLCBjb25maWcudXJsKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNw6l0b2RvOicsIGNvbmZpZy5tZXRob2QpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0hlYWRlcnMgYWN0dWFsZXM6JywgY29uZmlnLmhlYWRlcnMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBFbiBtb2RvIGRlc2Fycm9sbG8sIG1vc3RyYXIgY29udGVuaWRvIGRlIGxvY2FsU3RvcmFnZVxuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbnRlbmlkbyBkZSBsb2NhbFN0b3JhZ2U6Jyk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0gJHtrZXl9OiAke3ZhbHVlID8gdmFsdWUuc3Vic3RyaW5nKDAsIDIwKSArICcuLi4nIDogJ251bGwnfWApOyAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgfSxcbiAgICAoZXJyb3I6IEF4aW9zRXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZW4gaW50ZXJjZXB0b3IgZGUgcGV0aWNpb25lczonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfVxuKTtcblxuLy8gSW50ZXJjZXB0b3IgcGFyYSBtYW5lamFyIHJlc3B1ZXN0YXMgeSBlcnJvcmVzXG5hcGkuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLnVzZShcbiAgICAocmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UpID0+IHtcbiAgICAgICAgLy8gUHJpbWVybywgbG9ndWVhciBpbmZvcm1hY2nDs24gZGV0YWxsYWRhIHNvYnJlIGxhIHJlc3B1ZXN0YVxuICAgICAgICBjb25zb2xlLmxvZygnUmVzcHVlc3RhIGRlbCBzZXJ2aWRvciByZWNpYmlkYTonLCB7XG4gICAgICAgICAgICB1cmw6IHJlc3BvbnNlLmNvbmZpZy51cmwsXG4gICAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IHJlc3BvbnNlLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gSW5zcGVjY2lvbmFyIGVsIGN1ZXJwbyBkZSBsYSByZXNwdWVzdGEgZW4gZGV0YWxsZVxuICAgICAgICBjb25zb2xlLmxvZygnQ3VlcnBvIGNvbXBsZXRvIGRlIGxhIHJlc3B1ZXN0YTonLCByZXNwb25zZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEYXRvcyBkZSBsYSByZXNwdWVzdGEgKGRhdGEpOicsIHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZygnVGlwbyBkZSBkYXRhOicsIHR5cGVvZiByZXNwb25zZS5kYXRhKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNpIGxhIHJlc3B1ZXN0YSBlcyB1biBzdHJpbmcgSlNPTiwgaW50ZW50YXIgcGFyc2VhcmxvXG4gICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ3N0cmluZycgJiYgcmVzcG9uc2UuZGF0YS50cmltKCkuc3RhcnRzV2l0aCgneycpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnRlbnRhbmRvIHBhcnNlYXIgcmVzcHVlc3RhIGNvbW8gSlNPTi4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEYXRvcyBwYXJzZWFkb3M6JywgcGFyc2VkRGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZERhdGE7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBhbCBwYXJzZWFyIHJlc3B1ZXN0YSBjb21vIEpTT046JywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIE1hbmVqYXIgY2FzbyBkZSByZXNwdWVzdGEgaW5kZWZpbmlkYSAocHJvYmFibGVtZW50ZSB1biBlcnJvciBlbiBsYSBjb211bmljYWNpw7NuKVxuICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1Jlc3B1ZXN0YSBjb24gZGF0YSB1bmRlZmluZWQsIHZlcmlmaWNhbmRvIHJlc3B1ZXN0YSBicnV0YS4uLicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTaSBoYXkgdW4gY8OzZGlnbyBkZSBlc3RhZG8gMjAwLCBwZXJvIGRhdGEgZXMgdW5kZWZpbmVkLCBleHRyYWVyIGRlIG90cmEgcGFydGVcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIC8vIEludGVudGFyIGRpZmVyZW50ZXMgcHJvcGllZGFkZXMgZG9uZGUgcG9kcsOtYW4gZXN0YXIgbG9zIGRhdG9zXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnJlcXVlc3QgJiYgcmVzcG9uc2UucmVxdWVzdC5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0ludGVudGFuZG8gZXh0cmFlciBkYXRvcyBkZSByZXF1ZXN0LnJlc3BvbnNlLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByYXdEYXRhID0gcmVzcG9uc2UucmVxdWVzdC5yZXNwb25zZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmF3RGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShyYXdEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGF0b3MgZXh0cmHDrWRvcyBkZSByZXF1ZXN0LnJlc3BvbnNlOicsIHBhcnNlZERhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWREYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIGFsIHByb2Nlc2FyIHJlcXVlc3QucmVzcG9uc2U6JywgZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gU2kgbGxlZ2Ftb3MgYXF1w60geSBubyBoYXkgZGF0b3MsIGRldm9sdmVyIHVuIG9iamV0byB2YWPDrW8gZW4gbHVnYXIgZGUgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZSBwdWRpZXJvbiBleHRyYWVyIGRhdG9zIGRlIGxhIHJlc3B1ZXN0YSwgZGV2b2x2aWVuZG8gb2JqZXRvIHZhY8OtbycpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2kgbGEgQVBJIGRldnVlbHZlIGRhdG9zIGVuIGxhIHByb3BpZWRhZCAnZGF0YScsIGxvIGV4dHJhZW1vc1xuICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSAmJiB0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcgJiYgcmVzcG9uc2UuZGF0YS5oYXNPd25Qcm9wZXJ0eSgnZGF0YScpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXh0cmF5ZW5kbyBkYXRvcyBkZSByZXNwb25zZS5kYXRhLmRhdGEnKTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLmRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbiBjdWFscXVpZXIgb3RybyBjYXNvLCBkZXZvbHZlciBsb3MgZGF0b3MgY29tbyB2aWVuZW5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEgfHwge307IC8vIEV2aXRhciBkZXZvbHZlciB1bmRlZmluZWRcbiAgICB9LFxuICAgIChlcnJvcjogQXhpb3NFcnJvcikgPT4ge1xuICAgICAgICAvLyBNYW5lamFyIGVycm9yZXMgZXNwZWPDrWZpY29zIHBvciBjw7NkaWdvXG4gICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgLy8gRXJyb3IgZGUgYXV0ZW50aWNhY2nDs25cbiAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgICAgIC8vIExpbXBpYXIgdG9rZW4geSByZWRpcmlnaXIgYSBsb2dpblxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdGVhciByZXNwdWVzdGFzIGRlIGVycm9yIHBhcmEgdXNvIGVuIFVJXG4gICAgICAgICAgICBjb25zdCBlcnJvckRhdGEgPSBlcnJvci5yZXNwb25zZS5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3JEYXRhLmRldGFpbCB8fCBlcnJvckRhdGEubWVzc2FnZSB8fCAnRXJyb3IgZGVzY29ub2NpZG8nO1xuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgIHN0YXR1czogZXJyb3IucmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgIGNvZGU6IGVycm9yRGF0YS5jb2RlIHx8ICdFUlJPUidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXJyb3IgZGUgcmVkXG4gICAgICAgIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdObyBzZSBwdWRvIGNvbmVjdGFyIGNvbiBlbCBzZXJ2aWRvci4gUG9yIGZhdm9yLCB2ZXJpZmlxdWUgc3UgY29uZXhpw7NuLicsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgICAgIGNvZGU6ICdORVRXT1JLX0VSUk9SJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFcnJvciBnZW5lcmFsXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh7XG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdPY3VycmnDsyB1biBlcnJvciBhbCBwcm9jZXNhciBsYSBzb2xpY2l0dWQnLFxuICAgICAgICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICAgICAgICBjb2RlOiAnVU5LTk9XTl9FUlJPUidcbiAgICAgICAgfSk7XG4gICAgfVxuKTtcblxuLyoqXG4gKiBSZWFsaXphIHVuYSBwZXRpY2nDs24gR0VUIGEgbGEgQVBJXG4gKiBAcGFyYW0gZW5kcG9pbnQgRW5kcG9pbnQgZGUgbGEgQVBJXG4gKiBAcGFyYW0gcGFyYW1zIFBhcsOhbWV0cm9zIGRlIGxhIHBldGljacOzblxuICogQHJldHVybnMgUHJvbWVzYSBjb24gbGEgcmVzcHVlc3RhXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaERhdGEoZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICB0cnkge1xuICAgIC8vIENvbnN0cnVpciBsYSBVUkwgY29uIGxvcyBwYXLDoW1ldHJvc1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgIFxuICAgIC8vIEHDsWFkaXIgcGFyw6FtZXRyb3MgYWRpY2lvbmFsZXMgYSBsYSBVUkxcbiAgICBPYmplY3QuZW50cmllcyhwYXJhbXMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgcXVlcnlQYXJhbXMuYXBwZW5kKGtleSwgU3RyaW5nKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy8gQ29uc3RydWlyIGxhIFVSTCBzZWfDum4gZWwgZW50b3Jub1xuICAgIGxldCB1cmw7XG4gICAgaWYgKGlzTG9jYWxUdW5uZWwpIHtcbiAgICAgIC8vIEVuIExvY2FsVHVubmVsLCBsbGFtYW1vcyBkaXJlY3RhbWVudGUgYWwgYmFja2VuZFxuICAgICAgY29uc3Qgbm9ybWFsaXplZEVuZHBvaW50ID0gbm9ybWFsaXplUGF0aChlbmRwb2ludCk7XG4gICAgICB1cmwgPSBgJHtiYXNlVVJMfSR7bm9ybWFsaXplZEVuZHBvaW50fSR7cXVlcnlQYXJhbXMudG9TdHJpbmcoKSA/ICc/JyArIHF1ZXJ5UGFyYW1zLnRvU3RyaW5nKCkgOiAnJ31gO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBFbiBsb2NhbCwgdXNhbW9zIGVsIHByb3h5XG4gICAgICBxdWVyeVBhcmFtcy5hcHBlbmQoJ2VuZHBvaW50JywgZW5kcG9pbnQpO1xuICAgICAgdXJsID0gYCR7QVBJX0JBU0VfVVJMfS9wcm94eT8ke3F1ZXJ5UGFyYW1zLnRvU3RyaW5nKCl9YDtcbiAgICB9XG4gICAgXG4gICAgY29uc29sZS5sb2coYPCflI0gRmV0Y2hpbmcgZGF0YSBbJHtpc0xvY2FsVHVubmVsID8gJ1RVTk5FTCcgOiAnTE9DQUwnfV06YCwgdXJsKTtcblxuICAgIGNvbnN0IHRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XG4gICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfTtcbiAgICBcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIGhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSA9IGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICBoZWFkZXJzXG4gICAgfSk7XG4gICAgXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgZXJyb3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7IG1lc3NhZ2U6IHJlc3BvbnNlLnN0YXR1c1RleHQgfSkpO1xuICAgICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yICR7cmVzcG9uc2Uuc3RhdHVzfSBlbiBHRVQgJHtlbmRwb2ludH06YCwgZXJyb3JEYXRhKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvckRhdGEubWVzc2FnZSB8fCBgRXJyb3IgJHtyZXNwb25zZS5zdGF0dXN9OiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgY29uc29sZS5sb2coYOKchSBSZXNwdWVzdGEgR0VUICR7ZW5kcG9pbnR9OmAsIGRhdGEpO1xuICAgIHJldHVybiBkYXRhO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIGVuIGZldGNoRGF0YSAoJHtlbmRwb2ludH0pOmAsIGVycm9yKTtcbiAgICB0aHJvdyB7XG4gICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8ICdObyBzZSBwdWRvIGNvbmVjdGFyIGNvbiBlbCBzZXJ2aWRvci4gUG9yIGZhdm9yLCB2ZXJpZmljYSB0dSBjb25leGnDs24uJyxcbiAgICAgIHN0YXR1czogZXJyb3Iuc3RhdHVzIHx8IDAsXG4gICAgICBjb2RlOiBlcnJvci5jb2RlIHx8ICdORVRXT1JLX0VSUk9SJ1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFsaXphIHVuYSBwZXRpY2nDs24gUE9TVCBhIGxhIEFQSVxuICogQHBhcmFtIGVuZHBvaW50IEVuZHBvaW50IGRlIGxhIEFQSVxuICogQHBhcmFtIGRhdGEgRGF0b3MgYSBlbnZpYXJcbiAqIEBwYXJhbSBtZXRob2QgTcOpdG9kbyBIVFRQIChQT1NULCBQVVQsIERFTEVURSlcbiAqIEByZXR1cm5zIFByb21lc2EgY29uIGxhIHJlc3B1ZXN0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdERhdGEoZW5kcG9pbnQ6IHN0cmluZywgZGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9LCBtZXRob2Q6IHN0cmluZyA9ICdQT1NUJyk6IFByb21pc2U8YW55PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcbiAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9O1xuICAgIFxuICAgIGlmICh0b2tlbikge1xuICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJlYXJlciAke3Rva2VufWA7XG4gICAgfVxuICAgIFxuICAgIGxldCB1cmw7XG4gICAgbGV0IHJlcXVlc3RCb2R5O1xuICAgIFxuICAgIGlmIChpc0xvY2FsVHVubmVsKSB7XG4gICAgICAvLyBFbiBMb2NhbFR1bm5lbCwgbGxhbWFtb3MgZGlyZWN0YW1lbnRlIGFsIGJhY2tlbmRcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRFbmRwb2ludCA9IG5vcm1hbGl6ZVBhdGgoZW5kcG9pbnQpO1xuICAgICAgdXJsID0gYCR7YmFzZVVSTH0ke25vcm1hbGl6ZWRFbmRwb2ludH1gO1xuICAgICAgcmVxdWVzdEJvZHkgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRW4gbG9jYWwsIHVzYW1vcyBlbCBwcm94eVxuICAgICAgdXJsID0gYCR7QVBJX0JBU0VfVVJMfS9wcm94eWA7XG4gICAgICByZXF1ZXN0Qm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgZW5kcG9pbnQsXG4gICAgICAgIGRhdGEsXG4gICAgICAgIG1ldGhvZFxuICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKGDwn5OkICR7bWV0aG9kfSBbJHtpc0xvY2FsVHVubmVsID8gJ1RVTk5FTCcgOiAnTE9DQUwnfV06YCwgdXJsLCBkYXRhKTtcbiAgICBcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgbWV0aG9kOiBpc0xvY2FsVHVubmVsID8gbWV0aG9kIDogJ1BPU1QnLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IHJlcXVlc3RCb2R5XG4gICAgfSk7XG4gICAgXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgZXJyb3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7IG1lc3NhZ2U6IHJlc3BvbnNlLnN0YXR1c1RleHQgfSkpO1xuICAgICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yICR7cmVzcG9uc2Uuc3RhdHVzfSBlbiAke21ldGhvZH0gJHtlbmRwb2ludH06YCwgZXJyb3JEYXRhKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvckRhdGEubWVzc2FnZSB8fCBlcnJvckRhdGEuZGV0YWlsIHx8IGBFcnJvciAke3Jlc3BvbnNlLnN0YXR1c306ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGNvbnNvbGUubG9nKGDinIUgUmVzcHVlc3RhICR7bWV0aG9kfSAke2VuZHBvaW50fTpgLCByZXNwb25zZURhdGEpO1xuICAgIHJldHVybiByZXNwb25zZURhdGE7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgZW4gJHttZXRob2R9ICgke2VuZHBvaW50fSk6YCwgZXJyb3IpO1xuICAgIHRocm93IHtcbiAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgJ05vIHNlIHB1ZG8gY29uZWN0YXIgY29uIGVsIHNlcnZpZG9yLiBQb3IgZmF2b3IsIHZlcmlmaWNhIHR1IGNvbmV4acOzbi4nLFxuICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgfHwgMCxcbiAgICAgIGNvZGU6IGVycm9yLmNvZGUgfHwgJ05FVFdPUktfRVJST1InXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWxpemEgdW5hIHBldGljacOzbiBQQVRDSCBhIGxhIEFQSVxuICogQHBhcmFtIGVuZHBvaW50IEVuZHBvaW50IGRlIGxhIEFQSVxuICogQHBhcmFtIGRhdGEgRGF0b3MgYSBlbnZpYXJcbiAqIEByZXR1cm5zIFByb21lc2EgY29uIGxhIHJlc3B1ZXN0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGF0Y2hEYXRhKGVuZHBvaW50OiBzdHJpbmcsIGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fSk6IFByb21pc2U8YW55PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcbiAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9O1xuICAgIFxuICAgIGlmICh0b2tlbikge1xuICAgICAgaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYEJlYXJlciAke3Rva2VufWA7XG4gICAgfVxuICAgIFxuICAgIGxldCB1cmw7XG4gICAgbGV0IHJlcXVlc3RCb2R5ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgXG4gICAgaWYgKGlzTG9jYWxUdW5uZWwpIHtcbiAgICAgIC8vIEVuIExvY2FsVHVubmVsLCBsbGFtYW1vcyBkaXJlY3RhbWVudGUgYWwgYmFja2VuZFxuICAgICAgY29uc3Qgbm9ybWFsaXplZEVuZHBvaW50ID0gbm9ybWFsaXplUGF0aChlbmRwb2ludCk7XG4gICAgICB1cmwgPSBgJHtiYXNlVVJMfSR7bm9ybWFsaXplZEVuZHBvaW50fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVuIGxvY2FsLCB1c2Ftb3MgZWwgcHJveHlcbiAgICAgIHVybCA9IGAke0FQSV9CQVNFX1VSTH0ke2VuZHBvaW50fWA7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKGDwn5SnIFBBVENIIFske2lzTG9jYWxUdW5uZWwgPyAnVFVOTkVMJyA6ICdMT0NBTCd9XTpgLCB1cmwsIGRhdGEpO1xuICAgIFxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICBoZWFkZXJzLFxuICAgICAgYm9keTogcmVxdWVzdEJvZHlcbiAgICB9KTtcbiAgICBcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBjb25zdCBlcnJvckRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHsgbWVzc2FnZTogcmVzcG9uc2Uuc3RhdHVzVGV4dCB9KSk7XG4gICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgJHtyZXNwb25zZS5zdGF0dXN9IGVuIFBBVENIICR7ZW5kcG9pbnR9OmAsIGVycm9yRGF0YSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JEYXRhLm1lc3NhZ2UgfHwgZXJyb3JEYXRhLmRldGFpbCB8fCBgRXJyb3IgJHtyZXNwb25zZS5zdGF0dXN9OiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBjb25zb2xlLmxvZyhg4pyFIFJlc3B1ZXN0YSBQQVRDSCAke2VuZHBvaW50fTpgLCByZXNwb25zZURhdGEpO1xuICAgIHJldHVybiByZXNwb25zZURhdGE7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBlbiBwYXRjaERhdGEgKCR7ZW5kcG9pbnR9KTpgLCBlcnJvcik7XG4gICAgdGhyb3cge1xuICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB8fCAnTm8gc2UgcHVkbyBjb25lY3RhciBjb24gZWwgc2Vydmlkb3IuIFBvciBmYXZvciwgdmVyaWZpcXVlIHN1IGNvbmV4acOzbi4nLFxuICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgfHwgMCxcbiAgICAgIGNvZGU6IGVycm9yLmNvZGUgfHwgJ05FVFdPUktfRVJST1InXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWxpemEgdW5hIHBldGljacOzbiBQVVQgYSBsYSBBUEkgYSB0cmF2w6lzIGRlbCBwcm94eSBsb2NhbFxuICogQHBhcmFtIGVuZHBvaW50IEVuZHBvaW50IGRlIGxhIEFQSVxuICogQHBhcmFtIGRhdGEgRGF0b3MgYSBlbnZpYXJcbiAqIEByZXR1cm5zIFByb21lc2EgY29uIGxhIHJlc3B1ZXN0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHV0RGF0YShlbmRwb2ludDogc3RyaW5nLCBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICByZXR1cm4gcG9zdERhdGEoZW5kcG9pbnQsIGRhdGEsICdQVVQnKTtcbn1cblxuLyoqXG4gKiBSZWFsaXphIHVuYSBwZXRpY2nDs24gREVMRVRFIGEgbGEgQVBJIGEgdHJhdsOpcyBkZWwgcHJveHkgbG9jYWxcbiAqIEBwYXJhbSBlbmRwb2ludCBFbmRwb2ludCBkZSBsYSBBUElcbiAqIEBwYXJhbSBkYXRhIERhdG9zIGEgZW52aWFyXG4gKiBAcmV0dXJucyBQcm9tZXNhIGNvbiBsYSByZXNwdWVzdGFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZURhdGEoZW5kcG9pbnQ6IHN0cmluZywgZGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgcmV0dXJuIHBvc3REYXRhKGVuZHBvaW50LCBkYXRhLCAnREVMRVRFJyk7XG59XG5cbi8qKlxuICogTWFuZWphIGxvcyBlcnJvcmVzIGRlIGxhIEFQSSBkZSBmb3JtYSBjb25zaXN0ZW50ZVxuICogQHBhcmFtIGVycm9yIEVycm9yIGNhcHR1cmFkb1xuICogQHBhcmFtIHNldEVycm9yIEZ1bmNpw7NuIHBhcmEgZXN0YWJsZWNlciBlbCBlcnJvciBlbiBlbCBlc3RhZG9cbiAqIEBwYXJhbSBkZWZhdWx0TWVzc2FnZSBNZW5zYWplIHBvciBkZWZlY3RvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVBcGlFcnJvcihlcnJvcjogYW55LCBzZXRFcnJvcjogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCwgZGVmYXVsdE1lc3NhZ2U6IHN0cmluZyA9ICdIYSBvY3VycmlkbyB1biBlcnJvci4gUG9yIGZhdm9yLCBpbnTDqW50ZWxvIGRlIG51ZXZvLicpOiB2b2lkIHtcbiAgY29uc29sZS5lcnJvcignQVBJIEVycm9yOicsIGVycm9yKTtcbiAgXG4gIGlmIChlcnJvci5jb2RlID09PSAnTkVUV09SS19FUlJPUicpIHtcbiAgICBzZXRFcnJvcignTm8gc2UgcHVkbyBjb25lY3RhciBjb24gZWwgc2Vydmlkb3IuIFBvciBmYXZvciwgdmVyaWZpcXVlIHN1IGNvbmV4acOzbi4nKTtcbiAgfSBlbHNlIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgc2V0RXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gRXJyb3IgZ2VuZXJhbFxuICAgIHNldEVycm9yKGVycm9yLm1lc3NhZ2UgfHwgZGVmYXVsdE1lc3NhZ2UpO1xuICB9XG59XG5cbi8vIEFncmVnYXIgbG9zIG3DqXRvZG9zIGFsIG9iamV0byBhcGkgcGFyYSBtYW50ZW5lciBjb21wYXRpYmlsaWRhZFxuYXBpLmZldGNoRGF0YSA9IGZldGNoRGF0YTtcbmFwaS5wb3N0RGF0YSA9IHBvc3REYXRhO1xuYXBpLnB1dERhdGEgPSBwdXREYXRhO1xuYXBpLmRlbGV0ZURhdGEgPSBkZWxldGVEYXRhO1xuYXBpLmhhbmRsZUFwaUVycm9yID0gaGFuZGxlQXBpRXJyb3I7XG5hcGkucGF0Y2hEYXRhID0gcGF0Y2hEYXRhO1xuXG5leHBvcnQgZGVmYXVsdCBhcGk7Il0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFdBQVc7QUFtQmxCLE1BQU0saUJBQWlCLE1BQW1CO0FBQ3RDLE1BQUksT0FBTyxXQUFXLFlBQWEsUUFBTztBQUUxQyxRQUFNLFdBQVcsT0FBTyxTQUFTO0FBQ2pD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