import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"]; const useCallback = __vite__cjsImport1_react["useCallback"];
import apiService from "/src/services/apiService.ts";
import { registerChartComponents } from "/src/utils/chartConfig.ts";
import { SectionTitle } from "/src/components/dashboard/components/UIComponents.tsx";
import PartosSection from "/src/components/dashboard/sections/PartosSection.tsx";
import ResumenOriginalCard from "/src/components/dashboardv2/cards/ResumenOriginalCard.tsx";
import DiagnosticoDataCard from "/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx";
const DashboardV2 = () => {
  console.log("🟢 DASHBOARD V2 CARGADO - VERSIÓN NUEVA");
  const [statsData, setStatsData] = useState(null);
  const [partosData, setPartosData] = useState(null);
  const [loading, setLoading] = useState({
    stats: true,
    partos: true
  });
  const [error, setError] = useState({
    stats: null,
    partos: null
  });
  const [darkMode, setDarkMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const addLog = (message, isError = false) => {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const formattedMessage = `[${timestamp}] ${isError ? "❌ " : ""}${message}`;
    setLogs((prev) => [formattedMessage, ...prev]);
    if (isError) {
      console.error(`[DashboardV2] ${message}`);
    } else {
      console.log(`[DashboardV2] ${message}`);
    }
  };
  const showSkeletonLoader = () => {
    setLoading({
      stats: true,
      partos: true
    });
  };
  const loadFromCache = () => {
    try {
      const cachedData = sessionStorage.getItem("dashboardData");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const cacheTime = parsedData.timestamp || 0;
        const now = (/* @__PURE__ */ new Date()).getTime();
        if (now - cacheTime < 5 * 60 * 1e3) {
          addLog("✅ Usando datos en caché (< 5min)");
          if (parsedData.stats) setStatsData(parsedData.stats);
          if (parsedData.partos) setPartosData(parsedData.partos);
          return true;
        }
      }
    } catch (err) {
      console.warn("Error leyendo caché:", err);
    }
    return false;
  };
  const saveToCache = (data) => {
    try {
      const cacheData = {
        stats: data.stats,
        partos: data.partos,
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      };
      sessionStorage.setItem("dashboardData", JSON.stringify(cacheData));
    } catch (err) {
      console.warn("Error guardando caché:", err);
    }
  };
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        showSkeletonLoader();
        const usedCache = loadFromCache();
        if (usedCache) {
          setLoading({
            stats: false,
            partos: false
          });
        }
        try {
          addLog("Obteniendo datos del dashboard...");
          const [statsResponse, partosResponse] = await Promise.all([
            apiService.get("/dashboard/stats"),
            apiService.get("/dashboard/partos")
          ]);
          setStatsData(statsResponse);
          setPartosData(partosResponse);
          setLoading({
            stats: false,
            partos: false
          });
          setError({
            stats: null,
            partos: null
          });
          saveToCache({
            stats: statsResponse,
            partos: partosResponse
          });
          addLog("✅ Datos del dashboard cargados correctamente");
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Error desconocido";
          addLog(`Error cargando datos: ${errorMsg}`, true);
          setError({
            stats: errorMsg,
            partos: errorMsg
          });
          setLoading({
            stats: false,
            partos: false
          });
        }
      } catch (error2) {
        console.error("Error general cargando datos:", error2);
      }
    };
    loadDashboardData();
    const isDarkMode = document.documentElement.classList.contains("dark");
    setDarkMode(isDarkMode);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setDarkMode(isDark);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => {
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const initCharts = async () => {
      try {
        addLog("Registrando componentes de Chart.js...");
        await registerChartComponents();
        addLog("✅ Componentes de Chart.js registrados correctamente");
      } catch (error2) {
        addLog("❌ Error al registrar componentes de Chart.js", true);
        console.error("Error registrando Chart.js:", error2);
      }
    };
    if (typeof window !== "undefined") {
      initCharts();
    }
  }, []);
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `dashboard-container ${darkMode ? "theme-dark" : "theme-light"}`,
      "data-component-name": "DashboardV2",
      children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: toggleTheme,
            style: {
              position: "fixed",
              bottom: "6rem",
              left: "1rem",
              backgroundColor: darkMode ? "#374151" : "#e5e7eb",
              color: darkMode ? "white" : "black",
              padding: "0.75rem",
              borderRadius: "9999px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              zIndex: 20,
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem"
            },
            children: darkMode ? "☀️" : "🌙"
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
            lineNumber: 271,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("div", { className: "dashboard-header" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
          lineNumber: 292,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV(SectionTitle, { number: "1", title: "Resumen General", darkMode, translationKey: "dashboard.summary" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
          lineNumber: 297,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "stats-grid-lg", children: /* @__PURE__ */ jsxDEV(
          ResumenOriginalCard,
          {
            darkMode
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
            lineNumber: 300,
            columnNumber: 9
          },
          this
        ) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
          lineNumber: 298,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV(SectionTitle, { number: "2", title: "Análisis de Partos", darkMode, translationKey: "dashboard.partos_analysis" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
          lineNumber: 306,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "combined-stats-grid", children: [
          /* @__PURE__ */ jsxDEV("div", { style: { display: "contents" }, children: /* @__PURE__ */ jsxDEV(
            PartosSection,
            {
              statsData,
              partosData,
              darkMode,
              loading: loading.stats || loading.partos,
              error: error.stats || error.partos
            },
            void 0,
            false,
            {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
              lineNumber: 310,
              columnNumber: 11
            },
            this
          ) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
            lineNumber: 309,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("div", {}, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
            lineNumber: 319,
            columnNumber: 9
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
          lineNumber: 307,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/DashboardV2.tsx",
      lineNumber: 264,
      columnNumber: 5
    },
    this
  );
};
export default DashboardV2;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhc2hib2FyZFYyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERhc2hib2FyZFYyLnRzeFxuICogPT09PT09PT09PT09PT09PT09PT09PVxuICogU09MTyBTT04gVkFMSURPUyBMT1MgREFUT1MgRElOQU1JQ09TISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVxuICogXG4gKiBbREFTSEJPQVJEVjJdIE51ZXZhIHZlcnNpw7NuIGRlbCBEYXNoYm9hcmQgY29tcGxldGFtZW50ZSByZWRpc2XDsWFkYSBwYXJhIHNvbHVjaW9uYXIgcHJvYmxlbWFzXG4gKiBkZSByZW5kaW1pZW50byB5IHZpc3VhbGl6YWNpw7NuIGRlIGRhdG9zLiBFc3RhIHZlcnNpw7NuIGVzIG3DoXMgbW9kdWxhciwgbGltcGlhXG4gKiB5IGbDoWNpbCBkZSBtYW50ZW5lci5cbiAqIFxuICogQ2FyYWN0ZXLDrXN0aWNhcyBwcmluY2lwYWxlczpcbiAqIC0gRGlzZcOxbyBtw6FzIG1vZHVsYXIgY29uIGNvbXBvbmVudGVzIGRlIHRhcmpldGFzIGluZGVwZW5kaWVudGVzXG4gKiAtIE1lam9yIG1hbmVqbyBkZSBlcnJvcmVzIHkgZXN0YWRvcyBkZSBjYXJnYVxuICogLSBMb2dzIGRlIGRpYWduw7NzdGljbyBwYXJhIGZhY2lsaXRhciBsYSBkZXB1cmFjacOzblxuICogLSBPcHRpbWl6YWNpw7NuIGRlbCBjb25zdW1vIGRlIEFQSVxuICogLSBDb21wYXRpYmxlIGNvbiB0ZW1hcyBjbGFyby9vc2N1cm9cbiAqIC0gTmF2ZWdhY2nDs24gZW50cmUgdmVyc2lvbmVzIGRlbCBkYXNoYm9hcmRcbiAqIC0gSW50ZWdyYWNpw7NuIGNvbiBUcmVtb3IgcGFyYSB2aXN1YWxpemFjaW9uZXMgbcOhcyBhdmFuemFkYXNcbiAqL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgYXBpU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hcGlTZXJ2aWNlJztcblxuLy8gSW1wb3J0YXIgeSByZWdpc3RyYXIgbG9zIGNvbXBvbmVudGVzIGRlIENoYXJ0LmpzXG5pbXBvcnQgeyByZWdpc3RlckNoYXJ0Q29tcG9uZW50cyB9IGZyb20gJy4uLy4uL3V0aWxzL2NoYXJ0Q29uZmlnJztcblxuLy8gWWEgbm8gcmVnaXN0cmFtb3MgZW4gZWwgbml2ZWwgc3VwZXJpb3IgLSBzZSBoYXLDoSBlbiB1biB1c2VFZmZlY3RcblxuLy8gSW1wb3J0YXIgY29tcG9uZW50ZXMgVUkgcmV1dGlsaXphYmxlc1xuaW1wb3J0IHsgU2VjdGlvblRpdGxlIH0gZnJvbSAnLi4vZGFzaGJvYXJkL2NvbXBvbmVudHMvVUlDb21wb25lbnRzJztcblxuLy8gSW1wb3J0YXIgY29tcG9uZW50ZSBQYXJ0b3NTZWN0aW9uXG5pbXBvcnQgUGFydG9zU2VjdGlvbiBmcm9tICcuLi9kYXNoYm9hcmQvc2VjdGlvbnMvUGFydG9zU2VjdGlvbic7XG5cbi8vIEltcG9ydGFyIFJlc3VtZW5PcmlnaW5hbENhcmRcbmltcG9ydCBSZXN1bWVuT3JpZ2luYWxDYXJkIGZyb20gJy4vY2FyZHMvUmVzdW1lbk9yaWdpbmFsQ2FyZCc7XG5cbi8vIEltcG9ydGFyIGNvbXBvbmVudGUgZGUgZGlhZ27Ds3N0aWNvIHBhcmEgdmlzdWFsaXphciBkYXRvcyBjcnVkb3NcbmltcG9ydCBEaWFnbm9zdGljb0RhdGFDYXJkIGZyb20gJy4vY2FyZHMvRGlhZ25vc3RpY29EYXRhQ2FyZCc7XG5cbi8vIEltcG9ydGFyIHRpcG9zXG5pbXBvcnQgdHlwZSB7IFxuICBEYXNoYm9hcmRTdGF0cywgXG4gIFBhcnRvc1N0YXRzXG59IGZyb20gJy4uL2Rhc2hib2FyZC90eXBlcy9kYXNoYm9hcmQnO1xuXG4vKipcbiAqIERhc2hib2FyZFYyIC0gVmVyc2nDs24gb3B0aW1pemFkYSB5IG1vZHVsYXJcbiAqIFxuICogSW1wbGVtZW50YWNpw7NuIGRlc2RlIGNlcm8gY29uIMOpbmZhc2lzIGVuIHNpbXBsaWNpZGFkIHkgcmVuZGltaWVudG8uXG4gKiBDb25zdW1lIGRpcmVjdGFtZW50ZSBsb3MgZW5kcG9pbnRzIG5lY2VzYXJpb3Mgc2luIG1pZGRsZXdhcmUuXG4gKi9cbi8qKlxuICogW0RBU0hCT0FSRFYyXSBDb21wb25lbnRlIHByaW5jaXBhbCBkZSBsYSBudWV2YSB2ZXJzacOzbiBkZWwgZGFzaGJvYXJkXG4gKiBcbiAqIEltcGxlbWVudGFkbyBkZXNkZSBjZXJvIGNvbW8gdW5hIG51ZXZhIHZlcnNpw7NuIGFsdGVybmF0aXZhIHF1ZSBwdWVkZVxuICogY29leGlzdGlyIGNvbiBlbCBEYXNoYm9hcmQgb3JpZ2luYWwgc2luIGFmZWN0YXJsby5cbiAqL1xuY29uc3QgRGFzaGJvYXJkVjI6IFJlYWN0LkZDID0gKCkgPT4ge1xuICBjb25zb2xlLmxvZygn8J+foiBEQVNIQk9BUkQgVjIgQ0FSR0FETyAtIFZFUlNJw5NOIE5VRVZBJyk7XG4gIC8vIEVzdGUgZXMgZWwgZGFzaGJvYXJkIG51ZXZvIHF1ZSByZWVtcGxhemFyw6EgYWwgb3JpZ2luYWxcbiAgLy8gW0RBU0hCT0FSRFYyXSBObyB1c2Ftb3MgdXNlTmF2aWdhdGUoKSBwb3JxdWUgcHVlZGUgY2F1c2FyIHByb2JsZW1hcyBzaSBzZSByZW5kZXJpemEgZnVlcmEgZGVsIFJvdXRlclxuICAvLyBFc3RhZG8gcGFyYSBhbG1hY2VuYXIgZGF0b3MgZGUgbGEgQVBJXG4gIGNvbnN0IFtzdGF0c0RhdGEsIHNldFN0YXRzRGF0YV0gPSB1c2VTdGF0ZTxEYXNoYm9hcmRTdGF0cyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbcGFydG9zRGF0YSwgc2V0UGFydG9zRGF0YV0gPSB1c2VTdGF0ZTxQYXJ0b3NTdGF0cyB8IG51bGw+KG51bGwpO1xuICBcbiAgLy8gRXN0YWRvcyBwYXJhIGdlc3Rpb25hciBsYSBjYXJnYSB5IGVycm9yZXNcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoe1xuICAgIHN0YXRzOiB0cnVlLFxuICAgIHBhcnRvczogdHJ1ZVxuICB9KTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZSh7XG4gICAgc3RhdHM6IG51bGwgYXMgc3RyaW5nIHwgbnVsbCxcbiAgICBwYXJ0b3M6IG51bGwgYXMgc3RyaW5nIHwgbnVsbFxuICB9KTtcblxuICAvLyBFc3RhZG8gcGFyYSBlbCB0ZW1hIG9zY3Vyby9jbGFyb1xuICBjb25zdCBbZGFya01vZGUsIHNldERhcmtNb2RlXSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKTtcbiAgXG4gIC8vIExvZ3MgcGFyYSBkaWFnbsOzc3RpY29cbiAgY29uc3QgW2xvZ3MsIHNldExvZ3NdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKTtcblxuICAvLyBGdW5jacOzbiBwYXJhIGFncmVnYXIgbG9nc1xuICBjb25zdCBhZGRMb2cgPSAobWVzc2FnZTogc3RyaW5nLCBpc0Vycm9yOiBib29sZWFuID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgZm9ybWF0dGVkTWVzc2FnZSA9IGBbJHt0aW1lc3RhbXB9XSAke2lzRXJyb3IgPyAn4p2MICcgOiAnJ30ke21lc3NhZ2V9YDtcbiAgICBzZXRMb2dzKHByZXYgPT4gW2Zvcm1hdHRlZE1lc3NhZ2UsIC4uLnByZXZdKTtcbiAgICBcbiAgICBpZiAoaXNFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgW0Rhc2hib2FyZFYyXSAke21lc3NhZ2V9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbRGFzaGJvYXJkVjJdICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRnVuY2nDs24gcGFyYSBtb3N0cmFyIHNrZWxldG9uIGxvYWRlciBtaWVudHJhcyBzZSBjYXJnYW4gbG9zIGRhdG9zXG4gIGNvbnN0IHNob3dTa2VsZXRvbkxvYWRlciA9ICgpID0+IHtcbiAgICBzZXRMb2FkaW5nKHtcbiAgICAgIHN0YXRzOiB0cnVlLFxuICAgICAgcGFydG9zOiB0cnVlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gRnVuY2nDs24gcGFyYSBjYXJnYXIgZGF0b3MgZGVzZGUgc2Vzc2lvblN0b3JhZ2Ugc2kgZXhpc3RlblxuICBjb25zdCBsb2FkRnJvbUNhY2hlID0gKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjYWNoZWREYXRhID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnZGFzaGJvYXJkRGF0YScpO1xuICAgICAgaWYgKGNhY2hlZERhdGEpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoY2FjaGVkRGF0YSk7XG4gICAgICAgIGNvbnN0IGNhY2hlVGltZSA9IHBhcnNlZERhdGEudGltZXN0YW1wIHx8IDA7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ29tcHJvYmFyIHNpIGxhIGNhY2jDqSBlcyByZWNpZW50ZSAobWVub3MgZGUgNSBtaW51dG9zKVxuICAgICAgICBpZiAobm93IC0gY2FjaGVUaW1lIDwgNSAqIDYwICogMTAwMCkge1xuICAgICAgICAgIGFkZExvZygn4pyFIFVzYW5kbyBkYXRvcyBlbiBjYWNow6kgKDwgNW1pbiknKTtcbiAgICAgICAgICBpZiAocGFyc2VkRGF0YS5zdGF0cykgc2V0U3RhdHNEYXRhKHBhcnNlZERhdGEuc3RhdHMpO1xuICAgICAgICAgIGlmIChwYXJzZWREYXRhLnBhcnRvcykgc2V0UGFydG9zRGF0YShwYXJzZWREYXRhLnBhcnRvcyk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIFNpIGhheSBlcnJvciBhbCBsZWVyIGxhIGNhY2jDqSwgc2ltcGxlbWVudGUgaWdub3JhbW9zIHkgY2FyZ2Ftb3MgbnVldm9zIGRhdG9zXG4gICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIGxleWVuZG8gY2FjaMOpOicsIGVycik7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBGdW5jacOzbiBwYXJhIGd1YXJkYXIgZGF0b3MgZW4gc2Vzc2lvblN0b3JhZ2VcbiAgY29uc3Qgc2F2ZVRvQ2FjaGUgPSAoZGF0YTogYW55KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNhY2hlRGF0YSA9IHtcbiAgICAgICAgc3RhdHM6IGRhdGEuc3RhdHMsXG4gICAgICAgIHBhcnRvczogZGF0YS5wYXJ0b3MsXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICAgIH07XG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdkYXNoYm9hcmREYXRhJywgSlNPTi5zdHJpbmdpZnkoY2FjaGVEYXRhKSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBTaSBoYXkgZXJyb3IgYWwgZ3VhcmRhciBsYSBjYWNow6ksIHNpbXBsZW1lbnRlIGxvIGlnbm9yYW1vc1xuICAgICAgY29uc29sZS53YXJuKCdFcnJvciBndWFyZGFuZG8gY2FjaMOpOicsIGVycik7XG4gICAgfVxuICB9O1xuXG4gIC8vIEVmZWN0byBwYXJhIGNhcmdhciBkYXRvcyBhbCBtb250YXIgZWwgY29tcG9uZW50ZVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGxvYWREYXNoYm9hcmREYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gMS4gTW9zdHJhciBza2VsZXRvbiBsb2FkZXJzIGlubWVkaWF0YW1lbnRlXG4gICAgICAgIHNob3dTa2VsZXRvbkxvYWRlcigpO1xuICAgICAgICBcbiAgICAgICAgLy8gMi4gSW50ZW50YXIgY2FyZ2FyIGRhdG9zIGNhY2hlYWRvcyBzaSBleGlzdGVuXG4gICAgICAgIGNvbnN0IHVzZWRDYWNoZSA9IGxvYWRGcm9tQ2FjaGUoKTtcbiAgICAgICAgaWYgKHVzZWRDYWNoZSkge1xuICAgICAgICAgIC8vIEFjdHVhbGl6YXIgZXN0YWRvIGRlIGNhcmdhIHBhcmEgcmVmbGVqYXIgZGF0b3MgZGUgY2FjaMOpXG4gICAgICAgICAgc2V0TG9hZGluZyh7XG4gICAgICAgICAgICBzdGF0czogZmFsc2UsXG4gICAgICAgICAgICBwYXJ0b3M6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIDMuIENhcmdhciBkYXRvcyBmcmVzY29zIGVuIHBhcmFsZWxvIChpbmNsdXNvIHNpIHVzYW1vcyBjYWNow6kpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYWRkTG9nKCdPYnRlbmllbmRvIGRhdG9zIGRlbCBkYXNoYm9hcmQuLi4nKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBIYWNlciBwZXRpY2lvbmVzIGVuIHBhcmFsZWxvXG4gICAgICAgICAgY29uc3QgW3N0YXRzUmVzcG9uc2UsIHBhcnRvc1Jlc3BvbnNlXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGFwaVNlcnZpY2UuZ2V0KCcvZGFzaGJvYXJkL3N0YXRzJyksXG4gICAgICAgICAgICBhcGlTZXJ2aWNlLmdldCgnL2Rhc2hib2FyZC9wYXJ0b3MnKVxuICAgICAgICAgIF0pO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEd1YXJkYXIgcmVzdWx0YWRvc1xuICAgICAgICAgIHNldFN0YXRzRGF0YShzdGF0c1Jlc3BvbnNlKTtcbiAgICAgICAgICBzZXRQYXJ0b3NEYXRhKHBhcnRvc1Jlc3BvbnNlKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBBY3R1YWxpemFyIGVzdGFkb3NcbiAgICAgICAgICBzZXRMb2FkaW5nKHtcbiAgICAgICAgICAgIHN0YXRzOiBmYWxzZSxcbiAgICAgICAgICAgIHBhcnRvczogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICBzZXRFcnJvcih7XG4gICAgICAgICAgICBzdGF0czogbnVsbCxcbiAgICAgICAgICAgIHBhcnRvczogbnVsbFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEd1YXJkYXIgZW4gY2FjaMOpXG4gICAgICAgICAgc2F2ZVRvQ2FjaGUoe1xuICAgICAgICAgICAgc3RhdHM6IHN0YXRzUmVzcG9uc2UsXG4gICAgICAgICAgICBwYXJ0b3M6IHBhcnRvc1Jlc3BvbnNlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgYWRkTG9nKCfinIUgRGF0b3MgZGVsIGRhc2hib2FyZCBjYXJnYWRvcyBjb3JyZWN0YW1lbnRlJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdFcnJvciBkZXNjb25vY2lkbyc7XG4gICAgICAgICAgYWRkTG9nKGBFcnJvciBjYXJnYW5kbyBkYXRvczogJHtlcnJvck1zZ31gLCB0cnVlKTtcbiAgICAgICAgICBcbiAgICAgICAgICBzZXRFcnJvcih7XG4gICAgICAgICAgICBzdGF0czogZXJyb3JNc2csXG4gICAgICAgICAgICBwYXJ0b3M6IGVycm9yTXNnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgc2V0TG9hZGluZyh7XG4gICAgICAgICAgICBzdGF0czogZmFsc2UsXG4gICAgICAgICAgICBwYXJ0b3M6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZW5lcmFsIGNhcmdhbmRvIGRhdG9zOicsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIGxvYWREYXNoYm9hcmREYXRhKCk7XG4gICAgXG4gICAgLy8gRGV0ZWN0YXIgdGVtYSBvc2N1cm9cbiAgICBjb25zdCBpc0RhcmtNb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZGFyaycpO1xuICAgIHNldERhcmtNb2RlKGlzRGFya01vZGUpO1xuICAgIFxuICAgIC8vIE9ic2VydmVyIHBhcmEgY2FtYmlvcyBlbiBlbCB0ZW1hXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgICBtdXRhdGlvbnMuZm9yRWFjaCgobXV0YXRpb24pID0+IHtcbiAgICAgICAgaWYgKG11dGF0aW9uLmF0dHJpYnV0ZU5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgICBjb25zdCBpc0RhcmsgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXJrJyk7XG4gICAgICAgICAgc2V0RGFya01vZGUoaXNEYXJrKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcbiAgICBcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH07XG4gIH0sIFtdKTtcblxuICAvLyBFZmVjdG8gcGFyYSByZWdpc3RyYXIgbG9zIGNvbXBvbmVudGVzIGRlIENoYXJ0LmpzIHPDs2xvIGVuIGVsIGNsaWVudGVcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBpbml0Q2hhcnRzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYWRkTG9nKCdSZWdpc3RyYW5kbyBjb21wb25lbnRlcyBkZSBDaGFydC5qcy4uLicpO1xuICAgICAgICBhd2FpdCByZWdpc3RlckNoYXJ0Q29tcG9uZW50cygpO1xuICAgICAgICBhZGRMb2coJ+KchSBDb21wb25lbnRlcyBkZSBDaGFydC5qcyByZWdpc3RyYWRvcyBjb3JyZWN0YW1lbnRlJyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBhZGRMb2coJ+KdjCBFcnJvciBhbCByZWdpc3RyYXIgY29tcG9uZW50ZXMgZGUgQ2hhcnQuanMnLCB0cnVlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVnaXN0cmFuZG8gQ2hhcnQuanM6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBTb2xvIGVqZWN1dGFtb3MgZW4gZWwgbmF2ZWdhZG9yXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpbml0Q2hhcnRzKCk7XG4gICAgfVxuICB9LCBbXSk7XG5cbiAgLy8gRnVuY2nDs24gcGFyYSBjYW1iaWFyIHRlbWFcbiAgY29uc3QgdG9nZ2xlVGhlbWUgPSAoKSA9PiB7XG4gICAgY29uc3QgaXNEYXJrID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZGFyaycpO1xuICAgIGlmIChpc0RhcmspIHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkYXJrJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdkYXJrJyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBcbiAgICAgIGNsYXNzTmFtZT17YGRhc2hib2FyZC1jb250YWluZXIgJHtkYXJrTW9kZSA/ICd0aGVtZS1kYXJrJyA6ICd0aGVtZS1saWdodCd9YH1cbiAgICAgIGRhdGEtY29tcG9uZW50LW5hbWU9XCJEYXNoYm9hcmRWMlwiXG4gICAgPlxuICAgICAgey8qIEJvdMOzbiBwYXJhIHZvbHZlciBhbCBEYXNoYm9hcmQgb3JpZ2luYWwgZWxpbWluYWRvIC0gWWEgbm8gZXMgbmVjZXNhcmlvICovfVxuICAgICAgXG4gICAgICB7LyogW0RBU0hCT0FSRFYyXSBCb3TDs24gcGFyYSBjYW1iaWFyIHRlbWEgKi99XG4gICAgICA8YnV0dG9uIFxuICAgICAgICBvbkNsaWNrPXt0b2dnbGVUaGVtZX0gXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgICAgYm90dG9tOiAnNnJlbScsXG4gICAgICAgICAgbGVmdDogJzFyZW0nLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogZGFya01vZGUgPyAnIzM3NDE1MScgOiAnI2U1ZTdlYicsXG4gICAgICAgICAgY29sb3I6IGRhcmtNb2RlID8gJ3doaXRlJyA6ICdibGFjaycsXG4gICAgICAgICAgcGFkZGluZzogJzAuNzVyZW0nLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogJzk5OTlweCcsXG4gICAgICAgICAgYm94U2hhZG93OiAnMCAxMHB4IDE1cHggLTNweCByZ2JhKDAsIDAsIDAsIDAuMSksIDAgNHB4IDZweCAtMnB4IHJnYmEoMCwgMCwgMCwgMC4wNSknLFxuICAgICAgICAgIHpJbmRleDogMjAsXG4gICAgICAgICAgYm9yZGVyOiAnbm9uZScsXG4gICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgZm9udFNpemU6ICcxLjJyZW0nLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7ZGFya01vZGUgPyAn4piA77iPJyA6ICfwn4yZJ31cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgXG4gICAgICB7LyogQ2FiZWNlcmEgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhc2hib2FyZC1oZWFkZXJcIj5cbiAgICAgICAgey8qIFTDrXR1bG8gZWxpbWluYWRvIHBhcmEgZXZpdGFyIGR1cGxpY2FjacOzbiAqL31cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICB7LyogU0VDQ0nDk04gMTogUmVzdW1lbiBHZW5lcmFsIChDb24gZXN0aWxvIG9yaWdpbmFsKSAqL31cbiAgICAgIDxTZWN0aW9uVGl0bGUgbnVtYmVyPVwiMVwiIHRpdGxlPVwiUmVzdW1lbiBHZW5lcmFsXCIgZGFya01vZGU9e2RhcmtNb2RlfSB0cmFuc2xhdGlvbktleT1cImRhc2hib2FyZC5zdW1tYXJ5XCIgLz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhdHMtZ3JpZC1sZ1wiPlxuICAgICAgICB7LyogUmVzdW1lbk9yaWdpbmFsQ2FyZCBvYnRpZW5lIHN1cyBwcm9waW9zIGRhdG9zICovfVxuICAgICAgICA8UmVzdW1lbk9yaWdpbmFsQ2FyZFxuICAgICAgICAgIGRhcmtNb2RlPXtkYXJrTW9kZX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgXG4gICAgICB7LyogU0VDQ0nDk04gMjogQW7DoWxpc2lzIGRlIFBhcnRvcyAqL31cbiAgICAgIDxTZWN0aW9uVGl0bGUgbnVtYmVyPVwiMlwiIHRpdGxlPVwiQW7DoWxpc2lzIGRlIFBhcnRvc1wiIGRhcmtNb2RlPXtkYXJrTW9kZX0gdHJhbnNsYXRpb25LZXk9XCJkYXNoYm9hcmQucGFydG9zX2FuYWx5c2lzXCIgLz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29tYmluZWQtc3RhdHMtZ3JpZFwiPlxuICAgICAgICB7LyogV3JhcHBlciBwYXJhIHF1ZSBlbCBQYXJ0b3NTZWN0aW9uIG9jdXBlIGxhIG1pdGFkIGRlbCBhbmNobyAqL31cbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnY29udGVudHMnIH19PlxuICAgICAgICAgIDxQYXJ0b3NTZWN0aW9uIFxuICAgICAgICAgICAgc3RhdHNEYXRhPXtzdGF0c0RhdGF9IFxuICAgICAgICAgICAgcGFydG9zRGF0YT17cGFydG9zRGF0YX1cbiAgICAgICAgICAgIGRhcmtNb2RlPXtkYXJrTW9kZX0gXG4gICAgICAgICAgICBsb2FkaW5nPXtsb2FkaW5nLnN0YXRzIHx8IGxvYWRpbmcucGFydG9zfSBcbiAgICAgICAgICAgIGVycm9yPXtlcnJvci5zdGF0cyB8fCBlcnJvci5wYXJ0b3N9IFxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7LyogRXNwYWNpbyB2YWPDrW8gcGFyYSBlcXVpbGlicmFyIGxhIGN1YWRyw61jdWxhICovfVxuICAgICAgICA8ZGl2PjwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHsvKiBFc3BhY2lvIHBhcmEgcG9zaWJsZXMgc2VjY2lvbmVzIGFkaWNpb25hbGVzIGVuIGVsIGZ1dHVybyAqL31cbiAgICAgIFxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRGFzaGJvYXJkVjI7XG4iXSwibWFwcGluZ3MiOiJBQThRTTtBQTNQTixPQUFPLFNBQVMsVUFBVSxXQUFXLG1CQUFtQjtBQUN4RCxPQUFPLGdCQUFnQjtBQUd2QixTQUFTLCtCQUErQjtBQUt4QyxTQUFTLG9CQUFvQjtBQUc3QixPQUFPLG1CQUFtQjtBQUcxQixPQUFPLHlCQUF5QjtBQUdoQyxPQUFPLHlCQUF5QjtBQW9CaEMsTUFBTSxjQUF3QixNQUFNO0FBQ2xDLFVBQVEsSUFBSSx5Q0FBeUM7QUFJckQsUUFBTSxDQUFDLFdBQVcsWUFBWSxJQUFJLFNBQWdDLElBQUk7QUFDdEUsUUFBTSxDQUFDLFlBQVksYUFBYSxJQUFJLFNBQTZCLElBQUk7QUFHckUsUUFBTSxDQUFDLFNBQVMsVUFBVSxJQUFJLFNBQVM7QUFBQSxJQUNyQyxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFDVixDQUFDO0FBQ0QsUUFBTSxDQUFDLE9BQU8sUUFBUSxJQUFJLFNBQVM7QUFBQSxJQUNqQyxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFDVixDQUFDO0FBR0QsUUFBTSxDQUFDLFVBQVUsV0FBVyxJQUFJLFNBQWtCLEtBQUs7QUFHdkQsUUFBTSxDQUFDLE1BQU0sT0FBTyxJQUFJLFNBQW1CLENBQUMsQ0FBQztBQUc3QyxRQUFNLFNBQVMsQ0FBQyxTQUFpQixVQUFtQixVQUFVO0FBQzVELFVBQU0sYUFBWSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUN6QyxVQUFNLG1CQUFtQixJQUFJLFNBQVMsS0FBSyxVQUFVLE9BQU8sRUFBRSxHQUFHLE9BQU87QUFDeEUsWUFBUSxVQUFRLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBRTNDLFFBQUksU0FBUztBQUNYLGNBQVEsTUFBTSxpQkFBaUIsT0FBTyxFQUFFO0FBQUEsSUFDMUMsT0FBTztBQUNMLGNBQVEsSUFBSSxpQkFBaUIsT0FBTyxFQUFFO0FBQUEsSUFDeEM7QUFBQSxFQUNGO0FBR0EsUUFBTSxxQkFBcUIsTUFBTTtBQUMvQixlQUFXO0FBQUEsTUFDVCxPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsSUFDVixDQUFDO0FBQUEsRUFDSDtBQUdBLFFBQU0sZ0JBQWdCLE1BQU07QUFDMUIsUUFBSTtBQUNGLFlBQU0sYUFBYSxlQUFlLFFBQVEsZUFBZTtBQUN6RCxVQUFJLFlBQVk7QUFDZCxjQUFNLGFBQWEsS0FBSyxNQUFNLFVBQVU7QUFDeEMsY0FBTSxZQUFZLFdBQVcsYUFBYTtBQUMxQyxjQUFNLE9BQU0sb0JBQUksS0FBSyxHQUFFLFFBQVE7QUFHL0IsWUFBSSxNQUFNLFlBQVksSUFBSSxLQUFLLEtBQU07QUFDbkMsaUJBQU8sa0NBQWtDO0FBQ3pDLGNBQUksV0FBVyxNQUFPLGNBQWEsV0FBVyxLQUFLO0FBQ25ELGNBQUksV0FBVyxPQUFRLGVBQWMsV0FBVyxNQUFNO0FBQ3RELGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUVaLGNBQVEsS0FBSyx3QkFBd0IsR0FBRztBQUFBLElBQzFDO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFHQSxRQUFNLGNBQWMsQ0FBQyxTQUFjO0FBQ2pDLFFBQUk7QUFDRixZQUFNLFlBQVk7QUFBQSxRQUNoQixPQUFPLEtBQUs7QUFBQSxRQUNaLFFBQVEsS0FBSztBQUFBLFFBQ2IsWUFBVyxvQkFBSSxLQUFLLEdBQUUsUUFBUTtBQUFBLE1BQ2hDO0FBQ0EscUJBQWUsUUFBUSxpQkFBaUIsS0FBSyxVQUFVLFNBQVMsQ0FBQztBQUFBLElBQ25FLFNBQVMsS0FBSztBQUVaLGNBQVEsS0FBSywwQkFBMEIsR0FBRztBQUFBLElBQzVDO0FBQUEsRUFDRjtBQUdBLFlBQVUsTUFBTTtBQUNkLFVBQU0sb0JBQW9CLFlBQVk7QUFDcEMsVUFBSTtBQUVGLDJCQUFtQjtBQUduQixjQUFNLFlBQVksY0FBYztBQUNoQyxZQUFJLFdBQVc7QUFFYixxQkFBVztBQUFBLFlBQ1QsT0FBTztBQUFBLFlBQ1AsUUFBUTtBQUFBLFVBQ1YsQ0FBQztBQUFBLFFBQ0g7QUFHQSxZQUFJO0FBQ0YsaUJBQU8sbUNBQW1DO0FBRzFDLGdCQUFNLENBQUMsZUFBZSxjQUFjLElBQUksTUFBTSxRQUFRLElBQUk7QUFBQSxZQUN4RCxXQUFXLElBQUksa0JBQWtCO0FBQUEsWUFDakMsV0FBVyxJQUFJLG1CQUFtQjtBQUFBLFVBQ3BDLENBQUM7QUFHRCx1QkFBYSxhQUFhO0FBQzFCLHdCQUFjLGNBQWM7QUFHNUIscUJBQVc7QUFBQSxZQUNULE9BQU87QUFBQSxZQUNQLFFBQVE7QUFBQSxVQUNWLENBQUM7QUFFRCxtQkFBUztBQUFBLFlBQ1AsT0FBTztBQUFBLFlBQ1AsUUFBUTtBQUFBLFVBQ1YsQ0FBQztBQUdELHNCQUFZO0FBQUEsWUFDVixPQUFPO0FBQUEsWUFDUCxRQUFRO0FBQUEsVUFDVixDQUFDO0FBRUQsaUJBQU8sOENBQThDO0FBQUEsUUFDdkQsU0FBUyxLQUFLO0FBQ1osZ0JBQU0sV0FBVyxlQUFlLFFBQVEsSUFBSSxVQUFVO0FBQ3RELGlCQUFPLHlCQUF5QixRQUFRLElBQUksSUFBSTtBQUVoRCxtQkFBUztBQUFBLFlBQ1AsT0FBTztBQUFBLFlBQ1AsUUFBUTtBQUFBLFVBQ1YsQ0FBQztBQUVELHFCQUFXO0FBQUEsWUFDVCxPQUFPO0FBQUEsWUFDUCxRQUFRO0FBQUEsVUFDVixDQUFDO0FBQUEsUUFDSDtBQUFBLE1BRUYsU0FBU0EsUUFBTztBQUNkLGdCQUFRLE1BQU0saUNBQWlDQSxNQUFLO0FBQUEsTUFDdEQ7QUFBQSxJQUNGO0FBRUEsc0JBQWtCO0FBR2xCLFVBQU0sYUFBYSxTQUFTLGdCQUFnQixVQUFVLFNBQVMsTUFBTTtBQUNyRSxnQkFBWSxVQUFVO0FBR3RCLFVBQU0sV0FBVyxJQUFJLGlCQUFpQixDQUFDLGNBQWM7QUFDbkQsZ0JBQVUsUUFBUSxDQUFDLGFBQWE7QUFDOUIsWUFBSSxTQUFTLGtCQUFrQixTQUFTO0FBQ3RDLGdCQUFNLFNBQVMsU0FBUyxnQkFBZ0IsVUFBVSxTQUFTLE1BQU07QUFDakUsc0JBQVksTUFBTTtBQUFBLFFBQ3BCO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBRUQsYUFBUyxRQUFRLFNBQVMsaUJBQWlCLEVBQUUsWUFBWSxLQUFLLENBQUM7QUFFL0QsV0FBTyxNQUFNO0FBQ1gsZUFBUyxXQUFXO0FBQUEsSUFDdEI7QUFBQSxFQUNGLEdBQUcsQ0FBQyxDQUFDO0FBR0wsWUFBVSxNQUFNO0FBQ2QsVUFBTSxhQUFhLFlBQVk7QUFDN0IsVUFBSTtBQUNGLGVBQU8sd0NBQXdDO0FBQy9DLGNBQU0sd0JBQXdCO0FBQzlCLGVBQU8scURBQXFEO0FBQUEsTUFDOUQsU0FBU0EsUUFBTztBQUNkLGVBQU8sZ0RBQWdELElBQUk7QUFDM0QsZ0JBQVEsTUFBTSwrQkFBK0JBLE1BQUs7QUFBQSxNQUNwRDtBQUFBLElBQ0Y7QUFHQSxRQUFJLE9BQU8sV0FBVyxhQUFhO0FBQ2pDLGlCQUFXO0FBQUEsSUFDYjtBQUFBLEVBQ0YsR0FBRyxDQUFDLENBQUM7QUFHTCxRQUFNLGNBQWMsTUFBTTtBQUN4QixVQUFNLFNBQVMsU0FBUyxnQkFBZ0IsVUFBVSxTQUFTLE1BQU07QUFDakUsUUFBSSxRQUFRO0FBQ1YsZUFBUyxnQkFBZ0IsVUFBVSxPQUFPLE1BQU07QUFBQSxJQUNsRCxPQUFPO0FBQ0wsZUFBUyxnQkFBZ0IsVUFBVSxJQUFJLE1BQU07QUFBQSxJQUMvQztBQUFBLEVBQ0Y7QUFFQSxTQUNFO0FBQUEsSUFBQztBQUFBO0FBQUEsTUFDQyxXQUFXLHVCQUF1QixXQUFXLGVBQWUsYUFBYTtBQUFBLE1BQ3pFLHVCQUFvQjtBQUFBLE1BS3BCO0FBQUE7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLFNBQVM7QUFBQSxZQUNULE9BQU87QUFBQSxjQUNMLFVBQVU7QUFBQSxjQUNWLFFBQVE7QUFBQSxjQUNSLE1BQU07QUFBQSxjQUNOLGlCQUFpQixXQUFXLFlBQVk7QUFBQSxjQUN4QyxPQUFPLFdBQVcsVUFBVTtBQUFBLGNBQzVCLFNBQVM7QUFBQSxjQUNULGNBQWM7QUFBQSxjQUNkLFdBQVc7QUFBQSxjQUNYLFFBQVE7QUFBQSxjQUNSLFFBQVE7QUFBQSxjQUNSLFFBQVE7QUFBQSxjQUNSLFVBQVU7QUFBQSxZQUNaO0FBQUEsWUFFQyxxQkFBVyxPQUFPO0FBQUE7QUFBQSxVQWpCckI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBa0JBO0FBQUEsUUFHQSx1QkFBQyxTQUFJLFdBQVUsc0JBQWY7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUVBO0FBQUEsUUFHQSx1QkFBQyxnQkFBYSxRQUFPLEtBQUksT0FBTSxtQkFBa0IsVUFBb0IsZ0JBQWUsdUJBQXBGO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBd0c7QUFBQSxRQUN4Ryx1QkFBQyxTQUFJLFdBQVUsaUJBRWI7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDO0FBQUE7QUFBQSxVQURGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUVBLEtBSkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUtBO0FBQUEsUUFHQSx1QkFBQyxnQkFBYSxRQUFPLEtBQUksT0FBTSxzQkFBcUIsVUFBb0IsZ0JBQWUsK0JBQXZGO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBbUg7QUFBQSxRQUNuSCx1QkFBQyxTQUFJLFdBQVUsdUJBRWI7QUFBQSxpQ0FBQyxTQUFJLE9BQU8sRUFBRSxTQUFTLFdBQVcsR0FDaEM7QUFBQSxZQUFDO0FBQUE7QUFBQSxjQUNDO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBLFNBQVMsUUFBUSxTQUFTLFFBQVE7QUFBQSxjQUNsQyxPQUFPLE1BQU0sU0FBUyxNQUFNO0FBQUE7QUFBQSxZQUw5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFNQSxLQVBGO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBUUE7QUFBQSxVQUVBLHVCQUFDLFdBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFBSztBQUFBLGFBWlA7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQWFBO0FBQUE7QUFBQTtBQUFBLElBeERGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQTREQTtBQUVKO0FBRUEsZUFBZTsiLCJuYW1lcyI6WyJlcnJvciJdfQ==