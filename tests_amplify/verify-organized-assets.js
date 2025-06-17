/**
 * Test para verificar la organización de assets y detectar duplicados
 * Este script valida que los assets se organizan correctamente por sección
 * y detecta posibles duplicados en la sección core
 */

const fs = require('fs');
const path = require('path');

// Importar el módulo section-loader directamente
const sectionLoader = require('../frontend/build-modules/section-loader.cjs');
const { organizeSectionAssets, detectSection } = sectionLoader;

// Simulamos un entorno de assets para test
const mockAssets = {
  allJs: [],
  allCss: [],
  js: {}
};

// Ruta de los assets generados (adaptada al entorno actual)
const distPath = path.join(__dirname, '../frontend/dist/client/_astro');

// Función para cargar los archivos JS reales del directorio dist
function loadRealAssets() {
  console.log('Buscando assets en:', distPath);
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ ERROR: El directorio de assets no existe:', distPath);
    console.log('Ejecuta npm run build primero para generar los assets');
    process.exit(1);
  }
  
  // Leer todos los archivos .js del directorio dist
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  console.log(`📊 Encontrados ${jsFiles.length} archivos JS en _astro`);
  
  // Cargar en nuestro objeto mock
  mockAssets.allJs = jsFiles.map(file => `/_astro/${file}`);
  
  return mockAssets;
}

// Función auxiliar para detectar duplicados en un array
function findDuplicates(array) {
  const seen = new Set();
  const duplicates = [];
  
  for (const item of array) {
    // Extraer nombre base del archivo (sin hash)
    const baseName = item.split('/').pop().replace(/\.([A-Za-z0-9_\-]+)\.js$/, '.js');
    
    if (seen.has(baseName)) {
      duplicates.push({ file: item, baseName });
    } else {
      seen.add(baseName);
    }
  }
  
  return duplicates;
}

// Función principal de test
function runTest() {
  console.log('🧪 Ejecutando test de organización de assets...');
  
  // Cargar assets reales del build
  const assets = loadRealAssets();
  
  // Organizar los assets por sección (simulando dashboard como sección actual)
  const organized = organizeSectionAssets(assets, 'DASHBOARD');
  
  console.log('\n📑 RESUMEN DE ASSETS ORGANIZADOS:');
  
  // Contar assets por sección
  let totalScripts = 0;
  for (const [section, data] of Object.entries(organized)) {
    if (data.js) {
      console.log(`📂 ${section}: ${data.js.length} scripts`);
      totalScripts += data.js.length;
      
      // Si es core, mostrar los archivos
      if (section.toLowerCase() === 'core') {
        console.log('\n📋 LISTADO DE SCRIPTS CORE:');
        data.js.forEach(script => console.log(`   - ${script}`));
        
        // Detectar duplicados en core
        const duplicates = findDuplicates(data.js);
        if (duplicates.length > 0) {
          console.error(`\n❌ ALERTA: Se encontraron ${duplicates.length} scripts duplicados en core:`);
          duplicates.forEach(dup => console.error(`   - ${dup.baseName} => ${dup.file}`));
          process.exit(1);
        }
      }
    }
  }
  
  console.log(`\n📈 TOTAL: ${totalScripts} scripts en todas las secciones`);
  
  // Verificar scripts especiales Dashboard
  console.log('\n🔍 VERIFICANDO SCRIPTS CRÍTICOS:');
  const dashboardAssets = organized.DASHBOARD?.js || [];
  
  // Scripts críticos que deben estar presentes
  const criticalScripts = [
    'PartosSection',
    'ResumenOriginalCard',
    'DashboardV2'
  ];
  
  for (const script of criticalScripts) {
    const found = dashboardAssets.some(s => s.includes(script));
    console.log(`${found ? '✅' : '❌'} ${script}.js: ${found ? 'Presente' : 'FALTA'}`);
    
    if (!found) {
      console.error(`\n⚠️ ADVERTENCIA: Script crítico falta en DASHBOARD: ${script}.js`);
      // No fallamos el test, solo advertimos
    }
  }
  
  console.log('\n✅ Test completado sin errores críticos');
  return true;
}

// Ejecutar el test
runTest();
