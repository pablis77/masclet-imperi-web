
document.addEventListener('DOMContentLoaded', () => {
  const welcomeElement = document.querySelector('h1.welcome-title');
  if (welcomeElement) {
    // Actualizar título cuando cambie el idioma
    const updateTitle = () => {
      const lang = localStorage.getItem('userLanguage') || 'es';
      
      // Usar valores predeterminados garantizados según el idioma
      // Esto asegura que siempre se muestre correctamente incluso si falla la traducción
      let welcomeText = 'Bienvenido a Masclet Imperi';
      if (lang === 'ca') {
        welcomeText = 'Benvingut a Masclet Imperi';
      }
      
      // Intentar obtener traducciones desde la API i18n como respaldo
      try {
        const i18n = window.i18next || { t: (key) => key };
        const translatedText = i18n.t('common.welcome');
        // Solo usar la traducción si no es igual a la clave (indica que la traducción funcionó)
        if (translatedText && translatedText !== 'common.welcome') {
          welcomeText = translatedText;
        }
      } catch (error) {
        console.warn('Error al traducir texto de bienvenida:', error);
      }
      
      // Aplicar el texto
      welcomeElement.textContent = welcomeText;
    };
    
    // Actualizar inmediatamente
    updateTitle();
    
    // Escuchar cambios en el almacenamiento
    window.addEventListener('storage', (event) => {
      if (event.key === 'userLanguage') {
        updateTitle();
      }
    });
  }
});
