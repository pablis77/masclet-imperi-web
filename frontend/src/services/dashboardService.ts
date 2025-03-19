import { get } from './apiService';
import { mockDashboardData, mockParts } from './mockData';

const API_PATH = '/api/v1';

export interface AnimalStats {
  total: number;
  machos: number;
  hembras: number;
  ratio_machos_hembras: number;
  por_estado: Record<string, number>;
  por_alletar: Record<string, number>;
  por_quadra: Record<string, number>;
}

export interface PartoStats {
  total: number;
  ultimo_mes: number;
  ultimo_año: number;
  promedio_mensual: number;
  por_mes: Record<string, number>;
  tendencia_partos: {
    tendencia: number;
    promedio: number;
    valores: Record<string, number>;
  };
}

export interface DashboardResponse {
  explotacio_name?: string;
  fecha_inicio: string;
  fecha_fin: string;
  animales: AnimalStats;
  partos: PartoStats;
}

export interface DashboardParams {
  explotacioId?: number;
  startDate?: string;
  endDate?: string;
}

// Función auxiliar para generar datos de partos por mes
const generatePartsByMonth = () => {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const partsByMonth: Record<string, number> = {};
  
  // Inicializar todos los meses en 0
  months.forEach(month => {
    partsByMonth[month] = 0;
  });
  
  // Contar partos por mes
  mockParts.forEach(part => {
    const date = new Date(part.data);
    const monthIndex = date.getMonth();
    const monthKey = months[monthIndex];
    partsByMonth[monthKey] = (partsByMonth[monthKey] || 0) + 1;
  });
  
  return partsByMonth;
};

// Crear datos simulados con el formato que espera la API
const createMockDashboardResponse = (): DashboardResponse => {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  // Preparar objeto de meses para partos
  const partsByMonth = generatePartsByMonth();
  
  return {
    fecha_inicio: threeMonthsAgo.toISOString().split('T')[0],
    fecha_fin: today.toISOString().split('T')[0],
    animales: {
      total: mockDashboardData.totalAnimals,
      machos: mockDashboardData.maleAnimals,
      hembras: mockDashboardData.femaleAnimals,
      ratio_machos_hembras: mockDashboardData.maleAnimals / Math.max(1, mockDashboardData.femaleAnimals),
      por_estado: {
        OK: mockDashboardData.okAnimals,
        DEF: mockDashboardData.defAnimals
      },
      por_alletar: {
        NO: mockDashboardData.totalAnimals - mockDashboardData.allettingAnimals,
        SI: mockDashboardData.allettingAnimals
      },
      por_quadra: {
        Q1: 2,
        Q2: 1,
        Q3: 1,
        OTRO: 1
      }
    },
    partos: {
      total: mockParts.length,
      ultimo_mes: 1,
      ultimo_año: mockParts.length,
      promedio_mensual: mockParts.length / 12,
      por_mes: partsByMonth,
      tendencia_partos: {
        tendencia: 0.1,
        promedio: mockParts.length / 12,
        valores: partsByMonth
      }
    }
  };
};

/**
 * Obtiene las estadísticas generales del dashboard
 */
export const getDashboardStats = async (params: DashboardParams = {}): Promise<DashboardResponse> => {
  let endpoint = `${API_PATH}/dashboard/stats`;
  
  // Añadir parámetros a la URL si existen
  const queryParams = new URLSearchParams();
  if (params.explotacioId) queryParams.append('explotacio_id', params.explotacioId.toString());
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  
  const queryString = queryParams.toString();
  if (queryString) {
    endpoint += `?${queryString}`;
  }
  
  // Usar el nuevo servicio API con soporte para mock
  const mockResponse = createMockDashboardResponse();
  return get<DashboardResponse>(endpoint, mockResponse);
};

/**
 * Obtiene las estadísticas de una explotación específica
 */
export const getExplotacionStats = async (
  explotacionId: number, 
  params: Omit<DashboardParams, 'explotacioId'> = {}
): Promise<DashboardResponse> => {
  let endpoint = `${API_PATH}/dashboard/explotacions/${explotacionId}`;
  
  // Añadir parámetros a la URL si existen
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  
  const queryString = queryParams.toString();
  if (queryString) {
    endpoint += `?${queryString}`;
  }
  
  // Crear una respuesta simulada específica para esta explotación
  const mockResponse = createMockDashboardResponse();
  mockResponse.explotacio_name = `Explotación #${explotacionId}`;
  
  // Usar el nuevo servicio API con soporte para mock
  return get<DashboardResponse>(endpoint, mockResponse);
};
