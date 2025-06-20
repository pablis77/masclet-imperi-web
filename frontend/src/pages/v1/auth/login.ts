import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🔑 Proxy auth: Procesando login en producción');
    
    // Obtener FormData
    const formData = await request.formData();
    
    // Reenviar al backend real
    const backendUrl = 'http://34.253.203.194:8000/api/v1/auth/login';
    console.log(`[Auth Proxy] Reenviando al backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData, // Mantener el FormData tal cual
    });
    
    if (!response.ok) {
      console.error(`[Auth Proxy] Error del backend: ${response.status} ${response.statusText}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Error de autenticación', 
          status: response.status,
          statusText: response.statusText
        }),
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Obtener respuesta del backend y devolverla tal cual
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('[Auth Proxy] Error al procesar login:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud de login' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
