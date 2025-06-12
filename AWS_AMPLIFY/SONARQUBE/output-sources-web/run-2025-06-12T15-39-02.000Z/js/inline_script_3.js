
      // Ejecutar la configuración de permisos cuando el DOM esté cargado
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM cargado completamente - Ejecutando setupPermissionsUI');
        if (typeof setupPermissionsUI === 'function') {
          setupPermissionsUI();
        } else {
          console.error('La función setupPermissionsUI no está disponible');
        }
      });
      
      // Intentar ejecutar también cuando la ventana esté cargada
      window.addEventListener('load', function() {
        console.log('Ventana cargada completamente - Ejecutando setupPermissionsUI');
        if (typeof setupPermissionsUI === 'function') {
          setupPermissionsUI();
        }
      });
    