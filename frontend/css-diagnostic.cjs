/**
 * DIAGNÓSTICO CSS - Verifica la ubicación y disponibilidad de los archivos CSS críticos
 * 
 * Este script comprueba dónde están los archivos CSS necesarios para visualizar la interfaz
 * y verifica si existen en las ubicaciones donde la aplicación los busca.
 */
const fs = require('fs');
const path = require('path');

// Directorios principales
const clientDir = path.join(__dirname, 'dist', 'client');
const astroDir = path.join(clientDir, '_astro');
const stylesDir = path.join(clientDir, 'styles');

console.log('\n📊 DIAGNÓSTICO DE CSS MASCLET-IMPERI');
console.log('====================================');

// Comprobar existencia de directorios
console.log('\n🔍 Verificando directorios...');
console.log(`Directorio client: ${fs.existsSync(clientDir) ? '✅ EXISTE' : '❌ NO EXISTE'}`);
console.log(`Directorio _astro: ${fs.existsSync(astroDir) ? '✅ EXISTE' : '❌ NO EXISTE'}`);
console.log(`Directorio styles: ${fs.existsSync(stylesDir) ? '✅ EXISTE' : '❌ NO EXISTE'}`);

// Buscar archivos CSS en _astro
if (fs.existsSync(astroDir)) {
  console.log('\n🔍 Buscando archivos CSS en _astro...');
  const astroCssFiles = fs.readdirSync(astroDir)
    .filter(file => file.endsWith('.css'));
  
  console.log(`Encontrados ${astroCssFiles.length} archivos CSS en _astro:`);
  astroCssFiles.forEach(file => {
    const filePath = path.join(astroDir, file);
    const fileSizeKB = Math.round(fs.statSync(filePath).size / 1024);
    console.log(`- ${file} (${fileSizeKB} KB)`);
  });
  
  // Buscar CSS core específicamente
  console.log('\n🔍 Verificando CSS core en _astro...');
  const indexCss = astroCssFiles.find(f => f.includes('index'));
  const vendorCss = astroCssFiles.find(f => f.includes('vendor'));
  const idCss = astroCssFiles.find(f => f.includes('_id_'));
  
  console.log(`index.css: ${indexCss ? '✅ ENCONTRADO: ' + indexCss : '❌ NO ENCONTRADO'}`);
  console.log(`vendor.css: ${vendorCss ? '✅ ENCONTRADO: ' + vendorCss : '❌ NO ENCONTRADO'}`);
  console.log(`_id_.css: ${idCss ? '✅ ENCONTRADO: ' + idCss : '❌ NO ENCONTRADO'}`);
}

// Buscar archivos CSS en styles
if (fs.existsSync(stylesDir)) {
  console.log('\n🔍 Buscando archivos CSS en styles...');
  const stylesCssFiles = fs.readdirSync(stylesDir)
    .filter(file => file.endsWith('.css'));
  
  console.log(`Encontrados ${stylesCssFiles.length} archivos CSS en styles:`);
  stylesCssFiles.forEach(file => {
    const filePath = path.join(stylesDir, file);
    const fileSizeKB = Math.round(fs.statSync(filePath).size / 1024);
    console.log(`- ${file} (${fileSizeKB} KB)`);
  });
}

// Verificar referencias en index.html
if (fs.existsSync(path.join(clientDir, 'index.html'))) {
  console.log('\n🔍 Analizando referencias CSS en index.html...');
  
  const indexHtml = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf-8');
  const cssLinkPattern = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
  
  const cssLinks = [];
  let match;
  while ((match = cssLinkPattern.exec(indexHtml)) !== null) {
    cssLinks.push(match[1]);
  }
  
  console.log(`Encontradas ${cssLinks.length} referencias a archivos CSS en index.html:`);
  cssLinks.forEach(href => {
    const isExternal = href.startsWith('http') || href.startsWith('//');
    if (isExternal) {
      console.log(`- ${href} (externo)`);
      return;
    }
    
    // Determinar ruta completa al archivo referenciado
    let fullPath;
    if (href.startsWith('/')) {
      // Ruta absoluta desde la raíz
      fullPath = path.join(clientDir, href.substring(1));
    } else {
      // Ruta relativa
      fullPath = path.join(clientDir, href);
    }
    
    // Verificar si el archivo existe
    console.log(`- ${href} ${fs.existsSync(fullPath) ? '✅ EXISTE' : '❌ NO EXISTE'}`);
  });
}

console.log('\n📋 DIAGNÓSTICO COMPLETO');
