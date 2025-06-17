/**
 * Módulo para generar el contenido HTML del index.html
 * Optimizado para cargar scripts por secciones según la navegación
 */

const fs = require('fs');
const path = require('path');

// Importamos configuración de secciones desde section-loader
const { SECTIONS, detectSection } = require('./section-loader.cjs');

/**
 * Genera el HTML base para la aplicación
 * @param {string} title - Título de la página
 * @returns {string} - HTML base
 */
function generateBaseHtml(title = 'Masclet Imperi') {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Aplicación de Gestión Ganadera Masclet Imperi">
  <title>${title}</title>
  <!-- Favicon -->
  <link rel="shortcut icon" href="/favico.ico" type="image/x-icon">
  <!-- CSS Crítico -->
  <!-- MARCADOR: CSS CRÍTICO -->
  
  <!-- CSS por sección -->
  <!-- MARCADOR: CSS SECCIONES -->
</head>
<body>
  <div id="app">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando aplicación...</p>
      <noscript>
        <p class="error-message">Esta aplicación requiere JavaScript para funcionar. Por favor, habilítalo en tu navegador.</p>
      </noscript>
    </div>
  </div>
  
  <!-- Scripts críticos -->
  <!-- MARCADOR: SCRIPTS CRÍTICOS -->
  
  <!-- Scripts por sección (carga dinámica) -->
  <!-- MARCADOR: SCRIPTS SECCIONES -->
  
  <!-- Script de diagnóstico y carga -->
  <script>
    // Muestra mensajes de diagnóstico en caso de error
    window.addEventListener('error', function(e) {
      console.error('⚠️ Error en la carga:', e);
      const loadingText = document.querySelector('.loading-text');
      if (loadingText) {
        loadingText.innerHTML = 'Error al cargar la aplicación<br><small>' + 
          e.message.substring(0, 100) + '...</small>';
        loadingText.style.color = '#ff3860';
      }
    });
    
    // Reporte de inicialización correcta
    window.addEventListener('load', function() {
      console.log('✅ Aplicación cargada correctamente');
    });
  </script>
</body>
</html>`;
}

/**
 * Genera las etiquetas script HTML para los archivos JS
 * @param {Array} jsFiles - Lista de archivos JS
 * @param {string} basePath - Ruta base para los archivos
 * @returns {string} - HTML con las etiquetas script
 */
function generateScriptTags(jsFiles, basePath) {
  if (!jsFiles || jsFiles.length === 0) {
    return '<!-- No se encontraron scripts JS -->';
  }
  
  return jsFiles.map(file => {
    const filePath = path.join(basePath, file).replace(/\\/g, '/');
    return `<script src="/${filePath}" type="module"></script>`;
  }).join('\n  ');
}

/**
 * Genera las etiquetas link HTML para los archivos CSS
 * @param {Array} cssFiles - Lista de archivos CSS
 * @param {string} basePath - Ruta base para los archivos
 * @returns {string} - HTML con las etiquetas link
 */
function generateCssTags(cssFiles, basePath) {
  if (!cssFiles || cssFiles.length === 0) {
    return '<!-- No se encontraron estilos CSS -->';
  }
  
  return cssFiles.map(file => {
    const filePath = path.join(basePath, file).replace(/\\/g, '/');
    return `<link rel="stylesheet" href="/${filePath}">`;
  }).join('\n  ');
}

/**
 * Genera el código JavaScript para cargar scripts dinámicamente por sección
 * @param {Object} sectionAssets - Objeto con los assets clasificados por sección
 * @param {string} astroPath - Ruta a la carpeta _astro relativa a dist/client
 * @returns {string} - Script JS para carga dinámica
 */
function generateDynamicLoader(sectionAssets, astroPath = '_astro') {
  const sectionAssetsJSON = JSON.stringify(sectionAssets, null, 2);
  
  return `<script>
  // Assets organizados por sección
  const SECTION_ASSETS = ${sectionAssetsJSON};
  
  // Ruta base para los assets
  const BASE_PATH = '${astroPath}';
  
  // Función para cargar un script dinámicamente
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  
  // Función para cargar un CSS dinámicamente
  function loadCSS(href) {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      document.head.appendChild(link);
    });
  }
  
  // Función para cargar assets de una sección específica
  async function loadSectionAssets(sectionName) {
    if (!SECTION_ASSETS[sectionName]) {
      console.warn('⚠️ Sección no encontrada:', sectionName);
      return;
    }
    
    const section = SECTION_ASSETS[sectionName];
    
    // Cargar CSS
    if (section.css && section.css.length > 0) {
      for (const cssFile of section.css) {
        await loadCSS('/' + BASE_PATH + '/' + cssFile);
        console.log('✅ CSS cargado:', cssFile);
      }
    }
    
    // Cargar JS
    if (section.js && section.js.length > 0) {
      for (const jsFile of section.js) {
        await loadScript('/' + BASE_PATH + '/' + jsFile);
        console.log('✅ Script cargado:', jsFile);
      }
    }
  }
  
  // Detectar sección actual basado en la ruta
  function detectCurrentSection() {
    const path = window.location.pathname;
    
    if (path.includes('/login')) {
      return 'LOGIN';
    } else if (path.includes('/explotacion')) {
      return 'EXPLOTACIONES';
    } else if (path.includes('/animal')) {
      return 'ANIMALES';
    } else if (path.includes('/listado')) {
      return 'LISTADOS';
    } else if (path.includes('/user')) {
      return 'USUARIOS';
    } else if (path.includes('/import')) {
      return 'IMPORTACION';
    } else if (path.includes('/backup')) {
      return 'BACKUPS';
    } else {
      // Por defecto cargar dashboard
      return 'DASHBOARD';
    }
  }
  
  // Cargar assets de la sección actual
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const currentSection = detectCurrentSection();
      console.log('🔍 Sección detectada:', currentSection);
      await loadSectionAssets(currentSection);
      console.log('✅ Assets de la sección cargados correctamente');
    } catch (error) {
      console.error('❌ Error al cargar assets de sección:', error);
    }
  });
</script>`;
}

/**
 * Filtra los assets por sección según listas exactas de archivos
 * @param {Object} foundAssets - Assets encontrados
 * @returns {Object} - Assets organizados por sección
 */
function organizeAssetsBySections(foundAssets) {
  const result = {};
  
  // Organizar assets CSS por sección
  Object.entries(SECTIONS).forEach(([sectionName, sectionConfig]) => {
    result[sectionName] = { js: [], css: [] };
    
    // Filtrar CSS de la sección
    if (sectionConfig.cssPattern && foundAssets.cssFiles) {
      result[sectionName].css = foundAssets.cssFiles.filter(file => {
        return sectionConfig.cssPattern.test(file);
      });
    }
    
    // Filtrar JS de la sección usando jsFiles (listas explícitas)
    if (sectionConfig.jsFiles && Array.isArray(sectionConfig.jsFiles) && foundAssets.jsFiles) {
      // Para archivos JS clasificados
      ['vendorFiles', 'configFiles', 'serviceFiles', 'clientFiles', 'otherFiles'].forEach(category => {
        if (foundAssets[category]) {
          const matchingFiles = foundAssets[category].filter(file => {
            return sectionConfig.jsFiles.some(jsFile => {
              return file.includes(jsFile);
            });
          });
          result[sectionName].js.push(...matchingFiles);
        }
      });
      
      // Para archivos JS generales
      if (foundAssets.jsFiles) {
        const matchingGeneralFiles = foundAssets.jsFiles.filter(file => {
          return sectionConfig.jsFiles.some(jsFile => {
            return file.includes(jsFile);
          });
        });
        
        // Añadir solo archivos que no estén ya incluidos
        matchingGeneralFiles.forEach(file => {
          if (!result[sectionName].js.includes(file)) {
            result[sectionName].js.push(file);
          }
        });
      }
    }
  });
  
  return result;
}

/**
 * Genera el HTML completo para la aplicación
 * @param {Object} organizedAssets - Assets ya organizados por sección por section-loader.cjs
 * @returns {string} - Contenido HTML completo
 */
function generateHtml(organizedAssets) {
  // Generar HTML base
  let html = generateBaseHtml();
  
  // Extraer ruta de los assets (originalmente en foundAssets)
  const astroPath = organizedAssets.astroPath || '_astro';
  
  // Buscar la clave 'core' o 'CORE' - Arreglo IMPLEMENTACIÓN 27
  const coreKey = 'core' in organizedAssets ? 'core' : ('CORE' in organizedAssets ? 'CORE' : null);
  
  // Obtener CSS y scripts críticos
  let coreCSS = '<!-- No se encontraron estilos CSS core -->';
  let coreScripts = '<!-- No se encontraron scripts JS core -->';
  
  if (coreKey) {
    // Generar tags para CSS crítico
    if (organizedAssets[coreKey]?.css?.length > 0) {
      coreCSS = generateCssTags(organizedAssets[coreKey].css, astroPath);
    }
    
    // Generar tags para scripts críticos 
    if (organizedAssets[coreKey]?.js?.length > 0) {
      coreScripts = generateScriptTags(organizedAssets[coreKey].js, astroPath);
      console.log(`✅ Generados ${organizedAssets[coreKey].js.length} scripts core`);
    } else {
      console.error('⚠️ No se encontraron scripts JS core');
    }
  } else {
    console.error('⚠️ No se encontró sección core/CORE en los assets');
  }
  
  // Insertar en el HTML
  html = html.replace('<!-- MARCADOR: CSS CRÍTICO -->', coreCSS);
  html = html.replace('<!-- MARCADOR: SCRIPTS CRÍTICOS -->', coreScripts);
  
  // Generar cargador dinámico para scripts de sección
  const dynamicLoader = generateDynamicLoader(organizedAssets, astroPath);
  html = html.replace('<!-- MARCADOR: SCRIPTS SECCIONES -->', dynamicLoader);
  
  return html;
}

// Esta exportación se traslada al final del archivo

/**
 * Clasifica los scripts según su nombre para carga optimizada
 * @param {Array} jsFiles - Array de archivos JS
 * @return {Object} - Object con scripts clasificados
 */
function classifyScripts(jsFiles) {
  if (!jsFiles || !jsFiles.length) return {};
  
  const classified = {
    vendors: [],    // Scripts de bibliotecas externas
    config: [],     // Scripts de configuración
    services: [],   // Scripts de servicios (API, auth, etc)
    core: [],       // Scripts principales de la aplicación
    components: [], // Scripts de componentes UI
    sections: {},   // Scripts por sección (login, dashboard, etc)
    other: []       // Otros scripts no clasificados
  };
  
  // Inicializar secciones
  Object.keys(SECTIONS).forEach(section => {
    if (section !== 'CORE') {
      classified.sections[section] = [];
    }
  });
  
  // Clasificar cada script
  jsFiles.forEach(file => {
    const fileName = file.split('/').pop().toLowerCase();
    
    // 1. Detectar vendors
    if (fileName.includes('vendor.')) {
      classified.vendors.push(file);
      return;
    }
    
    // 2. Detectar config
    if (fileName.includes('config.') || fileName.includes('apiconfig')) {
      classified.config.push(file);
      return;
    }
    
    // 3. Detectar servicios
    if (fileName.includes('service') || fileName.includes('api.')) {
      classified.services.push(file);
      return;
    }
    
    // 4. Detectar scripts por sección
    let assigned = false;
    
    // Para cada sección (excepto CORE)
    Object.entries(SECTIONS).forEach(([sectionName, sectionConfig]) => {
      if (sectionName === 'CORE') return;
      
      // Verificar si el archivo coincide con algún patrón de la sección
      if (sectionConfig.jsPatterns && Array.isArray(sectionConfig.jsPatterns)) {
        const matches = sectionConfig.jsPatterns.some(pattern => 
          fileName.includes(pattern.toLowerCase())
        );
        
        if (matches) {
          classified.sections[sectionName].push(file);
          assigned = true;
          return;
        }
      }
    });
    
    if (assigned) return;
    
    // 5. Detectar client o core
    if (fileName.includes('client.')) {
      classified.core.push(file);
      return;
    }
    
    // 6. El resto va a otros
    classified.other.push(file);
  });
  
  return classified;
}

/**
 * Clasifica los CSS según su nombre
 * @param {Array} cssFiles - Array de archivos CSS
 * @return {Object} - Object con CSS clasificados
 */
function classifyStyles(cssFiles) {
  if (!cssFiles || !cssFiles.length) return {};
  
  const classified = {
    main: [],       // CSS principales
    sections: {},   // CSS por sección
    other: []       // Otros CSS
  };
  
  // Inicializar secciones
  Object.keys(SECTIONS).forEach(section => {
    if (section !== 'CORE') {
      classified.sections[section] = [];
    }
  });
  
  // Clasificar cada CSS
  cssFiles.forEach(file => {
    const fileName = file.split('/').pop().toLowerCase();
    
    // 1. Detectar main/vendor CSS
    if (fileName.includes('index.') || fileName.includes('vendor.')) {
      classified.main.push(file);
      return;
    }
    
    // 2. Detectar CSS por sección
    let assigned = false;
    
    // Para cada sección (excepto CORE)
    Object.entries(SECTIONS).forEach(([sectionName, sectionConfig]) => {
      if (sectionName === 'CORE') return;
      
      if (sectionConfig.cssPatterns && Array.isArray(sectionConfig.cssPatterns)) {
        const matches = sectionConfig.cssPatterns.some(pattern => 
          fileName.includes(pattern.toLowerCase())
        );
        
        if (matches) {
          classified.sections[sectionName].push(file);
          assigned = true;
          return;
        }
      }
    });
    
    if (assigned) return;
    
    // 3. El resto va a otros
    classified.other.push(file);
  });
  
  // 1. Scripts de vendor (bibliotecas, etc)
  if (assets.allVendorJs && assets.allVendorJs.length > 0) {
    scriptTags += '\n  <!-- VENDOR: Bibliotecas y dependencias -->\n';
    assets.allVendorJs.forEach(jsFile => {
      const id = `vendor-${jsFile.split('/').pop().replace('.js', '')}`;
      scriptTags += `  <script type="module" src="${jsFile}" id="${id}" onload="scriptLoaded()"></script>\n`;
    });
  }
  
  // 2. Scripts de configuración
  if (assets.allConfigJs && assets.allConfigJs.length > 0) {
    scriptTags += '\n  <!-- CONFIG: Archivos de configuración -->\n';
    assets.allConfigJs.forEach(jsFile => {
      const id = `config-${jsFile.split('/').pop().replace('.js', '')}`;
      scriptTags += `  <script type="module" src="${jsFile}" id="${id}" onload="scriptLoaded()"></script>\n`;
    });
  }
  
  // 3. Scripts de servicios
  if (assets.allServiceJs && assets.allServiceJs.length > 0) {
    scriptTags += '\n  <!-- SERVICES: Servicios de la aplicación -->\n';
    assets.allServiceJs.forEach(jsFile => {
      const id = `service-${jsFile.split('/').pop().replace('.js', '')}`;
      scriptTags += `  <script type="module" src="${jsFile}" id="${id}" onload="scriptLoaded()"></script>\n`;
    });
  }
  
  // 4. Scripts cliente principal
  if (assets.allClientJs && assets.allClientJs.length > 0) {
    scriptTags += '\n  <!-- CLIENT: Scripts principales de la aplicación -->\n';
    assets.allClientJs.forEach(jsFile => {
      const id = `client-${jsFile.split('/').pop().replace('.js', '')}`;
      scriptTags += `  <script type="module" src="${jsFile}" id="${id}" onload="scriptLoaded()"></script>\n`;
    });
  }
  
  // 5. Otros scripts
  if (assets.allOtherJs && assets.allOtherJs.length > 0) {
    scriptTags += '\n  <!-- OTHER: Scripts adicionales -->\n';
    assets.allOtherJs.forEach(jsFile => {
      const id = `other-${jsFile.split('/').pop().replace('.js', '')}`;
      scriptTags += `  <script type="module" src="${jsFile}" id="${id}" onload="scriptLoaded()"></script>\n`;
    });
  }
  
  // Si no se encontraron scripts clasificados, añadir scripts críticos directamente
  if (!scriptTags && assets.required) {
    scriptTags += '\n  <!-- SCRIPTS PRINCIPALES NO CLASIFICADOS -->\n';
    Object.entries(assets.required).forEach(([key, path]) => {
      if (path.endsWith('.js')) {
        scriptTags += `  <script type="module" src="${path}" id="${key}" onload="scriptLoaded()"></script>\n`;
      }
    });
  }
  
  return scriptTags;
}

/**
 * Genera tags de link para los archivos CSS
 * @param {Object} assets - Objeto con los assets encontrados
 * @returns {string} - HTML con los tags de link
 */
function generateCssTags(assets) {
  let cssTags = '';
  
  // Añadir estilos principales si existen
  if (assets.allCss && assets.allCss.length > 0) {
    cssTags += '\n  <!-- ESTILOS CSS -->\n';
    assets.allCss.forEach(cssFile => {
      cssTags += `  <link rel="stylesheet" href="${cssFile}">\n`;
    });
  }
  
  // Si no hay estilos clasificados pero hay requeridos, añadirlos directamente
  if (!cssTags && assets.required) {
    Object.entries(assets.required).forEach(([key, path]) => {
      if (path.endsWith('.css')) {
        cssTags += `  <link rel="stylesheet" href="${path}" id="${key}">\n`;
      }
    });
  }
  
  return cssTags;
}

/**
 * Genera el contenido completo del index.html
 * @param {Object} assets - Objeto con los assets encontrados
 * @returns {string} - Contenido del index.html
 */
function generateHtmlContent(assets) {
  const missingFiles = assets.missing || [];
  const scriptTags = generateScriptTags(assets);
  const cssTags = generateCssTags(assets);
  
  // Calcular totalScripts para el contador de carga
  let totalScripts = 0;
  if (assets.allVendorJs) totalScripts += assets.allVendorJs.length;
  if (assets.allConfigJs) totalScripts += assets.allConfigJs.length;
  if (assets.allServiceJs) totalScripts += assets.allServiceJs.length;
  if (assets.allClientJs) totalScripts += assets.allClientJs.length;
  if (assets.allOtherJs) totalScripts += assets.allOtherJs.length;
  
  // Si no hay scripts clasificados, contar los scripts críticos
  if (totalScripts === 0 && assets.required) {
    totalScripts = Object.values(assets.required)
      .filter(path => path.endsWith('.js'))
      .length;
  }
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Masclet Imperi - Gestión de explotaciones ganaderas">
  <title>Masclet Imperi Web</title>
  <link rel="icon" href="/favico.ico" type="image/x-icon">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
    }
    #loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #ffffff;
      z-index: 9999;
      transition: opacity 0.5s ease-out;
    }
    .app-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #333;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    .loading-text {
      font-size: 16px;
      color: #555;
      margin-bottom: 10px;
      text-align: center;
    }
    .loading-progress {
      width: 200px;
      height: 5px;
      background-color: #eee;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .progress-bar {
      height: 100%;
      width: 0%;
      background-color: #007bff;
      transition: width 0.3s ease-in-out;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-panel {
      display: none;
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      max-width: 400px;
      z-index: 10000;
    }
    .error-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .error-list {
      margin: 0;
      padding-left: 20px;
    }
    .retry-button {
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
    .retry-button:hover {
      background-color: #c82333;
    }
  </style>${cssTags}
</head>
<body>
  <!-- Panel de carga inicial -->
  <div id="loading-container">
    <div class="app-title">Masclet Imperi Web</div>
    <div class="spinner"></div>
    <div class="loading-text">Cargando aplicación...</div>
    <div class="loading-progress">
      <div class="progress-bar" id="progress-bar"></div>
    </div>
    <div class="loading-text" id="loading-status">Inicializando...</div>
  </div>
  
  <!-- Panel de error (oculto inicialmente) -->
  <div id="error-panel" class="error-panel">
    <div class="error-title">Error al cargar la aplicación</div>
    <ul class="error-list">
      ${missingFiles.map(file => `<li>No se pudo cargar: ${file}</li>`).join('\n      ')}
    </ul>
    <button class="retry-button" onclick="location.reload()">Reintentar</button>
  </div>

  <script>
    // Control de estado de carga
    let loadedScripts = 0;
    const totalScripts = ${totalScripts};
    
    // Función para actualizar el progreso
    function scriptLoaded() {
      loadedScripts++;
      const progressBar = document.getElementById('progress-bar');
      const percentage = (loadedScripts / totalScripts) * 100;
      progressBar.style.width = percentage + '%';
      
      document.getElementById('loading-status').textContent = 
        \`Cargando recursos... (\${loadedScripts}/\${totalScripts})\`;
      
      if (loadedScripts >= totalScripts) {
        finalizarCarga();
      }
    }
    
    // Función para completar la carga
    function finalizarCarga() {
      document.getElementById('loading-status').textContent = 'Renderizando...';
      
      // Dar tiempo para que se complete el render
      setTimeout(() => {
        const loadingContainer = document.getElementById('loading-container');
        loadingContainer.style.opacity = '0';
        
        // Ocultar completamente después de la transición
        setTimeout(() => {
          loadingContainer.style.display = 'none';
        }, 500);
      }, 300);
    }
    
    // Función para manejar errores
    function handleError(error) {
      console.error('Error en la aplicación:', error);
      document.getElementById('error-panel').style.display = 'block';
    }
    
    // Iniciar carga de recursos al cargar la página
    window.addEventListener('DOMContentLoaded', function() {
      try {
        console.log('DOM cargado, iniciando carga de scripts...');
        
        // Si no hay scripts para cargar, finalizar directamente
        if (totalScripts === 0) {
          console.warn('No se encontraron scripts para cargar');
          finalizarCarga();
        }
        
        // Verificación de tiempo de carga
        setTimeout(() => {
          if (loadedScripts < totalScripts) {
            console.warn('Tiempo de espera excedido, finalizando carga manualmente');
            finalizarCarga();
          }
        }, 10000); // 10 segundos de timeout
      } catch (error) {
        handleError(error);
      }
    });
  </script>
  
  <!-- SCRIPTS DINÁMICOS -->
  ${scriptTags}
</body>
</html>`;
}

module.exports = {
  // Función principal requerida por build-index.cjs
  generateHtml,
  
  // Exportamos también otras funciones útiles
  generateHtmlContent,
  generateScriptTags,
  generateCssTags,
  organizeAssetsBySections,
  generateDynamicLoader,
  generateBaseHtml,
  
  // Constantes
  SECTIONS
};
