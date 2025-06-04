import { c as createComponent, g as renderHead, r as renderComponent, b as renderTemplate } from '../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';

const $$DashboardSimple = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard Simplificado</title><link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">${renderHead()}</head> <body class="bg-gray-100"> <div class="container mx-auto p-4"> <h1 class="text-3xl font-bold text-center my-6">Dashboard Simplificado Masclet Imperi</h1> <!-- El componente Dashboard aislado --> ${renderComponent($$result, "DashboardNew", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/DashboardNew", "client:component-export": "default" })} <div class="mt-8 text-center"> <a href="/" class="bg-blue-500 text-white px-4 py-2 rounded">Volver al Inicio</a> </div> </div> </body></html>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard-simple.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/dashboard-simple.astro";
const $$url = "/dashboard-simple";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DashboardSimple,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
