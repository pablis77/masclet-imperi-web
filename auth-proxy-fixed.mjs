export { e as renderers } from '../../chunks/vendor_Cou4nW0F.mjs';

const POST = async ({ request }) => {
  try {
    const backendUrl = "http://masclet-api:8000/api/v1/auth/login";
    
    // Aceptamos tanto application/json como form-urlencoded
    const contentType = request.headers.get("Content-Type") || "";
    
    let username = "";
    let password = "";
    
    // Procesamos según el tipo de contenido
    if (contentType.includes("application/json")) {
      // Si es JSON, lo procesamos como JSON
      const data = await request.json();
      username = data.username;
      password = data.password;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      // Si es form-urlencoded, lo procesamos como tal
      const formData = await request.formData();
      username = formData.get("username");
      password = formData.get("password");
    } else {
      // Si no es ninguno de los formatos esperados, devolvemos error
      return new Response(
        JSON.stringify({ error: "Formato de solicitud no soportado" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Preparamos los datos para enviar al backend
    const formDataToSend = new URLSearchParams();
    formDataToSend.append("username", username);
    formDataToSend.append("password", password);
    formDataToSend.append("grant_type", "password");

    console.log(`🔄 [Auth-Proxy-Fixed] Enviando petición de login a: ${backendUrl}`);
    console.log(`🔄 [Auth-Proxy-Fixed] Usuario: ${username}`);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formDataToSend
    });

    if (!response.ok) {
      console.error(`❌ [Auth-Proxy-Fixed] Error en la respuesta: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({
          error: "Error en la autenticación",
          status: response.status,
          statusText: response.statusText
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const responseData = await response.json();
    console.log(`✅ [Auth-Proxy-Fixed] Login exitoso para usuario: ${username}`);

    return new Response(
      JSON.stringify(responseData),
      {
        status: response.status,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error(`❌ [Auth-Proxy-Fixed] Error en el proxy de autenticación:`, error);
    return new Response(
      JSON.stringify({
        error: "Error en la autenticación",
        message: error instanceof Error ? error.message : "Error desconocido"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
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
