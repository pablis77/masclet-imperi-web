const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios a analizar
const FRONTEND_DIR = path.join(process.cwd(), 'frontend');
const BACKEND_DIR = path.join(process.cwd(), 'backend');
const OUTPUT_DIR = path.join(process.cwd(), 'AWS_AMPLIFY', 'analisis-codigo-fuente');

// Patrones críticos a buscar
const PATRONES_CRITICOS = [
  'http://', 'https://', 
  'localhost', '127.0.0.1',
  'API_URL', 'BASE_URL',
  'axios.', 'fetch(',
  '.env', 'process.env',
  'import Api', 'ApiService', 'AuthService'
];

// Crear directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para buscar archivos recursivamente
function buscarArchivos(dir, extensiones = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'], ignoreDirs = ['node_modules', 'dist', '.git']) {
  let resultados = [];
  
  try {
    const archivos = fs.readdirSync(dir);
    
    for (const archivo of archivos) {
      if (ignoreDirs.includes(archivo)) continue;
      
      const rutaCompleta = path.join(dir, archivo);
      
      try {
        const stats = fs.statSync(rutaCompleta);
        
        if (stats.isDirectory()) {
          resultados = resultados.concat(buscarArchivos(rutaCompleta, extensiones, ignoreDirs));
        } else if (extensiones.includes(path.extname(rutaCompleta).toLowerCase())) {
          resultados.push(rutaCompleta);
        }
      } catch (e) {
        console.log(`Error al acceder a: ${rutaCompleta}`);
      }
    }
  } catch (e) {
    console.log(`Error al leer directorio: ${dir}`);
  }
  
  return resultados;
}

// Función para analizar un archivo y buscar patrones
function analizarArchivo(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf8');
  const lineaCritica = {};
  
  const lineas = contenido.split('\n');
  
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    
    for (const patron of PATRONES_CRITICOS) {
      if (linea.includes(patron)) {
        if (!lineaCritica[patron]) {
          lineaCritica[patron] = [];
        }
        lineaCritica[patron].push({ linea: i+1, contenido: linea.trim() });
      }
    }
  }
  
  return {
    ruta: ruta.replace(process.cwd(), ''),
    extension: path.extname(ruta),
    tamaño: fs.statSync(ruta).size,
    lineasCriticas: lineaCritica,
    contenido: contenido
  };
}

// Buscar archivos de configuración críticos
function buscarArchivosCriticos() {
  const archivosFrontend = buscarArchivos(FRONTEND_DIR);
  const archivosBackend = buscarArchivos(BACKEND_DIR);
  const archivos = [...archivosFrontend, ...archivosBackend];
  
  const archivosCriticos = [];
  
  for (const archivo of archivos) {
    const nombreBase = path.basename(archivo).toLowerCase();
    
    // Estos son archivos que típicamente contienen configuraciones críticas
    if (
      nombreBase.includes('api') || 
      nombreBase.includes('config') || 
      nombreBase.includes('env') ||
      nombreBase.includes('axios') ||
      nombreBase.includes('auth') ||
      nombreBase.includes('service')
    ) {
      archivosCriticos.push(archivo);
    }
  }
  
  return archivosCriticos;
}

// Principal
async function main() {
  console.log('🔍 Analizando código fuente...');
  
  // Directorios a ignorar para reducir el volumen y velocidad de análisis
  const dirsIgnorar = ['node_modules', 'dist', '.git', '.next', 'build'];
  
  // 1. Encontrar todos los archivos de código fuente (excluyendo directorios pesados)
  console.log('Buscando archivos de frontend...');
  const archivosFrontend = buscarArchivos(FRONTEND_DIR, ['.ts', '.tsx', '.js', '.jsx', '.vue', '.astro', '.svelte'], dirsIgnorar);
  console.log('Buscando archivos de backend...');
  const archivosBackend = buscarArchivos(BACKEND_DIR, ['.ts', '.tsx', '.js', '.jsx', '.py'], dirsIgnorar);
  const archivos = [...archivosFrontend, ...archivosBackend];
  
  console.log(`📁 ${archivos.length} archivos encontrados (Frontend: ${archivosFrontend.length}, Backend: ${archivosBackend.length})`);
  
  // 2. Analizar cada archivo (con límite para evitar problemas de memoria)
  console.log('Analizando archivos...');
  const MAX_ARCHIVOS = 1000; // Limitamos para evitar problemas de memoria
  const archivosAnalizar = archivos.slice(0, MAX_ARCHIVOS);
  if (archivos.length > MAX_ARCHIVOS) {
    console.log(`⚠️ Limitando análisis a ${MAX_ARCHIVOS} archivos de los ${archivos.length} encontrados`);
  }
  
  const analisis = [];
  for (const archivo of archivosAnalizar) {
    try {
      const resultado = analizarArchivo(archivo);
      analisis.push(resultado);
    } catch (e) {
      console.log(`Error al analizar: ${archivo}`);
    }
  }
  
  // 3. Buscar archivos críticos de configuración
  const archivosCriticos = buscarArchivosCriticos();
  console.log(`⚠️ ${archivosCriticos.length} archivos críticos identificados`);
  
  // 4. Generar informe de archivos críticos con su contenido completo
  const informeCriticos = archivosCriticos.map(archivo => {
    return {
      ruta: archivo.replace(process.cwd(), ''),
      contenido: fs.readFileSync(archivo, 'utf8')
    };
  });
  
  // 5. Generar mapa de dependencias entre archivos
  // Esta parte extrae las importaciones para ver qué archivo depende de cuál
  const dependencias = {};
  for (const archivo of archivos) {
    const contenido = fs.readFileSync(archivo, 'utf8');
    const importRegex = /import .* from ['"](.+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(contenido)) !== null) {
      imports.push(match[1]);
    }
    
    dependencias[archivo.replace(process.cwd(), '')] = imports;
  }
  
  // 6. Guardar resultados
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const outputDir = path.join(OUTPUT_DIR, `analisis-${timestamp}`);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Guardar análisis completo
  fs.writeFileSync(
    path.join(outputDir, 'analisis-completo.json'), 
    JSON.stringify(analisis, null, 2)
  );
  
  // Guardar archivos críticos
  fs.writeFileSync(
    path.join(outputDir, 'archivos-criticos.json'),
    JSON.stringify(informeCriticos, null, 2)
  );
  
  // Guardar mapa de dependencias
  fs.writeFileSync(
    path.join(outputDir, 'mapa-dependencias.json'),
    JSON.stringify(dependencias, null, 2)
  );
  
  // Generar informe en Markdown
  let markdown = `# Análisis de Código Fuente para Despliegue en AWS Amplify\n\n`;
  markdown += `**Fecha:** ${new Date().toLocaleString('es-ES')}\n\n`;
  
  // Sección de archivos críticos
  markdown += `## Archivos Críticos de Configuración\n\n`;
  for (const archivo of archivosCriticos) {
    const rutaRelativa = archivo.replace(process.cwd(), '');
    markdown += `### ${path.basename(archivo)}\n\n`;
    markdown += `**Ruta:** \`${rutaRelativa}\`\n\n`;
    markdown += "```" + path.extname(archivo).substring(1) + "\n";
    markdown += fs.readFileSync(archivo, 'utf8');
    markdown += "\n```\n\n";
  }
  
  // Sección de URLs y conexiones críticas
  markdown += `\n## URLs y Conexiones Detectadas\n\n`;
  markdown += `| Archivo | Línea | Patrón | Contenido |\n`;
  markdown += `|--------|-------|--------|----------|\n`;
  
  for (const item of analisis) {
    for (const patron in item.lineasCriticas) {
      for (const linea of item.lineasCriticas[patron]) {
        markdown += `| \`${item.ruta}\` | ${linea.linea} | ${patron} | \`${linea.contenido.replace(/\|/g, '\\|')}\` |\n`;
      }
    }
  }
  
  // Estructura de directorios
  markdown += `\n## Estructura de Directorios\n\n`;
  markdown += "```\n";
  
  // Estructura del frontend
  try {
    markdown += "📂 FRONTEND\n";
    const comandoFrontend = process.platform === 'win32' 
      ? `powershell -Command "Get-ChildItem -Path .\\frontend -Recurse -Directory | Sort-Object FullName | ForEach-Object { $indent = '  ' * ($_.FullName.Split('\\').Count - 2); $indent + $_.Name }"`
      : `find ./frontend -type d | sort | sed 's|[^/]*/|- |g'`;
    
    markdown += execSync(comandoFrontend, { cwd: process.cwd() }).toString();
  } catch (err) {
    markdown += `Error al generar estructura frontend: ${err.message}`;
  }
  
  // Estructura del backend
  try {
    markdown += "\n📂 BACKEND\n";
    const comandoBackend = process.platform === 'win32' 
      ? `powershell -Command "Get-ChildItem -Path .\\backend -Recurse -Directory | Sort-Object FullName | ForEach-Object { $indent = '  ' * ($_.FullName.Split('\\').Count - 2); $indent + $_.Name }"`
      : `find ./backend -type d | sort | sed 's|[^/]*/|- |g'`;
    
    markdown += execSync(comandoBackend, { cwd: process.cwd() }).toString();
  } catch (err) {
    markdown += `Error al generar estructura backend: ${err.message}`;
  }
  
  markdown += "\n```\n\n";
  
  fs.writeFileSync(path.join(outputDir, 'informe-despliegue.md'), markdown);
  
  console.log(`✅ Análisis completado. Resultados guardados en: ${outputDir}`);
}

main().catch(console.error);