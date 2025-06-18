import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_XrHmsJ5B.mjs';
export { e as renderers } from '../chunks/vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_CQEYGpDK.mjs';

const $$DashboardTest = createComponent(($$result, $$props, $$slots) => {
  const userRole = "administrador";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Dashboard (Nuevo)", "userRole": userRole, "currentPath": "/dashboard-test" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto px-4 py-6"> <h1 class="text-3xl font-bold text-gray-800 mb-8">Dashboard (Versión de prueba)</h1> <!-- Componente Dashboard nuevo - Renderizado solo en el cliente --> ${renderComponent($$result2, "DashboardNew", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/DashboardNew", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard-test.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard-test.astro";
const $$url = "/dashboard-test";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DashboardTest,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=dashboard-test.astro.mjs.map
