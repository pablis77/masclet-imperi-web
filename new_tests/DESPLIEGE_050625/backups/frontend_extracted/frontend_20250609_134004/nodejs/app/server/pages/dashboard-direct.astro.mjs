import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_BVudR5Na.mjs';
import { a as getCurrentLanguage, t } from '../chunks/Footer_CznfbLiE.mjs';

const $$DashboardDirect = createComponent(($$result, $$props, $$slots) => {
  const userRole = "administrador";
  const lang = getCurrentLanguage();
  const title = t("dashboard_direct.title", lang);
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/dashboard-direct" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-blue-100 p-4 mb-6 rounded-lg border border-blue-300"> <h2 class="text-xl font-bold text-blue-800 mb-2">⚠️ ${title}</h2> <p class="text-blue-700">
Esta es una implementación directa del dashboard que importa el componente sin usar el archivo index.ts.
      Esto debería resolver los problemas de hidratación.
</p> </div>  ${renderComponent($$result2, "Dashboard2", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/Dashboard2", "client:component-export": "default" })} ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard-direct.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard-direct.astro";
const $$url = "/dashboard-direct";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DashboardDirect,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
