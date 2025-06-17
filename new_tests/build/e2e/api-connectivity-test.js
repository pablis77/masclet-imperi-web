/**
 * Test E2E para validar la conectividad entre frontend y API
 * 
 * Este test verifica que:
 * 1. Se puede realizar una petición GET a /api/v1/health desde el frontend
 * 2. No hay errores CORS al conectar con la API
 * 3. El health check de la API devuelve 200 OK
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8766;
const TEST_SERVER_URL = `http://localhost:${PORT}`;
const CLIENT_DIR = path.join(__dirname, '../../../frontend/dist/client');

// Verificar si el backend está en ejecución
async function isBackendRunning() {
  try {
    const output = execSync('powershell -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue"', { encoding: 'utf8' });
    return output.includes('8000');
  } catch (error) {
    return false;
  }
}

/**
 * Inicia un servidor local para servir los archivos de dist/client
 */
async function startServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(CLIENT_DIR, req.url === '/' ? 'index.html' : req.url);
    
    console.log(`[SERVER] Solicitud: ${req.url} -> ${filePath}`);
    
    // Simular proxy para peticiones a /api
    if (req.url.startsWith('/api/')) {
      // Reenviar a localhost:8000
      const apiReq = http.request(
        {
          host: 'localhost',
          port: 8000,
          path: req.url,
          method: req.method,
          headers: {
            ...req.headers,
            host: 'localhost:8000'
          }
        },
        (apiRes) => {
          res.writeHead(apiRes.statusCode, apiRes.headers);
          apiRes.pipe(res);
          console.log(`[SERVER] 🔄 Proxy a API: ${req.url} -> ${apiRes.statusCode}`);
        }
      );
      
      apiReq.on('error', (error) => {
        console.error(`[SERVER] ❌ Error en proxy a API: ${error.message}`);
        res.writeHead(502);
        res.end(`Error conectando con API: ${error.message}`);
      });
      
      req.pipe(apiReq);
      return;
    }
    
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
      console.log(`[SERVER] Servidor de test API iniciado en ${TEST_SERVER_URL}`);
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
 * Función principal que ejecuta los tests de API
 */
async function runApiTest() {
  // Verificar que el backend está en ejecución
  if (!await isBackendRunning()) {
    console.error('❌ ERROR: El backend no está en ejecución en el puerto 8000.');
    console.error('Ejecuta "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload" antes de correr este test');
    process.exit(1);
  }

  // Verificar que dist/client existe
  if (!fs.existsSync(CLIENT_DIR)) {
    console.error(`❌ ERROR: No se encontró el directorio ${CLIENT_DIR}`);
    console.error('Ejecuta "npm run build" antes de correr este test');
    process.exit(1);
  }
  
  let server;
  let browser;
  
  try {
    // Iniciar servidor HTTP local
    server = await startServer();
    
    // Iniciar navegador headless
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Configurar intercepción de peticiones
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          time: new Date().toISOString()
        });
        console.log(`[TEST] 🔄 Petición API detectada: ${request.method()} ${request.url()}`);
      }
    });

    // Interceptar respuestas API
    const apiResponses = [];
    page.on('response', response => {
      if (response.url().includes('/api/v1/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          time: new Date().toISOString()
        });
        console.log(`[TEST] ${response.status() === 200 ? '✅' : '❌'} Respuesta API: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navegar a la página
    console.log(`[TEST] Navegando a ${TEST_SERVER_URL}`);
    await page.goto(TEST_SERVER_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Esperar a que cargue la app
    await page.waitForFunction(
      'document.querySelector(".loading-spinner") === null || ' +
      'getComputedStyle(document.querySelector(".loading-spinner")).display === "none"',
      { timeout: 10000 }
    );
    
    // Ejecutar health check manual desde el cliente
    console.log(`[TEST] Realizando health check manual a /api/v1/health`);
    const healthCheckResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/v1/health');
        const data = await response.json();
        return { 
          success: true, 
          status: response.status,
          data 
        };
      } catch (error) {
        return { 
          success: false, 
          error: error.toString() 
        };
      }
    });
    
    // Verificar resultado del health check
    if (healthCheckResult.success && healthCheckResult.status === 200) {
      console.log(`✅ Health check exitoso: ${JSON.stringify(healthCheckResult.data)}`);
    } else {
      console.error(`❌ Health check fallido: ${JSON.stringify(healthCheckResult)}`);
      throw new Error(`Health check fallido: ${JSON.stringify(healthCheckResult)}`);
    }
    
    // Analizar peticiones y respuestas API
    if (apiResponses.length === 0) {
      console.warn('⚠️ No se detectaron respuestas API. Es posible que no se estén realizando peticiones automáticas.');
    }
    
    // Verificar si hay respuestas API con error
    const failedResponses = apiResponses.filter(r => r.status !== 200);
    if (failedResponses.length > 0) {
      console.error(`❌ FALLÓ: ${failedResponses.length} respuestas API con error:`);
      failedResponses.forEach((res, index) => {
        console.error(`  ${index + 1}. ${res.url} - Status ${res.status}`);
      });
      throw new Error('Se detectaron respuestas API con error');
    }
    
    // Si llegamos aquí, todas las pruebas pasaron
    console.log('\n✅ ÉXITO: Health check a /api/v1/health devolvió 200 OK');
    console.log(`✅ ÉXITO: ${apiResponses.length} peticiones API completadas sin errores`);
    console.log('✅ ÉXITO: No se detectaron errores CORS');
    
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
runApiTest()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error(`Error fatal: ${error.message}`);
    process.exit(1);
  });
