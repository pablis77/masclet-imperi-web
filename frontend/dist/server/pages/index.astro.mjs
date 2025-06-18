import { c as createComponent, m as maybeRenderHead, r as renderComponent, b as renderTemplate, u as unescapeHTML } from '../chunks/vendor_XrHmsJ5B.mjs';
export { e as renderers } from '../chunks/vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_CQEYGpDK.mjs';
import 'react/jsx-runtime';
import 'react';
import { a as getCurrentLanguage, t } from '../chunks/Footer_CbdEWwuE.mjs';

/**
 * Utilidad para acceso seguro al DOM
 * Evita errores de referencia null cuando los elementos no existen
 */

/**
 * Obtiene un elemento del DOM de forma segura
 * @param {string} selector - Selector CSS del elemento
 * @param {boolean} waitForLoad - Si es true, espera a que el DOM esté cargado
 * @param {Function} callback - Función a ejecutar si se encuentra el elemento
 * @returns {HTMLElement|null} - El elemento encontrado o null
 */
function safeGetElement(selector, waitForLoad = false, callback = null) {
  // Si waitForLoad es true, esperar al evento DOMContentLoaded
  if (waitForLoad) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const element = document.querySelector(selector);
        if (element && callback) {
          callback(element);
        }
        return element;
      });
      return null;
    }
  }
  
  // Intentar obtener el elemento directamente
  const element = document.querySelector(selector);
  if (element && callback) {
    callback(element);
  }
  return element;
}

/**
 * Ejecuta una función cuando el DOM esté listo
 * @param {Function} callback - Función a ejecutar
 */
function onDOMReady(callback) {
  if (typeof document === 'undefined') {
    // En SSR no hay document, no ejecutamos nada
    return;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Aplica una función a un elemento solo si existe
 * @param {string} selector - Selector CSS del elemento
 * @param {Function} callback - Función a aplicar
 */
function withElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  }
}

/**
 * Aplica una función a múltiples elementos solo si existen
 * @param {string} selector - Selector CSS para los elementos
 * @param {Function} callback - Función a aplicar a cada elemento
 */
function withElements(selector, callback) {
  const elements = document.querySelectorAll(selector);
  if (elements && elements.length > 0) {
    elements.forEach(callback);
  }
}

/**
 * Comprueba si un elemento existe en el DOM
 * @param {string} selector - Selector CSS del elemento
 * @returns {boolean} - True si existe, false si no
 */
function elementExists(selector) {
  return document.querySelector(selector) !== null;
}

/**
 * Espera a que un elemento aparezca en el DOM
 * @param {string} selector - Selector CSS del elemento
 * @param {number} maxAttempts - Número máximo de intentos
 * @param {number} interval - Intervalo entre intentos (ms)
 * @returns {Promise<HTMLElement>} - Promesa que se resuelve con el elemento
 */
function waitForElement(selector, maxAttempts = 10, interval = 300) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkElement = () => {
      attempts++;
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
        return;
      }
      
      if (attempts >= maxAttempts) {
        reject(new Error(`Elemento ${selector} no encontrado después de ${maxAttempts} intentos`));
        return;
      }
      
      setTimeout(checkElement, interval);
    };
    
    checkElement();
  });
}

// Exportar un objeto global que puede ser accedido desde cualquier script
if (typeof window !== 'undefined') {
  window.DOMSafeAccess = {
    safeGetElement,
    onDOMReady,
    withElement,
    withElements,
    elementExists,
    waitForElement
  };
}

/**
 * Protección global contra errores de DOM
 * Este script implementa protección automática contra errores de acceso al DOM
 * Se debe importar en el entry point de la aplicación
 */


// Ejecutar cuando el DOM esté listo
onDOMReady(() => {
  console.log('🛡️ Inicializando protección DOM');
  
  // Monkeypatching del método querySelector
  const originalQuerySelector = Document.prototype.querySelector;
  Document.prototype.querySelector = function(selector) {
    try {
      return originalQuerySelector.call(this, selector);
    } catch (error) {
      console.warn(`⚠️ Error al buscar selector: ${selector}`, error);
      return null;
    }
  };
  
  // Monkeypatching del método querySelectorAll
  const originalQuerySelectorAll = Document.prototype.querySelectorAll;
  Document.prototype.querySelectorAll = function(selector) {
    try {
      return originalQuerySelectorAll.call(this, selector);
    } catch (error) {
      console.warn(`⚠️ Error al buscar selector múltiple: ${selector}`, error);
      return [];
    }
  };
  
  // Monkeypatching para proteger el acceso a textContent
  const originalDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  
  Object.defineProperty(Node.prototype, 'textContent', {
    get: function() {
      return originalDescriptor.get.call(this);
    },
    set: function(value) {
      try {
        if (this) {
          originalDescriptor.set.call(this, value);
        } else {
          console.warn('⚠️ Intento de acceder a textContent en un elemento nulo');
        }
      } catch (error) {
        console.warn('⚠️ Error al establecer textContent:', error);
      }
      return value;
    },
    configurable: true
  });
  
  // Capturar errores no controlados
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('Cannot set properties of null')) {
      console.warn('🔴 Error DOM interceptado:', event.error.message);
      // Prevenir que el error se propague y aparezca en la consola
      event.preventDefault();
    }
  });
  
  console.log('✅ Protección DOM inicializada');
});

// Exportar un objeto global para acceso desde cualquier parte
const DOMProtection = {
  isActive: true,
  version: '1.0.0'
};

// Auto-inicializar
if (typeof window !== 'undefined') {
  window.DOMProtection = DOMProtection;
}

if (typeof DOMProtection !== "undefined") {
  console.log("✅ DOMProtection cargada correctamente");
}

createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Este componente no se usa directamente en la interfaz, solo existe para forzar que MainLayout.tsx se incluya en el build -->${maybeRenderHead()}<div style="display:none" id="main-layout-wrapper"> ${renderComponent($$result, "MainLayoutReact", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/MainLayout", "client:component-export": "default" }, { "default": ($$result2) => renderTemplate` <p>Contenido placeholder</p> ` })} </div>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/wrappers/MainLayoutWrapper.astro", void 0);

createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Este componente no se usa directamente en la interfaz, solo existe para forzar que Navbar.tsx se incluya en el build -->${maybeRenderHead()}<div style="display:none" id="navbar-wrapper"> ${renderComponent($$result, "NavbarReact", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/Navbar", "client:component-export": "default" })} </div>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/wrappers/NavbarWrapper.astro", void 0);

createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Este componente no se usa directamente en la interfaz, solo existe para forzar que Sidebar.tsx se incluya en el build -->${maybeRenderHead()}<div style="display:none" id="sidebar-wrapper"> ${renderComponent($$result, "SidebarReact", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/Sidebar", "client:component-export": "default" })} </div>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/wrappers/SidebarWrapper.astro", void 0);

createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Este componente no se usa directamente en la interfaz, solo existe para forzar que Footer.tsx se incluya en el build -->${maybeRenderHead()}<div style="display:none" id="footer-wrapper"> ${renderComponent($$result, "FooterReact", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/Footer", "client:component-export": "default" })} </div>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/wrappers/FooterWrapper.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const userRole = "administrador";
  const currentLang = getCurrentLanguage();
  let welcomeText = t("common.welcome", currentLang);
  if (welcomeText === "common.welcome") {
    welcomeText = currentLang === "ca" ? "Benvingut a Masclet Imperi" : "Bienvenido a Masclet Imperi";
  }
  const updateWelcomeScript = `
document.addEventListener('DOMContentLoaded', () => {
  const welcomeElement = document.querySelector('h1.welcome-title');
  if (welcomeElement) {
    // Actualizar t\xEDtulo cuando cambie el idioma
    const updateTitle = () => {
      const lang = localStorage.getItem('userLanguage') || 'es';
      
      // Usar valores predeterminados garantizados seg\xFAn el idioma
      // Esto asegura que siempre se muestre correctamente incluso si falla la traducci\xF3n
      let welcomeText = 'Bienvenido a Masclet Imperi';
      if (lang === 'ca') {
        welcomeText = 'Benvingut a Masclet Imperi';
      }
      
      // Intentar obtener traducciones desde la API i18n como respaldo
      try {
        const i18n = window.i18next || { t: (key) => key };
        const translatedText = i18n.t('common.welcome');
        // Solo usar la traducci\xF3n si no es igual a la clave (indica que la traducci\xF3n funcion\xF3)
        if (translatedText && translatedText !== 'common.welcome') {
          welcomeText = translatedText;
        }
      } catch (error) {
        console.warn('Error al traducir texto de bienvenida:', error);
      }
      
      // Aplicar el texto
      welcomeElement.textContent = welcomeText;
    };
    
    // Actualizar inmediatamente
    updateTitle();
    
    // Escuchar cambios en el almacenamiento
    window.addEventListener('storage', (event) => {
      if (event.key === 'userLanguage') {
        updateTitle();
      }
    });
  }
});
`;
  return renderTemplate(_a || (_a = __template(["<!-- Script para crear token JWT autom\xE1ticamente en desarrollo con comprobaci\xF3n mejorada --> <!-- Script para actualizar el t\xEDtulo cuando cambia el idioma --><script>", "<\/script> <!-- Script adicional para forzar la traducci\xF3n directa como respaldo total --> ", ""])), unescapeHTML(updateWelcomeScript), renderComponent($$result, "MainLayout", $$MainLayout, { "title": `${t("dashboard.title", currentLang)} - Masclet Imperi`, "userRole": userRole, "currentPath": "/" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto px-4 py-6 bg-white dark:bg-gray-900"> <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-8 welcome-title">${welcomeText}</h1> <!-- Componente DashboardV2 optimizado - Renderizado solo en el cliente --> ${renderComponent($$result2, "DashboardV2", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2", "client:component-export": "default" })} <!-- Botones de prueba eliminados --> </div> ` }));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=index.astro.mjs.map
