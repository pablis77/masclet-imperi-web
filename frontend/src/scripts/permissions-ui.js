/**
 * Script simple para gestionar permisos en la UI
 */

// Función para ejecutar una sola vez cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
  // Control para ejecutar solo una vez
  if (window.permissionsInitialized) return;
  window.permissionsInitialized = true;
  
  try {
    // Obtener token y rol del usuario
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role || 'guest';
    console.log(`Rol detectado: ${userRole}`);
    
    // Restricciones para Editor
    if (userRole.toLowerCase() === 'editor') {
      // Verificar si estamos en una página restringida
      const rutasRestringidas = ['/imports', '/backup', '/users'];
      const currentPath = window.location.pathname;
      
      if (rutasRestringidas.some(r => currentPath.includes(r))) {
        window.location.href = '/';
        return;
      }
      
      // Deshabilitar todos los enlaces a páginas restringidas
      document.querySelectorAll('a[href*="/imports"], a[href*="/backup"], a[href*="/users"]').forEach(link => {
        link.style.opacity = '0.5';
        link.style.pointerEvents = 'none';
        link.style.cursor = 'not-allowed';
        link.onclick = function(e) {
          e.preventDefault();
          return false;
        };
      });
    }
    
    // Restricciones para Ramon
    if (userRole === 'Ramon') {
      // Deshabilitar botón de selección de backup
      const backupBtn = document.getElementById('select-backup-btn');
      if (backupBtn) {
        backupBtn.disabled = true;
        backupBtn.style.opacity = '0.5';
        backupBtn.style.pointerEvents = 'none';
        backupBtn.style.cursor = 'not-allowed';
      }
    }
  } catch (e) {
    console.error('Error al procesar permisos:', e);
  }
});

// Inicialización de variables globales
window.permissionsInitialized = false;
