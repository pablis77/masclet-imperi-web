import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_B30v18IX.mjs';
export { e as renderers } from '../chunks/vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_Dr98ukQ7.mjs';
import { t } from '../chunks/Footer_B0t0tl4F.mjs';

const $$Notifications = createComponent(async ($$result, $$props, $$slots) => {
  const userRole = "administrador";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": t("notification.system_alerts"), "userRole": userRole }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-6"> <div class="mb-6"> <h1 class="text-2xl font-bold text-gray-800 dark:text-white">${t("notification.system_alerts")}</h1> <p class="text-gray-500 dark:text-gray-400">${t("notification.view_all_description")}</p> </div> <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"> <div class="flex justify-between items-center mb-6"> <div> <span class="text-gray-700 dark:text-gray-300">${t("notification.filter_by")}:</span> <select id="filter-type" class="ml-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"> <option value="all">${t("notification.all_types")}</option> <option value="system">${t("notification.types.system")}</option> <option value="backup">${t("notification.types.backup")}</option> <option value="animal">${t("notification.types.animal")}</option> <option value="import">${t("notification.types.import")}</option> </select> </div> <div> <button id="mark-all-read-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"> ${t("notification.mark_all_read")} </button> <button id="clear-all-btn" class="ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"> ${t("notification.clear_all")} </button> </div> </div> <div id="notifications-container" class="divide-y divide-gray-100 dark:divide-gray-700"> <!-- Las notificaciones se cargarán dinámicamente desde el backend --> <div class="text-center py-12 text-gray-500 dark:text-gray-400"> <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-4" role="status"> <span class="sr-only">Cargando...</span> </div> <p>${t("notification.loading")}</p> </div> </div> <div class="mt-6 flex justify-between items-center"> <div class="text-sm text-gray-500 dark:text-gray-400"> <span id="notifications-count">0</span> ${t("notification.total_count")} </div> <div> <button id="load-more-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 hidden"> ${t("notification.load_more")} </button> </div> </div> </div> </div>  ` })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/notifications.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/notifications.astro";
const $$url = "/notifications";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Notifications,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
