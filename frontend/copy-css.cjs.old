/**
 * COPIA CSS - Garantiza que los CSS necesarios estén disponibles en la estructura de despliegue
 * 
 * Este script copia los archivos CSS críticos desde _astro/ a styles/ y actualiza el index.html
 * para que incluya las etiquetas <link> necesarias. Esto soluciona el problema de pantalla en blanco.
 */
const fs = require('fs');
const path = require('path');

// Directorios principales
const clientDir = path.join(__dirname, 'dist', 'client');
const astroDir = path.join(clientDir, '_astro');
const stylesDir = path.join(clientDir, 'styles');

console.log('\n🔄 COPIANDO CSS CRÍTICOS PARA DESPLIEGUE');
console.log('======================================');

// Asegurarnos que existe el directorio styles
if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
  console.log(`✅ Creado directorio styles: ${stylesDir}`);
}

// Buscar y copiar los CSS
if (fs.existsSync(astroDir)) {
  const astroCssFiles = fs.readdirSync(astroDir)
    .filter(file => file.endsWith('.css'));
  
  console.log(`🔍 Encontrados ${astroCssFiles.length} archivos CSS en _astro`);
  
  // Copiar cada CSS
  astroCssFiles.forEach(cssFile => {
    const sourcePath = path.join(astroDir, cssFile);
    const targetPath = path.join(stylesDir, cssFile);
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copiado ${cssFile} a styles/`);
  });
  
  console.log('✅ Proceso de copia de CSS completado');
  
  // También modificamos el index.html para insertar las referencias CSS
  const indexHtmlPath = path.join(clientDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    console.log('\n🔄 Modificando index.html para incluir referencias CSS...');
    
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
    
    // Verificar si ya tiene etiquetas link para CSS
    const hasCssLinks = /<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*\.css["'][^>]*>/.test(indexHtml);
    
    if (!hasCssLinks) {
      // Crear los tags para los archivos CSS
      const cssLinks = astroCssFiles.map(cssFile => {
        return `<link rel="stylesheet" href="styles/${cssFile}">`;
      }).join('\n    ');
      
      // Insertar antes de </head>
      indexHtml = indexHtml.replace('</head>', `    ${cssLinks}\n  </head>`);
      
      // Guardar el archivo modificado
      fs.writeFileSync(indexHtmlPath, indexHtml);
      console.log(`✅ Añadidas ${astroCssFiles.length} referencias CSS a index.html`);
    } else {
      console.log('⚠️ index.html ya contiene etiquetas CSS, no se modificó');
    }
  }
} else {
  console.error(`❌ No existe el directorio _astro: ${astroDir}`);
  process.exit(1);
}

console.log('\n📋 PROCESO COMPLETO DE CSS');
