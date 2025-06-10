import { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
export { renderers };

// Definir componente de login ultra simplificado
const $$Login = async function() {
  return {
    html: `<html lang="es" class="light">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Masclet Imperi - Sistema de Gestión Ganadera">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <title>Login | Masclet Imperi</title>
    <style>
      body { min-height: 100vh; display: flex; flex-direction: column; background-color: rgb(249 250 251); }
      .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
      .login-box { max-width: 24rem; width: 100%; }
      .header { display: flex; flex-direction: column; align-items: center; }
      .logo { width: 12rem; height: auto; margin-bottom: 1.5rem; }
      .title { margin-top: 0.5rem; text-align: center; font-size: 1.875rem; font-weight: 800; color: #111827; }
      .subtitle { margin-top: 0.5rem; text-align: center; font-size: 0.875rem; color: #4B5563; }
      .form-container { margin-top: 2rem; background-color: white; padding: 2rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0.5rem; }
      .form-group { margin-bottom: 1.5rem; }
      label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
      input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 0.875rem; }
      input:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
      button { width: 100%; display: flex; justify-content: center; padding: 0.5rem 1rem; border: 1px solid transparent; border-radius: 0.375rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 0.875rem; font-weight: 500; color: white; background-color: #6366F1; cursor: pointer; }
      button:hover { background-color: #4F46E5; }
      .divider { margin-top: 1.5rem; position: relative; }
      .divider-line { position: absolute; inset: 0; display: flex; align-items: center; }
      .divider-line-inner { width: 100%; border-top: 1px solid #E5E7EB; }
      .divider-text { position: relative; display: flex; justify-content: center; font-size: 0.875rem; }
      .divider-text-inner { padding: 0 0.5rem; background-color: white; color: #6B7280; }
      .status { margin-top: 1rem; font-size: 0.875rem; color: #EF4444; display: none; }
    </style>
  </head>
  <body>
    <div class="login-container">
      <div class="login-box">
        <div class="header">
          <img src="/images/logo_masclet.jpg" alt="Logo Masclet Imperi" class="logo">
          <h2 class="title">Iniciar sesión</h2>
          <p class="subtitle">Accede a la plataforma de gestión</p>
        </div>
        <div class="form-container">
          <form id="loginForm">
            <div class="form-group">
              <label for="username">Usuario</label>
              <input id="username" name="username" type="text" required value="admin">
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input id="password" name="password" type="password" required value="admin123">
            </div>
            <div class="form-group">
              <button type="submit">Iniciar sesión</button>
            </div>
          </form>
          
          <div id="loginStatus" class="status"></div>
          
          <div class="divider">
            <div class="divider-line">
              <div class="divider-line-inner"></div>
            </div>
            <div class="divider-text">
              <span class="divider-text-inner">Masclet Imperi</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      document.addEventListener("DOMContentLoaded", function() {
        console.log("📱 Página de login ultra simple cargada");
        const loginForm = document.getElementById("loginForm");
        const loginStatus = document.getElementById("loginStatus");
        
        if (!loginForm || !loginStatus) {
          console.error("❌ No se encontró el formulario o el elemento de estado");
          return;
        }
        
        loginForm.addEventListener("submit", async function(e) {
          e.preventDefault();
          console.log("📝 Formulario de login enviado");
          
          const username = document.getElementById("username").value;
          const password = document.getElementById("password").value;
          
          if (!username || !password) {
            console.error("🚫 Username o password vacíos");
            loginStatus.textContent = "Por favor, complete todos los campos";
            loginStatus.style.display = "block";
            return;
          }
          
          try {
            console.log("🔑 Iniciando autenticación (version FORM) a /api/auth-proxy con: " + username);
            loginStatus.style.display = "none";
            
            // Crear los datos del formulario como espera el backend
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);
            formData.append("grant_type", "password");
            
            console.log("📤 Enviando datos de formulario: " + formData.toString());
            
            const response = await fetch("/api/auth-proxy", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: formData
            });
            
            console.log("📡 Respuesta recibida, código: " + response.status);
            
            if (response.status === 200) {
              console.log("✅ Login exitoso");
              const data = await response.json();
              
              if (data.access_token) {
                console.log("🎫 Token recibido: " + data.access_token.substring(0, 10) + "...");
                localStorage.setItem("token", data.access_token);
                
                // Manejar datos de usuario
                if (data.user) {
                  const userData = data.user;
                  
                  // Caso especial para Ramon
                  if (userData.username && userData.username.toLowerCase() === "ramon") {
                    console.log("👑 Usuario Ramon detectado, asignando rol especial");
                    userData.role = "Ramon";
                    localStorage.setItem("userRole", "Ramon");
                    localStorage.setItem("ramonFix", "true");
                  } else if (userData.role === "gerente") {
                    console.log("👨‍💼 Usuario gerente detectado, convirtiendo a Ramon");
                    userData.role = "Ramon";
                    localStorage.setItem("userRole", "Ramon");
                  }
                  
                  // Guardar usuario
                  localStorage.setItem("user", JSON.stringify(userData));
                  if (userData.role) {
                    localStorage.setItem("userRole", userData.role);
                  }
                }
                
                // Redirigir al dashboard
                console.log("🚀 Redireccionando al dashboard...");
                window.location.href = "/";
              } else {
                console.error("❌ No se encontró token en la respuesta");
                loginStatus.textContent = "Error en la respuesta del servidor";
                loginStatus.style.display = "block";
              }
            } else if (response.status === 400 || response.status === 401) {
              console.error("🔒 Credenciales incorrectas");
              loginStatus.textContent = "Usuario o contraseña incorrectos";
              loginStatus.style.display = "block";
            } else {
              console.error("⚠️ Error desconocido: " + response.status);
              loginStatus.textContent = "Error de conexión. Inténtelo de nuevo";
              loginStatus.style.display = "block";
            }
          } catch (error) {
            console.error("💥 Error en el proceso de login:", error);
            loginStatus.textContent = "Error de conexión al servidor";
            loginStatus.style.display = "block";
          }
        });
      });
    </script>
  </body>
</html>`,
    head: ''
  };
};

// Configuración para el sistema de enrutamiento de Astro
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
