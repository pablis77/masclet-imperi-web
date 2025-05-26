/**
 * Script para actualizar la cookie de rol de usuario basado en localStorage
 * Se ejecuta en cada carga de página para mantener sincronizada la UI
 */

// Función para establecer una cookie con un valor
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

// Función para actualizar el rol del usuario en la cookie
function updateUserRoleFromLocalStorage() {
  try {
    // Obtener datos del usuario desde localStorage
    const userJson = localStorage.getItem('user');
    
    if (userJson) {
      const user = JSON.parse(userJson);
      
      // Si el usuario es admin, asegurarse de que tenga el rol correcto
      if (user.username === 'admin') {
        if (user.role !== 'administrador') {
          user.role = 'administrador';
          // Actualizar localStorage también
          localStorage.setItem('user', JSON.stringify(user));
        }
        setCookie('userRole', 'administrador');
      } else if (user.role) {
        // Para otros usuarios, usar el rol almacenado
        setCookie('userRole', user.role);
      }
      
      console.log('Cookie de rol actualizada:', user.role);
    } else {
      console.log('No se encontraron datos de usuario en localStorage');
    }
  } catch (error) {
    console.error('Error al actualizar la cookie de rol:', error);
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', updateUserRoleFromLocalStorage);

// También ejecutar cada vez que cambie el almacenamiento local
window.addEventListener('storage', (event) => {
  if (event.key === 'user') {
    updateUserRoleFromLocalStorage();
  }
});

// Ejecutar inmediatamente por si el DOM ya está cargado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  updateUserRoleFromLocalStorage();
}
