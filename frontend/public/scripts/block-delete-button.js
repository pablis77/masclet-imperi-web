// Script para bloquear elementos restringidos para editores
(function() {
  // Variables para controlar estados de bloqueo
  let bloqueoAnimalAplicado = false;
  let bloqueoPartosAplicado = false;
  let intentos = 0;
  const MAX_INTENTOS = 50;
  
  // Función para obtener el rol del usuario desde el token JWT
  function obtenerRolUsuario() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 'guest';
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'guest';
    } catch (e) {
      return 'guest';
    }
  }
  
  // Función genérica para deshabilitar un botón
  function deshabilitarBoton(boton, mensaje) {
    if (!boton) return;
    
    // Deshabilitar completamente
    boton.disabled = true;
    boton.style.opacity = '0.5';
    boton.style.cursor = 'not-allowed';
    boton.style.pointerEvents = 'none';
    boton.title = mensaje;
    
    // Prevenir cualquier clic
    boton.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      alert(mensaje.toUpperCase());
      return false;
    };
    
    // Añadir clases visuales
    boton.classList.add('opacity-50', 'cursor-not-allowed');
    boton.classList.remove('hover:bg-red-700', 'hover:bg-gray-200');
    
    // Añadir texto de candado si no existe
    if (!boton.querySelector('.lock-icon')) {
      const lockIcon = document.createElement('span');
      lockIcon.textContent = ' \ud83d\udd12';
      lockIcon.className = 'lock-icon';
      boton.appendChild(lockIcon);
    }
  }
  
  // Función para bloquear botón de eliminar animal
  function bloquearBotonEliminarAnimal() {
    if (bloqueoAnimalAplicado) return;
    
    const deleteBtn = document.getElementById('delete-animal-btn');
    if (deleteBtn) {
      deshabilitarBoton(deleteBtn, 'No tienes permisos para eliminar animales');
      bloqueoAnimalAplicado = true;
    }
  }
  
  // Función para bloquear botones de eliminar partos
  function bloquearBotonesEliminarPartos() {
    // Si ya bloqueamos todos los botones visibles, marcamos como aplicado
    const botonesEliminar = document.querySelectorAll('button[title="Eliminar parto"]');
    if (botonesEliminar.length > 0) {
      let todosBloqueados = true;
      
      botonesEliminar.forEach(boton => {
        if (!boton.disabled) {
          deshabilitarBoton(boton, 'No tienes permisos para eliminar partos');
          todosBloqueados = false;
        }
      });
      
      // Si todos los botones ya estaban bloqueados, no necesitamos seguir buscando
      if (todosBloqueados && botonesEliminar.length > 0) {
        bloqueoPartosAplicado = true;
      }
    }
  }
  
  // Función principal para aplicar todas las restricciones
  function aplicarRestricciones() {
    // Incrementar contador de intentos
    intentos++;
    
    // Si superamos el máximo de intentos, detener
    if (intentos > MAX_INTENTOS) {
      if (window.blockButtonsInterval) {
        clearInterval(window.blockButtonsInterval);
      }
      return;
    }
    
    const userRole = obtenerRolUsuario();
    
    // Solo bloquear para roles editor y usuario
    if (userRole.toLowerCase() !== 'administrador' && userRole.toLowerCase() !== 'ramon') {
      // Aplicar bloqueos
      bloquearBotonEliminarAnimal();
      bloquearBotonesEliminarPartos();
      
      // Si todos los bloqueos están aplicados, detener intervalo
      if (bloqueoAnimalAplicado && bloqueoPartosAplicado) {
        if (window.blockButtonsInterval) {
          clearInterval(window.blockButtonsInterval);
        }
      }
    }
  }
  
  // Ejecutar inmediatamente
  aplicarRestricciones();
  
  // Seguir intentando periódicamente
  window.blockButtonsInterval = setInterval(aplicarRestricciones, 300);
  
  // Limpiar el intervalo después de 5 segundos
  setTimeout(() => {
    if (window.blockButtonsInterval) {
      clearInterval(window.blockButtonsInterval);
    }
  }, 5000);
  
  // Ejecutar cuando cambia la pestañA
  function onTabClick() {
    // Al cambiar de pestaña, resetear el estado de bloqueo de partos
    // porque podrían aparecer nuevos botones
    bloqueoPartosAplicado = false;
    aplicarRestricciones();
  }
  
  // Ejecutar cuando se cargue el DOM o la ventana
  document.addEventListener('DOMContentLoaded', aplicarRestricciones);
  window.addEventListener('load', aplicarRestricciones);
  
  // Agregar listeners a las pestañas
  setTimeout(() => {
    document.querySelectorAll('#tab-partos, #tab-info, #tab-changes').forEach(tab => {
      tab.addEventListener('click', onTabClick);
    });
  }, 500);
  
  // Observar cambios en el DOM para casos donde se añaden elementos dinámicamente
  let throttleTimer;
  const observer = new MutationObserver(() => {
    if (!throttleTimer) {
      throttleTimer = setTimeout(() => {
        // Reset estado de bloqueo de partos para verificar nuevamente
        bloqueoPartosAplicado = false;
        aplicarRestricciones();
        throttleTimer = null;
      }, 300);
    }
  });
  
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true 
  });
})();
