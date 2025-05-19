import React from 'react';
import { Pie } from 'react-chartjs-2';

interface GenderChartProps {
  data: Record<string, number>;
  title?: string;
  className?: string;
}

/**
 * Componente para mostrar gráfico de distribución por género
 */
const GenderChart: React.FC<GenderChartProps> = ({ 
  data, 
  title = 'Distribución por Género',
  className = ''
}) => {
  // Si el objeto está vacío o todos los valores son 0, mostrar un gráfico con valores de ejemplo
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  let chartData = data;
  if (Object.keys(data).length === 0 || totalValue === 0) {
    chartData = {
      'Machos': 0,
      'Hembras': 0,
      'Otros': 0
    };
  }
  
  // Mapear etiquetas especiales
  const labels = Object.keys(chartData).map(key => {
    if (key === 'M') return 'Machos';
    if (key === 'F') return 'Hembras';
    if (key === 'esforrada') return 'Esforrada';
    return key;
  });
  
  // Generar colores para cada segmento
  const backgroundColors = [
    'rgba(54, 162, 235, 0.8)',  // Azul para machos
    'rgba(255, 99, 132, 0.8)',  // Rosa para hembras
    'rgba(255, 206, 86, 0.8)',  // Amarillo para otros
    'rgba(75, 192, 192, 0.8)',  // Verde
    'rgba(153, 102, 255, 0.8)',  // Púrpura
    'rgba(255, 159, 64, 0.8)'   // Naranja
  ];
  
  // Configuración del gráfico de pastel
  const chartConfig = {
    labels: labels,
    datasets: [
      {
        data: Object.values(chartData),
        backgroundColor: backgroundColors.slice(0, Object.keys(chartData).length),
        borderColor: backgroundColors.slice(0, Object.keys(chartData).length).map(color => color.replace('0.8', '1')),
        borderWidth: 1
      }
    ]
  };
  
  // Opciones del gráfico
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  return (
    <div className={`gender-chart ${className}`}>
      <Pie data={chartConfig} options={options} />
    </div>
  );
};

export default GenderChart;
