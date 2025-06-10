import { c as createComponent, b as renderTemplate, r as renderComponent, u as unescapeHTML, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';

const $$Astro = createComponent(async ($$result, $$props, $$slots) => {
  const Astro = $$result.createAstro();
  Astro.self = $$Astro;

  // HTML estático para la página de login con estilos incrustados
  const html = renderTemplate`<html lang="es" class="light">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Masclet Imperi - Sistema de Gestión Ganadera">
    <link rel="icon" type="image/png" href="/favicon.png" />
    <title>Masclet Imperi - Login</title>
    <style>
      /* Estilos globales */
      :root {
        --color-primary: #3949ab;
        --color-primary-dark: #283593;
        --color-primary-light: #5c6bc0;
        --color-accent: #ff9800;
        --color-text: #333;
        --color-text-light: #666;
        --color-background: #f9f9f9;
        --color-background-card: #fff;
        --color-error: #e53935;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: var(--color-background);
        color: var(--color-text);
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }
      
      /* Contenedor principal */
      .container {
        width: 100%;
        max-width: 1200px;
        padding: 0 1rem;
        margin: 0 auto;
      }
      
      /* Layout de página */
      .page-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      
      /* Tarjeta de login */
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 2rem;
      }
      
      .login-card {
        background-color: var(--color-background-card);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        width: 100%;
        max-width: 400px;
        text-align: center;
      }
      
      /* Logo */
      .logo-container {
        margin-bottom: 2rem;
      }
      
      .logo {
        max-width: 180px;
        height: auto;
      }
      
      /* Formulario */
      .form-group {
        margin-bottom: 1.5rem;
        text-align: left;
      }
      
      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--color-text);
      }
      
      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.2s;
      }
      
      .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(57, 73, 171, 0.1);
      }
      
      /* Botones */
      .btn {
        display: inline-block;
        background-color: var(--color-primary);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .btn:hover {
        background-color: var(--color-primary-dark);
      }
      
      .btn-block {
        display: block;
        width: 100%;
      }
      
      /* Modal de error */
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
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        width: 90%;
        max-width: 500px;
        padding: 0;
        overflow: hidden;
      }
      
      .modal-header {
        background-color: var(--color-primary);
        color: white;
        padding: 1rem;
        text-align: center;
      }
      
      .modal-title {
        margin: 0;
        font-size: 1.5rem;
      }
      
      .modal-body {
        padding: 1.5rem;
        text-align: center;
      }
      
      .modal-text {
        margin-bottom: 1.5rem;
        font-size: 1.1rem;
        color: var(--color-text);
      }
      
      .modal-image {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
      }
      
      .modal-footer {
        padding: 1rem;
        text-align: center;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="page-layout">
      <div class="login-container">
        <div class="login-card">
          <div class="logo-container">
            <img src="/images/logo_masclet.png" alt="Masclet Imperi Logo" class="logo">
          </div>
          <h1>Masclet Imperi</h1>
          <p>Sistema de Gestión Ganadera</p>
          
          <form id="loginForm">
            <div class="form-group">
              <label for="username" class="form-label">Usuario</label>
              <input type="text" id="username" name="username" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Contraseña</label>
              <input type="password" id="password" name="password" class="form-input" required>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-block">Iniciar Sesión</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de error de contraseña con imagen del perro -->
    <div id="passwordErrorModal" class="modal-backdrop" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Error de Autenticación</h2>
        </div>
        <div class="modal-body">
          <p class="modal-text">¡Contraseña incorrecta! Por favor, inténtalo de nuevo.</p>
          <div class="modal-image-container">
            <img src="/images/no_password.png" alt="Perro de Ramon" class="modal-image">
          </div>
        </div>
        <div class="modal-footer">
          <button id="closeModal" class="btn">Entendido</button>
        </div>
      </div>
    </div>
    
    <script>
      // Script optimizado para login (versión Docker, 10-06-2025)
      console.log('🚀 Página de login cargada - v2 (optimizada Docker)');
      
      document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');
        const passwordErrorModal = document.getElementById('passwordErrorModal');
        const closeModalButton = document.getElementById('closeModal');
        
        // Cerrar modal
        if (closeModalButton) {
          closeModalButton.addEventListener('click', function() {
            passwordErrorModal.style.display = 'none';
          });
        }
        
        // Gestionar envío del formulario
        if (loginForm) {
          loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('📝 Formulario de login enviado');
            
            try {
              console.log('🔑 Iniciando autenticación a /api/auth-proxy con ' + username);
              
              // Preparar datos en formato URL-encoded (compatible con OAuth2)
              const formData = new URLSearchParams();
              formData.append('username', username);
              formData.append('password', password);
              
              // Realizar la petición al proxy local
              const response = await fetch('/api/auth-proxy', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
              });
              
              console.log('📡 Respuesta recibida, status:', response.status);
              
              // Manejar respuesta
              if (!response.ok) {
                console.log('❌ Error en la respuesta:', response.status);
                
                if (response.status === 401) {
                  // Mostrar modal de error para credenciales incorrectas
                  passwordErrorModal.style.display = 'flex';
                } else {
                  // Otro tipo de error
                  alert('Error de conexión al servidor: ' + response.status);
                }
                return;
              }
              
              // Procesar respuesta exitosa
              const data = await response.json();
              console.log('✅ Login exitoso');
              
              // Si es Ramon, manejo especial
              if (username.toLowerCase() === 'ramon' && data && data.access_token) {
                localStorage.setItem('isRamon', 'true');
              } else {
                localStorage.removeItem('isRamon');
              }
              
              // Guardar token
              if (data && data.access_token) {
                localStorage.setItem('token', data.access_token);
                
                // Redirección a dashboard
                window.location.href = '/dashboard';
              }
            } catch (error) {
              console.error('❌ Error al procesar login:', error);
              alert('Error de conexión: ' + error.message);
            }
          });
        }
      });
    </script>
  </body>
</html>`;

  // Eliminar cualquier renderizado JSX que pueda causar problemas de hidratación
  return renderTemplate`${html}`;
});

const _page = Object.freeze(Object.defineProperty({
  __proto__: null,
  default: $$Astro
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;
export { page };
