import React, { useState, useEffect } from 'react';
// Mantenemos solo la importación necesaria sin CSS adicional
import apiService from '../../services/apiService';
import { t } from '../../i18n/config';
import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable no proporciona tipos TS correctos
import autoTable from 'jspdf-autotable';

// Tipos para los datos
interface ExplotacionInfo {
  explotacio: string;
  total_animales?: number;
  total_animales_activos?: number;
  toros?: number;
  toros_activos?: number;
  vacas?: number;
  vacas_activas?: number;
  alletar_0?: number;
  alletar_1?: number;
  alletar_2?: number;
  alletar_0_activas?: number;
  alletar_1_activas?: number;
  alletar_2_activas?: number;
  partos?: number;
  ratio?: number | string;
  amamantando?: number;
  noAmamantando?: number;
  terneros?: number;
  total?: number;
  animales?: any[];
}

interface Animal {
  id: number;
  nom: string;
  explotacio: string;
  genere: 'M' | 'F';
  estado: 'OK' | 'DEF';
  alletar?: string | number | null;
  dob?: string;
  [key: string]: any;
}

const ExplotacionesPage: React.FC = () => {
  // Estado para el idioma actual
  const [currentLang, setCurrentLang] = useState('es');

  // Efecte para obtener y manejar el idioma
  useEffect(() => {
    // Obtener el idioma inicial
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);

    // Escuchar cambios de idioma
    const handleLangChange = (e: StorageEvent) => {
      if (e.key === 'userLanguage') {
        setCurrentLang(e.newValue || 'es');
      }
    };

    window.addEventListener('storage', handleLangChange);
    return () => window.removeEventListener('storage', handleLangChange);
  }, []);

  // Estados
  const [explotacionesData, setExplotacionesData] = useState<ExplotacionInfo[]>([]);
  const [displayExplotaciones, setDisplayExplotaciones] = useState<ExplotacionInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentExplotacion, setCurrentExplotacion] = useState<string | null>(null);
  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [stats, setStats] = useState({
    toros: 0,
    vacas: 0,
    terneros: 0
  });
  
  // Estado para detectar si estamos en vista móvil
  const [isMobileView, setIsMobileView] = useState(false);
  // Estados para ordenación
  const [sortField, setSortField] = useState<'explotacio' | 'total'>('explotacio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Efecto para detectar el ancho de la pantalla y ordenar correctamente en móvil
  useEffect(() => {
    const checkScreenWidth = () => {
      const isMobile = window.innerWidth < 640; // sm breakpoint en Tailwind es 640px
      setIsMobileView(isMobile);
    };
    
    // Ejecutar al montar el componente
    checkScreenWidth();
    
    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', checkScreenWidth);
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);
  
  // Efecto para ordenar correctamente en móvil
  useEffect(() => {
    // En móvil, ordenar por total de animales (mayor a menor)
    if (isMobileView && (sortField !== 'total' || sortDirection !== 'desc')) {
      setSortField('total');
      setSortDirection('desc');
    }
  }, [isMobileView, sortField, sortDirection]);
  
  // Función para ordenar las explotaciones
  const sortExplotaciones = (explotaciones: ExplotacionInfo[]) => {
    if (!explotaciones) return [];
    
    // En móvil, siempre ordenar por cantidad de animales (mayor a menor)
    if (isMobileView) {
      return [...explotaciones].sort((a, b) => {
        const aTotal = a.total || 0;
        const bTotal = b.total || 0;
        return bTotal - aTotal; // Orden descendente por total en móvil
      });
    }
    
    // En desktop, seguir el criterio de ordenación elegido
    return [...explotaciones].sort((a, b) => {
      if (sortField === 'explotacio') {
        return sortDirection === 'asc' 
          ? a.explotacio.localeCompare(b.explotacio)
          : b.explotacio.localeCompare(a.explotacio);
      } else if (sortField === 'total') {
        const aTotal = a.total || 0;
        const bTotal = b.total || 0;
        return sortDirection === 'asc' ? aTotal - bTotal : bTotal - aTotal;
      }
      return a.explotacio.localeCompare(b.explotacio);
    });
  };

  // Efecto para ordenar y filtrar explotaciones cuando cambian los datos, los criterios de ordenación o la vista
  useEffect(() => {
    if (!explotacionesData.length) return;
    
    let dataToDisplay = sortExplotaciones(explotacionesData);
    
    // Aplicar filtro de búsqueda si existe
    if (searchTerm.trim() !== '') {
      dataToDisplay = dataToDisplay.filter(exp => 
        exp.explotacio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Actualizar las explotaciones a mostrar
    setDisplayExplotaciones(dataToDisplay);
  }, [explotacionesData, searchTerm, isMobileView, sortField, sortDirection]);

  // Filtrar animales por categoría cuando cambia la categoría activa o la lista de animales
  useEffect(() => {
    if (allAnimals.length > 0) {
      filterAnimalsByCategory(activeCategory);
    }
  }, [activeCategory, allAnimals]);

  // Función para cargar los datos iniciales
  const loadInitialData = async () => {
    try {
      console.log('######## INICIO CARGA DE DATOS DE EXPLOTACIONES (REACT) ########');
      console.log(`Usando API URL: ${apiService.getBaseUrl()}`);
      
      setLoading(true);
      setError(null);
      
      // Obtener todos los animales del backend con un límite razonable
      console.log('Realizando petición GET a animals/?page=1&limit=100');
      const response = await apiService.get('animals/?page=1&limit=100');
      console.log('Respuesta recibida de animals:', response);
      
      // Verificar la estructura de la respuesta
      if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
        throw new Error('Formato de respuesta incorrecto');
      }
      
      const allAnimals = response.data.items;
      console.log(`Obtenidos ${allAnimals.length} animales`);
      
      // Agrupar animales por explotación
      const explotacionesMap: Record<string, ExplotacionInfo> = {};
      
      allAnimals.forEach((animal: Animal) => {
        if (!animal.explotacio) return; // Ignorar animales sin explotación
        
        // Si la explotación no existe en el mapa, la añadimos
        if (!explotacionesMap[animal.explotacio]) {
          explotacionesMap[animal.explotacio] = {
            explotacio: animal.explotacio,
            animales: []
          };
        }
        
        // Añadir animal a la explotación
        explotacionesMap[animal.explotacio].animales = 
          [...(explotacionesMap[animal.explotacio].animales || []), animal];
      });
      
      // Calcular estadísticas para cada explotación
      const explotacionesDataArray = Object.values(explotacionesMap).map((exp: ExplotacionInfo) => {
        const animales = exp.animales || [];
        
        // Total de animales por género
        const toros = animales.filter((a: Animal) => a.genere === 'M').length;
        const vacas = animales.filter((a: Animal) => a.genere === 'F').length;
        
        // Animales activos (estado=OK)
        const toros_activos = animales.filter((a: Animal) => a.genere === 'M' && a.estado === 'OK').length;
        const vacas_activas = animales.filter((a: Animal) => a.genere === 'F' && a.estado === 'OK').length;
        
        // Contar las vacas amamantando (alletar 1 o 2)
        const vacasAletar1 = animales.filter((a: Animal) => a.genere === 'F' && ['1', 1].includes(a.alletar as any)).length;
        const vacasAletar2 = animales.filter((a: Animal) => a.genere === 'F' && ['2', 2].includes(a.alletar as any)).length;
        const amamantando = vacasAletar1 + vacasAletar2;
        
        // Vacas que no están amamantando (alletar 0 o null)
        const noAmamantando = animales.filter((a: Animal) => a.genere === 'F' && (['0', 0].includes(a.alletar as any) || a.alletar === null)).length;
        
        // Inicializar partos con 0, luego se actualizará
        let partosAprox = 0;
        
        // Cálculo correcto de terneros: cada vaca con alletar=1 amamanta 1 ternero y cada vaca con alletar=2 amamanta 2 terneros
        const terneros = vacasAletar1 + (vacasAletar2 * 2);
        
        // Total de animales activos
        const total_animales_activos = toros_activos + vacas_activas + terneros;
        
        return {
          explotacio: exp.explotacio,
          total: animales.length,
          total_animales_activos: total_animales_activos,
          toros: toros,
          toros_activos: toros_activos,
          vacas: vacas,
          vacas_activas: vacas_activas,
          amamantando: amamantando,
          noAmamantando: noAmamantando,
          terneros: terneros,
          partos: partosAprox
        };
      });
      
      // Obtener el conteo correcto de partos para cada explotación
      const updatedExplotacionesData = await Promise.all(explotacionesDataArray.map(async (exp) => {
        try {
          // Obtener detalles de la explotación usando la API del dashboard
          const dashboardEndpoint = `dashboard/explotacions/${encodeURIComponent(exp.explotacio)}`;
          console.log(`Solicitando detalles de explotación: ${dashboardEndpoint}`);
          const explotacionData = await apiService.get(dashboardEndpoint);
          console.log(`Datos recibidos para explotación ${exp.explotacio}:`, explotacionData);
          
          // Obtener estadísticas detalladas de la explotación
          const statsEndpoint = `dashboard/explotacions/${encodeURIComponent(exp.explotacio)}/stats`;
          console.log(`Solicitando estadísticas: ${statsEndpoint}`);
          const statsData = await apiService.get(statsEndpoint);
          console.log(`Estadísticas recibidas para ${exp.explotacio}:`, statsData);
          
          // Inicializar objeto con datos actualizados
          let updatedExp = {...exp};
          
          // Actualizar el conteo de partos con el valor correcto de la API
          if (explotacionData && explotacionData.total_partos !== undefined) {
            updatedExp = {
              ...updatedExp,
              partos: explotacionData.total_partos
            };
          }
          
          // Extraer datos detallados de estadísticas
          const animales = statsData.animales || {};
          const partos = statsData.partos || {};
          
          // Actualizar con los datos estadísticos completos
          updatedExp = {
            ...updatedExp,
            toros: animales.toros || updatedExp.toros,
            toros_activos: animales.toros_activos || updatedExp.toros_activos,
            vacas: animales.vacas || updatedExp.vacas,
            vacas_activas: animales.vacas_activas || updatedExp.vacas_activas,
            total_animales_activos: updatedExp.total_animales_activos,
            terneros: animales.terneros || updatedExp.terneros,
            amamantando: animales.vacas_amamantando || updatedExp.amamantando,
            noAmamantando: animales.vacas_no_amamantando || updatedExp.noAmamantando,
            partos: partos.total || updatedExp.partos
          };
          
          // Devolver la explotación con todos los datos actualizados
          return updatedExp;
        } catch (error: any) {
          console.error(`Error al obtener información para ${exp.explotacio}:`, error);
          console.error(`Error detallado: ${error.message}`);
          if (error.response) {
            console.error(`Status: ${error.response.status}, Data:`, error.response.data);
          }
          // Si hay un error, devolver los datos originales
          return exp;
        }
      }));
      
      // Ordenar por nombre de explotación
      updatedExplotacionesData.sort((a, b) => a.explotacio.localeCompare(b.explotacio));
      
      // Actualizar el estado
      setExplotacionesData(updatedExplotacionesData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error al cargar datos iniciales de explotaciones:', error);
      console.error('Detalle del error:', error.stack || 'No hay stack disponible');
      
      setLoading(false);
      setError(error.message);
    }
  };

  // Función para buscar explotaciones por término
  const handleSearch = () => {
    console.log(`Buscando: "${searchTerm}"`);
    // Si el campo está vacío, mostrar todas
    if (!searchTerm.trim()) {
      return;
    }
    
    // Filtrar explotaciones que contienen el término de búsqueda
    const filteredExplotaciones = explotacionesData.filter(exp => 
      exp.explotacio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredExplotaciones.length === 0) {
      alert('No se encontraron explotaciones que coincidan con tu búsqueda.');
    } else if (filteredExplotaciones.length === 1) {
      // Si solo hay una coincidencia, mostrar directamente los detalles
      showExplotacionDetail(filteredExplotaciones[0].explotacio);
    } else {
      // TODO: Actualizar la vista para mostrar solo las explotaciones filtradas
    }
  };

  // Función para limpiar búsqueda
  const handleClear = () => {
    setSearchTerm('');
    // TODO: Actualizar la vista para mostrar todas las explotaciones
  };

  // Función para mostrar detalles de una explotación
  const showExplotacionDetail = async (explotacionCode: string) => {
    if (!explotacionCode) return;
    
    setCurrentExplotacion(explotacionCode);
    setLoading(true);
    setError(null);
    
    try {
      // Obtener datos de los animales de esta explotación
      const endpoint = `animals/?explotacio=${encodeURIComponent(explotacionCode)}&limit=100`;
      console.log(`Solicitando animales de explotación (con límite 100): ${endpoint}`);
      
      const response = await apiService.get(endpoint);
      console.log(`Respuesta recibida para animales de ${explotacionCode}:`, response);
      
      // Verificar la estructura de la respuesta
      if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
        throw new Error('Formato de respuesta incorrecto');
      }
      
      const animals = response.data.items;
      console.log(`Encontrados ${animals.length} animales para la explotación ${explotacionCode}`);
      
      // Calcular estadísticas
      const toros = animals.filter((a: Animal) => a.genere === 'M').length;
      const vacas = animals.filter((a: Animal) => a.genere === 'F').length;
      const newStats = {
        toros: toros,
        vacas: vacas,
        terneros: 0 // TODO: Calcular terneros correctamente
      };
      
      setAllAnimals(animals);
      setFilteredAnimals(animals); // Inicialmente mostrar todos
      setStats(newStats);
      setActiveCategory('todos');
      
      // Mostrar la vista de detalles
      const detailView = document.getElementById('explotacion-detail');
      const cardsView = document.getElementById('explotacionCards');
      
      if (detailView) detailView.style.display = 'block';
      if (cardsView) cardsView.style.display = 'none';
      
      // Actualizar el título
      const titleElement = document.getElementById('explotacion-code');
      if (titleElement) titleElement.textContent = explotacionCode;
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error al cargar detalle de explotación:', error);
      setLoading(false);
      setError(error.message);
    }
  };

  // Función para volver a la vista de tarjetas
  const handleBack = () => {
    const detailView = document.getElementById('explotacion-detail');
    const cardsView = document.getElementById('explotacionCards');
    
    if (detailView) detailView.style.display = 'none';
    if (cardsView) cardsView.style.display = 'grid';
    
    setCurrentExplotacion(null);
  };

  // Función para filtrar animales por categoría
  const filterAnimalsByCategory = (category: string) => {
    if (!allAnimals.length) return;
    
    let filtered: Animal[] = [];
    
    switch (category) {
      case 'todos':
        filtered = [...allAnimals];
        break;
      case 'toros':
        filtered = allAnimals.filter(animal => animal.genere === 'M');
        break;
      case 'vacas-amam':
        filtered = allAnimals.filter(animal => 
          animal.genere === 'F' && ['1', 1, '2', 2].includes(animal.alletar as any)
        );
        break;
      case 'vacas-no-amam':
        filtered = allAnimals.filter(animal => 
          animal.genere === 'F' && (['0', 0].includes(animal.alletar as any) || animal.alletar === null)
        );
        break;
      case 'terneros':
        // TODO: Implementar filtro de terneros
        filtered = [];
        break;
      default:
        filtered = [...allAnimals];
    }
    
    setFilteredAnimals(filtered);
    setActiveCategory(category);
  };

  // Renderizar tabla de animales
  const renderAnimalTable = () => {
    // Si no hay animales
    if (!filteredAnimals || filteredAnimals.length === 0) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <p className="text-gray-500 dark:text-gray-400">
            {currentLang === 'ca' ? "No hi ha animals per mostrar en aquesta categoria" : "No hay animales que mostrar en esta categoría"}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">{currentLang === 'ca' ? "Codi" : "Código"}</th>
              <th className="px-4 py-2">{currentLang === 'ca' ? "Nom" : "Nombre"}</th>
              <th className="px-4 py-2">{currentLang === 'ca' ? "Gènere" : "Género"}</th>
              <th className="px-4 py-2">{currentLang === 'ca' ? "Estat" : "Estado"}</th>
              <th className="px-4 py-2">{currentLang === 'ca' ? "Data Naixement" : "Fecha Nacimiento"}</th>
              <th className="px-4 py-2">{currentLang === 'ca' ? "Alletant" : "Amamantando"}</th>
              <th className="px-4 py-2">{currentLang === 'ca' ? "Accions" : "Acciones"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnimals.map((animal) => (
              <tr key={animal.id} className="border-b dark:border-gray-700">
                <td className="px-4 py-2">{animal.cod || '-'}</td>
                <td className="px-4 py-2 font-medium">{animal.nom}</td>
                <td className="px-4 py-2">{animal.genere === 'M' ? (currentLang === 'ca' ? 'Toro' : 'Toro') : (currentLang === 'ca' ? 'Vaca' : 'Vaca')}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    animal.estado === 'OK' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {animal.estado === 'OK' ? (currentLang === 'ca' ? 'Actiu' : 'Activo') : (currentLang === 'ca' ? 'Mort' : 'Fallecido')}
                  </span>
                </td>
                <td className="px-4 py-2">{animal.dob || (currentLang === 'ca' ? 'No disponible' : 'No disponible')}</td>
                <td className="px-4 py-2">
                  {animal.genere === 'F' ? (
                    animal.alletar === '1' ? (currentLang === 'ca' ? '1 vedell' : '1 ternero') : 
                    animal.alletar === '2' ? (currentLang === 'ca' ? '2 vedells' : '2 terneros') : 
                    (currentLang === 'ca' ? 'Sense alletar' : 'No amamantando')
                  ) : 'N/A'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <a 
                      href={`/animals/${animal.id}`}
                      className="inline-flex items-center px-2 py-1 bg-primary text-white rounded hover:bg-primary/80"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {currentLang === 'ca' ? 'Veure' : 'Ver'}
                    </a>
                    <a 
                      href={`/animals/update/${animal.id}`}
                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {currentLang === 'ca' ? 'Actualitzar' : 'Actualizar'}
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  // Función para exportar a PDF con formato atractivo
  const exportToPDF = () => {
    if (!filteredAnimals || !filteredAnimals.length) return;
    
    // Crear un documento PDF nuevo
    const doc = new jsPDF();
    
    // Configurar títulos y encabezados
    const title = currentLang === 'ca' 
      ? `Llistat d'Animals - ${currentExplotacion}`
      : `Listado de Animales - ${currentExplotacion}`;
    
    const headers = currentLang === 'ca' 
      ? [['ID', 'Nom', 'Gènere', 'Estat', 'Data Naixement', 'Alletant']]
      : [['ID', 'Nombre', 'Género', 'Estado', 'Fecha Nacimiento', 'Amamantando']];
    
    // Preparar los datos para la tabla
    const data = filteredAnimals.map(animal => [
      animal.id,
      animal.nom,
      animal.genere === 'M' ? (currentLang === 'ca' ? 'Toro' : 'Toro') : (currentLang === 'ca' ? 'Vaca' : 'Vaca'),
      animal.estado === 'OK' ? (currentLang === 'ca' ? 'Actiu' : 'Activo') : (currentLang === 'ca' ? 'Mort' : 'Fallecido'),
      animal.dob || (currentLang === 'ca' ? 'No disponible' : 'No disponible'),
      animal.genere === 'F' ? 
        (animal.alletar === '1' ? (currentLang === 'ca' ? '1 vedell' : '1 ternero') : 
        animal.alletar === '2' ? (currentLang === 'ca' ? '2 vedells' : '2 terneros') : 
        (currentLang === 'ca' ? 'Sense alletar' : 'No amamantando')) : 'N/A'
    ]);
    
    // Añadir una cabecera atractiva al PDF
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 105, 15, { align: 'center' });
    
    // Añadir fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleDateString(currentLang === 'ca' ? 'ca-ES' : 'es-ES');
    doc.text(
      currentLang === 'ca' ? `Data: ${date}` : `Fecha: ${date}`, 
      195, 20, { align: 'right' }
    );
    
    // Añadir logo/ícono de animal (dibujo básico de un toro/vaca usando gráficos vectoriales)
    doc.setDrawColor(0);
    doc.setFillColor(65, 105, 225); // Color azul para el icono
    
    // Dibujar silueta simple de animal (círculo para la cabeza y óvalo para el cuerpo)
    doc.circle(30, 25, 5, 'F'); // Cabeza
    doc.ellipse(40, 25, 10, 5, 'F'); // Cuerpo
    
    // Añadir cuernos si corresponde (para darle más estilo)
    doc.setLineWidth(0.5);
    doc.line(27, 21, 25, 19); // Cuerno izquierdo
    doc.line(33, 21, 35, 19); // Cuerno derecho
    
    // Añadir estadísticas resumen
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    
    const statTitles = currentLang === 'ca' 
      ? ['Total Animals:', 'Toros:', 'Vaques:', 'Alletant:']
      : ['Total Animales:', 'Toros:', 'Vacas:', 'Amamantando:'];
      
    const stats = [
      filteredAnimals.length,
      filteredAnimals.filter(a => a.genere === 'M').length,
      filteredAnimals.filter(a => a.genere === 'F').length,
      filteredAnimals.filter(a => a.genere === 'F' && ['1', 1, '2', 2].includes(a.alletar as any)).length
    ];
    
    let yPosition = 40;
    for (let i = 0; i < statTitles.length; i++) {
      doc.setFont('helvetica', 'bold');
      doc.text(statTitles[i], 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(stats[i].toString(), 60, yPosition);
      yPosition += 7;
    }
    
    // Añadir tabla de animales usando jspdf-autotable
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { 
        fillColor: [65, 105, 225], 
        textColor: 255,
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 40 }, // Nombre
        2: { cellWidth: 25 }, // Género
        3: { cellWidth: 30 }, // Estado
        4: { cellWidth: 35 }, // Fecha Nacimiento
        5: { cellWidth: 40 }  // Amamantando
      },
      margin: { top: 70 }
    });
    
    // Añadir pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        'Masclet Imperi - ' + (currentLang === 'ca' ? 'Sistema de Gestió Ramadera' : 'Sistema de Gestión Ganadera'), 
        105, doc.internal.pageSize.height - 10, { align: 'center' }
      );
      doc.text(
        currentLang === 'ca' ? `Pàgina ${i} de ${pageCount}` : `Página ${i} de ${pageCount}`, 
        195, doc.internal.pageSize.height - 10, { align: 'right' }
      );
    }
    
    // Guardar el PDF
    const fileName = `animales_${currentExplotacion || 'todas'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Renderizar el componente principal
  return (
    <div className="w-full py-6">
      {/* 1. Sección de búsqueda y filtros - exactamente igual al HTML existente */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
            {currentLang === 'ca' ? 'Cerca i Filtres' : 'Búsqueda y Filtros'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
            {currentLang === 'ca' 
              ? 'Utilitza els filtres per trobar explotacions específiques. Pots cercar per codi d\'explotació.'
              : 'Utiliza los filtros para encontrar explotaciones específicas. Puedes buscar por código de explotación.'
            }
          </p>
        </div>
        
        {/* Buscador con botones */}
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {currentLang === 'ca' ? 'Cercar' : 'Buscar'}
            </label>
            <div className="relative">
              <input 
                type="text" 
                id="search-explotacion" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={currentLang === 'ca' ? "Cercar per codi d'explotació..." : "Buscar por código de explotación..."} 
                className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white" 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleSearch}
              className="btn btn-primary"
            >
              {currentLang === 'ca' ? 'Cercar' : 'Buscar'}
            </button>
            <button 
              onClick={handleClear}
              className="btn btn-secondary"
            >
              {currentLang === 'ca' ? 'Netejar' : 'Limpiar'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mostrar spinner durante la carga */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Mostrar error si ocurre */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* 2. Lista de explotaciones (cards) - inicialmente visible */}
      {!loading && !error && (
        <>
          {/* Vista de tarjetas de explotaciones */}
          <div 
            id="explotacionCards" 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6"
            style={{ display: currentExplotacion ? 'none' : 'grid' }}
          >
            {displayExplotaciones.map((exp) => (
              <div 
                key={exp.explotacio} 
                className="explotacion-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-full border border-gray-100 mb-4"
                onClick={() => showExplotacionDetail(exp.explotacio)}
              >
                {/* Cabecera con el nombre de la explotación */}
                <div className="card-header bg-primary text-white p-3">
                  <h3 className="text-lg font-bold text-center">{exp.explotacio}</h3>
                </div>
                
                {/* Cuerpo de la tarjeta */}
                <div className="card-body p-4">
                  {/* Primera fila: Animales totales y activos */}
                  <div className="grid grid-cols-2 mb-4 pb-3 border-b border-gray-100">
                    {/* Columna izquierda: Total Animales */}
                    <div className="text-center">
                      <div className="stat-label font-bold text-gray-700 mb-2">{currentLang === 'ca' ? "Total Animals" : "Total Animales"}</div>
                      <div className="stat-value total font-bold text-2xl text-primary-dark">
                        {(exp.toros || 0) + (exp.vacas || 0) + (exp.terneros || 0)}
                      </div>
                    </div>
                    {/* Columna derecha: Animales Activos */}
                    <div className="text-center">
                      <div className="stat-label font-bold text-gray-700 mb-2">{currentLang === 'ca' ? "Animals Actius" : "Animales Activos"}</div>
                      <div className="stat-value total font-bold text-2xl text-green-600">
                        {/* Filtrar solo los animales con estado=OK */}
                        {((exp.toros_activos !== undefined ? exp.toros_activos : exp.toros) || 0) + 
                         ((exp.vacas_activas !== undefined ? exp.vacas_activas : exp.vacas) || 0) + 
                         (exp.terneros || 0)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Segunda fila: Toros, Vacas, Terneros (solo activos) */}
                  <div className="animal-stats grid grid-cols-3 gap-1 text-center mb-3">
                    <div>
                      <div className="stat-label font-medium">{currentLang === 'ca' ? "Toros Actius" : "Toros Activos"}</div>
                      <div className="stat-value toros font-bold text-primary">
                        {exp.toros_activos !== undefined ? exp.toros_activos : exp.toros || 0}
                      </div>
                    </div>
                    <div>
                      <div className="stat-label font-medium">{currentLang === 'ca' ? "Vaques Actives" : "Vacas Activas"}</div>
                      <div className="stat-value vacas font-bold text-pink-500">
                        {exp.vacas_activas !== undefined ? exp.vacas_activas : exp.vacas || 0}
                      </div>
                    </div>
                    <div>
                      <div className="stat-label font-medium">{currentLang === 'ca' ? "Vedells" : "Terneros"}</div>
                      <div className="stat-value terneros font-bold text-orange-500">{exp.terneros || 0}</div>
                    </div>
                  </div>
                  
                  {/* Tercera fila: Amamantando */}
                  <div className="card-footer grid grid-cols-3 gap-1 text-center pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <div className="stat-label font-medium">{currentLang === 'ca' ? "Alletant" : "Amamantando"}</div>
                      <div className="font-bold text-blue-600">{exp.amamantando || 0}</div>
                    </div>
                    <div className="col-span-2 text-center flex flex-col justify-center items-center">
                      <div className="stat-label font-medium">&nbsp;</div>
                      <div>
                        <button 
                          className="details-link text-green-600 font-medium hover:text-green-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            showExplotacionDetail(exp.explotacio);
                          }}
                        >
                          {currentLang === 'ca' ? "Veure detalls" : "Ver detalles"} &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 3. Vista detallada de explotación - inicialmente oculta */}
          <div 
            id="explotacion-detail" 
            className="hidden mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            style={{ display: currentExplotacion ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-4 text-lg font-medium">
              <h3 className="text-gray-900 dark:text-white">
                {currentLang === 'ca' ? "Animals de" : "Animales de"} <span id="explotacion-code">{currentExplotacion}</span>
              </h3>
              
              <div className="flex gap-2">
                <button 
                  id="export-csv" 
                  className="btn btn-primary text-sm flex items-center"
                  onClick={exportToPDF}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {currentLang === 'ca' ? "Exportar PDF" : "Exportar PDF"}
                </button>
                
                <button 
                  id="back-button" 
                  className="btn btn-secondary text-sm flex items-center"
                  onClick={handleBack}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  {currentLang === 'ca' ? "Tornar" : "Volver"}
                </button>
              </div>
            </div>
            
            {/* Tabs para filtrar por categoría */}
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              <li className="mr-2">
                <button 
                  className={`animal-tab inline-block p-2 border-b-2 ${activeCategory === 'todos' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'}`}
                  data-category="todos"
                  onClick={() => filterAnimalsByCategory('todos')}
                >
                  {currentLang === 'ca' ? "Tots els animals" : "Todos los animales"} <span className="tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs">{allAnimals.length}</span>
                </button>
              </li>
              
              <li className="mr-2">
                <button 
                  className={`animal-tab inline-block p-2 border-b-2 ${activeCategory === 'toros' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'}`}
                  data-category="toros"
                  onClick={() => filterAnimalsByCategory('toros')}
                >
                  {currentLang === 'ca' ? "Toros" : "Toros"} <span className="tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs">{stats.toros}</span>
                </button>
              </li>
              
              <li className="mr-2">
                <button 
                  className={`animal-tab inline-block p-2 border-b-2 ${activeCategory === 'vacas-amam' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'}`}
                  data-category="vacas-amam"
                  onClick={() => filterAnimalsByCategory('vacas-amam')}
                >
                  {currentLang === 'ca' ? "Vaques alletant" : "Vacas amamantando"} <span className="tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs">{allAnimals.filter(a => a.genere === 'F' && ['1', 1, '2', 2].includes(a.alletar as any)).length}</span>
                </button>
              </li>
              
              <li className="mr-2">
                <button 
                  className={`animal-tab inline-block p-2 border-b-2 ${activeCategory === 'vacas-no-amam' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'}`}
                  data-category="vacas-no-amam"
                  onClick={() => filterAnimalsByCategory('vacas-no-amam')}
                >
                  {currentLang === 'ca' ? "Vaques sense alletar" : "Vacas no amamantando"} <span className="tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs">{allAnimals.filter(a => a.genere === 'F' && (['0', 0].includes(a.alletar as any) || a.alletar === null)).length}</span>
                </button>
              </li>
            </ul>
            
            {/* Área para la tabla de animales */}
            <div className="mt-4">
              {renderAnimalTable()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExplotacionesPage;
