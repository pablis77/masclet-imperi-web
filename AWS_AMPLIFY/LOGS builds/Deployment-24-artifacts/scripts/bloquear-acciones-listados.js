/**
 * Script para bloquear botones de editar y eliminar listados para el rol usuario
 * Sigue el mismo patrón que los scripts anteriores
 */

// Definimos la función de bloqueo globalmente para acceso inmediato
function bloquearBotonesListados() {
  try {
    // Verificar rol del usuario
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    // Solo bloquear para rol usuario
    if (role === 'usuario') {
      console.log('Rol detectado:', role, '- Bloqueando botones de listados');

      // Bloquear botones de editar listados
      document.querySelectorAll('a[href^="/listados/editar/"]').forEach(function(enlace) {
        // Evitar procesar enlaces ya bloqueados
        if (enlace.getAttribute('data-blocked') === 'true') return;
        
        // Marcar como bloqueado
        enlace.setAttribute('data-blocked', 'true');
        
        // Convertir enlace a span para quitar navegación
        const span = document.createElement('span');
        span.className = enlace.className + ' opacity-50 cursor-not-allowed';
        span.innerHTML = enlace.innerHTML;
        span.title = 'NO TIENES PERMISOS PARA EDITAR LISTADOS';
        
        // Añadir icono de candado
        if (!span.querySelector('.lock-icon')) {
          const lockIcon = document.createElement('span');
          lockIcon.textContent = ' 🔒';
          lockIcon.className = 'ml-1 lock-icon';
          span.appendChild(lockIcon);
        }
        
        // Reemplazar enlace con span
        enlace.parentNode.replaceChild(span, enlace);
        
        // Añadir evento para mostrar mensaje
        span.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          alert('NO TIENES PERMISOS PARA EDITAR LISTADOS');
          return false;
        });
      });

      // Bloquear botones de eliminar listados
      document.querySelectorAll('.delete-button').forEach(function(btn) {
        // Evitar procesar botones ya bloqueados
        if (btn.getAttribute('data-blocked') === 'true') return;
        
        // Marcar como bloqueado
        btn.setAttribute('data-blocked', 'true');
        
        // Bloqueo visual
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none';
        btn.title = 'NO TIENES PERMISOS PARA ELIMINAR LISTADOS';
        
        // Icono de candado
        if (!btn.querySelector('.lock-icon')) {
          const lockIcon = document.createElement('span');
          lockIcon.textContent = ' 🔒';
          lockIcon.className = 'ml-1 lock-icon';
          btn.appendChild(lockIcon);
        }
        
        // Bloqueo funcional
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          alert('NO TIENES PERMISOS PARA ELIMINAR LISTADOS');
          return false;
        };
      });
    }
  } catch (error) {
    console.error('Error en script de bloqueo de botones de listados:', error);
  }
}

// Ejecución inmediata - no espera a DOMContentLoaded
(function() {
  bloquearBotonesListados();
})();

// También ejecutar en DOMContentLoaded para capturar botones cargados en ese momento
document.addEventListener('DOMContentLoaded', function() {
  bloquearBotonesListados();
});

// Y también cuando todo esté cargado completamente
window.addEventListener('load', function() {
  bloquearBotonesListados();
});

// Ejecutar también después de cambios en el DOM
const observer = new MutationObserver(function() {
  bloquearBotonesListados();
});

// Iniciar observación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  observer.observe(document.body, { childList: true, subtree: true });
});
