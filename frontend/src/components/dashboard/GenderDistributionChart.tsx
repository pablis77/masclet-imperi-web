import * as React from 'react';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface GenderDistributionChartProps {
  machos: number;
  hembras: number;
}

const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ machos, hembras }) => {
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

  const data = {
    labels: ['Machos', 'Hembras'],
    datasets: [
      {
        data: [machos, hembras],
        backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
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
  };

  return (
    <Card className="mb-4 shadow-sm h-100 dark:bg-gray-800 dark:border-gray-700">
      <Card.Body>
        <h5 className="card-title mb-3 dark:text-white">Distribución por Género</h5>
        <div className="chart-container">
          <Pie data={data} options={options} />
        </div>
        <div className="text-center mt-3">
          <div className="d-flex justify-content-around">
            <div className="dark:text-gray-300">
              <span className="d-inline-block me-2" style={{ width: '12px', height: '12px', backgroundColor: 'rgba(54, 162, 235, 0.7)', borderRadius: '2px' }}></span>
              Machos: {machos}
            </div>
            <div className="dark:text-gray-300">
              <span className="d-inline-block me-2" style={{ width: '12px', height: '12px', backgroundColor: 'rgba(255, 99, 132, 0.7)', borderRadius: '2px' }}></span>
              Hembras: {hembras}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default GenderDistributionChart;
