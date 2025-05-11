/**
 * DashboardEnhancedV2.tsx
 * ======================
 * 
 * PLAN DE DESPLIEGUE - PUNTO 1.2: OPTIMIZACIÓN DEL COMPONENTE DASHBOARD
 * 
 * Versión refactorizada del DashboardEnhanced que mantiene EXACTAMENTE la misma
 * estructura visual y funcionalidad, pero con el código organizado de forma más
 * modular y mantenible.
 * 
 * IMPORTANTE: Este componente es un orquestador que usa componentes más pequeños,
 * manteniendo visualmente idéntico el dashboard al original.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiService from '../../services/apiService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import './dashboardStyles.css';

// Importar componentes de secciones modulares que reemplazan el monolito original
import ResumenGeneralSection from './sections/ResumenGeneralSection';
import PartosSection from './sections/PartosSection';
import ExplotacionesSection from './sections/ExplotacionesSection';
import PeriodoAnalisisSection from './sections/PeriodoAnalisisSection';

// Importar componentes UI reutilizables
import { SectionTitle } from './components/UIComponents';

// Importar tipos
import type { 
  DashboardResumen, 
  DashboardStats, 
  PartosStats, 
  CombinedStats,
  ExplotacionInfo,
  AnimalStats,
  DateParams
} from './types/dashboard';

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
 * DashboardEnhancedV2 - Versión optimizada y modular del dashboard original
 * 
 * Mantiene EXACTAMENTE la misma apariencia visual pero divide el código en componentes
 * más pequeños para mejorar mantenibilidad. Este componente actúa como orquestador
 * de los demás.
 */
const DashboardEnhancedV2: React.FC = () => {
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
      // Usar todos los datos disponibles sin filtro de fecha para mostrar estadísticas globales
      addLog('Iniciando petición a /dashboard/stats sin filtros para mostrar datos históricos completos');
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
    };
  };

  const fetchCombinedData = async () => {
    try {
      // Código para obtener datos combinados
      addLog('Iniciando petición a /dashboard/combined usando apiService');
      
      const response = await apiService.get('/dashboard/combined');
      
      setCombinedData(response);
      setLoading(prev => ({ ...prev, combined: false }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en combined: ${err.message}`);
        setError(prev => ({ ...prev, combined: `Error: ${err.message}` }));
      } else {
        console.error('Error procesando datos combinados:', err);
        addLog(`❌ Error desconocido en combined: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setError(prev => ({ ...prev, combined: 'Error procesando datos combinados' }));
      }
      setLoading(prev => ({ ...prev, combined: false }));
    }
  };

  const fetchExplotacionesData = async () => {
    try {
      // Mostrar indicador de carga
      setLoading(prev => ({ ...prev, explotaciones: true }));
      setError(prev => ({ ...prev, explotaciones: null }));
      
      // Solicitar la lista de explotaciones
      const response = await apiService.get('/dashboard/explotacions');
      
      if (response && Array.isArray(response)) {
        // Eliminar duplicados basados en el campo 'explotacio'
        const uniqueExplotaciones = [];
        const explotacioSet = new Set();
        
        for (const exp of response) {
          if (!explotacioSet.has(exp.explotacio)) {
            explotacioSet.add(exp.explotacio);
            uniqueExplotaciones.push(exp);
          }
        }
        
        // Procesar las explotaciones para obtener toda la información necesaria
        const processedExplotaciones = [];
        
        for (const exp of uniqueExplotaciones) {
          try {
            // Obtener detalles básicos de la explotación
            const explotacionDetail = await apiService.get(`/dashboard/explotacions/${exp.explotacio}`);
            
            // Obtener estadísticas de animales
            const statsData = await apiService.get(`/dashboard/explotacions/${exp.explotacio}/stats`);
            
            // Extraer conteos de animales
            const toros = statsData?.animales_por_genero?.M || 0;
            const vacasSinCrias = statsData?.alletar?.["0"] || 0;
            const vacasConUnaCria = statsData?.alletar?.["1"] || 0;
            const vacasConDosCrias = statsData?.alletar?.["2"] || 0;
            
            // Calcular totales
            const totalAnimales = toros + vacasSinCrias + vacasConUnaCria + vacasConDosCrias;
            
            // Crear objeto completo con todos los datos
            processedExplotaciones.push({
              id: explotacionDetail.id || 0,
              explotacio: exp.explotacio,
              total_animales: totalAnimales,
              total_partos: statsData?.total_partos || 0,
              ratio: statsData?.total_partos > 0 ? (statsData.total_partos / (totalAnimales || 1)) : 0,
              activa: true,
              toros,
              alletar_0: vacasSinCrias,
              alletar_1: vacasConUnaCria,
              alletar_2: vacasConDosCrias
            });
          } catch (error) {
            console.error(`Error al procesar la explotación ${exp.explotacio}:`, error);
          }
        }
        
        // Actualizar el estado con las explotaciones procesadas
        setExplotaciones(processedExplotaciones);
      } else {
        // Manejar caso donde no hay datos
        setError(prev => ({ ...prev, explotaciones: 'No se encontraron explotaciones' }));
      }
      
      // Desactivar indicador de carga al final
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

  // Comprobar si todas las llamadas han finalizado (con éxito o error)
  const allLoaded = Object.values(loading).every(isLoading => isLoading === false);

  return (
    <div 
      className={`dashboard-container ${darkMode ? 'theme-dark' : 'theme-light'} ${allLoaded ? 'dashboard-ready' : ''}`}
      data-component-name="DashboardEnhancedV2"
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
      <SectionTitle number="1" title="Resumen General" darkMode={darkMode} />
      <div className="stats-grid-lg">
        <ResumenGeneralSection 
          statsData={statsData} 
          darkMode={darkMode} 
          loading={loading.stats || loading.partos} 
          error={error.stats || error.partos} 
        />
      </div>
      
      {/* SECCIÓN 2: Análisis de Partos - Estadísticas y gráficos */}
      <SectionTitle number="2" title="Análisis de Partos" darkMode={darkMode} />
      <div className="stats-grid-lg">
        <PartosSection 
          statsData={statsData} 
          partosData={partosData}
          darkMode={darkMode} 
          loading={loading.stats || loading.partos} 
          error={error.stats || error.partos} 
        />
      </div>
      
      {/* SECCIÓN 3: Principales Explotaciones */}
      <SectionTitle number="3" title="Principales Explotaciones" darkMode={darkMode} />
      <div className="stats-grid-lg">
        {/* Usamos el componente original, pero nos aseguramos de eliminar duplicados primero */}
        <ExplotacionesSection 
          explotaciones={explotaciones.filter((v, i, a) => 
            a.findIndex(t => (t.explotacio === v.explotacio)) === i
          )}
          darkMode={darkMode} 
          loading={loading.explotaciones} 
          error={error.explotaciones} 
        />
      </div>
      
      {/* Período de análisis con selectores */}
      <PeriodoAnalisisSection 
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        setFechaInicio={setFechaInicio}
        setFechaFin={setFechaFin}
        onFilterChange={aplicarFiltroFechas}
        darkMode={darkMode}
      />
    </div>
  );
}

export default DashboardEnhancedV2;
