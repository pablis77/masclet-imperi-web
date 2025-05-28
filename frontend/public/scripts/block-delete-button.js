// Script para bloquear elementos restringidos para editores
(function() {
  // Variables para controlar estados de bloqueo
  let bloqueoAnimalAplicado = false;
  let bloqueoPartosAplicado = false;
  let bloqueoNuevoAnimalAplicado = false;
  let intentos = 0;
  const MAX_INTENTOS = 100;  // Aumentar el máximo de intentos
  
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
  
  // Función para bloquear botón de nuevo animal
  function bloquearBotonNuevoAnimal() {
    if (bloqueoNuevoAnimalAplicado) return;
    
    // Usar ID idéntico al usado en el archivo HTML
    const newAnimalBtn = document.getElementById('new-animal-btn');
    if (newAnimalBtn) {
      deshabilitarBoton(newAnimalBtn, 'No tienes permisos para crear nuevos animales');
      bloqueoNuevoAnimalAplicado = true;
      console.log('Botón Nuevo Animal bloqueado correctamente');
    }
    
    /* Código original comentado:
    // Si ya aplicamos el bloqueo, no repetir
    if (bloqueoNuevoAnimalAplicado) return true;
    
    console.log('[block-new-animal] Buscando botón Nuevo Animal para bloquear');
    // Buscar por href, clase y texto
    let botonNuevoAnimal = document.querySelector('a[href="/animals/new"]');
    
    // Si no lo encontramos por href, probar por texto
    if (!botonNuevoAnimal) {
      document.querySelectorAll('a').forEach(a => {
        if ((a.textContent.includes('Nuevo Animal') || a.textContent.includes('Nou Animal')) && !a.disabled) {
          botonNuevoAnimal = a;
        }
      });
    }
    
    if (botonNuevoAnimal) {
      console.log('¡Botón Nuevo Animal encontrado!', botonNuevoAnimal);
      deshabilitarBoton(botonNuevoAnimal, 'No tienes permisos para crear nuevos animales');
      bloqueoNuevoAnimalAplicado = true;
      console.log('Botón Nuevo Animal bloqueado exitosamente');
      return true;
    } else {
      console.log('Botón Nuevo Animal no encontrado en intento', intentos);
      return false;
    }
    */
  }
  
  // Función principal para aplicar todas las restricciones
  function aplicarRestricciones() {
    // Incrementar contador de intentos
    intentos++;
    
    // Si superamos el máximo de intentos, detener
    if (intentos > MAX_INTENTOS) {
      console.log('Se alcanzó el máximo de intentos:', MAX_INTENTOS);
      if (window.blockButtonsInterval) {
        clearInterval(window.blockButtonsInterval);
      }
      return;
    }
    
    const userRole = obtenerRolUsuario();
    console.log(`Verificando restricciones para rol: ${userRole} (intento ${intentos})`);
    
    // Solo bloquear para roles editor y usuario
    if (userRole.toLowerCase() !== 'administrador' && userRole.toLowerCase() !== 'ramon') {
      console.log('Aplicando bloqueos para rol restringido:', userRole);
      
      // Aplicar los tres bloqueos en orden
      bloquearBotonEliminarAnimal();
      bloquearBotonesEliminarPartos();
      bloquearBotonNuevoAnimal();
      
      // Si todos los bloqueos están aplicados, detener intervalo
      if (bloqueoAnimalAplicado && bloqueoPartosAplicado && bloqueoNuevoAnimalAplicado) {
        console.log('¡Todos los bloqueos aplicados! Deteniendo interval.');
        if (window.blockButtonsInterval) {
          clearInterval(window.blockButtonsInterval);
        }
      }
    }
  }
  
  // Ejecutar inmediatamente
  aplicarRestricciones();
  
  // Seguir intentando periódicamente con más frecuencia al inicio
  window.blockButtonsInterval = setInterval(aplicarRestricciones, 200);
  
  // Limpiar el intervalo después de 10 segundos (más tiempo para asegurar)
  setTimeout(() => {
    if (window.blockButtonsInterval) {
      clearInterval(window.blockButtonsInterval);
      console.log('Interval de bloqueos detenido por tiempo máximo');
    }
  }, 10000);
  
  // Ejecutar con retrasos adicionales (para cargas dinámicas tardías)
  [500, 1000, 2000, 3000, 5000].forEach(ms => {
    setTimeout(aplicarRestricciones, ms);
  });
  
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
