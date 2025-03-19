// Proxy API para evitar problemas de CORS
import fetch from 'node-fetch';

// Función para manejar peticiones POST
export async function post({ request }) {
  const API_URL = 'http://localhost:8000';
  const body = await request.json();
  const endpoint = body.endpoint;
  const data = body.data;
  const method = body.method || 'POST';
  
  console.log(`Proxy: Redirigiendo ${method} a ${API_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error en el proxy:', error);
    return new Response(JSON.stringify({ 
      message: 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
      status: 0,
      code: 'NETWORK_ERROR',
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Función para manejar peticiones GET
export async function get({ request }) {
  const API_URL = 'http://localhost:8000';
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint') || '';
  
  console.log(`Proxy: Redirigiendo GET a ${API_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error en el proxy GET:', error);
    return new Response(JSON.stringify({ 
      message: 'No se pudo conectar con el servidor. Por favor, verifique su conexión.',
      status: 0,
      code: 'NETWORK_ERROR',
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
