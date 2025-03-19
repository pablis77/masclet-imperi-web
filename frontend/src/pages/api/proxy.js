// Proxy API para evitar problemas de CORS
import fetch from 'node-fetch';

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
