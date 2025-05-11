/**
 * types/index.ts
 * ==============
 * 
 * Definiciones de tipos para el Dashboard de Masclet Imperi
 * Este archivo centraliza todos los tipos utilizados en los componentes del dashboard,
 * facilitando la reutilización y manteniendo la coherencia entre componentes.
 */

// Tipos para los datos de resumen del dashboard
export interface DashboardResumen {
  total_animales?: number;
  total_explotaciones?: number;
  total_partos?: number;
  total_machos?: number;
  total_hembras?: number;
  ratio_m_h?: number;
  ratio_partos_animal?: number;
  tasa_fertilidad?: number;
  tasa_supervivencia?: number;
  // Campo tendencia original
  tendencia?: {
    animales?: number;
    partos?: number;
    explotaciones?: number;
  };
  // Campo tendencias usado en componentes existentes
  tendencias?: {
    partos_actual?: number;
    partos_mes_anterior?: number;
    nacimientos_promedio?: number;
  };
  explotaciones?: {
    count?: number;
  };
  total_terneros?: number;
  periodo?: {
    inicio?: string | Date;
    fin?: string | Date;
  };
}

// Tipos para estadísticas detalladas
export interface DashboardStats {
  animales?: AnimalStats;
  explotaciones?: {
    total?: number;
    activas?: number;
    inactivas?: number;
    por_region?: Record<string, number>;
  };
  total_registros?: number;
}

// Tipos para estadísticas de animales
export interface AnimalStats {
  total: number;
  machos: number;
  hembras: number;
  ratio_m_h: number;
  por_estado: Record<string, number>;
  por_alletar?: Record<string, number>;
  por_quadra?: Record<string, number>;
  edades?: {
    promedio?: number;
    min?: number;
    max?: number;
    distribucion?: Record<string, number>;
  };
}

// Tipos para estadísticas de partos
export interface PartosStats {
  total: number;
  por_mes: Record<string, number>;
  por_genero_cria: Record<string, number>;
  tasa_supervivencia: number;
  distribucion_anual: Record<string, number>;
  tendencia: {
    mensual: number;
    anual: number;
  };
  ranking_partos: Array<{
    id: number;
    nom: string;
    total_partos: number;
  }>;
  ultimo_mes?: number;
  ultimo_año?: number;
  promedio_mensual?: number;
  explotacio?: string | null;
  periodo?: {
    inicio: Date | string;
    fin: Date | string;
  };
}

// Tipos para estadísticas combinadas
export interface CombinedStats {
  animales?: {
    total?: number;
    nuevos?: number;
    baja?: number;
    distribucion?: Record<string, number>;
  };
  partos?: {
    total?: number;
    exitosos?: number;
    fallidos?: number;
    distribucion?: Record<string, number>;
  };
  explotaciones?: {
    total?: number;
    activas?: number;
    inactivas?: number;
  };
  general?: {
    tasa_fertilidad?: number;
    tasa_supervivencia?: number;
  };
}

// Información básica de explotación
export interface ExplotacionInfo {
  id: number;
  explotacio: string;
  total_animales: number;
  total_animales_activos?: number; // Total de animales excluyendo fallecidos (estado = "DEF")
  vacas: number;
  vacas_activas?: number; // Vacas activas (no fallecidas)
  toros: number;
  toros_activos?: number; // Toros activos (no fallecidos)
  terneros: number;
  partos: number;
  ratio?: string | number; // Ratio de partos por animal
  activa?: boolean; // Indica si la explotación está activa
  ultima_actualizacion?: string | Date;
  // Campos adicionales para distribución de vacas según amamantamiento
  alletar_0?: number; // Vacas sin crías
  alletar_1?: number; // Vacas con 1 cría
  alletar_2?: number; // Vacas con 2 crías
  // Distribución de vacas activas según amamantamiento
  alletar_0_activas?: number; // Vacas activas sin crías
  alletar_1_activas?: number; // Vacas activas con 1 cría
  alletar_2_activas?: number; // Vacas activas con 2 crías
  total_partos?: number; // Total de partos (usado en algunos componentes en lugar de partos)
}

// Parámetros de filtrado por fecha
export interface DateParams {
  inicio?: string;
  fin?: string;
}

// Props para el componente ResumenGeneral
export interface ResumenGeneralProps {
  data: DashboardResumen | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

// Props para el componente PartosAnalisis
export interface PartosAnalisisProps {
  data: PartosStats | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

// Props para el componente ExplotacionesDisplay
export interface ExplotacionesDisplayProps {
  data: ExplotacionInfo[];
  loading: boolean;
  error: string | null;
  className?: string;
}

// Props para el componente DashboardCard
export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
  footerContent?: React.ReactNode;
}
