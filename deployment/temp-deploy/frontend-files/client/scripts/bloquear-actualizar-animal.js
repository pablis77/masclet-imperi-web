/**
 * Script para bloquear enlaces de actualizar animales para el rol usuario
 * Sigue el mismo patrón que los scripts anteriores pero adaptado para enlaces
 * Optimizado para ejecución inmediata y rápida
 */

// Definimos la función de bloqueo globalmente para poder acceder desde cualquier parte
function bloquearEnlaces() {
  // Seleccionar enlaces de actualizar - pueden estar en varias tablas
  const enlaces = document.querySelectorAll('a[href*="/animals/update/"]');
  
  enlaces.forEach(function(enlace) {
    // Evitar procesar enlaces ya bloqueados
    if (enlace.getAttribute('data-blocked') === 'true') return;
    
    // Marcar como bloqueado
    enlace.setAttribute('data-blocked', 'true');
    
    // Convertir enlace a span para quitar navegación
    const span = document.createElement('span');
    span.className = enlace.className + ' opacity-50 cursor-not-allowed';
    span.innerHTML = enlace.innerHTML;
    span.title = 'NO TIENES PERMISOS PARA ACTUALIZAR ANIMALES';
    
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
      alert('NO TIENES PERMISOS PARA ACTUALIZAR ANIMALES');
      return false;
    });
  });
}

// Función principal - ejecutada inmediatamente
(function() {
  try {
    // Verificar rol del usuario
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    // Solo bloquear para rol usuario (editor sí puede actualizar)
    if (role === 'usuario') {
      console.log('Rol detectado:', role, '- Bloqueando enlaces actualizar animal');
      
      // Ejecutar bloqueo inicial - inmediatamente
      bloquearEnlaces();
      
      // Verificar periódicamente por nuevos enlaces (intervalo más corto)
      setInterval(bloquearEnlaces, 500);
    }
  } catch (error) {
    console.error('Error en script de bloqueo de enlaces actualizar:', error);
  }
})();

// También ejecutar tan pronto como el DOM esté disponible
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Volver a ejecutar la función de bloqueo
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    if (role === 'usuario') {
      // Ejecutar bloqueo de nuevo
      bloquearEnlaces();
    }
  } catch (error) {
    console.error('Error en la ejecución DOMContentLoaded:', error);
  }
});

// Y una vez más cuando todo esté cargado
window.addEventListener('load', function() {
  try {
    // Volver a ejecutar la función de bloqueo
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    if (role === 'usuario') {
      // Ejecutar bloqueo de nuevo
      bloquearEnlaces();
    }
  } catch (error) {
    console.error('Error en la ejecución load:', error);
  }
});
