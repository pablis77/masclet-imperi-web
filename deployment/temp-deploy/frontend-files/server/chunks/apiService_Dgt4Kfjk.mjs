import axios from 'axios';

let API_BASE_URL = "";
const getApiUrl = () => {
  const envApiUrl = "http://108.129.139.119:8000";
  {
    return envApiUrl;
  }
};
API_BASE_URL = getApiUrl();
let isProduction = false;
if (typeof window !== "undefined") {
  const currentHost = window.location.hostname;
  isProduction = currentHost !== "localhost" && currentHost !== "127.0.0.1";
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
function configureApi(baseUrl, useMockData = false) {
  API_BASE_URL = baseUrl;
  api.defaults.baseURL = baseUrl;
}
async function get(endpoint) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const finalEndpoint = !normalizedEndpoint.includes("?") && normalizedEndpoint.endsWith("/") ? normalizedEndpoint.slice(0, -1) : normalizedEndpoint;
    if (isProduction) {
    } else {
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
    console.log(`Realizando petición PATCH a ${API_BASE_URL}${normalizedEndpoint}`);
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
    if (isProduction) {
      console.log(`Realizando login a: /api/v1${loginEndpoint}`);
    } else {
      console.log(`Realizando login a: ${api.defaults.baseURL}${loginEndpoint}`);
    }
    const response = await api.post(loginEndpoint, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
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
