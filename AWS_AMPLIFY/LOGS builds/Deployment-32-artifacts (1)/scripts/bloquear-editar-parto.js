/**
 * Script para bloquear botones de editar parto para el rol usuario
 * Sigue el mismo patrón que el script de bloqueo de eliminar parto
 */
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Verificar rol del usuario
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || '').toLowerCase();
    
    // Solo bloquear para rol usuario (editor y gerente sí pueden editar)
    if (role === 'usuario') {
      console.log('Rol detectado:', role, '- Bloqueando botones editar parto');
      
      // Función para bloquear botones
      function bloquearBotones() {
        // Seleccionar por título específico
        const botones = document.querySelectorAll('button[title="Editar información del parto"]');
        
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
          btn.title = 'NO TIENES PERMISOS PARA EDITAR PARTOS';
          
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
            alert('NO TIENES PERMISOS PARA EDITAR PARTOS');
            return false;
          };
        });
      }
      
      // Ejecutar bloqueo inicial
      bloquearBotones();
      
      // Verificar periódicamente por nuevos botones
      setInterval(bloquearBotones, 1000);
    }
  } catch (error) {
    console.error('Error en script de bloqueo de botones de editar parto:', error);
  }
});
