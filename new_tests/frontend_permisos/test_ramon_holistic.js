/**
 * TEST HOLÍSTICO COMPLETO PARA EL USUARIO RAMON
 * 
 * Este test verifica la persistencia del rol 'Ramon' durante toda la sesión
 * y bajo diferentes escenarios (recarga, navegación, logout/login)
 *
 * Ejecutar: node new_tests/frontend_permisos/test_ramon_holistic.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const CONFIG = {
  URL_BASE: 'http://localhost:3000',
  TIEMPO_ESPERA: 2000,
  DIRECTORIO_CAPTURAS: path.join(__dirname, 'capturas_ramon'),
  CREDENCIALES: {
    username: 'ramonadmin',
    password: 'Ramon123'
  }
};

// Crear directorio para capturas
if (!fs.existsSync(CONFIG.DIRECTORIO_CAPTURAS)) {
  fs.mkdirSync(CONFIG.DIRECTORIO_CAPTURAS, { recursive: true });
}

// Utilidades
const Utils = {
  // Captura de pantalla
  async tomarCaptura(page, nombre) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rutaArchivo = path.join(CONFIG.DIRECTORIO_CAPTURAS, `${nombre}_${timestamp}.png`);
    await page.screenshot({ path: rutaArchivo, fullPage: true });
    console.log(`📸 Captura guardada: ${rutaArchivo}`);
    return rutaArchivo;
  },

  // Obtener datos de localStorage
  async obtenerLocalStorage(page) {
    return await page.evaluate(() => {
      const datos = {};
      for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        datos[clave] = localStorage.getItem(clave);
      }
      return datos;
    });
  },

  // Mostrar datos de localStorage
  async mostrarLocalStorage(page, etapa) {
    const datos = await this.obtenerLocalStorage(page);
    console.log(`\n📋 LocalStorage en "${etapa}":`);
    Object.entries(datos).forEach(([clave, valor]) => {
      if (clave === 'user' || clave === 'token') {
        console.log(`  ${clave}: ${valor.substring(0, 30)}...`);
      } else {
        console.log(`  ${clave}: ${valor}`);
      }
    });
    return datos;
  },

  // Obtener rol actual
  async obtenerRolActual(page) {
    return await page.evaluate(() => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return 'no hay usuario';
        const user = JSON.parse(userData);
        return user.role || 'sin rol';
      } catch (e) {
        return 'error: ' + e.message;
      }
    });
  },

  // Verificar resultado
  verificarResultado(condicion, descripcion, mensajeExito, mensajeError) {
    if (condicion) {
      console.log(`✅ CORRECTO: ${mensajeExito}`);
    } else {
      console.log(`❌ ERROR: ${mensajeError}`);
    }
    return condicion;
  }
};

/**
 * Función principal del test
 */
async function testRamonRol() {
  console.log('===== INICIANDO TEST DE ROL RAMON =====');
  console.log('Fecha y hora: ' + new Date().toLocaleString());
  
  // Resultados del test
  const resultados = {
    login: false,
    rolInicial: false,
    persistenciaTrasRecarga: false,
    persistenciaTrasNavegacion: false,
    logout: false,
    loginNuevo: false
  };
  
  // Iniciar navegador
  const browser = await puppeteer.launch({
    headless: false, // Mostrar navegador
    args: ['--window-size=1366,768'],
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // 0. VERIFICAR SI HAY SESIÓN ACTIVA Y HACER LOGOUT
    console.log('\n🔐 FASE 0: VERIFICAR SESIÓN PREVIA');
    
    // Primero ir a la página principal para ver si hay sesión activa
    await page.goto(CONFIG.URL_BASE, { waitUntil: 'networkidle2' });
    await Utils.tomarCaptura(page, '00_pagina_inicial');
    
    // Verificar si hay una sesión activa mirando el localStorage
    const hayToken = await page.evaluate(() => {
      return localStorage.getItem('token') !== null;
    });
    
    if (hayToken) {
      console.log('Sesión activa detectada. Haciendo logout primero...');
      await page.goto(`${CONFIG.URL_BASE}/logout`, { waitUntil: 'networkidle2' });
      await Utils.tomarCaptura(page, '00_logout_previo');
      console.log('Logout previo completado');
    } else {
      console.log('No se detectó sesión activa, procediendo directamente al login');
    }
    
    // 1. LOGIN
    console.log('\n🔑 FASE 1: LOGIN COMO RAMON');
    await page.goto(`${CONFIG.URL_BASE}/login`, { waitUntil: 'networkidle2' });
    await Utils.tomarCaptura(page, '01_pantalla_login');
    
    // Ingresar credenciales
    await page.type('input[name="username"]', CONFIG.CREDENCIALES.username);
    await page.type('input[name="password"]', CONFIG.CREDENCIALES.password);
    await page.click('button[type="submit"]');
    
    // Esperar redirección al dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await Utils.tomarCaptura(page, '02_post_login');
    console.log(`URL después de login: ${page.url()}`);
    
    // Verificar localStorage
    await Utils.mostrarLocalStorage(page, 'después de login');
    
    // 2. VERIFICAR ROL INICIAL
    console.log('\n🔍 FASE 2: VERIFICACIÓN DE ROL INICIAL');
    const rolInicial = await Utils.obtenerRolActual(page);
    console.log(`Rol después de login: ${rolInicial}`);
    
    resultados.login = true;
    resultados.rolInicial = Utils.verificarResultado(
      rolInicial === 'Ramon',
      'Verificación de rol inicial',
      `El rol asignado es "Ramon" como se esperaba`,
      `El rol asignado es "${rolInicial}" en lugar de "Ramon"`
    );
    
    // 3. RECARGAR PÁGINA
    console.log('\n🔄 FASE 3: RECARGA DE PÁGINA');
    await page.reload({ waitUntil: 'networkidle2' });
    await Utils.tomarCaptura(page, '03_despues_recarga');
    
    // Verificar localStorage después de recargar
    await Utils.mostrarLocalStorage(page, 'después de recargar');
    
    // Verificar rol después de recargar
    const rolTrasRecarga = await Utils.obtenerRolActual(page);
    console.log(`Rol después de recargar: ${rolTrasRecarga}`);
    
    resultados.persistenciaTrasRecarga = Utils.verificarResultado(
      rolTrasRecarga === 'Ramon',
      'Verificación de persistencia del rol tras recarga',
      `El rol se mantiene como "Ramon" después de recargar`,
      `El rol cambió a "${rolTrasRecarga}" después de recargar (debería ser "Ramon")`
    );
    
    // 4. NAVEGACIÓN ENTRE SECCIONES
    console.log('\n🧭 FASE 4: NAVEGACIÓN ENTRE SECCIONES');
    
    const secciones = ['/dashboard', '/animals', '/explotacions', '/profile'];
    const rolesNavegacion = [];
    
    for (const seccion of secciones) {
      console.log(`Navegando a: ${seccion}`);
      await page.goto(`${CONFIG.URL_BASE}${seccion}`, { waitUntil: 'networkidle2' });
      await Utils.tomarCaptura(page, `04_seccion_${seccion.replace('/', '_')}`);
      
      const rolActual = await Utils.obtenerRolActual(page);
      rolesNavegacion.push({ seccion, rol: rolActual });
      
      Utils.verificarResultado(
        rolActual === 'Ramon',
        `Verificación de rol en ${seccion}`,
        `El rol se mantiene como "Ramon" en ${seccion}`,
        `El rol cambió a "${rolActual}" en ${seccion} (debería ser "Ramon")`
      );
    }
    
    console.log('Resumen de roles durante navegación:');
    console.table(rolesNavegacion);
    
    resultados.persistenciaTrasNavegacion = rolesNavegacion.every(item => item.rol === 'Ramon');
    
    // 5. LOGOUT Y NUEVO LOGIN
    console.log('\n🚪 FASE 5: CIERRE DE SESIÓN Y NUEVO LOGIN');
    
    // Cerrar sesión
    await page.goto(`${CONFIG.URL_BASE}/logout`, { waitUntil: 'networkidle2' });
    await Utils.tomarCaptura(page, '05_logout');
    
    // Verificar cierre correcto
    const datosLogout = await Utils.obtenerLocalStorage(page);
    resultados.logout = Utils.verificarResultado(
      !datosLogout.token,
      'Verificación de cierre de sesión',
      'Sesión cerrada correctamente (token eliminado)',
      'Error al cerrar sesión (token aún presente)'
    );
    
    // Nuevo login
    console.log('Iniciando sesión nuevamente...');
    await page.goto(`${CONFIG.URL_BASE}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[name="username"]', CONFIG.CREDENCIALES.username);
    await page.type('input[name="password"]', CONFIG.CREDENCIALES.password);
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await Utils.tomarCaptura(page, '06_nuevo_login');
    
    // Verificar datos después de nuevo login
    await Utils.mostrarLocalStorage(page, 'después de nuevo login');
    
    // Verificar rol después de nuevo login
    const rolFinal = await Utils.obtenerRolActual(page);
    console.log(`Rol después de nuevo login: ${rolFinal}`);
    
    resultados.loginNuevo = Utils.verificarResultado(
      rolFinal === 'Ramon',
      'Verificación de rol después de nuevo login',
      `El rol se establece correctamente a "Ramon" después de nuevo login`,
      `El rol no se establece correctamente, es "${rolFinal}" en lugar de "Ramon"`
    );
    
    // RESULTADOS FINALES
    console.log('\n===== RESUMEN DE RESULTADOS =====');
    console.table(resultados);
    
    const testExitoso = Object.values(resultados).every(Boolean);
    console.log(`\n${testExitoso ? '✅ TEST COMPLETO EXITOSO' : '❌ TEST FALLIDO'}: ${Object.values(resultados).filter(Boolean).length}/${Object.keys(resultados).length} pruebas pasadas`);
    
    // Guardar informe
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rutaInforme = path.join(CONFIG.DIRECTORIO_CAPTURAS, `informe_ramon_${timestamp}.json`);
    fs.writeFileSync(rutaInforme, JSON.stringify({
      fecha: new Date().toISOString(),
      resultados,
      testExitoso,
      rolInicial,
      rolTrasRecarga,
      rolesNavegacion,
      rolFinal
    }, null, 2));
    
    console.log(`Informe guardado en: ${rutaInforme}`);
    return testExitoso;
  } catch (error) {
    console.error('❌ ERROR EN LA EJECUCIÓN DEL TEST:', error);
    return false;
  } finally {
    // Cerrar navegador
    console.log('\n===== TEST COMPLETADO =====');
    console.log('Cerrando navegador...');
    await browser.close();
  }
}

// Verificar que Puppeteer esté instalado
try {
  require.resolve('puppeteer');
  console.log('✅ Puppeteer está instalado correctamente');
} catch (e) {
  console.error('❌ Puppeteer no está instalado. Instalando...');
  execSync('npm install puppeteer');
}

// Ejecutar el test
testRamonRol().catch(error => {
  console.error('Error en la ejecución del test:', error);
});
