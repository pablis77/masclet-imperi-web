export { e as renderers } from '../../chunks/vendor_Cou4nW0F.mjs';

const POST = async ({ request }) => {
  try {
    const backendUrl = "http://localhost:8000/api/v1/auth/login";
    const data = await request.json();
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });
    const responseData = await response.json();
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
    console.error("Error en el proxy de autenticación:", error);
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
