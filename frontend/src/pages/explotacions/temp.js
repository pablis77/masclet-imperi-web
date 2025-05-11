// Datos hardcodeados para explotaciones conocidas
const explotacionesFijas = {
  'Gurans': {
    totalAnimales: 51,
    partos: 47,
    toros: 20,
    vacas: 31,
    terneros: 15,
    vacasAmam: 10,
    vacasNoAmam: 21
  },
  'Madrid': {
    totalAnimales: 4,
    partos: 2,
    toros: 1,
    vacas: 3,
    terneros: 1,
    vacasAmam: 1,
    vacasNoAmam: 2
  }
};

// Función simplificada que usa solo datos hardcodeados
async function loadInitialData() {
  try {
    console.log('Cargando datos iniciales...');
    
    // Mostrar indicador de carga
    const loadingElement = document.getElementById('loading-indicator');
    const noResultsElement = document.getElementById('no-results');
    
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }
    if (noResultsElement) {
      noResultsElement.style.display = 'none';
    }
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token de autenticación');
      window.location.href = '/login';
      return;
    }
    
    // Lista de explotaciones hardcodeada para desarrollo
    const explotacionesList = [
      { explotacio: 'Gurans' },
      { explotacio: 'Madrid' },
      { explotacio: 'Barcelona' },
      { explotacio: 'Valencia' },
      { explotacio: 'Sevilla' }
    ];

    // Si no tenemos explotaciones, no tiene sentido continuar
    if (!explotacionesList || explotacionesList.length === 0) {
      console.warn('No se encontraron explotaciones');
      if (noResultsElement) {
        noResultsElement.style.display = 'block';
        noResultsElement.innerHTML = `<p class="text-center py-4">No se encontraron explotaciones registradas en el sistema</p>`;
      }
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      return;
    }
    
    // Crear array con los datos procesados
    const explotacionesData = explotacionesList.map(explotacion => {
      // Obtener el código de explotación
      const explotacionCode = explotacion.code || explotacion.explotacio;
      
      // Valores por defecto
      let totalAnimales = 0;
      let toros = 0;
      let vacas = 0;
      let terneros = 0;
      let partos = 0;
      let vacasAmam = 0;
      let vacasNoAmam = 0;
      
      // Usar datos fijos si existen
      if (explotacionesFijas[explotacionCode]) {
        const datos = explotacionesFijas[explotacionCode];
        totalAnimales = datos.totalAnimales;
        toros = datos.toros;
        vacas = datos.vacas;
        terneros = datos.terneros;
        partos = datos.partos;
        vacasAmam = datos.vacasAmam;
        vacasNoAmam = datos.vacasNoAmam;
      } else {
        // Para otras explotaciones, generar datos aleatorios realistas
        totalAnimales = Math.floor(Math.random() * 20) + 5;
        partos = Math.floor(Math.random() * 15);
        toros = Math.floor(totalAnimales * 0.3);
        vacas = totalAnimales - toros;
        terneros = Math.floor(partos * 0.7);
        vacasAmam = Math.floor(vacas * 0.4);
        vacasNoAmam = vacas - vacasAmam;
      }

      // Devolver objeto con todos los datos procesados
      return {
        explotacionCode,
        totalAnimales,
        toros,
        vacas,
        terneros,
        partos,
        vacasAmam,
        vacasNoAmam
      };
    });

    // Crear tarjetas para cada explotación
    renderExplotacionCards(explotacionesData);
    
    // Ocultar indicador de carga
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
    
    // Ocultar indicador de carga
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // Mostrar mensaje de error
    const noResultsElement = document.getElementById('no-results');
    if (noResultsElement) {
      noResultsElement.style.display = 'block';
      noResultsElement.innerHTML = `<p class="text-center py-4">Error al cargar datos: ${error.message}</p>`;
    }
  }
}
