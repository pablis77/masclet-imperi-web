// Exportar componentes del dashboard
export { default as Dashboard } from './Dashboard';
// Exportamos Dashboard2 como un componente independiente
// No lo incluimos aquí para evitar problemas de hidratación
export { default as ActivityFeed } from './ActivityFeed';
export { default as DashboardFilters } from './DashboardFilters';
export { default as GenderDistributionChart } from './GenderDistributionChart';
export { default as PartosChart } from './PartosChart';
export { default as StatCard } from './StatCard';
export { default as StatusDistribution } from './StatusDistribution';

// Exportamos el Dashboard Mejorado
export { default as DashboardEnhanced } from './DashboardEnhanced';

// Exportamos componentes nuevos
export { default as DashboardCard } from './components/DashboardCard';
export { default as StatDisplay } from './components/StatDisplay';
export { default as LoadingIndicator } from './components/LoadingIndicator';

// Exportamos secciones
export { default as ResumenGeneral } from './sections/ResumenGeneral';
export { default as PartosAnalisis } from './sections/PartosAnalisis';
export { default as ExplotacionesDisplay } from './sections/ExplotacionesDisplay';

// Exportamos gráficos
export { default as GenderChart } from './charts/GenderChart';
export { default as MonthlyDistributionChart } from './charts/MonthlyDistributionChart';
export { default as YearlyDistributionChart } from './charts/YearlyDistributionChart';

// Exportamos tipos
export * from './types';
