import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"];
import { Card, Title, Text } from "/node_modules/.vite/deps/@tremor_react.js?v=5e89932e";
import apiService from "/src/services/apiService.ts";
const DiagnosticoDataCard = () => {
  const [statsData, setStatsData] = useState(null);
  const [resumenData, setResumenData] = useState(null);
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsResponse, resumenResponse, debugResponse] = await Promise.all([
          apiService.get("/dashboard/stats"),
          apiService.get("/dashboard/resumen/"),
          apiService.get("/diagnostico/dashboard-debug")
        ]);
        console.log("Stats data:", statsResponse);
        console.log("Resumen data:", resumenResponse);
        console.log("Debug data:", debugResponse);
        setStatsData(statsResponse);
        setResumenData(resumenResponse);
        setDebugData(debugResponse);
      } catch (err) {
        console.error("Error al cargar datos de diagnóstico:", err);
        setError("Error al cargar datos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const renderObject = (obj, level = 0) => {
    if (!obj) return /* @__PURE__ */ jsxDEV("span", { children: "null" }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 47,
      columnNumber: 22
    }, this);
    if (typeof obj !== "object") {
      return /* @__PURE__ */ jsxDEV("span", { children: String(obj) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 50,
        columnNumber: 14
      }, this);
    }
    if (Array.isArray(obj)) {
      return /* @__PURE__ */ jsxDEV("div", { style: { marginLeft: level * 20 + "px" }, children: [
        "[",
        obj.map((item, index) => /* @__PURE__ */ jsxDEV("div", { children: [
          renderObject(item, level + 1),
          index < obj.length - 1 ? "," : ""
        ] }, index, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 58,
          columnNumber: 13
        }, this)),
        "]"
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this);
    }
    return /* @__PURE__ */ jsxDEV("div", { style: { marginLeft: level * 20 + "px" }, children: [
      "{",
      Object.entries(obj).map(([key, value], index, arr) => /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("span", { style: { fontWeight: "bold" }, children: key }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 73,
          columnNumber: 13
        }, this),
        ": ",
        renderObject(value, level + 1),
        index < arr.length - 1 ? "," : ""
      ] }, key, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 72,
        columnNumber: 11
      }, this)),
      "}"
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 69,
      columnNumber: 7
    }, this);
  };
  const renderComparacion = () => {
    if (!statsData || !statsData.animales) return null;
    const animales = statsData.animales;
    const totalReportado = animales.total || 0;
    const totalPorGenero = (animales.machos || 0) + (animales.hembras || 0);
    const totalPorEstado = Object.values(animales.por_estado || {}).reduce((sum, val) => sum + val, 0);
    return /* @__PURE__ */ jsxDEV("div", { className: "mt-4 p-4 bg-yellow-50 rounded-lg", children: [
      /* @__PURE__ */ jsxDEV(Title, { className: "text-lg mb-2", children: "Verificación de Conteos" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 93,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-4 mb-2", children: [
        /* @__PURE__ */ jsxDEV(Text, { className: "font-bold", children: "Concepto" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 96,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { className: "font-bold", children: "Valor" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 97,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { className: "font-bold", children: "Concuerda" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 98,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 95,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-4 mb-1", children: [
        /* @__PURE__ */ jsxDEV(Text, { children: "Total reportado" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 102,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { children: totalReportado }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 103,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { children: "-" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 104,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 101,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-4 mb-1", children: [
        /* @__PURE__ */ jsxDEV(Text, { children: "Total por género" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 108,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { children: totalPorGenero }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 109,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { className: totalPorGenero === totalReportado ? "text-green-600" : "text-red-600", children: totalPorGenero === totalReportado ? "✓" : "✗" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 110,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 107,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-4 mb-1", children: [
        /* @__PURE__ */ jsxDEV(Text, { children: "Total por estado" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 116,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { children: totalPorEstado }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 117,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Text, { className: totalPorEstado === totalReportado ? "text-green-600" : "text-red-600", children: totalPorEstado === totalReportado ? "✓" : "✗" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 118,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 115,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Title, { className: "text-lg mt-4 mb-2", children: "Conteos por Categoría" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 123,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Text, { className: "font-bold mb-2", children: "Por Género:" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
            lineNumber: 126,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Text, { children: [
            "Machos: ",
            animales.machos || 0
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
            lineNumber: 127,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Text, { children: [
            "Hembras: ",
            animales.hembras || 0
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
            lineNumber: 128,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 125,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Text, { className: "font-bold mb-2", children: "Por Estado:" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
            lineNumber: 131,
            columnNumber: 13
          }, this),
          Object.entries(animales.por_estado || {}).map(([estado, cantidad]) => /* @__PURE__ */ jsxDEV(Text, { children: [
            estado,
            ": ",
            cantidad
          ] }, estado, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
            lineNumber: 133,
            columnNumber: 15
          }, this))
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 130,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 124,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxDEV(Text, { className: "font-bold mb-2", children: "Por Amamantamiento:" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 139,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-4", children: Object.entries(animales.por_alletar || {}).map(([estado, cantidad]) => /* @__PURE__ */ jsxDEV(Text, { children: [
          "Estado ",
          estado,
          ": ",
          cantidad
        ] }, estado, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 142,
          columnNumber: 15
        }, this)) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 140,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 138,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 92,
      columnNumber: 7
    }, this);
  };
  if (loading) {
    return /* @__PURE__ */ jsxDEV(Card, { className: "mt-4", children: [
      /* @__PURE__ */ jsxDEV(Title, { children: "Datos de Diagnóstico" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 153,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Text, { children: "Cargando datos..." }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 154,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 152,
      columnNumber: 7
    }, this);
  }
  if (error) {
    return /* @__PURE__ */ jsxDEV(Card, { className: "mt-4", children: [
      /* @__PURE__ */ jsxDEV(Title, { children: "Datos de Diagnóstico" }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 162,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Text, { className: "text-red-600", children: error }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 163,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 161,
      columnNumber: 7
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(Card, { className: "mt-4", children: [
    /* @__PURE__ */ jsxDEV(Title, { children: "Datos de Diagnóstico" }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 170,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Text, { className: "text-sm text-gray-500 mb-4", children: "Esta tarjeta muestra los datos crudos del dashboard para diagnóstico." }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 171,
      columnNumber: 7
    }, this),
    renderComparacion(),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsxDEV("details", { className: "mb-4", children: [
        /* @__PURE__ */ jsxDEV("summary", { className: "cursor-pointer font-semibold text-lg", children: "Datos de Stats" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 179,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96", children: /* @__PURE__ */ jsxDEV("pre", { className: "text-xs", children: renderObject(statsData) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 183,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 182,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 178,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("details", { className: "mb-4", children: [
        /* @__PURE__ */ jsxDEV("summary", { className: "cursor-pointer font-semibold text-lg", children: "Datos de Resumen" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 188,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96", children: /* @__PURE__ */ jsxDEV("pre", { className: "text-xs", children: renderObject(resumenData) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 192,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 191,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 187,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("details", { className: "mb-4", children: [
        /* @__PURE__ */ jsxDEV("summary", { className: "cursor-pointer font-semibold text-lg", children: "Datos de Depuración" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 197,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96", children: /* @__PURE__ */ jsxDEV("pre", { className: "text-xs", children: renderObject(debugData) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 201,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
          lineNumber: 200,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
        lineNumber: 196,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
      lineNumber: 177,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboardv2/cards/DiagnosticoDataCard.tsx",
    lineNumber: 169,
    columnNumber: 5
  }, this);
};
export default DiagnosticoDataCard;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNvRGF0YUNhcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBDYXJkLCBUaXRsZSwgVGV4dCB9IGZyb20gJ0B0cmVtb3IvcmVhY3QnO1xuaW1wb3J0IGFwaVNlcnZpY2UgZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvYXBpU2VydmljZSc7XG5cbmNvbnN0IERpYWdub3N0aWNvRGF0YUNhcmQgPSAoKSA9PiB7XG4gIGNvbnN0IFtzdGF0c0RhdGEsIHNldFN0YXRzRGF0YV0gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbcmVzdW1lbkRhdGEsIHNldFJlc3VtZW5EYXRhXSA9IHVzZVN0YXRlPGFueT4obnVsbCk7XG4gIGNvbnN0IFtkZWJ1Z0RhdGEsIHNldERlYnVnRGF0YV0gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZTxib29sZWFuPih0cnVlKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGZldGNoRGF0YSA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICBcbiAgICAgICAgLy8gT2J0ZW5lciBkYXRvcyBkZSBkaWZlcmVudGVzIGVuZHBvaW50c1xuICAgICAgICBjb25zdCBbc3RhdHNSZXNwb25zZSwgcmVzdW1lblJlc3BvbnNlLCBkZWJ1Z1Jlc3BvbnNlXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICBhcGlTZXJ2aWNlLmdldCgnL2Rhc2hib2FyZC9zdGF0cycpLFxuICAgICAgICAgIGFwaVNlcnZpY2UuZ2V0KCcvZGFzaGJvYXJkL3Jlc3VtZW4vJyksXG4gICAgICAgICAgYXBpU2VydmljZS5nZXQoJy9kaWFnbm9zdGljby9kYXNoYm9hcmQtZGVidWcnKVxuICAgICAgICBdKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCdTdGF0cyBkYXRhOicsIHN0YXRzUmVzcG9uc2UpO1xuICAgICAgICBjb25zb2xlLmxvZygnUmVzdW1lbiBkYXRhOicsIHJlc3VtZW5SZXNwb25zZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEZWJ1ZyBkYXRhOicsIGRlYnVnUmVzcG9uc2UpO1xuICAgICAgICBcbiAgICAgICAgc2V0U3RhdHNEYXRhKHN0YXRzUmVzcG9uc2UpO1xuICAgICAgICBzZXRSZXN1bWVuRGF0YShyZXN1bWVuUmVzcG9uc2UpO1xuICAgICAgICBzZXREZWJ1Z0RhdGEoZGVidWdSZXNwb25zZSk7XG4gICAgICAgIFxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGNhcmdhciBkYXRvcyBkZSBkaWFnbsOzc3RpY286JywgZXJyKTtcbiAgICAgICAgc2V0RXJyb3IoJ0Vycm9yIGFsIGNhcmdhciBkYXRvcy4gUG9yIGZhdm9yLCBpbnRlbnRhIGRlIG51ZXZvLicpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBmZXRjaERhdGEoKTtcbiAgfSwgW10pO1xuICBcbiAgLy8gSGVscGVyIHBhcmEgcmVuZGVyaXphciBvYmpldG9zIGFuaWRhZG9zIGNvbW8gdGV4dG9cbiAgY29uc3QgcmVuZGVyT2JqZWN0ID0gKG9iajogYW55LCBsZXZlbCA9IDApOiBSZWFjdE5vZGUgPT4ge1xuICAgIGlmICghb2JqKSByZXR1cm4gPHNwYW4+bnVsbDwvc3Bhbj47XG4gICAgXG4gICAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gPHNwYW4+e1N0cmluZyhvYmopfTwvc3Bhbj47XG4gICAgfVxuICAgIFxuICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luTGVmdDogbGV2ZWwgKiAyMCArICdweCcgfX0+XG4gICAgICAgICAgW1xuICAgICAgICAgIHtvYmoubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgPGRpdiBrZXk9e2luZGV4fT5cbiAgICAgICAgICAgICAge3JlbmRlck9iamVjdChpdGVtLCBsZXZlbCArIDEpfVxuICAgICAgICAgICAgICB7aW5kZXggPCBvYmoubGVuZ3RoIC0gMSA/ICcsJyA6ICcnfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgICAgXVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkxlZnQ6IGxldmVsICogMjAgKyAncHgnIH19PlxuICAgICAgICB7J3snfVxuICAgICAgICB7T2JqZWN0LmVudHJpZXMob2JqKS5tYXAoKFtrZXksIHZhbHVlXSwgaW5kZXgsIGFycikgPT4gKFxuICAgICAgICAgIDxkaXYga2V5PXtrZXl9PlxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFdlaWdodDogJ2JvbGQnIH19PntrZXl9PC9zcGFuPjoge3JlbmRlck9iamVjdCh2YWx1ZSBhcyBhbnksIGxldmVsICsgMSl9XG4gICAgICAgICAgICB7aW5kZXggPCBhcnIubGVuZ3RoIC0gMSA/ICcsJyA6ICcnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgICAgeyd9J31cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH07XG4gIFxuICAvLyBTZWNjacOzbiBwYXJhIGNvbXBhcmFyIGNvbnRlb3MgaW1wb3J0YW50ZXNcbiAgY29uc3QgcmVuZGVyQ29tcGFyYWNpb24gPSAoKSA9PiB7XG4gICAgaWYgKCFzdGF0c0RhdGEgfHwgIXN0YXRzRGF0YS5hbmltYWxlcykgcmV0dXJuIG51bGw7XG4gICAgXG4gICAgY29uc3QgYW5pbWFsZXMgPSBzdGF0c0RhdGEuYW5pbWFsZXM7XG4gICAgY29uc3QgdG90YWxSZXBvcnRhZG8gPSBhbmltYWxlcy50b3RhbCB8fCAwO1xuICAgIGNvbnN0IHRvdGFsUG9yR2VuZXJvID0gKGFuaW1hbGVzLm1hY2hvcyB8fCAwKSArIChhbmltYWxlcy5oZW1icmFzIHx8IDApO1xuICAgIGNvbnN0IHRvdGFsUG9yRXN0YWRvID0gT2JqZWN0LnZhbHVlcyhhbmltYWxlcy5wb3JfZXN0YWRvIHx8IHt9KS5yZWR1Y2UoKHN1bTogYW55LCB2YWw6IGFueSkgPT4gc3VtICsgdmFsLCAwKTtcbiAgICBcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC00IHAtNCBiZy15ZWxsb3ctNTAgcm91bmRlZC1sZ1wiPlxuICAgICAgICA8VGl0bGUgY2xhc3NOYW1lPVwidGV4dC1sZyBtYi0yXCI+VmVyaWZpY2FjacOzbiBkZSBDb250ZW9zPC9UaXRsZT5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMyBnYXAtNCBtYi0yXCI+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZm9udC1ib2xkXCI+Q29uY2VwdG88L1RleHQ+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZm9udC1ib2xkXCI+VmFsb3I8L1RleHQ+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZm9udC1ib2xkXCI+Q29uY3VlcmRhPC9UZXh0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMyBnYXAtNCBtYi0xXCI+XG4gICAgICAgICAgPFRleHQ+VG90YWwgcmVwb3J0YWRvPC9UZXh0PlxuICAgICAgICAgIDxUZXh0Pnt0b3RhbFJlcG9ydGFkb308L1RleHQ+XG4gICAgICAgICAgPFRleHQ+LTwvVGV4dD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTQgbWItMVwiPlxuICAgICAgICAgIDxUZXh0PlRvdGFsIHBvciBnw6luZXJvPC9UZXh0PlxuICAgICAgICAgIDxUZXh0Pnt0b3RhbFBvckdlbmVyb308L1RleHQ+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPXt0b3RhbFBvckdlbmVybyA9PT0gdG90YWxSZXBvcnRhZG8gPyBcInRleHQtZ3JlZW4tNjAwXCIgOiBcInRleHQtcmVkLTYwMFwifT5cbiAgICAgICAgICAgIHt0b3RhbFBvckdlbmVybyA9PT0gdG90YWxSZXBvcnRhZG8gPyBcIuKck1wiIDogXCLinJdcIn1cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0zIGdhcC00IG1iLTFcIj5cbiAgICAgICAgICA8VGV4dD5Ub3RhbCBwb3IgZXN0YWRvPC9UZXh0PlxuICAgICAgICAgIDxUZXh0Pnt0b3RhbFBvckVzdGFkb308L1RleHQ+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPXt0b3RhbFBvckVzdGFkbyA9PT0gdG90YWxSZXBvcnRhZG8gPyBcInRleHQtZ3JlZW4tNjAwXCIgOiBcInRleHQtcmVkLTYwMFwifT5cbiAgICAgICAgICAgIHt0b3RhbFBvckVzdGFkbyA9PT0gdG90YWxSZXBvcnRhZG8gPyBcIuKck1wiIDogXCLinJdcIn1cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgPFRpdGxlIGNsYXNzTmFtZT1cInRleHQtbGcgbXQtNCBtYi0yXCI+Q29udGVvcyBwb3IgQ2F0ZWdvcsOtYTwvVGl0bGU+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJmb250LWJvbGQgbWItMlwiPlBvciBHw6luZXJvOjwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0Pk1hY2hvczoge2FuaW1hbGVzLm1hY2hvcyB8fCAwfTwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0PkhlbWJyYXM6IHthbmltYWxlcy5oZW1icmFzIHx8IDB9PC9UZXh0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJmb250LWJvbGQgbWItMlwiPlBvciBFc3RhZG86PC9UZXh0PlxuICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKGFuaW1hbGVzLnBvcl9lc3RhZG8gfHwge30pLm1hcCgoW2VzdGFkbywgY2FudGlkYWRdOiBbc3RyaW5nLCBhbnldKSA9PiAoXG4gICAgICAgICAgICAgIDxUZXh0IGtleT17ZXN0YWRvfT57ZXN0YWRvfToge2NhbnRpZGFkfTwvVGV4dD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNFwiPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImZvbnQtYm9sZCBtYi0yXCI+UG9yIEFtYW1hbnRhbWllbnRvOjwvVGV4dD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTRcIj5cbiAgICAgICAgICAgIHtPYmplY3QuZW50cmllcyhhbmltYWxlcy5wb3JfYWxsZXRhciB8fCB7fSkubWFwKChbZXN0YWRvLCBjYW50aWRhZF06IFtzdHJpbmcsIGFueV0pID0+IChcbiAgICAgICAgICAgICAgPFRleHQga2V5PXtlc3RhZG99PkVzdGFkbyB7ZXN0YWRvfToge2NhbnRpZGFkfTwvVGV4dD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH07XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPENhcmQgY2xhc3NOYW1lPVwibXQtNFwiPlxuICAgICAgICA8VGl0bGU+RGF0b3MgZGUgRGlhZ27Ds3N0aWNvPC9UaXRsZT5cbiAgICAgICAgPFRleHQ+Q2FyZ2FuZG8gZGF0b3MuLi48L1RleHQ+XG4gICAgICA8L0NhcmQ+XG4gICAgKTtcbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiAoXG4gICAgICA8Q2FyZCBjbGFzc05hbWU9XCJtdC00XCI+XG4gICAgICAgIDxUaXRsZT5EYXRvcyBkZSBEaWFnbsOzc3RpY288L1RpdGxlPlxuICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0ZXh0LXJlZC02MDBcIj57ZXJyb3J9PC9UZXh0PlxuICAgICAgPC9DYXJkPlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxDYXJkIGNsYXNzTmFtZT1cIm10LTRcIj5cbiAgICAgIDxUaXRsZT5EYXRvcyBkZSBEaWFnbsOzc3RpY288L1RpdGxlPlxuICAgICAgPFRleHQgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIG1iLTRcIj5cbiAgICAgICAgRXN0YSB0YXJqZXRhIG11ZXN0cmEgbG9zIGRhdG9zIGNydWRvcyBkZWwgZGFzaGJvYXJkIHBhcmEgZGlhZ27Ds3N0aWNvLlxuICAgICAgPC9UZXh0PlxuICAgICAgXG4gICAgICB7cmVuZGVyQ29tcGFyYWNpb24oKX1cbiAgICAgIFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC02XCI+XG4gICAgICAgIDxkZXRhaWxzIGNsYXNzTmFtZT1cIm1iLTRcIj5cbiAgICAgICAgICA8c3VtbWFyeSBjbGFzc05hbWU9XCJjdXJzb3ItcG9pbnRlciBmb250LXNlbWlib2xkIHRleHQtbGdcIj5cbiAgICAgICAgICAgIERhdG9zIGRlIFN0YXRzXG4gICAgICAgICAgPC9zdW1tYXJ5PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtMiBwLTQgYmctZ3JheS01MCByb3VuZGVkLWxnIG92ZXJmbG93LWF1dG8gbWF4LWgtOTZcIj5cbiAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwidGV4dC14c1wiPntyZW5kZXJPYmplY3Qoc3RhdHNEYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KX08L3ByZT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICBcbiAgICAgICAgPGRldGFpbHMgY2xhc3NOYW1lPVwibWItNFwiPlxuICAgICAgICAgIDxzdW1tYXJ5IGNsYXNzTmFtZT1cImN1cnNvci1wb2ludGVyIGZvbnQtc2VtaWJvbGQgdGV4dC1sZ1wiPlxuICAgICAgICAgICAgRGF0b3MgZGUgUmVzdW1lblxuICAgICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTIgcC00IGJnLWdyYXktNTAgcm91bmRlZC1sZyBvdmVyZmxvdy1hdXRvIG1heC1oLTk2XCI+XG4gICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cInRleHQteHNcIj57cmVuZGVyT2JqZWN0KHJlc3VtZW5EYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KX08L3ByZT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICBcbiAgICAgICAgPGRldGFpbHMgY2xhc3NOYW1lPVwibWItNFwiPlxuICAgICAgICAgIDxzdW1tYXJ5IGNsYXNzTmFtZT1cImN1cnNvci1wb2ludGVyIGZvbnQtc2VtaWJvbGQgdGV4dC1sZ1wiPlxuICAgICAgICAgICAgRGF0b3MgZGUgRGVwdXJhY2nDs25cbiAgICAgICAgICA8L3N1bW1hcnk+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC0yIHAtNCBiZy1ncmF5LTUwIHJvdW5kZWQtbGcgb3ZlcmZsb3ctYXV0byBtYXgtaC05NlwiPlxuICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJ0ZXh0LXhzXCI+e3JlbmRlck9iamVjdChkZWJ1Z0RhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pfTwvcHJlPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2RldGFpbHM+XG4gICAgICA8L2Rpdj5cbiAgICA8L0NhcmQ+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEaWFnbm9zdGljb0RhdGFDYXJkO1xuIl0sIm1hcHBpbmdzIjoiQUE4Q3FCO0FBOUNyQixPQUFPLFNBQVMsVUFBVSxpQkFBaUI7QUFFM0MsU0FBUyxNQUFNLE9BQU8sWUFBWTtBQUNsQyxPQUFPLGdCQUFnQjtBQUV2QixNQUFNLHNCQUFzQixNQUFNO0FBQ2hDLFFBQU0sQ0FBQyxXQUFXLFlBQVksSUFBSSxTQUFjLElBQUk7QUFDcEQsUUFBTSxDQUFDLGFBQWEsY0FBYyxJQUFJLFNBQWMsSUFBSTtBQUN4RCxRQUFNLENBQUMsV0FBVyxZQUFZLElBQUksU0FBYyxJQUFJO0FBQ3BELFFBQU0sQ0FBQyxTQUFTLFVBQVUsSUFBSSxTQUFrQixJQUFJO0FBQ3BELFFBQU0sQ0FBQyxPQUFPLFFBQVEsSUFBSSxTQUF3QixJQUFJO0FBRXRELFlBQVUsTUFBTTtBQUNkLFVBQU0sWUFBWSxZQUFZO0FBQzVCLFVBQUk7QUFDRixtQkFBVyxJQUFJO0FBQ2YsaUJBQVMsSUFBSTtBQUdiLGNBQU0sQ0FBQyxlQUFlLGlCQUFpQixhQUFhLElBQUksTUFBTSxRQUFRLElBQUk7QUFBQSxVQUN4RSxXQUFXLElBQUksa0JBQWtCO0FBQUEsVUFDakMsV0FBVyxJQUFJLHFCQUFxQjtBQUFBLFVBQ3BDLFdBQVcsSUFBSSw4QkFBOEI7QUFBQSxRQUMvQyxDQUFDO0FBRUQsZ0JBQVEsSUFBSSxlQUFlLGFBQWE7QUFDeEMsZ0JBQVEsSUFBSSxpQkFBaUIsZUFBZTtBQUM1QyxnQkFBUSxJQUFJLGVBQWUsYUFBYTtBQUV4QyxxQkFBYSxhQUFhO0FBQzFCLHVCQUFlLGVB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