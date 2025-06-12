import apiService from "/src/services/apiService.ts";
import { mockAnimals, mockExplotacions } from "/src/services/mockData.ts";
import api from "/src/services/api.ts";
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
export const getAnimalStatusClass = (estado) => {
  return estado === "OK" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
};
export const getAnimalIcon = (animal) => {
  if (animal.genere === "M") {
    return "🐂";
  } else {
    if (animal.alletar !== "0") {
      return "🐄";
    } else {
      return "🐮";
    }
  }
};
export const getAlletarText = (alletar) => {
  if (alletar === "0") return "No amamantando";
  if (alletar === "1") return "Amamantando 1 ternero";
  if (alletar === "2") return "Amamantando 2 terneros";
  return "Desconocido";
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
export default animalService;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hbFNlcnZpY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFwaVNlcnZpY2UgZnJvbSAnLi9hcGlTZXJ2aWNlJztcbmltcG9ydCB7IG1vY2tBbmltYWxzLCBtb2NrRXhwbG90YWNpb25zIH0gZnJvbSAnLi9tb2NrRGF0YSc7XG5pbXBvcnQgYXBpIGZyb20gJy4vYXBpJztcblxuLy8gSW50ZXJmYWNlc1xuZXhwb3J0IGludGVyZmFjZSBQYXJ0byB7XG4gIGlkPzogbnVtYmVyO1xuICBhbmltYWxfaWQ/OiBudW1iZXI7XG4gIGFuaW1hbF9ub20/OiBzdHJpbmc7XG4gIHBhcnQ/OiBzdHJpbmcgfCBudWxsOyAgLy8gRmVjaGEgZGVsIHBhcnRvIChERC9NTS9ZWVlZKVxuICBHZW5lcmVUPzogJ00nIHwgJ0YnIHwgJ2VzZm9ycmFkYScgfCBudWxsO1xuICBFc3RhZG9UPzogJ09LJyB8ICdERUYnIHwgbnVsbDtcbiAgY3JlYXRlZF9hdD86IHN0cmluZztcbiAgdXBkYXRlZF9hdD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltYWwge1xuICBpZDogbnVtYmVyO1xuICBleHBsb3RhY2lvOiBzdHJpbmc7XG4gIG5vbTogc3RyaW5nO1xuICBnZW5lcmU6ICdNJyB8ICdGJztcbiAgZXN0YWRvOiAnT0snIHwgJ0RFRic7XG4gIGFsbGV0YXI6ICcwJyB8ICcxJyB8ICcyJzsgIC8vIDA6IE5vIGFtYW1hbnRhLCAxOiBVbiB0ZXJuZXJvLCAyOiBEb3MgdGVybmVyb3MgKHNvbG8gcGFyYSB2YWNhcylcbiAgcGFyZT86IHN0cmluZyB8IG51bGw7XG4gIG1hcmU/OiBzdHJpbmcgfCBudWxsO1xuICBxdWFkcmE/OiBzdHJpbmcgfCBudWxsO1xuICBjb2Q/OiBzdHJpbmcgfCBudWxsO1xuICBudW1fc2VyaWU/OiBzdHJpbmcgfCBudWxsO1xuICBkb2I/OiBzdHJpbmcgfCBudWxsO1xuICBjcmVhdGVkX2F0OiBzdHJpbmc7XG4gIHVwZGF0ZWRfYXQ6IHN0cmluZztcbiAgcGFydG9zPzogUGFydG9bXSB8IHsgaXRlbXM6IFBhcnRvW10gfTtcbiAgcGFydHM/OiBQYXJ0b1tdOyAgLy8gU29wb3J0ZSBwYXJhIG5vbWJyZSBhbnRlcmlvciAocmV0cm9jb21wYXRpYmlsaWRhZClcbiAgZXN0YXQ/OiAnT0snIHwgJ0RFRic7ICAvLyBTb3BvcnRlIHBhcmEgbm9tYnJlIGFudGVyaW9yIChyZXRyb2NvbXBhdGliaWxpZGFkKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hbENyZWF0ZUR0byB7XG4gIGV4cGxvdGFjaW86IHN0cmluZztcbiAgbm9tOiBzdHJpbmc7XG4gIGdlbmVyZTogJ00nIHwgJ0YnO1xuICBlc3RhZG86ICdPSycgfCAnREVGJztcbiAgYWxsZXRhcjogJzAnIHwgJzEnIHwgJzInO1xuICBwYXJlPzogc3RyaW5nIHwgbnVsbDtcbiAgbWFyZT86IHN0cmluZyB8IG51bGw7XG4gIHF1YWRyYT86IHN0cmluZyB8IG51bGw7XG4gIGNvZD86IHN0cmluZyB8IG51bGw7XG4gIG51bV9zZXJpZT86IHN0cmluZyB8IG51bGw7XG4gIGRvYj86IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWFsVXBkYXRlRHRvIGV4dGVuZHMgUGFydGlhbDxBbmltYWxDcmVhdGVEdG8+IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWFsRmlsdGVycyB7XG4gIGV4cGxvdGFjaW8/OiBzdHJpbmc7XG4gIGdlbmVyZT86ICdNJyB8ICdGJztcbiAgZXN0YWRvPzogJ09LJyB8ICdERUYnO1xuICBhbGxldGFyPzogJzAnIHwgJzEnIHwgJzInO1xuICBxdWFkcmE/OiBzdHJpbmc7XG4gIHNlYXJjaD86IHN0cmluZztcbiAgcGFnZT86IG51bWJlcjtcbiAgbGltaXQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFnaW5hdGVkUmVzcG9uc2U8VD4ge1xuICBpdGVtczogVFtdO1xuICB0b3RhbDogbnVtYmVyO1xuICBwYWdlOiBudW1iZXI7XG4gIGxpbWl0OiBudW1iZXI7XG4gIHBhZ2VzOiBudW1iZXI7XG59XG5cbi8vIEZ1bmNpw7NuIHBhcmEgZmlsdHJhciBhbmltYWxlcyAodXNhZG8gcGFyYSBtb2NrKVxuY29uc3QgZ2V0RmlsdGVyZWRBbmltYWxzID0gKGZpbHRlcnM6IEFuaW1hbEZpbHRlcnMpOiBBbmltYWxbXSA9PiB7XG4gIGxldCBmaWx0ZXJlZEFuaW1hbHMgPSBbLi4ubW9ja0FuaW1hbHNdO1xuICBcbiAgLy8gQXBsaWNhciBmaWx0cm9zXG4gIGlmIChmaWx0ZXJzLmV4cGxvdGFjaW8gIT09IHVuZGVmaW5lZCkge1xuICAgIGZpbHRlcmVkQW5pbWFscyA9IGZpbHRlcmVkQW5pbWFscy5maWx0ZXIoYSA9PiBhLmV4cGxvdGFjaW8gPT09IGZpbHRlcnMuZXhwbG90YWNpbyk7XG4gIH1cbiAgXG4gIGlmIChmaWx0ZXJzLmdlbmVyZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZmlsdGVyZWRBbmltYWxzID0gZmlsdGVyZWRBbmltYWxzLmZpbHRlcihhID0+IGEuZ2VuZXJlID09PSBmaWx0ZXJzLmdlbmVyZSk7XG4gIH1cbiAgXG4gIGlmIChmaWx0ZXJzLmVzdGFkbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZmlsdGVyZWRBbmltYWxzID0gZmlsdGVyZWRBbmltYWxzLmZpbHRlcihhID0+IGEuZXN0YWRvID09PSBmaWx0ZXJzLmVzdGFkbyk7XG4gIH1cbiAgXG4gIGlmIChmaWx0ZXJzLmFsbGV0YXIgIT09IHVuZGVmaW5lZCkge1xuICAgIGZpbHRlcmVkQW5pbWFscyA9IGZpbHRlcmVkQW5pbWFscy5maWx0ZXIoYSA9PiBhLmFsbGV0YXIgPT09IGZpbHRlcnMuYWxsZXRhcik7XG4gIH1cbiAgXG4gIGlmIChmaWx0ZXJzLnF1YWRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZmlsdGVyZWRBbmltYWxzID0gZmlsdGVyZWRBbmltYWxzLmZpbHRlcihhID0+IGEucXVhZHJhID09PSBmaWx0ZXJzLnF1YWRyYSk7XG4gIH1cbiAgXG4gIGlmIChmaWx0ZXJzLnNlYXJjaCAhPT0gdW5kZWZpbmVkICYmIGZpbHRlcnMuc2VhcmNoICE9PSAnJykge1xuICAgIGNvbnN0IHNlYXJjaExvd2VyID0gZmlsdGVycy5zZWFyY2gudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgY29uc29sZS5sb2coYEZpbHRyYW5kbyBwb3IgdMOpcm1pbm8gZGUgYsO6c3F1ZWRhOiBcIiR7c2VhcmNoTG93ZXJ9XCJgKTtcbiAgICBcbiAgICAvLyBQcmltZXJvIG9idGVuZW1vcyB0b2RvcyBsb3MgYW5pbWFsZXMgcXVlIGNvaW5jaWRlbiBjb24gZWwgdMOpcm1pbm8gZGUgYsO6c3F1ZWRhXG4gICAgbGV0IG1hdGNoaW5nQW5pbWFscyA9IGZpbHRlcmVkQW5pbWFscy5maWx0ZXIoYSA9PiB7XG4gICAgICAvLyBCw7pzcXVlZGEgcG9yIG5vbSAocHJpbmNpcGFsKVxuICAgICAgY29uc3QgbWF0Y2hlc05vbSA9IGEubm9tLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpO1xuICAgICAgXG4gICAgICAvLyBCw7pzcXVlZGEgcG9yIGPDs2RpZ28gaWRlbnRpZmljYXRpdm9cbiAgICAgIGNvbnN0IG1hdGNoZXNDb2QgPSBhLmNvZCAmJiBhLmNvZC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKTtcbiAgICAgIFxuICAgICAgLy8gQsO6c3F1ZWRhIHBvciBuw7ptZXJvIGRlIHNlcmllXG4gICAgICBjb25zdCBtYXRjaGVzTnVtU2VyaWUgPSBhLm51bV9zZXJpZSAmJiBhLm51bV9zZXJpZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKTtcbiAgICAgIFxuICAgICAgLy8gQsO6c3F1ZWRhIHBvciBleHBsb3RhY2nDs24gXG4gICAgICBjb25zdCBtYXRjaGVzRXhwbG90YWNpbyA9IGEuZXhwbG90YWNpby50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKTtcbiAgICAgIFxuICAgICAgLy8gQsO6c3F1ZWRhIHBvciBwYWRyZSBvIG1hZHJlXG4gICAgICBjb25zdCBtYXRjaGVzUGFyZSA9IGEucGFyZSAmJiBhLnBhcmUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcik7XG4gICAgICBjb25zdCBtYXRjaGVzTWFyZSA9IGEubWFyZSAmJiBhLm1hcmUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcik7XG4gICAgICBcbiAgICAgIC8vIEFuaW1hbCBjb2luY2lkZSBzaSBjdWFscXVpZXJhIGRlIGxvcyBjYW1wb3MgY29pbmNpZGVcbiAgICAgIHJldHVybiBtYXRjaGVzTm9tIHx8IG1hdGNoZXNDb2QgfHwgbWF0Y2hlc051bVNlcmllIHx8IG1hdGNoZXNFeHBsb3RhY2lvIHx8IG1hdGNoZXNQYXJlIHx8IG1hdGNoZXNNYXJlO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFZhbW9zIGEgYXNpZ25hciB2YWxvcmVzIGRlIHByaW9yaWRhZCBhIGNhZGEgYW5pbWFsIGVuIGZ1bmNpw7NuIGRlIGTDs25kZSBjb2luY2lkZSBlbCB0w6lybWlub1xuICAgIGNvbnN0IGFuaW1hbFNjb3JlcyA9IG1hdGNoaW5nQW5pbWFscy5tYXAoYW5pbWFsID0+IHtcbiAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICBcbiAgICAgIC8vIFByaW9yaWRhZCBtw6F4aW1hOiBDb2luY2lkZW5jaWEgRVhBQ1RBIGVuIG5vbSAobWlzbW8gdGV4dG8pXG4gICAgICBpZiAoYW5pbWFsLm5vbS50b0xvd2VyQ2FzZSgpID09PSBzZWFyY2hMb3dlcikge1xuICAgICAgICBzY29yZSArPSAxMDAwO1xuICAgICAgfVxuICAgICAgLy8gUHJpb3JpZGFkIGFsdGE6IENvaW5jaWRlbmNpYSBhbCBJTklDSU8gZGVsIG5vbWJyZSAoZW1waWV6YSBwb3IpXG4gICAgICBlbHNlIGlmIChhbmltYWwubm9tLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChzZWFyY2hMb3dlcikpIHtcbiAgICAgICAgc2NvcmUgKz0gODAwO1xuICAgICAgfVxuICAgICAgLy8gUHJpb3JpZGFkIG1lZGlhLWFsdGE6IE5vbWJyZSBDT05USUVORSBlbCB0w6lybWlubyBkZSBiw7pzcXVlZGFcbiAgICAgIGVsc2UgaWYgKGFuaW1hbC5ub20udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpIHtcbiAgICAgICAgc2NvcmUgKz0gNTAwO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBQcmlvcmlkYWQgbWVkaWE6IENvaW5jaWRlbmNpYSBlbiBjw7NkaWdvIG8gbsO6bWVybyBkZSBzZXJpZSAoaWRlbnRpZmljYWRvcmVzKVxuICAgICAgaWYgKGFuaW1hbC5jb2QgJiYgYW5pbWFsLmNvZC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSkge1xuICAgICAgICBzY29yZSArPSAzMDA7XG4gICAgICB9XG4gICAgICBpZiAoYW5pbWFsLm51bV9zZXJpZSAmJiBhbmltYWwubnVtX3NlcmllLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpKSB7XG4gICAgICAgIHNjb3JlICs9IDMwMDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gUHJpb3JpZGFkIGJhamE6IENvaW5jaWRlbmNpYSBlbiBwYWRyZXMsIG1hZHJlLCBleHBsb3RhY2nDs24gKHJlbGFjaW9uZXMpXG4gICAgICBpZiAoYW5pbWFsLnBhcmUgJiYgYW5pbWFsLnBhcmUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpIHtcbiAgICAgICAgc2NvcmUgKz0gMTAwO1xuICAgICAgfVxuICAgICAgaWYgKGFuaW1hbC5tYXJlICYmIGFuaW1hbC5tYXJlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpKSB7XG4gICAgICAgIHNjb3JlICs9IDEwMDtcbiAgICAgIH1cbiAgICAgIGlmIChhbmltYWwuZXhwbG90YWNpbyAmJiBhbmltYWwuZXhwbG90YWNpby50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSkge1xuICAgICAgICBzY29yZSArPSA1MDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHsgYW5pbWFsLCBzY29yZSB9O1xuICAgIH0pO1xuICAgIFxuICAgIC8vIE9yZGVuYXIgcG9yIHB1bnR1YWNpw7NuIChtYXlvciBhIG1lbm9yKSB5IGx1ZWdvIHBvciBmZWNoYSBkZSBhY3R1YWxpemFjacOzblxuICAgIGFuaW1hbFNjb3Jlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAvLyBQcmltZXJvIHBvciBwdW50dWFjacOzblxuICAgICAgaWYgKGEuc2NvcmUgIT09IGIuc2NvcmUpIHtcbiAgICAgICAgcmV0dXJuIGIuc2NvcmUgLSBhLnNjb3JlO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBTaSB0aWVuZW4gbGEgbWlzbWEgcHVudHVhY2nDs24sIG9yZGVuYXIgcG9yIGZlY2hhIGRlIGFjdHVhbGl6YWNpw7NuIChtw6FzIHJlY2llbnRlIHByaW1lcm8pXG4gICAgICByZXR1cm4gbmV3IERhdGUoYi5hbmltYWwudXBkYXRlZF9hdCkuZ2V0VGltZSgpIC0gbmV3IERhdGUoYS5hbmltYWwudXBkYXRlZF9hdCkuZ2V0VGltZSgpO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIEV4dHJhZXIgc29sbyBsb3MgYW5pbWFsZXMgZGVsIGFycmF5IG9yZGVuYWRvIGRlIHB1bnR1YWNpb25lc1xuICAgIG1hdGNoaW5nQW5pbWFscyA9IGFuaW1hbFNjb3Jlcy5tYXAoaXRlbSA9PiBpdGVtLmFuaW1hbCk7XG4gICAgXG4gICAgLy8gT3BjaW9uYWw6IE1vc3RyYXIgZW4gbGEgY29uc29sYSBwYXJhIGRlcHVyYWNpw7NuXG4gICAgY29uc29sZS5sb2coJ0FuaW1hbGVzIG9yZGVuYWRvcyBwb3IgcmVsZXZhbmNpYTonLCBhbmltYWxTY29yZXMubWFwKGl0ZW0gPT4gYCR7aXRlbS5hbmltYWwubm9tfSAoJHtpdGVtLnNjb3JlfSlgKSk7XG4gICAgXG4gICAgLy8gVGVyY2VybywgY29uc29saWRhbW9zIHJlZ2lzdHJvcyBkdXBsaWNhZG9zIGJhc2Fkb3MgZW4gZWwgbWlzbW8gYW5pbWFsXG4gICAgLy8gQ29uc2lkZXJhbW9zIHF1ZSBkb3MgYW5pbWFsZXMgc29uIGVsIG1pc21vIHNpIHRpZW5lbiBlbCBtaXNtbyBub21icmUgeSBjw7NkaWdvXG4gICAgY29uc3QgdW5pcXVlQW5pbWFsczogQW5pbWFsW10gPSBbXTtcbiAgICBjb25zdCBwcm9jZXNzZWRLZXlzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgXG4gICAgbWF0Y2hpbmdBbmltYWxzLmZvckVhY2goYW5pbWFsID0+IHtcbiAgICAgIC8vIENyZWFtb3MgdW5hIGNsYXZlIMO6bmljYSBiYXNhZGEgZW4gbm9tYnJlIHkgY8OzZGlnbyBwYXJhIGlkZW50aWZpY2FyIHJlZ2lzdHJvcyBkdXBsaWNhZG9zXG4gICAgICAvLyBTaSBlbCBjw7NkaWdvIGNvbnRpZW5lIHVuIHRpbWVzdGFtcCwgbG8gZWxpbWluYW1vcyBwYXJhIGNvbnNpZGVyYXIgdG9kYXMgbGFzIHZlcnNpb25lcyBjb21vIHVuIG1pc21vIGFuaW1hbFxuICAgICAgY29uc3QgYmFzZUNvZGUgPSBhbmltYWwuY29kID8gYW5pbWFsLmNvZC5zcGxpdCgnXycpWzBdIDogJyc7XG4gICAgICBjb25zdCB1bmlxdWVLZXkgPSBgJHthbmltYWwubm9tLnRvTG93ZXJDYXNlKCl9XyR7YmFzZUNvZGV9YC50cmltKCk7XG4gICAgICBcbiAgICAgIC8vIFNpIG5vIGhlbW9zIHByb2Nlc2FkbyBlc3RlIGFuaW1hbCBhbnRlcywgbG8gYWdyZWdhbW9zIGEgbGEgbGlzdGEgZGUgw7puaWNvc1xuICAgICAgaWYgKCFwcm9jZXNzZWRLZXlzLmhhcyh1bmlxdWVLZXkpKSB7XG4gICAgICAgIHByb2Nlc3NlZEtleXMuYWRkKHVuaXF1ZUtleSk7XG4gICAgICAgIHVuaXF1ZUFuaW1hbHMucHVzaChhbmltYWwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIGZpbHRlcmVkQW5pbWFscyA9IHVuaXF1ZUFuaW1hbHM7XG4gICAgY29uc29sZS5sb2coYFNlIGVuY29udHJhcm9uICR7ZmlsdGVyZWRBbmltYWxzLmxlbmd0aH0gYW5pbWFsZXMgw7puaWNvcyBxdWUgY29pbmNpZGVuIGNvbiBsYSBiw7pzcXVlZGFgKTtcbiAgfVxuICBcbiAgcmV0dXJuIGZpbHRlcmVkQW5pbWFscztcbn07XG5cbi8vIEZ1bmNpb25lcyBhdXhpbGlhcmVzIHBhcmEgbGEgVUlcbmV4cG9ydCBjb25zdCBnZXRBbmltYWxTdGF0dXNDbGFzcyA9IChlc3RhZG86IHN0cmluZykgPT4ge1xuICByZXR1cm4gZXN0YWRvID09PSAnT0snID8gJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBkYXJrOmJnLWdyZWVuLTkwMCBkYXJrOnRleHQtZ3JlZW4tMjAwJyA6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBkYXJrOmJnLXJlZC05MDAgZGFyazp0ZXh0LXJlZC0yMDAnO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEFuaW1hbEljb24gPSAoYW5pbWFsOiBBbmltYWwpID0+IHtcbiAgaWYgKGFuaW1hbC5nZW5lcmUgPT09ICdNJykge1xuICAgIHJldHVybiAn8J+Qgic7IC8vIFRvcm9cbiAgfSBlbHNlIHtcbiAgICBpZiAoYW5pbWFsLmFsbGV0YXIgIT09ICcwJykge1xuICAgICAgcmV0dXJuICfwn5CEJzsgLy8gVmFjYSBhbWFtYW50YW5kb1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ/CfkK4nOyAvLyBWYWNhXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QWxsZXRhclRleHQgPSAoYWxsZXRhcjogc3RyaW5nKSA9PiB7XG4gIGlmIChhbGxldGFyID09PSAnMCcpIHJldHVybiAnTm8gYW1hbWFudGFuZG8nO1xuICBpZiAoYWxsZXRhciA9PT0gJzEnKSByZXR1cm4gJ0FtYW1hbnRhbmRvIDEgdGVybmVybyc7XG4gIGlmIChhbGxldGFyID09PSAnMicpIHJldHVybiAnQW1hbWFudGFuZG8gMiB0ZXJuZXJvcyc7XG4gIHJldHVybiAnRGVzY29ub2NpZG8nO1xufTtcblxuLy8gU2VydmljaW8gZGUgYW5pbWFsZXNcbmNvbnN0IGFuaW1hbFNlcnZpY2UgPSB7XG4gIC8vIE9idGllbmUgdW5hIGxpc3RhIHBhZ2luYWRhIGRlIGFuaW1hbGVzIGNvbiBmaWx0cm9zIG9wY2lvbmFsZXNcbiAgYXN5bmMgZ2V0QW5pbWFscyhmaWx0ZXJzOiBBbmltYWxGaWx0ZXJzID0ge30pOiBQcm9taXNlPFBhZ2luYXRlZFJlc3BvbnNlPEFuaW1hbD4+IHtcbiAgICB0cnkge1xuICAgICAgLy8gQ29uc3RydWlyIHBhcsOhbWV0cm9zIGRlIGNvbnN1bHRhXG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICBjb25zdCBwYWdlID0gZmlsdGVycy5wYWdlIHx8IDE7XG4gICAgICBjb25zdCBsaW1pdCA9IGZpbHRlcnMubGltaXQgfHwgMTA7XG4gICAgICBcbiAgICAgIC8vIENvbnZlcnRpciBwYWdlIGEgb2Zmc2V0IHBhcmEgZWwgYmFja2VuZFxuICAgICAgLy8gRWwgYmFja2VuZCBlc3BlcmEgb2Zmc2V0IGVuIGx1Z2FyIGRlIHBhZ2VcbiAgICAgIGNvbnN0IG9mZnNldCA9IChwYWdlIC0gMSkgKiBsaW1pdDtcbiAgICAgIFxuICAgICAgLy8gRW52aWFyIG9mZnNldCB5IGxpbWl0IGNvbW8gZXNwZXJhIGVsIGJhY2tlbmRcbiAgICAgIHBhcmFtcy5hcHBlbmQoJ29mZnNldCcsIG9mZnNldC50b1N0cmluZygpKTtcbiAgICAgIHBhcmFtcy5hcHBlbmQoJ2xpbWl0JywgbGltaXQudG9TdHJpbmcoKSk7XG4gICAgICBcbiAgICAgIC8vIEHDsWFkaXIgZmlsdHJvcyBvcGNpb25hbGVzIHNpIGVzdMOhbiBwcmVzZW50ZXNcbiAgICAgIGlmIChmaWx0ZXJzLmV4cGxvdGFjaW8pIHBhcmFtcy5hcHBlbmQoJ2V4cGxvdGFjaW8nLCBmaWx0ZXJzLmV4cGxvdGFjaW8pO1xuICAgICAgaWYgKGZpbHRlcnMuZ2VuZXJlKSBwYXJhbXMuYXBwZW5kKCdnZW5lcmUnLCBmaWx0ZXJzLmdlbmVyZSk7XG4gICAgICBpZiAoZmlsdGVycy5lc3RhZG8pIHBhcmFtcy5hcHBlbmQoJ2VzdGFkbycsIGZpbHRlcnMuZXN0YWRvKTtcbiAgICAgIGlmIChmaWx0ZXJzLmFsbGV0YXIpIHBhcmFtcy5hcHBlbmQoJ2FsbGV0YXInLCBmaWx0ZXJzLmFsbGV0YXIpO1xuICAgICAgaWYgKGZpbHRlcnMucXVhZHJhKSBwYXJhbXMuYXBwZW5kKCdxdWFkcmEnLCBmaWx0ZXJzLnF1YWRyYSk7XG4gICAgICBcbiAgICAgIC8vIELDunNxdWVkYSBwb3Igbm9tYnJlIHkgb3Ryb3MgY2FtcG9zIChub20sIGNvZCwgbnVtX3NlcmllKVxuICAgICAgaWYgKGZpbHRlcnMuc2VhcmNoKSB7XG4gICAgICAgIHBhcmFtcy5hcHBlbmQoJ3NlYXJjaCcsIGZpbHRlcnMuc2VhcmNoKTtcbiAgICAgICAgY29uc29sZS5sb2coYEJ1c2NhbmRvIGFuaW1hbGVzIHF1ZSBjb2luY2lkYW4gY29uOiBcIiR7ZmlsdGVycy5zZWFyY2h9XCJgKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ09idGVuaWVuZG8gYW5pbWFsZXMgY29uIHBhcsOhbWV0cm9zOicsIE9iamVjdC5mcm9tRW50cmllcyhwYXJhbXMuZW50cmllcygpKSk7XG4gICAgICBcbiAgICAgIC8vIFJlYWxpemFyIHBldGljacOzbiBhIGxhIEFQSVxuICAgICAgLy8gVXNhciBsYSBydXRhIGNvcnJlY3RhIHNpbiBkdXBsaWNhciBlbCBwcmVmaWpvIC9hcGkvdjEgcXVlIHlhIGVzdMOhIGVuIGxhIFVSTCBiYXNlXG4gICAgICBjb25zdCByZXNwb25zZURhdGEgPSBhd2FpdCBhcGlTZXJ2aWNlLmdldChgL2FuaW1hbHM/JHtwYXJhbXMudG9TdHJpbmcoKX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKCdSZXNwdWVzdGEgUkFXIGRlIGFuaW1hbGVzIHJlY2liaWRhOicsIHJlc3BvbnNlRGF0YSk7XG4gICAgICBcbiAgICAgIC8vIFRyYW5zZm9ybWFyIGxhIGVzdHJ1Y3R1cmEgZGUgcmVzcHVlc3RhIGRlbCBiYWNrZW5kIGEgbnVlc3RybyBmb3JtYXRvIGVzcGVyYWRvXG4gICAgICBsZXQgcHJvY2Vzc2VkUmVzcG9uc2U6IFBhZ2luYXRlZFJlc3BvbnNlPEFuaW1hbD47XG4gICAgICBcbiAgICAgIC8vIFZlcmlmaWNhciBzaSBsYSByZXNwdWVzdGEgdGllbmUgZWwgZm9ybWF0byB7c3RhdHVzLCBkYXRhfVxuICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuc3RhdHVzID09PSAnc3VjY2VzcycgJiYgcmVzcG9uc2VEYXRhLmRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0RldGVjdGFkYSByZXNwdWVzdGEgY29uIGZvcm1hdG8ge3N0YXR1cywgZGF0YX0uIFByb2Nlc2FuZG8gY29ycmVjdGFtZW50ZS4uLicpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgeyB0b3RhbCwgb2Zmc2V0LCBsaW1pdCwgaXRlbXMgfSA9IHJlc3BvbnNlRGF0YS5kYXRhO1xuICAgICAgICBcbiAgICAgICAgcHJvY2Vzc2VkUmVzcG9uc2UgPSB7XG4gICAgICAgICAgaXRlbXM6IGl0ZW1zIHx8IFtdLFxuICAgICAgICAgIHRvdGFsOiB0b3RhbCB8fCAwLFxuICAgICAgICAgIHBhZ2U6IE1hdGguZmxvb3Iob2Zmc2V0IC8gbGltaXQpICsgMSwgLy8gQ2FsY3VsYXIgcMOhZ2luYSBlbiBiYXNlIGEgb2Zmc2V0IHkgbGltaXRcbiAgICAgICAgICBsaW1pdDogbGltaXQgfHwgMTAsXG4gICAgICAgICAgcGFnZXM6IE1hdGguY2VpbCgodG90YWwgfHwgMCkgLyAobGltaXQgfHwgMTApKVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2kgeWEgdGllbmUgZWwgZm9ybWF0byBlc3BlcmFkbyBvIG5vIGNvbm9jZW1vcyBlbCBmb3JtYXRvXG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2FuZG8gcmVzcHVlc3RhIGVuIGZvcm1hdG8gZGlyZWN0bycpO1xuICAgICAgICBwcm9jZXNzZWRSZXNwb25zZSA9IHJlc3BvbnNlRGF0YSBhcyBQYWdpbmF0ZWRSZXNwb25zZTxBbmltYWw+O1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zb2xlLmxvZygnUmVzcHVlc3RhIHByb2Nlc2FkYSBkZSBhbmltYWxlczonLCBwcm9jZXNzZWRSZXNwb25zZSk7XG4gICAgICBcbiAgICAgIC8vIE5vdGlmaWNhciBhbCB1c3VhcmlvIHF1ZSBsb3MgZGF0b3Mgc29uIHJlYWxlc1xuICAgICAgaWYgKGZpbHRlcnMuc2VhcmNoKSB7XG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdzZWFyY2gtY29tcGxldGVkJywge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgdGVybTogZmlsdGVycy5zZWFyY2gsXG4gICAgICAgICAgICBjb3VudDogcHJvY2Vzc2VkUmVzcG9uc2UuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWw6IHByb2Nlc3NlZFJlc3BvbnNlLnRvdGFsLFxuICAgICAgICAgICAgdXNlZE1vY2s6IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBwcm9jZXNzZWRSZXNwb25zZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBlbiBwZXRpY2nDs24gR0VUIC9hbmltYWxzOicsIGVycm9yKTtcbiAgICAgIFxuICAgICAgLy8gVXNhciBkYXRvcyBzaW11bGFkb3MgZW4gY2FzbyBkZSBlcnJvclxuICAgICAgbGV0IHVzZU1vY2tSZWFzb24gPSAnJztcbiAgICAgIFxuICAgICAgLy8gVmVyaWZpY2FyIGVsIHRpcG8gZGUgZXJyb3JcbiAgICAgIGlmIChlcnJvci5jb2RlID09PSAnREJfQ09MVU1OX0VSUk9SJyB8fCAoZXJyb3IubWVzc2FnZSAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdlc3RhZG9fdCcpKSkge1xuICAgICAgICB1c2VNb2NrUmVhc29uID0gJ2Vycm9yIGVuIGxhIGVzdHJ1Y3R1cmEgZGUgbGEgdGFibGEgZW4gZWwgYmFja2VuZCc7XG4gICAgICB9IGVsc2UgaWYgKGVycm9yLmNvZGUgPT09ICdORVRXT1JLX0VSUk9SJykge1xuICAgICAgICB1c2VNb2NrUmVhc29uID0gJ2Vycm9yIGRlIGNvbmV4acOzbiBhbCBzZXJ2aWRvcic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTaSBubyBlcyB1biBlcnJvciBlc3BlY8OtZmljbyBjb25vY2lkbywgc2VndWlyIHVzYW5kbyBkYXRvcyBzaW11bGFkb3MgcGVybyBjb24gb3RybyBtZW5zYWplXG4gICAgICAgIHVzZU1vY2tSZWFzb24gPSAnZXJyb3IgZW4gZWwgc2Vydmlkb3InO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zb2xlLndhcm4oYFVzYW5kbyBkYXRvcyBzaW11bGFkb3MgZGViaWRvIGE6ICR7dXNlTW9ja1JlYXNvbn1gKTtcbiAgICAgIFxuICAgICAgLy8gRmlsdHJhciBkYXRvcyBzaW11bGFkb3Mgc2Vnw7puIGxvcyBmaWx0cm9zIHByb3BvcmNpb25hZG9zXG4gICAgICBjb25zdCBmaWx0ZXJlZEFuaW1hbHMgPSBnZXRGaWx0ZXJlZEFuaW1hbHMoZmlsdGVycyk7XG4gICAgICBcbiAgICAgIC8vIENhbGN1bGFyIHBhZ2luYWNpw7NuXG4gICAgICBjb25zdCBwYWdlID0gZmlsdGVycy5wYWdlIHx8IDE7XG4gICAgICBjb25zdCBsaW1pdCA9IGZpbHRlcnMubGltaXQgfHwgMTA7XG4gICAgICBjb25zdCBzdGFydEluZGV4ID0gKHBhZ2UgLSAxKSAqIGxpbWl0O1xuICAgICAgY29uc3QgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgbGltaXQ7XG4gICAgICBjb25zdCBwYWdpbmF0ZWRBbmltYWxzID0gZmlsdGVyZWRBbmltYWxzLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcbiAgICAgIFxuICAgICAgLy8gTm90aWZpY2FyIGFsIHVzdWFyaW8gcXVlIGxvcyBkYXRvcyBzb24gc2ltdWxhZG9zIHNpIGVzIHVuYSBiw7pzcXVlZGFcbiAgICAgIGlmIChmaWx0ZXJzLnNlYXJjaCkge1xuICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnc2VhcmNoLWNvbXBsZXRlZCcsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIHRlcm06IGZpbHRlcnMuc2VhcmNoLFxuICAgICAgICAgICAgY291bnQ6IHBhZ2luYXRlZEFuaW1hbHMubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWw6IGZpbHRlcmVkQW5pbWFscy5sZW5ndGgsXG4gICAgICAgICAgICB1c2VkTW9jazogdHJ1ZSxcbiAgICAgICAgICAgIHJlYXNvbjogdXNlTW9ja1JlYXNvblxuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBEZXZvbHZlciByZXNwdWVzdGEgcGFnaW5hZGEgc2ltdWxhZGFcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGl0ZW1zOiBwYWdpbmF0ZWRBbmltYWxzLFxuICAgICAgICB0b3RhbDogZmlsdGVyZWRBbmltYWxzLmxlbmd0aCxcbiAgICAgICAgcGFnZSxcbiAgICAgICAgbGltaXQsXG4gICAgICAgIHBhZ2VzOiBNYXRoLmNlaWwoZmlsdGVyZWRBbmltYWxzLmxlbmd0aCAvIGxpbWl0KVxuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBPYnRpZW5lIHVuIGFuaW1hbCBwb3Igc3UgSURcbiAgYXN5bmMgZ2V0QW5pbWFsQnlJZChpZDogbnVtYmVyKTogUHJvbWlzZTxBbmltYWw+IHtcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coYEludGVudGFuZG8gY2FyZ2FyIGFuaW1hbCBjb24gSUQ6ICR7aWR9YCk7XG4gICAgICAvLyBVc2FyIGxhIHJ1dGEgY29ycmVjdGEgc2luIGR1cGxpY2FyIGVsIHByZWZpam8gL2FwaS92MSBxdWUgeWEgZXN0w6EgZW4gbGEgVVJMIGJhc2VcbiAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IGFwaVNlcnZpY2UuZ2V0KGAvYW5pbWFscy8ke2lkfWApO1xuICAgICAgY29uc29sZS5sb2coJ0FuaW1hbCBjYXJnYWRvOicsIHJlc3BvbnNlRGF0YSk7XG4gICAgICBcbiAgICAgIGxldCBhbmltYWxEYXRhOiBBbmltYWw7XG4gICAgICBcbiAgICAgIC8vIENvbXByb2JhbW9zIHNpIGxhIHJlc3B1ZXN0YSB0aWVuZSBlbCBmb3JtYXRvIGVzcGVyYWRvIHtzdGF0dXMsIGRhdGF9XG4gICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5zdGF0dXMgPT09ICdzdWNjZXNzJyAmJiByZXNwb25zZURhdGEuZGF0YSkge1xuICAgICAgICBhbmltYWxEYXRhID0gcmVzcG9uc2VEYXRhLmRhdGEgYXMgQW5pbWFsO1xuICAgICAgfSBcbiAgICAgIC8vIFNpIGxhIHJlc3B1ZXN0YSBlcyBkaXJlY3RhbWVudGUgZWwgYW5pbWFsXG4gICAgICBlbHNlIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmlkKSB7XG4gICAgICAgIGFuaW1hbERhdGEgPSByZXNwb25zZURhdGEgYXMgQW5pbWFsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm9ybWF0byBkZSByZXNwdWVzdGEgaW52w6FsaWRvJyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIE5vcm1hbGl6YXIgZXN0cnVjdHVyYSBkZSBwYXJ0b3Mgc2kgZXhpc3RlXG4gICAgICBpZiAoYW5pbWFsRGF0YSkge1xuICAgICAgICAvLyBBc2VndXJhcm5vcyBkZSBxdWUgcGFydG9zIHNlYSBzaWVtcHJlIHVuIGFycmF5XG4gICAgICAgIGlmICghYW5pbWFsRGF0YS5wYXJ0b3MpIHtcbiAgICAgICAgICBhbmltYWxEYXRhLnBhcnRvcyA9IFtdO1xuICAgICAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KGFuaW1hbERhdGEucGFydG9zKSkge1xuICAgICAgICAgIC8vIFNpIG5vIGVzIHVuIGFycmF5LCBwZXJvIHRpZW5lIGl0ZW1zLCB1c2Ftb3MgZXNvXG4gICAgICAgICAgaWYgKGFuaW1hbERhdGEucGFydG9zLml0ZW1zICYmIEFycmF5LmlzQXJyYXkoYW5pbWFsRGF0YS5wYXJ0b3MuaXRlbXMpKSB7XG4gICAgICAgICAgICBhbmltYWxEYXRhLnBhcnRvcyA9IGFuaW1hbERhdGEucGFydG9zLml0ZW1zO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTaSBubyB0aWVuZSBmb3JtYXRvIGVzcGVyYWRvLCBpbmljaWFsaXphciBjb21vIGFycmF5IHZhY8Otb1xuICAgICAgICAgICAgYW5pbWFsRGF0YS5wYXJ0b3MgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEFzZWd1cmFyc2UgZGUgcXVlIGV4aXN0ZSAnZXN0YWRvJyB5IG5vICdlc3RhdCdcbiAgICAgICAgaWYgKCFhbmltYWxEYXRhLmVzdGFkbyAmJiBhbmltYWxEYXRhWydlc3RhdCddKSB7XG4gICAgICAgICAgYW5pbWFsRGF0YS5lc3RhZG8gPSBhbmltYWxEYXRhWydlc3RhdCddO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBhbmltYWxEYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGFsIG9idGVuZXIgYW5pbWFsIGNvbiBJRCAke2lkfTpgLCBlcnJvcik7XG4gICAgICBcbiAgICAgIC8vIFZlcmlmaWNhciBzaSBlcyBlbCBlcnJvciBlc3BlY8OtZmljbyBkZSBlc3RhZG9fdCBvIHVuIGVycm9yIGRlIHJlZFxuICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdEQl9DT0xVTU5fRVJST1InIHx8IGVycm9yLmNvZGUgPT09ICdORVRXT1JLX0VSUk9SJyB8fCBcbiAgICAgICAgICAoZXJyb3IubWVzc2FnZSAmJiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnZXN0YWRvX3QnKSB8fCBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdjb25leGnDs24nKSkpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignVXNhbmRvIGRhdG9zIHNpbXVsYWRvcyBkZWJpZG8gYSBlcnJvciBlbiBlbCBiYWNrZW5kJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBCdXNjYXIgZW4gZGF0b3Mgc2ltdWxhZG9zXG4gICAgICAgIGNvbnN0IGFuaW1hbCA9IG1vY2tBbmltYWxzLmZpbmQoYSA9PiBhLmlkID09PSBpZCk7XG4gICAgICAgIGlmIChhbmltYWwpIHtcbiAgICAgICAgICByZXR1cm4gYW5pbWFsO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFuaW1hbCBjb24gSUQgJHtpZH0gbm8gZW5jb250cmFkbyBlbiBsb3MgZGF0b3Mgc2ltdWxhZG9zYCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNpIG5vIGVzIHVuIGVycm9yIG1hbmVqYWJsZSwgcHJvcGFnYXIgZWwgZXJyb3JcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8vIENyZWEgdW4gbnVldm8gYW5pbWFsXG4gIGFzeW5jIGNyZWF0ZUFuaW1hbChhbmltYWxEYXRhOiBBbmltYWxDcmVhdGVEdG8pOiBQcm9taXNlPEFuaW1hbD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZygnQ3JlYW5kbyBudWV2byBhbmltYWw6JywgYW5pbWFsRGF0YSk7XG4gICAgICAvLyBBw7FhZGlyIGJhcnJhIGRpYWdvbmFsIGFsIGZpbmFsIHBhcmEgcXVlIGNvaW5jaWRhIGNvbiBlbCBlbmRwb2ludCBkZWwgYmFja2VuZFxuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgYXBpU2VydmljZS5wb3N0KCcvYW5pbWFscy8nLCBhbmltYWxEYXRhKTtcbiAgICAgIGNvbnNvbGUubG9nKCdBbmltYWwgY3JlYWRvOicsIHJlc3BvbnNlRGF0YSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2VEYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGNyZWFyIGFuaW1hbDonLCBlcnJvcik7XG4gICAgICBcbiAgICAgIC8vIFNpIGVzIHVuIGVycm9yIGRlIHJlZCBvIGN1YWxxdWllciBvdHJvIGVycm9yLCB1c2FyIGRhdG9zIHNpbXVsYWRvcyBjb21vIGZhbGxiYWNrXG4gICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0RCX0NPTFVNTl9FUlJPUicgfHwgZXJyb3IuY29kZSA9PT0gJ05FVFdPUktfRVJST1InIHx8IFxuICAgICAgICAgIChlcnJvci5tZXNzYWdlICYmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdlc3RhZG9fdCcpIHx8IGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2NvbmV4acOzbicpKSkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdVc2FuZG8gZGF0b3Mgc2ltdWxhZG9zIHBhcmEgY3JlYXIgYW5pbWFsIGRlYmlkbyBhIGVycm9yIGVuIGVsIGJhY2tlbmQnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWFyIHJlc3B1ZXN0YSBzaW11bGFkYVxuICAgICAgICBjb25zdCBuZXdJZCA9IE1hdGgubWF4KC4uLm1vY2tBbmltYWxzLm1hcChhID0+IGEuaWQpKSArIDE7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IG5ld0lkLFxuICAgICAgICAgIC4uLmFuaW1hbERhdGEsXG4gICAgICAgICAgY3JlYXRlZF9hdDogbm93LFxuICAgICAgICAgIHVwZGF0ZWRfYXQ6IG5vd1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBTaSBubyBlcyB1biBlcnJvciBtYW5lamFibGUsIHByb3BhZ2FyIGVsIGVycm9yXG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBBY3R1YWxpemEgdW4gYW5pbWFsIGV4aXN0ZW50ZSB1c2FuZG8gUEFUQ0ggKGFjdHVhbGl6YWNpw7NuIHBhcmNpYWwpXG4gIGFzeW5jIHVwZGF0ZUFuaW1hbChpZDogbnVtYmVyLCBhbmltYWxEYXRhOiBhbnkpOiBQcm9taXNlPEFuaW1hbD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZyhgW1BBVENIXSBBY3R1YWxpemFuZG8gYW5pbWFsIGNvbiBJRCAke2lkfTpgLCBhbmltYWxEYXRhKTtcbiAgICAgIFxuICAgICAgLy8gSU1QT1JUQU5URTogU29sbyBwcm9jZXNhbW9zIGxvcyBjYW1wb3MgcXVlIHJlYWxtZW50ZSBzZSBoYW4gZW52aWFkb1xuICAgICAgLy8gTm8gY2xvbmFtb3MgdG9kbyBlbCBvYmpldG8gcGFyYSBldml0YXIgZW52aWFyIGNhbXBvcyBpbm5lY2VzYXJpb3NcbiAgICAgIGNvbnN0IGRhdG9zTm9ybWFsaXphZG9zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gICAgICBcbiAgICAgIC8vIExpc3RhIGRlIGNhbXBvcyBxdWUgcHVlZGVuIHNlciBudWxvc1xuICAgICAgY29uc3QgY2FtcG9zTnVsYWJsZXMgPSBbJ21hcmUnLCAncGFyZScsICdxdWFkcmEnLCAnY29kJywgJ251bV9zZXJpZScsICdkb2InXTtcbiAgICAgIFxuICAgICAgLy8gUHJvY2VzYXIgc29sbyBsb3MgY2FtcG9zIHF1ZSBzZSBoYW4gcHJvcG9yY2lvbmFkb1xuICAgICAgZm9yIChjb25zdCBjYW1wbyBpbiBhbmltYWxEYXRhKSB7XG4gICAgICAgIC8vIENvbXByb2JhciBzaSBlbCBjYW1wbyBleGlzdGUgZW4gYW5pbWFsRGF0YVxuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFuaW1hbERhdGEsIGNhbXBvKSkge1xuICAgICAgICAgIC8vIFNpIGVzIHVuIGNhbXBvIG51bGxhYmxlIHkgZXN0w6EgdmFjw61vLCBlc3RhYmxlY2VybG8gY29tbyBudWxsXG4gICAgICAgICAgaWYgKGNhbXBvc051bGFibGVzLmluY2x1ZGVzKGNhbXBvKSAmJiBhbmltYWxEYXRhW2NhbXBvXSA9PT0gJycpIHtcbiAgICAgICAgICAgIGRhdG9zTm9ybWFsaXphZG9zW2NhbXBvXSA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIGlmIChjYW1wbyA9PT0gJ2FsbGV0YXInICYmIGFuaW1hbERhdGFbY2FtcG9dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIFRyYXRhciBhbGxldGFyIGNvbW8gY2FzbyBlc3BlY2lhbFxuICAgICAgICAgICAgZGF0b3NOb3JtYWxpemFkb3NbY2FtcG9dID0gU3RyaW5nKGFuaW1hbERhdGFbY2FtcG9dKSBhcyAnMCcgfCAnMScgfCAnMic7XG4gICAgICAgICAgfSBlbHNlIGlmIChjYW1wbyA9PT0gJ2RvYicgJiYgYW5pbWFsRGF0YVtjYW1wb10pIHtcbiAgICAgICAgICAgIC8vIEZvcm1hdGVhciBmZWNoYSBzaWVtcHJlIGFsIGZvcm1hdG8gZXNwZXJhZG8gcG9yIGVsIGJhY2tlbmQ6IEREL01NL1lZWVlcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGxldCBmZWNoYUZpbmFsO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gU2kgbGEgZmVjaGEgeWEgZXN0w6EgZW4gZm9ybWF0byBERC9NTS9ZWVlZLCBsYSBkZWphbW9zIGlndWFsXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgYW5pbWFsRGF0YVtjYW1wb10gPT09ICdzdHJpbmcnICYmIC9eXFxkezJ9XFwvXFxkezJ9XFwvXFxkezR9JC8udGVzdChhbmltYWxEYXRhW2NhbXBvXSkpIHtcbiAgICAgICAgICAgICAgICBmZWNoYUZpbmFsID0gYW5pbWFsRGF0YVtjYW1wb107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gU2kgZXMgZm9ybWF0byBZWVlZLU1NLUREIChkZXNkZSBpbnB1dHMgSFRNTClcbiAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFuaW1hbERhdGFbY2FtcG9dID09PSAnc3RyaW5nJyAmJiAvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9JC8udGVzdChhbmltYWxEYXRhW2NhbXBvXSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbeWVhciwgbW9udGgsIGRheV0gPSBhbmltYWxEYXRhW2NhbXBvXS5zcGxpdCgnLScpO1xuICAgICAgICAgICAgICAgIGZlY2hhRmluYWwgPSBgJHtkYXl9LyR7bW9udGh9LyR7eWVhcn1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIEN1YWxxdWllciBvdHJvIGZvcm1hdG8sIGludGVudGFtb3MgcGFyc2VhcmxvXG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZlY2hhID0gbmV3IERhdGUoYW5pbWFsRGF0YVtjYW1wb10pO1xuICAgICAgICAgICAgICAgIGlmICghaXNOYU4oZmVjaGEuZ2V0VGltZSgpKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZGF5ID0gZmVjaGEuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gKGZlY2hhLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCB5ZWFyID0gZmVjaGEuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgICAgICAgIGZlY2hhRmluYWwgPSBgJHtkYXl9LyR7bW9udGh9LyR7eWVhcn1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBTaSBubyBzZSBwdWVkZSBwYXJzZWFyLCB1c2Ftb3MgZWwgdmFsb3Igb3JpZ2luYWwgXG4gICAgICAgICAgICAgICAgICBmZWNoYUZpbmFsID0gYW5pbWFsRGF0YVtjYW1wb107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRmVjaGEgY29udmVydGlkYTogJHthbmltYWxEYXRhW2NhbXBvXX0gLT4gJHtmZWNoYUZpbmFsfWApO1xuICAgICAgICAgICAgICBkYXRvc05vcm1hbGl6YWRvc1tjYW1wb10gPSBmZWNoYUZpbmFsO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGZvcm1hdGVhciBmZWNoYTonLCBlcnIpO1xuICAgICAgICAgICAgICAvLyBFbiBjYXNvIGRlIGVycm9yLCB1c2FyIGVsIHZhbG9yIG9yaWdpbmFsXG4gICAgICAgICAgICAgIGRhdG9zTm9ybWFsaXphZG9zW2NhbXBvXSA9IGFuaW1hbERhdGFbY2FtcG9dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBQYXJhIGN1YWxxdWllciBvdHJvIGNhbXBvLCB1c2FyIGVsIHZhbG9yIHRhbCBjdWFsXG4gICAgICAgICAgICBkYXRvc05vcm1hbGl6YWRvc1tjYW1wb10gPSBhbmltYWxEYXRhW2NhbXBvXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVmVyaWZpY2FyIHF1ZSBoYXkgY2FtcG9zIHBhcmEgYWN0dWFsaXphclxuICAgICAgY29uc3QgY2FtcG9zQUFjdHVhbGl6YXIgPSBPYmplY3Qua2V5cyhkYXRvc05vcm1hbGl6YWRvcyk7XG4gICAgICBpZiAoY2FtcG9zQUFjdHVhbGl6YXIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gc2UgZGV0ZWN0YXJvbiBjYW1iaW9zIHBhcmEgYWN0dWFsaXphcicpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zb2xlLmxvZyhgW1BBVENIXSBDYW1wb3MgYSBhY3R1YWxpemFyOiAke2NhbXBvc0FBY3R1YWxpemFyLmpvaW4oJywgJyl9YCk7XG4gICAgICBjb25zb2xlLmxvZygnW1BBVENIXSBEYXRvcyBmaW5hbGVzOicsIGRhdG9zTm9ybWFsaXphZG9zKTtcbiAgICAgIFxuICAgICAgLy8gWWEgbm8gbmVjZXNpdGFtb3MgbWFuZWphciBlbCB0b2tlbiBtYW51YWxtZW50ZVxuICAgICAgLy8gTGEgZnVuY2nDs24gcGF0Y2ggZGVsIGFwaVNlcnZpY2Ugc2UgZW5jYXJnYSBkZSBhw7FhZGlyIGxvcyBoZWFkZXJzIGRlIGF1dGVudGljYWNpw7NuXG4gICAgICBcbiAgICAgIC8vIElNUE9SVEFOVEU6IFVzYXIgUEFUQ0ggeSBsYSBydXRhIGNvcnJlY3RhXG4gICAgICBjb25zb2xlLmxvZyhgW1BBVENIXSBFbnZpYW5kbyBwZXRpY2nDs24gYSAvYW5pbWFscy8ke2lkfWApO1xuICAgICAgY29uc29sZS5sb2coJ0RhdG9zIG5vcm1hbGl6YWRvczonLCBKU09OLnN0cmluZ2lmeShkYXRvc05vcm1hbGl6YWRvcywgbnVsbCwgMikpO1xuICAgICAgXG4gICAgICAvLyBVc2FyIGVsIHNlcnZpY2lvIEFQSSBwYXJhIGdhcmFudGl6YXIgY29oZXJlbmNpYVxuICAgICAgY29uc29sZS5sb2coJ0luaWNpYW5kbyBwYXRjaC4uLicpO1xuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgYXBpU2VydmljZS5wYXRjaChgL2FuaW1hbHMvJHtpZH1gLCBkYXRvc05vcm1hbGl6YWRvcyk7XG4gICAgICBjb25zb2xlLmxvZygnUEFUQ0ggY29tcGxldGFkbyBjb24gw6l4aXRvJyk7XG4gICAgICBcbiAgICAgIC8vIEVsIG3DqXRvZG8gcGF0Y2ggZGUgYXBpU2VydmljZSB5YSBtYW5lamEgbG9zIGVycm9yZXMgeSBwYXJzZWEgbGEgcmVzcHVlc3RhXG4gICAgICByZXR1cm4gcmVzcG9uc2VEYXRhLmRhdGEgfHwgcmVzcG9uc2VEYXRhO1xuXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihgW1BBVENIXSBFcnJvciBhbCBhY3R1YWxpemFyIGFuaW1hbCBjb24gSUQgJHtpZH06YCwgZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gRWxpbWluYSB1biBhbmltYWwgKG1hcmNhZG8gY29tbyBERUYpXG4gIGFzeW5jIGRlbGV0ZUFuaW1hbChpZDogbnVtYmVyKTogUHJvbWlzZTxBbmltYWw+IHtcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coYEludGVudGFuZG8gZWxpbWluYXIgYW5pbWFsIGNvbiBJRCAke2lkfWApO1xuICAgICAgXG4gICAgICAvLyBMbGFtYXIgYWwgZW5kcG9pbnQgZGUgZWxpbWluYWNpw7NuIChlbiByZWFsaWRhZCwgbWFyY2FyIGNvbW8gREVGKVxuICAgICAgLy8gVXNhciBsYSBydXRhIGNvcnJlY3RhIHNpbiBkdXBsaWNhciBlbCBwcmVmaWpvIC9hcGkvdjEgcXVlIHlhIGVzdMOhIGVuIGxhIFVSTCBiYXNlXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaVNlcnZpY2UuZGVsZXRlKGAvYXBpL3YxL2FuaW1hbHMvJHtpZH1gKTtcbiAgICAgIGNvbnNvbGUubG9nKGBSZXNwdWVzdGEgYWwgZWxpbWluYXIgYW5pbWFsIGNvbiBJRCAke2lkfTpgLCByZXNwb25zZSk7XG4gICAgICBcbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBhbCBlbGltaW5hciBhbmltYWwgY29uIElEICR7aWR9OmAsIGVycm9yKTtcbiAgICAgIFxuICAgICAgLy8gU2kgZXMgdW4gZXJyb3IgZGUgcmVkIG8gY3VhbHF1aWVyIG90cm8gZXJyb3IsIHVzYXIgZGF0b3Mgc2ltdWxhZG9zIGNvbW8gZmFsbGJhY2tcbiAgICAgIGlmIChlcnJvci5jb2RlID09PSAnREJfQ09MVU1OX0VSUk9SJyB8fCBlcnJvci5jb2RlID09PSAnTkVUV09SS19FUlJPUicgfHwgXG4gICAgICAgICAgKGVycm9yLm1lc3NhZ2UgJiYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2VzdGFkb190JykgfHwgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnY29uZXhpw7NuJykpKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1VzYW5kbyBkYXRvcyBzaW11bGFkb3MgcGFyYSBlbGltaW5hciBhbmltYWwgZGViaWRvIGEgZXJyb3IgZW4gZWwgYmFja2VuZCcpO1xuICAgICAgICBcbiAgICAgICAgLy8gTWFyY2FyIGNvbW8gREVGIGVuIGVsIGZyb250ZW5kIChlbCBiYWNrZW5kIHJlYWxtZW50ZSBubyBsbyBib3JyYSlcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlQW5pbWFsKGlkLCB7IGVzdGFkbzogJ0RFRicgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNpIG5vIGVzIHVuIGVycm9yIG1hbmVqYWJsZSwgcHJvcGFnYXIgZWwgZXJyb3JcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8vIE9idGllbmUgbG9zIHBvc2libGVzIHBhZHJlcyAobWFjaG9zKSBwYXJhIHNlbGVjY2nDs24gZW4gZm9ybXVsYXJpb3NcbiAgYXN5bmMgZ2V0UG90ZW50aWFsRmF0aGVycyhleHBsb3RhY2lvSWQ/OiBudW1iZXIgfCBzdHJpbmcpOiBQcm9taXNlPEFuaW1hbFtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKGBPYnRlbmllbmRvIHBvc2libGVzIHBhZHJlcyR7ZXhwbG90YWNpb0lkID8gYCBwYXJhIGV4cGxvdGFjacOzbiAke2V4cGxvdGFjaW9JZH1gIDogJyd9YCk7XG4gICAgICBcbiAgICAgIC8vIFVzYXIgZWwgZW5kcG9pbnQgZ2VuZXJhbCBkZSBhbmltYWxlcyBjb24gZmlsdHJvc1xuICAgICAgY29uc3QgZmlsdGVyczogQW5pbWFsRmlsdGVycyA9IHtcbiAgICAgICAgZ2VuZXJlOiAnTScsXG4gICAgICAgIGVzdGFkbzogJ09LJ1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gQcOxYWRpciBmaWx0cm8gZGUgZXhwbG90YWNpw7NuIHNpIHNlIHByb3BvcmNpb25hXG4gICAgICBpZiAoZXhwbG90YWNpb0lkICYmIGV4cGxvdGFjaW9JZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZmlsdGVycy5leHBsb3RhY2lvID0gU3RyaW5nKGV4cGxvdGFjaW9JZCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIE9idGVuZXIgYW5pbWFsZXMgZmlsdHJhZG9zXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2V0QW5pbWFscyhmaWx0ZXJzKTtcbiAgICAgIFxuICAgICAgLy8gRXh0cmFlciBsb3MgaXRlbXMgc2kgZXMgdW5hIHJlc3B1ZXN0YSBwYWdpbmFkYVxuICAgICAgY29uc3QgZmF0aGVycyA9IEFycmF5LmlzQXJyYXkocmVzcG9uc2UpID8gcmVzcG9uc2UgOiAocmVzcG9uc2UuaXRlbXMgfHwgW10pO1xuICAgICAgY29uc29sZS5sb2coJ1Bvc2libGVzIHBhZHJlcyByZWNpYmlkb3M6JywgZmF0aGVycyk7XG4gICAgICByZXR1cm4gZmF0aGVycztcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBhbCBvYnRlbmVyIHBvc2libGVzIHBhZHJlcyR7ZXhwbG90YWNpb0lkID8gYCBwYXJhIGV4cGxvdGFjacOzbiAke2V4cGxvdGFjaW9JZH1gIDogJyd9OmAsIGVycm9yKTtcbiAgICAgIFxuICAgICAgLy8gU2kgZXMgdW4gZXJyb3IgZGUgcmVkIG8gY3VhbHF1aWVyIG90cm8gZXJyb3IsIHVzYXIgZGF0b3Mgc2ltdWxhZG9zIGNvbW8gZmFsbGJhY2tcbiAgICAgIGNvbnNvbGUud2FybignVXNhbmRvIGRhdG9zIHNpbXVsYWRvcyBwYXJhIHBvc2libGVzIHBhZHJlcyBkZWJpZG8gYSBlcnJvciBlbiBlbCBiYWNrZW5kJyk7XG4gICAgICBcbiAgICAgIC8vIEZpbHRyYXIgYW5pbWFsZXMgc2ltdWxhZG9zIChtYWNob3MgYWN0aXZvcylcbiAgICAgIGNvbnN0IGZpbHRlcmVkRmF0aGVycyA9IG1vY2tBbmltYWxzLmZpbHRlcihhID0+IFxuICAgICAgICBhLmdlbmVyZSA9PT0gJ00nICYmIFxuICAgICAgICBhLmVzdGFkbyA9PT0gJ09LJyAmJiBcbiAgICAgICAgKCFleHBsb3RhY2lvSWQgfHwgZXhwbG90YWNpb0lkID09PSAndW5kZWZpbmVkJyB8fCBhLmV4cGxvdGFjaW8gPT09IFN0cmluZyhleHBsb3RhY2lvSWQpKSk7XG4gICAgICBcbiAgICAgIHJldHVybiBmaWx0ZXJlZEZhdGhlcnM7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gT2J0aWVuZSBsYXMgcG9zaWJsZXMgbWFkcmVzIChoZW1icmFzKSBwYXJhIHNlbGVjY2nDs24gZW4gZm9ybXVsYXJpb3NcbiAgYXN5bmMgZ2V0UG90ZW50aWFsTW90aGVycyhleHBsb3RhY2lvSWQ/OiBudW1iZXIgfCBzdHJpbmcpOiBQcm9taXNlPEFuaW1hbFtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKGBPYnRlbmllbmRvIHBvc2libGVzIG1hZHJlcyR7ZXhwbG90YWNpb0lkID8gYCBwYXJhIGV4cGxvdGFjacOzbiAke2V4cGxvdGFjaW9JZH1gIDogJyd9YCk7XG4gICAgICBcbiAgICAgIC8vIFVzYXIgZWwgZW5kcG9pbnQgZ2VuZXJhbCBkZSBhbmltYWxlcyBjb24gZmlsdHJvc1xuICAgICAgY29uc3QgZmlsdGVyczogQW5pbWFsRmlsdGVycyA9IHtcbiAgICAgICAgZ2VuZXJlOiAnRicsXG4gICAgICAgIGVzdGFkbzogJ09LJ1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gQcOxYWRpciBmaWx0cm8gZGUgZXhwbG90YWNpw7NuIHNpIHNlIHByb3BvcmNpb25hXG4gICAgICBpZiAoZXhwbG90YWNpb0lkICYmIGV4cGxvdGFjaW9JZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZmlsdGVycy5leHBsb3RhY2lvID0gU3RyaW5nKGV4cGxvdGFjaW9JZCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIE9idGVuZXIgYW5pbWFsZXMgZmlsdHJhZG9zXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2V0QW5pbWFscyhmaWx0ZXJzKTtcbiAgICAgIFxuICAgICAgLy8gRXh0cmFlciBsb3MgaXRlbXMgc2kgZXMgdW5hIHJlc3B1ZXN0YSBwYWdpbmFkYVxuICAgICAgY29uc3QgbW90aGVycyA9IEFycmF5LmlzQXJyYXkocmVzcG9uc2UpID8gcmVzcG9uc2UgOiAocmVzcG9uc2UuaXRlbXMgfHwgW10pO1xuICAgICAgY29uc29sZS5sb2coJ1Bvc2libGVzIG1hZHJlcyByZWNpYmlkYXM6JywgbW90aGVycyk7XG4gICAgICByZXR1cm4gbW90aGVycztcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBhbCBvYnRlbmVyIHBvc2libGVzIG1hZHJlcyR7ZXhwbG90YWNpb0lkID8gYCBwYXJhIGV4cGxvdGFjacOzbiAke2V4cGxvdGFjaW9JZH1gIDogJyd9OmAsIGVycm9yKTtcbiAgICAgIFxuICAgICAgLy8gU2kgZXMgdW4gZXJyb3IgZGUgcmVkIG8gY3VhbHF1aWVyIG90cm8gZXJyb3IsIHVzYXIgZGF0b3Mgc2ltdWxhZG9zIGNvbW8gZmFsbGJhY2tcbiAgICAgIGNvbnNvbGUud2FybignVXNhbmRvIGRhdG9zIHNpbXVsYWRvcyBwYXJhIHBvc2libGVzIG1hZHJlcyBkZWJpZG8gYSBlcnJvciBlbiBlbCBiYWNrZW5kJyk7XG4gICAgICBcbiAgICAgIC8vIEZpbHRyYXIgYW5pbWFsZXMgc2ltdWxhZG9zIChoZW1icmFzIGFjdGl2YXMpXG4gICAgICBjb25zdCBmaWx0ZXJlZE1vdGhlcnMgPSBtb2NrQW5pbWFscy5maWx0ZXIoYSA9PiBcbiAgICAgICAgYS5nZW5lcmUgPT09ICdGJyAmJiBcbiAgICAgICAgYS5lc3RhZG8gPT09ICdPSycgJiYgXG4gICAgICAgICghZXhwbG90YWNpb0lkIHx8IGV4cGxvdGFjaW9JZCA9PT0gJ3VuZGVmaW5lZCcgfHwgYS5leHBsb3RhY2lvID09PSBTdHJpbmcoZXhwbG90YWNpb0lkKSkpO1xuICAgICAgXG4gICAgICByZXR1cm4gZmlsdGVyZWRNb3RoZXJzO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8vIE9idGllbmUgdG9kb3MgbG9zIGFuaW1hbGVzIGRlIHVuYSBleHBsb3RhY2nDs25cbiAgYXN5bmMgZ2V0QW5pbWFsc0J5RXhwbG90YWNpb24oZXhwbG90YWNpb25JZDogbnVtYmVyIHwgc3RyaW5nKTogUHJvbWlzZTxBbmltYWxbXT4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBJbnRlbnRhciBvYnRlbmVyIGRhdG9zIHJlYWxlcyBkZSBsYSBBUElcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5CEIFtBbmltYWxdIFNvbGljaXRhbmRvIGFuaW1hbGVzIHBhcmEgZXhwbG90YWNpw7NuICR7ZXhwbG90YWNpb25JZH1gKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFByb2JhciBjb24gZGlmZXJlbnRlcyBmb3JtYXRvcyBkZSBlbmRwb2ludCBwYXJhIG1heW9yIGNvbXBhdGliaWxpZGFkXG4gICAgICAgIGNvbnN0IGVuZHBvaW50cyA9IFtcbiAgICAgICAgICBgL2FuaW1hbHM/ZXhwbG90YWNpbz0ke2VuY29kZVVSSUNvbXBvbmVudChleHBsb3RhY2lvbklkKX0mbGltaXQ9MTAwYFxuICAgICAgICBdO1xuICAgICAgICBcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgbGV0IHN1Y2Nlc3NFbmRwb2ludCA9ICcnO1xuICAgICAgICBcbiAgICAgICAgLy8gSW50ZW50YXIgY2FkYSBlbmRwb2ludCBoYXN0YSBxdWUgdW5vIGZ1bmNpb25lXG4gICAgICAgIGZvciAoY29uc3QgZW5kcG9pbnQgb2YgZW5kcG9pbnRzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDwn5CEIFtBbmltYWxdIEludGVudGFuZG8gZW5kcG9pbnQ6ICR7ZW5kcG9pbnR9YCk7XG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGFwaVNlcnZpY2UuZ2V0KGVuZHBvaW50KTtcbiAgICAgICAgICAgIHN1Y2Nlc3NFbmRwb2ludCA9IGVuZHBvaW50O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYPCfkIQgW0FuaW1hbF0gUmVzcHVlc3RhIHJlY2liaWRhIGRlICR7ZW5kcG9pbnR9OmAsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGJyZWFrOyAvLyBTaSBsbGVnYW1vcyBhcXXDrSwgbGEgcGV0aWNpw7NuIGZ1ZSBleGl0b3NhXG4gICAgICAgICAgfSBjYXRjaCAoZW5kcG9pbnRFcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGDwn5CEIFtBbmltYWxdIEVycm9yIGNvbiBlbmRwb2ludCAke2VuZHBvaW50fTpgLCBlbmRwb2ludEVycm9yKTtcbiAgICAgICAgICAgIC8vIENvbnRpbnVhciBjb24gZWwgc2lndWllbnRlIGVuZHBvaW50XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb2RvcyBsb3MgZW5kcG9pbnRzIGZhbGxhcm9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5CEIFtBbmltYWxdIEVuZHBvaW50IGV4aXRvc286ICR7c3VjY2Vzc0VuZHBvaW50fWApO1xuICAgICAgICBcbiAgICAgICAgLy8gU2kgZXMgdW4gYXJyYXksIGRldm9sdmVybG8gZGlyZWN0YW1lbnRlXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGDwn5CEIFtBbmltYWxdIERldm9sdmllbmRvIGFycmF5IGRlICR7cmVzcG9uc2UubGVuZ3RofSBhbmltYWxlc2ApO1xuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2kgbm8gZXMgdW4gYXJyYXksIHZlcmlmaWNhciBzaSBlcyB1biBvYmpldG8gY29uIHByb3BpZWRhZCAnaXRlbXMnIChmb3JtYXRvIHBhZ2luYWRvKVxuICAgICAgICBpZiAocmVzcG9uc2UgJiYgdHlwZW9mIHJlc3BvbnNlID09PSAnb2JqZWN0JyAmJiAnaXRlbXMnIGluIHJlc3BvbnNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYPCfkIQgW0FuaW1hbF0gRGV2b2x2aWVuZG8gJHtyZXNwb25zZS5pdGVtcy5sZW5ndGh9IGFuaW1hbGVzIGRlc2RlIHJlc3B1ZXN0YSBwYWdpbmFkYWApO1xuICAgICAgICAgIHJldHVybiByZXNwb25zZS5pdGVtcyBhcyBBbmltYWxbXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2kgZXMgdW4gb2JqZXRvIGNvbiBwcm9waWVkYWQgJ2RhdGEnIChvdHJvIGZvcm1hdG8gY29tw7puKVxuICAgICAgICBpZiAocmVzcG9uc2UgJiYgdHlwZW9mIHJlc3BvbnNlID09PSAnb2JqZWN0JyAmJiAnZGF0YScgaW4gcmVzcG9uc2UpIHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXNwb25zZS5kYXRhKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYPCfkIQgW0FuaW1hbF0gRGV2b2x2aWVuZG8gJHtyZXNwb25zZS5kYXRhLmxlbmd0aH0gYW5pbWFsZXMgZGVzZGUgcmVzcG9uc2UuZGF0YWApO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEgYXMgQW5pbWFsW107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTaSBubyBlbmNvbnRyYW1vcyBhbmltYWxlcywgZGV2b2x2ZXIgYXJyYXkgdmFjw61vXG4gICAgICAgIGNvbnNvbGUud2Fybihg8J+QhCBbQW5pbWFsXSBObyBzZSBwdWRvIGludGVycHJldGFyIGxhIHJlc3B1ZXN0YTpgLCByZXNwb25zZSk7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gY2F0Y2ggKGlubmVyRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihg8J+QhCBbQW5pbWFsXSBFcnJvciBhbCBvYnRlbmVyIGFuaW1hbGVzIHBhcmEgZXhwbG90YWNpw7NuICR7ZXhwbG90YWNpb25JZH06YCwgaW5uZXJFcnJvcik7XG4gICAgICAgIHRocm93IGlubmVyRXJyb3I7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihg8J+QhCBbQW5pbWFsXSBFcnJvciBlbiBwZXRpY2nDs24gcGFyYSBvYnRlbmVyIGFuaW1hbGVzIGRlIGV4cGxvdGFjacOzbiAke2V4cGxvdGFjaW9uSWR9OmAsIGVycm9yKTtcbiAgICAgIFxuICAgICAgLy8gU2kgZXMgdW4gZXJyb3IgZGUgcmVkIG8gY3VhbHF1aWVyIG90cm8gZXJyb3IsIHVzYXIgZGF0b3Mgc2ltdWxhZG9zIGNvbW8gZmFsbGJhY2tcbiAgICAgIGNvbnNvbGUud2Fybihg8J+QhCBbQW5pbWFsXSBVc2FuZG8gZGF0b3Mgc2ltdWxhZG9zIHBhcmEgYW5pbWFsZXMgZGUgZXhwbG90YWNpw7NuICR7ZXhwbG90YWNpb25JZH1gKTtcbiAgICAgIFxuICAgICAgLy8gRmlsdHJhciBhbmltYWxlcyBzaW11bGFkb3MgcG9yIGV4cGxvdGFjacOzblxuICAgICAgY29uc3QgbW9ja0FuaW1hbHNGaWx0ZXJlZCA9IG1vY2tBbmltYWxzLmZpbHRlcihhID0+IGEuZXhwbG90YWNpbyA9PT0gU3RyaW5nKGV4cGxvdGFjaW9uSWQpKTtcbiAgICAgIGNvbnNvbGUubG9nKGDwn5CEIFtBbmltYWxdIERldm9sdmllbmRvICR7bW9ja0FuaW1hbHNGaWx0ZXJlZC5sZW5ndGh9IGFuaW1hbGVzIHNpbXVsYWRvcyBwYXJhIGV4cGxvdGFjacOzbiAke2V4cGxvdGFjaW9uSWR9YCk7XG4gICAgICByZXR1cm4gbW9ja0FuaW1hbHNGaWx0ZXJlZDtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBVdGlsaWRhZGVzIHBhcmEgaWNvbm9zIHkgdmlzdWFsaXphY2nDs25cbiAgZ2V0QW5pbWFsSWNvbihhbmltYWw6IEFuaW1hbCk6IHN0cmluZyB7XG4gICAgaWYgKGFuaW1hbC5nZW5lcmUgPT09ICdNJykge1xuICAgICAgcmV0dXJuICfwn5CCJzsgLy8gVG9yb1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYW5pbWFsLmFsbGV0YXIgIT09ICcwJykge1xuICAgICAgICByZXR1cm4gJ/CfkIQnOyAvLyBWYWNhIGFtYW1hbnRhbmRvXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ/CfkK4nOyAvLyBWYWNhXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcbiAgZ2V0QW5pbWFsU3RhdHVzQ2xhc3MoZXN0YWRvOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChlc3RhZG8gPT09ICdPSycpIHtcbiAgICAgIHJldHVybiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGRhcms6YmctZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0yMDAnO1xuICAgIH0gZWxzZSBpZiAoZXN0YWRvID09PSAnREVGJykge1xuICAgICAgcmV0dXJuICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBkYXJrOmJnLXJlZC05MDAgZGFyazp0ZXh0LXJlZC0yMDAnO1xuICAgIH1cbiAgICByZXR1cm4gJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgZGFyazpiZy1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0yMDAnO1xuICB9LFxuICBcbiAgLy8gT2J0aWVuZSB0ZXh0byBwYXJhIGFsbGV0YXJcbiAgZ2V0QWxsZXRhclRleHQoYWxsZXRhcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoYWxsZXRhciA9PT0gJzAnKSByZXR1cm4gJ05vIGFtYW1hbnRhbmRvJztcbiAgICBpZiAoYWxsZXRhciA9PT0gJzEnKSByZXR1cm4gJ0FtYW1hbnRhbmRvIDEgdGVybmVybyc7XG4gICAgaWYgKGFsbGV0YXIgPT09ICcyJykgcmV0dXJuICdBbWFtYW50YW5kbyAyIHRlcm5lcm9zJztcbiAgICByZXR1cm4gJ0Rlc2Nvbm9jaWRvJztcbiAgfSxcbiAgXG4gIC8vIE3DqXRvZG8gc2ltcGxpZmljYWRvIHBhcmEgb2J0ZW5lciB2YWxvcmVzIMO6bmljb3MgZGUgZXhwbG90YWNpb25lc1xuICBhc3luYyBnZXRFeHBsb3RhY2lvbnMoKTogUHJvbWlzZTx7aWQ6IG51bWJlciwgZXhwbG90YWNpbzogc3RyaW5nfVtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKCdPYnRlbmllbmRvIGxpc3RhIGRlIGV4cGxvdGFjaW9uZXMnKTtcbiAgICAgIFxuICAgICAgLy8gSW50ZW50YXIgcHJpbWVybyBvYnRlbmVyIGRpcmVjdGFtZW50ZSBkZWwgZW5kcG9pbnQgZGUgZGFzaGJvYXJkL2V4cGxvdGFjaW9uc1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVXNhciBlbCBlbmRwb2ludCBjb3JyZWN0byBkZSBkYXNoYm9hcmQgcGFyYSBleHBsb3RhY2lvbmVzXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IGFwaVNlcnZpY2UuZ2V0KCcvZGFzaGJvYXJkL2V4cGxvdGFjaW9ucycpO1xuICAgICAgICBcbiAgICAgICAgLy8gUHJvY2VzYW1vcyBsYSByZXNwdWVzdGEgcGFyYSBkZXZvbHZlciBlbCBmb3JtYXRvIGVzcGVyYWRvXG4gICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnICYmIHJlc3BvbnNlRGF0YS5kYXRhICYmIEFycmF5LmlzQXJyYXkocmVzcG9uc2VEYXRhLmRhdGEuaXRlbXMpKSB7XG4gICAgICAgICAgY29uc3QgaXRlbXMgPSByZXNwb25zZURhdGEuZGF0YS5pdGVtcztcbiAgICAgICAgICByZXR1cm4gaXRlbXMubWFwKChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+ICh7XG4gICAgICAgICAgICBpZDogaW5kZXggKyAxLCAvLyBVc2Ftb3MgdW4gSUQgc2VjdWVuY2lhbCB5YSBxdWUgbm8gaGF5IHVuIElEIHJlYWwgZW4gbGEgcmVzcHVlc3RhXG4gICAgICAgICAgICBleHBsb3RhY2lvOiBpdGVtLmV4cGxvdGFjaW8gfHwgXCJcIlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXhwbG90YWNpb0Vycm9yKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignTm8gc2UgcHVkbyBvYnRlbmVyIGV4cGxvdGFjaW9uZXMgZGVsIGRhc2hib2FyZCwgaW50ZW50YW5kbyBhbHRlcm5hdGl2YScsIGV4cGxvdGFjaW9FcnJvcik7XG4gICAgICAgIC8vIENvbnRpbnVhciBjb24gZWwgbcOpdG9kbyBhbHRlcm5hdGl2b1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBNw6l0b2RvIGFsdGVybmF0aXZvOiBleHRyYWVyIGRlIGxvcyBhbmltYWxlcyBleGlzdGVudGVzXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2V0QW5pbWFscyh7IHBhZ2U6IDEsIGxpbWl0OiAxMDAgfSk7XG4gICAgICBcbiAgICAgIC8vIEV4dHJhZXIgdmFsb3JlcyDDum5pY29zIGRlIGV4cGxvdGFjaW9uZXNcbiAgICAgIGNvbnN0IHVuaXF1ZUV4cGxvdGFjaW9ucyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgXG4gICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuaXRlbXMpIHtcbiAgICAgICAgcmVzcG9uc2UuaXRlbXMuZm9yRWFjaCgoYW5pbWFsOiBBbmltYWwpID0+IHtcbiAgICAgICAgICBpZiAoYW5pbWFsLmV4cGxvdGFjaW8pIHtcbiAgICAgICAgICAgIHVuaXF1ZUV4cGxvdGFjaW9ucy5hZGQoYW5pbWFsLmV4cGxvdGFjaW8pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNpIG5vIGhheSBkYXRvcywgdXNhciB2YWxvcmVzIHByZWRlZmluaWRvc1xuICAgICAgaWYgKHVuaXF1ZUV4cGxvdGFjaW9ucy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgeyBpZDogMSwgZXhwbG90YWNpbzogJ01hZHJpZCcgfSxcbiAgICAgICAgICB7IGlkOiAyLCBleHBsb3RhY2lvOiAnQmFyY2Vsb25hJyB9LFxuICAgICAgICAgIHsgaWQ6IDMsIGV4cGxvdGFjaW86ICdWYWxlbmNpYScgfSxcbiAgICAgICAgICB7IGlkOiA0LCBleHBsb3RhY2lvOiAnR3VhZGFsYWphcmEnIH1cbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQ29udmVydGlyIGEgYXJyYXkgZGUgb2JqZXRvcyBjb24gaWQgeSBleHBsb3RhY2lvXG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh1bmlxdWVFeHBsb3RhY2lvbnMpLm1hcCgoZXhwbG90YWNpbywgaW5kZXgpID0+ICh7XG4gICAgICAgIGlkOiBpbmRleCArIDEsXG4gICAgICAgIGV4cGxvdGFjaW9cbiAgICAgIH0pKTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhbCBvYnRlbmVyIGV4cGxvdGFjaW9uZXM6JywgZXJyb3IpO1xuICAgICAgY29uc29sZS5sb2coJ1VzYW5kbyBkYXRvcyBzaW11bGFkb3MnKTtcbiAgICAgIHJldHVybiBtb2NrRXhwbG90YWNpb25zO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYW5pbWFsU2VydmljZTtcbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxhQUFhLHdCQUF3QjtBQUM5QyxPQUFPLFNBQVM7QUFzRWhCLE1BQU0scUJBQXFCLENBQUMsWUFBcUM7QUFDL0QsTUFBSSxrQkFBa0IsQ0FBQyxHQUFHLFdBQVc7QUFHckMsTUFB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