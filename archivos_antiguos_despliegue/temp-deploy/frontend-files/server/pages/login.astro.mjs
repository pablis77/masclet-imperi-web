import { c as createComponent, a as createAstro, g as renderHead, h as renderSlot, b as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                */

const $$Astro = createAstro();
const $$LoginLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$LoginLayout;
  const {
    title = "Masclet Imperi"
  } = Astro2.props;
  return renderTemplate`<html lang="es" class="light"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Masclet Imperi - Sistema de Gestión Ganadera"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title} | Masclet Imperi</title>${renderHead()}</head> <body class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100"> <!-- Sin barras de navegación, solo el contenido --> <main class="flex-1"> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/layouts/LoginLayout.astro", void 0);

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "LoginLayout", $$LoginLayout, { "title": "Login - Masclet Imperi" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8">  ${renderComponent($$result2, "PasswordErrorModal", null, { "client:only": "react", "isOpen": false, "onClose": () => {
  }, "id": "passwordErrorModal", "client:component-hydration": "only", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal", "client:component-export": "default" })} <div class="flex flex-col items-center"> <!-- Logo grande --> <img src="/images/logo_masclet.jpg" alt="Logo Masclet Imperi" class="w-48 h-auto mb-6"> <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
Iniciar sesión
</h2> <p class="mt-2 text-center text-sm text-gray-600">
Accede a la plataforma de gestión
</p> </div> <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"> <form id="loginForm" class="space-y-6"> <div> <label for="username" class="block text-sm font-medium text-gray-700">
Usuario
</label> <div class="mt-1"> <input id="username" name="username" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin"> </div> </div> <div> <label for="password" class="block text-sm font-medium text-gray-700">
Contraseña
</label> <div class="mt-1"> <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin123"> </div> </div> <div> <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
Iniciar sesión
</button> </div> </form> <div id="loginStatus" class="mt-4 text-sm hidden"></div> <div class="mt-6"> <div class="relative"> <div class="absolute inset-0 flex items-center"> <div class="w-full border-t border-gray-300"></div> </div> <div class="relative flex justify-center text-sm"> <span class="px-2 bg-white text-gray-500">
Masclet Imperi
</span> </div> </div> </div> </div> </div> </div> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/login.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
