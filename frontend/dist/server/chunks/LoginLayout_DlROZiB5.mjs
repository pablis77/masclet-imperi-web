import { c as createComponent, a as createAstro, g as renderHead, h as renderSlot, b as renderTemplate } from './vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                        */

const $$Astro = createAstro();
const $$LoginLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$LoginLayout;
  const {
    title = "Masclet Imperi"
  } = Astro2.props;
  return renderTemplate`<html lang="es" class="light"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Masclet Imperi - Sistema de Gestión Ganadera"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title} | Masclet Imperi</title>${renderHead()}</head> <body class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100"> <!-- Sin barras de navegación, solo el contenido --> <main class="flex-1"> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/layouts/LoginLayout.astro", void 0);

export { $$LoginLayout as $ };
//# sourceMappingURL=LoginLayout_DlROZiB5.mjs.map
