export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import { c as createAstro, a as createComponent, r as renderTemplate, d as renderComponent, m as maybeRenderHead } from '../chunks/astro_L5sjM5tw.mjs';
import '../chunks/pages/index_C_EgCD5D.astro.mjs';
import 'html-escaper';

/* Se importan componentes para usar posteriormente */

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro = $$result.createAstro($$Astro, $$props, $$slots);
  Astro.self = $$Login;

  return renderTemplate`${renderComponent($$result, "LoginLayout", "LoginLayout", { "title": "Login - Masclet Imperi" }, { "default": () => renderTemplate`${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex flex-col items-center">
          <!-- Logo grande -->
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

        <div id="loginStatus" class="mt-4 text-sm hidden"></div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('loginForm');
      
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulario de login enviado');

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
          console.log('Iniciando llamada de autenticación a /api/auth-proxy');
          const response = await fetch('/api/auth-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
          });

          if (!response.ok) {
            console.error('Error en la respuesta del servidor:', response.status);
            const errorModal = document.getElementById('passwordErrorModal');
            if (errorModal) errorModal.classList.remove('hidden');
            return;
          }

          const data = await response.json();
          console.log('Respuesta exitosa del servidor');
          
          if (data.access_token) {
            const token = data.access_token;
            console.log('Token obtenido correctamente');
            
            // Guardar el token y redirigir al dashboard
            localStorage.setItem('token', token);

            // Guardar info del usuario si está disponible
            if (data.user) {
              const userData = data.user;

              // SOLUCIÓN MEJORADA: Corregir el rol para Ramon
              if (userData.username && userData.username.toLowerCase() === 'ramon') {
                console.log('🔴 Usuario Ramon detectado, FORZANDO rol Ramon');
                userData.role = 'Ramon';

                // También guardar el rol por separado para mayor seguridad
                localStorage.setItem('userRole', 'Ramon');
                console.log('🔴 Rol Ramon guardado separadamente para mayor seguridad');

                // Añadir un indicador especial para verificaciones futuras
                localStorage.setItem('ramonFix', 'true');
              } else if (userData.role === 'gerente') {
                console.log('Rol gerente detectado, convirtiendo a Ramon');
                userData.role = 'Ramon';
                localStorage.setItem('userRole', 'Ramon');
              }

              // Guardar el usuario actualizado
              localStorage.setItem('user', JSON.stringify(userData));

              // También guardar el rol por separado para mayor seguridad
              if (userData.role) {
                localStorage.setItem('userRole', userData.role);
              }
            }

            // Redireccionar al dashboard principal
            console.log('Redirigiendo a la página principal (dashboard)');
            window.location.href = '/';
          } else {
            console.error('Error de autenticación: No se encontró token en la respuesta:', data);
            const errorModal = document.getElementById('passwordErrorModal');
            if (errorModal) errorModal.classList.remove('hidden');
          }
        } catch (error) {
          console.error('Error al iniciar sesión:', error);
          const errorModal = document.getElementById('passwordErrorModal');
          if (errorModal) errorModal.classList.remove('hidden');
        }
      });
    });
  </script>` })}`;
});

export { $$Login as default, $$Login as file };
