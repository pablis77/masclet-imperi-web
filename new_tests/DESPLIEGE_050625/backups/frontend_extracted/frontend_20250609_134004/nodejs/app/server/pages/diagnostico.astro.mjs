import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_BVudR5Na.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const LoginDebugger = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showDebugger, setShowDebugger] = useState(true);
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setTokenInfo(decoded);
        } catch (error) {
          console.error("Error al decodificar token:", error);
        }
      }
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          setUserInfo(user);
        } catch (error) {
          console.error("Error al parsear usuario:", error);
        }
      }
    } catch (error) {
      console.error("Error general:", error);
    }
  }, []);
  const toggleDebugger = () => {
    setShowDebugger(!showDebugger);
  };
  if (!tokenInfo && !userInfo) {
    return /* @__PURE__ */ jsx("div", { className: "bg-gray-100 p-3 rounded-lg mb-4", children: "No hay información de sesión" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-100 p-3 rounded-lg mb-4 text-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold", children: "Depurador de Login" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggleDebugger,
          className: "text-blue-500 hover:text-blue-700",
          children: showDebugger ? "Ocultar" : "Mostrar"
        }
      )
    ] }),
    showDebugger && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: "Token JWT:" }),
        /* @__PURE__ */ jsx("pre", { className: "bg-white p-2 rounded overflow-auto max-h-32", children: JSON.stringify(tokenInfo, null, 2) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sub:" }),
            " ",
            tokenInfo?.sub
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Username:" }),
            " ",
            tokenInfo?.username
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Role:" }),
            " ",
            tokenInfo?.role
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Exp:" }),
            " ",
            tokenInfo?.exp ? new Date(tokenInfo.exp * 1e3).toLocaleString() : "N/A"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: "Usuario en localStorage:" }),
        /* @__PURE__ */ jsx("pre", { className: "bg-white p-2 rounded overflow-auto max-h-32", children: JSON.stringify(userInfo, null, 2) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Username:" }),
            " ",
            userInfo?.username
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Rol:" }),
            " ",
            userInfo?.role
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Email:" }),
            " ",
            userInfo?.email
          ] })
        ] })
      ] })
    ] })
  ] });
};

const $$Diagnostico = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Diagn\xF3stico de Roles" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <h1 class="text-3xl font-bold mb-6">Diagnóstico de Sistema de Roles</h1> <div class="bg-white shadow-md rounded-lg p-6 mb-8"> <h2 class="text-xl font-semibold mb-4">Información de la sesión actual</h2> ${renderComponent($$result2, "LoginDebugger", LoginDebugger, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/debug/LoginDebugger", "client:component-export": "default" })} <div class="mt-6"> <h3 class="font-semibold mb-2">Instrucciones:</h3> <ol class="list-decimal pl-5 space-y-2"> <li>Revisa la información de arriba para ver si tu rol detectado coincide con tu usuario</li> <li>Si el rol no coincide, cierra sesión y vuelve a entrar</li> <li>Si sigue sin funcionar, prueba a borrar el localStorage:
<button id="clearStorage" class="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded ml-2 text-sm">
Borrar datos de sesión
</button> </li> </ol> </div> </div> <div class="bg-white shadow-md rounded-lg p-6"> <h2 class="text-xl font-semibold mb-4">Prueba de rutas de acceso</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <a href="/" class="block p-4 border rounded hover:bg-gray-50 transition"> <div class="font-medium">Dashboard</div> <div class="text-sm text-gray-500">Acceso: Todos los roles</div> </a> <a href="/animals" class="block p-4 border rounded hover:bg-gray-50 transition"> <div class="font-medium">Animales</div> <div class="text-sm text-gray-500">Acceso: Todos los roles</div> </a> <a href="/explotaciones-react" class="block p-4 border rounded hover:bg-gray-50 transition"> <div class="font-medium">Explotaciones</div> <div class="text-sm text-gray-500">Acceso: Todos los roles</div> </a> <a href="/users" class="block p-4 border rounded hover:bg-gray-50 transition"> <div class="font-medium">Usuarios</div> <div class="text-sm text-gray-500">Acceso: administrador, Ramon</div> </a> <a href="/imports" class="block p-4 border rounded hover:bg-gray-50 transition"> <div class="font-medium">Importación</div> <div class="text-sm text-gray-500">Acceso: Solo administrador</div> </a> <a href="/backup" class="block p-4 border rounded hover:bg-gray-50 transition"> <div class="font-medium">Backup</div> <div class="text-sm text-gray-500">Acceso: Solo administrador</div> </a> </div> </div> </div> ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/diagnostico.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/diagnostico.astro";
const $$url = "/diagnostico";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Diagnostico,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
