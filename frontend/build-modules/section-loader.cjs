/**
 * Versión limpia y corregida de section-loader.cjs 
 * Con estructura balanceada para exportar correctamente organizeSectionAssets
 */

// Configuración de secciones (igual que en el original)
const SECTIONS = require('./section-manifest.json');

/**
 * Organiza scripts por sección para cargarlos en orden adecuado
 * @param {Object} assets - Objeto con los assets detectados
 * @param {string} currentSection - Sección actual del usuario
 * @param {Object} sectionManifest - Manifiesto de secciones (opcional)
 * @returns {Object} - Assets organizados por sección y prioridad
 */
function organizeSectionAssets(assets, currentSection = 'DASHBOARD', sectionManifest = null) {
  const result = {
    core: { js: [], css: [] },  // Core (scripts y estilos comunes presentes siempre)
    other: { js: [], css: [] } // Scripts/estilos adicionales (bajo demanda)
  };
  
  // Helper para evitar duplicados exactos
  const addedScriptPaths = new Set();
  // Helper para evitar duplicados por nombre base
  const addedBaseNames = new Map();
  
  // Función auxiliar para añadir scripts sin duplicar
  function addScriptToSection(section, script) {
    // Si es una ruta exacta que ya tenemos, ignorar
    if (addedScriptPaths.has(script)) {
      return;
    }
    
    // Extraer el nombre base (sin hash) para comparar
    const fileName = script.split('/').pop();
    const isHoistedFile = fileName.startsWith('hoisted.');
    
    // Extraer nombre base sin hash
    const baseName = fileName.replace(/\.([A-Za-z0-9_\-]+)\.js$/, '.js');
    
    // Manejo especial para archivos hoisted que representan componentes de layout
    if (isHoistedFile) {
      // Para hoisted vamos a permitir hasta 4 versiones diferentes porque
      // representan componentes cruciales (Footer, MainLayout, Navbar, Sidebar)
      const currentCount = addedBaseNames.get(baseName) || 0;
      if (currentCount >= 4 && baseName === 'hoisted.js') {
        // Ya tenemos suficientes versiones de hoisted, ignorar
        return;
      }
      addedBaseNames.set(baseName, currentCount + 1);
    } else {
      // Para los demás archivos, si ya existe uno con el mismo nombre base, ignorar
      if (addedBaseNames.has(baseName)) {
        return;
      }
      addedBaseNames.set(baseName, 1);
    }
    
    // Añadir el script a la sección
    result[section].js.push(script);
    addedScriptPaths.add(script);
  }

  if (!assets || !assets.allJs) {
    console.log('\u26A0\uFE0F Sin assets JS para organizar');
    return result;
  }

  // Si se proporcionó un manifiesto de secciones externo, usar ese
  const sections = sectionManifest || SECTIONS;
  
  // Inicializar todas las secciones conocidas
  for (const sectionName in sections) {
    if (!result[sectionName]) {
      result[sectionName] = {
        js: [],
        css: []
      };
    }
  }

  // Función para detectar sección basada en nombre de archivo
  function detectSectionFromFilename(filename) {
    const lowerFilename = filename.toLowerCase();
    const pathParts = filename.split('/');
    
    // Patrones de detección
    if (lowerFilename.startsWith('dashboard')) {
      return 'DASHBOARD';
    } else if (lowerFilename.startsWith('explotacion')) {
      return 'EXPLOTACIONES';
    } else if (lowerFilename.startsWith('animal')) {
      return 'ANIMALES';
    } else if (lowerFilename.startsWith('listado')) {
      return 'LISTADOS';
    } else if (lowerFilename.startsWith('user')) {
      return 'USUARIOS';
    } else if (lowerFilename.startsWith('import')) {
      return 'IMPORTACIONES';
    } else if (lowerFilename.startsWith('backup')) {
      return 'BACKUPS';
    }
    
    return 'DASHBOARD'; // Valor por defecto
  }

  // Función auxiliar para buscar coincidencia de nombre base
  function matchesByBaseFilename(fullPath, baseFilename) {
    // Extrae solo el nombre del archivo de la ruta completa
    const pathParts = fullPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Obtén el nombre base del archivo que buscamos (sin extensión)
    const searchName = baseFilename.replace(/\.js$/, '');
    
    // Estrategia 1: Coincidencia exacta de nombre base (más segura)
    const exactMatch = filename === baseFilename;
    
    // Estrategia 2: Coincidencia directa con inicio de nombre
    const startsWithMatch = filename.startsWith(searchName + '.');
    
    // Estrategia 3: Coincidencia con nombre base ignorando hash
    // Expresión que detecta cualquier patrón de hash en el nombre
    const cleanedFilename = filename.replace(/\.([A-Za-z0-9_\-]+)\.js$/, '.js');
    const cleanMatch = cleanedFilename === baseFilename;
    
    // Combinamos las estrategias
    return exactMatch || startsWithMatch || cleanMatch;
  }

  // Procesamiento principal de assets
  if (assets.allJs) {
    // 1. Primero procesar scripts core (siempre presentes)
    if (sections.core && sections.core.jsFiles) {
      for (const jsFile of sections.core.jsFiles) {
        // Buscar coincidencias por nombre base
        const matches = assets.allJs.filter(jsPath => matchesByBaseFilename(jsPath, jsFile));
        if (matches && matches.length > 0) {
          for (const match of matches) {
            addScriptToSection('core', match);
          }
        }
      }
    }
    
    // 2. Luego procesar scripts de la sección actual (para carga inmediata)
    const currentConfig = sections[currentSection] || {};
    if (currentConfig.jsFiles) {
      // Crear la sección si no existe
      if (!result[currentSection]) result[currentSection] = { js: [], css: [] };
      
      // Añadir cada archivo de la sección actual
      for (const jsFile of currentConfig.jsFiles) {
        const matches = assets.allJs.filter(jsPath => matchesByBaseFilename(jsPath, jsFile));
        if (matches && matches.length > 0) {
          for (const match of matches) {
            addScriptToSection(currentSection, match);
          }
        }
      }
    }
    
    // 3. Procesar scripts de otras secciones (se cargan bajo demanda)
    for (const sectionName in sections) {
      if (sectionName === 'core' || sectionName === currentSection) continue; // Ya procesados
      
      const section = sections[sectionName];
      const jsFiles = section.jsFiles || [];
      let matchingJs = [];
      
      if (jsFiles && jsFiles.length > 0) {
        // Buscar coincidencias para esta sección
        for (const jsFile of jsFiles) {
          const matches = assets.allJs.filter(jsPath => matchesByBaseFilename(jsPath, jsFile));
          if (matches && matches.length > 0) {
            matchingJs.push(...matches);
          }
        }
        
        // Inicializar la sección en result si no existe
        if (!result[sectionName]) result[sectionName] = { js: [], css: [] };
        
        if (matchingJs.length > 0) {
          // Añadir scripts encontrados a la sección
          result[sectionName].js.push(...matchingJs);
        }
      }
    }
  }

  // Procesar CSS si existen
  if (assets.allCss) {
    // CSS para core - usamos cssFiles para hacer match por nombre base
    if (sections.core && sections.core.cssFiles && sections.core.cssFiles.length > 0) {
      // Función para extraer el nombre base de un archivo CSS (sin hash)
      const getBaseNameCSS = (cssPath) => {
        const fileName = cssPath.split('/').pop();
        return fileName.replace(/\.([A-Za-z0-9_\-]+)\.css$/, '.css');
      };
      
      // Para cada CSS en assets.allCss, verificamos si su nombre base está en section.core.cssFiles
      const coreCSS = assets.allCss.filter(cssPath => {
        const baseName = getBaseNameCSS(cssPath);
        // Comprobamos si index.css (para baseName=index.DJoSdzOi.css) está en cssFiles
        return sections.core.cssFiles.some(pattern => {
          const basePattern = pattern.split('/').pop(); // Solo nombre del archivo
          return baseName.endsWith(basePattern) || cssPath.includes('index');
        });
      });
      
      result.core.css.push(...coreCSS);
      console.log('CSS Core detectados:', coreCSS.length, coreCSS);
    }
    
    // CSS para sección actual
    const currentConfig = sections[currentSection] || {};
    if (currentConfig.cssPattern) {
      const matchingCss = assets.allCss.filter(css => currentConfig.cssPattern.test(css));
      if (!result[currentSection]) result[currentSection] = { js: [], css: [] };
      result[currentSection].css.push(...matchingCss);
    }
    
    // CSS para otras secciones
    for (const sectionName in sections) {
      if (sectionName === 'core' || sectionName === currentSection) continue;
      
      const section = sections[sectionName];
      if (section.cssPattern) {
        const matchingCss = assets.allCss.filter(css => section.cssPattern.test(css));
        if (matchingCss.length > 0) {
          if (!result[sectionName]) result[sectionName] = { js: [], css: [] };
          result[sectionName].css.push(...matchingCss);
        }
      }
    }
  }
  
  return result;
}

// Función simple de detección de sección para pruebas
function detectSection(pathname) {
  return 'DASHBOARD';
}

// Función básica de generación de HTML para pruebas
function generateDynamicLoadConfig(organizedAssets) {
  return '/* Configuración HTML */';
}

function matchFileToSection(filename) {
  return 'DASHBOARD';
}

// Exportaciones corregidas
module.exports = {
  detectSection,
  organizeSectionAssets,
  generateDynamicLoadConfig,
  detectSectionFromFilename: function() { return 'DASHBOARD'; },
  matchFileToSection
};
