/**
 * SCRIPT DE DIAGNÓSTICO DE RUTAS API
 * 
 * Este script analiza cómo se están formando las URLs de API en el frontend
 * para detectar exactamente dónde se produce la duplicación de rutas.
 * 
 * Ejecutar en el servidor para ver qué está pasando realmente.
 */

// Módulos necesarios para análisis de archivos
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;

// Configuración
const DIST_DIR = path.resolve(process.env.DIST_DIR || '/home/ec2-user/masclet-imperi-frontend/dist');
const CLIENT_DIR = path.join(DIST_DIR, 'client');
const SERVER_DIR = path.join(DIST_DIR, 'server');
const LOG_FILE = path.join(DIST_DIR, 'url_diagnostico.log');

// Patrones a buscar
const URL_PATTERNS = [
  { regex: /\/api\/v1\/api\/v1\//g, desc: 'Patrón crítico: /api/v1/api/v1/' },
  { regex: /\/api\/api\/v1\//g, desc: 'Patrón doble API: /api/api/v1/' },
  { regex: /http:\/\/108\.129\.139\.119:8000\/api\/v1\//g, desc: 'URL absoluta backend: http://108.129.139.119:8000/api/v1/' },
  { regex: /http:\/\/localhost:8000\/api\/v1\//g, desc: 'URL absoluta local: http://localhost:8000/api/v1/' },
  { regex: /\/api\/v1\//g, desc: 'Patrón correcto: /api/v1/' }
];

// Función para registrar resultados
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Iniciar archivo de log
fs.writeFileSync(LOG_FILE, `=== DIAGNÓSTICO DE URLS API - ${new Date().toISOString()} ===\n\n`);

// Análisis de entorno
log('=== INFORMACIÓN DE ENTORNO ===');
log(`Directorio de distribución: ${DIST_DIR}`);
log(`Existe directorio client: ${fs.existsSync(CLIENT_DIR)}`);
log(`Existe directorio server: ${fs.existsSync(SERVER_DIR)}`);

// Verificar variables de entorno
log('\n=== VARIABLES DE ENTORNO ===');
[
  'NODE_ENV', 
  'BACKEND_URL', 
  'VITE_API_URL',
  'API_URL',
  'PROXY_TARGET'
].forEach(envVar => {
  log(`${envVar}: ${process.env[envVar] || 'no definido'}`);
});

// Función para analizar un archivo JS
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    let results = [];
    let hasMatch = false;

    URL_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches && matches.length > 0) {
        hasMatch = true;
        results.push(`  - ${pattern.desc}: ${matches.length} ocurrencias`);
        
        // Mostrar contexto para los primeros 3 matches
        let matchIndex = -1;
        let contentCopy = content;
        for (let i = 0; i < Math.min(matches.length, 3); i++) {
          matchIndex = contentCopy.indexOf(matches[i], matchIndex + 1);
          if (matchIndex !== -1) {
            const start = Math.max(0, matchIndex - 50);
            const end = Math.min(contentCopy.length, matchIndex + matches[i].length + 50);
            const context = contentCopy.substring(start, end).replace(/\n/g, ' ');
            results.push(`    Contexto ${i+1}: ...${context}...`);
          }
        }
      }
    });

    if (hasMatch) {
      log(`\nArchivo: ${fileName}`);
      results.forEach(result => log(result));
      return true;
    }
    return false;
  } catch (error) {
    log(`Error al analizar ${filePath}: ${error.message}`);
    return false;
  }
}

// Función para encontrar todos los archivos JS recursivamente
function findJsFiles(dir, results = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findJsFiles(filePath, results);
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(filePath);
    }
  });
  return results;
}

// Analizar archivos en directorio client
log('\n=== ANÁLISIS DE ARCHIVOS CLIENT ===');
if (fs.existsSync(CLIENT_DIR)) {
  const clientFiles = findJsFiles(CLIENT_DIR);
  log(`Encontrados ${clientFiles.length} archivos JS en client`);
  
  let matchingFiles = 0;
  clientFiles.forEach(file => {
    if (analyzeFile(file)) matchingFiles++;
  });
  log(`Archivos con patrones encontrados: ${matchingFiles} de ${clientFiles.length}`);
} else {
  log('El directorio client no existe');
}

// Analizar archivos en directorio server
log('\n=== ANÁLISIS DE ARCHIVOS SERVER ===');
if (fs.existsSync(SERVER_DIR)) {
  const serverFiles = findJsFiles(SERVER_DIR);
  log(`Encontrados ${serverFiles.length} archivos JS en server`);
  
  let matchingFiles = 0;
  serverFiles.forEach(file => {
    if (analyzeFile(file)) matchingFiles++;
  });
  log(`Archivos con patrones encontrados: ${matchingFiles} de ${serverFiles.length}`);
} else {
  log('El directorio server no existe');
}

// Función para diagnosticar la configuración del proxy
async function diagnoseProxy() {
  log('\n=== DIAGNÓSTICO DE PROXY ===');
  
  try {
    // Extraer contenido del servidor Node.js
    const serverFilePath = path.join(DIST_DIR, '../fix-server.js');
    if (fs.existsSync(serverFilePath)) {
      const serverContent = fs.readFileSync(serverFilePath, 'utf-8');
      log('Contenido del fix-server.js:');
      
      // Buscar configuración del proxy
      const proxyMatch = serverContent.match(/app\.use\(['"]\/api.*?\)/g);
      if (proxyMatch) {
        log('Configuración de proxy encontrada:');
        proxyMatch.forEach(match => log(`  ${match}`));
      } else {
        log('No se encontró configuración de proxy en fix-server.js');
      }
      
      // Buscar BACKEND_URL
      const backendUrlMatch = serverContent.match(/BACKEND_URL\s*=\s*['"]([^'"]+)['"]/);
      if (backendUrlMatch) {
        log(`BACKEND_URL en fix-server.js: ${backendUrlMatch[1]}`);
      }
    } else {
      log('Archivo fix-server.js no encontrado');
    }
    
    // Intentar algunas llamadas HTTP para ver qué sucede
    log('\n=== PRUEBAS DE LLAMADAS HTTP ===');
    
    // Definir endpoints a probar
    const endpoints = [
      '/api/v1/auth/login',
      '/api/auth/login',
      '/auth/login'
    ];
    
    // Intentar llamadas con el servidor local
    for (const endpoint of endpoints) {
      try {
        log(`Probando endpoint: ${endpoint}`);
        const response = await axios.get(`http://localhost:10000${endpoint}`, {
          validateStatus: () => true,
          timeout: 2000
        });
        log(`  Respuesta: ${response.status} ${response.statusText}`);
      } catch (error) {
        log(`  Error al llamar ${endpoint}: ${error.message}`);
      }
    }
  } catch (error) {
    log(`Error en diagnóstico de proxy: ${error.message}`);
  }
}

// Ejecutar diagnóstico de proxy
diagnoseProxy().then(() => {
  log('\n=== DIAGNÓSTICO COMPLETADO ===');
  log(`Resultados guardados en: ${LOG_FILE}`);
});
