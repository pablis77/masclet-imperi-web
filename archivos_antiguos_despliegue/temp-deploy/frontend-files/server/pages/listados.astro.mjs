import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_DsgB9yc8.mjs';
import { a as getCurrentLanguage } from '../chunks/Footer_BuyfVHI3.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const currentLang = getCurrentLanguage();
  const translations = {
    es: {
      title: "Listados Personalizados",
      description: "Crea y gestiona listados personalizados de animales para vacunaci\xF3n y otros prop\xF3sitos.",
      empty: "No hay listados personalizados disponibles.",
      create: "Crear Nuevo Listado",
      loading: "Cargando listados...",
      error: "Error al cargar los listados.",
      category: "Categor\xEDa",
      animals: "Animales",
      actions: "Acciones",
      view: "Ver",
      edit: "Editar",
      delete: "Eliminar",
      confirmDelete: "\xBFEst\xE1s seguro de que quieres eliminar este listado?",
      "export": "Exportar",
      table: {
        name: "Nombre",
        category: "Categor\xEDa",
        animals: "Animales",
        createdAt: "Creado el",
        actions: "Acciones"
      }
    },
    ca: {
      title: "Llistats Personalitzats",
      description: "Crea i gestiona llistats personalitzats d'animals per a vacunaci\xF3 i altres prop\xF2sits.",
      empty: "No hi ha llistats personalitzats disponibles.",
      create: "Crear Nou Llistat",
      loading: "Carregant llistats...",
      error: "Error al carregar els llistats.",
      category: "Categoria",
      animals: "Animals",
      actions: "Accions",
      view: "Veure",
      edit: "Editar",
      delete: "Eliminar",
      confirmDelete: "Est\xE0s segur que vols eliminar aquest llistat?",
      "export": "Exportar",
      table: {
        name: "Nom",
        category: "Categoria",
        animals: "Animals",
        createdAt: "Creat el",
        actions: "Accions"
      }
    }
  };
  function t2(key) {
    return translations[currentLang][key] || key;
  }
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": t2("listings.title") }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="px-4 py-2 sm:px-6 lg:px-8"> <div class="sm:flex sm:items-center mb-2"> <div class="sm:flex-auto"> <h1 class="text-xl font-semibold text-gray-900 dark:text-white" data-i18n-key="listings.title">${t2("listings.title")}</h1> <p class="mt-1 text-sm text-gray-700 dark:text-gray-300" data-i18n-key="listings.description"> ${t2("listings.description")} </p> </div> <div class="sm:flex-none"> <a href="/listados/nuevo" class="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto" data-i18n-key="listings.create"> ${t2("listings.create")} </a> </div> </div> <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"> <div class="overflow-x-auto"> <div id="listados-container" class="min-h-[50px] flex items-center justify-center"> <p id="loading-message" class="text-gray-500" data-i18n-key="listings.loading"> ${t2("listings.loading")} </p> </div> <!-- Plantilla para la tabla (se llena con JavaScript) --> <table id="listados-table" class="min-w-full divide-y divide-gray-300 hidden"> <thead class="bg-gray-50 dark:bg-gray-700"> <tr> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100" data-i18n-key="listings.table.name"> ${t2("listings.table.name")} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100" data-i18n-key="listings.table.category"> ${t2("listings.table.category")} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100" data-i18n-key="listings.table.animals"> ${t2("listings.table.animals")} </th> <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100" data-i18n-key="listings.table.createdAt"> ${t2("listings.table.createdAt")} </th> <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"> <span class="sr-only" data-i18n-key="listings.table.actions">${t2("listings.table.actions")}</span> </th> </tr> </thead> <tbody id="listados-body" class="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800"> <!-- Se llenará con JavaScript --> </tbody> </table> <!-- Mensaje de error (oculto por defecto) --> <div id="error-message" class="p-4 text-center text-red-600 hidden"> ${t2("error")} </div> <!-- Mensaje de vacío (oculto por defecto) --> <div id="empty-message" class="p-8 text-center text-gray-500 dark:text-gray-400 hidden"> <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path> </svg> <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">${t2("empty")}</h3> <p class="mt-1 text-sm text-gray-500 dark:text-gray-400"> ${t2("description")} </p> <div class="mt-6"> <a href="/listados/nuevo" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"> ${t2("create")} </a> </div> </div> </div> </div> </div> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/listados/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/listados/index.astro";
const $$url = "/listados";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
