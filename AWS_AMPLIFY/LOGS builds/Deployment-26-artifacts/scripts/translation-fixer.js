/**
 * Script para corregir problemas de traducción en páginas específicas
 * Este archivo implementa una solución JavaScript del lado del cliente
 * para garantizar que las traducciones se apliquen correctamente en toda la aplicación
 */

// Traducciones en catalán para las secciones problemáticas
const catalanTranslations = {
  // Pestañas principales
  'Datos Generales': 'Dades Generals',
  'Cambios Habituales': 'Canvis Habituals',
  
  // Formulario general
  'Nombre': 'Nom',
  'Género': 'Gènere',
  'Macho': 'Mascle',
  'Hembra': 'Femella',
  'Fecha de nacimiento': 'Data de naixement',
  'Código': 'Codi',
  'Número de serie': 'Número de sèrie',
  'Explotación': 'Explotació',
  'Origen': 'Origen',
  'Padre': 'Pare',
  'Madre': 'Mare',
  'Observaciones (máx. 2000 caracteres)': 'Observacions (màx. 2000 caràcters)',
  'Añade notas o información adicional sobre el animal': 'Afegeix notes o informació addicional sobre l\'animal',
  'Los campos marcados con borde azul indican cambios pendientes de guardar.': 'Els camps marcats amb vora blava indiquen canvis pendents de guardar.',
  
  // Formulario habituales
  'Estado y Amamantamiento': 'Estat i Alletament',
  'Estado': 'Estat',
  'Activo': 'Actiu',
  'Fallecido': 'Mort',
  'Estado de amamantamiento': 'Estat d\'alletament',
  'No amamanta': 'No alleta',
  'Un ternero': 'Un vedell',
  'Dos terneros': 'Dos vedells',
  
  // Botones
  'Volver': 'Tornar',
  'Ver Detalle': 'Veure Detall',
  'Guardar Cambios': 'Guardar Canvis',
  'Eliminar Animal': 'Eliminar Animal',
  
  // Ficha principal
  'Ficha de Animal': 'Fitxa d\'Animal',
  'ID': 'ID',
  
  // Modal de confirmación
  'Confirmar eliminación': 'Confirmar eliminació',
  '¿Estás seguro de que quieres eliminar este animal? Esta acción no se puede deshacer.': 'Estàs segur que vols eliminar aquest animal? Aquesta acció no es pot desfer.'
};

// Inicializar el corrector de traducciones
document.addEventListener('DOMContentLoaded', function() {
  // Detectar el idioma actual
  const currentLang = localStorage.getItem('userLanguage');
  console.log('[TranslationFixer] Idioma detectado:', currentLang);
  
  // Solo aplicar traducciones si el idioma es catalán
  if (currentLang === 'ca') {
    console.log('[TranslationFixer] Aplicando traducciones en catalán');
    applyTranslations();
    
    // Observer para detectar cambios en el DOM y aplicar traducciones a elementos nuevos
    const observer = new MutationObserver(function(mutations) {
      applyTranslations();
    });
    
    // Configurar el observer para observar cambios en el árbol DOM
    observer.observe(document.body, { 
      childList: true,
      subtree: true
    });
  }
});

// Función para aplicar traducciones
function applyTranslations() {
  // Obtener todos los nodos de texto en la página
  const textNodes = [];
  const walk = document.createTreeWalker(
    document.body, 
    NodeFilter.SHOW_TEXT, 
    null, 
    false
  );
  
  let node;
  while(node = walk.nextNode()) {
    if (node.nodeValue.trim() !== '') {
      textNodes.push(node);
    }
  }
  
  // Traducir cada nodo de texto
  textNodes.forEach(node => {
    let text = node.nodeValue;
    let translated = false;
    
    // Buscar coincidencias exactas
    Object.keys(catalanTranslations).forEach(key => {
      if (text.includes(key)) {
        text = text.replace(new RegExp(key, 'g'), catalanTranslations[key]);
        translated = true;
      }
    });
    
    // Actualizar el nodo si se ha traducido
    if (translated) {
      node.nodeValue = text;
    }
  });
  
  // Traducir también atributos (placeholder, title, etc)
  const elements = document.querySelectorAll('[placeholder], [title], [aria-label]');
  elements.forEach(el => {
    // Traducir placeholder
    if (el.hasAttribute('placeholder')) {
      const placeholder = el.getAttribute('placeholder');
      if (catalanTranslations[placeholder]) {
        el.setAttribute('placeholder', catalanTranslations[placeholder]);
      }
    }
    
    // Traducir title
    if (el.hasAttribute('title')) {
      const title = el.getAttribute('title');
      if (catalanTranslations[title]) {
        el.setAttribute('title', catalanTranslations[title]);
      }
    }
    
    // Traducir aria-label
    if (el.hasAttribute('aria-label')) {
      const ariaLabel = el.getAttribute('aria-label');
      if (catalanTranslations[ariaLabel]) {
        el.setAttribute('aria-label', catalanTranslations[ariaLabel]);
      }
    }
  });
  
  console.log('[TranslationFixer] Traducciones aplicadas');
}
