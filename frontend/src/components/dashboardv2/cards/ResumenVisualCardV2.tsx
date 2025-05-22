import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Metric,
  Flex,
  Grid,
  DonutChart,
  Title,
  Tab,
  TabGroup,
  TabList,
  Badge,
  BarChart,
  ProgressBar
} from "@tremor/react";

// Importamos iconos de React Icons para un dashboard más moderno
import { FiCalendar, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { FaHeart, FaUsers, FaTag, FaClock } from 'react-icons/fa';
import { IoAlertCircle, IoCheckmarkCircle } from 'react-icons/io5';
import { GiCow } from 'react-icons/gi';

// Servicio para llamadas a la API
import apiService from "../../../services/apiService";

// Tipos para las propiedades
interface ResumenVisualCardProps {
  darkMode?: boolean;
}

const ResumenVisualCardV2: React.FC<ResumenVisualCardProps> = ({
  darkMode = false
}) => {
  // Estados para almacenar los datos
  const [animalesDetallados, setAnimalesDetallados] = useState<any>(null);
  const [resumenData, setResumenData] = useState<any>(null);
  const [periodoData, setPeriodoData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Manejar cambio de pestañas
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

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
          <FaClock className="h-6 w-6 text-blue-500" />
          <Text>Cargando datos del panel de control...</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={darkMode ? "bg-gray-800 text-white" : ""}>
        <Flex className="gap-4">
          <IoAlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <Title>Error al cargar datos</Title>
            <Text>{error}</Text>
          </div>
        </Flex>
      </Card>
    );
  }

  // Preparar datos para gráficos con colores más vibrantes
  const generoData = [
    { name: "Toros", value: animalesDetallados?.por_genero?.machos?.total || 0 },
    { name: "Vacas", value: animalesDetallados?.por_genero?.hembras?.total || 0 }
  ];

  const estadoData = [
    { name: "Activos", value: animalesDetallados?.general?.activos || 0 },
    { name: "Fallecidos", value: animalesDetallados?.general?.fallecidos || 0 }
  ];

  const alletarData = [
    { name: "Sin amamantar", value: animalesDetallados?.por_alletar?.["0"] || 0 },
    { name: "1 ternero", value: animalesDetallados?.por_alletar?.["1"] || 0 },
    { name: "2 terneros", value: animalesDetallados?.por_alletar?.["2"] || 0 }
  ];
  
  // Colores personalizados para gráficos
  const coloresPrincipales = ["blue", "fuchsia", "emerald", "rose", "cyan", "violet", "amber"];
  
  // Calcular porcentajes para barras de progreso
  const totalAnimales = animalesDetallados?.general?.total || 0;
  const porcentajeMachos = totalAnimales > 0 ? (animalesDetallados?.por_genero?.machos?.total || 0) / totalAnimales * 100 : 0;
  const porcentajeHembras = totalAnimales > 0 ? (animalesDetallados?.por_genero?.hembras?.total || 0) / totalAnimales * 100 : 0;
  const porcentajeActivos = totalAnimales > 0 ? (animalesDetallados?.general?.activos || 0) / totalAnimales * 100 : 0;
  
  // Formato para fechas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      {/* Cabecera con degradado */}
      <Card className={`mb-6 overflow-hidden border-0 shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}>
        <div className={`p-6 ${darkMode ? "bg-gradient-to-r from-blue-900 to-indigo-800" : "bg-gradient-to-r from-blue-600 to-indigo-700"}`}>
          <Flex justifyContent="between" alignItems="center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Panel de Control Masclet Imperi</h2>
              <div className="text-blue-100 flex items-center">
                <FiCalendar className="h-4 w-4 mr-1" />
                <span>Período: {periodoData ? formatDate(periodoData.inicio) : 'N/A'} a {periodoData ? formatDate(periodoData.fin) : 'N/A'}</span>
                {periodoData?.dinamico && (
                  <Badge color="blue" className="ml-2">
                    Período dinámico
                  </Badge>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-3 py-2">
              <Flex alignItems="center" className="gap-2">
                <GiCow className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-lg text-blue-700">{animalesDetallados?.general?.total || 0} animales</span>
              </Flex>
            </div>
          </Flex>
        </div>
      </Card>
      
      {/* Contenido principal */}
      <TabGroup>
        <TabList className="mb-6">
          <Tab>
            <div className="flex items-center gap-2">
              <FiPieChart className="h-5 w-5" />
              <span>Resumen General</span>
            </div>
          </Tab>
          <Tab>
            <div className="flex items-center gap-2">
              <FiBarChart2 className="h-5 w-5" />
              <span>Distribución</span>
            </div>
          </Tab>
        </TabList>
        
        {/* Pestaña 1: Resumen General */}
        {activeTab === 0 && (
          <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
            {/* Tarjeta Total Animales */}
            <Card className={`shadow-md p-4 ${darkMode ? "bg-gray-700" : ""}`}>
              <Flex justifyContent="between">
                <div>
                  <Text className="text-sm font-medium">Total Animales</Text>
                  <Metric className="text-blue-600">{animalesDetallados?.general?.total || 0}</Metric>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <GiCow className="h-8 w-8 text-blue-500" />
                </div>
              </Flex>
              <div className="mt-4">
                <Flex justifyContent="between" className="mb-1">
                  <Text className="text-xs">Toros</Text>
                  <Text className="text-xs font-medium">{animalesDetallados?.por_genero?.machos?.total || 0}</Text>
                </Flex>
                <ProgressBar color="blue" value={porcentajeMachos} className="mb-2" />
                
                <Flex justifyContent="between" className="mb-1">
                  <Text className="text-xs">Vacas</Text>
                  <Text className="text-xs font-medium">{animalesDetallados?.por_genero?.hembras?.total || 0}</Text>
                </Flex>
                <ProgressBar color="fuchsia" value={porcentajeHembras} />
              </div>
            </Card>
            
            {/* Tarjeta Estado */}
            <Card className={`shadow-md p-4 ${darkMode ? "bg-gray-700" : ""}`}>
              <Flex justifyContent="between">
                <div>
                  <Text className="text-sm font-medium">Estado Animales</Text>
                  <Metric className="text-emerald-600">{animalesDetallados?.general?.activos || 0}</Metric>
                </div>
                <div className="bg-emerald-100 p-2 rounded-full">
                  <FaHeart className="h-8 w-8 text-emerald-500" />
                </div>
              </Flex>
              <DonutChart
                data={estadoData}
                category="value"
                index="name"
                colors={["emerald", "rose"]}
                className="h-32 mt-2"
                
                valueFormatter={(value) => `${value} animales`}
              />
              <Flex className="mt-2" justifyContent="between">
                <Badge color="emerald">{porcentajeActivos.toFixed(1)}% Activos</Badge>
                <Badge color="rose">{(100 - porcentajeActivos).toFixed(1)}% Fallecidos</Badge>
              </Flex>
            </Card>
            
            {/* Tarjeta Vacas */}
            <Card className={`shadow-md p-4 ${darkMode ? "bg-gray-700" : ""}`}>
              <Flex justifyContent="between">
                <div>
                  <Text className="text-sm font-medium">Vacas</Text>
                  <Metric className="text-fuchsia-600">{animalesDetallados?.por_genero?.hembras?.total || 0}</Metric>
                </div>
                <div className="bg-fuchsia-100 p-2 rounded-full">
                  <FaUsers className="h-8 w-8 text-fuchsia-500" />
                </div>
              </Flex>
              <DonutChart
                data={[
                  { name: "Activas", value: animalesDetallados?.por_genero?.hembras?.activas || 0 },
                  { name: "Fallecidas", value: animalesDetallados?.por_genero?.hembras?.fallecidas || 0 }
                ]}
                index="name"
                category="value"
                colors={["fuchsia", "rose"]}
                
                className="h-32 mt-2"
              />
              <Flex className="mt-2" justifyContent="between">
                <Text className="text-xs font-medium">Activas: {animalesDetallados?.por_genero?.hembras?.activas || 0}</Text>
                <Text className="text-xs font-medium">Fallecidas: {animalesDetallados?.por_genero?.hembras?.fallecidas || 0}</Text>
              </Flex>
            </Card>
            
            {/* Tarjeta Amamantamiento */}
            <Card className={`shadow-md p-4 ${darkMode ? "bg-gray-700" : ""}`}>
              <Flex justifyContent="between">
                <div>
                  <Text className="text-sm font-medium">Amamantamiento</Text>
                  <Metric className="text-amber-600">
                    {(animalesDetallados?.por_alletar?.["1"] || 0) + (animalesDetallados?.por_alletar?.["2"] * 2 || 0)} terneros
                  </Metric>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <FaTag className="h-8 w-8 text-amber-500" />
                </div>
              </Flex>
              <DonutChart
                data={alletarData}
                category="value"
                index="name"
                colors={["cyan", "violet", "amber"]}
                
                className="h-32 mt-2"
              />
              <Flex className="mt-2" justifyContent="between">
                <Text className="text-xs">Sin amamantar: {animalesDetallados?.por_alletar?.["0"] || 0}</Text>
                <Text className="text-xs">Con terneros: {(animalesDetallados?.por_alletar?.["1"] || 0) + (animalesDetallados?.por_alletar?.["2"] || 0)}</Text>
              </Flex>
            </Card>
          </Grid>
        )}
        
        {/* Pestaña 2: Distribución */}
        {activeTab === 1 && (
          <div>
            <Grid numItems={1} numItemsLg={2} className="gap-6 mb-6">
              <Card className={`shadow-md p-4 ${darkMode ? "bg-gray-700" : ""}`}>
                <Title>Distribución por Género</Title>
                <DonutChart
                  data={generoData}
                  category="value"
                  index="name"
                  colors={["blue", "fuchsia"]}
                  
                  className="h-60 mt-4"
                  valueFormatter={(value) => `${value} animales`}
                />
                <Flex className="mt-4" justifyContent="center">
                  <Badge color="blue" className="mx-2">Toros: {animalesDetallados?.por_genero?.machos?.total || 0}</Badge>
                  <Badge color="fuchsia" className="mx-2">Vacas: {animalesDetallados?.por_genero?.hembras?.total || 0}</Badge>
                </Flex>
              </Card>
              
              <Card className={`shadow-md p-4 ${darkMode ? "bg-gray-700" : ""}`}>
                <Title>Distribución por Estado</Title>
                <DonutChart
                  data={estadoData}
                  category="value"
                  index="name"
                  colors={["emerald", "rose"]}
                  
                  className="h-60 mt-4"
                  valueFormatter={(value) => `${value} animales`}
                />
                <Flex className="mt-4" justifyContent="center">
                  <Badge color="emerald" className="mx-2">Activos: {animalesDetallados?.general?.activos || 0}</Badge>
                  <Badge color="rose" className="mx-2">Fallecidos: {animalesDetallados?.general?.fallecidos || 0}</Badge>
                </Flex>
              </Card>
            </Grid>
            
            <Card className={`shadow-md p-4 ${darkMode ? "bg-gray-700" : ""}`}>
              <Title>Distribución de Amamantamiento</Title>
              <BarChart
                data={alletarData}
                index="name"
                categories={["value"]}
                colors={["amber"]}
                
                className="h-60 mt-4"
                valueFormatter={(value) => `${value} vacas`}
              />
            </Card>
          </div>
        )}
      </TabGroup>
    </div>
  );
};

export default ResumenVisualCardV2;
