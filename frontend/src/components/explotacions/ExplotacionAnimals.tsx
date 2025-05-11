import React, { useState, useEffect } from 'react';
import animalService from '../../services/animalService';
import type { Animal } from '../../services/animalService';

interface ExplotacionAnimalsProps {
  explotacionCode: string;
  onClose?: () => void;
}

// Console log para depuración
console.log('Componente ExplotacionAnimals cargado');

const ExplotacionAnimals: React.FC<ExplotacionAnimalsProps> = ({ explotacionCode, onClose }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [stats, setStats] = useState({
    total: 0,
    toros: 0,
    vacas: 0,
    vacasAmam: 0,
    vacasNoAmam: 0,
    terneros: 0,
    partos: 0
  });

  // Cargar animales para esta explotación
  useEffect(() => {
    const loadExplotacionAnimals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Cargando animales para explotación: ${explotacionCode}`);
        const animalsData = await animalService.getAnimalsByExplotacion(explotacionCode);
        
        console.log(`Obtenidos ${animalsData.length} animales para ${explotacionCode}:`, animalsData);
        setAnimals(animalsData);
        
        // Calcular estadísticas
        const toros = animalsData.filter(a => a.genere === 'M' && a.estado !== 'DEF').length;
        const vacas = animalsData.filter(a => a.genere === 'F' && a.estado !== 'DEF').length;
        const vacasAmam = animalsData.filter(a => a.genere === 'F' && (a.alletar === '1' || a.alletar === '2') && a.estado !== 'DEF').length;
        const vacasNoAmam = animalsData.filter(a => a.genere === 'F' && a.alletar === '0' && a.estado !== 'DEF').length;
        const terneros = animalsData.filter(a => a.genere === 'F' && a.alletar === '1' && a.estado !== 'DEF').length;
        
        // Contar partos totales (sumamos todos los partos de todos los animales)
        let partos = 0;
        animalsData.forEach(animal => {
          if (animal.partos && Array.isArray(animal.partos)) {
            partos += animal.partos.length;
          } else if (animal.parts && Array.isArray(animal.parts)) {
            partos += animal.parts.length;
          }
        });
        
        setStats({
          total: animalsData.length,
          toros,
          vacas,
          vacasAmam, 
          vacasNoAmam,
          terneros,
          partos
        });
      } catch (err) {
        console.error('Error al cargar animales de explotación:', err);
        setError('Error al cargar datos: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    if (explotacionCode) {
      loadExplotacionAnimals();
    }
  }, [explotacionCode]);

  // Filtrar animales según la pestaña activa
  const getFilteredAnimals = () => {
    if (activeTab === 'todos') return animals;
    if (activeTab === 'toros') return animals.filter(a => a.genere === 'M' && a.estado !== 'DEF');
    if (activeTab === 'vacas-amam') return animals.filter(a => a.genere === 'F' && (a.alletar === '1' || a.alletar === '2') && a.estado !== 'DEF');
    if (activeTab === 'vacas-no-amam') return animals.filter(a => a.genere === 'F' && a.alletar === '0' && a.estado !== 'DEF');
    if (activeTab === 'terneros') return animals.filter(a => a.genere === 'F' && a.alletar === '1' && a.estado !== 'DEF');
    return animals; // Por defecto, mostrar todos
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (animals.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    // Cabeceras del CSV
    const headers = ['Nombre', 'Género', 'Estado', 'Cuadra', 'Amamantando', 'Fecha Nacimiento'];
    
    // Convertir datos de animales a filas del CSV
    const csvData = animals.map(animal => [
      animal.nom,
      animal.genere === 'M' ? 'Toro' : 'Vaca',
      animal.estado === 'OK' ? 'Activo' : 'Fallecido',
      animal.quadra || animal.explotacio,
      animal.genere === 'F' ? 
        (animal.alletar === '0' ? 'No' : 
         animal.alletar === '1' ? 'Un ternero' : 
         animal.alletar === '2' ? 'Dos terneros' : 'Desconocido')
        : 'N/A',
      animal.dob || 'Desconocido'
    ]);
    
    // Unir filas y cabeceras
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Crear un blob para descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Crear enlace y simular clic
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `animales_${explotacionCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabClick = (category: string) => {
    setActiveTab(category);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Cabecera con título y botones */}
      <div className="flex items-center justify-between mb-4 text-lg font-medium">
        <h3 className="text-gray-900 dark:text-white">
          Animales de <span>{explotacionCode}</span>
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV} 
            className="btn btn-primary text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
          {onClose && (
            <button 
              onClick={onClose} 
              className="btn btn-secondary text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
          )}
        </div>
      </div>

      {/* Tarjeta de estadísticas */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Animales</p>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Partos</p>
              <p className="text-2xl font-bold text-primary">{stats.partos}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-600">Toros</p>
              <p className="text-lg font-bold text-blue-600">{stats.toros}</p>
            </div>
            <div className="text-center bg-pink-50 p-2 rounded">
              <p className="text-xs text-gray-600">Vacas</p>
              <p className="text-lg font-bold text-pink-600">{stats.vacas}</p>
            </div>
            <div className="text-center bg-yellow-50 p-2 rounded">
              <p className="text-xs text-gray-600">Terneros</p>
              <p className="text-lg font-bold text-yellow-600">{stats.terneros}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center bg-green-50 p-2 rounded">
                <p className="text-xs text-gray-600">Vacas Amamantando</p>
                <p className="text-lg font-bold text-green-600">{stats.vacasAmam}</p>
              </div>
              <div className="text-center bg-purple-50 p-2 rounded">
                <p className="text-xs text-gray-600">Vacas No Amamantando</p>
                <p className="text-lg font-bold text-purple-600">{stats.vacasNoAmam}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas para filtrar */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`animal-tab inline-block p-2 border-b-2 ${
                activeTab === 'todos'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'
              }`}
              data-category="todos"
              onClick={() => handleTabClick('todos')}
            >
              Todos
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`animal-tab inline-block p-2 border-b-2 ${
                activeTab === 'toros'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'
              }`}
              data-category="toros"
              onClick={() => handleTabClick('toros')}
            >
              Toros
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`animal-tab inline-block p-2 border-b-2 ${
                activeTab === 'vacas-amam'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'
              }`}
              data-category="vacas-amam"
              onClick={() => handleTabClick('vacas-amam')}
            >
              Vacas amamantando
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`animal-tab inline-block p-2 border-b-2 ${
                activeTab === 'vacas-no-amam'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'
              }`}
              data-category="vacas-no-amam"
              onClick={() => handleTabClick('vacas-no-amam')}
            >
              Vacas no amamantando
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`animal-tab inline-block p-2 border-b-2 ${
                activeTab === 'terneros'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent hover:border-primary hover:text-primary dark:hover:text-primary-light'
              }`}
              data-category="terneros"
              onClick={() => handleTabClick('terneros')}
            >
              Terneros
            </button>
          </li>
        </ul>
      </div>

      {/* Contenido según pestaña */}
      <div className="animal-content">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando animales...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
          </div>
        ) : getFilteredAnimals().length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No hay animales para mostrar en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Género</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cuadra</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Nac.</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Padre</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Madre</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredAnimals().map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {animalService.getAnimalIcon(animal)} {animal.nom}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {animal.genere === 'M' ? 'Toro' : 'Vaca'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${animalService.getAnimalStatusClass(animal.estado)}`}>
                        {animal.estado === 'OK' ? 'Activo' : 'Fallecido'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {animal.quadra || animal.explotacio || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {animal.dob || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {animal.pare || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {animal.mare || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplotacionAnimals;
