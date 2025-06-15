// Script para crear index.html que redireccione a nuestro punto de entrada
const fs = require('fs');
const path = require('path');

// Contenido del index.html
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Masclet Imperi Web</title>
  <script>
    // Cargamos automáticamente la SPA
    window.location.href = './_astro/client.SUp79uPH.js';
  </script>
</head>
<body>
  <p>Cargando aplicación...</p>
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
