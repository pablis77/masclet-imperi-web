/**
 * Script para gestionar la visualización de elementos de UI según permisos
 * Este script oculta botones y añade mensajes informativos para funciones restringidas
 * JAVASCRIPT PURO - SIN TYPESCRIPT
 */

(function() {
  'use strict';
  
  // Evitar múltiples ejecuciones usando window como namespace único
  if (window.PERMISSIONS_UI_SYSTEM_LOADED) {
    console.log("Sistema de permisos ya cargado, saltando inicialización...");
    return;
  }
  
  console.log("Inicializando sistema de gestión de permisos...");
  
  // Marcar como cargado inmediatamente
  window.PERMISSIONS_UI_SYSTEM_LOADED = true;
  
  // Función principal para gestionar permisos en la UI
  function setupPermissionsUI() {
    // Evitar múltiples ejecuciones de la configuración
    if (window.PERMISSIONS_SETUP_COMPLETED) {
      console.log("Configuración de permisos ya completada, saltando...");
      return;
    }
    
    console.log("Ejecutando configuración de permisos en UI...");
    
    // 1. Verificar el rol del usuario desde localStorage
    var token = localStorage.getItem('token');
    if (!token) {
      console.log("No hay token disponible, saltando configuración de permisos");
      return;
    }
    
    try {
      // Obtener el rol del usuario
      var payload = JSON.parse(atob(token.split('.')[1]));
      var userRole = payload.role;
      
      console.log('Rol de usuario detectado: ' + userRole);
      
      // 2. Aplicar restricciones específicas según la página actual
      var currentPath = window.location.pathname;
      
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
        console.log('Aplicando restricciones para rol Usuario');
        // El rol usuario no tiene acceso a estas páginas administrativas
        var rutasRestringidas = ['/imports', '/backup', '/users'];
        
        // Redirigir si está en una página restringida
        var enRutaRestringida = rutasRestringidas.some(function(ruta) {
          return currentPath.includes(ruta);
        });
        
        if (enRutaRestringida) {
          console.log('Usuario sin permisos detectado, redirigiendo...');
          window.location.href = '/';
          return;
        }
        
        // Deshabilitar enlaces a páginas restringidas
        var restrictedLinks = document.querySelectorAll('a[href*="/imports"], a[href*="/backup"], a[href*="/users"]');
        restrictedLinks.forEach(function(link) {
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
      
      // Marcar configuración como completada
      window.PERMISSIONS_SETUP_COMPLETED = true;
      console.log("Configuración de permisos completada exitosamente");
      
    } catch (e) {
      console.error('Error al procesar configuración de permisos:', e);
    }
  }

  // Gestionar restricciones en la página de importaciones
  function handleImportPageRestrictions() {
    console.log("Aplicando restricciones específicas para página de importaciones...");
    
    // Usar setTimeout para asegurar que los elementos existan
    setTimeout(function() {
      // Ocultar botones de importación excepto los de descarga
      var importButtons = document.querySelectorAll('.import-btn:not(.download-btn)');
      importButtons.forEach(function(btn) {
        btn.style.display = 'none';
      });
      
      // También podemos ocultar el formulario de carga si existe
      var uploadForm = document.querySelector('#import-form');
      if (uploadForm) {
        uploadForm.style.display = 'none';
      }
      
      // Añadir mensaje informativo (solo si no existe)
      var container = document.querySelector('.import-container');
      if (container && !container.querySelector('.permissions-warning-message')) {
        var infoMsg = document.createElement('div');
        infoMsg.className = 'permissions-warning-message bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
        infoMsg.innerHTML = '<div class="flex">' +
          '<div class="flex-shrink-0">' +
            '<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">' +
              '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />' +
            '</svg>' +
          '</div>' +
          '<div class="ml-3">' +
            '<p class="text-sm text-yellow-700">' +
              'Esta función de importación solo está disponible para administradores. Puedes ver el historial de importaciones pero no iniciar nuevas.' +
            '</p>' +
          '</div>' +
        '</div>';
        
        var targetElement = container.querySelector('h2');
        if (targetElement && targetElement.nextSibling) {
          container.insertBefore(infoMsg, targetElement.nextSibling);
        } else if (targetElement) {
          targetElement.parentNode.insertBefore(infoMsg, targetElement.nextElementSibling);
        }
      }
    }, 100);
  }

  // Gestionar restricciones en la página de backup/restore
  function handleBackupPageRestrictions() {
    console.log("Aplicando restricciones específicas para página de backup...");
    
    setTimeout(function() {
      // Ocultar botones de restauración y eliminación de backups
      var restrictedButtons = document.querySelectorAll('.restore-btn, .delete-btn');
      restrictedButtons.forEach(function(btn) {
        btn.style.display = 'none';
      });
      
      // Añadir mensaje informativo (solo si no existe)
      var container = document.querySelector('.backup-container');
      if (container && !container.querySelector('.permissions-warning-message')) {
        var infoMsg = document.createElement('div');
        infoMsg.className = 'permissions-warning-message bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4';
        infoMsg.innerHTML = '<div class="flex">' +
          '<div class="flex-shrink-0">' +
            '<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">' +
              '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />' +
            '</svg>' +
          '</div>' +
          '<div class="ml-3">' +
            '<p class="text-sm text-yellow-700">' +
              'Como usuario Ramon puedes crear y descargar backups, pero la restauración y eliminación está reservada para administradores.' +
            '</p>' +
          '</div>' +
        '</div>';
        
        var targetElement = container.querySelector('h2');
        if (targetElement && targetElement.nextSibling) {
          container.insertBefore(infoMsg, targetElement.nextSibling);
        }
      }
    }, 100);
  }

  // Función para resetear el sistema (útil para navegación SPA)
  function resetPermissionsSystem() {
    window.PERMISSIONS_SETUP_COMPLETED = false;
    console.log("Sistema de permisos reseteado para nueva navegación");
  }

  // Función de inicialización principal
  function initializePermissions() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(setupPermissionsUI, 50);
      });
    } else {
      setTimeout(setupPermissionsUI, 50);
    }
    
    // También ejecutar cuando la ventana esté completamente cargada
    window.addEventListener('load', function() {
      if (!window.PERMISSIONS_SETUP_COMPLETED) {
        setTimeout(setupPermissionsUI, 100);
      }
    });
  }

  // Event listeners para navegación SPA (Astro)
  document.addEventListener('astro:page-load', function() {
    console.log("Navegación SPA detectada, reseteando sistema de permisos...");
    resetPermissionsSystem();
    setTimeout(setupPermissionsUI, 100);
  });

  // Exportar funciones al objeto window para uso global
  window.PermissionsUISystem = {
    setup: setupPermissionsUI,
    reset: resetPermissionsSystem,
    handleImportRestrictions: handleImportPageRestrictions,
    handleBackupRestrictions: handleBackupPageRestrictions
  };

  // Inicializar el sistema
  initializePermissions();
  
  console.log("Sistema de permisos UI cargado y configurado");
})();