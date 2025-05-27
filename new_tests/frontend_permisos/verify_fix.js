/**
 * Script de verificación exhaustiva para comprobar que la solución del problema de roles funciona
 * Este script simula un login y verifica que el rol se asigna correctamente
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

// Configuración
const URL_BASE = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const CREDENCIALES = {
  ramon: {
    username: 'Ramon',
    password: 'Ramon123'
  },
  admin: {
    username: 'admin',
    password: 'admin123'
  }
};

// Crear directorio para capturas si no existe
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Función principal de verificación
 */
async function verificarFix() {
  console.log('=== VERIFICACIÓN EXHAUSTIVA DEL ARREGLO DE ROLES ===');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Mejor ver lo que pasa en modo visual
      defaultViewport: { width: 1366, height: 768 },
      args: ['--window-size=1366,768']
    });
    
    const page = await browser.newPage();
    
    // Habilitar logs de consola del navegador
    page.on('console', msg => console.log(`[NAVEGADOR] ${msg.text()}`));
    
    // 1. Empezar con un localStorage limpio
    await page.goto(URL_BASE);
    await page.evaluate(() => localStorage.clear());
    console.log('✅ localStorage limpiado correctamente');
    
    // 2. Login con Ramon
    console.log(`\n--- PRUEBA: Login con usuario ${CREDENCIALES.ramon.username} ---`);
    await page.goto(`${URL_BASE}/login`);
    await page.waitForSelector('#username');
    
    // Rellenar formulario de login
    await page.type('#username', CREDENCIALES.ramon.username);
    await page.type('#password', CREDENCIALES.ramon.password);
    await page.click('#loginForm button[type="submit"]');
    
    // Esperar redirección
    await page.waitForNavigation();
    console.log('✅ Login completado, esperando para verificar localStorage');
    
    // Darle tiempo al localStorage para actualizarse
    await page.waitForTimeout(1000);
    
    // 3. Verificar localStorage después del login
    const localStorageData = await page.evaluate(() => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      return { user, token, userRole };
    });
    
    console.log('DATOS EN LOCALSTORAGE:');
    
    // Verificar token
    if (localStorageData.token) {
      console.log('✅ Token guardado correctamente');
    } else {
      console.log('❌ No se encontró token en localStorage');
    }
    
    // Verificar usuario
    if (localStorageData.user) {
      const user = JSON.parse(localStorageData.user);
      console.log('DATOS DE USUARIO:', user);
      
      // Verificar específicamente el rol
      if (user.role === 'Ramon') {
        console.log('✅ ROL CORRECTO: El usuario tiene rol "Ramon"');
      } else {
        console.log(`❌ ERROR DE ROL: El usuario tiene rol "${user.role}" cuando debería ser "Ramon"`);
      }
    } else {
      console.log('❌ No se encontró usuario en localStorage');
    }
    
    // Verificar rol separado
    if (localStorageData.userRole === 'Ramon') {
      console.log('✅ ROL SEPARADO CORRECTO: userRole = "Ramon"');
    } else if (localStorageData.userRole) {
      console.log(`❌ ERROR EN ROL SEPARADO: userRole = "${localStorageData.userRole}" cuando debería ser "Ramon"`);
    } else {
      console.log('❓ No se encontró userRole en localStorage (no crítico)');
    }
    
    // 4. Capturar la página de perfil para mostrar el rol visualmente
    await page.goto(`${URL_BASE}/profile`);
    await page.waitForSelector('.font-medium');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'profile-page.png'), fullPage: true });
    console.log('✅ Captura de pantalla guardada en screenshots/profile-page.png');
    
    // 5. Verificar el DOM para confirmar que el rol se muestra correctamente
    const rolMostrado = await page.evaluate(() => {
      // Buscar el elemento que muestra el rol
      const elementos = document.querySelectorAll('.font-medium');
      for (const elemento of elementos) {
        // Buscar el elemento de rol que viene después de un texto que contiene "Rol"
        const prevElement = elemento.previousElementSibling;
        if (prevElement && prevElement.textContent.includes('Rol')) {
          return elemento.textContent.trim();
        }
      }
      return null;
    });
    
    if (rolMostrado) {
      console.log(`ROL MOSTRADO EN INTERFAZ: "${rolMostrado}"`);
      if (rolMostrado.toLowerCase() === 'ramon') {
        console.log('✅ ROL MOSTRADO CORRECTAMENTE en la interfaz');
      } else {
        console.log(`❌ ERROR: Rol mostrado en interfaz es "${rolMostrado}" cuando debería ser "Ramon"`);
      }
    } else {
      console.log('❌ No se pudo encontrar el rol mostrado en la interfaz');
    }
    
    // 6. Verificar acceso a páginas permitidas para Ramon
    console.log('\n--- VERIFICANDO ACCESO A PÁGINAS ---');
    
    const paginasPermitidas = [
      { ruta: '/', nombre: 'Dashboard' },
      { ruta: '/animals', nombre: 'Animales' },
      { ruta: '/users', nombre: 'Usuarios' }
    ];
    
    const paginasNoPermitidas = [
      { ruta: '/imports', nombre: 'Importación' },
      { ruta: '/backup', nombre: 'Backup' }
    ];
    
    // Verificar páginas permitidas
    for (const pagina of paginasPermitidas) {
      await page.goto(`${URL_BASE}${pagina.ruta}`);
      await page.waitForTimeout(1000);
      
      // Verificar si fue redirigido a /unauthorized o /login
      const url = page.url();
      if (url.includes('/unauthorized') || url.includes('/login')) {
        console.log(`❌ ERROR: No se tiene acceso a ${pagina.nombre} (${pagina.ruta})`);
      } else {
        console.log(`✅ Acceso correcto a ${pagina.nombre} (${pagina.ruta})`);
      }
    }
    
    // Verificar páginas no permitidas
    for (const pagina of paginasNoPermitidas) {
      await page.goto(`${URL_BASE}${pagina.ruta}`);
      await page.waitForTimeout(1000);
      
      // Verificar si fue redirigido a /unauthorized o /login
      const url = page.url();
      if (url.includes('/unauthorized') || url.includes('/login')) {
        console.log(`✅ Correctamente denegado acceso a ${pagina.nombre} (${pagina.ruta})`);
      } else {
        console.log(`❌ ERROR: Se tiene acceso indebido a ${pagina.nombre} (${pagina.ruta})`);
      }
    }
    
    // 7. Verificar sidebar
    console.log('\n--- VERIFICANDO ELEMENTOS DEL SIDEBAR ---');
    await page.goto(`${URL_BASE}/`);
    await page.waitForSelector('.sidebar');
    
    const elementosSidebar = await page.evaluate(() => {
      const enlaces = document.querySelectorAll('.sidebar a');
      const hrefs = Array.from(enlaces).map(a => a.getAttribute('href'));
      return {
        dashboard: hrefs.some(href => href === '/' || href === '/dashboard'),
        explotaciones: hrefs.some(href => href.includes('/explotacion')),
        animales: hrefs.some(href => href.includes('/animal')),
        usuarios: hrefs.some(href => href.includes('/user')),
        importacion: hrefs.some(href => href.includes('/import')),
        backup: hrefs.some(href => href.includes('/backup'))
      };
    });
    
    console.log('ELEMENTOS DEL SIDEBAR VISIBLES:');
    console.log(`- Dashboard: ${elementosSidebar.dashboard ? '✅ Visible' : '❌ No visible'}`);
    console.log(`- Explotaciones: ${elementosSidebar.explotaciones ? '✅ Visible' : '❌ No visible'}`);
    console.log(`- Animales: ${elementosSidebar.animales ? '✅ Visible' : '❌ No visible'}`);
    console.log(`- Usuarios: ${elementosSidebar.usuarios ? '✅ Visible' : '❌ No visible'}`);
    console.log(`- Importación: ${elementosSidebar.importacion ? '❌ No debería ser visible' : '✅ Correctamente oculto'}`);
    console.log(`- Backup: ${elementosSidebar.backup ? '❌ No debería ser visible' : '✅ Correctamente oculto'}`);
    
    // 8. Cerrar sesión y hacer login con admin para comparar
    console.log('\n--- PRUEBA DE COMPARACIÓN: Login con admin ---');
    await page.goto(`${URL_BASE}/logout`);
    await page.waitForNavigation();
    await page.goto(`${URL_BASE}/login`);
    await page.waitForSelector('#username');
    
    // Rellenar formulario de login con admin
    await page.type('#username', CREDENCIALES.admin.username);
    await page.type('#password', CREDENCIALES.admin.password);
    await page.click('#loginForm button[type="submit"]');
    
    // Esperar redirección
    await page.waitForNavigation();
    await page.waitForTimeout(1000);
    
    // Verificar localStorage para admin
    const adminLocalStorageData = await page.evaluate(() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    });
    
    if (adminLocalStorageData) {
      console.log('DATOS DE USUARIO ADMIN:', adminLocalStorageData);
      console.log(`ROL DE ADMIN: ${adminLocalStorageData.role}`);
    }
    
    // 9. Resumen final
    console.log('\n=== RESUMEN DE LA VERIFICACIÓN ===');
    console.log('La prueba ha completado todas las verificaciones.');
    console.log('✅ Se ha comprobado el inicio de sesión con Ramon');
    console.log('✅ Se ha verificado el rol en localStorage');
    console.log('✅ Se ha verificado el rol mostrado en la interfaz');
    console.log('✅ Se ha verificado el acceso a las páginas permitidas');
    console.log('✅ Se ha verificado la denegación a las páginas restringidas');
    console.log('✅ Se ha verificado la visualización correcta del sidebar');
    
    console.log('\nSi todos los puntos anteriores tienen ✅, el arreglo ha funcionado correctamente.');
    
  } catch (error) {
    console.error('❌ ERROR DURANTE LA VERIFICACIÓN:', error);
    // Capturar una imagen del error
    if (browser) {
      const pages = await browser.pages();
      if (pages.length > 0) {
        await pages[0].screenshot({ path: path.join(SCREENSHOT_DIR, 'error.png') });
        console.log('Se ha guardado una captura del error en screenshots/error.png');
      }
    }
  } finally {
    // Cerrar el navegador
    if (browser) {
      await browser.close();
      console.log('\nNavegador cerrado');
    }
  }
}

// Ejecutar la verificación
verificarFix().catch(console.error);
