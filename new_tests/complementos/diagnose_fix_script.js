/**
 * Script para diagnosticar el problema con fix-api-urls.js
 * Este script debe ejecutarse en el entorno local y luego transferirse al servidor
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('=== DIAGNÓSTICO DE FIX-API-URLS.JS ===');
console.log(`Fecha: ${new Date().toISOString()}`);
console.log('');

// Función para verificar si un archivo existe
function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Verificar si el script existe
console.log('Verificando archivos clave:');
const scriptPaths = [
  './fix-api-urls.js',
  '/app/fix-api-urls.js',
  '../fix-api-urls.js'
];

scriptPaths.forEach(scriptPath => {
  const exists = checkFileExists(scriptPath);
  console.log(`- ${scriptPath}: ${exists ? '✅ Existe' : '❌ No existe'}`);
  
  if (exists) {
    // Mostrar contenido
    const content = fs.readFileSync(scriptPath, 'utf8');
    console.log(`  Tamaño: ${content.length} bytes`);
    console.log(`  Primeras líneas:\n  ${content.split('\n').slice(0, 5).join('\n  ')}`);
  }
});

// Verificar estructura de directorios
console.log('\nEstructura de directorios:');
const dirs = [
  '.',
  './dist',
  './dist/client',
  './dist/server',
  '/app',
  '/app/dist',
  '/app/dist/client'
];

dirs.forEach(dir => {
  try {
    if (checkFileExists(dir)) {
      const files = fs.readdirSync(dir);
      console.log(`- ${dir}: ${files.length} archivos`);
      if (files.length > 0) {
        console.log(`  Primeros 5 archivos: ${files.slice(0, 5).join(', ')}`);
      }
    } else {
      console.log(`- ${dir}: ❌ No existe`);
    }
  } catch (err) {
    console.log(`- ${dir}: ❌ Error: ${err.message}`);
  }
});

// Verificar variables de entorno
console.log('\nVariables de entorno:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'no definido'}`);
console.log(`- BACKEND_URL: ${process.env.BACKEND_URL || 'no definido'}`);
console.log(`- API_PREFIX: ${process.env.API_PREFIX || 'no definido'}`);

// Probar búsqueda de patrones en archivos JS
console.log('\nBuscando patrones en archivos JS:');
const jsPatterns = [
  '/api/v1/api/v1',
  '/api/api/v1',
  'http://108.129.139.119:8000/api/v1'
];

// Función para buscar patrones en archivos
function findPatterns(dir, patterns) {
  try {
    if (!checkFileExists(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findPatterns(filePath, patterns);
      } else if (file.endsWith('.js')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          for (const pattern of patterns) {
            if (content.includes(pattern)) {
              console.log(`- Patrón '${pattern}' encontrado en: ${filePath}`);
            }
          }
        } catch (err) {
          console.log(`- Error leyendo ${filePath}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.log(`- Error escaneando ${dir}: ${err.message}`);
  }
}

// Buscar en directorios clave
['/app/dist/client', './dist/client'].forEach(dir => {
  console.log(`\nBuscando en ${dir}:`);
  findPatterns(dir, jsPatterns);
});

// Finalizar diagnóstico
console.log('\n=== DIAGNÓSTICO FINALIZADO ===');
