/**
 * Script para gestionar la visualización de elementos de UI según permisos
 * Este script oculta botones y añade mensajes informativos para funciones restringidas
 */

// Función principal para gestionar permisos en la UI
function setupPermissionsUI() {
  console.log("Inicializando gestión de permisos en UI...");
  
  // 1. Verificar el rol del usuario desde localStorage
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    // Obtener el rol del usuario
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;
    
    console.log(`Rol detectado: ${userRole}`);
    
    // 2. Aplicar restricciones específicas según la página actual
    const currentPath = window.location.pathname;
    
    // Página de importaciones
    if (currentPath.includes('/imports') && userRole === 'Ramon') {
      handleImportPageRestrictions();
    }
    
    // Página de backup/restore
    if (currentPath.includes('/backup') && userRole === 'Ramon') {
      handleBackupPageRestrictions();
    }
    
    // Restricciones para rol Usuario
    if (userRole.toLowerCase() === 'usuario') {
      console.log('Aplicando restricciones para Usuario');
      // El rol usuario no tiene acceso a estas páginas administrativas
      const rutasRestringidas = ['/imports', '/backup', '/users'];
      
      // Redirigir si está en una página restringida
      if (rutasRestringidas.some(r => currentPath.includes(r))) {
        window.location.href = '/';
        return;
      }
      
      // Deshabilitar enlaces a páginas restringidas
      document.querySelectorAll('a[href*="/imports"], a[href*="/backup"], a[href*="/users"]').forEach(link => {
        link.style.opacity = '0.5';
        link.style.pointerEvents = 'none';
        link.style.cursor = 'not-allowed';
        link.title = 'No tienes permisos para acceder a esta sección';
        link.onclick = function(e) {
          e.preventDefault();
          return false;
        };
      });
    }
    
  } catch (e) {
    console.error('Error al procesar permisos de UI:', e);
  }
}

// Gestionar restricciones en la página de importaciones
function handleImportPageRestrictions() {
  console.log("Aplicando restricciones a la página de importaciones...");
  
  // Ocultar botones de importación excepto los de descarga
  document.querySelectorAll('.import-btn:not(.download-btn)').forEach(btn => {
    btn.style.display = 'none';
  });
  
  // También podemos ocultar el formulario de carga si existe
  const uploadForm = document.querySelector('#import-form');
  if (uploadForm) {
    uploadForm.style.display = 'none';
  }
  
  // Añadir mensaje informativo
  const container = document.querySelector('.import-container');
  if (container) {
    const infoMsg = document.createElement('div');
    infoMsg.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
    infoMsg.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            Esta función de importación solo está disponible para administradores. Puedes ver el historial de importaciones pero no iniciar nuevas.
          </p>
        </div>
      </div>
    `;
    container.insertBefore(infoMsg, container.querySelector('h2').nextSibling);
  }
}

// Gestionar restricciones en la página de backup/restore
function handleBackupPageRestrictions() {
  console.log("Aplicando restricciones a la página de backup...");
  
  // Ocultar botones de restauración y eliminación de backups
  document.querySelectorAll('.restore-btn, .delete-btn').forEach(btn => {
    btn.style.display = 'none';
  });
  
  // Añadir mensaje informativo
  const container = document.querySelector('.backup-container');
  if (container) {
    const infoMsg = document.createElement('div');
    infoMsg.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
    infoMsg.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            Como usuario Ramon puedes crear y descargar backups, pero la restauración y eliminación está reservada para administradores.
          </p>
        </div>
      </div>
    `;
    container.insertBefore(infoMsg, container.querySelector('h2').nextSibling);
  }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', setupPermissionsUI);

// También ejecutar cuando se navegue mediante SPA (si aplica)
document.addEventListener('astro:page-load', setupPermissionsUI);
