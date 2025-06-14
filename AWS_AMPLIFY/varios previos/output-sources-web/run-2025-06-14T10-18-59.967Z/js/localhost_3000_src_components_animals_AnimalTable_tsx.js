import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"]; const useRef = __vite__cjsImport1_react["useRef"];
import animalService from "/src/services/animalService.ts";
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
  const formatText = (text, ...args) => {
    return text.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== "undefined" ? args[number].toString() : match;
    });
  };
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
  const handleAnimalDeactivation = async (animalId) => {
    try {
      await animalService.deleteAnimal(animalId);
      loadAnimals();
    } catch (err) {
      console.error("Error al dar de baja al animal:", err);
      alert("No se pudo dar de baja al animal. Por favor, inténtalo de nuevo.");
    }
  };
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-center mt-6 space-x-1", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => handlePageChange(1),
          disabled: currentPage === 1,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === 1 ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "Primera" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 408,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 19l-7-7 7-7m8 14l-7-7 7-7" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 410,
              columnNumber: 13
            }, this) }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 409,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 400,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => handlePageChange(currentPage - 1),
          disabled: currentPage === 1,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === 1 ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "Anterior" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 423,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 425,
              columnNumber: 13
            }, this) }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 424,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 415,
          columnNumber: 9
        },
        this
      ),
      [...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        if (pageNumber === 1 || pageNumber === totalPages || pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) {
          return /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => handlePageChange(pageNumber),
              className: `inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md 
                          ${pageNumber === currentPage ? "bg-primary/10 dark:bg-primary/30 text-primary border-primary/20 dark:border-primary/40" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
              children: pageNumber
            },
            pageNumber,
            false,
            {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 439,
              columnNumber: 15
            },
            this
          );
        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
          return /* @__PURE__ */ jsxDEV("span", { className: "px-1 text-gray-500 dark:text-gray-400", children: "..." }, `ellipsis-${pageNumber}`, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 454,
            columnNumber: 20
          }, this);
        }
        return null;
      }),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => handlePageChange(currentPage + 1),
          disabled: currentPage === totalPages,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === totalPages ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "Siguiente" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 468,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 470,
              columnNumber: 13
            }, this) }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 469,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 460,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => handlePageChange(totalPages),
          disabled: currentPage === totalPages,
          className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                    ${currentPage === totalPages ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "Última" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 483,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 5l7 7-7 7M5 5l7 7-7 7" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 485,
              columnNumber: 13
            }, this) }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 484,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 475,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 398,
      columnNumber: 7
    }, this);
  };
  const getAnimalIcon = (animal) => {
    const iconClass = "text-2xl";
    if (animal.genere === "M") {
      return /* @__PURE__ */ jsxDEV("span", { className: iconClass, children: "🐂" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 496,
        columnNumber: 14
      }, this);
    } else {
      if (animal.alletar !== "0") {
        return /* @__PURE__ */ jsxDEV("span", { className: iconClass, children: "🐄" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 499,
          columnNumber: 16
        }, this);
      } else {
        return /* @__PURE__ */ jsxDEV("span", { className: iconClass, children: "🐮" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 501,
          columnNumber: 16
        }, this);
      }
    }
  };
  const renderStatusBadge = (animal) => {
    const statusClass = animal.estado === "OK" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return /* @__PURE__ */ jsxDEV("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`, children: animal.estado === "OK" ? t("animals.table.active", currentLang) : t("animals.table.inactive", currentLang) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 512,
      columnNumber: 7
    }, this);
  };
  return /* @__PURE__ */ jsxDEV("div", { ref: tableRef, className: "w-full overflow-x-auto", children: [
    useMockData && /* @__PURE__ */ jsxDEV("div", { className: "bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-start", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxDEV("svg", { className: "h-5 w-5 text-yellow-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 526,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 525,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 524,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "ml-3", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-yellow-700 dark:text-yellow-200", children: "Mostrando datos simulados. No se pudo conectar con el servidor. Los animales mostrados son de ejemplo y no reflejan datos reales." }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 530,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 529,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 523,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 522,
      columnNumber: 9
    }, this),
    error && /* @__PURE__ */ jsxDEV("div", { className: "bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-4", children: /* @__PURE__ */ jsxDEV("div", { className: "flex", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxDEV("svg", { className: "h-5 w-5 text-red-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 544,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 543,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 542,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "ml-3", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-red-700 dark:text-red-200", children: error }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 548,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 547,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 541,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 540,
      columnNumber: 9
    }, this),
    loading ? /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center items-center p-12", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 556,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "ml-3 text-gray-600 dark:text-gray-400", children: "Cargando animales..." }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 557,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 555,
      columnNumber: 9
    }, this) : animals.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-gray-600 dark:text-gray-300 text-lg", children: "No se encontraron animales" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 561,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-gray-500 dark:text-gray-400 mt-2", children: "Intenta con otros filtros o importa datos de prueba" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 562,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: loadAnimals,
          className: "mt-4 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md transition-colors",
          children: "Reintentar"
        },
        void 0,
        false,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 563,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 560,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-600", children: [
        /* @__PURE__ */ jsxDEV("thead", { className: "bg-gray-100 dark:bg-gray-800", children: /* @__PURE__ */ jsxDEV("tr", { children: [
          /* @__PURE__ */ jsxDEV("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Tipus" : "Tipo" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 576,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Nom" : "Nombre" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 579,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Codi" : "Código" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 582,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Explotació" : "Explotación" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 585,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Estat" : "Estado" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 588,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { scope: "col", className: "px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider", children: currentLang === "ca" ? "Accions" : "Acciones" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 591,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 575,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 574,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600", children: animals.map((animal) => /* @__PURE__ */ jsxDEV("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [
          /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-4 whitespace-nowrap text-center", children: /* @__PURE__ */ jsxDEV("a", { href: `/animals/${animal.id}`, className: "cursor-pointer hover:scale-110 transition-transform inline-block", title: animal.alletar === "0" ? "No amamantando" : animal.alletar === "1" ? "Amamantando 1 ternero" : "Amamantando 2 terneros", children: getAnimalIcon(animal) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 600,
            columnNumber: 23
          }, this) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 599,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-200", children: animal.nom }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 605,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: animal.genere === "M" ? t("animals.male", currentLang) : t("animals.female", currentLang) }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 608,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 604,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-gray-900 dark:text-gray-200", children: animal.cod || "-" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 613,
              columnNumber: 23
            }, this),
            animal.num_serie && /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Serie: ",
              animal.num_serie
            ] }, void 0, true, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
              lineNumber: 617,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 612,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center", children: /* @__PURE__ */ jsxDEV("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: animal.explotacio }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 625,
            columnNumber: 27
          }, this) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 624,
            columnNumber: 25
          }, this) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 623,
            columnNumber: 23
          }, this) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 622,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-4 whitespace-nowrap", children: renderStatusBadge(animal) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 631,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end space-x-2", children: [
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: `/animals/${animal.id}`,
                className: "inline-flex items-center px-2 py-1 bg-primary text-white rounded hover:bg-primary/80",
                children: [
                  /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                    /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" }, void 0, false, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
                      lineNumber: 641,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" }, void 0, false, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
                      lineNumber: 642,
                      columnNumber: 29
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
                    lineNumber: 640,
                    columnNumber: 27
                  }, this),
                  t("animals.table.view", currentLang)
                ]
              },
              void 0,
              true,
              {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
                lineNumber: 636,
                columnNumber: 25
              },
              this
            ),
            canEdit && animal.estado === "OK" && /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: `/animals/update/${animal.id}`,
                className: "inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700",
                children: [
                  /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }, void 0, false, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
                    lineNumber: 652,
                    columnNumber: 31
                  }, this) }, void 0, false, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
                    lineNumber: 651,
                    columnNumber: 29
                  }, this),
                  t("animals.table.update", currentLang)
                ]
              },
              void 0,
              true,
              {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
                lineNumber: 647,
                columnNumber: 27
              },
              this
            )
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 635,
            columnNumber: 23
          }, this) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
            lineNumber: 634,
            columnNumber: 21
          }, this)
        ] }, animal.id, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 598,
          columnNumber: 19
        }, this)) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
          lineNumber: 596,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 573,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
        lineNumber: 572,
        columnNumber: 11
      }, this),
      renderPagination()
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
      lineNumber: 571,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalTable.tsx",
    lineNumber: 519,
    columnNumber: 5
  }, this);
};
export default AnimalTable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hbFRhYmxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGFuaW1hbFNlcnZpY2UgZnJvbSAnLi4vLi4vc2VydmljZXMvYW5pbWFsU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7IEFuaW1hbCwgQW5pbWFsRmlsdGVycywgUGFnaW5hdGVkUmVzcG9uc2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hbmltYWxTZXJ2aWNlJztcbi8vIGltcG9ydCB7IHQgfSBmcm9tICcuLi8uLi9pMThuL2NvbmZpZyc7XG5cbi8vIEltcGxlbWVudGFjacOzbiBkaXJlY3RhIGRlIHRyYWR1Y2Npb25lcyBwYXJhIHNvbHVjaW9uYXIgcHJvYmxlbWFzIGRlIGltcG9ydGFjacOzblxuY29uc3QgdHJhbnNsYXRpb25zID0ge1xuICBlczoge1xuICAgICdhbmltYWxzLnRhYmxlLnR5cGUnOiAnVGlwbycsXG4gICAgJ2FuaW1hbHMudGFibGUubmFtZSc6ICdOb21icmUnLFxuICAgICdhbmltYWxzLnRhYmxlLmNvZGUnOiAnQ8OzZGlnbycsXG4gICAgJ2FuaW1hbHMudGFibGUuZXhwbG9pdGF0aW9uJzogJ0V4cGxvdGFjacOzbicsXG4gICAgJ2FuaW1hbHMudGFibGUuc3RhdHVzJzogJ0VzdGFkbycsXG4gICAgJ2FuaW1hbHMudGFibGUuYWN0aW9ucyc6ICdBY2Npb25lcycsXG4gICAgJ2FuaW1hbHMudGFibGUudmlldyc6ICdWZXInLFxuICAgICdhbmltYWxzLnRhYmxlLnVwZGF0ZSc6ICdBY3R1YWxpemFyJyxcbiAgICAnYW5pbWFscy50YWJsZS5hY3RpdmUnOiAnQWN0aXZvJyxcbiAgICAnYW5pbWFscy50YWJsZS5pbmFjdGl2ZSc6ICdCYWphJyxcbiAgICAnYW5pbWFscy5tYWxlJzogJ01hY2hvJyxcbiAgICAnYW5pbWFscy5mZW1hbGUnOiAnSGVtYnJhJ1xuICB9LFxuICBjYToge1xuICAgICdhbmltYWxzLnRhYmxlLnR5cGUnOiAnVGlwdXMnLFxuICAgICdhbmltYWxzLnRhYmxlLm5hbWUnOiAnTm9tJyxcbiAgICAnYW5pbWFscy50YWJsZS5jb2RlJzogJ0NvZGknLFxuICAgICdhbmltYWxzLnRhYmxlLmV4cGxvaXRhdGlvbic6ICdFeHBsb3RhY2nDsycsXG4gICAgJ2FuaW1hbHMudGFibGUuc3RhdHVzJzogJ0VzdGF0JyxcbiAgICAnYW5pbWFscy50YWJsZS5hY3Rpb25zJzogJ0FjY2lvbnMnLFxuICAgICdhbmltYWxzLnRhYmxlLnZpZXcnOiAnVmV1cmUnLFxuICAgICdhbmltYWxzLnRhYmxlLnVwZGF0ZSc6ICdBY3R1YWxpdHphcicsXG4gICAgJ2FuaW1hbHMudGFibGUuYWN0aXZlJzogJ0FjdGl1JyxcbiAgICAnYW5pbWFscy50YWJsZS5pbmFjdGl2ZSc6ICdCYWl4YScsXG4gICAgJ2FuaW1hbHMubWFsZSc6ICdNYXNjbGUnLFxuICAgICdhbmltYWxzLmZlbWFsZSc6ICdGZW1lbGxhJ1xuICB9XG59O1xuXG4vLyBGdW5jacOzbiBkZSB0cmFkdWNjacOzbiBkaXJlY3RhIGNvbiBkaWFnbsOzc3RpY29cbmZ1bmN0aW9uIHQoa2V5OiBzdHJpbmcsIGxhbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIEZvcnphbW9zIGVzcGHDscOzbCBzaSBubyBlcyB1biBpZGlvbWEgdsOhbGlkb1xuICBpZiAobGFuZyAhPT0gJ2VzJyAmJiBsYW5nICE9PSAnY2EnKSB7XG4gICAgbGFuZyA9ICdlcyc7XG4gIH1cbiAgXG4gIHRyeSB7XG4gICAgLy8gVHJhZHVjY2lvbmVzIGRpcmVjdGFzIHBhcmEgY2FkYSBpZGlvbWFcbiAgICBjb25zdCB0cmFuc2xhdGlvbnNGb3JMYW5nID0gdHJhbnNsYXRpb25zW2xhbmcgYXMgJ2VzJyB8ICdjYSddO1xuICAgIFxuICAgIC8vIFZlcmlmaWNhciBzaSBsYSBjbGF2ZSBleGlzdGUgZW4gZWwgZGljY2lvbmFyaW8gZGUgdHJhZHVjY2lvbmVzXG4gICAgaWYgKGtleSBpbiB0cmFuc2xhdGlvbnNGb3JMYW5nKSB7XG4gICAgICByZXR1cm4gdHJhbnNsYXRpb25zRm9yTGFuZ1trZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtUcmFuc2xhdGlvbl0gQ2xhdmUgbm8gZW5jb250cmFkYTogJHtrZXl9IHBhcmEgaWRpb21hOiAke2xhbmd9YCk7XG4gICAgICByZXR1cm4ga2V5OyAvLyBEZXZvbHZlbW9zIGxhIGNsYXZlIHNpIG5vIGhheSB0cmFkdWNjacOzblxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGBbVHJhbnNsYXRpb25dIEVycm9yIGFsIHRyYWR1Y2lyICR7a2V5fTpgLCBlcnJvcik7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgQW5pbWFsVGFibGVQcm9wcyB7XG4gIGluaXRpYWxGaWx0ZXJzPzogQW5pbWFsRmlsdGVycztcbiAgaWQ/OiBzdHJpbmc7XG4gIGNhbkVkaXQ/OiBib29sZWFuO1xuICBjYW5DcmVhdGU/OiBib29sZWFuO1xufVxuXG5jb25zdCBBbmltYWxUYWJsZTogUmVhY3QuRkM8QW5pbWFsVGFibGVQcm9wcz4gPSAoeyBpbml0aWFsRmlsdGVycyA9IHt9LCBpZCwgY2FuRWRpdCA9IGZhbHNlLCBjYW5DcmVhdGUgPSBmYWxzZSB9KSA9PiB7XG4gIGNvbnN0IFthbmltYWxzLCBzZXRBbmltYWxzXSA9IHVzZVN0YXRlPEFuaW1hbFtdPihbXSk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKTsgXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtmaWx0ZXJzLCBzZXRGaWx0ZXJzXSA9IHVzZVN0YXRlPEFuaW1hbEZpbHRlcnM+KGluaXRpYWxGaWx0ZXJzKTtcbiAgY29uc3QgW2N1cnJlbnRQYWdlLCBzZXRDdXJyZW50UGFnZV0gPSB1c2VTdGF0ZTxudW1iZXI+KDEpO1xuICBjb25zdCBbdG90YWxQYWdlcywgc2V0VG90YWxQYWdlc10gPSB1c2VTdGF0ZTxudW1iZXI+KDEpO1xuICBjb25zdCBbdG90YWxBbmltYWxzLCBzZXRUb3RhbEFuaW1hbHNdID0gdXNlU3RhdGU8bnVtYmVyPigwKTtcbiAgY29uc3QgW3VzZU1vY2tEYXRhLCBzZXRVc2VNb2NrRGF0YV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzZWFyY2hJbmZvLCBzZXRTZWFyY2hJbmZvXSA9IHVzZVN0YXRlPHtcbiAgICB0ZXJtOiBzdHJpbmc7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHVzZWRNb2NrOiBib29sZWFuO1xuICAgIHJlYXNvbj86IHN0cmluZztcbiAgfSB8IG51bGw+KG51bGwpO1xuICBjb25zdCB0YWJsZVJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbCk7XG4gIGNvbnN0IGxvYWRUaW1lb3V0UmVmID0gdXNlUmVmPE5vZGVKUy5UaW1lb3V0IHwgbnVsbD4obnVsbCk7XG4gIFxuICAvLyBDb25maWd1cmFjacOzbiBwYXJhIG11bHRpbGVuZ3VhamUgLSBTb2x1Y2nDs24gcGFyYSBTU1JcbiAgY29uc3QgW2N1cnJlbnRMYW5nLCBzZXRDdXJyZW50TGFuZ10gPSB1c2VTdGF0ZSgnZXMnKTsgLy8gVmFsb3IgcG9yIGRlZmVjdG8gcGFyYSBTU1JcbiAgY29uc3QgW2lzQ2xpZW50LCBzZXRJc0NsaWVudF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIFxuICAvLyBTaXN0ZW1hIGRlIGlkaW9tYSBzaW1wbGUgdjMgLSBDb21wYXRpYmxlIGNvbiBTU1JcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBNYXJjYW1vcyBxdWUgZXN0YW1vcyBlbiBlbCBjbGllbnRlXG4gICAgc2V0SXNDbGllbnQodHJ1ZSk7XG4gICAgXG4gICAgLy8gQWhvcmEgZXMgc2VndXJvIGFjY2VkZXIgYWwgbG9jYWxTdG9yYWdlXG4gICAgY29uc3QgdXNlckxhbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlckxhbmd1YWdlJykgfHwgJ2VzJztcbiAgICBjb25zb2xlLmxvZygnW0FuaW1hbFRhYmxlXSBJZGlvbWEgZGV0ZWN0YWRvOicsIHVzZXJMYW5nKTtcbiAgICBzZXRDdXJyZW50TGFuZyh1c2VyTGFuZyk7XG4gIH0sIFtdKTsgLy8gU2UgZWplY3V0YSBzb2xvIGFsIG1vbnRhciBlbCBjb21wb25lbnRlXG4gIFxuICAvLyBGdW5jacOzbiBhdXhpbGlhciBwYXJhIGZvcm1hdGVhciB0ZXh0byBjb24gdmFyaWFibGVzXG4gIGNvbnN0IGZvcm1hdFRleHQgPSAodGV4dDogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL3soXFxkKyl9L2csIChtYXRjaCwgbnVtYmVyKSA9PiB7XG4gICAgICByZXR1cm4gdHlwZW9mIGFyZ3NbbnVtYmVyXSAhPT0gJ3VuZGVmaW5lZCcgPyBhcmdzW251bWJlcl0udG9TdHJpbmcoKSA6IG1hdGNoO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IGxvYWRBbmltYWxzID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICBcbiAgICAgIC8vIEVzdGFibGVjZXIgdW4gdGltZW91dCBwYXJhIGV2aXRhciBjYXJnYSBpbmRlZmluaWRhXG4gICAgICBpZiAobG9hZFRpbWVvdXRSZWYuY3VycmVudCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobG9hZFRpbWVvdXRSZWYuY3VycmVudCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGxvYWRUaW1lb3V0UmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKGxvYWRpbmcpIHtcbiAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgICBzZXRFcnJvcignVGllbXBvIGRlIGVzcGVyYSBhZ290YWRvLiBQb3IgZmF2b3IsIGludGVudGEgZGUgbnVldm8uJyk7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwMDAwKTsgLy8gMTAgc2VndW5kb3MgZGUgdGltZW91dFxuICAgICAgXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XG4gICAgICBcbiAgICAgIC8vIERldGVjdGFyIHNpIGVzdGFtb3MgZW4gUmVuZGVyIHBhcmEgdXNhciBtYW5lam8gZXNwZWNpYWxcbiAgICAgIGNvbnN0IGlzUmVuZGVyRW52aXJvbm1lbnQgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoJ3JlbmRlci5jb20nKTtcbiAgICAgIFxuICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coYENhcmdhbmRvIGFuaW1hbGVzIC0gUMOhZ2luYTogJHtjdXJyZW50UGFnZX0sIEzDrW1pdGU6IDE1YCk7XG4gICAgICAgIHJlc3BvbnNlID0gYXdhaXQgYW5pbWFsU2VydmljZS5nZXRBbmltYWxzKHtcbiAgICAgICAgICAuLi5maWx0ZXJzLFxuICAgICAgICAgIHBhZ2U6IGN1cnJlbnRQYWdlLCAvLyBVc2FyIGxhIHDDoWdpbmEgYWN0dWFsIHNlbGVjY2lvbmFkYVxuICAgICAgICAgIGxpbWl0OiAxNSAvLyBNb3N0cmFyIDE1IGFuaW1hbGVzIHBvciBww6FnaW5hIHBhcmEgbWVqb3IgZXhwZXJpZW5jaWEgZGUgdXN1YXJpb1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIG9idGVuZXIgYW5pbWFsZXMgZGVzZGUgQVBJOicsIGVycm9yKTtcbiAgICAgICAgLy8gU2kgZXN0YW1vcyBlbiBSZW5kZXIgeSBoYXkgdW4gZXJyb3IsIHVzYXIgZGF0b3Mgc2ltdWxhZG9zXG4gICAgICAgIGlmIChpc1JlbmRlckVudmlyb25tZW50KSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdEZXRlY3RhZG8gZW50b3JubyBSZW5kZXI6IHVzYW5kbyByZXNwdWVzdGEgYWx0ZXJuYXRpdmEnKTtcbiAgICAgICAgICByZXNwb25zZSA9IHsgaXRlbXM6IFtdLCB0b3RhbDogMCwgcGFnZTogMSwgbGltaXQ6IDEwLCBwYWdlczogMSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEVuIGxvY2FsLCBwcm9wYWdhciBlbCBlcnJvciBub3JtYWxtZW50ZVxuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNPTFVDScOTTiBERUZFTlNJVkEgUEFSQSBSRU5ERVJcbiAgICAgIC8vIFZlcmlmaWNhciB5IHJlcGFyYXIgbGEgcmVzcHVlc3RhIHNpIGVzIG5lY2VzYXJpb1xuICAgICAgaWYgKGlzUmVuZGVyRW52aXJvbm1lbnQgfHwgIXJlc3BvbnNlLml0ZW1zIHx8ICFBcnJheS5pc0FycmF5KHJlc3BvbnNlLml0ZW1zKSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQXBsaWNhbmRvIGNvcnJlY2Npw7NuIGRlZmVuc2l2YSBhIGxhIHJlc3B1ZXN0YScpO1xuICAgICAgICBcbiAgICAgICAgLy8gQXNlZ3VyYXIgcXVlIHRlbmVtb3MgdW5hIGVzdHJ1Y3R1cmEgdsOhbGlkYVxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8IHR5cGVvZiByZXNwb25zZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICByZXNwb25zZSA9IHsgaXRlbXM6IFtdLCB0b3RhbDogMCwgcGFnZTogMSwgbGltaXQ6IDEwLCBwYWdlczogMSB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBSZXBhcmFyIHJlc3BvbnNlLml0ZW1zIHNpIG5vIGVzIHVuIGFycmF5XG4gICAgICAgIGlmICghcmVzcG9uc2UuaXRlbXMpIHtcbiAgICAgICAgICByZXNwb25zZS5pdGVtcyA9IFtdO1xuICAgICAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KHJlc3BvbnNlLml0ZW1zKSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybigncmVzcG9uc2UuaXRlbXMgbm8gZXMgdW4gYXJyYXksIGludGVudGFuZG8gcmVwYXJhcicpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEludGVudGFyIGNvbnZlcnRpciBhIGFycmF5IHNpIGVzIHVuIG9iamV0b1xuICAgICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UuaXRlbXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIEludGVudGFyIGV4dHJhZXIgdmFsb3JlcyBkZWwgb2JqZXRvXG4gICAgICAgICAgICAgIE9iamVjdC52YWx1ZXMocmVzcG9uc2UuaXRlbXMpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICB0ZW1wSXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXNwb25zZS5pdGVtcyA9IHRlbXBJdGVtcy5sZW5ndGggPiAwID8gdGVtcEl0ZW1zIDogW107XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGludGVudGFyIHJlcGFyYXIgaXRlbXM6JywgZSk7XG4gICAgICAgICAgICAgIHJlc3BvbnNlLml0ZW1zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLml0ZW1zID0gW107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFob3JhIHNhYmVtb3MgcXVlIHJlc3BvbnNlLml0ZW1zIGVzIHNlZ3VybyBwYXJhIHVzYXJcbiAgICAgIGxldCBvcmRlcmVkQW5pbWFscyA9IFsuLi5yZXNwb25zZS5pdGVtc107XG4gICAgICBpZiAoZmlsdGVycy5zZWFyY2ggJiYgZmlsdGVycy5zZWFyY2gudHJpbSgpICE9PSAnJykge1xuICAgICAgICBjb25zdCBzZWFyY2hUZXJtID0gZmlsdGVycy5zZWFyY2gudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIC8vIE9yZGVuYXIgbG9zIHJlc3VsdGFkb3MgbG9jYWxtZW50ZSBwb3Igbm9tYnJlIGNvaW5jaWRlbnRlXG4gICAgICAgIG9yZGVyZWRBbmltYWxzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAvLyBDb2luY2lkZW5jaWEgZXhhY3RhIGRlIG5vbWJyZSAobcOheGltYSBwcmlvcmlkYWQpXG4gICAgICAgICAgY29uc3QgYUV4YWN0TWF0Y2ggPSBhLm5vbT8udG9Mb3dlckNhc2UoKSA9PT0gc2VhcmNoVGVybTtcbiAgICAgICAgICBjb25zdCBiRXhhY3RNYXRjaCA9IGIubm9tPy50b0xvd2VyQ2FzZSgpID09PSBzZWFyY2hUZXJtO1xuICAgICAgICAgIGlmIChhRXhhY3RNYXRjaCAmJiAhYkV4YWN0TWF0Y2gpIHJldHVybiAtMTtcbiAgICAgICAgICBpZiAoIWFFeGFjdE1hdGNoICYmIGJFeGFjdE1hdGNoKSByZXR1cm4gMTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBDb2luY2lkZSBhbCBpbmljaW8gZGVsIG5vbWJyZSAoc2VndW5kYSBwcmlvcmlkYWQpXG4gICAgICAgICAgY29uc3QgYVN0YXJ0c1dpdGggPSBhLm5vbT8udG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKHNlYXJjaFRlcm0pO1xuICAgICAgICAgIGNvbnN0IGJTdGFydHNXaXRoID0gYi5ub20/LnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChzZWFyY2hUZXJtKTtcbiAgICAgICAgICBpZiAoYVN0YXJ0c1dpdGggJiYgIWJTdGFydHNXaXRoKSByZXR1cm4gLTE7XG4gICAgICAgICAgaWYgKCFhU3RhcnRzV2l0aCAmJiBiU3RhcnRzV2l0aCkgcmV0dXJuIDE7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQ29pbmNpZGUgZW4gY3VhbHF1aWVyIHBhcnRlIGRlbCBub21icmUgKHRlcmNlcmEgcHJpb3JpZGFkKVxuICAgICAgICAgIGNvbnN0IGFDb250YWlucyA9IGEubm9tPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0pO1xuICAgICAgICAgIGNvbnN0IGJDb250YWlucyA9IGIubm9tPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0pO1xuICAgICAgICAgIGlmIChhQ29udGFpbnMgJiYgIWJDb250YWlucykgcmV0dXJuIC0xO1xuICAgICAgICAgIGlmICghYUNvbnRhaW5zICYmIGJDb250YWlucykgcmV0dXJuIDE7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gU2kgbG9zIGNyaXRlcmlvcyBzb24gaWd1YWxlcywgbWFudGVuZXIgZWwgb3JkZW4gb3JpZ2luYWxcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygnQW5pbWFsZXMgb3JkZW5hZG9zIGxvY2FsbWVudGU6Jywgb3JkZXJlZEFuaW1hbHMubWFwKGEgPT4gYS5ub20gfHwgJ1NpbiBub21icmUnKSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHNldEFuaW1hbHMob3JkZXJlZEFuaW1hbHMpO1xuICAgICAgc2V0VG90YWxBbmltYWxzKHJlc3BvbnNlLnRvdGFsIHx8IDApO1xuICAgICAgc2V0VG90YWxQYWdlcyhyZXNwb25zZS5wYWdlcyB8fCAxKTtcbiAgICAgIFxuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2FuaW1hbHMtbG9hZGVkJywge1xuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICB0b3RhbDogcmVzcG9uc2UudG90YWwgfHwgMCxcbiAgICAgICAgICBmaWx0ZXJlZDogcmVzcG9uc2UuaXRlbXM/Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgIHBhZ2U6IHJlc3BvbnNlLnBhZ2UgfHwgMSxcbiAgICAgICAgICBwYWdlczogcmVzcG9uc2UucGFnZXMgfHwgMVxuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNhcmdhbmRvIGFuaW1hbGVzOicsIGVycik7XG4gICAgICBcbiAgICAgIC8vIE1hbmVqYXIgZXNwZWPDrWZpY2FtZW50ZSBlbCBlcnJvciBkZSBlc3RhZG9fdFxuICAgICAgaWYgKGVyci5jb2RlID09PSAnREJfQ09MVU1OX0VSUk9SJyB8fCAoZXJyLm1lc3NhZ2UgJiYgZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ2VzdGFkb190JykpKSB7XG4gICAgICAgIHNldEVycm9yKCdMYSBjb2x1bW5hIFwiZXN0YWRvX3RcIiBubyBleGlzdGUgZW4gbGEgdGFibGEgZGUgYW5pbWFsZXMuIEVzdGUgZXMgdW4gcHJvYmxlbWEgY29ub2NpZG8gZGVsIGJhY2tlbmQgcXVlIGVzdMOhIHNpZW5kbyBzb2x1Y2lvbmFkby4gTWllbnRyYXMgdGFudG8sIHNlIG1vc3RyYXLDoW4gZGF0b3Mgc2ltdWxhZG9zIHNpIGVzdMOhbiBkaXNwb25pYmxlcy4nKTtcbiAgICAgICAgc2V0VXNlTW9ja0RhdGEodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSB8fCAnRXJyb3IgYWwgY2FyZ2FyIGxvcyBhbmltYWxlcycpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBzZXRBbmltYWxzKFtdKTtcbiAgICAgIHNldFRvdGFsQW5pbWFscygwKTtcbiAgICAgIHNldFRvdGFsUGFnZXMoMCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChsb2FkVGltZW91dFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNsZWFyVGltZW91dChsb2FkVGltZW91dFJlZi5jdXJyZW50KTtcbiAgICAgICAgbG9hZFRpbWVvdXRSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICB9XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsb2FkQW5pbWFscygpO1xuICAgIFxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobG9hZFRpbWVvdXRSZWYuY3VycmVudCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobG9hZFRpbWVvdXRSZWYuY3VycmVudCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIC8vIEVmZWN0byBwYXJhIGNhcmdhciBhbmltYWxlcyBjdWFuZG8gY2FtYmlhIGxhIHDDoWdpbmEgbyBsb3MgZmlsdHJvc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIENhcmdhciBhbmltYWxlcyBzaWVtcHJlIHF1ZSBjYW1iaWUgbGEgcMOhZ2luYSBvIGxvcyBmaWx0cm9zXG4gICAgbG9hZEFuaW1hbHMoKTtcbiAgfSwgW2ZpbHRlcnMsIGN1cnJlbnRQYWdlXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBoYW5kbGVBcHBseUZpbHRlcnMgPSAoZXZlbnQ6IEN1c3RvbUV2ZW50PEFuaW1hbEZpbHRlcnM+KSA9PiB7XG4gICAgICBzZXRGaWx0ZXJzKGV2ZW50LmRldGFpbCk7XG4gICAgICBzZXRDdXJyZW50UGFnZSgxKTsgXG4gICAgICAvLyBMaW1waWFyIGxhIGluZm9ybWFjacOzbiBkZSBiw7pzcXVlZGEgY3VhbmRvIHNlIGFwbGljYW4gbnVldm9zIGZpbHRyb3NcbiAgICAgIGlmICghZXZlbnQuZGV0YWlsLnNlYXJjaCkge1xuICAgICAgICBzZXRTZWFyY2hJbmZvKG51bGwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVSZWZyZXNoQW5pbWFscyA9ICgpID0+IHtcbiAgICAgIGxvYWRBbmltYWxzKCk7XG4gICAgICBzZXRTZWFyY2hJbmZvKG51bGwpOyAvLyBMaW1waWFyIGluZm9ybWFjacOzbiBkZSBiw7pzcXVlZGEgYWwgcmVmcmVzY2FyXG4gICAgfTtcbiAgICBcbiAgICBjb25zdCBoYW5kbGVTZWFyY2hDb21wbGV0ZWQgPSAoZXZlbnQ6IEN1c3RvbUV2ZW50PHtcbiAgICAgIHRlcm06IHN0cmluZztcbiAgICAgIGNvdW50OiBudW1iZXI7XG4gICAgICB0b3RhbDogbnVtYmVyO1xuICAgICAgdXNlZE1vY2s6IGJvb2xlYW47XG4gICAgICByZWFzb24/OiBzdHJpbmc7XG4gICAgfT4pID0+IHtcbiAgICAgIHNldFNlYXJjaEluZm8oZXZlbnQuZGV0YWlsKTtcbiAgICAgIHNldFVzZU1vY2tEYXRhKGV2ZW50LmRldGFpbC51c2VkTW9jayk7XG4gICAgICBcbiAgICAgIGlmIChldmVudC5kZXRhaWwudXNlZE1vY2spIHtcbiAgICAgICAgc2V0RXJyb3IoYE5vdGE6IE1vc3RyYW5kbyByZXN1bHRhZG9zIHNpbXVsYWRvcyBkZWJpZG8gYSB1biAke2V2ZW50LmRldGFpbC5yZWFzb259LiBTZSBlbmNvbnRyYXJvbiAke2V2ZW50LmRldGFpbC5jb3VudH0gY29pbmNpZGVuY2lhcyBwYXJhIFwiJHtldmVudC5kZXRhaWwudGVybX1cIi5gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNpIGxhIGLDunNxdWVkYSBmdWUgZXhpdG9zYSwgbGltcGlhciBtZW5zYWplIGRlIGVycm9yXG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdyZWZyZXNoLWFuaW1hbHMnLCBoYW5kbGVSZWZyZXNoQW5pbWFscyk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVsb2FkLWFuaW1hbHMnLCBoYW5kbGVSZWZyZXNoQW5pbWFscyk7IC8vIEHDsWFkaXIgbGlzdGVuZXIgcGFyYSBlbCBudWV2byBldmVudG9cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWFyY2gtY29tcGxldGVkJywgaGFuZGxlU2VhcmNoQ29tcGxldGVkIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCB8fCAnJyk7XG4gICAgaWYgKHJvb3RFbGVtZW50KSB7XG4gICAgICByb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdhcHBseS1maWx0ZXJzJywgaGFuZGxlQXBwbHlGaWx0ZXJzIGFzIEV2ZW50TGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmaWx0ZXJzLWFwcGxpZWQnLCBoYW5kbGVBcHBseUZpbHRlcnMgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3JlZnJlc2gtYW5pbWFscycsIGhhbmRsZVJlZnJlc2hBbmltYWxzKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3JlbG9hZC1hbmltYWxzJywgaGFuZGxlUmVmcmVzaEFuaW1hbHMpOyAvLyBFbGltaW5hciBsaXN0ZW5lciBhbCBkZXNtb250YXJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlYXJjaC1jb21wbGV0ZWQnLCBoYW5kbGVTZWFyY2hDb21wbGV0ZWQgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgICBpZiAocm9vdEVsZW1lbnQpIHtcbiAgICAgICAgcm9vdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYXBwbHktZmlsdGVycycsIGhhbmRsZUFwcGx5RmlsdGVycyBhcyBFdmVudExpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZpbHRlcnMtYXBwbGllZCcsIGhhbmRsZUFwcGx5RmlsdGVycyBhcyBFdmVudExpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LCBbaWRdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHRvdGFsQW5pbWFsc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b3RhbEFuaW1hbHNDb250YWluZXInKTtcbiAgICBpZiAodG90YWxBbmltYWxzQ29udGFpbmVyKSB7XG4gICAgICBpZiAobG9hZGluZykge1xuICAgICAgICB0b3RhbEFuaW1hbHNDb250YWluZXIuaW5uZXJIVE1MID0gYFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBmbGV4IGl0ZW1zLWNlbnRlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFuaW1hdGUtc3BpbiByb3VuZGVkLWZ1bGwgaC00IHctNCBib3JkZXItdC0yIGJvcmRlci1iLTIgYm9yZGVyLXByaW1hcnkgbXItMlwiPjwvZGl2PlxuICAgICAgICAgICAgQ2FyZ2FuZG8uLi5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTaSBoYXkgaW5mb3JtYWNpw7NuIGRlIGLDunNxdWVkYSwgbW9zdHJhcmxhXG4gICAgICAgIGlmIChzZWFyY2hJbmZvICYmIHNlYXJjaEluZm8udGVybSkge1xuICAgICAgICAgIGNvbnN0IG1vY2tCYWRnZSA9IHNlYXJjaEluZm8udXNlZE1vY2sgPyBcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cIm1sLTEgcHgtMSBweS0wLjUgdGV4dC14cyBiZy15ZWxsb3ctMjAwIHRleHQteWVsbG93LTgwMCBkYXJrOmJnLXllbGxvdy04MDAgZGFyazp0ZXh0LXllbGxvdy0yMDAgcm91bmRlZFwiPkRBVE9TIFNJTVVMQURPUzwvc3Bhbj4nIDogXG4gICAgICAgICAgICAnJztcbiAgICAgICAgICBcbiAgICAgICAgICB0b3RhbEFuaW1hbHNDb250YWluZXIuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XG4gICAgICAgICAgICAgIFRvdGFsOiAke3RvdGFsQW5pbWFsc30gYW5pbWFsZXMgfCBCw7pzcXVlZGE6IFwiJHtzZWFyY2hJbmZvLnRlcm19XCIgKCR7c2VhcmNoSW5mby5jb3VudH0gY29pbmNpZGVuY2lhcykgJHttb2NrQmFkZ2V9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgYDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNZW5zYWplIG5vcm1hbCBzaW4gYsO6c3F1ZWRhXG4gICAgICAgICAgY29uc3QgbW9ja0JhZGdlID0gdXNlTW9ja0RhdGEgPyBcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cIm1sLTEgcHgtMSBweS0wLjUgdGV4dC14cyBiZy15ZWxsb3ctMjAwIHRleHQteWVsbG93LTgwMCBkYXJrOmJnLXllbGxvdy04MDAgZGFyazp0ZXh0LXllbGxvdy0yMDAgcm91bmRlZFwiPkRBVE9TIFNJTVVMQURPUzwvc3Bhbj4nIDogXG4gICAgICAgICAgICAnJztcbiAgICAgICAgICBcbiAgICAgICAgICB0b3RhbEFuaW1hbHNDb250YWluZXIuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XG4gICAgICAgICAgICAgIFRvdGFsOiAke3RvdGFsQW5pbWFsc30gYW5pbWFsZXMgJHttb2NrQmFkZ2V9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgYDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW3RvdGFsQW5pbWFscywgbG9hZGluZywgc2VhcmNoSW5mbywgdXNlTW9ja0RhdGFdKTtcblxuICAvLyBGdW5jacOzbiBwYXJhIG1hbmVqYXIgZWwgY2FtYmlvIGRlIHDDoWdpbmFcbiAgY29uc3QgaGFuZGxlUGFnZUNoYW5nZSA9IChwYWdlOiBudW1iZXIpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgQ2FtYmlhbmRvIGEgcMOhZ2luYSAke3BhZ2V9YCk7XG4gICAgXG4gICAgLy8gTm8gaGFjZXIgbmFkYSBzaSBlc3RhbW9zIGVuIGxhIG1pc21hIHDDoWdpbmFcbiAgICBpZiAocGFnZSA9PT0gY3VycmVudFBhZ2UpIHJldHVybjtcbiAgICBcbiAgICAvLyBBY3R1YWxpemFyIGVsIGVzdGFkbyBkZSBsYSBww6FnaW5hIGFjdHVhbCB5IGZvcnphciByZWNhcmdhXG4gICAgc2V0Q3VycmVudFBhZ2UocGFnZSk7XG4gICAgXG4gICAgLy8gSGFjZXIgc2Nyb2xsIGhhY2lhIGFycmliYSBjdWFuZG8gY2FtYmlhbW9zIGRlIHDDoWdpbmFcbiAgICBpZiAodGFibGVSZWYuY3VycmVudCkge1xuICAgICAgdGFibGVSZWYuY3VycmVudC5zY3JvbGxJbnRvVmlldyh7IGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQW5pbWFsRGVhY3RpdmF0aW9uID0gYXN5bmMgKGFuaW1hbElkOiBudW1iZXIpID0+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgYW5pbWFsU2VydmljZS5kZWxldGVBbmltYWwoYW5pbWFsSWQpO1xuICAgICAgbG9hZEFuaW1hbHMoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGRhciBkZSBiYWphIGFsIGFuaW1hbDonLCBlcnIpO1xuICAgICAgYWxlcnQoJ05vIHNlIHB1ZG8gZGFyIGRlIGJhamEgYWwgYW5pbWFsLiBQb3IgZmF2b3IsIGludMOpbnRhbG8gZGUgbnVldm8uJyk7XG4gICAgfVxuICB9O1xuXG4gIFxuICAvLyBJbXBsZW1lbnRhY2nDs24gZGUgY29udHJvbGVzIGRlIHBhZ2luYWNpw7NuXG4gIGNvbnN0IHJlbmRlclBhZ2luYXRpb24gPSAoKSA9PiB7XG4gICAgLy8gU29sbyBtb3N0cmFyIGNvbnRyb2xlcyBzaSBoYXkgbcOhcyBkZSB1bmEgcMOhZ2luYVxuICAgIGlmICh0b3RhbFBhZ2VzIDw9IDEpIHJldHVybiBudWxsO1xuICAgIFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG10LTYgc3BhY2UteC0xXCI+XG4gICAgICAgIHsvKiBCb3TDs24gcHJpbWVyYSBww6FnaW5hICovfVxuICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVBhZ2VDaGFuZ2UoMSl9IFxuICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA9PT0gMX1cbiAgICAgICAgICBjbGFzc05hbWU9e2BpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgcHgtMiBweS0xIGJvcmRlciByb3VuZGVkLW1kIHRleHQtc20gZm9udC1tZWRpdW0gXG4gICAgICAgICAgICAgICAgICAgICR7Y3VycmVudFBhZ2UgPT09IDEgXG4gICAgICAgICAgICAgICAgICAgICAgPyAnYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMCB0ZXh0LWdyYXktNDAwIGRhcms6dGV4dC1ncmF5LTYwMCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgY3Vyc29yLW5vdC1hbGxvd2VkJyBcbiAgICAgICAgICAgICAgICAgICAgICA6ICdiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBob3ZlcjpiZy1ncmF5LTUwIGRhcms6aG92ZXI6YmctZ3JheS03MDAnfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzci1vbmx5XCI+UHJpbWVyYTwvc3Bhbj5cbiAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzc05hbWU9XCJoLTQgdy00XCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICA8cGF0aCBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlV2lkdGg9ezJ9IGQ9XCJNMTEgMTlsLTctNyA3LTdtOCAxNGwtNy03IDctN1wiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICBcbiAgICAgICAgey8qIEJvdMOzbiBhbnRlcmlvciAqL31cbiAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVQYWdlQ2hhbmdlKGN1cnJlbnRQYWdlIC0gMSl9IFxuICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA9PT0gMX1cbiAgICAgICAgICBjbGFzc05hbWU9e2BpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgcHgtMiBweS0xIGJvcmRlciByb3VuZGVkLW1kIHRleHQtc20gZm9udC1tZWRpdW0gXG4gICAgICAgICAgICAgICAgICAgICR7Y3VycmVudFBhZ2UgPT09IDEgXG4gICAgICAgICAgICAgICAgICAgICAgPyAnYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMCB0ZXh0LWdyYXktNDAwIGRhcms6dGV4dC1ncmF5LTYwMCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgY3Vyc29yLW5vdC1hbGxvd2VkJyBcbiAgICAgICAgICAgICAgICAgICAgICA6ICdiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBob3ZlcjpiZy1ncmF5LTUwIGRhcms6aG92ZXI6YmctZ3JheS03MDAnfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzci1vbmx5XCI+QW50ZXJpb3I8L3NwYW4+XG4gICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3NOYW1lPVwiaC00IHctNFwiIGZpbGw9XCJub25lXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiPlxuICAgICAgICAgICAgPHBhdGggc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZVdpZHRoPXsyfSBkPVwiTTE1IDE5bC03LTcgNy03XCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIFxuICAgICAgICB7LyogTsO6bWVyb3MgZGUgcMOhZ2luYSAqL31cbiAgICAgICAge1suLi5BcnJheSh0b3RhbFBhZ2VzKV0ubWFwKChfLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhZ2VOdW1iZXIgPSBpbmRleCArIDE7XG4gICAgICAgICAgLy8gTW9zdHJhciBzb2xvIHDDoWdpbmFzIHJlbGV2YW50ZXNcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBwYWdlTnVtYmVyID09PSAxIHx8XG4gICAgICAgICAgICBwYWdlTnVtYmVyID09PSB0b3RhbFBhZ2VzIHx8XG4gICAgICAgICAgICAocGFnZU51bWJlciA+PSBjdXJyZW50UGFnZSAtIDEgJiYgcGFnZU51bWJlciA8PSBjdXJyZW50UGFnZSArIDEpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXtwYWdlTnVtYmVyfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVBhZ2VDaGFuZ2UocGFnZU51bWJlcil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIHB4LTMgcHktMSBib3JkZXIgdGV4dC1zbSBmb250LW1lZGl1bSByb3VuZGVkLW1kIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAke3BhZ2VOdW1iZXIgPT09IGN1cnJlbnRQYWdlIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXByaW1hcnkvMTAgZGFyazpiZy1wcmltYXJ5LzMwIHRleHQtcHJpbWFyeSBib3JkZXItcHJpbWFyeS8yMCBkYXJrOmJvcmRlci1wcmltYXJ5LzQwJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBob3ZlcjpiZy1ncmF5LTUwIGRhcms6aG92ZXI6YmctZ3JheS03MDAnfWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7cGFnZU51bWJlcn1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBwYWdlTnVtYmVyID09PSBjdXJyZW50UGFnZSAtIDIgfHxcbiAgICAgICAgICAgIHBhZ2VOdW1iZXIgPT09IGN1cnJlbnRQYWdlICsgMlxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGtleT17YGVsbGlwc2lzLSR7cGFnZU51bWJlcn1gfSBjbGFzc05hbWU9XCJweC0xIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+Li4uPC9zcGFuPjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pfVxuICAgICAgICBcbiAgICAgICAgey8qIEJvdMOzbiBzaWd1aWVudGUgKi99XG4gICAgICAgIDxidXR0b24gXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlUGFnZUNoYW5nZShjdXJyZW50UGFnZSArIDEpfSBcbiAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPT09IHRvdGFsUGFnZXN9XG4gICAgICAgICAgY2xhc3NOYW1lPXtgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIHB4LTIgcHktMSBib3JkZXIgcm91bmRlZC1tZCB0ZXh0LXNtIGZvbnQtbWVkaXVtIFxuICAgICAgICAgICAgICAgICAgICAke2N1cnJlbnRQYWdlID09PSB0b3RhbFBhZ2VzIFxuICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgdGV4dC1ncmF5LTQwMCBkYXJrOnRleHQtZ3JheS02MDAgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIGN1cnNvci1ub3QtYWxsb3dlZCcgXG4gICAgICAgICAgICAgICAgICAgICAgOiAnYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS02MDAgdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDAgaG92ZXI6YmctZ3JheS01MCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwJ31gfVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic3Itb25seVwiPlNpZ3VpZW50ZTwvc3Bhbj5cbiAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzc05hbWU9XCJoLTQgdy00XCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICA8cGF0aCBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlV2lkdGg9ezJ9IGQ9XCJNOSA1bDcgNy03IDdcIiAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgXG4gICAgICAgIHsvKiBCb3TDs24gw7psdGltYSBww6FnaW5hICovfVxuICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVBhZ2VDaGFuZ2UodG90YWxQYWdlcyl9IFxuICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA9PT0gdG90YWxQYWdlc31cbiAgICAgICAgICBjbGFzc05hbWU9e2BpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgcHgtMiBweS0xIGJvcmRlciByb3VuZGVkLW1kIHRleHQtc20gZm9udC1tZWRpdW0gXG4gICAgICAgICAgICAgICAgICAgICR7Y3VycmVudFBhZ2UgPT09IHRvdGFsUGFnZXMgXG4gICAgICAgICAgICAgICAgICAgICAgPyAnYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMCB0ZXh0LWdyYXktNDAwIGRhcms6dGV4dC1ncmF5LTYwMCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgY3Vyc29yLW5vdC1hbGxvd2VkJyBcbiAgICAgICAgICAgICAgICAgICAgICA6ICdiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBob3ZlcjpiZy1ncmF5LTUwIGRhcms6aG92ZXI6YmctZ3JheS03MDAnfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzci1vbmx5XCI+w5psdGltYTwvc3Bhbj5cbiAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzc05hbWU9XCJoLTQgdy00XCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICA8cGF0aCBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlV2lkdGg9ezJ9IGQ9XCJNMTMgNWw3IDctNyA3TTUgNWw3IDctNyA3XCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9O1xuXG4gIGNvbnN0IGdldEFuaW1hbEljb24gPSAoYW5pbWFsOiBBbmltYWwpID0+IHtcbiAgICBjb25zdCBpY29uQ2xhc3MgPSBcInRleHQtMnhsXCI7XG4gICAgXG4gICAgaWYgKGFuaW1hbC5nZW5lcmUgPT09ICdNJykge1xuICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17aWNvbkNsYXNzfT7wn5CCPC9zcGFuPjsgLy8gVG9yb1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYW5pbWFsLmFsbGV0YXIgIT09ICcwJykge1xuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtpY29uQ2xhc3N9PvCfkIQ8L3NwYW4+OyAvLyBWYWNhIGFtYW1hbnRhbmRvXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtpY29uQ2xhc3N9PvCfkK48L3NwYW4+OyAvLyBWYWNhXG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlbmRlclN0YXR1c0JhZGdlID0gKGFuaW1hbDogQW5pbWFsKSA9PiB7XG4gICAgY29uc3Qgc3RhdHVzQ2xhc3MgPSBhbmltYWwuZXN0YWRvID09PSAnT0snID9cbiAgICAgICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi04MDAgZGFyazpiZy1ncmVlbi05MDAgZGFyazp0ZXh0LWdyZWVuLTIwMCcgOlxuICAgICAgJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGRhcms6YmctcmVkLTkwMCBkYXJrOnRleHQtcmVkLTIwMCc7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIHB4LTIuNSBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQteHMgZm9udC1tZWRpdW0gJHtzdGF0dXNDbGFzc31gfT5cbiAgICAgICAge2FuaW1hbC5lc3RhZG8gPT09ICdPSycgPyB0KCdhbmltYWxzLnRhYmxlLmFjdGl2ZScsIGN1cnJlbnRMYW5nKSA6IHQoJ2FuaW1hbHMudGFibGUuaW5hY3RpdmUnLCBjdXJyZW50TGFuZyl9XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgcmVmPXt0YWJsZVJlZn0gY2xhc3NOYW1lPVwidy1mdWxsIG92ZXJmbG93LXgtYXV0b1wiPlxuICAgICAgey8qIE1lbnNhamUgZGUgZGF0b3Mgc2ltdWxhZG9zICovfVxuICAgICAge3VzZU1vY2tEYXRhICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy15ZWxsb3ctNTAgZGFyazpiZy15ZWxsb3ctOTAwLzMwIGJvcmRlci1sLTQgYm9yZGVyLXllbGxvdy00MDAgcC00IG1iLTRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtc3RhcnRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC1zaHJpbmstMFwiPlxuICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImgtNSB3LTUgdGV4dC15ZWxsb3ctNDAwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjAgMjBcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZmlsbFJ1bGU9XCJldmVub2RkXCIgZD1cIk04LjI1NyAzLjA5OWMuNzY1LTEuMzYgMi43MjItMS4zNiAzLjQ4NiAwbDUuNTggOS45MmMuNzUgMS4zMzQtLjIxMyAyLjk4LTEuNzQyIDIuOThINC40MmMtMS41MyAwLTIuNDkzLTEuNjQ2LTEuNzQzLTIuOThsNS41OC05Ljkyek0xMSAxM2ExIDEgMCAxMS0yIDAgMSAxIDAgMDEyIDB6bS0xLThhMSAxIDAgMDAtMSAxdjNhMSAxIDAgMDAyIDBWNmExIDEgMCAwMC0xLTF6XCIgY2xpcFJ1bGU9XCJldmVub2RkXCIgLz5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWwtM1wiPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQteWVsbG93LTcwMCBkYXJrOnRleHQteWVsbG93LTIwMFwiPlxuICAgICAgICAgICAgICAgIE1vc3RyYW5kbyBkYXRvcyBzaW11bGFkb3MuIE5vIHNlIHB1ZG8gY29uZWN0YXIgY29uIGVsIHNlcnZpZG9yLiBMb3MgYW5pbWFsZXMgbW9zdHJhZG9zIHNvbiBkZSBlamVtcGxvIHkgbm8gcmVmbGVqYW4gZGF0b3MgcmVhbGVzLlxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7LyogTWVuc2FqZSBkZSBlcnJvciAqL31cbiAgICAgIHtlcnJvciAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8zMCBib3JkZXItbC00IGJvcmRlci1yZWQtNDAwIHAtNCBtYi00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtc2hyaW5rLTBcIj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJoLTUgdy01IHRleHQtcmVkLTQwMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGZpbGxSdWxlPVwiZXZlbm9kZFwiIGQ9XCJNMTAgMThhOCA4IDAgMTAwLTE2IDggOCAwIDAwMCAxNnpNOC43MDcgNy4yOTNhMSAxIDAgMDAtMS40MTQgMS40MTRMOC41ODYgMTBsLTEuMjkzIDEuMjkzYTEgMSAwIDEwMS40MTQgMS40MTRMMTAgMTEuNDE0bDEuMjkzIDEuMjkzYTEgMSAwIDAwMS40MTQtMS40MTRMMTEuNDE0IDEwbDEuMjkzLTEuMjkzYTEgMSAwIDAwLTEuNDE0LTEuNDE0TDEwIDguNTg2IDguNzA3IDcuMjkzelwiIGNsaXBSdWxlPVwiZXZlbm9kZFwiIC8+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1sLTNcIj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC0yMDBcIj57ZXJyb3J9PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICAgIFxuICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgcC0xMlwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYW5pbWF0ZS1zcGluIHJvdW5kZWQtZnVsbCBoLTEyIHctMTIgYm9yZGVyLXQtMiBib3JkZXItYi0yIGJvcmRlci1wcmltYXJ5XCI+PC9kaXY+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibWwtMyB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPkNhcmdhbmRvIGFuaW1hbGVzLi4uPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBhbmltYWxzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS04IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3cgcC02IGJvcmRlciBib3JkZXItZ3JheS0xMDAgZGFyazpib3JkZXItZ3JheS03MDBcIj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTMwMCB0ZXh0LWxnXCI+Tm8gc2UgZW5jb250cmFyb24gYW5pbWFsZXM8L3A+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMlwiPkludGVudGEgY29uIG90cm9zIGZpbHRyb3MgbyBpbXBvcnRhIGRhdG9zIGRlIHBydWViYTwvcD5cbiAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgb25DbGljaz17bG9hZEFuaW1hbHN9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IGJnLXByaW1hcnkgaG92ZXI6YmctcHJpbWFyeS84MCB0ZXh0LXdoaXRlIHB4LTQgcHktMiByb3VuZGVkLW1kIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBSZWludGVudGFyXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm92ZXJmbG93LXgtYXV0byBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93IGJvcmRlciBib3JkZXItZ3JheS0xMDAgZGFyazpib3JkZXItZ3JheS03MDBcIj5cbiAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJtaW4tdy1mdWxsIGRpdmlkZS15IGRpdmlkZS1ncmF5LTIwMCBkYXJrOmRpdmlkZS1ncmF5LTYwMFwiPlxuICAgICAgICAgICAgICA8dGhlYWQgY2xhc3NOYW1lPVwiYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMFwiPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiIGNsYXNzTmFtZT1cInB4LTQgcHktMyB0ZXh0LWxlZnQgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTIwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gJ1RpcHVzJyA6ICdUaXBvJ31cbiAgICAgICAgICAgICAgICAgIDwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiBjbGFzc05hbWU9XCJweC00IHB5LTMgdGV4dC1sZWZ0IHRleHQteHMgZm9udC1tZWRpdW0gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS0yMDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdOb20nIDogJ05vbWJyZSd9XG4gICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtbGVmdCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktMjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPlxuICAgICAgICAgICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyAnQ29kaScgOiAnQ8OzZGlnbyd9XG4gICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtbGVmdCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktMjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPlxuICAgICAgICAgICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyAnRXhwbG90YWNpw7MnIDogJ0V4cGxvdGFjacOzbid9XG4gICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtbGVmdCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktMjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPlxuICAgICAgICAgICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyAnRXN0YXQnIDogJ0VzdGFkbyd9XG4gICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCIgY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtcmlnaHQgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTIwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gJ0FjY2lvbnMnIDogJ0FjY2lvbmVzJ31cbiAgICAgICAgICAgICAgICAgIDwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgZGl2aWRlLXkgZGl2aWRlLWdyYXktMjAwIGRhcms6ZGl2aWRlLWdyYXktNjAwXCI+XG4gICAgICAgICAgICAgICAge2FuaW1hbHMubWFwKChhbmltYWwpID0+IChcbiAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2FuaW1hbC5pZH0gY2xhc3NOYW1lPVwiaG92ZXI6YmctZ3JheS01MCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC00IHB5LTQgd2hpdGVzcGFjZS1ub3dyYXAgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXtgL2FuaW1hbHMvJHthbmltYWwuaWR9YH0gY2xhc3NOYW1lPVwiY3Vyc29yLXBvaW50ZXIgaG92ZXI6c2NhbGUtMTEwIHRyYW5zaXRpb24tdHJhbnNmb3JtIGlubGluZS1ibG9ja1wiIHRpdGxlPXthbmltYWwuYWxsZXRhciA9PT0gJzAnID8gJ05vIGFtYW1hbnRhbmRvJyA6IGFuaW1hbC5hbGxldGFyID09PSAnMScgPyAnQW1hbWFudGFuZG8gMSB0ZXJuZXJvJyA6ICdBbWFtYW50YW5kbyAyIHRlcm5lcm9zJ30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Z2V0QW5pbWFsSWNvbihhbmltYWwpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktNCB3aGl0ZXNwYWNlLW5vd3JhcFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTIwMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2FuaW1hbC5ub219XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7YW5pbWFsLmdlbmVyZSA9PT0gJ00nID8gdCgnYW5pbWFscy5tYWxlJywgY3VycmVudExhbmcpIDogdCgnYW5pbWFscy5mZW1hbGUnLCBjdXJyZW50TGFuZyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC00IHB5LTQgd2hpdGVzcGFjZS1ub3dyYXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0yMDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHthbmltYWwuY29kIHx8ICctJ31cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICB7YW5pbWFsLm51bV9zZXJpZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgU2VyaWU6IHthbmltYWwubnVtX3NlcmllfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktNCB3aGl0ZXNwYWNlLW5vd3JhcFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC1zaHJpbmstMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FuaW1hbC5leHBsb3RhY2lvfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktNCB3aGl0ZXNwYWNlLW5vd3JhcFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZW5kZXJTdGF0dXNCYWRnZShhbmltYWwpfVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNCBweS00IHdoaXRlc3BhY2Utbm93cmFwIHRleHQtcmlnaHQgdGV4dC1zbSBmb250LW1lZGl1bVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWVuZCBzcGFjZS14LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtgL2FuaW1hbHMvJHthbmltYWwuaWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIHB4LTIgcHktMSBiZy1wcmltYXJ5IHRleHQtd2hpdGUgcm91bmRlZCBob3ZlcjpiZy1wcmltYXJ5LzgwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3NOYW1lPVwiaC00IHctNCBtci0xXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZVdpZHRoPXsyfSBkPVwiTTE1IDEyYTMgMyAwIDExLTYgMCAzIDMgMCAwMTYgMHptLTEtOGExIDEgMCAwMC0xIDF2M2ExIDEgMCAwMDIgMFY2YTEgMSAwIDAwLTEtMXpcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VXaWR0aD17Mn0gZD1cIk0yLjQ1OCAxMkMzLjczMiA3Ljk0MyA3LjUyMyA1IDEyIDVjNC40NzggMCA4LjI2OCAyLjk0MyA5LjU0MiA3LTEuMjc0IDQuMDU3LTUuMDY0IDctOS41NDIgNy00LjQ3NyAwLTguMjY4LTIuOTQzLTkuNTQyLTd6XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdhbmltYWxzLnRhYmxlLnZpZXcnLCBjdXJyZW50TGFuZyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y2FuRWRpdCAmJiBhbmltYWwuZXN0YWRvID09PSAnT0snICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17YC9hbmltYWxzL3VwZGF0ZS8ke2FuaW1hbC5pZH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBweC0yIHB5LTEgYmctYmx1ZS02MDAgdGV4dC13aGl0ZSByb3VuZGVkIGhvdmVyOmJnLWJsdWUtNzAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGNsYXNzTmFtZT1cImgtNCB3LTQgbXItMVwiIGZpbGw9XCJub25lXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZVdpZHRoPXsyfSBkPVwiTTExIDVINmEyIDIgMCAwMC0yIDJ2MTFhMiAyIDAgMDAyIDJoMTFhMiAyIDAgMDAyLTJ2LTVtLTEuNDE0LTkuNDE0YTIgMiAwIDExMi44MjggMi44MjhMMTEuODI4IDE1SDl2LTIuODI4bDguNTg2LTguNTg2elwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2FuaW1hbHMudGFibGUudXBkYXRlJywgY3VycmVudExhbmcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3JlbmRlclBhZ2luYXRpb24oKX1cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQW5pbWFsVGFibGU7XG4iXSwibWFwcGluZ3MiOiJBQXVaVSxTQW1LRixVQW5LRTtBQXZaVixPQUFPLFNBQVMsVUFBVSxXQUFXLGNBQWM7QUFDbkQsT0FBTyxtQkFBbUI7QUFLMUIsTUFBTSxlQUFlO0FBQUEsRUFDbkIsSUFBSTtBQUFBLElBQ0Ysc0JBQXNCO0FBQUEsSUFDdEIsc0JBQXNCO0FBQUEsSUFDdEIsc0JBQXNCO0FBQUEsSUFDdEIsOEJBQThCO0FBQUEsSUFDOUIsd0JBQXdCO0FBQUEsSUFDeEIseUJBQXlCO0FBQUEsSUFDekIsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsd0JBQXdCO0FBQUEsSUFDeEIsMEJBQTBCO0FBQUEsSUFDMUIsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsRUFDcEI7QUFBQSxFQUNBLElBQUk7QUFBQSxJQUNGLHNCQUFzQjtBQUFBLElBQ3RCLHNCQUFzQjtBQUFBLElBQ3RCLHNCQUFzQjtBQUFBLElBQ3RCLDhCQUE4QjtBQUFBLElBQzlCLHdC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