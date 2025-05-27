/**
 * Script de prueba holístico para el usuario Ramon
 * Este script prueba todo el ciclo completo del usuario Ramon:
 * - Login 
 * - Verificación del rol en backend y frontend
 * - Navegación por todas las secciones permitidas
 * - Verificación del componente de perfil
 * - Comprobación de permisos en cada sección
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    backendUrl: 'http://localhost:8000',
    frontendUrl: 'http://localhost:3000',
    screenshotsDir: path.join(__dirname, 'screenshots'),
    credentials: {
        username: 'Ramon',
        password: 'Ramon123'
    },
    // Secciones a las que debería tener acceso según la matriz de permisos
    accessibleSections: [
        { name: 'Dashboard', path: '/' },
        { name: 'Explotaciones', path: '/explotaciones-react' },
        { name: 'Animales', path: '/animals' },
        { name: 'Listados', path: '/listados' },
        { name: 'Importación', path: '/imports' },
        { name: 'Usuarios', path: '/users' },
        { name: 'Copias de Seguridad', path: '/backup' }
    ]
};

// Asegurarnos de que existe el directorio de screenshots
if (!fs.existsSync(CONFIG.screenshotsDir)) {
    fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

/**
 * Función para hacer login en el backend directamente (API)
 */
async function loginBackend(username, password) {
    console.log(`\n=== PRUEBA DE BACKEND: Login de ${username} ===`);
    
    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        
        const response = await axios.post(`${CONFIG.backendUrl}/api/v1/auth/login`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (response.status === 200 && response.data.access_token) {
            console.log(`✅ Login backend exitoso para ${username}`);
            
            // Verificar el token JWT (opcional)
            const token = response.data.access_token;
            console.log(`Token recibido: ${token.substring(0, 20)}...`);
            
            // Verificar el rol usando el endpoint /me
            const userInfoResponse = await axios.get(`${CONFIG.backendUrl}/api/v1/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log(`\n📊 Información del usuario desde el backend:`);
            console.log(`- Username: ${userInfoResponse.data.username}`);
            console.log(`- Role: ${userInfoResponse.data.role}`);
            
            if (userInfoResponse.data.username.toLowerCase() === 'ramon' && 
                userInfoResponse.data.role === 'Ramon') {
                console.log(`✅ Rol correcto en el backend: ${userInfoResponse.data.role}`);
            } else {
                console.log(`❌ Rol incorrecto en el backend: ${userInfoResponse.data.role} (debería ser 'Ramon')`);
            }
            
            return {
                success: true,
                token,
                user: userInfoResponse.data
            };
        } else {
            console.log(`❌ Error en login backend: ${response.statusText}`);
            return { success: false };
        }
    } catch (error) {
        console.log(`❌ Error en login backend: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Datos: ${JSON.stringify(error.response.data)}`);
        }
        return { success: false };
    }
}

/**
 * Función principal que ejecuta todas las pruebas
 */
async function runTests() {
    // Crear una carpeta con fecha y hora para los screenshots
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const testDir = path.join(CONFIG.screenshotsDir, `test_ramon_${timestamp}`);
    fs.mkdirSync(testDir, { recursive: true });
    
    console.log(`\n============================================`);
    console.log(`=== TEST HOLÍSTICO DE USUARIO RAMON ===`);
    console.log(`============================================\n`);
    
    // 1. Primero probar el backend para verificar que asigna el rol correcto
    const backendLogin = await loginBackend(CONFIG.credentials.username, CONFIG.credentials.password);
    
    if (!backendLogin.success) {
        console.log(`❌ No se pudo continuar porque el login en el backend falló`);
        return;
    }

    // 2. Iniciar Puppeteer para las pruebas del frontend
    console.log(`\n=== PRUEBA DE FRONTEND: Navegación completa ===`);
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--window-size=1366,768']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        
        // Configurar eventos de consola para depuración
        page.on('console', message => console.log(`>> ${message.text()}`));
        
        // 3. Navegar a la página de login
        console.log(`\nAccediendo a la página de login: ${CONFIG.frontendUrl}`);
        await page.goto(`${CONFIG.frontendUrl}/login`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: path.join(testDir, '01_login_page.png') });
        
        // 4. Realizar el login
        console.log(`\nRealizando login como ${CONFIG.credentials.username}`);
        await page.type('#username', CONFIG.credentials.username);
        await page.type('#password', CONFIG.credentials.password);
        
        // Capturar antes de hacer clic en el botón de login
        await page.screenshot({ path: path.join(testDir, '02_login_filled.png') });
        
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        
        // 5. Verificar que estamos en el Dashboard después del login
        const currentUrl = page.url();
        console.log(`\nRedirección después del login: ${currentUrl}`);
        
        if (currentUrl.includes('/dashboard') || currentUrl.endsWith('/')) {
            console.log(`✅ Redirección correcta al dashboard`);
            await page.screenshot({ path: path.join(testDir, '03_dashboard.png') });
        } else {
            console.log(`❌ Redirección incorrecta después del login`);
        }
        
        // 6. Verificar el rol del usuario en el frontend mediante localStorage
        const localStorageData = await page.evaluate(() => {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const token = localStorage.getItem('token');
            const ramonFix = localStorage.getItem('ramonFix');
            const userRole = localStorage.getItem('userRole');
            
            return {
                user,
                token: token ? true : false,
                ramonFix,
                userRole
            };
        });
        
        console.log(`\n📊 Datos en localStorage después del login:`);
        console.log(`- Token presente: ${localStorageData.token}`);
        console.log(`- Usuario: ${localStorageData.user ? JSON.stringify(localStorageData.user) : 'No presente'}`);
        console.log(`- ramonFix: ${localStorageData.ramonFix}`);
        console.log(`- userRole: ${localStorageData.userRole}`);
        
        if (localStorageData.user && 
            localStorageData.user.username.toLowerCase() === 'ramon' &&
            localStorageData.user.role === 'Ramon') {
            console.log(`✅ Rol correcto en localStorage: ${localStorageData.user.role}`);
        } else if (localStorageData.user) {
            console.log(`❌ Rol incorrecto en localStorage: ${localStorageData.user.role} (debería ser 'Ramon')`);
        } else {
            console.log(`❌ No hay datos de usuario en localStorage`);
        }
        
        // 7. Visitar el perfil para verificar que muestra el rol correcto
        console.log(`\nVisitando página de perfil`);
        await page.goto(`${CONFIG.frontendUrl}/profile`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: path.join(testDir, '04_profile.png') });
        
        // Verificar que el perfil muestra el rol correcto
        const profileRole = await page.evaluate(() => {
            // Encontrar el div que contiene "Rol" y obtener el texto de su hermano
            const rolLabels = Array.from(document.querySelectorAll('.text-sm.text-gray-600'));
            const rolLabel = rolLabels.find(el => el.textContent.includes('Rol'));
            if (rolLabel) {
                return rolLabel.nextElementSibling.textContent;
            }
            return null;
        });
        
        console.log(`Rol mostrado en perfil: ${profileRole}`);
        if (profileRole === 'Ramon') {
            console.log(`✅ Rol correcto en perfil: ${profileRole}`);
        } else {
            console.log(`❌ Rol incorrecto en perfil: ${profileRole} (debería ser 'Ramon')`);
        }
        
        // 8. Probar navegación por todas las secciones permitidas
        console.log(`\n=== PRUEBA DE NAVEGACIÓN POR SECCIONES ===`);
        
        for (const section of CONFIG.accessibleSections) {
            console.log(`\nNavegando a ${section.name}: ${section.path}`);
            
            try {
                await page.goto(`${CONFIG.frontendUrl}${section.path}`, { 
                    waitUntil: 'networkidle2',
                    timeout: 10000 
                });
                
                const sectionUrl = page.url();
                const screenshotPath = path.join(testDir, `05_section_${section.name.toLowerCase().replace(/ /g, '_')}.png`);
                await page.screenshot({ path: screenshotPath });
                
                // Verificar si tenemos acceso o hemos sido redirigidos
                if (sectionUrl.includes(section.path)) {
                    console.log(`✅ Acceso permitido a ${section.name}`);
                } else {
                    console.log(`❌ Redirección detectada, posible acceso denegado a ${section.name}`);
                    console.log(`   URL actual: ${sectionUrl}`);
                }
            } catch (error) {
                console.log(`❌ Error al navegar a ${section.name}: ${error.message}`);
            }
        }
        
        // 9. Prueba de recarga de página para verificar persistencia del rol
        console.log(`\n=== PRUEBA DE PERSISTENCIA TRAS RECARGA ===`);
        
        // Ir a una página específica antes de recargar
        await page.goto(`${CONFIG.frontendUrl}/profile`, { waitUntil: 'networkidle2' });
        console.log(`Página antes de recargar: ${page.url()}`);
        
        // Recargar la página
        console.log(`Recargando página...`);
        await page.reload({ waitUntil: 'networkidle2' });
        await page.screenshot({ path: path.join(testDir, '06_after_reload.png') });
        
        // Verificar el rol después de recargar
        const afterReloadRole = await page.evaluate(() => {
            const rolLabels = Array.from(document.querySelectorAll('.text-sm.text-gray-600'));
            const rolLabel = rolLabels.find(el => el.textContent.includes('Rol'));
            if (rolLabel) {
                return rolLabel.nextElementSibling.textContent;
            }
            return null;
        });
        
        console.log(`Rol mostrado después de recargar: ${afterReloadRole}`);
        if (afterReloadRole === 'Ramon') {
            console.log(`✅ Rol persistente tras recarga: ${afterReloadRole}`);
        } else {
            console.log(`❌ Rol incorrecto tras recarga: ${afterReloadRole} (debería ser 'Ramon')`);
        }
        
        // 10. Verificar localStorage después de recargar
        const afterReloadStorage = await page.evaluate(() => {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const token = localStorage.getItem('token');
            const ramonFix = localStorage.getItem('ramonFix');
            const userRole = localStorage.getItem('userRole');
            
            return {
                user,
                token: token ? true : false,
                ramonFix,
                userRole
            };
        });
        
        console.log(`\n📊 Datos en localStorage después de recargar:`);
        console.log(`- Token presente: ${afterReloadStorage.token}`);
        console.log(`- Usuario: ${afterReloadStorage.user ? JSON.stringify(afterReloadStorage.user) : 'No presente'}`);
        console.log(`- ramonFix: ${afterReloadStorage.ramonFix}`);
        console.log(`- userRole: ${afterReloadStorage.userRole}`);
        
        if (afterReloadStorage.user && 
            afterReloadStorage.user.username.toLowerCase() === 'ramon' &&
            afterReloadStorage.user.role === 'Ramon') {
            console.log(`✅ Rol correcto en localStorage tras recarga: ${afterReloadStorage.user.role}`);
        } else if (afterReloadStorage.user) {
            console.log(`❌ Rol incorrecto en localStorage tras recarga: ${afterReloadStorage.user.role} (debería ser 'Ramon')`);
        } else {
            console.log(`❌ No hay datos de usuario en localStorage tras recarga`);
        }
        
        // 11. Cerrar sesión y volver a iniciar para verificar todo el ciclo
        console.log(`\n=== PRUEBA DE CICLO COMPLETO: LOGOUT Y NUEVO LOGIN ===`);
        
        // Ir a perfil para encontrar el botón de logout
        await page.goto(`${CONFIG.frontendUrl}/profile`, { waitUntil: 'networkidle2' });
        
        // Buscar y hacer clic en el botón de cerrar sesión
        console.log(`Cerrando sesión...`);
        const logoutButton = await page.$('button:has-text("Cerrar sesión")');
        if (logoutButton) {
            await logoutButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            await page.screenshot({ path: path.join(testDir, '07_after_logout.png') });
            console.log(`✅ Logout realizado correctamente`);
        } else {
            console.log(`❌ No se encontró el botón de cerrar sesión`);
        }
        
        // Verificar localStorage después de logout
        const afterLogoutStorage = await page.evaluate(() => {
            return {
                user: localStorage.getItem('user'),
                token: localStorage.getItem('token'),
                ramonFix: localStorage.getItem('ramonFix'),
                userRole: localStorage.getItem('userRole')
            };
        });
        
        console.log(`\n📊 Datos en localStorage después de logout:`);
        console.log(`- Token: ${afterLogoutStorage.token || 'No presente'}`);
        console.log(`- Usuario: ${afterLogoutStorage.user || 'No presente'}`);
        console.log(`- ramonFix: ${afterLogoutStorage.ramonFix || 'No presente'}`);
        console.log(`- userRole: ${afterLogoutStorage.userRole || 'No presente'}`);
        
        // Realizar login nuevamente
        console.log(`\nRealizando login nuevamente como ${CONFIG.credentials.username}`);
        await page.goto(`${CONFIG.frontendUrl}/login`, { waitUntil: 'networkidle2' });
        await page.type('#username', CONFIG.credentials.username);
        await page.type('#password', CONFIG.credentials.password);
        
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        
        await page.screenshot({ path: path.join(testDir, '08_after_second_login.png') });
        
        // Verificar rol después del segundo login
        await page.goto(`${CONFIG.frontendUrl}/profile`, { waitUntil: 'networkidle2' });
        
        const secondLoginRole = await page.evaluate(() => {
            const rolLabels = Array.from(document.querySelectorAll('.text-sm.text-gray-600'));
            const rolLabel = rolLabels.find(el => el.textContent.includes('Rol'));
            if (rolLabel) {
                return rolLabel.nextElementSibling.textContent;
            }
            return null;
        });
        
        console.log(`\nRol mostrado después del segundo login: ${secondLoginRole}`);
        if (secondLoginRole === 'Ramon') {
            console.log(`✅ Rol correcto tras segundo login: ${secondLoginRole}`);
        } else {
            console.log(`❌ Rol incorrecto tras segundo login: ${secondLoginRole} (debería ser 'Ramon')`);
        }
        
        // Verificar localStorage después del segundo login
        const secondLoginStorage = await page.evaluate(() => {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const token = localStorage.getItem('token');
            const ramonFix = localStorage.getItem('ramonFix');
            const userRole = localStorage.getItem('userRole');
            
            return {
                user,
                token: token ? true : false,
                ramonFix,
                userRole
            };
        });
        
        console.log(`\n📊 Datos en localStorage después del segundo login:`);
        console.log(`- Token presente: ${secondLoginStorage.token}`);
        console.log(`- Usuario: ${secondLoginStorage.user ? JSON.stringify(secondLoginStorage.user) : 'No presente'}`);
        console.log(`- ramonFix: ${secondLoginStorage.ramonFix}`);
        console.log(`- userRole: ${secondLoginStorage.userRole}`);
        
        // 12. Resumen final de pruebas
        console.log(`\n=== RESUMEN DE PRUEBAS ===`);
        console.log(`- Directorio de capturas: ${testDir}`);
        console.log(`- Total de capturas: ${fs.readdirSync(testDir).length}`);
        
    } catch (error) {
        console.error(`\n❌ ERROR GENERAL EN LAS PRUEBAS: ${error.message}`);
        console.error(error);
    } finally {
        // Cerrar el navegador
        console.log(`\nCerrando navegador...`);
        await browser.close();
    }
}

// Ejecutar todas las pruebas
runTests().then(() => {
    console.log(`\n=== PRUEBAS COMPLETADAS ===`);
}).catch(error => {
    console.error(`Error en las pruebas: ${error.message}`);
});
