import React from 'react';
import { Bar } from 'react-chartjs-2';

interface MonthlyDistributionChartProps {
  data: Record<string, number>;
  title?: string;
  className?: string;
  height?: number;
}

/**
 * Componente para mostrar la distribución mensual de partos
 */
const MonthlyDistributionChart: React.FC<MonthlyDistributionChartProps> = ({
  data,
  title = 'Distribución Mensual',
  className = '',
  height = 300
}) => {
  // Obtener meses en orden correcto
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Crear dataset ordenado por meses
  const orderedData = months.map(month => data[month] || 0);
  
  // Configuración del gráfico
  const chartConfig = {
    labels: months,
    datasets: [
      {
        label: 'Partos',
        data: orderedData,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 'flex' as const
      }
    ]
  };
  
  // Opciones del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563',
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          precision: 0,
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
        }
      }
    }
  };
  
  return (
    <div className={`monthly-distribution-chart ${className}`} style={{ height: height }}>
      <Bar data={chartConfig} options={options} />
    </div>
  );
};

export default MonthlyDistributionChart;
