import type { APIRoute } from 'astro';

// Definición del endpoint POST para autenticación
export const POST: APIRoute = async ({ request }) => {
  try {
    // URL del backend (usando la ruta correcta)
    const backendUrl = 'http://localhost:8000/api/v1/auth/login';
    
    // Obtener los datos JSON del cuerpo de la solicitud
    const data = await request.json();
    
    // Preparar datos para la autenticación en el formato correcto para FastAPI
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    // Realizar la solicitud al backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    // Obtener los datos de respuesta del backend
    const responseData = await response.json();
    
    // Devolver la respuesta con el mismo código de estado
    return new Response(
      JSON.stringify(responseData),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    // Manejo de errores
    console.error('Error en el proxy de autenticación:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error en la autenticación',
        message: error instanceof Error ? error.message : 'Error desconocido'
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
