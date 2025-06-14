import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react;
import { t } from "/src/i18n/config.ts";
export const StatCard = ({ title, value, color, darkMode, translationKey }) => {
  const currentLang = localStorage.getItem("userLanguage") || "es";
  const displayTitle = translationKey ? t(translationKey, currentLang) : title;
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `${color}`,
      style: {
        width: "100%",
        padding: "0.75rem",
        borderRadius: "0.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginBottom: "0.5rem",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
      },
      children: [
        /* @__PURE__ */ jsxDEV("h3", { style: { color: "white", fontWeight: "bold", marginBottom: "0.25rem" }, children: displayTitle }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
          lineNumber: 35,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("p", { style: { color: "white", fontSize: "1.75rem", fontWeight: "bold", margin: 0 }, children: value }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
          lineNumber: 36,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
      lineNumber: 21,
      columnNumber: 5
    },
    this
  );
};
export const SectionTitle = ({ number, title, darkMode, translationKey }) => {
  const currentLang = localStorage.getItem("userLanguage") || "es";
  const displayTitle = translationKey ? t(translationKey, currentLang) : title;
  return /* @__PURE__ */ jsxDEV("div", { style: {
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5rem",
    marginTop: "1rem",
    padding: "0.5rem",
    // Verde lima corporativo más claro que el principal
    backgroundColor: darkMode ? "#7cb518" : "#a4cc44",
    // Verde lima en modo oscuro, verde lima claro en modo claro
    border: "none",
    borderRadius: "0.25rem"
    // Añadir bordes redondeados
  }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "1.5rem",
      height: "1.5rem",
      borderRadius: "9999px",
      backgroundColor: "#fff",
      // Fondo blanco
      color: "#88c425",
      // Color verde lima corporativo para el número
      fontWeight: "bold",
      marginRight: "0.5rem"
    }, children: number }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
      lineNumber: 65,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("h2", { style: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      color: "white"
      // Texto blanco para ambos modos
    }, children: displayTitle }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
      lineNumber: 79,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
    lineNumber: 54,
    columnNumber: 5
  }, this);
};
export const DashboardCard = ({ title, children, className = "", darkMode }) => {
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      style: {
        backgroundColor: darkMode ? "#111827" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#111827",
        borderRadius: "0.5rem",
        padding: "1rem",
        marginBottom: "1rem",
        border: darkMode ? "1px solid #374151" : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.1)"
      },
      className,
      children: [
        /* @__PURE__ */ jsxDEV(
          "h3",
          {
            style: {
              fontSize: "1.125rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: darkMode ? "#f9fafb" : "#111827"
            },
            children: title
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
            lineNumber: 108,
            columnNumber: 7
          },
          this
        ),
        children
      ]
    },
    void 0,
    true,
    {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
      lineNumber: 96,
      columnNumber: 5
    },
    this
  );
};
export const CardLabel = ({ children, darkMode }) => {
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      style: {
        color: darkMode ? "#d1d5db" : "#4b5563",
        fontSize: "0.875rem",
        fontWeight: "500",
        marginBottom: "0.25rem"
      },
      children
    },
    void 0,
    false,
    {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
      lineNumber: 129,
      columnNumber: 5
    },
    this
  );
};
export const CardDivider = ({ children, darkMode }) => {
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      style: {
        borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
        paddingBottom: "0.5rem",
        marginBottom: "0.5rem"
      },
      children
    },
    void 0,
    false,
    {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/dashboard/components/UIComponents.tsx",
      lineNumber: 148,
      columnNumber: 5
    },
    this
  );
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVJQ29tcG9uZW50cy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHQgfSBmcm9tICcuLi8uLi8uLi9pMThuL2NvbmZpZyc7XG5cbi8vIENvbXBvbmVudGVzIFVJIGV4dHJhw61kb3MgZGlyZWN0YW1lbnRlIGRlbCBEYXNoYm9hcmQgb3JpZ2luYWxcbi8vIElNUE9SVEFOVEU6IE1hbnRpZW5lbiBFWEFDVEFNRU5URSBsYSBtaXNtYSBhcGFyaWVuY2lhIHZpc3VhbFxuXG4vLyBSZW5kZXJpemFyIHRhcmpldGEgZGUgZXN0YWTDrXN0aWNhc1xuZXhwb3J0IGNvbnN0IFN0YXRDYXJkID0gKHsgdGl0bGUsIHZhbHVlLCBjb2xvciwgZGFya01vZGUsIHRyYW5zbGF0aW9uS2V5IH06IHsgXG4gIHRpdGxlOiBzdHJpbmcsIFxuICB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nLCBcbiAgY29sb3I6IHN0cmluZyxcbiAgZGFya01vZGU6IGJvb2xlYW4sXG4gIHRyYW5zbGF0aW9uS2V5Pzogc3RyaW5nIC8vIE51ZXZhIHByb3BpZWRhZCBvcGNpb25hbCBwYXJhIHRyYWR1Y2Npw7NuXG59KSA9PiB7XG4gIC8vIE9idGVuZXIgaWRpb21hIGFjdHVhbCBkZWwgbG9jYWxTdG9yYWdlXG4gIGNvbnN0IGN1cnJlbnRMYW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJMYW5ndWFnZScpIHx8ICdlcyc7XG4gIFxuICAvLyBVc2FyIHRyYWR1Y2Npw7NuIHNpIGhheSBjbGF2ZSBkaXNwb25pYmxlXG4gIGNvbnN0IGRpc3BsYXlUaXRsZSA9IHRyYW5zbGF0aW9uS2V5ID8gdCh0cmFuc2xhdGlvbktleSwgY3VycmVudExhbmcpIDogdGl0bGU7XG4gIHJldHVybiAoXG4gICAgPGRpdiBcbiAgICAgIGNsYXNzTmFtZT17YCR7Y29sb3J9YH0gXG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICBwYWRkaW5nOiAnMC43NXJlbScsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzAuNXJlbScsXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnMC41cmVtJyxcbiAgICAgICAgYm9yZGVyOiBkYXJrTW9kZSA/ICcxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpJyA6ICcxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjEpJyxcbiAgICAgICAgYm94U2hhZG93OiAnMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKSdcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGgzIHN0eWxlPXt7Y29sb3I6ICd3aGl0ZScsIGZvbnRXZWlnaHQ6ICdib2xkJywgbWFyZ2luQm90dG9tOiAnMC4yNXJlbSd9fT57ZGlzcGxheVRpdGxlfTwvaDM+XG4gICAgICA8cCBzdHlsZT17e2NvbG9yOiAnd2hpdGUnLCBmb250U2l6ZTogJzEuNzVyZW0nLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogMH19Pnt2YWx1ZX08L3A+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG4vLyBSZW5kZXJpemFyIHTDrXR1bG8gZGUgc2VjY2nDs24gY29uIG7Dum1lcm8gY2lyY3VsYXJcbmV4cG9ydCBjb25zdCBTZWN0aW9uVGl0bGUgPSAoeyBudW1iZXIsIHRpdGxlLCBkYXJrTW9kZSwgdHJhbnNsYXRpb25LZXkgfTogeyBcbiAgbnVtYmVyOiBzdHJpbmcsIFxuICB0aXRsZTogc3RyaW5nLFxuICBkYXJrTW9kZTogYm9vbGVhbixcbiAgdHJhbnNsYXRpb25LZXk/OiBzdHJpbmcgLy8gTnVldmEgcHJvcGllZGFkIG9wY2lvbmFsIHBhcmEgdHJhZHVjY2nDs25cbn0pID0+IHtcbiAgLy8gT2J0ZW5lciBpZGlvbWEgYWN0dWFsIGRlbCBsb2NhbFN0b3JhZ2VcbiAgY29uc3QgY3VycmVudExhbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlckxhbmd1YWdlJykgfHwgJ2VzJztcbiAgXG4gIC8vIFVzYXIgdHJhZHVjY2nDs24gc2kgaGF5IGNsYXZlIGRpc3BvbmlibGVcbiAgY29uc3QgZGlzcGxheVRpdGxlID0gdHJhbnNsYXRpb25LZXkgPyB0KHRyYW5zbGF0aW9uS2V5LCBjdXJyZW50TGFuZykgOiB0aXRsZTtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgIG1hcmdpbkJvdHRvbTogJzAuNXJlbScsXG4gICAgICBtYXJnaW5Ub3A6ICcxcmVtJyxcbiAgICAgIHBhZGRpbmc6ICcwLjVyZW0nLFxuICAgICAgLy8gVmVyZGUgbGltYSBjb3Jwb3JhdGl2byBtw6FzIGNsYXJvIHF1ZSBlbCBwcmluY2lwYWxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogZGFya01vZGUgPyAnIzdjYjUxOCcgOiAnI2E0Y2M0NCcsIC8vIFZlcmRlIGxpbWEgZW4gbW9kbyBvc2N1cm8sIHZlcmRlIGxpbWEgY2xhcm8gZW4gbW9kbyBjbGFyb1xuICAgICAgYm9yZGVyOiAnbm9uZScsXG4gICAgICBib3JkZXJSYWRpdXM6ICcwLjI1cmVtJywgLy8gQcOxYWRpciBib3JkZXMgcmVkb25kZWFkb3NcbiAgICB9fT5cbiAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICB3aWR0aDogJzEuNXJlbScsXG4gICAgICAgIGhlaWdodDogJzEuNXJlbScsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzk5OTlweCcsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmYnLCAvLyBGb25kbyBibGFuY29cbiAgICAgICAgY29sb3I6ICcjODhjNDI1JywgLy8gQ29sb3IgdmVyZGUgbGltYSBjb3Jwb3JhdGl2byBwYXJhIGVsIG7Dum1lcm9cbiAgICAgICAgZm9udFdlaWdodDogJ2JvbGQnLFxuICAgICAgICBtYXJnaW5SaWdodDogJzAuNXJlbScsXG4gICAgICB9fT5cbiAgICAgICAge251bWJlcn1cbiAgICAgIDwvZGl2PlxuICAgICAgPGgyIHN0eWxlPXt7XG4gICAgICAgIGZvbnRTaXplOiAnMS4yNXJlbScsXG4gICAgICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsIC8vIFRleHRvIGJsYW5jbyBwYXJhIGFtYm9zIG1vZG9zXG4gICAgICB9fT57ZGlzcGxheVRpdGxlfTwvaDI+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG4vLyBSZW5kZXJpemFyIHRhcmpldGEgZGUgZGFzaGJvYXJkIHBhcmEgZ3LDoWZpY29zXG5leHBvcnQgY29uc3QgRGFzaGJvYXJkQ2FyZCA9ICh7IHRpdGxlLCBjaGlsZHJlbiwgY2xhc3NOYW1lID0gJycsIGRhcmtNb2RlIH06IHsgXG4gIHRpdGxlOiBzdHJpbmcsIFxuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlLCBcbiAgY2xhc3NOYW1lPzogc3RyaW5nLFxuICBkYXJrTW9kZTogYm9vbGVhblxufSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxkaXYgXG4gICAgICBzdHlsZT17e1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGRhcmtNb2RlID8gJyMxMTE4MjcnIDogJyNmZmZmZmYnLFxuICAgICAgICBjb2xvcjogZGFya01vZGUgPyAnI2Y5ZmFmYicgOiAnIzExMTgyNycsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzAuNXJlbScsXG4gICAgICAgIHBhZGRpbmc6ICcxcmVtJyxcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnMXJlbScsXG4gICAgICAgIGJvcmRlcjogZGFya01vZGUgPyAnMXB4IHNvbGlkICMzNzQxNTEnIDogJzFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMSknLFxuICAgICAgICBib3hTaGFkb3c6IGRhcmtNb2RlID8gJzAgNHB4IDZweCByZ2JhKDAsIDAsIDAsIDAuMyknIDogJzAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSknXG4gICAgICB9fVxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgPlxuICAgICAgPGgzIFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRTaXplOiAnMS4xMjVyZW0nLFxuICAgICAgICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcbiAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxcmVtJyxcbiAgICAgICAgICBjb2xvcjogZGFya01vZGUgPyAnI2Y5ZmFmYicgOiAnIzExMTgyNycsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHt0aXRsZX1cbiAgICAgIDwvaDM+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG4vLyBSZW5kZXJpemFyIGV0aXF1ZXRhIHBhcmEgdGFyamV0YVxuZXhwb3J0IGNvbnN0IENhcmRMYWJlbCA9ICh7IGNoaWxkcmVuLCBkYXJrTW9kZSB9OiB7IFxuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlLFxuICBkYXJrTW9kZTogYm9vbGVhblxufSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxkaXYgXG4gICAgICBzdHlsZT17e1xuICAgICAgICBjb2xvcjogZGFya01vZGUgPyAnI2QxZDVkYicgOiAnIzRiNTU2MycsXG4gICAgICAgIGZvbnRTaXplOiAnMC44NzVyZW0nLFxuICAgICAgICBmb250V2VpZ2h0OiAnNTAwJyxcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnMC4yNXJlbSdcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApO1xufTtcblxuLy8gUmVuZGVyaXphciBkaXZpc29yIHBhcmEgdGFyamV0YVxuZXhwb3J0IGNvbnN0IENhcmREaXZpZGVyID0gKHsgY2hpbGRyZW4sIGRhcmtNb2RlIH06IHsgXG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGUsXG4gIGRhcmtNb2RlOiBib29sZWFuXG59KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGJvcmRlckJvdHRvbTogZGFya01vZGUgPyAnMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKScgOiAnMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4xKScsXG4gICAgICAgIHBhZGRpbmdCb3R0b206ICcwLjVyZW0nLFxuICAgICAgICBtYXJnaW5Cb3R0b206ICcwLjVyZW0nXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG4iXSwibWFwcGluZ3MiOiJBQWtDTTtBQWxDTixPQUFPLFdBQVc7QUFDbEIsU0FBUyxTQUFTO0FBTVgsYUFBTSxXQUFXLENBQUMsRUFBRSxPQUFPLE9BQU8sT0FBTyxVQUFVLGVBQWUsTUFNbkU7QUFFSixRQUFNLGNBQWMsYUFBYSxRQUFRLGNBQWMsS0FBSztBQUc1RCxRQUFNLGVBQWUsaUJBQWlCLEVBQUUsZ0JBQWdCLFdBQVcsSUFBSTtBQUN2RSxTQUNFO0FBQUEsSUFBQztBQUFBO0FBQUEsTUFDQyxXQUFXLEdBQUcsS0FBSztBQUFBLE1BQ25CLE9BQU87QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxRQUNULGNBQWM7QUFBQSxRQUNkLFNBQVM7QUFBQSxRQUNULGVBQWU7QUFBQSxRQUNmLGdCQUFnQjtBQUFBLFFBQ2hCLGNBQWM7QUFBQSxRQUNkLFFBQVEsV0FBVyx1Q0FBdUM7QUFBQSxRQUMxRCxXQUFXO0FBQUEsTUFDYjtBQUFBLE1BRUE7QUFBQSwrQkFBQyxRQUFHLE9BQU8sRUFBQyxPQUFPLFNBQVMsWUFBWSxRQUFRLGNBQWMsVUFBUyxHQUFJLDBCQUEzRTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQXdGO0FBQUEsUUFDeEYsdUJBQUMsT0FBRSxPQUFPLEVBQUMsT0FBTyxTQUFT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