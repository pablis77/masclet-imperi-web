/**
 * Script para optimizar archivos CSS
 * Elimina reglas duplicadas, minimiza y comprime el código CSS
 */
const fs = require('fs');
const path = require('path');

// Configuración
const sourceDir = path.join(__dirname, '..', 'src');
const outputDir = path.join(__dirname, '..', 'public', 'assets', 'css');

// Asegurarse de que el directorio de salida existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Función para procesar un archivo CSS
function processFile(filePath, fileName) {
  const css = fs.readFileSync(filePath, 'utf8');
  console.log(`Procesando: ${filePath}`);
  
  try {
    // En un entorno real, aquí usaríamos PostCSS, cssnano, autoprefixer, etc.
    // Para este ejemplo, simplemente eliminaremos comentarios y espacios extra
    let optimizedCss = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios
      .replace(/\s+/g, ' ')            // Reducir espacios múltiples a uno solo
      .replace(/\s*{\s*/g, '{')        // Eliminar espacios alrededor de llaves
      .replace(/\s*}\s*/g, '}')        // Eliminar espacios alrededor de llaves
      .replace(/\s*;\s*/g, ';')        // Eliminar espacios alrededor de punto y coma
      .replace(/\s*:\s*/g, ':')        // Eliminar espacios alrededor de dos puntos
      .replace(/;\}/g, '}')            // Eliminar punto y coma antes de llave de cierre
      .trim();                          // Eliminar espacios al principio y final
    
    // Estadísticas
    const originalSize = Buffer.byteLength(css, 'utf8');
    const optimizedSize = Buffer.byteLength(optimizedCss, 'utf8');
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    // Guardar versión optimizada
    fs.writeFileSync(path.join(outputDir, `${fileName}.min.css`), optimizedCss);
    
    console.log(`✅ ${fileName}.min.css - Reducción: ${reduction}% (${originalSize} → ${optimizedSize} bytes)`);
    return {
      file: fileName,
      originalSize,
      optimizedSize,
      reduction: parseFloat(reduction)
    };
  } catch (error) {
    console.error(`❌ Error al procesar ${fileName}:`, error);
    return {
      file: fileName,
      error: error.message
    };
  }
}

// Función principal
function main() {
  console.log('🚀 Iniciando optimización de CSS para producción...');
  
  // Archivos CSS principales
  const mainCssFiles = [
    { path: path.join(sourceDir, 'styles', 'global.css'), name: 'global' },
    { path: path.join(sourceDir, 'styles', 'main.css'), name: 'main' },
    { path: path.join(sourceDir, 'styles', 'lemon-squeezy.css'), name: 'lemon-squeezy' }
  ];
  
  // Procesar cada archivo
  const results = [];
  for (const file of mainCssFiles) {
    if (fs.existsSync(file.path)) {
      const result = processFile(file.path, file.name);
      results.push(result);
    } else {
      console.warn(`⚠️ Archivo no encontrado: ${file.path}`);
    }
  }
  
  // Crear archivo combinado para producción si hay resultados
  if (results.length > 0) {
    console.log('🔄 Creando bundle CSS optimizado para producción...');
    
    const combinedCss = results
      .filter(r => !r.error)
      .map(result => 
        fs.readFileSync(path.join(outputDir, `${result.file}.min.css`), 'utf8')
      ).join('\n');
    
    fs.writeFileSync(path.join(outputDir, 'masclet-bundle.min.css'), combinedCss);
    
    const originalTotalSize = results.reduce((acc, result) => acc + (result.originalSize || 0), 0);
    const combinedSize = Buffer.byteLength(combinedCss, 'utf8');
    const totalReduction = ((originalTotalSize - combinedSize) / originalTotalSize * 100).toFixed(2);
    
    console.log('\n📊 Resumen de optimización:');
    console.log('----------------------------------------');
    results.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.file}: Error - ${result.error}`);
      } else {
        console.log(`✅ ${result.file}: ${result.reduction}% reducción`);
      }
    });
    console.log('----------------------------------------');
    console.log(`📦 Bundle final: ${combinedSize} bytes`);
    console.log(`🎯 Reducción total: ${totalReduction}%`);
    console.log(`💾 Guardado en: ${path.join(outputDir, 'masclet-bundle.min.css')}`);
  } else {
    console.log('⚠️ No se encontraron archivos CSS para optimizar');
  }
}

// Ejecutar el script
try {
  main();
  console.log('✅ Optimización de CSS completada');
} catch (error) {
  console.error('Error general:', error);
  process.exit(1);
}
