/**
 * Script maestro para generar index.html para Masclet Imperi Web
 * Este script coordina los módulos que generan el HTML final
 */
const fs = require('fs');
const path = require('path');

// Directorios de trabajo
const clientDir = path.join(__dirname, 'dist', 'client');
const astroDir = path.join(clientDir, '_astro');

// Módulos
const { findAssets } = require('./build-modules/asset-finder.cjs');
const { generateHtml } = require('./build-modules/html-generator.cjs');
const { detectSection, organizeSectionAssets } = require('./build-modules/section-loader.cjs');

console.log('\n📂 GENERADOR INDEX.HTML PARA AMPLIFY');
console.log('=====================================');

// 1. Verificar directorios
if (!fs.existsSync(clientDir)) {
  console.error(`❌ ERROR CRÍTICO: No existe el directorio ${clientDir}`);
  process.exit(1);
}
if (!fs.existsSync(astroDir)) {
  console.error(`❌ ERROR CRÍTICO: No existe el directorio ${astroDir}`);
  process.exit(1);
}

// 2. Crear directorio de módulos si no existe
const modulesDir = path.join(__dirname, 'build-modules');
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
  console.log(`✅ Creado directorio de módulos: ${modulesDir}`);
}

// 3. Encontrar los assets críticos
console.log('\n🔍 Buscando archivos necesarios...');
const foundAssets = findAssets(astroDir);

// 3.1. Organizar assets por secciones
console.log('\n📂 Organizando assets por secciones...');
const defaultSection = 'DASHBOARD'; // Sección por defecto (ruta principal)
const organizedAssets = organizeSectionAssets(foundAssets, defaultSection);
console.log(`✅ Assets organizados para ${Object.keys(organizedAssets).length} secciones`);

// 4. Generar el HTML con los assets organizados por secciones
console.log('\n📝 Generando index.html...');
const htmlContent = generateHtml(organizedAssets);

// 5. Guardar el archivo
const outputPath = path.join(clientDir, 'index.html');
fs.writeFileSync(outputPath, htmlContent);
console.log(`\n✅ index.html creado correctamente en ${outputPath}`);

console.log('\n🚀 Proceso completado con éxito');
