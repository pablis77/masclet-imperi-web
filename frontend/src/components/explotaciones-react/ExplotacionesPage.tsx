import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

// Tipos para los datos
interface ExplotacionInfo {
  explotacio: string;
  total_animales?: number;
  total_animales_activos?: number;
  toros?: number;
  toros_activos?: number;
  vacas?: number;
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
  // Estados
  const [explotacionesData, setExplotacionesData] = useState<ExplotacionInfo[]>([]);
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

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

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
        const toros = animales.filter((a: Animal) => a.genere === 'M').length;
        const vacas = animales.filter((a: Animal) => a.genere === 'F').length;
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
        
        return {
          explotacio: exp.explotacio,
          total: animales.length,
          toros: toros,
          vacas: vacas,
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
            vacas: animales.vacas || updatedExp.vacas,
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
      const endpoint = `animals/?explotacio=${encodeURIComponent(explotacionCode)}`;
      console.log(`Solicitando animales de explotación: ${endpoint}`);
      
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
          <p className="text-gray-500 dark:text-gray-400">No hay animales que mostrar en esta categoría</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Género</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Fecha Nacimiento</th>
              <th className="px-4 py-2">Amamantando</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnimals.map((animal) => (
              <tr key={animal.id} className="border-b dark:border-gray-700">
                <td className="px-4 py-2">{animal.id}</td>
                <td className="px-4 py-2 font-medium">{animal.nom}</td>
                <td className="px-4 py-2">{animal.genere === 'M' ? 'Toro' : 'Vaca'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    animal.estado === 'OK' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {animal.estado === 'OK' ? 'Activo' : 'Fallecido'}
                  </span>
                </td>
                <td className="px-4 py-2">{animal.dob || 'No disponible'}</td>
                <td className="px-4 py-2">
                  {animal.genere === 'F' ? (
                    animal.alletar === '1' ? '1 ternero' : 
                    animal.alletar === '2' ? '2 terneros' : 
                    'No amamantando'
                  ) : 'N/A'}
                </td>
                <td className="px-4 py-2">
                  <a 
                    href={`/animals/${animal.id}`}
                    className="text-primary hover:underline dark:text-primary-light mr-2"
                  >
                    Ver
                  </a>
                  <a 
                    href={`/animals/update/${animal.id}`}
                    className="text-primary hover:underline dark:text-primary-light"
                  >
                    Editar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  // Función para exportar a CSV
  const exportToCSV = () => {
    if (!filteredAnimals || !filteredAnimals.length) return;
    
    // Preparar datos para el CSV
    const headers = ['ID', 'Nombre', 'Género', 'Estado', 'Fecha Nacimiento', 'Amamantando'];
    
    // Convertir los datos a formato CSV
    const csvContent = [
      headers.join(','),
      ...filteredAnimals.map(animal => [
        animal.id,
        animal.nom,
        animal.genere === 'M' ? 'Toro' : 'Vaca',
        animal.estado === 'OK' ? 'Activo' : 'Fallecido',
        animal.dob || 'No disponible',
        animal.genere === 'F' ? 
          (animal.alletar === '1' ? '1 ternero' : 
          animal.alletar === '2' ? '2 terneros' : 
          'No amamantando') : 'N/A'
      ].join(','))
    ].join('\n');
    
    // Crear el objeto Blob para la descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Crear un elemento <a> para la descarga
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `animales_${currentExplotacion || 'todas'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizar el componente principal
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 1. Sección de búsqueda y filtros - exactamente igual al HTML existente */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
            Búsqueda y Filtros
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
            Utiliza los filtros para encontrar explotaciones específicas. Puedes buscar por código de explotación.
          </p>
        </div>
        
        {/* Buscador con botones */}
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input 
                type="text" 
                id="search-explotacion" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código de explotación..." 
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
              Buscar
            </button>
            <button 
              onClick={handleClear}
              className="btn btn-secondary"
            >
              Limpiar
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
            {explotacionesData.map((exp) => (
              <div 
                key={exp.explotacio} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => showExplotacionDetail(exp.explotacio)}
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{exp.explotacio}</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total animales</div>
                    <div className="font-medium text-gray-900 dark:text-white">{exp.total || 0}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Toros</div>
                    <div className="font-medium text-gray-900 dark:text-white">{exp.toros || 0}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Vacas</div>
                    <div className="font-medium text-gray-900 dark:text-white">{exp.vacas || 0}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Partos</div>
                    <div className="font-medium text-gray-900 dark:text-white">{exp.partos || 0}</div>
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Amamantando: <b>{exp.amamantando || 0}</b>
                  </span>
                  <button 
                    className="text-primary hover:underline dark:text-primary-light text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      showExplotacionDetail(exp.explotacio);
                    }}
                  >
                    Ver detalles &rarr;
                  </button>
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
                Animales de <span id="explotacion-code">{currentExplotacion}</span>
              </h3>
              
              <div className="flex gap-2">
                <button 
                  id="export-csv" 
                  className="btn btn-primary text-sm flex items-center"
                  onClick={exportToCSV}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar CSV
                </button>
                
                <button 
                  id="back-button" 
                  className="btn btn-secondary text-sm flex items-center"
                  onClick={handleBack}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Volver
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
                  Todos los animales <span className="tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs">{allAnimals.length}</span>
                </button>
              </li>
              
              <li className="mr-2">
                <button 
                  className={`animal-tab inline-block p-2 border-b-2 ${activeCategory === 'toros' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'}`}
                  data-category="toros"
                  onClick={() => filterAnimalsByCategory('toros')}
                >
                  Toros <span className="tab-count ml-1 bg-primary-light/20 px-1.5 py-0.5 rounded-full text-xs">{stats.toros}</span>
                </button>
              </li>
              
              <li className="mr-2">
                <button 
                  className={`animal-tab inline-block p-2 border-b-2 ${activeCategory === 'vacas-amam' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'}`}
                  data-category="vacas-amam"
                  onClick={() => filterAnimalsByCategory('vacas-amam')}
                >
                  Vacas amamantando
                </button>
              </li>
              
              <li className="mr-2">
                <button 
                  className={`animal-tab inline-block p-2 border-b-2 ${activeCategory === 'vacas-no-amam' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'}`}
                  data-category="vacas-no-amam"
                  onClick={() => filterAnimalsByCategory('vacas-no-amam')}
                >
                  Vacas no amamantando
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
