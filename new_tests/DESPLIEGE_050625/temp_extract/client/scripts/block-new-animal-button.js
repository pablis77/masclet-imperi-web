// Script para bloquear botón de "Nuevo Animal" para roles restringidos
// ESTE ES EL ÚLTIMO SCRIPT DEFINITIVO QUE GESTIONA EL BLOQUEO DE ESTE BOTÓN
// Ejecutado inmediatamente como IIFE de alta prioridad
(function() {
  // Marcar con flag global que este script está activo - impide competencia entre scripts
  window._blockNuevoAnimalActive = true;
  console.log('[block-new-animal] Iniciando script de bloqueo de botón Nuevo Animal');
  
  // Variables para controlar estado de bloqueo
  let bloqueoNuevoAnimalAplicado = false;
  let intentos = 0;
  const MAX_INTENTOS = 150; // Aumentado para dar más oportunidades
  
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
    if (!boton) {
      console.log('[block-new-animal] Error: botón no encontrado');
      return;
    }
    
    console.log('[block-new-animal] Deshabilitando botón:', boton);
    
    // Guardar la URL original si existe
    if (boton.href) {
      boton.setAttribute('data-original-href', boton.href);
    }
    
    try {
      // Cambiar href para que no navegue
      boton.href = '#';
      
      // Deshabilitar completamente
      boton.disabled = true;
      boton.setAttribute('disabled', 'disabled');
      
      // Aplicar estilos inline para máxima prioridad
      boton.style.opacity = '0.5 !important';
      boton.style.cursor = 'not-allowed !important';
      boton.style.pointerEvents = 'none !important';
      boton.title = mensaje;
      
      // Forzar transparencia con !important
      const oldStyle = boton.getAttribute('style') || '';
      boton.setAttribute('style', oldStyle + '; opacity: 0.5 !important; pointer-events: none !important; cursor: not-allowed !important;');
      
      // Prevenir cualquier clic con múltiples métodos
      const preventHandler = function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        alert(mensaje.toUpperCase());
        return false;
      };
      
      boton.onclick = preventHandler;
      boton.addEventListener('click', preventHandler, true);
      boton.addEventListener('mousedown', preventHandler, true);
      
      // Añadir clases visuales
      boton.classList.add('opacity-50', 'cursor-not-allowed');
      boton.classList.remove('hover:bg-primary-700', 'hover:bg-gray-200');
      
      // Añadir texto de candado si no existe
      if (!boton.querySelector('.lock-icon')) {
        const lockIcon = document.createElement('span');
        lockIcon.textContent = ' 🔒';
        lockIcon.className = 'lock-icon ml-1';
        boton.appendChild(lockIcon);
      }
      
      console.log('[block-new-animal] Botón deshabilitado exitosamente:', boton);
    } catch (error) {
      console.error('[block-new-animal] Error al deshabilitar botón:', error);
    }
  }
  
  // Función directa que modifica el DOM para reemplazar el enlace por un botón deshabilitado
  // Esta es una medida agresiva que garantiza el bloqueo incluso si los métodos normales fallan
  function reemplazarBotonNuevoAnimal() {
    // Solo aplicar para roles restringidos
    const rolUsuario = obtenerRolUsuario().toLowerCase();
    if (rolUsuario !== 'editor' && rolUsuario !== 'usuario') return false;
    
    try {
      // Buscar el botón por varias formas
      let botonOriginal = document.querySelector('a[href="/animals/new"]');
      
      if (!botonOriginal) {
        document.querySelectorAll('a').forEach(a => {
          if ((a.textContent.includes('Nuevo Animal') || a.textContent.includes('Nou Animal'))) {
            botonOriginal = a;
          }
        });
      }
      
      if (botonOriginal && !botonOriginal._processed) {
        // Crear un nuevo botón deshabilitado que reemplazará al original
        const nuevoBoton = document.createElement('a');
        nuevoBoton.className = botonOriginal.className + ' opacity-50 cursor-not-allowed';
        nuevoBoton.href = '#';
        nuevoBoton.disabled = true;
        nuevoBoton.setAttribute('disabled', 'disabled');
        nuevoBoton.style = 'opacity: 0.5 !important; cursor: not-allowed !important; pointer-events: none !important;';
        nuevoBoton.title = 'NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES';
        
        // Copiar el contenido interno
        nuevoBoton.innerHTML = botonOriginal.innerHTML;
        
        // Añadir el candado
        const lockSpan = document.createElement('span');
        lockSpan.textContent = ' 🔒'; // Emoji de candado
        lockSpan.className = 'ml-1 lock-icon';
        nuevoBoton.appendChild(lockSpan);
        
        // Reemplazar el botón original con el nuevo
        botonOriginal.parentNode.replaceChild(nuevoBoton, botonOriginal);
        
        console.log('[block-new-animal] ¡Botón reemplazado exitosamente!', nuevoBoton);
        return true;
      }
    } catch (error) {
      console.error('[block-new-animal] Error al reemplazar botón:', error);
    }
    
    return false;
  }
  
  // Función específica para bloquear botón de nuevo animal
  function bloquearBotonNuevoAnimal() {
    // Si ya está aplicado el bloqueo, no repetir
    if (bloqueoNuevoAnimalAplicado) {
      console.log('[block-new-animal] Bloqueo ya aplicado anteriormente');
      return true;
    }
    
    const rolUsuario = obtenerRolUsuario();
    console.log('[block-new-animal] Verificando rol:', rolUsuario);
    
    // Solo bloquear para roles editor y usuario
    if (rolUsuario.toLowerCase() !== 'editor' && rolUsuario.toLowerCase() !== 'usuario') {
      console.log('[block-new-animal] No es necesario bloquear para rol:', rolUsuario);
      return true;
    }
    
    console.log('[block-new-animal] Buscando botón "Nuevo Animal" (intento ' + intentos + ')');
    
    // Múltiples formas de encontrar el botón
    let botonNuevoAnimal = null;
    
    // Método 1: Por href exacto
    const porHref = document.querySelector('a[href="/animals/new"]');
    if (porHref) {
      console.log('[block-new-animal] Botón encontrado por href');
      botonNuevoAnimal = porHref;
    }
    
    // Método 2: Por texto + clase
    if (!botonNuevoAnimal) {
      document.querySelectorAll('a.btn.btn-primary').forEach(btn => {
        if (btn.textContent.includes('Nuevo Animal') || btn.textContent.includes('Nou Animal')) {
          console.log('[block-new-animal] Botón encontrado por texto + clase');
          botonNuevoAnimal = btn;
        }
      });
    }
    
    // Método 3: Solo por texto (más flexible)
    if (!botonNuevoAnimal) {
      document.querySelectorAll('a').forEach(a => {
        if ((a.textContent.includes('Nuevo Animal') || a.textContent.includes('Nou Animal')) && 
            !a.disabled && !a.classList.contains('disabled')) {
          console.log('[block-new-animal] Botón encontrado solo por texto');
          botonNuevoAnimal = a;
        }
      });
    }
    
    // Si lo encontramos, deshabilitarlo
    if (botonNuevoAnimal) {
      try {
        // Guardar referencia para futuros intentos
        window._botonNuevoAnimalRef = botonNuevoAnimal;
        
        // Deshabilitarlo
        deshabilitarBoton(botonNuevoAnimal, 'No tienes permisos para crear nuevos animales');
        bloqueoNuevoAnimalAplicado = true;
        console.log('[block-new-animal] Botón "Nuevo Animal" bloqueado para rol:', rolUsuario);
        return true;
      } catch (error) {
        console.error('[block-new-animal] Error al bloquear botón:', error);
        return false;
      }
    } else {
      console.log('[block-new-animal] Botón "Nuevo Animal" no encontrado (intento ' + intentos + ')');
      return false;
    }
  
  // Función principal para aplicar todas las restricciones
  function aplicarRestricciones() {
    intentos++;
    
    if (intentos > MAX_INTENTOS) {
      console.log('[block-new-animal] Máximo de intentos alcanzado, cancelando restricciones');
      return;
    }
    
    // Obtener rol de usuario
    const rolUsuario = obtenerRolUsuario().toLowerCase();
    console.log('[block-new-animal] Aplicando restricciones para rol:', rolUsuario);
    
    // Aplicar restricciones para roles limitados
    if (rolUsuario === 'editor' || rolUsuario === 'usuario') {
      // Intentar primero con método agresivo de reemplazo
      const exitoReemplazo = reemplazarBotonNuevoAnimal();
      
      if (exitoReemplazo) {
        bloqueoNuevoAnimalAplicado = true;
        console.log('[block-new-animal] Éxito con método de reemplazo directo');
        return;
      }
      
      // Si el reemplazo falla, intentar con el método normal
      const exito = bloquearBotonNuevoAnimal();
      
      if (!exito) {
        // Si no tuvo éxito, programar otro intento con backoff exponencial
        const delay = Math.min(200 * Math.pow(1.5, Math.floor(intentos / 10)), 2000);
        console.log(`[block-new-animal] Reintentando en ${delay}ms (intento ${intentos})`);
        setTimeout(aplicarRestricciones, delay);
      }
    }
  }
  
  // Ejecutar inmediatamente Y ANTES QUE NADA
  aplicarRestricciones();
  
  // También ejecutar inmediatamente en segundo plano (para mayor prioridad)
  setTimeout(aplicarRestricciones, 0);
  requestAnimationFrame(aplicarRestricciones);
  
  // Crear un intervalo para intentos repetidos
  const intervalo = setInterval(function() {
    if (bloqueoNuevoAnimalAplicado || intentos > MAX_INTENTOS) {
      console.log('[block-new-animal] Deteniendo intervalo de intentos');
      clearInterval(intervalo);
    } else {
      aplicarRestricciones();
    }
  }, 200);
  
  // Garantizar que se limpie el intervalo después de un tiempo máximo
  setTimeout(() => {
    if (intervalo) {
      clearInterval(intervalo);
      console.log('[block-new-animal] Intervalo detenido por tiempo máximo');
    }
  }, 30000);
  
  // Ejecutar en puntos específicos para garantizar que se aplique
  [500, 1000, 1500, 2000, 3000, 5000, 10000].forEach(delay => {
    setTimeout(aplicarRestricciones, delay);
  });
  
  // Eventos estándar
  window.addEventListener('DOMContentLoaded', aplicarRestricciones);
  window.addEventListener('load', aplicarRestricciones);
  
  // Eventos de navegación
  window.addEventListener('popstate', aplicarRestricciones);
  document.addEventListener('astro:page-load', aplicarRestricciones);
  document.addEventListener('astro:after-swap', aplicarRestricciones);
  
  // MutationObserver para detectar si el botón se añade después
  const observer = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        aplicarRestricciones();
        break;
      }
    }
  });
  
  // Iniciar observación del DOM
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('[block-new-animal] Configuración completa del bloqueo');
})();
