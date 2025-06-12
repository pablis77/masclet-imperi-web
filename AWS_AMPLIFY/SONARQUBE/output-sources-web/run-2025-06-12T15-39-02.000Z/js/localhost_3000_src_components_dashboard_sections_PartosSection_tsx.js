import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useEffect = __vite__cjsImport1_react["useEffect"]; const useState = __vite__cjsImport1_react["useState"];
import { MonthlyChart, GenderCriaChart, TrendChart, DistribucionAnualChart, DistribucionMensualChart } from "/src/components/dashboard/components/ChartComponents.tsx";
import { StatCard, DashboardCard, CardLabel } from "/src/components/dashboard/components/UIComponents.tsx";
import { t } from "/src/i18n/config.ts";
const getMaxYear = (distribucion) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return "N/A";
  }
  const entries = Object.entries(distribucion);
  if (entries.length === 0) return "N/A";
  const maxEntry = entries.reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  }, entries[0]);
  return `${maxEntry[0]} (${maxEntry[1]} partos)`;
};
const getMinYear = (distribucion) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return "N/A";
  }
  const entriesConValor = Object.entries(distribucion).filter((entry) => entry[1] > 0);
  if (entriesConValor.length === 0) return "N/A";
  const minEntry = entriesConValor.reduce((min, current) => {
    return current[1] < min[1] ? current : min;
  }, entriesConValor[0]);
  return `${minEntry[0]} (${minEntry[1]} parto${minEntry[1] !== 1 ? "s" : ""})`;
};
const getFirstYear = (distribucion) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return "N/A";
  }
  const añosConPartos = Object.entries(distribucion).filter(([_, value]) => value > 0).map(([year]) => year);
  if (añosConPartos.length === 0) return "N/A";
  const primerAño = añosConPartos.sort((a, b) => parseInt(a) - parseInt(b))[0];
  return primerAño;
};
const getLastYear = (distribucion) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return "N/A";
  }
  const añosConPartos = Object.entries(distribucion).filter(([_, value]) => value > 0).map(([year]) => year);
  if (añosConPartos.length === 0) return "N/A";
  const ultimoAño = añosConPartos.sort((a, b) => parseInt(b) - parseInt(a))[0];
  const partosUltimoAño = distribucion[ultimoAño];
  return `${ultimoAño} (${partosUltimoAño} parto${partosUltimoAño !== 1 ? "s" : ""})`;
};
const getPartosCurrentYear = (distribucion) => {
  if (!distribucion) return 0;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear().toString();
  return distribucion[currentYear] || 0;
};
const getTotalPartos = (distribucion) => {
  if (!distribucion || Object.keys(distribucion).length === 0) {
    return 0;
  }
  return Object.values(distribucion).reduce((total, count) => total + count, 0);
};
const PartosSection = ({
  statsData,
  partosData,
  darkMode,
  loading,
  error
}) => {
  const [currentLang, setCurrentLang] = useState("es");
  useEffect(() => {
    const userLanguage = localStorage.getItem("userLanguage");
    if (userLanguage) {
      setCurrentLang(userLanguage);
    }
    const handleLanguageChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLanguageChange);
    return () => {
      window.removeEventListener("storage", handleLanguageChange);
    };
  }, []);
  useEffect(() => {
    if (statsData && statsData.partos) {
      console.log("DATOS MENSUALES RECIBIDOS:", statsData.partos.por_mes);
      console.log("TIPO DE DATOS:", typeof statsData.partos.por_mes);
      console.log("CLAVES:", Object.keys(statsData.partos.por_mes || {}));
      console.log("VALORES:", Object.values(statsData.partos.por_mes || {}));
      console.log("DATOS ANUALES RECIBIDOS:", statsData.partos.distribucion_anual);
      console.log("TIPO DE DATOS:", typeof statsData.partos.distribucion_anual);
      console.log("CLAVES:", Object.keys(statsData.partos.distribucion_anual || {}));
    }
  }, [statsData]);
  if (loading) {
    return /* @__PURE__ */ jsxDEV("div", { className: "col-span-12 text-center py-4", children: t("dashboard.loading", currentLang) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
      lineNumber: 152,
      columnNumber: 12
    }, this);
  }
  if (error) {
    return /* @__PURE__ */ jsxDEV("div", { className: "col-span-12 text-center py-4 text-red-500", children: [
      t("dashboard.loading_error", currentLang),
      ": ",
      error
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
      lineNumber: 157,
      columnNumber: 7
    }, this);
  }
  if (!statsData || !partosData) {
    return /* @__PURE__ */ jsxDEV("div", { className: "col-span-12 text-center py-4", children: t("common.no_results", currentLang) }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
      lineNumber: 164,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "dashboard-card", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold mb-4", children: t("dashboard.partos_analysis", currentLang) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 171,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxDEV(
          StatCard,
          {
            title: t("dashboard.partos_count", currentLang),
            value: statsData.partos.total,
            color: "bg-blue-500",
            darkMode,
            translationKey: "dashboard.partos_count"
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 173,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          StatCard,
          {
            title: currentLang === "ca" ? "Maig" : "Mayo",
            value: statsData.partos.ultimo_mes,
            color: "bg-cyan-500",
            darkMode
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 180,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 172,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-4", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxDEV(
          StatCard,
          {
            title: (/* @__PURE__ */ new Date()).getFullYear().toString(),
            value: getPartosCurrentYear(statsData.partos.distribucion_anual),
            color: "bg-cyan-500",
            darkMode
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 190,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          StatCard,
          {
            title: currentLang === "ca" ? "Supervivència" : "Supervivencia",
            value: `${((statsData.partos.tasa_supervivencia || 0) * 100).toFixed(1)}%`,
            color: "bg-emerald-500",
            darkMode
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 196,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 188,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
      lineNumber: 170,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "dashboard-card", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold mb-4", children: currentLang === "ca" ? "Distribució mensual" : "Distribución mensual" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 207,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { height: "300px" }, children: /* @__PURE__ */ jsxDEV(DistribucionMensualChart, { darkMode, data: statsData.partos.por_mes }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 209,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 208,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-center mt-2", style: { color: darkMode ? "#d1d5db" : "#6b7280" }, children: currentLang === "ca" ? "Distribució mensual de parts" : "Distribución mensual de partos" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 211,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-center mt-1", style: { color: darkMode ? "rgba(209, 213, 219, 0.6)" : "rgba(107, 114, 128, 0.6)" }, children: /* @__PURE__ */ jsxDEV("span", { style: { fontSize: "9px" }, children: currentLang === "ca" ? `Mes amb més parts: Març (46), mes amb menys parts: Agost (4)` : `Mes con más partos: Marzo (46), mes con menos partos: Agosto (4)` }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 215,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 214,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
      lineNumber: 206,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "dashboard-card", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold mb-4", children: currentLang === "ca" ? "Distribució anual detallada" : "Distribución anual detallada" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 226,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { height: "300px" }, children: /* @__PURE__ */ jsxDEV(
        DistribucionAnualChart,
        {
          darkMode,
          data: statsData.partos.distribucion_anual
        },
        void 0,
        false,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 229,
          columnNumber: 11
        },
        this
      ) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 228,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("pre", { style: { display: "none", fontSize: "8px", maxHeight: "80px", overflow: "auto", margin: "0", padding: "4px", backgroundColor: darkMode ? "#1e293b" : "#f1f5f9", borderRadius: "4px" }, children: JSON.stringify(statsData.partos.distribucion_anual, null, 2) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 236,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center mt-3", style: { color: darkMode ? "#d1d5db" : "#6b7280", fontWeight: "bold" }, children: currentLang === "ca" ? "Distribució anual de parts (dades reals)" : "Distribución anual de partos (datos reales)" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 239,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2 mt-3 mb-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center p-2", style: {
          backgroundColor: darkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
          borderRadius: "6px",
          fontWeight: "semibold"
        }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Any amb ",
          /* @__PURE__ */ jsxDEV("strong", { children: "més" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 251,
            columnNumber: 27
          }, this),
          " parts:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 251,
            columnNumber: 54
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getMaxYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 251,
            columnNumber: 59
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 251,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Año con ",
          /* @__PURE__ */ jsxDEV("strong", { children: "más" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 252,
            columnNumber: 27
          }, this),
          " partos:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 252,
            columnNumber: 55
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getMaxYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 252,
            columnNumber: 60
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 252,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 245,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center p-2", style: {
          backgroundColor: darkMode ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)",
          borderRadius: "6px",
          fontWeight: "semibold"
        }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Any amb ",
          /* @__PURE__ */ jsxDEV("strong", { children: "menys" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 261,
            columnNumber: 27
          }, this),
          " parts:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 261,
            columnNumber: 56
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getMinYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 261,
            columnNumber: 61
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 261,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Año con ",
          /* @__PURE__ */ jsxDEV("strong", { children: "menos" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 262,
            columnNumber: 27
          }, this),
          " partos:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 262,
            columnNumber: 57
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getMinYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 262,
            columnNumber: 62
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 262,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 255,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 244,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2 mt-1", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center p-2", style: {
          backgroundColor: darkMode ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.1)",
          borderRadius: "6px",
          fontWeight: "semibold"
        }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Primer any amb parts:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 274,
            columnNumber: 40
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getFirstYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 274,
            columnNumber: 45
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 274,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Primer año con partos:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 275,
            columnNumber: 41
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getFirstYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 275,
            columnNumber: 46
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 275,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 268,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center p-2", style: {
          backgroundColor: darkMode ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.1)",
          borderRadius: "6px",
          fontWeight: "semibold"
        }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Últim any amb parts:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 284,
            columnNumber: 39
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getLastYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 284,
            columnNumber: 44
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 284,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          "Último año con partos:",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 285,
            columnNumber: 41
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-lg font-bold", children: getLastYear(statsData.partos.distribucion_anual) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 285,
            columnNumber: 46
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 285,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 278,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 267,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center mt-3", style: { color: darkMode ? "#d1d5db" : "#6b7280", fontWeight: "bold" }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
        "Total: ",
        /* @__PURE__ */ jsxDEV("span", { className: "text-lg", children: [
          statsData.partos.total,
          " parts"
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 292,
          columnNumber: 24
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 292,
        columnNumber: 15
      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        "Total: ",
        /* @__PURE__ */ jsxDEV("span", { className: "text-lg", children: [
          statsData.partos.total,
          " partos"
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 293,
          columnNumber: 24
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 293,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 290,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
      lineNumber: 225,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "dashboard-card", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold mb-4", children: t("dashboard.gender_distribution", currentLang) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 300,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { height: "270px", display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ jsxDEV(GenderCriaChart, { data: statsData.partos.por_genero_cria, darkMode }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 302,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 301,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-4 mt-4 mb-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center p-2", style: {
          backgroundColor: darkMode ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)",
          borderRadius: "6px",
          border: "1px solid rgba(37, 99, 235, 0.3)",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
        }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "font-semibold", children: "Mascles" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 314,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-2xl font-bold mt-1", children: statsData.partos.por_genero_cria?.M || 0 }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 315,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-1", children: [
            "(",
            ((statsData.partos.por_genero_cria?.M || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)) * 100).toFixed(1),
            "% del total)"
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 316,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 313,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "font-semibold", children: "Machos" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 319,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-2xl font-bold mt-1", children: statsData.partos.por_genero_cria?.M || 0 }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 320,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-1", children: [
            "(",
            ((statsData.partos.por_genero_cria?.M || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)) * 100).toFixed(1),
            "% del total)"
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 321,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 318,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 306,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center p-2", style: {
          backgroundColor: darkMode ? "rgba(236, 72, 153, 0.2)" : "rgba(236, 72, 153, 0.1)",
          borderRadius: "6px",
          border: "1px solid rgba(236, 72, 153, 0.3)",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
        }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "font-semibold", children: "Femelles" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 334,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-2xl font-bold mt-1", children: statsData.partos.por_genero_cria?.F || 0 }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 335,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-1", children: [
            "(",
            ((statsData.partos.por_genero_cria?.F || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)) * 100).toFixed(1),
            "% del total)"
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 336,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 333,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "font-semibold", children: "Hembras" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 339,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-2xl font-bold mt-1", children: statsData.partos.por_genero_cria?.F || 0 }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 340,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-1", children: [
            "(",
            ((statsData.partos.por_genero_cria?.F || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)) * 100).toFixed(1),
            "% del total)"
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
            lineNumber: 341,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 338,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 326,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 305,
        columnNumber: 9
      }, this),
      (statsData.partos.por_genero_cria?.esforrada || 0) > 0 && /* @__PURE__ */ jsxDEV("div", { className: "mt-2 text-sm text-center p-2", style: {
        backgroundColor: darkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(107, 114, 128, 0.1)",
        borderRadius: "6px",
        border: "1px solid rgba(107, 114, 128, 0.3)"
      }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "font-semibold", children: "Esforrada" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 355,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-lg font-bold mt-1", children: statsData.partos.por_genero_cria?.esforrada || 0 }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 356,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-1", children: [
          "(",
          ((statsData.partos.por_genero_cria?.esforrada || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)) * 100).toFixed(1),
          "% del total)"
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 357,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 354,
        columnNumber: 17
      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "font-semibold", children: "Esforrada" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 360,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-lg font-bold mt-1", children: statsData.partos.por_genero_cria?.esforrada || 0 }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 361,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-1", children: [
          "(",
          ((statsData.partos.por_genero_cria?.esforrada || 0) / ((statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0)) * 100).toFixed(1),
          "% del total)"
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 362,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 359,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 348,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-center mt-3", style: { color: darkMode ? "#d1d5db" : "#6b7280", fontWeight: "bold" }, children: currentLang === "ca" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
        "Total crías: ",
        /* @__PURE__ */ jsxDEV("span", { className: "text-lg", children: (statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 370,
          columnNumber: 30
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 370,
        columnNumber: 15
      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        "Total crías: ",
        /* @__PURE__ */ jsxDEV("span", { className: "text-lg", children: (statsData.partos.por_genero_cria?.M || 0) + (statsData.partos.por_genero_cria?.F || 0) + (statsData.partos.por_genero_cria?.esforrada || 0) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
          lineNumber: 371,
          columnNumber: 30
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 371,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
        lineNumber: 368,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
      lineNumber: 299,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/sections/PartosSection.tsx",
    lineNumber: 168,
    columnNumber: 5
  }, this);
};
export default PartosSection;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhcnRvc1NlY3Rpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTW9udGhseUNoYXJ0LCBHZW5kZXJDcmlhQ2hhcnQsIFRyZW5kQ2hhcnQsIERpc3RyaWJ1Y2lvbkFudWFsQ2hhcnQsIERpc3RyaWJ1Y2lvbk1lbnN1YWxDaGFydCB9IGZyb20gJy4uL2NvbXBvbmVudHMvQ2hhcnRDb21wb25lbnRzJztcbmltcG9ydCB7IFN0YXRDYXJkLCBEYXNoYm9hcmRDYXJkLCBDYXJkTGFiZWwgfSBmcm9tICcuLi9jb21wb25lbnRzL1VJQ29tcG9uZW50cyc7XG5pbXBvcnQgdHlwZSB7IERhc2hib2FyZFN0YXRzLCBQYXJ0b3NTdGF0cyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IHQgfSBmcm9tICcuLi8uLi8uLi9pMThuL2NvbmZpZyc7XG5cbi8vIEZ1bmNpw7NuIHBhcmEgb2J0ZW5lciBlbCBhw7FvIGNvbiBtw6FzIHBhcnRvc1xuY29uc3QgZ2V0TWF4WWVhciA9IChkaXN0cmlidWNpb24/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB7XG4gIGlmICghZGlzdHJpYnVjaW9uIHx8IE9iamVjdC5rZXlzKGRpc3RyaWJ1Y2lvbikubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdOL0EnO1xuICB9XG5cbiAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGRpc3RyaWJ1Y2lvbik7XG4gIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICdOL0EnO1xuICBcbiAgY29uc3QgbWF4RW50cnkgPSBlbnRyaWVzLnJlZHVjZSgobWF4LCBjdXJyZW50KSA9PiB7XG4gICAgcmV0dXJuIGN1cnJlbnRbMV0gPiBtYXhbMV0gPyBjdXJyZW50IDogbWF4O1xuICB9LCBlbnRyaWVzWzBdKTtcbiAgXG4gIHJldHVybiBgJHttYXhFbnRyeVswXX0gKCR7bWF4RW50cnlbMV19IHBhcnRvcylgO1xufTtcblxuLy8gRnVuY2nDs24gcGFyYSBvYnRlbmVyIGVsIGHDsW8gY29uIG1lbm9zIHBhcnRvc1xuY29uc3QgZ2V0TWluWWVhciA9IChkaXN0cmlidWNpb24/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB7XG4gIGlmICghZGlzdHJpYnVjaW9uIHx8IE9iamVjdC5rZXlzKGRpc3RyaWJ1Y2lvbikubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdOL0EnO1xuICB9XG5cbiAgLy8gRmlsdHJhciB2YWxvcmVzIG1heW9yZXMgcXVlIDBcbiAgY29uc3QgZW50cmllc0NvblZhbG9yID0gT2JqZWN0LmVudHJpZXMoZGlzdHJpYnVjaW9uKS5maWx0ZXIoZW50cnkgPT4gZW50cnlbMV0gPiAwKTtcbiAgXG4gIGlmIChlbnRyaWVzQ29uVmFsb3IubGVuZ3RoID09PSAwKSByZXR1cm4gJ04vQSc7XG4gIFxuICBjb25zdCBtaW5FbnRyeSA9IGVudHJpZXNDb25WYWxvci5yZWR1Y2UoKG1pbiwgY3VycmVudCkgPT4ge1xuICAgIHJldHVybiBjdXJyZW50WzFdIDwgbWluWzFdID8gY3VycmVudCA6IG1pbjtcbiAgfSwgZW50cmllc0NvblZhbG9yWzBdKTtcbiAgXG4gIHJldHVybiBgJHttaW5FbnRyeVswXX0gKCR7bWluRW50cnlbMV19IHBhcnRvJHttaW5FbnRyeVsxXSAhPT0gMSA/ICdzJyA6ICcnfSlgO1xufTtcblxuLy8gRnVuY2nDs24gcGFyYSBvYnRlbmVyIGVsIHByaW1lciBhw7FvIGNvbiBwYXJ0b3NcbmNvbnN0IGdldEZpcnN0WWVhciA9IChkaXN0cmlidWNpb24/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB7XG4gIGlmICghZGlzdHJpYnVjaW9uIHx8IE9iamVjdC5rZXlzKGRpc3RyaWJ1Y2lvbikubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdOL0EnO1xuICB9XG5cbiAgLy8gRmlsdHJhciBhw7FvcyBjb24gYWwgbWVub3MgdW4gcGFydG9cbiAgY29uc3QgYcOxb3NDb25QYXJ0b3MgPSBPYmplY3QuZW50cmllcyhkaXN0cmlidWNpb24pXG4gICAgLmZpbHRlcigoW18sIHZhbHVlXSkgPT4gdmFsdWUgPiAwKVxuICAgIC5tYXAoKFt5ZWFyXSkgPT4geWVhcik7XG4gIFxuICBpZiAoYcOxb3NDb25QYXJ0b3MubGVuZ3RoID09PSAwKSByZXR1cm4gJ04vQSc7XG4gIFxuICAvLyBPcmRlbmFyIGHDsW9zIG51bcOpcmljYW1lbnRlXG4gIGNvbnN0IHByaW1lckHDsW8gPSBhw7Fvc0NvblBhcnRvcy5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhKSAtIHBhcnNlSW50KGIpKVswXTtcbiAgXG4gIHJldHVybiBwcmltZXJBw7FvO1xufTtcblxuLy8gRnVuY2nDs24gcGFyYSBvYnRlbmVyIGVsIMO6bHRpbW8gYcOxbyBjb24gcGFydG9zXG5jb25zdCBnZXRMYXN0WWVhciA9IChkaXN0cmlidWNpb24/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB7XG4gIGlmICghZGlzdHJpYnVjaW9uIHx8IE9iamVjdC5rZXlzKGRpc3RyaWJ1Y2lvbikubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdOL0EnO1xuICB9XG5cbiAgLy8gRmlsdHJhciBhw7FvcyBjb24gYWwgbWVub3MgdW4gcGFydG9cbiAgY29uc3QgYcOxb3NDb25QYXJ0b3MgPSBPYmplY3QuZW50cmllcyhkaXN0cmlidWNpb24pXG4gICAgLmZpbHRlcigoW18sIHZhbHVlXSkgPT4gdmFsdWUgPiAwKVxuICAgIC5tYXAoKFt5ZWFyXSkgPT4geWVhcik7XG4gIFxuICBpZiAoYcOxb3NDb25QYXJ0b3MubGVuZ3RoID09PSAwKSByZXR1cm4gJ04vQSc7XG4gIFxuICAvLyBPcmRlbmFyIGHDsW9zIG51bcOpcmljYW1lbnRlXG4gIGNvbnN0IHVsdGltb0HDsW8gPSBhw7Fvc0NvblBhcnRvcy5zb3J0KChhLCBiKSA9PiBwYXJzZUludChiKSAtIHBhcnNlSW50KGEpKVswXTtcbiAgY29uc3QgcGFydG9zVWx0aW1vQcOxbyA9IGRpc3RyaWJ1Y2lvblt1bHRpbW9Bw7FvXTtcbiAgXG4gIHJldHVybiBgJHt1bHRpbW9Bw7FvfSAoJHtwYXJ0b3NVbHRpbW9Bw7FvfSBwYXJ0byR7cGFydG9zVWx0aW1vQcOxbyAhPT0gMSA/ICdzJyA6ICcnfSlgO1xufTtcblxuLy8gRnVuY2nDs24gcGFyYSBvYnRlbmVyIGxvcyBwYXJ0b3MgZGVsIGHDsW8gYWN0dWFsXG5jb25zdCBnZXRQYXJ0b3NDdXJyZW50WWVhciA9IChkaXN0cmlidWNpb24/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB7XG4gIGlmICghZGlzdHJpYnVjaW9uKSByZXR1cm4gMDtcbiAgXG4gIGNvbnN0IGN1cnJlbnRZZWFyID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gIHJldHVybiBkaXN0cmlidWNpb25bY3VycmVudFllYXJdIHx8IDA7XG59O1xuXG4vLyBGdW5jacOzbiBwYXJhIG9idGVuZXIgZWwgdG90YWwgZGUgcGFydG9zXG5jb25zdCBnZXRUb3RhbFBhcnRvcyA9IChkaXN0cmlidWNpb24/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB7XG4gIGlmICghZGlzdHJpYnVjaW9uIHx8IE9iamVjdC5rZXlzKGRpc3RyaWJ1Y2lvbikubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhkaXN0cmlidWNpb24pLnJlZHVjZSgodG90YWwsIGNvdW50KSA9PiB0b3RhbCArIGNvdW50LCAwKTtcbn07XG5cbi8vIFNlY2Npw7NuIGRlIFBhcnRvcyBleHRyYcOtZGEgZGlyZWN0YW1lbnRlIGRlbCBkYXNoYm9hcmQgb3JpZ2luYWxcbi8vIEVYQUNUQU1FTlRFIGNvbiBsYSBtaXNtYSBlc3RydWN0dXJhIHZpc3VhbFxuaW50ZXJmYWNlIFBhcnRvc1NlY3Rpb25Qcm9wcyB7XG4gIHN0YXRzRGF0YTogRGFzaGJvYXJkU3RhdHMgfCBudWxsO1xuICBwYXJ0b3NEYXRhOiBQYXJ0b3NTdGF0cyB8IG51bGw7XG4gIGRhcmtNb2RlOiBib29sZWFuO1xuICBsb2FkaW5nOiBib29sZWFuO1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbDtcbn1cblxuY29uc3QgUGFydG9zU2VjdGlvbjogUmVhY3QuRkM8UGFydG9zU2VjdGlvblByb3BzPiA9ICh7IFxuICBzdGF0c0RhdGEsIFxuICBwYXJ0b3NEYXRhLFxuICBkYXJrTW9kZSwgXG4gIGxvYWRpbmcsIFxuICBlcnJvciBcbn0pID0+IHtcbiAgLy8gT2J0ZW5lciBpZGlvbWEgYWN0dWFsIGRlbCBsb2NhbFN0b3JhZ2VcbiAgY29uc3QgW2N1cnJlbnRMYW5nLCBzZXRDdXJyZW50TGFuZ10gPSB1c2VTdGF0ZSgnZXMnKTtcbiAgXG4gIC8vIE9idGVuZXIgaWRpb21hIGFjdHVhbCBjdWFuZG8gc2UgY2FyZ2EgZWwgY29tcG9uZW50ZVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHVzZXJMYW5ndWFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyTGFuZ3VhZ2UnKTtcbiAgICBpZiAodXNlckxhbmd1YWdlKSB7XG4gICAgICBzZXRDdXJyZW50TGFuZyh1c2VyTGFuZ3VhZ2UpO1xuICAgIH1cbiAgICBcbiAgICAvLyBGdW5jacOzbiBwYXJhIG1hbmVqYXIgY2FtYmlvcyBkZSBpZGlvbWFcbiAgICBjb25zdCBoYW5kbGVMYW5ndWFnZUNoYW5nZSA9IChlOiBTdG9yYWdlRXZlbnQpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ3VzZXJMYW5ndWFnZScpIHtcbiAgICAgICAgc2V0Q3VycmVudExhbmcoZS5uZXdWYWx1ZSB8fCAnZXMnKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UpO1xuICAgIFxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGhhbmRsZUxhbmd1YWdlQ2hhbmdlKTtcbiAgICB9O1xuICB9LCBbXSk7XG4gIFxuICAvLyBERVBVUkFDScOTTjogVmVyIGV4YWN0YW1lbnRlIHF1w6kgZGF0b3MgZXN0w6FuIGxsZWdhbmRvXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHN0YXRzRGF0YSAmJiBzdGF0c0RhdGEucGFydG9zKSB7XG4gICAgICBjb25zb2xlLmxvZygnREFUT1MgTUVOU1VBTEVTIFJFQ0lCSURPUzonLCBzdGF0c0RhdGEucGFydG9zLnBvcl9tZXMpO1xuICAgICAgY29uc29sZS5sb2coJ1RJUE8gREUgREFUT1M6JywgdHlwZW9mIHN0YXRzRGF0YS5wYXJ0b3MucG9yX21lcyk7XG4gICAgICBjb25zb2xlLmxvZygnQ0xBVkVTOicsIE9iamVjdC5rZXlzKHN0YXRzRGF0YS5wYXJ0b3MucG9yX21lcyB8fCB7fSkpO1xuICAgICAgY29uc29sZS5sb2coJ1ZBTE9SRVM6JywgT2JqZWN0LnZhbHVlcyhzdGF0c0RhdGEucGFydG9zLnBvcl9tZXMgfHwge30pKTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ0RBVE9TIEFOVUFMRVMgUkVDSUJJRE9TOicsIHN0YXRzRGF0YS5wYXJ0b3MuZGlzdHJpYnVjaW9uX2FudWFsKTtcbiAgICAgIGNvbnNvbGUubG9nKCdUSVBPIERFIERBVE9TOicsIHR5cGVvZiBzdGF0c0RhdGEucGFydG9zLmRpc3RyaWJ1Y2lvbl9hbnVhbCk7XG4gICAgICBjb25zb2xlLmxvZygnQ0xBVkVTOicsIE9iamVjdC5rZXlzKHN0YXRzRGF0YS5wYXJ0b3MuZGlzdHJpYnVjaW9uX2FudWFsIHx8IHt9KSk7XG4gICAgfVxuICB9LCBbc3RhdHNEYXRhXSk7XG4gIGlmIChsb2FkaW5nKSB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwiY29sLXNwYW4tMTIgdGV4dC1jZW50ZXIgcHktNFwiPnt0KCdkYXNoYm9hcmQubG9hZGluZycsIGN1cnJlbnRMYW5nKX08L2Rpdj47XG4gIH1cbiAgXG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1zcGFuLTEyIHRleHQtY2VudGVyIHB5LTQgdGV4dC1yZWQtNTAwXCI+XG4gICAgICAgIHt0KCdkYXNoYm9hcmQubG9hZGluZ19lcnJvcicsIGN1cnJlbnRMYW5nKX06IHtlcnJvcn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbiAgXG4gIGlmICghc3RhdHNEYXRhIHx8ICFwYXJ0b3NEYXRhKSB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwiY29sLXNwYW4tMTIgdGV4dC1jZW50ZXIgcHktNFwiPnt0KCdjb21tb24ubm9fcmVzdWx0cycsIGN1cnJlbnRMYW5nKX08L2Rpdj47XG4gIH1cbiAgXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGdhcC02XCI+XG4gICAgICB7LyogUmVzdW1lbiBkZSBQYXJ0b3MgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhc2hib2FyZC1jYXJkXCI+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgbWItNFwiPnt0KCdkYXNoYm9hcmQucGFydG9zX2FuYWx5c2lzJywgY3VycmVudExhbmcpfTwvaDM+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IFwiMWZyIDFmclwiLCBnYXA6IFwiMC43NXJlbVwiIH19PlxuICAgICAgICAgIDxTdGF0Q2FyZFxuICAgICAgICAgICAgdGl0bGU9e3QoJ2Rhc2hib2FyZC5wYXJ0b3NfY291bnQnLCBjdXJyZW50TGFuZyl9XG4gICAgICAgICAgICB2YWx1ZT17c3RhdHNEYXRhLnBhcnRvcy50b3RhbH1cbiAgICAgICAgICAgIGNvbG9yPVwiYmctYmx1ZS01MDBcIlxuICAgICAgICAgICAgZGFya01vZGU9e2RhcmtNb2RlfVxuICAgICAgICAgICAgdHJhbnNsYXRpb25LZXk9XCJkYXNoYm9hcmQucGFydG9zX2NvdW50XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxTdGF0Q2FyZFxuICAgICAgICAgICAgdGl0bGU9e2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJNYWlnXCIgOiBcIk1heW9cIn1cbiAgICAgICAgICAgIHZhbHVlPXtzdGF0c0RhdGEucGFydG9zLnVsdGltb19tZXN9XG4gICAgICAgICAgICBjb2xvcj1cImJnLWN5YW4tNTAwXCJcbiAgICAgICAgICAgIGRhcmtNb2RlPXtkYXJrTW9kZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNFwiIHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBcIjFmciAxZnJcIiwgZ2FwOiBcIjAuNzVyZW1cIiB9fT5cbiAgICAgICAgICB7LyogUGFydG9zIGRlbCBhw7FvIGFjdHVhbCAoMjAyNSkgKi99XG4gICAgICAgICAgPFN0YXRDYXJkXG4gICAgICAgICAgICB0aXRsZT17bmV3IERhdGUoKS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCl9XG4gICAgICAgICAgICB2YWx1ZT17Z2V0UGFydG9zQ3VycmVudFllYXIoc3RhdHNEYXRhLnBhcnRvcy5kaXN0cmlidWNpb25fYW51YWwpfVxuICAgICAgICAgICAgY29sb3I9XCJiZy1jeWFuLTUwMFwiXG4gICAgICAgICAgICBkYXJrTW9kZT17ZGFya01vZGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8U3RhdENhcmRcbiAgICAgICAgICAgIHRpdGxlPXtjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiU3VwZXJ2aXbDqG5jaWFcIiA6IFwiU3VwZXJ2aXZlbmNpYVwifVxuICAgICAgICAgICAgdmFsdWU9e2Akeygoc3RhdHNEYXRhLnBhcnRvcy50YXNhX3N1cGVydml2ZW5jaWEgfHwgMCkgKiAxMDApLnRvRml4ZWQoMSl9JWB9XG4gICAgICAgICAgICBjb2xvcj1cImJnLWVtZXJhbGQtNTAwXCJcbiAgICAgICAgICAgIGRhcmtNb2RlPXtkYXJrTW9kZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICB7LyogRGlzdHJpYnVjacOzbiBNZW5zdWFsIC0gTlVFVkEgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhc2hib2FyZC1jYXJkXCI+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgbWItNFwiPntjdXJyZW50TGFuZyA9PT0gJ2NhJyA/IFwiRGlzdHJpYnVjacOzIG1lbnN1YWxcIiA6IFwiRGlzdHJpYnVjacOzbiBtZW5zdWFsXCJ9PC9oMz5cbiAgICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6IFwiMzAwcHhcIiB9fT5cbiAgICAgICAgICA8RGlzdHJpYnVjaW9uTWVuc3VhbENoYXJ0IGRhcmtNb2RlPXtkYXJrTW9kZX0gZGF0YT17c3RhdHNEYXRhLnBhcnRvcy5wb3JfbWVzfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtY2VudGVyIG10LTJcIiBzdHlsZT17eyBjb2xvcjogZGFya01vZGUgPyAnI2QxZDVkYicgOiAnIzZiNzI4MCcgfX0+XG4gICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJEaXN0cmlidWNpw7MgbWVuc3VhbCBkZSBwYXJ0c1wiIDogXCJEaXN0cmlidWNpw7NuIG1lbnN1YWwgZGUgcGFydG9zXCJ9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1jZW50ZXIgbXQtMVwiIHN0eWxlPXt7IGNvbG9yOiBkYXJrTW9kZSA/ICdyZ2JhKDIwOSwgMjEzLCAyMTksIDAuNiknIDogJ3JnYmEoMTA3LCAxMTQsIDEyOCwgMC42KScgfX0+XG4gICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICc5cHgnIH19PlxuICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnIFxuICAgICAgICAgICAgICA/IGBNZXMgYW1iIG3DqXMgcGFydHM6IE1hcsOnICg0NiksIG1lcyBhbWIgbWVueXMgcGFydHM6IEFnb3N0ICg0KWBcbiAgICAgICAgICAgICAgOiBgTWVzIGNvbiBtw6FzIHBhcnRvczogTWFyem8gKDQ2KSwgbWVzIGNvbiBtZW5vcyBwYXJ0b3M6IEFnb3N0byAoNClgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICB7LyogRGlzdHJpYnVjacOzbiBBbnVhbCBEZXRhbGxhZGEgLSBOVUVWQSAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGFzaGJvYXJkLWNhcmRcIj5cbiAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1zZW1pYm9sZCBtYi00XCI+e2N1cnJlbnRMYW5nID09PSAnY2EnID8gXCJEaXN0cmlidWNpw7MgYW51YWwgZGV0YWxsYWRhXCIgOiBcIkRpc3RyaWJ1Y2nDs24gYW51YWwgZGV0YWxsYWRhXCJ9PC9oMz5cbiAgICAgICAgey8qIE1vc3RyYXIgbG9zIGRhdG9zIGRlIGRpc3RyaWJ1Y2nDs24gYW51YWwgcXVlIHZpZW5lbiBkaXJlY3RhbWVudGUgZGVsIGJhY2tlbmQgKi99XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiBcIjMwMHB4XCIgfX0+XG4gICAgICAgICAgPERpc3RyaWJ1Y2lvbkFudWFsQ2hhcnQgXG4gICAgICAgICAgICBkYXJrTW9kZT17ZGFya01vZGV9IFxuICAgICAgICAgICAgZGF0YT17c3RhdHNEYXRhLnBhcnRvcy5kaXN0cmlidWNpb25fYW51YWx9IFxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgey8qIERFUFVSQUNJw5NOOiBWZXJpZmljYW1vcyBxdWUgZXN0YW1vcyByZWNpYmllbmRvIGxvcyBkYXRvcyBjb3JyZWN0b3MgZGVsIEFQSSAqL31cbiAgICAgICAgPHByZSBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScsIGZvbnRTaXplOiAnOHB4JywgbWF4SGVpZ2h0OiAnODBweCcsIG92ZXJmbG93OiAnYXV0bycsIG1hcmdpbjogJzAnLCBwYWRkaW5nOiAnNHB4JywgYmFja2dyb3VuZENvbG9yOiBkYXJrTW9kZSA/ICcjMWUyOTNiJyA6ICcjZjFmNWY5JywgYm9yZGVyUmFkaXVzOiAnNHB4JyB9fT5cbiAgICAgICAgICB7SlNPTi5zdHJpbmdpZnkoc3RhdHNEYXRhLnBhcnRvcy5kaXN0cmlidWNpb25fYW51YWwsIG51bGwsIDIpfVxuICAgICAgICA8L3ByZT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtY2VudGVyIG10LTNcIiBzdHlsZT17eyBjb2xvcjogZGFya01vZGUgPyAnI2QxZDVkYicgOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9fT5cbiAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyBcIkRpc3RyaWJ1Y2nDsyBhbnVhbCBkZSBwYXJ0cyAoZGFkZXMgcmVhbHMpXCIgOiBcIkRpc3RyaWJ1Y2nDs24gYW51YWwgZGUgcGFydG9zIChkYXRvcyByZWFsZXMpXCJ9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgey8qIEluZm9ybWFjacOzbiBkZXN0YWNhZGEgc29icmUgYcOxb3MgY29uIHBhcnRvcyAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0yIGdhcC0yIG10LTMgbWItMlwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWNlbnRlciBwLTJcIiBzdHlsZT17eyBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogZGFya01vZGUgPyAncmdiYSg1OSwgMTMwLCAyNDYsIDAuMiknIDogJ3JnYmEoNTksIDEzMCwgMjQ2LCAwLjEpJywgXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgZm9udFdlaWdodDogJ3NlbWlib2xkJyBcbiAgICAgICAgICB9fT5cbiAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyBcbiAgICAgICAgICAgICAgPyA8PkFueSBhbWIgPHN0cm9uZz5tw6lzPC9zdHJvbmc+IHBhcnRzOjxici8+PHNwYW4gY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGRcIj57Z2V0TWF4WWVhcihzdGF0c0RhdGEucGFydG9zLmRpc3RyaWJ1Y2lvbl9hbnVhbCl9PC9zcGFuPjwvPlxuICAgICAgICAgICAgICA6IDw+QcOxbyBjb24gPHN0cm9uZz5tw6FzPC9zdHJvbmc+IHBhcnRvczo8YnIvPjxzcGFuIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkXCI+e2dldE1heFllYXIoc3RhdHNEYXRhLnBhcnRvcy5kaXN0cmlidWNpb25fYW51YWwpfTwvc3Bhbj48Lz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1jZW50ZXIgcC0yXCIgc3R5bGU9e3sgXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGRhcmtNb2RlID8gJ3JnYmEoMjM5LCA2OCwgNjgsIDAuMiknIDogJ3JnYmEoMjM5LCA2OCwgNjgsIDAuMSknLCBcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnc2VtaWJvbGQnIFxuICAgICAgICAgIH19PlxuICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnIFxuICAgICAgICAgICAgICA/IDw+QW55IGFtYiA8c3Ryb25nPm1lbnlzPC9zdHJvbmc+IHBhcnRzOjxici8+PHNwYW4gY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGRcIj57Z2V0TWluWWVhcihzdGF0c0RhdGEucGFydG9zLmRpc3RyaWJ1Y2lvbl9hbnVhbCl9PC9zcGFuPjwvPlxuICAgICAgICAgICAgICA6IDw+QcOxbyBjb24gPHN0cm9uZz5tZW5vczwvc3Ryb25nPiBwYXJ0b3M6PGJyLz48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYm9sZFwiPntnZXRNaW5ZZWFyKHN0YXRzRGF0YS5wYXJ0b3MuZGlzdHJpYnVjaW9uX2FudWFsKX08L3NwYW4+PC8+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0yIGdhcC0yIG10LTFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1jZW50ZXIgcC0yXCIgc3R5bGU9e3sgXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGRhcmtNb2RlID8gJ3JnYmEoMTYsIDE4NSwgMTI5LCAwLjIpJyA6ICdyZ2JhKDE2LCAxODUsIDEyOSwgMC4xKScsIFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICdzZW1pYm9sZCcgXG4gICAgICAgICAgfX0+XG4gICAgICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgXG4gICAgICAgICAgICAgID8gPD5QcmltZXIgYW55IGFtYiBwYXJ0czo8YnIvPjxzcGFuIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkXCI+e2dldEZpcnN0WWVhcihzdGF0c0RhdGEucGFydG9zLmRpc3RyaWJ1Y2lvbl9hbnVhbCl9PC9zcGFuPjwvPlxuICAgICAgICAgICAgICA6IDw+UHJpbWVyIGHDsW8gY29uIHBhcnRvczo8YnIvPjxzcGFuIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkXCI+e2dldEZpcnN0WWVhcihzdGF0c0RhdGEucGFydG9zLmRpc3RyaWJ1Y2lvbl9hbnVhbCl9PC9zcGFuPjwvPlxuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWNlbnRlciBwLTJcIiBzdHlsZT17eyBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogZGFya01vZGUgPyAncmdiYSgyNDUsIDE1OCwgMTEsIDAuMiknIDogJ3JnYmEoMjQ1LCAxNTgsIDExLCAwLjEpJywgXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgZm9udFdlaWdodDogJ3NlbWlib2xkJyBcbiAgICAgICAgICB9fT5cbiAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyBcbiAgICAgICAgICAgICAgPyA8PsOabHRpbSBhbnkgYW1iIHBhcnRzOjxici8+PHNwYW4gY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGRcIj57Z2V0TGFzdFllYXIoc3RhdHNEYXRhLnBhcnRvcy5kaXN0cmlidWNpb25fYW51YWwpfTwvc3Bhbj48Lz5cbiAgICAgICAgICAgICAgOiA8PsOabHRpbW8gYcOxbyBjb24gcGFydG9zOjxici8+PHNwYW4gY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGRcIj57Z2V0TGFzdFllYXIoc3RhdHNEYXRhLnBhcnRvcy5kaXN0cmlidWNpb25fYW51YWwpfTwvc3Bhbj48Lz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1jZW50ZXIgbXQtM1wiIHN0eWxlPXt7IGNvbG9yOiBkYXJrTW9kZSA/ICcjZDFkNWRiJyA6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJ2JvbGQnIH19PlxuICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyBcbiAgICAgICAgICAgID8gPD5Ub3RhbDogPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1sZ1wiPntzdGF0c0RhdGEucGFydG9zLnRvdGFsfSBwYXJ0czwvc3Bhbj48Lz5cbiAgICAgICAgICAgIDogPD5Ub3RhbDogPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1sZ1wiPntzdGF0c0RhdGEucGFydG9zLnRvdGFsfSBwYXJ0b3M8L3NwYW4+PC8+XG4gICAgICAgICAgfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7LyogRGlzdHJpYnVjacOzbiBwb3IgR8OpbmVybyAtIENPUlJFR0lEQSAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGFzaGJvYXJkLWNhcmRcIj5cbiAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1zZW1pYm9sZCBtYi00XCI+e3QoJ2Rhc2hib2FyZC5nZW5kZXJfZGlzdHJpYnV0aW9uJywgY3VycmVudExhbmcpfTwvaDM+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiBcIjI3MHB4XCIsIGRpc3BsYXk6IFwiZmxleFwiLCBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIiB9fT5cbiAgICAgICAgICA8R2VuZGVyQ3JpYUNoYXJ0IGRhdGE9e3N0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhfSBkYXJrTW9kZT17ZGFya01vZGV9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0yIGdhcC00IG10LTQgbWItMlwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWNlbnRlciBwLTJcIiBzdHlsZT17eyBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogZGFya01vZGUgPyAncmdiYSgzNywgOTksIDIzNSwgMC4yKScgOiAncmdiYSgzNywgOTksIDIzNSwgMC4xKScsIFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDM3LCA5OSwgMjM1LCAwLjMpJyxcbiAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMDUpJ1xuICAgICAgICAgIH19PlxuICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnIFxuICAgICAgICAgICAgICA/IDw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkXCI+TWFzY2xlczwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIG10LTFcIj57c3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/Lk0gfHwgMH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteHMgbXQtMVwiPih7KCgoc3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/Lk0gfHwgMCkgLyAoKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5NIHx8IDApICsgKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5GIHx8IDApICsgKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5lc2ZvcnJhZGEgfHwgMCkpKSAqIDEwMCkudG9GaXhlZCgxKX0lIGRlbCB0b3RhbCk8L2Rpdj5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgIDogPD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGRcIj5NYWNob3M8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCBtdC0xXCI+e3N0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5NIHx8IDB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIG10LTFcIj4oeygoKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5NIHx8IDApIC8gKChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uTSB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uRiB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uZXNmb3JyYWRhIHx8IDApKSkgKiAxMDApLnRvRml4ZWQoMSl9JSBkZWwgdG90YWwpPC9kaXY+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWNlbnRlciBwLTJcIiBzdHlsZT17eyBcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogZGFya01vZGUgPyAncmdiYSgyMzYsIDcyLCAxNTMsIDAuMiknIDogJ3JnYmEoMjM2LCA3MiwgMTUzLCAwLjEpJywgXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMjM2LCA3MiwgMTUzLCAwLjMpJyxcbiAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMDUpJ1xuICAgICAgICAgIH19PlxuICAgICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnIFxuICAgICAgICAgICAgICA/IDw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkXCI+RmVtZWxsZXM8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCBtdC0xXCI+e3N0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5GIHx8IDB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIG10LTFcIj4oeygoKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5GIHx8IDApIC8gKChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uTSB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uRiB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uZXNmb3JyYWRhIHx8IDApKSkgKiAxMDApLnRvRml4ZWQoMSl9JSBkZWwgdG90YWwpPC9kaXY+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICA6IDw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkXCI+SGVtYnJhczwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIG10LTFcIj57c3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/LkYgfHwgMH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteHMgbXQtMVwiPih7KCgoc3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/LkYgfHwgMCkgLyAoKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5NIHx8IDApICsgKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5GIHx8IDApICsgKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5lc2ZvcnJhZGEgfHwgMCkpKSAqIDEwMCkudG9GaXhlZCgxKX0lIGRlbCB0b3RhbCk8L2Rpdj5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgeyhzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uZXNmb3JyYWRhIHx8IDApID4gMCAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC0yIHRleHQtc20gdGV4dC1jZW50ZXIgcC0yXCIgc3R5bGU9e3sgXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGRhcmtNb2RlID8gJ3JnYmEoMTA3LCAxMTQsIDEyOCwgMC4yKScgOiAncmdiYSgxMDcsIDExNCwgMTI4LCAwLjEpJywgXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTA3LCAxMTQsIDEyOCwgMC4zKSdcbiAgICAgICAgICB9fT5cbiAgICAgICAgICAgIHtjdXJyZW50TGFuZyA9PT0gJ2NhJyBcbiAgICAgICAgICAgICAgPyA8PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9udC1zZW1pYm9sZFwiPkVzZm9ycmFkYTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgbXQtMVwiPntzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uZXNmb3JyYWRhIHx8IDB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIG10LTFcIj4oeygoKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5lc2ZvcnJhZGEgfHwgMCkgLyAoKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5NIHx8IDApICsgKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5GIHx8IDApICsgKHN0YXRzRGF0YS5wYXJ0b3MucG9yX2dlbmVyb19jcmlhPy5lc2ZvcnJhZGEgfHwgMCkpKSAqIDEwMCkudG9GaXhlZCgxKX0lIGRlbCB0b3RhbCk8L2Rpdj5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgIDogPD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGRcIj5Fc2ZvcnJhZGE8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIG10LTFcIj57c3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/LmVzZm9ycmFkYSB8fCAwfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC14cyBtdC0xXCI+KHsoKChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uZXNmb3JyYWRhIHx8IDApIC8gKChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uTSB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uRiB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uZXNmb3JyYWRhIHx8IDApKSkgKiAxMDApLnRvRml4ZWQoMSl9JSBkZWwgdG90YWwpPC9kaXY+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWNlbnRlciBtdC0zXCIgc3R5bGU9e3sgY29sb3I6IGRhcmtNb2RlID8gJyNkMWQ1ZGInIDogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnYm9sZCcgfX0+XG4gICAgICAgICAge2N1cnJlbnRMYW5nID09PSAnY2EnIFxuICAgICAgICAgICAgPyA8PlRvdGFsIGNyw61hczogPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1sZ1wiPnsoc3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/Lk0gfHwgMCkgKyAoc3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/LkYgfHwgMCkgKyAoc3RhdHNEYXRhLnBhcnRvcy5wb3JfZ2VuZXJvX2NyaWE/LmVzZm9ycmFkYSB8fCAwKX08L3NwYW4+PC8+XG4gICAgICAgICAgICA6IDw+VG90YWwgY3LDrWFzOiA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LWxnXCI+eyhzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uTSB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uRiB8fCAwKSArIChzdGF0c0RhdGEucGFydG9zLnBvcl9nZW5lcm9fY3JpYT8uZXNmb3JyYWRhIHx8IDApfTwvc3Bhbj48Lz5cbiAgICAgICAgICB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYXJ0b3NTZWN0aW9uO1xuIl0sIm1hcHBpbmdzIjoiQUF1SlcsU0FtR0ssVUFuR0w7QUF2SlgsT0FBTyxTQUFTLFdBQVcsZ0JBQWdCO0FBQzNDLFNBQVMsY0FBYyxpQkFBaUIsWUFBWSx3QkFBd0IsZ0NBQWdDO0FBQzVHLFNBQVMsVUFBVSxlQUFlLGlCQUFpQjtBQUVuRCxTQUFTLFNBQVM7QUFHbEIsTUFBTSxhQUFhLENBQUMsaUJBQTBDO0FBQzVELE1BQUksQ0FBQyxnQkFBZ0IsT0FBTyxLQUFLLFlBQVksRUFBRSxXQUFXLEdBQUc7QUFDM0QsV0FBTztBQUFBLEVBQ1Q7QUFFQSxRQUFNLFVBQVUsT0FBTyxRQUFRLFlBQVk7QUFDM0MsTUFBSSxRQUFRLFdBQVcsRUFBRyxRQUFPO0FBRWpDLFFBQU0sV0FBVyxRQUFRLE9BQU8sQ0FBQyxLQUFLLFlBQVk7QUFDaEQsV0FBTyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxVQUFVO0FBQUEsRUFDekMsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUViLFNBQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDO0FBR0EsTUFBTSxhQUFhLENBQUMsaUJBQTBDO0FBQzVELE1BQUksQ0FBQyxnQkFBZ0IsT0FBTyxLQUFLLFlBQVksRUFBRSxXQUFXLEdBQUc7QUFDM0QsV0FBTztBQUFBLEVBQ1Q7QUFHQSxRQUFNLGtCQUFrQixPQUFPLFFBQVEsWUFBWSxFQUFFLE9BQU8sV0FBUyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBRWpGLE1BQUksZ0JBQWdCLFdBQVcsRUFBRyxRQUFPO0FBRXpDLFFBQU0sV0FBVyxnQkFBZ0IsT0FBTyxDQUFDLEtBQUssWUFBWTtBQUN4RCxXQUFPLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLFVBQVU7QUFBQSxFQUN6QyxHQUFHLGdCQUFnQixDQUFDLENBQUM7QUFFckIsU0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsU0FBUyxTQUFTLENBQUMsTUFBTSxJQUFJLE1BQU0sRUFBRTtBQUM1RTtBQUdBLE1BQU0sZUFBZSxDQUFDLGlCQUEwQztBQUM5RCxNQUFJLENBQUMsZ0JBQWdCLE9BQU8sS0FBSyxZQUFZLEVBQUUsV0FBVyxHQUFHO0FBQzNELFdBQU87QUFBQSxFQUNUO0FBR0EsUUFBTSxnQkFBZ0IsT0FBTyxRQUFRLFlBQVksRUFDOUMsT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLE1BQU0sUUFBUSxDQUFDLEVBQ2hDLElBQUksQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJO0FBRXZCLE1BQUksY0FBYyxXQUFXLEVBQUcsUUFBTztBQUd2QyxRQUFNLFlBQVksY0FBYyxLQUFLLENBQUMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUUzRSxTQUFPO0FBQ1Q7QUFHQSxNQUFNLGNBQWMsQ0FBQyxpQkFBMEM7QUFDN0QsTUFBSSxDQUFDLGdCQUFnQixPQUFPLEtBQUssWUFBWSxFQUFFLFdBQVcsR0FBRztBQUMzRCxXQUFPO0FBQUEsRUFDVDtBQUdBLFFBQU0sZ0JBQWdCLE9BQU8sUUFBUSxZQUFZLEVBQzlDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSyxNQUFNLFFBQVEsQ0FBQyxFQUNoQyxJQUFJLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSTtBQUV2QixNQUFJLGNBQWMsV0FBVyxFQUFHLFFBQU87QUFHdkMsUUFBTSxZQUFZLGNBQWMsS0FBSyxDQUFDLEdBQUcsTUFBTSxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDM0UsUUFBTSxrQkFBa0IsYUFBYSxTQUFTO0FBRTlDLFNBQU8sR0FBRyxTQUFTLEtBQUssZUFBZSxTQUFTLG9CQUFvQixJQUFJLE1BQU0sRUFBRTtBQUNsRjtBQUdBLE1BQU0sdUJBQXVCLENBQUMsaUJBQTBDO0FBQ3RFLE1BQUksQ0FBQyxhQUFjLFFBQU87QUFFMUIsUUFBTSxlQUFjLG9CQUFJLEtBQUssR0FBRSxZQUFZLEVBQUUsU0FBUztBQUN0RCxTQUFPLGFBQWEsV0FBVyxLQUFLO0FBQ3RDO0FBR0EsTUFBTSxpQkFBaUIsQ0FBQyxpQkFBMEM7QUFDaEUsTUFBSSxDQUFDLGdCQUFnQixPQUFPLEtBQUssWUFBWSxFQUFFLFdBQVcsR0FBRztBQUMzRCxXQUFPO0FBQUEsRUFDVDtBQUVBLFNBQU8sT0FBTyxPQUFPLFlBQVksRUFBRSxPQUFPLENBQUMsT0FBTyxVQUFVLFFBQVEsT0FBTyxDQUFDO0FBQzlFO0FBWUEsTUFBTSxnQkFBOEMsQ0FBQztBQUFBLEVBQ25EO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLE1BQU07QUFFSixRQUFNLENBQUMsYUFBYSxjQUFjLElBQUksU0FBUyxJQUFJO0FBR25ELFlBQVUsTUFBTTtBQUNkLFVBQU0sZUFBZSxhQUFhLFFBQVEsY0FBYztBQUN4RCxRQUFJLGNBQWM7QUFDaEIscUJBQWUsWUFBWTtBQUFBLElBQzdCO0FBR0EsVUFBTSx1QkFBdUIsQ0FBQyxNQUFvQjtBQUNoRCxVQUFJLEVBQUUsUUFBUSxnQkFBZ0I7QUFDNUIsdUJBQWUsRUFBRSxZQUFZLElBQUk7QUFBQSxNQUNuQztBQUFBLElBQ0Y7QUFFQSxXQUFPLGlCQUFpQixXQUFXLG9CQUFvQjtBQUV2RCxXQUFPLE1BQU07QUFDWCxhQUFPLG9CQUFvQixXQUFXLG9CQUFvQjtBQUFBLElBQzVEO0FBQUEsRUFDRixHQUFHLENBQUMsQ0FBQztBQUdMLFlBQVUsTUFBTTtBQUNkLFFBQUksYUFBYSxVQUFVLFFBQVE7QUFDakMsY0FBUSxJQUFJLDhCQUE4QixVQUFVLE9BQU8sT0FBTztBQUNsRSxjQUFRLElBQUksa0JBQWtCLE9BQU8sVUFBVSxPQUFPLE9BQU87QUFDN0QsY0FBUSxJQUFJLFdBQVcsT0FBTyxLQUFLLFVBQVUsT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLGNBQVEsSUFBSSxZQUFZLE9BQU8sT0FBTyxVQUFVLE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQztBQUVyRSxjQUFRLElBQUksNEJBQTRCLFVBQVUsT0FBTyxrQkFBa0I7QUFDM0UsY0FBUSxJQUFJLGtCQUFrQixPQUFPLFVBQVUsT0FBTyxrQkFBa0I7QUFDeEUsY0FBUSxJQUFJLFdBQVcsT0FBTyxLQUFLLFVBQVUsT0FBTyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFBQSxJQUMvRTtBQUFBLEVBQ0YsR0FBRyxDQUFDLFNBQVMsQ0FBQztBQUNkLE1BQUksU0FBUztBQUNYLFdBQU8sdUJBQUMsU0FBSSxXQUFVLGdDQUFnQyxZQUFFLHFCQUFxQixXQUFXLEtBQWpGO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FBbUY7QUFBQSxFQUM1RjtBQUVBLE1BQUksT0FBTztBQUNULFdBQ0UsdUJBQUMsU0FBSSxXQUFVLDZDQUNaO0FBQUEsUUFBRSwyQkFBMkIsV0FBVztBQUFBLE1BQUU7QUFBQSxNQUFHO0FBQUEsU0FEaEQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUVBO0FBQUEsRUFFSjtBQUVBLE1BQUksQ0FBQyxhQUFhLENBQUMsWUFBWTtBQUM3QixXQUFPLHVCQUFDLFNBQUksV0FBVSxnQ0FBZ0MsWUFBRSxxQkFBcUIsV0FBVyxLQUFqRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQW1GO0FBQUEsRUFDNUY7QUFFQSxTQUNFLHVCQUFDLFNBQUksV0FBVSx5Q0FFYjtBQUFBLDJCQUFDLFNBQUksV0FBVSxrQkFDYjtBQUFBLDZCQUFDLFFBQUcsV0FBVSw4QkFBOEIsWUFBRSw2QkFBNkIsV0FBVyxLQUF0RjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQXdGO0FBQUEsTUFDeEYsdUJBQUMsU0FBSSxPQUFPLEVBQUUsU0FBUyxRQUFRLHFCQUFxQixXQUFXLEtBQUssVUFBVSxHQUM1RTtBQUFBO0FBQUEsVUFBQztBQUFBO0FBQUEsWUFDQyxPQUFPLEVBQUUsMEJBQTBCLFdBQVc7QUFBQSxZQUM5QyxPQUFPLFVBQVUsT0FBTztBQUFBLFlBQ3hCLE9BQU07QUFBQSxZQUNOO0FBQUEsWUFDQSxnQkFBZTtBQUFBO0FBQUEsVUFMakI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBTUE7QUFBQSxRQUNBO0FBQUEsVUFBQztBQUFBO0FBQUEsWUFDQyxPQUFPLGdCQUFnQixPQUFPLFNBQVM7QUFBQSxZQUN2QyxPQUFPLFVBQVUsT0FBTztBQUFBLFlBQ3hCLE9BQU07QUFBQSxZQUNOO0FBQUE7QUFBQSxVQUpGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtBO0FBQUEsV0FiRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBY0E7QUFBQSxNQUVBLHVCQUFDLFNBQUksV0FBVSxRQUFPLE9BQU8sRUFBRSxTQUFTLFFBQVEscUJBQXFCLFdBQVcsS0FBSyxVQUFVLEdBRTdGO0FBQUE7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLFFBQU8sb0JBQUksS0FBSyxHQUFFLFlBQVksRUFBRSxTQUFTO0FBQUEsWUFDekMsT0FBTyxxQkFBcUIsVUFBVSxPQUFPLGtCQUFrQjtBQUFBLFlBQy9ELE9BQU07QUFBQSxZQUNOO0FBQUE7QUFBQSxVQUpGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtBO0FBQUEsUUFDQTtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQ0MsT0FBTyxnQkFBZ0IsT0FBTyxrQkFBa0I7QUFBQSxZQUNoRCxPQUFPLEtBQUssVUFBVSxPQUFPLHNCQUFzQixLQUFLLEtBQUssUUFBUSxDQUFDLENBQUM7QUFBQSxZQUN2RSxPQUFNO0FBQUEsWUFDTjtBQUFBO0FBQUEsVUFKRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFLQTtBQUFBLFdBYkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQWNBO0FBQUEsU0FoQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQWlDQTtBQUFBLElBR0EsdUJBQUMsU0FBSSxXQUFVLGtCQUNiO0FBQUEsNkJBQUMsUUFBRyxXQUFVLDhCQUE4QiwwQkFBZ0IsT0FBTyx3QkFBd0IsMEJBQTNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFBa0g7QUFBQSxNQUNsSCx1QkFBQyxTQUFJLE9BQU8sRUFBRSxRQUFRLFFBQVEsR0FDNUIsaUNBQUMsNEJBQXlCLFVBQW9CLE1BQU0sVUFBVSxPQUFPLFdBQXJFO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFBOEUsS0FEaEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUVBO0FBQUEsTUFDQSx1QkFBQyxTQUFJLFdBQVUsNEJBQTJCLE9BQU8sRUFBRSxPQUFPLFdBQVcsWUFBWSxVQUFVLEdBQ3hGLDBCQUFnQixPQUFPLGlDQUFpQyxvQ0FEM0Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUVBO0FBQUEsTUFDQSx1QkFBQyxTQUFJLFdBQVUsNEJBQTJCLE9BQU8sRUFBRSxPQUFPLFdBQVcsNkJBQTZCLDJCQUEyQixHQUMzSCxpQ0FBQyxVQUFLLE9BQU8sRUFBRSxVQUFVLE1BQU0sR0FDNUIsMEJBQWdCLE9BQ2IsaUVBQ0Esc0VBSE47QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUtBLEtBTkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQU9BO0FBQUEsU0FmRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBZ0JBO0FBQUEsSUFHQSx1QkFBQyxTQUFJLFdBQVUsa0JBQ2I7QUFBQSw2QkFBQyxRQUFHLFdBQVUsOEJBQThCLDBCQUFnQixPQUFPLGdDQUFnQyxrQ0FBbkc7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUFrSTtBQUFBLE1BRWxJLHVCQUFDLFNBQUksT0FBTyxFQUFFLFFBQVEsUUFBUSxHQUM1QjtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0M7QUFBQSxVQUNBLE1BQU0sVUFBVSxPQUFPO0FBQUE7QUFBQSxRQUZ6QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFHQSxLQUpGO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFLQTtBQUFBLE1BR0EsdUJBQUMsU0FBSSxPQUFPLEVBQUUsU0FBUyxRQUFRLFVBQVUsT0FBTyxXQUFXLFFBQVEsVUFBVSxRQUFRLFFBQVEsS0FBSyxTQUFTLE9BQU8saUJBQWlCLFdBQVcsWUFBWSxXQUFXLGNBQWMsTUFBTSxHQUN0TCxlQUFLLFVBQVUsVUFBVSxPQUFPLG9CQUFvQixNQUFNLENBQUMsS0FEOUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUVBO0FBQUEsTUFDQSx1QkFBQyxTQUFJLFdBQVUsNEJBQTJCLE9BQU8sRUFBRSxPQUFPLFdBQVcsWUFBWSxXQUFXLFlBQVksT0FBTyxHQUM1RywwQkFBZ0IsT0FBTyw2Q0FBNkMsaURBRHZFO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFFQTtBQUFBLE1BR0EsdUJBQUMsU0FBSSxXQUFVLG9DQUNiO0FBQUEsK0JBQUMsU0FBSSxXQUFVLDJCQUEwQixPQUFPO0FBQUEsVUFDOUMsaUJBQWlCLFdBQVcsNEJBQTRCO0FBQUEsVUFDeEQsY0FBYztBQUFBLFVBQ2QsWUFBWTtBQUFBLFFBQ2QsR0FDRywwQkFBZ0IsT0FDYixtQ0FBRTtBQUFBO0FBQUEsVUFBUSx1QkFBQyxZQUFPLG1CQUFSO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQVc7QUFBQSxVQUFTO0FBQUEsVUFBTyx1QkFBQyxVQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQUc7QUFBQSxVQUFFLHVCQUFDLFVBQUssV0FBVSxxQkFBcUIscUJBQVcsVUFBVSxPQUFPLGtCQUFrQixLQUFuRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFxRjtBQUFBLGFBQS9IO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBc0ksSUFDdEksbUNBQUU7QUFBQTtBQUFBLFVBQVEsdUJBQUMsWUFBTyxtQkFBUjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFXO0FBQUEsVUFBUztBQUFBLFVBQVEsdUJBQUMsVUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFHO0FBQUEsVUFBRSx1QkFBQyxVQUFLLFdBQVUscUJBQXFCLHFCQUFXLFVBQVUsT0FBTyxrQkFBa0IsS0FBbkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBcUY7QUFBQSxhQUFoSTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXVJLEtBUDdJO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFTQTtBQUFBLFFBQ0EsdUJBQUMsU0FBSSxXQUFVLDJCQUEwQixPQUFPO0FBQUEsVUFDOUMsaUJBQWlCLFdBQVcsMkJBQTJCO0FBQUEsVUFDdkQsY0FBYztBQUFBLFVBQ2QsWUFBWTtBQUFBLFFBQ2QsR0FDRywwQkFBZ0IsT0FDYixtQ0FBRTtBQUFBO0FBQUEsVUFBUSx1QkFBQyxZQUFPLHFCQUFSO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQWE7QUFBQSxVQUFTO0FBQUEsVUFBTyx1QkFBQyxVQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQUc7QUFBQSxVQUFFLHVCQUFDLFVBQUssV0FBVSxxQkFBcUIscUJBQVcsVUFBVSxPQUFPLGtCQUFrQixLQUFuRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFxRjtBQUFBLGFBQWpJO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBd0ksSUFDeEksbUNBQUU7QUFBQTtBQUFBLFVBQVEsdUJBQUMsWUFBTyxxQkFBUjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFhO0FBQUEsVUFBUztBQUFBLFVBQVEsdUJBQUMsVUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFHO0FBQUEsVUFBRSx1QkFBQyxVQUFLLFdBQVUscUJBQXFCLHFCQUFXLFVBQVUsT0FBTyxrQkFBa0IsS0FBbkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBcUY7QUFBQSxhQUFsSTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXlJLEtBUC9JO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFTQTtBQUFBLFdBcEJGO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFxQkE7QUFBQSxNQUVBLHVCQUFDLFNBQUksV0FBVSwrQkFDYjtBQUFBLCtCQUFDLFNBQUksV0FBVSwyQkFBMEIsT0FBTztBQUFBLFVBQzlDLGlCQUFpQixXQUFXLDRCQUE0QjtBQUFBLFVBQ3hELGNBQWM7QUFBQSxVQUNkLFlBQVk7QUFBQSxRQUNkLEdBQ0csMEJBQWdCLE9BQ2IsbUNBQUU7QUFBQTtBQUFBLFVBQXFCLHVCQUFDLFVBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBRztBQUFBLFVBQUUsdUJBQUMsVUFBSyxXQUFVLHFCQUFxQix1QkFBYSxVQUFVLE9BQU8sa0JBQWtCLEtBQXJGO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQXVGO0FBQUEsYUFBbkg7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUEwSCxJQUMxSCxtQ0FBRTtBQUFBO0FBQUEsVUFBc0IsdUJBQUMsVUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFHO0FBQUEsVUFBRSx1QkFBQyxVQUFLLFdBQVUscUJBQXFCLHVCQUFhLFVBQVUsT0FBTyxrQkFBa0IsS0FBckY7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBdUY7QUFBQSxhQUFwSDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQTJILEtBUGpJO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFTQTtBQUFBLFFBQ0EsdUJBQUMsU0FBSSxXQUFVLDJCQUEwQixPQUFPO0FBQUEsVUFDOUMsaUJBQWlCLFdBQVcsNEJBQTRCO0FBQUEsVUFDeEQsY0FBYztBQUFBLFVBQ2QsWUFBWTtBQUFBLFFBQ2QsR0FDRywwQkFBZ0IsT0FDYixtQ0FBRTtBQUFBO0FBQUEsVUFBb0IsdUJBQUMsVUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFHO0FBQUEsVUFBRSx1QkFBQyxVQUFLLFdBQVUscUJBQXFCLHNCQUFZLFVBQVUsT0FBTyxrQkFBa0IsS0FBcEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBc0Y7QUFBQSxhQUFqSDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXdILElBQ3hILG1DQUFFO0FBQUE7QUFBQSxVQUFzQix1QkFBQyxVQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQUc7QUFBQSxVQUFFLHVCQUFDLFVBQUssV0FBVSxxQkFBcUIsc0JBQVksVUFBVSxPQUFPLGtCQUFrQixLQUFwRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFzRjtBQUFBLGFBQW5IO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBMEgsS0FQaEk7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQVNBO0FBQUEsV0FwQkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQXFCQTtBQUFBLE1BRUEsdUJBQUMsU0FBSSxXQUFVLDRCQUEyQixPQUFPLEVBQUUsT0FBTyxXQUFXLFlBQVksV0FBVyxZQUFZLE9BQU8sR0FDNUcsMEJBQWdCLE9BQ2IsbUNBQUU7QUFBQTtBQUFBLFFBQU8sdUJBQUMsVUFBSyxXQUFVLFdBQVc7QUFBQSxvQkFBVSxPQUFPO0FBQUEsVUFBTTtBQUFBLGFBQWxEO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBd0Q7QUFBQSxXQUFqRTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQXdFLElBQ3hFLG1DQUFFO0FBQUE7QUFBQSxRQUFPLHVCQUFDLFVBQUssV0FBVSxXQUFXO0FBQUEsb0JBQVUsT0FBTztBQUFBLFVBQU07QUFBQSxhQUFsRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXlEO0FBQUEsV0FBbEU7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUF5RSxLQUgvRTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBS0E7QUFBQSxTQXRFRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBdUVBO0FBQUEsSUFHQSx1QkFBQyxTQUFJLFdBQVUsa0JBQ2I7QUFBQSw2QkFBQyxRQUFHLFdBQVUsOEJBQThCLFlBQUUsaUNBQWlDLFdBQVcsS0FBMUY7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUE0RjtBQUFBLE1BQzVGLHVCQUFDLFNBQUksT0FBTyxFQUFFLFFBQVEsU0FBUyxTQUFTLFFBQVEsZ0JBQWdCLFNBQVMsR0FDdkUsaUNBQUMsbUJBQWdCLE1BQU0sVUFBVSxPQUFPLGlCQUFpQixZQUF6RDtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQTZFLEtBRC9FO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFFQTtBQUFBLE1BRUEsdUJBQUMsU0FBSSxXQUFVLG9DQUNiO0FBQUEsK0JBQUMsU0FBSSxXQUFVLDJCQUEwQixPQUFPO0FBQUEsVUFDOUMsaUJBQWlCLFdBQVcsMkJBQTJCO0FBQUEsVUFDdkQsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFVBQ1IsV0FBVztBQUFBLFFBQ2IsR0FDRywwQkFBZ0IsT0FDYixtQ0FDQTtBQUFBLGlDQUFDLFNBQUksV0FBVSxpQkFBZ0IsdUJBQS9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQXNDO0FBQUEsVUFDdEMsdUJBQUMsU0FBSSxXQUFVLDJCQUEyQixvQkFBVSxPQUFPLGlCQUFpQixLQUFLLEtBQWpGO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQW1GO0FBQUEsVUFDbkYsdUJBQUMsU0FBSSxXQUFVLGdCQUFlO0FBQUE7QUFBQSxjQUFLLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxPQUFPLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsYUFBYSxNQUFPLEtBQUssUUFBUSxDQUFDO0FBQUEsWUFBRTtBQUFBLGVBQWpQO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQTZQO0FBQUEsYUFIN1A7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUlGLElBQ0UsbUNBQ0E7QUFBQSxpQ0FBQyxTQUFJLFdBQVUsaUJBQWdCLHNCQUEvQjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFxQztBQUFBLFVBQ3JDLHVCQUFDLFNBQUksV0FBVSwyQkFBMkIsb0JBQVUsT0FBTyxpQkFBaUIsS0FBSyxLQUFqRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFtRjtBQUFBLFVBQ25GLHVCQUFDLFNBQUksV0FBVSxnQkFBZTtBQUFBO0FBQUEsY0FBSyxVQUFVLE9BQU8saUJBQWlCLEtBQUssT0FBTyxVQUFVLE9BQU8saUJBQWlCLEtBQUssTUFBTSxVQUFVLE9BQU8saUJBQWlCLEtBQUssTUFBTSxVQUFVLE9BQU8saUJBQWlCLGFBQWEsTUFBTyxLQUFLLFFBQVEsQ0FBQztBQUFBLFlBQUU7QUFBQSxlQUFqUDtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUE2UDtBQUFBLGFBSDdQO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFJRixLQWhCSjtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBa0JBO0FBQUEsUUFFQSx1QkFBQyxTQUFJLFdBQVUsMkJBQTBCLE9BQU87QUFBQSxVQUM5QyxpQkFBaUIsV0FBVyw0QkFBNEI7QUFBQSxVQUN4RCxjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixXQUFXO0FBQUEsUUFDYixHQUNHLDBCQUFnQixPQUNiLG1DQUNBO0FBQUEsaUNBQUMsU0FBSSxXQUFVLGlCQUFnQix3QkFBL0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBdUM7QUFBQSxVQUN2Qyx1QkFBQyxTQUFJLFdBQVUsMkJBQTJCLG9CQUFVLE9BQU8saUJBQWlCLEtBQUssS0FBakY7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBbUY7QUFBQSxVQUNuRix1QkFBQyxTQUFJLFdBQVUsZ0JBQWU7QUFBQTtBQUFBLGNBQUssVUFBVSxPQUFPLGlCQUFpQixLQUFLLE9BQU8sVUFBVSxPQUFPLGlCQUFpQixLQUFLLE1BQU0sVUFBVSxPQUFPLGlCQUFpQixLQUFLLE1BQU0sVUFBVSxPQUFPLGlCQUFpQixhQUFhLE1BQU8sS0FBSyxRQUFRLENBQUM7QUFBQSxZQUFFO0FBQUEsZUFBalA7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBNlA7QUFBQSxhQUg3UDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBSUYsSUFDRSxtQ0FDQTtBQUFBLGlDQUFDLFNBQUksV0FBVSxpQkFBZ0IsdUJBQS9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQXNDO0FBQUEsVUFDdEMsdUJBQUMsU0FBSSxXQUFVLDJCQUEyQixvQkFBVSxPQUFPLGlCQUFpQixLQUFLLEtBQWpGO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQW1GO0FBQUEsVUFDbkYsdUJBQUMsU0FBSSxXQUFVLGdCQUFlO0FBQUE7QUFBQSxjQUFLLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxPQUFPLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsYUFBYSxNQUFPLEtBQUssUUFBUSxDQUFDO0FBQUEsWUFBRTtBQUFBLGVBQWpQO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQTZQO0FBQUEsYUFIN1A7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUlGLEtBaEJKO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFrQkE7QUFBQSxXQXZDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBd0NBO0FBQUEsT0FFRSxVQUFVLE9BQU8saUJBQWlCLGFBQWEsS0FBSyxLQUNwRCx1QkFBQyxTQUFJLFdBQVUsZ0NBQStCLE9BQU87QUFBQSxRQUNuRCxpQkFBaUIsV0FBVyw2QkFBNkI7QUFBQSxRQUN6RCxjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVixHQUNHLDBCQUFnQixPQUNiLG1DQUNBO0FBQUEsK0JBQUMsU0FBSSxXQUFVLGlCQUFnQix5QkFBL0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUF3QztBQUFBLFFBQ3hDLHVCQUFDLFNBQUksV0FBVSwwQkFBMEIsb0JBQVUsT0FBTyxpQkFBaUIsYUFBYSxLQUF4RjtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQTBGO0FBQUEsUUFDMUYsdUJBQUMsU0FBSSxXQUFVLGdCQUFlO0FBQUE7QUFBQSxZQUFLLFVBQVUsT0FBTyxpQkFBaUIsYUFBYSxPQUFPLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsYUFBYSxNQUFPLEtBQUssUUFBUSxDQUFDO0FBQUEsVUFBRTtBQUFBLGFBQXpQO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBcVE7QUFBQSxXQUhyUTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBSUYsSUFDRSxtQ0FDQTtBQUFBLCtCQUFDLFNBQUksV0FBVSxpQkFBZ0IseUJBQS9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBd0M7QUFBQSxRQUN4Qyx1QkFBQyxTQUFJLFdBQVUsMEJBQTBCLG9CQUFVLE9BQU8saUJBQWlCLGFBQWEsS0FBeEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUEwRjtBQUFBLFFBQzFGLHVCQUFDLFNBQUksV0FBVSxnQkFBZTtBQUFBO0FBQUEsWUFBSyxVQUFVLE9BQU8saUJBQWlCLGFBQWEsT0FBTyxVQUFVLE9BQU8saUJBQWlCLEtBQUssTUFBTSxVQUFVLE9BQU8saUJBQWlCLEtBQUssTUFBTSxVQUFVLE9BQU8saUJBQWlCLGFBQWEsTUFBTyxLQUFLLFFBQVEsQ0FBQztBQUFBLFVBQUU7QUFBQSxhQUF6UDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXFRO0FBQUEsV0FIclE7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUlGLEtBZko7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQWlCQTtBQUFBLE1BR0YsdUJBQUMsU0FBSSxXQUFVLDRCQUEyQixPQUFPLEVBQUUsT0FBTyxXQUFXLFlBQVksV0FBVyxZQUFZLE9BQU8sR0FDNUcsMEJBQWdCLE9BQ2IsbUNBQUU7QUFBQTtBQUFBLFFBQWEsdUJBQUMsVUFBSyxXQUFVLFdBQVkscUJBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsS0FBSyxNQUFNLFVBQVUsT0FBTyxpQkFBaUIsYUFBYSxNQUFySztBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXdLO0FBQUEsV0FBdkw7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUE4TCxJQUM5TCxtQ0FBRTtBQUFBO0FBQUEsUUFBYSx1QkFBQyxVQUFLLFdBQVUsV0FBWSxxQkFBVSxPQUFPLGlCQUFpQixLQUFLLE1BQU0sVUFBVSxPQUFPLGlCQUFpQixLQUFLLE1BQU0sVUFBVSxPQUFPLGlCQUFpQixhQUFhLE1BQXJLO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBd0s7QUFBQSxXQUF2TDtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQThMLEtBSHBNO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFLQTtBQUFBLFNBMUVGO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0EyRUE7QUFBQSxPQTlNRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBK01BO0FBRUo7QUFFQSxlQUFlOyIsIm5hbWVzIjpbXX0=