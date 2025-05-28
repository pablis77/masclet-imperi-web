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
  
  // Función para bloquear el botón Nuevo Animal según el rol
  function bloquearBotonNuevoAnimal() {
    // Si ya aplicamos el bloqueo o si ya intentamos varias veces, no repetir
    if (bloqueoNuevoAnimalAplicado || intentos > 5) {
      bloqueoNuevoAnimalAplicado = true; // Marcar como completado para evitar más intentos
      return true;
    }
    
    // Buscar botón directamente por ID (forma más directa)
    const botonNuevoAnimal = document.getElementById('new-animal-btn');
    
    if (botonNuevoAnimal) {
      console.log('Botón Nuevo Animal encontrado', botonNuevoAnimal);
      
      // Deshabilitar visualmente
      deshabilitarBoton(botonNuevoAnimal, 'NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES');
      
      // Añadir icono de candado
      if (!botonNuevoAnimal.querySelector('.lock-icon')) {
        const lockIcon = document.createElement('span');
        lockIcon.textContent = ' 🔒';
        lockIcon.className = 'ml-1 lock-icon';
        botonNuevoAnimal.appendChild(lockIcon);
      }
      
      // Sobreescribir el onclick
      botonNuevoAnimal.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        alert('NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES');
        return false;
      };
      
      bloqueoNuevoAnimalAplicado = true;
      console.log('Botón Nuevo Animal bloqueado correctamente');
      return true;
    } else {
      // Si no existe el botón en la página actual, dejamos de buscarlo
      // después de unos pocos intentos
      if (intentos >= 3) {
        bloqueoNuevoAnimalAplicado = true; // Para no seguir buscando indefinidamente
      }
      return false;
    }
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
    const rolLower = userRole.toLowerCase();
    if (rolLower === 'editor' || rolLower === 'usuario') {
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
