import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=5e89932e"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"]; const useRef = __vite__cjsImport1_react["useRef"];
const PasswordErrorModal = ({ isOpen: initialIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const modalRef = useRef(null);
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);
  useEffect(() => {
    const modalElement = modalRef.current;
    const handleUpdateState = (event) => {
      if (event.detail && typeof event.detail.isOpen === "boolean") {
        setIsOpen(event.detail.isOpen);
      }
    };
    const handleGlobalEvent = () => {
      setIsOpen(true);
    };
    if (modalElement) {
      modalElement.addEventListener("update-modal-state", handleUpdateState);
    }
    document.addEventListener("show-password-error", handleGlobalEvent);
    return () => {
      if (modalElement) {
        modalElement.removeEventListener("update-modal-state", handleUpdateState);
      }
      document.removeEventListener("show-password-error", handleGlobalEvent);
    };
  }, []);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxDEV("div", { ref: modalRef, id: "passwordErrorModal", className: "fixed inset-0 z-50 overflow-y-auto", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0", children: [
    /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
        "aria-hidden": "true",
        onClick: onClose
      },
      void 0,
      false,
      {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
        lineNumber: 61,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true", children: "​" }, void 0, false, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
      lineNumber: 68,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "sm:flex sm:items-start", children: /* @__PURE__ */ jsxDEV("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left", children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-lg leading-6 font-medium text-red-600", id: "modal-title", children: "¡Acceso denegado!" }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
            lineNumber: 75,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-2", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-gray-500", children: [
            "Ramon y su perro protegen el acceso a Masclet Imperi.",
            /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
              fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
              lineNumber: 81,
              columnNumber: 21
            }, this),
            "Por favor, verifica tus credenciales e intenta de nuevo."
          ] }, void 0, true, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
            lineNumber: 79,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
            lineNumber: 78,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
          lineNumber: 74,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
          lineNumber: 73,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex justify-center", children: /* @__PURE__ */ jsxDEV(
          "img",
          {
            src: "/images/no_password.webp",
            alt: "Perro de Ramon protegiendo el sistema",
            className: "w-64 h-auto rounded-lg shadow-md"
          },
          void 0,
          false,
          {
            fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
            lineNumber: 90,
            columnNumber: 15
          },
          this
        ) }, void 0, false, {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
          lineNumber: 89,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
        lineNumber: 72,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm",
          onClick: handleClose,
          children: "Entendido"
        },
        void 0,
        false,
        {
          fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
          lineNumber: 99,
          columnNumber: 13
        },
        this
      ) }, void 0, false, {
        fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
        lineNumber: 98,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
    lineNumber: 59,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/modals/PasswordErrorModal.tsx",
    lineNumber: 58,
    columnNumber: 5
  }, this);
};
export default PasswordErrorModal;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhc3N3b3JkRXJyb3JNb2RhbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcblxuaW50ZXJmYWNlIFBhc3N3b3JkRXJyb3JNb2RhbFByb3BzIHtcbiAgaXNPcGVuOiBib29sZWFuO1xuICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xufVxuXG5jb25zdCBQYXNzd29yZEVycm9yTW9kYWw6IFJlYWN0LkZDPFBhc3N3b3JkRXJyb3JNb2RhbFByb3BzPiA9ICh7IGlzT3BlbjogaW5pdGlhbElzT3Blbiwgb25DbG9zZSB9KSA9PiB7XG4gIC8vIEVzdGFkbyBsb2NhbCBwYXJhIGNvbnRyb2xhciBsYSB2aXNpYmlsaWRhZCBkZWwgbW9kYWxcbiAgY29uc3QgW2lzT3Blbiwgc2V0SXNPcGVuXSA9IHVzZVN0YXRlKGluaXRpYWxJc09wZW4pO1xuICBjb25zdCBtb2RhbFJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbCk7XG4gIFxuICAvLyBGdW5jacOzbiBwYXJhIGNlcnJhciBlbCBtb2RhbFxuICBjb25zdCBoYW5kbGVDbG9zZSA9ICgpID0+IHtcbiAgICBzZXRJc09wZW4oZmFsc2UpO1xuICAgIGlmIChvbkNsb3NlKSBvbkNsb3NlKCk7XG4gIH07XG4gIFxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIEFjdHVhbGl6YXIgZWwgZXN0YWRvIHNpIGNhbWJpYSBsYSBwcm9wXG4gICAgc2V0SXNPcGVuKGluaXRpYWxJc09wZW4pO1xuICB9LCBbaW5pdGlhbElzT3Blbl0pO1xuICBcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBtb2RhbEVsZW1lbnQgPSBtb2RhbFJlZi5jdXJyZW50O1xuICAgIFxuICAgIC8vIEVzY3VjaGFyIGVsIGV2ZW50byBwZXJzb25hbGl6YWRvIHBhcmEgYWN0dWFsaXphciBlbCBlc3RhZG9cbiAgICBjb25zdCBoYW5kbGVVcGRhdGVTdGF0ZSA9IChldmVudDogQ3VzdG9tRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5kZXRhaWwgJiYgdHlwZW9mIGV2ZW50LmRldGFpbC5pc09wZW4gPT09ICdib29sZWFuJykge1xuICAgICAgICBzZXRJc09wZW4oZXZlbnQuZGV0YWlsLmlzT3Blbik7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvLyBFc2N1Y2hhciBlbCBldmVudG8gcGVyc29uYWxpemFkbyBhIG5pdmVsIGRlIGRvY3VtZW50b1xuICAgIGNvbnN0IGhhbmRsZUdsb2JhbEV2ZW50ID0gKCkgPT4ge1xuICAgICAgc2V0SXNPcGVuKHRydWUpO1xuICAgIH07XG4gICAgXG4gICAgLy8gUmVnaXN0cmFyIGxvcyBldmVudCBsaXN0ZW5lcnNcbiAgICBpZiAobW9kYWxFbGVtZW50KSB7XG4gICAgICBtb2RhbEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndXBkYXRlLW1vZGFsLXN0YXRlJywgaGFuZGxlVXBkYXRlU3RhdGUgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgfVxuICAgIFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Nob3ctcGFzc3dvcmQtZXJyb3InLCBoYW5kbGVHbG9iYWxFdmVudCk7XG4gICAgXG4gICAgLy8gTGltcGlhciBsb3MgZXZlbnQgbGlzdGVuZXJzIGFsIGRlc21vbnRhclxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAobW9kYWxFbGVtZW50KSB7XG4gICAgICAgIG1vZGFsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd1cGRhdGUtbW9kYWwtc3RhdGUnLCBoYW5kbGVVcGRhdGVTdGF0ZSBhcyBFdmVudExpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Nob3ctcGFzc3dvcmQtZXJyb3InLCBoYW5kbGVHbG9iYWxFdmVudCk7XG4gICAgfTtcbiAgfSwgW10pO1xuICBcbiAgaWYgKCFpc09wZW4pIHJldHVybiBudWxsO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiByZWY9e21vZGFsUmVmfSBpZD1cInBhc3N3b3JkRXJyb3JNb2RhbFwiIGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LTAgei01MCBvdmVyZmxvdy15LWF1dG9cIiBhcmlhLWxhYmVsbGVkYnk9XCJtb2RhbC10aXRsZVwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWVuZCBqdXN0aWZ5LWNlbnRlciBtaW4taC1zY3JlZW4gcHQtNCBweC00IHBiLTIwIHRleHQtY2VudGVyIHNtOmJsb2NrIHNtOnAtMFwiPlxuICAgICAgICB7LyogT3ZlcmxheSBkZSBmb25kbyBvc2N1cm8gKi99XG4gICAgICAgIDxkaXYgXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1ncmF5LTUwMCBiZy1vcGFjaXR5LTc1IHRyYW5zaXRpb24tb3BhY2l0eVwiIFxuICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgb25DbGljaz17b25DbG9zZX1cbiAgICAgICAgPjwvZGl2PlxuXG4gICAgICAgIHsvKiBDZW50cmFyIGVsIG1vZGFsICovfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJoaWRkZW4gc206aW5saW5lLWJsb2NrIHNtOmFsaWduLW1pZGRsZSBzbTpoLXNjcmVlblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiYjODIwMzs8L3NwYW4+XG4gICAgICAgIFxuICAgICAgICB7LyogQ29udGVuaWRvIGRlbCBtb2RhbCAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgYWxpZ24tYm90dG9tIGJnLXdoaXRlIHJvdW5kZWQtbGcgdGV4dC1sZWZ0IG92ZXJmbG93LWhpZGRlbiBzaGFkb3cteGwgdHJhbnNmb3JtIHRyYW5zaXRpb24tYWxsIHNtOm15LTggc206YWxpZ24tbWlkZGxlIHNtOm1heC13LWxnIHNtOnctZnVsbFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcHgtNCBwdC01IHBiLTQgc206cC02IHNtOnBiLTRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic206ZmxleCBzbTppdGVtcy1zdGFydFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTMgdGV4dC1jZW50ZXIgc206bXQtMCBzbTptbC00IHNtOnRleHQtbGVmdFwiPlxuICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWxnIGxlYWRpbmctNiBmb250LW1lZGl1bSB0ZXh0LXJlZC02MDBcIiBpZD1cIm1vZGFsLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICDCoUFjY2VzbyBkZW5lZ2FkbyFcbiAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtMlwiPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWdyYXktNTAwXCI+XG4gICAgICAgICAgICAgICAgICAgIFJhbW9uIHkgc3UgcGVycm8gcHJvdGVnZW4gZWwgYWNjZXNvIGEgTWFzY2xldCBJbXBlcmkuXG4gICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICBQb3IgZmF2b3IsIHZlcmlmaWNhIHR1cyBjcmVkZW5jaWFsZXMgZSBpbnRlbnRhIGRlIG51ZXZvLlxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB7LyogSW1hZ2VuIGRlbCBwZXJybyBkZSBSYW1vbiAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNCBmbGV4IGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgICAgIDxpbWcgXG4gICAgICAgICAgICAgICAgc3JjPVwiL2ltYWdlcy9ub19wYXNzd29yZC53ZWJwXCIgXG4gICAgICAgICAgICAgICAgYWx0PVwiUGVycm8gZGUgUmFtb24gcHJvdGVnaWVuZG8gZWwgc2lzdGVtYVwiIFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctNjQgaC1hdXRvIHJvdW5kZWQtbGcgc2hhZG93LW1kXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctZ3JheS01MCBweC00IHB5LTMgc206cHgtNiBzbTpmbGV4IHNtOmZsZXgtcm93LXJldmVyc2VcIj5cbiAgICAgICAgICAgIDxidXR0b24gXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIiBcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGlubGluZS1mbGV4IGp1c3RpZnktY2VudGVyIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci10cmFuc3BhcmVudCBzaGFkb3ctc20gcHgtNCBweS0yIGJnLXByaW1hcnkgdGV4dC1iYXNlIGZvbnQtbWVkaXVtIHRleHQtd2hpdGUgaG92ZXI6YmctcHJpbWFyeS85MCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTIgZm9jdXM6cmluZy1wcmltYXJ5IHNtOm1sLTMgc206dy1hdXRvIHNtOnRleHQtc21cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVDbG9zZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgRW50ZW5kaWRvXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBhc3N3b3JkRXJyb3JNb2RhbDtcbiJdLCJtYXBwaW5ncyI6IkFBNERRO0FBNURSLE9BQU8sU0FBUyxV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