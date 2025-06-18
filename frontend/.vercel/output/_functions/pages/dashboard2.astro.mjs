import { a as createComponent, g as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_UMFwe-5w.mjs';
export { i as renderers } from '../chunks/vendor_UMFwe-5w.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_CCD3UXFf.mjs';

const $$Dashboard2 = createComponent(($$result, $$props, $$slots) => {
  const userRole = "administrador";
  const title = "Dashboard (Nueva Versi\xF3n)";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/dashboard2" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-blue-100 p-4 mb-6 rounded-lg border border-blue-300"> <h2 class="text-xl font-bold text-blue-800 mb-2">⚠️ Versión Nueva del Dashboard</h2> <p class="text-blue-700">
Esta es la nueva implementación del dashboard que soluciona los problemas de hidratación y mejora el rendimiento.
</p> </div>  ${renderComponent($$result2, "Dashboard2", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/Dashboard2", "client:component-export": "default" })} ` })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard2.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard2.astro";
const $$url = "/dashboard2";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard2,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
