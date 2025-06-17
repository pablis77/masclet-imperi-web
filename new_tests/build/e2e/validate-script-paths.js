/**
 * Test E2E para validar las rutas de scripts y detectar 404
 * 
 * Este test verifica que:
 * 1. Todos los scripts en index.html tienen una ruta válida
 * 2. No hay errores 404 al cargar los scripts
 * 3. El spinner desaparece correctamente
 * 4. La aplicación se carga completamente
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const PORT = 8765;
const TEST_SERVER_URL = `http://localhost:${PORT}`;
const CLIENT_DIR = path.join(__dirname, '../../../frontend/dist/client');

/**
 * Inicia un servidor local para servir los archivos de dist/client
 */
async function startServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(CLIENT_DIR, req.url === '/' ? 'index.html' : req.url);
    
    console.log(`[SERVER] Solicitud: ${req.url} -> ${filePath}`);
    
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const contentType = getContentType(filePath);
        const content = fs.readFileSync(filePath);
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        console.log(`[SERVER] ✅ 200 OK: ${req.url}`);
      } else {
        res.writeHead(404);
        res.end(`File Not Found: ${req.url}`);
        console.log(`[SERVER] ❌ 404 Not Found: ${req.url}`);
      }
    } catch (error) {
      res.writeHead(500);
      res.end(`Error: ${error.message}`);
      console.error(`[SERVER] ⚠️ Error: ${error.message}`);
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[SERVER] Servidor de prueba iniciado en ${TEST_SERVER_URL}`);
      resolve(server);
    });
  });
}

/**
 * Determina el Content-Type según la extensión del archivo
 */
function getContentType(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  
  return contentTypes[extname] || 'application/octet-stream';
}

/**
 * Función principal que ejecuta las pruebas E2E
 */
async function runTest() {
  // Verificar que dist/client existe
  if (!fs.existsSync(CLIENT_DIR)) {
    console.error(`❌ ERROR: No se encontró el directorio ${CLIENT_DIR}`);
    console.error('Ejecuta "npm run build" antes de correr este test');
    process.exit(1);
  }
  
  // Verificar que index.html existe
  const indexPath = path.join(CLIENT_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ ERROR: No se encontró ${indexPath}`);
    console.error('Verifica que build-index.cjs está creando index.html correctamente');
    process.exit(1);
  }

  let server;
  let browser;
  
  try {
    // Iniciar servidor HTTP local
    server = await startServer();
    
    // Iniciar navegador headless
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Interceptar todas las solicitudes para detectar 404
    const failedRequests = [];
    page.on('requestfailed', (request) => {
      const url = request.url();
      const failure = request.failure();
      failedRequests.push({
        url,
        errorText: failure ? failure.errorText : 'Unknown error',
      });
      console.error(`❌ Solicitud fallida: ${url} - ${failure ? failure.errorText : 'Unknown error'}`);
    });

    // Recolectar console.error
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
        console.error(`❌ Error en consola: ${message.text()}`);
      }
    });
    
    console.log(`[TEST] Navegando a ${TEST_SERVER_URL}`);
    await page.goto(TEST_SERVER_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Esperar a que desaparezca el spinner
    try {
      await page.waitForFunction(
        'document.querySelector(".loading-spinner") === null || ' +
        'getComputedStyle(document.querySelector(".loading-spinner")).display === "none"',
        { timeout: 10000 }
      );
      console.log('✅ El spinner ha desaparecido correctamente');
    } catch (error) {
      console.error('❌ ERROR: El spinner no desapareció. La aplicación puede no haberse cargado correctamente.');
      throw new Error('Spinner timeout');
    }
    
    // Verificar si hay mensajes de error en la UI
    const errorMessage = await page.evaluate(() => {
      const loadingText = document.querySelector('.loading-text');
      if (loadingText && loadingText.style.color === 'rgb(255, 56, 96)') {
        return loadingText.textContent;
      }
      return null;
    });
    
    if (errorMessage) {
      console.error(`❌ ERROR mostrado en UI: ${errorMessage}`);
      throw new Error(`Error en UI: ${errorMessage}`);
    }
    
    // Extraer todos los scripts cargados
    const loadedScripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script'))
        .map(script => script.src)
        .filter(src => src && src.length > 0);
    });
    
    console.log(`[TEST] Scripts cargados (${loadedScripts.length}):`);
    loadedScripts.forEach((src, index) => console.log(`  ${index + 1}. ${src}`));
    
    // Verificar si alguna solicitud falló (404, etc.)
    if (failedRequests.length > 0) {
      console.error(`❌ FALLÓ: ${failedRequests.length} solicitudes fallaron:`);
      failedRequests.forEach(({ url, errorText }, index) => {
        console.error(`  ${index + 1}. ${url} - ${errorText}`);
      });
      throw new Error('Se detectaron solicitudes fallidas');
    }
    
    // Verificar si hay errores en la consola
    if (consoleErrors.length > 0) {
      console.error(`❌ FALLÓ: ${consoleErrors.length} errores en consola:`);
      consoleErrors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      throw new Error('Se detectaron errores en consola');
    }
    
    // Si llegamos aquí, todas las pruebas pasaron
    console.log('\n✅ ÉXITO: No se detectaron errores 404 ni fallos en la carga de scripts');
    console.log('✅ ÉXITO: El spinner desapareció correctamente');
    console.log('✅ ÉXITO: La aplicación se cargó completamente sin errores');
    
    return true;
  } catch (error) {
    console.error(`\n❌ TEST FALLIDO: ${error.message}`);
    return false;
  } finally {
    // Cerrar navegador y servidor
    if (browser) await browser.close();
    if (server) server.close();
  }
}

// Ejecutar el test
runTest()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error(`Error fatal: ${error.message}`);
    process.exit(1);
  });
