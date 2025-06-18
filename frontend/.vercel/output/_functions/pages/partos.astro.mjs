import { a as createComponent, g as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_UMFwe-5w.mjs';
export { i as renderers } from '../chunks/vendor_UMFwe-5w.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_CCD3UXFf.mjs';
/* empty css                                 */

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const title = "Gesti\xF3n de Partos";
  const userRole = "administrador";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/partos", "data-astro-cid-luxpzdhj": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-4 sm:py-6" data-astro-cid-luxpzdhj> <div class="mb-4 sm:mb-6" data-astro-cid-luxpzdhj> <h1 class="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white" data-astro-cid-luxpzdhj>${title}</h1> <p class="text-sm text-gray-600 dark:text-gray-300" data-astro-cid-luxpzdhj>Registro y seguimiento de los partos de los animales</p> </div> <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" data-astro-cid-luxpzdhj> <div class="flex flex-wrap gap-2" data-astro-cid-luxpzdhj> <button class="btn btn-primary flex items-center" data-astro-cid-luxpzdhj> <span class="mr-1" data-astro-cid-luxpzdhj>➕</span> Nuevo Parto
</button> <button class="btn btn-secondary flex items-center" data-astro-cid-luxpzdhj> <span class="mr-1" data-astro-cid-luxpzdhj>🔍</span> Filtros
</button> </div> <div class="mt-2 sm:mt-0" data-astro-cid-luxpzdhj> <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400" data-astro-cid-luxpzdhj>Total: <span class="font-semibold" data-astro-cid-luxpzdhj>0</span> partos</span> </div> </div> <!-- Tabla de partos (placeholder) --> <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700" data-astro-cid-luxpzdhj> <div class="overflow-x-auto" data-astro-cid-luxpzdhj> <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-astro-cid-luxpzdhj> <thead class="bg-gray-50 dark:bg-gray-700" data-astro-cid-luxpzdhj> <tr data-astro-cid-luxpzdhj> <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-astro-cid-luxpzdhj>Animal</th> <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-astro-cid-luxpzdhj>Explotación</th> <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-astro-cid-luxpzdhj>Fecha</th> <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-astro-cid-luxpzdhj>Género Cría</th> <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-astro-cid-luxpzdhj>Estado</th> <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-astro-cid-luxpzdhj>Acciones</th> </tr> </thead> <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" data-astro-cid-luxpzdhj> <tr class="hover:bg-gray-50 dark:hover:bg-gray-700" data-astro-cid-luxpzdhj> <td colspan="6" class="px-4 sm:px-6 py-8 sm:py-10 text-center text-sm text-gray-500 dark:text-gray-400" data-astro-cid-luxpzdhj>
No hay partos registrados. Agrega uno para comenzar.
</td> </tr> </tbody> </table> </div> </div> </div> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/partos/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/partos/index.astro";
const $$url = "/partos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
