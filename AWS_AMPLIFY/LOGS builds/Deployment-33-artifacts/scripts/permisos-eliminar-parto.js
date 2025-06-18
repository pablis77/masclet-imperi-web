/**
 * Script unificado para bloquear botones de eliminar parto
 * Basado en la implementación documentada en implementacion_permisos.md
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Verificando permisos para botones de eliminar parto...');
  
  // Comprobar rol de usuario
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role.toLowerCase();
      
      // Solo bloquear para roles editor y usuario
      if (role === 'editor' || role === 'usuario') {
        console.log('BLOQUEANDO BOTONES ELIMINAR PARTO PARA ROL:', role);
        
        // Función para bloquear botones
        function bloquearBotones() {
          // Buscar todos los botones de eliminar parto (por título o texto)
          const botones = document.querySelectorAll('button[title="Eliminar parto"], button:contains("Eliminar")');
          
          if (botones.length > 0) {
            console.log(`Encontrados ${botones.length} botones de eliminar parto para bloquear`);
            
            botones.forEach(btn => {
              // Si ya está bloqueado, saltar
              if (btn.getAttribute('data-blocked') === 'true') return;
              
              // Aplicar bloqueo visual
              btn.disabled = true;
              btn.style.opacity = '0.5';
              btn.style.cursor = 'not-allowed';
              btn.style.pointerEvents = 'none';
              btn.title = 'NO TIENES PERMISOS PARA ELIMINAR PARTOS';
              btn.setAttribute('data-blocked', 'true');
              
              // Añadir icono de candado
              if (!btn.querySelector('.lock-icon')) {
                const lockIcon = document.createElement('span');
                lockIcon.textContent = ' 🔒';
                lockIcon.className = 'ml-1 lock-icon';
                btn.appendChild(lockIcon);
              }
              
              // Reemplazar evento click
              const originalClick = btn.onclick;
              btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                alert('NO TIENES PERMISOS PARA ELIMINAR PARTOS');
                return false;
              };
            });
          }
        }
        
        // Ejecutar bloqueo inmediatamente
        bloquearBotones();
        
        // Configurar observer para detectar cambios en la tabla
        const tablaPartos = document.getElementById('tabla-partos-body');
        if (tablaPartos) {
          const observer = new MutationObserver(function() {
            console.log('Detectados cambios en tabla de partos, reaplicando bloqueos...');
            bloquearBotones();
          });
          
          observer.observe(tablaPartos, { childList: true, subtree: true });
        }
        
        // También observar el cuerpo del documento para capturar botones añadidos dinámicamente
        const observer = new MutationObserver(function(mutations) {
          let debeVerificar = false;
          
          mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
              debeVerificar = true;
            }
          });
          
          if (debeVerificar) {
            setTimeout(bloquearBotones, 100);
          }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Verificar también al cambiar de pestaña
        document.addEventListener('click', function(e) {
          if (e.target && e.target.closest('#tab-partos')) {
            setTimeout(bloquearBotones, 100);
          }
        });
      }
    }
  } catch (e) {
    console.error('Error al verificar permisos para botones de eliminar parto:', e);
  }
});
