// Astro API endpoint para autenticación (formato Astro v4)
export async function POST({ request }) {
  try {
    // URL del backend con la ruta correcta para la autenticación
    const backendUrl = 'http://localhost:8000/api/v1/auth/login';
    
    // Obtener los datos JSON del cuerpo de la solicitud
    const data = await request.json();
    
    // Preparar datos para la autenticación en el formato correcto para FastAPI
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    console.log('Enviando solicitud a:', backendUrl);
    console.log('Con datos:', { username: data.username, password: '***********' });
    
    // Realizar la solicitud al backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    // Obtener el texto de respuesta
    const responseText = await response.text();
    
    // Intentar parsear como JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parseando respuesta JSON:', e);
      console.error('Respuesta recibida:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Error parseando respuesta del servidor',
          details: responseText.substring(0, 255)
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    console.log('Respuesta del backend:', response.status);
    
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
}
