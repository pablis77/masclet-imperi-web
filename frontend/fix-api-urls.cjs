// @ts-nocheck
// La siguiente línea es crucial - indica a Node.js que use CommonJS
// commonjs

/**
 * Script para corregir las URLs del API en el frontend
 * Este script debe ejecutarse en el contenedor del frontend durante el despliegue
 */

const fs = require('fs');
const path = require('path');

// Función para buscar y reemplazar en archivos
function replaceInFile(filePath, searchValue, replaceValue) {
  try {
    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si contiene el patrón a buscar
    if (fileContent.includes(searchValue)) {
      // Reemplazar y escribir de vuelta
      const newContent = fileContent.replace(new RegExp(searchValue, 'g'), replaceValue);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Corregido ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ No se encontró el patrón en ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';
console.log(`🔍 Entorno detectado: ${isProduction ? 'producción' : 'desarrollo'}`);

// Corregir las URLs solo en producción
if (isProduction) {
  console.log('🛠️ Iniciando corrección de URLs API para producción...');
  
  // Paths a los archivos críticos
  const distDir = path.resolve(process.cwd(), 'dist');
  
  // Buscar recursivamente todos los archivos .js en el directorio dist
  function findJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findJsFiles(filePath, fileList);
      } else if (file.endsWith('.js')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }
  
  // Obtener todos los archivos JS
  const jsFiles = findJsFiles(distDir);
  console.log(`🔍 Encontrados ${jsFiles.length} archivos JavaScript para procesar`);
  
  // Patrones a corregir
  const patterns = [
    // Corregir URLs absolutas al backend
    {
      search: 'http://108\\.129\\.139\\.119:8000/api/v1',
      replace: '/api/v1'
    },
    // Corregir URLs con doble prefijo (primer patrón)
    {
      search: '/api/api/v1',
      replace: '/api/v1'
    },
    // Corregir URLs con doble prefijo (segundo patrón - el que está causando el problema)
    {
      search: '/api/v1/api/v1',
      replace: '/api/v1'
    }
  ];
  
  // Procesar cada archivo
  let totalFixed = 0;
  jsFiles.forEach(file => {
    let fileFixed = false;
    patterns.forEach(pattern => {
      if (replaceInFile(file, pattern.search, pattern.replace)) {
        fileFixed = true;
      }
    });
    if (fileFixed) totalFixed++;
  });
  
  console.log(`✅ Proceso completado. Se corrigieron ${totalFixed} archivos de ${jsFiles.length}`);
} else {
  console.log('ℹ️ No se requieren correcciones en entorno de desarrollo');
}
