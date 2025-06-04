import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_OWM_DaNv.mjs';
export { e as renderers } from '../chunks/vendor_OWM_DaNv.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_DsgB9yc8.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { a as animalService } from '../chunks/animalService_BoQeY3Jz.mjs';
import { a as getCurrentLanguage } from '../chunks/Footer_BuyfVHI3.mjs';
/* empty css                                 */

const translations = {
  es: {
    "animals.table.type": "Tipo",
    "animals.table.name": "Nombre",
    "animals.table.code": "Código",
    "animals.table.exploitation": "Explotación",
    "animals.table.status": "Estado",
    "animals.table.actions": "Acciones",
    "animals.table.view": "Ver",
    "animals.table.update": "Actualizar",
    "animals.table.active": "Activo",
    "animals.table.inactive": "Baja",
    "animals.male": "Macho",
    "animals.female": "Hembra"
  },
  ca: {
    "animals.table.type": "Tipus",
    "animals.table.name": "Nom",
    "animals.table.code": "Codi",
    "animals.table.exploitation": "Explotació",
    "animals.table.status": "Estat",
    "animals.table.actions": "Accions",
    "animals.table.view": "Veure",
    "animals.table.update": "Actualitzar",
    "animals.table.active": "Actiu",
    "animals.table.inactive": "Baixa",
    "animals.male": "Mascle",
    "animals.female": "Femella"
  }
};
function t(key, lang) {
  if (lang !== "es" && lang !== "ca") {
    lang = "es";
  }
  try {
    const translationsForLang = translations[lang];
    if (key in translationsForLang) {
      return translationsForLang[key];
    } else {
      console.warn(`[Translation] Clave no encontrada: ${key} para idioma: ${lang}`);
      return key;
    }
  } catch (error) {
    console.error(`[Translation] Error al traducir ${key}:`, error);
    return key;
  }
}
const AnimalTable = ({ initialFilters = {}, id, canEdit = false, canCreate = false }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [useMockData, setUseMockData] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);
  const tableRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const [currentLang, setCurrentLang] = useState("es");
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    const userLang = localStorage.getItem("userLanguage") || "es";
    console.log("[AnimalTable] Idioma detectado:", userLang);
    setCurrentLang(userLang);
  }, []);
  const loadAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      loadTimeoutRef.current = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError("Tiempo de espera agotado. Por favor, intenta de nuevo.");
        }
      }, 1e4);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const isRenderEnvironment = window.location.hostname.includes("render.com");
      let response;
      try {
        console.log(`Cargando animales - Página: ${currentPage}, Límite: 15`);
        response = await animalService.getAnimals({
          ...filters,
          page: currentPage,
          // Usar la página actual seleccionada
          limit: 15
          // Mostrar 15 animales por página para mejor experiencia de usuario
        });
      } catch (error2) {
        console.error("Error al obtener animales desde API:", error2);
        if (isRenderEnvironment) {
          console.warn("Detectado entorno Render: usando respuesta alternativa");
          response = { items: [], total: 0, page: 1, limit: 10, pages: 1 };
        } else {
          throw error2;
        }
      }
      if (isRenderEnvironment || !response.items || !Array.isArray(response.items)) {
        console.log("Aplicando corrección defensiva a la respuesta");
        if (!response || typeof response !== "object") {
          response = { items: [], total: 0, page: 1, limit: 10, pages: 1 };
        }
        if (!response.items) {
          response.items = [];
        } else if (!Array.isArray(response.items)) {
          console.warn("response.items no es un array, intentando reparar");
          if (typeof response.items === "object") {
            const tempItems = [];
            try {
              Object.values(response.items).forEach((item) => {
                if (item && typeof item === "object") {
                  tempItems.push(item);
                }
              });
              response.items = tempItems.length > 0 ? tempItems : [];
            } catch (e) {
              console.error("Error al intentar reparar items:", e);
              response.items = [];
            }
          } else {
            response.items = [];
          }
        }
      }
      let orderedAnimals = [...response.items];
      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.trim().toLowerCase();
        orderedAnimals.sort((a, b) => {
          const aExactMatch = a.nom?.toLowerCase() === searchTerm;
          const bExactMatch = b.nom?.toLowerCase() === searchTerm;
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          const aStartsWith = a.nom?.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.nom?.toLowerCase().startsWith(searchTerm);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          const aContains = a.nom?.toLowerCase().includes(searchTerm);
          const bContains = b.nom?.toLowerCase().includes(searchTerm);
          if (aContains && !bContains) return -1;
          if (!aContains && bContains) return 1;
          return 0;
        });
        console.log("Animales ordenados localmente:", orderedAnimals.map((a) => a.nom || "Sin nombre"));
      }
      setAnimals(orderedAnimals);
      setTotalAnimals(response.total || 0);
      setTotalPages(response.pages || 1);
      document.dispatchEvent(new CustomEvent("animals-loaded", {
        detail: {
          total: response.total || 0,
          filtered: response.items?.length || 0,
          page: response.page || 1,
          pages: response.pages || 1
        }
      }));
    } catch (err) {
      console.error("Error cargando animales:", err);
      if (err.code === "DB_COLUMN_ERROR" || err.message && err.message.includes("estado_t")) {
        setError('La columna "estado_t" no existe en la tabla de animales. Este es un problema conocido del backend que está siendo solucionado. Mientras tanto, se mostrarán datos simulados si están disponibles.');
        setUseMockData(true);
      } else {
        setError(err.message || "Error al cargar los animales");
      }
      setAnimals([]);
      setTotalAnimals(0);
      setTotalPages(0);
    } finally {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAnimals();
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    loadAnimals();
  }, [filters, currentPage]);
  useEffect(() => {
    const handleApplyFilters = (event) => {
      setFilters(event.detail);
      setCurrentPage(1);
      if (!event.detail.search) {
        setSearchInfo(null);
      }
    };
    const handleRefreshAnimals = () => {
      loadAnimals();
      setSearchInfo(null);
    };
    const handleSearchCompleted = (event) => {
      setSearchInfo(event.detail);
      setUseMockData(event.detail.usedMock);
      if (event.detail.usedMock) {
        setError(`Nota: Mostrando resultados simulados debido a un ${event.detail.reason}. Se encontraron ${event.detail.count} coincidencias para "${event.detail.term}".`);
      } else {
        setError(null);
      }
    };
    document.addEventListener("refresh-animals", handleRefreshAnimals);
    document.addEventListener("reload-animals", handleRefreshAnimals);
    document.addEventListener("search-completed", handleSearchCompleted);
    const rootElement = document.getElementById(id || "");
    if (rootElement) {
      rootElement.addEventListener("apply-filters", handleApplyFilters);
    } else {
      document.addEventListener("filters-applied", handleApplyFilters);
    }
    return () => {
      document.removeEventListener("refresh-animals", handleRefreshAnimals);
      document.removeEventListener("reload-animals", handleRefreshAnimals);
      document.removeEventListener("search-completed", handleSearchCompleted);
      if (rootElement) {
        rootElement.removeEventListener("apply-filters", handleApplyFilters);
      } else {
        document.removeEventListener("filters-applied", handleApplyFilters);
      }
    };
  }, [id]);
  useEffect(() => {
    const totalAnimalsContainer = document.getElementById("totalAnimalsContainer");
    if (totalAnimalsContainer) {
      if (loading) {
        totalAnimalsContainer.innerHTML = `
          <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
            Cargando...
          </span>
        `;
      } else {
        if (searchInfo && searchInfo.term) {
          const mockBadge = searchInfo.usedMock ? '<span class="ml-1 px-1 py-0.5 text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 rounded">DATOS SIMULADOS</span>' : "";
          totalAnimalsContainer.innerHTML = `
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Total: ${totalAnimals} animales | Búsqueda: "${searchInfo.term}" (${searchInfo.count} coincidencias) ${mockBadge}
            </span>
          `;
        } else {
          const mockBadge = useMockData ? '<span class="ml-1 px-1 py-0.5 text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 rounded">DATOS SIMULADOS</span>' : "";
          totalAnimalsContainer.innerHTML = `
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Total: ${totalAnimals} animales ${mockBadge}
            </span>
          `;
        }
      }
    }
  }, [totalAnimals, loading, searchInfo, useMockData]);
  const handlePageChange = (page) => {
    console.log(`Cambiando a página ${page}`);
    if (page === currentPage) return;
    setCurrentPage(page);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center mt-6 space-x-1", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handlePageChange(1),
          disabled: currentPage === 1,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === 1 ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Primera" }),
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 19l-7-7 7-7m8 14l-7-7 7-7" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handlePageChange(currentPage - 1),
          disabled: currentPage === 1,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === 1 ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Anterior" }),
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
          ]
        }
      ),
      [...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        if (pageNumber === 1 || pageNumber === totalPages || pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) {
          return /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(pageNumber),
              className: `inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md 
                          ${pageNumber === currentPage ? "bg-primary/10 dark:bg-primary/30 text-primary border-primary/20 dark:border-primary/40" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
              children: pageNumber
            },
            pageNumber
          );
        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
          return /* @__PURE__ */ jsx("span", { className: "px-1 text-gray-500 dark:text-gray-400", children: "..." }, `ellipsis-${pageNumber}`);
        }
        return null;
      }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handlePageChange(currentPage + 1),
          disabled: currentPage === totalPages,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === totalPages ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Siguiente" }),
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handlePageChange(totalPages),
          disabled: currentPage === totalPages,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === totalPages ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Última" }),
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 5l7 7-7 7M5 5l7 7-7 7" }) })
          ]
        }
      )
    ] });
  };
  const getAnimalIcon = (animal) => {
    const iconClass = "text-2xl";
    if (animal.genere === "M") {
      return /* @__PURE__ */ jsx("span", { className: iconClass, children: "🐂" });
    } else {
      if (animal.alletar !== "0") {
        return /* @__PURE__ */ jsx("span", { className: iconClass, children: "🐄" });
      } else {
        return /* @__PURE__ */ jsx("span", { className: iconClass, children: "🐮" });
      }
    }
  };
  const renderStatusBadge = (animal) => {
    const statusClass = animal.estado === "OK" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`, children: animal.estado === "OK" ? t("animals.table.active", currentLang) : t("animals.table.inactive", currentLang) });
  };
  return /* @__PURE__ */ jsxs("div", { ref: tableRef, className: "w-full overflow-x-auto", children: [
    useMockData && /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-yellow-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 dark:text-yellow-200", children: "Mostrando datos simulados. No se pudo conectar con el servidor. Los animales mostrados son de ejemplo y no reflejan datos reales." }) })
    ] }) }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-red-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700 dark:text-red-200", children: error }) })
    ] }) }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center p-12", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" }),
      /* @__PURE__ */ jsx("span", { className: "ml-3 text-gray-600 dark:text-gray-400", children: "Cargando animales..." })
    ] }) : animals.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-300 text-lg", children: "No se encontraron animales" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-2", children: "Intenta con otros filtros o importa datos de prueba" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: loadAnimals,
          className: "mt-4 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md transition-colors",
          children: "Reintentar"
        }
      )
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-600", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-100 dark:bg-gray-800", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Tipus" : "Tipo" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Nom" : "Nombre" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Codi" : "Código" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Explotació" : "Explotación" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Estat" : "Estado" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Accions" : "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600", children: animals.map((animal) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-center", children: /* @__PURE__ */ jsx("a", { href: `/animals/${animal.id}`, className: "cursor-pointer hover:scale-110 transition-transform inline-block", title: animal.alletar === "0" ? "No amamantando" : animal.alletar === "1" ? "Amamantando 1 ternero" : "Amamantando 2 terneros", children: getAnimalIcon(animal) }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-200", children: animal.nom }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: animal.genere === "M" ? t("animals.male", currentLang) : t("animals.female", currentLang) })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-200", children: animal.cod || "-" }),
            animal.num_serie && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Serie: ",
              animal.num_serie
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: animal.explotacio }) }) }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: renderStatusBadge(animal) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: `/animals/${animal.id}`,
                className: "inline-flex items-center px-2 py-1 bg-primary text-white rounded hover:bg-primary/80",
                children: [
                  /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" }),
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                  ] }),
                  t("animals.table.view", currentLang)
                ]
              }
            ),
            canEdit && animal.estado === "OK" && /* @__PURE__ */ jsxs(
              "a",
              {
                href: `/animals/update/${animal.id}`,
                className: "inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700",
                children: [
                  /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }),
                  t("animals.table.update", currentLang)
                ]
              }
            )
          ] }) })
        ] }, animal.id)) })
      ] }) }),
      renderPagination()
    ] })
  ] });
};

let labelText = "Buscar";
let placeholderText = "Buscar por nombre, explotación, código...";
let clearButtonText = "Limpiar";
let searchButtonText = "BUSCAR";
function updateTexts(lang) {
  if (lang === "ca") {
    labelText = "Cercar";
    placeholderText = "Cercar per nom, explotació, codi...";
    clearButtonText = "Netejar";
    searchButtonText = "CERCAR";
  } else {
    labelText = "Buscar";
    placeholderText = "Buscar por nombre, explotación, código...";
    clearButtonText = "Limpiar";
    searchButtonText = "BUSCAR";
  }
}
const AnimalFilters = ({
  onApplyFilters,
  initialFilters = {},
  id
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    const userLang = localStorage.getItem("userLanguage") || "es";
    updateTexts(userLang);
    const checkLanguage = () => {
      const currentLang = localStorage.getItem("userLanguage") || "es";
      updateTexts(currentLang);
      setIsClient((prevState) => !prevState);
    };
    window.addEventListener("storage", checkLanguage);
    return () => window.removeEventListener("storage", checkLanguage);
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? void 0 : value
    }));
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };
  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    document.dispatchEvent(new CustomEvent("filters-applied", {
      detail: filters
    }));
  };
  const handleClearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    if (onApplyFilters) {
      onApplyFilters(emptyFilters);
    }
    document.dispatchEvent(new CustomEvent("filters-applied", {
      detail: emptyFilters
    }));
    document.dispatchEvent(new CustomEvent("reload-animals"));
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4", id, children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: labelText }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "search",
            value: filters.search || "",
            onChange: handleInputChange,
            onKeyDown: handleKeyDown,
            placeholder: placeholderText,
            className: "w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "🔍" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleClearFilters,
          className: "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          children: clearButtonText
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleApplyFilters,
          className: "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          children: searchButtonText
        }
      )
    ] })
  ] });
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const currentLang = getCurrentLanguage();
  let pageTitle = "Gesti\xF3n de Animales";
  let newAnimalText = "Nuevo Animal";
  let refreshText = "Actualizar";
  let searchTitleText = "B\xFAsqueda y Filtros";
  let searchDescriptionText = "Utiliza los filtros para encontrar animales espec\xEDficos. Puedes filtrar por explotaci\xF3n, g\xE9nero, estado y m\xE1s.";
  let listTitleText = "Listado de Animales";
  let loadingText = "Cargando animales...";
  if (currentLang === "ca") {
    pageTitle = "Gesti\xF3 d'Animals";
    newAnimalText = "Nou Animal";
    refreshText = "Actualitzar";
    searchTitleText = "Cerca i Filtres";
    searchDescriptionText = "Utilitza els filtres per trobar animals espec\xEDfics. Pots filtrar per explotaci\xF3, g\xE8nere, estat i m\xE9s.";
    listTitleText = "Llistat d'Animals";
    loadingText = "Carregant animals...";
  }
  const canEditAnimals = true;
  const canCreateAnimals = true;
  const title = pageTitle;
  const userRole = "pending";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "userRole": userRole, "currentPath": "/animals", "data-astro-cid-hocqylxv": true }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="w-full max-w-full px-2 sm:px-4 py-4 sm:py-6" data-astro-cid-hocqylxv> <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3" data-astro-cid-hocqylxv> <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white" data-astro-cid-hocqylxv> ', ` </h1> <div class="flex flex-wrap gap-2" data-astro-cid-hocqylxv> <script>
          // Comprobar rol de usuario directamente aqu\xED
          (function() {
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const role = payload.role.toLowerCase();
                
                // Variable global para que otros scripts sepan que ya est\xE1 bloqueado
                window.newAnimalButtonBlocked = (role === 'editor' || role === 'usuario');
                
                document.addEventListener('DOMContentLoaded', function() {
                  // Si se ejecuta muy r\xE1pido, esperar un tick para asegurar que el DOM est\xE9 listo
                  setTimeout(() => {
                    if (window.newAnimalButtonBlocked) {
                      console.log('BLOQUEANDO BOT\xD3N NUEVO ANIMAL INMEDIATAMENTE PARA ROL:', role);
                      const btn = document.getElementById('new-animal-btn');
                      if (btn) {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                        btn.style.cursor = 'not-allowed';
                        btn.style.pointerEvents = 'none';
                        btn.title = 'NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES';
                        
                        // A\xF1adir icono de candado
                        if (!btn.querySelector('.lock-icon')) {
                          const lockIcon = document.createElement('span');
                          lockIcon.textContent = ' \u{1F512}';
                          lockIcon.className = 'ml-1 lock-icon';
                          btn.appendChild(lockIcon);
                        }
                        
                        // Prevenir navegaci\xF3n
                        btn.onclick = function(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          alert('NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES');
                          return false;
                        };
                      }
                    }
                  }, 0);
                });
              }
            } catch (e) {
              console.error('Error al verificar permisos para bot\xF3n Nuevo Animal:', e);
            }
          })();
        <\/script>  <button class="btn btn-primary flex items-center" id="new-animal-btn" onclick="window.location.href='/animals/new';" data-astro-cid-hocqylxv> <span class="mr-1" data-astro-cid-hocqylxv>+</span> `, ' </button> <!-- Ya no usamos scripts en l\xEDnea aqu\xED - todo se maneja desde block-delete-button.js --> <button id="refreshBtn" class="btn btn-secondary flex items-center" data-astro-cid-hocqylxv> <span class="mr-1" data-astro-cid-hocqylxv>\u21BB</span> ', ' </button> </div> </div> <!-- Card de b\xFAsqueda y filtros --> <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6" data-astro-cid-hocqylxv> <div class="mb-3 sm:mb-4" data-astro-cid-hocqylxv> <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3" data-astro-cid-hocqylxv> ', ' </h2> <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4" data-astro-cid-hocqylxv> ', " </p> </div> <!-- Componente de filtros --> ", ' </div> <!-- Tabla de animales --> <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4" data-astro-cid-hocqylxv> <div class="mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center" data-astro-cid-hocqylxv> <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-0" data-astro-cid-hocqylxv> ', ' </h2> <div id="totalAnimalsContainer" class="text-xs sm:text-sm text-gray-500 dark:text-gray-400" data-astro-cid-hocqylxv> ', ' </div> </div> <div class="overflow-x-auto" data-astro-cid-hocqylxv> ', " </div> </div> </div>  <script>\n    // Esta funci\xF3n se ejecuta INMEDIATAMENTE al cargar el script\n    (function() {\n      console.log('INTERCEPTOR GLOBAL INICIADO');\n      \n      // Obtener el rol del usuario (una sola vez al inicio)\n      let userRoleGlobal = 'pending';\n      \n      try {\n        const token = localStorage.getItem('token');\n        if (token) {\n          const payload = JSON.parse(atob(token.split('.')[1]));\n          userRoleGlobal = (payload.role || 'guest').toLowerCase();\n          console.log('ROL GLOBAL DETECTADO:', userRoleGlobal);\n        }\n      } catch (e) {\n        console.error('Error obteniendo rol global:', e);\n      }\n      \n      // Interceptar TODOS los clics en el documento\n      document.addEventListener('click', function(event) {\n        // Solo procesar para roles restringidos\n        if (userRoleGlobal !== 'editor' && userRoleGlobal !== 'usuario') {\n          return; // Permitir clics para administradores y Ramon\n        }\n        \n        // Verificar si el clic es en un enlace a /animals/new\n        let target = event.target;\n        \n        // Si el clic es en un span dentro del enlace, buscar el enlace padre\n        while (target && target.tagName !== 'A') {\n          target = target.parentElement;\n        }\n        \n        // Si encontramos un enlace y va a /animals/new, bloquearlo\n        if (target && target.tagName === 'A' && \n            (target.getAttribute('href') === '/animals/new' || \n             target.textContent.includes('Nuevo Animal') || \n             target.textContent.includes('Nou Animal'))) {\n          \n          console.log('\xA1INTERCEPTADO CLIC EN BOT\xD3N NUEVO ANIMAL!');\n          event.preventDefault();\n          event.stopPropagation();\n          \n          // Mostrar alerta\n          alert('NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES');\n          \n          // Tambi\xE9n intentar bloquear visualmente el bot\xF3n\n          try {\n            target.href = 'javascript:void(0);';\n            target.style.opacity = '0.5';\n            target.style.cursor = 'not-allowed';\n            target.style.pointerEvents = 'none';\n            \n            // A\xF1adir candado si no existe\n            if (!target.querySelector('.lock-icon')) {\n              const lockIcon = document.createElement('span');\n              lockIcon.textContent = ' \u{1F512}';\n              lockIcon.className = 'ml-1 lock-icon';\n              target.appendChild(lockIcon);\n            }\n          } catch (e) {\n            console.error('Error modificando bot\xF3n:', e);\n          }\n          \n          return false;\n        }\n      }, true); // Usar fase de captura para interceptar antes de otros handlers\n      \n      console.log('INTERCEPTOR GLOBAL ACTIVADO EXITOSAMENTE');\n    })();\n  <\/script> "])), maybeRenderHead(), title, newAnimalText, refreshText, searchTitleText, searchDescriptionText, renderComponent($$result2, "AnimalFilters", AnimalFilters, { "id": "animal-filters", "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters", "client:component-export": "default", "data-astro-cid-hocqylxv": true }), listTitleText, loadingText, renderComponent($$result2, "AnimalTable", AnimalTable, { "client:load": true, "canEdit": canEditAnimals, "canCreate": canCreateAnimals, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable", "client:component-export": "default", "data-astro-cid-hocqylxv": true })) })}  `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/animals/index.astro";
const $$url = "/animals";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
