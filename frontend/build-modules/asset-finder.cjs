/**
 * Módulo para encontrar los assets necesarios para la aplicación
 */
const fs = require('fs');
const path = require('path');

// Archivos críticos que deben estar presentes (sin estos la aplicación no funciona)
const requiredAssets = {
  // Vendor chunks - Código de terceros
  vendorJs: /vendor\.[A-Za-z0-9\-_]+\.js$/,
  
  // Código de aplicación
  clientJs: /client\.[A-Za-z0-9\-_]+\.js$/,
  configJs: /config\.[A-Za-z0-9\-_]+\.js$/,
  apiConfigJs: /apiConfig\.[A-Za-z0-9\-_]+\.js$|api[\-_]config\.[A-Za-z0-9\-_]+\.js$/,
  apiServiceJs: /apiService\.[A-Za-z0-9\-_]+\.js$|api[\-_]service\.[A-Za-z0-9\-_]+\.js$/,
  
  // Estilos críticos
  mainCss: /index\.[A-Za-z0-9\-_]+\.css$/,
};

// Archivos importantes pero no críticos
const optionalAssets = {
  // Autenticación y servicios
  authServiceJs: /authService\.[A-Za-z0-9_\-]+\.js$|auth[\-_]service\.[A-Za-z0-9_\-]+\.js$/,
  logoutCss: /[Ll]ogout\.[A-Za-z0-9_\-]+\.css$/,
};

/**
 * Encuentra un archivo que coincide con un patrón
 * @param {string} dir - Directorio donde buscar
 * @param {RegExp} pattern - Patrón para buscar
 * @returns {string|null} - Nombre del archivo encontrado o null
 */
function findMatchingFile(dir, pattern) {
  try {
    const files = fs.readdirSync(dir).filter(f => pattern.test(f));
    if (files.length === 0) {
      return null;
    }
    
    if (files.length > 1) {
      console.warn(`⚠️ Se encontraron múltiples archivos para el patrón ${pattern}: ${files.join(', ')}`);
      console.warn(`   Se utilizará el primero: ${files[0]}`);
    }
    
    return files[0];
  } catch (error) {
    console.error(`❌ Error al buscar archivos con patrón ${pattern}: ${error.message}`);
    return null;
  }
}

/**
 * Busca archivos que contienen una cadena específica en su nombre
 * @param {string} dir - Directorio donde buscar
 * @param {string} searchString - Cadena a buscar en los nombres de archivo
 * @returns {string[]} - Lista de archivos que coinciden
 */
function findFilesContaining(dir, searchString) {
  try {
    return fs.readdirSync(dir)
      .filter(file => file.toLowerCase().includes(searchString.toLowerCase()));
  } catch (error) {
    console.error(`❌ Error al buscar archivos con "${searchString}": ${error.message}`);
    return [];
  }
}

/**
 * Clasifica los archivos JS en diferentes categorías
 * @param {string} astroDir - Directorio _astro
 * @returns {Object} - Objeto con los archivos clasificados
 */
function classifyJsFiles(astroDir) {
  const jsFiles = fs.readdirSync(astroDir).filter(f => f.endsWith('.js'));
  
  // Clasificar por tipo
  return {
    vendorFiles: jsFiles.filter(f => f.includes('vendor') || f.includes('chunk')),
    configFiles: jsFiles.filter(f => f.includes('config')),
    serviceFiles: jsFiles.filter(f => 
      f.includes('service') || 
      f.includes('api') || 
      f.includes('auth')
    ),
    clientFiles: jsFiles.filter(f => 
      f.includes('client') || 
      f.includes('app') || 
      f.includes('main')
    ),
    otherFiles: jsFiles.filter(f => 
      !f.includes('vendor') && 
      !f.includes('chunk') && 
      !f.includes('config') && 
      !f.includes('service') && 
      !f.includes('api') && 
      !f.includes('auth') && 
      !f.includes('client') && 
      !f.includes('app') && 
      !f.includes('main')
    )
  };
}

/**
 * Encuentra todos los assets necesarios para la aplicación
 * @param {string} astroDir - Directorio _astro
 * @returns {Object} - Objeto con los assets encontrados
 */
function findAssets(astroDir) {
  console.log(`🔍 Buscando assets en ${astroDir}`);
  
  // Assets encontrados
  const assets = {
    required: {},
    optional: {},
    missing: [],
    // Arrays de archivos clasificados por tipo
    allJs: [],
    allCss: []
  };
  
  // Validar que el directorio existe
  if (!fs.existsSync(astroDir)) {
    console.error(`❌ ERROR: El directorio ${astroDir} no existe`);
    return assets;
  }
  
  // Buscar todos los archivos JS y CSS
  assets.allJs = fs.readdirSync(astroDir)
    .filter(f => f.endsWith('.js'))
    .map(f => `/_astro/${f}`);
    
  assets.allCss = fs.readdirSync(astroDir)
    .filter(f => f.endsWith('.css'))
    .map(f => `/_astro/${f}`);
  
  console.log(`📊 Encontrados ${assets.allJs.length} archivos JS y ${assets.allCss.length} archivos CSS`);
  
  // Clasificar JS files
  const jsClassification = classifyJsFiles(astroDir);
  assets.allVendorJs = jsClassification.vendorFiles.map(f => `/_astro/${f}`);
  assets.allConfigJs = jsClassification.configFiles.map(f => `/_astro/${f}`);
  assets.allServiceJs = jsClassification.serviceFiles.map(f => `/_astro/${f}`);
  assets.allClientJs = jsClassification.clientFiles.map(f => `/_astro/${f}`);
  assets.allOtherJs = jsClassification.otherFiles.map(f => `/_astro/${f}`);
  
  // Buscar archivos requeridos
  Object.entries(requiredAssets).forEach(([key, pattern]) => {
    const file = findMatchingFile(astroDir, pattern);
    if (file) {
      assets.required[key] = `/_astro/${file}`;
      console.log(`✅ Archivo requerido ${key}: ${file}`);
    } else {
      assets.missing.push(key);
      console.error(`❌ CRÍTICO: Archivo requerido ${key} no encontrado`);
    }
  });
  
  // Buscar archivos opcionales
  Object.entries(optionalAssets).forEach(([key, pattern]) => {
    const file = findMatchingFile(astroDir, pattern);
    if (file) {
      assets.optional[key] = `/_astro/${file}`;
      console.log(`✅ Archivo opcional ${key}: ${file}`);
    } else {
      console.warn(`⚠️ Archivo opcional ${key} no encontrado`);
    }
  });
  
  return assets;
}

module.exports = {
  findAssets,
  findMatchingFile,
  findFilesContaining
};
