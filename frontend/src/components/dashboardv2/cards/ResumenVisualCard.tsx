import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Metric,
  Flex,
  Grid,
  Col,
  DonutChart,
  Title,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Icon,
  AreaChart,
  Color,
  Badge,
  BarChart,
  Divider
} from "@tremor/react";

// Importación de iconos
import { 
  CowIcon, 
  ChartPieIcon, 
  CalendarIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

// Servicio para llamadas a la API
import apiService from "../../../services/apiService";

// Tipos para las propiedades
interface ResumenVisualCardProps {
  darkMode?: boolean;
}

const ResumenVisualCard: React.FC<ResumenVisualCardProps> = ({
  darkMode = false
}) => {
  // Estados para almacenar los datos
  const [animalesDetallados, setAnimalesDetallados] = useState<any>(null);
  const [resumenData, setResumenData] = useState<any>(null);
  const [periodoData, setPeriodoData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Función para añadir logs
  const addLog = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp} - ${message}`;
    
    console.log(isError ? `❌ ${logMessage}` : `ℹ️ ${logMessage}`);
    setLogs(prevLogs => [...prevLogs, logMessage]);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar período dinámico
        addLog("Obteniendo período dinámico...");
        const periodoResponse = await apiService.get('/dashboard-periodo/periodo-dinamico');
        console.log("PERÍODO DINÁMICO:", periodoResponse);
        setPeriodoData(periodoResponse);
        
        // Cargar datos detallados de animales
        addLog("Obteniendo datos detallados de animales...");
        const animalesResponse = await apiService.get('/dashboard-detallado/animales-detallado');
        console.log("DATOS DETALLADOS DE ANIMALES:", animalesResponse);
        setAnimalesDetallados(animalesResponse);
        
        // Cargar datos de resumen
        addLog("Obteniendo datos de resumen...");
        const resumenResponse = await apiService.get('/dashboard/resumen/');
        console.log("DATOS DE RESUMEN:", resumenResponse);
        setResumenData(resumenResponse);
        
        setLoading(false);
        setError(null);
        addLog("✅ Todos los datos cargados correctamente");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        addLog(`Error cargando datos: ${errorMsg}`, true);
        setError(errorMsg);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Manejo de estados de carga y error
  if (loading) {
    return (
      <Card className={darkMode ? "bg-gray-800 text-white" : ""}>
        <Flex className="gap-4">
          <ClockIcon className="h-6 w-6 text-blue-500" />
          <Text>Cargando datos del panel de control...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={darkMode ? "bg-gray-800 text-white" : ""}>
        <Flex className="gap-4">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <div>
            <Title>Error al cargar datos</Title>
            <Text>{error}</Text>
          </div>
        </Flex>
      </Card>
    );
  }

  // Preparar datos para gráficos
  const generoData = [
    { name: "Toros", value: animalesDetallados?.por_genero?.machos?.total || 0, color: "blue" },
    { name: "Vacas", value: animalesDetallados?.por_genero?.hembras?.total || 0, color: "pink" }
  ];

  const estadoData = [
    { name: "Activos", value: animalesDetallados?.general?.activos || 0, color: "green" },
    { name: "Fallecidos", value: animalesDetallados?.general?.fallecidos || 0, color: "red" }
  ];

  const alletarData = [
    { name: "Sin amamantar", value: animalesDetallados?.por_alletar?.["0"] || 0, color: "amber" },
    { name: "1 ternero", value: animalesDetallados?.por_alletar?.["1"] || 0, color: "indigo" },
    { name: "2 terneros", value: animalesDetallados?.por_alletar?.["2"] || 0, color: "purple" }
  ];

  // Formato para fechas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className={`p-6 ${darkMode ? "bg-gray-800 text-white" : ""}`}>
      <Flex className="mb-4" justifyContent="between">
        <div>
          <Title className="text-2xl font-bold">Panel de Control Masclet Imperi</Title>
          <Text className="mt-1">
            <Icon icon={CalendarIcon} size="sm" color="blue" className="inline mr-1" />
            Período: {periodoData ? formatDate(periodoData.inicio) : 'N/A'} a {periodoData ? formatDate(periodoData.fin) : 'N/A'}
            {periodoData?.dinamico && <Badge color="blue" className="ml-2">Período dinámico</Badge>}
          </Text>
        </div>
        <Badge size="xl" color="green" icon={CheckCircleIcon}>
          {animalesDetallados?.general?.total || 0} animales
        </Badge>
      </Flex>
      
      <Divider />
      
      <TabGroup>
        <TabList className="mb-4">
          <Tab icon={ChartPieIcon}>Resumen General</Tab>
          <Tab icon={ChartBarIcon}>Distribución</Tab>
        </TabList>
        
        <TabPanels>
          {/* Pestaña 1: Resumen General */}
          <TabPanel>
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mb-4">
              {/* Tarjeta de Total Animales */}
              <Card decoration="top" decorationColor="indigo" className={darkMode ? "bg-gray-700" : ""}>
                <Flex alignItems="center" className="mb-2">
                  <Icon icon={CowIcon} variant="light" size="lg" color="indigo" />
                  <div className="ml-2">
                    <Text>Total Animales</Text>
                    <Metric>{animalesDetallados?.general?.total || 0}</Metric>
                  </div>
                </Flex>
                <DonutChart
                  data={generoData}
                  variant="pie"
                  valueFormatter={(value) => `${value} animales`}
                  showAnimation={true}
                  colors={["blue", "pink"]}
                  className="h-28 mt-3"
                />
                <Flex className="mt-2" justifyContent="between">
                  <Text>Ratio M/H</Text>
                  <Badge color="blue">
                    {(animalesDetallados?.por_genero?.machos?.total / 
                      (animalesDetallados?.por_genero?.hembras?.total || 1)).toFixed(2)}
                  </Badge>
                </Flex>
              </Card>
              
              {/* Tarjeta de Toros */}
              <Card decoration="top" decorationColor="blue" className={darkMode ? "bg-gray-700" : ""}>
                <Flex alignItems="center" className="mb-2">
                  <Icon icon={CowIcon} variant="light" size="lg" color="blue" />
                  <div className="ml-2">
                    <Text>Toros</Text>
                    <Metric>{animalesDetallados?.por_genero?.machos?.total || 0}</Metric>
                  </div>
                </Flex>
                <DonutChart
                  data={[
                    { name: "Activos", value: animalesDetallados?.por_genero?.machos?.activos || 0, color: "emerald" },
                    { name: "Fallecidos", value: animalesDetallados?.por_genero?.machos?.fallecidos || 0, color: "red" }
                  ]}
                  variant="pie"
                  showAnimation={true}
                  colors={["emerald", "red"]}
                  className="h-28 mt-3"
                />
                <Flex className="mt-2" justifyContent="between">
                  <Text>Activos</Text>
                  <Badge color="green">{animalesDetallados?.por_genero?.machos?.activos || 0}</Badge>
                </Flex>
                {(animalesDetallados?.por_genero?.machos?.fallecidos > 0) && (
                  <Flex className="mt-1" justifyContent="between">
                    <Text>Fallecidos</Text>
                    <Badge color="red">{animalesDetallados?.por_genero?.machos?.fallecidos || 0}</Badge>
                  </Flex>
                )}
              </Card>
              
              {/* Tarjeta de Vacas */}
              <Card decoration="top" decorationColor="pink" className={darkMode ? "bg-gray-700" : ""}>
                <Flex alignItems="center" className="mb-2">
                  <Icon icon={CowIcon} variant="light" size="lg" color="pink" />
                  <div className="ml-2">
                    <Text>Vacas</Text>
                    <Metric>{animalesDetallados?.por_genero?.hembras?.total || 0}</Metric>
                  </div>
                </Flex>
                <DonutChart
                  data={[
                    { name: "Activas", value: animalesDetallados?.por_genero?.hembras?.activas || 0, color: "emerald" },
                    { name: "Fallecidas", value: animalesDetallados?.por_genero?.hembras?.fallecidas || 0, color: "red" }
                  ]}
                  variant="pie"
                  showAnimation={true}
                  colors={["emerald", "red"]}
                  className="h-28 mt-3"
                />
                <Flex className="mt-2" justifyContent="between">
                  <Text>Activas</Text>
                  <Badge color="green">{animalesDetallados?.por_genero?.hembras?.activas || 0}</Badge>
                </Flex>
                {(animalesDetallados?.por_genero?.hembras?.fallecidas > 0) && (
                  <Flex className="mt-1" justifyContent="between">
                    <Text>Fallecidas</Text>
                    <Badge color="red">{animalesDetallados?.por_genero?.hembras?.fallecidas || 0}</Badge>
                  </Flex>
                )}
              </Card>
              
              {/* Tarjeta de Amamantamiento */}
              <Card decoration="top" decorationColor="amber" className={darkMode ? "bg-gray-700" : ""}>
                <Flex alignItems="center" className="mb-2">
                  <Icon icon={ChartPieIcon} variant="light" size="lg" color="amber" />
                  <div className="ml-2">
                    <Text>Amamantamiento</Text>
                    <Metric>{animalesDetallados?.por_genero?.hembras?.activas || 0} vacas</Metric>
                  </div>
                </Flex>
                <DonutChart
                  data={alletarData}
                  variant="pie"
                  showAnimation={true}
                  colors={["amber", "indigo", "purple"]}
                  className="h-28 mt-3"
                />
                <Flex className="mt-2" justifyContent="between">
                  <Text>Sin amamantar</Text>
                  <Badge color="amber">{animalesDetallados?.por_alletar?.["0"] || 0}</Badge>
                </Flex>
                <Flex className="mt-1" justifyContent="between">
                  <Text>1 ternero</Text>
                  <Badge color="indigo">{animalesDetallados?.por_alletar?.["1"] || 0}</Badge>
                </Flex>
                <Flex className="mt-1" justifyContent="between">
                  <Text>2 terneros</Text>
                  <Badge color="purple">{animalesDetallados?.por_alletar?.["2"] || 0}</Badge>
                </Flex>
              </Card>
            </Grid>
          </TabPanel>
          
          {/* Pestaña 2: Distribución */}
          <TabPanel>
            <Grid numItems={1} numItemsSm={2} className="gap-4 mb-4">
              {/* Gráfico de Distribución por Género */}
              <Card className={darkMode ? "bg-gray-700" : ""}>
                <Title>Distribución por Género</Title>
                <DonutChart
                  data={generoData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} animales`}
                  colors={["blue", "pink"]}
                  className="h-52 mt-4"
                />
              </Card>
              
              {/* Gráfico de Distribución por Estado */}
              <Card className={darkMode ? "bg-gray-700" : ""}>
                <Title>Distribución por Estado</Title>
                <DonutChart
                  data={estadoData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} animales`}
                  colors={["emerald", "red"]}
                  className="h-52 mt-4"
                />
              </Card>
              
              {/* Gráfico de Distribución por Amamantamiento */}
              <Card className={darkMode ? "bg-gray-700" : ""}>
                <Title>Distribución por Amamantamiento</Title>
                <BarChart
                  data={alletarData}
                  index="name"
                  categories={["value"]}
                  colors={["amber"]}
                  valueFormatter={(value) => `${value} vacas`}
                  yAxisWidth={48}
                  className="h-52 mt-4"
                />
              </Card>
              
              {/* Tarjeta de Resumen de Partos */}
              <Card className={darkMode ? "bg-gray-700" : ""}>
                <Title>Resumen de Partos</Title>
                <Metric className="mt-2">{resumenData?.total_partos || 0}</Metric>
                <Text>partos totales</Text>
                
                <Grid numItems={2} className="gap-4 mt-4">
                  <Card className={darkMode ? "bg-gray-600" : "bg-gray-100"}>
                    <Flex alignItems="center">
                      <Badge color="blue" size="lg">{resumenData?.tendencias?.partos_mes_anterior || 0}</Badge>
                      <Text className="ml-2">Último mes</Text>
                    </Flex>
                  </Card>
                  <Card className={darkMode ? "bg-gray-600" : "bg-gray-100"}>
                    <Flex alignItems="center">
                      <Badge color="purple" size="lg">{resumenData?.tendencias?.nacimientos_promedio?.toFixed(1) || 0}</Badge>
                      <Text className="ml-2">Promedio mensual</Text>
                    </Flex>
                  </Card>
                </Grid>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  );
};

export default ResumenVisualCard;
