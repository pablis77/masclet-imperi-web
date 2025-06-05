import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_BVudR5Na.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useRef, useState, useEffect } from 'react';
import { a as apiService } from '../chunks/apiService_CMRujBeB.mjs';
import { A as API_CONFIG } from '../chunks/apiConfig_1zepEhH0.mjs';
/* empty css                                 */

const checkAuthStatus = () => {
  return {
    isAuthenticated: true,
    canImport: true,
    message: ""
  };
};
const getAuthToken = () => {
  try {
    return localStorage.getItem("auth_token");
  } catch (error) {
    console.error("Error al obtener token:", error);
    return null;
  }
};
const importService = {
  /**
   * Obtiene el historial de importaciones con filtros opcionales
   * @param filters Filtros a aplicar (opcionales)
   */
  async getImportHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) {
        queryParams.append("status", filters.status);
      }
      if (filters.startDate) {
        queryParams.append("start_date", filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append("end_date", filters.endDate);
      }
      if (filters.fileName) {
        queryParams.append("file_name", filters.fileName);
      }
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      console.log(`[ImportService] Consultando historial de importaciones`);
      const endpoint = `/imports/?${queryParams.toString()}`;
      const response = await apiService.get(endpoint);
      if (response && response.items) {
        return {
          items: response.items || [],
          total: response.total || 0,
          page: response.page || 1,
          limit: response.size || 10,
          // En la API se llama 'size', no 'limit'
          totalPages: response.totalPages || 1
        };
      } else {
        console.error("Error: Formato de respuesta inesperado:", response);
        return {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1
        };
      }
    } catch (error) {
      console.error("Error general al obtener historial de importaciones:", error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      };
    }
  },
  /**
   * Importa animales desde un archivo CSV
   * @param formData FormData con el archivo y parámetros adicionales
   */
  async importAnimals(formData) {
    try {
      const authStatus = checkAuthStatus();
      if (!authStatus.isAuthenticated || !authStatus.canImport) ;
      const token = getAuthToken();
      console.log("Token de autenticación:", token ? "Presente" : "No hay token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        headers["Authorization"] = "Bearer test_token_for_development";
        console.log("Usando token de desarrollo para pruebas");
      }
      let fileInfo = "FormData sin archivo";
      const fileEntry = formData.get("file");
      if (fileEntry instanceof File) {
        fileInfo = `Archivo: ${fileEntry.name}, ${fileEntry.size} bytes, tipo: ${fileEntry.type}`;
      }
      const BACKEND_URL = API_CONFIG.backendURL;
      console.log("Enviando petición directa al backend:", `${BACKEND_URL}/api/v1/imports/csv`);
      console.log("Contenido del FormData:", fileInfo);
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/imports/csv`, {
          method: "POST",
          body: formData,
          headers
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Respuesta exitosa desde el backend:", data);
          return data;
        }
        const errorText = await response.text();
        console.error("Error en la petición al backend:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return {
          success: false,
          message: `Error HTTP ${response.status}: ${response.statusText}`,
          total_processed: 0,
          total_imported: 0,
          total_errors: 1,
          errors: [`Fallo al comunicarse con el backend: ${response.status}`]
        };
      } catch (fetchError) {
        console.error("Error en la petición fetch:", fetchError);
        return {
          success: false,
          message: `Error de red: ${fetchError.message}`,
          total_processed: 0,
          total_imported: 0,
          total_errors: 1,
          errors: ["Error de conexión con el servidor"]
        };
      }
    } catch (error) {
      console.error("Error general al importar animales:", error);
      return {
        success: false,
        message: error.message || "Error desconocido al importar animales",
        total_processed: 0,
        total_imported: 0,
        total_errors: 1,
        errors: [error.message || "Error desconocido"]
      };
    }
  },
  /**
   * Descarga la plantilla de animales
   */
  async downloadAnimalTemplate() {
    try {
      const exampleData = [
        {
          nom: "NOMBRE_ANIMAL",
          genere: "F",
          estado: "OK",
          alletar: "0",
          mare: "NOMBRE_MADRE",
          pare: "NOMBRE_PADRE",
          quadra: "NOMBRE_CUADRA",
          cod: "CODIGO",
          num_serie: "NUMERO_SERIE",
          dob: "DD/MM/YYYY"
        }
      ];
      const headers = Object.keys(exampleData[0]).join(",");
      const rows = exampleData.map((item) => Object.values(item).join(","));
      const csvContent = [headers, ...rows].join("\n");
      return new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    } catch (error) {
      console.error("Error al generar plantilla:", error);
      throw error;
    }
  },
  /**
   * Descarga la plantilla de partos
   */
  async downloadPartoTemplate() {
    try {
      const exampleData = [
        {
          nom_animal: "NOMBRE_VACA",
          date_part: "DD/MM/YYYY",
          genere_t: "M",
          estado_t: "OK"
        }
      ];
      const headers = Object.keys(exampleData[0]).join(",");
      const rows = exampleData.map((item) => Object.values(item).join(","));
      const csvContent = [headers, ...rows].join("\n");
      return new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    } catch (error) {
      console.error("Error al generar plantilla:", error);
      throw error;
    }
  }
};

const ImportForm = ({ onImportComplete }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [currentLang, setCurrentLang] = useState("es");
  const translations = {
    es: {
      selectFile: "Seleccionar archivo CSV",
      dragDrop: "Arrastra un archivo CSV o haz clic para seleccionar",
      fileTooBig: "El archivo es demasiado grande. Tamaño máximo: 10MB",
      selectFileFirst: "Debes seleccionar un archivo CSV primero",
      mustBeCSV: "El archivo debe tener extensión .csv",
      fileSelected: "Archivo seleccionado",
      size: "Tamaño",
      type: "Tipo",
      bytes: "bytes"
    },
    ca: {
      selectFile: "Seleccionar arxiu CSV",
      dragDrop: "Arrossega un arxiu CSV o fes clic per seleccionar",
      fileTooBig: "L'arxiu és massa gran. Mida màxima: 10MB",
      selectFileFirst: "Has de seleccionar un arxiu CSV primer",
      mustBeCSV: "L'arxiu ha de tenir extensió .csv",
      fileSelected: "Arxiu seleccionat",
      size: "Mida",
      type: "Tipus",
      bytes: "bytes"
    }
  };
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLangChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);
  const acceptedFormat = ".csv";
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
      const t = translations[currentLang] || translations.es;
      setDebugInfo(`${t.fileSelected}: ${files[0].name}
${t.size}: ${files[0].size} ${t.bytes}
${t.type}: ${files[0].type}`);
    }
  };
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setDebugInfo("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleImport = async () => {
    if (!file) {
      setError(translations[currentLang]?.selectFileFirst || translations.es.selectFileFirst);
      return;
    }
    console.log("Archivo seleccionado:", file.name);
    console.log("Tamaño del archivo:", file.size, "bytes");
    console.log("Tipo del archivo:", file.type);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError(translations[currentLang]?.mustBeCSV || translations.es.mustBeCSV);
      return;
    }
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(translations[currentLang]?.fileTooBig || translations.es.fileTooBig);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setDebugInfo("Iniciando importación de datos...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setDebugInfo((prev) => prev + "\n\nADVERTENCIA: No se encontró token de autenticación en localStorage.");
        localStorage.setItem("auth_token", "test_token_for_development");
        setDebugInfo((prev) => prev + "\nSe ha creado un token de prueba para desarrollo.");
      } else {
        setDebugInfo((prev) => prev + `

Token de autenticación encontrado: ${token.substring(0, 10)}...`);
      }
      const formData = new FormData();
      formData.append("file", file);
      console.log("FormData creado con archivo:", file.name);
      formData.append("description", "Importación desde frontend");
      console.log("Contenido del FormData:");
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + (pair[1] instanceof File ? `[File: ${pair[1].name}, ${pair[1].size} bytes]` : pair[1]));
      }
      formData.append("validate_only", "false");
      formData.append("skip_errors", "false");
      const importResult = await importService.importAnimals(formData);
      setResult(importResult);
      if (onImportComplete) {
        onImportComplete(importResult);
      }
      const event = new CustomEvent("import-complete", { detail: importResult });
      document.dispatchEvent(event);
    } catch (err) {
      console.error("Error al importar datos:", err);
      setError(`Error al importar datos: ${err.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleResetEvent = () => {
      handleReset();
    };
    const handleImportEvent = () => {
      handleImport();
    };
    document.addEventListener("reset-import", handleResetEvent);
    document.addEventListener("import-btn-click", handleImportEvent);
    return () => {
      document.removeEventListener("reset-import", handleResetEvent);
      document.removeEventListener("import-btn-click", handleImportEvent);
    };
  }, [file]);
  return /* @__PURE__ */ jsxs("div", { className: "import-form", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "file-upload", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: translations[currentLang]?.selectFile || translations.es.selectFile }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-3", children: /* @__PURE__ */ jsx("div", { className: "flex-grow", children: /* @__PURE__ */ jsxs("div", { className: "relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "file-upload",
            type: "file",
            accept: acceptedFormat,
            onChange: handleFileChange,
            ref: fileInputRef,
            className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
            disabled: loading
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "📁" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: file ? file.name : translations[currentLang]?.dragDrop || translations.es.dragDrop }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: file ? `${(file.size / 1024).toFixed(2)} KB - ${file.type || "text/csv"}` : `Solo se permiten archivos CSV` })
        ] })
      ] }) }) })
    ] }),
    debugInfo && process.env.NODE_ENV === "development" && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Información de depuración:" }),
      /* @__PURE__ */ jsx("pre", { className: "text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap", children: debugInfo })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-red-500 dark:text-red-400 text-lg", children: "🚨" }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-red-800 dark:text-red-300", children: "Error" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-red-700 dark:text-red-200", children: /* @__PURE__ */ jsx("p", { children: error }) })
      ] })
    ] }) }),
    result && /* @__PURE__ */ jsx("div", { className: `mb-6 p-4 rounded-lg border ${result.success ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-lg", children: result.success ? "✅" : "⚠️" }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx("h3", { className: `text-sm font-medium ${result.success ? "text-green-800 dark:text-green-300" : "text-yellow-800 dark:text-yellow-300"}`, children: result.success ? "Importación completada" : "Importación con advertencias" }),
        /* @__PURE__ */ jsxs("div", { className: `mt-2 text-sm ${result.success ? "text-green-700 dark:text-green-200" : "text-yellow-700 dark:text-yellow-200"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Total registros" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: result.total_processed || result.records_count || 7 })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-green-600 dark:text-green-400", children: "Importados correctamente" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-green-700 dark:text-green-300", children: result.total_imported || (result.status === "completed" ? result.records_count || 7 : 0) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: (result.total_errors || 0) > 0 ? "bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800" : "bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsx("p", { className: (result.total_errors || 0) > 0 ? "text-xs text-red-600 dark:text-red-400" : "text-xs text-gray-500 dark:text-gray-400", children: "Registros con errores" }),
              /* @__PURE__ */ jsx("p", { className: (result.total_errors || 0) > 0 ? "text-lg font-bold text-red-700 dark:text-red-300" : "text-lg font-bold", children: result.total_errors || (result.status === "failed" ? result.records_count || 7 : 0) })
            ] })
          ] }),
          result.message && /* @__PURE__ */ jsx("p", { className: "mt-2 font-medium", children: result.message })
        ] }),
        (result.total_errors || 0) > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              console.log("Descargar errores de importación");
            },
            className: "inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 text-xs font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mr-1", children: "📥" }),
              "Descargar errores"
            ]
          }
        ) })
      ] })
    ] }) }),
    loading && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "Procesando importación" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 text-center", children: "Esto puede tardar unos momentos dependiendo del tamaño del archivo." })
    ] }) }) })
  ] });
};

const ImportHistory = ({
  className = "",
  defaultFilters = {},
  refreshTrigger = 0
}) => {
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [currentLang, setCurrentLang] = useState("es");
  const translations = {
    es: {
      loadingError: "No se pudo cargar el historial de importaciones",
      noImports: "No hay importaciones registradas",
      filename: "Nombre de archivo",
      importDate: "Fecha de importación",
      status: "Estado",
      records: "Registros",
      actions: "Acciones",
      loading: "Cargando historial...",
      viewDetails: "Ver detalles",
      downloadReport: "Descargar reporte",
      statusCompleted: "Completado",
      statusCompletedErrors: "Completado con errores",
      statusFailed: "Error",
      statusProcessing: "Procesando",
      statusPending: "Pendiente",
      prev: "Anterior",
      next: "Siguiente",
      page: "Página",
      of: "de",
      total: "Total",
      first: "Primera"
    },
    ca: {
      loadingError: "No s'ha pogut carregar l'historial d'importacions",
      noImports: "No hi ha importacions registrades",
      filename: "Nom d'arxiu",
      importDate: "Data d'importació",
      status: "Estat",
      records: "Registres",
      actions: "Accions",
      loading: "Carregant historial...",
      viewDetails: "Veure detalls",
      downloadReport: "Descarregar informe",
      statusCompleted: "Completat",
      statusCompletedErrors: "Completat amb errors",
      statusFailed: "Error",
      statusProcessing: "Processant",
      statusPending: "Pendent",
      prev: "Anterior",
      next: "Següent",
      page: "Pàgina",
      of: "de",
      total: "Total",
      first: "Primera"
    }
  };
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLangChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);
  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = {
        ...filters,
        page: currentPage,
        limit
      };
      console.log("[ImportHistory] Consultando API con filtros:", apiFilters);
      const response = await importService.getImportHistory(apiFilters);
      setHistory(response.items);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error al cargar el historial de importaciones:", err);
      setError(translations[currentLang]?.loadingError || translations.es.loadingError);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadHistory();
  }, [filters, currentPage, refreshTrigger]);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const getStatusBadge = (status) => {
    let bgColor = "";
    let textColor = "";
    let text = "";
    switch (status) {
      case "completed":
        bgColor = "bg-green-100 dark:bg-green-800";
        textColor = "text-green-800 dark:text-green-100";
        text = translations[currentLang]?.statusCompleted || translations.es.statusCompleted;
        break;
      case "completed_err":
        bgColor = "bg-amber-100 dark:bg-amber-800";
        textColor = "text-amber-800 dark:text-amber-100";
        text = translations[currentLang]?.statusCompletedErrors || translations.es.statusCompletedErrors;
        break;
      case "failed":
        bgColor = "bg-red-100 dark:bg-red-800";
        textColor = "text-red-800 dark:text-red-100";
        text = translations[currentLang]?.statusFailed || translations.es.statusFailed;
        break;
      case "processing":
        bgColor = "bg-blue-100 dark:bg-blue-800";
        textColor = "text-blue-800 dark:text-blue-100";
        text = translations[currentLang]?.statusProcessing || translations.es.statusProcessing;
        break;
      case "pending":
        bgColor = "bg-amber-100 dark:bg-amber-800";
        textColor = "text-amber-800 dark:text-amber-100";
        text = translations[currentLang]?.statusPending || translations.es.statusPending;
        break;
      default:
        bgColor = "bg-gray-100 dark:bg-gray-700";
        textColor = "text-gray-800 dark:text-gray-100";
        text = status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`, children: text });
  };
  const handleDownloadErrors = async (importId) => {
    try {
      setIsLoading(true);
      const headers = ["Línea", "Columna", "Valor", "Error"];
      const data = [
        { "Línea": "2", "Columna": "Genere", "Valor": "X", "Error": "Valor no válido para género. Use M o F." },
        { "Línea": "3", "Columna": "Data Naixement", "Valor": "32/01/2020", "Error": "Fecha no válida" },
        { "Línea": "5", "Columna": "Mare", "Valor": "999", "Error": "Animal madre no encontrado" }
      ];
      let csvContent = headers.join(";") + "\n";
      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header] || "";
          return typeof value === "string" && (value.includes(";") || value.includes('"')) ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvContent += values.join(";") + "\n";
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `errores_importacion_${importId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al descargar errores:", err);
      setError(translations[currentLang]?.loadingError || translations.es.loadingError);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: `${className}`, children: [
    error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 border border-red-200 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-100 dark:border-red-800 rounded-lg", children: error }),
    isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-8 text-gray-600 dark:text-gray-300", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 font-medium", children: translations[currentLang]?.loading || translations.es.loading })
    ] }) : history.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "📋" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-gray-900 dark:text-white mb-1", children: translations[currentLang]?.noImports || translations.es.noImports }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Las importaciones que realices aparecerán aquí." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "ID" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: translations[currentLang]?.filename || translations.es.filename }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: translations[currentLang]?.importDate || translations.es.importDate }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: translations[currentLang]?.records || translations.es.records }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: translations[currentLang]?.status || translations.es.status }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: translations[currentLang]?.actions || translations.es.actions })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: history.map((item, index) => /* @__PURE__ */ jsxs("tr", { className: index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50", children: [
          /* @__PURE__ */ jsx("td", { className: "px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: item.id }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: item.filename }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Por: ",
              item.user_name || "Sistema"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: formatDate(item.created_at) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-900 dark:text-white", children: [
              "Total: ",
              item.total_records
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex mt-1 text-xs", children: [
              item.successful_records > 0 && /* @__PURE__ */ jsxs("span", { className: "text-green-600 dark:text-green-400 mr-2", children: [
                "Éxito: ",
                item.successful_records
              ] }),
              item.failed_records > 0 && /* @__PURE__ */ jsxs("span", { className: "text-red-600 dark:text-red-400", children: [
                "Errores: ",
                item.failed_records
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-4 whitespace-nowrap", children: getStatusBadge(item.status) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-4 whitespace-nowrap text-sm", children: item.failed_records > 0 && /* @__PURE__ */ jsx(
            "button",
            {
              className: "inline-flex items-center px-2.5 py-1.5 border border-red-300 dark:border-red-700 text-xs font-medium rounded \n                                   text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 \n                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors",
              onClick: () => handleDownloadErrors(item.id),
              children: translations[currentLang]?.downloadReport || translations.es.downloadReport
            }
          ) })
        ] }, item.id)) })
      ] }) }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center mt-6 space-x-1", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handlePageChange(1),
            disabled: currentPage === 1,
            className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === 1 ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: translations[currentLang]?.first || "Primera" }),
              /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 19l-7-7 7-7m8 14l-7-7 7-7" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handlePageChange(currentPage - 1),
            disabled: currentPage === 1,
            className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === 1 ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: translations[currentLang]?.prev || translations.es.prev }),
              /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
            ]
          }
        ),
        [...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          if (pageNumber === 1 || pageNumber === totalPages || pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) {
            return /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handlePageChange(pageNumber),
                className: `inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md 
                                ${pageNumber === currentPage ? "bg-primary/10 dark:bg-primary/30 text-primary border-primary/20 dark:border-primary/40" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
                children: pageNumber
              },
              pageNumber
            );
          } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
            return /* @__PURE__ */ jsx("span", { className: "px-1 text-gray-500 dark:text-gray-400", children: "..." }, `ellipsis-${pageNumber}`);
          }
          return null;
        }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handlePageChange(currentPage + 1),
            disabled: currentPage === totalPages,
            className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === totalPages ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Siguiente" }),
              /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handlePageChange(totalPages),
            disabled: currentPage === totalPages,
            className: `inline-flex items-center px-2 py-1 border rounded-md text-sm font-medium 
                          ${currentPage === totalPages ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Última" }),
              /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 5l7 7-7 7M5 5l7 7-7 7" }) })
            ]
          }
        )
      ] })
    ] })
  ] });
};

const ImportContainer = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentLang, setCurrentLang] = useState("es");
  const translations = {
    es: {
      historyTitle: "Historial de Importaciones"
    },
    ca: {
      historyTitle: "Historial d'Importacions"
    }
  };
  useEffect(() => {
    const storedLang = localStorage.getItem("userLanguage") || "es";
    setCurrentLang(storedLang);
    const handleLangChange = (e) => {
      if (e.key === "userLanguage") {
        setCurrentLang(e.newValue || "es");
      }
    };
    window.addEventListener("storage", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);
  const handleImportComplete = (result) => {
    console.log("Importación completada. Actualizando historial...", result);
    setRefreshTrigger((prev) => prev + 1);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ImportForm, { onImportComplete: handleImportComplete }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white", children: translations[currentLang]?.historyTitle || translations.es.historyTitle }),
      /* @__PURE__ */ jsx(ImportHistory, { refreshTrigger })
    ] })
  ] });
};

const adminService = {
  /**
   * Resetea la base de datos (solo desarrollo)
   */
  async resetDatabase() {
    try {
      const BACKEND_URL = "http://localhost:8000";
      const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test_token_for_development"
      };
      const response = await fetch(`${BACKEND_URL}/api/v1/reset-database`, {
        method: "POST",
        headers
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Base de datos reiniciada con éxito:", data);
        return {
          success: true,
          message: "Base de datos reiniciada con éxito"
        };
      }
      const errorText = await response.text();
      console.error("Error al reiniciar la base de datos:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return {
        success: false,
        message: `Error al reiniciar la base de datos: ${response.status} ${response.statusText}`
      };
    } catch (error) {
      console.error("Error general al reiniciar la base de datos:", error);
      return {
        success: false,
        message: error.message || "Error desconocido al reiniciar la base de datos"
      };
    }
  }
};

const ResetDatabaseButton = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSecondConfirmation, setShowSecondConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const handleFirstConfirmClick = () => {
    setShowConfirmation(true);
    setResult(null);
  };
  const handleSecondConfirmClick = () => {
    setShowSecondConfirmation(true);
  };
  const handleCancelClick = () => {
    setShowConfirmation(false);
    setShowSecondConfirmation(false);
  };
  const handleResetDatabase = async () => {
    setLoading(true);
    try {
      const result2 = await adminService.resetDatabase();
      setResult(result2);
      if (result2.success) {
        setTimeout(() => {
          setShowConfirmation(false);
          setShowSecondConfirmation(false);
        }, 3e3);
        const event = new CustomEvent("database-reset", { detail: result2 });
        document.dispatchEvent(event);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.message || "Error desconocido al resetear la base de datos"
      });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "reset-database-container", children: [
    !showConfirmation && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleFirstConfirmClick,
        className: "flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200",
        title: "Esta acción borrará TODOS los datos",
        children: [
          /* @__PURE__ */ jsx("span", { className: "mr-2", children: "🗑️" }),
          /* @__PURE__ */ jsx("span", { children: "Resetear Base de Datos" })
        ]
      }
    ),
    showConfirmation && !showSecondConfirmation && /* @__PURE__ */ jsxs("div", { className: "confirmation-dialog bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-red-700 dark:text-red-300 font-medium mb-2", children: "¿Estás seguro?" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-200 mb-4", children: "Esta acción eliminará TODOS los datos de la base de datos. Esta operación no se puede deshacer." }),
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSecondConfirmClick,
            className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200",
            disabled: loading,
            children: "Sí, continuar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCancelClick,
            className: "px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-200",
            disabled: loading,
            children: "Cancelar"
          }
        )
      ] })
    ] }),
    showConfirmation && showSecondConfirmation && /* @__PURE__ */ jsxs("div", { className: "confirmation-dialog bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-red-700 dark:text-red-300 font-medium mb-2", children: "¡ÚLTIMA ADVERTENCIA!" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-600 dark:text-red-200 mb-4", children: [
        /* @__PURE__ */ jsx("strong", { children: "¿Estás ABSOLUTAMENTE seguro?" }),
        " Todos los animales, partos y registros históricos serán eliminados permanentemente."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleResetDatabase,
            className: `px-4 py-2 text-white font-medium rounded-md transition-colors duration-200 ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`,
            disabled: loading,
            children: loading ? "Procesando..." : "Sí, RESETEAR TODO"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCancelClick,
            className: "px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-200",
            disabled: loading,
            children: "Cancelar"
          }
        )
      ] })
    ] }),
    result && /* @__PURE__ */ jsx("div", { className: `mt-3 p-3 rounded-md ${result.success ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`, children: /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${result.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`, children: result.message }) })
  ] });
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  let currentLang = "es";
  let userRole = "guest";
  const token = Astro2.cookies.get("token")?.value;
  if (token) {
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length > 1) {
        const payload = JSON.parse(atob(tokenParts[1]));
        userRole = payload.role || "guest";
      }
    } catch (e) {
      console.error("Error al decodificar token:", e);
    }
  }
  userRole.toLowerCase() === "editor";
  const translations = {
    es: {
      title: "Importaci\xF3n de Datos",
      subtitle: "Importa datos masivos desde archivos CSV - Todos los derechos reservados",
      importAnimals: "Importar Animales",
      selectFile: "Selecciona un archivo CSV con el formato correcto para importar animales al sistema.",
      downloadTemplate: "Descargar Plantilla",
      reset: "Reiniciar",
      import: "Importar"
    },
    ca: {
      title: "Importaci\xF3 de Dades",
      subtitle: "Importa dades massives des d'arxius CSV - Tots els drets reservats",
      importAnimals: "Importar Animals",
      selectFile: "Selecciona un arxiu CSV amb el format correcte per importar animals al sistema.",
      downloadTemplate: "Descarregar Plantilla",
      reset: "Reiniciar",
      import: "Importar"
    }
  };
  const pageTitle = translations[currentLang].title;
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": pageTitle, "userRole": userRole, "currentPath": "/imports", "data-astro-cid-64fplk6r": true }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(["  <script>\n    (function() {\n      try {\n        const token = localStorage.getItem('token');\n        if (token) {\n          const payload = JSON.parse(atob(token.split('.')[1]));\n          const userRole = payload.role || 'guest';\n          if (userRole.toLowerCase() !== 'administrador' && userRole.toLowerCase() !== 'ramon') {\n            console.log('ACCESO DENEGADO: Redirigiendo...');\n            window.location.href = '/';\n          }\n        } else {\n          window.location.href = '/login';\n        }\n      } catch (e) {\n        console.error('Error:', e);\n        window.location.href = '/';\n      }\n    })();\n  <\/script>  <script>\n    // Funci\xF3n para eliminar mensajes duplicados\n    function limpiarMensajesDuplicados() {\n      // Seleccionar todos los mensajes de advertencia\n      const mensajes = document.querySelectorAll('.bg-yellow-50.border-l-4.border-yellow-400.p-4.mb-4');\n      \n      // Si hay m\xE1s de uno, eliminar todos excepto el primero\n      if (mensajes.length > 1) {\n        console.log(`Eliminando ${mensajes.length - 1} mensajes duplicados`);\n        for (let i = 1; i < mensajes.length; i++) {\n          mensajes[i].remove();\n        }\n      }\n    }\n    \n    // Ejecutar al cargar la p\xE1gina\n    document.addEventListener('DOMContentLoaded', limpiarMensajesDuplicados);\n    \n    // Tambi\xE9n ejecutar cuando la ventana est\xE9 completamente cargada\n    window.addEventListener('load', limpiarMensajesDuplicados);\n    \n    // Ejecutar de nuevo despu\xE9s de un breve retraso para capturar mensajes a\xF1adidos din\xE1micamente\n    setTimeout(limpiarMensajesDuplicados, 500);\n    setTimeout(limpiarMensajesDuplicados, 1000);\n    setTimeout(limpiarMensajesDuplicados, 2000);\n    \n    // Observar cambios en el DOM para eliminar mensajes duplicados que se a\xF1adan din\xE1micamente\n    const observer = new MutationObserver(() => {\n      limpiarMensajesDuplicados();\n    });\n    \n    // Iniciar observaci\xF3n cuando el DOM est\xE9 listo\n    document.addEventListener('DOMContentLoaded', () => {\n      observer.observe(document.body, { childList: true, subtree: true });\n    });\n  <\/script>  <script src=\"/scripts/permissions-ui.js\"><\/script> ", '<div class="mb-6" data-astro-cid-64fplk6r> <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white" id="imports-title" data-astro-cid-64fplk6r>', '</h1> <p class="text-sm md:text-base text-gray-600 dark:text-gray-300" id="imports-subtitle" data-astro-cid-64fplk6r>', '</p> </div> <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700" data-astro-cid-64fplk6r> <!-- Importaci\xF3n de Animales --> <div class="import-container" data-astro-cid-64fplk6r> <h2 class="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white" id="import-animals-title" data-astro-cid-64fplk6r>', '</h2> <p class="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4" id="import-animals-desc" data-astro-cid-64fplk6r>', '</p> <!-- Botones de acci\xF3n para importaci\xF3n - Reorganizados seg\xFAn la imagen --> <div class="flex flex-wrap justify-between mb-6" data-astro-cid-64fplk6r> <!-- Grupo de botones izquierda --> <div class="flex flex-wrap gap-3 mb-3 sm:mb-0" data-astro-cid-64fplk6r> <a href="/templates/plantilla_animales.csv" download class="import-btn download-btn" data-astro-cid-64fplk6r> <span class="icon" data-astro-cid-64fplk6r>\u{1F4E5}</span> <span class="text" id="download-template" data-astro-cid-64fplk6r>', '</span> </a> <button id="reset-import" class="import-btn reset-btn" data-astro-cid-64fplk6r> <span class="icon" data-astro-cid-64fplk6r>\u{1F504}</span> <span class="text" id="reset-text" data-astro-cid-64fplk6r>', '</span> </button> </div> <!-- Grupo de botones derecha --> <div class="flex flex-wrap gap-3" data-astro-cid-64fplk6r> <button id="import-btn" class="import-btn import-action-btn" data-astro-cid-64fplk6r> <span class="icon" data-astro-cid-64fplk6r>\u2705</span> <span class="text" id="import-text" data-astro-cid-64fplk6r>', "</span> </button> </div> </div> <!-- Componente React para la importaci\xF3n y el historial --> ", ' </div> </div>  <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700" data-astro-cid-64fplk6r> <h2 class="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white" data-astro-cid-64fplk6r>Opciones Avanzadas (Administrador)</h2> <p class="text-sm md:text-base text-red-600 dark:text-red-400 mb-4" data-astro-cid-64fplk6r>\n\u26A0\uFE0F Advertencia: Estas operaciones son irreversibles y solo deben ser usadas por administradores.\n</p> ', " </div>  "], ["  <script>\n    (function() {\n      try {\n        const token = localStorage.getItem('token');\n        if (token) {\n          const payload = JSON.parse(atob(token.split('.')[1]));\n          const userRole = payload.role || 'guest';\n          if (userRole.toLowerCase() !== 'administrador' && userRole.toLowerCase() !== 'ramon') {\n            console.log('ACCESO DENEGADO: Redirigiendo...');\n            window.location.href = '/';\n          }\n        } else {\n          window.location.href = '/login';\n        }\n      } catch (e) {\n        console.error('Error:', e);\n        window.location.href = '/';\n      }\n    })();\n  <\/script>  <script>\n    // Funci\xF3n para eliminar mensajes duplicados\n    function limpiarMensajesDuplicados() {\n      // Seleccionar todos los mensajes de advertencia\n      const mensajes = document.querySelectorAll('.bg-yellow-50.border-l-4.border-yellow-400.p-4.mb-4');\n      \n      // Si hay m\xE1s de uno, eliminar todos excepto el primero\n      if (mensajes.length > 1) {\n        console.log(\\`Eliminando \\${mensajes.length - 1} mensajes duplicados\\`);\n        for (let i = 1; i < mensajes.length; i++) {\n          mensajes[i].remove();\n        }\n      }\n    }\n    \n    // Ejecutar al cargar la p\xE1gina\n    document.addEventListener('DOMContentLoaded', limpiarMensajesDuplicados);\n    \n    // Tambi\xE9n ejecutar cuando la ventana est\xE9 completamente cargada\n    window.addEventListener('load', limpiarMensajesDuplicados);\n    \n    // Ejecutar de nuevo despu\xE9s de un breve retraso para capturar mensajes a\xF1adidos din\xE1micamente\n    setTimeout(limpiarMensajesDuplicados, 500);\n    setTimeout(limpiarMensajesDuplicados, 1000);\n    setTimeout(limpiarMensajesDuplicados, 2000);\n    \n    // Observar cambios en el DOM para eliminar mensajes duplicados que se a\xF1adan din\xE1micamente\n    const observer = new MutationObserver(() => {\n      limpiarMensajesDuplicados();\n    });\n    \n    // Iniciar observaci\xF3n cuando el DOM est\xE9 listo\n    document.addEventListener('DOMContentLoaded', () => {\n      observer.observe(document.body, { childList: true, subtree: true });\n    });\n  <\/script>  <script src=\"/scripts/permissions-ui.js\"><\/script> ", '<div class="mb-6" data-astro-cid-64fplk6r> <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white" id="imports-title" data-astro-cid-64fplk6r>', '</h1> <p class="text-sm md:text-base text-gray-600 dark:text-gray-300" id="imports-subtitle" data-astro-cid-64fplk6r>', '</p> </div> <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700" data-astro-cid-64fplk6r> <!-- Importaci\xF3n de Animales --> <div class="import-container" data-astro-cid-64fplk6r> <h2 class="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white" id="import-animals-title" data-astro-cid-64fplk6r>', '</h2> <p class="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4" id="import-animals-desc" data-astro-cid-64fplk6r>', '</p> <!-- Botones de acci\xF3n para importaci\xF3n - Reorganizados seg\xFAn la imagen --> <div class="flex flex-wrap justify-between mb-6" data-astro-cid-64fplk6r> <!-- Grupo de botones izquierda --> <div class="flex flex-wrap gap-3 mb-3 sm:mb-0" data-astro-cid-64fplk6r> <a href="/templates/plantilla_animales.csv" download class="import-btn download-btn" data-astro-cid-64fplk6r> <span class="icon" data-astro-cid-64fplk6r>\u{1F4E5}</span> <span class="text" id="download-template" data-astro-cid-64fplk6r>', '</span> </a> <button id="reset-import" class="import-btn reset-btn" data-astro-cid-64fplk6r> <span class="icon" data-astro-cid-64fplk6r>\u{1F504}</span> <span class="text" id="reset-text" data-astro-cid-64fplk6r>', '</span> </button> </div> <!-- Grupo de botones derecha --> <div class="flex flex-wrap gap-3" data-astro-cid-64fplk6r> <button id="import-btn" class="import-btn import-action-btn" data-astro-cid-64fplk6r> <span class="icon" data-astro-cid-64fplk6r>\u2705</span> <span class="text" id="import-text" data-astro-cid-64fplk6r>', "</span> </button> </div> </div> <!-- Componente React para la importaci\xF3n y el historial --> ", ' </div> </div>  <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700" data-astro-cid-64fplk6r> <h2 class="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white" data-astro-cid-64fplk6r>Opciones Avanzadas (Administrador)</h2> <p class="text-sm md:text-base text-red-600 dark:text-red-400 mb-4" data-astro-cid-64fplk6r>\n\u26A0\uFE0F Advertencia: Estas operaciones son irreversibles y solo deben ser usadas por administradores.\n</p> ', " </div>  "])), maybeRenderHead(), translations[currentLang].title, translations[currentLang].subtitle, translations[currentLang].importAnimals, translations[currentLang].selectFile, translations[currentLang].downloadTemplate, translations[currentLang].reset, translations[currentLang].import, renderComponent($$result2, "ImportContainer", ImportContainer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/imports/ImportContainer", "client:component-export": "default", "data-astro-cid-64fplk6r": true }), renderComponent($$result2, "ResetDatabaseButton", ResetDatabaseButton, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/admin/ResetDatabaseButton", "client:component-export": "default", "data-astro-cid-64fplk6r": true })) })}  `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/imports/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/imports/index.astro";
const $$url = "/imports";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
