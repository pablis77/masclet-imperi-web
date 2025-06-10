---
import LoginLayout from '../layouts/LoginLayout.astro';
import PasswordErrorModal from '../components/modals/PasswordErrorModal';
---

<LoginLayout title="Login - Masclet Imperi">
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <PasswordErrorModal client:only />
        <div class="flex flex-col items-center">
          <!-- Logo grande -->
          <img src="/img/masclet-logo-large.png" alt="Masclet Imperi Logo" class="h-32 w-auto" />
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

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                Masclet Imperi
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</LoginLayout>

<script>
  // Evitamos usar importaciones complejas que podrían causar errores de sintaxis
  // En lugar de eso, usamos fetch directamente para el proxy de autenticación
  
  // Definimos una variable global para el estado del modal
  window.showPasswordErrorModal = function() {
    document.dispatchEvent(new CustomEvent('show-password-error'));
  };

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Crear un script para manejar interacciones con el componente React
    const script = document.createElement('script');
    script.textContent = `
      document.addEventListener('astro:page-load', () => {
        document.addEventListener('show-password-error', () => {
          const modal = document.getElementById('passwordErrorModal');
          if (modal) {
            const event = new CustomEvent('update-modal-state', {
              detail: { isOpen: true }
            });
            modal.dispatchEvent(event);
          }
        });
      });
    `;
    document.head.appendChild(script);

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      console.log('[LOGIN] Intentando login usando el proxy de auth directamente');

      try {
        // Usar el endpoint /api/auth-proxy para el login
        console.log('[LOGIN] Enviando credenciales al proxy de autenticación');
        const response = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          console.error('[LOGIN] Error en la respuesta del proxy:', response.status);
          window.showPasswordErrorModal();
          return;
        }

        const data = await response.json();
        console.log('[LOGIN] Respuesta recibida del servidor');

        // Verificar que tenemos un token
        const token = data.access_token;

        if (token) {
          console.log('[LOGIN] Login exitoso, token recibido');
          localStorage.setItem('token', token);

          // Guardar info del usuario si está disponible
          if (data.user) {
            const userData = data.user;

            // SOLUCIÓN MEJORADA: Corregir el rol para Ramon
            if (userData.username && userData.username.toLowerCase() === 'ramon') {
              console.log('[LOGIN] Usuario Ramon detectado, FORZANDO rol Ramon');
              userData.role = 'Ramon';
              localStorage.setItem('userRole', 'Ramon');
              localStorage.setItem('ramonFix', 'true');
            } else if (userData.role === 'gerente') {
              console.log('[LOGIN] Rol gerente detectado, convirtiendo a Ramon');
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
          console.log('[LOGIN] Redirigiendo a la página principal');
          window.location.href = '/';
          return;
        } else {
          console.error('[LOGIN] Error: No se encontró token en la respuesta');
          window.showPasswordErrorModal();
        }
      } catch (error) {
        console.error('[LOGIN] Error al iniciar sesión:', error);
        window.showPasswordErrorModal();
      }
    });
  });
</script>
