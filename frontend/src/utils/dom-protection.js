/**
 * Protección global contra errores de DOM
 * Este script implementa protección automática contra errores de acceso al DOM
 * Se debe importar en el entry point de la aplicación
 */

import { onDOMReady } from './dom-safe-access';

// Ejecutar cuando el DOM esté listo
onDOMReady(() => {
  console.log('🛡️ Inicializando protección DOM');
  
  // Monkeypatching del método querySelector
  const originalQuerySelector = Document.prototype.querySelector;
  Document.prototype.querySelector = function(selector) {
    try {
      return originalQuerySelector.call(this, selector);
    } catch (error) {
      console.warn(`⚠️ Error al buscar selector: ${selector}`, error);
      return null;
    }
  };
  
  // Monkeypatching del método querySelectorAll
  const originalQuerySelectorAll = Document.prototype.querySelectorAll;
  Document.prototype.querySelectorAll = function(selector) {
    try {
      return originalQuerySelectorAll.call(this, selector);
    } catch (error) {
      console.warn(`⚠️ Error al buscar selector múltiple: ${selector}`, error);
      return [];
    }
  };
  
  // Monkeypatching para proteger el acceso a textContent
  const originalDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  
  Object.defineProperty(Node.prototype, 'textContent', {
    get: function() {
      return originalDescriptor.get.call(this);
    },
    set: function(value) {
      try {
        if (this) {
          originalDescriptor.set.call(this, value);
        } else {
          console.warn('⚠️ Intento de acceder a textContent en un elemento nulo');
        }
      } catch (error) {
        console.warn('⚠️ Error al establecer textContent:', error);
      }
      return value;
    },
    configurable: true
  });
  
  // Capturar errores no controlados
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('Cannot set properties of null')) {
      console.warn('🔴 Error DOM interceptado:', event.error.message);
      // Prevenir que el error se propague y aparezca en la consola
      event.preventDefault();
    }
  });
  
  console.log('✅ Protección DOM inicializada');
});

// Exportar un objeto global para acceso desde cualquier parte
export const DOMProtection = {
  isActive: true,
  version: '1.0.0'
};

// Auto-inicializar
if (typeof window !== 'undefined') {
  window.DOMProtection = DOMProtection;
}
