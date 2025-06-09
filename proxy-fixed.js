import fetch from 'node-fetch';
export { e as renderers } from '../../chunks/vendor_Cou4nW0F.mjs';

// Proxy API para evitar problemas de CORS

// Configuración de la API
const API_URL = "http://masclet-api:8000";
const API_PREFIX = "/api/v1";

// Función para normalizar endpoints
const normalizeEndpoint = (endpoint) => {
  // Lista de patrones que requieren barra al final
  const requiresSlash = [
    "/dashboard/",
    "/animals/", 
    "/dashboard-detallado/",
    "/dashboard-periodo/",
    "/explotacions/", 
    "/imports/",
    "/backup/", 
    "/scheduled-backup/",
    "/listados/",
    "/users/", 
    "/partos/",
    "/notifications/", 
    "/auth/", 
    "/admin/",
    "/diagnostico/"
  ];
  
  // Verificar si el endpoint ya termina en barra
  if (endpoint.endsWith("/")) {
    return endpoint; // Ya tiene barra final, no hacemos nada
  }
  
  // Comprobar si el endpoint debe llevar barra final
  for (const pattern of requiresSlash) {
    if (endpoint.includes(pattern)) {
      console.log("🔄 [Proxy] Normalizando endpoint: " + endpoint + " -> " + endpoint + "/");
      return endpoint + "/";
    }
  }
  
  // Caso especial: endpoints de raíz de recursos que siempre llevan barra
  // Estos son los que siguen el patrón /api/v1/recurso
  const rootResourcePattern = /^\/api\/v1\/[a-zA-Z0-9-_]+$/;
  if (rootResourcePattern.test(endpoint)) {
    console.log("🔄 [Proxy] Normalizando endpoint de recurso raíz: " + endpoint + " -> " + endpoint + "/");
    return endpoint + "/";
  }
  
  // Si no coincide con ningún patrón, devolvemos el endpoint sin modificar
  return endpoint;
};

// Función para manejar peticiones POST
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const endpoint = body.endpoint;
    const data = body.data || {};
    
    // Si no hay endpoint, error
    if (!endpoint) {
      return new Response(
        JSON.stringify({
          error: "Endpoint no especificado"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Normalizar endpoint
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    
    // URL completa
    const fullEndpoint = `${API_URL}${API_PREFIX}${normalizedEndpoint}`;
    console.log("🔄 [Proxy] POST a: " + fullEndpoint);
    console.log("🔄 [Proxy] Datos: " + JSON.stringify(data));
    
    // Determinar si necesitamos token en la petición
    let headers = {
      "Content-Type": "application/json"
    };
    
    // Obtener token de la petición original si existe
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    // Realizar la petición al backend
    const response = await fetch(fullEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    
    // Si no es OK, devolver error
    if (!response.ok) {
      console.error("❌ [Proxy] Error en respuesta POST: " + response.status);
      
      let errorResponse = {
        error: "Error en la petición al servidor",
        status: response.status,
        endpoint: normalizedEndpoint
      };
      
      try {
        const errorData = await response.json();
        errorResponse.details = errorData;
      } catch (e) {
        errorResponse.message = "Error al procesar respuesta de error";
      }
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Procesar respuesta
    const data_response = await response.json();
    
    // Caso especial: login
    if (fullEndpoint.includes("/auth/login/") && data_response.access_token) {
      console.log("🔑 [Proxy] Inicio de sesión exitoso, procesando token");
      
      try {
        // Decodificar el token para obtener información del usuario
        const tokenParts = data_response.access_token.split(".");
        if (tokenParts.length === 3) {
          const base64Payload = tokenParts[1];
          const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString("utf8"));
          console.log("🔑 [Proxy] Usuario: " + payload.sub);
          
          // Añadir información adicional a la respuesta
          data_response.user_info = {
            username: payload.sub
          };
        }
      } catch (tokenError) {
        console.error("❌ [Proxy] Error al procesar el token: " + tokenError.message);
      }
    }
    
    // Devolver respuesta
    return new Response(
      JSON.stringify(data_response),
      {
        status: response.status,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("❌ [Proxy] Error al procesar la petición: ", error);
    
    return new Response(
      JSON.stringify({
        error: "Error en el servidor",
        message: error.message || "Error desconocido"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

// Función para manejar peticiones GET
const GET = async ({ request, url }) => {
  try {
    // Obtener el endpoint de la URL
    const endpoint = url.searchParams.get("endpoint");
    
    // Si no hay endpoint, error
    if (!endpoint) {
      return new Response(
        JSON.stringify({
          error: "Endpoint no especificado"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Normalizar endpoint
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    
    // URL completa
    const fullEndpoint = `${API_URL}${API_PREFIX}${normalizedEndpoint}`;
    console.log("🔄 [Proxy] GET a: " + fullEndpoint);
    
    // Determinar si necesitamos token en la petición
    let headers = {};
    
    // Obtener token de la petición original si existe
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
      console.log("🔑 [Proxy] Usando token de autenticación");
    }
    
    // Realizar la petición al backend
    const response = await fetch(fullEndpoint, {
      method: "GET",
      headers
    });
    
    // Si no es OK, devolver error
    if (!response.ok) {
      console.error("❌ [Proxy] Error en respuesta GET: " + response.status);
      
      let errorResponse = {
        error: "Error en la petición al servidor",
        status: response.status,
        endpoint: normalizedEndpoint
      };
      
      try {
        const errorData = await response.json();
        errorResponse.details = errorData;
      } catch (e) {
        errorResponse.message = "Error al procesar respuesta de error";
      }
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Procesar respuesta
    const data_response = await response.json();
    
    // Devolver respuesta
    return new Response(
      JSON.stringify(data_response),
      {
        status: response.status,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("❌ [Proxy] Error al procesar la petición GET: ", error);
    
    return new Response(
      JSON.stringify({
        error: "Error en el servidor",
        message: error.message || "Error desconocido"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

// Exportar las funciones
export { GET, POST };
