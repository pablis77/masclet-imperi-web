# Análisis Estructural de DashboardEnhanced.tsx

## 1. Importaciones y Dependencias

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiService from '../../services/apiService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import type { DateParams } from './hooks/useDashboardData';
import './dashboardStyles.css';

// Importar componentes de secciones
import ResumenGeneral from './sections/ResumenGeneral';
import PartosAnalisis from './sections/PartosAnalisis';
import ExplotacionesDisplay from './sections/ExplotacionesDisplay';

// Importar componentes UI reutilizables
import DashboardCard from './components/DashboardCard';
import LoadingIndicator from './components/LoadingIndicator';

// Importar tipos desde el archivo de tipos centralizado
import type { 
  DashboardResumen, 
  DashboardStats, 
  PartosStats, 
  CombinedStats,
  ExplotacionInfo,
  AnimalStats,
  ThemeState
} from './types';

// Registrar los componentes de ChartJS necesarios
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);
```

## 2. Estados Principales

```tsx
// Estados para los diferentes endpoints
const [resumenData, setResumenData] = useState<DashboardResumen | null>(null);
const [statsData, setStatsData] = useState<DashboardStats | null>(null);
const [partosData, setPartosData] = useState<PartosStats | null>(null);
const [combinedData, setCombinedData] = useState<CombinedStats | null>(null);
const [explotaciones, setExplotaciones] = useState<ExplotacionInfo[]>([]);
const [rendimientoPartos, setRendimientoPartos] = useState<Record<string, number>>({});
const [tendencias, setTendencias] = useState<Record<string, any>>({});
const [distribucionPorQuadra, setDistribucionPorQuadra] = useState<Record<string, number>>({});
const [animalStats, setAnimalStats] = useState<AnimalStats>({
  total: 0,
  machos: 0,
  hembras: 0,
  ratio_m_h: 0,
  por_estado: {},
  por_alletar: {},
  por_quadra: {},
  edades: {}
});

// Estados generales
const [loading, setLoading] = useState<Record<string, boolean>>({
  resumen: true,
  stats: true,
  partos: true,
  combined: true,
  explotaciones: true
});

// Estados para los filtros de fecha
const [fechaInicio, setFechaInicio] = useState<string>('');
const [fechaFin, setFechaFin] = useState<string>('');
const [error, setError] = useState<Record<string, string | null>>({
  resumen: null,
  stats: null,
  partos: null,
  combined: null,
  explotaciones: null
});
const [requestLogs, setRequestLogs] = useState<string[]>([]);

// Estado para el tema (sincronizado con tema global)
const [darkMode, setDarkMode] = useState<boolean>(false);

// Estado para indicar si el dashboard está completamente cargado
const [dashboardReady, setDashboardReady] = useState<boolean>(false);
```

## 3. Efectos Principales

### 3.1 Efecto para sincronizar con el tema global
```tsx
useEffect(() => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  setDarkMode(isDarkMode);
  
  // Observar cambios en el tema
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
  
  return () => observer.disconnect();
}, []);
```

### 3.2 Efecto para cargar parámetros de fecha de la URL
```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const fechaInicioParam = params.get('fecha_inicio');
  const fechaFinParam = params.get('fecha_fin');
  
  if (fechaInicioParam) {
    setFechaInicio(fechaInicioParam);
  }
  
  if (fechaFinParam) {
    setFechaFin(fechaFinParam);
  }
  
  // Si hay parámetros, aplicar filtros automáticamente
  if (fechaInicioParam || fechaFinParam) {
    console.log('Detectados parámetros de fecha en URL:', { fechaInicioParam, fechaFinParam });
  }
}, []);
```

### 3.3 Efecto para cargar datos al montar el componente
```tsx
useEffect(() => {
  // Función para cargar todos los datos con los parámetros de fecha de la URL
  const loadDashboardData = async () => {
    try {
      addLog('Cargando datos del dashboard');
      
      // Obtener parámetros de fecha de la URL
      const params = new URLSearchParams(window.location.search);
      const fechaInicioParam = params.get('fecha_inicio');
      const fechaFinParam = params.get('fecha_fin');
      
      // Actualizar los campos de fecha con los valores de la URL
      if (fechaInicioParam) {
        setFechaInicio(fechaInicioParam);
      }
      
      if (fechaFinParam) {
        setFechaFin(fechaFinParam);
      }
      
      // Construir objeto con parámetros de fecha para las APIs
      const dateParams: DateParams = {};
      if (fechaInicioParam) {
        dateParams.fechaInicio = fechaInicioParam;
      }
      if (fechaFinParam) {
        dateParams.fechaFin = fechaFinParam;
      }
      
      // Mostrar mensaje en la consola con los filtros aplicados
      if (fechaInicioParam || fechaFinParam) {
        console.log('Aplicando filtros a través de la URL:', {
          desde: fechaInicioParam || 'inicio',
          hasta: fechaFinParam || 'actualidad'
        });
      }
      
      // Cargar datos de resumen con parámetros de fecha
      if (Object.keys(dateParams).length > 0) {
        await fetchResumenData(dateParams);
      } else {
        await fetchResumenData();
      }
      
      // Cargar datos de estadísticas
      const statsEndpoint = Object.keys(dateParams).length > 0 ?
        `/dashboard/stats?fecha_inicio=${dateParams.fechaInicio || ''}&fecha_fin=${dateParams.fechaFin || ''}` :
        '/dashboard/stats';
        
      const statsResponse = await apiService.get(statsEndpoint);
      setStatsData(statsResponse);
      setLoading(prev => ({ ...prev, stats: false }));
      
      // Cargar datos de partos
      const partosEndpoint = Object.keys(dateParams).length > 0 ?
        `/dashboard/partos?fecha_inicio=${dateParams.fechaInicio || ''}&fecha_fin=${dateParams.fechaFin || ''}` :
        '/dashboard/partos';
        
      const partosResponse = await apiService.get(partosEndpoint);
      setPartosData(partosResponse);
      setLoading(prev => ({ ...prev, partos: false }));
      
      // Cargar datos combinados
      const combinedEndpoint = Object.keys(dateParams).length > 0 ?
        `/dashboard/combined?fecha_inicio=${dateParams.fechaInicio || ''}&fecha_fin=${dateParams.fechaFin || ''}` :
        '/dashboard/combined';
        
      const combinedResponse = await apiService.get(combinedEndpoint);
      setCombinedData(combinedResponse);
      setLoading(prev => ({ ...prev, combined: false }));
      
      // Cargar datos de explotaciones (no necesitan parámetros de fecha)
      await fetchExplotacionesData();
      
      addLog('✅ Datos del dashboard cargados correctamente');
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setError(prev => ({
        ...prev,
        global: 'Error cargando datos del dashboard. Inténtalo de nuevo más tarde.'
      }));
    }
  };
  
  // Cargar los datos inmediatamente
  loadDashboardData();
}, []);
```

## 4. Funciones de Carga de Datos

### 4.1 fetchResumenData
```tsx
const fetchResumenData = async (dateParams?: DateParams) => {
  try {
    // Iniciar el estado de carga
    setLoading(prev => ({ ...prev, resumen: true }));
    
    // Forma directa de construir la URL con parámetros - SIEMPRE con barra final para evitar redirecciones
    let endpoint = '/dashboard/resumen/';
    
    // Si hay parámetros de fecha, añadirlos directamente a la URL
    if (dateParams?.fechaInicio || dateParams?.fechaFin) {
      // NOTA IMPORTANTE: Cambiamos a formato de querystring directo para evitar problemas con caracteres
      endpoint = `/dashboard/resumen/?fecha_inicio=${dateParams.fechaInicio || ''}&fecha_fin=${dateParams.fechaFin || ''}`;
      addLog(`Iniciando petición a ${endpoint} con filtros de fecha directos`);
    } else {
      addLog('Iniciando petición a /dashboard/resumen/ sin filtros');
    }
    
    // Verificar token (no es necesario, apiService ya lo maneja)
    if (!localStorage.getItem('token')) {
      addLog('⚠️ No se encontró token en localStorage');
      setError(prev => ({ ...prev, resumen: 'No hay token de autenticación' }));
      setLoading(prev => ({ ...prev, resumen: false }));
      return null;
    }
    
    console.log('Endpoint a utilizar:', endpoint);
    
    // Usar apiService que detecta automáticamente la IP
    const response = await apiService.get(endpoint);
    
    addLog('✅ Datos de resumen recibidos');
    console.log('Datos de resumen recibidos:', response);
    
    // Validar estructura de datos
    if (!response || typeof response !== 'object') {
      throw new Error('Formato de respuesta inválido - datos vacíos');
    }
    
    // Definir valores predeterminados para campos requeridos
    const validatedData = {
      total_animales: response.total_animales ?? 0,
      total_terneros: response.total_terneros ?? 0,
      total_partos: response.total_partos ?? 0,
      ratio_partos_animal: response.ratio_partos_animal ?? 0,
      tendencias: response.tendencias ?? {
        partos_mes_anterior: 0,
        partos_actual: 0,
        nacimientos_promedio: 0
      },
      terneros: response.terneros ?? { total: 0 },
      explotaciones: response.explotaciones ?? { count: 0 },
      partos: response.partos ?? { total: 0 },
      periodo: response.periodo ?? {
        inicio: '2010-01-01',
        fin: new Date().toISOString().split('T')[0]
      }
    };
    
    // Actualizar estado con los datos validados (solo una vez)
    setResumenData(validatedData);
    
    addLog('Datos validados y procesados correctamente');
    
    // Actualizar el estado de carga
    setLoading(prev => ({ ...prev, resumen: false }));
    
    // Actualizar el estado de error
    setError(prev => ({ ...prev, resumen: null }));
    
    // Devolver los datos validados
    return validatedData;
    
  } catch (err) {
    // Manejar errores Axios
    if (axios.isAxiosError(err)) {
      addLog(`❌ Error en resumen: ${err.message}`);
      setError(prev => ({ ...prev, resumen: `Error: ${err.message}` }));
    } else {
      // Manejar otros tipos de errores
      addLog(`❌ Error desconocido en resumen: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
      setError(prev => ({ ...prev, resumen: 'Error procesando datos de resumen' }));
    }
    
    // Actualizar estado de carga en caso de error y proporcionar datos vacíos
    setResumenData({
      total_animales: 0,
      total_terneros: 0,
      total_partos: 0,
      ratio_partos_animal: 0,
      tendencias: {
        partos_mes_anterior: 0,
        partos_actual: 0,
        nacimientos_promedio: 0
      },
      terneros: { total: 0 },
      explotaciones: { count: 0 },
      partos: { total: 0 },
      periodo: {
        inicio: new Date().toISOString().split('T')[0],
        fin: new Date().toISOString().split('T')[0]
      }
    });
    setLoading(prev => ({ ...prev, resumen: false }));
  }
};
```

### 4.2 fetchStatsData, fetchPartosData, fetchCombinedData, fetchExplotacionesData 
Funciones similares a fetchResumenData pero para diferentes endpoints.

## 5. Funciones de Utilidad

### 5.1 addLog
```tsx
const addLog = (message: string) => {
  const timestamp = new Date().toISOString();
  setRequestLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  // Solo mostrar logs en modo desarrollo
  if (import.meta.env.DEV) {
    console.log(`[Dashboard] ${message}`);
  }
};
```

### 5.2 toggleTheme
```tsx
const toggleTheme = () => {
  setDarkMode(prev => !prev);
};
```

### 5.3 aplicarFiltroFechas
```tsx
const aplicarFiltroFechas = useCallback(async () => {
  try {
    // Mostrar estado de carga
    setLoading(prev => ({
      ...prev,
      resumen: true,
      stats: true,
      partos: true,
      combined: true
    }));

    // Método más simple: recargar la página con los parámetros de fecha
    // Esto asegura que todos los componentes se actualicen correctamente
    const currentUrl = new URL(window.location.href);
    
    // Limpiar parámetros existentes
    currentUrl.searchParams.delete('fecha_inicio');
    currentUrl.searchParams.delete('fecha_fin');
    
    // Añadir nuevos parámetros
    if (fechaInicio) {
      currentUrl.searchParams.append('fecha_inicio', fechaInicio);
    }
    
    if (fechaFin) {
      currentUrl.searchParams.append('fecha_fin', fechaFin);
    }
    
    // Guardar preferencias en localStorage para recuperarlas después
    localStorage.setItem('dashboard_fecha_inicio', fechaInicio || '');
    localStorage.setItem('dashboard_fecha_fin', fechaFin || '');
    
    console.log('Recargando dashboard con filtros de fecha:', {
      desde: fechaInicio || 'inicio', 
      hasta: fechaFin || 'actualidad'
    });
    
    // Recargar la página para que todos los componentes utilicen los nuevos parámetros
    window.location.href = currentUrl.toString();
    
  } catch (error) {
    console.error('Error aplicando filtros de fecha:', error);
    setError(prev => ({
      ...prev,
      global: 'Error al aplicar filtros de fecha'
    }));
    
    // Actualizar estado de carga incluso si hay error
    setLoading(prev => ({
      ...prev,
      resumen: false,
      stats: false,
      partos: false,
      combined: false
    }));
  }
}, [fechaInicio, fechaFin]);
```

## 6. Funciones de Renderizado de Componentes Visuales

### 6.1 renderGenderChart
```tsx
const renderGenderChart = (data: Record<string, number> | undefined) => {
  if (!data) return null;
  
  // Si el objeto está vacío o todos los valores son 0, mostrar un gráfico con valores de ejemplo
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    console.log('No hay datos para el gráfico de género, mostrando plantilla');
    data = {
      'Machos': 0,
      'Hembras': 0,
      'Otros': 0
    };
  }
  
  // Mapear etiquetas especiales
  const labels = Object.keys(data).map(key => {
    if (key === 'M') return 'Machos';
    if (key === 'F') return 'Hembras';
    return key;
  });
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Distribución por Género',
        data: Object.values(data),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // Azul
          'rgba(236, 72, 153, 0.7)', // Rosa
          'rgba(16, 185, 129, 0.7)', // Verde
          'rgba(239, 68, 68, 0.7)', // Rojo
          'rgba(245, 158, 11, 0.7)', // Ámbar
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return <Pie data={chartData} />
};
```

### 6.2 renderStatusChart
```tsx
const renderStatusChart = (data: Record<string, number> | undefined) => {
  if (!data) return null;
  
  // Si el objeto está vacío o todos los valores son 0, mostrar un gráfico con valores de ejemplo
  const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);
  if (Object.keys(data).length === 0 || totalValue === 0) {
    console.log('No hay datos para el gráfico de estado, mostrando plantilla');
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
```

### 6.3 Otros componentes visuales
```tsx
// StatCard, SectionTitle, DashboardCard, CardLabel, CardDivider
```

## 7. Estructura de la Renderización Principal

```tsx
return (
  <div 
    className={`dashboard-container ${darkMode ? 'theme-dark' : 'theme-light'}`} 
    data-component-name="DashboardEnhanced"
  >
    {/* Botón para cambiar tema */}
    <button onClick={toggleTheme}>
      {darkMode ? '☀️' : '🌙'}
    </button>

    {/* SECCIÓN 1: Resumen General - Estadísticas clave */}
    <SectionTitle number="1" title="Resumen General" />
    <div className="stats-grid-lg">
      {/* Contenido de resumen general */}
    </div>

    {/* SECCIÓN 2: Filtros de fecha */}
    <SectionTitle number="2" title="Filtros" />
    <div className="dashboard-card">
      {/* Selectores de fecha y botón de aplicar */}
    </div>

    {/* SECCIÓN 3: Análisis de Animales */}
    <SectionTitle number="3" title="Análisis de Animales" />
    <div className="stats-grid">
      {/* Tarjetas con gráficos de análisis animal */}
    </div>

    {/* SECCIÓN 4: Análisis de Partos */}
    <SectionTitle number="4" title="Análisis de Partos" />
    <div className="stats-grid">
      {/* Tarjetas con gráficos de análisis de partos */}
    </div>

    {/* SECCIÓN 5: Análisis por Explotación */}
    <SectionTitle number="5" title="Análisis por Explotación" />
    <div>
      {/* Tabla de explotaciones */}
    </div>
  </div>
);
```

## 8. Resumen de la Estructura

1. **Importaciones y Configuraciones**: Importa dependencias, componentes y configura ChartJS
2. **Estados**: Define numerosos estados para todas las partes del dashboard
3. **Efectos**: Implementa efectos para sincronización de temas, carga inicial y parámetros URL
4. **Funciones de Carga de Datos**: Implementa funciones fetch* para cada tipo de datos
5. **Funciones de Utilidad**: Implementa funciones helper como addLog, toggleTheme
6. **Funciones de Renderizado Visual**: Funciones para crear gráficos y componentes UI
7. **Renderizado Principal**: Estructura jerárquica con secciones numeradas

## 9. Conclusiones para la Optimización

Para optimizar este componente, debemos:

1. **Separar por Secciones**: Dividir cada sección numerada en su propio componente
2. **Centralizar Datos**: Mover toda la lógica de carga de datos a un hook o servicio
3. **Reutilizar Componentes UI**: Extraer componentes visuales como StatCard, SectionTitle
4. **Unificar Estilos**: Estandarizar los estilos para mejorar la consistencia
5. **Implementar Lazy Loading**: Cargar componentes pesados solo cuando son necesarios
6. **Optimizar Renders**: Usar React.memo y useMemo para evitar renderizados innecesarios
7. **Mejorar Gestión de Errores**: Implementar un sistema unificado de manejo de errores
