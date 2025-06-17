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
  CORE: {
    pattern: null, // No tiene patrón URL, siempre se carga
    jsFiles: [
      // Archivos core principales - usar nombre base sin ruta
      'apiConfig.js',
      'apiConfigAdapter.js',
      'apiService.js',
      'notificationService.js', 
      'authService.js',
      'vendor.js',       // Vendor scripts
      'client.js',       // Cliente Astro
      'hoisted.js',      // Scripts elevados
      'config.js'        // Configuración
    ],
    cssPattern: /(index|global|lemon-squeezy)/i,
    priority: 0 // Prioridad máxima (se carga primero)
  },

  // Login (página de entrada)
  LOGIN: {
    pattern: '/login',
    jsFiles: [
      'src/components/modals/PasswordErrorModal.tsx',
      'src/pages/login.astro'
    ],
    cssPattern: /(login)/i,
    priority: 1
  },

  // Dashboard (principal tras login)
  DASHBOARD: {
    pattern: ['/', '/dashboard', '/index', '/dashboard-direct', '/dashboard-simple', '/dashboard-test', '/dashboard2'],
    jsFiles: [
      // Componentes principales del dashboard
      'DashboardV2.js',
      'PartosSection.js',
      'ChartComponents.js',
      'UIComponents.js',
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
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
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
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
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
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
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
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
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
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
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
      // Scripts de permisos
      'permissions-ui.js'
    ],
    cssPattern: /(import)/i,
    priority: 4
  },

  // Extras y utilidades
  EXTRAS: {
    pattern: '/extras',
    jsFiles: [
      // Componentes de extras
      'BackupComponent.js',
      'ConfigurationComponent.js',
      'LanguageSwitcher.js',
      'MessageContainer.js',
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
      // Scripts de utilidades
      'permissions-ui.js'
    ],
    cssPattern: /(extra|backup|config)/i,
    priority: 5
  },

  // Backups
  BACKUPS: {
    pattern: ['/backup', '/copias-seguridad', '/copias'],
    jsFiles: [
      // Componentes específicos de backup
      'BackupComponent.js',
      'BackupCreationForm.js',
      'BackupHistoryTable.js',
      'BackupRestoreForm.js',
      'backupService.js',
      // Componentes de layout
      'Footer.js',
      'MainLayout.js',
      'Navbar.js',
      'Sidebar.js',
      // Utilidades
      'fileUploader.js',
      'permissions-ui.js',
      'block-delete-button.js'
    ],
    cssPattern: /(backup)/i,
    priority: 4
  },
  
  // Notificaciones
  NOTIFICACIONES: {
    pattern: '/notifications',
    jsFiles: [
      'src/components/notifications/NotificationsMenu.js'
    ],
    cssPattern: /(notifi|alert)/i,
    priority: 5
  },
  
  // Mi perfil
  PERFIL: {
    pattern: '/profile',
    jsFiles: [
      'src/services/userServiceProxy.ts'
    ],
    cssPattern: /(profile|account)/i,
    priority: 5
  },
  
  // Configuración
  AJUSTES: {
    pattern: '/settings',
    jsFiles: [
      'src/config/apiConfig.centralizado.ts'
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
  } else if (pathname.includes('/import')) {
    console.log('✅ Sección encontrada: IMPORTACION');
    return 'IMPORTACION';
  } else if (pathname.includes('/backup')) {
    console.log('✅ Sección encontrada: BACKUPS');
    return 'BACKUPS';
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
    core: {
      js: [],
      css: []
    },
    DASHBOARD: { // Cambiado de 'current' a 'DASHBOARD' para alinear con detectSection
      js: [],
      css: []
    },
    other: {
      js: [],
      css: []
    }
  };

  // Función auxiliar para buscar coincidencia de nombre base
  function matchesByBaseFilename(fullPath, baseFilename, sectionContext = null) {
    // Extrae solo el nombre del archivo de la ruta completa
    const pathParts = fullPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Detección inteligente de sección basada en nombre de archivo
    const fileSection = detectSectionFromFilename(filename);
    
    // Si tenemos contexto de sección y no coincide con la sección del archivo, rechazamos inmediatamente
    if (sectionContext && fileSection && sectionContext !== fileSection && 
        sectionContext !== 'CORE' && fileSection !== 'CORE') {
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
    
    // Log para depuración (solo si hay coincidencia o es relevante)
    if (fileMatches || (!sectionContext || sectionContext === fileSection)) {
      console.log(`Comparando: ${filename} con ${baseFilename} => ${fileMatches ? 'COINCIDE' : 'NO coincide'}`);
    }
    
    return fileMatches;
  }
  
  // Función auxiliar para detectar sección basada en nombre de archivo
  function detectSectionFromFilename(filename) {
    const lowerFilename = filename.toLowerCase();
    
    // Patrones de detección por sección
    if (/dashboard|panel/i.test(lowerFilename)) {
      return 'DASHBOARD';
    } else if (/explotacion/i.test(lowerFilename)) {
      return 'EXPLOTACIONES';
    } else if (/animal|vaca|toro|masclet/i.test(lowerFilename)) {
      return 'ANIMALES';
    } else if (/listado|report|informe/i.test(lowerFilename)) {
      return 'LISTADOS';
    } else if (/user|usuario|login|auth/i.test(lowerFilename)) {
      return 'USUARIOS';
    } else if (/import|csv|excel/i.test(lowerFilename)) {
      return 'IMPORTACIONES';
    } else if (/backup|copia|restore/i.test(lowerFilename)) {
      return 'BACKUPS';
    } else if (/api|config|vendor|lang|service|notifi|hoisted|common/i.test(lowerFilename)) {
      return 'CORE'; // Componentes compartidos/core
    }
    
    return null; // No se pudo determinar la sección
  }

  // 1. Procesar scripts CORE (siempre cargan)
  const coreConfig = SECTIONS.CORE;
  if (coreConfig.jsFiles && Array.isArray(coreConfig.jsFiles)) {
    // Buscar en todos los JS que coincidan con los archivos listados
    if (assets.allJs) {
      const matchingJs = assets.allJs.filter(jsPath => {
        return coreConfig.jsFiles.some(jsFile => matchesByBaseFilename(jsPath, jsFile));
      });
      result.core.js.push(...matchingJs);
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
  if (currentConfig && currentConfig.jsFiles && Array.isArray(currentConfig.jsFiles)) {
    if (assets.allJs) {
      // Iterar por todos los scripts .js disponibles
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
            if (sectionConfig.jsFiles.some(jsFile => matchesByBaseFilename(script, jsFile))) {
              sectionFound = true;
              if (sectionName === currentSection) {
                result.DASHBOARD.js.push(script);
              } else {
                if (!result.other.sections) result.other.sections = {};
                if (!result.other.sections[sectionName]) result.other.sections[sectionName] = { js: [], css: [] };
                result.other.sections[sectionName].js.push(script);
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
                  result.DASHBOARD.js.push(script);
                } else {
                  if (!result.other.sections) result.other.sections = {};
                  if (!result.other.sections[sectionName]) result.other.sections[sectionName] = { js: [], css: [] };
                  result.other.sections[sectionName].js.push(script);
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
        result.DASHBOARD.css.push(...matchingCss);
      }
    }
  }

  // 3. Procesar scripts de otras secciones (se cargan bajo demanda)
  for (const sectionName in SECTIONS) {
    if (sectionName === 'CORE' || sectionName === currentSection) continue;
    
    const sectionConfig = SECTIONS[sectionName];
    
    // Procesar JS de esta sección secundaria
    if (sectionConfig.jsFiles && Array.isArray(sectionConfig.jsFiles)) {
      if (assets.allJs) {
        const matchingJs = assets.allJs.filter(jsPath => {
          // No incluir en otras secciones scripts ya incluidos en core o sección actual
          return sectionConfig.jsFiles.some(jsFile => matchesByBaseFilename(jsPath, jsFile)) && 
                 !result.core.js.includes(jsPath) &&
                 !result.DASHBOARD.js.includes(jsPath);
        });
        
        // Agregar a la lista de scripts de otras secciones
        if (matchingJs.length) {
          console.log(`Sección ${sectionName}: Encontrados ${matchingJs.length} scripts específicos`);
          if (!result.other.sections) result.other.sections = {};
          if (!result.other.sections[sectionName]) result.other.sections[sectionName] = { js: [], css: [] };
          result.other.sections[sectionName].js.push(...matchingJs);
        }
      }
      
      // Procesar CSS secundarios
      if (sectionConfig.cssPattern) {
        if (assets.allCss) {
          const matchingCss = assets.allCss.filter(css => 
            sectionConfig.cssPattern.test(css) && 
            !result.core.css.includes(css) && 
            !result.current.css.includes(css)
          );
          
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
  const coreJS = JSON.stringify(organizedAssets.core.js);
  const currentJS = JSON.stringify(organizedAssets.current.js);
  const otherJS = JSON.stringify(organizedAssets.other.js);
  const coreCSS = JSON.stringify(organizedAssets.core.css);
  const currentCSS = JSON.stringify(organizedAssets.current.css);
  
  return `
  <script>
    // Configuración de carga de assets por sección
    window.mascletAssets = {
      core: {
        js: ${coreJS},
        css: ${coreCSS}
      },
      current: {
        js: ${currentJS},
        css: ${currentCSS}
      },
      other: {
        js: ${otherJS},
        css: []
      }
    };

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
