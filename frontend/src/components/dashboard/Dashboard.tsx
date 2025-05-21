/**
 * DashboardEnhancedV2.tsx
 * ======================
 * SOLO SON VALIDOS LOS DATOS DINAMICOS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
// Importación eliminada: PeriodoAnalisisSection ya no se usa

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
 * Dashboard - Versión optimizada y modular
 * 
 * Mantiene la misma apariencia visual pero divide el código en componentes
 * más pequeños para mejorar mantenibilidad. Este componente actúa como orquestador
 * de los demás y obtiene todos los datos directamente de la API.
 */
const Dashboard: React.FC = () => {
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

  // Estado para mostrar el panel de depuración avanzado
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  
  // Estado para almacenar información de depuración adicional
  const [debugInfo, setDebugInfo] = useState<{
    apiUrl: string;
    isLocalTunnel: boolean;
    networkRequests: Array<{endpoint: string; status: string; time: string; error?: string}>;
    connectionInfo: {
      localIP: string;
      publicIP: string | null;
      userAgent: string;
      timeLastSuccess: string | null;
      isOnline: boolean;
    };
  }>({  
    apiUrl: '',
    isLocalTunnel: false,
    networkRequests: [],
    connectionInfo: {
      localIP: '',
      publicIP: null,
      userAgent: '',
      timeLastSuccess: null,
      isOnline: navigator.onLine
    }
  });

  // Efecto para sincronizar con el tema global al cargar y recopilar información de depuración
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
    
    // Recopilar información de depuración
    const collectDebugInfo = async () => {
      // Detectar si estamos en LocalTunnel
      const hostname = window.location.hostname;
      const isLocalTunnel = hostname.includes('loca.lt');
      
      // Obtener URL base de la API de apiService
      const apiBaseUrl = apiService.getBaseUrl ? apiService.getBaseUrl() : '';
      
      // Recopilar información del navegador y sistema
      setDebugInfo(prev => ({
        ...prev,
        apiUrl: apiBaseUrl,
        isLocalTunnel: isLocalTunnel,
        connectionInfo: {
          ...prev.connectionInfo,
          localIP: window.location.hostname,
          userAgent: navigator.userAgent,
          isOnline: navigator.onLine
        }
      }));
      
      // Intentar obtener la IP pública para depuración
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        if (data && data.ip) {
          setDebugInfo(prev => ({
            ...prev,
            connectionInfo: {
              ...prev.connectionInfo,
              publicIP: data.ip
            }
          }));
        }
      } catch (error) {
        console.error('No se pudo obtener la IP pública:', error);
      }
    };
    
    collectDebugInfo();
    
    // Monitorear estado de conexión
    const handleOnline = () => {
      setDebugInfo(prev => ({
        ...prev,
        connectionInfo: {
          ...prev.connectionInfo,
          isOnline: true
        }
      }));
      addLog('✅ Conexión a Internet restaurada');
    };
    
    const handleOffline = () => {
      setDebugInfo(prev => ({
        ...prev,
        connectionInfo: {
          ...prev.connectionInfo,
          isOnline: false
        }
      }));
      addLog('❌ Conexión a Internet perdida');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función mejorada para añadir logs de depuración - solo en desarrollo
  const addLog = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${isError ? '❌ ' : ''}${message}`;
    setRequestLogs(prev => [formattedMessage, ...prev]);
    
    // Detección del entorno de desarrollo usando el hostname
    const isDev = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname.includes('loca.lt');
    
    // Solo mostrar logs en modo desarrollo o si es un error
    if (isDev || isError) {
      if (isError) {
        console.error(`[Dashboard] ${message}`);
      } else {
        console.log(`[Dashboard] ${message}`);
      }
    }
  };
  
  // Función para registrar información de peticiones HTTP
  const trackNetworkRequest = (endpoint: string, status: string, error?: string) => {
    const time = new Date().toISOString();
    setDebugInfo(prev => ({
      ...prev,
      networkRequests: [
        { endpoint, status, time, error },
        ...prev.networkRequests.slice(0, 19) // Mantener solo las últimas 20 peticiones
      ],
      connectionInfo: {
        ...prev.connectionInfo,
        timeLastSuccess: status === 'success' ? time : prev.connectionInfo.timeLastSuccess
      }
    }));
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
        endpoint = `/dashboard/resumen/?start_date=${dateParams.fechaInicio || ''}&end_date=${dateParams.fechaFin || ''}`;
        addLog(`Iniciando petición a ${endpoint} con filtros de fecha directos`);
      } else {
        addLog('Iniciando petición a /dashboard/resumen/ sin filtros');
      }
      
      // Verificar token (no es necesario, apiService ya lo maneja)
      if (!localStorage.getItem('token')) {
        addLog('❌ No hay token en localStorage', true);
        setError(prev => ({ ...prev, resumen: 'No hay token de autenticación' }));
        setLoading(prev => ({ ...prev, resumen: false }));
        return null;
      }
      
      console.log('Endpoint a utilizar:', endpoint);
      
      // Usar apiService que detecta automáticamente la IP
      addLog(`Realizando petición GET a ${endpoint}`);
      trackNetworkRequest(endpoint, 'pending');
      
      const response = await apiService.get(endpoint);
      trackNetworkRequest(endpoint, 'success');
      addLog('✅ Datos de resumen recibidos');
      console.log('Datos de resumen recibidos:', response);
      
      // Validar estructura de datos
      if (!response || typeof response !== 'object') {
        const error = 'Formato de respuesta inválido - datos vacíos';
        trackNetworkRequest(endpoint, 'error', error);
        throw new Error(error);
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
      
      // SOLO USAR DATOS DINÁMICOS - NADA DE VALORES PREDETERMINADOS
      
      // Verificar que la respuesta contenga los datos necesarios
      if (!response.distribucion_anual || !response.por_mes || !response.por_genero_cria) {
        console.error('Error crítico: Datos de partos incompletos del backend', response);
        throw new Error('Datos de partos incompletos del backend');
      }
      
      // Usar SOLO los datos dinámicos del backend sin mezclar con valores predeterminados
      const validatedData = response;
      
      console.log('Datos de partos procesados:', validatedData);
      addLog(`Datos de partos validados correctamente`);
      setPartosData(validatedData);
      setLoading(prev => ({ ...prev, partos: false }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg = `Error en partos: ${err.message}`;
        addLog(errorMsg, true);
        setError(prev => ({ ...prev, partos: `Error: ${err.message}` }));
        trackNetworkRequest('/dashboard/partos', 'error', errorMsg);
        
        // Información detallada del error para depuración
        if (err.response) {
          // La solicitud fue realizada y el servidor respondió con un código de estado fuera del rango 2xx
          addLog(`Detalles del error - Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data || {})}`, true);
        } else if (err.request) {
          // La solicitud fue realizada pero no se recibió respuesta
          addLog(`Error: No se recibió respuesta del servidor`, true);
        }
      } else {
        const errorMsg = `Error desconocido en partos: ${err instanceof Error ? err.message : 'Error sin detalles'}`;
        addLog(errorMsg, true);
        setError(prev => ({ ...prev, partos: 'Error procesando datos de partos' }));
        trackNetworkRequest('/dashboard/partos', 'error', errorMsg);
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
        const errorMsg = `Error en combined: ${err.message}`;
        addLog(errorMsg, true);
        setError(prev => ({ ...prev, combined: `Error: ${err.message}` }));
        trackNetworkRequest('/dashboard/combined', 'error', errorMsg);
        
        // Información detallada del error para depuración
        if (err.response) {
          // La solicitud fue realizada y el servidor respondió con un código de estado fuera del rango 2xx
          addLog(`Detalles del error - Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data || {})}`, true);
        } else if (err.request) {
          // La solicitud fue realizada pero no se recibió respuesta
          addLog(`Error: No se recibió respuesta del servidor`, true);
        }
      } else {
        const errorMsg = `Error desconocido en combined: ${err instanceof Error ? err.message : 'Error sin detalles'}`;
        addLog(errorMsg, true);
        setError(prev => ({ ...prev, combined: 'Error procesando datos combinados' }));
        trackNetworkRequest('/dashboard/combined', 'error', errorMsg);
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
          if (exp && exp.explotacio && !explotacioSet.has(exp.explotacio)) {
            explotacioSet.add(exp.explotacio);
            uniqueExplotaciones.push(exp);
          }
        }
        
        // Procesar las explotaciones para obtener toda la información necesaria
        const processedExplotaciones = [];
        
        // Definir interfaz para los animales para usarla en todas las explotaciones
        interface Animal {
          id: number;
          nom: string;
          genere: string;
          estado: string;
          alletar: number;
          explotacio: string;
        }
        
        for (const exp of uniqueExplotaciones) {
          try {
            console.log(`Procesando explotación: ${exp.explotacio}`);
            
            // Obtener detalles básicos de la explotación
            const explotacionDetail = await apiService.get(`/dashboard/explotacions/${encodeURIComponent(exp.explotacio)}`);
            console.log(`Detalles de explotación:`, explotacionDetail);
            
            // Obtener estadísticas de animales
            const statsData = await apiService.get(`/dashboard/explotacions/${encodeURIComponent(exp.explotacio)}/stats`);
            console.log(`Estadísticas:`, statsData);
            
            // Obtener los datos reales de animales para esta explotación
            const animalesResponse = await apiService.get(`/animals/?explotacio=${encodeURIComponent(exp.explotacio)}`);
            console.log(`Respuesta de animales:`, animalesResponse?.length ? `${animalesResponse.length} animales` : animalesResponse);
            
            // La API siempre devuelve un objeto con estructura {status, data: {items}}. Vamos a obtener los items directamente
            console.log(`Respuesta de la API para ${exp.explotacio}:`, animalesResponse);
            
            // Definir interfaz para los animales
            interface Animal {
              id: number;
              nom: string;
              genere: string;
              estado: string;
              alletar: number | string | null;
              explotacio: string;
            }
            
            // Procesamos correctamente la respuesta de la API en formato {status, data: {items}}
            let animalesList: Animal[] = [];
            
            if (animalesResponse && typeof animalesResponse === 'object') {
              if ('data' in animalesResponse && typeof animalesResponse.data === 'object' && animalesResponse.data !== null) {
                if ('items' in animalesResponse.data && Array.isArray(animalesResponse.data.items)) {
                  animalesList = animalesResponse.data.items;
                  console.log(`Extraídos ${animalesList.length} animales de estructura data.items`);
                } else if (Array.isArray(animalesResponse.data)) {
                  animalesList = animalesResponse.data;
                  console.log(`Extraídos ${animalesList.length} animales de estructura data array`);
                }
              } else if (Array.isArray(animalesResponse)) {
                animalesList = animalesResponse;
                console.log(`La respuesta ya es un array de ${animalesResponse.length} elementos`);
              }
            }
            
            if (animalesList.length === 0) {
              console.log(`No hay animales en la explotación ${exp.explotacio}`);
            } else {
              console.log(`Procesados correctamente ${animalesList.length} animales para la explotación ${exp.explotacio}`);
            }
            
            console.log(`Procesando ${animalesList.length} animales para explotación ${exp.explotacio}`);
            
            // Analizar cada animal para confirmar su estructura
            animalesList.forEach((animal: Animal, index: number) => {
              console.log(`Animal #${index+1}:`, {
                id: animal.id,
                nom: animal.nom,
                genere: animal.genere,
                estado: animal.estado,
                alletar: animal.alletar,
                tipo: typeof animal.alletar
              });
            });
            
            // Filtrar solo animales activos (estado = "OK")
            const animalesActivos = animalesList.filter((animal: Animal) => {
              // Verificación básica del objeto
              if (!animal || typeof animal !== 'object') {
                console.warn('Animal no válido encontrado:', animal);
                return false;
              }
              
              // Verificar estado (OK = activo)
              const estadoNormalizado = animal.estado?.toString().toUpperCase();
              const esActivo = estadoNormalizado === "OK";
              
              console.log(`Animal ${animal.nom || 'sin nombre'}: estado=${estadoNormalizado}, activo=${esActivo}`);
              return esActivo;
            });
            
            console.log(`Total animales ACTIVOS: ${animalesActivos.length}`);
            
            // Toros activos
            const torosActivos = animalesActivos.filter((animal: Animal) => {
              const generoNormalizado = animal.genere?.toString().toUpperCase();
              const esToro = generoNormalizado === "M";
              
              if (esToro) {
                console.log(`Toro activo encontrado: ${animal.nom}`);
              }
              
              return esToro;
            }).length;
            
            console.log(`Total TOROS activos: ${torosActivos}`);
            
            // Vacas activas
            const vacasActivas = animalesActivos.filter((animal: Animal) => {
              const generoNormalizado = animal.genere?.toString().toUpperCase();
              const esVaca = generoNormalizado === "F";
              
              if (esVaca) {
                console.log(`Vaca activa encontrada: ${animal.nom}, alletar=${animal.alletar}`);
              }
              
              return esVaca;
            }).length;
            
            console.log(`Total VACAS activas: ${vacasActivas}`);
            
            // Vacas por alletar (asegurarse de normalizar los valores)
            function normalizarAlletar(valor: number | string | null | undefined): number {
              // Convertir a número si es posible
              if (valor === null || valor === undefined) return 0;
              if (typeof valor === 'string') {
                const parsed = parseInt(valor, 10);
                return isNaN(parsed) ? 0 : parsed;
              }
              return typeof valor === 'number' ? valor : 0;
            }
            
            // Vacas sin crías (alletar = 0)
            const vacasAlletar0 = animalesActivos.filter((animal: Animal) => {
              const generoNormalizado = animal.genere?.toString().toUpperCase();
              const alletar = normalizarAlletar(animal.alletar);
              const esVacaSinCrias = generoNormalizado === "F" && alletar === 0;
              
              if (esVacaSinCrias) {
                console.log(`Vaca sin crías: ${animal.nom}, alletar original=${animal.alletar}, normalizado=${alletar}`);
              }
              
              return esVacaSinCrias;
            }).length;
            
            // Vacas con 1 cría (alletar = 1)
            const vacasAlletar1 = animalesActivos.filter((animal: Animal) => {
              const generoNormalizado = animal.genere?.toString().toUpperCase();
              const alletar = normalizarAlletar(animal.alletar);
              const esVacaConUnaCria = generoNormalizado === "F" && alletar === 1;
              
              if (esVacaConUnaCria) {
                console.log(`Vaca con 1 cría: ${animal.nom}, alletar original=${animal.alletar}, normalizado=${alletar}`);
              }
              
              return esVacaConUnaCria;
            }).length;
            
            // Vacas con 2 crías (alletar = 2)
            const vacasAlletar2 = animalesActivos.filter((animal: Animal) => {
              const generoNormalizado = animal.genere?.toString().toUpperCase();
              const alletar = normalizarAlletar(animal.alletar);
              const esVacaConDosCrias = generoNormalizado === "F" && alletar === 2;
              
              if (esVacaConDosCrias) {
                console.log(`Vaca con 2 crías: ${animal.nom}, alletar original=${animal.alletar}, normalizado=${alletar}`);
              }
              
              return esVacaConDosCrias;
            }).length;
            
            console.log(`Vacas por alletar: 0=${vacasAlletar0}, 1=${vacasAlletar1}, 2=${vacasAlletar2}`)
            
            // Total de animales activos = toros activos + vacas activas
            const totalAnimales = torosActivos + vacasActivas;
            
            // Usar los datos de la API para fallecidos si es necesario
            const animalesFallecidos = statsData?.animales?.por_estado?.DEF || 0;
            
            // Obtener el total de partos de la estructura correcta
            const totalPartos = statsData?.partos?.total || 0;
            
            // Preparar los valores para alletar usando los datos reales
            const vacasSinCrias = vacasAlletar0;
            const vacasConUnaCria = vacasAlletar1;
            const vacasConDosCrias = vacasAlletar2;
            
            // Usar datos reales en lugar de proporciones calculadas
            const alletar0Activas = vacasAlletar0;
            const alletar1Activas = vacasAlletar1;
            const alletar2Activas = vacasAlletar2;
            
            // Valores para datos estadísticos
            const hembrasActivas = vacasActivas;
            const toros = torosActivos;
            
            // Crear objeto completo con todos los datos para la tabla
            // Importante: usamos sólo los datos calculados a partir de los animales reales de la API
            const explotacionData = {
              id: explotacionDetail?.id || 0,
              explotacio: exp.explotacio,
              total_animales: animalesList.length, // Total de todos los animales (incluidos fallecidos)
              total_animales_activos: animalesActivos.length, // Sólo animales activos (estado="OK")
              vacas: animalesList.filter((animal: Animal) => animal.genere?.toString().toUpperCase() === "F").length, // Total de vacas incluyendo fallecidas
              vacas_activas: vacasActivas, // Sólo vacas activas
              toros: animalesList.filter((animal: Animal) => animal.genere?.toString().toUpperCase() === "M").length, // Total de toros incluyendo fallecidos
              toros_activos: torosActivos, // Sólo toros activos
              terneros: explotacionDetail?.total_terneros || 0, // Mantener de explotacionDetail
              partos: totalPartos,
              total_partos: totalPartos,
              ratio: animalesActivos.length > 0 ? parseFloat((totalPartos / animalesActivos.length).toFixed(2)) : 0,
              activa: true,
              alletar_0: vacasAlletar0, // Valor real
              alletar_1: vacasAlletar1, // Valor real
              alletar_2: vacasAlletar2, // Valor real
              alletar_0_activas: vacasAlletar0, // Para vacas activas son los mismos valores
              alletar_1_activas: vacasAlletar1, // Para vacas activas son los mismos valores 
              alletar_2_activas: vacasAlletar2, // Para vacas activas son los mismos valores
              ultima_actualizacion: explotacionDetail?.ultima_actualizacion
            };
            
            // Log para depuración
            console.log(`Datos finales para explotación ${exp.explotacio}:`, {
              animales_totales: animalesList.length,
              animales_activos: animalesActivos.length,
              toros_totales: animalesList.filter((animal: Animal) => animal.genere?.toString().toUpperCase() === "M").length,
              toros_activos: torosActivos,
              vacas_totales: animalesList.filter((animal: Animal) => animal.genere?.toString().toUpperCase() === "F").length,
              vacas_activas: vacasActivas,
              vacas_alletar0: vacasAlletar0,
              vacas_alletar1: vacasAlletar1,
              vacas_alletar2: vacasAlletar2,
              partos: totalPartos
            });
            
            console.log(`Datos procesados para ${exp.explotacio}:`, explotacionData);
            processedExplotaciones.push(explotacionData);
          } catch (error) {
            console.error(`Error al procesar la explotación ${exp.explotacio}:`, error);
          }
        }
        
        // Actualizar el estado con las explotaciones procesadas
        console.log(`Total de explotaciones procesadas: ${processedExplotaciones.length}`);
        setExplotaciones(processedExplotaciones);
      } else {
        console.error('Respuesta de explotaciones no es un array:', response);
        setError(prev => ({
          ...prev,
          explotaciones: 'No se pudieron obtener datos de explotaciones. Formato de respuesta incorrecto.'
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos de explotaciones:', error);
      setError(prev => ({
        ...prev,
        explotaciones: 'Error al obtener datos de explotaciones'
      }));
    } finally {
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
        const errorMsg = `Error en autenticación: ${err.message}`;
        addLog(errorMsg, true);
        throw new Error(`Error de autenticación: ${err.message}`);
      } else {
        const errorMsg = `Error desconocido en autenticación`;
        addLog(errorMsg, true);
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
    const fechaInicioParam = params.get('start_date');
    const fechaFinParam = params.get('end_date');
    
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
      currentUrl.searchParams.delete('start_date');
      currentUrl.searchParams.delete('end_date');
      
      // Añadir nuevos parámetros
      if (fechaInicio) {
        currentUrl.searchParams.append('start_date', fechaInicio);
      }
      
      if (fechaFin) {
        currentUrl.searchParams.append('end_date', fechaFin);
      }
      
      // Guardar preferencias en localStorage para recuperarlas después
      localStorage.setItem('dashboard_start_date', fechaInicio || '');
      localStorage.setItem('dashboard_end_date', fechaFin || '');
      
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
        addLog('🔄 Cargando datos completos del dashboard, incluyendo TODOS los partos históricos');
        
        // Establecer fecha final como hoy
        const today = new Date();
        const fechaFinISO = today.toISOString().split('T')[0];
        setFechaFin(fechaFinISO);
        
        // IMPORTANTE: Establecer fecha de inicio como el parto más antiguo (Emma, 01/05/1978)
        // en lugar de obtenerla de la URL o del backend
        const fechaInicioEmma = '1978-05-01';
        setFechaInicio(fechaInicioEmma);
        
        // Registrar que estamos usando la fecha real del parto más antiguo
        addLog(`✅ Usando fecha real del parto más antiguo: ${fechaInicioEmma} (Emma)`);
        console.log(`✅ Usando fecha real del parto más antiguo: ${fechaInicioEmma} (Emma)`);
        
        // Construir objeto con parámetros de fecha para las APIs
        // Siempre usamos fechaInicio=1978-05-01 (Emma) y fechaFin=hoy
        const dateParams: DateParams = {
          fechaInicio: fechaInicioEmma,
          fechaFin: fechaFinISO
        };
        
        // Mostrar mensaje en la consola
        addLog(`✅ Analizando TODOS los datos históricos desde ${fechaInicioEmma} hasta ${fechaFinISO}`)
        
        // Mostrar mensaje en la consola con los fechas usadas
        console.log('Aplicando fechas para cargar datos:', {
          desde: dateParams.fechaInicio,
          hasta: dateParams.fechaFin
        });
        
        // Cargar datos de resumen con parámetros de fecha
        if (Object.keys(dateParams).length > 0) {
          await fetchResumenData(dateParams);
        } else {
          await fetchResumenData();
        }
        
        // Cargar datos de estadísticas
        const statsEndpoint = Object.keys(dateParams).length > 0 ?
          `/dashboard/stats?start_date=${dateParams.fechaInicio || ''}&end_date=${dateParams.fechaFin || ''}` :
          '/dashboard/stats';
          
        const statsResponse = await apiService.get(statsEndpoint);
        setStatsData(statsResponse);
        setLoading(prev => ({ ...prev, stats: false }));
        
        // Cargar datos de partos
        const partosEndpoint = Object.keys(dateParams).length > 0 ?
          `/dashboard/partos?start_date=${dateParams.fechaInicio || ''}&end_date=${dateParams.fechaFin || ''}` :
          '/dashboard/partos';
          
        const partosResponse = await apiService.get(partosEndpoint);
        setPartosData(partosResponse);
        setLoading(prev => ({ ...prev, partos: false }));
        
        // Cargar datos combinados
        const combinedEndpoint = Object.keys(dateParams).length > 0 ?
          `/dashboard/combined?start_date=${dateParams.fechaInicio || ''}&end_date=${dateParams.fechaFin || ''}` :
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

  // Función para mostrar/ocultar panel de depuración
  const toggleDebugPanel = () => {
    setShowDebugPanel(prev => !prev);
  };

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
      {/* Botón para mostrar/ocultar panel de depuración avanzado */}
      <button 
        onClick={toggleDebugPanel} 
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '5px 10px',
          background: showDebugPanel ? '#ff4757' : '#2ed573',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        {showDebugPanel ? 'Ocultar Debug' : 'Mostrar Debug'}
      </button>

      {/* Panel de depuración avanzado - visible siempre pero toggle */}
      {showDebugPanel && (
        <div className="debug-container" style={{
          position: 'fixed',
          bottom: '50px',
          right: '10px',
          width: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: '#f1f2f6',
          border: '1px solid #dfe4ea',
          borderRadius: '8px',
          padding: '15px',
          zIndex: 9998,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '12px',
          color: '#333'
        }}>
          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px', marginTop: 0 }}>Panel de Depuración Avanzado</h3>
          
          <div className="connection-info" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '5px' }}>Información de Conexión</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td><strong>Estado:</strong></td>
                  <td>{debugInfo.connectionInfo.isOnline ? '🟢 Online' : '🔴 Offline'}</td>
                </tr>
                <tr>
                  <td><strong>LocalTunnel:</strong></td>
                  <td>{debugInfo.isLocalTunnel ? '✅ Sí' : '❌ No'}</td>
                </tr>
                <tr>
                  <td><strong>URL API:</strong></td>
                  <td style={{ wordBreak: 'break-word' }}>{debugInfo.apiUrl}</td>
                </tr>
                <tr>
                  <td><strong>IP Local:</strong></td>
                  <td>{debugInfo.connectionInfo.localIP}</td>
                </tr>
                <tr>
                  <td><strong>IP Pública:</strong></td>
                  <td>{debugInfo.connectionInfo.publicIP || 'Desconocida'}</td>
                </tr>
                <tr>
                  <td><strong>Última conexión exitosa:</strong></td>
                  <td>{debugInfo.connectionInfo.timeLastSuccess || 'Ninguna'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="loading-status" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '5px' }}>Estado de carga por sección:</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(loading).map(([key, value]) => (
                  <tr key={key}>
                    <td><strong>{key}:</strong></td>
                    <td>{value ? '⏳ Cargando...' : '✅ Completado'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="error-status" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '5px' }}>Errores:</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(error).map(([key, value]) => (
                  <tr key={key}>
                    <td><strong>{key}:</strong></td>
                    <td style={{ color: value ? '#ff4757' : '#2ed573' }}>{value || 'Sin errores'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="network-requests" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '5px' }}>Últimas peticiones:</h4>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px' }}>
              {debugInfo.networkRequests.length > 0 ? (
                debugInfo.networkRequests.map((req, index) => (
                  <div key={index} style={{ 
                    padding: '4px', 
                    borderBottom: '1px solid #eee',
                    color: req.status === 'error' ? '#ff4757' : req.status === 'success' ? '#2ed573' : '#70a1ff'
                  }}>
                    [{req.time.substring(11, 19)}] {req.endpoint} - {req.status}
                    {req.error && <div style={{ color: '#ff4757', marginTop: '2px' }}>{req.error}</div>}
                  </div>
                ))
              ) : (
                <p>No hay peticiones registradas</p>
              )}
            </div>
          </div>
          
          <div className="request-logs" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '5px' }}>Logs de peticiones:</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px' }}>
              {requestLogs.map((log, index) => (
                <div 
                  key={index} 
                  className="log-entry" 
                  style={{ 
                    padding: '3px 0', 
                    borderBottom: '1px solid #eee',
                    color: log.includes('❌') ? '#ff4757' : log.includes('✅') ? '#2ed573' : 'inherit',
                    fontSize: '11px'
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          <div className="actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={() => setRequestLogs([])} 
              style={{
                padding: '5px 10px',
                background: '#ff6b81',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Limpiar logs
            </button>
            <button 
              onClick={toggleDebugPanel} 
              style={{
                padding: '5px 10px',
                background: '#5352ed',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* SECCIÓN 1: Resumen General - Estadísticas clave */}
      <SectionTitle number="1" title="Resumen General" darkMode={darkMode} translationKey="dashboard.summary" />
      <div className="stats-grid-lg">
        <ResumenGeneralSection 
          statsData={statsData} 
          darkMode={darkMode} 
          loading={loading.stats || loading.partos} 
          error={error.stats || error.partos} 
        />
      </div>
      
      {/* SECCIÓN 2: Análisis de Partos - Estadísticas y gráficos */}
      <SectionTitle number="2" title="Análisis de Partos" darkMode={darkMode} translationKey="dashboard.partos_analysis" />
      <div className="stats-grid-lg">
        <PartosSection 
          statsData={statsData} 
          partosData={partosData}
          darkMode={darkMode} 
          loading={loading.stats || loading.partos} 
          error={error.stats || error.partos} 
        />
      </div>
      
      {/* SECCIÓN 3: Principales Explotaciones - TEMPORALMENTE OCULTA */}
      {false && (
        <>
          <SectionTitle number="3" title="Principales Explotaciones" darkMode={darkMode} translationKey="dashboard.exploitations" />
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
        </>
      )}
      
      {/* ELIMINADA sección de período de análisis para mostrar siempre todos los datos históricos */}
    </div>
  );
}

export default Dashboard;
