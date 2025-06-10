---
---

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <div class="flex flex-col items-center">
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
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      console.log('Intentando login con:', username);

      try {
        // Usar fetch para el login
        const response = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          console.error('Error en el login:', response.status);
          return;
        }

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        // Guardar token y redirigir
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          
          // Manejo especial para usuario Ramon
          if (data.user && data.user.username && 
              data.user.username.toLowerCase() === 'ramon') {
            localStorage.setItem('userRole', 'Ramon');
            localStorage.setItem('ramonFix', 'true');
          }
          
          // Redirigir
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
      }
    });
  });
</script>
