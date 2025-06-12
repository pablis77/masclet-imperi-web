
      // Esta función se ejecutará cuando el componente React esté listo
      document.addEventListener('astro:page-load', () => {
        // Escuchar el evento personalizado para mostrar el modal
        document.addEventListener('show-password-error', () => {
          // Buscar el elemento modal por su ID
          const modal = document.getElementById('passwordErrorModal');
          if (modal) {
            // Enviar mensaje al componente React para cambiar su estado
            const event = new CustomEvent('update-modal-state', { 
              detail: { isOpen: true } 
            });
            modal.dispatchEvent(event);
          }
        });
      });
    