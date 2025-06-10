import { c as createComponent, b as renderTemplate, r as renderComponent, u as unescapeHTML, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;

const $$Login = createComponent(($$result, $$props, $$slots) => {
  maybeRenderHead();
  
  return renderTemplate`<html lang="es" class="light">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Masclet Imperi - Sistema de Gestión Ganadera">
    <title>Masclet Imperi - Login</title>
    <link rel="icon" type="image/png" href="/favicon.png">
    <style>
      /* Estilos básicos para el login */
      body {
        margin: 0;
        padding: 0;
        background-color: #f8fafc;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 15px;
      }
      .login-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        width: 100%;
        max-width: 400px;
        padding: 2rem;
        margin: 1rem auto;
      }
      .logo-section {
        text-align: center;
        margin-bottom: 2rem;
      }
      .logo-section img {
        max-width: 200px;
        height: auto;
      }
      h1 {
        font-size: 1.8rem;
        color: #1e293b;
        margin-bottom: 1.5rem;
        text-align: center;
        font-weight: 600;
      }
      .form-group {
        margin-bottom: 1.5rem;
      }
      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: #4b5563;
      }
      input[type="text"],
      input[type="password"] {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 1rem;
        color: #1e293b;
        transition: border-color 0.15s ease-in-out;
      }
      input[type="text"]:focus,
      input[type="password"]:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: 0.375rem;
        font-size: 1rem;
        line-height: 1.5;
        transition: all 0.15s ease-in-out;
      }
      .btn-primary {
        background-color: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
      .btn-primary:hover {
        background-color: #2563eb;
        border-color: #2563eb;
      }
      .btn-block {
        display: block;
        width: 100%;
      }
      .text-danger {
        color: #ef4444;
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }
      .hidden {
        display: none;
      }
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .modal {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        padding: 1.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      .modal-header {
        margin-bottom: 1rem;
      }
      .modal-body {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
      }
      .w-64 {
        max-width: 256px;
      }
      .h-auto {
        height: auto;
      }
      .rounded-md {
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="login-card">
        <div class="logo-section">
          <img src="/images/logo.png" alt="Logo Masclet Imperi">
        </div>
        <h1>Acceso al Sistema</h1>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input type="text" id="username" name="username" required autocomplete="username">
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">
          </div>
          
          <div id="loginStatus" class="text-danger hidden">
            Usuario o contraseña incorrectos
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de error de contraseña con imagen del perro -->
    <div id="passwordErrorModal" class="modal-backdrop" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h3>¡Contraseña incorrecta!</h3>
        </div>
        <div class="modal-body">
          <p>El usuario o la contraseña son incorrectos. Inténtalo de nuevo.</p>
          <img src="/images/no_password.png" alt="Error de contraseña" class="w-64 h-auto rounded-md">
        </div>
        <div class="modal-footer">
          <button id="closeModal" class="btn btn-primary">Entendido</button>
        </div>
      </div>
    </div>
    
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        console.log("🚀 Página de login cargada - v3 (Docker 100% compatible)");
        const loginForm = document.getElementById("loginForm");
        const loginStatus = document.getElementById("loginStatus");
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
    </script>
  </body>
</html>`;
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
