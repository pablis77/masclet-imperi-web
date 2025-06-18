import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_B30v18IX.mjs';
export { e as renderers } from '../chunks/vendor_B30v18IX.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_Dr98ukQ7.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as api } from '../chunks/api_DdghznrZ.mjs';
import { A as API_CONFIG } from '../chunks/apiConfig_Qu2HXU2s.mjs';
import { d as getStoredUser, a as getCurrentLanguage, t, i as isAuthenticated } from '../chunks/Footer_B0t0tl4F.mjs';
import { g as getCurrentRole } from '../chunks/roleService_8DcGpmU3.mjs';

const userServiceProxy = {
  // Obtiene una lista paginada de usuarios
  async getUsers(page = 1, limit = 10, search) {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }
      console.log("Obteniendo usuarios, página:", page, "límite:", limit);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token de autenticación disponible");
        return [];
      }
      const config = {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      };
      console.log("Enviando solicitud con token:", token.substring(0, 15) + "...");
      console.log("URL de solicitud:", `/users?${params.toString()}`);
      try {
        console.log("Intentando obtener usuarios con fetch...");
        let fullUrl;
        const baseUrl = `${API_CONFIG.backendURL || ""}${API_CONFIG.baseURL}`;
        fullUrl = `${baseUrl}/users/?${params.toString()}`;
        console.log("URL de la API construida desde configuración centralizada:", fullUrl);
        console.log("URL completa:", fullUrl);
        const fetchResponse = await fetch(fullUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
        if (fetchResponse.ok) {
          const jsonData = await fetchResponse.json();
          console.log("Datos obtenidos con fetch:", jsonData);
          if (jsonData && jsonData.items && Array.isArray(jsonData.items)) {
            console.log("Devolviendo usuarios desde fetch:", jsonData.items.length);
            return jsonData.items;
          } else if (Array.isArray(jsonData)) {
            console.log("Devolviendo array de usuarios desde fetch:", jsonData.length);
            return jsonData;
          }
        } else {
          console.warn("Error en la respuesta fetch:", fetchResponse.status);
        }
      } catch (fetchError) {
        console.error("Error al usar fetch:", fetchError);
      }
      console.log("Usando axios como método alternativo...");
      let url;
      let response;
      if (window.location.hostname === "localhost" || window.location.hostname.includes("192.168.")) {
        url = `http://localhost:8000/api/v1/users?${params.toString()}`;
        response = await api.get(url, { ...config, baseURL: "" });
      } else {
        url = `users?${params.toString()}`;
        response = await api.get(url, config);
      }
      console.log("Respuesta completa de axios:", response);
      let responseData;
      if (response.data) {
        responseData = response.data;
        console.log("Datos encontrados en response.data");
      } else if (response.request && response.request.response) {
        try {
          responseData = JSON.parse(response.request.response);
          console.log("Datos encontrados en response.request.response");
        } catch (e) {
          console.warn("Error al parsear response.request.response");
        }
      }
      if (!responseData) {
        console.warn("No se encontraron datos en la respuesta, intentando solicitud alternativa...");
        const alternativeResponse = await api.get("/users", config);
        if (alternativeResponse.data) {
          responseData = alternativeResponse.data;
          console.log("Datos encontrados en solicitud alternativa");
        } else if (alternativeResponse.request && alternativeResponse.request.response) {
          try {
            responseData = JSON.parse(alternativeResponse.request.response);
            console.log("Datos encontrados en alternativeResponse.request.response");
          } catch (e) {
            console.warn("Error al parsear alternativeResponse.request.response");
          }
        }
      }
      if (!responseData) {
        console.warn("Intentando solicitud XMLHttpRequest como último recurso...");
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          let xhrUrl;
          if (window.location.hostname === "localhost" || window.location.hostname.includes("192.168.")) {
            xhrUrl = "http://localhost:8000/api/v1/users";
          } else {
            xhrUrl = `${api.defaults.baseURL}/users`;
          }
          console.log("URL para XMLHttpRequest:", xhrUrl);
          xhr.open("GET", xhrUrl);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.responseType = "json";
          xhr.onload = function() {
            if (xhr.status === 200) {
              console.log("Respuesta XMLHttpRequest:", xhr.response);
              if (xhr.response && xhr.response.items) {
                resolve(xhr.response.items);
              } else if (Array.isArray(xhr.response)) {
                resolve(xhr.response);
              } else {
                resolve([]);
              }
            } else {
              console.error("Error en XMLHttpRequest:", xhr.status);
              resolve([]);
            }
          };
          xhr.onerror = function() {
            console.error("Error de red en XMLHttpRequest");
            resolve([]);
          };
          xhr.send();
        });
      }
      if (responseData) {
        console.log("Datos a procesar:", responseData);
        if (responseData.items && Array.isArray(responseData.items)) {
          console.log("Estructura detectada: { items: [...usuarios] }");
          return responseData.items;
        }
        if (Array.isArray(responseData)) {
          console.log("La respuesta es un array directo de usuarios con", responseData.length, "elementos");
          const paginatedResponse = {
            items: responseData,
            total: responseData.length,
            page,
            limit,
            pages: Math.ceil(responseData.length / limit)
          };
          return paginatedResponse;
        }
        return responseData;
      }
      console.warn("No se pudieron obtener datos de usuarios después de múltiples intentos");
      return [];
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return [];
    }
  },
  // Obtiene un usuario por su ID
  async getUserById(id) {
    try {
      console.log("Obteniendo usuario con ID:", id);
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  },
  // Crea un nuevo usuario
  async createUser(userData) {
    try {
      console.log("Creando nuevo usuario:", userData.username);
      const processedUserData = {
        ...userData,
        role: userData.role.toLowerCase(),
        is_active: userData.is_active !== void 0 ? userData.is_active : true
      };
      console.log("Datos del usuario a crear:", JSON.stringify(processedUserData, null, 2));
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token de autenticación disponible para crear usuario");
        throw new Error("No hay token de autenticación disponible");
      }
      const baseUrl = `${API_CONFIG.backendURL || ""}${API_CONFIG.baseURL}`;
      const url = `${baseUrl}/users/`;
      console.log("Usando URL construida desde API_CONFIG para crear usuario:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(processedUserData)
      });
      if (!response.ok) {
        throw {
          message: "Error al crear usuario",
          status: response.status,
          code: "ERROR"
        };
      }
      const data = await response.json();
      console.log("Respuesta al crear usuario:", data);
      return data;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  },
  // Actualiza un usuario existente
  async updateUser(id, userData) {
    try {
      console.log("Actualizando usuario con ID:", id);
      const token = localStorage.getItem("token");
      const baseUrl = `${API_CONFIG.backendURL || ""}${API_CONFIG.baseURL}`;
      const url = `${baseUrl}/users/${id}/`;
      console.log("Usando URL construida desde API_CONFIG:", url);
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        throw {
          message: "Error al actualizar usuario",
          status: response.status,
          code: "ERROR"
        };
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },
  // Elimina un usuario
  async deleteUser(id) {
    try {
      console.log("Eliminando usuario con ID:", id);
      const token = localStorage.getItem("token");
      const baseUrl = `${API_CONFIG.backendURL || ""}${API_CONFIG.baseURL}`;
      const url = `${baseUrl}/users/${id}/`;
      console.log("Usando URL construida desde API_CONFIG para eliminar:", url);
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw {
          message: "Error al eliminar usuario",
          status: response.status,
          code: "ERROR"
        };
      }
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }
};

const UserForm = ({ user, onSuccess, onCancel, availableRoles }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "usuario"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const loggedUser = getStoredUser();
  const [currentUser, setCurrentUser] = useState(loggedUser);
  const [isAdmin, setIsAdmin] = useState(loggedUser?.role === "administrador");
  console.log("UserForm - Estado de usuario actual:", {
    currentUser,
    isAdmin,
    role: loggedUser?.role
  });
  useEffect(() => {
    if (user) {
      setIsEdit(true);
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        confirmPassword: "",
        role: user.role
      });
      console.log("UserForm - Usuario cargado para edición:", user);
      console.log("UserForm - Datos de formulario inicializados:", {
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      setIsEdit(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "usuario"
      });
    }
  }, [user]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    let fieldName = name;
    if (name.includes("_")) {
      fieldName = name.split("_")[0];
    }
    let realFieldName = fieldName;
    if (fieldName.includes("username")) realFieldName = "username";
    if (fieldName.includes("email")) realFieldName = "email";
    if (fieldName.includes("password") && !fieldName.includes("confirm")) realFieldName = "password";
    if (fieldName.includes("confirmPassword")) realFieldName = "confirmPassword";
    setFormData((prev) => ({
      ...prev,
      [realFieldName]: value
    }));
  };
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("El nombre de usuario es obligatorio");
      return false;
    }
    if (!formData.email.trim()) {
      setError("El email es obligatorio");
      return false;
    }
    if (!isEdit && !formData.password) {
      setError("La contraseña es obligatoria");
      return false;
    }
    if (!isEdit && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      if (isEdit && user) {
        const userData = {
          username: formData.username,
          email: formData.email,
          role: formData.role
        };
        if (formData.password && isAdmin) {
          Object.assign(userData, { password: formData.password });
        }
        console.log("UserForm - Enviando datos para actualizar usuario:", userData);
        const updatedUser = await userServiceProxy.updateUser(user.id, userData);
        console.log("UserForm - Usuario actualizado correctamente:", updatedUser);
      } else {
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };
        console.log("UserForm - Enviando datos para crear usuario:", userData);
        const createdUser = await userServiceProxy.createUser(userData);
        console.log("UserForm - Usuario creado correctamente:", createdUser);
      }
      onSuccess();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      if (err.response) {
        setError(err.response.data?.detail || "Error al guardar el usuario");
      } else if (err.request) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError("Error al procesar la solicitud");
      }
    } finally {
      setLoading(false);
    }
  };
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return /* @__PURE__ */ jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, autoComplete: "off", spellCheck: "false", children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "none" }, children: [
      /* @__PURE__ */ jsx("input", { type: "text", name: "username_fake", autoComplete: "username" }),
      /* @__PURE__ */ jsx("input", { type: "password", name: "password_fake", autoComplete: "current-password" })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-gray-900", children: isEdit ? "Editar Usuario" : "Crear Nuevo Usuario" }),
    error && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-red-50 p-4", children: /* @__PURE__ */ jsx("div", { className: "flex", children: /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-red-700", children: /* @__PURE__ */ jsx("p", { children: error }) })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700", children: "Nombre de usuario" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: `username_${randomSuffix}`,
            id: "username",
            value: formData.username,
            onChange: handleChange,
            className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
            required: true,
            autoComplete: "off",
            autoCorrect: "off",
            autoCapitalize: "off"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            name: `email_${randomSuffix}`,
            id: "email",
            value: formData.email,
            onChange: handleChange,
            className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
            required: true,
            autoComplete: "off",
            autoCorrect: "off",
            autoCapitalize: "off"
          }
        ) })
      ] }),
      (!isEdit || isAdmin) && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Contraseña" }),
          /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showPassword ? "text" : "password",
                name: `password_${randomSuffix}`,
                id: "password",
                value: formData.password,
                onChange: handleChange,
                className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                required: !isEdit && !isAdmin,
                autoComplete: "new-password",
                autoCorrect: "off",
                autoCapitalize: "off"
              }
            ),
            isAdmin && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5",
                children: showPassword ? /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-500", viewBox: "0 0 20 20", fill: "currentColor", children: [
                  /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z", clipRule: "evenodd" }),
                  /* @__PURE__ */ jsx("path", { d: "M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" })
                ] }) : /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-500", viewBox: "0 0 20 20", fill: "currentColor", children: [
                  /* @__PURE__ */ jsx("path", { d: "M10 12a2 2 0 100-4 2 2 0 000 4z" }),
                  /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z", clipRule: "evenodd" })
                ] })
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700", children: "Confirmar contraseña" }),
          /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showConfirmPassword ? "text" : "password",
                name: `confirmPassword_${randomSuffix}`,
                id: "confirmPassword",
                value: formData.confirmPassword,
                onChange: handleChange,
                className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
                required: !isEdit && !isAdmin,
                autoComplete: "new-password",
                autoCorrect: "off",
                autoCapitalize: "off"
              }
            ),
            isAdmin && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                className: "absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5",
                children: showConfirmPassword ? /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-500", viewBox: "0 0 20 20", fill: "currentColor", children: [
                  /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z", clipRule: "evenodd" }),
                  /* @__PURE__ */ jsx("path", { d: "M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" })
                ] }) : /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-500", viewBox: "0 0 20 20", fill: "currentColor", children: [
                  /* @__PURE__ */ jsx("path", { d: "M10 12a2 2 0 100-4 2 2 0 000 4z" }),
                  /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z", clipRule: "evenodd" })
                ] })
              }
            )
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "role", className: "block text-sm font-medium text-gray-700", children: "Rol" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(
          "select",
          {
            id: "role",
            name: "role",
            value: formData.role,
            onChange: handleChange,
            className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
            children: availableRoles ? (
              // Mapear los roles disponibles a opciones
              availableRoles.map((role) => {
                let label = role;
                if (role === "Ramon") label = "Gerente (Ramon)";
                else if (role === "administrador") label = "Administrador";
                else if (role === "editor") label = "Editor";
                else if (role === "usuario") label = "Usuario";
                return /* @__PURE__ */ jsx("option", { value: role, children: label }, role);
              })
            ) : (
              // Opciones por defecto si no se proporcionaron roles
              loggedUser?.role === "administrador" ? (
                // Si es administrador, mostrar todas las opciones
                /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("option", { value: "administrador", children: "Administrador" }),
                  /* @__PURE__ */ jsx("option", { value: "Ramon", children: "Gerente (Ramon)" }),
                  /* @__PURE__ */ jsx("option", { value: "editor", children: "Editor" }),
                  /* @__PURE__ */ jsx("option", { value: "usuario", children: "Usuario" })
                ] })
              ) : (
                // Si NO es administrador, solo roles básicos
                /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("option", { value: "editor", children: "Editor" }),
                  /* @__PURE__ */ jsx("option", { value: "usuario", children: "Usuario" })
                ] })
              )
            )
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-3 pt-5", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          children: "Cancelar"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          children: loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"
        }
      )
    ] })
  ] });
};

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = "danger"
}) => {
  if (!isOpen) return null;
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-red-600", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          iconBackground: "bg-red-100"
        };
      case "warning":
        return {
          icon: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-yellow-600", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          iconBackground: "bg-yellow-100"
        };
      case "info":
      default:
        return {
          icon: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-blue-600", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          iconBackground: "bg-blue-100"
        };
    }
  };
  const styles = getTypeStyles();
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 transition-opacity", "aria-hidden": "true", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-500 opacity-75" }) }),
    /* @__PURE__ */ jsx("span", { className: "hidden sm:inline-block sm:h-screen sm:align-middle", "aria-hidden": "true", children: "​" }),
    /* @__PURE__ */ jsxs("div", { className: "inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: /* @__PURE__ */ jsxs("div", { className: "sm:flex sm:items-start", children: [
        /* @__PURE__ */ jsx("div", { className: `mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBackground} sm:mx-0 sm:h-10 sm:w-10`, children: styles.icon }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium leading-6 text-gray-900", children: title }),
          /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: message }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${styles.confirmButton}`,
            onClick: onConfirm,
            children: confirmText
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
            onClick: onCancel,
            children: cancelText
          }
        )
      ] })
    ] })
  ] }) });
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;
  const getPageRange = () => {
    const range = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          range.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          range.push(i);
        }
      }
    }
    return range;
  };
  const pageRange = getPageRange();
  return /* @__PURE__ */ jsx("nav", { className: "flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex sm:flex-1 sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-700", children: [
      "Mostrando página ",
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: currentPage }),
      " de",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: totalPages })
    ] }) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("ul", { className: "isolate inline-flex -space-x-px rounded-md shadow-sm", children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPageChange(currentPage - 1),
          disabled: currentPage === 1,
          className: `relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Anterior" }),
            /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z", clipRule: "evenodd" }) })
          ]
        }
      ) }),
      pageRange.map((page) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onPageChange(page),
          className: `relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"}`,
          children: page
        }
      ) }, page)),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPageChange(currentPage + 1),
          disabled: currentPage === totalPages,
          className: `relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? "cursor-not-allowed" : "cursor-pointer"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Siguiente" }),
            /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z", clipRule: "evenodd" }) })
          ]
        }
      ) })
    ] }) })
  ] }) });
};

let isFirstRender$1 = typeof window === "undefined";
const UserTable = ({ onEdit, onRefresh, forceLang }) => {
  const initialLang = isFirstRender$1 ? "es" : forceLang || getCurrentLanguage();
  const [currentLang, setCurrentLang] = useState(initialLang);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  useEffect(() => {
    loadUsers();
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
    if (isFirstRender$1) {
      isFirstRender$1 = false;
      setTimeout(() => {
        setCurrentLang(getCurrentLanguage());
      }, 50);
    }
  }, [currentPage, pageSize, onRefresh]);
  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log("Solicitando usuarios: página", currentPage, "tamaño", pageSize);
      console.log("DEBUG: Usando URL absoluta para evitar errores de proxy");
      let response;
      let usersData = [];
      let totalPagesCount = 1;
      let totalItemsCount = 0;
      try {
        console.log("DEBUG: Usando configuración centralizada para API");
        const token = localStorage.getItem("token");
        const baseUrl = `${API_CONFIG.backendURL || ""}${API_CONFIG.baseURL}`;
        const directUrl = `${baseUrl}/users/?page=${currentPage}&size=${pageSize}`;
        console.log("DEBUG: URL completa construida desde API_CONFIG:", directUrl);
        const directResponse = await fetch(directUrl, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });
        if (directResponse.ok) {
          response = await directResponse.json();
          console.log("DEBUG: Éxito con API centralizada:", response);
        } else {
          throw new Error(`Error en respuesta: ${directResponse.status}`);
        }
      } catch (directError) {
        console.log("DEBUG: Error con fetch usando API_CONFIG, intentando con userServiceProxy como último recurso", directError);
        response = await userServiceProxy.getUsers(currentPage, pageSize);
      }
      console.log("Respuesta del servidor (tipo):", typeof response);
      console.log("Respuesta del servidor (valor):", response);
      if (Array.isArray(response)) {
        console.log("Formato detectado: Array directo de usuarios");
        usersData = [...response];
        totalPagesCount = 1;
        totalItemsCount = response.length;
      } else if (response && typeof response === "object") {
        if (response.items && Array.isArray(response.items)) {
          console.log("Formato detectado: Objeto con items[]");
          usersData = [...response.items];
          totalPagesCount = response.pages || 1;
          totalItemsCount = response.total || response.items.length;
        } else {
          const responseObj = response;
          const possibleItems = responseObj.users || responseObj.data || responseObj.results;
          if (Array.isArray(possibleItems) && possibleItems.length > 0) {
            console.log("Formato alternativo detectado con usuarios");
            usersData = [...possibleItems];
          }
          totalPagesCount = responseObj.pages || responseObj.totalPages || 1;
          totalItemsCount = responseObj.total || responseObj.totalItems || responseObj.count || usersData.length;
        }
      }
      console.log("Usuarios encontrados:", usersData.length);
      setUsers(usersData);
      setTotalPages(totalPagesCount);
      setTotalItems(totalItemsCount);
      setError(null);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(t("users.table.error", currentLang));
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  };
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userServiceProxy.deleteUser(userToDelete.id);
      setShowConfirmDialog(false);
      setUserToDelete(null);
      loadUsers();
      onRefresh();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError(t("users.table.delete_error", currentLang));
      setShowConfirmDialog(false);
    }
  };
  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
  };
  const getRoleBadge = (role) => {
    let bgColor = "";
    switch (role) {
      case "administrador":
        bgColor = "bg-red-100 text-red-800";
        break;
      case "gerente":
        bgColor = "bg-blue-100 text-blue-800";
        break;
      case "editor":
        bgColor = "bg-green-100 text-green-800";
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800";
    }
    return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`, children: role });
  };
  if (loading && users.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-4", children: t("users.table.loading", currentLang) });
  }
  if (error && users.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "bg-red-50 border-l-4 border-red-400 p-4 my-4", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700", children: error }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700", children: [
          t("users.table.showing", currentLang),
          " ",
          users.length,
          " ",
          t("users.table.of", currentLang),
          " ",
          totalItems,
          " ",
          t("users.table.users", currentLang)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "pageSize", className: "mr-2 text-sm text-gray-700", children: t("users.table.show", currentLang) }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "pageSize",
              value: pageSize,
              onChange: handlePageSizeChange,
              className: "rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50",
              children: [
                /* @__PURE__ */ jsx("option", { value: "5", children: "5" }),
                /* @__PURE__ */ jsx("option", { value: "10", children: "10" }),
                /* @__PURE__ */ jsx("option", { value: "25", children: "25" }),
                /* @__PURE__ */ jsx("option", { value: "50", children: "50" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: t("users.table.user", currentLang) }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: t("users.table.email", currentLang) }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: t("users.table.role", currentLang) }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: t("users.table.status", currentLang) }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: t("users.table.actions", currentLang) })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: users.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-4 text-center text-sm text-gray-500", children: t("users.table.no_users", currentLang) }) }) : users.map((user) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: user.username }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: user.full_name })
          ] }) }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900", children: user.email }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getRoleBadge(user.role) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: user.is_active ? t("users.table.active", currentLang) : t("users.table.inactive", currentLang) }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => onEdit(user),
                className: "text-indigo-600 hover:text-indigo-900 focus:outline-none",
                children: t("users.table.edit", currentLang)
              }
            ),
            currentUser?.id !== user.id && user.role !== "Ramon" && (user.role !== "administrador" || currentUser?.role === "administrador") && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDeleteClick(user),
                className: "text-red-600 hover:text-red-900 focus:outline-none",
                children: t("users.table.delete", currentLang)
              }
            )
          ] })
        ] }, user.id)) })
      ] })
    ] }),
    totalPages > 1 && /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-4", children: /* @__PURE__ */ jsx(
      Pagination,
      {
        currentPage,
        totalPages,
        onPageChange: handlePageChange
      }
    ) }),
    /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        isOpen: showConfirmDialog,
        title: t("users.table.confirm_delete_title", currentLang),
        message: t("users.table.confirm_delete_message", currentLang).replace("{username}", userToDelete?.username || ""),
        confirmText: t("users.table.confirm", currentLang),
        cancelText: t("users.table.cancel", currentLang),
        onConfirm: handleConfirmDelete,
        onCancel: handleCancelDelete
      }
    )
  ] });
};

let isFirstRender = typeof window === "undefined";
const UsersManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(void 0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const initialLang = isFirstRender ? "es" : getCurrentLanguage();
  const [currentLang, setCurrentLang] = useState(initialLang);
  const [authStatus, setAuthStatus] = useState("Cargando...");
  const [authDebug, setAuthDebug] = useState({});
  useEffect(() => {
    if (isFirstRender && typeof window !== "undefined") {
      isFirstRender = false;
      setTimeout(() => {
        const newLang = getCurrentLanguage();
        setCurrentLang(newLang);
      }, 100);
    }
  }, []);
  useEffect(() => {
    const isAuth = isAuthenticated();
    setAuthStatus(isAuth ? "Autenticado" : "No autenticado");
    if (!isAuth) {
      setAuthDebug((prev) => ({ ...prev, isAuthenticated: false }));
      return;
    }
    let user = getStoredUser();
    if (isAuth && !user) {
      console.log("Autenticado pero sin datos de usuario, recreando usuario administrador");
      const tokenData = localStorage.getItem("token");
      if (tokenData) {
        user = {
          id: 1,
          username: "admin",
          email: "admin@mascletimperi.com",
          full_name: "Administrador",
          role: "administrador",
          is_active: true,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        localStorage.setItem("user", JSON.stringify(user));
      }
    }
    setAuthDebug((prev) => ({ ...prev, user: user ? JSON.stringify(user) : "null" }));
    if (user) {
      setCurrentUser(user);
      let hasAdminRole = false;
      if (user.username === "admin") {
        hasAdminRole = true;
        if (user.role !== "administrador") {
          console.log("Corrigiendo el rol del usuario admin de:", user.role, "a: administrador");
          user.role = "administrador";
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        hasAdminRole = user.role === "administrador" || user.role === "Ramon" || user.role === "gerente";
      }
      setIsAdmin(hasAdminRole);
      const debugInfo = {
        role: user.role,
        hasAdminRole,
        username: user.username,
        isAdmin: hasAdminRole,
        tokenExists: !!localStorage.getItem("token"),
        tokenFirstChars: localStorage.getItem("token")?.substring(0, 15) + "..." || "no-token"
      };
      console.log("Información de depuración del usuario:", debugInfo);
      setAuthDebug((prev) => ({ ...prev, ...debugInfo }));
    } else {
      setAuthDebug((prev) => ({ ...prev, userFound: false }));
    }
  }, []);
  const handleAddUser = () => {
    setSelectedUser(void 0);
    setShowForm(true);
  };
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };
  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedUser(void 0);
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(void 0);
  };
  const translateText = (key, fallback) => {
    if (currentLang === "ca") {
      const translations = {
        "Gestión de Usuarios": "Gestió d'Usuaris",
        "Añadir Usuario": "Afegir Usuari",
        "Nuevo Usuario": "Nou Usuari",
        "Cargando": "Carregant"
      };
      return translations[key] || fallback;
    }
    return fallback;
  };
  const renderDebugPanel = () => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-300 p-4 mb-4 rounded-lg", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Panel de Diagnóstico" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Estado de Autenticación:" }),
        " ",
        authStatus
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: "¿Es administrador?:" }),
        " ",
        isAdmin ? "Sí" : "No"
      ] }),
      Object.entries(authDebug).map(([key, value]) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("strong", { children: [
          key,
          ":"
        ] }),
        " ",
        typeof value === "object" ? JSON.stringify(value) : String(value)
      ] }, key))
    ] })
  ] });
  if (!isAdmin && currentUser) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      renderDebugPanel(),
      /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-yellow-400", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700", children: "No tienes permisos para gestionar usuarios. Solo los administradores y usuarios con rol Ramon pueden acceder a esta sección." }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg p-6", children: [
    renderDebugPanel(),
    !showForm ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-gray-800", children: translateText("Gestión de Usuarios", "Gestión de Usuarios") }),
        isAdmin && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleAddUser,
            className: "bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow focus:outline-none focus:shadow-outline transition duration-150 ease-in-out",
            children: translateText("Añadir Usuario", "Añadir Usuario")
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        UserTable,
        {
          onEdit: handleEditUser,
          onRefresh: () => setRefreshTrigger((prev) => prev + 1),
          forceLang: currentLang
        },
        refreshTrigger
      )
    ] }) : /* @__PURE__ */ jsx(
      UserForm,
      {
        user: selectedUser,
        onSuccess: handleFormSuccess,
        onCancel: handleFormCancel,
        availableRoles: isAdmin ? ["administrador", "Ramon", "editor", "usuario"] : ["editor", "usuario"]
      }
    )
  ] });
};

const RoleGuard = ({
  allowedRoles,
  children,
  fallback = null,
  redirectToLogin = true
}) => {
  const [isClient, setIsClient] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState("");
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    if (!isClient) return;
    if (!isAuthenticated() && redirectToLogin) {
      console.log("Usuario no autenticado, redirigiendo a login");
      window.location.href = "/login";
      return;
    }
    const role = getCurrentRole();
    console.log("Rol actual:", role);
    console.log("Roles permitidos:", allowedRoles);
    setCurrentRole(role);
    const hasAccess = allowedRoles.includes(role);
    console.log("¿Tiene acceso?", hasAccess);
    setCanAccess(hasAccess);
    setLoading(false);
    if (!hasAccess && redirectToLogin) {
      console.log(`Acceso denegado: se requiere uno de estos roles [${allowedRoles.join(", ")}]`);
    }
  }, [isClient, allowedRoles, redirectToLogin]);
  if (loading || !isClient) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-4", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  return canAccess ? /* @__PURE__ */ jsx(Fragment, { children }) : /* @__PURE__ */ jsx(Fragment, { children: fallback || /* @__PURE__ */ jsx("div", { className: "bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded shadow-md", role: "alert", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
    /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-bold", children: "Acceso denegado" }),
      /* @__PURE__ */ jsx("p", { children: "No tienes los permisos necesarios para acceder a esta página." }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm", children: [
        "Se requiere uno de estos roles: ",
        allowedRoles.join(", ")
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm", children: [
        "Tu rol actual: ",
        currentRole
      ] })
    ] })
  ] }) }) });
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const lang = getCurrentLanguage();
  const allowedRoles = ["administrador", "Ramon"];
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": t("common.users", lang) }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(["  <script>\n    (function() {\n      try {\n        const token = localStorage.getItem('token');\n        if (token) {\n          const payload = JSON.parse(atob(token.split('.')[1]));\n          const userRole = payload.role || 'guest';\n          if (userRole.toLowerCase() !== 'administrador' && userRole.toLowerCase() !== 'ramon') {\n            console.log('ACCESO DENEGADO: Redirigiendo...');\n            window.location.href = '/';\n          }\n        } else {\n          window.location.href = '/login';\n        }\n      } catch (e) {\n        console.error('Error:', e);\n        window.location.href = '/';\n      }\n    })();\n  <\/script> ", " "])), renderComponent($$result2, "RoleGuard", RoleGuard, { "client:load": true, "allowedRoles": allowedRoles, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/guards/RoleGuard", "client:component-export": "RoleGuard" }, { "default": ($$result3) => renderTemplate` ${maybeRenderHead()}<div class="mb-6"> <h1 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1> <p class="text-gray-600">Administra los usuarios del sistema y sus permisos</p> </div> ${renderComponent($$result3, "UsersManagement", UsersManagement, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/users/UsersManagement", "client:component-export": "UsersManagement" })} ` })) })}`;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/users/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/users/index.astro";
const $$url = "/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
