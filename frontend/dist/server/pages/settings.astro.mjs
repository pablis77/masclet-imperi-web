import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_XrHmsJ5B.mjs';
export { e as renderers } from '../chunks/vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_CQEYGpDK.mjs';

// Configuración básica para multilenguaje
const defaultLang = 'es';
const supportedLanguages = ['es', 'ca'];

// Traducción en Español
const es = {
  common: {
    welcome: "Bienvenido a Masclet Imperi",
    dashboard: "Dashboard",
    animals: "Animales",
    exploitations: "Explotaciones",
    users: "Usuarios",
    settings: "Configuración"
  },
  imports: {
    title: "Importación"
  }
};

// Traducción en Catalán
const ca = {
  common: {
    welcome: "Benvingut a Masclet Imperi",
    dashboard: "Tauler de control",
    animals: "Animals",
    exploitations: "Explotacions",
    users: "Usuaris",
    settings: "Configuració"
  },
  imports: {
    title: "Importació"
  }
};

// Función simple pero efectiva para las traducciones
function t(key, lang = defaultLang) {
  try {
    const parts = key.split('.');
    if (parts.length !== 2) return key;
    
    const section = parts[0];
    const term = parts[1];
    
    const dict = lang === 'ca' ? ca : es;
    
    if (dict[section] && dict[section][term]) {
      return dict[section][term];
    }
    
    return key;
  } catch (e) {
    console.error(`Error en traducción para la clave: ${key}`, e);
    return key;
  }
}

// Función para obtener el idioma actual
function getCurrentLanguage() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const savedLang = localStorage.getItem('userLanguage');
    return savedLang && supportedLanguages.includes(savedLang) 
      ? savedLang 
      : defaultLang;
  }
  return defaultLang;
}

const $$Settings = createComponent(($$result, $$props, $$slots) => {
  const userRole = "administrador";
  getCurrentLanguage();
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": t("settings.title"), "userRole": userRole, "currentPath": "/settings" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto px-4 py-6"> <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"> <!-- Formulario de configuración integrado directamente --> <div class="max-w-4xl mx-auto"> <!-- Modal de notificación --> <div id="notification-modal" class="hidden fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex justify-center items-center"> <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"> <div id="notification-content" class="flex items-center"> <div id="notification-icon" class="mr-3 text-2xl"></div> <div id="notification-message" class="flex-1"></div> </div> <div class="mt-4 text-right"> <button id="close-notification" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
Aceptar
</button> </div> </div> </div> <div class="mb-8"> <h2 class="text-xl font-semibold mb-4 text-primary border-b pb-2" id="title-user-preferences">Preferencias de usuario</h2> <!-- Preferencias de usuario: Idioma y tema visual --> <div class="space-y-6"> <!-- Selección de Idioma --> <div class="flex flex-col md:flex-row md:items-center gap-4"> <label for="language" class="font-medium w-48" id="label-language">Idioma:</label> <div class="flex-1"> <select id="language" class="w-full md:w-64 p-2 border rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary"> <option value="es" id="option-es">Español</option> <option value="ca" id="option-ca">Catalán</option> </select> </div> </div> <!-- Selección de Tema --> <div class="flex flex-col md:flex-row md:items-center gap-4"> <label for="theme" class="font-medium w-48" id="label-theme">Tema visual:</label> <div class="flex-1"> <select id="theme" class="w-full md:w-64 p-2 border rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary"> <option value="light" id="option-light">Claro</option> <option value="dark" id="option-dark">Oscuro</option> <option value="system" id="option-system">Usar preferencia del sistema</option> </select> </div> </div> </div> </div> <div class="mb-8"> <h2 class="text-xl font-semibold mb-4 text-primary border-b pb-2" id="title-notifications">Notificaciones</h2> <!-- Configuración de notificaciones --> <div class="space-y-4"> <div class="flex items-start gap-3"> <input type="checkbox" id="notify_backups" class="mt-1 h-5 w-5 text-primary focus:ring-primary"> <div> <label for="notify_backups" class="font-medium" id="label-backups">Avisos de copias de seguridad</label> <p class="text-gray-500 text-sm" id="desc-backups">Recibir notificación cuando se realicen copias de seguridad automáticas</p> </div> </div> <div class="flex items-start gap-3"> <input type="checkbox" id="notify_imports" class="mt-1 h-5 w-5 text-primary focus:ring-primary"> <div> <label for="notify_imports" class="font-medium" id="label-imports">Avisos de importaciones</label> <p class="text-gray-500 text-sm" id="desc-imports">Recibir notificación cuando se completen importaciones</p> </div> </div> <div class="flex items-start gap-3"> <input type="checkbox" id="notify_animals" class="mt-1 h-5 w-5 text-primary focus:ring-primary"> <div> <label for="notify_animals" class="font-medium" id="label-animals">Avisos sobre animales</label> <p class="text-gray-500 text-sm" id="desc-animals">Recibir notificación sobre cambios importantes en los animales</p> </div> </div> </div> </div> <!-- Botones de acción --> <div class="flex justify-end gap-3 mt-8 pt-4 border-t"> <button type="button" id="btn-cancel" class="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
Cancelar
</button> <button type="button" id="btn-save" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
Guardar
</button> </div> </div>  </div> </div> ` })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/settings.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/settings.astro";
const $$url = "/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Settings,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=settings.astro.mjs.map
