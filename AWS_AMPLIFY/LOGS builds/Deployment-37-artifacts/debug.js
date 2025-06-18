// Archivo de diagnóstico extremo para Masclet Imperi
// Se ejecuta en todas las páginas y muestra información incluso si hay fallos

console.log('[DEBUG] Iniciando script de diagnóstico extremo');

// Función para crear elementos de diagnóstico visibles en la página
function createDebugDisplay() {
  // Crear contenedor de diagnóstico
  const debugContainer = document.createElement('div');
  debugContainer.id = 'debug-container';
  debugContainer.style.cssText = `
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    background-color: rgba(255,0,0,0.8); 
    color: white; 
    font-family: monospace; 
    padding: 10px; 
    z-index: 99999; 
    max-height: 50vh; 
    overflow-y: auto;
  `;
  
  // Insertar al inicio del body
  document.body.insertBefore(debugContainer, document.body.firstChild);
  
  // Función para añadir logs visibles
  window.debugLog = function(message) {
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toISOString().substr(11, 8)}: ${message}`;
    debugContainer.appendChild(logEntry);
    console.log('[VISUAL-DEBUG]', message);
  };
  
  return debugContainer;
}

// Ejecutar tan pronto como sea posible
function initDebug() {
  try {
    const debugContainer = createDebugDisplay();
    
    // Mostrar información básica
    window.debugLog('DEBUG MASCLET-IMPERI ACTIVADO');
    window.debugLog(`URL: ${window.location.href}`);
    
    // Verificar estado del DOM
    window.debugLog(`Estado del DOM: ${document.readyState}`);
    
    // Comprobar el div#app
    const appDiv = document.getElementById('app');
    if (appDiv) {
      window.debugLog(`div#app encontrado - childNodes: ${appDiv.childNodes.length}`);
      window.debugLog(`div#app innerHTML length: ${appDiv.innerHTML.length}`);
      window.debugLog(`div#app estilos: ${window.getComputedStyle(appDiv).cssText.substring(0, 100)}...`);
    } else {
      window.debugLog('⚠️ div#app NO ENCONTRADO');
    }
    
    // Verificar elementos críticos
    const navbar = document.querySelector('.navbar');
    window.debugLog(`Navbar: ${navbar ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    
    const sidebar = document.querySelector('.sidebar');
    window.debugLog(`Sidebar: ${sidebar ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    
    // Mostrar componentes React/Astro registrados
    window.debugLog(`Componentes React: ${window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ? 'disponibles' : 'no disponibles'}`);
    window.debugLog(`Astro: ${window.Astro ? 'disponible' : 'no disponible'}`);
    
    // Verificar scripts cargados
    const scripts = document.querySelectorAll('script');
    window.debugLog(`Scripts cargados: ${scripts.length}`);
    
    // Mostrar estructura DOM simplificada
    function simplifiedDOMStructure(node, level = 0) {
      if (level > 3) return '...'; // Limitar profundidad
      
      let result = node.nodeName;
      if (node.id) result += `#${node.id}`;
      if (node.className && typeof node.className === 'string') result += `.${node.className.replace(/\s+/g, '.')}`;
      
      if (node.childNodes && node.childNodes.length > 0) {
        result += ' > [' + Array.from(node.childNodes)
          .filter(child => child.nodeType === 1) // Solo elementos
          .map(child => simplifiedDOMStructure(child, level + 1))
          .join(', ') + ']';
      }
      
      return result;
    }
    
    window.debugLog(`DOM simplificado: ${simplifiedDOMStructure(document.body)}`);
    
  } catch (error) {
    console.error('Error en initDebug:', error);
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = 'position:fixed;top:0;left:0;background:red;color:white;z-index:99999;';
    errorContainer.textContent = `ERROR DIAGNÓSTICO: ${error.message}`;
    document.body.appendChild(errorContainer);
  }
}

// Ejecutar inmediatamente y también después de que cargue el DOM
try {
  initDebug();
  document.addEventListener('DOMContentLoaded', () => {
    window.debugLog('DOMContentLoaded disparado');
    
    // Comprobar nuevamente después de DOMContentLoaded
    setTimeout(() => {
      const appDiv = document.getElementById('app');
      if (appDiv) {
        window.debugLog(`div#app después de DOMContentLoaded - childNodes: ${appDiv.childNodes.length}`);
      }
    }, 100);
  });
  
  // Verificar después de LOAD completo
  window.addEventListener('load', () => {
    window.debugLog('Evento LOAD disparado');
    
    // 1 segundo después de carga completa
    setTimeout(() => {
      const appDiv = document.getElementById('app');
      if (appDiv) {
        window.debugLog(`div#app después de LOAD (1s) - childNodes: ${appDiv.childNodes.length}`);
      }
      
      // Forzar visualización de contenido oculto
      window.debugLog('Intentando forzar visualización de contenido...');
      document.querySelectorAll('*').forEach(el => {
        if (window.getComputedStyle(el).display === 'none') {
          window.debugLog(`Elemento oculto: ${el.nodeName}${el.id ? '#'+el.id : ''}`);
        }
      });
    }, 1000);
  });
} catch (e) {
  console.error('Error inicial en debug.js:', e);
}
