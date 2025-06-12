// Script mejorado de Puppeteer para analizar la estructura del navegador
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuración - MODIFICAR SEGÚN NECESIDAD
const baseUrl = 'http://172.20.160.1:3000';
const apiBaseUrl = 'http://127.0.0.1:8000'; // URL de la API backend
const outputDir = './navegador-analisis/resultados';

// Rutas conocidas en el frontend (usamos las rutas correctas basadas en la estructura real)
const rutas = [
    '/',                       // Dashboard
    '/explotacions',           // Listado de explotaciones (corregido)
    '/animals',                // Gestión de animales (corregido)
    '/imports',                // Importación de datos (corregido)
    '/users',                  // Gestión de usuarios (corregido)
    '/backups',                // Sistema de backups (corregido)
    '/dashboard',              // Dashboard alternativo
    '/profile',                // Perfil de usuario
    '/login',                  // Página de login
];

// Credenciales
const username = 'admin';
const password = 'admin123';

// Asegurarse de que existe el directorio de salida
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function esperar(page, ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para guardar captura de pantalla con nombre más descriptivo
async function tomarCaptura(page, nombre) {
    const filename = `${nombre.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    await page.screenshot({ 
        path: path.join(outputDir, filename),
        fullPage: true
    });
    console.log(`  📸 Captura guardada: ${filename}`);
    return filename;
}

async function analizarEstructura() {
    console.log('\n🚀 Iniciando análisis de estructura del navegador...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = {};
    const componentApiMapping = {};
    let authToken = null;
    
    try {
        const page = await browser.newPage();
        
        // Establecer un viewPort adecuado
        await page.setViewport({ width: 1366, height: 768 });
        
        // Habilitar intercepción de peticiones
        await page.setRequestInterception(true);
        const apiCalls = new Set();
        
        // Interceptar peticiones para capturar llamadas API
        page.on('request', request => {
            const url = request.url();
            if (url.includes('/api/v1/') || url.includes('/api/')) {
                apiCalls.add(url);
                
                // Agregar token de autenticación a peticiones API si lo tenemos
                if (authToken) {
                    const headers = request.headers();
                    headers['Authorization'] = `Bearer ${authToken}`;
                    try {
                        request.continue({ headers });
                        return;
                    } catch (e) {
                        // Si ya se ha continuado la petición, ignoramos el error
                    }
                }
            }
            try {
                request.continue();
            } catch (e) {
                // Si ya se ha continuado la petición, ignoramos el error
            }
        });
        
        // Monitorear eventos de consola
        page.on('console', msg => {
            // Filtramos algunos mensajes para reducir el ruido
            const text = msg.text();
            if (!text.includes('Download the React DevTools') && 
                !text.startsWith('%c')) {
                console.log('[Consola] ' + text);
            }
        });
        
        // 1. PRIMERO: Obtener token directamente de la API
        console.log('\n🔑 Obteniendo token directamente de la API...');
        
        try {
            const apiResponse = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            
            const tokenData = await apiResponse.json();
            if (tokenData.access_token) {
                authToken = tokenData.access_token;
                console.log('✅ Token JWT obtenido exitosamente');
                
                // Almacenar el token para usarlo en el análisis
                fs.writeFileSync(
                    path.join(outputDir, 'auth-token.json'),
                    JSON.stringify({ token: authToken }, null, 2)
                );
            } else {
                console.error('❌ No se pudo obtener el token JWT');
                console.log('Respuesta API:', JSON.stringify(tokenData));
            }
        } catch (apiError) {
            console.error('❌ Error al autenticar con la API:', apiError.message);
        }
        
        // 2. SEGUNDO: Iniciar sesión en el frontend también para garantizar la autenticación visual
        console.log('\n🔑 Iniciando sesión en el frontend...');
        await page.goto(baseUrl + '/login', { waitUntil: 'networkidle0' });
        await esperar(page, 2000);
        
        try {
            // Capturar screenshot de login
            await tomarCaptura(page, 'login-screen');
            
            // Intentar iniciar sesión
            await page.type('input[name="username"]', username);
            await page.type('input[name="password"]', password);
            await page.click('button[type="submit"]');
            
            // Esperar redirección después del login
            await esperar(page, 3000);
            
            // Inyectar el token en localStorage para garantizar la autenticación
            if (authToken) {
                await page.evaluate((token) => {
                    console.log('Inyectando token JWT en localStorage...');
                    localStorage.setItem('token', token);
                    // También algunas aplicaciones usan estos formatos alternativos
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('userRole', 'admin');
                    localStorage.setItem('username', 'admin');
                    return true;
                }, authToken);
                
                console.log('✅ Token inyectado en localStorage');
            }
            
            console.log('✅ Sesión iniciada correctamente');
            await tomarCaptura(page, 'after-login');
        } catch (loginError) {
            console.error('❌ Error al iniciar sesión: ' + loginError.message);
        }
        
        // Analizar cada ruta
        for (const ruta of rutas) {
            try {
                const fullUrl = baseUrl + ruta;
                console.log('\n📄 Analizando: ' + fullUrl);
                
                // Navegar a la URL
                await page.goto(fullUrl, { waitUntil: 'networkidle0' });
                await esperar(page, 2000); // Esperar a que cargue completamente
                
                // Capturar screenshot
                await page.screenshot({ path: path.join(outputDir, 'screenshot-' + ruta.replace(/\//g, '-').replace(/^-/, '') + '.png') });
                
                // Extraer recursos
                const pageData = await page.evaluate(() => {
                    // Extraer scripts
                    const scripts = Array.from(document.querySelectorAll('script[src]'))
                        .map(script => script.src);
                    
                    // Extraer hojas de estilo
                    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                        .map(link => link.href);
                    
                    // Extraer enlaces
                    const links = Array.from(document.querySelectorAll('a'))
                        .map(a => ({
                            text: a.textContent.trim(),
                            href: a.href
                        }));
                    
                    // Extraer título
                    const title = document.title;
                    
                    // Identificar elementos interactivos
                    const interactiveElements = Array.from(
                        document.querySelectorAll('button, a, [role="button"], input[type="submit"]')
                    ).map(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        text: el.innerText?.trim() || el.value,
                        class: el.className
                    }));
                    
                    return {
                        title,
                        scripts,
                        styles,
                        links,
                        interactiveElements
                    };
                });
                
                // Intentar interactuar con botones principales
                console.log('\n🔍 Detectando interacciones en: ' + ruta);
                
                const buttonsToClick = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]')).map(btn => {
                        const text = btn.innerText?.trim() || btn.value;
                        return {
                            text: text,
                            id: btn.id,
                            classList: Array.from(btn.classList || []),
                            hasExport: text && (
                                text.toLowerCase().includes('export') || 
                                text.toLowerCase().includes('pdf') || 
                                text.toLowerCase().includes('csv')
                            ),
                            selectors: [
                                btn.id ? `#${btn.id}` : null,
                                btn.className ? `.${btn.className.split(' ').join('.')}` : null
                            ].filter(Boolean)
                        };
                    }).filter(btn => btn.text);
                });
                
                // Registrar botones principales detectados
                console.log('Botones detectados:');
                buttonsToClick.forEach(btn => {
                    if (btn.hasExport) {
                        console.log(`  📄 Botón exportación: ${btn.text} (id: ${btn.id || 'sin id'})`);
                    } else {
                        console.log(`  🔘 Botón: ${btn.text} (id: ${btn.id || 'sin id'})`);
                    }
                });
                
                // Guardar relaciones entre botones y endpoints
                if (!componentApiMapping[ruta]) {
                    componentApiMapping[ruta] = {};
                return Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
            });
            
            // Guardar los scripts para análisis
            fs.writeFileSync(
                path.join(outputDir, 'scripts-detectados.json'),
                JSON.stringify(scripts, null, 2)
            );
            
            // Buscar patrones de endpoints en el código JS
            const apiPatterns = await page.evaluate(() => {
                const patterns = new Set();
                
                // Intentar encontrar patrones en el código fuente visible
                const apiRegex = /['"`]\/(api\/v1\/[^'"`]+)['"`]/g;
                const pageSource = document.documentElement.outerHTML;
                let match;
                
                while ((match = apiRegex.exec(pageSource)) !== null) {
                    patterns.add(match[1]);
                }
                
                return Array.from(patterns);
            });
            
            console.log(`🔍 Patrones de API detectados en código fuente: ${apiPatterns.length}`);
            if (apiPatterns.length > 0) {
                console.log('Patrones detectados:');
                apiPatterns.forEach(pattern => console.log(`  - ${pattern}`));
            }
            
            // Guardar los patrones detectados
            fs.writeFileSync(
                path.join(outputDir, 'api-patterns-detectados.json'),
                JSON.stringify(apiPatterns, null, 2)
            );
        } catch (apiError) {
            console.error('❌ Error al detectar endpoints API: ' + apiError.message);
        }
        
        // Guardar resultados como JSON
        fs.writeFileSync(
            path.join(outputDir, 'analisis-navegador.json'),
            JSON.stringify(results, null, 2)
        );
        
        // Generar reporte en formato Markdown
        let mdReport = '# Análisis de Estructura del Navegador\n\n';
        mdReport += '*Generado: ' + new Date().toLocaleString() + '*\n\n';
        
        for (const [ruta, data] of Object.entries(results)) {
            mdReport += '## Ruta: ' + ruta + '\n\n';
            
            if (data.error) {
                mdReport += '⚠️ **Error**: ' + data.error + '\n\n';
                continue;
            }
            
            mdReport += '**Título:** ' + (data.title || 'N/A') + '\n\n';
            
            // Enlaces a capturas de pantalla
            mdReport += `![Captura de ${ruta}](./screenshot-${ruta.replace(/\//g, '-').replace(/^-/, '')}.png)\n\n`;
            
            // Scripts
            mdReport += '### Scripts (' + data.scripts.length + ')\n\n';
            if (data.scripts.length > 0) {
                mdReport += '```\n' + data.scripts.join('\n') + '\n```\n\n';
            } else {
                mdReport += '*No se encontraron scripts externos*\n\n';
            }
            
            // Enlaces
            mdReport += '### Enlaces (' + data.links.length + ')\n\n';
            if (data.links.length > 0) {
                mdReport += '| Texto | URL |\n|------|-----|\n';
                data.links.forEach(link => {
                    mdReport += '| ' + (link.text || '(sin texto)') + ' | ' + link.href + ' |\n';
                });
                mdReport += '\n';
            } else {
                mdReport += '*No se encontraron enlaces*\n\n';
            }
            
            // API Calls
            mdReport += '### Llamadas API (' + data.apiCalls.length + ')\n\n';
            if (data.apiCalls.length > 0) {
                mdReport += '```\n' + data.apiCalls.join('\n') + '\n```\n\n';
            } else {
                mdReport += '*No se detectaron llamadas API*\n\n';
            }
            
            // Separador entre rutas
            mdReport += '---\n\n';
        }
        
        // Generar el mapa de relaciones entre componentes y endpoints
        let componentEndpointMap = '# Mapeo Componentes a Endpoints\n\n';
        componentEndpointMap += '*Generado automáticamente por Puppeteer*\n\n';
        
        // Organizar por secciones
        componentEndpointMap += '## Relaciones Detectadas por Sección\n\n';
        
        for (const [ruta, interactions] of Object.entries(componentApiMapping)) {
            componentEndpointMap += '### Sección: ' + ruta + '\n\n';
            componentEndpointMap += '| Componente/Acción | Endpoints Llamados |\n|---------------|-------------------|\n';
            
            for (const [interaction, apiCalls] of Object.entries(interactions)) {
                const uniqueEndpoints = [...new Set(apiCalls.map(url => {
                    // Convertir URL completa a formato de endpoint API
                    const match = url.match(/\/api\/v1\/[^?]*/i);
                    return match ? match[0] : url;
                }))];
                
                componentEndpointMap += '| ' + interaction + ' | ' + uniqueEndpoints.join('<br>') + ' |\n';
            }
            
            componentEndpointMap += '\n';
        }
        
        fs.writeFileSync(
            path.join(outputDir, 'componentes-endpoints.md'), 
            componentEndpointMap
        );
        
        fs.writeFileSync(
            path.join(outputDir, 'analisis-navegador.md'), 
            mdReport
        );
        
        console.log('\n✅ Análisis completado. Resultados guardados en: ' + outputDir);
        
    } catch (error) {
        console.error('❌ Error general: ' + error.message);
    } finally {
        await browser.close();
    }
}

analizarEstructura();
