import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_B30v18IX.mjs';
export { e as renderers } from '../chunks/vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$DefaultLayout } from '../chunks/DefaultLayout_sfsXaPHw.mjs';

const $$TestApi = createComponent(async ($$result, $$props, $$slots) => {
  const userRole = "admin";
  const title = "Prueba de API - Masclet Imperi";
  return renderTemplate`${renderComponent($$result, "DefaultLayout", $$DefaultLayout, { "title": title, "userRole": userRole, "currentPath": "/test-api" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto px-4 py-6"> <div class="mb-6"> <h1 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Prueba de API</h1> <p class="text-gray-600 dark:text-gray-300 mb-4">Esta página prueba directamente la comunicación con el backend</p> </div> <div class="mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden p-4"> <div class="mb-4"> <label for="api-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL de la API</label> <div class="flex gap-2"> <input type="text" id="api-url" class="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-800 dark:text-white" value="/api/v1/dashboard/stats"> <button id="test-button" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
Probar API
</button> </div> </div> <div class="mb-4"> <div class="flex items-center mb-2"> <div class="w-3 h-3 rounded-full mr-2" id="status-indicator"></div> <span id="status-text" class="text-gray-700 dark:text-gray-300">Esperando prueba...</span> </div> </div> <div class="mt-4 hidden" id="loading-indicator"> <div class="flex items-center justify-center p-4"> <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div> <span class="ml-2 text-gray-700 dark:text-gray-300">Realizando petición...</span> </div> </div> <pre id="output-box" class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 dark:text-gray-200 max-h-96"></pre> <div class="mt-6"> <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Lista de endpoints disponibles</h2> <ul class="space-y-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg"> <li><code>/api/v1/dashboard/stats</code> - Estadísticas completas</li> <li><code>/api/v1/dashboard/resumen</code> - Resumen del dashboard</li> <li><code>/api/v1/dashboard/partos</code> - Estadísticas de partos</li> <li><code>/api/v1/dashboard/combined</code> - Vista combinada</li> <li><code>/api/v1/animals</code> - Listado de animales</li> <li><code>/api/v1/animals/1</code> - Detalle del animal con ID 1</li> </ul> </div> </div> </main> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/test-api.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/test-api.astro";
const $$url = "/test-api";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestApi,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
