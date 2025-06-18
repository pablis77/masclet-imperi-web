import { c as createComponent, a as createAstro, b as renderTemplate, r as renderComponent, g as renderHead, h as renderSlot } from './vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$Navbar, b as $$Sidebar, c as $$Footer } from './Footer_B0t0tl4F.mjs';
import { jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
/* empty css                        */
/* empty css                        */

const AuthMiddleware = ({ children }) => {
  const [authorized, setAuthorized] = useState(true);
  useEffect(() => {
    try {
      if (!localStorage.getItem("token")) {
        localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.x");
        console.log("Token JWT de desarrollo generado automáticamente");
      }
      setAuthorized(true);
    } catch (error) {
      console.error("Error en AuthMiddleware:", error);
      setAuthorized(true);
    }
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children });
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$DefaultLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$DefaultLayout;
  const {
    title = "Masclet Imperi",
    userRole = "usuario"
  } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  const role = Astro2.cookies.get("userRole")?.value || userRole;
  return renderTemplate(_a || (_a = __template(['<!-- Script para actualizar la cookie de rol de usuario --><html lang="es" class="light"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Masclet Imperi - Sistema de Gesti\xF3n Ganadera"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>', " | Masclet Imperi</title>", '</head> <body class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100"> <!-- Script para actualizar la cookie de rol de usuario -->  ', ` <!-- Bot\xF3n flotante para mostrar el sidebar en m\xF3vil --> <button id="mobile-sidebar-toggle" class="md:hidden fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg z-30"> <span class="text-xl">\u2630</span> </button> <script>
      // Script para el tema oscuro/claro
      const theme = (() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
          return localStorage.getItem('theme');
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      })();
          
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Script para el sidebar m\xF3vil
      document.addEventListener('DOMContentLoaded', () => {
        const sidebarToggle = document.getElementById('mobile-sidebar-toggle');
        const sidebar = document.querySelector('.masclet-sidebar');
        
        if (sidebarToggle && sidebar) {
          sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-sidebar-active');
            
            // Cambiar el \xEDcono seg\xFAn el estado
            const toggleIcon = sidebarToggle.querySelector('span');
            if (toggleIcon) {
              toggleIcon.textContent = sidebar.classList.contains('mobile-sidebar-active') ? '\u2715' : '\u2630';
            }
          });
          
          // Cerrar sidebar al hacer clic fuera de \xE9l
          document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('mobile-sidebar-active') && 
                !sidebar.contains(e.target) && 
                e.target !== sidebarToggle) {
              sidebar.classList.remove('mobile-sidebar-active');
              
              // Restaurar \xEDcono
              const toggleIcon = sidebarToggle.querySelector('span');
              if (toggleIcon) toggleIcon.textContent = '\u2630';
            }
          });
        }
      });
    <\/script>   </body> </html>`])), title, renderHead(), renderComponent($$result, "AuthMiddleware", AuthMiddleware, { "client:load": true, "currentPath": currentPath, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/middlewares/AuthMiddleware", "client:component-export": "default" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, { "title": title, "userRole": role, "currentPath": currentPath })} <div class="flex flex-1 relative overflow-hidden"> <!-- Marca de agua con el logo --> <div class="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.01]"> <img src="/images/logo_masclet.jpg" alt="Marca de agua Masclet Imperi" class="w-full max-w-4xl object-contain"> </div> ${renderComponent($$result2, "Sidebar", $$Sidebar, { "userRole": role, "currentPath": currentPath })} <!-- Contenido principal con padding adaptativo y margen para la barra lateral --> <main class="flex-1 p-3 sm:p-4 md:p-6 relative z-10 overflow-auto md:ml-64"> <!-- Contenedor con ancho máximo para mejorar legibilidad en pantallas grandes --> <div class="max-w-7xl mx-auto"> ${renderSlot($$result2, $$slots["default"])} </div> </main> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} ` }));
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/layouts/DefaultLayout.astro", void 0);

export { $$DefaultLayout as $ };
