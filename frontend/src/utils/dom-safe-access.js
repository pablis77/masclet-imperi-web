/**
 * Utilidad para acceso seguro al DOM
 * Evita errores de referencia null cuando los elementos no existen
 */

/**
 * Obtiene un elemento del DOM de forma segura
 * @param {string} selector - Selector CSS del elemento
 * @param {boolean} waitForLoad - Si es true, espera a que el DOM esté cargado
 * @param {Function} callback - Función a ejecutar si se encuentra el elemento
 * @returns {HTMLElement|null} - El elemento encontrado o null
 */
export function safeGetElement(selector, waitForLoad = false, callback = null) {
  // Si waitForLoad es true, esperar al evento DOMContentLoaded
  if (waitForLoad) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const element = document.querySelector(selector);
        if (element && callback) {
          callback(element);
        }
        return element;
      });
      return null;
    }
  }
  
  // Intentar obtener el elemento directamente
  const element = document.querySelector(selector);
  if (element && callback) {
    callback(element);
  }
  return element;
}

/**
 * Ejecuta una función cuando el DOM esté listo
 * @param {Function} callback - Función a ejecutar
 */
export function onDOMReady(callback) {
  if (typeof document === 'undefined') {
    // En SSR no hay document, no ejecutamos nada
    return;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Aplica una función a un elemento solo si existe
 * @param {string} selector - Selector CSS del elemento
 * @param {Function} callback - Función a aplicar
 */
export function withElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  }
}

/**
 * Aplica una función a múltiples elementos solo si existen
 * @param {string} selector - Selector CSS para los elementos
 * @param {Function} callback - Función a aplicar a cada elemento
 */
export function withElements(selector, callback) {
  const elements = document.querySelectorAll(selector);
  if (elements && elements.length > 0) {
    elements.forEach(callback);
  }
}

/**
 * Comprueba si un elemento existe en el DOM
 * @param {string} selector - Selector CSS del elemento
 * @returns {boolean} - True si existe, false si no
 */
export function elementExists(selector) {
  return document.querySelector(selector) !== null;
}

/**
 * Espera a que un elemento aparezca en el DOM
 * @param {string} selector - Selector CSS del elemento
 * @param {number} maxAttempts - Número máximo de intentos
 * @param {number} interval - Intervalo entre intentos (ms)
 * @returns {Promise<HTMLElement>} - Promesa que se resuelve con el elemento
 */
export function waitForElement(selector, maxAttempts = 10, interval = 300) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkElement = () => {
      attempts++;
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
        return;
      }
      
      if (attempts >= maxAttempts) {
        reject(new Error(`Elemento ${selector} no encontrado después de ${maxAttempts} intentos`));
        return;
      }
      
      setTimeout(checkElement, interval);
    };
    
    checkElement();
  });
}

// Exportar un objeto global que puede ser accedido desde cualquier script
if (typeof window !== 'undefined') {
  window.DOMSafeAccess = {
    safeGetElement,
    onDOMReady,
    withElement,
    withElements,
    elementExists,
    waitForElement
  };
}

export default {
  safeGetElement,
  onDOMReady,
  withElement,
  withElements,
  elementExists,
  waitForElement
};
