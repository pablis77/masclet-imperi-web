/**
 * Test para verificar que el index.html generado contiene scripts core
 * Debe ejecutarse después de npm run build
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Ruta al index.html generado
const indexPath = path.resolve(__dirname, '..', 'frontend', 'dist', 'client', 'index.html');

console.log('🔍 TEST DE VALIDACIÓN DE INDEX.HTML');
console.log('==================================');
console.log(`Verificando archivo: ${indexPath}`);

// Comprobar que el archivo existe
if (!fs.existsSync(indexPath)) {
  console.error('❌ ERROR: index.html no existe.');
  process.exit(1);
}

// Leer el contenido del archivo
const htmlContent = fs.readFileSync(indexPath, 'utf-8');
console.log(`✅ El archivo index.html existe (${htmlContent.length} bytes)`);

// Verificar que contiene scripts core (al menos 3 tags script)
const scriptTags = htmlContent.match(/<script\s+[^>]*src=["']?\/_astro\/[^"']+\.js["']?[^>]*><\/script>/g) || [];
console.log(`Encontrados ${scriptTags.length} tags <script> en el HTML`);

// Los scripts críticos deben estar entre el marcador y la sección SECTION_ASSETS
const criticalScriptsSection = htmlContent.match(/<!-- Scripts críticos -->([\s\S]+?)<!-- Scripts por sección/);
if (!criticalScriptsSection) {
  console.error('❌ ERROR: No se encontró la sección de scripts críticos en el HTML.');
  process.exit(1);
}

// Contar scripts core en la sección crítica
const coreScriptTags = criticalScriptsSection[0].match(/<script\s+[^>]*src=["']?\/_astro\/[^"']+\.js["']?[^>]*><\/script>/g) || [];
console.log(`Encontrados ${coreScriptTags.length} scripts core en la sección crítica`);

// FALLA si no hay scripts core
if (coreScriptTags.length === 0) {
  console.error('❌ ERROR: No se encontraron tags <script> en la sección crítica.');
  process.exit(1);
}

// Verificar script vendor (obligatorio)
if (!htmlContent.includes('vendor.') || !htmlContent.match(/vendor\.[A-Za-z0-9]+\.js/)) {
  console.error('❌ ERROR: No se encontró el script vendor en el HTML.');
  process.exit(1);
}

// Verificar que no hay marcadores de "No se encontraron scripts JS"
if (htmlContent.includes('No se encontraron scripts JS')) {
  console.error('❌ ERROR: El HTML contiene marcadores de "No se encontraron scripts JS".');
  process.exit(1);
}

// Verificar SECTION_ASSETS
if (!htmlContent.includes('SECTION_ASSETS') || !htmlContent.includes('"core":')) {
  console.error('❌ ERROR: No se encontró la sección SECTION_ASSETS con core en el HTML.');
  process.exit(1);
}

// Todo OK
console.log('✅ El archivo index.html contiene correctamente los scripts core.');
console.log('✅ TEST SUPERADO: El archivo index.html está listo para despliegue.');
