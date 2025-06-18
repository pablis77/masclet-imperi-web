// Script para añadir el debug.js al index.html generado
const fs = require('fs');
const path = require('path');

console.log('📊 Inyectando script de diagnóstico...');

// Ruta al index.html generado
const indexPath = path.join(__dirname, '..', 'dist', 'client', 'index.html');

// Comprobar si el archivo existe
if (!fs.existsSync(indexPath)) {
  console.error('❌ No se encontró el archivo index.html en: ' + indexPath);
  process.exit(1);
}

// Leer el archivo
let htmlContent = fs.readFileSync(indexPath, 'utf-8');

// Crear tag de script para debug.js
const debugScriptTag = '<script src="/debug.js"></script>';

// Verificar que no está ya incluido
if (htmlContent.includes(debugScriptTag)) {
  console.log('✅ Script de diagnóstico ya está incluido');
  process.exit(0);
}

// Insertar el script justo después del tag head
htmlContent = htmlContent.replace('<head>', '<head>\n  ' + debugScriptTag);

// También copiar debug.js a la carpeta dist/client
const debugSource = path.join(__dirname, '..', 'public', 'debug.js');
const debugDest = path.join(__dirname, '..', 'dist', 'client', 'debug.js');

try {
  fs.copyFileSync(debugSource, debugDest);
  console.log('✅ debug.js copiado a dist/client');
} catch (err) {
  console.error('❌ Error copiando debug.js:', err);
}

// Guardar el archivo modificado
fs.writeFileSync(indexPath, htmlContent);
console.log('✅ Script de diagnóstico inyectado correctamente');
