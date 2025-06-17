import { c as createComponent, b as renderTemplate, r as renderComponent, u as unescapeHTML, m as maybeRenderHead } from '../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_DsgB9yc8.mjs';
import { a as getCurrentLanguage, t } from '../chunks/Footer_BuyfVHI3.mjs';

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
