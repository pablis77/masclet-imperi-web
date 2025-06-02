/**
 * TEST DE RUTAS API DUPLICADAS
 * 
 * Este script prueba todas las posibles combinaciones de rutas para ver 
 * exactamente qué combinaciones funcionan y cuáles fallan.
 * 
 * Nos va a mostrar por qué coño se están duplicando las rutas.
 */

const axios = require('axios');
const fs = require('fs');

// Configuración
const LOG_FILE = './test_rutas_resultados.log';
const MAX_TIMEOUT = 5000; // 5 segundos máximo por petición

// Borramos log anterior si existe
if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE);
}

// Función para escribir en el log
function log(message) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n');
}

log('=== TEST DE RUTAS API - INICIO ===');
log(`Fecha: ${new Date().toISOString()}`);
log('');

// Configuraciones de dominio/servidor a probar
const servidores = [
  { nombre: 'PRODUCCIÓN', url: 'http://108.129.139.119' },
  { nombre: 'LOCAL BACKEND', url: 'http://localhost:8000' },
  { nombre: 'LOCAL FRONTEND', url: 'http://localhost:4321' }
];

// Rutas básicas a probar
const rutas = [
  { path: '/api/v1/auth/login', descripcion: 'Login (ruta correcta)' },
  { path: '/api/v1/api/v1/auth/login', descripcion: 'Login (ruta duplicada crítica)' },
  { path: '/api/api/v1/auth/login', descripcion: 'Login (prefijo /api duplicado)' },
  { path: '/api/v1/animals', descripcion: 'Listado animales sin barra final' },
  { path: '/api/v1/animals/', descripcion: 'Listado animales con barra final' },
  { path: '/api/v1/api/v1/animals/', descripcion: 'Listado animales (ruta duplicada)' }
];

// Función para probar una ruta en un servidor
async function probarRuta(servidor, ruta) {
  const urlCompleta = `${servidor.url}${ruta.path}`;
  log(`Probando: ${urlCompleta}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(urlCompleta, {
      validateStatus: () => true, // No lanzar errores por códigos de estado HTTP
      timeout: MAX_TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'API-Test-Script'
      }
    });
    const timeElapsed = Date.now() - startTime;
    
    // Analizar respuesta
    const status = response.status;
    const statusText = response.statusText;
    
    // Formatear respuesta para el log
    let resultado = `  → Respuesta: ${status} ${statusText} (${timeElapsed}ms)`;
    
    // Añadir información adicional según el código de estado
    if (status === 200) {
      resultado += ' ✅ OK';
    } else if (status === 307 || status === 301 || status === 302) {
      const redirectUrl = response.headers.location;
      resultado += `\n    Redirección a: ${redirectUrl}`;
    } else if (status === 404) {
      resultado += ' ❌ No encontrado';
    } else if (status === 500 || status === 502) {
      resultado += ' ❌ Error del servidor';
      
      // Intentar extraer mensaje de error si existe
      if (response.data && typeof response.data === 'object') {
        if (response.data.detail) {
          resultado += `\n    Error: ${JSON.stringify(response.data.detail)}`;
        } else {
          resultado += `\n    Datos: ${JSON.stringify(response.data).substring(0, 200)}`;
        }
      }
    }
    
    log(resultado);
    return { status, timeElapsed, isError: status >= 400 };
    
  } catch (error) {
    const errorMsg = error.code === 'ECONNABORTED' 
      ? `  → ❌ Timeout después de ${MAX_TIMEOUT}ms`
      : `  → ❌ Error: ${error.message}`;
    
    log(errorMsg);
    return { status: 0, timeElapsed: MAX_TIMEOUT, isError: true, error: error.message };
  }
}

// Función principal que ejecuta todos los tests
async function ejecutarTests() {
  // Recorremos cada servidor
  for (const servidor of servidores) {
    log(`\n=== PROBANDO SERVIDOR: ${servidor.nombre} (${servidor.url}) ===\n`);
    
    // Probar conexión básica al servidor
    try {
      await axios.get(servidor.url, { timeout: MAX_TIMEOUT, validateStatus: () => true });
      log(`✅ Servidor accesible`);
    } catch (error) {
      log(`❌ Servidor no accesible: ${error.message}`);
      log(`Saltando pruebas para este servidor\n`);
      continue; // Pasar al siguiente servidor
    }
    
    // Para cada servidor, probamos todas las rutas
    for (const ruta of rutas) {
      log(`\n📋 RUTA: ${ruta.descripcion}`);
      await probarRuta(servidor, ruta);
    }
    
    // Sección especial - prueba de redirecciones
    log(`\n📋 PRUEBAS DE REDIRECCIÓN`);
    
    // Probar si hay redirección automática a ruta con barra final
    const rutaSinBarra = { path: '/api/v1/animals', descripcion: 'Prueba redirección' };
    const resultadoSinBarra = await probarRuta(servidor, rutaSinBarra);
    
    if (resultadoSinBarra.status === 307) {
      log(`  ✓ Confirmado: El servidor redirige automáticamente URLs sin barra final`);
    }
    
    // Verificar cabeceras de redirección
    log(`\n📋 ANÁLISIS DE CABECERAS HTTP`);
    try {
      const response = await axios.get(`${servidor.url}/api/v1/animals`, {
        validateStatus: () => true,
        timeout: MAX_TIMEOUT,
        maxRedirects: 0 // No seguir redirecciones automáticamente
      });
      
      log(`  Cabeceras de respuesta:`);
      Object.entries(response.headers).forEach(([key, value]) => {
        log(`    ${key}: ${value}`);
      });
    } catch (error) {
      log(`  Error al obtener cabeceras: ${error.message}`);
    }
  }
  
  // Probar el middleware de corrección
  log(`\n=== ANÁLISIS DE MIDDLEWARE ===\n`);
  log(`Verificando si el script fix-api-urls.js está funcionando correctamente...`);
  
  // Intentar leer el contenido del script
  try {
    let fixScript = '';
    const fixScriptPath = '../frontend/fix-api-urls.js';
    
    if (fs.existsSync(fixScriptPath)) {
      fixScript = fs.readFileSync(fixScriptPath, 'utf-8');
      log(`✅ Script encontrado (${fixScriptPath})`);
      
      // Buscar patrones en el script
      const patrones = fixScript.match(/search: ['"](.+?)['"]/g);
      if (patrones && patrones.length > 0) {
        log(`  Patrones configurados para corrección:`);
        patrones.forEach(patron => {
          log(`    ${patron}`);
        });
      } else {
        log(`❌ No se encontraron patrones de corrección en el script`);
      }
    } else {
      log(`❌ Script fix-api-urls.js no encontrado`);
    }
  } catch (error) {
    log(`❌ Error al analizar fix-api-urls.js: ${error.message}`);
  }
  
  log('\n=== TEST FINALIZADO ===');
  log(`Resultados guardados en: ${LOG_FILE}`);
}

// Ejecutar los tests
ejecutarTests().catch(error => {
  log(`\n❌ ERROR FATAL: ${error.message}`);
  if (error.stack) {
    log(error.stack);
  }
  log('\n=== TEST INTERRUMPIDO POR ERROR ===');
});
