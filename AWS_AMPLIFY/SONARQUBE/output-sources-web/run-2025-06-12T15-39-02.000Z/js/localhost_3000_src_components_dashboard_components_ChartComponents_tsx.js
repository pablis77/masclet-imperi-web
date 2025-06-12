import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useEffect = __vite__cjsImport1_react["useEffect"]; const useState = __vite__cjsImport1_react["useState"];
import { Pie, Bar, Line } from "/node_modules/.vite/deps/react-chartjs-2.js?v=5e89932e";
import { t } from "/src/i18n/config.ts";
import { registerChartComponents } from "/src/utils/chartConfig.ts";
registerChartComponents();
const CHART_COLORS = {
  TOROS_ACTIVOS: "#3b82f6",
  // Azul para toros activos
  FALLECIDOS: "#f97316",
  // Naranja para fallecidos (original)
  VACAS: "#ec4899",
  // Rosa para vacas
  VACAS_AMAM_0: "#f59e0b",
  // Ámbar para vacas sin amamantar
  VACAS_AMAM_1: "#06b6d4",
  // Cyan para vacas con 1 ternero
  VACAS_AMAM_2: "#ef4444"
  // Rojo para vacas con 2 terneros
};
export const GenderChart = ({ data, darkMode }) => {
  const [currentLang, setCurrentLang] = useState("es");
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLanguageChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLanguageChange);
    return () => window.removeEventListener("storage", handleLanguageChange);
  }, []);
  if (!data) return null;
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    data = {
      [t("dashboard.males", currentLang)]: 0,
      [t("dashboard.females", currentLang)]: 0,
      [t("dashboard.deceased", currentLang)]: 0
    };
  }
  const labels = Object.keys(data);
  const chartData = {
    labels,
    datasets: [
      {
        label: t("dashboard.population_analysis", currentLang),
        data: Object.values(data),
        backgroundColor: [
          `${CHART_COLORS.TOROS_ACTIVOS}CC`,
          // Azul - Toros (con transparencia)
          `${CHART_COLORS.VACAS}CC`,
          // Rosa - Vacas (con transparencia)
          `${CHART_COLORS.FALLECIDOS}CC`
          // Naranja - Fallecidos (con transparencia)
        ],
        borderColor: [
          CHART_COLORS.TOROS_ACTIVOS,
          CHART_COLORS.VACAS,
          CHART_COLORS.FALLECIDOS
        ],
        borderWidth: 1
      }
    ]
  };
  return /* @__PURE__ */ jsxDEV(Pie, { data: chartData }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 80,
    columnNumber: 10
  }, this);
};
export const GenderCriaChart = ({ data, darkMode }) => {
  const [currentLang, setCurrentLang] = useState("es");
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLanguageChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLanguageChange);
    return () => window.removeEventListener("storage", handleLanguageChange);
  }, []);
  if (!data) return null;
  let formattedData = {
    "M": 0,
    "F": 0,
    "esforrada": 0
  };
  if (data) {
    const hasExpectedKeys = "M" in data && "F" in data;
    if (hasExpectedKeys) {
      formattedData = {
        "M": data["M"] || 0,
        "F": data["F"] || 0,
        "esforrada": data["esforrada"] || 0
      };
    } else {
      Object.entries(data).forEach(([key, value]) => {
        if (key === "M" || key === "m") {
          formattedData["M"] += value;
        } else if (key === "F" || key === "f") {
          formattedData["F"] += value;
        } else if (key === "esforrada" || key === "ESFORRADA") {
          formattedData["esforrada"] += value;
        }
      });
    }
  }
  const labelsMap = {
    "M": t("dashboard.males", currentLang),
    "F": t("dashboard.females", currentLang),
    "esforrada": t("dashboard.others", currentLang)
  };
  const labels = Object.keys(formattedData).map((key) => labelsMap[key] || key);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Género de las crías",
        data: Object.values(formattedData),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          // Azul - Machos
          "rgba(236, 72, 153, 0.7)",
          // Rosa - Hembras
          "rgba(249, 115, 22, 0.7)"
          // Naranja - Otros
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(249, 115, 22, 1)"
        ],
        borderWidth: 1
      }
    ]
  };
  return /* @__PURE__ */ jsxDEV(Pie, { data: chartData }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 170,
    columnNumber: 10
  }, this);
};
export const StatusChart = ({ data, darkMode }) => {
  if (!data) return null;
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    data = {
      "Activos": 0,
      "Inactivos": 0
    };
  }
  const labels = Object.keys(data).map((key) => {
    if (key === "OK") return "Activos";
    if (key === "DEF") return "Fallecidos";
    return key;
  });
  const chartData = {
    labels,
    datasets: [
      {
        label: "Estado",
        data: Object.values(data),
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          // Verde
          "rgba(239, 68, 68, 0.7)"
          // Rojo
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(239, 68, 68, 1)"
        ],
        borderWidth: 1
      }
    ]
  };
  return /* @__PURE__ */ jsxDEV(Pie, { data: chartData }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 212,
    columnNumber: 10
  }, this);
};
export const QuadraChart = ({ data, darkMode }) => {
  if (!data) return null;
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    data = {
      "Cuadra A": 0,
      "Cuadra B": 0,
      "Cuadra C": 0
    };
  }
  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const chartData = {
    labels: sortedEntries.map(([key]) => key),
    datasets: [
      {
        label: "Distribución por Origen",
        data: sortedEntries.map(([_, value]) => value),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1
      }
    ]
  };
  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  return /* @__PURE__ */ jsxDEV(Bar, { data: chartData, options }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 255,
    columnNumber: 10
  }, this);
};
export const MonthlyChart = ({ data, darkMode }) => {
  if (!data) return null;
  const completeMonthsData = {
    "Ene": 0,
    "Feb": 0,
    "Mar": 0,
    "Abr": 0,
    "May": 0,
    "Jun": 0,
    "Jul": 0,
    "Ago": 0,
    "Sep": 0,
    "Oct": 0,
    "Nov": 0,
    "Dic": 0
  };
  const monthsMap = {
    "01": "Ene",
    "1": "Ene",
    "02": "Feb",
    "2": "Feb",
    "03": "Mar",
    "3": "Mar",
    "04": "Abr",
    "4": "Abr",
    "05": "May",
    "5": "May",
    "06": "Jun",
    "6": "Jun",
    "07": "Jul",
    "7": "Jul",
    "08": "Ago",
    "8": "Ago",
    "09": "Sep",
    "9": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dic"
  };
  if (data && Object.keys(data).length > 0) {
    Object.entries(data).forEach(([key, value]) => {
      const monthMatch = key.match(/-(\d{1,2})$/) || key.match(/-(\d{1,2})-/) || key.match(/^(\d{1,2})$/);
      if (monthMatch && monthMatch[1]) {
        const monthKey = monthsMap[monthMatch[1]] || key;
        if (monthKey in completeMonthsData) {
          completeMonthsData[monthKey] += value;
        }
      } else if (key in completeMonthsData) {
        completeMonthsData[key] += value;
      }
    });
  }
  const monthOrder = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const chartData = {
    labels: monthOrder,
    datasets: [
      {
        label: "Partos por mes",
        data: monthOrder.map((month) => completeMonthsData[month]),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1
      }
    ]
  };
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Fuerza a que los valores en el eje Y sean enteros
          stepSize: 1,
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: "top"
      }
    }
  };
  return /* @__PURE__ */ jsxDEV(Bar, { data: chartData, options }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 336,
    columnNumber: 10
  }, this);
};
export const TrendChart = ({ data, darkMode }) => {
  if (!data) return null;
  const sortedKeys = Object.keys(data).filter((year) => data[year] > 0).sort((a, b) => parseInt(a) - parseInt(b));
  const chartData = {
    labels: sortedKeys,
    datasets: [
      {
        label: "Partos por año",
        data: sortedKeys.map((year) => data[year]),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4
      }
    ]
  };
  return /* @__PURE__ */ jsxDEV(Line, { data: chartData, options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Año"
        }
      },
      y: {
        title: {
          display: true,
          text: "Número de partos"
        },
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => `Año ${items[0].label}`,
          label: (context) => `Partos: ${context.formattedValue}`
        }
      }
    }
  } }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 361,
    columnNumber: 10
  }, this);
};
export const DistribucionAnualChart = ({ darkMode, data }) => {
  const [currentLang, setCurrentLang] = useState("es");
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLanguageChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLanguageChange);
    return () => window.removeEventListener("storage", handleLanguageChange);
  }, []);
  const datosReales = data || {};
  const tieneValores = Object.values(datosReales).some((valor) => valor > 0);
  if (!tieneValores) {
    return /* @__PURE__ */ jsxDEV("div", { style: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: darkMode ? "#d1d5db" : "#6b7280"
    }, children: currentLang === "ca" ? "No hi ha dades disponibles" : "No hay datos disponibles" }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
      lineNumber: 420,
      columnNumber: 7
    }, this);
  }
  if (!data || typeof data !== "object") {
    console.error("No se recibieron datos válidos para el gráfico anual");
    return /* @__PURE__ */ jsxDEV("div", { style: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: darkMode ? "#d1d5db" : "#6b7280"
    }, children: currentLang === "ca" ? "No hi ha dades disponibles" : "No hay datos disponibles" }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
      lineNumber: 436,
      columnNumber: 7
    }, this);
  }
  const years = Object.keys(data).filter((year) => typeof data[year] === "number" && data[year] > 0).sort((a, b) => parseInt(a) - parseInt(b));
  const chartData = {
    labels: years,
    datasets: [
      {
        label: currentLang === "ca" ? "Parts per any" : "Partos por año",
        data: years.map((year) => {
          return data && typeof data === "object" && year in data ? data[year] : 0;
        }),
        backgroundColor: "#10b981",
        // Verde esmeralda
        borderColor: "#059669",
        borderWidth: 1
      }
    ]
  };
  return /* @__PURE__ */ jsxDEV(Bar, { data: chartData, options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Año"
        }
      },
      y: {
        title: {
          display: true,
          text: "Número de partos"
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (items) => `Año ${items[0].label}`,
          label: (context) => `Partos: ${context.formattedValue}`
        }
      }
    }
  } }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 470,
    columnNumber: 10
  }, this);
};
export const DistribucionMensualChart = ({ darkMode, data }) => {
  const [currentLang, setCurrentLang] = useState("es");
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLanguageChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLanguageChange);
    return () => window.removeEventListener("storage", handleLanguageChange);
  }, []);
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];
  const mesesCat = [
    "Gener",
    "Febrer",
    "Març",
    "Abril",
    "Maig",
    "Juny",
    "Juliol",
    "Agost",
    "Setembre",
    "Octubre",
    "Novembre",
    "Desembre"
  ];
  const nombresMeses = currentLang === "ca" ? mesesCat : meses;
  const distribucionPorMesInicial = {
    "Enero": 0,
    "Febrero": 0,
    "Marzo": 0,
    "Abril": 0,
    "Mayo": 0,
    "Junio": 0,
    "Julio": 0,
    "Agosto": 0,
    "Septiembre": 0,
    "Octubre": 0,
    "Noviembre": 0,
    "Diciembre": 0
  };
  let distribucionPorMes = { ...distribucionPorMesInicial };
  if (data && typeof data === "object") {
    if ("por_mes" in data && data.por_mes && typeof data.por_mes === "object") {
      distribucionPorMes = data.por_mes;
    } else if ("Enero" in data || "enero" in data) {
      distribucionPorMes = data;
    } else {
      Object.entries(data).forEach(([clave, valor]) => {
        if (clave.match(/^\d{4}-\d{2}$/)) {
          const mes = parseInt(clave.split("-")[1]);
          if (mes >= 1 && mes <= 12) {
            const nombreMes = meses[mes - 1];
            if (typeof valor === "number") {
              distribucionPorMes[nombreMes] += valor;
            }
          }
        }
      });
    }
  }
  const valoresMeses = meses.map((mes) => {
    return distribucionPorMes[mes] || 0;
  });
  const chartData = {
    labels: nombresMeses,
    datasets: [
      {
        label: currentLang === "ca" ? "Parts per mes" : "Partos por mes",
        data: valoresMeses,
        backgroundColor: "#3b82f6",
        // Azul
        borderColor: "#2563eb",
        borderWidth: 1
      }
    ]
  };
  return /* @__PURE__ */ jsxDEV(Bar, { data: chartData, options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Mes"
        }
      },
      y: {
        title: {
          display: true,
          text: "Número de partos"
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (items) => items[0].label,
          label: (context) => `Partos: ${context.formattedValue}`
        }
      }
    }
  } }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/ChartComponents.tsx",
    lineNumber: 599,
    columnNumber: 10
  }, this);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoYXJ0Q29tcG9uZW50cy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQaWUsIEJhciwgTGluZSB9IGZyb20gJ3JlYWN0LWNoYXJ0anMtMic7XG5pbXBvcnQgeyB0IH0gZnJvbSAnLi4vLi4vLi4vaTE4bi9jb25maWcnO1xuXG4vLyBJbXBvcnRhciBsYSBjb25maWd1cmFjacOzbiBkZSBDaGFydC5qc1xuaW1wb3J0IHsgcmVnaXN0ZXJDaGFydENvbXBvbmVudHMgfSBmcm9tICcuLi8uLi8uLi91dGlscy9jaGFydENvbmZpZyc7XG5cbi8vIFJlZ2lzdHJhciBsb3MgY29tcG9uZW50ZXMgZGUgQ2hhcnQuanMgYW50ZXMgZGUgdXNhcmxvc1xucmVnaXN0ZXJDaGFydENvbXBvbmVudHMoKTtcblxuLy8gQ29sb3JlcyBlc3RhbmRhcml6YWRvcyBwYXJhIGxvcyBncsOhZmljb3MgKGNvaW5jaWRlbiBjb24gbG9zIGNvbG9yZXMgZGUgbGFzIHRhcmpldGFzKVxuY29uc3QgQ0hBUlRfQ09MT1JTID0ge1xuICBUT1JPU19BQ1RJVk9TOiAnIzNiODJmNicsIC8vIEF6dWwgcGFyYSB0b3JvcyBhY3Rpdm9zXG4gIEZBTExFQ0lET1M6ICcjZjk3MzE2JywgICAgLy8gTmFyYW5qYSBwYXJhIGZhbGxlY2lkb3MgKG9yaWdpbmFsKVxuICBWQUNBUzogJyNlYzQ4OTknLCAgICAgICAgIC8vIFJvc2EgcGFyYSB2YWNhc1xuICBWQUNBU19BTUFNXzA6ICcjZjU5ZTBiJywgIC8vIMOBbWJhciBwYXJhIHZhY2FzIHNpbiBhbWFtYW50YXJcbiAgVkFDQVNfQU1BTV8xOiAnIzA2YjZkNCcsICAvLyBDeWFuIHBhcmEgdmFjYXMgY29uIDEgdGVybmVyb1xuICBWQUNBU19BTUFNXzI6ICcjZWY0NDQ0JyAgIC8vIFJvam8gcGFyYSB2YWNhcyBjb24gMiB0ZXJuZXJvc1xufTtcblxuLy8gQ29tcG9uZW50ZXMgZGUgZ3LDoWZpY29zIGV4dHJhw61kb3MgZGlyZWN0YW1lbnRlIGRlbCBkYXNoYm9hcmQgb3JpZ2luYWxcblxuLy8gUmVuZGVyaXphciBncsOhZmljbyBkZSBkaXN0cmlidWNpw7NuIHBvciBnw6luZXJvXG5leHBvcnQgY29uc3QgR2VuZGVyQ2hhcnQgPSAoeyBkYXRhLCBkYXJrTW9kZSB9OiB7IGRhdGE6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gfCB1bmRlZmluZWQsIGRhcmtNb2RlOiBib29sZWFuIH0pID0+IHtcbiAgLy8gRXN0YWRvIHBhcmEgZWwgaWRpb21hIGFjdHVhbFxuICBjb25zdCBbY3VycmVudExhbmcsIHNldEN1cnJlbnRMYW5nXSA9IHVzZVN0YXRlKCdlcycpO1xuICBcbiAgLy8gT2J0ZW5lciBlbCBpZGlvbWEgYWN0dWFsIGRlbCBsb2NhbFN0b3JhZ2VcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzdG9yZWRMYW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJMYW5ndWFnZScpIHx8ICdlcyc7XG4gICAgc2V0Q3VycmVudExhbmcoc3RvcmVkTGFuZyk7XG4gICAgXG4gICAgLy8gRXNjdWNoYXIgY2FtYmlvcyBkZSBpZGlvbWFcbiAgICBjb25zdCBoYW5kbGVMYW5ndWFnZUNoYW5nZSA9IChlOiBTdG9yYWdlRXZlbnQpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ3VzZXJMYW5ndWFnZScpIHtcbiAgICAgICAgc2V0Q3VycmVudExhbmcoZS5uZXdWYWx1ZSB8fCAnZXMnKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UpO1xuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGhhbmRsZUxhbmd1YWdlQ2hhbmdlKTtcbiAgfSwgW10pO1xuICBcbiAgaWYgKCFkYXRhKSByZXR1cm4gbnVsbDtcbiAgXG4gIC8vIFNpIGVsIG9iamV0byBlc3TDoSB2YWPDrW8gbyB0b2RvcyBsb3MgdmFsb3JlcyBzb24gMCwgbW9zdHJhciB1biBncsOhZmljbyBjb24gdmFsb3JlcyBkZSBlamVtcGxvXG4gIGNvbnN0IHRvdGFsVmFsdWUgPSBPYmplY3QudmFsdWVzKGRhdGEpLnJlZHVjZSgoc3VtLCB2YWx1ZSkgPT4gc3VtICsgdmFsdWUsIDApO1xuICBpZiAoT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09PSAwIHx8IHRvdGFsVmFsdWUgPT09IDApIHtcbiAgICBkYXRhID0ge1xuICAgICAgW3QoJ2Rhc2hib2FyZC5tYWxlcycsIGN1cnJlbnRMYW5nKV06IDAsXG4gICAgICBbdCgnZGFzaGJvYXJkLmZlbWFsZXMnLCBjdXJyZW50TGFuZyldOiAwLFxuICAgICAgW3QoJ2Rhc2hib2FyZC5kZWNlYXNlZCcsIGN1cnJlbnRMYW5nKV06IDBcbiAgICB9O1xuICB9XG4gIFxuICAvLyBNYXBlYXIgZXRpcXVldGFzIHkgY29sb3Jlc1xuICBjb25zdCBsYWJlbHMgPSBPYmplY3Qua2V5cyhkYXRhKTtcbiAgXG4gIGNvbnN0IGNoYXJ0RGF0YSA9IHtcbiAgICBsYWJlbHMsXG4gICAgZGF0YXNldHM6IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IHQoJ2Rhc2hib2FyZC5wb3B1bGF0aW9uX2FuYWx5c2lzJywgY3VycmVudExhbmcpLFxuICAgICAgICBkYXRhOiBPYmplY3QudmFsdWVzKGRhdGEpLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFtcbiAgICAgICAgICBgJHtDSEFSVF9DT0xPUlMuVE9ST1NfQUNUSVZPU31DQ2AsIC8vIEF6dWwgLSBUb3JvcyAoY29uIHRyYW5zcGFyZW5jaWEpXG4gICAgICAgICAgYCR7Q0hBUlRfQ09MT1JTLlZBQ0FTfUNDYCwgICAgICAgICAvLyBSb3NhIC0gVmFjYXMgKGNvbiB0cmFuc3BhcmVuY2lhKVxuICAgICAgICAgIGAke0NIQVJUX0NPTE9SUy5GQUxMRUNJRE9TfUNDYCwgICAgLy8gTmFyYW5qYSAtIEZhbGxlY2lkb3MgKGNvbiB0cmFuc3BhcmVuY2lhKVxuICAgICAgICBdLFxuICAgICAgICBib3JkZXJDb2xvcjogW1xuICAgICAgICAgIENIQVJUX0NPTE9SUy5UT1JPU19BQ1RJVk9TLFxuICAgICAgICAgIENIQVJUX0NPTE9SUy5WQUNBUyxcbiAgICAgICAgICBDSEFSVF9DT0xPUlMuRkFMTEVDSURPUyxcbiAgICAgICAgXSxcbiAgICAgICAgYm9yZGVyV2lkdGg6IDEsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG4gIFxuICByZXR1cm4gPFBpZSBkYXRhPXtjaGFydERhdGF9IC8+XG59O1xuXG4vLyBSZW5kZXJpemFyIGdyw6FmaWNvIGRlIGRpc3RyaWJ1Y2nDs24gcG9yIGfDqW5lcm8gZGUgY3LDrWFzXG5leHBvcnQgY29uc3QgR2VuZGVyQ3JpYUNoYXJ0ID0gKHsgZGF0YSwgZGFya01vZGUgfTogeyBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+IHwgdW5kZWZpbmVkLCBkYXJrTW9kZTogYm9vbGVhbiB9KSA9PiB7XG4gIC8vIEVzdGFkbyBwYXJhIGVsIGlkaW9tYSBhY3R1YWxcbiAgY29uc3QgW2N1cnJlbnRMYW5nLCBzZXRDdXJyZW50TGFuZ10gPSB1c2VTdGF0ZSgnZXMnKTtcbiAgXG4gIC8vIE9idGVuZXIgZWwgaWRpb21hIGFjdHVhbCBkZWwgbG9jYWxTdG9yYWdlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3RvcmVkTGFuZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyTGFuZ3VhZ2UnKSB8fCAnZXMnO1xuICAgIHNldEN1cnJlbnRMYW5nKHN0b3JlZExhbmcpO1xuICAgIFxuICAgIC8vIEVzY3VjaGFyIGNhbWJpb3MgZGUgaWRpb21hXG4gICAgY29uc3QgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UgPSAoZTogU3RvcmFnZUV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICd1c2VyTGFuZ3VhZ2UnKSB7XG4gICAgICAgIHNldEN1cnJlbnRMYW5nKGUubmV3VmFsdWUgfHwgJ2VzJyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGhhbmRsZUxhbmd1YWdlQ2hhbmdlKTtcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBoYW5kbGVMYW5ndWFnZUNoYW5nZSk7XG4gIH0sIFtdKTtcblxuICBpZiAoIWRhdGEpIHJldHVybiBudWxsO1xuICBcbiAgLy8gRGF0b3MgZXNwZWPDrWZpY29zIHBhcmEgbWFjaG9zIHkgaGVtYnJhc1xuICBsZXQgZm9ybWF0dGVkRGF0YTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHtcbiAgICAnTSc6IDAsXG4gICAgJ0YnOiAwLFxuICAgICdlc2ZvcnJhZGEnOiAwXG4gIH07XG4gIFxuICAvLyBBc2lnbmFyIGRhdG9zIGRlIGVudHJhZGEgYSBsYXMgY2F0ZWdvcsOtYXMgY29ycmVjdGFzXG4gIGlmIChkYXRhKSB7XG4gICAgLy8gVmVyaWZpY2FyIHNpIGhlbW9zIHJlY2liaWRvIGxvcyBkYXRvcyB5YSBlbiBlbCBmb3JtYXRvIGNvcnJlY3RvXG4gICAgLy8gVmVyaWZpY2Ftb3Mgc2kgbGFzIGNsYXZlcyBzb24gZXhhY3RhbWVudGUgTSwgRiB5IHBvc2libGVtZW50ZSBlc2ZvcnJhZGFcbiAgICBjb25zdCBoYXNFeHBlY3RlZEtleXMgPSAnTScgaW4gZGF0YSAmJiAnRicgaW4gZGF0YTtcbiAgICBcbiAgICBpZiAoaGFzRXhwZWN0ZWRLZXlzKSB7XG4gICAgICAvLyBTaSB5YSBlc3TDoW4gZW4gZWwgZm9ybWF0byBlc3BlcmFkbywgdXNhbW9zIGRpcmVjdGFtZW50ZVxuICAgICAgZm9ybWF0dGVkRGF0YSA9IHtcbiAgICAgICAgJ00nOiBkYXRhWydNJ10gfHwgMCxcbiAgICAgICAgJ0YnOiBkYXRhWydGJ10gfHwgMCxcbiAgICAgICAgJ2VzZm9ycmFkYSc6IGRhdGFbJ2VzZm9ycmFkYSddIHx8IDBcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFByb2Nlc2FtaWVudG8gZXN0w6FuZGFyIHNpIG5vIGVzdMOhbiBlbiBlbCBmb3JtYXRvIGVzcGVyYWRvXG4gICAgICBPYmplY3QuZW50cmllcyhkYXRhKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ00nIHx8IGtleSA9PT0gJ20nKSB7XG4gICAgICAgICAgZm9ybWF0dGVkRGF0YVsnTSddICs9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ0YnIHx8IGtleSA9PT0gJ2YnKSB7XG4gICAgICAgICAgZm9ybWF0dGVkRGF0YVsnRiddICs9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VzZm9ycmFkYScgfHwga2V5ID09PSAnRVNGT1JSQURBJykge1xuICAgICAgICAgIGZvcm1hdHRlZERhdGFbJ2VzZm9ycmFkYSddICs9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIFByZXBhcmFyIGV0aXF1ZXRhcyBhbWlnYWJsZXMgcGFyYSBlbCB1c3VhcmlvXG4gIGNvbnN0IGxhYmVsc01hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAnTSc6IHQoJ2Rhc2hib2FyZC5tYWxlcycsIGN1cnJlbnRMYW5nKSxcbiAgICAnRic6IHQoJ2Rhc2hib2FyZC5mZW1hbGVzJywgY3VycmVudExhbmcpLFxuICAgICdlc2ZvcnJhZGEnOiB0KCdkYXNoYm9hcmQub3RoZXJzJywgY3VycmVudExhbmcpXG4gIH07XG4gIFxuICBjb25zdCBsYWJlbHMgPSBPYmplY3Qua2V5cyhmb3JtYXR0ZWREYXRhKS5tYXAoa2V5ID0+IGxhYmVsc01hcFtrZXldIHx8IGtleSk7XG4gIFxuICBjb25zdCBjaGFydERhdGEgPSB7XG4gICAgbGFiZWxzLFxuICAgIGRhdGFzZXRzOiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnR8OpbmVybyBkZSBsYXMgY3LDrWFzJyxcbiAgICAgICAgZGF0YTogT2JqZWN0LnZhbHVlcyhmb3JtYXR0ZWREYXRhKSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXG4gICAgICAgICAgJ3JnYmEoNTksIDEzMCwgMjQ2LCAwLjcpJywgLy8gQXp1bCAtIE1hY2hvc1xuICAgICAgICAgICdyZ2JhKDIzNiwgNzIsIDE1MywgMC43KScsIC8vIFJvc2EgLSBIZW1icmFzXG4gICAgICAgICAgJ3JnYmEoMjQ5LCAxMTUsIDIyLCAwLjcpJywgLy8gTmFyYW5qYSAtIE90cm9zXG4gICAgICAgIF0sXG4gICAgICAgIGJvcmRlckNvbG9yOiBbXG4gICAgICAgICAgJ3JnYmEoNTksIDEzMCwgMjQ2LCAxKScsXG4gICAgICAgICAgJ3JnYmEoMjM2LCA3MiwgMTUzLCAxKScsXG4gICAgICAgICAgJ3JnYmEoMjQ5LCAxMTUsIDIyLCAxKScsXG4gICAgICAgIF0sXG4gICAgICAgIGJvcmRlcldpZHRoOiAxLFxuICAgICAgfSxcbiAgICBdLFxuICB9O1xuICBcbiAgcmV0dXJuIDxQaWUgZGF0YT17Y2hhcnREYXRhfSAvPlxufTtcblxuLy8gUmVuZGVyaXphciBncsOhZmljbyBkZSBlc3RhZG9cbmV4cG9ydCBjb25zdCBTdGF0dXNDaGFydCA9ICh7IGRhdGEsIGRhcmtNb2RlIH06IHsgZGF0YTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiB8IHVuZGVmaW5lZCwgZGFya01vZGU6IGJvb2xlYW4gfSkgPT4ge1xuICBpZiAoIWRhdGEpIHJldHVybiBudWxsO1xuICBcbiAgLy8gU2kgZWwgb2JqZXRvIGVzdMOhIHZhY8OtbyBvIHRvZG9zIGxvcyB2YWxvcmVzIHNvbiAwLCBtb3N0cmFyIHVuIGdyw6FmaWNvIGNvbiB2YWxvcmVzIGRlIGVqZW1wbG9cbiAgY29uc3QgdG90YWxWYWx1ZSA9IE9iamVjdC52YWx1ZXMoZGF0YSkucmVkdWNlKChzdW0sIHZhbHVlKSA9PiBzdW0gKyB2YWx1ZSwgMCk7XG4gIGlmIChPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT09IDAgfHwgdG90YWxWYWx1ZSA9PT0gMCkge1xuICAgIGRhdGEgPSB7XG4gICAgICAnQWN0aXZvcyc6IDAsXG4gICAgICAnSW5hY3Rpdm9zJzogMFxuICAgIH07XG4gIH1cbiAgXG4gIC8vIE1hcGVhciBldGlxdWV0YXMgZXNwZWNpYWxlc1xuICBjb25zdCBsYWJlbHMgPSBPYmplY3Qua2V5cyhkYXRhKS5tYXAoa2V5ID0+IHtcbiAgICBpZiAoa2V5ID09PSAnT0snKSByZXR1cm4gJ0FjdGl2b3MnO1xuICAgIGlmIChrZXkgPT09ICdERUYnKSByZXR1cm4gJ0ZhbGxlY2lkb3MnO1xuICAgIHJldHVybiBrZXk7XG4gIH0pO1xuICBcbiAgY29uc3QgY2hhcnREYXRhID0ge1xuICAgIGxhYmVscyxcbiAgICBkYXRhc2V0czogW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0VzdGFkbycsXG4gICAgICAgIGRhdGE6IE9iamVjdC52YWx1ZXMoZGF0YSksXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogW1xuICAgICAgICAgICdyZ2JhKDE2LCAxODUsIDEyOSwgMC43KScsIC8vIFZlcmRlXG4gICAgICAgICAgJ3JnYmEoMjM5LCA2OCwgNjgsIDAuNyknLCAvLyBSb2pvXG4gICAgICAgIF0sXG4gICAgICAgIGJvcmRlckNvbG9yOiBbXG4gICAgICAgICAgJ3JnYmEoMTYsIDE4NSwgMTI5LCAxKScsXG4gICAgICAgICAgJ3JnYmEoMjM5LCA2OCwgNjgsIDEpJyxcbiAgICAgICAgXSxcbiAgICAgICAgYm9yZGVyV2lkdGg6IDEsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG4gIFxuICByZXR1cm4gPFBpZSBkYXRhPXtjaGFydERhdGF9IC8+XG59O1xuXG4vLyBSZW5kZXJpemFyIGdyw6FmaWNvIGRlIHF1YWRyYVxuZXhwb3J0IGNvbnN0IFF1YWRyYUNoYXJ0ID0gKHsgZGF0YSwgZGFya01vZGUgfTogeyBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+IHwgdW5kZWZpbmVkLCBkYXJrTW9kZTogYm9vbGVhbiB9KSA9PiB7XG4gIGlmICghZGF0YSkgcmV0dXJuIG51bGw7XG4gIFxuICAvLyBTaSBubyBoYXkgZGF0b3MgdsOhbGlkb3MsIG1vc3RyYXIgZ3LDoWZpY28gY29uIHZhbG9yZXMgZWplbXBsb1xuICBjb25zdCB0b3RhbFZhbHVlID0gT2JqZWN0LnZhbHVlcyhkYXRhKS5yZWR1Y2UoKHN1bSwgdmFsdWUpID0+IHN1bSArIHZhbHVlLCAwKTtcbiAgaWYgKE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PT0gMCB8fCB0b3RhbFZhbHVlID09PSAwKSB7XG4gICAgZGF0YSA9IHtcbiAgICAgICdDdWFkcmEgQSc6IDAsXG4gICAgICAnQ3VhZHJhIEInOiAwLFxuICAgICAgJ0N1YWRyYSBDJzogMFxuICAgIH07XG4gIH1cbiAgXG4gIC8vIE9yZGVuYXIgZGF0b3MgcG9yIHZhbG9yIChtYXlvciBhIG1lbm9yKVxuICBjb25zdCBzb3J0ZWRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZGF0YSlcbiAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pXG4gICAgLnNsaWNlKDAsIDEwKTsgLy8gTGltaXRhciBhIDEwIGVsZW1lbnRvcyBwYXJhIG1lam9yIHZpc3VhbGl6YWNpw7NuXG4gICAgXG4gIGNvbnN0IGNoYXJ0RGF0YSA9IHtcbiAgICBsYWJlbHM6IHNvcnRlZEVudHJpZXMubWFwKChba2V5XSkgPT4ga2V5KSxcbiAgICBkYXRhc2V0czogW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0Rpc3RyaWJ1Y2nDs24gcG9yIE9yaWdlbicsXG4gICAgICAgIGRhdGE6IHNvcnRlZEVudHJpZXMubWFwKChbXywgdmFsdWVdKSA9PiB2YWx1ZSksXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoNTksIDEzMCwgMjQ2LCAwLjUpJyxcbiAgICAgICAgYm9yZGVyQ29sb3I6ICdyZ2JhKDU5LCAxMzAsIDI0NiwgMSknLFxuICAgICAgICBib3JkZXJXaWR0aDogMSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfTtcbiAgXG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgc2NhbGVzOiB7XG4gICAgICB5OiB7XG4gICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9O1xuICBcbiAgcmV0dXJuIDxCYXIgZGF0YT17Y2hhcnREYXRhfSBvcHRpb25zPXtvcHRpb25zfSAvPlxufTtcblxuLy8gUmVuZGVyaXphciBncsOhZmljbyBkZSBkaXN0cmlidWNpw7NuIHBvciBtZXNcbmV4cG9ydCBjb25zdCBNb250aGx5Q2hhcnQgPSAoeyBkYXRhLCBkYXJrTW9kZSB9OiB7IGRhdGE6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gfCB1bmRlZmluZWQsIGRhcmtNb2RlOiBib29sZWFuIH0pID0+IHtcbiAgaWYgKCFkYXRhKSByZXR1cm4gbnVsbDtcbiAgXG4gIC8vIEFzZWd1cmFtb3MgcXVlIHRlbmdhbW9zIHVuIG9iamV0byBjb24gdG9kb3MgbG9zIG1lc2VzIGluaWNpYWxpemFkb3MgYSAwXG4gIGNvbnN0IGNvbXBsZXRlTW9udGhzRGF0YTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHtcbiAgICAnRW5lJzogMCwgJ0ZlYic6IDAsICdNYXInOiAwLCAnQWJyJzogMCwgJ01heSc6IDAsICdKdW4nOiAwLFxuICAgICdKdWwnOiAwLCAnQWdvJzogMCwgJ1NlcCc6IDAsICdPY3QnOiAwLCAnTm92JzogMCwgJ0RpYyc6IDBcbiAgfTtcbiAgXG4gIC8vIENvbnZlcnRpbW9zIGxhcyBjbGF2ZXMgY29tbyAnMjAyMy0wMScgbyAnMjAyMy0xJyBhICdFbmUnLCAnMjAyMy0wMicgYSAnRmViJywgZXRjLlxuICBjb25zdCBtb250aHNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgJzAxJzogJ0VuZScsICcxJzogJ0VuZScsXG4gICAgJzAyJzogJ0ZlYicsICcyJzogJ0ZlYicsXG4gICAgJzAzJzogJ01hcicsICczJzogJ01hcicsXG4gICAgJzA0JzogJ0FicicsICc0JzogJ0FicicsXG4gICAgJzA1JzogJ01heScsICc1JzogJ01heScsXG4gICAgJzA2JzogJ0p1bicsICc2JzogJ0p1bicsXG4gICAgJzA3JzogJ0p1bCcsICc3JzogJ0p1bCcsXG4gICAgJzA4JzogJ0FnbycsICc4JzogJ0FnbycsXG4gICAgJzA5JzogJ1NlcCcsICc5JzogJ1NlcCcsXG4gICAgJzEwJzogJ09jdCcsXG4gICAgJzExJzogJ05vdicsXG4gICAgJzEyJzogJ0RpYydcbiAgfTtcbiAgXG4gIC8vIFByb2Nlc2FyIGRhdG9zIHBhcmEgYWdydXBhciBwb3IgbWVzIHNpbiBpbXBvcnRhciBlbCBhw7FvXG4gIGlmIChkYXRhICYmIE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA+IDApIHtcbiAgICBPYmplY3QuZW50cmllcyhkYXRhKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIC8vIFNpIGxhIGNsYXZlIHRpZW5lIGVsIGZvcm1hdG8gJ1lZWVktTU0nIG8gc2ltaWxhciwgZXh0cmFlIGVsIG1lc1xuICAgICAgY29uc3QgbW9udGhNYXRjaCA9IGtleS5tYXRjaCgvLShcXGR7MSwyfSkkLykgfHwga2V5Lm1hdGNoKC8tKFxcZHsxLDJ9KS0vKSB8fCBrZXkubWF0Y2goL14oXFxkezEsMn0pJC8pO1xuICAgICAgaWYgKG1vbnRoTWF0Y2ggJiYgbW9udGhNYXRjaFsxXSkge1xuICAgICAgICBjb25zdCBtb250aEtleSA9IG1vbnRoc01hcFttb250aE1hdGNoWzFdXSB8fCBrZXk7XG4gICAgICAgIGlmIChtb250aEtleSBpbiBjb21wbGV0ZU1vbnRoc0RhdGEpIHtcbiAgICAgICAgICBjb21wbGV0ZU1vbnRoc0RhdGFbbW9udGhLZXldICs9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGtleSBpbiBjb21wbGV0ZU1vbnRoc0RhdGEpIHtcbiAgICAgICAgLy8gU2kgeWEgZXN0w6EgZW4gZWwgZm9ybWF0byBjb3JyZWN0byAoRW5lLCBGZWIsIGV0Yy4pXG4gICAgICAgIGNvbXBsZXRlTW9udGhzRGF0YVtrZXldICs9IHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIFxuICAvLyBPcmRlbmFyIG1lc2VzIGNvcnJlY3RhbWVudGUgKEVuZSwgRmViLCBNYXIsIC4uLilcbiAgY29uc3QgbW9udGhPcmRlciA9IFsnRW5lJywgJ0ZlYicsICdNYXInLCAnQWJyJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0FnbycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEaWMnXTtcbiAgXG4gIGNvbnN0IGNoYXJ0RGF0YSA9IHtcbiAgICBsYWJlbHM6IG1vbnRoT3JkZXIsXG4gICAgZGF0YXNldHM6IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdQYXJ0b3MgcG9yIG1lcycsXG4gICAgICAgIGRhdGE6IG1vbnRoT3JkZXIubWFwKG1vbnRoID0+IGNvbXBsZXRlTW9udGhzRGF0YVttb250aF0pLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDU5LCAxMzAsIDI0NiwgMC43KScsXG4gICAgICAgIGJvcmRlckNvbG9yOiAncmdiYSg1OSwgMTMwLCAyNDYsIDEpJyxcbiAgICAgICAgYm9yZGVyV2lkdGg6IDEsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG4gIFxuICBjb25zdCBvcHRpb25zID0ge1xuICAgIHNjYWxlczoge1xuICAgICAgeToge1xuICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAvLyBGdWVyemEgYSBxdWUgbG9zIHZhbG9yZXMgZW4gZWwgZWplIFkgc2VhbiBlbnRlcm9zXG4gICAgICAgICAgc3RlcFNpemU6IDEsXG4gICAgICAgICAgcHJlY2lzaW9uOiAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IHtcbiAgICAgIGxlZ2VuZDoge1xuICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICBwb3NpdGlvbjogJ3RvcCcgYXMgY29uc3RcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIFxuICByZXR1cm4gPEJhciBkYXRhPXtjaGFydERhdGF9IG9wdGlvbnM9e29wdGlvbnN9IC8+XG59O1xuXG4vLyBSZW5kZXJpemFyIGdyw6FmaWNvIGRlIHRlbmRlbmNpYVxuZXhwb3J0IGNvbnN0IFRyZW5kQ2hhcnQgPSAoeyBkYXRhLCBkYXJrTW9kZSB9OiB7IGRhdGE6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gfCB1bmRlZmluZWQsIGRhcmtNb2RlOiBib29sZWFuIH0pID0+IHtcbiAgaWYgKCFkYXRhKSByZXR1cm4gbnVsbDtcbiAgXG4gIC8vIEZpbHRyYXIgcGFyYSBtb3N0cmFyIHNvbG8gbG9zIGHDsW9zIGNvbiBwYXJ0b3MgeSBvcmRlbmFybG9zXG4gIGNvbnN0IHNvcnRlZEtleXMgPSBPYmplY3Qua2V5cyhkYXRhKVxuICAgIC5maWx0ZXIoeWVhciA9PiBkYXRhW3llYXJdID4gMCkgIC8vIFNvbG8gYcOxb3MgY29uIHBhcnRvc1xuICAgIC5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhKSAtIHBhcnNlSW50KGIpKTtcbiAgXG4gIGNvbnN0IGNoYXJ0RGF0YSA9IHtcbiAgICBsYWJlbHM6IHNvcnRlZEtleXMsXG4gICAgZGF0YXNldHM6IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdQYXJ0b3MgcG9yIGHDsW8nLFxuICAgICAgICBkYXRhOiBzb3J0ZWRLZXlzLm1hcCh5ZWFyID0+IGRhdGFbeWVhcl0pLFxuICAgICAgICBib3JkZXJDb2xvcjogJyMzYjgyZjYnLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDU5LCAxMzAsIDI0NiwgMC41KScsXG4gICAgICAgIHRlbnNpb246IDAuNCxcbiAgICAgIH0sXG4gICAgXSxcbiAgfTtcblxuICByZXR1cm4gPExpbmUgZGF0YT17Y2hhcnREYXRhfSBvcHRpb25zPXt7XG4gICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICBzY2FsZXM6IHtcbiAgICAgIHg6IHtcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgIHRleHQ6ICdBw7FvJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeToge1xuICAgICAgICB0aXRsZToge1xuICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgdGV4dDogJ07Dum1lcm8gZGUgcGFydG9zJ1xuICAgICAgICB9LFxuICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgdG9vbHRpcDoge1xuICAgICAgICBjYWxsYmFja3M6IHtcbiAgICAgICAgICB0aXRsZTogKGl0ZW1zKSA9PiBgQcOxbyAke2l0ZW1zWzBdLmxhYmVsfWAsXG4gICAgICAgICAgbGFiZWw6IChjb250ZXh0KSA9PiBgUGFydG9zOiAke2NvbnRleHQuZm9ybWF0dGVkVmFsdWV9YFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9fSAvPlxufTtcblxuLy8gQ29tcG9uZW50ZSBwYXJhIGdyw6FmaWNvIGRlIGRpc3RyaWJ1Y2nDs24gYW51YWwgZGV0YWxsYWRhXG5leHBvcnQgY29uc3QgRGlzdHJpYnVjaW9uQW51YWxDaGFydCA9ICh7IGRhcmtNb2RlLCBkYXRhIH06IHsgZGFya01vZGU6IGJvb2xlYW4sIGRhdGE/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+IH0pID0+IHtcbiAgLy8gRXN0YWRvIHBhcmEgZWwgaWRpb21hIGFjdHVhbFxuICBjb25zdCBbY3VycmVudExhbmcsIHNldEN1cnJlbnRMYW5nXSA9IHVzZVN0YXRlKCdlcycpO1xuICBcbiAgLy8gT2J0ZW5lciBlbCBpZGlvbWEgYWN0dWFsIGRlbCBsb2NhbFN0b3JhZ2VcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzdG9yZWRMYW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJMYW5ndWFnZScpIHx8ICdlcyc7XG4gICAgc2V0Q3VycmVudExhbmcoc3RvcmVkTGFuZyk7XG4gICAgXG4gICAgLy8gRXNjdWNoYXIgY2FtYmlvcyBkZSBpZGlvbWFcbiAgICBjb25zdCBoYW5kbGVMYW5ndWFnZUNoYW5nZSA9IChlOiBTdG9yYWdlRXZlbnQpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ3VzZXJMYW5ndWFnZScpIHtcbiAgICAgICAgc2V0Q3VycmVudExhbmcoZS5uZXdWYWx1ZSB8fCAnZXMnKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UpO1xuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGhhbmRsZUxhbmd1YWdlQ2hhbmdlKTtcbiAgfSwgW10pO1xuICBcbiAgLy8gVXNhciBkYXRvcyBkZSBsYSBBUEkgbyB2YWxvcmVzIHBvciBkZWZlY3RvIHNpIG5vIGhheSBkYXRvc1xuICBjb25zdCBkYXRvc1JlYWxlcyA9IGRhdGEgfHwge307XG4gIFxuICAvLyBWZXJpZmljYXIgc2kgdGVuZW1vcyBkYXRvc1xuICBjb25zdCB0aWVuZVZhbG9yZXMgPSBPYmplY3QudmFsdWVzKGRhdG9zUmVhbGVzKS5zb21lKHZhbG9yID0+IHZhbG9yID4gMCk7XG4gIFxuICAvLyBTaSBubyBoYXkgZGF0b3MsIG1vc3RyYXIgbWVuc2FqZVxuICBpZiAoIXRpZW5lVmFsb3Jlcykge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHN0eWxlPXt7IFxuICAgICAgICBoZWlnaHQ6ICcxMDAlJywgXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLCBcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICBjb2xvcjogZGFya01vZGUgPyAnI2QxZDVkYicgOiAnIzZiNzI4MCdcbiAgICAgIH19PlxuICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyBcIk5vIGhpIGhhIGRhZGVzIGRpc3BvbmlibGVzXCIgOiBcIk5vIGhheSBkYXRvcyBkaXNwb25pYmxlc1wifVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuICBcbiAgLy8gVmVyaWZpY2FyIHNpIHRlbmVtb3MgZGF0b3MgdsOhbGlkb3NcbiAgaWYgKCFkYXRhIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0Jykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ05vIHNlIHJlY2liaWVyb24gZGF0b3MgdsOhbGlkb3MgcGFyYSBlbCBncsOhZmljbyBhbnVhbCcpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHN0eWxlPXt7IFxuICAgICAgICBoZWlnaHQ6ICcxMDAlJywgXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLCBcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICBjb2xvcjogZGFya01vZGUgPyAnI2QxZDVkYicgOiAnIzZiNzI4MCdcbiAgICAgIH19PlxuICAgICAgICB7Y3VycmVudExhbmcgPT09ICdjYScgPyBcIk5vIGhpIGhhIGRhZGVzIGRpc3BvbmlibGVzXCIgOiBcIk5vIGhheSBkYXRvcyBkaXNwb25pYmxlc1wifVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuICBcbiAgLy8gRmlsdHJhciB5IG9yZGVuYXIgbG9zIGHDsW9zIHF1ZSB0aWVuZW4gcGFydG9zICh2YWxvciA+IDApXG4gIGNvbnN0IHllYXJzID0gT2JqZWN0LmtleXMoZGF0YSlcbiAgICAuZmlsdGVyKHllYXIgPT4gdHlwZW9mIGRhdGFbeWVhcl0gPT09ICdudW1iZXInICYmIGRhdGFbeWVhcl0gPiAwKVxuICAgIC5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhKSAtIHBhcnNlSW50KGIpKTtcbiAgXG4gIC8vIElNUE9SVEFOVEU6IFNPTE8gdXNhciBkYXRvcyBkaW7DoW1pY29zIGRlbCBiYWNrZW5kXG4gIGNvbnN0IGNoYXJ0RGF0YSA9IHtcbiAgICBsYWJlbHM6IHllYXJzLFxuICAgIGRhdGFzZXRzOiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdQYXJ0cyBwZXIgYW55JyA6ICdQYXJ0b3MgcG9yIGHDsW8nLFxuICAgICAgICBkYXRhOiB5ZWFycy5tYXAoeWVhciA9PiB7XG4gICAgICAgICAgLy8gVmVyaWZpY2FyIHF1ZSBkYXRhIGV4aXN0YSB5IHRlbmdhIGxhIHByb3BpZWRhZCBkZWwgYcOxb1xuICAgICAgICAgIHJldHVybiBkYXRhICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JyAmJiB5ZWFyIGluIGRhdGEgPyBkYXRhW3llYXJdIDogMDtcbiAgICAgICAgfSksXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMxMGI5ODEnLCAvLyBWZXJkZSBlc21lcmFsZGFcbiAgICAgICAgYm9yZGVyQ29sb3I6ICcjMDU5NjY5JyxcbiAgICAgICAgYm9yZGVyV2lkdGg6IDEsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG5cbiAgcmV0dXJuIDxCYXIgZGF0YT17Y2hhcnREYXRhfSBvcHRpb25zPXt7XG4gICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICBzY2FsZXM6IHtcbiAgICAgIHg6IHtcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgIHRleHQ6ICdBw7FvJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeToge1xuICAgICAgICB0aXRsZToge1xuICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgdGV4dDogJ07Dum1lcm8gZGUgcGFydG9zJ1xuICAgICAgICB9LFxuICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgbGVnZW5kOiB7XG4gICAgICAgIGRpc3BsYXk6IGZhbHNlXG4gICAgICB9LFxuICAgICAgdG9vbHRpcDoge1xuICAgICAgICBjYWxsYmFja3M6IHtcbiAgICAgICAgICB0aXRsZTogKGl0ZW1zKSA9PiBgQcOxbyAke2l0ZW1zWzBdLmxhYmVsfWAsXG4gICAgICAgICAgbGFiZWw6IChjb250ZXh0KSA9PiBgUGFydG9zOiAke2NvbnRleHQuZm9ybWF0dGVkVmFsdWV9YFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9fSAvPlxufTtcblxuLy8gQ29tcG9uZW50ZSBwYXJhIGdyw6FmaWNvIGRlIGRpc3RyaWJ1Y2nDs24gbWVuc3VhbFxuZXhwb3J0IGNvbnN0IERpc3RyaWJ1Y2lvbk1lbnN1YWxDaGFydCA9ICh7IGRhcmtNb2RlLCBkYXRhIH06IHsgZGFya01vZGU6IGJvb2xlYW4sIGRhdGE/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+IH0pID0+IHtcbiAgXG4gIC8vIEVzdGFkbyBwYXJhIGVsIGlkaW9tYSBhY3R1YWxcbiAgY29uc3QgW2N1cnJlbnRMYW5nLCBzZXRDdXJyZW50TGFuZ10gPSB1c2VTdGF0ZSgnZXMnKTtcbiAgXG4gIC8vIE9idGVuZXIgZWwgaWRpb21hIGFjdHVhbCBkZWwgbG9jYWxTdG9yYWdlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3RvcmVkTGFuZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyTGFuZ3VhZ2UnKSB8fCAnZXMnO1xuICAgIHNldEN1cnJlbnRMYW5nKHN0b3JlZExhbmcpO1xuICAgIFxuICAgIC8vIEVzY3VjaGFyIGNhbWJpb3MgZGUgaWRpb21hXG4gICAgY29uc3QgaGFuZGxlTGFuZ3VhZ2VDaGFuZ2UgPSAoZTogU3RvcmFnZUV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICd1c2VyTGFuZ3VhZ2UnKSB7XG4gICAgICAgIHNldEN1cnJlbnRMYW5nKGUubmV3VmFsdWUgfHwgJ2VzJyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGhhbmRsZUxhbmd1YWdlQ2hhbmdlKTtcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBoYW5kbGVMYW5ndWFnZUNoYW5nZSk7XG4gIH0sIFtdKTtcbiAgXG4gIC8vIE5vbWJyZXMgZGUgbG9zIG1lc2VzIGVuIG9yZGVuXG4gIGNvbnN0IG1lc2VzID0gW1xuICAgICdFbmVybycsICdGZWJyZXJvJywgJ01hcnpvJywgJ0FicmlsJywgJ01heW8nLCAnSnVuaW8nLFxuICAgICdKdWxpbycsICdBZ29zdG8nLCAnU2VwdGllbWJyZScsICdPY3R1YnJlJywgJ05vdmllbWJyZScsICdEaWNpZW1icmUnXG4gIF07XG4gIFxuICAvLyBOb21icmVzIGRlIGxvcyBtZXNlcyBlbiBjYXRhbMOhblxuICBjb25zdCBtZXNlc0NhdCA9IFtcbiAgICAnR2VuZXInLCAnRmVicmVyJywgJ01hcsOnJywgJ0FicmlsJywgJ01haWcnLCAnSnVueScsXG4gICAgJ0p1bGlvbCcsICdBZ29zdCcsICdTZXRlbWJyZScsICdPY3R1YnJlJywgJ05vdmVtYnJlJywgJ0Rlc2VtYnJlJ1xuICBdO1xuICBcbiAgLy8gRGV0ZXJtaW5hciBxdcOpIG5vbWJyZXMgZGUgbWVzZXMgdXNhciBzZWfDum4gZWwgaWRpb21hXG4gIGNvbnN0IG5vbWJyZXNNZXNlcyA9IGN1cnJlbnRMYW5nID09PSAnY2EnID8gbWVzZXNDYXQgOiBtZXNlcztcbiAgXG4gIC8vIFByb2Nlc2FyIGxvcyBkYXRvcyBxdWUgdmllbmVuIGRlbCBBUElcbiAgLy8gRGVmaW5pciBlbCB0aXBvIHBhcmEgbGEgZGlzdHJpYnVjacOzbiBwb3IgbWVzXG4gIHR5cGUgRGlzdHJpYnVjaW9uTWVuc3VhbCA9IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIFxuICAvLyBJbmljaWFsaXphciBjb24gdmFsb3JlcyBwb3IgZGVmZWN0byBwYXJhIHRvZG9zIGxvcyBtZXNlc1xuICBjb25zdCBkaXN0cmlidWNpb25Qb3JNZXNJbmljaWFsOiBEaXN0cmlidWNpb25NZW5zdWFsID0ge1xuICAgIFwiRW5lcm9cIjogMCwgXCJGZWJyZXJvXCI6IDAsIFwiTWFyem9cIjogMCwgXCJBYnJpbFwiOiAwLCBcIk1heW9cIjogMCwgXCJKdW5pb1wiOiAwLFxuICAgIFwiSnVsaW9cIjogMCwgXCJBZ29zdG9cIjogMCwgXCJTZXB0aWVtYnJlXCI6IDAsIFwiT2N0dWJyZVwiOiAwLCBcIk5vdmllbWJyZVwiOiAwLCBcIkRpY2llbWJyZVwiOiAwXG4gIH07XG4gIFxuICAvLyBWYXJpYWJsZSBwYXJhIGFsbWFjZW5hciBsb3MgZGF0b3MgcHJvY2VzYWRvc1xuICBsZXQgZGlzdHJpYnVjaW9uUG9yTWVzOiBEaXN0cmlidWNpb25NZW5zdWFsID0gey4uLmRpc3RyaWJ1Y2lvblBvck1lc0luaWNpYWx9O1xuICBcbiAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gVmVyaWZpY2FyIHNpIGxvcyBkYXRvcyB2aWVuZW4gZW4gZWwgZm9ybWF0byBwb3JfbWVzXG4gICAgaWYgKCdwb3JfbWVzJyBpbiBkYXRhICYmIGRhdGEucG9yX21lcyAmJiB0eXBlb2YgZGF0YS5wb3JfbWVzID09PSAnb2JqZWN0Jykge1xuICAgICAgZGlzdHJpYnVjaW9uUG9yTWVzID0gZGF0YS5wb3JfbWVzIGFzIERpc3RyaWJ1Y2lvbk1lbnN1YWw7XG4gICAgfSBcbiAgICAvLyBWZXJpZmljYXIgc2kgbG9zIGRhdG9zIGNvbnRpZW5lbiBkaXJlY3RhbWVudGUgbG9zIG5vbWJyZXMgZGUgbWVzZXNcbiAgICBlbHNlIGlmICgnRW5lcm8nIGluIGRhdGEgfHwgJ2VuZXJvJyBpbiBkYXRhKSB7XG4gICAgICBkaXN0cmlidWNpb25Qb3JNZXMgPSBkYXRhIGFzIERpc3RyaWJ1Y2lvbk1lbnN1YWw7XG4gICAgfSBcbiAgICAvLyBQcm9jZXNhciBkYXRvcyBlbiBmb3JtYXRvIGHDsW8tbWVzXG4gICAgZWxzZSB7XG4gICAgICAvLyBQcm9jZXNhciBjYWRhIGNsYXZlIGRlbCBvYmpldG8gZGF0YSBidXNjYW5kbyBwYXRyb25lcyBkZSBhw7FvLW1lc1xuICAgICAgT2JqZWN0LmVudHJpZXMoZGF0YSkuZm9yRWFjaCgoW2NsYXZlLCB2YWxvcl0pID0+IHtcbiAgICAgICAgLy8gVmVyaWZpY2FyIHNpIGxhIGNsYXZlIHRpZW5lIGVsIGZvcm1hdG8gXCJZWVlZLU1NXCJcbiAgICAgICAgaWYgKGNsYXZlLm1hdGNoKC9eXFxkezR9LVxcZHsyfSQvKSkge1xuICAgICAgICAgIGNvbnN0IG1lcyA9IHBhcnNlSW50KGNsYXZlLnNwbGl0KCctJylbMV0pO1xuICAgICAgICAgIGlmIChtZXMgPj0gMSAmJiBtZXMgPD0gMTIpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vbWJyZU1lcyA9IG1lc2VzW21lcyAtIDFdOyAvLyAtMSBwb3JxdWUgbG9zIG1lc2VzIHZhbiBkZSAwLTExIGVuIEpTXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbG9yID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICBkaXN0cmlidWNpb25Qb3JNZXNbbm9tYnJlTWVzXSArPSB2YWxvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gRXh0cmFlciB2YWxvcmVzIGRlIGNhZGEgbWVzIGVuIG9yZGVuIHBhcmEgdXNhciBlbiBlbCBncsOhZmljb1xuICBjb25zdCB2YWxvcmVzTWVzZXMgPSBtZXNlcy5tYXAobWVzID0+IHtcbiAgICAvLyBDYWRhIG1lcyB5YSBlc3TDoSBpbmljaWFsaXphZG8gY29uIHN1IHZhbG9yIHBvciBkZWZlY3RvICgwKVxuICAgIC8vIERldm9sdmVtb3MgZGlyZWN0YW1lbnRlIGVsIHZhbG9yIGRlbCBtZXMgZGUgZGlzdHJpYnVjaW9uUG9yTWVzXG4gICAgcmV0dXJuIGRpc3RyaWJ1Y2lvblBvck1lc1ttZXNdIHx8IDA7XG4gIH0pO1xuICBcbiAgY29uc3QgY2hhcnREYXRhID0ge1xuICAgIGxhYmVsczogbm9tYnJlc01lc2VzLFxuICAgIGRhdGFzZXRzOiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBjdXJyZW50TGFuZyA9PT0gJ2NhJyA/ICdQYXJ0cyBwZXIgbWVzJyA6ICdQYXJ0b3MgcG9yIG1lcycsXG4gICAgICAgIGRhdGE6IHZhbG9yZXNNZXNlcyxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsIC8vIEF6dWxcbiAgICAgICAgYm9yZGVyQ29sb3I6ICcjMjU2M2ViJyxcbiAgICAgICAgYm9yZGVyV2lkdGg6IDEsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG5cbiAgcmV0dXJuIDxCYXIgZGF0YT17Y2hhcnREYXRhfSBvcHRpb25zPXt7XG4gICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICBzY2FsZXM6IHtcbiAgICAgIHg6IHtcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgIHRleHQ6ICdNZXMnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB5OiB7XG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICB0ZXh0OiAnTsO6bWVybyBkZSBwYXJ0b3MnXG4gICAgICAgIH0sXG4gICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICBwbHVnaW5zOiB7XG4gICAgICBsZWdlbmQ6IHtcbiAgICAgICAgZGlzcGxheTogZmFsc2VcbiAgICAgIH0sXG4gICAgICB0b29sdGlwOiB7XG4gICAgICAgIGNhbGxiYWNrczoge1xuICAgICAgICAgIHRpdGxlOiAoaXRlbXMpID0+IGl0ZW1zWzBdLmxhYmVsLFxuICAgICAgICAgIGxhYmVsOiAoY29udGV4dCkgPT4gYFBhcnRvczogJHtjb250ZXh0LmZvcm1hdHRlZFZhbHVlfWBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfX0gLz5cbn07XG4iXSwibWFwcGluZ3MiOiJB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