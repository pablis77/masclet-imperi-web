import { c as createComponent, b as renderTemplate, r as renderComponent, u as unescapeHTML, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;

const $$Login = createComponent(($$result, $$props, $$slots) => {
  const html = renderTemplate(_a || (_a = __template(['<html lang="es" class="light">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta name="description" content="Masclet Imperi - Sistema de Gestión Ganadera">\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n    <title>Login | Masclet Imperi</title>\n  </head>\n  <body class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100">\n    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">\n      <div class="max-w-md w-full space-y-8">\n        <div class="flex flex-col items-center">\n          <!-- Logo grande -->\n          <img src="/images/logo_masclet.jpg" alt="Logo Masclet Imperi" class="w-48 h-auto mb-6">\n          <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">\n            Iniciar sesión\n          </h2>\n          <p class="mt-2 text-center text-sm text-gray-600">\n            Accede a la plataforma de gestión\n          </p>\n        </div>\n        <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">\n          <form id="loginForm" class="space-y-6">\n            <div>\n              <label for="username" class="block text-sm font-medium text-gray-700">\n                Usuario\n              </label>\n              <div class="mt-1">\n                <input id="username" name="username" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin">\n              </div>\n            </div>\n\n            <div>\n              <label for="password" class="block text-sm font-medium text-gray-700">\n                Contraseña\n              </label>\n              <div class="mt-1">\n                <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin123">\n              </div>\n            </div>\n\n            <div>\n              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">\n                Iniciar sesión\n              </button>\n            </div>\n          </form>\n\n          <div id="loginStatus" class="mt-4 text-sm hidden"></div>\n\n          <div class="mt-6">\n            <div class="relative">\n              <div class="absolute inset-0 flex items-center">\n                <div class="w-full border-t border-gray-300"></div>\n              </div>\n              <div class="relative flex justify-center text-sm">\n                <span class="px-2 bg-white text-gray-500">\n                  Masclet Imperi\n                </span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    ', '</body></html>'])), maybeRenderHead());

  return renderTemplate`${html}

<script>
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Página de login cargada - v2");
    const loginForm = document.getElementById("loginForm");
    const loginStatus = document.getElementById("loginStatus");
    
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("📝 Formulario de login enviado");

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        console.log("🔑 Iniciando autenticación a /api/auth-proxy con " + username);
        loginStatus.classList.add("hidden");
        
        // Crear URLSearchParams para enviar como form-urlencoded
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        
        const response = await fetch("/api/auth-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData
        });

        console.log("📡 Respuesta recibida, status:", response.status);
        
        if (!response.ok) {
          console.error("❌ Error en la respuesta:", response.status);
          loginStatus.textContent = "Credenciales incorrectas. Por favor, inténtelo de nuevo.";
          loginStatus.classList.remove("hidden");
          loginStatus.style.color = "red";
          return;
        }

        const data = await response.json();
        console.log("✅ Respuesta exitosa del servidor");
        
        if (data.access_token) {
          const token = data.access_token;
          console.log("🔒 Token obtenido correctamente");
          
          // Guardar el token y redirigir al dashboard
          localStorage.setItem("token", token);
          console.log("💾 Token guardado en localStorage");

          // Guardar info del usuario si está disponible
          if (data.user) {
            const userData = data.user;
            console.log("👤 Datos de usuario recibidos:", userData);

            // SOLUCIÓN PARA RAMON
            if (userData.username && userData.username.toLowerCase() === "ramon") {
              console.log("🔴 Usuario Ramon detectado, FORZANDO rol Ramon");
              userData.role = "Ramon";
              localStorage.setItem("userRole", "Ramon");
              localStorage.setItem("ramonFix", "true");
              console.log("🛠️ Ajuste de rol para Ramon aplicado");
            } else if (userData.role === "gerente") {
              console.log("Rol gerente detectado, convirtiendo a Ramon");
              userData.role = "Ramon";
              localStorage.setItem("userRole", "Ramon");
            }

            // Guardar el usuario actualizado
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("💾 Datos de usuario guardados");
            
            if (userData.role) {
              localStorage.setItem("userRole", userData.role);
              console.log("👑 Rol guardado:", userData.role);
            }
          } else {
            console.log("⚠️ No se recibieron datos de usuario, solo token");
          }

          // Redireccionar al dashboard principal
          console.log("🔄 Redirigiendo a la página principal");
          window.location.href = "/";
        } else {
          console.error("❌ Error: No se encontró token en la respuesta");
          loginStatus.textContent = "Error en la autenticación. Inténtelo de nuevo.";
          loginStatus.classList.remove("hidden");
          loginStatus.style.color = "red";
        }
      } catch (error) {
        console.error("💥 Error al iniciar sesión:", error);
        loginStatus.textContent = "Error al conectar con el servidor. Inténtelo de nuevo.";
        loginStatus.classList.remove("hidden");
        loginStatus.style.color = "red";
      }
    });
  });
</script>`;
});

const $$file = "/src/pages/login.astro";
const $$url = "/login";

const _page = Object.freeze(Object.defineProperty({
  __proto__: null,
  $$Login,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;
export { page };
