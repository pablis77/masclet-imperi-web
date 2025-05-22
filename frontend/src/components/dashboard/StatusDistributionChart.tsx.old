import * as React from 'react';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusDistributionChartProps {
  porEstado: Record<string, number>;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ porEstado }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detectar el modo oscuro al cargar el componente
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Comprobar el modo oscuro inicialmente
    checkDarkMode();
    
    // Crear un observer para detectar cambios en la clase 'dark' del elemento html
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    // Iniciar la observación del elemento html
    observer.observe(document.documentElement, { attributes: true });
    
    // Limpiar el observer cuando el componente se desmonte
    return () => observer.disconnect();
  }, []);

  // Colores para los diferentes estados
  const colorMap: Record<string, string[]> = {
    'OK': ['rgba(40, 167, 69, 0.7)', 'rgba(40, 167, 69, 1)'],  // Verde para OK
    'DEF': ['rgba(220, 53, 69, 0.7)', 'rgba(220, 53, 69, 1)'], // Rojo para DEF
  };

  // Generar colores para cualquier otro estado que pudiera existir
  const defaultColors = ['rgba(255, 193, 7, 0.7)', 'rgba(255, 193, 7, 1)']; // Amarillo por defecto

  const labels = Object.keys(porEstado);
  const data = labels.map(key => porEstado[key]);
  const backgroundColor = labels.map(key => colorMap[key] ? colorMap[key][0] : defaultColors[0]);
  const borderColor = labels.map(key => colorMap[key] ? colorMap[key][1] : defaultColors[1]);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#333333'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        titleColor: isDarkMode ? '#ffffff' : '#ffffff',
        bodyColor: isDarkMode ? '#e5e7eb' : '#ffffff',
        borderColor: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    },
    cutout: '65%', // Hacer un agujero más grande en el centro
  };

  // Calcular el total de animales
  const total = data.reduce((sum, value) => sum + value, 0);

  return (
    <Card className="mb-4 shadow-sm h-100 dark:bg-gray-800 dark:border-gray-700">
      <Card.Body>
        <h5 className="card-title mb-3 dark:text-white">Estado de los Animales</h5>
        <div className="chart-container position-relative">
          <Doughnut data={chartData} options={options} />
          {total > 0 && (
            <div 
              className="position-absolute top-50 start-50 translate-middle text-center" 
              style={{ pointerEvents: 'none' }}
            >
              <h3 className="dark:text-white">{total}</h3>
              <small className="text-muted dark:text-gray-400">Total</small>
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {labels.map((label, index) => (
              <div key={label} className="d-flex align-items-center dark:text-gray-300">
                <span 
                  className="d-inline-block me-2" 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: backgroundColor[index], 
                    borderRadius: '2px' 
                  }}
                ></span>
                <span>{label}: {data[index]} ({data[index] > 0 ? (data[index] / total * 100).toFixed(1) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatusDistributionChart;
