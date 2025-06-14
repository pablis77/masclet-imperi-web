import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"];
import apiService from "/src/services/apiService.ts";
import { t } from "/src/i18n/config.ts";
const ExplotacionesPage = () => {
  const [currentLang, setCurrentLang] = useState("es");
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLangChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLangChange);
    return () => window.removeEventListener("storage", handleLangChange);
  }, []);
  const [explotacionesData, setExplotacionesData] = useState([]);
  const [displayExplotaciones, setDisplayExplotaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentExplotacion, setCurrentExplotacion] = useState(null);
  const [allAnimals, setAllAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [stats, setStats] = useState({
    toros: 0,
    vacas: 0,
    terneros: 0
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [sortField, setSortField] = useState("explotacio");
  const [sortDirection, setSortDirection] = useState("asc");
  useEffect(() => {
    loadInitialData();
  }, []);
  useEffect(() => {
    const checkScreenWidth = () => {
      const isMobile = window.innerWidth < 640;
      setIsMobileView(isMobile);
    };
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);
  useEffect(() => {
    if (isMobileView && (sortField !== "total" || sortDirection !== "desc")) {
      setSortField("total");
      setSortDirection("desc");
    }
  }, [isMobileView, sortField, sortDirection]);
  const sortExplotaciones = (explotaciones) => {
    if (!explotaciones) return [];
    if (isMobileView) {
      return [...explotaciones].sort((a, b) => {
        const aTotal = a.total || 0;
        const bTotal = b.total || 0;
        return bTotal - aTotal;
      });
    }
    return [...explotaciones].sort((a, b) => {
      if (sortField === "explotacio") {
        return sortDirection === "asc" ? a.explotacio.localeCompare(b.explotacio) : b.explotacio.localeCompare(a.explotacio);
      } else if (sortField === "total") {
        const aTotal = a.total || 0;
        const bTotal = b.total || 0;
        return sortDirection === "asc" ? aTotal - bTotal : bTotal - aTotal;
      }
      return a.explotacio.localeCompare(b.explotacio);
    });
  };
  useEffect(() => {
    if (!explotacionesData.length) return;
    let dataToDisplay = sortExplotaciones(explotacionesData);
    if (searchTerm.trim() !== "") {
      dataToDisplay = dataToDisplay.filter(
        (exp) => exp.explotacio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDisplayExplotaciones(dataToDisplay);
  }, [explotacionesData, searchTerm, isMobileView, sortField, sortDirection]);
  useEffect(() => {
    if (allAnimals.length > 0) {
      filterAnimalsByCategory(activeCategory);
    }
  }, [activeCategory, allAnimals]);
  const loadInitialData = async () => {
    try {
      console.log("######## INICIO CARGA DE DATOS DE EXPLOTACIONES (REACT) ########");
      console.log(`Usando API URL: ${apiService.getBaseUrl()}`);
      setLoading(true);
      setError(null);
      console.log("Realizando petición GET a animals/?page=1&limit=100");
      const response = await apiService.get("animals/?page=1&limit=100");
      console.log("Respuesta recibida de animals:", response);
      if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
        throw new Error("Formato de respuesta incorrecto");
      }
      const allAnimals2 = response.data.items;
      console.log(`Obtenidos ${allAnimals2.length} animales`);
      const explotacionesMap = {};
      allAnimals2.forEach((animal) => {
        if (!animal.explotacio) return;
        if (!explotacionesMap[animal.explotacio]) {
          explotacionesMap[animal.explotacio] = {
            explotacio: animal.explotacio,
            animales: []
          };
        }
        explotacionesMap[animal.explotacio].animales = [...explotacionesMap[animal.explotacio].animales || [], animal];
      });
      const explotacionesDataArray = Object.values(explotacionesMap).map((exp) => {
        const animales = exp.animales || [];
        const toros = animales.filter((a) => a.genere === "M").length;
        const vacas = animales.filter((a) => a.genere === "F").length;
        const toros_activos = animales.filter((a) => a.genere === "M" && a.estado === "OK").length;
        const vacas_activas = animales.filter((a) => a.genere === "F" && a.estado === "OK").length;
        const vacasAletar1 = animales.filter((a) => a.genere === "F" && ["1", 1].includes(a.alletar)).length;
        const vacasAletar2 = animales.filter((a) => a.genere === "F" && ["2", 2].includes(a.alletar)).length;
        const amamantando = vacasAletar1 + vacasAletar2;
        const noAmamantando = animales.filter((a) => a.genere === "F" && (["0", 0].includes(a.alletar) || a.alletar === null)).length;
        let partosAprox = 0;
        const terneros = vacasAletar1 + vacasAletar2 * 2;
        const total_animales_activos = toros_activos + vacas_activas + terneros;
        return {
          explotacio: exp.explotacio,
          total: animales.length,
          total_animales_activos,
          toros,
          toros_activos,
          vacas,
          vacas_activas,
          amamantando,
          noAmamantando,
          terneros,
          partos: partosAprox
        };
      });
      const updatedExplotacionesData = await Promise.all(explotacionesDataArray.map(async (exp) => {
        try {
          const dashboardEndpoint = `dashboard/explotacions/${encodeURIComponent(exp.explotacio)}`;
          console.log(`Solicitando detalles de explotación: ${dashboardEndpoint}`);
          const explotacionData = await apiService.get(dashboardEndpoint);
          console.log(`Datos recibidos para explotación ${exp.explotacio}:`, explotacionData);
          const statsEndpoint = `dashboard/explotacions/${encodeURIComponent(exp.explotacio)}/stats`;
          console.log(`Solicitando estadísticas: ${statsEndpoint}`);
          const statsData = await apiService.get(statsEndpoint);
          console.log(`Estadísticas recibidas para ${exp.explotacio}:`, statsData);
          let updatedExp = { ...exp };
          if (explotacionData && explotacionData.total_partos !== void 0) {
            updatedExp = {
              ...updatedExp,
              partos: explotacionData.total_partos
            };
          }
          const animales = statsData.animales || {};
          const partos = statsData.partos || {};
          updatedExp = {
            ...updatedExp,
            toros: animales.toros || updatedExp.toros,
            toros_activos: animales.toros_activos || updatedExp.toros_activos,
            vacas: animales.vacas || updatedExp.vacas,
            vacas_activas: animales.vacas_activas || updatedExp.vacas_activas,
            total_animales_activos: updatedExp.total_animales_activos,
            terneros: animales.terneros || updatedExp.terneros,
            amamantando: animales.vacas_amamantando || updatedExp.amamantando,
            noAmamantando: animales.vacas_no_amamantando || updatedExp.noAmamantando,
            partos: partos.total || updatedExp.partos
          };
          return updatedExp;
        } catch (error2) {
          console.error(`Error al obtener información para ${exp.explotacio}:`, error2);
          console.error(`Error detallado: ${error2.message}`);
          if (error2.response) {
            console.error(`Status: ${error2.response.status}, Data:`, error2.response.data);
          }
          return exp;
        }
      }));
      updatedExplotacionesData.sort((a, b) => a.explotacio.localeCompare(b.explotacio));
      setExplotacionesData(updatedExplotacionesData);
      setLoading(false);
    } catch (error2) {
      console.error("Error al cargar datos iniciales de explotaciones:", error2);
      console.error("Detalle del error:", error2.stack || "No hay stack disponible");
      setLoading(false);
      setError(error2.message);
    }
  };
  const handleSearch = () => {
    console.log(`Buscando: "${searchTerm}"`);
    if (!searchTerm.trim()) {
      return;
    }
    const filteredExplotaciones = explotacionesData.filter(
      (exp) => exp.explotacio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredExplotaciones.length === 0) {
      alert("No se encontraron explotaciones que coincidan con tu búsqueda.");
    } else if (filteredExplotaciones.length === 1) {
      showExplotacionDetail(filteredExplotaciones[0].explotacio);
    } else {
    }
  };
  const handleClear = () => {
    setSearchTerm("");
  };
  const showExplotacionDetail = async (explotacionCode) => {
    if (!explotacionCode) return;
    setCurrentExplotacion(explotacionCode);
    setLoading(true);
    setError(null);
    try {
      const endpoint = `animals/?explotacio=${encodeURIComponent(explotacionCode)}&limit=100`;
      console.log(`Solicitando animales de explotación (con límite 100): ${endpoint}`);
      const response = await apiService.get(endpoint);
      console.log(`Respuesta recibida para animales de ${explotacionCode}:`, response);
      if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
        throw new Error("Formato de respuesta incorrecto");
      }
      const animals = response.data.items;
      console.log(`Encontrados ${animals.length} animales para la explotación ${explotacionCode}`);
      const toros = animals.filter((a) => a.genere === "M").length;
      const vacas = animals.filter((a) => a.genere === "F").length;
      const newStats = {
        toros,
        vacas,
        terneros: 0
        // TODO: Calcular terneros correctamente
      };
      setAllAnimals(animals);
      setFilteredAnimals(animals);
      setStats(newStats);
      setActiveCategory("todos");
      const detailView = document.getElementById("explotacion-detail");
      const cardsView = document.getElementById("explotacionCards");
      if (detailView) detailView.style.display = "block";
      if (cardsView) cardsView.style.display = "none";
      const titleElement = document.getElementById("explotacion-code");
      if (titleElement) titleElement.textContent = explotacionCode;
      setLoading(false);
    } catch (error2) {
      console.error("Error al cargar detalle de explotación:", error2);
      setLoading(false);
      setError(error2.message);
    }
  };
  const handleBack = () => {
    const detailView = document.getElementById("explotacion-detail");
    const cardsView = document.getElementById("explotacionCards");
    if (detailView) detailView.style.display = "none";
    if (cardsView) cardsView.style.display = "grid";
    setCurrentExplotacion(null);
  };
  const filterAnimalsByCategory = (category) => {
    if (!allAnimals.length) return;
    let filtered = [];
    switch (category) {
      case "todos":
        filtered = [...allAnimals];
        break;
      case "toros":
        filtered = allAnimals.filter((animal) => animal.genere === "M");
        break;
      case "vacas-amam":
        filtered = allAnimals.filter(
          (animal) => animal.genere === "F" && ["1", 1, "2", 2].includes(animal.alletar)
        );
        break;
      case "vacas-no-amam":
        filtered = allAnimals.filter(
          (animal) => animal.genere === "F" && (["0", 0].includes(animal.alletar) || animal.alletar === null)
        );
        break;
      case "terneros":
        filtered = [];
        break;
      default:
        filtered = [...allAnimals];
    }
    setFilteredAnimals(filtered);
    setActiveCategory(category);
  };
  const renderAnimalTable = () => {
    if (!filteredAnimals || filteredAnimals.length === 0) {
      return /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center items-center h-[200px]", children: /* @__PURE__ */ jsxDEV("p", { className: "text-gray-500 dark:text-gray-400", children: currentLang === "ca" ? "No hi ha animals per mostrar en aquesta categoria" : "No hay animales que mostrar en esta categoría" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 460,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 459,
        columnNumber: 9
      }, this);
    }
    return /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full text-sm text-left border-collapse", children: [
      /* @__PURE__ */ jsxDEV("thead", { className: "text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300", children: /* @__PURE__ */ jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Codi" : "Código" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 472,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Nom" : "Nombre" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 473,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Gènere" : "Género" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 474,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Estat" : "Estado" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 475,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Data Naixement" : "Fecha Nacimiento" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 476,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Alletant" : "Amamantando" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 477,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Accions" : "Acciones" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 478,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 471,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 470,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("tbody", { children: filteredAnimals.map((animal) => /* @__PURE__ */ jsxDEV("tr", { className: "border-b dark:border-gray-700", children: [
        /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-2", children: animal.cod || "-" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 484,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-2 font-medium", children: animal.nom }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 485,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-2", children: animal.genere === "M" ? currentLang === "ca" ? "Toro" : "Toro" : currentLang === "ca" ? "Vaca" : "Vaca" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 486,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxDEV("span", { className: `px-2 py-1 rounded-full text-xs ${animal.estado === "OK" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`, children: animal.estado === "OK" ? currentLang === "ca" ? "Actiu" : "Activo" : currentLang === "ca" ? "Mort" : "Fallecido" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 488,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 487,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-2", children: animal.dob || (currentLang === "ca" ? "No disponible" : "No disponible") }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 495,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-2", children: animal.genere === "F" ? animal.alletar === "1" ? currentLang === "ca" ? "1 vedell" : "1 ternero" : animal.alletar === "2" ? currentLang === "ca" ? "2 vedells" : "2 terneros" : currentLang === "ca" ? "Sense alletar" : "No amamantando" : "N/A" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 496,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxDEV("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxDEV(
            "a",
            {
              href: `/animals/${animal.id}`,
              className: "inline-flex items-center px-2 py-1 bg-primary text-white rounded hover:bg-primary/80",
              children: [
                /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                  /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" }, void 0, false, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                    lineNumber: 510,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" }, void 0, false, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                    lineNumber: 511,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 509,
                  columnNumber: 23
                }, this),
                currentLang === "ca" ? "Veure" : "Ver"
              ]
            },
            void 0,
            true,
            {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 505,
              columnNumber: 21
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "a",
            {
              href: `/animals/update/${animal.id}`,
              className: "inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700",
              children: [
                /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }, void 0, false, {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 520,
                  columnNumber: 25
                }, this) }, void 0, false, {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 519,
                  columnNumber: 23
                }, this),
                currentLang === "ca" ? "Actualitzar" : "Actualizar"
              ]
            },
            void 0,
            true,
            {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 515,
              columnNumber: 21
            },
            this
          )
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 504,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 503,
          columnNumber: 17
        }, this)
      ] }, animal.id, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 483,
        columnNumber: 15
      }, this)) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 481,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 469,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 468,
      columnNumber: 7
    }, this);
  };
  const exportToPDF = async () => {
    if (!filteredAnimals || !filteredAnimals.length) return;
    try {
      const jsPDFModule = await import("/node_modules/.vite/deps/jspdf.js?v=5e89932e");
      const jsPDF = jsPDFModule.default;
      const autoTableModule = await import('/node_modules/.vite/deps/jspdf-autotable.js?v=5e89932e').then(m => ((m) => m?.__esModule ? m : { ...typeof m === "object" && !Array.isArray(m) || typeof m === "function" ? m : {}, default: m })(m.default));
      const autoTable = autoTableModule.default;
      const doc = new jsPDF();
      const title = currentLang === "ca" ? `Llistat d'Animals - ${currentExplotacion}` : `Listado de Animales - ${currentExplotacion}`;
      const columns = [
        currentLang === "ca" ? "Codi" : "Código",
        currentLang === "ca" ? "Nom" : "Nombre",
        currentLang === "ca" ? "Gènere" : "Género",
        currentLang === "ca" ? "Estat" : "Estado",
        currentLang === "ca" ? "Data Naixement" : "Fecha Nacimiento",
        currentLang === "ca" ? "Alletant" : "Amamantando"
      ];
      const sortedAnimals = [...filteredAnimals].sort((a, b) => {
        if (a.estado !== b.estado) {
          return a.estado === "OK" ? -1 : 1;
        }
        if (a.genere !== b.genere) {
          return a.genere === "M" ? -1 : 1;
        }
        if (a.genere === "F") {
          const aAlletar = a.alletar ? Number(a.alletar) : 0;
          const bAlletar = b.alletar ? Number(b.alletar) : 0;
          if (aAlletar !== bAlletar) {
            return bAlletar - aAlletar;
          }
        }
        return a.nom.localeCompare(b.nom);
      });
      const data = sortedAnimals.map((animal) => {
        let codigo = "N/A";
        if (animal.cod && animal.cod !== "") {
          codigo = animal.cod;
        } else if (animal.id) {
          codigo = animal.id.toString();
        }
        let fechaNacimiento = "N/A";
        if (animal.dob) {
          try {
            let fecha;
            if (typeof animal.dob === "string" && animal.dob.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
              fechaNacimiento = animal.dob;
            } else {
              fecha = new Date(animal.dob);
              if (!isNaN(fecha.getTime())) {
                const dia = fecha.getDate().toString().padStart(2, "0");
                const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
                const anio = fecha.getFullYear();
                fechaNacimiento = `${dia}/${mes}/${anio}`;
              } else {
                fechaNacimiento = typeof animal.dob === "string" ? animal.dob : "N/A";
              }
            }
          } catch (e) {
            fechaNacimiento = typeof animal.dob === "string" ? animal.dob : "N/A";
          }
        }
        return [
          codigo,
          animal.nom,
          animal.genere === "M" ? currentLang === "ca" ? "Toro" : "Toro" : currentLang === "ca" ? "Vaca" : "Vaca",
          animal.estado === "OK" ? currentLang === "ca" ? "Actiu" : "Activo" : currentLang === "ca" ? "Mort" : "Fallecido",
          fechaNacimiento,
          animal.genere === "F" ? ["1", 1].includes(animal.alletar) ? currentLang === "ca" ? "1 vedell" : "1 ternero" : ["2", 2].includes(animal.alletar) ? currentLang === "ca" ? "2 vedells" : "2 terneros" : "N/A" : "N/A"
        ];
      });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const date = (/* @__PURE__ */ new Date()).toLocaleDateString(currentLang === "ca" ? "ca-ES" : "es-ES");
      doc.text(
        currentLang === "ca" ? `Data: ${date}` : `Fecha: ${date}`,
        195,
        15,
        { align: "right" }
      );
      const logoY = 10;
      const logoHeight = 35;
      let resumenStartY = logoY + logoHeight + 20;
      try {
        const logoUrl = "/images/logo_masclet.png";
        const logoWidth = 45;
        let logoHeight2 = 35;
        const pageWidth = doc.internal.pageSize.getWidth();
        const logoX = pageWidth / 2 - logoWidth / 2;
        const logoY2 = 10;
        doc.addImage(logoUrl, "PNG", logoX, logoY2, logoWidth, logoHeight2);
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text(title, pageWidth / 2, logoY2 + logoHeight2 + 5, { align: "center" });
        resumenStartY = logoY2 + logoHeight2 + 20;
      } catch (error2) {
        console.error("Error al cargar el logo:", error2);
        doc.setDrawColor(0);
        doc.setFillColor(126, 211, 33);
        const logoX = 30;
        const logoY2 = 25;
        const logoSize = 15;
        doc.roundedRect(logoX - logoSize / 2, logoY2 - logoSize / 2, logoSize, logoSize, 2, 2, "F");
        doc.setDrawColor(255);
        doc.setTextColor(255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("M", logoX - 5, logoY2 + 5, { align: "center" });
      }
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      const totalAnimales = filteredAnimals.length;
      const animalesActivos = filteredAnimals.filter((a) => a.estado === "OK").length;
      const torosActivos = filteredAnimals.filter((a) => a.genere === "M" && a.estado === "OK").length;
      const vacasActivas = filteredAnimals.filter((a) => a.genere === "F" && a.estado === "OK").length;
      const terneros = filteredAnimals.filter(
        (a) => a.genere === "F" && ["1", 1, "2", 2].includes(a.alletar)
      ).reduce((total, animal) => {
        const alletar = String(animal.alletar);
        return total + (alletar === "1" ? 1 : alletar === "2" ? 2 : 0);
      }, 0);
      const amamantando = filteredAnimals.filter(
        (a) => a.genere === "F" && ["1", 1, "2", 2].includes(a.alletar)
      ).length;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(30, resumenStartY, 150, 13, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(11);
      doc.text(currentLang === "ca" ? "Total Animals" : "Total Animales", 65, resumenStartY + 5, { align: "center" });
      doc.text(currentLang === "ca" ? "Animals Actius" : "Animales Activos", 145, resumenStartY + 5, { align: "center" });
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);
      doc.text(totalAnimales.toString(), 65, resumenStartY + 10, { align: "center" });
      doc.setTextColor(34, 139, 34);
      doc.text(animalesActivos.toString(), 145, resumenStartY + 10, { align: "center" });
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(30, resumenStartY + 15, 150, 13, 2, 2, "F");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(currentLang === "ca" ? "Toros Actius" : "Toros Activos", 55, resumenStartY + 20, { align: "center" });
      doc.text(currentLang === "ca" ? "Vaques Actives" : "Vacas Activas", 105, resumenStartY + 20, { align: "center" });
      doc.text(currentLang === "ca" ? "Vedells" : "Terneros", 155, resumenStartY + 20, { align: "center" });
      doc.setTextColor(51, 102, 204);
      doc.text(torosActivos.toString(), 55, resumenStartY + 25, { align: "center" });
      doc.setTextColor(233, 30, 99);
      doc.text(vacasActivas.toString(), 105, resumenStartY + 25, { align: "center" });
      doc.setTextColor(255, 152, 0);
      doc.text(terneros.toString(), 155, resumenStartY + 25, { align: "center" });
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(30, resumenStartY + 30, 70, 13, 2, 2, "F");
      doc.setTextColor(80, 80, 80);
      doc.text(currentLang === "ca" ? "Alletant" : "Amamantando", 45, resumenStartY + 35, { align: "center" });
      doc.setTextColor(3, 169, 244);
      doc.text(amamantando.toString(), 75, resumenStartY + 35, { align: "center" });
      autoTable(doc, {
        head: [columns],
        body: data,
        startY: resumenStartY + 50,
        // Ajustamos el inicio de la tabla para dejar espacio al resumen
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: {
          fillColor: [126, 211, 33],
          // Color verde lima corporativo
          textColor: 255,
          fontStyle: "bold"
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          0: { cellWidth: 20 },
          // ID
          1: { cellWidth: 40 },
          // Nombre
          2: { cellWidth: 25 },
          // Género
          3: { cellWidth: 30 },
          // Estado
          4: { cellWidth: 35 },
          // Fecha Nacimiento
          5: { cellWidth: 40 }
          // Amamantando
        },
        margin: { top: 70 }
      });
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          "Masclet Imperi - " + (currentLang === "ca" ? "Sistema de Gestió Ramadera" : "Sistema de Gestión Ganadera"),
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          currentLang === "ca" ? `Pàgina ${i} de ${pageCount}` : `Página ${i} de ${pageCount}`,
          195,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
      }
      const fileName = `animales_${currentExplotacion || "todas"}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } catch (error2) {
      console.error("Error al generar PDF:", error2);
      alert(currentLang === "ca" ? "Error en generar el PDF" : "Error al generar el PDF");
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "w-full py-6", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mb-3 sm:mb-4", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3", children: currentLang === "ca" ? "Cerca i Filtres" : "Búsqueda y Filtros" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 831,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4", children: currentLang === "ca" ? "Utilitza els filtres per trobar explotacions específiques. Pots cercar per codi d'explotació." : "Utiliza los filtros para encontrar explotaciones específicas. Puedes buscar por código de explotación." }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 834,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 830,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxDEV("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: currentLang === "ca" ? "Cercar" : "Buscar" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
            lineNumber: 845,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "text",
                id: "search-explotacion",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                placeholder: currentLang === "ca" ? "Cercar per codi d'explotació..." : "Buscar por código de explotación...",
                className: "w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              },
              void 0,
              false,
              {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                lineNumber: 849,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none", children: /* @__PURE__ */ jsxDEV("svg", { className: "w-4 h-4 text-gray-500 dark:text-gray-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 859,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 858,
              columnNumber: 17
            }, this) }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 857,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
            lineNumber: 848,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 844,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleSearch,
              className: "btn btn-primary",
              children: currentLang === "ca" ? "Cercar" : "Buscar"
            },
            void 0,
            false,
            {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 866,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleClear,
              className: "btn btn-secondary",
              children: currentLang === "ca" ? "Netejar" : "Limpiar"
            },
            void 0,
            false,
            {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 872,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 865,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
        lineNumber: 843,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 829,
      columnNumber: 7
    }, this),
    loading && /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center items-center py-10", children: /* @__PURE__ */ jsxDEV("div", { className: "spinner" }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 885,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 884,
      columnNumber: 9
    }, this),
    error && /* @__PURE__ */ jsxDEV("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4", children: /* @__PURE__ */ jsxDEV("p", { children: error }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 892,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 891,
      columnNumber: 9
    }, this),
    !loading && !error && /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          id: "explotacionCards",
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6",
          style: { display: currentExplotacion ? "none" : "grid" },
          children: displayExplotaciones.map((exp) => /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: "explotacion-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-full border border-gray-100 mb-4",
              onClick: () => showExplotacionDetail(exp.explotacio),
              children: [
                /* @__PURE__ */ jsxDEV("div", { className: "card-header bg-primary text-white p-3", children: /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold text-center", children: exp.explotacio }, void 0, false, {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 913,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 912,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "card-body p-4", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 mb-4 pb-3 border-b border-gray-100", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-label font-bold text-gray-700 mb-2", children: currentLang === "ca" ? "Total Animals" : "Total Animales" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 922,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-value total font-bold text-2xl text-primary-dark", children: (exp.toros || 0) + (exp.vacas || 0) + (exp.terneros || 0) }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 923,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 921,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-label font-bold text-gray-700 mb-2", children: currentLang === "ca" ? "Animals Actius" : "Animales Activos" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 929,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-value total font-bold text-2xl text-green-600", children: ((exp.toros_activos !== void 0 ? exp.toros_activos : exp.toros) || 0) + ((exp.vacas_activas !== void 0 ? exp.vacas_activas : exp.vacas) || 0) + (exp.terneros || 0) }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 930,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 928,
                      columnNumber: 21
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                    lineNumber: 919,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "animal-stats grid grid-cols-3 gap-1 text-center mb-3", children: [
                    /* @__PURE__ */ jsxDEV("div", { children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Toros Actius" : "Toros Activos" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 942,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-value toros font-bold text-primary", children: exp.toros_activos !== void 0 ? exp.toros_activos : exp.toros || 0 }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 943,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 941,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Vaques Actives" : "Vacas Activas" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 948,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-value vacas font-bold text-pink-500", children: exp.vacas_activas !== void 0 ? exp.vacas_activas : exp.vacas || 0 }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 949,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 947,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Vedells" : "Terneros" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 954,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-value terneros font-bold text-orange-500", children: exp.terneros || 0 }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 955,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 953,
                      columnNumber: 21
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                    lineNumber: 940,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "card-footer grid grid-cols-3 gap-1 text-center pt-2 border-t border-gray-100", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Alletant" : "Amamantando" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 962,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "font-bold text-blue-600", children: exp.amamantando || 0 }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 963,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 961,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "col-span-2 text-center flex flex-col justify-center items-center", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "stat-label font-medium", children: " " }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 966,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { children: /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          className: "details-link text-green-600 font-medium hover:text-green-700 transition-colors",
                          onClick: (e) => {
                            e.stopPropagation();
                            showExplotacionDetail(exp.explotacio);
                          },
                          children: [
                            currentLang === "ca" ? "Veure detalls" : "Ver detalles",
                            " →"
                          ]
                        },
                        void 0,
                        true,
                        {
                          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                          lineNumber: 968,
                          columnNumber: 25
                        },
                        this
                      ) }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 967,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 965,
                      columnNumber: 21
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                    lineNumber: 960,
                    columnNumber: 19
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 917,
                  columnNumber: 17
                }, this)
              ]
            },
            exp.explotacio,
            true,
            {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 906,
              columnNumber: 15
            },
            this
          ))
        },
        void 0,
        false,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 900,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          id: "explotacion-detail",
          className: "hidden mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4",
          style: { display: currentExplotacion ? "block" : "none" },
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-4 text-lg font-medium", children: [
              /* @__PURE__ */ jsxDEV("h3", { className: "text-gray-900 dark:text-white", children: [
                currentLang === "ca" ? "Animals de" : "Animales de",
                " ",
                /* @__PURE__ */ jsxDEV("span", { id: "explotacion-code", children: currentExplotacion }, void 0, false, {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 993,
                  columnNumber: 71
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                lineNumber: 992,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    id: "export-csv",
                    className: "btn btn-primary text-sm flex items-center",
                    onClick: exportToPDF,
                    children: [
                      /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 1003,
                        columnNumber: 21
                      }, this) }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 1002,
                        columnNumber: 19
                      }, this),
                      currentLang === "ca" ? "Exportar PDF" : "Exportar PDF"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                    lineNumber: 997,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    id: "back-button",
                    className: "btn btn-secondary text-sm flex items-center",
                    onClick: handleBack,
                    children: [
                      /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 17l-5-5m0 0l5-5m-5 5h12" }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 1014,
                        columnNumber: 21
                      }, this) }, void 0, false, {
                        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                        lineNumber: 1013,
                        columnNumber: 19
                      }, this),
                      currentLang === "ca" ? "Tornar" : "Volver"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                    lineNumber: 1008,
                    columnNumber: 17
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                lineNumber: 996,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 991,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("ul", { className: "flex flex-wrap -mb-px text-sm font-medium text-center", children: [
              /* @__PURE__ */ jsxDEV("li", { className: "mr-2", children: /* @__PURE__ */ jsxDEV(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "todos" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "todos",
                  onClick: () => filterAnimalsByCategory("todos"),
                  children: [
                    currentLang === "ca" ? "Tots els animals" : "Todos los animales",
                    " ",
                    /* @__PURE__ */ jsxDEV("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: allAnimals.length }, void 0, false, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 1029,
                      columnNumber: 86
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 1024,
                  columnNumber: 17
                },
                this
              ) }, void 0, false, {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                lineNumber: 1023,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("li", { className: "mr-2", children: /* @__PURE__ */ jsxDEV(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "toros" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "toros",
                  onClick: () => filterAnimalsByCategory("toros"),
                  children: [
                    currentLang === "ca" ? "Toros" : "Toros",
                    " ",
                    /* @__PURE__ */ jsxDEV("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: stats.toros }, void 0, false, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 1039,
                      columnNumber: 62
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 1034,
                  columnNumber: 17
                },
                this
              ) }, void 0, false, {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                lineNumber: 1033,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("li", { className: "mr-2", children: /* @__PURE__ */ jsxDEV(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "vacas-amam" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "vacas-amam",
                  onClick: () => filterAnimalsByCategory("vacas-amam"),
                  children: [
                    currentLang === "ca" ? "Vaques alletant" : "Vacas amamantando",
                    " ",
                    /* @__PURE__ */ jsxDEV("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: allAnimals.filter((a) => a.genere === "F" && ["1", 1, "2", 2].includes(a.alletar)).length }, void 0, false, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 1049,
                      columnNumber: 84
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 1044,
                  columnNumber: 17
                },
                this
              ) }, void 0, false, {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                lineNumber: 1043,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("li", { className: "mr-2", children: /* @__PURE__ */ jsxDEV(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "vacas-no-amam" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "vacas-no-amam",
                  onClick: () => filterAnimalsByCategory("vacas-no-amam"),
                  children: [
                    currentLang === "ca" ? "Vaques sense alletar" : "Vacas no amamantando",
                    " ",
                    /* @__PURE__ */ jsxDEV("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: allAnimals.filter((a) => a.genere === "F" && (["0", 0].includes(a.alletar) || a.alletar === null)).length }, void 0, false, {
                      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                      lineNumber: 1059,
                      columnNumber: 92
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                  lineNumber: 1054,
                  columnNumber: 17
                },
                this
              ) }, void 0, false, {
                fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
                lineNumber: 1053,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 1022,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "mt-4", children: renderAnimalTable() }, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
              lineNumber: 1065,
              columnNumber: 13
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
          lineNumber: 986,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
      lineNumber: 898,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage.tsx",
    lineNumber: 827,
    columnNumber: 5
  }, this);
};
export default ExplotacionesPage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkV4cGxvdGFjaW9uZXNQYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0Jztcbi8vIE1hbnRlbmVtb3Mgc29sbyBsYSBpbXBvcnRhY2nDs24gbmVjZXNhcmlhIHNpbiBDU1MgYWRpY2lvbmFsXG5pbXBvcnQgYXBpU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hcGlTZXJ2aWNlJztcbmltcG9ydCB7IHQgfSBmcm9tICcuLi8uLi9pMThuL2NvbmZpZyc7XG5cbi8vIFRpcG9zIHBhcmEgbG9zIGRhdG9zXG5pbnRlcmZhY2UgRXhwbG90YWNpb25JbmZvIHtcbiAgZXhwbG90YWNpbzogc3RyaW5nO1xuICB0b3RhbF9hbmltYWxlcz86IG51bWJlcjtcbiAgdG90YWxfYW5pbWFsZXNfYWN0aXZvcz86IG51bWJlcjtcbiAgdG9yb3M/OiBudW1iZXI7XG4gIHRvcm9zX2FjdGl2b3M/OiBudW1iZXI7XG4gIHZhY2FzPzogbnVtYmVyO1xuICB2YWNhc19hY3RpdmFzPzogbnVtYmVyO1xuICBhbGxldGFyXzA/OiBudW1iZXI7XG4gIGFsbGV0YXJfMT86IG51bWJlcjtcbiAgYWxsZXRhcl8yPzogbnVtYmVyO1xuICBhbGxldGFyXzBfYWN0aXZhcz86IG51bWJlcjtcbiAgYWxsZXRhcl8xX2FjdGl2YXM/OiBudW1iZXI7XG4gIGFsbGV0YXJfMl9hY3RpdmFzPzogbnVtYmVyO1xuICBwYXJ0b3M/OiBudW1iZXI7XG4gIHJhdGlvPzogbnVtYmVyIHwgc3RyaW5nO1xuICBhbWFtYW50YW5kbz86IG51bWJlcjtcbiAgbm9BbWFtYW50YW5kbz86IG51bWJlcjtcbiAgdGVybmVyb3M/OiBudW1iZXI7XG4gIHRvdGFsPzogbnVtYmVyO1xuICBhbmltYWxlcz86IGFueVtdO1xufVxuXG5pbnRlcmZhY2UgQW5pbWFsIHtcbiAgaWQ6IG51bWJlcjtcbiAgbm9tOiBzdHJpbmc7XG4gIGV4cGxvdGFjaW86IHN0cmluZztcbiAgZ2VuZXJlOiAnTScgfCAnRic7XG4gIGVzdGFkbzogJ09LJyB8ICdERUYnO1xuICBhbGxldGFyPzogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbDtcbiAgZG9iPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmNvbnN0IEV4cGxvdGFjaW9uZXNQYWdlOiBSZWFjdC5GQyA9ICgpID0+IHtcbiAgLy8gRXN0YWRvIHBhcmEgZWwgaWRpb21hIGFjdHVhbFxuICBjb25zdCBbY3VycmVudExhbmcsIHNldEN1cnJlbnRMYW5nXSA9IHVzZVN0YXRlKCdlcycpO1xuXG4gIC8vIEVmZWN0ZSBwYXJhIG9idGVuZXIgeSBtYW5lamFyIGVsIGlkaW9tYVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIE9idGVuZXIgZWwgaWRpb21hIGluaWNpYWxcbiAgICBjb25zdCBzdG9yZWRMYW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJMYW5ndWFnZScpIHx8ICdlcyc7XG4gICAgc2V0Q3VycmVudExhbmcoc3RvcmVkTGFuZyk7XG5cbiAgICAvLyBFc2N1Y2hhciBjYW1iaW9zIGRlIGlkaW9tYVxuICAgIGNvbnN0IGhhbmRsZUxhbmdDaGFuZ2UgPSAoZTogU3RvcmFnZUV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICd1c2VyTGFuZ3VhZ2UnKSB7XG4gICAgICAgIHNldEN1cnJlbnRMYW5nKGUubmV3VmFsdWUgfHwgJ2VzJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgaGFuZGxlTGFuZ0NoYW5nZSk7XG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgaGFuZGxlTGFuZ0NoYW5nZSk7XG4gIH0sIFtdKTtcblxuICAvLyBFc3RhZG9zXG4gIGNvbnN0IFtleHBsb3RhY2lvbmVzRGF0YSwgc2V0RXhwbG90YWNpb25lc0RhdGFdID0gdXNlU3RhdGU8RXhwbG90YWNpb25JbmZvW10+KFtdKTtcbiAgY29uc3QgW2Rpc3BsYXlFeHBsb3RhY2lvbmVzLCBzZXREaXNwbGF5RXhwbG90YWNpb25lc10gPSB1c2VTdGF0ZTxFeHBsb3RhY2lvbkluZm9bXT4oW10pO1xuICBjb25zdCBbc2VhcmNoVGVybSwgc2V0U2VhcmNoVGVybV0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbY3VycmVudEV4cGxvdGFjaW9uLCBzZXRDdXJyZW50RXhwbG90YWNpb25dID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFthbGxBbmltYWxzLCBzZXRBbGxBbmltYWxzXSA9IHVzZVN0YXRlPEFuaW1hbFtdPihbXSk7XG4gIGNvbnN0IFtmaWx0ZXJlZEFuaW1hbHMsIHNldEZpbHRlcmVkQW5pbWFsc10gPSB1c2VTdGF0ZTxBbmltYWxbXT4oW10pO1xuICBjb25zdCBbYWN0aXZlQ2F0ZWdvcnksIHNldEFjdGl2ZUNhdGVnb3J5XSA9IHVzZVN0YXRlKCd0b2RvcycpO1xuICBjb25zdCBbc3RhdHMsIHNldFN0YXRzXSA9IHVzZVN0YXRlKHtcbiAgICB0b3JvczogMCxcbiAgICB2YWNhczogMCxcbiAgICB0ZXJuZXJvczogMFxuICB9KTtcbiAgXG4gIC8vIEVzdGFkbyBwYXJhIGRldGVjdGFyIHNpIGVzdGFtb3MgZW4gdmlzdGEgbcOzdmlsXG4gIGNvbnN0IFtpc01vYmlsZVZpZXcsIHNldElzTW9iaWxlVmlld10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIC8vIEVzdGFkb3MgcGFyYSBvcmRlbmFjacOzblxuICBjb25zdCBbc29ydEZpZWxkLCBzZXRTb3J0RmllbGRdID0gdXNlU3RhdGU8J2V4cGxvdGFjaW8nIHwgJ3RvdGFsJz4oJ2V4cGxvdGFjaW8nKTtcbiAgY29uc3QgW3NvcnREaXJlY3Rpb24sIHNldFNvcnREaXJlY3Rpb25dID0gdXNlU3RhdGU8J2FzYycgfCAnZGVzYyc+KCdhc2MnKTtcblxuICAvLyBDYXJnYXIgZGF0b3MgaW5pY2lhbGVzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbG9hZEluaXRpYWxEYXRhKCk7XG4gIH0sIFtdKTtcbiAgXG4gIC8vIEVmZWN0byBwYXJhIGRldGVjdGFyIGVsIGFuY2hvIGRlIGxhIHBhbnRhbGxhIHkgb3JkZW5hciBjb3JyZWN0YW1lbnRlIGVuIG3Ds3ZpbFxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrU2NyZWVuV2lkdGggPSAoKSA9PiB7XG4gICAgICBjb25zdCBpc01vYmlsZSA9IHdpbmRvdy5pbm5lcldpZHRoIDwgNjQwOyAvLyBzbSBicmVha3BvaW50IGVuIFRhaWx3aW5kIGVzIDY0MHB4XG4gICAgICBzZXRJc01vYmlsZVZpZXcoaXNNb2JpbGUpO1xuICAgIH07XG4gICAgXG4gICAgLy8gRWplY3V0YXIgYWwgbW9udGFyIGVsIGNvbXBvbmVudGVcbiAgICBjaGVja1NjcmVlbldpZHRoKCk7XG4gICAgXG4gICAgLy8gRXNjdWNoYXIgY2FtYmlvcyBlbiBlbCB0YW1hw7FvIGRlIGxhIHZlbnRhbmFcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgY2hlY2tTY3JlZW5XaWR0aCk7XG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBjaGVja1NjcmVlbldpZHRoKTtcbiAgfSwgW10pO1xuICBcbiAgLy8gRWZlY3RvIHBhcmEgb3JkZW5hciBjb3JyZWN0YW1lbnRlIGVuIG3Ds3ZpbFxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIEVuIG3Ds3ZpbCwgb3JkZW5hciBwb3IgdG90YWwgZGUgYW5pbWFsZXMgKG1heW9yIGEgbWVub3IpXG4gICAgaWYgKGlzTW9iaWxlVmlldyAmJiAoc29ydEZpZWxkICE9PSAndG90YWwnIHx8IHNvcnREaXJlY3Rpb24gIT09ICdkZXNjJykpIHtcbiAgICAgIHNldFNvcnRGaWVsZCgndG90YWwnKTtcbiAgICAgIHNldFNvcnREaXJlY3Rpb24oJ2Rlc2MnKTtcbiAgICB9XG4gIH0sIFtpc01vYmlsZVZpZXcsIHNvcnRGaWVsZCwgc29ydERpcmVjdGlvbl0pO1xuICBcbiAgLy8gRnVuY2nDs24gcGFyYSBvcmRlbmFyIGxhcyBleHBsb3RhY2lvbmVzXG4gIGNvbnN0IHNvcnRFeHBsb3RhY2lvbmVzID0gKGV4cGxvdGFjaW9uZXM6IEV4cGxvdGFjaW9uSW5mb1tdKSA9PiB7XG4gICAgaWYgKCFleHBsb3RhY2lvbmVzKSByZXR1cm4gW107XG4gICAgXG4gICAgLy8gRW4gbcOzdmlsLCBzaWVtcHJlIG9yZGVuYXIgcG9yIGNhbnRpZGFkIGRlIGFuaW1hbGVzIChtYXlvciBhIG1lbm9yKVxuICAgIGlmIChpc01vYmlsZVZpZXcpIHtcbiAgICAgIHJldHVybiBbLi4uZXhwbG90YWNpb25lc10uc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCBhVG90YWwgPSBhLnRvdGFsIHx8IDA7XG4gICAgICAgIGNvbnN0IGJUb3RhbCA9IGIudG90YWwgfHwgMDtcbiAgICAgICAgcmV0dXJuIGJUb3RhbCAtIGFUb3RhbDsgLy8gT3JkZW4gZGVzY2VuZGVudGUgcG9yIHRvdGFsIGVuIG3Ds3ZpbFxuICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVuIGRlc2t0b3AsIHNlZ3VpciBlbCBjcml0ZXJpbyBkZSBvcmRlbmFjacOzbiBlbGVnaWRvXG4gICAgcmV0dXJuIFsuLi5leHBsb3RhY2lvbmVzXS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoc29ydEZpZWxkID09PSAnZXhwbG90YWNpbycpIHtcbiAgICAgICAgcmV0dXJuIHNvcnREaXJlY3Rpb24gPT09ICdhc2MnIFxuICAgICAgICAgID8gYS5leHBsb3RhY2lvLmxvY2FsZUNvbXBhcmUoYi5leHBsb3RhY2lvKVxuICAgICAgICAgIDogYi5leHBsb3RhY2lvLmxvY2FsZUNvbXBhcmUoYS5leHBsb3RhY2lvKTtcbiAgICAgIH0gZWxzZSBpZiAoc29ydEZpZWxkID09PSAndG90YWwnKSB7XG4gICAgICAgIGNvbnN0IGFUb3RhbCA9IGEudG90YWwgfHwgMDtcbiAgICAgICAgY29uc3QgYlRvdGFsID0gYi50b3RhbCB8fCAwO1xuICAgICAgICByZXR1cm4gc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyBhVG90YWwgLSBiVG90YWwgOiBiVG90YWwgLSBhVG90YWw7XG4gICAgICB9XG4gICAgICByZXR1cm4gYS5leHBsb3RhY2lvLmxvY2FsZUNvbXBhcmUoYi5leHBsb3RhY2lvKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBFZmVjdG8gcGFyYSBvcmRlbmFyIHkgZmlsdHJhciBleHBsb3RhY2lvbmVzIGN1YW5kbyBjYW1iaWFuIGxvcyBkYXRvcywgbG9zIGNyaXRlcmlvcyBkZSBvcmRlbmFjacOzbiBvIGxhIHZpc3RhXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFleHBsb3RhY2lvbmVzRGF0YS5sZW5ndGgpIHJldHVybjtcbiAgICBcbiAgICBsZXQgZGF0YVRvRGlzcGxheSA9IHNvcnRFeHBsb3RhY2lvbmVzKGV4cGxvdGFjaW9uZXNEYXRhKTtcbiAgICBcbiAgICAvLyBBcGxpY2FyIGZpbHRybyBkZSBiw7pzcXVlZGEgc2kgZXhpc3RlXG4gICAgaWYgKHNlYXJjaFRlcm0udHJpbSgpICE9PSAnJykge1xuICAgICAgZGF0YVRvRGlzcGxheSA9IGRhdGFUb0Rpc3BsYXkuZmlsdGVyKGV4cCA9PiBcbiAgICAgICAgZXhwLmV4cGxvdGFjaW8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpXG4gICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBBY3R1YWxpemFyIGxhcyBleHBsb3RhY2lvbmVzIGEgbW9zdHJhclxuICAgIHNldERpc3BsYXlFeHBsb3RhY2lvbmVzKGRhdGFUb0Rpc3BsYXkpO1xuICB9LCBbZXhwbG90YWNpb25lc0RhdGEsIHNlYXJjaFRlcm0sIGlzTW9iaWxlVmlldywgc29ydEZpZWxkLCBzb3J0RGlyZWN0aW9uXSk7XG5cbiAgLy8gRmlsdHJhciBhbmltYWxlcyBwb3IgY2F0ZWdvcsOtYSBjdWFuZG8gY2FtYmlhIGxhIGNhdGVnb3LDrWEgYWN0aXZhIG8gbGEgbGlzdGEgZGUgYW5pbWFsZXNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWxsQW5pbWFscy5sZW5ndGggPiAwKSB7XG4gICAgICBmaWx0ZXJBbmltYWxzQnlDYXRlZ29yeShhY3RpdmVDYXRlZ29yeSk7XG4gICAgfVxuICB9LCBbYWN0aXZlQ2F0ZWdvcnksIGFsbEFuaW1hbHNdKTtcblxuICAvLyBGdW5jacOzbiBwYXJhIGNhcmdhciBsb3MgZGF0b3MgaW5pY2lhbGVzXG4gIGNvbnN0IGxvYWRJbml0aWFsRGF0YSA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjIElOSUNJTyBDQVJHQSBERSBEQVRPUyBERSBFWFBMT1RBQ0lPTkVTIChSRUFDVCkgIyMjIyMjIyMnKTtcbiAgICAgIGNvbnNvbGUubG9nKGBVc2FuZG8gQVBJIFVSTDogJHthcGlTZXJ2aWNlLmdldEJhc2VVcmwoKX1gKTtcbiAgICAgIFxuICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgXG4gICAgICAvLyBPYnRlbmVyIHRvZG9zIGxvcyBhbmltYWxlcyBkZWwgYmFja2VuZCBjb24gdW4gbMOtbWl0ZSByYXpvbmFibGVcbiAgICAgIGNvbnNvbGUubG9nKCdSZWFsaXphbmRvIHBldGljacOzbiBHRVQgYSBhbmltYWxzLz9wYWdlPTEmbGltaXQ9MTAwJyk7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaVNlcnZpY2UuZ2V0KCdhbmltYWxzLz9wYWdlPTEmbGltaXQ9MTAwJyk7XG4gICAgICBjb25zb2xlLmxvZygnUmVzcHVlc3RhIHJlY2liaWRhIGRlIGFuaW1hbHM6JywgcmVzcG9uc2UpO1xuICAgICAgXG4gICAgICAvLyBWZXJpZmljYXIgbGEgZXN0cnVjdHVyYSBkZSBsYSByZXNwdWVzdGFcbiAgICAgIGlmICghcmVzcG9uc2UuZGF0YSB8fCAhcmVzcG9uc2UuZGF0YS5pdGVtcyB8fCAhQXJyYXkuaXNBcnJheShyZXNwb25zZS5kYXRhLml0ZW1zKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Zvcm1hdG8gZGUgcmVzcHVlc3RhIGluY29ycmVjdG8nKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgYWxsQW5pbWFscyA9IHJlc3BvbnNlLmRhdGEuaXRlbXM7XG4gICAgICBjb25zb2xlLmxvZyhgT2J0ZW5pZG9zICR7YWxsQW5pbWFscy5sZW5ndGh9IGFuaW1hbGVzYCk7XG4gICAgICBcbiAgICAgIC8vIEFncnVwYXIgYW5pbWFsZXMgcG9yIGV4cGxvdGFjacOzblxuICAgICAgY29uc3QgZXhwbG90YWNpb25lc01hcDogUmVjb3JkPHN0cmluZywgRXhwbG90YWNpb25JbmZvPiA9IHt9O1xuICAgICAgXG4gICAgICBhbGxBbmltYWxzLmZvckVhY2goKGFuaW1hbDogQW5pbWFsKSA9PiB7XG4gICAgICAgIGlmICghYW5pbWFsLmV4cGxvdGFjaW8pIHJldHVybjsgLy8gSWdub3JhciBhbmltYWxlcyBzaW4gZXhwbG90YWNpw7NuXG4gICAgICAgIFxuICAgICAgICAvLyBTaSBsYSBleHBsb3RhY2nDs24gbm8gZXhpc3RlIGVuIGVsIG1hcGEsIGxhIGHDsWFkaW1vc1xuICAgICAgICBpZiAoIWV4cGxvdGFjaW9uZXNNYXBbYW5pbWFsLmV4cGxvdGFjaW9dKSB7XG4gICAgICAgICAgZXhwbG90YWNpb25lc01hcFthbmltYWwuZXhwbG90YWNpb10gPSB7XG4gICAgICAgICAgICBleHBsb3RhY2lvOiBhbmltYWwuZXhwbG90YWNpbyxcbiAgICAgICAgICAgIGFuaW1hbGVzOiBbXVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEHDsWFkaXIgYW5pbWFsIGEgbGEgZXhwbG90YWNpw7NuXG4gICAgICAgIGV4cGxvdGFjaW9uZXNNYXBbYW5pbWFsLmV4cGxvdGFjaW9dLmFuaW1hbGVzID0gXG4gICAgICAgICAgWy4uLihleHBsb3RhY2lvbmVzTWFwW2FuaW1hbC5leHBsb3RhY2lvXS5hbmltYWxlcyB8fCBbXSksIGFuaW1hbF07XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgLy8gQ2FsY3VsYXIgZXN0YWTDrXN0aWNhcyBwYXJhIGNhZGEgZXhwbG90YWNpw7NuXG4gICAgICBjb25zdCBleHBsb3RhY2lvbmVzRGF0YUFycmF5ID0gT2JqZWN0LnZhbHVlcyhleHBsb3RhY2lvbmVzTWFwKS5tYXAoKGV4cDogRXhwbG90YWNpb25JbmZvKSA9PiB7XG4gICAgICAgIGNvbnN0IGFuaW1hbGVzID0gZXhwLmFuaW1hbGVzIHx8IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8gVG90YWwgZGUgYW5pbWFsZXMgcG9yIGfDqW5lcm9cbiAgICAgICAgY29uc3QgdG9yb3MgPSBhbmltYWxlcy5maWx0ZXIoKGE6IEFuaW1hbCkgPT4gYS5nZW5lcmUgPT09ICdNJykubGVuZ3RoO1xuICAgICAgICBjb25zdCB2YWNhcyA9IGFuaW1hbGVzLmZpbHRlcigoYTogQW5pbWFsKSA9PiBhLmdlbmVyZSA9PT0gJ0YnKS5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICAvLyBBbmltYWxlcyBhY3Rpdm9zIChlc3RhZG89T0spXG4gICAgICAgIGNvbnN0IHRvcm9zX2FjdGl2b3MgPSBhbmltYWxlcy5maWx0ZXIoKGE6IEFuaW1hbCkgPT4gYS5nZW5lcmUgPT09ICdNJyAmJiBhLmVzdGFkbyA9PT0gJ09LJykubGVuZ3RoO1xuICAgICAgICBjb25zdCB2YWNhc19hY3RpdmFzID0gYW5pbWFsZXMuZmlsdGVyKChhOiBBbmltYWwpID0+IGEuZ2VuZXJlID09PSAnRicgJiYgYS5lc3RhZG8gPT09ICdPSycpLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbnRhciBsYXMgdmFjYXMgYW1hbWFudGFuZG8gKGFsbGV0YXIgMSBvIDIpXG4gICAgICAgIGNvbnN0IHZhY2FzQWxldGFyMSA9IGFuaW1hbGVzLmZpbHRlcigoYTogQW5pbWFsKSA9PiBhLmdlbmVyZSA9PT0gJ0YnICYmIFsnMScsIDFdLmluY2x1ZGVzKGEuYWxsZXRhciBhcyBhbnkpKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHZhY2FzQWxldGFyMiA9IGFuaW1hbGVzLmZpbHRlcigoYTogQW5pbWFsKSA9PiBhLmdlbmVyZSA9PT0gJ0YnICYmIFsnMicsIDJdLmluY2x1ZGVzKGEuYWxsZXRhciBhcyBhbnkpKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGFtYW1hbnRhbmRvID0gdmFjYXNBbGV0YXIxICsgdmFjYXNBbGV0YXIyO1xuICAgICAgICBcbiAgICAgICAgLy8gVmFjYXMgcXVlIG5vIGVzdMOhbiBhbWFtYW50YW5kbyAoYWxsZXRhciAwIG8gbnVsbClcbiAgICAgICAgY29uc3Qgbm9BbWFtYW50YW5kbyA9IGFuaW1hbGVzLmZpbHRlcigoYTogQW5pbWFsKSA9PiBhLmdlbmVyZSA9PT0gJ0YnICYmIChbJzAnLCAwXS5pbmNsdWRlcyhhLmFsbGV0YXIgYXMgYW55KSB8fCBhLmFsbGV0YXIgPT09IG51bGwpKS5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICAvLyBJbmljaWFsaXphciBwYXJ0b3MgY29uIDAsIGx1ZWdvIHNlIGFjdHVhbGl6YXLDoVxuICAgICAgICBsZXQgcGFydG9zQXByb3ggPSAwO1xuICAgICAgICBcbiAgICAgICAgLy8gQ8OhbGN1bG8gY29ycmVjdG8gZGUgdGVybmVyb3M6IGNhZGEgdmFjYSBjb24gYWxsZXRhcj0xIGFtYW1hbnRhIDEgdGVybmVybyB5IGNhZGEgdmFjYSBjb24gYWxsZXRhcj0yIGFtYW1hbnRhIDIgdGVybmVyb3NcbiAgICAgICAgY29uc3QgdGVybmVyb3MgPSB2YWNhc0FsZXRhcjEgKyAodmFjYXNBbGV0YXIyICogMik7XG4gICAgICAgIFxuICAgICAgICAvLyBUb3RhbCBkZSBhbmltYWxlcyBhY3Rpdm9zXG4gICAgICAgIGNvbnN0IHRvdGFsX2FuaW1hbGVzX2FjdGl2b3MgPSB0b3Jvc19hY3Rpdm9zICsgdmFjYXNfYWN0aXZhcyArIHRlcm5lcm9zO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBleHBsb3RhY2lvOiBleHAuZXhwbG90YWNpbyxcbiAgICAgICAgICB0b3RhbDogYW5pbWFsZXMubGVuZ3RoLFxuICAgICAgICAgIHRvdGFsX2FuaW1hbGVzX2FjdGl2b3M6IHRvdGFsX2FuaW1hbGVzX2FjdGl2b3MsXG4gICAgICAgICAgdG9yb3M6IHRvcm9zLFxuICAgICAgICAgIHRvcm9zX2FjdGl2b3M6IHRvcm9zX2FjdGl2b3MsXG4gICAgICAgICAgdmFjYXM6IHZhY2FzLFxuICAgICAgICAgIHZhY2FzX2FjdGl2YXM6IHZhY2FzX2FjdGl2YXMsXG4gICAgICAgICAgYW1hbWFudGFuZG86IGFtYW1hbnRhbmRvLFxuICAgICAgICAgIG5vQW1hbWFudGFuZG86IG5vQW1hbWFudGFuZG8sXG4gICAgICAgICAgdGVybmVyb3M6IHRlcm5lcm9zLFxuICAgICAgICAgIHBhcnRvczogcGFydG9zQXByb3hcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBPYnRlbmVyIGVsIGNvbnRlbyBjb3JyZWN0byBkZSBwYXJ0b3MgcGFyYSBjYWRhIGV4cGxvdGFjacOzblxuICAgICAgY29uc3QgdXBkYXRlZEV4cGxvdGFjaW9uZXNEYXRhID0gYXdhaXQgUHJvbWlzZS5hbGwoZXhwbG90YWNpb25lc0RhdGFBcnJheS5tYXAoYXN5bmMgKGV4cCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIE9idGVuZXIgZGV0YWxsZXMgZGUgbGEgZXhwbG90YWNpw7NuIHVzYW5kbyBsYSBBUEkgZGVsIGRhc2hib2FyZFxuICAgICAgICAgIGNvbnN0IGRhc2hib2FyZEVuZHBvaW50ID0gYGRhc2hib2FyZC9leHBsb3RhY2lvbnMvJHtlbmNvZGVVUklDb21wb25lbnQoZXhwLmV4cGxvdGFjaW8pfWA7XG4gICAgICAgICAgY29uc29sZS5sb2coYFNvbGljaXRhbmRvIGRldGFsbGVzIGRlIGV4cGxvdGFjacOzbjogJHtkYXNoYm9hcmRFbmRwb2ludH1gKTtcbiAgICAgICAgICBjb25zdCBleHBsb3RhY2lvbkRhdGEgPSBhd2FpdCBhcGlTZXJ2aWNlLmdldChkYXNoYm9hcmRFbmRwb2ludCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYERhdG9zIHJlY2liaWRvcyBwYXJhIGV4cGxvdGFjacOzbiAke2V4cC5leHBsb3RhY2lvfTpgLCBleHBsb3RhY2lvbkRhdGEpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIE9idGVuZXIgZXN0YWTDrXN0aWNhcyBkZXRhbGxhZGFzIGRlIGxhIGV4cGxvdGFjacOzblxuICAgICAgICAgIGNvbnN0IHN0YXRzRW5kcG9pbnQgPSBgZGFzaGJvYXJkL2V4cGxvdGFjaW9ucy8ke2VuY29kZVVSSUNvbXBvbmVudChleHAuZXhwbG90YWNpbyl9L3N0YXRzYDtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgU29saWNpdGFuZG8gZXN0YWTDrXN0aWNhczogJHtzdGF0c0VuZHBvaW50fWApO1xuICAgICAgICAgIGNvbnN0IHN0YXRzRGF0YSA9IGF3YWl0IGFwaVNlcnZpY2UuZ2V0KHN0YXRzRW5kcG9pbnQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBFc3RhZMOtc3RpY2FzIHJlY2liaWRhcyBwYXJhICR7ZXhwLmV4cGxvdGFjaW99OmAsIHN0YXRzRGF0YSk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gSW5pY2lhbGl6YXIgb2JqZXRvIGNvbiBkYXRvcyBhY3R1YWxpemFkb3NcbiAgICAgICAgICBsZXQgdXBkYXRlZEV4cCA9IHsuLi5leHB9O1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEFjdHVhbGl6YXIgZWwgY29udGVvIGRlIHBhcnRvcyBjb24gZWwgdmFsb3IgY29ycmVjdG8gZGUgbGEgQVBJXG4gICAgICAgICAgaWYgKGV4cGxvdGFjaW9uRGF0YSAmJiBleHBsb3RhY2lvbkRhdGEudG90YWxfcGFydG9zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHVwZGF0ZWRFeHAgPSB7XG4gICAgICAgICAgICAgIC4uLnVwZGF0ZWRFeHAsXG4gICAgICAgICAgICAgIHBhcnRvczogZXhwbG90YWNpb25EYXRhLnRvdGFsX3BhcnRvc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gRXh0cmFlciBkYXRvcyBkZXRhbGxhZG9zIGRlIGVzdGFkw61zdGljYXNcbiAgICAgICAgICBjb25zdCBhbmltYWxlcyA9IHN0YXRzRGF0YS5hbmltYWxlcyB8fCB7fTtcbiAgICAgICAgICBjb25zdCBwYXJ0b3MgPSBzdGF0c0RhdGEucGFydG9zIHx8IHt9O1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEFjdHVhbGl6YXIgY29uIGxvcyBkYXRvcyBlc3RhZMOtc3RpY29zIGNvbXBsZXRvc1xuICAgICAgICAgIHVwZGF0ZWRFeHAgPSB7XG4gICAgICAgICAgICAuLi51cGRhdGVkRXhwLFxuICAgICAgICAgICAgdG9yb3M6IGFuaW1hbGVzLnRvcm9zIHx8IHVwZGF0ZWRFeHAudG9yb3MsXG4gICAgICAgICAgICB0b3Jvc19hY3Rpdm9zOiBhbmltYWxlcy50b3Jvc19hY3Rpdm9zIHx8IHVwZGF0ZWRFeHAudG9yb3NfYWN0aXZvcyxcbiAgICAgICAgICAgIHZhY2FzOiBhbmltYWxlcy52YWNhcyB8fCB1cGRhdGVkRXhwLnZhY2FzLFxuICAgICAgICAgICAgdmFjYXNfYWN0aXZhczogYW5pbWFsZXMudmFjYXNfYWN0aXZhcyB8fCB1cGRhdGVkRXhwLnZhY2FzX2FjdGl2YXMsXG4gICAgICAgICAgICB0b3RhbF9hbmltYWxlc19hY3Rpdm9zOiB1cGRhdGVkRXhwLnRvdGFsX2FuaW1hbGVzX2FjdGl2b3MsXG4gICAgICAgICAgICB0ZXJuZXJvczogYW5pbWFsZXMudGVybmVyb3MgfHwgdXBkYXRlZEV4cC50ZXJuZXJvcyxcbiAgICAgICAgICAgIGFtYW1hbnRhbmRvOiBhbmltYWxlcy52YWNhc19hbWFtYW50YW5kbyB8fCB1cGRhdGVkRXhwLmFtYW1hbnRhbmRvLFxuICAgICAgICAgICAgbm9BbWFtYW50YW5kbzogYW5pbWFsZXMudmFjYXNfbm9fYW1hbWFudGFuZG8gfHwgdXBkYXRlZEV4cC5ub0FtYW1hbnRhbmRvLFxuICAgICAgICAgICAgcGFydG9zOiBwYXJ0b3MudG90YWwgfHwgdXBkYXRlZEV4cC5wYXJ0b3NcbiAgICAgICAgICB9O1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIERldm9sdmVyIGxhIGV4cGxvdGFjacOzbiBjb24gdG9kb3MgbG9zIGRhdG9zIGFjdHVhbGl6YWRvc1xuICAgICAgICAgIHJldHVybiB1cGRhdGVkRXhwO1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgYWwgb2J0ZW5lciBpbmZvcm1hY2nDs24gcGFyYSAke2V4cC5leHBsb3RhY2lvfTpgLCBlcnJvcik7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgZGV0YWxsYWRvOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBTdGF0dXM6ICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgRGF0YTpgLCBlcnJvci5yZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gU2kgaGF5IHVuIGVycm9yLCBkZXZvbHZlciBsb3MgZGF0b3Mgb3JpZ2luYWxlc1xuICAgICAgICAgIHJldHVybiBleHA7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgLy8gT3JkZW5hciBwb3Igbm9tYnJlIGRlIGV4cGxvdGFjacOzblxuICAgICAgdXBkYXRlZEV4cGxvdGFjaW9uZXNEYXRhLnNvcnQoKGEsIGIpID0+IGEuZXhwbG90YWNpby5sb2NhbGVDb21wYXJlKGIuZXhwbG90YWNpbykpO1xuICAgICAgXG4gICAgICAvLyBBY3R1YWxpemFyIGVsIGVzdGFkb1xuICAgICAgc2V0RXhwbG90YWNpb25lc0RhdGEodXBkYXRlZEV4cGxvdGFjaW9uZXNEYXRhKTtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGNhcmdhciBkYXRvcyBpbmljaWFsZXMgZGUgZXhwbG90YWNpb25lczonLCBlcnJvcik7XG4gICAgICBjb25zb2xlLmVycm9yKCdEZXRhbGxlIGRlbCBlcnJvcjonLCBlcnJvci5zdGFjayB8fCAnTm8gaGF5IHN0YWNrIGRpc3BvbmlibGUnKTtcbiAgICAgIFxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICBzZXRFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRnVuY2nDs24gcGFyYSBidXNjYXIgZXhwbG90YWNpb25lcyBwb3IgdMOpcm1pbm9cbiAgY29uc3QgaGFuZGxlU2VhcmNoID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBCdXNjYW5kbzogXCIke3NlYXJjaFRlcm19XCJgKTtcbiAgICAvLyBTaSBlbCBjYW1wbyBlc3TDoSB2YWPDrW8sIG1vc3RyYXIgdG9kYXNcbiAgICBpZiAoIXNlYXJjaFRlcm0udHJpbSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIC8vIEZpbHRyYXIgZXhwbG90YWNpb25lcyBxdWUgY29udGllbmVuIGVsIHTDqXJtaW5vIGRlIGLDunNxdWVkYVxuICAgIGNvbnN0IGZpbHRlcmVkRXhwbG90YWNpb25lcyA9IGV4cGxvdGFjaW9uZXNEYXRhLmZpbHRlcihleHAgPT4gXG4gICAgICBleHAuZXhwbG90YWNpby50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSlcbiAgICApO1xuICAgIFxuICAgIGlmIChmaWx0ZXJlZEV4cGxvdGFjaW9uZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBhbGVydCgnTm8gc2UgZW5jb250cmFyb24gZXhwbG90YWNpb25lcyBxdWUgY29pbmNpZGFuIGNvbiB0dSBiw7pzcXVlZGEuJyk7XG4gICAgfSBlbHNlIGlmIChmaWx0ZXJlZEV4cGxvdGFjaW9uZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBTaSBzb2xvIGhheSB1bmEgY29pbmNpZGVuY2lhLCBtb3N0cmFyIGRpcmVjdGFtZW50ZSBsb3MgZGV0YWxsZXNcbiAgICAgIHNob3dFeHBsb3RhY2lvbkRldGFpbChmaWx0ZXJlZEV4cGxvdGFjaW9uZXNbMF0uZXhwbG90YWNpbyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE86IEFjdHVhbGl6YXIgbGEgdmlzdGEgcGFyYSBtb3N0cmFyIHNvbG8gbGFzIGV4cGxvdGFjaW9uZXMgZmlsdHJhZGFzXG4gICAgfVxuICB9O1xuXG4gIC8vIEZ1bmNpw7NuIHBhcmEgbGltcGlhciBiw7pzcXVlZGFcbiAgY29uc3QgaGFuZGxlQ2xlYXIgPSAoKSA9PiB7XG4gICAgc2V0U2VhcmNoVGVybSgnJyk7XG4gICAgLy8gVE9ETzogQWN0dWFsaXphciBsYSB2aXN0YSBwYXJhIG1vc3RyYXIgdG9kYXMgbGFzIGV4cGxvdGFjaW9uZXNcbiAgfTtcblxuICAvLyBGdW5jacOzbiBwYXJhIG1vc3RyYXIgZGV0YWxsZXMgZGUgdW5hIGV4cGxvdGFjacOzblxuICBjb25zdCBzaG93RXhwbG90YWNpb25EZXRhaWwgPSBhc3luYyAoZXhwbG90YWNpb25Db2RlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoIWV4cGxvdGFjaW9uQ29kZSkgcmV0dXJuO1xuICAgIFxuICAgIHNldEN1cnJlbnRFeHBsb3RhY2lvbihleHBsb3RhY2lvbkNvZGUpO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgc2V0RXJyb3IobnVsbCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIE9idGVuZXIgZGF0b3MgZGUgbG9zIGFuaW1hbGVzIGRlIGVzdGEgZXhwbG90YWNpw7NuXG4gICAgICBjb25zdCBlbmRwb2ludCA9IGBhbmltYWxzLz9leHBsb3RhY2lvPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGV4cGxvdGFjaW9uQ29kZSl9JmxpbWl0PTEwMGA7XG4gICAgICBjb25zb2xlLmxvZyhgU29saWNpdGFuZG8gYW5pbWFsZXMgZGUgZXhwbG90YWNpw7NuIChjb24gbMOtbWl0ZSAxMDApOiAke2VuZHBvaW50fWApO1xuICAgICAgXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaVNlcnZpY2UuZ2V0KGVuZHBvaW50KTtcbiAgICAgIGNvbnNvbGUubG9nKGBSZXNwdWVzdGEgcmVjaWJpZGEgcGFyYSBhbmltYWxlcyBkZSAke2V4cGxvdGFjaW9uQ29kZX06YCwgcmVzcG9uc2UpO1xuICAgICAgXG4gICAgICAvLyBWZXJpZmljYXIgbGEgZXN0cnVjdHVyYSBkZSBsYSByZXNwdWVzdGFcbiAgICAgIGlmICghcmVzcG9uc2UuZGF0YSB8fCAhcmVzcG9uc2UuZGF0YS5pdGVtcyB8fCAhQXJyYXkuaXNBcnJheShyZXNwb25zZS5kYXRhLml0ZW1zKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Zvcm1hdG8gZGUgcmVzcHVlc3RhIGluY29ycmVjdG8nKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgYW5pbWFscyA9IHJlc3BvbnNlLmRhdGEuaXRlbXM7XG4gICAgICBjb25zb2xlLmxvZyhgRW5jb250cmFkb3MgJHthbmltYWxzLmxlbmd0aH0gYW5pbWFsZXMgcGFyYSBsYSBleHBsb3RhY2nDs24gJHtleHBsb3RhY2lvbkNvZGV9YCk7XG4gICAgICBcbiAgICAgIC8vIENhbGN1bGFyIGVzdGFkw61zdGljYXNcbiAgICAgIGNvbnN0IHRvcm9zID0gYW5pbWFscy5maWx0ZXIoKGE6IEFuaW1hbCkgPT4gYS5nZW5lcmUgPT09ICdNJykubGVuZ3RoO1xuICAgICAgY29uc3QgdmFjYXMgPSBhbmltYWxzLmZpbHRlcigoYTogQW5pbWFsKSA9PiBhLmdlbmVyZSA9PT0gJ0YnKS5sZW5ndGg7XG4gICAgICBjb25zdCBuZXdTdGF0cyA9IHtcbiAgICAgICAgdG9yb3M6IHRvcm9zLFxuICAgICAgICB2YWNhczogdmFjYXMsXG4gICAgICAgIHRlcm5lcm9zOiAwIC8vIFRPRE86IENhbGN1bGFyIHRlcm5lcm9zIGNvcnJlY3RhbWVudGVcbiAgICAgIH07XG4gICAgICBcbiAgICAgIHNldEFsbEFuaW1hbHMoYW5pbWFscyk7XG4gICAgICBzZXRGaWx0ZXJlZEFuaW1hbHMoYW5pbWFscyk7IC8vIEluaWNpYWxtZW50ZSBtb3N0cmFyIHRvZG9zXG4gICAgICBzZXRTdGF0cyhuZXdTdGF0cyk7XG4gICAgICBzZXRBY3RpdmVDYXRlZ29yeSgndG9kb3MnKTtcbiAgICAgIFxuICAgICAgLy8gTW9zdHJhciBsYSB2aXN0YSBkZSBkZXRhbGxlc1xuICAgICAgY29uc3QgZGV0YWlsVmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBsb3RhY2lvbi1kZXRhaWwnKTtcbiAgICAgIGNvbnN0IGNhcmRzVmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBsb3RhY2lvbkNhcmRzJyk7XG4gICAgICBcbiAgICAgIGlmIChkZXRhaWxWaWV3KSBkZXRhaWxWaWV3LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgaWYgKGNhcmRzVmlldykgY2FyZHNWaWV3LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBcbiAgICAgIC8vIEFjdHVhbGl6YXIgZWwgdMOtdHVsb1xuICAgICAgY29uc3QgdGl0bGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cGxvdGFjaW9uLWNvZGUnKTtcbiAgICAgIGlmICh0aXRsZUVsZW1lbnQpIHRpdGxlRWxlbWVudC50ZXh0Q29udGVudCA9IGV4cGxvdGFjaW9uQ29kZTtcbiAgICAgIFxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgY2FyZ2FyIGRldGFsbGUgZGUgZXhwbG90YWNpw7NuOicsIGVycm9yKTtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgc2V0RXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIEZ1bmNpw7NuIHBhcmEgdm9sdmVyIGEgbGEgdmlzdGEgZGUgdGFyamV0YXNcbiAgY29uc3QgaGFuZGxlQmFjayA9ICgpID0+IHtcbiAgICBjb25zdCBkZXRhaWxWaWV3ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cGxvdGFjaW9uLWRldGFpbCcpO1xuICAgIGNvbnN0IGNhcmRzVmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBsb3RhY2lvbkNhcmRzJyk7XG4gICAgXG4gICAgaWYgKGRldGFpbFZpZXcpIGRldGFpbFZpZXcuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAoY2FyZHNWaWV3KSBjYXJkc1ZpZXcuc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbiAgICBcbiAgICBzZXRDdXJyZW50RXhwbG90YWNpb24obnVsbCk7XG4gIH07XG5cbiAgLy8gRnVuY2nDs24gcGFyYSBmaWx0cmFyIGFuaW1hbGVzIHBvciBjYXRlZ29yw61hXG4gIGNvbnN0IGZpbHRlckFuaW1hbHNCeUNhdGVnb3J5ID0gKGNhdGVnb3J5OiBzdHJpbmcpID0+IHtcbiAgICBpZiAoIWFsbEFuaW1hbHMubGVuZ3RoKSByZXR1cm47XG4gICAgXG4gICAgbGV0IGZpbHRlcmVkOiBBbmltYWxbXSA9IFtdO1xuICAgIFxuICAgIHN3aXRjaCAoY2F0ZWdvcnkpIHtcbiAgICAgIGNhc2UgJ3RvZG9zJzpcbiAgICAgICAgZmlsdGVyZWQgPSBbLi4uYWxsQW5pbWFsc107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndG9yb3MnOlxuICAgICAgICBmaWx0ZXJlZCA9IGFsbEFuaW1hbHMuZmlsdGVyKGFuaW1hbCA9PiBhbmltYWwuZ2VuZXJlID09PSAnTScpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3ZhY2FzLWFtYW0nOlxuICAgICAgICBmaWx0ZXJlZCA9IGFsbEFuaW1hbHMuZmlsdGVyKGFuaW1hbCA9PiBcbiAgICAgICAgICBhbmltYWwuZ2VuZXJlID09PSAnRicgJiYgWycxJywgMSwgJzInLCAyXS5pbmNsdWRlcyhhbmltYWwuYWxsZXRhciBhcyBhbnkpXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndmFjYXMtbm8tYW1hbSc6XG4gICAgICAgIGZpbHRlcmVkID0gYWxsQW5pbWFscy5maWx0ZXIoYW5pbWFsID0+IFxuICAgICAgICAgIGFuaW1hbC5nZW5lcmUgPT09ICdGJyAmJiAoWycwJywgMF0uaW5jbHVkZXMoYW5pbWFsLmFsbGV0YXIgYXMgYW55KSB8fCBhbmltYWwuYWxsZXRhciA9PT0gbnVsbClcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0ZXJuZXJvcyc6XG4gICAgICAgIC8vIFRPRE86IEltcGxlbWVudGFyIGZpbHRybyBkZSB0ZXJuZXJvc1xuICAgICAgICBmaWx0ZXJlZCA9IFtdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGZpbHRlcmVkID0gWy4uLmFsbEFuaW1hbHNdO1xuICAgIH1cbiAgICBcbiAgICBzZXRGaWx0ZXJlZEFuaW1hbHMoZmlsdGVyZWQpO1xuICAgIHNldEFjdGl2ZUNhdGVnb3J5KGNhdGVnb3J5KTtcbiAgfTtcblxuICAvLyBSZW5kZXJpemFyIHRhYmxhIGRlIGFuaW1hbGVzXG4gIGNvbnN0IHJlbmRlckFuaW1hbFRhYmxlID0gKCkgPT4ge1xuICAgIC8vIFNpIG5vIGhheSBhbmltYWxlc1xuICAgIGlmICghZmlsdGVyZWRBbmltYWxzIHx8IGZpbHRlcmVkQW5pbWFscy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgaC1bMjAwcHhdXCI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cbiAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiTm8gaGkgaGEgYW5pbWFscyBwZXIgbW9zdHJhciBlbiBhcXVlc3RhIGNhdGVnb3JpYVwiIDogXCJObyBoYXkgYW5pbWFsZXMgcXVlIG1vc3RyYXIgZW4gZXN0YSBjYXRlZ29yw61hXCJ9XG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3ZlcmZsb3cteC1hdXRvXCI+XG4gICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ3LWZ1bGwgdGV4dC1zbSB0ZXh0LWxlZnQgYm9yZGVyLWNvbGxhcHNlXCI+XG4gICAgICAgICAgPHRoZWFkIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1ncmF5LTcwMCB1cHBlcmNhc2UgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDBcIj5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTQgcHktMlwiPntjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiQ29kaVwiIDogXCJDw7NkaWdvXCJ9PC90aD5cbiAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTQgcHktMlwiPntjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiTm9tXCIgOiBcIk5vbWJyZVwifTwvdGg+XG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC00IHB5LTJcIj57Y3VycmVudExhbmcgPT09ICdjYScgPyBcIkfDqG5lcmVcIiA6IFwiR8OpbmVyb1wifTwvdGg+XG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC00IHB5LTJcIj57Y3VycmVudExhbmcgPT09ICdjYScgPyBcIkVzdGF0XCIgOiBcIkVzdGFkb1wifTwvdGg+XG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC00IHB5LTJcIj57Y3VycmVudExhbmcgPT09ICdjYScgPyBcIkRhdGEgTmFpeGVtZW50XCIgOiBcIkZlY2hhIE5hY2ltaWVudG9cIn08L3RoPlxuICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicHgtNCBweS0yXCI+e2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJBbGxldGFudFwiIDogXCJBbWFtYW50YW5kb1wifTwvdGg+XG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC00IHB5LTJcIj57Y3VycmVudExhbmcgPT09ICdjYScgPyBcIkFjY2lvbnNcIiA6IFwiQWNjaW9uZXNcIn08L3RoPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgIHtmaWx0ZXJlZEFuaW1hbHMubWFwKChhbmltYWwpID0+IChcbiAgICAgICAgICAgICAgPHRyIGtleT17YW5pbWFsLmlkfSBjbGFzc05hbWU9XCJib3JkZXItYiBkYXJrOmJvcmRlci1ncmF5LTcwMFwiPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC00IHB5LTJcIj57YW5pbWFsLmNvZCB8fCAnLSd9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNCBweS0yIGZvbnQtbWVkaXVtXCI+e2FuaW1hbC5ub219PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNCBweS0yXCI+e2FuaW1hbC5nZW5lcmUgPT09ICdNJyA/IChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdUb3JvJyA6ICdUb3JvJykgOiAoY3VycmVudExhbmcgPT09ICdjYScgPyAnVmFjYScgOiAnVmFjYScpfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktMlwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgcHgtMiBweS0xIHJvdW5kZWQtZnVsbCB0ZXh0LXhzICR7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hbC5lc3RhZG8gPT09ICdPSycgPyAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGRhcms6YmctZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0yMDAnIDogXG4gICAgICAgICAgICAgICAgICAgICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBkYXJrOmJnLXJlZC05MDAgZGFyazp0ZXh0LXJlZC0yMDAnXG4gICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICAgIHthbmltYWwuZXN0YWRvID09PSAnT0snID8gKGN1cnJlbnRMYW5nID09PSAnY2EnID8gJ0FjdGl1JyA6ICdBY3Rpdm8nKSA6IChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdNb3J0JyA6ICdGYWxsZWNpZG8nKX1cbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC00IHB5LTJcIj57YW5pbWFsLmRvYiB8fCAoY3VycmVudExhbmcgPT09ICdjYScgPyAnTm8gZGlzcG9uaWJsZScgOiAnTm8gZGlzcG9uaWJsZScpfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktMlwiPlxuICAgICAgICAgICAgICAgICAge2FuaW1hbC5nZW5lcmUgPT09ICdGJyA/IChcbiAgICAgICAgICAgICAgICAgICAgYW5pbWFsLmFsbGV0YXIgPT09ICcxJyA/IChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICcxIHZlZGVsbCcgOiAnMSB0ZXJuZXJvJykgOiBcbiAgICAgICAgICAgICAgICAgICAgYW5pbWFsLmFsbGV0YXIgPT09ICcyJyA/IChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICcyIHZlZGVsbHMnIDogJzIgdGVybmVyb3MnKSA6IFxuICAgICAgICAgICAgICAgICAgICAoY3VycmVudExhbmcgPT09ICdjYScgPyAnU2Vuc2UgYWxsZXRhcicgOiAnTm8gYW1hbWFudGFuZG8nKVxuICAgICAgICAgICAgICAgICAgKSA6ICdOL0EnfVxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktMlwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IHNwYWNlLXgtMlwiPlxuICAgICAgICAgICAgICAgICAgICA8YSBcbiAgICAgICAgICAgICAgICAgICAgICBocmVmPXtgL2FuaW1hbHMvJHthbmltYWwuaWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgcHgtMiBweS0xIGJnLXByaW1hcnkgdGV4dC13aGl0ZSByb3VuZGVkIGhvdmVyOmJnLXByaW1hcnkvODBcIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3NOYW1lPVwiaC00IHctNCBtci0xXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlV2lkdGg9ezJ9IGQ9XCJNMTUgMTJhMyAzIDAgMTEtNiAwIDMgMyAwIDAxNiAwem0tMS04YTEgMSAwIDAwLTEgMXYzYTEgMSAwIDAwMiAwVjZhMSAxIDAgMDAtMS0xelwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlV2lkdGg9ezJ9IGQ9XCJNMi40NTggMTJDMy43MzIgNy45NDMgNy41MjMgNSAxMiA1YzQuNDc4IDAgOC4yNjggMi45NDMgOS41NDIgNy0xLjI3NCA0LjA1Ny01LjA2NCA3LTkuNTQyIDctNC40NzcgMC04LjI2OC0yLjk0My05LjU0Mi03elwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gJ1ZldXJlJyA6ICdWZXInfVxuICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgIDxhIFxuICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e2AvYW5pbWFscy91cGRhdGUvJHthbmltYWwuaWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgcHgtMiBweS0xIGJnLWJsdWUtNjAwIHRleHQtd2hpdGUgcm91bmRlZCBob3ZlcjpiZy1ibHVlLTcwMFwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzc05hbWU9XCJoLTQgdy00IG1yLTFcIiBmaWxsPVwibm9uZVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VXaWR0aD17Mn0gZD1cIk0xMSA1SDZhMiAyIDAgMDAtMiAydjExYTIgMiAwIDAwMiAyaDExYTIgMiAwIDAwMi0ydi01bS0xLjQxNC05LjQxNGEyIDIgMCAxMTIuODI4IDIuODI4TDExLjgyOCAxNUg5di0yLjgyOGw4LjU4Ni04LjU4NnpcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdBY3R1YWxpdHphcicgOiAnQWN0dWFsaXphcid9XG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfTtcbiAgLy8gRnVuY2nDs24gcGFyYSBleHBvcnRhciBhIFBERiBjb24gZm9ybWF0byBhdHJhY3Rpdm9cbiAgY29uc3QgZXhwb3J0VG9QREYgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFmaWx0ZXJlZEFuaW1hbHMgfHwgIWZpbHRlcmVkQW5pbWFscy5sZW5ndGgpIHJldHVybjtcbiAgICBcbiAgICB0cnkge1xuICAgICAgLy8gSW1wb3J0YWNpb25lcyBkaW7DoW1pY2FzIHBhcmEgZXZpdGFyIGVycm9yZXMgU1NSXG4gICAgICBjb25zdCBqc1BERk1vZHVsZSA9IGF3YWl0IGltcG9ydCgnanNwZGYnKTtcbiAgICAgIGNvbnN0IGpzUERGID0ganNQREZNb2R1bGUuZGVmYXVsdDtcbiAgICAgIFxuICAgICAgY29uc3QgYXV0b1RhYmxlTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdqc3BkZi1hdXRvdGFibGUnKTtcbiAgICAgIGNvbnN0IGF1dG9UYWJsZSA9IGF1dG9UYWJsZU1vZHVsZS5kZWZhdWx0O1xuICAgICAgXG4gICAgICAvLyBDcmVhciB1biBkb2N1bWVudG8gUERGIG51ZXZvXG4gICAgICBjb25zdCBkb2MgPSBuZXcganNQREYoKTtcbiAgICBcbiAgICAvLyBDb25maWd1cmFyIHTDrXR1bG9zIHkgZW5jYWJlemFkb3NcbiAgICBjb25zdCB0aXRsZSA9IGN1cnJlbnRMYW5nID09PSAnY2EnIFxuICAgICAgPyBgTGxpc3RhdCBkJ0FuaW1hbHMgLSAke2N1cnJlbnRFeHBsb3RhY2lvbn1gXG4gICAgICA6IGBMaXN0YWRvIGRlIEFuaW1hbGVzIC0gJHtjdXJyZW50RXhwbG90YWNpb259YDtcbiAgICBcbiAgICBjb25zdCBjb2x1bW5zID0gW1xuICAgICAgY3VycmVudExhbmcgPT09ICdjYScgPyAnQ29kaScgOiAnQ8OzZGlnbycsXG4gICAgICBjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdOb20nIDogJ05vbWJyZScsXG4gICAgICBjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdHw6huZXJlJyA6ICdHw6luZXJvJyxcbiAgICAgIGN1cnJlbnRMYW5nID09PSAnY2EnID8gJ0VzdGF0JyA6ICdFc3RhZG8nLFxuICAgICAgY3VycmVudExhbmcgPT09ICdjYScgPyAnRGF0YSBOYWl4ZW1lbnQnIDogJ0ZlY2hhIE5hY2ltaWVudG8nLFxuICAgICAgY3VycmVudExhbmcgPT09ICdjYScgPyAnQWxsZXRhbnQnIDogJ0FtYW1hbnRhbmRvJyxcbiAgICBdO1xuICAgIFxuICAgIC8vIE9yZGVuYXIgbG9zIGFuaW1hbGVzIHBvciBjYXRlZ29yw61hczpcbiAgICAvLyAxLiBBY3Rpdm9zIHByaW1lcm8gKHkgZGVudHJvIGRlIGFjdGl2b3M6IHRvcm9zLCB2YWNhcyBhbWFtYW50YW5kbywgdmFjYXMgbm8gYW1hbWFudGFuZG8pXG4gICAgLy8gMi4gRmFsbGVjaWRvcyBhbCBmaW5hbFxuICAgIGNvbnN0IHNvcnRlZEFuaW1hbHMgPSBbLi4uZmlsdGVyZWRBbmltYWxzXS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAvLyBQcmltZXJvIHBvciBlc3RhZG8gKGFjdGl2b3MgYW50ZXMgcXVlIGZhbGxlY2lkb3MpXG4gICAgICBpZiAoYS5lc3RhZG8gIT09IGIuZXN0YWRvKSB7XG4gICAgICAgIHJldHVybiBhLmVzdGFkbyA9PT0gJ09LJyA/IC0xIDogMTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gRGVudHJvIGRlIGNhZGEgZXN0YWRvLCBvcmRlbmFyIHBvciBnw6luZXJvICh0b3JvcyBwcmltZXJvKVxuICAgICAgaWYgKGEuZ2VuZXJlICE9PSBiLmdlbmVyZSkge1xuICAgICAgICByZXR1cm4gYS5nZW5lcmUgPT09ICdNJyA/IC0xIDogMTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gUGFyYSBsYXMgdmFjYXMgKEYpLCBvcmRlbmFyIHBvciBhbWFtYW50YW5kb1xuICAgICAgaWYgKGEuZ2VuZXJlID09PSAnRicpIHtcbiAgICAgICAgY29uc3QgYUFsbGV0YXIgPSBhLmFsbGV0YXIgPyBOdW1iZXIoYS5hbGxldGFyKSA6IDA7XG4gICAgICAgIGNvbnN0IGJBbGxldGFyID0gYi5hbGxldGFyID8gTnVtYmVyKGIuYWxsZXRhcikgOiAwO1xuICAgICAgICBpZiAoYUFsbGV0YXIgIT09IGJBbGxldGFyKSB7XG4gICAgICAgICAgcmV0dXJuIGJBbGxldGFyIC0gYUFsbGV0YXI7IC8vIExhcyBxdWUgYW1hbWFudGFuIG3DoXMgcHJpbWVyb1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNpIHRvZG8gbG8gZGVtw6FzIGVzIGlndWFsLCBvcmRlbmFyIHBvciBub21icmVcbiAgICAgIHJldHVybiBhLm5vbS5sb2NhbGVDb21wYXJlKGIubm9tKTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBQcmVwYXJhciBsb3MgZGF0b3MgZGUgYW5pbWFsZXMgY29uIG1hbmVqbyBhZGVjdWFkbyBkZSBmZWNoYXMgeSBjw7NkaWdvc1xuICAgIGNvbnN0IGRhdGEgPSBzb3J0ZWRBbmltYWxzLm1hcChhbmltYWwgPT4ge1xuICAgICAgLy8gUGFyYSBlbCBjw7NkaWdvLCB1c2FyIHByZWZlcmVudGVtZW50ZSBjb2QgKGNhbXBvIG9maWNpYWwpLCBsdWVnbyBpZFxuICAgICAgbGV0IGNvZGlnbyA9ICdOL0EnO1xuICAgICAgaWYgKGFuaW1hbC5jb2QgJiYgYW5pbWFsLmNvZCAhPT0gJycpIHtcbiAgICAgICAgY29kaWdvID0gYW5pbWFsLmNvZDtcbiAgICAgIH0gZWxzZSBpZiAoYW5pbWFsLmlkKSB7XG4gICAgICAgIGNvZGlnbyA9IGFuaW1hbC5pZC50b1N0cmluZygpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBQYXJhIGxhIGZlY2hhLCBhc2VndXJhcm5vcyBkZSBxdWUgZXN0w6kgZW4gZm9ybWF0byBlc3Bhw7FvbCBERC9NTS9BQUFBXG4gICAgICBsZXQgZmVjaGFOYWNpbWllbnRvID0gJ04vQSc7XG4gICAgICBpZiAoYW5pbWFsLmRvYikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIEludGVudGFyIGNvbnZlcnRpciBsYSBmZWNoYVxuICAgICAgICAgIGxldCBmZWNoYTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBQcmltZXJvIHZlciBzaSBlcyB1biBzdHJpbmcgY29uIGZvcm1hdG8geWEgYWRlY3VhZG8gKEREL01NL0FBQUEpXG4gICAgICAgICAgaWYgKHR5cGVvZiBhbmltYWwuZG9iID09PSAnc3RyaW5nJyAmJiBhbmltYWwuZG9iLm1hdGNoKC9eXFxkezEsMn1cXC9cXGR7MSwyfVxcL1xcZHs0fSQvKSkge1xuICAgICAgICAgICAgZmVjaGFOYWNpbWllbnRvID0gYW5pbWFsLmRvYjsgLy8gWWEgdGllbmUgZWwgZm9ybWF0byBjb3JyZWN0b1xuICAgICAgICAgIH0gXG4gICAgICAgICAgLy8gU2kgZXMgdW5hIGZlY2hhIElTTyBvIHNpbWlsYXIsIGNvbnZlcnRpcmxhIGFsIGZvcm1hdG8gZXNwYcOxb2xcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZlY2hhID0gbmV3IERhdGUoYW5pbWFsLmRvYik7XG4gICAgICAgICAgICBpZiAoIWlzTmFOKGZlY2hhLmdldFRpbWUoKSkpIHtcbiAgICAgICAgICAgICAgLy8gRm9ybWF0ZWFyIG1hbnVhbG1lbnRlIGFsIGZvcm1hdG8gREQvTU0vQUFBQVxuICAgICAgICAgICAgICBjb25zdCBkaWEgPSBmZWNoYS5nZXREYXRlKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgICBjb25zdCBtZXMgPSAoZmVjaGEuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgICAgY29uc3QgYW5pbyA9IGZlY2hhLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgIGZlY2hhTmFjaW1pZW50byA9IGAke2RpYX0vJHttZXN9LyR7YW5pb31gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gU2kgZWwgZm9ybWF0byBubyBlcyByZWNvbm9jaWJsZSwgbW9zdHJhcmxvIGNvbW8gZXN0w6FcbiAgICAgICAgICAgICAgZmVjaGFOYWNpbWllbnRvID0gdHlwZW9mIGFuaW1hbC5kb2IgPT09ICdzdHJpbmcnID8gYW5pbWFsLmRvYiA6ICdOL0EnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIFNpIGhheSBlcnJvciBhbCBjb252ZXJ0aXIsIG1vc3RyYW1vcyBlbCB2YWxvciBvcmlnaW5hbFxuICAgICAgICAgIGZlY2hhTmFjaW1pZW50byA9IHR5cGVvZiBhbmltYWwuZG9iID09PSAnc3RyaW5nJyA/IGFuaW1hbC5kb2IgOiAnTi9BJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gW1xuICAgICAgICBjb2RpZ28sXG4gICAgICAgIGFuaW1hbC5ub20sXG4gICAgICAgIGFuaW1hbC5nZW5lcmUgPT09ICdNJyBcbiAgICAgICAgICA/IChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdUb3JvJyA6ICdUb3JvJykgXG4gICAgICAgICAgOiAoY3VycmVudExhbmcgPT09ICdjYScgPyAnVmFjYScgOiAnVmFjYScpLFxuICAgICAgICBhbmltYWwuZXN0YWRvID09PSAnT0snIFxuICAgICAgICAgID8gKGN1cnJlbnRMYW5nID09PSAnY2EnID8gJ0FjdGl1JyA6ICdBY3Rpdm8nKSBcbiAgICAgICAgICA6IChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdNb3J0JyA6ICdGYWxsZWNpZG8nKSxcbiAgICAgICAgZmVjaGFOYWNpbWllbnRvLFxuICAgICAgICBhbmltYWwuZ2VuZXJlID09PSAnRicgXG4gICAgICAgICAgPyAoWycxJywgMV0uaW5jbHVkZXMoYW5pbWFsLmFsbGV0YXIgYXMgYW55KSBcbiAgICAgICAgICAgICAgPyAoY3VycmVudExhbmcgPT09ICdjYScgPyAnMSB2ZWRlbGwnIDogJzEgdGVybmVybycpXG4gICAgICAgICAgICAgIDogWycyJywgMl0uaW5jbHVkZXMoYW5pbWFsLmFsbGV0YXIgYXMgYW55KSBcbiAgICAgICAgICAgICAgICA/IChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICcyIHZlZGVsbHMnIDogJzIgdGVybmVyb3MnKVxuICAgICAgICAgICAgICAgIDogJ04vQScpXG4gICAgICAgICAgOiAnTi9BJ1xuICAgICAgXTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBBw7FhZGlyIGZlY2hhIGVuIGxhIGVzcXVpbmEgc3VwZXJpb3IgZGVyZWNoYVxuICAgIGRvYy5zZXRGb250U2l6ZSgxMCk7XG4gICAgZG9jLnNldFRleHRDb2xvcigxMDAsIDEwMCwgMTAwKTtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoY3VycmVudExhbmcgPT09ICdjYScgPyAnY2EtRVMnIDogJ2VzLUVTJyk7XG4gICAgZG9jLnRleHQoXG4gICAgICBjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IGBEYXRhOiAke2RhdGV9YCA6IGBGZWNoYTogJHtkYXRlfWAsIFxuICAgICAgMTk1LCAxNSwgeyBhbGlnbjogJ3JpZ2h0JyB9XG4gICAgKTtcbiAgICBcbiAgICAvLyBEZWZpbmltb3MgbGEgcG9zaWNpw7NuIGluaWNpYWwgcGFyYSBlbCByZXN1bWVuICh1c2FkYSBlbiB0b2RvIGVsIGRvY3VtZW50bylcbiAgICBjb25zdCBsb2dvWSA9IDEwOyAvLyBWYWxvciBwcmVkZXRlcm1pbmFkbyBwb3Igc2kgZmFsbGEgbGEgY2FyZ2EgZGVsIGxvZ29cbiAgICBjb25zdCBsb2dvSGVpZ2h0ID0gMzU7IC8vIFZhbG9yIHByZWRldGVybWluYWRvIHBvciBzaSBmYWxsYSBsYSBjYXJnYSBkZWwgbG9nb1xuICAgIGxldCByZXN1bWVuU3RhcnRZID0gbG9nb1kgKyBsb2dvSGVpZ2h0ICsgMjA7IC8vIFBvc2ljacOzbiBpbmljaWFsIGRlbCByZXN1bWVuXG4gICAgXG4gICAgLy8gQcOxYWRpciBsb2dvIG9maWNpYWwgZGUgTWFzY2xldCBJbXBlcmlcbiAgICB0cnkge1xuICAgICAgLy8gSW50ZW50YW1vcyBjYXJnYXIgZWwgbG9nbyBvZmljaWFsIGRlc2RlIHVuYSBpbWFnZW4gYmFzZTY0XG4gICAgICAvLyBMYSBydXRhIGVzIHJlbGF0aXZhIGEgbGEgdWJpY2FjacOzbiBkZXNkZSBkb25kZSBzZSBzaXJ2ZSBsYSBhcGxpY2FjacOzblxuICAgICAgY29uc3QgbG9nb1VybCA9ICcvaW1hZ2VzL2xvZ29fbWFzY2xldC5wbmcnO1xuICAgICAgXG4gICAgICAvLyBUYW1hw7FvIHkgcG9zaWNpb25hbWllbnRvIGRlbCBsb2dvIChjZW50cmFkbyBhcnJpYmEpXG4gICAgICBjb25zdCBsb2dvV2lkdGggPSA0NTtcbiAgICAgIGxldCBsb2dvSGVpZ2h0ID0gMzU7XG4gICAgICBjb25zdCBwYWdlV2lkdGggPSBkb2MuaW50ZXJuYWwucGFnZVNpemUuZ2V0V2lkdGgoKTtcbiAgICAgIGNvbnN0IGxvZ29YID0gKHBhZ2VXaWR0aCAvIDIpIC0gKGxvZ29XaWR0aCAvIDIpOyAvLyBDZW50cmFkbyBob3Jpem9udGFsbWVudGVcbiAgICAgIGNvbnN0IGxvZ29ZID0gMTA7IC8vIE1hcmdlbiBzdXBlcmlvclxuICAgICAgXG4gICAgICAvLyBBw7FhZGlyIGxhIGltYWdlbiBhbCBQREZcbiAgICAgIGRvYy5hZGRJbWFnZShsb2dvVXJsLCAnUE5HJywgbG9nb1gsIGxvZ29ZLCBsb2dvV2lkdGgsIGxvZ29IZWlnaHQpO1xuICAgICAgXG4gICAgICAvLyBBw7FhZGlyIGVsIHTDrXR1bG8gZGViYWpvIGRlbCBsb2dvIChjb24gbcOhcyBlc3BhY2lvIHBhcmEgZXZpdGFyIHF1ZSBzZSB0YXBlKVxuICAgICAgZG9jLnNldEZvbnRTaXplKDIwKTtcbiAgICAgIGRvYy5zZXRUZXh0Q29sb3IoNDAsIDQwLCA0MCk7XG4gICAgICBkb2MudGV4dCh0aXRsZSwgcGFnZVdpZHRoIC8gMiwgbG9nb1kgKyBsb2dvSGVpZ2h0ICsgNSwgeyBhbGlnbjogJ2NlbnRlcicgfSk7XG4gICAgICBcbiAgICAgIC8vIEFjdHVhbGl6YW1vcyBsYSBwb3NpY2nDs24gaW5pY2lhbCBkZWwgcmVzdW1lbiBjb24gbG9zIHZhbG9yZXMgcmVhbGVzIGRlbCBsb2dvXG4gICAgICByZXN1bWVuU3RhcnRZID0gbG9nb1kgKyBsb2dvSGVpZ2h0ICsgMjA7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGNhcmdhciBlbCBsb2dvOicsIGVycm9yKTtcbiAgICAgIFxuICAgICAgLy8gU2kgaGF5IGVycm9yLCB1c2Ftb3MgZWwgbG9nbyBhbHRlcm5hdGl2byAocmVjdMOhbmd1bG8gdmVyZGUpXG4gICAgICBkb2Muc2V0RHJhd0NvbG9yKDApO1xuICAgICAgZG9jLnNldEZpbGxDb2xvcigxMjYsIDIxMSwgMzMpOyAvLyBDb2xvciB2ZXJkZSBsaW1hIGNvcnBvcmF0aXZvXG4gICAgICBcbiAgICAgIGNvbnN0IGxvZ29YID0gMzA7XG4gICAgICBjb25zdCBsb2dvWSA9IDI1O1xuICAgICAgY29uc3QgbG9nb1NpemUgPSAxNTtcbiAgICAgIFxuICAgICAgLy8gRGlidWphbW9zIHVuIGN1YWRyYWRvIHJlZG9uZGVhZG8gY29tbyBmb25kbyBkZWwgbG9nb1xuICAgICAgZG9jLnJvdW5kZWRSZWN0KGxvZ29YIC0gbG9nb1NpemUvMiwgbG9nb1kgLSBsb2dvU2l6ZS8yLCBsb2dvU2l6ZSwgbG9nb1NpemUsIDIsIDIsICdGJyk7XG4gICAgICBcbiAgICAgIC8vIERpYnVqYW1vcyBsYSBcIk1cIiBkZSBNYXNjbGV0IGVuIGJsYW5jb1xuICAgICAgZG9jLnNldERyYXdDb2xvcigyNTUpO1xuICAgICAgZG9jLnNldFRleHRDb2xvcigyNTUpO1xuICAgICAgZG9jLnNldEZvbnRTaXplKDE0KTtcbiAgICAgIGRvYy5zZXRGb250KCdoZWx2ZXRpY2EnLCAnYm9sZCcpO1xuICAgICAgZG9jLnRleHQoJ00nLCBsb2dvWCAtIDUsIGxvZ29ZICsgNSwgeyBhbGlnbjogJ2NlbnRlcicgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIEHDsWFkaXIgZXN0YWTDrXN0aWNhcyByZXN1bWVuIHNpbWlsYXIgYSBsYSB0YXJqZXRhIGRlIGV4cGxvdGFjaW9uZXNcbiAgICBkb2Muc2V0Rm9udFNpemUoMTIpO1xuICAgIGRvYy5zZXRUZXh0Q29sb3IoNDAsIDQwLCA0MCk7XG4gICAgXG4gICAgLy8gQ2FsY3VsYXIgZXN0YWTDrXN0aWNhcyBkZXRhbGxhZGFzIHBhcmEgY29pbmNpZGFuIGNvbiBlbCBmb3JtYXRvIGRlIGxhcyB0YXJqZXRhc1xuICAgIGNvbnN0IHRvdGFsQW5pbWFsZXMgPSBmaWx0ZXJlZEFuaW1hbHMubGVuZ3RoO1xuICAgIGNvbnN0IGFuaW1hbGVzQWN0aXZvcyA9IGZpbHRlcmVkQW5pbWFscy5maWx0ZXIoYSA9PiBhLmVzdGFkbyA9PT0gJ09LJykubGVuZ3RoO1xuICAgIGNvbnN0IHRvcm9zQWN0aXZvcyA9IGZpbHRlcmVkQW5pbWFscy5maWx0ZXIoYSA9PiBhLmdlbmVyZSA9PT0gJ00nICYmIGEuZXN0YWRvID09PSAnT0snKS5sZW5ndGg7XG4gICAgY29uc3QgdmFjYXNBY3RpdmFzID0gZmlsdGVyZWRBbmltYWxzLmZpbHRlcihhID0+IGEuZ2VuZXJlID09PSAnRicgJiYgYS5lc3RhZG8gPT09ICdPSycpLmxlbmd0aDtcbiAgICBjb25zdCB0ZXJuZXJvcyA9IGZpbHRlcmVkQW5pbWFscy5maWx0ZXIoYSA9PiBcbiAgICAgIGEuZ2VuZXJlID09PSAnRicgJiYgWycxJywgMSwgJzInLCAyXS5pbmNsdWRlcyhhLmFsbGV0YXIgYXMgYW55KVxuICAgICkucmVkdWNlKCh0b3RhbCwgYW5pbWFsKSA9PiB7XG4gICAgICBjb25zdCBhbGxldGFyID0gU3RyaW5nKGFuaW1hbC5hbGxldGFyKTtcbiAgICAgIHJldHVybiB0b3RhbCArIChhbGxldGFyID09PSAnMScgPyAxIDogYWxsZXRhciA9PT0gJzInID8gMiA6IDApO1xuICAgIH0sIDApO1xuICAgIGNvbnN0IGFtYW1hbnRhbmRvID0gZmlsdGVyZWRBbmltYWxzLmZpbHRlcihhID0+IFxuICAgICAgYS5nZW5lcmUgPT09ICdGJyAmJiBbJzEnLCAxLCAnMicsIDJdLmluY2x1ZGVzKGEuYWxsZXRhciBhcyBhbnkpXG4gICAgKS5sZW5ndGg7XG4gICAgXG4gICAgLy8gQ3JlYXIgZXN0cnVjdHVyYSBkZSBkb3MgY29sdW1uYXMgcGFyYSBsYSBwcmltZXJhIGZpbGEgKFRvdGFsIHkgQWN0aXZvcylcbiAgICAvLyBSZWR1Y2ltb3MgbGlnZXJhbWVudGUgZWwgdGFtYcOxbyBwYXJhIHF1ZSBxdWVwYSBtZWpvclxuICAgIGRvYy5zZXRGaWxsQ29sb3IoMjQ1LCAyNDUsIDI0NSk7XG4gICAgZG9jLnJvdW5kZWRSZWN0KDMwLCByZXN1bWVuU3RhcnRZLCAxNTAsIDEzLCAyLCAyLCAnRicpO1xuICAgIFxuICAgIC8vIFTDrXR1bG9zIGRlIGxhcyBjb2x1bW5hc1xuICAgIGRvYy5zZXRGb250KCdoZWx2ZXRpY2EnLCAnYm9sZCcpO1xuICAgIGRvYy5zZXRUZXh0Q29sb3IoODAsIDgwLCA4MCk7XG4gICAgZG9jLnNldEZvbnRTaXplKDExKTsgLy8gUmVkdWNpbW9zIHVuIHBvY28gZWwgdGFtYcOxb1xuICAgIGRvYy50ZXh0KGN1cnJlbnRMYW5nID09PSAnY2EnID8gJ1RvdGFsIEFuaW1hbHMnIDogJ1RvdGFsIEFuaW1hbGVzJywgNjUsIHJlc3VtZW5TdGFydFkgKyA1LCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBkb2MudGV4dChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdBbmltYWxzIEFjdGl1cycgOiAnQW5pbWFsZXMgQWN0aXZvcycsIDE0NSwgcmVzdW1lblN0YXJ0WSArIDUsIHsgYWxpZ246ICdjZW50ZXInIH0pO1xuICAgIFxuICAgIC8vIFZhbG9yZXMgZGUgbGFzIGNvbHVtbmFzXG4gICAgZG9jLnNldEZvbnRTaXplKDEzKTsgLy8gUmVkdWNpbW9zIHVuIHBvY28gZWwgdGFtYcOxb1xuICAgIGRvYy5zZXRUZXh0Q29sb3IoNDAsIDQwLCA0MCk7XG4gICAgZG9jLnRleHQodG90YWxBbmltYWxlcy50b1N0cmluZygpLCA2NSwgcmVzdW1lblN0YXJ0WSArIDEwLCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBkb2Muc2V0VGV4dENvbG9yKDM0LCAxMzksIDM0KTsgLy8gVmVyZGUgcGFyYSBhbmltYWxlcyBhY3Rpdm9zXG4gICAgZG9jLnRleHQoYW5pbWFsZXNBY3Rpdm9zLnRvU3RyaW5nKCksIDE0NSwgcmVzdW1lblN0YXJ0WSArIDEwLCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBcbiAgICAvLyBTZWd1bmRhIGZpbGEgLSBUcmVzIGNvbHVtbmFzIChUb3JvcywgVmFjYXMsIFRlcm5lcm9zKVxuICAgIGRvYy5zZXRGaWxsQ29sb3IoMjUwLCAyNTAsIDI1MCk7XG4gICAgZG9jLnJvdW5kZWRSZWN0KDMwLCByZXN1bWVuU3RhcnRZICsgMTUsIDE1MCwgMTMsIDIsIDIsICdGJyk7XG4gICAgXG4gICAgLy8gVMOtdHVsb3NcbiAgICBkb2Muc2V0Rm9udFNpemUoMTEpOyAvLyBUYW1hw7FvIHJlZHVjaWRvXG4gICAgZG9jLnNldFRleHRDb2xvcig4MCwgODAsIDgwKTtcbiAgICBkb2MudGV4dChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdUb3JvcyBBY3RpdXMnIDogJ1Rvcm9zIEFjdGl2b3MnLCA1NSwgcmVzdW1lblN0YXJ0WSArIDIwLCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBkb2MudGV4dChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdWYXF1ZXMgQWN0aXZlcycgOiAnVmFjYXMgQWN0aXZhcycsIDEwNSwgcmVzdW1lblN0YXJ0WSArIDIwLCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBkb2MudGV4dChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdWZWRlbGxzJyA6ICdUZXJuZXJvcycsIDE1NSwgcmVzdW1lblN0YXJ0WSArIDIwLCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBcbiAgICAvLyBWYWxvcmVzXG4gICAgZG9jLnNldFRleHRDb2xvcig1MSwgMTAyLCAyMDQpOyAvLyBBenVsIHBhcmEgdG9yb3NcbiAgICBkb2MudGV4dCh0b3Jvc0FjdGl2b3MudG9TdHJpbmcoKSwgNTUsIHJlc3VtZW5TdGFydFkgKyAyNSwgeyBhbGlnbjogJ2NlbnRlcicgfSk7XG4gICAgZG9jLnNldFRleHRDb2xvcigyMzMsIDMwLCA5OSk7IC8vIFJvc2EgcGFyYSB2YWNhc1xuICAgIGRvYy50ZXh0KHZhY2FzQWN0aXZhcy50b1N0cmluZygpLCAxMDUsIHJlc3VtZW5TdGFydFkgKyAyNSwgeyBhbGlnbjogJ2NlbnRlcicgfSk7XG4gICAgZG9jLnNldFRleHRDb2xvcigyNTUsIDE1MiwgMCk7IC8vIE5hcmFuamEgcGFyYSB0ZXJuZXJvc1xuICAgIGRvYy50ZXh0KHRlcm5lcm9zLnRvU3RyaW5nKCksIDE1NSwgcmVzdW1lblN0YXJ0WSArIDI1LCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBcbiAgICAvLyBUZXJjZXJhIGZpbGEgLSBBbWFtYW50YW5kb1xuICAgIGRvYy5zZXRGaWxsQ29sb3IoMjUwLCAyNTAsIDI1MCk7XG4gICAgZG9jLnJvdW5kZWRSZWN0KDMwLCByZXN1bWVuU3RhcnRZICsgMzAsIDcwLCAxMywgMiwgMiwgJ0YnKTtcbiAgICBcbiAgICAvLyBUw610dWxvIHkgdmFsb3JcbiAgICBkb2Muc2V0VGV4dENvbG9yKDgwLCA4MCwgODApO1xuICAgIGRvYy50ZXh0KGN1cnJlbnRMYW5nID09PSAnY2EnID8gJ0FsbGV0YW50JyA6ICdBbWFtYW50YW5kbycsIDQ1LCByZXN1bWVuU3RhcnRZICsgMzUsIHsgYWxpZ246ICdjZW50ZXInIH0pO1xuICAgIGRvYy5zZXRUZXh0Q29sb3IoMywgMTY5LCAyNDQpOyAvLyBBenVsIHBhcmEgYW1hbWFudGFuZG9cbiAgICBkb2MudGV4dChhbWFtYW50YW5kby50b1N0cmluZygpLCA3NSwgcmVzdW1lblN0YXJ0WSArIDM1LCB7IGFsaWduOiAnY2VudGVyJyB9KTtcbiAgICBcbiAgICAvLyBBw7FhZGlyIHRhYmxhIGRlIGFuaW1hbGVzIHVzYW5kbyBqc3BkZi1hdXRvdGFibGVcbiAgICBhdXRvVGFibGUoZG9jLCB7XG4gICAgICBoZWFkOiBbY29sdW1uc10sXG4gICAgICBib2R5OiBkYXRhLFxuICAgICAgc3RhcnRZOiByZXN1bWVuU3RhcnRZICsgNTAsIC8vIEFqdXN0YW1vcyBlbCBpbmljaW8gZGUgbGEgdGFibGEgcGFyYSBkZWphciBlc3BhY2lvIGFsIHJlc3VtZW5cbiAgICAgIHRoZW1lOiAnZ3JpZCcsXG4gICAgICBzdHlsZXM6IHsgZm9udFNpemU6IDksIGNlbGxQYWRkaW5nOiAzIH0sXG4gICAgICBoZWFkU3R5bGVzOiB7IFxuICAgICAgICBmaWxsQ29sb3I6IFsxMjYsIDIxMSwgMzNdLCAvLyBDb2xvciB2ZXJkZSBsaW1hIGNvcnBvcmF0aXZvXG4gICAgICAgIHRleHRDb2xvcjogMjU1LFxuICAgICAgICBmb250U3R5bGU6ICdib2xkJyBcbiAgICAgIH0sXG4gICAgICBhbHRlcm5hdGVSb3dTdHlsZXM6IHsgZmlsbENvbG9yOiBbMjQwLCAyNDAsIDI0MF0gfSxcbiAgICAgIGNvbHVtblN0eWxlczoge1xuICAgICAgICAwOiB7IGNlbGxXaWR0aDogMjAgfSwgLy8gSURcbiAgICAgICAgMTogeyBjZWxsV2lkdGg6IDQwIH0sIC8vIE5vbWJyZVxuICAgICAgICAyOiB7IGNlbGxXaWR0aDogMjUgfSwgLy8gR8OpbmVyb1xuICAgICAgICAzOiB7IGNlbGxXaWR0aDogMzAgfSwgLy8gRXN0YWRvXG4gICAgICAgIDQ6IHsgY2VsbFdpZHRoOiAzNSB9LCAvLyBGZWNoYSBOYWNpbWllbnRvXG4gICAgICAgIDU6IHsgY2VsbFdpZHRoOiA0MCB9ICAvLyBBbWFtYW50YW5kb1xuICAgICAgfSxcbiAgICAgIG1hcmdpbjogeyB0b3A6IDcwIH1cbiAgICB9KTtcbiAgICBcbiAgICAvLyBBw7FhZGlyIHBpZSBkZSBww6FnaW5hXG4gICAgY29uc3QgcGFnZUNvdW50ID0gKGRvYyBhcyBhbnkpLmludGVybmFsLmdldE51bWJlck9mUGFnZXMoKTtcbiAgICBmb3IobGV0IGkgPSAxOyBpIDw9IHBhZ2VDb3VudDsgaSsrKSB7XG4gICAgICBkb2Muc2V0UGFnZShpKTtcbiAgICAgIGRvYy5zZXRGb250U2l6ZSg4KTtcbiAgICAgIGRvYy5zZXRUZXh0Q29sb3IoMTAwLCAxMDAsIDEwMCk7XG4gICAgICBkb2MudGV4dChcbiAgICAgICAgJ01hc2NsZXQgSW1wZXJpIC0gJyArIChjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdTaXN0ZW1hIGRlIEdlc3Rpw7MgUmFtYWRlcmEnIDogJ1Npc3RlbWEgZGUgR2VzdGnDs24gR2FuYWRlcmEnKSwgXG4gICAgICAgIDEwNSwgZG9jLmludGVybmFsLnBhZ2VTaXplLmhlaWdodCAtIDEwLCB7IGFsaWduOiAnY2VudGVyJyB9XG4gICAgICApO1xuICAgICAgZG9jLnRleHQoXG4gICAgICAgIGN1cnJlbnRMYW5nID09PSAnY2EnID8gYFDDoGdpbmEgJHtpfSBkZSAke3BhZ2VDb3VudH1gIDogYFDDoWdpbmEgJHtpfSBkZSAke3BhZ2VDb3VudH1gLCBcbiAgICAgICAgMTk1LCBkb2MuaW50ZXJuYWwucGFnZVNpemUuaGVpZ2h0IC0gMTAsIHsgYWxpZ246ICdyaWdodCcgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gR3VhcmRhciBlbCBQREZcbiAgICBjb25zdCBmaWxlTmFtZSA9IGBhbmltYWxlc18ke2N1cnJlbnRFeHBsb3RhY2lvbiB8fCAndG9kYXMnfV8ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS5wZGZgO1xuICAgIGRvYy5zYXZlKGZpbGVOYW1lKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYWwgZ2VuZXJhciBQREY6JywgZXJyb3IpO1xuICAgICAgYWxlcnQoY3VycmVudExhbmcgPT09ICdjYScgPyAnRXJyb3IgZW4gZ2VuZXJhciBlbCBQREYnIDogJ0Vycm9yIGFsIGdlbmVyYXIgZWwgUERGJyk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlbmRlcml6YXIgZWwgY29tcG9uZW50ZSBwcmluY2lwYWxcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBweS02XCI+XG4gICAgICB7LyogMS4gU2VjY2nDs24gZGUgYsO6c3F1ZWRhIHkgZmlsdHJvcyAtIGV4YWN0YW1lbnRlIGlndWFsIGFsIEhUTUwgZXhpc3RlbnRlICovfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LW1kIHAtMyBzbTpwLTQgbWItNCBzbTptYi02XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWItMyBzbTptYi00XCI+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTIgc206bWItM1wiPlxuICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gJ0NlcmNhIGkgRmlsdHJlcycgOiAnQsO6c3F1ZWRhIHkgRmlsdHJvcyd9XG4gICAgICAgICAgPC9oMj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHNtOnRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS0zMDAgbWItMyBzbTptYi00XCI+XG4gICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgXG4gICAgICAgICAgICAgID8gJ1V0aWxpdHphIGVscyBmaWx0cmVzIHBlciB0cm9iYXIgZXhwbG90YWNpb25zIGVzcGVjw61maXF1ZXMuIFBvdHMgY2VyY2FyIHBlciBjb2RpIGRcXCdleHBsb3RhY2nDsy4nXG4gICAgICAgICAgICAgIDogJ1V0aWxpemEgbG9zIGZpbHRyb3MgcGFyYSBlbmNvbnRyYXIgZXhwbG90YWNpb25lcyBlc3BlY8OtZmljYXMuIFB1ZWRlcyBidXNjYXIgcG9yIGPDs2RpZ28gZGUgZXhwbG90YWNpw7NuLidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgey8qIEJ1c2NhZG9yIGNvbiBib3RvbmVzICovfVxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWItM1wiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDAgbWItMVwiPlxuICAgICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyAnQ2VyY2FyJyA6ICdCdXNjYXInfVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgXG4gICAgICAgICAgICAgICAgaWQ9XCJzZWFyY2gtZXhwbG90YWNpb25cIiBcbiAgICAgICAgICAgICAgICB2YWx1ZT17c2VhcmNoVGVybX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFNlYXJjaFRlcm0oZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiQ2VyY2FyIHBlciBjb2RpIGQnZXhwbG90YWNpw7MuLi5cIiA6IFwiQnVzY2FyIHBvciBjw7NkaWdvIGRlIGV4cGxvdGFjacOzbi4uLlwifSBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIHBsLTkgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIHNoYWRvdy1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy1wcmltYXJ5IGZvY3VzOmJvcmRlci1wcmltYXJ5IGRhcms6YmctZ3JheS03MDAgZGFyazp0ZXh0LXdoaXRlXCIgXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBmbGV4IGl0ZW1zLWNlbnRlciBwbC0zIHBvaW50ZXItZXZlbnRzLW5vbmVcIj5cbiAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cInctNCBoLTQgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICAgICAgICA8cGF0aCBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlV2lkdGg9ezJ9IGQ9XCJNMjEgMjFsLTYtNm0yLTVhNyA3IDAgMTEtMTQgMCA3IDcgMCAwMTE0IDB6XCIgLz5cbiAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggc3BhY2UteC0yXCI+XG4gICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVTZWFyY2h9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdDZXJjYXInIDogJ0J1c2Nhcid9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNsZWFyfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXNlY29uZGFyeVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdOZXRlamFyJyA6ICdMaW1waWFyJ31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICB7LyogTW9zdHJhciBzcGlubmVyIGR1cmFudGUgbGEgY2FyZ2EgKi99XG4gICAgICB7bG9hZGluZyAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgcHktMTBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwaW5uZXJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgICAgXG4gICAgICB7LyogTW9zdHJhciBlcnJvciBzaSBvY3VycmUgKi99XG4gICAgICB7ZXJyb3IgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXJlZC0xMDAgYm9yZGVyIGJvcmRlci1yZWQtNDAwIHRleHQtcmVkLTcwMCBweC00IHB5LTMgcm91bmRlZC1tZCBtYi00XCI+XG4gICAgICAgICAgPHA+e2Vycm9yfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgICAgXG4gICAgICB7LyogMi4gTGlzdGEgZGUgZXhwbG90YWNpb25lcyAoY2FyZHMpIC0gaW5pY2lhbG1lbnRlIHZpc2libGUgKi99XG4gICAgICB7IWxvYWRpbmcgJiYgIWVycm9yICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICB7LyogVmlzdGEgZGUgdGFyamV0YXMgZGUgZXhwbG90YWNpb25lcyAqL31cbiAgICAgICAgICA8ZGl2IFxuICAgICAgICAgICAgaWQ9XCJleHBsb3RhY2lvbkNhcmRzXCIgXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIHNtOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy0zIHhsOmdyaWQtY29scy00IGdhcC00IG1iLTZcIlxuICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogY3VycmVudEV4cGxvdGFjaW9uID8gJ25vbmUnIDogJ2dyaWQnIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2Rpc3BsYXlFeHBsb3RhY2lvbmVzLm1hcCgoZXhwKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYgXG4gICAgICAgICAgICAgICAga2V5PXtleHAuZXhwbG90YWNpb30gXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZXhwbG90YWNpb24tY2FyZCBiZy13aGl0ZSByb3VuZGVkLWxnIHNoYWRvdy1tZCBob3ZlcjpzaGFkb3ctbGcgdHJhbnNpdGlvbi1zaGFkb3cgZHVyYXRpb24tMzAwIG92ZXJmbG93LWhpZGRlbiB3LWZ1bGwgYm9yZGVyIGJvcmRlci1ncmF5LTEwMCBtYi00XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzaG93RXhwbG90YWNpb25EZXRhaWwoZXhwLmV4cGxvdGFjaW8pfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgey8qIENhYmVjZXJhIGNvbiBlbCBub21icmUgZGUgbGEgZXhwbG90YWNpw7NuICovfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2FyZC1oZWFkZXIgYmctcHJpbWFyeSB0ZXh0LXdoaXRlIHAtM1wiPlxuICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtY2VudGVyXCI+e2V4cC5leHBsb3RhY2lvfTwvaDM+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgey8qIEN1ZXJwbyBkZSBsYSB0YXJqZXRhICovfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2FyZC1ib2R5IHAtNFwiPlxuICAgICAgICAgICAgICAgICAgey8qIFByaW1lcmEgZmlsYTogQW5pbWFsZXMgdG90YWxlcyB5IGFjdGl2b3MgKi99XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTIgbWItNCBwYi0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTEwMFwiPlxuICAgICAgICAgICAgICAgICAgICB7LyogQ29sdW1uYSBpenF1aWVyZGE6IFRvdGFsIEFuaW1hbGVzICovfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGF0LWxhYmVsIGZvbnQtYm9sZCB0ZXh0LWdyYXktNzAwIG1iLTJcIj57Y3VycmVudExhbmcgPT09ICdjYScgPyBcIlRvdGFsIEFuaW1hbHNcIiA6IFwiVG90YWwgQW5pbWFsZXNcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN0YXQtdmFsdWUgdG90YWwgZm9udC1ib2xkIHRleHQtMnhsIHRleHQtcHJpbWFyeS1kYXJrXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7KGV4cC50b3JvcyB8fCAwKSArIChleHAudmFjYXMgfHwgMCkgKyAoZXhwLnRlcm5lcm9zIHx8IDApfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgey8qIENvbHVtbmEgZGVyZWNoYTogQW5pbWFsZXMgQWN0aXZvcyAqL31cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhdC1sYWJlbCBmb250LWJvbGQgdGV4dC1ncmF5LTcwMCBtYi0yXCI+e2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJBbmltYWxzIEFjdGl1c1wiIDogXCJBbmltYWxlcyBBY3Rpdm9zXCJ9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGF0LXZhbHVlIHRvdGFsIGZvbnQtYm9sZCB0ZXh0LTJ4bCB0ZXh0LWdyZWVuLTYwMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgey8qIEZpbHRyYXIgc29sbyBsb3MgYW5pbWFsZXMgY29uIGVzdGFkbz1PSyAqL31cbiAgICAgICAgICAgICAgICAgICAgICAgIHsoKGV4cC50b3Jvc19hY3Rpdm9zICE9PSB1bmRlZmluZWQgPyBleHAudG9yb3NfYWN0aXZvcyA6IGV4cC50b3JvcykgfHwgMCkgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAoKGV4cC52YWNhc19hY3RpdmFzICE9PSB1bmRlZmluZWQgPyBleHAudmFjYXNfYWN0aXZhcyA6IGV4cC52YWNhcykgfHwgMCkgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAoZXhwLnRlcm5lcm9zIHx8IDApfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICB7LyogU2VndW5kYSBmaWxhOiBUb3JvcywgVmFjYXMsIFRlcm5lcm9zIChzb2xvIGFjdGl2b3MpICovfVxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhbmltYWwtc3RhdHMgZ3JpZCBncmlkLWNvbHMtMyBnYXAtMSB0ZXh0LWNlbnRlciBtYi0zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGF0LWxhYmVsIGZvbnQtbWVkaXVtXCI+e2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJUb3JvcyBBY3RpdXNcIiA6IFwiVG9yb3MgQWN0aXZvc1wifTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhdC12YWx1ZSB0b3JvcyBmb250LWJvbGQgdGV4dC1wcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZXhwLnRvcm9zX2FjdGl2b3MgIT09IHVuZGVmaW5lZCA/IGV4cC50b3Jvc19hY3Rpdm9zIDogZXhwLnRvcm9zIHx8IDB9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhdC1sYWJlbCBmb250LW1lZGl1bVwiPntjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiVmFxdWVzIEFjdGl2ZXNcIiA6IFwiVmFjYXMgQWN0aXZhc1wifTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhdC12YWx1ZSB2YWNhcyBmb250LWJvbGQgdGV4dC1waW5rLTUwMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2V4cC52YWNhc19hY3RpdmFzICE9PSB1bmRlZmluZWQgPyBleHAudmFjYXNfYWN0aXZhcyA6IGV4cC52YWNhcyB8fCAwfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN0YXQtbGFiZWwgZm9udC1tZWRpdW1cIj57Y3VycmVudExhbmcgPT09ICdjYScgPyBcIlZlZGVsbHNcIiA6IFwiVGVybmVyb3NcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN0YXQtdmFsdWUgdGVybmVyb3MgZm9udC1ib2xkIHRleHQtb3JhbmdlLTUwMFwiPntleHAudGVybmVyb3MgfHwgMH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgey8qIFRlcmNlcmEgZmlsYTogQW1hbWFudGFuZG8gKi99XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNhcmQtZm9vdGVyIGdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTEgdGV4dC1jZW50ZXIgcHQtMiBib3JkZXItdCBib3JkZXItZ3JheS0xMDBcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhdC1sYWJlbCBmb250LW1lZGl1bVwiPntjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiQWxsZXRhbnRcIiA6IFwiQW1hbWFudGFuZG9cIn08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LWJsdWUtNjAwXCI+e2V4cC5hbWFtYW50YW5kbyB8fCAwfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtc3Bhbi0yIHRleHQtY2VudGVyIGZsZXggZmxleC1jb2wganVzdGlmeS1jZW50ZXIgaXRlbXMtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGF0LWxhYmVsIGZvbnQtbWVkaXVtXCI+Jm5ic3A7PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRldGFpbHMtbGluayB0ZXh0LWdyZWVuLTYwMCBmb250LW1lZGl1bSBob3Zlcjp0ZXh0LWdyZWVuLTcwMCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93RXhwbG90YWNpb25EZXRhaWwoZXhwLmV4cGxvdGFjaW8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyBcIlZldXJlIGRldGFsbHNcIiA6IFwiVmVyIGRldGFsbGVzXCJ9ICZyYXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgey8qIDMuIFZpc3RhIGRldGFsbGFkYSBkZSBleHBsb3RhY2nDs24gLSBpbmljaWFsbWVudGUgb2N1bHRhICovfVxuICAgICAgICAgIDxkaXYgXG4gICAgICAgICAgICBpZD1cImV4cGxvdGFjaW9uLWRldGFpbFwiIFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaGlkZGVuIG1iLTYgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdyBwLTRcIlxuICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogY3VycmVudEV4cGxvdGFjaW9uID8gJ2Jsb2NrJyA6ICdub25lJyB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTQgdGV4dC1sZyBmb250LW1lZGl1bVwiPlxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIj5cbiAgICAgICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyBcIkFuaW1hbHMgZGVcIiA6IFwiQW5pbWFsZXMgZGVcIn0gPHNwYW4gaWQ9XCJleHBsb3RhY2lvbi1jb2RlXCI+e2N1cnJlbnRFeHBsb3RhY2lvbn08L3NwYW4+XG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgaWQ9XCJleHBvcnQtY3N2XCIgXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgdGV4dC1zbSBmbGV4IGl0ZW1zLWNlbnRlclwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXtleHBvcnRUb1BERn1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzc05hbWU9XCJoLTQgdy00IG1yLTFcIiBmaWxsPVwibm9uZVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZVdpZHRoPXsyfSBkPVwiTTEyIDEwdjZtMCAwbC0zLTNtMyAzbDMtM20yIDhIN2EyIDIgMCAwMS0yLTJWNWEyIDIgMCAwMTItMmg1LjU4NmExIDEgMCAwMS43MDcuMjkzbDUuNDE0IDUuNDE0YTEgMSAwIDAxLjI5My43MDdWMTlhMiAyIDAgMDEtMiAyelwiIC8+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiRXhwb3J0YXIgUERGXCIgOiBcIkV4cG9ydGFyIFBERlwifVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgICAgICBpZD1cImJhY2stYnV0dG9uXCIgXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXNlY29uZGFyeSB0ZXh0LXNtIGZsZXggaXRlbXMtY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUJhY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3NOYW1lPVwiaC00IHctNCBtci0xXCIgZmlsbD1cIm5vbmVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VXaWR0aD17Mn0gZD1cIk0xMSAxN2wtNS01bTAgMGw1LTVtLTUgNWgxMlwiIC8+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiVG9ybmFyXCIgOiBcIlZvbHZlclwifVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB7LyogVGFicyBwYXJhIGZpbHRyYXIgcG9yIGNhdGVnb3LDrWEgKi99XG4gICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXdyYXAgLW1iLXB4IHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIm1yLTJcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYW5pbWFsLXRhYiBpbmxpbmUtYmxvY2sgcC0yIGJvcmRlci1iLTIgJHthY3RpdmVDYXRlZ29yeSA9PT0gJ3RvZG9zJyA/ICdib3JkZXItcHJpbWFyeSB0ZXh0LXByaW1hcnkgZGFyazp0ZXh0LXByaW1hcnktbGlnaHQnIDogJ2JvcmRlci10cmFuc3BhcmVudCBob3Zlcjpib3JkZXItcHJpbWFyeSBob3Zlcjp0ZXh0LXByaW1hcnkgZGFyazpob3Zlcjp0ZXh0LXByaW1hcnktbGlnaHQnfWB9XG4gICAgICAgICAgICAgICAgICBkYXRhLWNhdGVnb3J5PVwidG9kb3NcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZmlsdGVyQW5pbWFsc0J5Q2F0ZWdvcnkoJ3RvZG9zJyl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJUb3RzIGVscyBhbmltYWxzXCIgOiBcIlRvZG9zIGxvcyBhbmltYWxlc1wifSA8c3BhbiBjbGFzc05hbWU9XCJ0YWItY291bnQgbWwtMSBiZy1wcmltYXJ5LWxpZ2h0LzIwIHB4LTEuNSBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQteHNcIj57YWxsQW5pbWFscy5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIm1yLTJcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYW5pbWFsLXRhYiBpbmxpbmUtYmxvY2sgcC0yIGJvcmRlci1iLTIgJHthY3RpdmVDYXRlZ29yeSA9PT0gJ3Rvcm9zJyA/ICdib3JkZXItcHJpbWFyeSB0ZXh0LXByaW1hcnkgZGFyazp0ZXh0LXByaW1hcnktbGlnaHQnIDogJ2JvcmRlci10cmFuc3BhcmVudCBob3Zlcjpib3JkZXItcHJpbWFyeSBob3Zlcjp0ZXh0LXByaW1hcnkgZGFyazpob3Zlcjp0ZXh0LXByaW1hcnktbGlnaHQnfWB9XG4gICAgICAgICAgICAgICAgICBkYXRhLWNhdGVnb3J5PVwidG9yb3NcIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZmlsdGVyQW5pbWFsc0J5Q2F0ZWdvcnkoJ3Rvcm9zJyl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJUb3Jvc1wiIDogXCJUb3Jvc1wifSA8c3BhbiBjbGFzc05hbWU9XCJ0YWItY291bnQgbWwtMSBiZy1wcmltYXJ5LWxpZ2h0LzIwIHB4LTEuNSBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQteHNcIj57c3RhdHMudG9yb3N9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIm1yLTJcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYW5pbWFsLXRhYiBpbmxpbmUtYmxvY2sgcC0yIGJvcmRlci1iLTIgJHthY3RpdmVDYXRlZ29yeSA9PT0gJ3ZhY2FzLWFtYW0nID8gJ2JvcmRlci1wcmltYXJ5IHRleHQtcHJpbWFyeSBkYXJrOnRleHQtcHJpbWFyeS1saWdodCcgOiAnYm9yZGVyLXRyYW5zcGFyZW50IGhvdmVyOmJvcmRlci1wcmltYXJ5IGhvdmVyOnRleHQtcHJpbWFyeSBkYXJrOmhvdmVyOnRleHQtcHJpbWFyeS1saWdodCd9YH1cbiAgICAgICAgICAgICAgICAgIGRhdGEtY2F0ZWdvcnk9XCJ2YWNhcy1hbWFtXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGZpbHRlckFuaW1hbHNCeUNhdGVnb3J5KCd2YWNhcy1hbWFtJyl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJWYXF1ZXMgYWxsZXRhbnRcIiA6IFwiVmFjYXMgYW1hbWFudGFuZG9cIn0gPHNwYW4gY2xhc3NOYW1lPVwidGFiLWNvdW50IG1sLTEgYmctcHJpbWFyeS1saWdodC8yMCBweC0xLjUgcHktMC41IHJvdW5kZWQtZnVsbCB0ZXh0LXhzXCI+e2FsbEFuaW1hbHMuZmlsdGVyKGEgPT4gYS5nZW5lcmUgPT09ICdGJyAmJiBbJzEnLCAxLCAnMicsIDJdLmluY2x1ZGVzKGEuYWxsZXRhciBhcyBhbnkpKS5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIm1yLTJcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYW5pbWFsLXRhYiBpbmxpbmUtYmxvY2sgcC0yIGJvcmRlci1iLTIgJHthY3RpdmVDYXRlZ29yeSA9PT0gJ3ZhY2FzLW5vLWFtYW0nID8gJ2JvcmRlci1wcmltYXJ5IHRleHQtcHJpbWFyeSBkYXJrOnRleHQtcHJpbWFyeS1saWdodCcgOiAnYm9yZGVyLXRyYW5zcGFyZW50IGhvdmVyOmJvcmRlci1wcmltYXJ5IGhvdmVyOnRleHQtcHJpbWFyeSBkYXJrOmhvdmVyOnRleHQtcHJpbWFyeS1saWdodCd9YH1cbiAgICAgICAgICAgICAgICAgIGRhdGEtY2F0ZWdvcnk9XCJ2YWNhcy1uby1hbWFtXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGZpbHRlckFuaW1hbHNCeUNhdGVnb3J5KCd2YWNhcy1uby1hbWFtJyl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJWYXF1ZXMgc2Vuc2UgYWxsZXRhclwiIDogXCJWYWNhcyBubyBhbWFtYW50YW5kb1wifSA8c3BhbiBjbGFzc05hbWU9XCJ0YWItY291bnQgbWwtMSBiZy1wcmltYXJ5LWxpZ2h0LzIwIHB4LTEuNSBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQteHNcIj57YWxsQW5pbWFscy5maWx0ZXIoYSA9PiBhLmdlbmVyZSA9PT0gJ0YnICYmIChbJzAnLCAwXS5pbmNsdWRlcyhhLmFsbGV0YXIgYXMgYW55KSB8fCBhLmFsbGV0YXIgPT09IG51bGwpKS5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgey8qIMOBcmVhIHBhcmEgbGEgdGFibGEgZGUgYW5pbWFsZXMgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTRcIj5cbiAgICAgICAgICAgICAge3JlbmRlckFuaW1hbFRhYmxlKCl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRXhwbG90YWNpb25lc1BhZ2U7XG4iXSwibWFwcGluZ3MiOiJBQTJjVSxTQXNiRixVQXRiRTtBQTNjVixPQUFPLFNBQVMs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