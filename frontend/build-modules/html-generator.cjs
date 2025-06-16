/**
 * Módulo para generar el contenido HTML del index.html
 */

/**
 * Genera tags de script para los archivos JS
 * @param {Object} assets - Objeto con los assets encontrados
 * @returns {string} - HTML con los tags de script
 */
function generateScriptTags(assets) {
  let scriptTags = '';
  
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
  generateHtmlContent,
  generateScriptTags,
  generateCssTags
};
