import { c as createComponent, b as renderTemplate, r as renderComponent, u as unescapeHTML, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;

// Componente de login compilado
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const html = renderTemplate(_a || (_a = __template(['<html class="astro-37FXCHFA">\n  <head>\n    <title>Login - Masclet Imperi</title>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <link rel="stylesheet" href="/css/tailwind.css">\n  </head>\n  <body class="bg-gray-50 astro-37FXCHFA">\n    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 astro-37FXCHFA">\n      <div class="max-w-md w-full space-y-8 astro-37FXCHFA">\n        <div class="astro-37FXCHFA">\n          <div class="flex flex-col items-center astro-37FXCHFA">\n            <img src="/img/masclet-logo-large.png" alt="Masclet Imperi Logo" class="h-32 w-auto astro-37FXCHFA">\n            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 astro-37FXCHFA">\n              Acceso al sistema\n            </h2>\n            <p class="mt-2 text-center text-sm text-gray-600 astro-37FXCHFA">\n              Masclet Imperi - Sistema de Gestión Ganadera\n            </p>\n          </div>\n        </div>\n        <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 astro-37FXCHFA">\n          <form id="loginForm" class="space-y-6 astro-37FXCHFA">\n            <div class="astro-37FXCHFA">\n              <label for="username" class="block text-sm font-medium text-gray-700 astro-37FXCHFA">\n                Usuario\n              </label>\n              <div class="mt-1 astro-37FXCHFA">\n                <input id="username" name="username" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm astro-37FXCHFA" value="admin">\n              </div>\n            </div>\n\n            <div class="astro-37FXCHFA">\n              <label for="password" class="block text-sm font-medium text-gray-700 astro-37FXCHFA">\n                Contraseña\n              </label>\n              <div class="mt-1 astro-37FXCHFA">\n                <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm astro-37FXCHFA" value="admin123">\n              </div>\n            </div>\n\n            <div class="astro-37FXCHFA">\n              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary astro-37FXCHFA">\n                Iniciar sesión\n              </button>\n            </div>\n          </form>\n\n          <div id="loginStatus" class="mt-4 text-sm text-red-600 hidden astro-37FXCHFA"></div>\n        </div>\n      </div>\n    </div>\n\n    ', '</body></html>'])), maybeRenderHead());

  return renderTemplate`${html}

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
</script>`;
});

const $$file = "/src/pages/login.astro";
const $$url = "/login";

// Estructura necesaria para que el renderizador encuentre el moduleId
const _page = Object.freeze(Object.defineProperty({
  __proto__: null,
  $$Login,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;
export { page };
