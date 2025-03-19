// Astro API endpoint para autenticación
// Este endpoint actúa como proxy entre el frontend y el backend
import type { APIRoute } from 'astro';

// Definición del endpoint POST
export const POST: APIRoute = async ({ request }) => {
  try {
    // URL del backend (usando la ruta correcta según la memoria)
    const backendUrl = 'http://localhost:8000/api/v1/auth/login';
    
    // Obtener los datos JSON del cuerpo de la solicitud
    const data = await request.json();
    console.log('Datos recibidos para autenticación:', {
      username: data.username,
      password: '*'.repeat(data.password?.length || 0)
    });
    
    // Preparar datos para la autenticación en el formato correcto para FastAPI
    // FastAPI espera un formulario application/x-www-form-urlencoded para OAuth
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    console.log('Enviando solicitud a:', backendUrl);
    console.log('Con formato de datos: application/x-www-form-urlencoded');
    
    // Realizar la solicitud al backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });
    
    console.log('Respuesta del backend:', response.status);
    
    const responseText = await response.text();
    console.log('Texto de respuesta completo:', responseText);
    
    let responseData;
    try {
      // Intentar parsear como JSON
      responseData = JSON.parse(responseText);
      console.log('Respuesta parseada:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.error('Error al parsear respuesta como JSON:', e);
      // Si no es JSON, devolver como texto
      return new Response(
        JSON.stringify({ 
          error: 'Error en el formato de respuesta del servidor',
          raw_response: responseText
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Si la respuesta es un error, incluir información detallada
    if (!response.ok) {
      console.error('Respuesta de error del backend:', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Error en la autenticación',
          status: response.status,
          detail: responseData.detail || 'No hay detalles disponibles',
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
    
    // IMPORTANTE: Construimos una respuesta que el frontend pueda consumir
    // Es posible que la respuesta del backend no contenga una estructura de user
    // En ese caso, la creamos nosotros
    const processedResponse = {
      access_token: responseData.access_token,
      token_type: responseData.token_type || 'bearer',
      user: responseData.user || {
        id: 1,
        username: data.username,
        is_active: true,
        is_superuser: data.username === 'admin',
        role: responseData.role || (data.username === 'admin' ? 'administrador' : 'usuario')
      }
    };
    
    console.log('Respuesta construida para el frontend:', JSON.stringify(processedResponse, null, 2));
    
    // Procesar la respuesta para incluir el rol del usuario
    if (processedResponse.user) {
      console.log('Datos originales del usuario:', processedResponse.user);
      
      // Determinar el rol basado en la información del usuario
      if (processedResponse.user.role) {
        // Si ya viene un rol, asegurar que esté en formato correcto para el frontend
        const roleString = processedResponse.user.role.toString();
        console.log('Rol original del backend:', roleString);
        
        if (roleString.includes('ADMIN')) {
          processedResponse.user.role = 'administrador';
        } else if (roleString.includes('GERENTE')) {
          processedResponse.user.role = 'gerente';
        } else if (roleString.includes('EDITOR')) {
          processedResponse.user.role = 'editor';
        } else if (roleString.includes('USUARIO')) {
          processedResponse.user.role = 'usuario';
        }
        console.log('Rol convertido en proxy:', processedResponse.user.role);
      } else if (processedResponse.user.is_superuser) {
        processedResponse.user.role = 'administrador';
        console.log('Rol asignado por is_superuser:', processedResponse.user.role);
      } else if (processedResponse.user.username === 'gerente') {
        processedResponse.user.role = 'gerente';
        console.log('Rol asignado por username gerente:', processedResponse.user.role);
      } else if (processedResponse.user.username.includes('editor')) {
        processedResponse.user.role = 'editor';
        console.log('Rol asignado por username con editor:', processedResponse.user.role);
      } else {
        processedResponse.user.role = 'usuario';
        console.log('Rol asignado por defecto:', processedResponse.user.role);
      }
    }
    
    console.log('Respuesta final procesada:', JSON.stringify(processedResponse, null, 2));
    
    // Devolver la respuesta con el mismo código de estado
    return new Response(
      JSON.stringify(processedResponse),
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
