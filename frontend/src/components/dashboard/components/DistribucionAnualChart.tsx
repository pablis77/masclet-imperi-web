import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

interface DistribucionAnualChartProps {
  darkMode: boolean;
  data?: Record<string, number>;
}

const DistribucionAnualChart: React.FC<DistribucionAnualChartProps> = ({ darkMode, data }) => {
  const [currentLang] = useState('es');
  
  // IMPORTANTE: usar SOLO los datos que vienen del backend (NO hardcodeados)
  console.log('DistribucionAnualChart - Datos recibidos del API:', data);
  
  // Usar los datos proporcionados como prop o un objeto vacío si no hay datos
  const datosBackend = data || {};
  
  // Verificar si tenemos datos
  const tieneValores = Object.keys(datosBackend).length > 0;
  
  // Si no hay datos, mostrar mensaje
  if (!tieneValores) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: darkMode ? '#d1d5db' : '#6b7280'
      }}>
        {currentLang === 'ca' ? "No hi ha dades disponibles" : "No hay datos disponibles"}
      </div>
    );
  }
  
  // Ordenar años numéricamente de menor a mayor y filtrar años con partos
  // SOLO usar años que tienen partos (valor > 0) para la visualización
  const years = Object.keys(datosBackend)
    .filter(year => typeof datosBackend[year] === 'number' && datosBackend[year] > 0)
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  console.log('DistribucionAnualChart - Años con partos:', years);
  
  const chartData = {
    labels: years,
    datasets: [
      {
        label: currentLang === 'ca' ? 'Parts per any' : 'Partos por año',
        data: years.map(year => datosBackend[year]),
        backgroundColor: '#10b981', // Verde esmeralda
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  return <Bar 
    data={chartData} 
    options={{
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: darkMode ? '#d1d5db' : '#6b7280',
          },
          title: {
            display: true,
            text: currentLang === 'ca' ? 'Any' : 'Año',
            color: darkMode ? '#d1d5db' : '#6b7280',
          }
        },
        y: {
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: darkMode ? '#d1d5db' : '#6b7280',
          },
          title: {
            display: true,
            text: currentLang === 'ca' ? 'Nombre de parts' : 'Número de partos',
            color: darkMode ? '#d1d5db' : '#6b7280',
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: darkMode ? '#1e293b' : 'rgba(255, 255, 255, 0.9)',
          titleColor: darkMode ? '#ffffff' : '#000000',
          bodyColor: darkMode ? '#d1d5db' : '#6b7280',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          titleFont: {
            size: 16,
            weight: 'bold'
          },
          callbacks: {
            title: (items) => `Año ${items[0].label}`,
            label: (context) => `Partos: ${context.formattedValue}`
          }
        }
      }
    }} 
  />;
};

export default DistribucionAnualChart;
