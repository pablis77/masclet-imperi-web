import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_BVudR5Na.mjs';
import { a as getCurrentLanguage } from '../chunks/Footer_CznfbLiE.mjs';

const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  const userRole = "administrador";
  const currentLang = getCurrentLanguage();
  const translations = {
    es: {
      title: "Panel de Control"
    },
    ca: {
      title: "Tauler de Control"
    }
  };
  function t(key) {
    return translations[currentLang]?.[key] || key;
  }
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Dashboard", "userRole": userRole, "currentPath": "/dashboard" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto px-4 py-6"> <h1 class="text-3xl font-bold text-gray-800 mb-8">${t("title")}</h1> <!-- Nuevo componente Dashboard mejorado - Renderizado solo en el cliente --> ${renderComponent($$result2, "DashboardNew", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/DashboardNew", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
