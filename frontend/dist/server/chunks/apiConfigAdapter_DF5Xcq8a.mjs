const getApiBaseUrl = () => {
  const configuredApiUrl = "http://localhost:8000";
  {
    console.log("✅ Usando URL de API configurada:", configuredApiUrl);
    return configuredApiUrl;
  }
};
const AUTH_CONFIG = {
  // URL base para endpoints de autenticación
  baseUrl: `${getApiBaseUrl()}/auth`,
  // Endpoints específicos
  endpoints: {
    login: `${getApiBaseUrl()}/auth/login`,
    logout: `${getApiBaseUrl()}/auth/logout`,
    refresh: `${getApiBaseUrl()}/auth/refresh`,
    me: `${getApiBaseUrl()}/users/me`
  },
  // Tokens
  tokenName: "token"};
const API_CONFIG = {
  // URL base de la API
  baseUrl: getApiBaseUrl(),
  // Timeout para peticiones (ms)
  timeout: 3e4,
  // Headers por defecto
  defaultHeaders: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }};

const API_BASE_URL = API_CONFIG.baseUrl;
const API_TIMEOUT = API_CONFIG.timeout;
const API_DEFAULT_HEADERS = API_CONFIG.defaultHeaders;
const getEnvironment = () => {
  if (typeof window === "undefined") return "server";
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("192.168.") || hostname.startsWith("10.") || hostname.indexOf(".local") > -1 || hostname.indexOf(".internal") > -1) {
    return "local";
  }
  return "production";
};
const environment = getEnvironment();
const isProduction = environment === "production";
const TOKEN_NAME = AUTH_CONFIG.tokenName;

export { API_BASE_URL as A, TOKEN_NAME as T, API_DEFAULT_HEADERS as a, API_TIMEOUT as b, environment as e, isProduction as i };
