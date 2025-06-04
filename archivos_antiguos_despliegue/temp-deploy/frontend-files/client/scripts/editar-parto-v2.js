/**
 * Script para gestionar la edición de partos (versión 2)
 * Este archivo contiene la lógica para editar partos desde la página de detalles del animal
 */

// Función para crear el modal de edición de partos
function crearModalEdicionParto() {
  // Si ya existe el modal, no lo creamos de nuevo
  if (document.getElementById('modal-editar-parto')) return;

  // Crear estructura del modal
  const modal = document.createElement('div');
  modal.id = 'modal-editar-parto';
  modal.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 hidden';
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');

  // Contenido del modal
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-auto shadow-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 id="modal-editar-titulo" class="text-xl font-semibold text-gray-900 dark:text-white">Editar Parto</h3>
        <button id="modal-editar-cerrar" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div id="modal-editar-error" class="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm hidden"></div>
      
      <form id="form-editar-parto">
        <div class="space-y-4">
          <!-- Fecha del parto -->
          <div>
            <label for="edit-fecha" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha del parto
            </label>
            <input
              type="date"
              name="part"
              id="edit-fecha"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
          
          <!-- Género del ternero -->
          <div>
            <label for="edit-genere" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Género del ternero
            </label>
            <select
              name="GenereT"
              id="edit-genere"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="">Selecciona un género</option>
              <option value="M">Macho</option>
              <option value="F">Hembra</option>
              <option value="esforrada">Esforrada</option>
            </select>
          </div>
          
          <!-- Estado del ternero -->
          <div>
            <label for="edit-estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado del ternero
            </label>
            <select
              name="EstadoT"
              id="edit-estado"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="OK">Vivo</option>
              <option value="DEF">Fallecido</option>
            </select>
          </div>
          
          <!-- Número de parto -->
          <div>
            <label for="edit-numero" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de parto
            </label>
            <input
              type="number"
              name="numero_part"
              id="edit-numero"
              min="1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
          
          <!-- Observaciones -->
          <div>
            <label for="edit-obs" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <textarea
              name="observacions"
              id="edit-obs"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder="Añade observaciones relevantes sobre el parto o el ternero..."
            ></textarea>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            id="modal-editar-cancelar"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="modal-editar-guardar"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  `;

  // Añadir modal al body
  document.body.appendChild(modal);
  
  // Configurar eventos
  document.getElementById('modal-editar-cerrar').addEventListener('click', cerrarModalEdicion);
  document.getElementById('modal-editar-cancelar').addEventListener('click', cerrarModalEdicion);
  document.getElementById('form-editar-parto').addEventListener('submit', guardarEdicionParto);
  
  return modal;
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg animate-fadeIn z-50 ${tipo === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`;
  notificacion.textContent = mensaje;
  
  // Añadir a la página
  document.body.appendChild(notificacion);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notificacion.classList.add('animate-fadeOut');
    setTimeout(() => {
      notificacion.remove();
    }, 500);
  }, 3000);
}

// Función para mostrar el modal de edición de partos con los datos actuales
function mostrarModalEdicion(partoId, fila) {
  const modal = crearModalEdicionParto();
  if (!modal) return;
  
  // Limpiar errores previos
  const errorDiv = document.getElementById('modal-editar-error');
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
  
  // Obtener el ID del animal de la URL
  const animalIdMatch = window.location.pathname.match(/\/animals\/([0-9]+)/);
  const animalId = animalIdMatch ? animalIdMatch[1] : null;
  
  if (!animalId) {
    mostrarError('No se pudo determinar el ID del animal');
    return;
  }
  
  // Guardar referencia al ID del parto y la fila para usarlos al guardar
  modal.setAttribute('data-parto-id', partoId);
  modal.setAttribute('data-animal-id', animalId);
  
  // Obtener token
  const token = localStorage.getItem('token');
  if (!token) {
    mostrarError('No se ha encontrado el token de autenticación');
    return;
  }
  
  // Mostrar el modal mientras cargamos los datos
  modal.classList.remove('hidden');
  
  // Cambiar texto del botón mientras cargamos
  const btnGuardar = document.getElementById('modal-editar-guardar');
  const textoOriginal = btnGuardar.textContent;
  btnGuardar.textContent = 'Cargando...';
  btnGuardar.disabled = true;
  
  // Construir URL de la API - IMPORTANTE: INCLUYE SLASH FINAL
  const apiUrl = `http://localhost:8000/api/v1/animals/${animalId}/partos/${partoId}/`;
  
  console.log('Obteniendo datos del parto:', apiUrl);
  
  // Obtener datos del parto
  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Datos del parto obtenidos:', data);
    
    // Verificar la estructura de la respuesta
    const partoData = data.data || data;
    console.log('Datos que se usarán:', partoData);
    
    // Rellenar el formulario con los datos
    const fechaInput = document.getElementById('edit-fecha');
    const genereInput = document.getElementById('edit-genere');
    const estadoInput = document.getElementById('edit-estado');
    const numeroInput = document.getElementById('edit-numero');
    const obsInput = document.getElementById('edit-obs');
    
    // Formatear fecha DD/MM/YYYY a YYYY-MM-DD para el input date
    if (partoData.part && partoData.part.includes('/')) {
      const parts = partoData.part.split('/');
      fechaInput.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
      fechaInput.value = partoData.part || '';
    }
    
    genereInput.value = partoData.GenereT || '';
    estadoInput.value = partoData.EstadoT || 'OK';
    numeroInput.value = partoData.numero_part || 1;
    obsInput.value = partoData.observacions || '';
    
    // Restaurar botón
    btnGuardar.textContent = textoOriginal;
    btnGuardar.disabled = false;
  })
  .catch(error => {
    console.error('Error al obtener datos del parto:', error);
    cerrarModalEdicion();
    mostrarNotificacion(`Error al cargar el parto: ${error.message}`, 'error');
  });
}

// Función para cerrar el modal de edición
function cerrarModalEdicion() {
  const modal = document.getElementById('modal-editar-parto');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Función para mostrar errores en el modal
function mostrarError(mensaje) {
  const errorDiv = document.getElementById('modal-editar-error');
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove('hidden');
  }
}

// Función para guardar los cambios del parto
function guardarEdicionParto(event) {
  event.preventDefault();
  
  const modal = document.getElementById('modal-editar-parto');
  const partoId = modal.getAttribute('data-parto-id');
  const animalId = modal.getAttribute('data-animal-id');
  
  // Obtener token
  const token = localStorage.getItem('token');
  if (!token) {
    mostrarError('No se ha encontrado el token de autenticación');
    return;
  }
  
  // Cambiar texto del botón mientras guardamos
  const btnGuardar = document.getElementById('modal-editar-guardar');
  const textoOriginal = btnGuardar.textContent;
  btnGuardar.textContent = 'Guardando...';
  btnGuardar.disabled = true;
  
  // Obtener datos del formulario
  const fechaInput = document.getElementById('edit-fecha');
  const genereInput = document.getElementById('edit-genere');
  const estadoInput = document.getElementById('edit-estado');
  const numeroInput = document.getElementById('edit-numero');
  const obsInput = document.getElementById('edit-obs');
  
  // Formatear fecha YYYY-MM-DD a DD/MM/YYYY para la API
  let fechaFormateada = fechaInput.value;
  if (fechaInput.value && fechaInput.value.includes('-')) {
    const parts = fechaInput.value.split('-');
    fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  
  // Construir objeto de datos
  const partoData = {
    part: fechaFormateada,
    GenereT: genereInput.value,
    EstadoT: estadoInput.value,
    numero_part: parseInt(numeroInput.value) || 1,
    observacions: obsInput.value
  };
  
  console.log('Guardando datos del parto:', partoData);
  
  // Construir URL de la API - IMPORTANTE: INCLUYE SLASH FINAL
  const apiUrl = `http://localhost:8000/api/v1/animals/${animalId}/partos/${partoId}/`;
  
  console.log('URL para actualizar parto:', apiUrl);
  
  // Enviar datos a la API
  fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(partoData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Parto actualizado correctamente:', data);
    
    // Cerrar modal
    cerrarModalEdicion();
    
    // Mostrar notificación de éxito
    mostrarNotificacion('Parto actualizado correctamente', 'success');
    
    // Refrescar la página para mostrar los cambios
    // Usamos un pequeño retraso para que la notificación se vea
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  })
  .catch(error => {
    console.error('Error al actualizar parto:', error);
    
    // Restaurar botón
    btnGuardar.textContent = textoOriginal;
    btnGuardar.disabled = false;
    
    // Mostrar error
    mostrarError(`Error al guardar: ${error.message}`);
  });
}

// Añadir animaciones CSS si no existen ya
if (!document.getElementById('editar-partos-animations')) {
  const style = document.createElement('style');
  style.id = 'editar-partos-animations';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(10px); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-fadeOut {
      animation: fadeOut 0.3s ease-in forwards;
    }
  `;
  document.head.appendChild(style);
}

// Exportamos las funciones para usarlas desde la página
window.editarPartoV2 = {
  mostrarModal: mostrarModalEdicion,
  cerrarModal: cerrarModalEdicion,
  mostrarNotificacion: mostrarNotificacion
};

