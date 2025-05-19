// Middleware para asegurar que las respuestas siempre tengan el formato correcto
// especialmente en el entorno de producción en Render

// Estructura esperada para los animales
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Normaliza cualquier respuesta de la API para asegurar que siempre tenga la estructura esperada
 * @param data Los datos originales de la API
 * @param endpoint El endpoint que se está consultando
 * @returns Datos normalizados con una estructura consistente
 */
export function normalizeApiResponse(data: any, endpoint: string): any {
  console.log(`🛠️ Normalizando respuesta del endpoint: ${endpoint}`);
  
  // Si no hay datos o es null, devolver un objeto vacío seguro
  if (!data) {
    console.warn('⚠️ Respuesta vacía de la API, devolviendo estructura por defecto');
    return getEmptyResponse();
  }
  
  // Para el endpoint de animales
  if (endpoint.includes('/animals') || endpoint.includes('/animales')) {
    // Caso 1: Ya tiene el formato esperado con items
    if (data.items && Array.isArray(data.items)) {
      console.log('✅ Respuesta ya tiene el formato esperado con array de items');
      return {
        items: data.items,
        total: data.total || data.items.length,
        page: data.page || 1,
        limit: data.limit || data.items.length,
        pages: data.pages || 1
      };
    }
    
    // Caso 2: Es un array directo de elementos
    if (Array.isArray(data)) {
      console.log('⚠️ Respuesta es un array directo, transformando a formato paginado');
      return {
        items: data,
        total: data.length,
        page: 1,
        limit: data.length,
        pages: 1
      };
    }
    
    // Caso 3: Formato diferente pero con datos válidos
    if (typeof data === 'object') {
      console.warn('⚠️ Formato de respuesta desconocido, intentando extraer datos');
      
      // Intentar encontrar algún array dentro del objeto
      let items: any[] = [];
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          console.log(`🔍 Encontrado array en propiedad '${key}'`);
          items = data[key];
        } else if (key === 'data' && data.data && typeof data.data === 'object') {
          // Manejar respuestas anidadas como {data: {items: []}}
          if (Array.isArray(data.data.items)) {
            console.log('🔍 Encontrado array en data.items');
            items = data.data.items;
          } else if (Array.isArray(data.data)) {
            console.log('🔍 data es un array');
            items = data.data;
          }
        }
      });
      
      // Si encontramos algún array, lo usamos
      return {
        items,
        total: items.length,
        page: 1,
        limit: items.length,
        pages: 1
      };
    }
    
    // Caso 4: No pudimos encontrar nada útil
    console.error('❌ No se pudo extraer datos válidos de la respuesta');
    return getEmptyResponse();
  }
  
  // Para otros endpoints, devolver los datos tal cual
  return data;
}

/**
 * Obtiene una respuesta vacía con el formato correcto
 */
export function getEmptyResponse(): PaginatedResponse<any> {
  return {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  };
}
