import { a as apiService } from './apiService_BTDQ39hA.mjs';
import './api_DdghznrZ.mjs';

const mockAnimals = [
  {
    id: 1,
    nom: "Lucero",
    explotacio: "1",
    genere: "M",
    estado: "OK",
    alletar: "0",
    pare: null,
    mare: null,
    quadra: "Q1",
    cod: "A001",
    num_serie: "SN001",
    dob: "2020-05-15",
    created_at: "2023-01-10T10:00:00Z",
    updated_at: "2023-01-10T10:00:00Z"
  },
  {
    id: 2,
    nom: "Estrella",
    explotacio: "1",
    genere: "F",
    estado: "OK",
    alletar: "1",
    pare: "Lucero",
    mare: null,
    quadra: "Q2",
    cod: "A002",
    num_serie: "SN002",
    dob: "2019-08-20",
    created_at: "2023-01-10T10:00:00Z",
    updated_at: "2023-01-10T10:00:00Z"
  },
  {
    id: 3,
    nom: "Luna",
    explotacio: "2",
    genere: "F",
    estado: "OK",
    alletar: "2",
    pare: null,
    mare: null,
    quadra: "Q1",
    cod: "A003",
    num_serie: "SN003",
    dob: "2021-02-10",
    created_at: "2023-01-10T10:00:00Z",
    updated_at: "2023-01-10T10:00:00Z"
  },
  {
    id: 4,
    nom: "Tornado",
    explotacio: "2",
    genere: "M",
    estado: "DEF",
    alletar: "0",
    pare: "Lucero",
    mare: "Estrella",
    quadra: "Q3",
    cod: "A004",
    num_serie: "SN004",
    dob: "2020-11-05",
    created_at: "2023-01-10T10:00:00Z",
    updated_at: "2023-01-10T10:00:00Z"
  },
  {
    id: 5,
    nom: "Trueno",
    explotacio: "EXP001",
    genere: "M",
    estado: "OK",
    alletar: "0",
    pare: null,
    mare: null,
    quadra: "Q1",
    cod: "A005",
    num_serie: "SN005",
    dob: "2022-03-18",
    created_at: "2023-01-10T10:00:00Z",
    updated_at: "2023-01-10T10:00:00Z"
  }
];
const mockExplotacions = [
  {
    id: 1,
    explotacio: "EXP001",
    animal_count: 25,
    created_at: "2022-10-01T09:00:00Z",
    updated_at: "2023-01-05T14:30:00Z"
  },
  {
    id: 2,
    explotacio: "EXP002",
    animal_count: 20,
    created_at: "2022-11-01T10:00:00Z",
    updated_at: "2023-01-10T10:00:00Z"
  },
  {
    id: 3,
    explotacio: "EXP003",
    animal_count: 15,
    created_at: "2022-12-01T11:00:00Z",
    updated_at: "2023-01-15T11:00:00Z"
  },
  {
    id: 4,
    explotacio: "EXP004",
    animal_count: 10,
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-20T12:00:00Z"
  },
  {
    id: 5,
    explotacio: "EXP005",
    animal_count: 5,
    created_at: "2023-01-05T13:00:00Z",
    updated_at: "2023-01-25T13:00:00Z"
  }
];
const mockParts = [
  {
    id: 1,
    animal_id: 2,
    animal_nom: "Estrella",
    data: "2022-04-10",
    num_cries: 1,
    notes: "",
    created_at: "2022-04-10T10:00:00Z",
    updated_at: "2022-04-10T10:00:00Z"
  },
  {
    id: 2,
    animal_id: 3,
    animal_nom: "Luna",
    data: "2022-06-15",
    num_cries: 1,
    notes: "",
    created_at: "2022-06-15T10:00:00Z",
    updated_at: "2022-06-15T10:00:00Z"
  },
  {
    id: 3,
    animal_id: 3,
    animal_nom: "Luna",
    data: "2023-07-20",
    num_cries: 2,
    notes: "",
    created_at: "2023-07-20T10:00:00Z",
    updated_at: "2023-07-20T10:00:00Z"
  }
];
({
  maleAnimals: mockAnimals.filter((a) => a.genere === "M").length,
  femaleAnimals: mockAnimals.filter((a) => a.genere === "F").length,
  okAnimals: mockAnimals.filter((a) => a.estado === "OK").length,
  defAnimals: mockAnimals.filter((a) => a.estado === "DEF").length,
  allettingAnimals: mockAnimals.filter((a) => a.alletar !== "0").length,
  explotacionsCount: mockExplotacions.length,
  recentParts: mockParts.slice(0, 3).map((p) => ({
    id: p.id,
    animal_id: p.animal_id,
    animal_nom: p.animal_nom,
    data: p.data,
    num_cries: p.num_cries
  }))
});
({
  total: mockExplotacions.length});

const getFilteredAnimals = (filters) => {
  let filteredAnimals = [...mockAnimals];
  if (filters.explotacio !== void 0) {
    filteredAnimals = filteredAnimals.filter((a) => a.explotacio === filters.explotacio);
  }
  if (filters.genere !== void 0) {
    filteredAnimals = filteredAnimals.filter((a) => a.genere === filters.genere);
  }
  if (filters.estado !== void 0) {
    filteredAnimals = filteredAnimals.filter((a) => a.estado === filters.estado);
  }
  if (filters.alletar !== void 0) {
    filteredAnimals = filteredAnimals.filter((a) => a.alletar === filters.alletar);
  }
  if (filters.quadra !== void 0) {
    filteredAnimals = filteredAnimals.filter((a) => a.quadra === filters.quadra);
  }
  if (filters.search !== void 0 && filters.search !== "") {
    const searchLower = filters.search.toLowerCase().trim();
    console.log(`Filtrando por término de búsqueda: "${searchLower}"`);
    let matchingAnimals = filteredAnimals.filter((a) => {
      const matchesNom = a.nom.toLowerCase().includes(searchLower);
      const matchesCod = a.cod && a.cod.toLowerCase().includes(searchLower);
      const matchesNumSerie = a.num_serie && a.num_serie.toLowerCase().includes(searchLower);
      const matchesExplotacio = a.explotacio.toLowerCase().includes(searchLower);
      const matchesPare = a.pare && a.pare.toLowerCase().includes(searchLower);
      const matchesMare = a.mare && a.mare.toLowerCase().includes(searchLower);
      return matchesNom || matchesCod || matchesNumSerie || matchesExplotacio || matchesPare || matchesMare;
    });
    const animalScores = matchingAnimals.map((animal) => {
      let score = 0;
      if (animal.nom.toLowerCase() === searchLower) {
        score += 1e3;
      } else if (animal.nom.toLowerCase().startsWith(searchLower)) {
        score += 800;
      } else if (animal.nom.toLowerCase().includes(searchLower)) {
        score += 500;
      }
      if (animal.cod && animal.cod.toLowerCase().includes(searchLower)) {
        score += 300;
      }
      if (animal.num_serie && animal.num_serie.toLowerCase().includes(searchLower)) {
        score += 300;
      }
      if (animal.pare && animal.pare.toLowerCase().includes(searchLower)) {
        score += 100;
      }
      if (animal.mare && animal.mare.toLowerCase().includes(searchLower)) {
        score += 100;
      }
      if (animal.explotacio && animal.explotacio.toLowerCase().includes(searchLower)) {
        score += 50;
      }
      return { animal, score };
    });
    animalScores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return new Date(b.animal.updated_at).getTime() - new Date(a.animal.updated_at).getTime();
    });
    matchingAnimals = animalScores.map((item) => item.animal);
    console.log("Animales ordenados por relevancia:", animalScores.map((item) => `${item.animal.nom} (${item.score})`));
    const uniqueAnimals = [];
    const processedKeys = /* @__PURE__ */ new Set();
    matchingAnimals.forEach((animal) => {
      const baseCode = animal.cod ? animal.cod.split("_")[0] : "";
      const uniqueKey = `${animal.nom.toLowerCase()}_${baseCode}`.trim();
      if (!processedKeys.has(uniqueKey)) {
        processedKeys.add(uniqueKey);
        uniqueAnimals.push(animal);
      }
    });
    filteredAnimals = uniqueAnimals;
    console.log(`Se encontraron ${filteredAnimals.length} animales únicos que coinciden con la búsqueda`);
  }
  return filteredAnimals;
};
const animalService = {
  // Obtiene una lista paginada de animales con filtros opcionales
  async getAnimals(filters = {}) {
    try {
      const params = new URLSearchParams();
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      params.append("offset", offset.toString());
      params.append("limit", limit.toString());
      if (filters.explotacio) params.append("explotacio", filters.explotacio);
      if (filters.genere) params.append("genere", filters.genere);
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.alletar) params.append("alletar", filters.alletar);
      if (filters.quadra) params.append("quadra", filters.quadra);
      if (filters.search) {
        params.append("search", filters.search);
        console.log(`Buscando animales que coincidan con: "${filters.search}"`);
      }
      console.log("Obteniendo animales con parámetros:", Object.fromEntries(params.entries()));
      const responseData = await apiService.get(`/animals?${params.toString()}`);
      console.log("Respuesta RAW de animales recibida:", responseData);
      let processedResponse;
      if (responseData && responseData.status === "success" && responseData.data) {
        console.log("Detectada respuesta con formato {status, data}. Procesando correctamente...");
        const { total, offset: offset2, limit: limit2, items } = responseData.data;
        processedResponse = {
          items: items || [],
          total: total || 0,
          page: Math.floor(offset2 / limit2) + 1,
          // Calcular página en base a offset y limit
          limit: limit2 || 10,
          pages: Math.ceil((total || 0) / (limit2 || 10))
        };
      } else {
        console.log("Usando respuesta en formato directo");
        processedResponse = responseData;
      }
      console.log("Respuesta procesada de animales:", processedResponse);
      if (filters.search) {
        document.dispatchEvent(new CustomEvent("search-completed", {
          detail: {
            term: filters.search,
            count: processedResponse.items.length,
            total: processedResponse.total,
            usedMock: false
          }
        }));
      }
      return processedResponse;
    } catch (error) {
      console.error("Error en petición GET /animals:", error);
      let useMockReason = "";
      if (error.code === "DB_COLUMN_ERROR" || error.message && error.message.includes("estado_t")) {
        useMockReason = "error en la estructura de la tabla en el backend";
      } else if (error.code === "NETWORK_ERROR") {
        useMockReason = "error de conexión al servidor";
      } else {
        useMockReason = "error en el servidor";
      }
      console.warn(`Usando datos simulados debido a: ${useMockReason}`);
      const filteredAnimals = getFilteredAnimals(filters);
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);
      if (filters.search) {
        document.dispatchEvent(new CustomEvent("search-completed", {
          detail: {
            term: filters.search,
            count: paginatedAnimals.length,
            total: filteredAnimals.length,
            usedMock: true,
            reason: useMockReason
          }
        }));
      }
      return {
        items: paginatedAnimals,
        total: filteredAnimals.length,
        page,
        limit,
        pages: Math.ceil(filteredAnimals.length / limit)
      };
    }
  },
  // Obtiene un animal por su ID
  async getAnimalById(id) {
    try {
      console.log(`Intentando cargar animal con ID: ${id}`);
      const responseData = await apiService.get(`/animals/${id}`);
      console.log("Animal cargado:", responseData);
      let animalData;
      if (responseData && responseData.status === "success" && responseData.data) {
        animalData = responseData.data;
      } else if (responseData && responseData.id) {
        animalData = responseData;
      } else {
        throw new Error("Formato de respuesta inválido");
      }
      if (animalData) {
        if (!animalData.partos) {
          animalData.partos = [];
        } else if (!Array.isArray(animalData.partos)) {
          if (animalData.partos.items && Array.isArray(animalData.partos.items)) {
            animalData.partos = animalData.partos.items;
          } else {
            animalData.partos = [];
          }
        }
        if (!animalData.estado && animalData["estat"]) {
          animalData.estado = animalData["estat"];
        }
      }
      return animalData;
    } catch (error) {
      console.error(`Error al obtener animal con ID ${id}:`, error);
      if (error.code === "DB_COLUMN_ERROR" || error.code === "NETWORK_ERROR" || error.message && (error.message.includes("estado_t") || error.message.includes("conexión"))) {
        console.warn("Usando datos simulados debido a error en el backend");
        const animal = mockAnimals.find((a) => a.id === id);
        if (animal) {
          return animal;
        }
        throw new Error(`Animal con ID ${id} no encontrado en los datos simulados`);
      }
      throw error;
    }
  },
  // Crea un nuevo animal
  async createAnimal(animalData) {
    try {
      console.log("Creando nuevo animal:", animalData);
      const responseData = await apiService.post("/animals/", animalData);
      console.log("Animal creado:", responseData);
      return responseData;
    } catch (error) {
      console.error("Error al crear animal:", error);
      if (error.code === "DB_COLUMN_ERROR" || error.code === "NETWORK_ERROR" || error.message && (error.message.includes("estado_t") || error.message.includes("conexión"))) {
        console.warn("Usando datos simulados para crear animal debido a error en el backend");
        const newId = Math.max(...mockAnimals.map((a) => a.id)) + 1;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        return {
          id: newId,
          ...animalData,
          created_at: now,
          updated_at: now
        };
      }
      throw error;
    }
  },
  // Actualiza un animal existente usando PATCH (actualización parcial)
  async updateAnimal(id, animalData) {
    try {
      console.log(`[PATCH] Actualizando animal con ID ${id}:`, animalData);
      const datosNormalizados = {};
      const camposNulables = ["mare", "pare", "quadra", "cod", "num_serie", "dob"];
      for (const campo in animalData) {
        if (Object.prototype.hasOwnProperty.call(animalData, campo)) {
          if (camposNulables.includes(campo) && animalData[campo] === "") {
            datosNormalizados[campo] = null;
          } else if (campo === "alletar" && animalData[campo] !== void 0) {
            datosNormalizados[campo] = String(animalData[campo]);
          } else if (campo === "dob" && animalData[campo]) {
            try {
              let fechaFinal;
              if (typeof animalData[campo] === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(animalData[campo])) {
                fechaFinal = animalData[campo];
              } else if (typeof animalData[campo] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(animalData[campo])) {
                const [year, month, day] = animalData[campo].split("-");
                fechaFinal = `${day}/${month}/${year}`;
              } else {
                const fecha = new Date(animalData[campo]);
                if (!isNaN(fecha.getTime())) {
                  const day = fecha.getDate().toString().padStart(2, "0");
                  const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
                  const year = fecha.getFullYear();
                  fechaFinal = `${day}/${month}/${year}`;
                } else {
                  fechaFinal = animalData[campo];
                }
              }
              console.log(`Fecha convertida: ${animalData[campo]} -> ${fechaFinal}`);
              datosNormalizados[campo] = fechaFinal;
            } catch (err) {
              console.error("Error al formatear fecha:", err);
              datosNormalizados[campo] = animalData[campo];
            }
          } else {
            datosNormalizados[campo] = animalData[campo];
          }
        }
      }
      const camposAActualizar = Object.keys(datosNormalizados);
      if (camposAActualizar.length === 0) {
        throw new Error("No se detectaron cambios para actualizar");
      }
      console.log(`[PATCH] Campos a actualizar: ${camposAActualizar.join(", ")}`);
      console.log("[PATCH] Datos finales:", datosNormalizados);
      console.log(`[PATCH] Enviando petición a /animals/${id}`);
      console.log("Datos normalizados:", JSON.stringify(datosNormalizados, null, 2));
      console.log("Iniciando patch...");
      const responseData = await apiService.patch(`/animals/${id}`, datosNormalizados);
      console.log("PATCH completado con éxito");
      return responseData.data || responseData;
    } catch (error) {
      console.error(`[PATCH] Error al actualizar animal con ID ${id}:`, error);
      throw error;
    }
  },
  // Elimina un animal (marcado como DEF)
  async deleteAnimal(id) {
    try {
      console.log(`Intentando eliminar animal con ID ${id}`);
      const response = await apiService.delete(`/api/v1/animals/${id}`);
      console.log(`Respuesta al eliminar animal con ID ${id}:`, response);
      return response;
    } catch (error) {
      console.error(`Error al eliminar animal con ID ${id}:`, error);
      if (error.code === "DB_COLUMN_ERROR" || error.code === "NETWORK_ERROR" || error.message && (error.message.includes("estado_t") || error.message.includes("conexión"))) {
        console.warn("Usando datos simulados para eliminar animal debido a error en el backend");
        return this.updateAnimal(id, { estado: "DEF" });
      }
      throw error;
    }
  },
  // Obtiene los posibles padres (machos) para selección en formularios
  async getPotentialFathers(explotacioId) {
    try {
      console.log(`Obteniendo posibles padres${explotacioId ? ` para explotación ${explotacioId}` : ""}`);
      const filters = {
        genere: "M",
        estado: "OK"
      };
      if (explotacioId && explotacioId !== "undefined") {
        filters.explotacio = String(explotacioId);
      }
      const response = await this.getAnimals(filters);
      const fathers = Array.isArray(response) ? response : response.items || [];
      console.log("Posibles padres recibidos:", fathers);
      return fathers;
    } catch (error) {
      console.error(`Error al obtener posibles padres${explotacioId ? ` para explotación ${explotacioId}` : ""}:`, error);
      console.warn("Usando datos simulados para posibles padres debido a error en el backend");
      const filteredFathers = mockAnimals.filter((a) => a.genere === "M" && a.estado === "OK" && (!explotacioId || explotacioId === "undefined" || a.explotacio === String(explotacioId)));
      return filteredFathers;
    }
  },
  // Obtiene las posibles madres (hembras) para selección en formularios
  async getPotentialMothers(explotacioId) {
    try {
      console.log(`Obteniendo posibles madres${explotacioId ? ` para explotación ${explotacioId}` : ""}`);
      const filters = {
        genere: "F",
        estado: "OK"
      };
      if (explotacioId && explotacioId !== "undefined") {
        filters.explotacio = String(explotacioId);
      }
      const response = await this.getAnimals(filters);
      const mothers = Array.isArray(response) ? response : response.items || [];
      console.log("Posibles madres recibidas:", mothers);
      return mothers;
    } catch (error) {
      console.error(`Error al obtener posibles madres${explotacioId ? ` para explotación ${explotacioId}` : ""}:`, error);
      console.warn("Usando datos simulados para posibles madres debido a error en el backend");
      const filteredMothers = mockAnimals.filter((a) => a.genere === "F" && a.estado === "OK" && (!explotacioId || explotacioId === "undefined" || a.explotacio === String(explotacioId)));
      return filteredMothers;
    }
  },
  // Obtiene todos los animales de una explotación
  async getAnimalsByExplotacion(explotacionId) {
    try {
      try {
        console.log(`🐄 [Animal] Solicitando animales para explotación ${explotacionId}`);
        const endpoints = [
          `/animals?explotacio=${encodeURIComponent(explotacionId)}&limit=100`
        ];
        let response = null;
        let successEndpoint = "";
        for (const endpoint of endpoints) {
          try {
            console.log(`🐄 [Animal] Intentando endpoint: ${endpoint}`);
            response = await apiService.get(endpoint);
            successEndpoint = endpoint;
            console.log(`🐄 [Animal] Respuesta recibida de ${endpoint}:`, response);
            break;
          } catch (endpointError) {
            console.warn(`🐄 [Animal] Error con endpoint ${endpoint}:`, endpointError);
          }
        }
        if (!response) {
          throw new Error("Todos los endpoints fallaron");
        }
        console.log(`🐄 [Animal] Endpoint exitoso: ${successEndpoint}`);
        if (Array.isArray(response)) {
          console.log(`🐄 [Animal] Devolviendo array de ${response.length} animales`);
          return response;
        }
        if (response && typeof response === "object" && "items" in response) {
          console.log(`🐄 [Animal] Devolviendo ${response.items.length} animales desde respuesta paginada`);
          return response.items;
        }
        if (response && typeof response === "object" && "data" in response) {
          if (Array.isArray(response.data)) {
            console.log(`🐄 [Animal] Devolviendo ${response.data.length} animales desde response.data`);
            return response.data;
          }
        }
        console.warn(`🐄 [Animal] No se pudo interpretar la respuesta:`, response);
        return [];
      } catch (innerError) {
        console.error(`🐄 [Animal] Error al obtener animales para explotación ${explotacionId}:`, innerError);
        throw innerError;
      }
    } catch (error) {
      console.error(`🐄 [Animal] Error en petición para obtener animales de explotación ${explotacionId}:`, error);
      console.warn(`🐄 [Animal] Usando datos simulados para animales de explotación ${explotacionId}`);
      const mockAnimalsFiltered = mockAnimals.filter((a) => a.explotacio === String(explotacionId));
      console.log(`🐄 [Animal] Devolviendo ${mockAnimalsFiltered.length} animales simulados para explotación ${explotacionId}`);
      return mockAnimalsFiltered;
    }
  },
  // Utilidades para iconos y visualización
  getAnimalIcon(animal) {
    if (animal.genere === "M") {
      return "🐂";
    } else {
      if (animal.alletar !== "0") {
        return "🐄";
      } else {
        return "🐮";
      }
    }
  },
  getAnimalStatusClass(estado) {
    if (estado === "OK") {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    } else if (estado === "DEF") {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  },
  // Obtiene texto para alletar
  getAlletarText(alletar) {
    if (alletar === "0") return "No amamantando";
    if (alletar === "1") return "Amamantando 1 ternero";
    if (alletar === "2") return "Amamantando 2 terneros";
    return "Desconocido";
  },
  // Método simplificado para obtener valores únicos de explotaciones
  async getExplotacions() {
    try {
      console.log("Obteniendo lista de explotaciones");
      try {
        const responseData = await apiService.get("/dashboard/explotacions");
        if (responseData && responseData.status === "success" && responseData.data && Array.isArray(responseData.data.items)) {
          const items = responseData.data.items;
          return items.map((item, index) => ({
            id: index + 1,
            // Usamos un ID secuencial ya que no hay un ID real en la respuesta
            explotacio: item.explotacio || ""
          }));
        }
      } catch (explotacioError) {
        console.warn("No se pudo obtener explotaciones del dashboard, intentando alternativa", explotacioError);
      }
      const response = await this.getAnimals({ page: 1, limit: 100 });
      const uniqueExplotacions = /* @__PURE__ */ new Set();
      if (response && response.items) {
        response.items.forEach((animal) => {
          if (animal.explotacio) {
            uniqueExplotacions.add(animal.explotacio);
          }
        });
      }
      if (uniqueExplotacions.size === 0) {
        return [
          { id: 1, explotacio: "Madrid" },
          { id: 2, explotacio: "Barcelona" },
          { id: 3, explotacio: "Valencia" },
          { id: 4, explotacio: "Guadalajara" }
        ];
      }
      return Array.from(uniqueExplotacions).map((explotacio, index) => ({
        id: index + 1,
        explotacio
      }));
    } catch (error) {
      console.error("Error al obtener explotaciones:", error);
      console.log("Usando datos simulados");
      return mockExplotacions;
    }
  }
};

export { animalService as a };
