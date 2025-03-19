// Astro API endpoint para autenticación (formato Astro v4)
export async function POST({ request }) {
  try {
    // URL del backend con la ruta correcta para la autenticación
    const backendUrl = 'http://127.0.0.1:8000/api/v1/auth/login';
    
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
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });
    
    console.log('Respuesta del backend:', response.status, response.statusText);
    
    // Obtener el texto de respuesta
    const responseText = await response.text();
    console.log('Respuesta como texto:', responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''));
    
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
    
    // Si la respuesta no es exitosa, devolver el error
    if (!response.ok) {
      console.error('Error de autenticación:', response.status, responseData);
      return new Response(
        JSON.stringify({
          error: true,
          status: response.status,
          message: responseData.detail || 'Error de autenticación',
          data: responseData
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Verificar que la respuesta tenga un token
    if (!responseData.access_token) {
      console.error('La respuesta no contiene un token de acceso:', responseData);
      return new Response(
        JSON.stringify({
          error: true,
          message: 'La respuesta no contiene un token de acceso',
          data: responseData
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Obtener información del usuario
    let userData;
    try {
      // Hacer una petición al endpoint de usuario actual usando el token
      const userResponse = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${responseData.access_token}`,
          'Accept': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        userData = await userResponse.json();
        console.log('Datos de usuario obtenidos:', userData);
        
        // Añadir información del usuario a la respuesta
        responseData.user = userData;
      } else {
        console.error('Error al obtener datos del usuario:', userResponse.status);
        // Si no podemos obtener los datos del usuario, creamos un objeto básico
        // para que la aplicación pueda continuar
        responseData.user = {
          id: 1,
          username: data.username,
          is_active: true,
          role: data.username === 'admin' ? 'administrador' : 'usuario'
        };
        console.log('Usando datos de usuario por defecto:', responseData.user);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      // Si hay un error, creamos un objeto básico de usuario
      responseData.user = {
        id: 1,
        username: data.username,
        is_active: true,
        role: data.username === 'admin' ? 'administrador' : 'usuario'
      };
      console.log('Usando datos de usuario por defecto:', responseData.user);
    }
    
    // Devolver la respuesta completa
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
    // Manejo de errores
    console.error('Error en el proxy de autenticación:', error);
    
    return new Response(
      JSON.stringify({ 
        error: true,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
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
