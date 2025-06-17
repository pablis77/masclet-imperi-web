import { c as createComponent, a as createAstro, b as renderTemplate, d as addAttribute, m as maybeRenderHead, f as defineScriptVars, r as renderComponent } from '../../../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../../../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../../../chunks/MainLayout_DsgB9yc8.mjs';
import 'clsx';
import { a as getCurrentLanguage, t } from '../../../chunks/Footer_BuyfVHI3.mjs';
import { a as animalService } from '../../../chunks/animalService_BGR2eQCt.mjs';

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$Astro$2 = createAstro();
const $$AnimalForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AnimalForm;
  const { animal } = Astro2.props;
  const lang = getCurrentLanguage();
  console.log("[AnimalForm] Idioma detectado:", lang);
  function formatDateForInput(dob) {
    if (!dob || typeof dob !== "string") return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return dob;
    }
    const match = dob.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    try {
      const fecha = new Date(dob);
      if (!isNaN(fecha.getTime())) {
        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
        const day = fecha.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error("Error al parsear fecha:", e);
    }
    return "";
  }
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", '<form id="form-general" class="space-y-6"', '> <div class="flex justify-end mb-4"> <button id="show-debug" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded" type="button" style="display: none;">', '</button> </div> <!-- Panel de depuraci\xF3n oculto --> <div id="debug-info" class="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sticky top-0 z-50 overflow-auto" style="display: none;"> <div class="flex justify-between items-center mb-2"> <p class="font-bold text-red-700">', '</p> <button id="clear-debug" class="text-xs bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded" type="button">', '</button> </div> <div id="debug-content" class="whitespace-pre-wrap overflow-auto h-60 border border-yellow-300 p-2 bg-white"></div> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <!-- Columna 1 --> <div class="space-y-4"> <div> <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">', '</label> <input type="text" id="nombre" name="nombre" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> </div> <div> <label for="genere" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">`, '</label> <select id="genere" name="genere" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', ` onchange="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> <option value="M"`, ">", '</option> <option value="F"', ">", '</option> </select> </div> <div> <label for="dob" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">', '</label> <input type="date" id="dob" name="dob" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> </div> <div> <label for="codigo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">`, '</label> <input type="text" id="codigo" name="codigo" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> </div> <div> <label for="num_serie" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">`, '</label> <input type="text" id="num_serie" name="num_serie" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> </div> </div> <!-- Columna 2 --> <div class="space-y-4"> <div> <label for="explotacio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">`, '</label> <input type="text" id="explotacio" name="explotacio" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> </div> <div> <label for="origen" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">`, '</label> <input type="text" id="origen" name="origen" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> </div> <div> <label for="pare" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">`, '</label> <input type="text" id="pare" name="pare" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> </div> <div> <label for="mare" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">`, '</label> <input type="text" id="mare" name="mare" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', "", ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> <div class="text-xs text-gray-500 mt-1">`, '</div> </div> </div> </div> <!-- Campo de Observaciones (ancho completo) --> <div class="space-y-2"> <label for="observaciones" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">', '</label> <textarea id="observaciones" name="observaciones" rows="4" maxlength="2000" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"', ` oninput="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';">`, '</textarea> <div class="text-xs text-gray-500 mt-1">', '</div> </div> <!-- Leyenda para campos obligatorios --> <div class="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4"> ', ' </div> <!-- Navegaci\xF3n y botones secundarios --> <div class="flex space-x-2 mt-6"> <a href="/animals" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"> <span class="mr-1">\u2190</span> ', " </a> <a", ' class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"> ', ' </a> </div> <!-- Botones de acci\xF3n principales --> <div class="flex justify-between items-center mt-8"> <!-- Espacio vac\xEDo a la izquierda para mantener el bot\xF3n eliminar a la derecha --> <div></div> <!-- Contenedor central para el bot\xF3n de guardar cambios --> <div class="flex justify-center"> <!-- Bot\xF3n para guardar cambios (verde lima, centrado) --> <button type="submit" id="submit-button" class="px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600 transition-colors shadow-md"> ', ` </button> </div> <!-- Script para bloquear el bot\xF3n de eliminar animal para roles restringidos --> <script>
      // Comprobar rol de usuario directamente aqu\xED
      (function() {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role.toLowerCase();
            
            // Variable global para que otros scripts sepan que ya est\xE1 bloqueado
            window.deleteAnimalButtonBlocked = (role === 'editor' || role === 'usuario');
            
            document.addEventListener('DOMContentLoaded', function() {
              // Si se ejecuta muy r\xE1pido, esperar un tick para asegurar que el DOM est\xE9 listo
              setTimeout(() => {
                if (window.deleteAnimalButtonBlocked) {
                  console.log('BLOQUEANDO BOT\xD3N ELIMINAR ANIMAL INMEDIATAMENTE PARA ROL:', role);
                  const btn = document.getElementById('delete-animal-btn');
                  if (btn) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                    btn.style.pointerEvents = 'none';
                    btn.title = 'NO TIENES PERMISOS PARA ELIMINAR ANIMALES';
                    
                    // A\xF1adir icono de candado
                    if (!btn.querySelector('.lock-icon')) {
                      const lockIcon = document.createElement('span');
                      lockIcon.textContent = ' \u{1F512}';
                      lockIcon.className = 'ml-1 lock-icon';
                      btn.appendChild(lockIcon);
                    }
                    
                    // Prevenir navegaci\xF3n
                    btn.onclick = function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      alert('NO TIENES PERMISOS PARA ELIMINAR ANIMALES');
                      return false;
                    };
                  }
                }
              }, 0);
            });
          }
        } catch (e) {
          console.error('Error al verificar permisos para bot\xF3n Eliminar Animal:', e);
        }
      })();
    <\/script> <!-- Bot\xF3n para eliminar animal (rojo, a la derecha) --> <button type="button" id="delete-animal-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center shadow-md"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path> </svg>
Eliminar Animal
</button> </div> </form> `])), maybeRenderHead(), addAttribute(animal.id, "data-id"), t("animals.form.show_debug", lang), t("animals.form.debug_mode", lang), t("animals.form.clear", lang), t("animals.form.name", lang), addAttribute(animal.nom || "", "value"), addAttribute(animal.nom || "", "data-original-value"), t("animals.form.gender", lang), addAttribute(animal.genere || "", "data-original-value"), addAttribute(animal.genere === "M", "selected"), t("animals.form.male", lang), addAttribute(animal.genere === "F", "selected"), t("animals.form.female", lang), t("animals.form.birth_date", lang), addAttribute(formatDateForInput(animal.dob), "value"), addAttribute(formatDateForInput(animal.dob), "data-original-value"), t("animals.form.code", lang), addAttribute(animal.cod || "", "value"), addAttribute(animal.cod || "", "data-original-value"), t("animals.form.serial_number", lang), addAttribute(animal.num_serie || "", "value"), addAttribute(animal.num_serie || "", "data-original-value"), t("animals.form.exploitation", lang), addAttribute(animal.explotacio || "", "value"), addAttribute(animal.explotacio || "", "data-original-value"), t("animals.form.origin", lang), addAttribute(animal.origen || animal.quadra || "", "value"), addAttribute(animal.origen || animal.quadra || "", "data-original-value"), t("animals.form.father", lang), addAttribute(animal.pare || "", "value"), addAttribute(animal.pare || "", "data-original-value"), t("animals.form.mother", lang), addAttribute(animal.mare || "", "value"), addAttribute(animal.mare || "", "data-original-value"), t("animals.form.mother_hint", lang), t("animals.form.observations", lang), addAttribute(animal.observaciones || "", "data-original-value"), animal.observaciones || "", t("animals.form.observations_hint", lang), t("animals.form.pending_changes", lang), t("animals.form.back", lang), addAttribute(`/animals/${animal.id}`, "href"), t("animals.form.view_detail", lang), t("animals.form.save_changes", lang));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalForm.astro", void 0);

const $$Astro$1 = createAstro();
const $$HabitualesForm = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$HabitualesForm;
  const { animal } = Astro2.props;
  const lang = getCurrentLanguage();
  console.log("[HabitualesForm] Idioma detectado:", lang);
  return renderTemplate`${maybeRenderHead()}<form id="form-habituales" class="space-y-6"> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">${t("animals.habitual.title", lang)}</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <!-- Columna 1 --> <div class="space-y-4"> <div> <label for="estado_hab" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t("animals.habitual.status", lang)}</label> <select id="estado_hab" name="estado_hab" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"${addAttribute(animal.estado || "", "data-original-value")} onchange="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> <option value="OK"${addAttribute(animal.estado === "OK", "selected")}>${t("animals.habitual.active", lang)}</option> <option value="DEF"${addAttribute(animal.estado === "DEF", "selected")}>${t("animals.habitual.deceased", lang)}</option> </select>  </div> </div> <!-- Columna 2 --> <div class="space-y-4"> ${animal.genere === "F" && renderTemplate`<div> <label for="alletar" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t("animals.habitual.nursing_status", lang)}</label> <select id="alletar" name="alletar" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"${addAttribute(animal.alletar !== null ? animal.alletar.toString() : "", "data-original-value")} onchange="this.style.borderColor = this.value !== this.getAttribute('data-original-value') ? '#3b82f6' : '#d1d5db';"> <option value="0"${addAttribute(animal.alletar === 0 || animal.alletar === "0", "selected")}>${t("animals.habitual.not_nursing", lang)}</option> <option value="1"${addAttribute(animal.alletar === 1 || animal.alletar === "1", "selected")}>${t("animals.habitual.nursing_one", lang)}</option> <option value="2"${addAttribute(animal.alletar === 2 || animal.alletar === "2", "selected")}>${t("animals.habitual.nursing_two", lang)}</option> </select> </div>`} <!-- Botón de guardar (alineado a la derecha) --> <div class="mt-4 flex justify-end"> <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"> ${t("animals.habitual.save_changes", lang)} </button> </div> </div> </div> ${animal.genere === "F" && renderTemplate`<div class="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700"> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">${t("animals.habitual.new_birth_title", lang)}</h3> <div class="space-y-4"> <div> <label for="part" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t("animals.habitual.birth_date", lang)}</label> <input type="date" id="part" name="part" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="GenereT" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t("animals.habitual.offspring_gender", lang)}</label> <select id="GenereT" name="GenereT" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"> <option value="">${t("animals.habitual.select", lang)}</option> <option value="M">${t("animals.form.male", lang)}</option> <option value="F">${t("animals.form.female", lang)}</option> <option value="esforrada">${t("animals.habitual.miscarriage", lang)}</option> </select> </div> <div> <label for="EstadoT" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t("animals.habitual.offspring_status", lang)}</label> <select id="EstadoT" name="EstadoT" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"> <option value="">${t("animals.habitual.select", lang)}</option> <option value="OK">${t("animals.habitual.active", lang)}</option> <option value="DEF">${t("animals.habitual.deceased", lang)}</option> </select> </div> </div> <div> <label for="observacions" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t("animals.habitual.observations", lang)}</label> <textarea id="observacions" name="observacions" rows="3" maxlength="200" class="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea> <div class="text-xs text-gray-500 mt-1">${t("animals.habitual.observations_hint", lang)}</div> </div> <div class="flex justify-end"> <button type="button" id="registrar-parto-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"> ${t("animals.habitual.register_birth", lang)} </button> </div> </div> </div>`} </form> `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/HabitualesForm.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b;
const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const userRole = Astro2.cookies.get("userRole")?.value || "user";
  const lang = getCurrentLanguage();
  console.log("[AnimalUpdatePage] Idioma detectado:", lang);
  let animal = null;
  let loading = true;
  let error = null;
  let title = t("animals.update.loading", lang);
  try {
    animal = await animalService.getAnimalById(Number(id));
    if (animal && animal.data) {
      animal = animal.data;
    }
    title = `${t("animals.update.edit", lang)} ${animal.nom}`;
    loading = false;
  } catch (err) {
    console.error("Error al cargar el animal:", err);
    error = err.message || t("animals.update.error_loading", lang);
    loading = false;
    title = t("animals.update.error", lang);
  }
  return renderTemplate(_b || (_b = __template(["", " <script>(function(){", `
  // Variables globales
  window.animalId = id;
  
  // Funci\xF3n para mostrar mensajes
  window.mostrarMensaje = function(mensaje, tipo = 'info') {
    const container = document.createElement('div');
    container.className = 'fixed bottom-4 right-4 z-50 animate-slideIn';
    
    // Colores seg\xFAn el tipo
    let colorClase = 'bg-blue-50 border-blue-200 text-blue-800';
    if (tipo === 'error') {
      colorClase = 'bg-red-50 border-red-200 text-red-800';
    } else if (tipo === 'success') {
      colorClase = 'bg-green-50 border-green-200 text-green-800';
    }
    
    // Determinar qu\xE9 icono mostrar
    let icono = '\u2139\uFE0F'; // Icono de info por defecto
    if (tipo === 'error') {
      icono = '\u274C'; // Icono de error
    } else if (tipo === 'success') {
      icono = '\u2705'; // Icono de \xE9xito
    }
    
    container.innerHTML = \`
      <div class="flex items-center p-4 \${colorClase} rounded-lg border shadow-lg max-w-md">
        <div class="mr-3 text-xl">
          \${icono}
        </div>
        <div>
          <p class="font-medium">\${mensaje}</p>
        </div>
        <button class="ml-auto pl-3 hover:opacity-70" onclick="this.parentNode.parentNode.remove()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    \`;
    
    document.body.appendChild(container);
    
    // Auto eliminar despu\xE9s de 5 segundos
    setTimeout(() => {
      container.remove();
    }, 5000);
  };
})();<\/script> <!-- Script para forzar recarga completa al cambiar de idioma -->  <!-- Script para manejar formularios --> `], ["", " <script>(function(){", `
  // Variables globales
  window.animalId = id;
  
  // Funci\xF3n para mostrar mensajes
  window.mostrarMensaje = function(mensaje, tipo = 'info') {
    const container = document.createElement('div');
    container.className = 'fixed bottom-4 right-4 z-50 animate-slideIn';
    
    // Colores seg\xFAn el tipo
    let colorClase = 'bg-blue-50 border-blue-200 text-blue-800';
    if (tipo === 'error') {
      colorClase = 'bg-red-50 border-red-200 text-red-800';
    } else if (tipo === 'success') {
      colorClase = 'bg-green-50 border-green-200 text-green-800';
    }
    
    // Determinar qu\xE9 icono mostrar
    let icono = '\u2139\uFE0F'; // Icono de info por defecto
    if (tipo === 'error') {
      icono = '\u274C'; // Icono de error
    } else if (tipo === 'success') {
      icono = '\u2705'; // Icono de \xE9xito
    }
    
    container.innerHTML = \\\`
      <div class="flex items-center p-4 \\\${colorClase} rounded-lg border shadow-lg max-w-md">
        <div class="mr-3 text-xl">
          \\\${icono}
        </div>
        <div>
          <p class="font-medium">\\\${mensaje}</p>
        </div>
        <button class="ml-auto pl-3 hover:opacity-70" onclick="this.parentNode.parentNode.remove()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    \\\`;
    
    document.body.appendChild(container);
    
    // Auto eliminar despu\xE9s de 5 segundos
    setTimeout(() => {
      container.remove();
    }, 5000);
  };
})();<\/script> <!-- Script para forzar recarga completa al cambiar de idioma -->  <!-- Script para manejar formularios --> `])), renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/animals" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", '<div class="mb-6"> <div class="flex items-center gap-2 mb-2"> <a', ' class="flex items-center text-primary hover:text-primary/80 dark:text-primary-light dark:hover:text-primary transition-colors"> <span class="mr-1">\u2190</span> ', ' </a> </div> <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">', '</h1> <p class="text-gray-600 dark:text-gray-300">ID: ', "</p> </div>  ", " ", "", ' <script src="/scripts/block-delete-button.js"><\/script>  <script src="/scripts/translation-fixer.js"><\/script> '])), maybeRenderHead(), addAttribute(`/animals/${id}`, "href"), t("animals.update.return_to_detail", lang), animal?.nom, id, loading && renderTemplate`<div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6"> <div class="flex justify-center items-center py-10"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500 mb-3"></div> <p class="text-gray-600 dark:text-gray-300">${t("animals.update.loading_message", lang)}</p> </div> </div> </div>`, error && renderTemplate`<div class="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded mb-6"> <p>${t("animals.update.error_message", lang)}</p> <button class="mt-2 bg-red-200 dark:bg-red-800 px-4 py-2 rounded hover:bg-red-300 dark:hover:bg-red-700 transition" onclick="history.back()"> ${t("common.back", lang)} </button> </div>`, !loading && !error && animal && renderTemplate`<div class="grid grid-cols-1 gap-6"> <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700"> <div class="border-b border-gray-200 dark:border-gray-700"> <!-- Implementación directa de pestañas con traducciones --> <div class="flex" id="tabs-animal-update"> <button id="tab-general" data-content="content-general" class="tab-button px-6 py-3 font-medium bg-lime-500 text-white"> ${t("animals.update.general_data", lang)} </button> <button id="tab-habitual" data-content="content-habitual" class="tab-button px-6 py-3 font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"> ${t("animals.update.common_changes", lang)} </button> </div> </div> </div> <div class="p-6"> <!-- Pestaña 1: Datos Generales --> <div id="content-general" class="tab-content"> ${renderComponent($$result2, "AnimalForm", $$AnimalForm, { "animal": animal })} </div> <!-- Pestaña 2: Cambios Habituales --> <div id="content-habitual" class="tab-content hidden"> ${renderComponent($$result2, "HabitualesForm", $$HabitualesForm, { "animal": animal })} </div> </div> </div>
      
      <!-- Modal de confirmación para borrar animal -->
      <div id="delete-animal-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden"> <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 mx-4"> <div class="flex items-center justify-between mb-4"> <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t("animals.update.confirm_delete_title", lang)}</h3> <button id="close-delete-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <div class="mb-6"> <p class="text-gray-700 dark:text-gray-300 mb-4">${t("animals.update.confirm_delete_text", lang)}</p> </div> <div class="flex justify-end space-x-4"> <button id="cancel-delete" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"> ${t("common.cancel", lang)} </button> <button id="confirm-delete" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"> ${t("animals.update.delete_permanently", lang)} </button> </div> </div> </div>`) }), defineScriptVars({ id }));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/update/[id].astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/update/[id].astro";
const $$url = "/animals/update/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
