/**
 * Test para verificar la carga de scripts específicos por sección
 * Implementación 26: Validar que jsFiles reemplaza correctamente a jsPattern
 */

const path = require('path');
const fs = require('fs');
const sectionLoader = require('./section-loader.cjs');

// Función auxiliar para crear un conjunto de prueba de assets
function createTestAssets() {
  return {
    allJs: [
      // Core assets
      'src/config/apiConfig.centralizado.ts',
      'src/services/apiConfigAdapter.ts',
      'src/services/apiService.ts',
      'src/services/notificationService.ts',
      'src/services/authService.js',
      'node_modules/.vite/deps/axios.js',
      'node_modules/.vite/deps/react.js',
      
      // Dashboard assets
      'src/components/dashboard/dashboardv2/cards/DashboardV2.tsx',
      'src/components/dashboard/sections/PartosSection.tsx',
      'src/components/dashboard/components/ResumenOriginalCard.tsx',
      
      // Explotaciones assets
      'src/components/explotaciones-react/ExplotacionesPage.tsx',
      
      // Animals assets
      'src/components/animals/AnimalFilters.tsx',
      'src/components/animals/AnimalTable.tsx',
      
      // Otros archivos que no deberían estar en ninguna sección específica
      'src/components/otros/ComponenteNoListado.tsx'
    ],
    allCss: [
      'styles/index.css',
      'styles/global.css',
      'styles/dashboard.css',
      'styles/explotacion.css',
      'styles/animal.css',
      'styles/login.css',
      'styles/otros.css'
    ]
  };
}

// Tests
console.log('Iniciando tests de section-loader.cjs...');

// Test 1: Verificar que organizeSectionAssets funciona con jsFiles
function testOrganizeSectionAssets() {
  console.log('\nTest 1: Verificar organización de assets por sección');
  
  const testAssets = createTestAssets();
  const result = sectionLoader.organizeSectionAssets(testAssets, 'DASHBOARD');
  
  // Verificar que se cargaron los assets del core
  const coreJsCount = result.core && result.core.js ? result.core.js.length : 0;
  console.log(`- Assets JS del core cargados: ${coreJsCount}`);
  if (coreJsCount < 1) {
    console.error('ERROR: No se cargaron assets JS del core');
  } else {
    console.log('✓ Assets JS del core cargados correctamente');
  }
  
  // Verificar que se cargaron los assets de la sección actual (DASHBOARD)
  const dashboardJsCount = result.DASHBOARD && result.DASHBOARD.js ? result.DASHBOARD.js.length : 0;
  console.log(`- Assets JS del dashboard cargados: ${dashboardJsCount}`);
  if (dashboardJsCount < 1) {
    console.error('ERROR: No se cargaron assets JS del dashboard');
  } else {
    console.log('✓ Assets JS del dashboard cargados correctamente');
  }
  
  // Verificar que no se cargaron archivos que no deberían estar
  const coreHasComponent = result.core && result.core.js ? 
                          result.core.js.some(js => js.includes('ComponenteNoListado')) : false;
  const dashboardHasComponent = result.DASHBOARD && result.DASHBOARD.js ? 
                          result.DASHBOARD.js.some(js => js.includes('ComponenteNoListado')) : false;
  const otroComponenteIncluido = coreHasComponent || dashboardHasComponent;
  if (otroComponenteIncluido) {
    console.error('ERROR: Se incluyó un componente que no debería estar en la sección');
  } else {
    console.log('✓ No se incluyeron componentes no listados');
  }
  
  return coreJsCount > 0 && dashboardJsCount > 0 && !otroComponenteIncluido;
}

// Test 2: Verificar que detectSection funciona correctamente
function testDetectSection() {
  console.log('\nTest 2: Verificar detección de sección desde URL');
  
  const tests = [
    { url: '/dashboard', expected: 'DASHBOARD' },
    { url: '/explotaciones', expected: 'EXPLOTACIONES' },
    { url: '/animals', expected: 'ANIMALES' },
    { url: '/users', expected: 'USUARIOS' },
    { url: '/imports', expected: 'IMPORTACION' },
    { url: '/ruta-no-existente', expected: 'DASHBOARD' } // Default
  ];
  
  let allPassed = true;
  
  tests.forEach(test => {
    const detected = sectionLoader.detectSection(test.url);
    console.log(`- URL: ${test.url} -> Sección detectada: ${detected}`);
    
    if (detected !== test.expected) {
      console.error(`ERROR: La URL ${test.url} debería detectar ${test.expected}, pero detectó ${detected}`);
      allPassed = false;
    }
  });
  
  if (allPassed) {
    console.log('✓ Todas las URL se detectaron correctamente');
  }
  
  return allPassed;
}

// Ejecutar todos los tests
const test1Passed = testOrganizeSectionAssets();
const test2Passed = testDetectSection();

// Resultado final
console.log('\n=== Resultado de tests ===');
if (test1Passed && test2Passed) {
  console.log('✅ Todos los tests pasaron. La implementación con jsFiles funciona correctamente.');
} else {
  console.log('❌ Algunos tests fallaron. Revisar los errores arriba.');
}
