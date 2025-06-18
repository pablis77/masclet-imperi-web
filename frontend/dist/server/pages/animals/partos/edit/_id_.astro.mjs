import { c as createComponent, a as createAstro, b as renderTemplate, f as defineScriptVars, r as renderComponent, m as maybeRenderHead, d as addAttribute } from '../../../../chunks/vendor_XrHmsJ5B.mjs';
export { e as renderers } from '../../../../chunks/vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../../../../chunks/MainLayout_CQEYGpDK.mjs';
import { $ as $$MessageContainer } from '../../../../chunks/MessageContainer_CzI8Lzk8.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const userRole = Astro2.cookies.get("userRole")?.value || "user";
  let parto = null;
  let animal = null;
  let loading = true;
  let error = null;
  let title = "Cargando parto...";
  try {
    const token = "admin123";
    const animalsResponse = await fetch(`http://localhost:8000/api/v1/animals/?limit=1000`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!animalsResponse.ok) {
      throw new Error(`Error al cargar los animales: ${animalsResponse.statusText}`);
    }
    const animalsData = await animalsResponse.json();
    let animalId = null;
    if (animalsData && animalsData.data) {
      for (const animalItem of animalsData.data) {
        if (animalItem.partos && animalItem.partos.items && Array.isArray(animalItem.partos.items)) {
          const foundParto = animalItem.partos.items.find((p) => p.id == id);
          if (foundParto) {
            parto = foundParto;
            animal = animalItem;
            animalId = animalItem.id;
            break;
          }
        } else if (animalItem.partos && Array.isArray(animalItem.partos)) {
          const foundParto = animalItem.partos.find((p) => p.id == id);
          if (foundParto) {
            parto = foundParto;
            animal = animalItem;
            animalId = animalItem.id;
            break;
          }
        }
      }
    }
    if (!parto && !animalId) {
      throw new Error("No se pudo encontrar el parto en ninguno de los animales.");
    }
    title = parto ? `Editar Parto - ${animal?.nom || "Animal"}` : "Parto no encontrado";
    loading = false;
  } catch (err) {
    console.error("Error al cargar los datos:", err);
    error = err.message || "Error al cargar los datos del parto";
    loading = false;
    title = "Error al cargar parto";
  }
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  document.addEventListener('DOMContentLoaded', () => {\n    const form = document.getElementById('edit-parto-form');\n    const debugOutput = document.getElementById('debug-output');\n    const debugContent = document.getElementById('debug-content');\n    \n    if (form) {\n      form.addEventListener('submit', async (e) => {\n        e.preventDefault();\n        \n        try {\n          // Obtener los valores del formulario\n          const formData = new FormData(form);\n          const partDate = formData.get('part');\n          \n          // Validar campos requeridos\n          if (!partDate || !formData.get('GenereT') || !formData.get('EstadoT')) {\n            alert('Por favor, completa todos los campos obligatorios.');\n            return;\n          }\n          \n          // Formatear fecha correctamente (de YYYY-MM-DD a DD/MM/YYYY)\n          const dateParts = partDate.split('-');\n          const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;\n          \n          // Crear objeto de datos para la API\n          const apiData = {\n            part: formattedDate,\n            GenereT: formData.get('GenereT'),\n            EstadoT: formData.get('EstadoT'),\n            observacions: formData.get('observacions') || null,\n            visible: formData.get('visible') === 'on' // Convertir checkbox a booleano\n          };\n          \n          // Para desarrollo, mostrar los datos que se enviar\xE1n\n          if (debugOutput && debugContent) {\n            debugContent.textContent = JSON.stringify(apiData, null, 2);\n            debugOutput.classList.remove('hidden');\n          }\n          \n          // Obtener token de autenticaci\xF3n (en producci\xF3n, usar localStorage o cookies)\n          const token = localStorage.getItem('token') || 'admin123';\n          \n          // Enviar datos a la API\n          // Intentar actualizar con PUT en lugar de PATCH\n          const response = await fetch(`http://localhost:8000/api/v1/animals/${animal.id}/partos/${partoId}`, {\n            method: 'PUT',\n            headers: {\n              'Content-Type': 'application/json',\n              'Authorization': `Bearer ${token}`\n            },\n            body: JSON.stringify(apiData)\n          });\n          \n          if (!response.ok) {\n            const errorData = await response.json();\n            throw new Error(errorData.detail || 'Error al actualizar el parto');\n          }\n          \n          const data = await response.json();\n          console.log('Parto actualizado:', data);\n          \n          // Guardar mensaje de \xE9xito en sessionStorage para mostrar en la p\xE1gina de detalles\n          sessionStorage.setItem('partoUpdatedMessage', 'El parto ha sido actualizado correctamente');\n          \n          // Redirigir a la p\xE1gina de detalles del animal\n          window.location.href = `/animals/${animalId}`;\n        } catch (error) {\n          console.error('Error:', error);\n          alert('Error al actualizar el parto: ' + error.message);\n        }\n      });\n    }\n  });\n})();<\/script>"], ["", " <script>(function(){", "\n  document.addEventListener('DOMContentLoaded', () => {\n    const form = document.getElementById('edit-parto-form');\n    const debugOutput = document.getElementById('debug-output');\n    const debugContent = document.getElementById('debug-content');\n    \n    if (form) {\n      form.addEventListener('submit', async (e) => {\n        e.preventDefault();\n        \n        try {\n          // Obtener los valores del formulario\n          const formData = new FormData(form);\n          const partDate = formData.get('part');\n          \n          // Validar campos requeridos\n          if (!partDate || !formData.get('GenereT') || !formData.get('EstadoT')) {\n            alert('Por favor, completa todos los campos obligatorios.');\n            return;\n          }\n          \n          // Formatear fecha correctamente (de YYYY-MM-DD a DD/MM/YYYY)\n          const dateParts = partDate.split('-');\n          const formattedDate = \\`\\${dateParts[2]}/\\${dateParts[1]}/\\${dateParts[0]}\\`;\n          \n          // Crear objeto de datos para la API\n          const apiData = {\n            part: formattedDate,\n            GenereT: formData.get('GenereT'),\n            EstadoT: formData.get('EstadoT'),\n            observacions: formData.get('observacions') || null,\n            visible: formData.get('visible') === 'on' // Convertir checkbox a booleano\n          };\n          \n          // Para desarrollo, mostrar los datos que se enviar\xE1n\n          if (debugOutput && debugContent) {\n            debugContent.textContent = JSON.stringify(apiData, null, 2);\n            debugOutput.classList.remove('hidden');\n          }\n          \n          // Obtener token de autenticaci\xF3n (en producci\xF3n, usar localStorage o cookies)\n          const token = localStorage.getItem('token') || 'admin123';\n          \n          // Enviar datos a la API\n          // Intentar actualizar con PUT en lugar de PATCH\n          const response = await fetch(\\`http://localhost:8000/api/v1/animals/\\${animal.id}/partos/\\${partoId}\\`, {\n            method: 'PUT',\n            headers: {\n              'Content-Type': 'application/json',\n              'Authorization': \\`Bearer \\${token}\\`\n            },\n            body: JSON.stringify(apiData)\n          });\n          \n          if (!response.ok) {\n            const errorData = await response.json();\n            throw new Error(errorData.detail || 'Error al actualizar el parto');\n          }\n          \n          const data = await response.json();\n          console.log('Parto actualizado:', data);\n          \n          // Guardar mensaje de \xE9xito en sessionStorage para mostrar en la p\xE1gina de detalles\n          sessionStorage.setItem('partoUpdatedMessage', 'El parto ha sido actualizado correctamente');\n          \n          // Redirigir a la p\xE1gina de detalles del animal\n          window.location.href = \\`/animals/\\${animalId}\\`;\n        } catch (error) {\n          console.error('Error:', error);\n          alert('Error al actualizar el parto: ' + error.message);\n        }\n      });\n    }\n  });\n})();<\/script>"])), renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/animals" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-6"> <div class="flex items-center gap-2 mb-2"> <a${addAttribute(`/animals/${parto?.animal_id}`, "href")} class="flex items-center text-primary hover:text-primary/80 dark:text-primary-light dark:hover:text-primary transition-colors"> <span class="mr-1">←</span> Volver al detalle del animal
</a> </div> <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${title}</h1> ${animal && renderTemplate`<p class="text-gray-600 dark:text-gray-300">Animal: ${animal.nom} (ID: ${animal.id})</p>`} </div>  ${loading && renderTemplate`<div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6"> <div class="flex justify-center items-center py-10"> <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div> <span class="ml-3 text-gray-700 dark:text-gray-300">Cargando...</span> </div> </div>`} ${error && renderTemplate`${renderComponent($$result2, "MessageContainer", $$MessageContainer, { "type": "error", "title": "Error", "message": error })}`}${!loading && !error && parto && renderTemplate`<div class="grid grid-cols-1 gap-6"> <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6"> <form id="edit-parto-form" class="space-y-6"> <!-- Fecha del Parto --> <div> <label for="part" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha del Parto</label> <input type="date" id="part" name="part"${addAttribute(parto.part ? new Date(parto.part.split("/").reverse().join("-")).toISOString().split("T")[0] : "", "value")} class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white" required> <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Formato: DD/MM/YYYY</p> </div> <!-- Género de la Cría --> <div> <label for="GenereT" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Género de la Cría</label> <select id="GenereT" name="GenereT" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white" required> <option value="">Selecciona una opción</option> <option value="M"${addAttribute(parto.GenereT === "M", "selected")}>Macho</option> <option value="F"${addAttribute(parto.GenereT === "F", "selected")}>Hembra</option> <option value="esforrada"${addAttribute(parto.GenereT === "esforrada", "selected")}>Esforrada</option> </select> </div> <!-- Estado de la Cría --> <div> <label for="EstadoT" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado de la Cría</label> <select id="EstadoT" name="EstadoT" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white" required> <option value="">Selecciona una opción</option> <option value="OK"${addAttribute(parto.EstadoT === "OK", "selected")}>Vivo</option> <option value="DEF"${addAttribute(parto.EstadoT === "DEF", "selected")}>Fallecido</option> </select> </div> <!-- Observaciones --> <div> <label for="observacions" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label> <textarea id="observacions" name="observacions" rows="3" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white">${parto.observacions || ""}</textarea> </div> <!-- Campo oculto para visibilidad --> <div> <label for="visible" class="flex items-center"> <input type="checkbox" id="visible" name="visible" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"${addAttribute(parto.visible !== false, "checked")}> <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Mostrar en el historial de partos</span> </label> <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Desmarca esta opción para ocultar este parto del historial y recuentos.</p> </div> <!-- Botones de acción --> <div class="flex justify-end space-x-3 pt-4"> <a${addAttribute(`/animals/${parto.animal_id}`, "href")} class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
Cancelar
</a> <button type="submit" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
Guardar Cambios
</button> </div> </form> <!-- Debug para desarrollo --> <div id="debug-output" class="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 hidden"> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Información de Depuración</h3> <pre id="debug-content" class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap"></pre> </div> </div> </div>`}${!loading && !error && !parto && renderTemplate`${renderComponent($$result2, "MessageContainer", $$MessageContainer, { "type": "info", "title": "Parto no encontrado", "message": "No se encontr\xF3 el parto solicitado. Puede que haya sido eliminado o que no exista." })}`}` }), defineScriptVars({ partoId: id, animalId: parto?.animal_id }));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/partos/edit/[id].astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/partos/edit/[id].astro";
const $$url = "/animals/partos/edit/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=_id_.astro.mjs.map
