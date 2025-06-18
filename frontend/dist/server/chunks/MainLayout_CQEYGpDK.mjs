import { c as createComponent, a as createAstro, b as renderTemplate, r as renderComponent, h as renderSlot, g as renderHead, d as addAttribute } from './vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import { c as $$Footer, $ as $$Navbar, b as $$Sidebar } from './Footer_CbdEWwuE.mjs';
/* empty css                        */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MainLayout;
  const {
    title = "Masclet Imperi",
    userRole = "administrador"
  } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><script src="/scripts/bloquear-eliminar-parto.js"><\/script><script src="/scripts/bloquear-editar-parto.js"><\/script><script src="/scripts/bloquear-actualizar-animal.js"><\/script><script src="/scripts/bloquear-acciones-listados.js"><\/script><meta name="generator"', "><title>", "</title>", '</head> <body class="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen"> <div class="flex min-h-screen"> <!-- Sidebar (siempre presente en el DOM, pero puede estar oculto en m\xF3vil) --> <div id="sidebar-container" class="md:block hidden"> ', ' </div> <!-- Overlay para cerrar el sidebar en m\xF3vil --> <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden md:hidden"></div> <!-- Contenido principal --> <div class="flex-1 flex flex-col min-h-screen md:ml-64"> <!-- A\xF1adido margen izquierdo igual al ancho del sidebar --> <!-- Navbar --> ', ' <!-- Bot\xF3n para abrir el sidebar en m\xF3vil --> <button id="open-sidebar" class="fixed bottom-4 left-4 md:hidden bg-primary text-white p-3 rounded-full shadow-lg z-20"> <span class="text-xl">\u2630</span> </button> <!-- Contenido de la p\xE1gina --> <main style="width: 100%; padding: 0; margin: 0;"> ', " </main> <!-- Footer --> ", ` </div> </div> <!-- Cargar el script de permisos y asegurar su ejecuci\xF3n inmediata --> <script src="/scripts/permissions-ui.js"><\/script> <script>
      // Ejecutar la configuraci\xF3n de permisos cuando el DOM est\xE9 cargado
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM cargado completamente - Ejecutando setupPermissionsUI');
        if (typeof setupPermissionsUI === 'function') {
          setupPermissionsUI();
        } else {
          console.error('La funci\xF3n setupPermissionsUI no est\xE1 disponible');
        }
      });
      
      // Intentar ejecutar tambi\xE9n cuando la ventana est\xE9 cargada
      window.addEventListener('load', function() {
        console.log('Ventana cargada completamente - Ejecutando setupPermissionsUI');
        if (typeof setupPermissionsUI === 'function') {
          setupPermissionsUI();
        }
      });
    <\/script>  <!-- Script para inicializar las notificaciones -->  </body> </html> `])), addAttribute(Astro2.generator, "content"), title, renderHead(), renderComponent($$result, "Sidebar", $$Sidebar, { "userRole": userRole, "currentPath": currentPath }), renderComponent($$result, "Navbar", $$Navbar, { "userRole": userRole, "currentPath": currentPath, "title": title }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/layout/MainLayout.astro", void 0);

export { $$MainLayout as $ };
//# sourceMappingURL=MainLayout_CQEYGpDK.mjs.map
