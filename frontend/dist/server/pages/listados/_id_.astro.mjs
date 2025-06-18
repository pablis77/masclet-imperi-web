import { c as createComponent, a as createAstro, b as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../../chunks/vendor_B30v18IX.mjs';
export { e as renderers } from '../../chunks/vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../../chunks/MainLayout_Dr98ukQ7.mjs';
import { a as getCurrentLanguage } from '../../chunks/Footer_B0t0tl4F.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const currentLang = getCurrentLanguage();
  const { id } = Astro2.params;
  Astro2.props.currentPath = `/listados/[id]`;
  const titulo = currentLang === "es" ? "Detalles del Listado" : "Detalls del Llistat";
  const cargando = currentLang === "es" ? "Cargando detalles del listado..." : "Carregant detalls del llistat...";
  const volver = currentLang === "es" ? "Volver a Listados" : "Tornar a Llistats";
  const categoria = currentLang === "es" ? "Categor\xEDa" : "Categoria";
  const animales = currentLang === "es" ? "Animales" : "Animals";
  const creado = currentLang === "es" ? "Creado el" : "Creat el";
  const vacio = currentLang === "es" ? "No hay animales en este listado." : "No hi ha animals en aquest llistat.";
  const colNombre = currentLang === "es" ? "Nombre" : "Nom";
  const colCodigo = currentLang === "es" ? "C\xF3digo" : "Codi";
  const colExplotacion = currentLang === "es" ? "Explotaci\xF3n" : "Explotaci\xF3";
  const colGenero = currentLang === "es" ? "G\xE9nero" : "G\xE8nere";
  const colEstado = currentLang === "es" ? "Confirmaci\xF3n" : "Confirmaci\xF3";
  const colObservaciones = currentLang === "es" ? "Observaciones" : "Observacions";
  return renderTemplate(_a || (_a = __template(["", ` <!-- Importaciones para PDF (misma estructura que en la ficha de animal) --> <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script> <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"><\/script> <script>
  // Aseguramos que autoTable est\xE9 disponible globalmente
  window.jsPDF = window.jspdf.jsPDF;
  window.autoTable = function() {
    const doc = arguments[0];
    if (typeof doc.autoTable === 'function') {
      doc.autoTable.apply(doc, Array.prototype.slice.call(arguments, 1));
    } else if (window.jspdf && window.jspdf.jspdf && typeof window.jspdf.jspdf.autoTable === 'function') {
      window.jspdf.jspdf.autoTable.apply(doc, Array.prototype.slice.call(arguments, 1));
    } else {
      console.error('autoTable function not found');
    }
  };
<\/script> `])), renderComponent($$result, "MainLayout", $$MainLayout, { "title": titulo }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="px-4 py-6 sm:px-6 lg:px-8"> <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between"> <div> <h1 class="text-2xl font-semibold text-gray-900 dark:text-white" id="listado-title"> ${titulo} </h1> <p class="mt-2 text-sm text-gray-700 dark:text-gray-300" id="listado-descripcion"></p> </div> <div class="mt-4 sm:mt-0 flex space-x-3"> <a href="/listados" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"> ${volver} </a> <!-- Botón de exportar PDF eliminado --> <!-- Mensaje de estado para la exportación --> <div id="pdf-export-status" class="hidden mt-2 text-sm font-medium"></div> </div> </div> <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"> <div class="p-4"> <div id="loading-message" class="p-4 flex justify-center items-center min-h-[200px]"> <div class="flex flex-col items-center"> <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div> <p class="mt-2 text-sm text-gray-500">${cargando}</p> </div> </div> <div id="listado-content" class="hidden"> <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> <div> <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">${categoria}</h3> <p class="mt-1 text-sm text-gray-900 dark:text-white" id="listado-categoria"></p> </div> <div> <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">${animales}</h3> <p class="mt-1 text-sm text-gray-900 dark:text-white" id="listado-animales-count">0</p> </div> <div> <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">${creado}</h3> <p class="mt-1 text-sm text-gray-900 dark:text-white" id="listado-fecha"></p> </div> </div> <div class="flex justify-between items-center mb-3"> <h3 class="text-lg font-medium text-gray-900 dark:text-white">${animales}</h3> <button id="guardar-cambios" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-lime-500 hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"> <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Guardar confirmaciones
</button> </div> <!-- Mensaje de éxito al guardar --> <div id="mensaje-exito" class="mb-3 p-2 bg-green-100 text-green-700 rounded-md hidden">
Cambios guardados correctamente
</div> <!-- Mensaje de error al guardar --> <div id="mensaje-error" class="mb-3 p-2 bg-red-100 text-red-700 rounded-md hidden">
Error al guardar los cambios
</div> <div id="empty-message" class="py-8 text-center hidden"> <p class="text-gray-500">${vacio}</p> </div> <div id="animals-table" class="overflow-x-auto hidden"> <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700"> <thead class="bg-gray-50 dark:bg-gray-700"> <tr> <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"> ${colNombre} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"> ${colCodigo} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"> ${colExplotacion} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"> ${colGenero} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"> ${colEstado} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"> ${colObservaciones} </th> </tr> </thead> <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800" id="animals-container"> <!-- Los animales se cargarán con JavaScript --> </tbody> </table> </div> </div> </div> </div> </div> ` }));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/listados/[id].astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/listados/[id].astro";
const $$url = "/listados/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
