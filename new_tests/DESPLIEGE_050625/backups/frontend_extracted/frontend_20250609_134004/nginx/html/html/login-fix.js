// Script para arreglar problemas de login
console.log("🔐 Script de arreglo de login inyectado");

// Función principal que se ejecutará cuando se detecte un intento de login
function fixLogin() {
  console.log("🔍 Interceptando intentos de login");
  
  // Buscar formularios de login
  document.querySelectorAll('form').forEach(form => {
    console.log(`📝 Encontrado formulario: ${form.id || 'sin ID'}`);
    
    // Si parece un formulario de login (tiene campos username/password)
    const hasUsername = form.querySelector('[name="username"], [id="username"], [name="email"], [id="email"]');
    const hasPassword = form.querySelector('[name="password"], [id="password"]');
    
    if (hasUsername && hasPassword) {
      console.log("✅ Detectado formulario de login, aplicando fix");
      
      // Reemplazar el manejador de eventos
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("🔑 Interceptando envío de formulario de login");
        
        // Obtener los valores
        const usernameField = form.querySelector('[name="username"], [id="username"], [name="email"], [id="email"]');
        const passwordField = form.querySelector('[name="password"], [id="password"]');
        
        const username = usernameField.value;
        const password = passwordField.value;
        
        console.log(`👤 Intentando login con usuario: ${username}`);
        
        try {
          // 1. Crear datos en el formato correcto
          const formData = new URLSearchParams();
          formData.append('username', username);
          formData.append('password', password);
          
          // 2. Realizar petición con el formato adecuado
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
          });
          
          console.log(`📥 Respuesta recibida, status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Login exitoso:", data);
            
            if (data.access_token) {
              console.log("🔐 Token recibido correctamente");
              
              // Guardar token
              localStorage.setItem('token', data.access_token);
              
              // Guardar info de usuario si está disponible
              if (data.user) {
                console.log("👤 Información de usuario recibida");
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.role) {
                  localStorage.setItem('userRole', data.user.role);
                }
                
                // Fix especial para usuario Ramon
                if (data.user.username && data.user.username.toLowerCase() === 'ramon') {
                  console.log("⚠️ Aplicando fix especial para usuario Ramon");
                  data.user.role = 'Ramon';
                  localStorage.setItem('userRole', 'Ramon');
                  localStorage.setItem('ramonFix', 'true');
                }
              }
              
              // Redirigir al dashboard
              window.location.href = '/';
            } else {
              console.error("❌ No se encontró token en la respuesta");
              alert("Error de autenticación: No se recibió token");
            }
          } else {
            console.error("❌ Error en la respuesta HTTP:", response.status);
            alert("Error de autenticación: Credenciales incorrectas");
          }
        } catch (error) {
          console.error("❌ Error en proceso de login:", error);
          alert("Error al conectar con el servidor");
        }
      }, { capture: true });
    }
  });
}

// Ejecutar la función cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixLogin);
} else {
  fixLogin();
}

// También ejecutar cuando cambie la URL (para SPAs)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(fixLogin, 500);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

console.log("✅ Script de arreglo de login instalado correctamente");
