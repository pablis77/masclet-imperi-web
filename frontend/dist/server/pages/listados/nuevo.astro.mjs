import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../../chunks/vendor_B30v18IX.mjs';
export { e as renderers } from '../../chunks/vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../../chunks/MainLayout_Dr98ukQ7.mjs';
import { a as getCurrentLanguage } from '../../chunks/Footer_B0t0tl4F.mjs';

const $$Nuevo = createComponent(async ($$result, $$props, $$slots) => {
  const currentLang = getCurrentLanguage();
  const translations = {
    es: {
      title: "Crear Nuevo Listado",
      description: "Crea un listado personalizado seleccionando los animales que deseas incluir.",
      name: "Nombre del listado",
      namePlaceholder: "Ej: Vacunaci\xF3n octubre 2025",
      description: "Descripci\xF3n",
      descriptionPlaceholder: "Ej: Animales para vacunaci\xF3n del 15 de octubre",
      category: "Categor\xEDa",
      categoryPlaceholder: "Seleccionar categor\xEDa",
      categories: {
        vaccination: "Vacunaci\xF3n",
        treatment: "Tratamiento",
        inspection: "Inspecci\xF3n",
        other: "Otro"
      },
      animals: "Selecci\xF3n de Animales",
      loadingAnimals: "Cargando animales...",
      noAnimals: "No hay animales disponibles.",
      filter: "Filtrar animales",
      filterPlaceholder: "Buscar por nombre o explotaci\xF3n",
      selectAll: "Seleccionar todos",
      unselectAll: "Deseleccionar todos",
      selected: "seleccionados",
      save: "Guardar Listado",
      cancel: "Cancelar",
      saving: "Guardando...",
      successTitle: "Listado Creado",
      successMessage: "El listado ha sido creado correctamente.",
      errorTitle: "Error",
      errorMessage: "Ha ocurrido un error al crear el listado. Por favor, int\xE9ntalo de nuevo.",
      returnToList: "Volver a Listados",
      requiredField: "Este campo es obligatorio",
      selectAnimals: "Debes seleccionar al menos un animal"
    },
    ca: {
      title: "Crear Nou Llistat",
      description: "Crea un llistat personalitzat seleccionant els animals que vols incloure.",
      name: "Nom del llistat",
      namePlaceholder: "Ex: Vacunaci\xF3 octubre 2025",
      description: "Descripci\xF3",
      descriptionPlaceholder: "Ex: Animals per a vacunaci\xF3 del 15 d'octubre",
      category: "Categoria",
      categoryPlaceholder: "Seleccionar categoria",
      categories: {
        vaccination: "Vacunaci\xF3",
        treatment: "Tractament",
        inspection: "Inspecci\xF3",
        other: "Altre"
      },
      animals: "Selecci\xF3 d'Animals",
      loadingAnimals: "Carregant animals...",
      noAnimals: "No hi ha animals disponibles.",
      filter: "Filtrar animals",
      filterPlaceholder: "Cercar per nom o explotaci\xF3",
      selectAll: "Seleccionar tots",
      unselectAll: "Desseleccionar tots",
      selected: "seleccionats",
      save: "Guardar Llistat",
      cancel: "Cancel\xB7lar",
      saving: "Guardant...",
      successTitle: "Llistat Creat",
      successMessage: "El llistat ha estat creat correctament.",
      errorTitle: "Error",
      errorMessage: "Ha ocorregut un error al crear el llistat. Si us plau, intenta-ho de nou.",
      returnToList: "Tornar a Llistats",
      requiredField: "Aquest camp \xE9s obligatori",
      selectAnimals: "Has de seleccionar almenys un animal"
    }
  };
  function t(key) {
    const lang = currentLang;
    return translations[lang][key] || key;
  }
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": t("title") }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="px-4 py-6 sm:px-6 lg:px-8"> <div class="mb-6"> <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">${t("title")}</h1> <p class="mt-2 text-sm text-gray-700">${t("description")}</p> </div> <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"> <div class="p-4"> <!-- Formulario para crear listado --> <form id="listado-form" class="space-y-6"> <!-- Información básica del listado --> <div class="grid grid-cols-1 gap-6 md:grid-cols-2"> <!-- Nombre del listado --> <div> <label for="listado-name" class="block text-sm font-medium text-gray-700"> ${t("name")} <span class="text-red-500">*</span> </label> <div class="mt-1"> <input type="text" id="listado-name" name="name" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"${addAttribute(t("namePlaceholder"), "placeholder")} required> <p class="mt-1 text-sm text-red-500 hidden" id="name-error">${t("requiredField")}</p> </div> </div> <!-- Categoría --> <div> <label for="listado-category" class="block text-sm font-medium text-gray-700"> ${t("category")} <span class="text-red-500">*</span> </label> <div class="mt-1"> <select id="listado-category" name="category" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required> <option value="" disabled selected>${t("categoryPlaceholder")}</option> <option value="vacunacion">Vacunación</option> <option value="tratamiento">Tratamiento</option> <option value="inspeccion">Inspección</option> <option value="otro">Otro</option> </select> <p class="mt-1 text-sm text-red-500 hidden" id="category-error">${t("requiredField")}</p> </div> </div> </div> <!-- Descripción --> <div> <label for="listado-description" class="block text-sm font-medium text-gray-700"> ${t("description")} </label> <div class="mt-1"> <textarea id="listado-description" name="description" rows="3" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"${addAttribute(t("descriptionPlaceholder"), "placeholder")}></textarea> </div> </div> <!-- Selección de animales --> <div> <h3 class="text-lg font-medium text-gray-900 mb-3">${t("animals")}</h3> <!-- Estado de carga de animales --> <div id="loading-animals" class="py-8 flex justify-center"> <div class="flex flex-col items-center"> <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div> <p class="mt-2 text-sm text-gray-500">${t("loadingAnimals")}</p> </div> </div> <!-- Mensaje si no hay animales --> <div id="no-animals" class="py-8 text-center hidden"> <p class="text-gray-500">${t("noAnimals")}</p> </div> <!-- Lista de animales --> <div id="animals-list" class="hidden"> <!-- Filtro y contadores --> <div class="flex flex-col sm:flex-row justify-between mb-4 space-y-2 sm:space-y-0"> <!-- Filtro --> <div class="relative w-full sm:w-64"> <input type="text" id="animal-filter" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm pr-8"${addAttribute(t("filterPlaceholder"), "placeholder")}> <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"> <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path> </svg> </div> </div> <!-- Contadores y botones de selección --> <div class="flex items-center space-x-2"> <span class="text-sm text-gray-700"> <span id="selected-count">0</span> ${t("selected")} </span> <button type="button" id="select-all" class="text-sm text-primary hover:text-primary-dark"> ${t("selectAll")} </button> <button type="button" id="unselect-all" class="text-sm text-primary hover:text-primary-dark ml-2"> ${t("unselectAll")} </button> </div> </div> <!-- Contenedor para la lista de animales --> <div class="border border-gray-200 rounded-md overflow-hidden max-h-96 overflow-y-auto"> <div id="animals-container" class="divide-y divide-gray-200"> <!-- Los animales se cargarán aquí dinámicamente --> </div> </div> <p class="mt-1 text-sm text-red-500 hidden" id="animals-error">${t("selectAnimals")}</p> </div> </div> <!-- Mensajes de error y éxito --> <div id="success-message" class="hidden rounded-md bg-green-50 p-4"> <div class="flex"> <div class="flex-shrink-0"> <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> </div> <div class="ml-3"> <h3 class="text-sm font-medium text-green-800">${t("successTitle")}</h3> <div class="mt-2 text-sm text-green-700"> <p>${t("successMessage")}</p> </div> <div class="mt-4"> <div class="-mx-2 -my-1.5 flex"> <a href="/listados" class="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"> ${t("returnToList")} </a> </div> </div> </div> </div> </div> <div id="error-message" class="hidden rounded-md bg-red-50 p-4"> <div class="flex"> <div class="flex-shrink-0"> <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path> </svg> </div> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800">${t("errorTitle")}</h3> <div class="mt-2 text-sm text-red-700"> <p>${t("errorMessage")}</p> </div> </div> </div> </div> <!-- Botones de acción --> <div class="flex justify-end space-x-3"> <a href="/listados" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"> ${t("cancel")} </a> <button type="submit" id="save-button" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"> ${t("save")} </button> <button type="button" id="saving-button" class="hidden inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary" disabled> <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> ${t("saving")} </button> </div> </form> </div> </div> </div> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/listados/nuevo.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/listados/nuevo.astro";
const $$url = "/listados/nuevo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Nuevo,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
