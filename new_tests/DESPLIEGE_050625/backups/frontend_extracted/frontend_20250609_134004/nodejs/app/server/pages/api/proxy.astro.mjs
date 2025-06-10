import fetch from 'node-fetch';
export { e as renderers } from '../../chunks/vendor_Cou4nW0F.mjs';

// Proxy API para evitar problemas de CORS

// Configuración de la API
const API_URL = 'http://masclet-api:8000';
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
    console.log(\🔄 [Proxy] Normalizando endpoint: \ -> \/\);
    return \\/\;
  }
  return endpoint;
};

// Función para manejar peticiones POST
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const endpoint = body.endpoint;
    const data = body.data || {};

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
      : \\\\;

    console.log(\🔄 [Proxy] Redirigiendo POST a \\\);

    // Construir la URL completa para la petición
    const url = \\\\;

    // Obtener los headers de la petición original
    const requestHeaders = Object.fromEntries(request.headers.entries());

    // Crear los headers para la petición a la API
    const headers = {
      'Content-Type': 'application/json',
    };

    // Pasar el token de autenticación si existe
    if (requestHeaders.authorization) {
      headers['Authorization'] = requestHeaders.authorization;
      console.log(\🔄 [Proxy] Usando token de autenticación: \...\);
    } else {
      // Intentar obtener el token de la cookie
      const cookies = requestHeaders.cookie;
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          headers['Authorization'] = \Bearer \\;
          console.log(\🔄 [Proxy] Usando token de autenticación desde cookie: \...\);
        } else {
          console.log(\�� [Proxy] No se encontró token de autenticación en cookies\);
        }
      } else {
        console.log(\🔄 [Proxy] No se encontró token de autenticación en headers ni cookies\);
      }
    }

    // Opciones para la petición fetch
    const fetchOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    };

    // Configurar timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    fetchOptions.signal = controller.signal;

    // Caso especial para el endpoint de login
    if (fullEndpoint.includes('/auth/login')) {
      console.log('🔑 [Proxy] Detectada petición de login, ajustando formato de datos');

      // Para el login, usar application/x-www-form-urlencoded
      fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';

      // Convertir los datos a URLSearchParams
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }

      // Añadir campos requeridos para OAuth2 si no están presentes
      if (!formData.has('grant_type')) {
        formData.append('grant_type', 'password');
      }
      if (!formData.has('scope')) {
        formData.append('scope', '');
      }
      if (!formData.has('client_id')) {
        formData.append('client_id', '');
      }
      if (!formData.has('client_secret')) {
        formData.append('client_secret', '');
      }

      // Reemplazar el body con los datos en formato form-urlencoded
      fetchOptions.body = formData.toString();
      console.log(\🔑 [Proxy] Datos convertidos: \\);
    }

    const response = await fetch(url, fetchOptions);

    clearTimeout(timeoutId);

    console.log(\🔄 [Proxy] Respuesta recibida con estado: \ \\);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(\🔄 [Proxy] Error \ al conectar con \\);
      console.error(\🔄 [Proxy] Texto de estado: \\);

      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
        console.error(\🔄 [Proxy] Detalles del error:\, errorData);
      } catch (e) {
        errorData = { message: response.statusText };
        console.error(\🔄 [Proxy] No se pudo parsear la respuesta de error como JSON\);
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

          console.log(\🔑 [Proxy] Información de usuario extraída del token: \ (\)\);
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
    console.error(\🔄 [Proxy] Error al procesar la petición:\, error);

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
      : \\\\;

    console.log(\🔄 [Proxy] Redirigiendo GET a \\\);

    // Obtener los headers de la petición original
    const requestHeaders = Object.fromEntries(request.headers.entries());

    // Crear los headers para la petición a la API
    const headers = {
      'Content-Type': 'application/json',
    };

    // Pasar el token de autenticación si existe
    if (requestHeaders.authorization) {
      headers['Authorization'] = requestHeaders.authorization;
      console.log(\🔄 [Proxy] Usando token de autenticación: \...\);
    } else {
      // Intentar obtener el token de la cookie
      const cookies = requestHeaders.cookie;
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          headers['Authorization'] = \Bearer \\;
          console.log(\🔄 [Proxy] Usando token de autenticación desde cookie: \...\);
        } else {
          console.log(\🔄 [Proxy] No se encontró token de autenticación en cookies\);
        }
      } else {
        console.log(\🔄 [Proxy] No se encontró token de autenticación en headers ni cookies\);
      }
    }

    // Construir la URL con todos los parámetros de consulta excepto 'endpoint'
    let apiUrl = \\\\;
    const queryParams = new URLSearchParams();

    // Copiar todos los parámetros excepto 'endpoint'
    for (const [key, value] of params.entries()) {
      if (key !== 'endpoint') {
        queryParams.append(key, value);
      }
    }

    // Añadir parámetros a la URL si hay alguno
    if (queryParams.toString()) {
      apiUrl = \\\\\;
    }

    console.log(\🔄 [Proxy] URL completa: \\);

    // Configurar timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(\🔄 [Proxy] Respuesta recibida con estado: \ \\);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(\🔄 [Proxy] Error \ al conectar con \\);
      console.error(\🔄 [Proxy] Texto de estado: \\);

      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
        console.error(\🔄 [Proxy] Detalles del error:\, errorData);
      } catch (e) {
        errorData = { message: response.statusText };
        console.error(\🔄 [Proxy] No se pudo parsear la respuesta de error como JSON\);
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
    console.error(\🔄 [Proxy] Error al procesar la petición GET:\, error);

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
