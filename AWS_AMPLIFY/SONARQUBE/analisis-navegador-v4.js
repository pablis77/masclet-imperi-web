// Script mejorado de Puppeteer (v4) para analizar la estructura del navegador
// Con mejoras en clasificación de Dashboard y organización de secciones
// Optimizado para facilitar el despliegue en AWS Amplify
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Configuración
const baseUrl = 'http://172.20.160.1:3000'; // URL frontend
const apiUrl = 'http://127.0.0.1:8000';     // URL API
const baseOutputDir = path.join(__dirname, 'output-browser-analysis');

// Credenciales
const username = 'admin';
const password = 'admin123';

// Crear directorio base de salida si no existe
if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
}

// Crear directorio específico para esta ejecución con timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const runId = `run-${timestamp}`;
const outputDir = path.join(baseOutputDir, runId);
fs.mkdirSync(outputDir, { recursive: true });

console.log(`📂 Resultados se guardarán en: ${outputDir}`);

// Definición de las categorías principales de la aplicación
const APP_SECTIONS = {
    DASHBOARD: {
        id: 'dashboard',
        title: 'Panel de Control / Dashboard',
        routes: ['/', '/dashboard'],
        endpoints: ['/api/v1/dashboard', '/api/v1/dashboard/resumen-card', '/api/v1/dashboard/stats', '/api/v1/dashboard/partos'],
        components: ['DashboardNew.tsx', 'ResumenOriginalCard.tsx', 'PartosSection.tsx']
    },
    EXPLOTACIONES: {
        id: 'explotaciones',
        title: 'Explotaciones',
        routes: ['/explotaciones-react'],
        endpoints: [
    '/api/v1/dashboard/explotacions',
    '/api/v1/dashboard/explotacions/*/stats',
  ],
  // Los verdaderos endpoints tienen el formato:
  // - `/api/v1/dashboard/explotacions/{nombre_explotacion}`
  // - `/api/v1/dashboard/explotacions/{nombre_explotacion}/stats`
  // En la base de datos final habrá 11 explotaciones
        components: ['ExplotacionesList.tsx', 'ExplotacionForm.tsx']
    },
    ANIMALS: {
        id: 'animals',
        title: 'Gestión de Animales',
        routes: ['/animals', '/animals/new', '/animals/update', '/animals/\\d+'],
        endpoints: ['/api/v1/animals'],
        components: ['AnimalDetail.tsx', 'AnimalForm.tsx', 'AnimalsTable.tsx']
    },
    LISTINGS: {
        id: 'listings',
        title: 'Listados',
        routes: ['/listados'],
        endpoints: ['/api/v1/listados'],
        components: ['ListingsPage.tsx']
    },
    IMPORTS: {
        id: 'imports',
        title: 'Importaciones',
        routes: ['/imports'],
        endpoints: ['/api/v1/imports'],
        components: ['ImportsPage.tsx', 'FileUploader.tsx']
    },
    USERS: {
        id: 'users',
        title: 'Usuarios',
        routes: ['/users'],
        endpoints: ['/api/v1/users'],
        components: ['UsersPage.tsx', 'UserForm.tsx']
    },
    BACKUPS: {
        id: 'backups',
        title: 'Copias de Seguridad',
        routes: ['/backup'],
        endpoints: ['/api/v1/backups'],
        components: ['BackupsPage.tsx']
    },
    AUTH: {
        id: 'auth',
        title: 'Sistema de Autenticación',
        routes: ['/login', '/logout', '/register', '/recover-password'],
        endpoints: ['/api/v1/auth', '/api/token', '/api/v1/login'],
        components: ['LoginForm.tsx', 'AuthLayout.astro']
    },
    PROFILE: {
        id: 'profile',
        title: 'Perfil de Usuario',
        routes: ['/profile'],
        endpoints: ['/api/v1/users/me', '/api/v1/profile'],
        components: ['ProfilePage.tsx', 'ProfileForm.tsx']
    },
    NOTIFICATIONS: {
        id: 'notifications',
        title: 'Notificaciones / Alertas',
        routes: ['/notifications'],
        endpoints: ['/api/v1/notifications'],
        components: ['NotificationsPage.tsx', 'NotificationList.tsx']
    },
    OBSOLETE: {
        id: 'obsolete',
        title: 'Rutas Obsoletas',
        routes: ['/explotacions', '/backups'],
        endpoints: [],
        components: []
    }
};

// Orden de secciones para el informe final
const SECTIONS_ORDER = [
    APP_SECTIONS.DASHBOARD,
    APP_SECTIONS.EXPLOTACIONES,
    APP_SECTIONS.ANIMALS,
    APP_SECTIONS.LISTINGS,
    APP_SECTIONS.IMPORTS,
    APP_SECTIONS.USERS,
    APP_SECTIONS.BACKUPS,
    APP_SECTIONS.PROFILE,
    APP_SECTIONS.NOTIFICATIONS,
    APP_SECTIONS.AUTH,
    APP_SECTIONS.OBSOLETE
];

// Función para clasificar una ruta en su categoría correspondiente
function clasificarRuta(ruta) {
    // Casos especiales primero
    if (APP_SECTIONS.OBSOLETE.routes.includes(ruta)) {
        return APP_SECTIONS.OBSOLETE.id;
    }
    
    // Dashboard es la ruta principal
    if (ruta === '/' || ruta === '/dashboard') {
        return APP_SECTIONS.DASHBOARD.id;
    }
    
    // Para el resto de rutas, comprobamos patrones
    for (const section of SECTIONS_ORDER) {
        if (section.id === 'obsolete' || section.id === 'dashboard') continue; // Ya procesados
        
        for (const pattern of section.routes) {
            // Si es un patrón exacto
            if (pattern === ruta) {
                return section.id;
            }
            
            // Si contiene un regex para IDs (como /animals/\d+)
            if (pattern.includes('\\d+') && new RegExp(pattern).test(ruta)) {
                return section.id;
            }
            
            // Si la ruta comienza con el patrón (para subcategorías)
            if (ruta.startsWith(pattern + '/')) {
                return section.id;
            }
        }
    }
    
    // Si no se pudo clasificar, devolvemos categoría desconocida
    return 'unknown';
}

// Función para clasificar un endpoint API en su categoría
function clasificarEndpoint(endpoint) {
    for (const section of SECTIONS_ORDER) {
        for (const pattern of section.endpoints) {
            if (endpoint.startsWith(pattern)) {
                return section.id;
            }
        }
    }
    return 'unknown';
}

// Función auxiliar para esperar un tiempo específico
async function esperar(page, ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para guardar captura de pantalla con nombre descriptivo
async function tomarCaptura(page, nombre) {
    // Crear directorio de capturas si no existe
    const screenshotsDir = path.join(outputDir, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const filename = `${nombre.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    await page.screenshot({ 
        path: path.join(screenshotsDir, filename),
        fullPage: true
    });
    console.log(`  📸 Captura guardada: screenshots/${filename}`);
    return filename;
}

// Función principal de análisis
async function analizarEstructura() {
    console.log('\n🚀 Iniciando análisis de estructura del navegador...');
    
    // Inicializar browser y resultados
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const rutasInfo = {}; // Objeto principal para almacenar datos de cada ruta
    const componentApiMapping = {};
    let authToken = null;
    
    try {
        const page = await browser.newPage();
        
        // Establecer un viewPort adecuado
        await page.setViewport({ width: 1366, height: 768 });
        
        // Conjunto para almacenar llamadas API interceptadas
        const apiCalls = new Set();
        
        // Habilitar intercepción de peticiones
        await page.setRequestInterception(true);
        
        // Interceptar peticiones para capturar llamadas API y añadir token
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
        
        // Monitorear eventos de consola para depuración
        page.on('console', msg => {
            // Filtramos algunos mensajes para reducir el ruido
            const text = msg.text();
            if (!text.includes('Download the React DevTools') && 
                !text.startsWith('%c')) {
                console.log('[Consola] ' + text);
            }
        });
        
        // 1. AUTENTICACIÓN: Iniciamos sesión directamente en el frontend
        // No usamos fetch para evitar problemas de compatibilidad
        
        // 2. SEGUNDO: Iniciar sesión en el frontend también para garantizar cookies y estado visual
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
            
            // Capturar el token generado por el frontend
            authToken = await page.evaluate(() => {
                return localStorage.getItem('token') || 
                       localStorage.getItem('auth_token') || 
                       localStorage.getItem('accessToken');
            });
            
            if (authToken) {
                console.log('✅ Token capturado del localStorage');
            } else {
                console.log('❌ No se pudo obtener token de autenticación');
            }
            
            console.log('✅ Sesión iniciada correctamente');
            await tomarCaptura(page, 'after-login');
        } catch (loginError) {
            console.error('❌ Error al iniciar sesión en frontend: ' + loginError.message);
        }
        
        // Definir rutas a analizar - Organizadas por secciones
        const rutas = [
            // Panel de Control / Dashboard
            '/',
            '/dashboard',
            
            // Explotaciones
            '/explotaciones-react',
            
            // Gestión de Animales
            '/animals',
            '/animals/new',
            '/animals/3083',        // Detalle de animal (toro ID 3083)
            '/animals/3065',        // Detalle de animal (vaca ID 3065)
            '/animals/update/3083', // Formulario actualización de animal
            
            // Listados
            '/listados',
            
            // Importaciones
            '/imports',
            
            // Usuarios
            '/users',
            
            // Copias de Seguridad
            '/backup',
            
            // Sistema de Autenticación
            '/login',
            '/logout',
            
            // Perfil de Usuario
            '/profile',
            
            // Notificaciones/Alertas
            '/notifications',
            
            // Configuración
            '/settings',
            
            // Rutas Obsoletas
            '/explotacions',        // Versión obsoleta
            '/backups'              // Versión obsoleta
        ];
        
        // Estructura para almacenar información por sección
        const seccionesInfo = {};
        
        // Inicializar estructura de secciones
        SECTIONS_ORDER.forEach(section => {
            seccionesInfo[section.id] = {
                title: section.title,
                rutas: [],
                apiCalls: [],
                components: [],
                recursos: []
            };
        });
        
        // Rutas marcadas como obsoletas (a eliminar del sistema)
        const rutasObsoletas = APP_SECTIONS.OBSOLETE.routes;
        
        // Analizar cada ruta del frontend
        let totalApiCallsDetected = [];
        
        for (const ruta of rutas) {
            console.log(`\n📄 Analizando: ${baseUrl + ruta}`);
            
            // Antes de cada navegación, asegurarse que el token está en localStorage
            if (authToken) {
                await page.evaluate((token) => {
                    localStorage.setItem('token', token);
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('accessToken', token);
                    return true;
                }, authToken);
            }
            
            try {
                // Limpiar registro de llamadas API para esta ruta
                apiCalls.clear();
                
                // Navegar a la ruta con manejo especial para dashboard (doble navegación para garantizar hidratación)
                if (ruta === '/dashboard') {
                    console.log('\ud83d\udccc Tratamiento especial para Dashboard (doble navegación para hidratación)...');
                    // Primera visita para precarga
                    await page.goto(baseUrl + ruta, { waitUntil: 'networkidle0', timeout: 30000 });
                    await esperar(page, 5000); // Primera espera para hidratación inicial
                    
                    // Volver a la página principal y luego regresar al dashboard
                    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
                    await esperar(page, 2000);
                    
                    // Segunda visita para garantizar datos cargados
                    await page.goto(baseUrl + ruta, { waitUntil: 'networkidle0', timeout: 30000 });
                    await esperar(page, 5000); // Segunda espera extendida para hidratación completa
                } else {
                    // Navegación normal para otras rutas
                    await page.goto(baseUrl + ruta, { waitUntil: 'networkidle0', timeout: 30000 });
                    await esperar(page, 3000); // Tiempo para carga completa
                }
                
                // Capturar screenshot de la página
                await tomarCaptura(page, `pagina-${ruta.replace(/\//g, '-')}`);
                
                // Detectar scripts, estilos, enlaces y sources
                const pageData = await page.evaluate(() => {
                    // Scripts y sus sources
                    const scripts = Array.from(document.querySelectorAll('script'));
                    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                    const links = Array.from(document.querySelectorAll('a'));
                    
                    // Capturar información de sources de los elementos del DOM
                    const sourcesInfo = [];
                    const elementsWithSource = Array.from(document.querySelectorAll('[data-astro-source-file]'));
                    elementsWithSource.forEach(el => {
                        const sourceFile = el.getAttribute('data-astro-source-file') || '';
                        const sourceLoc = el.getAttribute('data-astro-source-loc') || '';
                        const componentName = el.getAttribute('data-component-name') || el.tagName;
                        const tagContent = el.outerHTML.substring(0, 100) + '...';
                        
                        // Solo incluir si tiene información relevante
                        if (sourceFile && sourceFile.includes('/src/')) {
                            sourcesInfo.push({
                                sourceFile: sourceFile,
                                sourceLoc: sourceLoc,
                                componentName: componentName,
                                tagPreview: tagContent.replace(/\s+/g, ' ').trim()
                            });
                        }
                    });
                    
                    // EXTRACCIÓN MEJORADA DE SOURCES: Capturar TODOS los recursos y archivos JS
                    const allSources = {};
                    
                    // 1. Extraer de los scripts en el DOM
                    scripts.forEach(script => {
                        if (script.src) {
                            const url = script.src;
                            allSources[url] = {
                                url,
                                type: 'script',
                                path: url.includes('/src/') ? url.split('/src/')[1] : url
                            };
                        }
                    });
                    
                    // 2. Extraer de la API de Performance
                    performance.getEntriesByType('resource').forEach(entry => {
                        const url = entry.name;
                        let type = entry.initiatorType;
                        
                        // Filtrar solo recursos relevantes
                        if (url.endsWith('.js') || url.endsWith('.jsx') || url.endsWith('.ts') || 
                            url.endsWith('.tsx') || url.endsWith('.css') || url.endsWith('.mjs') ||
                            url.includes('/src/') || url.includes('/components/') || type === 'script') {
                                
                            allSources[url] = {
                                url,
                                type,
                                size: entry.transferSize || 0,
                                path: url.includes('/src/') ? url.split('/src/')[1] : url
                            };
                        }
                    });
                    
                    // 3. Buscar módulos ES y workers en importmap, preloads y links
                    document.querySelectorAll('link[rel="modulepreload"], link[rel="preload"], script[type="importmap"]').forEach(el => {
                        if (el.href) {
                            allSources[el.href] = {
                                url: el.href,
                                type: 'preload',
                                path: el.href.includes('/src/') ? el.href.split('/src/')[1] : el.href
                            };
                        } else if (el.type === 'importmap') {
                            try {
                                const importMap = JSON.parse(el.textContent);
                                if (importMap && importMap.imports) {
                                    Object.values(importMap.imports).forEach(url => {
                                        allSources[url] = {
                                            url,
                                            type: 'importmap',
                                            path: url.includes('/src/') ? url.split('/src/')[1] : url
                                        };
                                    });
                                }
                            } catch(e) {}
                        }
                    });
                    
                    // 4. Detectar workers y serviceworkers
                    document.querySelectorAll('script').forEach(script => {
                        if (script.textContent) {
                            // Buscar patrones de creación de workers
                            const workerMatches = script.textContent.match(/new Worker\(['"]([^'"]+)['"]\)/g);
                            if (workerMatches) {
                                workerMatches.forEach(match => {
                                    const url = match.replace(/new Worker\(['"]([^'"]+)['"]\)/, '$1');
                                    allSources[url] = {
                                        url,
                                        type: 'worker',
                                        path: url.includes('/src/') ? url.split('/src/')[1] : url
                                    };
                                });
                            }
                        }
                    });
                    
                    // Network resources (filtrados para eliminar duplicados)
                    const resources = {};
                    performance.getEntriesByType('resource').forEach(entry => {
                        const url = entry.name;
                        const type = entry.initiatorType;
                        if (!resources[url]) {
                            resources[url] = {
                                url: url,
                                type: type,
                                size: entry.transferSize || 0,
                                duration: Math.round(entry.duration)
                            };
                        }
                    });
                    
                    // 5. Agrupar sources por carpetas
                    const sourcesBySection = {};
                    Object.values(allSources).forEach(source => {
                        let section = 'otros';
                        const url = source.url;
                        
                        // Determinar sección basada en patrones de URL
                        if (url.includes('/src/components/')) section = 'components';
                        else if (url.includes('/src/pages/')) section = 'pages';
                        else if (url.includes('/src/layouts/')) section = 'layouts';
                        else if (url.includes('/src/services/')) section = 'services';
                        else if (url.includes('/src/lib/')) section = 'lib';
                        else if (url.includes('/src/utils/')) section = 'utils';
                        else if (url.includes('/src/hooks/')) section = 'hooks';
                        else if (url.includes('/src/styles/')) section = 'styles';
                        else if (url.includes('/src/assets/')) section = 'assets';
                        else if (url.includes('/src/i18n/')) section = 'i18n';
                        else if (url.includes('/node_modules/')) section = 'node_modules';
                        else if (url.includes('/dist/')) section = 'dist';
                        else if (url.includes('/build/')) section = 'build';
                        
                        if (!sourcesBySection[section]) sourcesBySection[section] = [];
                        sourcesBySection[section].push(source);
                    });
                    
                    return {
                        scripts: scripts.map(s => s.src || 'inline'),
                        styles: styles.map(s => s.href),
                        links: links.map(a => ({ href: a.href, text: (a.textContent || '').trim() })),
                        title: document.title,
                        sources: sourcesInfo,
                        resources: Object.values(resources),
                        sourceFiles: sourcesBySection  // Añadir los sources agrupados por sección
                    };
                });
                
                // Capturar información del menú de navegación principal
                const navLinks = await page.evaluate(() => {
                    const navItems = Array.from(document.querySelectorAll('nav a'));
                    return navItems.map(link => ({
                        href: link.href,
                        text: link.textContent.trim(),
                        isActive: link.classList.contains('bg-primary-dark') || 
                                 link.classList.contains('active') || 
                                 link.getAttribute('aria-current') === 'page'
                    }));
                });
                
                // Buscar datos de rutas anidadas o subsecciones específicas
                const subsections = await page.evaluate(() => {
                    // Buscar pestañas, tabs o subsecciones
                    const tabs = Array.from(document.querySelectorAll('.tabs, [role="tablist"], .nav-tabs'));
                    const subsectionsData = [];
                    
                    tabs.forEach((tabContainer, index) => {
                        const tabItems = Array.from(tabContainer.querySelectorAll('[role="tab"], .tab, .nav-item'));
                        subsectionsData.push({
                            id: `tab-group-${index}`,
                            tabs: tabItems.map(tab => ({
                                text: tab.textContent.trim(),
                                active: tab.classList.contains('active') || 
                                        tab.getAttribute('aria-selected') === 'true'
                            }))
                        });
                    });
                    
                    return subsectionsData;
                });
                
                // Detectar elementos interactivos (botones, formularios, etc)
                console.log(`\n🔍 Detectando interacciones en: ${ruta}`);
                const interfaceElements = await page.evaluate(() => {
                    // Detectar botones y elementos interactivos
                    const buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]'));
                    const forms = Array.from(document.querySelectorAll('form'));
                    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
                    
                    return {
                        buttons: buttons.map(b => ({
                            text: (b.innerText || b.textContent || b.value || '').trim(),
                            id: b.id || 'sin id',
                            classes: b.className,
                            disabled: b.disabled || false
                        })),
                        forms: forms.map(f => ({
                            id: f.id || 'sin id',
                            action: f.action || '',
                            method: f.method || 'get'
                        })),
                        inputFields: inputs.length
                    };
                });
                
                // Mostrar botones detectados
                if (interfaceElements.buttons.length > 0) {
                    console.log('Botones detectados:');
                    for (const button of interfaceElements.buttons) {
                        console.log(`  🔘 Botón: ${button.text || '[Sin texto]'} (id: ${button.id})`);    
                    }
                } else {
                    console.log('  No se detectaron botones en esta ruta');
                }
                
                // Simular interacciones con algunos botones para detectar llamadas API
                if (interfaceElements.buttons.length > 0) {
                    console.log(`\n💻 Simulando clicks en botones...`);
                    
                    // Seleccionamos hasta 3 botones no desactivados para no hacer demasiadas pruebas
                    const buttonSample = interfaceElements.buttons
                        .filter(b => !b.disabled && b.text && 
                                 !b.text.toLowerCase().includes('cerrar') && 
                                 !b.text.toLowerCase().includes('cancelar'))
                        .slice(0, 3);
                    
                    for (const button of buttonSample) {
                        try {
                            console.log(`  👆 Simulando click en: ${button.text || button.id}`);
                            
                            // Intentar hacer click
                            if (button.id && button.id !== 'sin id') {
                                await page.click(`#${button.id}`);
                            } else {
                                await page.evaluate((btnText) => {
                                    const elements = Array.from(document.querySelectorAll('button, [role="button"], .btn'));
                                    const targetBtn = elements.find(el => (el.innerText || el.textContent || '').includes(btnText));
                                    if (targetBtn) targetBtn.click();
                                }, button.text);
                            }
                            
                            // Esperar a que se completen las peticiones
                            await esperar(page, 1500);
                            
                            // Capturar estado después del click
                            await tomarCaptura(page, `click-${ruta.replace(/\//g, '-')}-${button.text.replace(/[^a-z0-9]/gi, '-')}`);
                        } catch (e) {
                            console.log(`   ❌ Error al simular click: ${e.message}`);
                        }
                    }
                }
                
                // Recopilar todas las llamadas API capturadas
                const capturedCalls = Array.from(apiCalls);
                totalApiCallsDetected = [...totalApiCallsDetected, ...capturedCalls];
                
                // Mostrar llamadas API detectadas para esta ruta
                if (capturedCalls.length > 0) {
                    console.log(`\n🔎 Llamadas API detectadas en ${ruta}:`);
                    capturedCalls.forEach(call => console.log(`   • ${call}`));
                }
                
                // Determinar si la ruta es obsoleta y su categoría
                const esObsoleta = rutasObsoletas.includes(ruta);
                const categoriaRuta = clasificarRuta(ruta);
                
                console.log(`   🔖 Categoría detectada: ${categoriaRuta} (${APP_SECTIONS[categoriaRuta.toUpperCase()]?.title || 'Desconocida'})`); 
                
                // Detectar URLs en el código para análisis de despliegue (accediendo al DOM y scripts)
                const urlsDetectadas = await page.evaluate(() => {
                    const urlPatterns = [
                        /https?:\/\/(?:localhost|127\.0\.0\.1)(?::[0-9]+)?(\/[^\s"'`]*)?/g,  // URLs locales
                        /https?:\/\/[^\s"'`]*\.loca\.lt[^\s"'`]*/g,  // Localtunnel
                        /https?:\/\/[^\s"'`]*\.onrender\.com[^\s"'`]*/g,  // Render
                        /https?:\/\/[^\s"'`]*ngrok\.io[^\s"'`]*/g,  // Ngrok
                        /https?:\/\/172\.(?:\d{1,3}\.){2}\d{1,3}(?::[0-9]+)?(\/[^\s"'`]*)?/g  // IPs locales 172.x.x.x
                    ];

                    const detectarUrls = (contenido) => {
                        let urls = [];
                        if (!contenido) return urls;
                        
                        urlPatterns.forEach(pattern => {
                            const matches = contenido.match(pattern);
                            if (matches) urls = [...urls, ...matches];
                        });
                        
                        return urls;
                    };
                    
                    // Buscar en scripts inline
                    let urls = [];
                    document.querySelectorAll('script').forEach(script => {
                        if (script.textContent) {
                            urls = [...urls, ...detectarUrls(script.textContent)];
                        }
                    });
                    
                    // Buscar en atributos hardcodeados
                    document.querySelectorAll('[src], [href], [data-api], [data-url], [data-src], [data-href]').forEach(el => {
                        const attrs = [
                            el.getAttribute('src'), 
                            el.getAttribute('href'),
                            el.getAttribute('data-api'),
                            el.getAttribute('data-url'),
                            el.getAttribute('data-src'),
                            el.getAttribute('data-href')
                        ];
                        
                        attrs.forEach(attr => {
                            if (attr) urls = [...urls, ...detectarUrls(attr)];
                        });
                    });
                    
                    // Eliminar duplicados y retornar
                    return [...new Set(urls)];
                });
                
                // Almacenar información completa de la página con todos los datos recogidos
                rutasInfo[ruta] = {
                    titulo: pageData.title,
                    scripts: pageData.scripts,
                    estilos: pageData.styles,
                    enlaces: pageData.links,
                    navegacion: navLinks,          // Nueva info de navegación
                    subsecciones: subsections,     // Nueva info de subsecciones/tabs
                    esObsoleta: esObsoleta,        // Marcar si la ruta es obsoleta
                    seccion: categoriaRuta,        // Nueva: Categoría de la ruta
                    botones: interfaceElements.buttons,
                    formularios: interfaceElements.forms,
                    sources: pageData.sources || [],      // Archivos source y componentes
                    sourceFiles: pageData.sourceFiles || {}, // Sources agrupados por sección
                    recursos: pageData.resources || [],    // Recursos cargados (JS, CSS, etc),
                    urlsDespliegue: urlsDetectadas || [],  // URLs detectadas para análisis de despliegue
                    cargaOk: true
                };
                
                // Añadir las llamadas API a la información de ruta
                rutasInfo[ruta].apiCalls = capturedCalls;
                rutasInfo[ruta].apiCallCount = capturedCalls.length;
                rutasInfo[ruta].inputs = interfaceElements.inputFields;
                
                // Añadir información a la estructura de secciones
                if (seccionesInfo[categoriaRuta]) {
                    seccionesInfo[categoriaRuta].rutas.push(ruta);
                    seccionesInfo[categoriaRuta].apiCalls.push(...capturedCalls);
                    
                    // Agregar componentes detectados a la sección
                    if (pageData.sources && pageData.sources.length > 0) {
                        seccionesInfo[categoriaRuta].components.push(
                            ...pageData.sources
                                .filter(s => !seccionesInfo[categoriaRuta].components.some(c => c.sourceFile === s.sourceFile))
                        );
                    }
                    
                    // Agregar recursos detectados
                    if (pageData.resources && pageData.resources.length > 0) {
                        seccionesInfo[categoriaRuta].recursos.push(
                            ...pageData.resources
                                .filter(r => !seccionesInfo[categoriaRuta].recursos.some(ex => ex.url === r.url))
                        );
                    }
                }
                
                // Mapeo entre componentes y endpoints
                componentApiMapping[ruta] = capturedCalls.map(url => {
                    try {
                        const urlObj = new URL(url);
                        return {
                            fullUrl: url,
                            endpoint: urlObj.pathname,
                            method: 'GET' // Por defecto asumimos GET
                        };
                    } catch (e) {
                        return { fullUrl: url, endpoint: url, error: e.message };
                    }
                });
                
                console.log(`✅ Análisis completado para: ${ruta}`);
                console.log(`   - Scripts: ${rutasInfo[ruta].scripts ? rutasInfo[ruta].scripts.length : 0}`);
                console.log(`   - Estilos: ${rutasInfo[ruta].estilos ? rutasInfo[ruta].estilos.length : 0}`);
                console.log(`   - Enlaces: ${rutasInfo[ruta].enlaces ? rutasInfo[ruta].enlaces.length : 0}`);
                console.log(`   - Llamadas API: ${rutasInfo[ruta].apiCallCount || 0}`);
                
            } catch (navigationError) {
                console.error(`❌ Error al navegar a ${ruta}: ${navigationError.message}`);
                rutasInfo[ruta] = {
                    error: navigationError.message,
                    apiCalls: [],
                    apiCallCount: 0,
                    cargaOk: false
                };
            }
            
            await esperar(page, 1000);
        }
        
        // GENERACIÓN DE REPORTES
        console.log('\n📝 Generando reportes de análisis...');
        
        try {
            // 1. Generar informe de endpoints por componente
            const endpointReport = {};
            
            // Procesamiento de componentes y sus endpoints detectados
            for (const [ruta, endpoints] of Object.entries(componentApiMapping)) {
                if (endpoints && endpoints.length > 0) {
                    endpointReport[ruta] = endpoints.map(e => ({
                        path: e.endpoint,
                        fullUrl: e.fullUrl,
                        method: e.method
                    }));
                }
            }
            
            // Reporte completo en JSON
            fs.writeFileSync(
                path.join(outputDir, `analisis-navegador.json`),
                JSON.stringify({
                    rutas: rutasInfo,
                    timestamp: new Date().toISOString(),
                    rutasInfo,
                    componentApiMapping,
                    endpointReport,
                    totalApiCalls: totalApiCallsDetected.length,
                    uniqueApiEndpoints: [...new Set(totalApiCallsDetected.map(url => {
                        try {
                            const urlObj = new URL(url);
                            return urlObj.pathname;
                        } catch(e) {
                            return url;
                        }
                    }))]
                }, null, 2)
            );
            
            console.log('✅ Reporte JSON guardado');
            
            // 2. Generar informe en Markdown con estructura mejorada por secciones
            let markdownReport = `# Informe de Análisis de Estructura del Navegador (v4)

Fecha: ${new Date().toLocaleString()}

## Resumen

- **Rutas analizadas**: ${Object.keys(rutasInfo).length}
- **Total de endpoints API detectados**: ${totalApiCallsDetected.length}
- **Únicas rutas API detectadas**: ${[...new Set(totalApiCallsDetected.map(url => {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname;
    } catch(e) {
        return url;
    }
}))].length}
- **Rutas obsoletas detectadas**: ${rutasObsoletas.length}
- **Secciones identificadas**: ${SECTIONS_ORDER.filter(s => seccionesInfo[s.id].rutas.length > 0).length}

## Índice de Secciones

${SECTIONS_ORDER.map(section => 
    `- [${section.title}](#${section.id})`
).join('\n')}

`;
            
            // Generar informe por secciones siguiendo el orden establecido
            for (const section of SECTIONS_ORDER) {
                const sectionId = section.id;
                const sectionInfo = seccionesInfo[sectionId];
                
                // Si la sección no tiene rutas, omitirla (excepto obsoletas que queremos mantener)
                if (sectionInfo.rutas.length === 0 && sectionId !== 'obsolete') {
                    continue;
                }
                
                // Encabezado de la sección
                markdownReport += `## ${section.title} {#${sectionId}}
\n`;
                
                // Resumen de la sección
                const totalApis = new Set(sectionInfo.apiCalls).size;
                const totalComponents = sectionInfo.components.length;
                
                markdownReport += `**Resumen de la sección:**\n\n`;
                markdownReport += `- **Rutas**: ${sectionInfo.rutas.length}\n`;
                markdownReport += `- **Endpoints API**: ${totalApis}\n`;
                markdownReport += `- **Componentes detectados**: ${totalComponents}\n\n`;
                
                // Mostrar tabla resumen de endpoints si hay
                if (sectionInfo.apiCalls.length > 0) {
                    const uniqueEndpoints = [...new Set(sectionInfo.apiCalls.map(url => {
                        try {
                            return new URL(url).pathname;
                        } catch(e) {
                            return url;
                        }
                    }))];
                    
                    markdownReport += `### Endpoints API de ${section.title}\n\n`;
                    markdownReport += `| Endpoint | Uso |\n|---------|--------|\n`;
                    
                    uniqueEndpoints.forEach(endpoint => {
                        const count = sectionInfo.apiCalls.filter(url => url.includes(endpoint)).length;
                        markdownReport += `| \`${endpoint}\` | ${count} llamadas |\n`;
                    });
                    
                    markdownReport += `\n`;
                }
                
                // Detalle de cada ruta de la sección
                for (const ruta of sectionInfo.rutas) {
                    const data = rutasInfo[ruta];
                    
                    // Marcar si la ruta es obsoleta
                    if (data.esObsoleta) {
                        markdownReport += `### [OBSOLETA] ${data.titulo || ruta}\n\n⚠️ **Aviso**: Esta ruta está marcada como obsoleta y debería eliminarse.\n\n`;
                    } else {
                        markdownReport += `### ${data.titulo || ruta}\n\n`;
                    }
                    
                    if (!data.cargaOk) {
                        markdownReport += `❌ **Error**: ${data.error || 'Error de carga'}\n\n`;
                    } else {
                        markdownReport += `- **Scripts**: ${data.scripts ? data.scripts.length : 0}\n`;
                        markdownReport += `- **Estilos**: ${data.estilos ? data.estilos.length : 0}\n`;
                        markdownReport += `- **Enlaces**: ${data.enlaces ? data.enlaces.length : 0}\n`;
                        markdownReport += `- **Elementos interactivos**: ${data.botones ? data.botones.length : 0} botones, ${data.formularios ? data.formularios.length : 0} formularios\n`;
                        markdownReport += `- **Llamadas API**: ${data.apiCallCount || 0}\n`;
                        markdownReport += `- **Componentes sources detectados**: ${data.sources ? data.sources.length : 0}\n`;
                        markdownReport += `- **Recursos de red cargados**: ${data.resources ? data.resources.length : 0}\n\n`;
                        
                        // Si hay llamadas API, mostrarlas
                        if (data.apiCalls && data.apiCalls.length > 0) {
                            markdownReport += '#### Endpoints detectados:\n\n';
                            data.apiCalls.forEach(call => {
                                try {
                                    const urlObj = new URL(call);
                                    markdownReport += `- \`${urlObj.pathname}\`\n`;
                                } catch(e) {
                                    markdownReport += `- \`${call}\`\n`;
                                }
                            });
                            markdownReport += '\n';
                        }
                    }
                    
                    // Mostrar información detallada de los sources detectados
                    if (data.sources && data.sources.length > 0) {
                        markdownReport += '#### Componentes y archivos fuente:\n\n';
                        markdownReport += '| Archivo fuente | Componente | Ubicación |\n';
                        markdownReport += '|---------------|-----------|-----------|\n';
                        
                        // Limitar a 15 sources más relevantes para no sobrecargar el informe
                        const relevantSources = data.sources
                            .filter(s => s.sourceFile.includes('/src/components/') || 
                                        s.sourceFile.includes('/src/pages/') || 
                                        s.sourceFile.includes('/src/layouts/'))
                            .slice(0, 15);
                            
                        relevantSources.forEach(source => {
                            const shortPath = source.sourceFile.split('/').slice(-3).join('/');
                            markdownReport += `| ${shortPath} | ${source.componentName} | ${source.sourceLoc} |\n`;
                        });
                        
                        if (data.sources.length > relevantSources.length) {
                            markdownReport += `\n**Nota**: Se muestran ${relevantSources.length} de ${data.sources.length} componentes detectados.\n`;
                        }
                        markdownReport += '\n';
                    }
                    
                    // LISTADO COMPLETO DE ARCHIVOS FUENTE AGRUPADOS POR SECCIÓN (IMPORTANTE PARA DESPLIEGUE)
                    if (data.sourceFiles && Object.keys(data.sourceFiles).length > 0) {
                        markdownReport += '#### Listado completo de archivos por sección\n\n';
                        markdownReport += 'Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.\n\n';
                        
                        // Priorizar secciones más importantes
                        const sectionOrder = [
                            'components', 'pages', 'layouts', 'services', 'lib', 
                            'utils', 'hooks', 'styles', 'assets', 'i18n', 'dist', 
                            'build', 'node_modules', 'otros'
                        ];
                        
                        // Ordenar las secciones según la prioridad
                        const orderedSections = Object.keys(data.sourceFiles)
                            .sort((a, b) => {
                                const indexA = sectionOrder.indexOf(a);
                                const indexB = sectionOrder.indexOf(b);
                                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                            });
                        
                        // Mostrar cada sección con sus archivos
                        for (const section of orderedSections) {
                            const files = data.sourceFiles[section];
                            if (!files || files.length === 0) continue;
                            
                            markdownReport += `##### Sección: ${section}\n\n`;
                            markdownReport += '```\n';
                            
                            // Mostrar hasta 50 archivos por sección (para no hacer el informe demasiado grande)
                            const displayFiles = files.slice(0, 50);
                            displayFiles.forEach(file => {
                                const path = file.path || file.url.split('/').slice(-3).join('/');
                                markdownReport += `${path}\n`;
                            });
                            
                            if (files.length > displayFiles.length) {
                                markdownReport += `... (${files.length - displayFiles.length} archivos más)\n`;
                            }
                            
                            markdownReport += '```\n\n';
                        }
                    }
                    
                    // Mostrar información sobre los enlaces de navegación detectados
                    if (data.navegacion && data.navegacion.length > 0) {
                        markdownReport += '#### Enlaces de navegación detectados:\n\n';
                        data.navegacion.forEach(link => {
                            const activeMarker = link.isActive ? ' 🟢 (activo)' : '';
                            const url = link.href.replace(baseUrl, '');
                            markdownReport += `- ${link.text} → \`${url}\`${activeMarker}\n`;
                        });
                        markdownReport += '\n';
                    }
                    
                    // Mostrar información sobre subsecciones/tabs si existen
                    if (data.subsecciones && data.subsecciones.length > 0) {
                        markdownReport += '#### Subsecciones y pestañas:\n\n';
                        data.subsecciones.forEach(subsection => {
                            markdownReport += `- Grupo: ${subsection.id}\n`;
                            subsection.tabs.forEach(tab => {
                                const activeMarker = tab.active ? ' 🟢 (activa)' : '';
                                markdownReport += `  - ${tab.text}${activeMarker}\n`;
                            });
                        });
                        markdownReport += '\n';
                    }
                }
            }
            
            // Sección de resumen de rutas obsoletas
            const rutasObsoletasDetectadas = Object.entries(rutasInfo)
                .filter(([_, data]) => data.esObsoleta)
                .map(([ruta, _]) => ruta);
            
            if (rutasObsoletasDetectadas.length > 0) {
                markdownReport += `## Rutas obsoletas detectadas

Las siguientes rutas están marcadas como obsoletas y deberían ser revisadas para su eliminación:

| Ruta Obsoleta | Recomendación | Ruta Actualizada |
|---------------|---------------|-----------------|
`;
                
                // Mapear rutas obsoletas con sus sustitutos recomendados
                const rutasSustitutos = {
                    '/explotacions': '/explotaciones-react',
                    '/backups': '/backup'
                };
                
                rutasObsoletasDetectadas.forEach(ruta => {
                    const rutaSustituta = rutasSustitutos[ruta] || 'No disponible';
                    markdownReport += `| \`${ruta}\` | Eliminar y actualizar referencias | \`${rutaSustituta}\` |\n`;
                });
                
                markdownReport += `
### Recomendaciones para rutas obsoletas

1. Verificar si existen llamadas a estas rutas desde otros componentes
2. Asegurar que todas las funcionalidades han sido migradas a las nuevas rutas
3. Eliminar las rutas obsoletas del código y de la configuración
4. Actualizar documentación y referencias

`;
            }
            
            // 4. Análisis completo de URLs para despliegue
            markdownReport += '\n## Análisis Completo de URLs para Despliegue en AWS Amplify\n\n';
            markdownReport += 'Este análisis detecta URLs hardcodeadas, referencias locales y variables de entorno necesarias.\n\n';
            
            // Recopilar todas las URLs detectadas de todas las rutas
            const todasUrlsDespliegue = [];
            for (const [ruta, data] of Object.entries(rutasInfo)) {
                if (data.urlsDespliegue && data.urlsDespliegue.length > 0) {
                    todasUrlsDespliegue.push(...data.urlsDespliegue);
                }
            }
            
            // Eliminar duplicados
            const urlsUnicas = [...new Set(todasUrlsDespliegue)];
            
            // Clasificar las URLs por tipo
            const urlsClasificadas = {
                local: [],
                tunnel: [],
                rendercom: [],
                ip: [],
                otras: []
            };
            
            urlsUnicas.forEach(url => {
                if (url.includes('localhost') || url.includes('127.0.0.1')) {
                    urlsClasificadas.local.push(url);
                } else if (url.includes('.loca.lt') || url.includes('ngrok.io')) {
                    urlsClasificadas.tunnel.push(url);
                } else if (url.includes('.onrender.com')) {
                    urlsClasificadas.rendercom.push(url);
                } else if (url.match(/^https?:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
                    urlsClasificadas.ip.push(url);
                } else {
                    urlsClasificadas.otras.push(url);
                }
            });
            
            markdownReport += '### URLs de desarrollo local\n\nEstas URLs deberán ser reemplazadas por variables de entorno en el despliegue:\n\n';
            
            if (urlsClasificadas.local.length > 0) {
                markdownReport += '| URL Local | Recomendación para Amplify |\n|-----------|-------------------------|\n';
                urlsClasificadas.local.forEach(url => {
                    markdownReport += `| \`${url}\` | Reemplazar por variable de entorno \`${url.includes('8000') ? 'REACT_APP_API_URL' : 'REACT_APP_FRONTEND_URL'}\` |\n`;
                });
            } else {
                markdownReport += '*No se detectaron URLs locales.*\n\n';
            }
            
            markdownReport += '\n### URLs de túneles locales\n\nEstas URLs deben ser eliminadas o reemplazadas:\n\n';
            
            if (urlsClasificadas.tunnel.length > 0) {
                markdownReport += '| URL Túnel | Recomendación |\n|-----------|--------------|\n';
                urlsClasificadas.tunnel.forEach(url => {
                    markdownReport += `| \`${url}\` | Reemplazar por variable de entorno \`REACT_APP_API_URL\` |\n`;
                });
            } else {
                markdownReport += '*No se detectaron URLs de túneles locales.*\n\n';
            }
            
            markdownReport += '\n### URLs de render.com\n\nEstas URLs deben ser actualizadas para producción:\n\n';
            
            if (urlsClasificadas.rendercom.length > 0) {
                markdownReport += '| URL Render | Recomendación |\n|-----------|--------------|\n';
                urlsClasificadas.rendercom.forEach(url => {
                    markdownReport += `| \`${url}\` | Revisar si debe mantenerse en producción o sustituirse por AWS |\n`;
                });
            } else {
                markdownReport += '*No se detectaron URLs de render.com.*\n\n';
            }
            
            markdownReport += '\n### URLs con IPs locales\n\nEstas URLs deben ser reemplazadas:\n\n';
            
            if (urlsClasificadas.ip.length > 0) {
                markdownReport += '| URL IP | Recomendación |\n|--------|--------------|\n';
                urlsClasificadas.ip.forEach(url => {
                    markdownReport += `| \`${url}\` | Reemplazar por variable de entorno (\`${url.includes('8000') ? 'REACT_APP_API_URL' : 'REACT_APP_FRONTEND_URL'}\`) |\n`;
                });
            } else {
                markdownReport += '*No se detectaron URLs con IPs locales.*\n\n';
            }
            
            markdownReport += '\n### Variables de Entorno por Entorno de Despliegue\n\n';
            markdownReport += `| Entorno | Variable | Valor Recomendado | Descripción |
|---------|---------|-----------------|-------------|
| Local | REACT_APP_API_URL | http://localhost:8000 | URL de la API local |
| Local | REACT_APP_FRONTEND_URL | http://localhost:4321 | URL del frontend local |
| EC2 Testing | REACT_APP_API_URL | https://api-test.mascletimperi.com | URL de la API en entorno de pruebas |
| EC2 Testing | REACT_APP_FRONTEND_URL | https://test.mascletimperi.com | URL del frontend en pruebas |
| AWS Amplify | REACT_APP_API_URL | https://api.mascletimperi.com | URL de la API en producción |
| AWS Amplify | REACT_APP_FRONTEND_URL | https://app.mascletimperi.com | URL del frontend en producción |
| AWS Amplify | NODE_VERSION | 16 | Versión de Node.js para construir la aplicación |
`;
            
            markdownReport += '\n### Recomendaciones para Amplify\n\n';
            markdownReport += `- **Archivos de configuración para Amplify**:
  - Crear archivo \`amplify.yml\` en la raíz del proyecto con la configuración de build
  - Definir scripts de build que incluyan la generación de assets estáticos
- **Variables de entorno requeridas**:
  - \`REACT_APP_API_URL\`: URL base de la API en AWS (Ej: https://api.mascletimperi.com)
  - \`REACT_APP_FRONTEND_URL\`: URL base del frontend en AWS Amplify
- **Redirecciones necesarias**: 
  - Configurar redirección de todas las rutas a index.html para SPA
  - Crear archivo \`_redirects\` o configurar en la consola de Amplify
- **Configuración CORS**: 
  - Asegurar que la API EC2 acepta peticiones del dominio de Amplify
  - Configurar los headers permitidos en el backend

### Archivos de Configuración Recomendados

Ejemplo de archivo amplify.yml:

\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
\`\`\`

Ejemplo de archivo _redirects:

\`\`\`
/* /index.html 200
\`\`\`

`;
            
            // 5. Añadir mapa de endpoints más utilizados
            markdownReport += `## Endpoints más utilizados

`;
            
            const endpointCounter = {};
            totalApiCallsDetected.forEach(url => {
                try {
                    const urlObj = new URL(url);
                    const path = urlObj.pathname;
                    endpointCounter[path] = (endpointCounter[path] || 0) + 1;
                } catch(e) {
                    // Ignorar URLs inválidas
                }
            });
            
            // Ordenar por frecuencia
            const sortedEndpoints = Object.entries(endpointCounter)
                .sort((a, b) => b[1] - a[1]) // Ordenar por frecuencia descendente
                .slice(0, 20);  // Mostrar los 20 más utilizados
            
            if (sortedEndpoints.length > 0) {
                markdownReport += '| Endpoint | Frecuencia |\n| -------- | ----------- |\n';
                sortedEndpoints.forEach(([endpoint, count]) => {
                    markdownReport += `| \`${endpoint}\` | ${count} |\n`;
                });
            } else {
                markdownReport += '*No se detectaron endpoints.*\n';
            }
            
            // Generar un informe en Markdown más legible
            const markdownFilename = path.join(outputDir, `analisis-navegador.md`);
            fs.writeFileSync(markdownFilename, markdownReport);
            
            // Crear un archivo README.md con información sobre esta ejecución
            const readmeContent = `# Informe de Análisis de Navegación Web

## Detalles de la ejecución

- **Fecha y hora**: ${new Date().toLocaleString()}
- **URL base analizada**: ${baseUrl}
- **API base**: ${apiUrl}
- **Rutas analizadas**: ${rutas.length}
- **Rutas obsoletas detectadas**: ${rutasObsoletas.length}
- **Llamadas API detectadas**: ${totalApiCallsDetected.length}

## Archivos generados

- [Informe detallado en Markdown](./analisis-navegador.md)
- [Datos completos en JSON](./analisis-navegador.json)
- [Capturas de pantalla](./screenshots/)

## Resumen

Este análisis ha sido generado automáticamente mediante el script de análisis de navegador con Puppeteer.
`;
            
            fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
            
            console.log('\u2705 Reporte JSON guardado');
            console.log('\u2705 Informe Markdown generado');
            console.log('\u2705 Archivo README.md creado');
            console.log('\n\ud83c\udf89 Análisis completado con éxito. Resultados guardados en:', outputDir);
        } catch (reportError) {
            console.error('\u274c Error al generar reportes:', reportError);
        }
        
        // Cerrar el navegador
        await browser.close();
    } catch (error) {
        console.error('\u274c Error general:', error);
    }
}

// Ejecutar la función principal
analizarEstructura().catch(error => {
    console.error('\u274c Error en el análisis:', error);
});
