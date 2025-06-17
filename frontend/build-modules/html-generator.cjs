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
      
      // Ocultar el spinner cuando la aplicación esté cargada
      const loadingSpinner = document.querySelector('.loading-spinner');
      const loadingContainer = document.querySelector('.loading-container');
      
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }
      
      if (loadingContainer) {
        // Esperar un poco para mostrar una transición suave
        setTimeout(() => {
          loadingContainer.style.display = 'none';
        }, 300);
      }
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
    // Eliminamos cualquier prefijo _astro/ que ya esté en el nombre del archivo
    let cleanFile = file.replace(/^_astro\//, '');
    
    // Construimos la ruta final limpia evitando dobles prefijos
    let src = basePath ? `/${basePath}/${cleanFile}` : `/${cleanFile}`;
    
    // Evitamos dobles barras
    src = src.replace(/\/\//g, '/');
    
    return `<script src="${src}" type="module"></script>`;
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
 * @param {string} astroPath - Ruta a la carpeta relativa a dist/client (vacía para assets en raíz)
 * @returns {string} - Script JS para carga dinámica
 */
function generateDynamicLoader(sectionAssets, astroPath = '') {
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
        // Evitar añadir dos veces _astro/
        let cleanCssFile = cssFile.replace(/^_astro\//, '');
        let cssPath = BASE_PATH ? '/' + BASE_PATH + '/' + cleanCssFile : '/' + cleanCssFile;
        // Eliminar dobles barras
        cssPath = cssPath.replace(new RegExp('//','g'), '/');
        await loadCSS(cssPath);
        console.log('✅ CSS cargado:', cssFile);
      }
    }
    
    // Cargar JS
    if (section.js && section.js.length > 0) {
      for (const jsFile of section.js) {
        // Evitar añadir dos veces _astro/
        let cleanJsFile = jsFile.replace(/^_astro\//, '');
        let jsPath = BASE_PATH ? '/' + BASE_PATH + '/' + cleanJsFile : '/' + cleanJsFile;
        // Eliminar dobles barras
        jsPath = jsPath.replace(new RegExp('//','g'), '/');
        await loadScript(jsPath);
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
      return 'IMPORTACIONES';
    } else if (path.includes('/backup')) {
      return 'BACKUP';
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
  // 0. Limpiamos las rutas para evitar dobles _astro
  // Hacemos una copia profunda para no modificar el original
  let cleanedAssets = JSON.parse(JSON.stringify(organizedAssets));
  
  // Limpiamos todos los paths para eliminar prefijos _astro/ que se añadirán después
  Object.keys(cleanedAssets).forEach(section => {
    if (cleanedAssets[section].js) {
      cleanedAssets[section].js = cleanedAssets[section].js.map(path => {
        return path.replace(/^\/?_astro\//, '');
      });
    }
    if (cleanedAssets[section].css) {
      cleanedAssets[section].css = cleanedAssets[section].css.map(path => {
        return path.replace(/^\/?_astro\//, '');
      });
    }
  });

  // 1. Obtener la plantilla base HTML
  let html = generateBaseHtml('Masclet Imperi');
  
  // 2. Buscar los core scripts y css (pueden estar como 'core', 'CORE' o 'Core')
  let coreAssets = {};
  const coreKey = Object.keys(cleanedAssets).find(key => key.toLowerCase() === 'core');
  
  // Definir las variables para CSS y scripts críticos
  let coreCSS = '<!-- No se encontraron estilos CSS core -->';
  let coreScripts = '<!-- No se encontraron scripts JS core -->';
  
  // INYECTAR MANUALMENTE LOS CSS CRÍTICOS
  // Esta es una solución de emergencia para garantizar que los CSS críticos siempre estén presentes
  coreCSS = `<link rel="stylesheet" href="/_astro/index.DJoSdzOi.css">
  <link rel="stylesheet" href="/_astro/vendor.DJv9yYup.css">
  <link rel="stylesheet" href="/_astro/_id_.CtbIiy9S.css">`;
  
  if (coreKey) {
    coreAssets = cleanedAssets[coreKey];
    console.log(`✅ Encontrados ${coreAssets.js ? coreAssets.js.length : 0} scripts core`);
    console.log(`✅ Encontrados ${coreAssets.css ? coreAssets.css.length : 0} estilos core`);
    
    // Generar las etiquetas para los scripts y CSS core
    if (coreAssets.js && coreAssets.js.length > 0) {
      coreScripts = generateScriptTags(coreAssets.js, '_astro');
    }
    
    if (coreAssets.css && coreAssets.css.length > 0) {
      coreCSS = generateCssTags(coreAssets.css, '_astro');
    }
  } else {
    console.error('⚠️ No se encontró sección core/CORE en los assets');
  }
  
  // Insertar en el HTML
  html = html.replace('<!-- CSS Crítico -->', '<!-- CSS Crítico -->\n  ' + coreCSS);
  html = html.replace('<!-- MARCADOR: CSS CRÍTICO -->', coreCSS); // Para compatibilidad con versiones anteriores
  html = html.replace('<!-- MARCADOR: SCRIPTS CRÍTICOS -->', coreScripts);
  
  // VERIFICACIÓN DE EMERGENCIA: Asegurar que los CSS críticos están presentes
  if (!html.includes('index.DJoSdzOi.css') || !html.includes('vendor.DJv9yYup.css')) {
    console.warn('⚠️ ADVERTENCIA: No se detectaron CSS críticos en el HTML generado');
    console.log('🔧 Aplicando parche de emergencia para CSS críticos...');
    const cssEmergencia = `<link rel="stylesheet" href="/_astro/index.DJoSdzOi.css">
  <link rel="stylesheet" href="/_astro/vendor.DJv9yYup.css">
  <link rel="stylesheet" href="/_astro/_id_.CtbIiy9S.css">`;
    html = html.replace('</head>', cssEmergencia + '\n</head>');
    console.log('✅ CSS críticos insertados manualmente');
  }
  
  // Generar cargador dinámico para scripts de sección
  const dynamicLoader = generateDynamicLoader(cleanedAssets, '_astro');
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
