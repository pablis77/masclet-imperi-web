import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"];
import apiService from "/src/services/apiService.ts";
import { Pie } from "/node_modules/.vite/deps/react-chartjs-2.js?v=5e89932e";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "/node_modules/.vite/deps/chart__js.js?v=5e89932e";
import { t, getCurrentLanguage } from "/src/i18n/config.ts";
ChartJS.register(ArcElement, Tooltip, Legend);
const ResumenOriginalCard = ({
  darkMode = false
}) => {
  const currentLang = getCurrentLanguage();
  const [stats, setStats] = useState(null);
  const [animalesDetallados, setAnimalesDetallados] = useState(null);
  const [periodoData, setPeriodoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("Obteniendo datos para ResumenOriginalCard desde endpoint optimizado...");
        const optimizedResponse = await apiService.get("/dashboard/resumen-card");
        setStats(optimizedResponse.stats);
        setAnimalesDetallados(optimizedResponse.animales_detallados);
        setPeriodoData(optimizedResponse.periodo);
        console.log("Datos obtenidos correctamente desde endpoint optimizado");
        setLoading(false);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido";
        console.error(`Error cargando datos desde endpoint optimizado: ${errorMsg}`);
        console.error("Intentando fallback a peticiones individuales...");
        try {
          const [statsResponse, animalesResponse, periodoResponse] = await Promise.all([
            apiService.get("/dashboard/stats"),
            apiService.get("/dashboard-detallado/animales-detallado"),
            apiService.get("/dashboard-periodo/periodo-dinamico")
          ]);
          setStats(statsResponse);
          setAnimalesDetallados(animalesResponse);
          setPeriodoData(periodoResponse);
          setLoading(false);
          setError(null);
        } catch (fallbackErr) {
          const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : "Error desconocido";
          console.error(`Fallback también ha fallado: ${fallbackMsg}`);
          setError("Error cargando datos del dashboard. Por favor, intenta de nuevo.");
          setLoading(false);
        }
      }
    };
    loadData();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxDEV("div", { className: "dashboard-card", style: { gridColumn: "span 12" }, children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsxDEV("svg", { className: "animate-spin h-5 w-5 text-blue-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
        /* @__PURE__ */ jsxDEV("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 83,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 84,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 82,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("span", { children: "Cargando datos del panel de control..." }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 86,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 81,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 80,
      columnNumber: 7
    }, this);
  }
  if (error) {
    return /* @__PURE__ */ jsxDEV("div", { className: "dashboard-card", style: { gridColumn: "span 12" }, children: /* @__PURE__ */ jsxDEV("div", { className: "p-4 bg-red-100 text-red-700 rounded-lg mb-4", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxDEV("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 99,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 98,
        columnNumber: 13
      }, this),
      error
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 97,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 96,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 95,
      columnNumber: 7
    }, this);
  }
  const totalAnimals = animalesDetallados?.total || 0;
  const activeMales = animalesDetallados?.por_genero?.machos?.activos || 0;
  const inactiveMales = animalesDetallados?.por_genero?.machos?.fallecidos || 0;
  const activeFemales = animalesDetallados?.por_genero?.hembras?.activas || 0;
  const inactiveFemales = animalesDetallados?.por_genero?.hembras?.fallecidas || 0;
  const activeAnimals = animalesDetallados?.general?.activos || 0;
  const inactiveAnimals = animalesDetallados?.general?.fallecidos || 0;
  const nursing0 = animalesDetallados?.por_alletar?.["0"] || 0;
  const nursing1 = animalesDetallados?.por_alletar?.["1"] || 0;
  const nursing2 = animalesDetallados?.por_alletar?.["2"] || 0;
  console.log("DATOS DETALLADOS USADOS:", {
    totalAnimals,
    activeMales,
    inactiveMales,
    activeFemales,
    inactiveFemales,
    activeAnimals,
    inactiveAnimals,
    nursing0,
    nursing1,
    nursing2
  });
  console.log("RESPUESTA ORIGINAL:", animalesDetallados);
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };
  return /* @__PURE__ */ jsxDEV("div", { className: `dashboard-card ${darkMode ? "bg-gray-800 text-white" : ""}`, style: { gridColumn: "span 12" }, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center mb-4", children: periodoData && /* @__PURE__ */ jsxDEV("div", { className: "text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1", children: [
      t("dashboard.summary_card.period", currentLang),
      ": ",
      periodoData.formato_fecha_inicio || "N/A",
      " a ",
      periodoData.formato_fecha_fin || "N/A",
      periodoData.dias && /* @__PURE__ */ jsxDEV("span", { className: "ml-2 font-semibold", children: [
        "• ",
        periodoData.dias,
        " ",
        t("dashboard.summary_card.days", currentLang)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 154,
        columnNumber: 34
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 152,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 149,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { border: "1px solid rgba(0, 0, 0, 0.1)", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "white" }, children: [
        /* @__PURE__ */ jsxDEV("h3", { className: `text-md font-semibold p-2 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`, children: t("dashboard.summary_card.animals_summary", currentLang) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 163,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "bg-purple-500", style: { width: "100%", padding: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: t("dashboard.summary_card.total_animals", currentLang) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 166,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: totalAnimals }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 167,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 165,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "bg-green-500", style: { width: "100%", padding: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: t("dashboard.summary_card.active_animals", currentLang) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 171,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: activeAnimals }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 172,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 170,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "bg-blue-500", style: { width: "100%", padding: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: t("dashboard.summary_card.active_males", currentLang) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 176,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: activeMales }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 177,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 175,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "bg-fuchsia-500", style: { width: "100%", padding: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: t("dashboard.summary_card.active_females", currentLang) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 181,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: activeFemales }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 182,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 180,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 162,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { border: "1px solid rgba(0, 0, 0, 0.1)", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "white" }, children: [
        /* @__PURE__ */ jsxDEV("h3", { className: `text-md font-semibold p-2 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`, children: t("dashboard.summary_card.nursing_status", currentLang) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 188,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "bg-orange-500", style: { width: "100%", padding: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: t("dashboard.summary_card.cows_not_nursing", currentLang) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 191,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: nursing0 }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 192,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 190,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "bg-cyan-500", style: { width: "100%", padding: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: t("dashboard.summary_card.nursing_one_calf", currentLang) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 196,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: nursing1 }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 197,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 195,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "bg-red-500", style: { width: "100%", padding: "0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: "0.5rem" }, children: [
          /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: t("dashboard.summary_card.nursing_two_calves", currentLang) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 201,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: nursing2 }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 202,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 200,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 187,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { border: "1px solid rgba(0, 0, 0, 0.1)", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "white" }, children: [
        /* @__PURE__ */ jsxDEV("h3", { className: `text-md font-semibold p-2 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`, children: t("dashboard.summary_card.population_analysis", currentLang) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 208,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { padding: "0.75rem", height: "260px", display: "flex", justifyContent: "center", alignItems: "center" }, children: /* @__PURE__ */ jsxDEV(
          Pie,
          {
            data: {
              labels: [t("dashboard.summary_card.bulls", currentLang), t("dashboard.summary_card.cows", currentLang), t("dashboard.summary_card.deceased", currentLang)],
              datasets: [
                {
                  data: [activeMales, activeFemales, inactiveAnimals],
                  backgroundColor: [
                    "#3b82f6",
                    // azul para toros
                    "#ec4899",
                    // fucsia para vacas
                    "#6b7280"
                    // gris para fallecidos
                  ],
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: darkMode ? "#fff" : "#000",
                    font: {
                      size: 12
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.label || "";
                      let value = context.raw || 0;
                      let total = context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0);
                      let percentage = Math.round(Number(value) / total * 100);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
            lineNumber: 211,
            columnNumber: 13
          },
          this
        ) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 210,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-center mt-1", style: { color: darkMode ? "#d1d5db" : "#6b7280" }, children: [
          t("dashboard.summary_card.male_female_ratio", currentLang),
          ": ",
          activeMales,
          ":",
          activeFemales,
          " (",
          activeMales && activeFemales ? (activeMales / activeFemales).toFixed(2) : "N/A",
          ")"
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
          lineNumber: 255,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
        lineNumber: 207,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 160,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-4 text-xs text-gray-500", children: [
      t("dashboard.summary_card.last_update", currentLang),
      ": ",
      (/* @__PURE__ */ new Date()).toLocaleString()
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
      lineNumber: 262,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/ResumenOriginalCard.tsx",
    lineNumber: 147,
    columnNumber: 5
  }, this);
};
export default ResumenOriginalCard;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc3VtZW5PcmlnaW5hbENhcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGFwaVNlcnZpY2UgZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvYXBpU2VydmljZSc7XG5pbXBvcnQgeyBQaWUgfSBmcm9tICdyZWFjdC1jaGFydGpzLTInO1xuaW1wb3J0IHsgQ2hhcnQgYXMgQ2hhcnRKUywgQXJjRWxlbWVudCwgVG9vbHRpcCwgTGVnZW5kIH0gZnJvbSAnY2hhcnQuanMnO1xuaW1wb3J0IHsgdCwgZ2V0Q3VycmVudExhbmd1YWdlIH0gZnJvbSAnLi4vLi4vLi4vaTE4bi9jb25maWcnO1xuXG4vLyBSZWdpc3RyYXIgY29tcG9uZW50ZXMgZGUgQ2hhcnQuanMgbmVjZXNhcmlvcyBwYXJhIGVsIGdyw6FmaWNvIGNpcmN1bGFyXG5DaGFydEpTLnJlZ2lzdGVyKEFyY0VsZW1lbnQsIFRvb2x0aXAsIExlZ2VuZCk7XG5cbi8vIEludGVyZmFjZXNcbmludGVyZmFjZSBSZXN1bWVuT3JpZ2luYWxDYXJkUHJvcHMge1xuICBkYXJrTW9kZT86IGJvb2xlYW47XG59XG5cbi8vIENvbXBvbmVudGUgcHJpbmNpcGFsXG5jb25zdCBSZXN1bWVuT3JpZ2luYWxDYXJkOiBSZWFjdC5GQzxSZXN1bWVuT3JpZ2luYWxDYXJkUHJvcHM+ID0gKHtcbiAgZGFya01vZGUgPSBmYWxzZVxufSkgPT4ge1xuICAvLyBPYnRlbmVyIGVsIGlkaW9tYSBhY3R1YWxcbiAgY29uc3QgY3VycmVudExhbmcgPSBnZXRDdXJyZW50TGFuZ3VhZ2UoKTtcbiAgLy8gRXN0YWRvcyBwYXJhIGRhdG9zXG4gIGNvbnN0IFtzdGF0cywgc2V0U3RhdHNdID0gdXNlU3RhdGU8YW55PihudWxsKTtcbiAgY29uc3QgW2FuaW1hbGVzRGV0YWxsYWRvcywgc2V0QW5pbWFsZXNEZXRhbGxhZG9zXSA9IHVzZVN0YXRlPGFueT4obnVsbCk7XG4gIGNvbnN0IFtwZXJpb2RvRGF0YSwgc2V0UGVyaW9kb0RhdGFdID0gdXNlU3RhdGU8YW55PihudWxsKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGU8Ym9vbGVhbj4odHJ1ZSk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgLy8gQ2FyZ2FyIGRhdG9zIGFsIG1vbnRhciBlbCBjb21wb25lbnRlIHVzYW5kbyBlbCBudWV2byBlbmRwb2ludCBvcHRpbWl6YWRvXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbG9hZERhdGEgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgICAgICBjb25zb2xlLmxvZygnT2J0ZW5pZW5kbyBkYXRvcyBwYXJhIFJlc3VtZW5PcmlnaW5hbENhcmQgZGVzZGUgZW5kcG9pbnQgb3B0aW1pemFkby4uLicpO1xuICAgICAgICBcbiAgICAgICAgLy8gSU1QT1JUQU5URTogVXNhciBlbCBudWV2byBlbmRwb2ludCBvcHRpbWl6YWRvIHF1ZSBjb21iaW5hIGxhcyB0cmVzIGxsYW1hZGFzIGVuIHVuYSBzb2xhXG4gICAgICAgIC8vIEVzdG8gbWVqb3JhIHNpZ25pZmljYXRpdmFtZW50ZSBlbCByZW5kaW1pZW50byBtYW50ZW5pZW5kbyBkYXRvcyBkaW7DoW1pY29zIHkgcmVhbGVzXG4gICAgICAgIGNvbnN0IG9wdGltaXplZFJlc3BvbnNlID0gYXdhaXQgYXBpU2VydmljZS5nZXQoJy9kYXNoYm9hcmQvcmVzdW1lbi1jYXJkJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBHdWFyZGFyIHJlc3VsdGFkb3MgZGVzZGUgbGEgcmVzcHVlc3RhIGNvbWJpbmFkYVxuICAgICAgICBzZXRTdGF0cyhvcHRpbWl6ZWRSZXNwb25zZS5zdGF0cyk7XG4gICAgICAgIHNldEFuaW1hbGVzRGV0YWxsYWRvcyhvcHRpbWl6ZWRSZXNwb25zZS5hbmltYWxlc19kZXRhbGxhZG9zKTtcbiAgICAgICAgc2V0UGVyaW9kb0RhdGEob3B0aW1pemVkUmVzcG9uc2UucGVyaW9kbyk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygnRGF0b3Mgb2J0ZW5pZG9zIGNvcnJlY3RhbWVudGUgZGVzZGUgZW5kcG9pbnQgb3B0aW1pemFkbycpO1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0Vycm9yIGRlc2Nvbm9jaWRvJztcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgY2FyZ2FuZG8gZGF0b3MgZGVzZGUgZW5kcG9pbnQgb3B0aW1pemFkbzogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignSW50ZW50YW5kbyBmYWxsYmFjayBhIHBldGljaW9uZXMgaW5kaXZpZHVhbGVzLi4uJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBTaSBlbCBudWV2byBlbmRwb2ludCBmYWxsYSwgdm9sdmVtb3MgYWwgbcOpdG9kbyBhbnRlcmlvciBjb21vIGZhbGxiYWNrXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgW3N0YXRzUmVzcG9uc2UsIGFuaW1hbGVzUmVzcG9uc2UsIHBlcmlvZG9SZXNwb25zZV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBhcGlTZXJ2aWNlLmdldCgnL2Rhc2hib2FyZC9zdGF0cycpLFxuICAgICAgICAgICAgYXBpU2VydmljZS5nZXQoJy9kYXNoYm9hcmQtZGV0YWxsYWRvL2FuaW1hbGVzLWRldGFsbGFkbycpLFxuICAgICAgICAgICAgYXBpU2VydmljZS5nZXQoJy9kYXNoYm9hcmQtcGVyaW9kby9wZXJpb2RvLWRpbmFtaWNvJylcbiAgICAgICAgICBdKTtcbiAgICAgICAgICBcbiAgICAgICAgICBzZXRTdGF0cyhzdGF0c1Jlc3BvbnNlKTtcbiAgICAgICAgICBzZXRBbmltYWxlc0RldGFsbGFkb3MoYW5pbWFsZXNSZXNwb25zZSk7XG4gICAgICAgICAgc2V0UGVyaW9kb0RhdGEocGVyaW9kb1Jlc3BvbnNlKTtcbiAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgfSBjYXRjaCAoZmFsbGJhY2tFcnIpIHtcbiAgICAgICAgICBjb25zdCBmYWxsYmFja01zZyA9IGZhbGxiYWNrRXJyIGluc3RhbmNlb2YgRXJyb3IgPyBmYWxsYmFja0Vyci5tZXNzYWdlIDogJ0Vycm9yIGRlc2Nvbm9jaWRvJztcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWxsYmFjayB0YW1iacOpbiBoYSBmYWxsYWRvOiAke2ZhbGxiYWNrTXNnfWApO1xuICAgICAgICAgIHNldEVycm9yKCdFcnJvciBjYXJnYW5kbyBkYXRvcyBkZWwgZGFzaGJvYXJkLiBQb3IgZmF2b3IsIGludGVudGEgZGUgbnVldm8uJyk7XG4gICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIGxvYWREYXRhKCk7XG4gIH0sIFtdKTtcblxuICAvLyBNb3N0cmFyIGVzdGFkbyBkZSBjYXJnYVxuICBpZiAobG9hZGluZykge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhc2hib2FyZC1jYXJkXCIgc3R5bGU9e3sgZ3JpZENvbHVtbjogXCJzcGFuIDEyXCIgfX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgc3BhY2UteC0yXCI+XG4gICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJhbmltYXRlLXNwaW4gaC01IHctNSB0ZXh0LWJsdWUtNTAwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGZpbGw9XCJub25lXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgICAgICAgICAgPGNpcmNsZSBjbGFzc05hbWU9XCJvcGFjaXR5LTI1XCIgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjRcIj48L2NpcmNsZT5cbiAgICAgICAgICAgIDxwYXRoIGNsYXNzTmFtZT1cIm9wYWNpdHktNzVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk00IDEyYTggOCAwIDAxOC04VjBDNS4zNzMgMCAwIDUuMzczIDAgMTJoNHptMiA1LjI5MUE3Ljk2MiA3Ljk2MiAwIDAxNCAxMkgwYzAgMy4wNDIgMS4xMzUgNS44MjQgMyA3LjkzOGwzLTIuNjQ3elwiPjwvcGF0aD5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8c3Bhbj5DYXJnYW5kbyBkYXRvcyBkZWwgcGFuZWwgZGUgY29udHJvbC4uLjwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLy8gTW9zdHJhciBlcnJvciBzaSBleGlzdGVcbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGFzaGJvYXJkLWNhcmRcIiBzdHlsZT17eyBncmlkQ29sdW1uOiBcInNwYW4gMTJcIiB9fT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTQgYmctcmVkLTEwMCB0ZXh0LXJlZC03MDAgcm91bmRlZC1sZyBtYi00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlclwiPlxuICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3LTUgaC01IG1yLTJcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgICAgICAgIDxwYXRoIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VXaWR0aD17Mn0gZD1cIk0xMiA4djRtMCA0aC4wMU0yMSAxMmE5IDkgMCAxMS0xOCAwIDkgOSAwIDAxMTggMHpcIiAvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIC8vIENhbGN1bGFyIHRvdGFsZXMgdXNhbmRvIGxvcyBkYXRvcyBkZXRhbGxhZG9zICh1c2FuZG8gbGEgZXN0cnVjdHVyYSBjb3JyZWN0YSBkZWwgZW5kcG9pbnQpXG4gIGNvbnN0IHRvdGFsQW5pbWFscyA9IGFuaW1hbGVzRGV0YWxsYWRvcz8udG90YWwgfHwgMDtcbiAgY29uc3QgYWN0aXZlTWFsZXMgPSBhbmltYWxlc0RldGFsbGFkb3M/LnBvcl9nZW5lcm8/Lm1hY2hvcz8uYWN0aXZvcyB8fCAwO1xuICBjb25zdCBpbmFjdGl2ZU1hbGVzID0gYW5pbWFsZXNEZXRhbGxhZG9zPy5wb3JfZ2VuZXJvPy5tYWNob3M/LmZhbGxlY2lkb3MgfHwgMDtcbiAgY29uc3QgYWN0aXZlRmVtYWxlcyA9IGFuaW1hbGVzRGV0YWxsYWRvcz8ucG9yX2dlbmVybz8uaGVtYnJhcz8uYWN0aXZhcyB8fCAwO1xuICBjb25zdCBpbmFjdGl2ZUZlbWFsZXMgPSBhbmltYWxlc0RldGFsbGFkb3M/LnBvcl9nZW5lcm8/LmhlbWJyYXM/LmZhbGxlY2lkYXMgfHwgMDtcbiAgY29uc3QgYWN0aXZlQW5pbWFscyA9IGFuaW1hbGVzRGV0YWxsYWRvcz8uZ2VuZXJhbD8uYWN0aXZvcyB8fCAwO1xuICBjb25zdCBpbmFjdGl2ZUFuaW1hbHMgPSBhbmltYWxlc0RldGFsbGFkb3M/LmdlbmVyYWw/LmZhbGxlY2lkb3MgfHwgMDtcbiAgXG4gIC8vIERhdG9zIGRlIGFtYW1hbnRhbWllbnRvXG4gIGNvbnN0IG51cnNpbmcwID0gYW5pbWFsZXNEZXRhbGxhZG9zPy5wb3JfYWxsZXRhcj8uWycwJ10gfHwgMDtcbiAgY29uc3QgbnVyc2luZzEgPSBhbmltYWxlc0RldGFsbGFkb3M/LnBvcl9hbGxldGFyPy5bJzEnXSB8fCAwO1xuICBjb25zdCBudXJzaW5nMiA9IGFuaW1hbGVzRGV0YWxsYWRvcz8ucG9yX2FsbGV0YXI/LlsnMiddIHx8IDA7XG4gIFxuICAvLyBJbXByaW1pciBkYXRvcyBwYXJhIGRlYnVnZ2luZ1xuICBjb25zb2xlLmxvZygnREFUT1MgREVUQUxMQURPUyBVU0FET1M6Jywge1xuICAgIHRvdGFsQW5pbWFscyxcbiAgICBhY3RpdmVNYWxlcyxcbiAgICBpbmFjdGl2ZU1hbGVzLFxuICAgIGFjdGl2ZUZlbWFsZXMsXG4gICAgaW5hY3RpdmVGZW1hbGVzLFxuICAgIGFjdGl2ZUFuaW1hbHMsXG4gICAgaW5hY3RpdmVBbmltYWxzLFxuICAgIG51cnNpbmcwLFxuICAgIG51cnNpbmcxLFxuICAgIG51cnNpbmcyXG4gIH0pO1xuICBcbiAgLy8gVGFtYmnDqW4gaW1wcmltaXIgbGEgcmVzcHVlc3RhIG9yaWdpbmFsIHBhcmEgdmVyaWZpY2FyIGxhIGVzdHJ1Y3R1cmFcbiAgY29uc29sZS5sb2coJ1JFU1BVRVNUQSBPUklHSU5BTDonLCBhbmltYWxlc0RldGFsbGFkb3MpO1xuXG4gIC8vIEZvcm1hdG8gcGFyYSBmZWNoYXNcbiAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoIWRhdGVTdHIpIHJldHVybiAnTi9BJztcbiAgICBjb25zdCBbeWVhciwgbW9udGgsIGRheV0gPSBkYXRlU3RyLnNwbGl0KCctJyk7XG4gICAgcmV0dXJuIGAke2RheX0vJHttb250aH0vJHt5ZWFyfWA7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YGRhc2hib2FyZC1jYXJkICR7ZGFya01vZGUgPyAnYmctZ3JheS04MDAgdGV4dC13aGl0ZScgOiAnJ31gfSBzdHlsZT17eyBncmlkQ29sdW1uOiBcInNwYW4gMTJcIiB9fT5cbiAgICAgIHsvKiBDYWJlY2VyYSBjb24gcGVyw61vZG8gKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi00XCI+XG4gICAgICAgIHsvKiBUw610dWxvIGVsaW1pbmFkbyBwYXJhIGV2aXRhciBkdXBsaWNhY2nDs24gKi99XG4gICAgICAgIHtwZXJpb2RvRGF0YSAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXNtIGJnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgcm91bmRlZC1mdWxsIHB4LTMgcHktMVwiPlxuICAgICAgICAgICAge3QoJ2Rhc2hib2FyZC5zdW1tYXJ5X2NhcmQucGVyaW9kJywgY3VycmVudExhbmcpfToge3BlcmlvZG9EYXRhLmZvcm1hdG9fZmVjaGFfaW5pY2lvIHx8ICdOL0EnfSBhIHtwZXJpb2RvRGF0YS5mb3JtYXRvX2ZlY2hhX2ZpbiB8fCAnTi9BJ31cbiAgICAgICAgICAgIHtwZXJpb2RvRGF0YS5kaWFzICYmIDxzcGFuIGNsYXNzTmFtZT1cIm1sLTIgZm9udC1zZW1pYm9sZFwiPuKAoiB7cGVyaW9kb0RhdGEuZGlhc30ge3QoJ2Rhc2hib2FyZC5zdW1tYXJ5X2NhcmQuZGF5cycsIGN1cnJlbnRMYW5nKX08L3NwYW4+fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgICBcbiAgICAgIHsvKiBQcmltZXJhIGZpbGEgLSAzIHRhcmpldGFzICovfVxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogXCIxZnIgMWZyIDFmclwiLCBnYXA6IFwiMC43NXJlbVwiIH19PlxuICAgICAgICB7LyogVGFyamV0YSAxIC0gUmVzdW1lbiBkZSBBbmltYWxlcyAqL31cbiAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjEpJywgYm94U2hhZG93OiAnMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKScsIGJvcmRlclJhZGl1czogJzAuNXJlbScsIG92ZXJmbG93OiAnaGlkZGVuJywgYmFja2dyb3VuZENvbG9yOiBkYXJrTW9kZSA/ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSknIDogJ3doaXRlJyB9fT5cbiAgICAgICAgICA8aDMgY2xhc3NOYW1lPXtgdGV4dC1tZCBmb250LXNlbWlib2xkIHAtMiAke2RhcmtNb2RlID8gJ2JnLWdyYXktNzAwJyA6ICdiZy1ncmF5LTEwMCd9YH0+e3QoJ2Rhc2hib2FyZC5zdW1tYXJ5X2NhcmQuYW5pbWFsc19zdW1tYXJ5JywgY3VycmVudExhbmcpfTwvaDM+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1wdXJwbGUtNTAwXCIgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzAuNzVyZW0nLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzAuNXJlbScgfX0+XG4gICAgICAgICAgICA8aDMgc3R5bGU9e3tjb2xvcjogJ3doaXRlJywgZm9udFdlaWdodDogJ2JvbGQnLCBtYXJnaW5Cb3R0b206ICcwLjI1cmVtJ319Pnt0KCdkYXNoYm9hcmQuc3VtbWFyeV9jYXJkLnRvdGFsX2FuaW1hbHMnLCBjdXJyZW50TGFuZyl9PC9oMz5cbiAgICAgICAgICAgIDxwIHN0eWxlPXt7Y29sb3I6ICd3aGl0ZScsIGZvbnRTaXplOiAnMS43NXJlbScsIGZvbnRXZWlnaHQ6ICdib2xkJywgbWFyZ2luOiAwfX0+e3RvdGFsQW5pbWFsc308L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ncmVlbi01MDBcIiBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMC43NXJlbScsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnMC41cmVtJyB9fT5cbiAgICAgICAgICAgIDxoMyBzdHlsZT17e2NvbG9yOiAnd2hpdGUnLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbkJvdHRvbTogJzAuMjVyZW0nfX0+e3QoJ2Rhc2hib2FyZC5zdW1tYXJ5X2NhcmQuYWN0aXZlX2FuaW1hbHMnLCBjdXJyZW50TGFuZyl9PC9oMz5cbiAgICAgICAgICAgIDxwIHN0eWxlPXt7Y29sb3I6ICd3aGl0ZScsIGZvbnRTaXplOiAnMS43NXJlbScsIGZvbnRXZWlnaHQ6ICdib2xkJywgbWFyZ2luOiAwfX0+e2FjdGl2ZUFuaW1hbHN9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmx1ZS01MDBcIiBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMC43NXJlbScsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnMC41cmVtJyB9fT5cbiAgICAgICAgICAgIDxoMyBzdHlsZT17e2NvbG9yOiAnd2hpdGUnLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbkJvdHRvbTogJzAuMjVyZW0nfX0+e3QoJ2Rhc2hib2FyZC5zdW1tYXJ5X2NhcmQuYWN0aXZlX21hbGVzJywgY3VycmVudExhbmcpfTwvaDM+XG4gICAgICAgICAgICA8cCBzdHlsZT17e2NvbG9yOiAnd2hpdGUnLCBmb250U2l6ZTogJzEuNzVyZW0nLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogMH19PnthY3RpdmVNYWxlc308L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1mdWNoc2lhLTUwMFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcwLjc1cmVtJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICcwLjVyZW0nIH19PlxuICAgICAgICAgICAgPGgzIHN0eWxlPXt7Y29sb3I6ICd3aGl0ZScsIGZvbnRXZWlnaHQ6ICdib2xkJywgbWFyZ2luQm90dG9tOiAnMC4yNXJlbSd9fT57dCgnZGFzaGJvYXJkLnN1bW1hcnlfY2FyZC5hY3RpdmVfZmVtYWxlcycsIGN1cnJlbnRMYW5nKX08L2gzPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3tjb2xvcjogJ3doaXRlJywgZm9udFNpemU6ICcxLjc1cmVtJywgZm9udFdlaWdodDogJ2JvbGQnLCBtYXJnaW46IDB9fT57YWN0aXZlRmVtYWxlc308L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgey8qIFRhcmpldGEgMiAtIEFtYW1hbnRhbWllbnRvICovfVxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMSknLCBib3hTaGFkb3c6ICcwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpJywgYm9yZGVyUmFkaXVzOiAnMC41cmVtJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCBiYWNrZ3JvdW5kQ29sb3I6IGRhcmtNb2RlID8gJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKScgOiAnd2hpdGUnIH19PlxuICAgICAgICAgIDxoMyBjbGFzc05hbWU9e2B0ZXh0LW1kIGZvbnQtc2VtaWJvbGQgcC0yICR7ZGFya01vZGUgPyAnYmctZ3JheS03MDAnIDogJ2JnLWdyYXktMTAwJ31gfT57dCgnZGFzaGJvYXJkLnN1bW1hcnlfY2FyZC5udXJzaW5nX3N0YXR1cycsIGN1cnJlbnRMYW5nKX08L2gzPlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctb3JhbmdlLTUwMFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcwLjc1cmVtJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICcwLjVyZW0nIH19PlxuICAgICAgICAgICAgPGgzIHN0eWxlPXt7Y29sb3I6ICd3aGl0ZScsIGZvbnRXZWlnaHQ6ICdib2xkJywgbWFyZ2luQm90dG9tOiAnMC4yNXJlbSd9fT57dCgnZGFzaGJvYXJkLnN1bW1hcnlfY2FyZC5jb3dzX25vdF9udXJzaW5nJywgY3VycmVudExhbmcpfTwvaDM+XG4gICAgICAgICAgICA8cCBzdHlsZT17e2NvbG9yOiAnd2hpdGUnLCBmb250U2l6ZTogJzEuNzVyZW0nLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogMH19PntudXJzaW5nMH08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1jeWFuLTUwMFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcwLjc1cmVtJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICcwLjVyZW0nIH19PlxuICAgICAgICAgICAgPGgzIHN0eWxlPXt7Y29sb3I6ICd3aGl0ZScsIGZvbnRXZWlnaHQ6ICdib2xkJywgbWFyZ2luQm90dG9tOiAnMC4yNXJlbSd9fT57dCgnZGFzaGJvYXJkLnN1bW1hcnlfY2FyZC5udXJzaW5nX29uZV9jYWxmJywgY3VycmVudExhbmcpfTwvaDM+XG4gICAgICAgICAgICA8cCBzdHlsZT17e2NvbG9yOiAnd2hpdGUnLCBmb250U2l6ZTogJzEuNzVyZW0nLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogMH19PntudXJzaW5nMX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1yZWQtNTAwXCIgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzAuNzVyZW0nLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzAuNXJlbScgfX0+XG4gICAgICAgICAgICA8aDMgc3R5bGU9e3tjb2xvcjogJ3doaXRlJywgZm9udFdlaWdodDogJ2JvbGQnLCBtYXJnaW5Cb3R0b206ICcwLjI1cmVtJ319Pnt0KCdkYXNoYm9hcmQuc3VtbWFyeV9jYXJkLm51cnNpbmdfdHdvX2NhbHZlcycsIGN1cnJlbnRMYW5nKX08L2gzPlxuICAgICAgICAgICAgPHAgc3R5bGU9e3tjb2xvcjogJ3doaXRlJywgZm9udFNpemU6ICcxLjc1cmVtJywgZm9udFdlaWdodDogJ2JvbGQnLCBtYXJnaW46IDB9fT57bnVyc2luZzJ9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgIHsvKiBUYXJqZXRhIDMgLSBEaXN0cmlidWNpw7NuIHBvciBHw6luZXJvIGNvbiBncsOhZmljbyBjaXJjdWxhciAqL31cbiAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjEpJywgYm94U2hhZG93OiAnMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKScsIGJvcmRlclJhZGl1czogJzAuNXJlbScsIG92ZXJmbG93OiAnaGlkZGVuJywgYmFja2dyb3VuZENvbG9yOiBkYXJrTW9kZSA/ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSknIDogJ3doaXRlJyB9fT5cbiAgICAgICAgICA8aDMgY2xhc3NOYW1lPXtgdGV4dC1tZCBmb250LXNlbWlib2xkIHAtMiAke2RhcmtNb2RlID8gJ2JnLWdyYXktNzAwJyA6ICdiZy1ncmF5LTEwMCd9YH0+e3QoJ2Rhc2hib2FyZC5zdW1tYXJ5X2NhcmQucG9wdWxhdGlvbl9hbmFseXNpcycsIGN1cnJlbnRMYW5nKX08L2gzPlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzAuNzVyZW0nLCBoZWlnaHQ6ICcyNjBweCcsIGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9fT5cbiAgICAgICAgICAgIDxQaWUgXG4gICAgICAgICAgICAgIGRhdGE9e3tcbiAgICAgICAgICAgICAgICBsYWJlbHM6IFt0KCdkYXNoYm9hcmQuc3VtbWFyeV9jYXJkLmJ1bGxzJywgY3VycmVudExhbmcpLCB0KCdkYXNoYm9hcmQuc3VtbWFyeV9jYXJkLmNvd3MnLCBjdXJyZW50TGFuZyksIHQoJ2Rhc2hib2FyZC5zdW1tYXJ5X2NhcmQuZGVjZWFzZWQnLCBjdXJyZW50TGFuZyldLFxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFthY3RpdmVNYWxlcywgYWN0aXZlRmVtYWxlcywgaW5hY3RpdmVBbmltYWxzXSxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXG4gICAgICAgICAgICAgICAgICAgICAgJyMzYjgyZjYnLCAvLyBhenVsIHBhcmEgdG9yb3NcbiAgICAgICAgICAgICAgICAgICAgICAnI2VjNDg5OScsIC8vIGZ1Y3NpYSBwYXJhIHZhY2FzXG4gICAgICAgICAgICAgICAgICAgICAgJyM2YjcyODAnLCAvLyBncmlzIHBhcmEgZmFsbGVjaWRvc1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgb3B0aW9ucz17e1xuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcGx1Z2luczoge1xuICAgICAgICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAndG9wJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGRhcmtNb2RlID8gJyNmZmYnIDogJyMwMDAnLFxuICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IDEyXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZnVuY3Rpb24oY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxhYmVsID0gY29udGV4dC5sYWJlbCB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IGNvbnRleHQucmF3IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdG90YWwgPSBjb250ZXh0LmRhdGFzZXQuZGF0YS5yZWR1Y2UoKGEsIGIpID0+IE51bWJlcihhKSArIE51bWJlcihiKSwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGVyY2VudGFnZSA9IE1hdGgucm91bmQoKE51bWJlcih2YWx1ZSkgLyB0b3RhbCkgKiAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2xhYmVsfTogJHt2YWx1ZX0gKCR7cGVyY2VudGFnZX0lKWA7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1jZW50ZXIgbXQtMVwiIHN0eWxlPXt7IGNvbG9yOiBkYXJrTW9kZSA/ICcjZDFkNWRiJyA6ICcjNmI3MjgwJyB9fT5cbiAgICAgICAgICAgIHt0KCdkYXNoYm9hcmQuc3VtbWFyeV9jYXJkLm1hbGVfZmVtYWxlX3JhdGlvJywgY3VycmVudExhbmcpfToge2FjdGl2ZU1hbGVzfTp7YWN0aXZlRmVtYWxlc30gKHthY3RpdmVNYWxlcyAmJiBhY3RpdmVGZW1hbGVzID8gKGFjdGl2ZU1hbGVzIC8gYWN0aXZlRmVtYWxlcykudG9GaXhlZCgyKSA6ICdOL0EnfSlcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIFxuICAgICAgey8qIERhdG9zIGFkaWNpb25hbGVzICovfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgdGV4dC1ncmF5LTUwMFwiPlxuICAgICAgICB7dCgnZGFzaGJvYXJkLnN1bW1hcnlfY2FyZC5sYXN0X3VwZGF0ZScsIGN1cnJlbnRMYW5nKX06IHtuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKCl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJlc3VtZW5PcmlnaW5hbENhcmQ7XG4iXSwibWFwcGluZ3MiOiJBQWtGWTtBQWxGWixPQUFPLFNBQVMsVUFBVSxpQkFBaUI7QUFDM0MsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxXQUFXO0FBQ3BCLFNBQVMsU0FBUyxTQUFTLFlBQVksU0FBUyxjQUFjO0FBQzlELFNB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