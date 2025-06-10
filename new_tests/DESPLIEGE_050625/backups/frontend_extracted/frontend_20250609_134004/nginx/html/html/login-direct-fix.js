// Script de corrección directa para el login
console.log("🔐 Script de corrección de login cargado");

// Función para interceptar y corregir el login
function fixLogin() {
  console.log("📋 Preparando corrección de login...");
  
  // Interceptar todos los formularios de login
  document.addEventListener('submit', async function(e) {
    // Verificar si es un formulario de login
    const form = e.target;
    const usernameField = form.querySelector('[name="username"], [id="username"], [name="email"], [id="email"]');
    const passwordField = form.querySelector('[name="password"], [id="password"]');
    
    if (usernameField && passwordField) {
      e.preventDefault();
      console.log("🔑 Interceptando envío de formulario de login");
      
      const username = usernameField.value;
      const password = passwordField.value;
      
      console.log(`👤 Intentando login con usuario: ${username}`);
      
      try {
        // 1. Crear datos en formato correcto (x-www-form-urlencoded)
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        // 2. Realizar petición utilizando el formato correcto
        console.log("📤 Enviando petición de login en formato form-urlencoded...");
        let response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
        
        console.log(`📥 Respuesta recibida, status: ${response.status}`);
        
        // Si falla, intentar formato JSON como respaldo
        if (!response.ok) {
          console.log("⚠️ Primer intento fallido, probando formato JSON...");
          response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              password: password
            })
          });
          console.log(`📥 Segunda respuesta recibida, status: ${response.status}`);
        }
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log("✅ Login exitoso:", data);
            
            if (data.access_token) {
              console.log("🔐 Token recibido correctamente");
              localStorage.setItem('token', data.access_token);
              
              // Guardar info de usuario
              if (data.user) {
                console.log("👤 Información de usuario recibida");
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Guardar rol por separado para acceso más fácil
                if (data.user.role) {
                  localStorage.setItem('userRole', data.user.role);
                  
                  // Ajuste específico para usuario Ramon o admin con rol gerente
                  if (data.user.username.toLowerCase() === 'ramon' || 
                      (data.user.username.toLowerCase() === 'admin' && data.user.role === 'gerente')) {
                    console.log("⚙️ Aplicando ajuste especial para usuario privilegiado");
                    localStorage.setItem('userRole', 'Ramon');
                  }
                }
              }
              
              // Redirigir al dashboard principal
              console.log("🔄 Login exitoso, redirigiendo...");
              window.location.href = '/';
            } else {
              console.error("❌ No se encontró token en la respuesta");
              alert("Error: No se recibió token de autenticación");
            }
          } catch (jsonError) {
            console.error("❌ Error al procesar respuesta JSON:", jsonError);
            
            // Si no es JSON pero la petición fue exitosa, intentar redirigir
            if (response.status >= 200 && response.status < 300) {
              console.log("⚠️ Respuesta exitosa pero no es JSON, redirigiendo...");
              window.location.href = '/';
            } else {
              alert("Error al procesar la respuesta del servidor");
            }
          }
        } else {
          console.error("❌ Error en la respuesta HTTP:", response.status);
          
          // Intentar leer mensaje de error
          try {
            const errorData = await response.json();
            console.error("❌ Detalles del error:", errorData);
            alert(`Error de autenticación: ${errorData.detail || errorData.message || 'Credenciales incorrectas'}`);
          } catch (e) {
            console.error("❌ No se pudo leer el error:", e);
            alert("Error de autenticación: Credenciales incorrectas");
          }
        }
      } catch (error) {
        console.error("❌ Error en proceso de login:", error);
        alert("Error al conectar con el servidor. Por favor, inténtalo de nuevo.");
      }
    }
  }, { capture: true });

  // También corregimos el logout para evitar que se quede colgado
  document.addEventListener('click', function(e) {
    // Buscar enlaces o botones de logout
    const target = e.target.closest('a, button');
    if (target && (
        target.textContent.toLowerCase().includes('logout') || 
        target.textContent.toLowerCase().includes('cerrar sesión') ||
        target.textContent.toLowerCase().includes('salir') ||
        target.href && target.href.includes('logout')
    )) {
      console.log("🚪 Interceptando click en logout");
      e.preventDefault();
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Redirigir a login
      console.log("🔄 Redirigiendo a login después de logout");
      window.location.href = '/login';
    }
  });
  
  console.log("✅ Corrección de login aplicada correctamente");
}

// Ejecutar cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixLogin);
} else {
  // Si ya está cargado, ejecutar inmediatamente
  fixLogin();
}
