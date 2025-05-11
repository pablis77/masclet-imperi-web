/**
 * Utilidad para actualizar específicamente el campo mare de un animal
 * Esta función se usa directamente desde el botón en la página de actualización
 */

export function actualizarCampoMare(animalId) {
  const mareInput = document.getElementById('mare');
  if (!mareInput) {
    console.error('No se encontró el elemento input#mare');
    return;
  }
  
  const valorActual = mareInput.value || '';
  const valorOriginal = mareInput.getAttribute('data-original-value') || '';
  
  console.log('Actualizando campo mare:');
  console.log('- Valor actual:', valorActual);
  console.log('- Valor original:', valorOriginal);
  
  if (valorActual === valorOriginal) {
    alert('No hay cambios para guardar');
    return;
  }
  
  // Mostrar indicador de carga en el botón
  const btnActualizar = document.getElementById('btn-actualizar-mare');
  const textoOriginal = btnActualizar.textContent;
  btnActualizar.innerHTML = '<span class="animate-spin inline-block h-3 w-3 border-t-2 border-b-2 border-white rounded-full mr-1"></span> Actualizando...';
  btnActualizar.disabled = true;
  
  // Obtener token de autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.');
    return;
  }
  
  // Crear objeto con solo el campo mare
  const datosActualizacion = {
    mare: valorActual
  };
  
  console.log('Enviando datos de actualización:', datosActualizacion);
  
  // Realizar la petición PATCH directamente
  fetch(`/api/v1/animals/${animalId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datosActualizacion)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Respuesta exitosa:', data);
    alert('¡Campo Madre actualizado correctamente!');
    
    // Actualizar el valor original para reflejar el cambio
    mareInput.setAttribute('data-original-value', valorActual);
    mareInput.style.borderColor = '#d1d5db';
    btnActualizar.disabled = true;
    
    // Recargar la página para mostrar los cambios
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  })
  .catch(error => {
    console.error('Error al actualizar el campo mare:', error);
    alert(`Error al actualizar: ${error.message || 'Error desconocido'}`);
    
    // Restaurar el botón
    btnActualizar.textContent = 'Actualizar';
    btnActualizar.disabled = false;
  });
}
