export { e as renderers } from '../../chunks/vendor_Cou4nW0F.mjs';

const POST = async ({ request }) => {
  try {
    const backendUrl = "http://masclet-api:8000/api/v1/auth/login";
    const data = await request.json();
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("grant_type", "password");

    console.log("🔄 [Auth-Proxy3] Enviando petición de login a: " + backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });

    if (!response.ok) {
      console.error("❌ [Auth-Proxy3] Error en la respuesta: " + response.status);
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
    console.log("✅ [Auth-Proxy3] Login exitoso para usuario: " + data.username);

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
    console.error("❌ [Auth-Proxy3] Error en el proxy de autenticación:", error);
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
