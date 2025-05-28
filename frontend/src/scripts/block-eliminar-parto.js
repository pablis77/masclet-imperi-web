/**
 * Script sencillo para bloquear botones de eliminar parto
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Script de bloqueo de eliminar parto cargado');
  
  try {
    // Verificar si el usuario tiene rol de editor o usuario
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    if (role === 'editor' || role === 'usuario') {
      console.log('Rol detectado:', role, '- Bloqueando botones eliminar parto');
      
      // Función para bloquear botones
      function bloquearBotones() {
        // Solo seleccionar por atributo title
        const botones = document.querySelectorAll('button[title="Eliminar parto"]');
        
        if (botones.length > 0) {
          console.log('Encontrados', botones.length, 'botones para bloquear');
          
          botones.forEach(function(btn) {
            // Evitar procesar botones ya bloqueados
            if (btn.getAttribute('data-blocked')) return;
            
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
      }
      
      // Ejecutar bloqueo inicial
      bloquearBotones();
      
      // Verificar periódicamente nuevos botones
      setInterval(bloquearBotones, 1000);
      
      // También verificar al cambiar de pestaña
      document.addEventListener('click', function(e) {
        if (e.target && e.target.closest('#tab-partos')) {
          setTimeout(bloquearBotones, 200);
        }
      });
    }
  } catch (error) {
    console.error('Error en script de bloqueo de botones:', error);
  }
});
