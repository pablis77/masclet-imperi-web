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
  // Importar el servicio de API CORRECTO con la URL bien formada
  import { a as api } from '../chunks/api_CScnKk7n.mjs';

  // Definimos una variable global para el estado del modal
  window.showPasswordErrorModal = function() {
    // Acceder al componente React directamente mediante eventos personalizados
    document.dispatchEvent(new CustomEvent('show-password-error'));
  };

  // Función para manejar el inicio de sesión
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Crear un script que maneje la interacción con el componente React
    const script = document.createElement('script');
    script.textContent = `
      // Esta función se ejecutará cuando el componente React esté listo
      document.addEventListener('astro:page-load', () => {
        // Escuchar el evento personalizado para mostrar el modal
        document.addEventListener('show-password-error', () => {
          // Buscar el elemento modal por su ID
          const modal = document.getElementById('passwordErrorModal');
          if (modal) {
            // Enviar mensaje al componente React para cambiar su estado
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
      console.log('[LOGIN] Intentando login con servicio API (CScnKk7n) que tiene URLs correctas');

      try {
        // Usar el endpoint /api/auth-proxy para el login en Docker
        console.log('[LOGIN] Usando el proxy de auth para login en producción');
        const response = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          console.error('[LOGIN] Error en la respuesta del proxy de auth:', await response.text());
          window.showPasswordErrorModal();
          return;
        }

        const data = await response.json();
        console.log('[LOGIN] Respuesta del proxy de auth:', data);

        // Verificar la estructura de la respuesta para obtener el token
        const token = data.access_token;

        if (token) {
          console.log('[LOGIN] Login exitoso, token recibido');
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
          console.log('[LOGIN] Redirigiendo a la página principal (dashboard)');
          window.location.href = '/';
          return; // Importante: salir de la función para evitar ejecutar código después de la redirección
        } else {
          console.error('[LOGIN] Error de autenticación: No se encontró token en la respuesta:', data);
          // Mostrar el modal con el perro de Ramon
          window.showPasswordErrorModal();
        }
      } catch (error) {
        console.error('[LOGIN] Error al iniciar sesión:', error);
        // Mostrar el modal con el perro de Ramon
        window.showPasswordErrorModal();
      }
    });
  });
</script>
