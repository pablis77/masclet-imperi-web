/**
 * Script avanzado para generar un index.html profesional para Masclet Imperi Web
 * Este script analiza dinámicamente los archivos generados en el build y crea un
 * index.html que carga correctamente todos los recursos necesarios para la SPA.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración
const clientDir = path.join(__dirname, 'dist', 'client');
const astroDir = path.join(clientDir, '_astro');
const targetsToFind = {
  vendorCss: /vendor\.[A-Za-z0-9]+\.css$/,
  indexCss: /index\.[A-Za-z0-9]+\.css$/,
  idCss: /_id_\.[A-Za-z0-9]+\.css$/,
  logoutCss: /logout\.[A-Za-z0-9]+\.css$/,
  vendorJs: /vendor\.[A-Za-z0-9]+\.js$/,
  vendorReactJs: /vendor-react\.[A-Za-z0-9]+\.js$/,
  vendorChartsJs: /vendor-charts\.[A-Za-z0-9]+\.js$/,
  clientJs: /client\.[A-Za-z0-9]+\.js$/,
  configJs: /config\.[A-Za-z0-9]+\.js$/,
  apiConfigJs: /apiConfig\.[A-Za-z0-9]+\.js$/,
  authServiceJs: /authService\.[A-Za-z0-9]+\.js$/,
  apiServiceJs: /apiService\.[A-Za-z0-9]+\.js$/
};

// Función para buscar y encontrar archivos que coinciden con un patrón
function findMatchingFiles(dir, pattern) {
  try {
    const files = fs.readdirSync(dir);
    const matches = files.filter(file => pattern.test(file));
    return matches.length > 0 ? matches[0] : null;
  } catch (error) {
    console.error(`Error al buscar archivos con patrón ${pattern}: ${error.message}`);
    return null;
  }
}

// Buscar todos los archivos necesarios
console.log('🔍 Buscando archivos principales para la SPA...');
const foundFiles = {};
let allFilesFound = true;

Object.entries(targetsToFind).forEach(([key, pattern]) => {
  const matchedFile = findMatchingFiles(astroDir, pattern);
  if (matchedFile) {
    foundFiles[key] = matchedFile;
    console.log(`✅ Encontrado ${key}: ${matchedFile}`);
  } else {
    console.error(`❌ No se encontró archivo para ${key}`);
    allFilesFound = false;
  }
});

if (!allFilesFound) {
  console.error('⚠️ Algunos archivos críticos no se encontraron. El index.html podría no funcionar correctamente.');
}

// Generar identificador único para evitar caché no deseada
const buildId = crypto.randomBytes(4).toString('hex');

// Crear contenido del HTML con los archivos encontrados
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sistema Masclet Imperi - Gestión ganadera profesional">
  <meta name="build-id" content="${buildId}">
  <link rel="icon" type="image/x-icon" href="/favico.ico">
  <title>Masclet Imperi Web</title>
  
  <!-- Estilos principales -->
  ${foundFiles.vendorCss ? `<link rel="stylesheet" href="/_astro/${foundFiles.vendorCss}">` : ''}
  ${foundFiles.indexCss ? `<link rel="stylesheet" href="/_astro/${foundFiles.indexCss}">` : ''}
  ${foundFiles.idCss ? `<link rel="stylesheet" href="/_astro/${foundFiles.idCss}">` : ''}
  ${foundFiles.logoutCss ? `<link rel="stylesheet" href="/_astro/${foundFiles.logoutCss}">` : ''}
  
  <!-- Configuración -->  
  <script>
    // Configuración global de la aplicación
    window.MASCLET_CONFIG = {
      API_BASE_URL: '${process.env.VITE_API_BASE_URL || 'http://34.253.203.194:8000'}',
      DEFAULT_LANGUAGE: 'es',
      VERSION: '${process.env.npm_package_version || '0.1.0'}',
      BUILD_ID: '${buildId}',
      BUILD_DATE: '${new Date().toISOString()}',
      IS_PRODUCTION: true
    };
    
    // Función para manejar errores de carga
    window.handleAssetLoadError = function(asset) {
      console.error('Error cargando recurso:', asset);
      const errorPanel = document.getElementById('error-panel');
      if (errorPanel) {
        errorPanel.style.display = 'block';
        const errorList = errorPanel.querySelector('.error-list');
        if (errorList) {
          const errorItem = document.createElement('li');
          errorItem.textContent = 'Error cargando: ' + asset;
          errorList.appendChild(errorItem);
        }
      }
    };
    
    // Funciones de almacenamiento local
    const checkAuth = function() {
      try {
        const token = localStorage.getItem('jwt');
        const userRole = localStorage.getItem('userRole');
        
        console.log('Auth check: Token ' + (token ? 'encontrado' : 'no encontrado'));
        console.log('Auth check: Role ' + (userRole || 'no detectado'));
        
        // Redirección a login si no hay token
        if (!token && window.location.pathname !== '/login') {
          console.log('Redirigiendo a login (no autenticado)');
          window.location.href = '/login';
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error en checkAuth:', error);
        return false;
      }
    };
    
    // Registro de inicialización
    console.log('Masclet Imperi Web - Inicializando aplicación');
  </script>

  <style>
    /* Estilos básicos de carga */
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
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
      background-color: #f5f5f5;
      z-index: 9999;
      transition: opacity 0.5s ease-out;
    }
    
    .app-logo {
      width: 160px;
      height: 160px;
      margin-bottom: 20px;
    }
    
    .app-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #333;
    }
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-left-color: #09f;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    .loading-text {
      font-size: 16px;
      color: #666;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    #error-panel {
      display: none;
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #fff3f3;
      border: 1px solid #ffcaca;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    #error-panel h2 {
      color: #d32f2f;
      margin-top: 0;
    }
    
    .retry-button {
      background-color: #2196f3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 10px;
    }
    
    .retry-button:hover {
      background-color: #1976d2;
    }
    
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <!-- Panel de carga inicial -->
  <div id="loading-container">
    <div class="app-title">Masclet Imperi Web</div>
    <div class="spinner"></div>
    <p class="loading-text">Cargando aplicación...</p>
    
    <div id="error-panel">
      <h2>Error al cargar recursos</h2>
      <p>Se han producido errores al cargar algunos recursos necesarios:</p>
      <ul class="error-list"></ul>
      <button class="retry-button" onclick="window.location.reload()">Reintentar</button>
    </div>
  </div>

  <!-- Contenedor principal de la SPA -->
  <div id="app-root"></div>
  
  <!-- Scripts principales en orden óptimo de carga -->
  <script>
    // Control de estado de carga
    let loadedScripts = 0;
    const totalScripts = ${Object.keys(targetsToFind).filter(key => key.includes('Js')).length};
    
    function scriptLoaded() {
      loadedScripts++;
      if (loadedScripts >= totalScripts) {
        console.log('Todos los scripts cargados correctamente');
        // Permitir un tiempo para inicialización antes de ocultar el loader
        setTimeout(() => {
          const loader = document.getElementById('loading-container');
          if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
              loader.style.display = 'none';
            }, 500);
          }
        }, 1000);
      }
    }
    
    function loadScript(src, id) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = false;
        script.onload = () => {
          scriptLoaded();
          resolve();
        };
        script.onerror = (e) => {
          window.handleAssetLoadError(src);
          reject(e);
        };
        document.body.appendChild(script);
      });
    }
    
    // Verificación inicial de autorización
    if (checkAuth()) {
      // Cargar scripts principales en secuencia
      Promise.resolve()
        ${foundFiles.vendorJs ? `.then(() => loadScript("/_astro/${foundFiles.vendorJs}", "vendor-main"))` : ''}
        ${foundFiles.vendorReactJs ? `.then(() => loadScript("/_astro/${foundFiles.vendorReactJs}", "vendor-react"))` : ''}
        ${foundFiles.vendorChartsJs ? `.then(() => loadScript("/_astro/${foundFiles.vendorChartsJs}", "vendor-charts"))` : ''}
        ${foundFiles.clientJs ? `.then(() => loadScript("/_astro/${foundFiles.clientJs}", "astro-client"))` : ''}
        ${foundFiles.configJs ? `.then(() => loadScript("/_astro/${foundFiles.configJs}", "config"))` : ''}
        ${foundFiles.apiConfigJs ? `.then(() => loadScript("/_astro/${foundFiles.apiConfigJs}", "api-config"))` : ''}
        ${foundFiles.authServiceJs ? `.then(() => loadScript("/_astro/${foundFiles.authServiceJs}", "auth-service"))` : ''}
        ${foundFiles.apiServiceJs ? `.then(() => loadScript("/_astro/${foundFiles.apiServiceJs}", "api-service"))` : ''}
        .then(() => {
          console.log('Scripts principales cargados');
        })
        .catch(error => {
          console.error('Error cargando scripts:', error);
          document.getElementById('error-panel').style.display = 'block';
        });
    }
  </script>
</body>
</html>`;

// Ruta donde guardar el archivo
const targetPath = path.join(clientDir, 'index.html');

// Crear el archivo
try {
  fs.writeFileSync(targetPath, htmlContent);
  console.log(`\n✅ index.html profesional creado correctamente en: ${targetPath}`);
  console.log(`✅ Configurado para utilizar API en: ${process.env.VITE_API_BASE_URL || 'http://34.253.203.194:8000'}`);
  console.log(`✅ Se encontraron y configuraron ${Object.keys(foundFiles).length} recursos para la SPA`);
  console.log(`✅ Build ID único generado: ${buildId}`);
} catch (error) {
  console.error(`❌ Error creando el archivo: ${error.message}`);
}
