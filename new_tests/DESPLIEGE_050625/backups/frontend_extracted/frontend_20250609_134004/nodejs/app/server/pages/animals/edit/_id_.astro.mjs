import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../../../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../../../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';
import { $ as $$DefaultLayout } from '../../../chunks/DefaultLayout_D-Zc-z_q.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as animalService } from '../../../chunks/animalService_BQTI0m5D.mjs';
import { a as api } from '../../../chunks/api_CScnKk7n.mjs';
import { i as isAuthenticated, g as getUserRole } from '../../../chunks/Footer_CznfbLiE.mjs';

const AnimalForm = ({
  animalData,
  explotaciones = [],
  isEditMode = false,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    explotacio: "",
    nom: "",
    genere: "M",
    estado: "OK",
    alletar: "0"
  });
  const [potentialFathers, setPotentialFathers] = useState([]);
  const [potentialMothers, setPotentialMothers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        if (isEditMode && animalData) {
          console.log(`Cargando datos para animal ID: ${animalData.id}`);
          setFormData({
            explotacio: animalData.explotacio,
            nom: animalData.nom,
            genere: animalData.genere,
            estado: animalData.estado,
            alletar: animalData.alletar,
            pare: animalData.pare,
            mare: animalData.mare,
            quadra: animalData.quadra,
            cod: animalData.cod,
            num_serie: animalData.num_serie,
            dob: animalData.dob
          });
          try {
            const fathers = await animalService.getPotentialFathers(animalData?.explotacio);
            const mothers = await animalService.getPotentialMothers(animalData?.explotacio);
            setPotentialFathers(fathers);
            setPotentialMothers(mothers);
          } catch (parentError) {
            console.error("Error cargando padres/madres potenciales:", parentError);
            setError("No se pudieron cargar los padres/madres potenciales. Se mostrarán datos simulados.");
          }
        } else if (explotaciones.length > 0) {
          setFormData((prev) => ({
            ...prev,
            explotacio_id: explotaciones[0].id
          }));
          if (explotaciones[0].id) {
            try {
              const [fathers, mothers] = await Promise.all([
                animalService.getPotentialFathers(explotaciones[0].id),
                animalService.getPotentialMothers(explotaciones[0].id)
              ]);
              setPotentialFathers(fathers);
              setPotentialMothers(mothers);
            } catch (parentError) {
              console.error("Error cargando padres/madres potenciales:", parentError);
              setError("No se pudieron cargar los padres/madres potenciales. Se mostrarán datos simulados.");
            }
          }
        }
      } catch (err) {
        setError(err.message || "Error al cargar los datos");
        console.error("Error cargando datos iniciales:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [isEditMode, animalData, explotaciones]);
  const handleExplotacionChange = async (explotacioId) => {
    try {
      setLoading(true);
      setFormData((prev) => ({
        ...prev,
        explotacio_id: explotacioId,
        pare_id: void 0,
        mare_id: void 0
      }));
      const [fathers, mothers] = await Promise.all([
        animalService.getPotentialFathers(explotacioId),
        animalService.getPotentialMothers(explotacioId)
      ]);
      setPotentialFathers(fathers);
      setPotentialMothers(mothers);
    } catch (err) {
      setError(err.message || "Error al cargar padres y madres");
      console.error("Error cargando padres y madres:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = e.target.checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    if (name === "explotacio_id" || name === "pare_id" || name === "mare_id") {
      const numValue = value === "" ? void 0 : parseInt(value, 10);
      if (name === "explotacio_id" && numValue) {
        handleExplotacionChange(numValue);
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: numValue
        }));
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      console.log("Enviando datos del formulario:", formData);
      if (isEditMode && animalData) {
        console.log(`Actualizando animal con ID: ${animalData.id}`);
        await animalService.updateAnimal(animalData.id, formData);
        console.log("Animal actualizado correctamente");
      } else {
        console.log("Creando nuevo animal");
        await animalService.createAnimal(formData);
        console.log("Animal creado correctamente");
      }
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al guardar el animal");
      console.error("Error guardando animal:", err);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-600 dark:text-dark-text-secondary", children: "Cargando..." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-dark-card rounded-lg shadow p-6 border border-gray-100 dark:border-dark-border", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-dark-text mb-4", children: isEditMode ? "Editar Animal" : "Nuevo Animal" }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Explotación *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "explotacio",
              name: "explotacio",
              className: "form-select",
              value: formData.explotacio,
              onChange: handleInputChange,
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar explotación" }),
                explotaciones.map((explotacion) => /* @__PURE__ */ jsx("option", { value: explotacion.explotacio, children: explotacion.explotacio }, explotacion.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Nombre *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "nom",
              value: formData.nom,
              onChange: handleInputChange,
              required: true,
              className: "w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Género *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "genere",
              value: formData.genere,
              onChange: handleInputChange,
              required: true,
              className: "w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "M", children: "Macho" }),
                /* @__PURE__ */ jsx("option", { value: "F", children: "Hembra" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Estado *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "estado",
              name: "estado",
              className: "form-select",
              value: formData.estado,
              onChange: handleInputChange,
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: "OK", children: "Activo" }),
                /* @__PURE__ */ jsx("option", { value: "DEF", children: "Baja" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Código" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "cod",
              value: formData.cod || "",
              onChange: handleInputChange,
              className: "w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Número de serie" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "num_serie",
              value: formData.num_serie || "",
              onChange: handleInputChange,
              className: "w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Fecha de nacimiento" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              name: "dob",
              value: formData.dob || "",
              onChange: handleInputChange,
              className: "w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Cuadra" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "quadra",
              value: formData.quadra || "",
              onChange: handleInputChange,
              className: "w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-dark-text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Padre" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "pare",
              name: "pare",
              className: "form-select",
              value: formData.pare || "",
              onChange: handleInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Sin padre" }),
                potentialFathers.map((father) => /* @__PURE__ */ jsx("option", { value: father.nom, children: father.nom }, father.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Madre" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "mare",
              name: "mare",
              className: "form-select",
              value: formData.mare || "",
              onChange: handleInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Sin madre" }),
                potentialMothers.map((mother) => /* @__PURE__ */ jsx("option", { value: mother.nom, children: mother.nom }, mother.id))
              ]
            }
          )
        ] })
      ] }),
      formData.genere === "F" && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1", children: "Amamantando" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "alletar",
            name: "alletar",
            className: "form-select",
            value: formData.alletar,
            onChange: handleInputChange,
            disabled: formData.genere !== "F",
            children: [
              /* @__PURE__ */ jsx("option", { value: "0", children: "No" }),
              /* @__PURE__ */ jsx("option", { value: "1", children: "1 ternero" }),
              /* @__PURE__ */ jsx("option", { value: "2", children: "2 terneros" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onCancel,
            disabled: submitting,
            className: "px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: submitting,
            className: "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
            children: submitting ? "Guardando..." : isEditMode ? "Actualizar" : "Crear"
          }
        )
      ] })
    ] })
  ] });
};

const getAllExplotaciones = async () => {
  const response = await api.get("/explotacions?limit=1000");
  return response.data.items;
};

var Role = /* @__PURE__ */ ((Role2) => {
  Role2["ADMINISTRADOR"] = "ADMINISTRADOR";
  Role2["GERENTE"] = "GERENTE";
  Role2["EDITOR"] = "EDITOR";
  Role2["USUARIO"] = "USUARIO";
  return Role2;
})(Role || {});
const rolePermissions = {
  ["ADMINISTRADOR" /* ADMINISTRADOR */]: [
    "animals.view",
    "animals.edit",
    "animals.create",
    "explotacions.view",
    "explotacions.edit",
    "explotacions.create",
    "users.view",
    "users.edit",
    "users.create",
    "imports.view",
    "imports.create",
    "backups.view",
    "backups.create",
    "dashboard.view"
  ],
  ["GERENTE" /* GERENTE */]: [
    "animals.view",
    "animals.edit",
    "animals.create",
    "explotacions.view",
    "users.view",
    "users.edit",
    "users.create",
    "dashboard.view"
  ],
  ["EDITOR" /* EDITOR */]: [
    "animals.view",
    "animals.edit",
    "explotacions.view",
    "dashboard.view"
  ],
  ["USUARIO" /* USUARIO */]: [
    "animals.view",
    "explotacions.view",
    "dashboard.view"
  ]
};
const hasAccessToRoute = (route, role) => {
  if (!role) return false;
  const normalizedRole = role.toUpperCase();
  if (!Object.values(Role).includes(normalizedRole)) {
    console.warn(`Rol '${role}' no reconocido`);
    return false;
  }
  const permissions = rolePermissions[normalizedRole];
  if (!permissions) return false;
  return permissions.includes(route);
};

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const isLoggedIn = isAuthenticated();
  const userRole = getUserRole();
  const hasEditPermission = hasAccessToRoute("animals.edit", userRole);
  if (!isLoggedIn || !hasEditPermission) {
    return Astro2.redirect("/login");
  }
  const { id } = Astro2.params;
  let animal = null;
  let explotaciones = [];
  let error = null;
  try {
    if (id) {
      animal = await animalService.getAnimalById(parseInt(id));
      explotaciones = await getAllExplotaciones();
    }
  } catch (err) {
    console.error("Error al obtener datos del animal:", err);
    error = "No se pudo cargar la informaci\xF3n del animal";
  }
  const title = animal ? `Editar Animal: ${animal.nom}` : "Editar Animal";
  return renderTemplate`${renderComponent($$result, "DefaultLayout", $$DefaultLayout, { "title": title, "userRole": userRole }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="flex items-center mb-6"> <a${addAttribute(`/animals/${id}`, "href")} class="btn btn-outline-secondary mr-4 flex items-center"> <span class="mr-1">←</span> Volver a detalles
</a> <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text"> ${title} </h1> </div>  ${error && renderTemplate`<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"> <p>${error}</p> <p>Vuelve al <a href="/animals" class="underline">listado de animales</a></p> </div>`} ${animal && renderTemplate`<div class="bg-white dark:bg-dark-card rounded-lg shadow p-6"> ${renderComponent($$result2, "AnimalForm", AnimalForm, { "client:load": true, "animalData": animal, "explotaciones": explotaciones, "isEditMode": true, "onSuccess": () => {
    window.location.href = `/animals/${id}`;
  }, "onCancel": () => {
    window.location.href = `/animals/${id}`;
  }, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalForm", "client:component-export": "default" })} </div>`}` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/edit/[id].astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/edit/[id].astro";
const $$url = "/animals/edit/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
