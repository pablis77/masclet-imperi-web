import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiService from '../../../services/apiService';

// Importamos los tipos utilizando la ruta de la carpeta principal
import type { 
  DashboardResumen, 
  DashboardStats, 
  PartosStats, 
  CombinedStats, 
  ExplotacionInfo
} from '../../dashboard/types';

// Interfaz para los parámetros de fecha
export interface DateParams {
  fechaInicio?: string;
  fechaFin?: string;
}

interface DashboardDataState {
  resumenData: DashboardResumen | null;
  statsData: DashboardStats | null;
  partosData: PartosStats | null;
  combinedData: CombinedStats | null;
  explotaciones: ExplotacionInfo[];
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
}

/**
 * Hook personalizado para gestionar todos los datos del dashboard
 */
export const useDashboardData = () => {
  // Estados para los diferentes endpoints
  const [state, setState] = useState<DashboardDataState>({
    resumenData: null,
    statsData: null,
    partosData: null,
    combinedData: null,
    explotaciones: [],
    loading: {
      resumen: true,
      stats: true,
      partos: true,
      combined: true,
      explotaciones: true
    },
    error: {
      resumen: null,
      stats: null,
      partos: null,
      combined: null,
      explotaciones: null,
      global: null
    }
  });

  // Estado para logs de peticiones (útil para depuración)
  const [requestLogs, setRequestLogs] = useState<string[]>([]);

  // Función para añadir logs de depuración
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString();
    setRequestLogs(prev => [...prev, `${timestamp} - ${message}`]);
    console.log(`[DashboardData] ${message}`);
  }, []);

  // Funciones para obtener datos de los diferentes endpoints
  const fetchResumenData = useCallback(async (dateParams?: DateParams) => {
    try {
      // Construimos la URL con los parámetros de consulta
      let endpoint = '/dashboard/resumen/';
      
      // Añadir parámetros de fecha si existen
      if (dateParams?.fechaInicio || dateParams?.fechaFin) {
        const searchParams = new URLSearchParams();
        
        if (dateParams.fechaInicio) {
          searchParams.append('fecha_inicio', dateParams.fechaInicio);
        }
        
        if (dateParams.fechaFin) {
          searchParams.append('fecha_fin', dateParams.fechaFin);
        }
        
        // Añadir parámetros a la URL
        endpoint = `${endpoint}?${searchParams.toString()}`;
      }
      
      addLog(`Iniciando petición a ${endpoint}`);
      
      // Verificar token
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setState(prev => ({
          ...prev,
          error: { ...prev.error, resumen: 'No hay token de autenticación' },
          loading: { ...prev.loading, resumen: false }
        }));
        return;
      }
      
      const response = await apiService.get(endpoint);
      
      addLog('✅ Datos de resumen recibidos');
      
      if (!response) {
        addLog('⚠️ Respuesta vacía recibida');
        throw new Error('Formato de respuesta inválido - datos vacíos');
      }
      
      // Validar y establecer valores predeterminados
      const validatedData = {
        total_animales: response.total_animales ?? 0,
        total_terneros: response.total_terneros ?? 0,
        total_partos: response.total_partos ?? 0,
        ratio_partos_animal: response.ratio_partos_animal ?? 0,
        tendencias: response.tendencias ? {
          partos_mes_anterior: response.tendencias.partos_mes_anterior ?? 0,
          partos_actual: response.tendencias.partos_actual ?? 0,
          nacimientos_promedio: response.tendencias.nacimientos_promedio ?? 0
        } : {
          partos_mes_anterior: 0,
          partos_actual: 0,
          nacimientos_promedio: 0
        },
        terneros: response.terneros ? { total: response.terneros.total ?? 0 } : { total: 0 },
        explotaciones: response.explotaciones ? { count: response.explotaciones.count ?? 0 } : { count: 0 },
        partos: response.partos ? { total: response.partos.total ?? 0 } : { total: 0 },
        periodo: response.periodo ? {
          inicio: response.periodo.inicio ?? new Date().toISOString().split('T')[0],
          fin: response.periodo.fin ?? new Date().toISOString().split('T')[0]
        } : {
          inicio: new Date().toISOString().split('T')[0],
          fin: new Date().toISOString().split('T')[0]
        }
      };
      
      setState(prev => ({
        ...prev,
        resumenData: validatedData,
        loading: { ...prev.loading, resumen: false },
        error: { ...prev.error, resumen: null }
      }));
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en resumen: ${err.message}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, resumen: `Error: ${err.message}` },
          loading: { ...prev.loading, resumen: false }
        }));
      } else {
        addLog(`❌ Error desconocido en resumen: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, resumen: 'Error procesando datos de resumen' },
          loading: { ...prev.loading, resumen: false }
        }));
      }
    }
  }, [addLog]);

  const fetchStatsData = useCallback(async (dateParams?: DateParams) => {
    try {
      // Construimos la URL con los parámetros de consulta
      let endpoint = '/dashboard/stats';
      
      // Añadir parámetros de fecha si existen
      if (dateParams?.fechaInicio || dateParams?.fechaFin) {
        const searchParams = new URLSearchParams();
        
        if (dateParams.fechaInicio) {
          searchParams.append('fecha_inicio', dateParams.fechaInicio);
        }
        
        if (dateParams.fechaFin) {
          searchParams.append('fecha_fin', dateParams.fechaFin);
        }
        
        // Añadir parámetros a la URL
        endpoint = `${endpoint}?${searchParams.toString()}`;
      }
      
      addLog(`Iniciando petición a ${endpoint} usando apiService`);
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setState(prev => ({
          ...prev,
          error: { ...prev.error, stats: 'No hay token de autenticación' },
          loading: { ...prev.loading, stats: false }
        }));
        return;
      }
      
      const response = await apiService.get(endpoint);
      
      addLog('✅ Datos de stats recibidos');

      if (!response) {
        addLog('⚠️ Respuesta vacía recibida en stats');
        throw new Error('Formato de respuesta inválido en stats - datos vacíos');
      }

      setState(prev => ({
        ...prev,
        statsData: response,
        loading: { ...prev.loading, stats: false },
        error: { ...prev.error, stats: null }
      }));
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en stats: ${err.message}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, stats: `Error: ${err.message}` },
          loading: { ...prev.loading, stats: false }
        }));
      } else {
        addLog(`❌ Error desconocido en stats: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, stats: 'Error procesando datos de estadísticas' },
          loading: { ...prev.loading, stats: false }
        }));
      }
    }
  }, [addLog]);

  const fetchPartosData = useCallback(async (dateParams?: DateParams) => {
    try {
      // Construimos la URL con los parámetros de consulta
      let endpoint = '/dashboard/partos';
      
      // Añadir parámetros de fecha si existen
      if (dateParams?.fechaInicio || dateParams?.fechaFin) {
        const searchParams = new URLSearchParams();
        
        if (dateParams.fechaInicio) {
          searchParams.append('fecha_inicio', dateParams.fechaInicio);
        }
        
        if (dateParams.fechaFin) {
          searchParams.append('fecha_fin', dateParams.fechaFin);
        }
        
        // Añadir parámetros a la URL
        endpoint = `${endpoint}?${searchParams.toString()}`;
      }
      
      addLog(`Iniciando petición a ${endpoint} usando apiService`);
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setState(prev => ({
          ...prev,
          error: { ...prev.error, partos: 'No hay token de autenticación' },
          loading: { ...prev.loading, partos: false }
        }));
        return;
      }
      
      const response = await apiService.get(endpoint);
      
      addLog('✅ Datos de partos recibidos');

      if (!response) {
        addLog('⚠️ Respuesta vacía recibida en partos');
        throw new Error('Formato de respuesta inválido en partos - datos vacíos');
      }

      setState(prev => ({
        ...prev,
        partosData: response,
        loading: { ...prev.loading, partos: false },
        error: { ...prev.error, partos: null }
      }));
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en partos: ${err.message}`);
        setState(prev => ({
          ...prev, 
          error: { ...prev.error, partos: `Error: ${err.message}` },
          loading: { ...prev.loading, partos: false }
        }));
      } else {
        addLog(`❌ Error desconocido en partos: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, partos: 'Error procesando datos de partos' },
          loading: { ...prev.loading, partos: false }
        }));
      }
    }
  }, [addLog]);

  const fetchCombinedData = useCallback(async (dateParams?: DateParams) => {
    try {
      // Construimos la URL con los parámetros de consulta
      let endpoint = '/dashboard/combined';
      
      // Añadir parámetros de fecha si existen
      if (dateParams?.fechaInicio || dateParams?.fechaFin) {
        const searchParams = new URLSearchParams();
        
        if (dateParams.fechaInicio) {
          searchParams.append('fecha_inicio', dateParams.fechaInicio);
        }
        
        if (dateParams.fechaFin) {
          searchParams.append('fecha_fin', dateParams.fechaFin);
        }
        
        // Añadir parámetros a la URL
        endpoint = `${endpoint}?${searchParams.toString()}`;
      }
      
      addLog(`Iniciando petición a ${endpoint} usando apiService`);
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setState(prev => ({
          ...prev,
          error: { ...prev.error, combined: 'No hay token de autenticación' },
          loading: { ...prev.loading, combined: false }
        }));
        return;
      }
      
      const response = await apiService.get(endpoint);
      
      addLog('✅ Datos combinados recibidos');

      if (!response) {
        addLog('⚠️ Respuesta vacía recibida en combined');
        throw new Error('Formato de respuesta inválido en combined - datos vacíos');
      }

      setState(prev => ({
        ...prev,
        combinedData: response,
        loading: { ...prev.loading, combined: false },
        error: { ...prev.error, combined: null }
      }));
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en combined: ${err.message}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, combined: `Error: ${err.message}` },
          loading: { ...prev.loading, combined: false }
        }));
      } else {
        addLog(`❌ Error desconocido en combined: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, combined: 'Error procesando datos combinados' },
          loading: { ...prev.loading, combined: false }
        }));
      }
    }
  }, [addLog]);

  const fetchExplotacionesData = useCallback(async () => {
    try {
      addLog('Iniciando petición a /dashboard/explotacions usando apiService');
      
      if (!localStorage.getItem('token')) {
        addLog('⚠️ No se encontró token en localStorage');
        setState(prev => ({
          ...prev,
          error: { ...prev.error, explotaciones: 'No hay token de autenticación' },
          loading: { ...prev.loading, explotaciones: false }
        }));
        return;
      }
      
      const response = await apiService.get('/dashboard/explotacions');
      
      addLog('✅ Lista de explotaciones recibida');
      
      if (response && response.length > 0) {
        const top3Explotaciones = response.slice(0, 3);
        const explotacionesInfo: ExplotacionInfo[] = [];
        
        for (const explotacion of top3Explotaciones) {
          try {
            const infoResponse = await apiService.get(`/dashboard/explotacions/${explotacion.explotacio}`);
            
            explotacionesInfo.push({
              ...infoResponse,
              explotacio: explotacion.explotacio
            });
          } catch (err) {
            addLog(`⚠️ No se pudo obtener info de explotación ${explotacion.explotacio}`);
          }
        }
        
        setState(prev => ({
          ...prev,
          explotaciones: explotacionesInfo,
          loading: { ...prev.loading, explotaciones: false },
          error: { ...prev.error, explotaciones: null }
        }));
      } else {
        setState(prev => ({
          ...prev,
          explotaciones: [],
          loading: { ...prev.loading, explotaciones: false },
          error: { ...prev.error, explotaciones: null }
        }));
      }
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        addLog(`❌ Error en explotaciones: ${err.message}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, explotaciones: `Error: ${err.message}` },
          loading: { ...prev.loading, explotaciones: false }
        }));
      } else {
        addLog(`❌ Error desconocido en explotaciones: ${err instanceof Error ? err.message : 'Error sin detalles'}`);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, explotaciones: 'Error procesando datos de explotaciones' },
          loading: { ...prev.loading, explotaciones: false }
        }));
      }
    }
  }, [addLog]);

  // Función para cargar todos los datos del dashboard
  const fetchData = useCallback(async (dateParams?: DateParams) => {
    addLog('Iniciando carga de datos del dashboard' + 
      (dateParams ? ` con parámetros de fecha: ${JSON.stringify(dateParams)}` : ''));
    
    setState(prev => ({
      ...prev,
      loading: {
        resumen: true,
        stats: true,
        partos: true,
        combined: true,
        explotaciones: true
      },
      error: {
        ...prev.error,
        global: null
      }
    }));

    try {
      // Cargar todos los datos de forma paralela
      await Promise.all([
        fetchResumenData(dateParams),
        fetchStatsData(),
        fetchPartosData(),
        fetchCombinedData(),
        fetchExplotacionesData()
      ]);
      
      addLog('✅ Todos los datos cargados exitosamente');
    } catch (error) {
      addLog(`❌ Error global al cargar datos: ${error}`);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, global: 'Error al cargar datos del dashboard' }
      }));
    }
  }, [fetchResumenData, fetchStatsData, fetchPartosData, fetchCombinedData, fetchExplotacionesData, addLog]);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    try {
      addLog('Cargando todos los datos del dashboard');
      
      // Cargar todos los endpoints en paralelo para acelerar la carga
      await Promise.all([
        fetchData(),
        fetchExplotacionesData()
      ]);
      
      addLog('✅ Todos los datos del dashboard cargados correctamente');
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setState(prev => ({
        ...prev,
        error: { 
          ...prev.error, 
          global: 'Error cargando datos del dashboard. Inténtalo de nuevo más tarde.' 
        }
      }));
    }
  }, [fetchData, fetchExplotacionesData, addLog]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    ...state,
    requestLogs,
    loadAllData,
    fetchResumenData,
    fetchStatsData,
    fetchPartosData,
    fetchCombinedData,
    fetchExplotacionesData
  };
};

export default useDashboardData;
