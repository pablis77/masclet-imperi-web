import { c as createComponent, a as createAstro, b as renderTemplate, r as renderComponent, m as maybeRenderHead, F as Fragment, d as addAttribute } from '../../chunks/vendor_B30v18IX.mjs';
export { e as renderers } from '../../chunks/vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../../chunks/MainLayout_Dr98ukQ7.mjs';
import { a as animalService } from '../../chunks/animalService_BOr3n1Bi.mjs';
import { a as getCurrentLanguage } from '../../chunks/Footer_B0t0tl4F.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const serverLang = getCurrentLanguage();
  const txtMacho = serverLang === "ca" ? "Mascle" : "Macho";
  const txtHembra = serverLang === "ca" ? "Femella" : "Hembra";
  const txtNoDisponible = serverLang === "ca" ? "No disponible" : "No disponible";
  const txtObservaciones = serverLang === "ca" ? "Sense observacions" : "Sin observaciones";
  const txtVivo = serverLang === "ca" ? "Viu" : "Vivo";
  const txtMuerto = serverLang === "ca" ? "Mort" : "Fallecido";
  const translations = {
    es: {
      title: "Ficha de Animal",
      back_to_list: "Volver al listado",
      animal_id: "ID Animal",
      loading: "Cargando datos del animal...",
      error_title: "Error",
      retry: "Reintentar",
      active: "Activo",
      inactive: "Baja",
      dead: "Fallecido",
      update: "Actualizar",
      code: "C\xF3digo",
      name: "Nombre",
      serial_number: "N\xFAmero de Serie",
      gender: "Sexo",
      male: "Macho",
      female: "Hembra",
      birth_date: "Fecha de nacimiento",
      not_available: "No disponible",
      incorrect_date: "Fecha incorrecta",
      status: "Estado",
      exploitation: "Explotaci\xF3n",
      stable: "Origen",
      not_assigned: "No asignada",
      father: "Padre",
      mother: "Madre",
      nursing_status: "Estado de amamantamiento",
      not_nursing: "No amamanta",
      nursing_one: "Amamanta a un ternero",
      nursing_two: "Amamanta a dos terneros",
      back_to_animal_list: "Volver al listado de animales",
      complete_info_tab: "Informaci\xF3n Completa",
      birth_history_tab: "Historial de Partos",
      changes_history_tab: "Historial de Cambios",
      identification_data: "Datos de Identificaci\xF3n",
      general_data: "Datos Generales",
      birth_history: "Historial de Partos",
      birth_registry: "Registro de todos los partos del animal",
      no_births: "Este animal no tiene partos registrados",
      date: "Fecha",
      gender_label: "G\xE9nero",
      observations: "Observaciones",
      changes_history: "Historial de Cambios",
      changes_registry: "Registro de cambios realizados al animal",
      no_changes: "No hay cambios registrados para este animal",
      changes_date: "Fecha",
      changes_user: "Usuario",
      changes_field: "Campo",
      changes_old_value: "Valor anterior",
      changes_new_value: "Valor nuevo"
    },
    ca: {
      title: "Fitxa d'Animal",
      back_to_list: "Tornar al llistat",
      animal_id: "ID Animal",
      loading: "Carregant dades de l'animal...",
      error_title: "Error",
      retry: "Reintentar",
      active: "Actiu",
      inactive: "Baixa",
      dead: "Mort",
      update: "Actualitzar",
      code: "Codi",
      name: "Nom",
      serial_number: "N\xFAmero de S\xE8rie",
      gender: "Sexe",
      male: "Mascle",
      female: "Femella",
      birth_date: "Data de naixement",
      not_available: "No disponible",
      incorrect_date: "Data incorrecta",
      status: "Estat",
      exploitation: "Explotaci\xF3",
      stable: "Origen",
      not_assigned: "No assignada",
      father: "Pare",
      mother: "Mare",
      nursing_status: "Estat d'alletament",
      not_nursing: "No alleta",
      nursing_one: "Alleta un vedell",
      nursing_two: "Alleta dos vedells",
      back_to_animal_list: "Tornar al llistat d'animals",
      complete_info_tab: "Informaci\xF3 Completa",
      birth_history_tab: "Historial de Parts",
      changes_history_tab: "Historial de Canvis",
      identification_data: "Dades d'Identificaci\xF3",
      general_data: "Dades Generals",
      birth_history: "Historial de Parts",
      birth_registry: "Registre de tots els parts de l'animal",
      no_births: "Aquest animal no t\xE9 parts registrats",
      date: "Data",
      gender_label: "G\xE8nere",
      observations: "Observacions",
      changes_history: "Historial de Canvis",
      changes_registry: "Registre de canvis realitzats a l'animal",
      no_changes: "No hi ha canvis registrats per a aquest animal",
      changes_date: "Data",
      changes_user: "Usuari",
      changes_field: "Camp",
      changes_old_value: "Valor anterior",
      changes_new_value: "Valor nou"
    }
  };
  function t(key) {
    return translations[serverLang]?.[key] || key;
  }
  const title = t("title");
  const userRole = "administrador";
  let animal = null;
  let error = null;
  let loading = true;
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("ID de animal no v\xE1lido");
    }
    console.log(`Intentando cargar animal con ID: ${id}`);
    animal = await animalService.getAnimalById(parseInt(id));
    console.log("Animal cargado:", animal);
    if (!animal) {
      throw new Error("No se pudo encontrar el animal");
    }
    loading = false;
  } catch (e) {
    console.error("Error al cargar datos del animal:", e);
    error = e.message || "Error al cargar los datos del animal";
    loading = false;
  }
  const showPartosTab = animal && animal.genere === "F";
  let iconPath = "/images/toro_sin_borde_2.png";
  if (animal) {
    if (animal.genere === "M") {
      iconPath = "/images/toro_sin_borde_2.png";
    } else {
      iconPath = animal.alletar !== "0" ? "/images/vaca azul.png" : "/images/vaca blanca.png";
    }
  }
  animal ? animalService.getAnimalIcon(animal) : "\u{1F402}";
  animal ? animalService.getAnimalStatusClass(animal.estado) : "bg-gray-100 text-gray-800";
  return renderTemplate(_a || (_a = __template(["", ` <!-- Importaciones para PDF (misma estructura que en ExplotacionesPage.tsx) --> <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script> <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"><\/script> <!-- Script para bloquear el bot\xF3n de eliminar animales para editores --> <script src="/scripts/block-delete-button.js"><\/script> <script>
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
<\/script>  <!-- Script para edici\xF3n de partos -->  <!-- Script para cargar el historial de cambios --> `])), renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/animals" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-6"> <div class="flex justify-center items-center gap-2 mb-2 mt-4"> <a href="/animals" id="back-to-list-link" class="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"> <span class="mr-2">←</span> Volver al listado de animales
</a> </div> <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${title}</h1> <p class="text-gray-600 dark:text-gray-300" id="animal-id-text">${t("animal_id")}: ${id}</p> </div> ${loading && renderTemplate`<div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6 mb-6 flex justify-center items-center"> <div class="flex items-center space-x-2"> <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div> <p>${t("loading")}</p> </div> </div>`}${error && renderTemplate`<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6"> <div class="flex items-start"> <div class="flex-shrink-0">
⚠️
</div> <div class="ml-3"> <h3 class="text-lg font-medium text-red-800 dark:text-red-300">${t("error_title")}</h3> <div class="mt-2 text-red-700 dark:text-red-200"> <p>${error}</p> </div> <div class="mt-4"> <button id="retry-button" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
↻ ${t("retry")} </button> </div> </div> </div> </div>`}${animal && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`  <div id="animal-data" class="hidden"${addAttribute(animal.genere, "data-genere")}${addAttribute(
    animal.partos && animal.partos.items && animal.partos.items.length > 0 || animal.partos && Array.isArray(animal.partos) && animal.partos.length > 0 || animal.parts && Array.isArray(animal.parts) && animal.parts.length > 0 ? "true" : "false",
    "data-tiene-partos"
  )}></div>  <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6 mb-6"> <div class="flex flex-col md:flex-row gap-6"> <!-- Icono y estado --> <div class="flex flex-col items-center md:items-start"> <!-- Usamos imagen en lugar de emoji para mejor visualización --> <div class="mb-3"> <img${addAttribute(iconPath, "src")} alt="Icono Animal" class="w-24 h-24 object-contain"> </div> ${animal.estado === "DEF" && renderTemplate`<span class="px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm font-medium">
Baja
</span>`} </div> <!-- Información básica --> <div class="flex-grow"> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${animal.nom}</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("code")}</p> <p class="font-medium">${animal.cod || t("not_available")}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("gender")}</p> <p class="font-medium">${animal.genere === "M" ? t("male") : t("female")}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("birth_date")}</p> <p class="font-medium"> ${animal.dob ? (() => {
    try {
      if (typeof animal.dob === "string" && new RegExp("^\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4}$").test(animal.dob)) {
        const partes = animal.dob.split(/[\/\-]/);
        if (partes.length === 3) {
          const fecha2 = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
          if (!isNaN(fecha2.getTime())) {
            return `${partes[0].padStart(2, "0")}/${partes[1].padStart(2, "0")}/${partes[2]}`;
          }
        }
        return animal.dob;
      }
      const fecha = new Date(animal.dob);
      if (!isNaN(fecha.getTime())) {
        return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
      }
      return String(animal.dob);
    } catch (e) {
      return t("incorrect_date");
    }
  })() : t("not_available")} </p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("exploitation")}</p> <p class="font-medium">${animal.explotacio || t("not_available")}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("stable")}</p> <p class="font-medium">${animal.origen || t("not_assigned")}</p> </div> ${animal.genere === "F" && renderTemplate`<div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("nursing_status")}</p> <p class="font-medium"> ${animal.alletar === "0" ? t("not_nursing") : animal.alletar === "1" ? t("nursing_one") : animal.alletar === "2" ? t("nursing_two") : t("not_available")} </p> </div>`} </div> </div> <!-- Acciones --> <div class="flex flex-col gap-2"> <a${addAttribute(`/animals/update/${id}`, "href")} class="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">
↻ Actualizar
</a> </div> </div> </div>  <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 overflow-hidden"> <!-- Pestañas de navegación --> <div class="flex border-b border-gray-200 dark:border-gray-700"> <button id="tab-info" class="px-6 py-3 text-primary border-b-2 border-primary font-medium"> ${t("complete_info_tab")} </button> ${showPartosTab && renderTemplate`<button id="tab-partos" class="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"> ${t("birth_history_tab")} </button>`} <button id="tab-changes" class="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"> ${t("changes_history_tab")} </button> </div> <!-- Contenido de pestañas --> <div class="p-6"> <!-- Pestaña 1: Información Completa --> <div id="content-info"> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">${t("identification_data")}</h3> <div class="space-y-3"> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("code")}</p> <p class="font-medium">${animal.cod || t("not_available")}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("name")}</p> <p class="font-medium">${animal.nom}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("serial_number")}</p> <p class="font-medium">${animal.num_serie || t("not_available")}</p> </div> </div> </div> <div> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">${t("general_data")}</h3> <div class="space-y-3"> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("gender")}</p> <p class="font-medium">${animal.genere === "M" ? t("male") : t("female")}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("birth_date")}</p> <p class="font-medium"> ${animal.dob ? (() => {
    try {
      if (typeof animal.dob === "string" && new RegExp("^\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4}$").test(animal.dob)) {
        const partes = animal.dob.split(/[\/\-]/);
        if (partes.length === 3) {
          const fecha2 = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
          if (!isNaN(fecha2.getTime())) {
            return `${partes[0].padStart(2, "0")}/${partes[1].padStart(2, "0")}/${partes[2]}`;
          }
        }
        return animal.dob;
      }
      const fecha = new Date(animal.dob);
      if (!isNaN(fecha.getTime())) {
        return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
      }
      return String(animal.dob);
    } catch (e) {
      return t("incorrect_date");
    }
  })() : t("not_available")} </p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("status")}</p> <p class="font-medium">${animal.estado === "OK" ? t("active") : t("dead")}</p> </div> </div> </div> <div> <!-- Eliminado encabezado de Ubicación --> <div class="space-y-3"> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("exploitation")}</p> <p class="font-medium">${animal.explotacio || t("not_available")}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("stable")}</p> <p class="font-medium">${animal.origen || t("not_assigned")}</p> </div> </div> </div> <div> <!-- Eliminado encabezado de Parentesco --> <div class="space-y-3"> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("father")}</p> <p class="font-medium">${animal.pare || t("not_available")}</p> </div> <div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("mother")}</p> <p class="font-medium">${animal.mare || t("not_available")}</p> </div> ${animal.genere === "F" && renderTemplate`<div> <p class="text-sm text-gray-500 dark:text-gray-400">${t("nursing_status")}</p> <p class="font-medium"> ${animal.alletar === "0" ? t("not_nursing") : animal.alletar === "1" ? t("nursing_one") : animal.alletar === "2" ? t("nursing_two") : t("not_available")} </p> </div>`} </div> </div> <!-- Sección de Observaciones --> <div class="md:col-span-2 mt-4"> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">${t("observations")}</h3> <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md"> ${animal.observaciones ? renderTemplate`<p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">${animal.observaciones}</p>` : renderTemplate`<p class="text-gray-500 dark:text-gray-400 italic">${t("no_observations")}</p>`} </div> </div> </div> <!-- Barra de ancho completo para los botones al final de la pestaña Información Completa --> <div class="w-full col-span-1 md:col-span-2 mt-10 py-4 border-t border-gray-100 dark:border-gray-700"> <div class="container mx-auto px-4 flex justify-between items-center"> <!-- Botón Volver al centro --> <div class="flex-1 text-center"> <a href="/animals" class="inline-flex items-center justify-center px-5 py-2.5 bg-lime-500 text-white rounded-md hover:bg-lime-600 transition-colors shadow-md"> <span class="mr-2">←</span> Volver al listado de animales
</a> </div> <!-- Botón Exportar PDF a la derecha --> <div class="flex-none"> <button id="export-animal-pdf" class="inline-flex items-center justify-center px-5 py-2.5 bg-lime-500 text-white rounded-md hover:bg-lime-600 transition-colors shadow-md"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>
Exportar PDF
</button> </div> </div> </div> </div> </div> <!-- Eliminados los botones de la parte superior --> <!-- Pestaña 2: Historial de Partos (oculta por defecto) --> <div id="content-partos" class="hidden"> <div class="mb-4"> <h3 class="text-lg font-medium text-gray-900 dark:text-white">${t("birth_history")}</h3> <p class="text-gray-500 dark:text-gray-400">${t("birth_registry")}</p> </div> ${showPartosTab && renderTemplate`<div class="overflow-x-auto"> <table id="tabla-partos" class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead class="bg-gray-50 dark:bg-gray-700"> <tr> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" id="sort-fecha"> ${t("date")} <span class="ml-1 sort-indicator">↑</span> </th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" id="sort-genero">${t("gender_label")}</th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" id="sort-estado">${t("status")}</th> <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${t("observations")}</th> </tr> </thead> <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"> ${animal && (() => {
    let partosArray = [];
    if (animal.partos && animal.partos.items && animal.partos.items.length > 0) {
      partosArray = animal.partos.items;
    } else if (animal.partos && Array.isArray(animal.partos) && animal.partos.length > 0) {
      partosArray = animal.partos;
    } else if (animal.parts && Array.isArray(animal.parts) && animal.parts.length > 0) {
      partosArray = animal.parts;
    }
    if (partosArray.length > 0) {
      partosArray.sort((a, b) => {
        const fechaA = a.part ? new Date(a.part) : /* @__PURE__ */ new Date(0);
        const fechaB = b.part ? new Date(b.part) : /* @__PURE__ */ new Date(0);
        return fechaA - fechaB;
      });
      return partosArray.map((parto) => renderTemplate`<tr${addAttribute(parto.id, "data-id")}> <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"> ${parto.part ? (() => {
        try {
          if (typeof parto.part === "string") {
            if (new RegExp("^\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4}$").test(parto.part)) {
              const partes = parto.part.split(/[\/\-]/);
              if (partes.length === 3) {
                const fecha = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                if (!isNaN(fecha.getTime())) {
                  return `${partes[0].padStart(2, "0")}/${partes[1].padStart(2, "0")}/${partes[2]}`;
                }
              }
              return parto.part;
            } else {
              const fecha = new Date(parto.part);
              if (!isNaN(fecha.getTime())) {
                return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
              }
            }
          }
          return String(parto.part);
        } catch (e) {
          return "Fecha incorrecta";
        }
      })() : "N/A"} </td> <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"> ${parto.GenereT === "M" ? txtMacho : parto.GenereT === "F" ? txtHembra : parto.GenereT === "esforrada" ? "Esforr\xE1" : txtNoDisponible} </td> <td class="px-6 py-4 whitespace-nowrap"> <span${addAttribute(`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${parto.EstadoT === "OK" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}`, "class")}> ${parto.EstadoT === "OK" ? txtVivo : txtMuerto} </span> </td> <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"> ${parto.observacions || parto.observaciones || parto.obs || txtObservaciones} </td> </tr>`);
    } else {
      return renderTemplate`<tr> <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
No hay registros de partos para este animal
</td> </tr>`;
    }
  })()} </tbody> </table> </div>`} <div class="p-6 text-center text-gray-500 dark:text-gray-400"> ${!showPartosTab && renderTemplate`<p>${t("no_births")}</p>`} <!-- Barra de ancho completo para los botones al final de la pestaña Partos --> <div class="w-full mt-6 py-4 border-t border-gray-100 dark:border-gray-700"> <div class="container mx-auto px-4 flex justify-between items-center"> <!-- Botón Volver al centro --> <div class="flex-1 text-center"> <a href="/animals" class="inline-flex items-center justify-center px-5 py-2.5 bg-lime-500 text-white rounded-md hover:bg-lime-600 transition-colors shadow-md"> <span class="mr-2">←</span> Volver al listado de animales
</a> </div> <!-- Botón Exportar PDF a la derecha --> <div class="flex-none"> <button id="export-partos-pdf" class="inline-flex items-center justify-center px-5 py-2.5 bg-lime-500 text-white rounded-md hover:bg-lime-600 transition-colors shadow-md"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>
Exportar PDF
</button> </div> </div> </div> </div> </div> <!-- Pestaña 3: Historial de Cambios (oculta por defecto) --> <div id="content-changes" class="hidden"> <div class="mb-4"> <h3 class="text-lg font-medium text-gray-900 dark:text-white">${t("changes_history")}</h3> <p class="text-gray-500 dark:text-gray-400">${t("changes_registry")}</p> </div> <div class="p-6 text-center text-gray-500 dark:text-gray-400"> <p>${t("no_changes")}</p> </div> <!-- Barra de ancho completo para los botones al final de la pestaña Historial de Cambios --> <div class="w-full mt-6 py-4 border-t border-gray-100 dark:border-gray-700"> <div class="container mx-auto px-4 flex justify-between items-center"> <!-- Botón Volver al centro --> <div class="flex-1 text-center"> <a href="/animals" class="inline-flex items-center justify-center px-5 py-2.5 bg-lime-500 text-white rounded-md hover:bg-lime-600 transition-colors shadow-md"> <span class="mr-2">←</span> Volver al listado de animales
</a> </div> <!-- Botón Exportar PDF a la derecha --> <div class="flex-none"> <button id="export-changes-pdf" class="inline-flex items-center justify-center px-5 py-2.5 bg-lime-500 text-white rounded-md hover:bg-lime-600 transition-colors shadow-md"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>
Exportar PDF
</button> </div> </div> </div> </div> </div>  <div class="fixed bottom-6 right-6 z-10"> <a href="/animals" class="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/80 transition-colors"> <span class="text-xl">←</span> </a> </div> ` })}`}` }));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/[id].astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/[id].astro";
const $$url = "/animals/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
