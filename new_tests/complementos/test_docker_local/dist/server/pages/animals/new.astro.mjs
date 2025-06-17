import { c as createComponent, a as createAstro, m as maybeRenderHead, d as addAttribute, u as unescapeHTML, b as renderTemplate, r as renderComponent } from '../../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../../chunks/MainLayout_DsgB9yc8.mjs';
import 'clsx';
import { $ as $$MessageContainer } from '../../chunks/MessageContainer_CNLcLxJk.mjs';
import { a as animalService } from '../../chunks/animalService_BGR2eQCt.mjs';

const $$Astro$2 = createAstro();
const $$Alert = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Alert;
  const {
    type = "info",
    title,
    message,
    dismissible = true,
    icon = true
  } = Astro2.props;
  let bgColor, borderColor, textColor, iconSvg;
  switch (type) {
    case "success":
      bgColor = "bg-green-50 dark:bg-green-900/20";
      borderColor = "border-green-500 dark:border-green-700";
      textColor = "text-green-800 dark:text-green-300";
      iconSvg = `<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>`;
      break;
    case "error":
      bgColor = "bg-red-50 dark:bg-red-900/20";
      borderColor = "border-red-500 dark:border-red-700";
      textColor = "text-red-800 dark:text-red-300";
      iconSvg = `<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>`;
      break;
    case "warning":
      bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
      borderColor = "border-yellow-500 dark:border-yellow-700";
      textColor = "text-yellow-800 dark:text-yellow-300";
      iconSvg = `<svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>`;
      break;
    default:
      bgColor = "bg-blue-50 dark:bg-blue-900/20";
      borderColor = "border-blue-500 dark:border-blue-700";
      textColor = "text-blue-800 dark:text-blue-300";
      iconSvg = `<svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>`;
  }
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`alert rounded-lg border ${borderColor} ${bgColor} p-4 mb-4`, "class")} role="alert"> <div class="flex items-start"> ${icon && renderTemplate`<div class="flex-shrink-0">${unescapeHTML(iconSvg)}</div>`} <div class="ml-3 flex-grow"> ${title && renderTemplate`<h3${addAttribute(`text-lg font-medium ${textColor}`, "class")}>${title}</h3>`} <div${addAttribute(`mt-2 ${textColor} text-sm`, "class")}> <p>${message}</p> </div> </div> ${dismissible && renderTemplate`<div class="ml-auto pl-3"> <div class="-mx-1.5 -my-1.5"> <button type="button" class="inline-flex rounded-md p-1.5 text-gray-500 hover:text-gray-600 focus:outline-none" aria-label="Cerrar" onclick="this.closest('.alert').remove()"> <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path> </svg> </button> </div> </div>`} </div> </div>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/ui/Alert.astro", void 0);

const $$Astro$1 = createAstro();
const $$CreateAnimalForm = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CreateAnimalForm;
  const { explotaciones, error = null } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700"> ${error && renderTemplate`${renderComponent($$result, "Alert", $$Alert, { "type": "error", "title": "Error", "message": error, "class": "mb-4" })}`} <form id="new-animal-form" class="space-y-6"> <!-- Datos básicos --> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Nombre *
</label> <input type="text" name="nom" id="nom" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Nombre del animal"> </div> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Código
</label> <input type="text" name="cod" id="cod" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Código del animal"> </div> </div> <!-- Datos de identificación --> <div class="grid grid-cols-1 md:grid-cols-3 gap-6"> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Género *
</label> <select name="genere" id="genere" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"> <option value="">Seleccionar</option> <option value="M">Macho</option> <option value="F">Hembra</option> </select> </div> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Fecha de Nacimiento
</label> <input type="date" name="dob" id="dob" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"> </div> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Número de Serie
</label> <input type="text" name="num_serie" id="num_serie" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Número de serie oficial"> </div> </div> <!-- Datos de explotación --> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Explotación *
</label> <input type="text" name="explotacio" id="explotacio" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Nombre de la explotación" list="explotaciones-list"> <!-- Lista desplegable para sugerencias (datalist) --> <datalist id="explotaciones-list"> ${explotaciones.map((exp) => renderTemplate`<option${addAttribute(exp.explotacio, "value")}>${exp.explotacio}</option>`)} </datalist> <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Puedes seleccionar una existente o crear una nueva</p> </div> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Origen
</label> <input type="text" name="origen" id="origen" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Origen o ubicación"> </div> </div> <!-- Datos de parentesco --> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Padre
</label> <input type="text" name="pare" id="pare" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Nombre del padre"> </div> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Madre
</label> <input type="text" name="mare" id="mare" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Nombre de la madre"> </div> </div> <!-- Estado y amamantamiento --> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Estado *
</label> <select name="estado" id="estado" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"> <option value="OK" selected>Activo</option> <option value="DEF">Fallecido</option> </select> </div> <div id="alletar-container" class="hidden"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Amamantamiento
</label> <select name="alletar" id="alletar" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"> <option value="0" selected>No amamanta</option> <option value="1">Un ternero</option> <option value="2">Dos terneros</option> </select> </div> </div> <!-- Observaciones --> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
Observaciones (máx. 2000 caracteres)
</label> <textarea name="observaciones" id="observaciones" rows="4" maxlength="2000" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="Añade notas o información adicional sobre el animal"></textarea> </div> <!-- Leyenda para campos obligatorios --> <div class="text-sm text-gray-500 dark:text-gray-400 mt-2"> <span class="text-black dark:text-white font-bold">*</span> <span class="font-bold">Campos obligatorios</span> </div> <!-- Botones de acción --> <div class="flex justify-end gap-3"> <a href="/animals" class="px-6 py-3 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 rounded-md transition-colors">
Cancelar
</a> <button type="submit" class="px-6 py-3 bg-primary text-white hover:bg-primary/80 rounded-md transition-colors">
Crear Animal
</button> </div> </form> </div> `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/CreateAnimalForm.astro", void 0);

const $$Astro = createAstro();
const $$New = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$New;
  const userRole = Astro2.cookies.get("userRole")?.value || "user";
  let explotaciones = [];
  let error = null;
  try {
    explotaciones = await animalService.getExplotacions();
  } catch (err) {
    console.error("Error al obtener explotaciones:", err);
    error = "No se pudieron cargar las explotaciones necesarias para crear un animal";
  }
  const title = "Registrar Nuevo Animal";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/animals" }, { "default": async ($$result2) => renderTemplate`  ${renderComponent($$result2, "MessageContainer", $$MessageContainer, {})}  ${maybeRenderHead()}<div class="mb-6"> <div class="flex items-center gap-2 mb-2"> <a href="/animals" class="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors">
← Volver al listado
</a> </div> <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${title}</h1> <p class="text-gray-600 dark:text-gray-300">Completa el formulario para registrar un nuevo animal en el sistema</p> </div>  ${error && renderTemplate`${renderComponent($$result2, "Alert", $$Alert, { "type": "error", "title": "Error al cargar datos", "message": error }, { "default": async ($$result3) => renderTemplate` <p class="mt-2">Vuelve al <a href="/animals" class="underline">listado de animales</a></p> ` })}`} ${renderComponent($$result2, "CreateAnimalForm", $$CreateAnimalForm, { "explotaciones": explotaciones, "error": error && true ? error : null })} ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/new.astro", void 0);
const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/new.astro";
const $$url = "/animals/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
