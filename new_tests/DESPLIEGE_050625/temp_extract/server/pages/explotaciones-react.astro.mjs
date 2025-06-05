import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/vendor_Cou4nW0F.mjs';
export { e as renderers } from '../chunks/vendor_Cou4nW0F.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_BVudR5Na.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as apiService } from '../chunks/apiService_CMRujBeB.mjs';
import '../chunks/Footer_CznfbLiE.mjs';
/* empty css                                 */

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
    } else ;
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
      return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center h-[200px]", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: currentLang === "ca" ? "No hi ha animals per mostrar en aquesta categoria" : "No hay animales que mostrar en esta categoría" }) });
    }
    return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm text-left border-collapse", children: [
      /* @__PURE__ */ jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Codi" : "Código" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Nom" : "Nombre" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Gènere" : "Género" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Estat" : "Estado" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Data Naixement" : "Fecha Nacimiento" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Alletant" : "Amamantando" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: currentLang === "ca" ? "Accions" : "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: filteredAnimals.map((animal) => /* @__PURE__ */ jsxs("tr", { className: "border-b dark:border-gray-700", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: animal.cod || "-" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2 font-medium", children: animal.nom }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: animal.genere === "M" ? currentLang === "ca" ? "Toro" : "Toro" : currentLang === "ca" ? "Vaca" : "Vaca" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-full text-xs ${animal.estado === "OK" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`, children: animal.estado === "OK" ? currentLang === "ca" ? "Actiu" : "Activo" : currentLang === "ca" ? "Mort" : "Fallecido" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: animal.dob || (currentLang === "ca" ? "No disponible" : "No disponible") }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: animal.genere === "F" ? animal.alletar === "1" ? currentLang === "ca" ? "1 vedell" : "1 ternero" : animal.alletar === "2" ? currentLang === "ca" ? "2 vedells" : "2 terneros" : currentLang === "ca" ? "Sense alletar" : "No amamantando" : "N/A" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/animals/${animal.id}`,
              className: "inline-flex items-center px-2 py-1 bg-primary text-white rounded hover:bg-primary/80",
              children: [
                /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" }),
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                ] }),
                currentLang === "ca" ? "Veure" : "Ver"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/animals/update/${animal.id}`,
              className: "inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700",
              children: [
                /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }),
                currentLang === "ca" ? "Actualitzar" : "Actualizar"
              ]
            }
          )
        ] }) })
      ] }, animal.id)) })
    ] }) });
  };
  const exportToPDF = async () => {
    if (!filteredAnimals || !filteredAnimals.length) return;
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const autoTableModule = await import('jspdf-autotable');
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
  return /* @__PURE__ */ jsxs("div", { className: "w-full py-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 sm:mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3", children: currentLang === "ca" ? "Cerca i Filtres" : "Búsqueda y Filtros" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4", children: currentLang === "ca" ? "Utilitza els filtres per trobar explotacions específiques. Pots cercar per codi d'explotació." : "Utiliza los filtros para encontrar explotaciones específicas. Puedes buscar por código de explotación." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: currentLang === "ca" ? "Cercar" : "Buscar" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "search-explotacion",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                placeholder: currentLang === "ca" ? "Cercar per codi d'explotació..." : "Buscar por código de explotación...",
                className: "w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-500 dark:text-gray-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSearch,
              className: "btn btn-primary",
              children: currentLang === "ca" ? "Cercar" : "Buscar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleClear,
              className: "btn btn-secondary",
              children: currentLang === "ca" ? "Netejar" : "Limpiar"
            }
          )
        ] })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-10", children: /* @__PURE__ */ jsx("div", { className: "spinner" }) }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4", children: /* @__PURE__ */ jsx("p", { children: error }) }),
    !loading && !error && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          id: "explotacionCards",
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6",
          style: { display: currentExplotacion ? "none" : "grid" },
          children: displayExplotaciones.map((exp) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "explotacion-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-full border border-gray-100 mb-4",
              onClick: () => showExplotacionDetail(exp.explotacio),
              children: [
                /* @__PURE__ */ jsx("div", { className: "card-header bg-primary text-white p-3", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-center", children: exp.explotacio }) }),
                /* @__PURE__ */ jsxs("div", { className: "card-body p-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 mb-4 pb-3 border-b border-gray-100", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "stat-label font-bold text-gray-700 mb-2", children: currentLang === "ca" ? "Total Animals" : "Total Animales" }),
                      /* @__PURE__ */ jsx("div", { className: "stat-value total font-bold text-2xl text-primary-dark", children: (exp.toros || 0) + (exp.vacas || 0) + (exp.terneros || 0) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "stat-label font-bold text-gray-700 mb-2", children: currentLang === "ca" ? "Animals Actius" : "Animales Activos" }),
                      /* @__PURE__ */ jsx("div", { className: "stat-value total font-bold text-2xl text-green-600", children: ((exp.toros_activos !== void 0 ? exp.toros_activos : exp.toros) || 0) + ((exp.vacas_activas !== void 0 ? exp.vacas_activas : exp.vacas) || 0) + (exp.terneros || 0) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "animal-stats grid grid-cols-3 gap-1 text-center mb-3", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Toros Actius" : "Toros Activos" }),
                      /* @__PURE__ */ jsx("div", { className: "stat-value toros font-bold text-primary", children: exp.toros_activos !== void 0 ? exp.toros_activos : exp.toros || 0 })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Vaques Actives" : "Vacas Activas" }),
                      /* @__PURE__ */ jsx("div", { className: "stat-value vacas font-bold text-pink-500", children: exp.vacas_activas !== void 0 ? exp.vacas_activas : exp.vacas || 0 })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Vedells" : "Terneros" }),
                      /* @__PURE__ */ jsx("div", { className: "stat-value terneros font-bold text-orange-500", children: exp.terneros || 0 })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "card-footer grid grid-cols-3 gap-1 text-center pt-2 border-t border-gray-100", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "stat-label font-medium", children: currentLang === "ca" ? "Alletant" : "Amamantando" }),
                      /* @__PURE__ */ jsx("div", { className: "font-bold text-blue-600", children: exp.amamantando || 0 })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-2 text-center flex flex-col justify-center items-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "stat-label font-medium", children: " " }),
                      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
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
                        }
                      ) })
                    ] })
                  ] })
                ] })
              ]
            },
            exp.explotacio
          ))
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          id: "explotacion-detail",
          className: "hidden mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4",
          style: { display: currentExplotacion ? "block" : "none" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 text-lg font-medium", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-gray-900 dark:text-white", children: [
                currentLang === "ca" ? "Animals de" : "Animales de",
                " ",
                /* @__PURE__ */ jsx("span", { id: "explotacion-code", children: currentExplotacion })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    id: "export-csv",
                    className: "btn btn-primary text-sm flex items-center",
                    onClick: exportToPDF,
                    children: [
                      /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
                      currentLang === "ca" ? "Exportar PDF" : "Exportar PDF"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    id: "back-button",
                    className: "btn btn-secondary text-sm flex items-center",
                    onClick: handleBack,
                    children: [
                      /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 17l-5-5m0 0l5-5m-5 5h12" }) }),
                      currentLang === "ca" ? "Tornar" : "Volver"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("ul", { className: "flex flex-wrap -mb-px text-sm font-medium text-center", children: [
              /* @__PURE__ */ jsx("li", { className: "mr-2", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "todos" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "todos",
                  onClick: () => filterAnimalsByCategory("todos"),
                  children: [
                    currentLang === "ca" ? "Tots els animals" : "Todos los animales",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: allAnimals.length })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx("li", { className: "mr-2", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "toros" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "toros",
                  onClick: () => filterAnimalsByCategory("toros"),
                  children: [
                    currentLang === "ca" ? "Toros" : "Toros",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: stats.toros })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx("li", { className: "mr-2", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "vacas-amam" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "vacas-amam",
                  onClick: () => filterAnimalsByCategory("vacas-amam"),
                  children: [
                    currentLang === "ca" ? "Vaques alletant" : "Vacas amamantando",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: allAnimals.filter((a) => a.genere === "F" && ["1", 1, "2", 2].includes(a.alletar)).length })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx("li", { className: "mr-2", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  className: `animal-tab inline-block p-2 border-b-2 ${activeCategory === "vacas-no-amam" ? "border-primary text-primary dark:text-primary-light" : "border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light"}`,
                  "data-category": "vacas-no-amam",
                  onClick: () => filterAnimalsByCategory("vacas-no-amam"),
                  children: [
                    currentLang === "ca" ? "Vaques sense alletar" : "Vacas no amamantando",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs", children: allAnimals.filter((a) => a.genere === "F" && (["0", 0].includes(a.alletar) || a.alletar === null)).length })
                  ]
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4", children: renderAnimalTable() })
          ]
        }
      )
    ] })
  ] });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Explotaciones (React)" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ExplotacionesPage", ExplotacionesPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Proyectos/claude/masclet-imperi-web/frontend/src/components/explotaciones-react/ExplotacionesPage", "client:component-export": "default" })} ` })} `;
}, "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/explotaciones-react/index.astro", void 0);

const $$file = "C:/Proyectos/claude/masclet-imperi-web/frontend/src/pages/explotaciones-react/index.astro";
const $$url = "/explotaciones-react";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
