/**
 * Script avanzado para generar un index.html profesional para Masclet Imperi Web
 * Este script analiza dinámicamente los archivos generados en el build y crea un
 * index.html que carga correctamente todos los recursos necesarios para la SPA.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directorios de trabajo
const clientDir = path.join(__dirname, 'dist', 'client');
const astroDir = path.join(clientDir, '_astro');

console.log('\n📂 DIAGNÓSTICO DE DESPLIEGUE EN AWS AMPLIFY');
console.log('========================================');
console.log(`📁 Cliente: ${clientDir}`);
console.log(`📁 Astro: ${astroDir}`);

// Verificar si existen las carpetas
if (!fs.existsSync(clientDir)) {
  console.error(`❌ ERROR CRÍTICO: No existe el directorio ${clientDir}`);
  process.exit(1);
}
if (!fs.existsSync(astroDir)) {
  console.error(`❌ ERROR CRÍTICO: No existe el directorio ${astroDir}`);
  process.exit(1);
}

// Archivos críticos que deben estar presentes (sin estos la aplicación no funciona)
const requiredTargets = {
  // Vendor chunks - Código de terceros
  vendorJs: /vendor\.[A-Za-z0-9\-_]+\.js$/,
  vendorReactJs: /vendor\-react\.[A-Za-z0-9\-_]+\.js$/,
  vendorChartsJs: /vendor\-charts\.[A-Za-z0-9\-_]+\.js$/,
  
  // Código de aplicación
  clientJs: /client\.[A-Za-z0-9\-_]+\.js$/,
  configJs: /config\.[A-Za-z0-9\-_]+\.js$/,
  apiConfigJs: /api\-config\.[A-Za-z0-9\-_]+\.js$/,
  apiServiceJs: /api\-service\.[A-Za-z0-9\-_]+\.js$/,
  
  // Estilos críticos
  loginCss: /login\.[A-Za-z0-9\-_]+\.css$/,
  mainCss: /index\.[A-Za-z0-9\-_]+\.css$/,
};

// Archivos importantes pero no críticos (la app puede funcionar sin ellos en algunos casos)
const optionalTargets = {
  // Autenticación y servicios
  authServiceJs: /authService\.[A-Za-z0-9_\-]+\.js$/,
  
  // Estilos adicionales
  logoutCss: /logout\.[A-Za-z0-9_\-]+\.css$/,
};

// Combinamos ambos para búsqueda
const allTargets = { ...requiredTargets, ...optionalTargets };

// Listar todos los archivos en _astro para diagnóstico
const allAstroFiles = fs.readdirSync(astroDir);
console.log(`\n📊 INVENTARIO: Se encontraron ${allAstroFiles.length} archivos en _astro`);
const fileTypes = {
  js: allAstroFiles.filter(f => f.endsWith('.js')),
  css: allAstroFiles.filter(f => f.endsWith('.css')),
  other: allAstroFiles.filter(f => !f.endsWith('.js') && !f.endsWith('.css'))
};
console.log(`   - ${fileTypes.js.length} archivos JavaScript (.js)`);
console.log(`   - ${fileTypes.css.length} archivos CSS (.css)`);
console.log(`   - ${fileTypes.other.length} otros archivos`);

// Función para buscar y encontrar archivos que coinciden con un patrón
function findMatchingFiles(dir, pattern) {
  try {
    const files = fs.readdirSync(dir).filter(f => pattern.test(f));
    if (files.length > 1) {
      console.warn(`⚠️ Se encontraron múltiples archivos para el patrón ${pattern}: ${files.join(', ')}`);
      console.warn(`   Se utilizará el primero: ${files[0]}`);
    }
    return files.length ? files[0] : null;
  } catch (err) {
    console.error(`❌ Error buscando archivos con patrón ${pattern}: ${err}`);
    return null;
  }
}

// Función para buscar específicamente archivos que contengan una cadena en su nombre
function findFilesByString(dir, searchString) {
  try {
    const files = fs.readdirSync(dir).filter(f => f.includes(searchString));
    return files;
  } catch (err) {
    console.error(`❌ Error buscando archivos que contienen '${searchString}': ${err}`);
    return [];
  }
}

// Función principal para crear index.html
function generateHtml(importantFiles) {
  // Verificar si hay activos críticos faltantes
  let foundAllImportant = true;
  const missingFiles = [];
  
  // Ya no creamos archivos vacíos, sino que tratamos los opcionales como realmente opcionales
  for (const key in optionalTargets) {
    if (!importantFiles[key]) {
      console.warn(`⚠️ Archivo opcional ${key} no encontrado. La aplicación seguirá funcionando.`);
    } else {
      console.log(`✅ Archivo opcional ${key} encontrado: ${importantFiles[key]}`);
    }
  }

  // Solo verificar archivos requeridos
  for (const key in requiredTargets) {
    if (!importantFiles[key]) {
      foundAllImportant = false;
      missingFiles.push(key);
    }
  }

  if (!foundAllImportant) {
    console.warn('⚠️ Algunos archivos críticos no se encontraron. El index.html podría no funcionar correctamente.');
  }

  // Crear scripts para manejar errores de carga
  const assetErrorScript = `
    window.handleAssetLoadError = function(src) {
      console.error('Error al cargar asset:', src);
    };
  `;

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
        
        // No hay redirección forzada. La SPA se monta completamente
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
    // Usar el número de archivos JS que realmente se encontraron, no el total esperado
    const foundJsFiles = Object.entries(${JSON.stringify(foundFiles)})
      .filter(([key]) => key.includes('Js'))
      .length;
    const totalScripts = foundJsFiles > 0 ? foundJsFiles : 5; // Al menos 5 scripts a cargar para seguridad
    
    function scriptLoaded() {
      loadedScripts++;
      if (loadedScripts >= totalScripts) {
        console.log('Todos los scripts cargados correctamente');
        finalizarCarga();
      }
    }
    
    function finalizarCarga() {
      // Permitir un tiempo para inicialización antes de ocultar el loader
      setTimeout(() => {
        const loader = document.getElementById('loading-container');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
          }, 500);
        }
        
        // Si estamos en /login, establecer clase especial
        if (window.location.pathname.includes('/login')) {
          document.body.classList.add('login-page');
        }
        
        // Inicializar aplicación manualmente si necesario
        const event = new Event('app-fully-loaded');
        document.dispatchEvent(event);
      }, 800);
    }
    
    function loadScript(src, id) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.id = id || 'script-' + Math.random().toString(36).substring(2, 9);
        script.type = 'module'; // Añadimos type="module" para soportar import/export
        script.async = false;
        script.onload = () => {
          scriptLoaded();
          resolve();
        };
        script.onerror = (e) => {
          console.warn('Error al cargar:', src, e);
          // Contar errores como scripts cargados para no bloquear progreso
          scriptLoaded(); 
          window.handleAssetLoadError(src);
          // Resolvemos igualmente para continuar la cadena de promesas
          resolve();
        };
        document.body.appendChild(script);
      });
    }
    
    // Función para manejar inicialización (sin redirección automática)
    function inicializarSPA() {
      console.log('Inicializando SPA...');
      // Siempre cargar scripts independientemente de la ruta
      cargarScripts();
    }
    
    // Función para cargar todos los scripts
    function cargarScripts() {
      console.log('Cargando scripts en orden optimizado...');
      // Cargar scripts principales en secuencia siguiendo el orden correcto
      // IMPORTANTE: Este orden es crítico para evitar ReferenceError
      Promise.resolve()
        // 1. Vendor base (bibliotecas fundamentales)
        ${foundFiles.vendorJs ? `.then(() => loadScript("/_astro/${foundFiles.vendorJs}", "vendor-main"))` : '.then(() => Promise.resolve())'}
        
        // 2. React (dependencia para componentes)
        ${foundFiles.vendorReactJs ? `.then(() => loadScript("/_astro/${foundFiles.vendorReactJs}", "vendor-react"))` : '.then(() => Promise.resolve())'}
        
        // 3-4. Configuración (debe cargarse antes que los servicios)
        ${foundFiles.configJs ? `.then(() => loadScript("/_astro/${foundFiles.configJs}", "config"))` : '.then(() => Promise.resolve())'}
        ${foundFiles.apiConfigJs ? `.then(() => loadScript("/_astro/${foundFiles.apiConfigJs}", "api-config"))` : '.then(() => Promise.resolve())'}
        
        // 5. Servicios (dependen de config, pero el cliente depende de ellos)
        ${foundFiles.apiServiceJs ? `.then(() => loadScript("/_astro/${foundFiles.apiServiceJs}", "api-service"))` : '.then(() => Promise.resolve())'}
        ${foundFiles.authServiceJs ? `.then(() => loadScript("/_astro/${foundFiles.authServiceJs}", "auth-service"))` : '.then(() => Promise.resolve())'}
        
        // 6. Cliente (usa todos los anteriores)
        ${foundFiles.clientJs ? `.then(() => loadScript("/_astro/${foundFiles.clientJs}", "astro-client"))` : '.then(() => Promise.resolve())'}
        
        // 7. Charts AL FINAL - Esto resuelve el error "ReferenceError: Cannot access 'X' before initialization"
        ${foundFiles.vendorChartsJs ? `.then(() => loadScript("/_astro/${foundFiles.vendorChartsJs}", "vendor-charts"))` : '.then(() => Promise.resolve())'}
        
        // Cuando todos los scripts principales estén cargados
        .then(() => {
          console.log('Scripts principales cargados correctamente');
          // Si hay menos scripts cargados que los esperados, finalizar manualmente
          if (loadedScripts < totalScripts) {
            console.log('Finalizando carga manualmente');
            while(loadedScripts < totalScripts) {
              scriptLoaded();
            }
          }
        })
        .catch(error => {
          console.error('Error cargando scripts:', error);
          document.getElementById('error-panel').style.display = 'block';
          // Finalizar carga de todas formas para mostrar UI
          finalizarCarga();
        });
    }
    
    // Verificación inicial de autorización
    try {
      const token = localStorage.getItem('jwt');
      const userRole = localStorage.getItem('userRole');
      
      console.log('Auth check: Token ' + (token ? 'encontrado' : 'no encontrado'));
      console.log('Auth check: Role ' + (userRole || 'no detectado'));
      
      // Ya no redirigimos automáticamente
      // Siempre inicializamos la SPA independientemente de la autenticación
      inicializarSPA();
    } catch (error) {
      console.error('Error en verificación de auth:', error);
      // En caso de error, intentar cargar scripts de todas formas
      cargarScripts();
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

// Exportamos la función
return htmlContent;
}; // Cierre de la función generateHtml

// Buscar todos los archivos necesarios
console.log('\n🔍 BÚSQUEDA DE ARCHIVOS PRINCIPALES');
console.log('=================================');
const foundFiles = {};
let allFilesFound = true;
let criticalMissing = false;

// Listar todos los archivos JS para diagnóstico avanzado
console.log('\n📄 CONTENIDO DE ARCHIVOS JS:');
fileTypes.js.forEach(file => console.log(`   - ${file}`));

// Listar todos los archivos CSS para diagnóstico avanzado
console.log('\n📄 CONTENIDO DE ARCHIVOS CSS:');
fileTypes.css.forEach(file => console.log(`   - ${file}`));

// Buscar específicamente archivos críticos de autenticación
console.log('\n🔒 VERIFICACIÓN DE AUTENTICACIÓN:');
const authFiles = findFilesByString(astroDir, 'auth');
const serviceFiles = findFilesByString(astroDir, 'Service');

console.log(`   - Archivos de autenticación encontrados: ${authFiles.length}`);
authFiles.forEach(file => console.log(`     > ${file}`));

console.log(`   - Archivos de servicios encontrados: ${serviceFiles.length}`);
serviceFiles.forEach(file => console.log(`     > ${file}`));

// Buscar archivos según patrones definidos
console.log('\n🧩 ARCHIVOS NECESARIOS SEGÚN PATRONES:');

// Primero obligatorios
Object.entries(requiredTargets).forEach(([key, pattern]) => {
  const matchedFile = findMatchingFiles(astroDir, pattern);
  if (matchedFile) {
    foundFiles[key] = matchedFile;
    console.log(`✅ Encontrado ${key}: ${matchedFile}`);
  } else {
    console.error(`❌ CRÍTICO: No se encontró ${key}`);
    allFilesFound = false;
    criticalMissing = true;
  }
});

// Luego opcionales
Object.entries(optionalTargets).forEach(([key, pattern]) => {
  const matchedFile = findMatchingFiles(astroDir, pattern);
  if (matchedFile) {
    foundFiles[key] = matchedFile;
    console.log(`✅ Encontrado ${key}: ${matchedFile}`);
  } else {
    console.warn(`⚠️ Opcional no encontrado: ${key}`);
    allFilesFound = false;
  }
});

// Alerta si faltan archivos críticos
if (criticalMissing) {
  console.error('\n❌❌❌ FALTAN ARCHIVOS CRÍTICOS - LA APLICACIÓN NO FUNCIONARÁ CORRECTAMENTE');
}

// Generar el HTML
const htmlContent = generateHtml(foundFiles);

// Ruta donde guardar el archivo
const targetPath = path.join(clientDir, 'index.html');

// Escribir el archivo
try {
  fs.writeFileSync(targetPath, htmlContent);
  console.log(`✅ index.html creado exitosamente en ${targetPath}`);
} catch (error) {
  console.error(`❌ Error al escribir index.html: ${error.message}`);
}
