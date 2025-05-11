/**
 * Utilidades para manejo de formularios
 */

/**
 * Normaliza un valor para comparación
 * @param {any} valor - Valor a normalizar
 * @returns {string} - Valor normalizado como string
 */
export function normalizar(valor) {
  // Si es null o undefined, convertir a cadena vacía
  if (valor === null || valor === undefined) return '';
  // Si es una cadena, recortar espacios
  if (typeof valor === 'string') return valor.trim();
  // Cualquier otro tipo, convertir a string
  return String(valor);
}

/**
 * Detecta cambios entre el valor actual y el original
 * @param {HTMLElement} elemento - Elemento del DOM
 * @param {string} mapeoNombre - Nombre del campo en la API
 * @returns {Object|null} - Objeto con nombre y valor si hay cambio, null si no hay cambio
 */
export function detectarCambio(elemento, mapeoNombre) {
  if (!elemento) {
    console.log(`No se encontró el elemento`);
    return null;
  }
  
  // Obtener valores y normalizarlos
  const valorActual = normalizar(elemento.value);
  const valorOriginal = normalizar(elemento.getAttribute('data-original-value'));
  
  console.log(`Campo ${elemento.id} - valor actual: [${valorActual}]`);
  console.log(`Campo ${elemento.id} - valor original: [${valorOriginal}]`);
  
  // Comparación estricta para detectar cambios reales
  if (valorActual !== valorOriginal) {
    console.log(`¡DETECTADO CAMBIO EN ${elemento.id.toUpperCase()}!`);
    
    // Determinar el valor a enviar
    let valorFinal;
    if (valorActual === '') {
      // Para campos nulables, enviar null cuando están vacíos
      const camposNulables = ['mare', 'pare', 'quadra', 'cod', 'num_serie', 'dob'];
      if (camposNulables.includes(mapeoNombre)) {
        valorFinal = null;
      } else {
        valorFinal = valorActual;
      }
    } else {
      valorFinal = valorActual;
    }
    
    return { nombre: mapeoNombre, valor: valorFinal };
  }
  return null;
}

/**
 * Muestra un mensaje al usuario
 * @param {string} type - Tipo de mensaje: 'error', 'success', 'info'
 * @param {string} title - Título del mensaje
 * @param {string} message - Contenido del mensaje
 */
export function showMessage(type, title, message) {
  // Eliminar cualquier mensaje anterior
  const existingMessages = document.querySelectorAll('.message-alert');
  existingMessages.forEach(msg => msg.remove());
  
  // Crear elemento de mensaje
  const messageElement = document.createElement('div');
  messageElement.className = `message-alert fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-blue-100 border-blue-500 text-blue-700'}`;
  
  messageElement.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${type === 'error' ? '<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>' : type === 'success' ? '<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>' : '<svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V9z" clip-rule="evenodd"/></svg>'}
      </div>
      <div class="ml-3">
        <h3 class="text-sm leading-5 font-medium">${title}</h3>
        <div class="mt-1 text-sm leading-5">${message}</div>
      </div>
      <div class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button class="inline-flex rounded-md p-1.5 text-gray-500 hover:text-gray-600 focus:outline-none" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(messageElement);
  
  // Eliminar el mensaje después de 5 segundos (excepto errores)
  if (type !== 'error') {
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}
