// Script para debugear el proceso de login y roles
// Añadir este script temporalmente a la página de login o usarlo en la consola del navegador

function debugLogin() {
  // Verificar si hay localStorage
  console.log('===== INICIO DEPURACIÓN DE LOGIN =====');
  
  // Mostrar token JWT si existe
  const token = localStorage.getItem('token');
  console.log('Token JWT:', token ? token : 'No hay token');
  
  // Mostrar usuario almacenado
  const userJson = localStorage.getItem('user');
  console.log('Usuario JSON:', userJson);
  
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      console.log('Usuario parseado:', user);
      console.log('Nombre de usuario:', user.username);
      console.log('Rol guardado:', user.role);
    } catch (e) {
      console.error('Error al parsear usuario:', e);
    }
  }
  
  // Intentar decodificar el token
  if (token) {
    try {
      // Decodificación manual del token (JWT tiene 3 partes separadas por puntos)
      const parts = token.split('.');
      if (parts.length === 3) {
        // Decodificar la parte del payload (segunda parte)
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token decodificado manualmente:', payload);
        console.log('Sub en el token:', payload.sub);
        console.log('Role en el token:', payload.role);
        console.log('Username en el token:', payload.username);
      }
    } catch (e) {
      console.error('Error al decodificar token manualmente:', e);
    }
  }
  
  console.log('===== FIN DEPURACIÓN DE LOGIN =====');
}

// Ejecutar la función
debugLogin();

// Instrucciones:
// 1. Abrir la consola del navegador (F12)
// 2. Pegar este script completo y ejecutarlo
// 3. Verificar la información mostrada para detectar problemas de roles
