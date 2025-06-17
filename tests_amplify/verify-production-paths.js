/**
 * Test para verificar que las rutas de los assets en producción son correctas
 * Simula el entorno de Amplify para detectar posibles 404s
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const chalk = require('chalk');

// Configuración de rutas
const DIST_DIR = path.join(__dirname, '..', 'dist', 'client');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const ASTRO_DIR = path.join(DIST_DIR, '_astro');

// Función principal
async function verifyProductionPaths() {
  console.log(chalk.blue('🔍 VERIFICANDO RUTAS DE PRODUCCIÓN PARA AMPLIFY'));
  console.log(chalk.blue('=================================='));
  
  // 1. Verificar que existe index.html
  if (!fs.existsSync(INDEX_HTML)) {
    console.error(chalk.red('❌ ERROR: No se encontró index.html en dist/client'));
    process.exit(1);
  }
  console.log(chalk.green('✅ index.html encontrado'));
  
  // 2. Cargar el contenido del index.html
  const htmlContent = fs.readFileSync(INDEX_HTML, 'utf-8');
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  // 3. Extraer todos los scripts de la página
  const scripts = document.querySelectorAll('script[src]');
  console.log(chalk.blue(`🔍 Encontrados ${scripts.length} scripts en index.html`));
  
  // 4. Verificar para cada script si existe en el sistema de archivos
  let fileNotFound = 0;
  let filesFound = 0;
  
  // Simulamos diferentes configuraciones de BASE_PATH
  const basePaths = ['', '/', '_astro/', '/client'];
  let bestBasePath = '';
  let bestMatchCount = 0;
  
  for (const basePath of basePaths) {
    let currentMatches = 0;
    console.log(chalk.blue(`\n🔍 Probando con BASE_PATH='${basePath}':`));
    
    for (const script of scripts) {
      let src = script.getAttribute('src');
      if (!src) continue;
      
      // Limpiar la ruta de src para obtener solo el nombre del archivo
      const scriptFilename = src.split('/').pop();
      
      // Buscar en _astro por correspondencia
      const matchingFiles = fs.readdirSync(ASTRO_DIR)
        .filter(file => file === scriptFilename || file.includes(scriptFilename.split('.')[0]));
      
      if (matchingFiles.length > 0) {
        console.log(chalk.green(`✅ Script encontrado: ${src} -> ${matchingFiles[0]}`));
        currentMatches++;
      } else {
        console.log(chalk.red(`❌ No encontrado: ${src}`));
      }
    }
    
    console.log(chalk.blue(`✨ BASE_PATH='${basePath}': ${currentMatches}/${scripts.length} scripts encontrados`));
    
    if (currentMatches > bestMatchCount) {
      bestMatchCount = currentMatches;
      bestBasePath = basePath;
    }
  }

  // 5. Verificar si Navbar, Sidebar, Footer, MainLayout están presentes
  console.log(chalk.blue('\n🔍 VERIFICANDO COMPONENTES CRÍTICOS DE LAYOUT'));
  
  // Buscar archivos hoisted.* que puedan contener los componentes de layout
  const hoistedFiles = fs.readdirSync(ASTRO_DIR)
    .filter(file => file.startsWith('hoisted.'));
  
  console.log(chalk.blue(`🔍 Encontrados ${hoistedFiles.length} archivos hoisted en _astro`));
  
  if (hoistedFiles.length >= 4) {
    console.log(chalk.green('✅ Cantidad suficiente de archivos hoisted.* para la carcasa'));
  } else {
    console.log(chalk.yellow('⚠️ Cantidad insuficiente de archivos hoisted.* para la carcasa completa'));
  }
  
  // 6. Verificar CSS
  const styles = document.querySelectorAll('link[rel="stylesheet"]');
  console.log(chalk.blue(`\n🔍 Encontrados ${styles.length} estilos CSS en index.html`));
  
  for (const style of styles) {
    let href = style.getAttribute('href');
    if (!href) continue;
    
    // Limpiar la ruta de href para obtener solo el nombre del archivo
    const cssFilename = href.split('/').pop();
    
    // Buscar en _astro por correspondencia
    const matchingCss = fs.readdirSync(ASTRO_DIR)
      .filter(file => file === cssFilename || file.includes(cssFilename.split('.')[0]));
    
    if (matchingCss.length > 0) {
      console.log(chalk.green(`✅ CSS encontrado: ${href} -> ${matchingCss[0]}`));
    } else {
      console.log(chalk.red(`❌ No encontrado: ${href}`));
    }
  }
  
  // 7. Conclusión
  console.log(chalk.blue('\n🎯 RESULTADO FINAL'));
  console.log(chalk.blue('=================================='));
  
  if (bestMatchCount === scripts.length) {
    console.log(chalk.green(`✅ ÉXITO: Todas los scripts se encontraron con BASE_PATH='${bestBasePath}'`));
    console.log(chalk.green('✅ La configuración actual parece correcta para producción'));
    
    // Sugerencia para Amplify
    console.log(chalk.blue('\n🔧 SUGERENCIA PARA AMPLIFY:'));
    console.log(chalk.blue('Si hay problemas en producción, asegúrate que:'));
    console.log(chalk.blue(`1. La base en astro.config.mjs es '${bestBasePath}'`));
    console.log(chalk.blue(`2. La constante BASE_PATH en html-generator.cjs es '${bestBasePath}'`));
    
  } else {
    console.log(chalk.yellow(`⚠️ ALERTA: Solo ${bestMatchCount}/${scripts.length} scripts encontrados con BASE_PATH='${bestBasePath}'`));
    console.log(chalk.yellow('⚠️ Es posible que haya problemas de rutas en producción'));
    
    console.log(chalk.blue('\n🔧 ACCIONES RECOMENDADAS:'));
    console.log(chalk.blue(`1. Modificar la base en astro.config.mjs a '${bestBasePath}'`));
    console.log(chalk.blue(`2. Ajustar la constante BASE_PATH en html-generator.cjs a '${bestBasePath}'`));
    console.log(chalk.blue('3. En generateScriptTags() y generateCssTags(), verificar la formación de rutas'));
  }
}

// Ejecutar el test
verifyProductionPaths().catch(err => {
  console.error(chalk.red('❌ ERROR durante la verificación:'), err);
  process.exit(1);
});
