/**
 * Módulo para organizar y cargar scripts por secciones
 * Organiza la carga de scripts según la estructura de la aplicación Masclet Imperi
 */

/**
 * Configuración de las secciones con sus rutas y dependencias
 * Rutas actualizadas según configuración real de la aplicación
 */
const SECTIONS = {
  // Núcleo común (cargado siempre)
  CORE: {
    pattern: '*',
    required: ['vendor', 'config', 'apiConfig', 'apiService', 'authService'],
    css: ['vendor', 'index']
  },
  
  // Login (página de entrada)
  LOGIN: {
    pattern: '/login',
    jsPattern: /(login|auth)/i,
    cssPattern: /(login|index)/i,
    priority: 1
  },
  
  // Logout (cierre de sesión)
  LOGOUT: {
    pattern: '/logout',
    jsPattern: /(logout|auth)/i,
    cssPattern: /(logout|auth)/i,
    priority: 1
  },

  // Dashboard (principal tras login)
  DASHBOARD: {
    pattern: '/',
    jsPattern: /(dashboard|charts?|notification)/i,
    cssPattern: /(dashboard|index)/i,
    priority: 2
  },
  
  // Explotaciones
  EXPLOTACIONES: {
    pattern: '/explotaciones-react',
    jsPattern: /(explotacion|farm)/i,
    cssPattern: /(explotacion)/i,
    priority: 3
  },
  
  // Animales
  ANIMALES: {
    pattern: '/animals',
    jsPattern: /(animal|cow|bull)/i,
    cssPattern: /(animal)/i,
    priority: 4
  },
  
  // Listados
  LISTADOS: {
    pattern: '/listados',
    jsPattern: /(listados|list|table)/i,
    cssPattern: /(listados|list)/i,
    priority: 5
  },
  
  // Usuarios
  USERS: {
    pattern: '/users',
    jsPattern: /(users|user|admin)/i,
    cssPattern: /(users|user)/i,
    priority: 6
  },
  
  // Importaciones
  IMPORTS: {
    pattern: '/imports',
    jsPattern: /(import|csv|upload)/i,
    cssPattern: /(import|upload)/i,
    priority: 7
  },
  
  // Copias de seguridad
  BACKUP: {
    pattern: '/backup',
    jsPattern: /(backup|export)/i,
    cssPattern: /(backup|export)/i,
    priority: 8
  },
  
  // Alertas y notificaciones
  NOTIFICATIONS: {
    pattern: '/notifications',
    jsPattern: /(notifi|alert)/i,
    cssPattern: /(notifi|alert)/i,
    priority: 9
  },
  
  // Mi perfil
  PROFILE: {
    pattern: '/profile',
    jsPattern: /(profile|account|user)/i,
    cssPattern: /(profile|account)/i,
    priority: 10
  },
  
  // Configuración
  SETTINGS: {
    pattern: '/settings',
    jsPattern: /(settings|config|configuracion)/i,
    cssPattern: /(settings|config)/i,
    priority: 11
  },
  
  // Fin de las secciones
};

/**
 * Detecta la sección actual basada en la URL
 * @param {string} url - URL actual
 * @returns {string} - Nombre de la sección
 */
function detectSection(url) {
  // Si no hay URL, asumimos dashboard como principal
  if (!url) return 'DASHBOARD';
  
  // Verificar cada sección por patrón de URL
  for (const [section, config] of Object.entries(SECTIONS)) {
    if (section === 'CORE') continue; // CORE no es una sección por URL
    
    if (url.includes(config.pattern)) {
      return section;
    }
  }
  
  // Por defecto devolvemos DASHBOARD
  return 'DASHBOARD';
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
    current: {
      js: [],
      css: []
    },
    other: {
      js: [],
      css: []
    }
  };

  // 1. Procesar scripts CORE (siempre cargan)
  const coreConfig = SECTIONS.CORE;
  if (coreConfig.required && Array.isArray(coreConfig.required)) {
    coreConfig.required.forEach(requiredAsset => {
      const pattern = new RegExp(requiredAsset, 'i');
      
      // Buscar en todos los JS
      if (assets.allJs) {
        const matchingJs = assets.allJs.filter(js => pattern.test(js));
        result.core.js.push(...matchingJs);
      }
    });
  }

  // Procesar CSS del core
  if (coreConfig.css && Array.isArray(coreConfig.css)) {
    coreConfig.css.forEach(cssAsset => {
      const pattern = new RegExp(cssAsset, 'i');
      
      // Buscar en todos los CSS
      if (assets.allCss) {
        const matchingCss = assets.allCss.filter(css => pattern.test(css));
        result.core.css.push(...matchingCss);
      }
    });
  }

  // 2. Procesar scripts específicos para la sección actual
  const currentConfig = SECTIONS[currentSection];
  if (currentConfig && currentConfig.jsPattern) {
    if (assets.allJs) {
      const matchingJs = assets.allJs.filter(js => 
        currentConfig.jsPattern.test(js) && 
        !result.core.js.includes(js)
      );
      result.current.js.push(...matchingJs);
    }
    
    if (assets.allCss && currentConfig.cssPattern) {
      const matchingCss = assets.allCss.filter(css => 
        currentConfig.cssPattern.test(css) && 
        !result.core.css.includes(css)
      );
      result.current.css.push(...matchingCss);
    }
  }

  // 3. Resto de scripts que no son del CORE ni de la sección actual
  if (assets.allJs) {
    const otherJs = assets.allJs.filter(js => 
      !result.core.js.includes(js) && 
      !result.current.js.includes(js)
    );
    
    // Limitamos a solo los que puedan ser útiles para no sobrecargar
    // Estos se cargarán en diferido
    if (otherJs.length > 0) {
      result.other.js = otherJs.slice(0, 5); // Limitamos a 5 scripts adicionales
    }
  }

  // 4. Procesar scripts críticos requeridos que no hayan sido detectados en las secciones anteriores
  if (assets.required) {
    Object.entries(assets.required).forEach(([key, path]) => {
      // Solo JS
      if (path.endsWith('.js')) {
        if (!result.core.js.includes(path) && !result.current.js.includes(path)) {
          result.core.js.push(path); // Lo consideramos crítico si está en required
        }
      }
      // CSS
      else if (path.endsWith('.css')) {
        if (!result.core.css.includes(path) && !result.current.css.includes(path)) {
          result.core.css.push(path);
        }
      }
    });
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
