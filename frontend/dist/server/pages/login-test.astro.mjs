import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_B30v18IX.mjs';
export { e as renderers } from '../chunks/vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$DefaultLayout } from '../chunks/DefaultLayout_sfsXaPHw.mjs';

const $$LoginTest = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DefaultLayout", $$DefaultLayout, { "title": "Test Login - Masclet Imperi" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8"> <div> <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
Iniciar sesión (Prueba de roles)
</h2> <p class="mt-2 text-center text-sm text-gray-600">
Selecciona el rol para probar los permisos
</p> </div> <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"> <form id="loginForm" class="space-y-6"> <div> <label for="username" class="block text-sm font-medium text-gray-700">
Usuario
</label> <div class="mt-1"> <input id="username" name="username" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin"> </div> </div> <div> <label for="password" class="block text-sm font-medium text-gray-700">
Contraseña
</label> <div class="mt-1"> <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="admin123"> </div> </div> <div> <label for="role" class="block text-sm font-medium text-gray-700">
Rol para pruebas
</label> <div class="mt-1"> <select id="role" name="role" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"> <option value="administrador">Administrador</option> <option value="gerente">Ramon</option> <option value="editor">Editor</option> <option value="usuario">Usuario (solo lectura)</option> </select> </div> </div> <div> <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
Iniciar sesión como rol seleccionado
</button> </div> </form> <div id="loginStatus" class="mt-4 text-sm hidden"></div> <div class="mt-6"> <div class="relative"> <div class="absolute inset-0 flex items-center"> <div class="w-full border-t border-gray-300"></div> </div> <div class="relative flex justify-center text-sm"> <span class="px-2 bg-white text-gray-500">
Modo de prueba - Masclet Imperi
</span> </div> </div> </div> </div> </div> </div> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/login-test.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/login-test.astro";
const $$url = "/login-test";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$LoginTest,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
