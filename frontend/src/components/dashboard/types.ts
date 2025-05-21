/**
 * Interfaces para los tipos de respuesta de cada endpoint del dashboard
 */

// Endpoint #6: /api/v1/dashboard/resumen/
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

// Endpoint #7: /api/v1/dashboard/stats
export interface DashboardStats {
  animales: {
    total: number;
    machos: number;  // Total de machos (activos + inactivos)
    hembras: number;  // Total de hembras (activas + inactivas)
    machos_activos: number;  // Solo machos con estado "OK"
    hembras_activas: number;  // Solo hembras con estado "OK"
    ratio_m_h: number;
    por_estado: Record<string, number>;
    por_alletar?: Record<string, number>;
    por_quadra?: Record<string, number>;
    edades?: Record<string, number>;
  };
  partos: {
    total: number;
    ultimo_mes: number;
    ultimo_año: number;
    promedio_mensual: number;
    por_mes: Record<string, number>;
    por_genero_cria?: Record<string, number>;
    tasa_supervivencia?: number;
    distribucion_anual?: Record<string, number>;
  };
  explotaciones?: {
    total: number;
    activas: number;
    inactivas: number;
    por_provincia?: Record<string, number>;
    ranking_partos?: Array<Record<string, any>>;
    ranking_animales?: Array<Record<string, any>>;
  };
  comparativas?: {
    mes_actual_vs_anterior?: Record<string, number>;
    año_actual_vs_anterior?: Record<string, number>;
    tendencia_partos?: Record<string, any>;
    tendencia_animales?: Record<string, any>;
  };
  explotacio?: string;
  nombre_explotacio?: string;
  periodo?: {
    inicio: string;
    fin: string;
  };
}

// Endpoint #9: /api/v1/dashboard/partos
export interface PartosStats {
  total: number;
  por_mes: Record<string, number>;
  por_genero_cria: Record<string, number>;
  tasa_supervivencia: number;
  distribucion_anual: Record<string, number>;
  tendencia: Record<string, number>;
  por_animal?: Array<Record<string, any>>;
  ultimo_mes: number;
  ultimo_año: number;
  promedio_mensual: number;
  explotacio?: string;
  periodo?: {
    inicio: string;
    fin: string;
  };
}

// Endpoint #10: /api/v1/dashboard/combined
export interface CombinedStats {
  animales: {
    total: number;
    machos: number;  // Total de machos (activos + inactivos)
    hembras: number;  // Total de hembras (activas + inactivas)
    machos_activos: number;  // Solo machos con estado "OK"
    hembras_activas: number;  // Solo hembras con estado "OK"
    ratio_m_h: number;
    por_estado: Record<string, number>;
    por_alletar?: Record<string, number>;
    por_quadra?: Record<string, number>;
    edades?: Record<string, number>;
  };
  partos: {
    total: number;
    ultimo_mes: number;
    ultimo_año: number;
    promedio_mensual: number;
    por_mes: Record<string, number>;
    por_genero_cria?: Record<string, number>;
    tasa_supervivencia?: number;
    distribucion_anual?: Record<string, number>;
  };
  explotaciones?: {
    total: number;
    activas: number;
    inactivas: number;
    por_provincia?: Record<string, number>;
    ranking_partos?: Array<Record<string, any>>;
    ranking_animales?: Array<Record<string, any>>;
  };
  comparativas: {
    mes_actual_vs_anterior?: Record<string, number>;
    año_actual_vs_anterior?: Record<string, number>;
    tendencia_partos?: Record<string, any>;
    tendencia_animales?: Record<string, any>;
  };
  por_quadra: Record<string, Record<string, any>>;
  rendimiento_partos: Record<string, number>;
  tendencias: Record<string, Record<string, number>>;
  explotacio?: string;
  nombre_explotacio?: string;
  periodo: {
    inicio: string;
    fin: string;
  };
}

// Endpoint #8: /api/v1/dashboard/explotacions
export interface ExplotacionInfo {
  explotacio: string;
  nombre?: string;
  count?: number;
  total_animales?: number;
  total_partos?: number;
}

// Estadísticas de Animales (Subcomponente)
export interface AnimalStats {
  total: number;
  machos: number;  // Total de machos (activos + inactivos)
    hembras: number;  // Total de hembras (activas + inactivas)
    machos_activos: number;  // Solo machos con estado "OK"
    hembras_activas: number;  // Solo hembras con estado "OK"
  ratio_m_h: number;
  por_estado: Record<string, number>;
  por_alletar: Record<string, number>;
  por_quadra: Record<string, number>;
  edades: Record<string, number>;
}

// Tipo para el estado del tema
export interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
}

