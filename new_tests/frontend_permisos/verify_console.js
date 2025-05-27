// Script para verificar token en la consola
// Copia y pega esto en la consola del navegador

// Verificar token
const token = localStorage.getItem('token');
console.log('Token:', token ? token.substring(0, 20) + '...' : 'No hay token');

if (token) {
  // Decodificar token (parte payload - 2ª parte)
  try {
    const tokenParts = token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('Payload del token:', payload);
    
    // Verificar rol
    if (payload.role) {
      console.log('Rol en el token:', payload.role, `(tipo: ${typeof payload.role})`);
    }
  } catch (err) {
    console.error('Error decodificando token:', err);
  }
}

// Verificar usuario almacenado
const user = localStorage.getItem('user');
console.log('Usuario almacenado:', user ? JSON.parse(user) : 'No hay usuario');

// Limpiar completamente el localStorage y recargar
console.log('\nSi quieres resetear todo, ejecuta:');
console.log('localStorage.clear(); window.location.href = "/login";');
