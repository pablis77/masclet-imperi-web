import { c as createComponent, b as renderTemplate, r as renderComponent, u as unescapeHTML, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;

const $$Login = createComponent(($$result, $$props, $$slots) => {
  const html = renderTemplate(_a || (_a = __template(['<html lang="es" class="light">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta name="description" content="Masclet Imperi - Sistema de Gestión Ganadera">\n    <title>Masclet Imperi - Login</title>\n    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css">\n    <style>\n      body {\n        background-color: #f8f9fa;\n        font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;\n      }\n      .login-container {\n        max-width: 400px;\n        margin: 0 auto;\n        padding: 20px;\n        background-color: white;\n        border-radius: 8px;\n        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n        margin-top: 100px;\n      }\n      .logo-container {\n        text-align: center;\n        margin-bottom: 20px;\n      }\n      .logo-container img {\n        max-width: 150px;\n      }\n      h1 {\n        text-align: center;\n        color: #495057;\n        margin-bottom: 20px;\n        font-weight: 500;\n        font-size: 1.75rem;\n      }\n      .form-control {\n        border-radius: 4px;\n        border: 1px solid #ced4da;\n        padding: 10px 15px;\n      }\n      .login-button {\n        background-color: #87bc45;\n        border-color: #87bc45;\n        width: 100%;\n        padding: 10px;\n        font-weight: 500;\n      }\n      .login-button:hover {\n        background-color: #76a33e;\n        border-color: #76a33e;\n      }\n      .text-muted {\n        font-size: 0.9rem;\n        text-align: center;\n      }\n      /* Modal styles */\n      .modal-backdrop {\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background-color: rgba(0, 0, 0, 0.5);\n        display: none;\n        z-index: 1000;\n        justify-content: center;\n        align-items: center;\n      }\n      .modal-container {\n        background-color: white;\n        border-radius: 8px;\n        width: 90%;\n        max-width: 400px;\n        padding: 20px;\n        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);\n      }\n      .modal-header {\n        border-bottom: 1px solid #dee2e6;\n        margin-bottom: 15px;\n        padding-bottom: 10px;\n      }\n      .modal-header h3 {\n        margin: 0;\n        color: #dc3545;\n        font-size: 1.25rem;\n      }\n      .modal-body {\n        text-align: center;\n        margin-bottom: 20px;\n      }\n      .modal-body img {\n        max-width: 200px;\n        height: auto;\n        margin: 15px 0;\n        border-radius: 4px;\n      }\n      .modal-footer button {\n        background-color: #0d6efd;\n        color: white;\n        border: none;\n        border-radius: 4px;\n        padding: 8px 16px;\n        cursor: pointer;\n        float: right;\n      }\n    </style>\n  </head>\n  <body>\n    <div class="container">\n      <div class="login-container">\n        <div class="logo-container">\n          <img src="/images/logo-masclet.png" alt="Masclet Imperi Logo">\n        </div>\n        \n        <h1>Iniciar sesión</h1>\n        \n        <form id="loginForm">\n          <div class="mb-3">\n            <label for="username" class="form-label">Usuario</label>\n            <input type="text" class="form-control" id="username" required>\n          </div>\n          \n          <div class="mb-3">\n            <label for="password" class="form-label">Contraseña</label>\n            <input type="password" class="form-control" id="password" required>\n          </div>\n          \n          <div id="loginError" class="alert alert-danger d-none">\n            Usuario o contraseña incorrectos\n          </div>\n          \n          <button type="submit" class="btn btn-success login-button">Iniciar Sesión</button>\n        </form>\n        \n        <p class="text-muted mt-3">Accede a la plataforma de gestión</p>\n      </div>\n    </div>\n    \n    <!-- Modal de error de contraseña con imagen del perro -->\n    <div id="passwordErrorModal" class="modal-backdrop">\n      <div class="modal-container">\n        <div class="modal-header">\n          <h3>¡Contraseña incorrecta!</h3>\n        </div>\n        <div class="modal-body">\n          <p>El usuario o la contraseña son incorrectos. Inténtalo de nuevo.</p>\n          <img src="/images/no_password.png" alt="Error de contraseña">\n        </div>\n        <div class="modal-footer">\n          <button id="closeModal">Entendido</button>\n        </div>\n      </div>\n    </div>\n    \n    ', '</body></html>'])), 

  // IMPORTANTE: Este es el renderizado estático del componente, sin objetos Promise ni problemas de serialización
  return renderTemplate`${html}

<script>
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Página de login cargada - v2");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const passwordErrorModal = document.getElementById("passwordErrorModal");
    const closeModalBtn = document.getElementById("closeModal");

    // Manejador para cerrar el modal
    closeModalBtn.addEventListener("click", () => {
      passwordErrorModal.style.display = "none";
    });

    // Función para mostrar el modal de error
    const showErrorModal = () => {
      passwordErrorModal.style.display = "flex";
    };

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("📝 Formulario de login enviado");

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        console.log("🔑 Iniciando autenticación a /api/auth-proxy con " + username);
        loginError.classList.add("d-none");

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
          showErrorModal(); // Mostrar modal con imagen del perro
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
          showErrorModal(); // Mostrar modal con imagen del perro
        }
      } catch (error) {
        console.error("💥 Error al iniciar sesión:", error);
        showErrorModal(); // Mostrar modal con imagen del perro
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
