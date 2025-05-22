// Definición de tipos extraídos del dashboard original

export interface DateParams {
  fechaInicio?: string;
  fechaFin?: string;
}

export interface DashboardResumen {
  total_animales: number;
  total_terneros: number;
  total_partos: number;
  ratio_partos_animal: number;
  tendencias: {
    partos_mes_anterior: number;
    partos_actual: number;
    nacimientos_promedio: number;
  };
  terneros: {
    total: number;
  };
  explotaciones: {
    count: number;
  };
  partos: {
    total: number;
  };
  periodo: {
    inicio: string;
    fin: string;
  };
}

export interface AnimalStats {
  total: number;
  machos: number;
  hembras: number;
  machos_activos: number;  // Añadido
  hembras_activas: number;  // Añadido
  // Variables exactas de verificar_contadores.py
  toros_activos: number;    // Añadido - genere="M", estado="OK"
  toros_fallecidos: number; // Añadido - genere="M", estado="DEF"
  vacas_activas: number;    // Añadido - genere="F", estado="OK"
  vacas_fallecidas: number; // Añadido - genere="F", estado="DEF"
  ratio_m_h: number;
  por_estado: Record<string, number>;
  por_alletar?: Record<string, number>;
  por_quadra?: Record<string, number>;
  por_genero?: Record<string, number>;
  // Añadida estructura anidada para filtrar por género y estado
  por_genero_estado?: {
    M?: Record<string, number>; // Machos por estado
    F?: Record<string, number>; // Hembras por estado
  };
  // Campo 'edades' renombrado a 'por_edad' para mantener consistencia con la API
  por_edad: {
    menos_1_año: number;
    "1_2_años": number;
    "2_5_años": number;
    mas_5_años: number;
  };
  // Mantenemos el campo 'edades' para compatibilidad con código existente
  edades?: {
    menos_1_año?: number;
    "1_2_años"?: number;
    "2_5_años"?: number;
    mas_5_años?: number;
  };
}

export interface PartosDetailStats {
  total: number;
  ultimo_mes: number;
  ultimo_año: number;
  promedio_mensual: number;
  por_mes: Record<string, number>;
  por_genero_cria: Record<string, number>;
  tasa_supervivencia: number;
  distribucion_anual: Record<string, number>;
  vivos?: number;
}

export interface ExplotacionesStats {
  total: number;
  activas: number;
  inactivas: number;
}

export interface Comparativas {
  mes_actual_vs_anterior: {
    partos: number;
    animales: number;
  };
  año_actual_vs_anterior: {
    partos: number;
  };
}

export interface DashboardStats {
  animales: AnimalStats;
  partos: PartosDetailStats;
  explotaciones: ExplotacionesStats;
  comparativas: Comparativas;
  periodo: {
    inicio: string;
    fin: string;
  };
}

export interface PartosStats {
  total: number;
  ultimo_mes: number;
  ultimo_año: number;
  por_mes: Record<string, number>;
  por_genero_cria: Record<string, number>;
  distribucion_anual: Record<string, number>;
  tendencia: Record<string, any>;
  tasa_supervivencia: number;
  promedio_mensual: number;
}

export interface CombinedStats {
  tendencias: Record<string, any>;
  rendimiento_partos: Record<string, number>;
  distribucion_quadra: Record<string, number>;
}

export interface ExplotacionInfo {
  id: number;
  explotacio: string;
  descripcion?: string;
  total_animales: number;
  total_partos: number;
  ratio: number;
  activa: boolean;
  // Campos adicionales para la tabla de explotaciones
  toros?: number;
  alletar_0?: number;  // Vacas sin amamantar
  alletar_1?: number;  // Vacas amamantando 1 ternero
  alletar_2?: number;  // Vacas amamantando 2 terneros
}

export interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
}
