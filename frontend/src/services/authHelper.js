/**
 * Script auxiliar para autenticación en desarrollo
 * Guarda un token JWT directamente en localStorage
 */

// Credenciales fijas para desarrollo
const CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Función para iniciar sesión manualmente
async function iniciarSesionManual() {
  try {
    console.log('Intentando inicio de sesión manual con admin/admin123...');
    
    // La URL correcta depende de tu API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS)
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token || 'token-simulado-desarrollo-12345');
      console.log('¡Autenticación exitosa! Token guardado.');
      return true;
    } else {
      console.error('Error en autenticación:', await response.text());
      
      // En desarrollo, podemos crear un token simulado
      console.log('Creando token simulado para desarrollo...');
      localStorage.setItem('token', 'token-simulado-desarrollo-12345');
      console.log('Token simulado guardado. Recarga la página.');
      return true;
    }
  } catch (error) {
    console.error('Error al intentar autenticación:', error);
    
    // En desarrollo, podemos crear un token simulado
    console.log('Creando token simulado para desarrollo...');
    localStorage.setItem('token', 'token-simulado-desarrollo-12345');
    console.log('Token simulado guardado. Recarga la página.');
    return true;
  }
}

// Ejecutar si se carga directamente
if (typeof window !== 'undefined') {
  window.iniciarSesionManual = iniciarSesionManual;
  console.log('Script de autenticación cargado. Ejecuta iniciarSesionManual() en consola para generar un token.');
}

export { iniciarSesionManual };
