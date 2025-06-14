import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"];
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
  return /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-4", id, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxDEV("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: labelText }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
        lineNumber: 112,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "text",
            name: "search",
            value: filters.search || "",
            onChange: handleInputChange,
            onKeyDown: handleKeyDown,
            placeholder: placeholderText,
            className: "w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
            lineNumber: 116,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxDEV("span", { className: "text-gray-500 dark:text-gray-400", children: "🔍" }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
          lineNumber: 126,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
          lineNumber: 125,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
        lineNumber: 115,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
      lineNumber: 111,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end space-x-2 mt-2", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: handleClearFilters,
          className: "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          children: clearButtonText
        },
        void 0,
        false,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
          lineNumber: 133,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: handleApplyFilters,
          className: "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          children: searchButtonText
        },
        void 0,
        false,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
          lineNumber: 140,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
      lineNumber: 132,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/animals/AnimalFilters.tsx",
    lineNumber: 109,
    columnNumber: 5
  }, this);
};
export default AnimalFilters;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hbEZpbHRlcnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHR5cGUgeyBBbmltYWxGaWx0ZXJzIGFzIEFuaW1hbEZpbHRlcnNUeXBlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvYW5pbWFsU2VydmljZSc7XG5cbi8vIE9iamV0byBxdWUgYWxtYWNlbmFyw6EgbGFzIHRyYWR1Y2Npb25lcyB1bmEgdmV6IGVzdMOpIGVuIGVsIGNsaWVudGVcbmxldCBsYWJlbFRleHQgPSAnQnVzY2FyJztcbmxldCBwbGFjZWhvbGRlclRleHQgPSAnQnVzY2FyIHBvciBub21icmUsIGV4cGxvdGFjacOzbiwgY8OzZGlnby4uLic7XG5sZXQgY2xlYXJCdXR0b25UZXh0ID0gJ0xpbXBpYXInO1xubGV0IHNlYXJjaEJ1dHRvblRleHQgPSAnQlVTQ0FSJztcblxuLy8gRnVuY2nDs24gcGFyYSBhY3R1YWxpemFyIHRleHRvcyAoc2UgbGxhbWFyw6EgZW4gdXNlRWZmZWN0KVxuZnVuY3Rpb24gdXBkYXRlVGV4dHMobGFuZzogc3RyaW5nKSB7XG4gIGlmIChsYW5nID09PSAnY2EnKSB7XG4gICAgbGFiZWxUZXh0ID0gJ0NlcmNhcic7XG4gICAgcGxhY2Vob2xkZXJUZXh0ID0gJ0NlcmNhciBwZXIgbm9tLCBleHBsb3RhY2nDsywgY29kaS4uLic7XG4gICAgY2xlYXJCdXR0b25UZXh0ID0gJ05ldGVqYXInO1xuICAgIHNlYXJjaEJ1dHRvblRleHQgPSAnQ0VSQ0FSJztcbiAgfSBlbHNlIHtcbiAgICBsYWJlbFRleHQgPSAnQnVzY2FyJztcbiAgICBwbGFjZWhvbGRlclRleHQgPSAnQnVzY2FyIHBvciBub21icmUsIGV4cGxvdGFjacOzbiwgY8OzZGlnby4uLic7XG4gICAgY2xlYXJCdXR0b25UZXh0ID0gJ0xpbXBpYXInO1xuICAgIHNlYXJjaEJ1dHRvblRleHQgPSAnQlVTQ0FSJztcbiAgfVxufVxuXG5pbnRlcmZhY2UgQW5pbWFsRmlsdGVyc1Byb3BzIHtcbiAgb25BcHBseUZpbHRlcnM/OiAoZmlsdGVyczogQW5pbWFsRmlsdGVyc1R5cGUpID0+IHZvaWQ7XG4gIGluaXRpYWxGaWx0ZXJzPzogQW5pbWFsRmlsdGVyc1R5cGU7XG4gIGlkPzogc3RyaW5nO1xufVxuXG5jb25zdCBBbmltYWxGaWx0ZXJzOiBSZWFjdC5GQzxBbmltYWxGaWx0ZXJzUHJvcHM+ID0gKHsgXG4gIG9uQXBwbHlGaWx0ZXJzLCBcbiAgaW5pdGlhbEZpbHRlcnMgPSB7fSxcbiAgaWRcbn0pID0+IHtcbiAgY29uc3QgW2ZpbHRlcnMsIHNldEZpbHRlcnNdID0gdXNlU3RhdGU8QW5pbWFsRmlsdGVyc1R5cGU+KGluaXRpYWxGaWx0ZXJzKTtcbiAgXG4gIC8vIEdlc3Rpw7NuIGRlbCBpZGlvbWEgLSBzaW1wbGlmaWNhZG8gcGFyYSBldml0YXIgcHJvYmxlbWFzIGRlIGhpZHJhdGFjacOzblxuICBjb25zdCBbaXNDbGllbnQsIHNldElzQ2xpZW50XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gRXN0byBzb2xvIHNlIGVqZWN1dGEgZW4gZWwgY2xpZW50ZVxuICAgIHNldElzQ2xpZW50KHRydWUpO1xuICAgIGNvbnN0IHVzZXJMYW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJMYW5ndWFnZScpIHx8ICdlcyc7XG4gICAgLy8gQWN0dWFsaXphciBsb3MgdGV4dG9zIGJhc2Fkb3MgZW4gZWwgaWRpb21hXG4gICAgdXBkYXRlVGV4dHModXNlckxhbmcpO1xuICAgIFxuICAgIC8vIEVzY3VjaGFyIGNhbWJpb3MgZGUgaWRpb21hXG4gICAgY29uc3QgY2hlY2tMYW5ndWFnZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRMYW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJMYW5ndWFnZScpIHx8ICdlcyc7XG4gICAgICB1cGRhdGVUZXh0cyhjdXJyZW50TGFuZyk7XG4gICAgICAvLyBGb3J6YXIgdW5hIGFjdHVhbGl6YWNpw7NuXG4gICAgICBzZXRJc0NsaWVudChwcmV2U3RhdGUgPT4gIXByZXZTdGF0ZSk7XG4gICAgfTtcbiAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGNoZWNrTGFuZ3VhZ2UpO1xuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGNoZWNrTGFuZ3VhZ2UpO1xuICB9LCBbXSk7XG5cblxuICBjb25zdCBoYW5kbGVJbnB1dENoYW5nZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUgfSA9IGUudGFyZ2V0O1xuICAgIFxuICAgIC8vIEFjdHVhbGl6YXIgbG9zIGZpbHRyb3MgY29uIGVsIHZhbG9yIGRlIGLDunNxdWVkYVxuICAgIHNldEZpbHRlcnMocHJldiA9PiAoe1xuICAgICAgLi4ucHJldixcbiAgICAgIFtuYW1lXTogdmFsdWUgPT09ICcnID8gdW5kZWZpbmVkIDogdmFsdWVcbiAgICB9KSk7XG4gIH07XG4gIFxuICAvLyBNYW5lamFyIGxhIHB1bHNhY2nDs24gZGUgRW50ZXIgZW4gZWwgY2FtcG8gZGUgYsO6c3F1ZWRhXG4gIGNvbnN0IGhhbmRsZUtleURvd24gPSAoZTogUmVhY3QuS2V5Ym9hcmRFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgaGFuZGxlQXBwbHlGaWx0ZXJzKCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUFwcGx5RmlsdGVycyA9ICgpID0+IHtcbiAgICAvLyBTaSBoYXkgdW5hIGZ1bmNpw7NuIG9uQXBwbHlGaWx0ZXJzIHByb3BvcmNpb25hZGEsIGxsYW1hcmxhXG4gICAgaWYgKG9uQXBwbHlGaWx0ZXJzKSB7XG4gICAgICBvbkFwcGx5RmlsdGVycyhmaWx0ZXJzKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRW1pdGlyIHVuIGV2ZW50byBwZXJzb25hbGl6YWRvIHBhcmEgcXVlIG90cm9zIGNvbXBvbmVudGVzIHB1ZWRhbiBlc2N1Y2hhcmxvXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2ZpbHRlcnMtYXBwbGllZCcsIHtcbiAgICAgIGRldGFpbDogZmlsdGVyc1xuICAgIH0pKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVDbGVhckZpbHRlcnMgPSAoKSA9PiB7XG4gICAgY29uc3QgZW1wdHlGaWx0ZXJzOiBBbmltYWxGaWx0ZXJzVHlwZSA9IHt9O1xuICAgIHNldEZpbHRlcnMoZW1wdHlGaWx0ZXJzKTtcbiAgICBcbiAgICAvLyBBcGxpY2FyIGxvcyBmaWx0cm9zIHZhY8Otb3NcbiAgICBpZiAob25BcHBseUZpbHRlcnMpIHtcbiAgICAgIG9uQXBwbHlGaWx0ZXJzKGVtcHR5RmlsdGVycyk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVtaXRpciBldmVudG8gY29uIGZpbHRyb3MgdmFjw61vc1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdmaWx0ZXJzLWFwcGxpZWQnLCB7XG4gICAgICBkZXRhaWw6IGVtcHR5RmlsdGVyc1xuICAgIH0pKTtcbiAgICBcbiAgICAvLyBSZWNhcmdhciBsYSBsaXN0YSBkZSBhbmltYWxlc1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZWxvYWQtYW5pbWFscycpKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBnYXAtNFwiIGlkPXtpZH0+XG4gICAgICB7LyogQsO6c3F1ZWRhIGNvbnNvbGlkYWRhICovfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYi0zXCI+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwIG1iLTFcIj5cbiAgICAgICAgICB7bGFiZWxUZXh0fVxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICBuYW1lPVwic2VhcmNoXCJcbiAgICAgICAgICAgIHZhbHVlPXtmaWx0ZXJzLnNlYXJjaCB8fCAnJ31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVJbnB1dENoYW5nZX1cbiAgICAgICAgICAgIG9uS2V5RG93bj17aGFuZGxlS2V5RG93bn1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtwbGFjZWhvbGRlclRleHR9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIHBsLTkgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIHNoYWRvdy1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy1wcmltYXJ5IGZvY3VzOmJvcmRlci1wcmltYXJ5IGRhcms6YmctZ3JheS03MDAgZGFyazp0ZXh0LXdoaXRlXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+8J+UjTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIEJvdG9uZXMgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1lbmQgc3BhY2UteC0yIG10LTJcIj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNsZWFyRmlsdGVyc31cbiAgICAgICAgICBjbGFzc05hbWU9XCJweC00IHB5LTIgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIHNoYWRvdy1zbSB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAgaG92ZXI6YmctZ3JheS01MCBkYXJrOmhvdmVyOmJnLWdyYXktNjAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMiBmb2N1czpyaW5nLXByaW1hcnlcIlxuICAgICAgICA+XG4gICAgICAgICAge2NsZWFyQnV0dG9uVGV4dH1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVBcHBseUZpbHRlcnN9XG4gICAgICAgICAgY2xhc3NOYW1lPVwicHgtNCBweS0yIGJvcmRlciBib3JkZXItdHJhbnNwYXJlbnQgcm91bmRlZC1tZCBzaGFkb3ctc20gdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LXdoaXRlIGJnLXByaW1hcnkgaG92ZXI6YmctcHJpbWFyeS84MCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTIgZm9jdXM6cmluZy1wcmltYXJ5XCJcbiAgICAgICAgPlxuICAgICAgICAgIHtzZWFyY2hCdXR0b25UZXh0fVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQW5pbWFsRmlsdGVycztcbiJdLCJtYXBwaW5ncyI6IkFBK0dRO0FBL0dSLE9BQU8sU0FBUyxVQUFV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