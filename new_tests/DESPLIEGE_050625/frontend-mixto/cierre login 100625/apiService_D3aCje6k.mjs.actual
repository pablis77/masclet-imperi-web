// Configuración de API simplificada
const axios = require("axios");
let API_BASE_URL = "http://masclet-api:8000/api/v1";
const isProduction = true;

// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor para añadir logs y tokens
api.interceptors.request.use(
  (config) => {
    // Esta sección solía modificar URLs a Render - ELIMINADA

    // Añadir el token de autorización si existe
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
    
    // Log para debug
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configurar la API con una nueva URL base
function configureApi(baseUrl, useMockData = false) {
  API_BASE_URL = baseUrl;
  api.defaults.baseURL = baseUrl;
  console.log(`API configurada con URL base: ${baseUrl}`);
}

// GET - Obtener datos
async function get(endpoint) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const finalEndpoint = !normalizedEndpoint.includes("?") && normalizedEndpoint.endsWith("/") 
      ? normalizedEndpoint.slice(0, -1) 
      : normalizedEndpoint;
    
    console.log(`GET: ${api.defaults.baseURL}${finalEndpoint}`);
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
    
    // Para endpoints que deberían devolver listas, retornar array vacío
    if (endpoint.includes("list") || endpoint.includes("all") || endpoint.includes("explotacions") || endpoint.includes("animales")) {
      return [];
    }
    
    return {};
  }
}

// POST - Crear datos
async function post(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    console.log(`POST: ${api.defaults.baseURL}${normalizedEndpoint}`);
    const response = await api.post(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición POST a ${endpoint}:`, error);
    throw error;
  }
}

// PUT - Actualizar datos
async function put(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    console.log(`PUT: ${api.defaults.baseURL}${normalizedEndpoint}`);
    const response = await api.put(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PUT a ${endpoint}:`, error);
    throw error;
  }
}

// PATCH - Actualizar datos parcialmente
async function patch(endpoint, data) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    console.log(`PATCH: ${api.defaults.baseURL}${normalizedEndpoint}`);
    const response = await api.patch(normalizedEndpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en petición PATCH a ${endpoint}:`, error);
    throw error;
  }
}

// DELETE - Eliminar datos
async function del(endpoint) {
  try {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    console.log(`DELETE: ${api.defaults.baseURL}${normalizedEndpoint}`);
    const response = await api.delete(normalizedEndpoint);
    return response.data;
  } catch (error) {
    console.error(`Error en petición DELETE a ${endpoint}:`, error);
    throw error;
  }
}

// Verificar si el usuario está autenticado
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

// Obtener información del usuario actual
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

// Login - usando auth-proxy para producción
async function login(username, password) {
  try {
    // Preparar datos de autenticación
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("grant_type", "password");
    
    console.log(`Realizando login para usuario: ${username}`);
    
    // En producción usamos el proxy local
    if (isProduction) {
      console.log(`Realizando login a través del auth-proxy local`);
      
      // Usar fetch para llamar al proxy
      const response = await fetch("/api/auth-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        throw new Error(`Error de autenticación: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Guardar el token si la autenticación fue exitosa
      if (typeof window !== "undefined" && window.localStorage && data.access_token) {
        localStorage.setItem("token", data.access_token);
        console.log("Token guardado correctamente");
      }
      
      return { data };
    } else {
      // Para desarrollo local
      const loginEndpoint = "/auth/login";
      console.log(`Realizando login directo a: ${api.defaults.baseURL}${loginEndpoint}`);
      
      // Llamada directa al backend
      const response = await api.post(loginEndpoint, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      
      // Guardar el token si la autenticación fue exitosa
      if (typeof window !== "undefined" && window.localStorage && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        console.log("Token guardado correctamente");
      }
      
      return response;
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}

// Obtener la URL base actual
const getBaseUrl = () => {
  return API_BASE_URL;
};

// Exportar el servicio API
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
