/**
 * DashboardEnhanced.tsx
 * =====================
 * 
 * PLAN DE DESPLIEGUE - PUNTO 1.2: OPTIMIZACIÓN DEL COMPONENTE DASHBOARD
 * 
 * Este componente ha sido refactorizado para mejorar su rendimiento y mantenibilidad,
 * separándolo en componentes más pequeños organizados en las carpetas:
 * - charts/ - Componentes de gráficos específicos
 * - components/ - Componentes de UI reutilizables
 * - sections/ - Secciones completas del dashboard
 * 
 * El componente principal mantiene la gestión de estado y la lógica de comunicación con la API,
 * mientras que la renderización se ha delegado a componentes más específicos.
 */

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

/**
 * Componente Dashboard Mejorado con múltiples endpoints
 * Optimizado para rendimiento y mantenibilidad
 * 
 * La estructura de este componente ha sido refactorizada para mejorar 
 * su organización y mantenibilidad, delegando la renderización a componentes más pequeños
 * mientras mantiene centralizada la lógica de obtención de datos y gestión de estado.
 */

/**
 * Componente Dashboard Mejorado con múltiples endpoints
 * Optimizado para lazy loading y rendimiento
 */
const DashboardEnhanced: React.FC = () => {
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

  // Efecto para sincronizar con el tema global al cargar
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

  // Función para añadir logs de depuración - solo en desarrollo
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setRequestLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    // Solo mostrar logs en modo desarrollo
    if (import.meta.env.DEV) {
      console.log(`[Dashboard] ${message}`);
    }
  };

  // Funciones para obtener datos de los diferentes endpoints
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

  const fetchStatsData = async () => {
    try {
      addLog('Iniciando petición a /dashboard/stats usando apiService');
      
      // Verificar token (no es necesario, apiService ya lo maneja)
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, stats: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, stats: false }));
        return;
      }
      
      const response = await apiService.get('/dashboard/stats');
      
      addLog('✅ Datos de stats recibidos');
      console.log('Datos de stats recibidos:', response);

      // Usar response directamente en lugar de response.data
      if (!response) {
        addLog('⚠️ Respuesta vacía recibida en stats');
        throw new Error('Formato de respuesta inválido en stats - datos vacíos');
      }

      // Imprimir la estructura para depuración
      console.log('Estructura de stats:', {
        keys: Object.keys(response),
        type: typeof response,
        isArray: Array.isArray(response)
      });
      
      // Asegurar que otros campos requeridos estén presentes
      const defaultStats = {
        animales: {
          total: 0,
          machos: 0,
          hembras: 0,
          ratio_m_h: 0,
          por_estado: {},
          por_quadra: {},
          por_alletar: {},
          edades: {
            menos_1_año: 0,
            "1_2_años": 0,
            "2_5_años": 0,
            mas_5_años: 0
          }
        },
        partos: {
          total: 0,
          ultimo_mes: 0,
          ultimo_año: 0,
          promedio_mensual: 0,
          por_mes: {},
          por_genero_cria: { "M": 0, "F": 0 },
          tasa_supervivencia: 0,
          distribucion_anual: {}
        },
        explotaciones: {
          total: 0,
          activas: 0,
          inactivas: 0
        },
        comparativas: {
          mes_actual_vs_anterior: {
            partos: 0,
            animales: 0
          },
          año_actual_vs_anterior: {
            partos: 0
          }
        },
        periodo: {
          inicio: new Date().toISOString().split('T')[0],
          fin: new Date().toISOString().split('T')[0]
        }
      };
      
      // Utilizar una estrategia de fusión profunda para asegurar que la estructura sea completa
      const mergeObjects = (target: any, source: any) => {
        if (!source) return target;
        const result = {...target};
        
        for (const key in source) {
          if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = mergeObjects(result[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
        return result;
      };
      
      // Mezclar con valores predeterminados para campos faltantes
      const validatedData = mergeObjects(defaultStats, response);
      
      // Actualizar el estado con datos validados
      addLog('Datos de stats validados y procesados correctamente');
      setStatsData(validatedData);
      setLoading(prev => ({ ...prev, stats: false }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en stats: ${err.message}`);
        setError(prev => ({ ...prev, stats: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en stats: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, stats: 'Error procesando datos' }));
      }
      // Establecer valores predeterminados en caso de error
      setStatsData({
        animales: {
          total: 0,
          machos: 0,
          hembras: 0,
          ratio_m_h: 0,
          por_estado: {},
          por_quadra: {},
          por_alletar: {},
          edades: {
            menos_1_año: 0,
            "1_2_años": 0,
            "2_5_años": 0,
            mas_5_años: 0
          }
        },
        partos: {
          total: 0,
          ultimo_mes: 0,
          ultimo_año: 0,
          promedio_mensual: 0,
          por_mes: {},
          por_genero_cria: { "M": 0, "F": 0 },
          tasa_supervivencia: 0,
          distribucion_anual: {}
        },
        explotaciones: {
          total: 0,
          activas: 0,
          inactivas: 0
        },
        comparativas: {
          mes_actual_vs_anterior: {
            partos: 0,
            animales: 0
          },
          año_actual_vs_anterior: {
            partos: 0
          }
        },
        periodo: {
          inicio: new Date().toISOString().split('T')[0],
          fin: new Date().toISOString().split('T')[0]
        }
      });
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchPartosData = async () => {
    try {
      addLog('Iniciando petición a /dashboard/partos usando apiService');
      
      // Verificar token (no es necesario, apiService ya lo maneja)
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, partos: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, partos: false }));
        return;
      }
      
      const response = await apiService.get('/dashboard/partos');
      
      addLog('✅ Datos de partos recibidos');
      console.log('Datos de partos completos:', response);
      
      // Validar estructura de datos
      if (!response || typeof response !== 'object') {
        throw new Error('Formato de respuesta inválido en partos');
      }
      
      // Definir valores predeterminados para campos requeridos
      const defaultPartosData = {
        total: 0,
        por_mes: {},
        por_genero_cria: { M: 0, F: 0 },
        tasa_supervivencia: 0,
        distribucion_anual: {},
        tendencia: {},
        ultimo_mes: 0,
        ultimo_año: 0,
        promedio_mensual: 0
      };
      
      // Mezclar con valores predeterminados para campos faltantes
      const validatedData = {
        ...defaultPartosData,
        // Asegurarnos de que estos campos sean números válidos
        total: typeof response.total === 'number' ? response.total : 0,
        ultimo_mes: typeof response.ultimo_mes === 'number' ? response.ultimo_mes : 0,
        ultimo_año: typeof response.ultimo_año === 'number' ? response.ultimo_año : 0,
        tasa_supervivencia: typeof response.tasa_supervivencia === 'number' ? response.tasa_supervivencia : 0,
        // Asegurar que estos objetos estén presentes y no sean null
        por_mes: response.por_mes || {},
        por_genero_cria: response.por_genero_cria || { M: 0, F: 0 },
        distribucion_anual: response.distribucion_anual || {}
      };
      
      console.log('Datos de partos procesados:', validatedData);
      addLog(`Datos de partos validados correctamente`);
      setPartosData(validatedData);
      setLoading(prev => ({ ...prev, partos: false }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en partos: ${err.message}`);
        setError(prev => ({ ...prev, partos: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en partos: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, partos: 'Error procesando datos de partos' }));
      }
      setLoading(prev => ({ ...prev, partos: false }));
    }
  };

  const fetchCombinedData = async () => {
    try {
      addLog('Iniciando petición a /dashboard/combined usando apiService');
      
      const response = await apiService.get('/dashboard/combined');
      
      addLog('✅ Datos combinados recibidos');
      
      try {
        // Usar response directamente en lugar de response.data
        const dashboardData = response;
        const animales = dashboardData.animales || {};
        const partos = dashboardData.partos || {};
        
        // Procesar datos sobre rendimiento de partos
        if (dashboardData.rendimiento_partos) {
          setRendimientoPartos(dashboardData.rendimiento_partos);
        }
        
        // Actualizar tendencias
        if (dashboardData.tendencias) {
          setTendencias(dashboardData.tendencias);
        }
        
        // Actualizar distribución por quadra
        if (dashboardData.animales && dashboardData.animales.por_quadra) {
          setDistribucionPorQuadra(dashboardData.animales.por_quadra);
        }
        
        setCombinedData(dashboardData);
      } catch (err) {
        console.error('Error procesando datos combinados:', err);
        addLog(`❌ Error desconocido en combined: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, combined: 'Error procesando datos combinados' }));
      }
      setLoading(prev => ({ ...prev, combined: false }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en combined: ${err.message}`);
        setError(prev => ({ ...prev, combined: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en combined: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, combined: 'Error procesando datos combinados' }));
      }
      setLoading(prev => ({ ...prev, combined: false }));
    }
  };

  const fetchExplotacionesData = async () => {
    try {
      addLog('Iniciando petición a /dashboard/explotacions usando apiService');
      
      // Verificar token (no es necesario, apiService ya lo maneja)
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setError(prev => ({ ...prev, explotaciones: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, explotaciones: false }));
        return;
      }
      
      const response = await apiService.get('/dashboard/explotacions');
      
      addLog('✅ Lista de explotaciones recibida');
      
      // Extraer los datos principales del dashboard
      const animales = response.animales || {};
      const partos = response.partos || {};
      const explotacions = response.explotacions || {};
      
      // Obtener información de las 3 principales explotaciones
      if (response && response.length > 0) {
        const top3Explotaciones = response.slice(0, 3);
        const explotacionesInfo: ExplotacionInfo[] = [];
        
        for (const explotacion of top3Explotaciones) {
          try {
            const infoResponse = await apiService.get(`/dashboard/explotacions/${explotacion.explotacio}`);
            
            // La respuesta de apiService.get() ya contiene los datos directamente, no hace falta .data
            explotacionesInfo.push({
              ...infoResponse,  // Usar directamente la respuesta sin .data
              explotacio: explotacion.explotacio
            });
          } catch (err) {
            addLog(`⚠️ No se pudo obtener info de explotación ${explotacion.explotacio}`);
          }
        }
        
        setExplotaciones(explotacionesInfo);
      }
      
      setLoading(prev => ({ ...prev, explotaciones: false }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en explotaciones: ${err.message}`);
        setError(prev => ({ ...prev, explotaciones: `Error: ${err.message}` }));
      } else {
        addLog(`❌ Error desconocido en explotaciones`);
        setError(prev => ({ ...prev, explotaciones: 'Error desconocido' }));
      }
      setLoading(prev => ({ ...prev, explotaciones: false }));
    }
  };

  // Función para autenticar y obtener un token nuevo cada vez
  const authenticate = async () => {
    try {
      addLog('Iniciando autenticación con apiService.login');
      
      // Autenticar usando el apiService que ya tiene la IP correcta
      const loginResponse = await apiService.login('admin', 'admin123');
      
      // Guardar el token
      if (loginResponse.data && loginResponse.data.access_token) {
        localStorage.setItem('token', loginResponse.data.access_token);
        addLog('✅ Autenticación exitosa, token guardado');
        return loginResponse.data.access_token;
      } else {
        throw new Error('Token no encontrado en la respuesta');
      }
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en autenticación: ${err.message}`);
        throw new Error(`Error de autenticación: ${err.message}`);
      } else {
        addLog(`❌ Error desconocido en autenticación`);
        throw new Error('Error desconocido en autenticación');
      }
    }
  };

  // Función para cambiar tema manualmente
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // Cargar parámetros de fecha de la URL si existen
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

  // Función para aplicar filtros de fecha
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

  // Cargar datos al montar el componente
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

  // Renderizar gráfico de distribución por género
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
      if (key === 'esforrada') return 'Esforradas';
      return key;
    });
    
    // Asignar colores consistentes para cada categoría
    const colors: string[] = [];
    labels.forEach(label => {
      if (label === 'Machos' || label === 'Toros') colors.push('#1d4ed8'); // Azul oscuro para toros
      else if (label === 'Hembras' || label === 'Vacas') colors.push('#db2777'); // Rosa fuerte para vacas
      else if (label === 'Esforradas') colors.push('#8b5cf6'); // Púrpura
      else if (label === 'Fallecidos') colors.push('#f97316'); // Naranja
      else colors.push('#10b981'); // Verde para otros casos
    });

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: colors,
          borderWidth: 1,
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
      ],
    };

    return <Pie 
      data={chartData} 
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: darkMode ? '#e5e7eb' : '#374151',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0) as number;
                const percentage = total === 0 ? '0%' : Math.round((value / total) * 100) + '%';
                return `${context.label}: ${value} (${percentage})`;
              }
            }
          }
        }
      }} 
    />
  };

  // Renderizar gráfico de barras para distribución mensual
  const renderMonthlyChart = (data: Record<string, number> | undefined) => {
    if (!data) return null;
    
    // Crear array de todos los meses en español
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Si el objeto está vacío, mostrar un gráfico de barras con todos los meses pero valores 0
    if (Object.keys(data).length === 0) {
      const emptyData: Record<string, number> = {};
      months.forEach(month => {
        emptyData[month] = 0;
      });
      data = emptyData;
    }

    // Ordenar los meses en el orden correcto (de enero a diciembre)
    const monthOrder = {
      'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Ago': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12
    };
    
    // Preparar datos por mes asegurándonos que todos los meses estén representados
    const preparedData: Record<string, number> = {};
    months.forEach(month => {
      preparedData[month] = data[month] || 0;
    });
    
    // Generar colores para cada mes con diferentes tonalidades
    const colorGradient = [
      '#3b82f6', // azul
      '#60a5fa', // azul más claro
      '#93c5fd', // azul aún más claro
      '#2563eb', // azul más oscuro
      '#1e40af', // azul muy oscuro
      '#818cf8', // púrpura
      '#8b5cf6', // púrpura-azul
      '#6366f1', // indigo
      '#4f46e5', // indigo oscuro
      '#a855f7', // púrpura medio
      '#9333ea', // púrpura oscuro
      '#7c3aed'  // violeta
    ];

    const chartData = {
      labels: months, // Usar todos los meses en orden correcto
      datasets: [
        {
          label: 'Partos por mes',
          data: months.map(month => preparedData[month]),
          backgroundColor: colorGradient,
          borderWidth: 1,
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
      ],
    };

    return <Bar data={chartData} options={{
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0 // Solo mostrar enteros
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `Partos: ${value}`;
            }
          }
        }
      }
    }} />
  };

  // Renderizar gráfico de evolución anual de partos
  const renderYearlyChart = (data: Record<string, number> | undefined) => {
    if (!data) return null;
    
    // Asegurar que tenemos datos desde 2010 hasta el año actual
    const currentYear = new Date().getFullYear();
    const startYear = 2010;
    
    // Preparar datos asegurándonos que todos los años estén representados
    const years: string[] = [];
    const preparedData: number[] = [];
    
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year.toString());
      preparedData.push(data[year.toString()] || 0);
    }
    
    const chartData = {
      labels: years,
      datasets: [
        {
          label: 'Partos por año',
          data: preparedData,
          backgroundColor: '#0891b2', // Un tono de azul-verdoso
          borderColor: '#0e7490',    // Azul-verdoso más oscuro
          borderWidth: 1,
        },
      ],
    };

    return <Bar data={chartData} options={{
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0 // Solo mostrar enteros
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            title: (items) => `Año ${items[0].label}`,
            label: (context) => {
              const value = context.raw as number;
              return `Partos: ${value}`;
            }
          }
        }
      }
    }} />
  };

  // Renderizar gráfico de línea para tendencias
  const renderTrendChart = (data: Record<string, number> | undefined) => {
    if (!data) return null;

    const chartData = {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Tendencia',
          data: Object.values(data),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4,
        },
      ],
    };

    return <Line data={chartData} />
  };

  // Renderizar tarjeta de estadísticas
  const StatCard = ({ title, value, color }: { title: string, value: number | string, color: string }) => {
    return (
      <div 
        className={`${color}`} 
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginBottom: '0.5rem',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{color: 'white', fontWeight: 'bold', marginBottom: '0.25rem'}}>{title}</h3>
        <p style={{color: 'white', fontSize: '1.75rem', fontWeight: 'bold', margin: 0}}>{value}</p>
      </div>
    );
  };

  // Renderizar título de sección con número circular
  const SectionTitle = ({ number, title }: { number: string, title: string }) => {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.5rem',
        marginTop: '1rem',
        padding: '0.5rem',
        // Verde lima corporativo más claro que el principal
        backgroundColor: darkMode ? '#7cb518' : '#a4cc44', // Verde lima en modo oscuro, verde lima claro en modo claro
        border: 'none',
        borderRadius: '0.25rem', // Añadir bordes redondeados
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.5rem',
          height: '1.5rem',
          borderRadius: '9999px',
          backgroundColor: '#fff', // Fondo blanco
          color: '#88c425', // Color verde lima corporativo para el número
          fontWeight: 'bold',
          marginRight: '0.5rem',
        }}>
          {number}
        </div>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: 'white', // Texto blanco para ambos modos
        }}>{title}</h2>
      </div>
    );
  };

  // Renderizar tarjeta de dashboard para gráficos
  const DashboardCard = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => {
    return (
      <div 
        style={{
          backgroundColor: darkMode ? '#111827' : '#ffffff',
          color: darkMode ? '#f9fafb' : '#111827',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          border: darkMode ? '1px solid #374151' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        className={className}
        data-component-name="DashboardEnhanced"
      >
        <h3 
          style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: darkMode ? '#f9fafb' : '#111827',
          }}
          data-component-name="DashboardEnhanced"
        >
          {title}
        </h3>
        {children}
      </div>
    );
  };

  // Renderizar etiqueta para tarjeta
  const CardLabel = ({ children }: { children: React.ReactNode }) => {
    return (
      <div 
        style={{
          color: darkMode ? '#d1d5db' : '#4b5563',
          fontSize: '0.875rem',
          fontWeight: '500',
          marginBottom: '0.25rem'
        }}
        data-component-name="DashboardEnhanced"
      >
        {children}
      </div>
    );
  };

  // Renderizar divisor para tarjeta
  const CardDivider = ({ children }: { children: React.ReactNode }) => {
    return (
      <div 
        style={{
          borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          paddingBottom: '0.5rem',
          marginBottom: '0.5rem'
        }}
        data-component-name="DashboardEnhanced"
      >
        {children}
      </div>
    );
  };

  return (
    <div 
      className={`dashboard-container ${darkMode ? 'theme-dark' : 'theme-light'}`} 
      data-component-name="DashboardEnhanced"
    >
      {/* Botón para cambiar tema */}
      <button 
        onClick={toggleTheme} 
        style={{
          position: 'fixed',
          bottom: '6rem',
          left: '1rem',
          backgroundColor: darkMode ? '#374151' : '#e5e7eb',
          color: darkMode ? 'white' : 'black',
          padding: '0.75rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 20,
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
        }}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      {/* Sección de logs para desarrollo - COMPLETAMENTE ELIMINADA */}
      {false && (
        <div className="log-container" style={{ maxHeight: '200px', overflow: 'auto' }}>
          <h3 className="text-lg font-bold mb-2">Logs de desarrollo</h3>
          {requestLogs.map((log, index) => (
            <div key={index} className="text-sm mb-1">{log}</div>
          ))}
        </div>
      )}

      {/* SECCIÓN 1: Resumen General - Estadísticas clave */}
      <SectionTitle number="1" title="Resumen General" />
      <div className="stats-grid-lg">
        {loading.stats || loading.partos ? (
          <div className="col-span-12 text-center py-4">Cargando resumen general...</div>
        ) : (error.stats || error.partos) ? (
          <div className="col-span-12 text-center py-4 text-red-500">
            Error al cargar estadísticas: {error.stats || error.partos}
          </div>
        ) : (statsData && partosData) ? (
          <>
            {/* Tarjeta de resumen de animales */}
            <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
              <h3 className="text-lg font-semibold mb-4">Resumen de Animales</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{
                  backgroundColor: "#3b82f6",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Total Animales</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.total}</div>
                </div>
                <div style={{
                  backgroundColor: "#10b981",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Animales Vivos</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.por_estado["OK"] || 0}</div>
                </div>
                <div style={{
                  backgroundColor: "#6366f1",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Toros</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.machos}</div>
                </div>
                <div style={{
                  backgroundColor: "#8b5cf6",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Vacas</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.hembras}</div>
                </div>
              </div>
            </div>
            
            {/* Tarjeta de estado de amamantamiento */}
            <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
              <h3 className="text-lg font-semibold mb-4">Estado de Amamantamiento</h3>
              {statsData.animales.por_alletar ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                  <div style={{
                    backgroundColor: "#fbbf24",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    color: "white"
                  }}>
                    <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Vacas Sin Amamantar</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.por_alletar["0"] || 0}</div>
                  </div>
                  <div style={{
                    backgroundColor: "#f59e0b",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    color: "white"
                  }}>
                    <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Vacas con Un Ternero</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.por_alletar["1"] || 0}</div>
                  </div>
                  <div style={{
                    backgroundColor: "#ef4444",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    color: "white"
                  }}>
                    <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Vacas con Dos Terneros</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statsData.animales.por_alletar["2"] || 0}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No hay datos de amamantamiento disponibles</div>
              )}
            </div>
            
            {/* Gráfico de distribución*/}
            <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
              <h3 className="text-lg font-semibold mb-4">Análisis Poblacional</h3>
              <div className="h-64 flex items-center justify-center">
                {renderGenderChart({
                  'Toros': statsData.animales.machos,
                  'Vacas': statsData.animales.hembras,
                  'Fallecidos': statsData.animales.por_estado["DEF"] || 0
                })}
              </div>
              <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.875rem", color: darkMode ? "#9ca3af" : "#6b7280" }}>
                Ratio Machos/Hembras: <span style={{ fontWeight: "bold" }}>{statsData.animales.ratio_m_h.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-12 text-center py-4 text-gray-500">No hay datos disponibles</div>
        )}
      </div>
      
      {/* SECCIÓN 2: Análisis de Partos */}
      <SectionTitle number="2" title="Análisis de Partos" />
      <div className="stats-grid-lg">
        {loading.partos ? (
          <div className="col-span-12 text-center py-4">Cargando datos de partos...</div>
        ) : error.partos ? (
          <div className="col-span-12 text-center py-4 bg-yellow-100 dark:bg-yellow-900 p-3 rounded border border-yellow-300 dark:border-yellow-700">
            <h3 className="font-bold mb-2">Aviso: Datos parcialmente disponibles</h3>
            <p className="text-sm">
              Algunos datos de partos no están disponibles temporalmente debido a un problema técnico. 
              El equipo técnico está trabajando en solucionarlo.
            </p>
            <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Detalles técnicos: {error.partos}</p>
          </div>
        ) : partosData ? (
          <>
            {/* Tarjeta de estadísticas clave de partos */}
            <div className="dashboard-card" style={{ gridColumn: "span 4" }}>
              <h3 className="text-lg font-semibold mb-4">Resumen de Partos</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{
                  backgroundColor: "#4f46e5",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Total Partos</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{partosData.total}</div>
                </div>
                <div style={{
                  backgroundColor: "#06b6d4",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  {/* Usando el nombre del mes actual */}
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {new Date().toLocaleString('es-ES', { month: 'long' })}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{partosData.ultimo_mes}</div>
                </div>
                <div style={{
                  backgroundColor: "#0ea5e9",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  {/* Usando el año actual */}
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {new Date().getFullYear()}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{partosData.ultimo_año}</div>
                </div>
                <div style={{
                  backgroundColor: "#14b8a6",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  color: "white"
                }}>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Supervivencia</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{partosData.tasa_supervivencia.toFixed(1)}%</div>
                </div>
              </div>
            </div>
            
            {/* Gráfico de distribución mensual */}
            <div className="dashboard-card" style={{ gridColumn: "span 8" }}>
              <h3 className="text-lg font-semibold mb-4">Distribución Mensual de Partos</h3>
              <div className="h-64">
                {renderMonthlyChart(partosData.por_mes)}
              </div>
              <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.875rem", color: darkMode ? "#9ca3af" : "#6b7280" }}>
                Promedio mensual: <span style={{ fontWeight: "bold" }}>{partosData.promedio_mensual.toFixed(1)}</span> partos
              </div>
            </div>
            
            {/* Género de crías */}
            <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
              <h3 className="text-lg font-semibold mb-4">Distribución por Género</h3>
              <div style={{marginBottom: "10px", fontSize: "12px", color: "gray"}}>
                {/* Depuración de datos */}
                Datos por_genero_cria: {JSON.stringify(partosData.por_genero_cria)}
              </div>
              <div className="h-64 flex items-center justify-center">
                {renderGenderChart({
                  'Machos': partosData.por_genero_cria?.M || 0,
                  'Hembras': partosData.por_genero_cria?.F || 0,
                  'Esforradas': partosData.por_genero_cria?.esforrada || 0
                })}
              </div>
            </div>
            
            {/* Distribución anual */}
            <div className="dashboard-card" style={{ gridColumn: "span 6" }}>
              <h3 className="text-lg font-semibold mb-4">Evolución Anual</h3>
              <div className="h-64">
                {renderYearlyChart(partosData.distribucion_anual)}
              </div>
            </div>
            
            {/* Top animales si hay datos */}
            {partosData.por_animal && partosData.por_animal.length > 0 && (
              <div className="dashboard-card" style={{ gridColumn: "span 12" }}>
                <h3 className="text-lg font-semibold mb-4">Top Animales por Partos</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                  {partosData.por_animal.slice(0, 5).map((animal, index) => (
                    <div key={index} style={{
                      backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{animal.nom}</div>
                      <div style={{ fontSize: "0.875rem" }}>
                        ID: {animal.id} <span style={{ float: "right", fontWeight: "bold" }}>{animal.count} partos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-12 text-center py-4 text-gray-500">No hay datos de partos disponibles</div>
        )}
      </div>
      
      {/* SECCIÓN 3: Top Explotaciones */}
      <SectionTitle number="3" title="Principales Explotaciones" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", margin: "1rem 0" }}>
        {loading.explotaciones ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", backgroundColor: darkMode ? "#1f2937" : "#f9fafb", borderRadius: "0.5rem" }}>
            <div style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Cargando explotaciones...</div>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
          </div>
        ) : error.explotaciones ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "1rem", backgroundColor: darkMode ? "#991b1b" : "#fee2e2", color: darkMode ? "#fecaca" : "#991b1b", borderRadius: "0.5rem" }}>
            Error al cargar explotaciones: {error.explotaciones}
          </div>
        ) : explotaciones.length > 0 ? (
          explotaciones.map((expl, index) => (
            <div key={index} style={{
              backgroundColor: darkMode ? "#1f2937" : "#ffffff",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
              overflow: "hidden"
            }}>
              {/* Cabecera */}
              <div style={{
                backgroundColor: index === 0 ? "#4f46e5" : (index === 1 ? "#2563eb" : "#3b82f6"),
                color: "white",
                padding: "1rem",
                position: "relative"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>
                    {expl.nombre || expl.explotacio}
                  </h3>
                  <div style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.3)", 
                    borderRadius: "9999px", 
                    width: "1.75rem", 
                    height: "1.75rem", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontWeight: "bold"
                  }}>
                    #{index + 1}
                  </div>
                </div>
                <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Código: {expl.explotacio}</div>
              </div>
              
              {/* Detalles */}
              <div style={{ padding: "1rem" }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "0.5rem", 
                  marginBottom: "0.5rem",
                  textAlign: "center"
                }}>
                  <div style={{
                    backgroundColor: darkMode ? "#374151" : "#f3f4f6",
                    padding: "0.75rem",
                    borderRadius: "0.375rem"
                  }}>
                    <div style={{ fontSize: "0.875rem", color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "0.25rem" }}>Total Animales</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{expl.total_animales || 0}</div>
                  </div>
                  <div style={{
                    backgroundColor: darkMode ? "#374151" : "#f3f4f6",
                    padding: "0.75rem",
                    borderRadius: "0.375rem"
                  }}>
                    <div style={{ fontSize: "0.875rem", color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "0.25rem" }}>Total Partos</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{expl.total_partos || 0}</div>
                  </div>
                </div>
                
                {/* Distribución (se podría añadir si tuviéramos esos datos) */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: darkMode ? "#9ca3af" : "#6b7280" }}>
                  <div>Código de explotación: {expl.explotacio}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-4 text-gray-500">No hay explotaciones disponibles</div>
        )}
      </div>
      
      {/* Estadísticas Combinadas - COMPLETAMENTE ELIMINADAS */}
      {false && (
        <>
          <SectionTitle number="7" title="Estadísticas Combinadas" />
          <div className="combined-stats-grid">
            {loading.combined ? (
              <div className="col-span-2 text-center py-4">Cargando estadísticas combinadas...</div>
            ) : error.combined ? (
              <div className="col-span-2 text-center py-4 text-red-500">{error.combined}</div>
            ) : combinedData ? (
              <>
                <div className="dashboard-card">
                  <h3 className="text-lg font-semibold mb-4">Rendimiento de Partos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(combinedData?.rendimiento_partos || {}).map(([key, value], index) => (
                      <div key={index} className="card-divider">
                        <div className="card-label">{key}</div>
                        <div className="text-xl font-bold">{typeof value === 'number' ? value.toFixed(2) : value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="dashboard-card">
                  <h3 className="text-lg font-semibold mb-4">Tendencias</h3>
                  <div className="h-64">
                    {combinedData?.tendencias && Object.keys(combinedData?.tendencias || {}).length > 0 && 
                      renderTrendChart(Object.values(combinedData?.tendencias || {})[0])}
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center py-4 text-gray-500">No hay datos combinados disponibles</div>
            )}
          </div>
        </>
      )}
      
      {/* Período de análisis con selectores */}
      <div className="dashboard-card mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Período de Análisis</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({resumenData?.periodo?.inicio ? new Date(resumenData.periodo.inicio).toLocaleDateString() : '01/01/2010'} - {resumenData?.periodo?.fin ? new Date(resumenData.periodo.fin).toLocaleDateString() : new Date().toLocaleDateString()})
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <div className="w-1/2">
            <div className="card-label">Desde</div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="w-full p-2 border rounded-md text-sm"
                value={fechaInicio || ''}
                onChange={(e) => setFechaInicio(e.target.value)}
                min="2010-01-01"
                max={fechaFin || new Date().toISOString().split('T')[0]}
              />
              {fechaInicio && (
                <button 
                  onClick={() => setFechaInicio('')}
                  className="text-gray-500 hover:text-red-500"
                  title="Limpiar fecha"
                >
                  ❌
                </button>
              )}
            </div>
          </div>
          <div className="w-1/2">
            <div className="card-label">Hasta</div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="w-full p-2 border rounded-md text-sm"
                value={fechaFin || ''}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || '2010-01-01'}
                max={new Date().toISOString().split('T')[0]}
              />
              {fechaFin && (
                <button 
                  onClick={() => setFechaFin('')}
                  className="text-gray-500 hover:text-red-500"
                  title="Limpiar fecha"
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors duration-150"
            onClick={aplicarFiltroFechas}
          >
            Aplicar Filtro
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardEnhanced;
