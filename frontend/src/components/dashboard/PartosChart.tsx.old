import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PartosChartProps {
  porMes: Record<string, number>;
  tendencia: {
    tendencia: number;
    promedio: number;
    valores: Record<string, number>;
  };
}

const PartosChart: React.FC<PartosChartProps> = ({ porMes, tendencia }) => {
  // Convertir el formato yyyy-mm de las claves a etiquetas más legibles (MMM yyyy)
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
  };

  // Ordenar las claves por fecha
  const sortedKeys = Object.keys(porMes).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });

  const labels = sortedKeys.map(formatMonth);
  const values = sortedKeys.map(key => porMes[key]);

  // Calcular la tendencia como línea punteada
  const trendData: (number | null)[] = [];
  if (sortedKeys.length > 0) {
    // Usar los últimos 3 meses para la tendencia si están disponibles
    const startValue = values[values.length - Math.min(3, values.length)];
    const endValue = values[values.length - 1] + tendencia.tendencia;
    
    // Crear una línea recta desde el inicio hasta el valor proyectado
    for (let i = 0; i < values.length; i++) {
      if (i < values.length - Math.min(3, values.length)) {
        trendData.push(null); // Sin datos para los primeros meses
      } else {
        const ratio = (i - (values.length - Math.min(3, values.length))) / 
                     (Math.min(3, values.length));
        trendData.push(startValue + ratio * (endValue - startValue));
      }
    }
    
    // Añadir un punto extra para la proyección del próximo mes
    labels.push('Próximo');
    values.push(null);
    trendData.push(endValue);
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Partos por Mes',
        data: values as (number | null)[],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Tendencia',
        data: trendData,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          footer: (tooltipItems: any) => {
            const dataIndex = tooltipItems[0].dataIndex;
            if (dataIndex === labels.length - 1 && tooltipItems[0].datasetIndex === 1) {
              return `Proyección basada en tendencia: ${tendencia.tendencia.toFixed(2)}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Partos',
        },
      },
    },
  };

  return (
    <Card className="mb-4 shadow-sm h-100">
      <Card.Body>
        <h5 className="card-title mb-3">Evolución de Partos</h5>
        <div className="chart-container">
          <Line data={data} options={options} />
        </div>
        <div className="text-center mt-3">
          <small className="text-muted">
            Tendencia: {tendencia.tendencia > 0 ? '+' : ''}{tendencia.tendencia.toFixed(2)} | 
            Promedio mensual: {tendencia.promedio.toFixed(2)}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PartosChart;
