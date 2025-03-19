// Proxy API para evitar problemas de CORS
import fetch from 'node-fetch';

// Configuración de la API
const API_URL = 'http://127.0.0.1:8000';
const API_PREFIX = '/api/v1';

// Función para manejar peticiones POST
export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const endpoint = body.endpoint;
    const data = body.data;
    const method = body.method || 'POST';
    
    // Asegurarse de que el endpoint tenga el prefijo correcto
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;
    
    console.log(`Proxy: Redirigiendo ${method} a ${API_URL}${fullEndpoint}`);
    console.log(`Proxy: URL completa: ${API_URL}${fullEndpoint}`);
    console.log(`Proxy: Datos enviados:`, data);
    
    // Obtener los headers de la petición original
    const requestHeaders = Object.fromEntries(request.headers.entries());
    
    // Crear los headers para la petición a la API
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Pasar el token de autenticación si existe
    if (requestHeaders.authorization) {
      headers['Authorization'] = requestHeaders.authorization;
      console.log(`Proxy: Usando token de autenticación: ${requestHeaders.authorization.substring(0, 15)}...`);
    } else {
      // Intentar obtener el token de la cookie
      const cookies = requestHeaders.cookie;
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          headers['Authorization'] = `Bearer ${token}`;
          console.log(`Proxy: Usando token de autenticación desde cookie: ${token.substring(0, 15)}...`);
        } else {
          console.log(`Proxy: No se encontró token de autenticación en cookies`);
        }
      } else {
        console.log(`Proxy: No se encontró token de autenticación en headers ni cookies`);
      }
    }
    
    // Configurar timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    const response = await fetch(`${API_URL}${fullEndpoint}`, {
      method: method,
      headers: headers,
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Proxy: Respuesta recibida con estado: ${response.status} ${response.statusText}`);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`Proxy: Error ${response.status} al conectar con ${API_URL}${fullEndpoint}`);
      console.error(`Proxy: Texto de estado: ${response.statusText}`);
      
      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
        console.error(`Proxy: Detalles del error:`, errorData);
      } catch (e) {
        errorData = { message: response.statusText };
        console.error(`Proxy: No se pudo parsear la respuesta de error como JSON`);
      }
      
      return new Response(
        JSON.stringify({
          error: true,
          status: response.status,
          statusText: response.statusText,
          message: errorData.detail || errorData.message || 'Error desconocido',
          data: errorData
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Parsear la respuesta como JSON
    const responseData = await response.json();
    console.log(`Proxy: Datos recibidos:`, responseData);
    
    // Devolver la respuesta
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error(`Proxy: Error al procesar la petición:`, error);
    
    // Verificar si es un error de timeout
    if (error.name === 'AbortError') {
      return new Response(
        JSON.stringify({
          error: true,
          message: 'La petición ha excedido el tiempo de espera',
          code: 'TIMEOUT_ERROR'
        }),
        {
          status: 504,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || 'Error al procesar la petición',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
export const GET = async ({ request }) => {
  try {
    // Obtener la URL de la petición
    const url = new URL(request.url);
    const params = url.searchParams;
    
    // Obtener el endpoint de la API
    const endpoint = params.get('endpoint');
    if (!endpoint) {
      return new Response(
        JSON.stringify({
          error: true,
          message: 'Falta el parámetro endpoint'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Asegurarse de que el endpoint tenga el prefijo correcto
    const fullEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;
    
    // Construir la URL de la API con los parámetros adicionales
    const apiUrl = new URL(`${API_URL}${fullEndpoint}`);
    
    // Copiar todos los parámetros excepto 'endpoint'
    for (const [key, value] of params.entries()) {
      if (key !== 'endpoint') {
        apiUrl.searchParams.append(key, value);
      }
    }
    
    console.log(`Proxy: Redirigiendo GET a ${apiUrl.toString()}`);
    
    // Obtener los headers de la petición original
    const requestHeaders = Object.fromEntries(request.headers.entries());
    
    // Crear los headers para la petición a la API
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Pasar el token de autenticación si existe
    if (requestHeaders.authorization) {
      headers['Authorization'] = requestHeaders.authorization;
      console.log(`Proxy: Usando token de autenticación: ${requestHeaders.authorization.substring(0, 15)}...`);
    } else {
      // Intentar obtener el token de la cookie
      const cookies = requestHeaders.cookie;
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          headers['Authorization'] = `Bearer ${token}`;
          console.log(`Proxy: Usando token de autenticación desde cookie: ${token.substring(0, 15)}...`);
        } else {
          console.log(`Proxy: No se encontró token de autenticación en cookies`);
        }
      } else {
        console.log(`Proxy: No se encontró token de autenticación en headers ni cookies`);
      }
    }
    
    // Configurar timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    const response = await fetch(apiUrl.toString(), { 
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Proxy: Respuesta recibida con estado: ${response.status} ${response.statusText}`);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`Proxy: Error ${response.status} al conectar con ${apiUrl.toString()}`);
      console.error(`Proxy: Texto de estado: ${response.statusText}`);
      
      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
        console.error(`Proxy: Detalles del error:`, errorData);
      } catch (e) {
        errorData = { message: response.statusText };
        console.error(`Proxy: No se pudo parsear la respuesta de error como JSON`);
      }
      
      return new Response(
        JSON.stringify({
          error: true,
          status: response.status,
          statusText: response.statusText,
          message: errorData.detail || errorData.message || 'Error desconocido',
          data: errorData
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Parsear la respuesta como JSON
    const responseData = await response.json();
    console.log(`Proxy: Datos recibidos:`, responseData);
    
    // Devolver la respuesta
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error(`Proxy: Error al procesar la petición:`, error);
    
    // Verificar si es un error de timeout
    if (error.name === 'AbortError') {
      return new Response(
        JSON.stringify({
          error: true,
          message: 'La petición ha excedido el tiempo de espera',
          code: 'TIMEOUT_ERROR'
        }),
        {
          status: 504,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || 'Error al procesar la petición',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
