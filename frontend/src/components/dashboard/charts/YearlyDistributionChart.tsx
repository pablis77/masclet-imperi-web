import React from 'react';
import { Line } from 'react-chartjs-2';

interface YearlyDistributionChartProps {
  data: Record<string, number>;
  title?: string;
  className?: string;
  height?: number;
}

/**
 * Componente para mostrar la distribución anual de partos
 */
const YearlyDistributionChart: React.FC<YearlyDistributionChartProps> = ({
  data,
  title = 'Distribución Anual',
  className = '',
  height = 300
}) => {
  // Ordenar años de forma ascendente
  const years = Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b));
  const values = years.map(year => data[year] || 0);
  
  // Configuración del gráfico
  const chartConfig = {
    labels: years,
    datasets: [
      {
        label: 'Partos',
        data: values,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.3,
        fill: true
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
            return `${context.dataset.label} (${context.label}): ${context.raw}`;
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
          maxRotation: 45,
          minRotation: 45,
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
    <div className={`yearly-distribution-chart ${className}`} style={{ height: height }}>
      <Line data={chartConfig} options={options} />
    </div>
  );
};

export default YearlyDistributionChart;
