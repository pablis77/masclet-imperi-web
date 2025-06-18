/**
 * Módulo para organizar y cargar scripts por secciones
 * Organiza la carga de scripts según la estructura de la aplicación Masclet Imperi
 */

/**
 * Configuración de las secciones con sus rutas y dependencias
 * Rutas actualizadas según configuración real de la aplicación
 * IMPLEMENTACIÓN 26: Reemplazar patrones regex con listas exactas de archivos
 */
const SECTIONS = {
  // Core (siempre cargado)
  core: {
    pattern: null, // No tiene patrón URL, siempre se carga
    jsFiles: [
      // APIs y servicios core
      "apiConfig.js",
      "apiService.js", 
      "apiConfigAdapter.js", 
      "authService.js", 
      "config.js", 
      "client.js",
      "vendor.js",
      "notificationService.js",
      // Componentes de layout (carcasa fundamental)
      "Footer.js", 
      "MainLayout.js",
      "Navbar.js",
      "Sidebar.js",
      // Las siguientes son variantes hoisted que corresponden a los componentes de layout
      "hoisted.1V3GKfbn.js",
      "hoisted.a0A2-I9N.js",
      "hoisted.BaUD3TW-.js",
      "hoisted.BIqjo7BV.js"
    ],
    cssPattern: /(index|global|lemon-squeezy)/i,
    cssFiles: [
      "index.css",
      "vendor.css",
      "_id_.css"
    ],
    priority: 0 // Prioridad máxima (se carga primero)
  },

  // Login (página de entrada)
  LOGIN: {
    pattern: '/login',
    jsFiles: [
      // Componentes específicos de login
      'login.js',
      'LoginForm.js',
      'PasswordErrorModal.js',
      // Servicios y middlewares de autenticación
      'AuthMiddleware.js',
      'RoleGuard.js',
      'LoginDebugger.js',
      'ClearLocalStorage.js'
      // Los servicios apiConfigAdapter, apiService, authService ya están en core
    ],
    cssPattern: /(login)/i,
    cssFiles: [
      "logout.css"
    ],
    priority: 1
  },

  // Dashboard (principal tras login)
  DASHBOARD: {
    pattern: ['/', '/dashboard', '/index', '/dashboard-direct', '/dashboard-simple', '/dashboard-test', '/dashboard2'],
    jsFiles: [
      // Componentes principales del dashboard y dashboardv2
      'DashboardV2.js',
      'Dashboard2.js',       // Añadido según build (Dashboard2.CHYKY2KF.js)
      'DashboardNew.js',     // Añadido según build (DashboardNew.CHYKY2KF.js)
      // Componentes y secciones
      'PartosSection.js',      // Sección de estadísticas de partos (gráficos)
      'ChartComponents.js',
      'UIComponents.js',
      // Componentes de dashboardv2/cards
      'DiagnosticoDataCard.js',
      'ResumenOriginalCard.js', // Tarjetas de resumen de animales/estadísticas
      'ResumenCard.js',         // Versión alternativa de la tarjeta resumen
      // Componentes específicos
      'NotificationsMenu.js'
    ],
    cssPattern: /(dashboard|index)/i,
    priority: 2
  },

  // Explotaciones
  EXPLOTACIONES: {
    pattern: ['/explotaciones', '/explotaciones-react'], 
    jsFiles: [
      // Componente principal
      'ExplotacionesPage.js',
      // Scripts de bloqueo
      'bloquear-acciones-listados.js',
      'bloquear-actualizar-animal.js',
      'bloquear-editar-parto.js',
      'bloquear-eliminar-parto.js',
      'permissions-ui.js'
    ],
    cssPattern: /(explotacion)/i,
    priority: 3
  },

  // Animales
  ANIMALES: {
    pattern: ['/animals', '/animales'], 
    jsFiles: [
      // Componentes específicos
      'AnimalFilters.js',
      'AnimalTable.js',
      'animalService.js',
      // Formularios y componentes
      'AnimalDetailsForm.js',
      'AnimalDetailsPartoForm.js',
      'HabitualesForm.js',
      'PartoModal.js',
      'EditarPartoModal.js',
      // Scripts de bloqueo de acciones
      'bloquear-actualizar-animal.js',
      'bloquear-editar-parto.js',
      'bloquear-eliminar-parto.js',
      'permissions-ui.js'
    ],
    cssPattern: /(animal)/i,
    priority: 3
  },

  // Listados
  LISTADOS: {
    pattern: '/listados',
    jsFiles: [
      // Páginas y servicios
      'index.js',
      'visualizar.js',
      'listadosService.js', 
      'listados-service.js',
      'bloquear-acciones-listados.js',
      // Componentes específicos
      'FilterControls.js',
      'ListadoViewer.js',
      'ListadosTable.js',
      'ListadoSelector.js',
      // Utilidades y hooks
      'useFilters.js',
      'usePagination.js',
      'useSorting.js'
    ],
    cssPattern: /(listado)/i,
    priority: 3
  },

  // Usuarios 
  USUARIOS: {
    pattern: '/users',
    jsFiles: [
      // Componentes y servicios
      'UsersManagement.js',
      'UserFormModal.js',
      'UserTable.js',
      'userServiceProxy.js',
      'RoleGuard.js',
      'ConfirmDialog.js',
      // Utilidades
      'authHelpers.js',
      'tokenService.js',
      'permissions-ui.js'
    ],
    cssPattern: /(user)/i,
    priority: 4
  },

  // Importaciones
  IMPORTACIONES: {
    pattern: '/importaciones',
    jsFiles: [
      // Componentes de importación
      'ImportForm.js',
      'ImportHistoryTable.js',
      'ImportationsPage.js',
      'importationService.js',
      'ResetDatabaseButton.js',
      'ImportContainer.js',
      'ImportForm.js',
      'ImportHistory.js',
      'importService.js',
      'adminService.js',
      // Utilidades
      'fileUploader.js',
      'importFormatHelpers.js',
      // Scripts de permisos
      'permissions-ui.js'
    ],
    cssPattern: /(import)/i,
    priority: 4
  },

  // Eliminada la sección EXTRAS genérica en favor de secciones específicas

  // Copias de seguridad (singular en español 'Copias de seguridad', singular en inglés 'backup')
  BACKUP: {
    pattern: ['/backup', '/copias-seguridad', '/copias'],
    jsFiles: [
      // Páginas principales
      'backup/index.js',
      // Servicios
      'backupService.js',
      // Componentes de interfaz
      'block-delete-button.js',
      'permissions-ui.js',
      'LanguageSwitcher.js',
      'NotificationsMenu.js'
    ],
    cssPattern: /(backup|block-buttons)/i,
    priority: 4
  },
  
  // Notificaciones
  NOTIFICACIONES: {
    pattern: '/notifications',
    jsFiles: [
      'NotificationsMenu.js',
      'notificationService.js'
      // notificationService.js ya está en core
    ],
    cssPattern: /(notifi|alert)/i,
    priority: 5
  },
  
  // Mi perfil
  PERFIL: {
    pattern: '/profile',
    jsFiles: [
      'ProfileManagement.js',
      'userServiceProxy.js'
      // authService.js ya está en core
    ],
    cssPattern: /(profile|account)/i,
    priority: 5
  },
  
  // Configuración
  AJUSTES: {
    pattern: '/settings',
    jsFiles: [
      'ConfigurationComponent.js',
      'LanguageSwitcher.js'
      // apiConfig.js ya está en core
    ],
    cssPattern: /(settings|config)/i,
    priority: 5
  }
};

/**
 * Detecta la sección actual basada en la URL
 * @param {string} url - URL actual
 * @returns {string} - Nombre de la sección
 */
function detectSection(url) {
  // Si no hay URL, asumimos dashboard como principal
  if (!url) return 'DASHBOARD';
  
  // Normalizar la URL para comparación
  const cleanUrl = url.trim();
  const pathname = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  
  // Mensaje de diagnóstico (con la URL real para verificar)
  console.log(`🔍 Detectando sección para URL: '${pathname}' (original: '${url}')`);
  
  // IMPORTANTE: USAR EXACTAMENTE LA MISMA LÓGICA QUE EN INDEX.HTML
  if (pathname.includes('/login')) {
    console.log('✅ Sección encontrada: LOGIN');
    return 'LOGIN';
  } else if (pathname.includes('/explotacion')) {
    console.log('✅ Sección encontrada: EXPLOTACIONES');
    return 'EXPLOTACIONES';
  } else if (pathname.includes('/animal')) {
    console.log('✅ Sección encontrada: ANIMALES');
    return 'ANIMALES';
  } else if (pathname.includes('/listado')) {
    console.log('✅ Sección encontrada: LISTADOS');
    return 'LISTADOS';
  } else if (pathname.includes('/user')) {
    console.log('✅ Sección encontrada: USUARIOS');
    return 'USUARIOS';
  } else if (pathname.includes('/backup') || pathname.includes('/copias-seguridad') || pathname.includes('/copias')) {
    console.log('✅ Sección encontrada: BACKUPS');
    return 'BACKUPS';
  } else if (pathname.includes('/notifications')) {
    console.log('✅ Sección encontrada: NOTIFICACIONES');
    return 'NOTIFICACIONES';
  } else if (pathname.includes('/profile')) {
    console.log('✅ Sección encontrada: PERFIL');
    return 'PERFIL';
  } else if (pathname.includes('/settings')) {
    console.log('✅ Sección encontrada: AJUSTES');
    return 'AJUSTES';  
  } else if (pathname.includes('/import')) {
    console.log('✅ Sección encontrada: IMPORTACIONES');
    return 'IMPORTACIONES';
  } else {
    // Si no coincide con ninguna sección especifica, es DASHBOARD
    console.log('✅ Sección encontrada: DASHBOARD (por defecto)');
    return 'DASHBOARD';
  }
}

/**
 * Clasifica scripts por sección para cargarlos en orden adecuado
 * @param {Object} assets - Objeto con los assets detectados
 * @param {string} currentSection - Sección actual del usuario
 * @returns {Object} - Assets organizados por sección y prioridad
 */
function organizeSectionAssets(assets, currentSection = 'DASHBOARD') {
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

  // Inicializar todas las secciones conocidas
  for (const sectionName in SECTIONS) {
    if (!result[sectionName]) {
      result[sectionName] = {
        js: [],
        css: []
      };
    }
  }

  // Mapeo de componentes críticos por sección
  const CRITICAL_COMPONENTS = {
    core: [
      // Componentes de carcasa (layout)
      { name: 'Footer.js', patterns: [/Footer/, /hoisted.*/ ] },
      { name: 'MainLayout.js', patterns: [/MainLayout/, /hoisted.*/ ] },
      { name: 'Navbar.js', patterns: [/Navbar/, /hoisted.*/ ] },
      { name: 'Sidebar.js', patterns: [/Sidebar/, /hoisted.*/ ] },
    ],
    DASHBOARD: [
      // Componentes críticos de Dashboard
      { name: 'ChartComponents.js', patterns: [/ChartComponents/] },
      { name: 'UIComponents.js', patterns: [/UIComponents/] },
      { name: 'PartosSection.js', patterns: [/PartosSection/] },
      { name: 'DiagnosticoDataCard.js', patterns: [/DiagnosticoDataCard/] },
      { name: 'ResumenOriginalCard.js', patterns: [/ResumenOriginalCard/] },
    ]
  };
  
  // Cuenta de detecciones para componentes críticos con múltiples variantes (hoisted.*)
  const hoistedDetectionCount = {
    'Footer.js': 0,
    'MainLayout.js': 0,
    'Navbar.js': 0,
    'Sidebar.js': 0
  };
  
  // Función para detectar componente crítico
  function isCriticalComponent(fullPath, baseFilename, sectionName) {
    // Extrae solo el nombre del archivo de la ruta completa
    const pathParts = fullPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Obtenemos los componentes críticos para esta sección
    const criticalList = CRITICAL_COMPONENTS[sectionName] || [];
    
    // Buscamos si coincide con algún componente crítico
    const criticalMatch = criticalList.find(comp => {
      // Si es el mismo nombre base, coincide
      if (comp.name === baseFilename) {
        // Verificamos si cumple alguno de los patrones específicos
        return comp.patterns.some(pattern => pattern.test(filename));
      }
      return false;
    });
    
    // Si es un componente hoisted, controlamos la cantidad para no incluir más de uno por tipo
    if (criticalMatch && /hoisted/.test(filename)) {
      const currentCount = hoistedDetectionCount[criticalMatch.name] || 0;
      if (currentCount > 0) {
        // Ya detectamos un hoisted para este componente
        return false;
      }
      // Incrementamos contador para no repetir este componente
      hoistedDetectionCount[criticalMatch.name] = currentCount + 1;
    }
    
    return !!criticalMatch;
  }
  
  // Función auxiliar para buscar coincidencia de nombre base
  function matchesByBaseFilename(fullPath, baseFilename, sectionContext = null) {
    // Extrae solo el nombre del archivo de la ruta completa
    const pathParts = fullPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Detección inteligente de sección basada en nombre de archivo
    const fileSection = detectSectionFromFilename(filename);
    
    // Si tenemos contexto de sección y no coincide con la sección del archivo, rechazamos inmediatamente
    if (sectionContext && fileSection && sectionContext !== fileSection && 
        sectionContext.toLowerCase() !== 'core' && fileSection.toLowerCase() !== 'core') {
      // No comparamos archivos de secciones diferentes (excepto CORE que es común)
      return false;
    }
    
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
    const fileMatches = exactMatch || startsWithMatch || cleanMatch;
    
    // Eliminados logs de comparación que saturan la consola
    
    return fileMatches;
  }
  
  // Función auxiliar para detectar sección basada en nombre de archivo
  function detectSectionFromFilename(filename) {
    const lowerFilename = filename.toLowerCase();
    const pathParts = filename.split('/');
    
    // Si está en una ruta específica, usar esa información
    if (pathParts.length > 2) {
      // Patrones de ruta específicos tienen prioridad sobre nombres
      if (pathParts.some(part => part === 'dashboard' || part === 'dashboardv2')) {
        return 'DASHBOARD';
      }
      if (pathParts.some(part => part === 'explotaciones' || part === 'explotacion')) {
        return 'EXPLOTACIONES';
      }
      if (pathParts.some(part => part === 'animal' || part === 'animales')) {
        return 'ANIMALES';
      }
      if (pathParts.some(part => part === 'listado' || part === 'listados')) {
        return 'LISTADOS';
      }
      if (pathParts.some(part => part === 'usuario' || part === 'usuarios' || part === 'user')) {
        return 'USUARIOS';
      }
      if (pathParts.some(part => part === 'importaciones' || part === 'import')) {
        return 'IMPORTACIONES';
      }
      if (pathParts.some(part => part === 'backup' || part === 'copias-seguridad')) {
        return 'BACKUPS';
      }
    }
    
    // Patrones de detección estrictos por prefijo del nombre de archivo
    // SOLO detectamos por prefijo, no por substrings en cualquier parte
    if (lowerFilename.startsWith('dashboard') || lowerFilename.startsWith('panel')) {
      return 'DASHBOARD';
    } else if (lowerFilename.startsWith('explotacion')) {
      return 'EXPLOTACIONES';
    } else if (lowerFilename.startsWith('animal') || lowerFilename.startsWith('vaca') || 
               lowerFilename.startsWith('toro')) {
      return 'ANIMALES';
    } else if (lowerFilename.startsWith('listado') || lowerFilename.startsWith('report') || 
               lowerFilename.startsWith('informe')) {
      return 'LISTADOS';
    } else if (lowerFilename.startsWith('user') || lowerFilename.startsWith('usuario') || 
               lowerFilename.startsWith('login') || lowerFilename.startsWith('auth')) {
      return 'USUARIOS';
    } else if (lowerFilename.startsWith('import')) {
      return 'IMPORTACIONES';
    } else if (lowerFilename.startsWith('backup') || lowerFilename.startsWith('copia') || 
               lowerFilename.startsWith('restore')) {
      return 'BACKUPS';
    } else if (lowerFilename.startsWith('api') || lowerFilename.startsWith('config') || 
               lowerFilename.startsWith('vendor') || lowerFilename.startsWith('lang') || 
               lowerFilename.startsWith('service') || lowerFilename.startsWith('notifi') || 
               lowerFilename.startsWith('hoisted') || lowerFilename.startsWith('common')) {
      return 'CORE'; // Componentes compartidos/core
    }
    
    return null; // No se pudo determinar la sección
  }

  // 1. Procesar scripts CORE (siempre cargan)
  const coreConfig = SECTIONS.core;
  if (coreConfig.jsFiles && Array.isArray(coreConfig.jsFiles)) {
    // Buscar en todos los JS que coincidan con los archivos listados
    if (assets.allJs) {
      assets.allJs.forEach(script => {
        // Primero verificamos si es un componente crítico de core
        if (isCriticalComponent(script, 'hoisted.js', 'core') || 
            coreConfig.jsFiles.some(jsFile => matchesByBaseFilename(script, jsFile))) {
          if (!result.core) result.core = { js: [], css: [] };
          addScriptToSection('core', script);
        }
      });
    }
  }

  // Procesar CSS del core
  if (coreConfig.cssPattern) {
    // Buscar en todos los CSS que coincidan con el patrón
    if (assets.allCss) {
      const matchingCss = assets.allCss.filter(css => coreConfig.cssPattern.test(css));
      result.core.css.push(...matchingCss);
    }
  }

  // 2. Procesar scripts específicos para la sección actual
  const currentConfig = SECTIONS[currentSection] || SECTIONS.DASHBOARD;
  
  // IMPORTANTE: Garantizar que los scripts de la sección actual se procesen PRIMERO
  // antes que cualquier otra sección para evitar mezcla
  if (currentConfig && currentConfig.jsFiles && Array.isArray(currentConfig.jsFiles)) {
    // Array para guardar scripts específicos de la sección actual
    const currentSectionScripts = [];
    
    if (assets.allJs) {
      // Primero seleccionamos los scripts de la sección actual
      assets.allJs.forEach(script => {
        // Ignorar archivos de favicon que causan 404
        if (script.includes('favicon.ico') || script.includes('favico.ico')) {
          return; // Ignorar estos archivos
        }
        
        // Verificar si el script pertenece a la sección actual por nombre exacto
        if (currentConfig.jsFiles.some(jsFile => matchesByBaseFilename(script, jsFile, currentSection))) {
          currentSectionScripts.push(script);
        }
      });
      
      // Ahora procesar estos scripts prioritarios
      currentSectionScripts.forEach(script => {
        if (!result[currentSection]) result[currentSection] = { js: [], css: [] };
        addScriptToSection(currentSection, script);
      });
      
      // Ahora continuamos con el resto de scripts como antes
      // Iterar por todos los scripts .js disponibles para otras secciones
      assets.allJs.forEach(script => {
        // Ignorar archivos de favicon que causan 404
        if (script.includes('favicon.ico') || script.includes('favico.ico')) {
          return; // Ignorar estos archivos
        }
        
        // Determinar a qué sección pertenece este script
        let sectionFound = false;

        // Primero intentar por coincidencia exacta con jsFiles
        Object.entries(SECTIONS).forEach(([sectionName, sectionConfig]) => {
          if (sectionConfig.jsFiles && Array.isArray(sectionConfig.jsFiles)) {
            // Verificar tanto por componente crítico como por coincidencia normal
            if (isCriticalComponent(script, 'any', sectionName) || 
                sectionConfig.jsFiles.some(jsFile => matchesByBaseFilename(script, jsFile))) {
              sectionFound = true;
              if (sectionName === currentSection) {
                // Usar el nombre dinámico de la sección actual, no hardcodearlo como DASHBOARD
                if (!result[currentSection]) result[currentSection] = { js: [], css: [] };
                addScriptToSection(currentSection, script);
                
                // Log específico para componentes de DASHBOARD
                if (currentSection === 'DASHBOARD') {
                  console.log(`✅ Añadido script a DASHBOARD: ${script.split('/').pop()}`);
                }
              } else {
                // Añadir directamente a la sección en el nivel raíz
                if (!result[sectionName]) result[sectionName] = { js: [], css: [] };
                addScriptToSection(sectionName, script);
              }  
            }
          }
        });

        // Si no se encontró con comparación exacta, intentar por basename (sin hash)
        if (!sectionFound && !script.includes('favicon.ico') && !script.includes('favico.ico')) {
          Object.entries(SECTIONS).forEach(([sectionName, sectionConfig]) => {
            if (sectionConfig.jsFiles && Array.isArray(sectionConfig.jsFiles)) {
              const scriptName = script.replace(/\.([A-Za-z0-9_\-]+)\.js$/, '.js');
              if (sectionConfig.jsFiles.some(jsFile => scriptName === jsFile)) {
                sectionFound = true;
                if (sectionName === currentSection) {
                  // Usar el nombre dinámico de la sección actual, no hardcodearlo como DASHBOARD
                  if (!result[currentSection]) result[currentSection] = { js: [], css: [] };
                  addScriptToSection(currentSection, script);
                } else {
                  // Añadir directamente a la sección en el nivel raíz
                  if (!result[sectionName]) result[sectionName] = { js: [], css: [] };
                  addScriptToSection(sectionName, script);
                }
              }
            }
          });
        }
      });
    }
    
    // Procesar CSS específico de la sección actual
    if (currentConfig.cssPattern) {
      if (assets.allCss) {
        const matchingCss = assets.allCss.filter(css => 
          currentConfig.cssPattern.test(css) && 
          !result.core.css.includes(css)
        );
        result[currentSection].css.push(...matchingCss);
      }
    }
  }

  // 3. Procesar scripts de otras secciones (se cargan bajo demanda)
  // Ya organizados previamente
  for (const sectionName in SECTIONS) {
    if (sectionName === 'CORE' || sectionName === 'core') continue; // CORE se procesa después
    
    const section = SECTIONS[sectionName];
    const jsFiles = section.jsFiles || [];
    let matchingJs = [];
    
    if (jsFiles && jsFiles.length > 0) {
      // Buscar coincidencias exactas para esta sección
      for (const jsFile of jsFiles) {
        // Usar coincidencia por nombre base (sin extensión ni path)
        const matches = assets.allJs.filter(jsPath => matchesByBaseFilename(jsPath, jsFile, sectionName));
        if (matches && matches.length > 0) {
          matchingJs.push(...matches);
        }
      }
      
      // Inicializar la sección en result si no existe
      if (!result[sectionName]) result[sectionName] = { js: [], css: [] };
      
      if (matchingJs.length > 0) {
        // Añadir scripts encontrados directamente a la sección
        result[sectionName].js.push(...matchingJs);
        console.log(`Sección ${sectionName}: Encontrados ${matchingJs.length} scripts específicos`);
      }
      
      if (section.cssPattern) {
        if (assets.allCss) {
          const matchingCss = assets.allCss.filter(css => {
            const notInCore = !result.core || !result.core.css || !result.core.css.includes(css);
            const notInCurrent = !result.current || !result.current.css || !result.current.css.includes(css);
            return section.cssPattern.test(css) && notInCore && notInCurrent;
          });
          
          // Agregar a la lista de css de otras secciones
          if (matchingCss.length) {
            if (!result.other.sections) result.other.sections = {};
            if (!result.other.sections[sectionName]) result.other.sections[sectionName] = { js: [], css: [] };
            result.other.sections[sectionName].css.push(...matchingCss);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Genera la configuración de carga dinámica para el HTML
 * @param {Object} organizedAssets - Assets organizados por sección
 * @returns {string} - Script JS para configuración dinámica de carga
 */
function generateDynamicLoadConfig(organizedAssets) {
  console.log('DEBUG - Claves de organizedAssets:', Object.keys(organizedAssets));
  
  // Inicializar la configuración con core y other siempre
  const assetsConfig = {
    core: {
      js: organizedAssets.core?.js || [],
      css: organizedAssets.core?.css || []
    },
    other: {
      js: organizedAssets.other?.js || [],
      css: organizedAssets.other?.css || []
    }
  };
  
  // Añadir todas las secciones detectadas (excepto core y other que ya están añadidas)
  for (const sectionName in organizedAssets) {
    if (sectionName !== 'core' && sectionName !== 'other') {
      assetsConfig[sectionName] = {
        js: organizedAssets[sectionName]?.js || [],
        css: organizedAssets[sectionName]?.css || []
      };
    }
  }
  
  // Contar el total de scripts que se cargarán
  let totalScripts = (assetsConfig.core?.js || []).length;
  for (const section in assetsConfig) {
    if (section !== 'core' && section !== 'other') {
      totalScripts += (assetsConfig[section]?.js || []).length;
    }
  }
  
  return `
  <script>
    // Configuración de carga de assets por sección
    window.mascletAssets = ${JSON.stringify(assetsConfig, null, 2)};


    // Estado de carga
    window.mascletLoader = {
      loaded: 0,
      total: ${organizedAssets.core.js.length + organizedAssets.current.js.length},
      failed: [],
      complete: false
    };
  </script>`;
}

module.exports = {
  detectSection,
  organizeSectionAssets,
  generateDynamicLoadConfig,
  SECTIONS
};
