/**
 * chartConfig.ts
 * Configuración y registro de Chart.js compatible con SSR
 * 
 * Este archivo gestiona la importación dinámica de Chart.js para evitar errores en SSR
 * ya que Chart.js depende de APIs del navegador que no existen en el servidor.
 */

// Verificar si estamos en un entorno de navegador para evitar errores en SSR
const isBrowser = typeof window !== 'undefined';

// Declare los placeholders para usar en el código
let ChartJS: any = {};

/**
 * Registra los componentes de Chart.js de forma dinámica solo en el cliente
 * Esta función debe ser llamada después de que el componente se monte en el cliente
 */
export async function registerChartComponents(): Promise<void> {
  // Solo ejecutar en el navegador, no en SSR
  if (!isBrowser) {
    console.log('⏩ Saltando registro de Chart.js en entorno SSR');
    return;
  }

  try {
    // Importación dinámica de Chart.js
    const chartModule = await import('chart.js');
    
    // Asignar Chart del módulo importado
    ChartJS = chartModule.Chart;
    
    // Registrar los componentes necesarios
    ChartJS.register(
      chartModule.CategoryScale,
      chartModule.LinearScale,
      chartModule.PointElement,
      chartModule.LineElement,
      chartModule.BarElement,
      chartModule.ArcElement,
      chartModule.DoughnutController,
      chartModule.PieController,
      chartModule.BarController,
      chartModule.LineController,
      chartModule.ScatterController,
      chartModule.RadarController,
      chartModule.TimeScale,
      chartModule.Tooltip,
      chartModule.Legend
    );
    
    console.log('✅ Componentes de Chart.js registrados correctamente');
  } catch (error) {
    console.error('Error al cargar Chart.js:', error);
  }
}

// Exportar Chart para usarlo en los componentes
export { ChartJS };
