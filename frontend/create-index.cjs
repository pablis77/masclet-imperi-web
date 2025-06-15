// Script para crear index.html para SPA en Astro
const fs = require('fs');
const path = require('path');

// Contenido del HTML para SPA (sin redirecciones)
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Masclet Imperi Web</title>
  <!-- Busca archivos CSS automáticamente -->
  <link rel="stylesheet" href="./_astro/index.css">
</head>
<body>
  <div id="app">
    <!-- Contenedor donde se montará la aplicación -->
    <h1>Masclet Imperi Web</h1>
    <p>Cargando aplicación...</p>
  </div>
  
  <!-- Cargar el main entry point de la aplicación -->
  <script type="module" src="./_astro/index.js"></script>
</body>
</html>`;

// Ruta donde guardar el archivo
const targetPath = path.join(__dirname, 'dist', 'client', 'index.html');

// Crear el archivo
try {
  fs.writeFileSync(targetPath, htmlContent);
  console.log(`✅ Archivo index.html creado correctamente en: ${targetPath}`);
} catch (error) {
  console.error(`❌ Error creando el archivo: ${error.message}`);
}
