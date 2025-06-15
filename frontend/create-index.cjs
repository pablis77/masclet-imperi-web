// Script para crear index.html que cargue correctamente la aplicación Astro (SPA)
const fs = require('fs');
const path = require('path');

// Función para listar archivos en directorio
function listFiles(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (error) {
    console.error(`❌ Error listando archivos en ${dir}: ${error.message}`);
    return [];
  }
}

// Función para encontrar los archivos CSS y JS principales
function findImportantFiles(astroDir) {
  const files = listFiles(astroDir);
  
  // Buscar archivos importantes
  const cssFiles = files.filter(file => file.endsWith('.css'));
  const vendorJs = files.find(file => file.startsWith('vendor.'));
  const vendorReactJs = files.find(file => file.startsWith('vendor-react.'));
  const vendorChartsJs = files.find(file => file.startsWith('vendor-charts.'));
  const configJs = files.find(file => file.startsWith('config.'));
  
  return {
    css: cssFiles,
    vendorJs,
    vendorReactJs,
    vendorChartsJs,
    configJs
  };
}

// Directorio _astro
const astroDir = path.join(__dirname, 'dist', 'client', '_astro');

// Encontrar archivos importantes
const importantFiles = findImportantFiles(astroDir);

// Crear enlaces CSS
let cssLinks = '';
importantFiles.css.forEach(cssFile => {
  cssLinks += `  <link rel="stylesheet" href="./_astro/${cssFile}">
`;
});

// Crear scripts JS
let jsScripts = '';
if (importantFiles.vendorJs) {
  jsScripts += `  <script type="module" src="./_astro/${importantFiles.vendorJs}"></script>
`;
}
if (importantFiles.vendorReactJs) {
  jsScripts += `  <script type="module" src="./_astro/${importantFiles.vendorReactJs}"></script>
`;
}
if (importantFiles.vendorChartsJs) {
  jsScripts += `  <script type="module" src="./_astro/${importantFiles.vendorChartsJs}"></script>
`;
}
if (importantFiles.configJs) {
  jsScripts += `  <script type="module" src="./_astro/${importantFiles.configJs}"></script>
`;
}

// Buscar archivos hoisted.*.js para cargar
const hoistedFiles = listFiles(astroDir).filter(file => file.startsWith('hoisted.'));
hoistedFiles.forEach(file => {
  jsScripts += `  <script type="module" src="./_astro/${file}"></script>
`;
});

// Contenido del HTML
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Aplicación web para la gestión de ganado y explotaciones ganaderas">
  <title>Masclet Imperi Web</title>
${cssLinks}
  <script>
    window.global = window;
  </script>
</head>
<body>
  <div id="root">
    <!-- La aplicación React se montará aquí -->
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <h1 style="font-family: system-ui, sans-serif; text-align: center;">Masclet Imperi Web</h1>
      <p style="font-family: system-ui, sans-serif;">Cargando aplicación...</p>
    </div>
  </div>
  
  <!-- Scripts principales -->
${jsScripts}
</body>
</html>`;

// Ruta donde guardar el archivo
const targetPath = path.join(__dirname, 'dist', 'client', 'index.html');

// Crear el archivo
try {
  fs.writeFileSync(targetPath, htmlContent);
  console.log(`✅ Archivo index.html creado correctamente en: ${targetPath}`);
  console.log(`✅ CSS incluidos: ${importantFiles.css.join(', ')}`);
  console.log(`✅ JS principales: ${importantFiles.vendorJs}, ${importantFiles.vendorReactJs}, ${importantFiles.configJs}`);
  console.log(`✅ Total archivos hoisted.js cargados: ${hoistedFiles.length}`);
} catch (error) {
  console.error(`❌ Error creando el archivo: ${error.message}`);
}
