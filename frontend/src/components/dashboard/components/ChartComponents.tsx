import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { t } from '../../../i18n/config';

// Importar la configuración de Chart.js
import { registerChartComponents } from '../../../utils/chartConfig';

// Registrar los componentes de Chart.js antes de usarlos
registerChartComponents();

// Colores estandarizados para los gráficos (coinciden con los colores de las tarjetas)
const CHART_COLORS = {
  TOROS_ACTIVOS: '#3b82f6', // Azul para toros activos
  FALLECIDOS: '#f97316',    // Naranja para fallecidos (original)
  VACAS: '#ec4899',         // Rosa para vacas
  VACAS_AMAM_0: '#f59e0b',  // Ámbar para vacas sin amamantar
  VACAS_AMAM_1: '#06b6d4',  // Cyan para vacas con 1 ternero
  VACAS_AMAM_2: '#ef4444'   // Rojo para vacas con 2 terneros
};

// Componentes de gráficos extraídos directamente del dashboard original

// Renderizar gráfico de distribución por género
export const GenderChart = ({ data, darkMode }: { data: Record<string, number> | undefined, darkMode: boolean }) => {
  // Estado para el idioma actual
  const [currentLang, setCurrentLang] = useState('es');
  
  // Obtener el idioma actual del localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);
    
    // Escuchar cambios de idioma
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);
  
  if (!data) return null;
  
  // Si el objeto está vacío o todos los valores son 0, mostrar un gráfico con valores de ejemplo
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    data = {
      [t('dashboard.males', currentLang)]: 0,
      [t('dashboard.females', currentLang)]: 0,
      [t('dashboard.deceased', currentLang)]: 0
    };
  }
  
  // Mapear etiquetas y colores
  const labels = Object.keys(data);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: t('dashboard.population_analysis', currentLang),
        data: Object.values(data),
        backgroundColor: [
          `${CHART_COLORS.TOROS_ACTIVOS}CC`, // Azul - Toros (con transparencia)
          `${CHART_COLORS.VACAS}CC`,         // Rosa - Vacas (con transparencia)
          `${CHART_COLORS.FALLECIDOS}CC`,    // Naranja - Fallecidos (con transparencia)
        ],
        borderColor: [
          CHART_COLORS.TOROS_ACTIVOS,
          CHART_COLORS.VACAS,
          CHART_COLORS.FALLECIDOS,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return <Pie data={chartData} />
};

// Renderizar gráfico de distribución por género de crías
export const GenderCriaChart = ({ data, darkMode }: { data: Record<string, number> | undefined, darkMode: boolean }) => {
  // Estado para el idioma actual
  const [currentLang, setCurrentLang] = useState('es');
  
  // Obtener el idioma actual del localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);
    
    // Escuchar cambios de idioma
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);

  if (!data) return null;
  
  // Datos específicos para machos y hembras
  let formattedData: Record<string, number> = {
    'M': 0,
    'F': 0,
    'esforrada': 0
  };
  
  // Asignar datos de entrada a las categorías correctas
  if (data) {
    // Verificar si hemos recibido los datos ya en el formato correcto
    // Verificamos si las claves son exactamente M, F y posiblemente esforrada
    const hasExpectedKeys = 'M' in data && 'F' in data;
    
    if (hasExpectedKeys) {
      // Si ya están en el formato esperado, usamos directamente
      formattedData = {
        'M': data['M'] || 0,
        'F': data['F'] || 0,
        'esforrada': data['esforrada'] || 0
      };
    } else {
      // Procesamiento estándar si no están en el formato esperado
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'M' || key === 'm') {
          formattedData['M'] += value;
        } else if (key === 'F' || key === 'f') {
          formattedData['F'] += value;
        } else if (key === 'esforrada' || key === 'ESFORRADA') {
          formattedData['esforrada'] += value;
        }
      });
    }
  }
  
  // Preparar etiquetas amigables para el usuario
  const labelsMap: Record<string, string> = {
    'M': t('dashboard.males', currentLang),
    'F': t('dashboard.females', currentLang),
    'esforrada': t('dashboard.others', currentLang)
  };
  
  const labels = Object.keys(formattedData).map(key => labelsMap[key] || key);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Género de las crías',
        data: Object.values(formattedData),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // Azul - Machos
          'rgba(236, 72, 153, 0.7)', // Rosa - Hembras
          'rgba(249, 115, 22, 0.7)', // Naranja - Otros
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return <Pie data={chartData} />
};

// Renderizar gráfico de estado
export const StatusChart = ({ data, darkMode }: { data: Record<string, number> | undefined, darkMode: boolean }) => {
  if (!data) return null;
  
  // Si el objeto está vacío o todos los valores son 0, mostrar un gráfico con valores de ejemplo
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    data = {
      'Activos': 0,
      'Inactivos': 0
    };
  }
  
  // Mapear etiquetas especiales
  const labels = Object.keys(data).map(key => {
    if (key === 'OK') return 'Activos';
    if (key === 'DEF') return 'Fallecidos';
    return key;
  });
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Estado',
        data: Object.values(data),
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // Verde
          'rgba(239, 68, 68, 0.7)', // Rojo
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return <Pie data={chartData} />
};

// Renderizar gráfico de quadra
export const QuadraChart = ({ data, darkMode }: { data: Record<string, number> | undefined, darkMode: boolean }) => {
  if (!data) return null;
  
  // Si no hay datos válidos, mostrar gráfico con valores ejemplo
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    data = {
      'Cuadra A': 0,
      'Cuadra B': 0,
      'Cuadra C': 0
    };
  }
  
  // Ordenar datos por valor (mayor a menor)
  const sortedEntries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Limitar a 10 elementos para mejor visualización
    
  const chartData = {
    labels: sortedEntries.map(([key]) => key),
    datasets: [
      {
        label: 'Distribución por Origen',
        data: sortedEntries.map(([_, value]) => value),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  return <Bar data={chartData} options={options} />
};

// Renderizar gráfico de distribución por mes
export const MonthlyChart = ({ data, darkMode }: { data: Record<string, number> | undefined, darkMode: boolean }) => {
  if (!data) return null;
  
  // Aseguramos que tengamos un objeto con todos los meses inicializados a 0
  const completeMonthsData: Record<string, number> = {
    'Ene': 0, 'Feb': 0, 'Mar': 0, 'Abr': 0, 'May': 0, 'Jun': 0,
    'Jul': 0, 'Ago': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dic': 0
  };
  
  // Convertimos las claves como '2023-01' o '2023-1' a 'Ene', '2023-02' a 'Feb', etc.
  const monthsMap: Record<string, string> = {
    '01': 'Ene', '1': 'Ene',
    '02': 'Feb', '2': 'Feb',
    '03': 'Mar', '3': 'Mar',
    '04': 'Abr', '4': 'Abr',
    '05': 'May', '5': 'May',
    '06': 'Jun', '6': 'Jun',
    '07': 'Jul', '7': 'Jul',
    '08': 'Ago', '8': 'Ago',
    '09': 'Sep', '9': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dic'
  };
  
  // Procesar datos para agrupar por mes sin importar el año
  if (data && Object.keys(data).length > 0) {
    Object.entries(data).forEach(([key, value]) => {
      // Si la clave tiene el formato 'YYYY-MM' o similar, extrae el mes
      const monthMatch = key.match(/-(\d{1,2})$/) || key.match(/-(\d{1,2})-/) || key.match(/^(\d{1,2})$/);
      if (monthMatch && monthMatch[1]) {
        const monthKey = monthsMap[monthMatch[1]] || key;
        if (monthKey in completeMonthsData) {
          completeMonthsData[monthKey] += value;
        }
      } else if (key in completeMonthsData) {
        // Si ya está en el formato correcto (Ene, Feb, etc.)
        completeMonthsData[key] += value;
      }
    });
  }
  
  // Ordenar meses correctamente (Ene, Feb, Mar, ...)
  const monthOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const chartData = {
    labels: monthOrder,
    datasets: [
      {
        label: 'Partos por mes',
        data: monthOrder.map(month => completeMonthsData[month]),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Fuerza a que los valores en el eje Y sean enteros
          stepSize: 1,
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      }
    }
  };
  
  return <Bar data={chartData} options={options} />
};

// Renderizar gráfico de tendencia
export const TrendChart = ({ data, darkMode }: { data: Record<string, number> | undefined, darkMode: boolean }) => {
  if (!data) return null;
  
  // Filtrar para mostrar solo los años con partos y ordenarlos
  const sortedKeys = Object.keys(data)
    .filter(year => data[year] > 0)  // Solo años con partos
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  const chartData = {
    labels: sortedKeys,
    datasets: [
      {
        label: 'Partos por año',
        data: sortedKeys.map(year => data[year]),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  return <Line data={chartData} options={{
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Año'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Número de partos'
        },
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => `Año ${items[0].label}`,
          label: (context) => `Partos: ${context.formattedValue}`
        }
      }
    }
  }} />
};

// Componente para gráfico de distribución anual detallada
export const DistribucionAnualChart = ({ darkMode, data }: { darkMode: boolean, data?: Record<string, number> }) => {
  // Estado para el idioma actual
  const [currentLang, setCurrentLang] = useState('es');
  
  // Obtener el idioma actual del localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);
    
    // Escuchar cambios de idioma
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);
  
  // Usar datos de la API o valores por defecto si no hay datos
  const datosReales = data || {};
  
  // Verificar si tenemos datos
  const tieneValores = Object.values(datosReales).some(valor => valor > 0);
  
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
  
  // Verificar si tenemos datos válidos
  if (!data || typeof data !== 'object') {
    console.error('No se recibieron datos válidos para el gráfico anual');
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
  
  // Filtrar y ordenar los años que tienen partos (valor > 0)
  const years = Object.keys(data)
    .filter(year => typeof data[year] === 'number' && data[year] > 0)
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  // IMPORTANTE: SOLO usar datos dinámicos del backend
  const chartData = {
    labels: years,
    datasets: [
      {
        label: currentLang === 'ca' ? 'Parts per any' : 'Partos por año',
        data: years.map(year => {
          // Verificar que data exista y tenga la propiedad del año
          return data && typeof data === 'object' && year in data ? data[year] : 0;
        }),
        backgroundColor: '#10b981', // Verde esmeralda
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={chartData} options={{
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Año'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Número de partos'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (items) => `Año ${items[0].label}`,
          label: (context) => `Partos: ${context.formattedValue}`
        }
      }
    }
  }} />
};

// Componente para gráfico de distribución mensual
export const DistribucionMensualChart = ({ darkMode, data }: { darkMode: boolean, data?: Record<string, number> }) => {
  
  // Estado para el idioma actual
  const [currentLang, setCurrentLang] = useState('es');
  
  // Obtener el idioma actual del localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);
    
    // Escuchar cambios de idioma
    const handleLanguageChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);
  
  // Nombres de los meses en orden
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Nombres de los meses en catalán
  const mesesCat = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
  ];
  
  // Determinar qué nombres de meses usar según el idioma
  const nombresMeses = currentLang === 'ca' ? mesesCat : meses;
  
  // Procesar los datos que vienen del API
  // Definir el tipo para la distribución por mes
  type DistribucionMensual = Record<string, number>;
  
  // Inicializar con valores por defecto para todos los meses
  const distribucionPorMesInicial: DistribucionMensual = {
    "Enero": 0, "Febrero": 0, "Marzo": 0, "Abril": 0, "Mayo": 0, "Junio": 0,
    "Julio": 0, "Agosto": 0, "Septiembre": 0, "Octubre": 0, "Noviembre": 0, "Diciembre": 0
  };
  
  // Variable para almacenar los datos procesados
  let distribucionPorMes: DistribucionMensual = {...distribucionPorMesInicial};
  
  if (data && typeof data === 'object') {
    // Verificar si los datos vienen en el formato por_mes
    if ('por_mes' in data && data.por_mes && typeof data.por_mes === 'object') {
      distribucionPorMes = data.por_mes as DistribucionMensual;
    } 
    // Verificar si los datos contienen directamente los nombres de meses
    else if ('Enero' in data || 'enero' in data) {
      distribucionPorMes = data as DistribucionMensual;
    } 
    // Procesar datos en formato año-mes
    else {
      // Procesar cada clave del objeto data buscando patrones de año-mes
      Object.entries(data).forEach(([clave, valor]) => {
        // Verificar si la clave tiene el formato "YYYY-MM"
        if (clave.match(/^\d{4}-\d{2}$/)) {
          const mes = parseInt(clave.split('-')[1]);
          if (mes >= 1 && mes <= 12) {
            const nombreMes = meses[mes - 1]; // -1 porque los meses van de 0-11 en JS
            if (typeof valor === 'number') {
              distribucionPorMes[nombreMes] += valor;
            }
          }
        }
      });
    }
  }
  
  // Extraer valores de cada mes en orden para usar en el gráfico
  const valoresMeses = meses.map(mes => {
    // Cada mes ya está inicializado con su valor por defecto (0)
    // Devolvemos directamente el valor del mes de distribucionPorMes
    return distribucionPorMes[mes] || 0;
  });
  
  const chartData = {
    labels: nombresMeses,
    datasets: [
      {
        label: currentLang === 'ca' ? 'Parts per mes' : 'Partos por mes',
        data: valoresMeses,
        backgroundColor: '#3b82f6', // Azul
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={chartData} options={{
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Mes'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Número de partos'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (items) => items[0].label,
          label: (context) => `Partos: ${context.formattedValue}`
        }
      }
    }
  }} />
};
