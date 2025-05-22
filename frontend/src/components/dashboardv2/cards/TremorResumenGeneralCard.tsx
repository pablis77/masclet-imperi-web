/**
 * TremorResumenGeneralCard.tsx
 * ======================
 * [DASHBOARDV2] Componente mejorado de resumen general utilizando Tremor.
 * 
 * Este componente muestra estadísticas clave del sistema utilizando visualizaciones
 * avanzadas de la biblioteca Tremor.
 * 
 * SOLO UTILIZA DATOS DINÁMICOS de los endpoints:
 * - /api/v1/dashboard/stats
 * - /api/v1/dashboard/resumen/
 */

import React, { useState, useEffect } from 'react';
import type { DashboardStats, DashboardResumen } from '../../dashboard/types/dashboard';
import apiService from '../../../services/apiService';

// Importar configuración de Chart.js
import { registerChartComponents } from '../../../utils/chartConfig';

// Registrar los componentes de Chart.js antes de usarlos
registerChartComponents();

// Importaciones de Tremor
import {
  Card,
  Text,
  Metric,
  Flex,
  ProgressBar,
  DonutChart,
  BarChart,
  Title,
  Grid,
  Col,
  Tab,
  TabList,
  TabGroup,
  Badge,
  List,
  ListItem,
  Divider
} from '@tremor/react';

interface TremorResumenGeneralCardProps {
  statsData: DashboardStats | null;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
}

const TremorResumenGeneralCard: React.FC<TremorResumenGeneralCardProps> = ({
  statsData,
  loading,
  error,
  darkMode
}) => {
  // Estado para almacenar los datos adicionales
  const [resumenData, setResumenData] = useState<DashboardResumen | null>(null);
  const [animalesDetallados, setAnimalesDetallados] = useState<any>(null);
  
  // Estados para control de carga y errores
  const [loadingResumen, setLoadingResumen] = useState<boolean>(true);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);
  const [loadingDetallados, setLoadingDetallados] = useState<boolean>(true);
  const [errorDetallados, setErrorDetallados] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Función para agregar logs
  const addLog = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${isError ? '❌ ' : ''}${message}`;
    setLogs(prev => [formattedMessage, ...prev]);
    
    if (isError) {
      console.error(`[TremorResumenCard] ${message}`);
    } else {
      console.log(`[TremorResumenCard] ${message}`);
    }
  };

  // Efecto para cargar datos
  useEffect(() => {
    const loadAllData = async () => {
      // Cargar datos de resumen
      try {
        addLog('Obteniendo datos del endpoint de resumen...');
        setLoadingResumen(true);
        
        // Llamada al endpoint /api/v1/dashboard/resumen/
        const resumenResponse = await apiService.get('/dashboard/resumen/');
        
        // Diagnóstico detallado
        console.log('DATOS RECIBIDOS RESUMEN:', resumenResponse);
        
        setResumenData(resumenResponse);
        setLoadingResumen(false);
        setErrorResumen(null);
        addLog('✅ Datos de resumen cargados correctamente');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        addLog(`Error obteniendo datos de resumen: ${errorMsg}`, true);
        setErrorResumen(errorMsg);
        setLoadingResumen(false);
      }
      
      // Cargar datos detallados de animales
      try {
        addLog('Obteniendo datos detallados de animales...');
        setLoadingDetallados(true);
        
        // Llamada al nuevo endpoint /api/v1/dashboard-detallado/animales-detallado
        const detalladosResponse = await apiService.get('/dashboard-detallado/animales-detallado');
        
        // Diagnóstico detallado
        console.log('DATOS DETALLADOS DE ANIMALES:', detalladosResponse);
        
        setAnimalesDetallados(detalladosResponse);
        setLoadingDetallados(false);
        setErrorDetallados(null);
        addLog('✅ Datos detallados de animales cargados correctamente');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        addLog(`Error obteniendo datos detallados de animales: ${errorMsg}`, true);
        setErrorDetallados(errorMsg);
        setLoadingDetallados(false);
        // No bloqueamos el resto de la aplicación si este endpoint falla
      }
    };
    
    loadAllData();
  }, []);

  // Verificamos si hay algún error o si estamos cargando datos
  if (loading || loadingResumen || loadingDetallados) {
    return (
      <Card className={darkMode ? "bg-gray-800 text-white" : ""}>
        <Flex className="gap-4">
          <div className="w-full">
            <Text>Cargando estadísticas...</Text>
            <ProgressBar value={60} color="blue" className="mt-3" />
          </div>
        </Flex>
      </Card>
    );
  }

  if (error || errorResumen || errorDetallados) {
    return (
      <Card className={darkMode ? "bg-gray-800 text-white" : ""}>
        <Title>Error al cargar datos</Title>
        <Text className="text-red-500">
          {error || errorResumen || errorDetallados}
        </Text>
      </Card>
    );
  }

  // Preparamos los datos para los gráficos - estructura correcta según la API
  const animales = statsData?.animales || {
    total: 0,
    machos: 0,
    hembras: 0,
    por_estado: { OK: 0, DEF: 0 },
    por_alletar: { "0": 0, "1": 0, "2": 0 },
    ratio_m_h: 0
  };
  
  console.log('DATOS PREPARADOS ANIMALES:', animales);

  // Datos para el gráfico de donut de géneros (estructura correcta según la API)
  const generoData = [
    { name: "Toros", value: animales.machos || 0 },
    { name: "Vacas", value: animales.hembras || 0 }
  ];

  // Datos para el gráfico de donut de estado (estructura correcta según la API)
  const estadoData = [
    { name: "Activos", value: animales.por_estado?.OK || 0 },
    { name: "Fallecidos", value: animales.por_estado?.DEF || 0 }
  ];

  // Datos para el gráfico de amamantamiento
  const alletarData = Object.entries(animales.por_alletar || {}).map(([key, value]) => {
    // Mapeamos los valores de alletar a nombres descriptivos
    const alletarNames: Record<string, string> = {
      "0": "Sin amamantar",
      "1": "1 ternero",
      "2": "2 terneros"
    };
    
    return {
      name: alletarNames[key] || key,
      value: value
    };
  });

  // Resumen de partos
  const partosStats = statsData?.partos || {
    total: 0,
    ultimo_mes: 0,
    ultimo_año: 0,
    tasa_supervivencia: 0
  };

  // Datos para el gráfico de distribución mensual
  const distribucionMensualData = Object.entries(statsData?.partos?.por_mes || {}).map(([key, value]) => {
    return {
      mes: key,
      partos: value
    };
  });

  // Información adicional del resumen si está disponible
  const resumen = resumenData || {
    total_animales: animales.total || 0,
    total_terneros: 0,
    total_partos: partosStats.total || 0,
    ratio_partos_animal: 0,
    tendencias: {
      partos_mes_anterior: 0,
      partos_actual: 0,
      nacimientos_promedio: 0
    },
    periodo: {
      inicio: "N/A",
      fin: "N/A"
    }
  };

  return (
    <Card className={`p-6 ${darkMode ? "bg-gray-800 text-white" : ""}`}>
      <Title className="mb-4">Panel de Control Masclet Imperi</Title>
      <Text className="mb-6">
        Período: {resumen.periodo.inicio} a {resumen.periodo.fin}
      </Text>
      
      <TabGroup>
        <TabList className="mb-4">
          <Tab>Resumen General</Tab>
          <Tab>Distribución</Tab>
          <Tab>Tendencias</Tab>
        </TabList>
        
        {/* Pestaña 1: Resumen General */}
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mb-4">
          <Card decoration="top" decorationColor="indigo" className={darkMode ? "bg-gray-700" : ""}>
            <Text>Total Animales</Text>
            <Metric>{animales.total || 0}</Metric>
            <Flex className="mt-4">
              <Text>Ratio M/H</Text>
              <Badge color="blue">{animales.ratio_m_h.toFixed(2)}</Badge>
            </Flex>
          </Card>
          <Card decoration="top" decorationColor="blue" className={darkMode ? "bg-gray-700" : ""}>
            <Text>Toros</Text>
            <Metric>{animalesDetallados?.por_genero?.machos?.total || animales.machos || 0}</Metric>
            <Flex className="mt-4">
              <Text>Activos</Text>
              <Badge color="green">{animalesDetallados?.por_genero?.machos?.activos || 0}</Badge>
            </Flex>
            {animalesDetallados?.por_genero?.machos?.fallecidos > 0 && (
              <Flex className="mt-2">
                <Text>Fallecidos</Text>
                <Badge color="red">{animalesDetallados?.por_genero?.machos?.fallecidos || 0}</Badge>
              </Flex>
            )}
          </Card>
          
          <Card decoration="top" decorationColor="pink" className={darkMode ? "bg-gray-700" : ""}>
            <Text>Vacas</Text>
            <Metric>{animalesDetallados?.por_genero?.hembras?.total || animales.hembras || 0}</Metric>
            <Flex className="mt-4">
              <Text>Activas</Text>
              <Badge color="green">{animalesDetallados?.por_genero?.hembras?.activas || 0}</Badge>
            </Flex>
            {animalesDetallados?.por_genero?.hembras?.fallecidas > 0 && (
              <Flex className="mt-2">
                <Text>Fallecidas</Text>
                <Badge color="red">{animalesDetallados?.por_genero?.hembras?.fallecidas || 0}</Badge>
              </Flex>
            )}
          </Card>
          
          <Card decoration="top" decorationColor="green" className={darkMode ? "bg-gray-700" : ""}>
            <Text>Estado</Text>
            <Metric>{animalesDetallados?.general?.activos || animales.por_estado?.OK || 0} activos</Metric>
            <Flex className="mt-4">
              <Text>Fallecidos</Text>
              <Badge color="red">{animalesDetallados?.general?.fallecidos || animales.por_estado?.DEF || 0}</Badge>
            </Flex>
          </Card>
          
          <Card decoration="top" decorationColor="amber" className={darkMode ? "bg-gray-700" : ""}>
            <Text>Partos</Text>
            <Metric>{partosStats.total || 0}</Metric>
            <Flex className="mt-4">
              <Text>Último mes</Text>
              <Badge color="amber">{partosStats.ultimo_mes || 0}</Badge>
            </Flex>
          </Card>
        </Grid>
        
        {/* Segunda fila */}
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
          <Card className={darkMode ? "bg-gray-700" : ""}>
            <Title>Distribución por Género</Title>
            <DonutChart
              data={generoData}
              category="value"
              index="name"
              valueFormatter={(value: number) => `${value} animales`}
              colors={["blue", "pink"]}
              className="mt-4 h-40"
            />
          </Card>
          
          <Card className={darkMode ? "bg-gray-700" : ""}>
            <Title>Estado de Animales</Title>
            <DonutChart
              data={estadoData}
              category="value"
              index="name"
              valueFormatter={(value: number) => `${value} animales`}
              colors={["green", "red"]}
              className="mt-4 h-40"
            />
          </Card>
          
          <Card className={darkMode ? "bg-gray-700" : ""}>
            <Title>Estado de Amamantamiento</Title>
            <DonutChart
              data={alletarData}
              category="value"
              index="name"
              valueFormatter={(value: number) => `${value} vacas`}
              colors={["blue", "cyan", "sky"]}
              className="mt-4 h-40"
            />
          </Card>
        </Grid>
        
        {/* Pestaña 2: Distribución */}
        <Grid numItems={1} numItemsSm={2} className="gap-4 mt-4">
          <Card className={darkMode ? "bg-gray-700" : ""}>
            <Title>Distribución Mensual de Partos</Title>
            <BarChart
              data={distribucionMensualData}
              index="mes"
              categories={["partos"]}
              colors={["amber"]}
              valueFormatter={(value: number) => `${value} partos`}
              className="mt-6 h-72"
            />
          </Card>
          
          <Card className={darkMode ? "bg-gray-700" : ""}>
            <Title>Métricas de Rendimiento</Title>
            <List className="mt-4">
              <ListItem>
                <Text>Ratio Partos/Animal</Text>
                <Badge color="amber">{resumen.ratio_partos_animal.toFixed(2)}</Badge>
              </ListItem>
              <ListItem>
                <Text>Tasa de Supervivencia</Text>
                <Badge color="green">{(partosStats.tasa_supervivencia * 100).toFixed(1)}%</Badge>
              </ListItem>
              <ListItem>
                <Text>Total Terneros</Text>
                <Badge color="blue">{resumen.total_terneros}</Badge>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>Partos Último Año</Text>
                <Badge color="indigo">{partosStats.ultimo_año}</Badge>
              </ListItem>
            </List>
          </Card>
        </Grid>
        
        {/* Pestaña 3: Tendencias */}
        <Grid numItems={1} className="gap-4 mt-4">
          <Card className={darkMode ? "bg-gray-700" : ""}>
            <Title>Tendencias de Partos</Title>
            <Grid numItems={1} numItemsSm={3} className="gap-4 mt-4">
              <Card decoration="top" decorationColor="blue" className={darkMode ? "bg-gray-600" : ""}>
                <Text>Mes Anterior</Text>
                <Metric>{resumen.tendencias.partos_mes_anterior}</Metric>
              </Card>
              <Card decoration="top" decorationColor="green" className={darkMode ? "bg-gray-600" : ""}>
                <Text>Mes Actual</Text>
                <Metric>{resumen.tendencias.partos_actual}</Metric>
                {resumen.tendencias.partos_actual > resumen.tendencias.partos_mes_anterior ? (
                  <Badge color="green" className="mt-2">↑ Aumento</Badge>
                ) : (
                  <Badge color="red" className="mt-2">↓ Disminución</Badge>
                )}
              </Card>
              <Card decoration="top" decorationColor="amber" className={darkMode ? "bg-gray-600" : ""}>
                <Text>Promedio Mensual</Text>
                <Metric>{resumen.tendencias.nacimientos_promedio.toFixed(1)}</Metric>
              </Card>
            </Grid>
          </Card>
        </Grid>
      </TabGroup>

      {/* Panel de logs de diagnóstico (visible solo en desarrollo) */}
      {logs.length > 0 && (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="font-medium">Logs de diagnóstico</Text>
          <div 
            className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-700 p-2 rounded mt-2"
            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
          >
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`py-1 border-b border-gray-200 dark:border-gray-700 ${log.includes('❌') ? 'text-red-600 dark:text-red-400' : ''}`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TremorResumenGeneralCard;
