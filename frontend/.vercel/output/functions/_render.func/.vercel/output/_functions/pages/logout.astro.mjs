import { a as createComponent, b as createAstro, h as addAttribute, d as renderHead, e as renderSlot, r as renderTemplate, g as renderComponent } from '../chunks/vendor_UMFwe-5w.mjs';
export { i as renderers } from '../chunks/vendor_UMFwe-5w.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                  */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useEffect } from 'react';

const $$Astro = createAstro();
const $$AuthLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AuthLayout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body class="bg-gray-100"> <main> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/layouts/AuthLayout.astro", void 0);

const ClearLocalStorage = () => {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("LocalStorage limpiado, redirigiendo a login");
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-screen", children: [
    /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Cerrando sesión..." })
  ] });
};

const $$Logout = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$AuthLayout, { "title": "Cerrando sesi\xF3n | Masclet Imperi" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ClearLocalStorage", ClearLocalStorage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/auth/ClearLocalStorage", "client:component-export": "ClearLocalStorage" })} ` })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/logout.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/logout.astro";
const $$url = "/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Logout,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
