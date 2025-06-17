/**
 * Script simple para bloquear botones de eliminar parto
 */
// Definimos la función de bloqueo globalmente para acceso inmediato
function bloquearBotones() {
  // Seleccionar por título específico
  const botones = document.querySelectorAll('button[title="Eliminar parto"]');
  
  botones.forEach(function(btn) {
    // Evitar procesar botones ya bloqueados
    if (btn.getAttribute('data-blocked') === 'true') return;
    
    // Marcar como bloqueado
    btn.setAttribute('data-blocked', 'true');
    
    // Bloqueo visual
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    btn.style.pointerEvents = 'none';
    btn.title = 'NO TIENES PERMISOS PARA ELIMINAR PARTOS';
    
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
      alert('NO TIENES PERMISOS PARA ELIMINAR PARTOS');
      return false;
    };
  });
}

// Ejecución inmediata - no espera a DOMContentLoaded
(function() {
  try {
    // Verificar rol del usuario
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    // Solo bloquear para roles específicos (editor y usuario)
    if (role === 'editor' || role === 'usuario') {
      console.log('Rol detectado:', role, '- Bloqueando botones eliminar parto');
      
      // Ejecutar bloqueo inicial inmediatamente
      bloquearBotones();
      
      // Verificar periódicamente por nuevos botones (intervalo más corto)
      setInterval(bloquearBotones, 300);
    }
  } catch (error) {
    console.error('Error en script de bloqueo de botones:', error);
  }
})();

// También ejecutar en DOMContentLoaded para capturar botón cargado en ese momento
document.addEventListener('DOMContentLoaded', function() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    if (role === 'editor' || role === 'usuario') {
      // Ejecutar bloqueo inmediatamente
      bloquearBotones();
    }
  } catch (error) {
    console.error('Error en bloqueo DOMContentLoaded:', error);
  }
});

// Y también cuando todo esté cargado completamente
window.addEventListener('load', function() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    if (role === 'editor' || role === 'usuario') {
      // Ejecutar bloqueo inmediatamente
      bloquearBotones();
    }
  } catch (error) {
    console.error('Error en bloqueo window.load:', error);
  }
});

// Ejecutar también en la primera interacción del usuario
document.addEventListener('click', function() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    if (role === 'editor' || role === 'usuario') {
      // Ejecutar bloqueo inmediatamente
      bloquearBotones();
    }
  } catch (error) {
    console.error('Error en bloqueo click:', error);
  }
}, { once: true }); // Solo ejecutar una vez
