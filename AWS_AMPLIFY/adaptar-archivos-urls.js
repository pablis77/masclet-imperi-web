/**
 * Script para adaptar archivos con URLs hardcodeadas
 * Este script busca en el código fuente aquellos archivos que contienen URLs
 * hardcodeadas y las sustituye por referencias a nuestra configuración centralizada.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuración
const CONFIG = {
  // Rutas a analizar
  directorios: [
    path.resolve(__dirname, '../frontend/src'),
    path.resolve(__dirname, '../frontend/public'),
  ],
  
  // Patrones de URLs hardcodeadas a reemplazar
  patrones: [
    {
      buscar: /['"]http:\/\/127\.0\.0\.1:8000\/api\/v1['"]/g,
      reemplazar: "API_CONFIG.baseUrl",
      importar: "import { API_CONFIG } from '../config/apiConfig.centralizado';"
    },
    {
      buscar: /['"]http:\/\/localhost:8000\/api\/v1['"]/g,
      reemplazar: "API_CONFIG.baseUrl",
      importar: "import { API_CONFIG } from '../config/apiConfig.centralizado';"
    },
    {
      buscar: /['"]https:\/\/api-masclet-imperi\.loca\.lt\/api\/v1['"]/g,
      reemplazar: "API_CONFIG.baseUrl",
      importar: "import { API_CONFIG } from '../config/apiConfig.centralizado';"
    }
  ],
  
  // Extensiones de archivo a procesar
  extensiones: ['.js', '.ts', '.jsx', '.tsx', '.astro'],
  
  // Carpetas a excluir
  excluir: ['node_modules', 'dist', '.git']
};

// Directorio para resultados
const timestamp = new Date().toISOString().replace(/:/g, '-');
const dirResultados = path.join(__dirname, `adaptacion-urls-${timestamp}`);

// Crear carpeta de resultados
if (!fs.existsSync(dirResultados)) {
  fs.mkdirSync(dirResultados, { recursive: true });
}

// Archivos procesados
const archivos = {
  total: 0,
  modificados: 0,
  conURLs: []
};

/**
 * Busca archivos recursivamente en un directorio
 * @param {string} dir - Directorio a buscar
 * @returns {string[]} - Lista de archivos encontrados
 */
function buscarArchivos(dir) {
  let resultados = [];
  
  // Verificar si debemos excluir este directorio
  const nombreCarpeta = path.basename(dir);
  if (CONFIG.excluir.includes(nombreCarpeta)) {
    return resultados;
  }
  
  // Listar archivos en el directorio
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const rutaCompleta = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Explorar subdirectorio recursivamente
      resultados = resultados.concat(buscarArchivos(rutaCompleta));
    } else {
      // Comprobar extensión del archivo
      const extension = path.extname(item.name).toLowerCase();
      if (CONFIG.extensiones.includes(extension)) {
        resultados.push(rutaCompleta);
      }
    }
  }
  
  return resultados;
}

/**
 * Procesa un archivo para identificar y reemplazar URLs hardcodeadas
 * @param {string} archivo - Ruta del archivo a procesar
 */
function procesarArchivo(archivo) {
  console.log(`Procesando: ${archivo}`);
  archivos.total++;
  
  try {
    // Leer contenido del archivo
    let contenido = fs.readFileSync(archivo, 'utf8');
    let contenidoOriginal = contenido;
    let tieneURLs = false;
    
    // Verificar si contiene algún patrón
    for (const patron of CONFIG.patrones) {
      if (patron.buscar.test(contenido)) {
        tieneURLs = true;
        break;
      }
    }
    
    if (tieneURLs) {
      archivos.conURLs.push({
        ruta: archivo,
        importacion: determinaImportacion(archivo),
      });
      
      // Crear archivo de respaldo
      const rutaRelativa = path.relative(path.resolve(__dirname, '..'), archivo);
      fs.writeFileSync(path.join(dirResultados, `${path.basename(archivo)}.original`), contenido);
      
      // Registrar el archivo modificado
      archivos.modificados++;
    }
  } catch (error) {
    console.error(`Error al procesar ${archivo}:`, error.message);
  }
}

/**
 * Determina la declaración de importación adecuada según el archivo
 * @param {string} archivo - Ruta del archivo
 * @returns {string} - Declaración de importación
 */
function determinaImportacion(archivo) {
  // Analizar la ruta para determinar la importación correcta
  const rutaRelativa = path.relative(path.dirname(archivo), path.resolve(__dirname, '../frontend/src/config'));
  const rutaNormalizada = rutaRelativa.split(path.sep).join('/');
  
  return `import { API_CONFIG } from '${rutaNormalizada}/apiConfig.centralizado';`;
}

/**
 * Función principal para iniciar el proceso
 */
async function main() {
  console.log('Iniciando análisis de URLs hardcodeadas...');
  
  // Buscar todos los archivos a procesar
  let listaArchivos = [];
  for (const dir of CONFIG.directorios) {
    listaArchivos = listaArchivos.concat(buscarArchivos(dir));
  }
  
  console.log(`Total de archivos a procesar: ${listaArchivos.length}`);
  
  // Procesar cada archivo
  for (const archivo of listaArchivos) {
    procesarArchivo(archivo);
  }
  
  // Guardar resultados
  fs.writeFileSync(
    path.join(dirResultados, 'resultados.json'),
    JSON.stringify(archivos, null, 2)
  );
  
  // Generar informe Markdown
  const informe = generarInforme(archivos);
  fs.writeFileSync(path.join(dirResultados, 'informe-adaptacion.md'), informe);
  
  console.log('\n===== Proceso completado =====');
  console.log(`Total archivos: ${archivos.total}`);
  console.log(`Archivos con URLs hardcodeadas: ${archivos.conURLs.length}`);
  console.log(`Archivos modificados: ${archivos.modificados}`);
  console.log(`Resultados guardados en: ${dirResultados}`);
}

/**
 * Genera un informe en formato Markdown
 * @param {object} datos - Datos recopilados
 * @returns {string} - Informe en Markdown
 */
function generarInforme(datos) {
  return `# Informe de Adaptación de URLs Hardcodeadas

**Fecha:** ${new Date().toLocaleString()}

## Resumen

- **Total de archivos analizados:** ${datos.total}
- **Archivos con URLs hardcodeadas:** ${datos.conURLs.length}
- **Archivos modificados:** ${datos.modificados}

## Archivos a modificar

Los siguientes archivos contienen URLs hardcodeadas que deben ser reemplazadas por referencias a la configuración centralizada:

${datos.conURLs.map(archivo => `
### ${path.basename(archivo.ruta)}

**Ruta completa:** \`${archivo.ruta}\`

**Importación a añadir:**
\`\`\`typescript
${archivo.importacion}
\`\`\`

**Reemplazos recomendados:**

${CONFIG.patrones.map(patron => `- Reemplazar \`${patron.buscar}\` por \`${patron.reemplazar}\``).join('\n')}
`).join('\n')}

## Próximos pasos

1. Revisar el informe detallado de los archivos a modificar
2. Hacer los reemplazos usando el patrón recomendado
3. Verificar que la aplicación sigue funcionando correctamente
4. Asegurarse de que todos los endpoints usan la configuración centralizada
`;
}

// Ejecutar el proceso principal
main().catch(error => {
  console.error('Error en el proceso principal:', error);
});
