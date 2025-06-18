import fetch from 'node-fetch';
export { e as renderers } from '../../chunks/vendor_B30v18IX.mjs';

// Proxy API para evitar problemas de CORS

// Configuración de la API
const API_URL = 'http://127.0.0.1:8000';
const API_PREFIX = '/api/v1';

// Función para normalizar endpoints
const normalizeEndpoint = (endpoint) => {
  // Si es un endpoint que debe terminar con /, asegurarse de que lo tenga
  if (
    (endpoint.includes('/dashboard/') || 
     endpoint.includes('/animals/') || 
     endpoint.includes('/explotacions/')) && 
    !endpoint.endsWith('/')
  ) {
    console.log(`🔄 [Proxy] Normalizando endpoint: ${endpoint} -> ${endpoint}/`);
    return `${endpoint}/`;
  }
  return endpoint;
};

// Función para manejar peticiones POST
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const endpoint = body.endpoint;
    const data = body.data || {};
    const method = body.method || 'POST';
    
    // Normalizar y asegurarse de que el endpoint tenga el prefijo correcto
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const fullEndpoint = normalizedEndpoint.startsWith(API_PREFIX) 
      ? normalizedEndpoint 
      : `${API_PREFIX}${normalizedEndpoint}`;
    
    console.log(`🔄 [Proxy] Redirigiendo ${method} a ${API_URL}${fullEndpoint}`);
    console.log(`🔄 [Proxy] URL completa: ${API_URL}${fullEndpoint}`);
    
    // Obtener los headers de la petición original
    const requestHeaders = Object.fromEntries(request.headers.entries());
    
    // Crear los headers para la petición a la API
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Pasar el token de autenticación si existe, excepto para el endpoint de login
    if (!fullEndpoint.includes('/auth/login/')) {
      if (requestHeaders.authorization) {
        headers['Authorization'] = requestHeaders.authorization;
        console.log(`🔄 [Proxy] Usando token de autenticación: ${requestHeaders.authorization.substring(0, 15)}...`);
      } else {
        // Intentar obtener el token de la cookie
        const cookies = requestHeaders.cookie;
        if (cookies) {
          const tokenMatch = cookies.match(/token=([^;]+)/);
          if (tokenMatch && tokenMatch[1]) {
            const token = tokenMatch[1];
            headers['Authorization'] = `Bearer ${token}`;
            console.log(`🔄 [Proxy] Usando token de autenticación desde cookie: ${token.substring(0, 15)}...`);
          } else {
            console.log(`🔄 [Proxy] No se encontró token de autenticación en cookies`);
          }
        } else {
          console.log(`🔄 [Proxy] No se encontró token de autenticación en headers ni cookies`);
        }
      }
    } else {
      console.log(`🔄 [Proxy] Petición de login, no se requiere token`);
    }
    
    // Configurar timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    // Configurar la petición según el método
    let fetchOptions = {
      method: method,
      headers: headers,
      signal: controller.signal
    };
    
    // Para métodos GET, convertir el cuerpo en parámetros de consulta
    let url = `${API_URL}${fullEndpoint}`;
    
    if (method === 'GET' && data && Object.keys(data).length > 0) {
      // Convertir datos a parámetros de consulta
      const queryParams = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      // Añadir parámetros a la URL
      url = `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;
      console.log(`🔄 [Proxy] Datos enviados como parámetros de consulta: ${queryParams.toString()}`);
      
      // No incluir body en peticiones GET
      fetchOptions.body = undefined;
    } else if (method !== 'GET') {
      // Solo incluir body para métodos que no sean GET
      fetchOptions.body = JSON.stringify(data);
      console.log(`🔄 [Proxy] Datos enviados en el cuerpo:`, data);
    }
    
    // Para el endpoint de login, añadir información adicional
    if (fullEndpoint.includes('/auth/login')) {
      console.log('🔑 [Proxy] Procesando solicitud de login');
      
      // Para OAuth2, necesitamos enviar los datos como form-urlencoded
      if (method === 'POST' && data) {
        console.log('🔑 [Proxy] Convirtiendo datos a formato form-urlencoded para OAuth2');
        
        // Cambiar el Content-Type para form-urlencoded
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        
        // Convertir el objeto a URLSearchParams
        const formData = new URLSearchParams();
        
        // Añadir los campos requeridos por OAuth2 de FastAPI
        formData.append('username', data.username || '');
        formData.append('password', data.password || '');
        
        // Campos adicionales que pueden ser requeridos por OAuth2
        formData.append('grant_type', 'password');
        formData.append('scope', '');
        formData.append('client_id', '');
        formData.append('client_secret', '');
        
        // Reemplazar el body con los datos en formato form-urlencoded
        fetchOptions.body = formData.toString();
        console.log(`🔑 [Proxy] Datos convertidos: ${fetchOptions.body}`);
      }
    }
    
    const response = await fetch(url, fetchOptions);
    
    clearTimeout(timeoutId);
    
    console.log(`🔄 [Proxy] Respuesta recibida con estado: ${response.status} ${response.statusText}`);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`🔄 [Proxy] Error ${response.status} al conectar con ${url}`);
      console.error(`🔄 [Proxy] Texto de estado: ${response.statusText}`);
      
      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
        console.error(`🔄 [Proxy] Detalles del error:`, errorData);
      } catch (e) {
        errorData = { message: response.statusText };
        console.error(`🔄 [Proxy] No se pudo parsear la respuesta de error como JSON`);
      }
      
      return new Response(
        JSON.stringify({
          error: true,
          status: response.status,
          message: errorData.detail || errorData.message || response.statusText,
          details: errorData
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Procesar la respuesta exitosa
    const data_response = await response.json();
    
    // Para el endpoint de login, añadir información adicional
    if (fullEndpoint.includes('/auth/login/') && data_response.access_token) {
      console.log('🔑 [Proxy] Inicio de sesión exitoso, procesando token');
      
      try {
        // Decodificar el token para obtener información del usuario
        const tokenParts = data_response.access_token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Añadir información del usuario a la respuesta
          data_response.user = {
            username: payload.sub || 'usuario',
            role: payload.role || 'usuario',
            id: payload.user_id || 0,
            is_active: true
          };
          
          console.log(`🔑 [Proxy] Información de usuario extraída del token: ${data_response.user.username} (${data_response.user.role})`);
        }
      } catch (error) {
        console.error('❌ [Proxy] Error al decodificar token:', error);
      }
    }
    
    return new Response(
      JSON.stringify(data_response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error(`🔄 [Proxy] Error al procesar la petición:`, error);
    
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || 'Error desconocido',
        stack: error.stack
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

// Función para manejar peticiones GET
const GET = async ({ request, url }) => {
  try {
    // Obtener el endpoint de los parámetros de consulta
    const params = new URL(request.url).searchParams;
    const endpoint = params.get('endpoint');
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({
          error: true,
          message: 'Se requiere el parámetro endpoint'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Normalizar y asegurarse de que el endpoint tenga el prefijo correcto
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const fullEndpoint = normalizedEndpoint.startsWith(API_PREFIX) 
      ? normalizedEndpoint 
      : `${API_PREFIX}${normalizedEndpoint}`;
    
    console.log(`🔄 [Proxy] Redirigiendo GET a ${API_URL}${fullEndpoint}`);
    
    // Obtener los headers de la petición original
    const requestHeaders = Object.fromEntries(request.headers.entries());
    
    // Crear los headers para la petición a la API
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Pasar el token de autenticación si existe
    if (requestHeaders.authorization) {
      headers['Authorization'] = requestHeaders.authorization;
      console.log(`🔄 [Proxy] Usando token de autenticación: ${requestHeaders.authorization.substring(0, 15)}...`);
    } else {
      // Intentar obtener el token de la cookie
      const cookies = requestHeaders.cookie;
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          headers['Authorization'] = `Bearer ${token}`;
          console.log(`🔄 [Proxy] Usando token de autenticación desde cookie: ${token.substring(0, 15)}...`);
        } else {
          console.log(`🔄 [Proxy] No se encontró token de autenticación en cookies`);
        }
      } else {
        console.log(`🔄 [Proxy] No se encontró token de autenticación en headers ni cookies`);
      }
    }
    
    // Construir la URL con todos los parámetros de consulta excepto 'endpoint'
    let apiUrl = `${API_URL}${fullEndpoint}`;
    const queryParams = new URLSearchParams();
    
    // Copiar todos los parámetros excepto 'endpoint'
    for (const [key, value] of params.entries()) {
      if (key !== 'endpoint') {
        queryParams.append(key, value);
      }
    }
    
    // Añadir parámetros a la URL si hay alguno
    if (queryParams.toString()) {
      apiUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${queryParams.toString()}`;
    }
    
    console.log(`🔄 [Proxy] URL completa: ${apiUrl}`);
    
    // Configurar timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`🔄 [Proxy] Respuesta recibida con estado: ${response.status} ${response.statusText}`);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`🔄 [Proxy] Error ${response.status} al conectar con ${apiUrl}`);
      console.error(`🔄 [Proxy] Texto de estado: ${response.statusText}`);
      
      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
        console.error(`🔄 [Proxy] Detalles del error:`, errorData);
      } catch (e) {
        errorData = { message: response.statusText };
        console.error(`🔄 [Proxy] No se pudo parsear la respuesta de error como JSON`);
      }
      
      return new Response(
        JSON.stringify({
          error: true,
          status: response.status,
          message: errorData.detail || errorData.message || response.statusText,
          details: errorData
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Procesar la respuesta exitosa
    const data_response = await response.json();
    
    return new Response(
      JSON.stringify(data_response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error(`🔄 [Proxy] Error al procesar la petición GET:`, error);
    
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || 'Error desconocido',
        stack: error.stack
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
