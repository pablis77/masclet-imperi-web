// Test de autenticación realista - Simula exactamente cómo funciona el frontend
// Esto NO hace peticiones directas al API, sino que simula el comportamiento del frontend

const axios = require('axios');
const puppeteer = require('puppeteer');

(async () => {
  console.log('===== TEST DE AUTENTICACIÓN REALISTA =====');
  console.log('Este test simula el comportamiento real del frontend');
  
  try {
    // Iniciamos un navegador para probar todo el flujo
    console.log('1. Iniciando navegador...');
    const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Interceptamos todas las peticiones para ver qué está pasando
    page.on('request', request => {
      if (request.url().includes('/api/v1/')) {
        console.log(`🔄 Petición: ${request.method()} ${request.url()}`);
        console.log(`   Headers: ${JSON.stringify(request.headers())}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/v1/')) {
        console.log(`⬅️ Respuesta: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navegamos a la página de login
    console.log('2. Navegando a la página de login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Probamos login con admin
    console.log('3. Probando login con admin...');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    
    // Hacemos click en el botón de login
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    
    // Verificamos si estamos en la página principal
    const url = page.url();
    console.log(`4. Navegación completada. URL actual: ${url}`);
    
    if (url.includes('/login')) {
      console.log('❌ Login falló - Seguimos en la página de login');
    } else {
      console.log('✅ Login exitoso - Redirigido a otra página');
    }
    
    // Examinamos localStorage para ver qué tokens se han guardado
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });
    
    console.log('5. Contenido de localStorage:');
    Object.keys(localStorage).forEach(key => {
      console.log(`   - ${key}: ${localStorage[key].substring(0, 30)}...`);
    });
    
    // Intentamos acceder a una página protegida
    console.log('6. Accediendo a la página de dashboard...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // Capturamos una screenshot
    await page.screenshot({ path: 'dashboard_screenshot.png' });
    console.log('   Screenshot guardado como dashboard_screenshot.png');
    
    // Examinamos las peticiones al API
    console.log('7. Verificando peticiones al API...');
    await page.goto('http://localhost:3000/animals', { waitUntil: 'networkidle2' });
    
    // Esperamos un poco para que se completen las peticiones
    await page.waitForTimeout(2000);
    
    // Examinamos los errores en la consola
    console.log('8. Errores en la consola:');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    consoleErrors.forEach(error => {
      console.log(`   - ${error}`);
    });
    
    // Cerramos el navegador
    console.log('9. Prueba completada. Cerrando navegador...');
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
})();
