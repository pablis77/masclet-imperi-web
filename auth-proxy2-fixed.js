export { e as renderers } from '../../chunks/vendor_Cou4nW0F.mjs';

// Astro API endpoint para autenticación (formato Astro v4)
async function POST({ request }) {
  try {
    // URL del backend con la ruta correcta para la autenticación
    const backendUrl = "http://masclet-api:8000/api/v1/auth/login";
    
    // Determinar el tipo de contenido
    const contentType = request.headers.get("content-type") || '';
    
    let username, password;
    
    // Procesar según el tipo de contenido
    if (contentType.includes("application/json")) {
      // Obtener los datos JSON del cuerpo de la solicitud
      const data = await request.json();
      username = data.username;
      password = data.password;
    } else if (contentType.includes("multipart/form-data")) {
      // Procesar datos de formulario multipart
      const formData = await request.formData();
      username = formData.get("username");
      password = formData.get("password");
    } else {
      // En otros casos, intentar obtener datos URL-encoded
      const formData = await request.formData();
      username = formData.get("username");
      password = formData.get("password");
    }
    
    // Verificar que tenemos los datos necesarios
    if (!username || !password) {
      console.error("🔴 [Auth-Proxy2] Error: Faltan credenciales");
      return new Response(
        JSON.stringify({
          error: "Se requieren nombre de usuario y contraseña"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    console.log("🔄 [Auth-Proxy2] Enviando petición de login para: " + username);
    
    // Crear FormData para enviar al endpoint de backend
    const authFormData = new URLSearchParams();
    authFormData.append("username", username);
    authFormData.append("password", password);
    authFormData.append("grant_type", "password");
    
    // Realizar la solicitud al backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: authFormData
    });
    
    // Obtener la respuesta como JSON
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("❌ [Auth-Proxy2] Error de autenticación: " + response.status);
      
      // Devolver respuesta de error
      return new Response(
        JSON.stringify({
          error: "Error en la autenticación",
          details: responseData.detail || "Error desconocido"
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Autenticación exitosa
    console.log("✅ [Auth-Proxy2] Autenticación exitosa para: " + username);
    
    // Devolver la respuesta del backend
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    // Error en el procesamiento
    console.error("❌ [Auth-Proxy2] Error: " + (error.message || "Error desconocido"));
    
    return new Response(
      JSON.stringify({
        error: "Error en el servidor",
        message: error.message || "Error desconocido"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}

export { POST };
