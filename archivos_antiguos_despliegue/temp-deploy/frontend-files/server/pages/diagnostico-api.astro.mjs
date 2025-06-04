import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';
import { $ as $$DefaultLayout } from '../chunks/DefaultLayout_DU3SjfpH.mjs';

const $$Astro = createAstro();
const $$DiagnosticoApi = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$DiagnosticoApi;
  const userRole = "admin";
  const title = "Diagn\xF3stico de API - Masclet Imperi";
  const endpoints = [
    {
      name: "Estad\xEDsticas del Dashboard (/stats)",
      url: "/api/v1/dashboard/stats",
      description: "Estad\xEDsticas completas con datos reales de animales",
      viaProxy: true
    },
    {
      name: "Resumen del Dashboard",
      url: "/api/v1/dashboard/resumen",
      description: "Resumen general con estad\xEDsticas clave",
      viaProxy: true
    },
    {
      name: "Directamente al backend",
      url: "http://localhost:8000/api/v1/dashboard/stats",
      description: "Conexi\xF3n directa al backend sin usar proxy",
      viaProxy: false
    },
    {
      name: "Listado de Animales",
      url: "/api/v1/animals",
      description: "Listado de todos los animales",
      viaProxy: true
    }
  ];
  return renderTemplate`${renderComponent($$result, "DefaultLayout", $$DefaultLayout, { "title": title, "userRole": userRole, "currentPath": "/diagnostico-api" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-6"> <div class="mb-6"> <h1 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Diagnóstico de API</h1> <p class="text-gray-600 dark:text-gray-300 mb-4">Esta página realiza pruebas de comunicación con el backend</p> </div> <div class="mb-4"> <div class="flex justify-between items-center mb-4"> <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Endpoints a probar</h2> <button id="test-all-button" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
Probar Todos
</button> </div> <div id="endpoints-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"> ${endpoints.map((endpoint, index) => renderTemplate`<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden p-4"> <div class="mb-2"> <div class="flex justify-between items-start"> <h3 class="text-lg font-medium text-gray-800 dark:text-white">${endpoint.name}</h3> <span${addAttribute(`px-2 py-1 text-xs rounded ${endpoint.viaProxy ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"}`, "class")}> ${endpoint.viaProxy ? "V\xEDa Proxy" : "Directo"} </span> </div> <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${endpoint.description}</p> <div class="mt-2"> <p class="text-xs text-gray-500 dark:text-gray-400">URL: <code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">${endpoint.url}</code></p> </div> </div> <div class="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3"> <div class="flex items-center justify-between"> <span class="endpoint-status text-sm text-gray-500 dark:text-gray-400">Sin probar</span> <button class="test-button bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-sm rounded transition-colors"${addAttribute(endpoint.url, "data-url")}${addAttribute(index, "data-index")}>
Probar
</button> </div> <div class="mt-2 hidden endpoint-result"> <div class="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs text-gray-800 dark:text-gray-200 overflow-x-auto max-h-32"></div> </div> </div> </div>`)} </div> </div> <div class="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden p-4"> <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Registro de conexiones</h2> <pre id="connection-log" class="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-x-auto max-h-64">Esperando pruebas...</pre> </div> <div class="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden p-4"> <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Información de configuración</h2> <div class="space-y-3"> <div> <h3 class="text-md font-medium text-gray-700 dark:text-gray-300">Proxy configurado</h3> <pre class="bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs mt-1">Astro proxy: /api/v1 → http://localhost:8000</pre> </div> <div> <h3 class="text-md font-medium text-gray-700 dark:text-gray-300">Configuración CORS en backend</h3> <pre class="bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs mt-1">allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]</pre> </div> </div> </div> </main> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/diagnostico-api.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/diagnostico-api.astro";
const $$url = "/diagnostico-api";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DiagnosticoApi,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
