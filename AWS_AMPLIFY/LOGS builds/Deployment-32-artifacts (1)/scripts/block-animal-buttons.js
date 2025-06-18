// Script para bloquear botones específicos (Nuevo Animal, Eliminar, etc.)
(function() {
  // Variables para controlar estados de bloqueo
  let bloqueoNuevoAnimalAplicado = false;
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
      console.error('Error al obtener rol:', e);
      return 'guest';
    }
  }
  
  // Función específica para bloquear botón de nuevo animal
  function bloquearBotonNuevoAnimal() {
    if (bloqueoNuevoAnimalAplicado) return true;
    
    const rolUsuario = obtenerRolUsuario().toLowerCase();
    // Solo bloquear para roles editor y usuario
    if (rolUsuario !== 'editor' && rolUsuario !== 'usuario') return true;
    
    // Buscar el botón específico de nuevo animal
    const botonNuevoAnimal = document.querySelector('a[href="/animals/new"]');
    if (!botonNuevoAnimal) {
      console.log('Botón "Nuevo Animal" no encontrado, intento:', intentos);
      return false;
    }
    
    console.log('Aplicando bloqueo a botón Nuevo Animal para rol:', rolUsuario);
    
    // Eliminar href original
    botonNuevoAnimal.setAttribute('href', '#');
    
    // Aplicar atributo disabled
    botonNuevoAnimal.setAttribute('disabled', 'disabled');
    
    // Aplicar estilos inline directos (EXACTAMENTE IGUAL que el botón eliminar)
    botonNuevoAnimal.setAttribute('style', 'opacity: 0.5; cursor: not-allowed; pointer-events: none;');
    
    // Añadir clases CSS
    botonNuevoAnimal.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Añadir título explicativo
    botonNuevoAnimal.setAttribute('title', 'No tienes permisos para crear nuevos animales');
    
    // Prevenir clic 
    botonNuevoAnimal.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Clic bloqueado en botón Nuevo Animal');
      return false;
    };
    
    // Añadir icono de candado
    if (!botonNuevoAnimal.querySelector('.lock-icon')) {
      const lockIcon = document.createElement('span');
      lockIcon.innerHTML = ' 🔒';
      lockIcon.className = 'lock-icon';
      botonNuevoAnimal.appendChild(lockIcon);
    }
    
    bloqueoNuevoAnimalAplicado = true;
    console.log('Botón "Nuevo Animal" bloqueado exitosamente');
    return true;
  }
  
  // Función principal para aplicar todas las restricciones
  function aplicarRestricciones() {
    intentos++;
    
    if (intentos > MAX_INTENTOS) {
      console.log('Máximo de intentos alcanzado, cancelando restricciones');
      return;
    }
    
    // Obtener rol de usuario
    const rolUsuario = obtenerRolUsuario().toLowerCase();
    console.log(`Aplicando restricciones para rol: ${rolUsuario} (intento ${intentos})`);
    
    // Aplicar restricciones según el rol
    if (rolUsuario === 'editor' || rolUsuario === 'usuario') {
      const exito = bloquearBotonNuevoAnimal();
      
      if (!exito) {
        // Si no tuvo éxito, programar otro intento
        console.log('Reintentando en 200ms...');
        setTimeout(aplicarRestricciones, 200);
      }
    }
  }
  
  // Ejecutar inmediatamente
  aplicarRestricciones();
  
  // Ejecutar cuando se cargue el DOM
  document.addEventListener('DOMContentLoaded', aplicarRestricciones);
  
  // Ejecutar cuando la ventana termine de cargar
  window.addEventListener('load', aplicarRestricciones);
  
  // Para navegación SPA (Astro)
  document.addEventListener('astro:page-load', aplicarRestricciones);
  document.addEventListener('astro:after-swap', aplicarRestricciones);
  
  // Ejecutar periódicamente durante los primeros segundos
  for (let i = 1; i <= 5; i++) {
    setTimeout(aplicarRestricciones, i * 1000);
  }
})();
