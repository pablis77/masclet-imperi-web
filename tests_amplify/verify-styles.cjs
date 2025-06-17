/**
 * Test para verificar que los estilos CSS están correctamente incluidos en el index.html
 * Este test comprueba que los archivos CSS críticos estén presentes y accesibles
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuración de rutas
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist', 'client');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const ASTRO_DIR = path.join(DIST_DIR, '_astro');

// CSS críticos que deben estar presentes
const CRITICAL_CSS = [
  'index.css',
  'vendor.css',
  '_id_.css'
];

console.log(chalk.blue('🔍 VERIFICANDO ESTILOS CSS EN INDEX.HTML'));
console.log(chalk.blue('=================================='));

// Comprobar que index.html existe
if (!fs.existsSync(INDEX_HTML)) {
  console.log(chalk.red('❌ ERROR: No se encontró index.html en ' + DIST_DIR));
  process.exit(1);
}

// Leer el contenido del index.html
const indexHtml = fs.readFileSync(INDEX_HTML, 'utf-8');

// Verificar que hay etiquetas link para CSS
const cssLinkMatches = indexHtml.match(/<link rel=['"]stylesheet['"]/g);
if (!cssLinkMatches) {
  console.log(chalk.red('❌ ERROR: No se encontraron etiquetas link para CSS'));
  process.exit(1);
}

console.log(chalk.green(`✅ Encontrados ${cssLinkMatches.length} enlaces de CSS en index.html`));

// Verificar que contiene los CSS críticos
let cssFilesFound = [];
let allCssFound = true;

// Buscar todos los archivos CSS en _astro
const cssFiles = fs.readdirSync(ASTRO_DIR)
  .filter(file => file.endsWith('.css'))
  .map(file => file);

console.log(chalk.blue(`🔍 CSS disponibles en _astro: ${cssFiles.length}`));

// Verificar cada CSS crítico
for (const cssBase of CRITICAL_CSS) {
  // Expresión regular para encontrar archivos con el nombre base seguido de un hash
  // Por ejemplo: 'index' -> buscará 'index.ABC123.css'
  const baseName = cssBase.split('.')[0];
  const cssPattern = new RegExp(`^${baseName}\..*\.css$`, 'i');
  const matchingCss = cssFiles.find(file => cssPattern.test(file));
  
  if (matchingCss) {
    const cssPath = `/_astro/${matchingCss}`;
    if (indexHtml.includes(cssPath)) {
      console.log(chalk.green(`✅ CSS encontrado: ${cssBase} -> ${matchingCss}`));
      cssFilesFound.push(matchingCss);
    } else {
      console.log(chalk.red(`❌ ERROR: CSS ${cssBase} (${matchingCss}) no está incluido en index.html`));
      allCssFound = false;
    }
  } else {
    console.log(chalk.red(`❌ ERROR: No se encontró ningún archivo CSS que coincida con ${baseName}*.css`));
    allCssFound = false;
  }
}

// Resultado final
console.log(chalk.blue('\n🎯 RESULTADO FINAL'));
console.log(chalk.blue('=================================='));

if (allCssFound) {
  console.log(chalk.green(`✅ ÉXITO: Todos los ${cssFilesFound.length} CSS críticos están incluidos correctamente`));
  process.exit(0);
} else {
  console.log(chalk.red('❌ ERROR: Faltan CSS críticos en index.html'));
  process.exit(1);
}
