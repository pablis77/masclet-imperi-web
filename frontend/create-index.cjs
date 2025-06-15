// Script para crear index.html que redirija directamente a la página de login
const fs = require('fs');
const path = require('path');

// Directorio dist/client
const clientDir = path.join(__dirname, 'dist', 'client');

// Verifica si existe la página de login en el build
const loginPath = '/login';

// Contenido HTML para redirección inmediata a login
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sistema Masclet Imperi - Gestión ganadera">
  <title>Masclet Imperi Web</title>
  <script>
    // Redirección inmediata al login
    window.location.href = '${loginPath}';
  </script>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      margin-bottom: 1rem;
    }
    .spinner {
      margin: 2rem auto;
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #09f;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Masclet Imperi Web</h1>
    <p>Redirigiendo al sistema...</p>
    <div class="spinner"></div>
  </div>
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
