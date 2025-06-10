export { e as renderers } from "../chunks/vendor_Cou4nW0F.mjs";

// Contenido HTML estático de la página de login
const html = `<html>
<head>
  <title>Login - Masclet Imperi</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/css/tailwind.css">
</head>
<body class="bg-gray-50">
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex flex-col items-center">
          <img src="/img/masclet-logo-large.png" alt="Masclet Imperi Logo" class="h-32 w-auto">
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acceso al sistema
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Masclet Imperi - Sistema de Gestión Ganadera
          </p>
        </div>
      </div>
      <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form id="loginForm" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <div class="mt-1">
              <input id="username" name="username" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin">
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div class="mt-1">
              <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin123">
            </div>
          </div>

          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Iniciar sesión
            </button>
          </div>
        </form>

        <div id="loginStatus" class="mt-4 text-sm text-red-600 hidden"></div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      console.log("Página de login cargada");
      const loginForm = document.getElementById("loginForm");
      const loginStatus = document.getElementById("loginStatus");
      
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Formulario de login enviado");

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
          console.log("Iniciando llamada de autenticación a /api/auth-proxy");
          loginStatus.classList.add("hidden");
          
          const response = await fetch("/api/auth-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
          });

          if (!response.ok) {
            console.error("Error en la respuesta del servidor:", response.status);
            loginStatus.textContent = "Credenciales incorrectas. Por favor, inténtelo de nuevo.";
            loginStatus.classList.remove("hidden");
            return;
          }

          const data = await response.json();
          console.log("Respuesta exitosa del servidor");
          
          if (data.access_token) {
            const token = data.access_token;
            console.log("Token obtenido correctamente");
            
            // Guardar el token y redirigir al dashboard
            localStorage.setItem("token", token);

            // Guardar info del usuario si está disponible
            if (data.user) {
              const userData = data.user;

              // SOLUCIÓN PARA RAMON
              if (userData.username && userData.username.toLowerCase() === "ramon") {
                console.log("🔴 Usuario Ramon detectado, FORZANDO rol Ramon");
                userData.role = "Ramon";
                localStorage.setItem("userRole", "Ramon");
                localStorage.setItem("ramonFix", "true");
              } else if (userData.role === "gerente") {
                console.log("Rol gerente detectado, convirtiendo a Ramon");
                userData.role = "Ramon";
                localStorage.setItem("userRole", "Ramon");
              }

              // Guardar el usuario actualizado
              localStorage.setItem("user", JSON.stringify(userData));
              if (userData.role) {
                localStorage.setItem("userRole", userData.role);
              }
            }

            // Redireccionar al dashboard principal
            console.log("Redirigiendo a la página principal");
            window.location.href = "/";
          } else {
            console.error("Error: No se encontró token en la respuesta");
            loginStatus.textContent = "Error en la autenticación. Inténtelo de nuevo.";
            loginStatus.classList.remove("hidden");
          }
        } catch (error) {
          console.error("Error al iniciar sesión:", error);
          loginStatus.textContent = "Error al conectar con el servidor. Inténtelo de nuevo.";
          loginStatus.classList.remove("hidden");
        }
      });
    });
  </script>
</body>
</html>`;

// Definir la función GET para la página
const get = async () => {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
};

// Estructura que sigue el formato de los módulos compilados de Astro
const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  get
}, Symbol.toStringTag, { value: "Module" }));

const page = () => _page;

export { page };
