<!DOCTYPE html>
<html>
<head>
  <title>Login - Masclet Imperi</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
    }
    .container {
      display: flex;
      min-height: 100vh;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    .login-box {
      background-color: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
    }
    .logo {
      max-height: 100px;
      width: auto;
    }
    h1 {
      text-align: center;
      color: #111827;
      font-size: 1.5rem;
      margin: 1rem 0 0.5rem;
    }
    .subtitle {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }
    button {
      display: block;
      width: 100%;
      background-color: #4f46e5;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover {
      background-color: #4338ca;
    }
    #loginStatus {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #ef4444;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="login-box">
      <div class="logo-container">
        <img src="/img/masclet-logo-large.png" alt="Masclet Imperi Logo" class="logo">
        <h1>Acceso al sistema</h1>
        <p class="subtitle">Masclet Imperi - Sistema de Gestión Ganadera</p>
      </div>
      
      <form id="loginForm">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input id="username" name="username" type="text" required value="admin">
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input id="password" name="password" type="password" required value="admin123">
        </div>
        
        <button type="submit">Iniciar sesión</button>
      </form>
      
      <div id="loginStatus">Error al iniciar sesión</div>
    </div>
  </div>

  <script>
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      console.log('Intentando login con:', username);
      
      try {
        const response = await fetch('/api/auth-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
          console.error('Error en el login:', response.status);
          document.getElementById('loginStatus').style.display = 'block';
          return;
        }
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
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
        } else {
          document.getElementById('loginStatus').style.display = 'block';
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        document.getElementById('loginStatus').style.display = 'block';
      }
    });
  </script>
</body>
</html>
