/**
 * Script maestro para generar index.html para Masclet Imperi Web
 * Este script coordina los módulos que generan el HTML final
 */
const fs = require('fs');
const path = require('path');

// Directorios de trabajo
const clientDir = path.join(__dirname, 'dist', 'client');
const astroDir = path.join(clientDir, '_astro');

// Ruta al favicon en los artefactos
const faviconSourcePath = path.join(__dirname, '..', 'AWS_AMPLIFY', 'LOGS builds', 'Deployment-26-artifacts', 'favico.ico');
const faviconTargetPath = path.join(clientDir, 'favicon.ico');

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
// Para entorno de producción en Amplify, los assets pueden estar directamente en clientDir
// en lugar de astroDir (_astro), por lo que comprobamos ambas ubicaciones
let foundAssets;
try {
  foundAssets = findAssets(astroDir);
  console.log(`\u2705 Assets encontrados en ${astroDir}`);
} catch (error) {
  console.warn(`\u26a0️ No se encontraron assets en ${astroDir}, buscando en ${clientDir}...`);
  foundAssets = findAssets(clientDir);
  console.log(`\u2705 Assets encontrados en ${clientDir}`);
}

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

// 6. Copiar favicon.ico
console.log('\n🖼️ Copiando favicon.ico...');
try {
  if (fs.existsSync(faviconSourcePath)) {
    fs.copyFileSync(faviconSourcePath, faviconTargetPath);
    console.log(`✅ favicon.ico copiado correctamente a ${faviconTargetPath}`);
  } else {
    console.warn(`⚠️ No se encontró el favicon en ${faviconSourcePath}`);
    // Intentar buscar en otras ubicaciones
    const alternativePaths = [
      path.join(__dirname, '..', 'AWS_AMPLIFY', 'favico.ico'),
      path.join(__dirname, '..', 'public', 'favicon.ico'),
      path.join(__dirname, 'public', 'favicon.ico'),
      path.join(__dirname, 'src', 'favicon.ico'),
    ];
    
    let faviconCopied = false;
    for (const altPath of alternativePaths) {
      if (fs.existsSync(altPath)) {
        fs.copyFileSync(altPath, faviconTargetPath);
        console.log(`✅ favicon.ico copiado desde ubicación alternativa: ${altPath}`);
        faviconCopied = true;
        break;
      }
    }
    
    if (!faviconCopied) {
      console.error(`❌ No se pudo encontrar favicon.ico en ninguna ubicación conocida`);
    }
  }
} catch (error) {
  console.error(`❌ Error al copiar favicon.ico: ${error.message}`);
}

console.log('\n🚀 Proceso completado con éxito');
