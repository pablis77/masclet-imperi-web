import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_XrHmsJ5B.mjs';
export { e as renderers } from '../chunks/vendor_XrHmsJ5B.mjs';
import 'kleur/colors';
import { $ as $$DefaultLayout } from '../chunks/DefaultLayout_xC5OqFKB.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { i as isAuthenticated, d as getStoredUser, a as getCurrentLanguage, t } from '../chunks/Footer_CbdEWwuE.mjs';
import { g as getCurrentRole } from '../chunks/roleService_CiKfFVFf.mjs';
import { jwtDecode } from 'jwt-decode';

const ProfileManagement = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [currentRole, setCurrentRole] = useState("");
  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Debes iniciar sesión para ver esta página");
      setLoading(false);
      return;
    }
    let user = getStoredUser();
    const tokenData = localStorage.getItem("token");
    if (tokenData) {
      try {
        const decoded = jwtDecode(tokenData);
        console.log("Token JWT decodificado:", decoded);
        const tokenUsername = decoded.sub || "";
        const tokenRole = decoded.role || "";
        if (tokenUsername === "Ramon" || tokenRole === "Ramon") {
          console.log("📝 Usuario Ramon detectado en el token JWT - usando datos reales");
          user = {
            id: 14,
            // ID real de Ramon según se verificó en la base de datos
            username: "Ramon",
            email: "ramon@prueba.com",
            // Email correcto según la base de datos
            // Eliminamos el campo full_name que no existe realmente en la DB
            role: "Ramon",
            is_active: true,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userRole", "Ramon");
          localStorage.setItem("username", "Ramon");
        } else {
          console.log(`📝 Usuario ${tokenUsername} detectado en el token JWT - usando datos del token`);
          user = {
            id: 1,
            // ID provisional
            username: tokenUsername,
            email: `${tokenUsername.toLowerCase()}@mascletimperi.com`,
            // Eliminamos el campo full_name que no existe realmente en la DB
            role: tokenRole || "usuario",
            is_active: true,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userRole", tokenRole);
          localStorage.setItem("username", tokenUsername);
        }
      } catch (err) {
        console.error("Error al procesar el token JWT:", err);
      }
    }
    if (!user) {
      setError("No se pudo obtener la información del usuario");
      setLoading(false);
      return;
    }
    if (user) {
      if (user.username === "admin" && user.role !== "administrador") {
        console.log("Corrigiendo rol para usuario admin de:", user.role, "a: administrador");
        user.role = "administrador";
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (user.username === "Ramon" && user.role !== "Ramon") {
        console.log("Corrigiendo rol para usuario Ramon de:", user.role, "a: Ramon");
        user.role = "Ramon";
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("ramonFix", "true");
        localStorage.setItem("userRole", "Ramon");
      }
    }
    const actualRole = getCurrentRole();
    console.log("Rol actual detectado:", actualRole);
    setCurrentUser(user);
    setCurrentRole(actualRole);
    setLoading(false);
  }, []);
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    setPasswordError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/v1/users/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al cambiar la contraseña");
      }
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Contraseña actualizada correctamente");
      setTimeout(() => {
        setSuccess(null);
      }, 5e3);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "text-center p-4", children: "Cargando..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", role: "alert", children: [
      /* @__PURE__ */ jsx("strong", { className: "font-bold", children: "Error:" }),
      /* @__PURE__ */ jsxs("span", { className: "block sm:inline", children: [
        " ",
        error
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "bg-white shadow-md rounded-lg p-6", children: currentUser && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4 text-gray-800", children: "Información del usuario" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Nombre de usuario" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: currentUser?.username })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Correo electrónico" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: currentUser?.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Rol" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: currentUser?.role })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t pt-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4 text-gray-800", children: "Cambiar contraseña" }),
      success && /* @__PURE__ */ jsx("div", { className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4", role: "alert", children: /* @__PURE__ */ jsx("span", { className: "block sm:inline", children: success }) }),
      passwordError && /* @__PURE__ */ jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4", role: "alert", children: /* @__PURE__ */ jsx("span", { className: "block sm:inline", children: passwordError }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handlePasswordChange, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", htmlFor: "oldPassword", children: "Contraseña actual" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
              id: "oldPassword",
              type: "password",
              value: oldPassword,
              onChange: (e) => setOldPassword(e.target.value),
              placeholder: "Ingresa tu contraseña actual"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", htmlFor: "newPassword", children: "Nueva contraseña" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
              id: "newPassword",
              type: "password",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              placeholder: "Ingresa tu nueva contraseña"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", htmlFor: "confirmPassword", children: "Confirmar nueva contraseña" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
              id: "confirmPassword",
              type: "password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              placeholder: "Confirma tu nueva contraseña"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50",
            type: "submit",
            disabled: loading,
            children: loading ? "Procesando..." : "Cambiar contraseña"
          }
        ) })
      ] })
    ] })
  ] }) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const lang = getCurrentLanguage();
  const title = `${t("ui.edit_profile", lang)} | Masclet Imperi`;
  return renderTemplate`${renderComponent($$result, "DefaultLayout", $$DefaultLayout, { "title": title }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-6"> <h1 class="text-3xl font-bold text-gray-900">${t("ui.edit_profile", lang)}</h1> <p class="text-gray-600">${lang === "ca" ? "Gestiona la teva informaci\xF3 personal i contrasenya" : "Gestiona tu informaci\xF3n personal y contrase\xF1a"}</p> </div> ${renderComponent($$result2, "ProfileManagement", ProfileManagement, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/profile/ProfileManagement", "client:component-export": "ProfileManagement" })} ` })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/profile/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/profile/index.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=profile.astro.mjs.map
