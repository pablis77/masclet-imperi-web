import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  DoughnutController,
  PieController,
  BarController,
  LineController,
  ScatterController,
  RadarController,
  TimeScale,
  Tooltip,
  Legend 
} from 'chart.js';

// Registrar todos los componentes necesarios de Chart.js
export function registerChartComponents() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    DoughnutController,
    PieController,
    BarController,
    LineController,
    ScatterController,
    RadarController,
    TimeScale,
    Tooltip,
    Legend
  );
  
  console.log('✅ Componentes de Chart.js registrados correctamente');
}

// Exportar Chart para usarlo en los componentes
export { ChartJS };
