export { e as renderers } from '../../chunks/vendor_Cou4nW0F.mjs';

// Versión mejorada del proxy de autenticación que maneja tanto JSON como URL-encoded
const POST = async ({ request }) => {
  try {
    console.log("🔄 [Auth-Proxy] Recibida solicitud de autenticación");
    
    // URL del backend (usando masclet-api en Docker)
    const backendUrl = "http://masclet-api:8000/api/v1/auth/login";
    console.log("🔄 [Auth-Proxy] URL backend: " + backendUrl);
    
    // Detectar formato de datos
    const contentType = request.headers.get("content-type") || "";
    console.log("🔄 [Auth-Proxy] Content-Type recibido: " + contentType);
    
    // Variables para username y password
    let username, password;
    
    // Procesar según formato de entrada
    if (contentType.includes("application/json")) {
      // Formato JSON
      try {
        const data = await request.json();
        username = data.username;
        password = data.password;
        console.log("🔄 [Auth-Proxy] Datos recibidos en formato JSON para: " + username);
      } catch (error) {
        console.error("❌ [Auth-Proxy] Error al procesar JSON:", error);
        return new Response(
          JSON.stringify({ error: "Error al procesar formato JSON" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      // Formato form-urlencoded
      try {
        const formData = await request.formData();
        username = formData.get("username");
        password = formData.get("password");
        console.log("🔄 [Auth-Proxy] Datos recibidos en formato form-urlencoded para: " + username);
      } catch (error) {
        console.error("❌ [Auth-Proxy] Error al procesar form-data:", error);
        return new Response(
          JSON.stringify({ error: "Error al procesar formato form-urlencoded" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      // Formato no soportado
      console.error("❌ [Auth-Proxy] Formato de contenido no soportado: " + contentType);
      return new Response(
        JSON.stringify({ 
          error: "Formato no soportado", 
          message: "Soportados: application/json o application/x-www-form-urlencoded" 
        }),
        { status: 415, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Validar datos mínimos
    if (!username || !password) {
      console.error("❌ [Auth-Proxy] Faltan credenciales");
      return new Response(
        JSON.stringify({ error: "Faltan credenciales (username o password)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Preparar datos para el backend (siempre en formato form-urlencoded como espera FastAPI/OAuth2)
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("grant_type", "password");
    
    console.log("🔄 [Auth-Proxy] Enviando petición a backend: " + backendUrl);
    
    // Enviar al backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: formData
    });
    
    // Procesar respuesta
    if (!response.ok) {
      console.error(`❌ [Auth-Proxy] Error del backend: ${response.status} ${response.statusText}`);
      
      // Intentar leer el cuerpo de error
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: "Error en la respuesta del servidor" };
      }
      
      return new Response(
        JSON.stringify({
          error: "Error en la autenticación",
          status: response.status,
          statusText: response.statusText,
          detail: errorData
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Si llegamos aquí, todo está OK
    const responseData = await response.json();
    console.log("✅ [Auth-Proxy] Login exitoso para usuario: " + username);
    
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // Error general
    console.error("❌ [Auth-Proxy] Error crítico:", error);
    return new Response(
      JSON.stringify({
        error: "Error en la autenticación",
        message: error instanceof Error ? error.message : "Error desconocido"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
