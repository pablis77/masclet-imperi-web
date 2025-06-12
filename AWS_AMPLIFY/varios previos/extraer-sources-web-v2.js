/**
 * Script mejorado para extraer recursos del navegador de Masclet Imperi Web v2
 * Este script conecta con la webapp, navega por todas las secciones principales
 * y extrae recursos organizados por sección funcional
 * 
 * - Dashboard
 * - Explotaciones
 * - Animales
 * - Listados
 * - Importaciones
 * - Usuarios
 * - Copias de seguridad
 * - Auth / Login
 * - Perfil de Usuario
 * - Notificaciones
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Rutas principales a analizar
const RUTAS_PRINCIPALES = [
    { path: '/', name: 'Dashboard', description: 'Panel de control principal' },
    { path: '/dashboard', name: 'Dashboard Alternativo', description: 'Panel de control alternativo' },
    { path: '/explotaciones-react', name: 'Explotaciones', description: 'Gestión de explotaciones' },
    { path: '/animals', name: 'Animales', description: 'Gestión de animales' },
    { path: '/animals/new', name: 'Nuevo Animal', description: 'Creación de animales' },
    { path: '/listados', name: 'Listados', description: 'Informes y listados' },
    { path: '/imports', name: 'Importaciones', description: 'Sistema de importación de datos' },
    { path: '/users', name: 'Usuarios', description: 'Gestión de usuarios y permisos' },
    { path: '/backup', name: 'Copias de seguridad', description: 'Gestión de backups' },
    { path: '/profile', name: 'Perfil', description: 'Perfil de usuario' },
    { path: '/notifications', name: 'Notificaciones', description: 'Sistema de alertas' },
    { path: '/login', name: 'Login', description: 'Autenticación' }
];

// Estructura para el informe final
const informeEstructura = {
    general: {
        timestamp: new Date().toISOString(),
        fecha: new Date().toLocaleString('es-ES'),
        baseUrl: 'http://localhost:3000'
    },
    secciones: {}
};

async function extraerRecursosWeb(url = 'http://localhost:3000') {
    console.log(`🔍 Iniciando extracción de recursos desde: ${url}`);
    
    // Crear directorio para resultados
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join(__dirname, 'output-sources-web', `run-${timestamp}`);
    
    // Directorio específico para cada sección
    const seccionesDir = path.join(outputDir, 'secciones');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(seccionesDir)) {
        fs.mkdirSync(seccionesDir, { recursive: true });
    }
    
    console.log(`📂 Resultados se guardarán en: ${outputDir}`);
    
    // Información global del proyecto
    const infoGlobal = {
        baseUrl: url,
        timestamp: new Date().toISOString(),
        fecha: new Date().toLocaleString('es-ES'),
        seccionesAnalizadas: []
    };
    
    // Iniciar navegador
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-web-security', '--window-size=1920,1080'],
        defaultViewport: null
    });
    
    try {
        const page = await browser.newPage();
        
        // Interceptar todas las peticiones de red
        const resources = {};
        
        // Capturar todas las respuestas
        page.on('response', async (response) => {
            const url = response.url();
            
            // Ignorar peticiones a recursos de extensiones o debugger
            if (url.startsWith('chrome-extension://') || url.startsWith('devtools://')) {
                return;
            }
            
            try {
                let type = 'unknown';
                let extension = 'txt';
                
                // Intentar determinar el tipo basado en headers y URL
                const contentType = response.headers()['content-type'] || '';
                
                if (contentType.includes('javascript')) {
                    type = 'js';
                    extension = 'js';
                } else if (contentType.includes('css')) {
                    type = 'css';
                    extension = 'css';
                } else if (contentType.includes('html')) {
                    type = 'html';
                    extension = 'html';
                } else if (contentType.includes('json')) {
                    type = 'json';
                    extension = 'json';
                } else if (contentType.includes('image')) {
                    type = 'image';
                    if (contentType.includes('png')) extension = 'png';
                    else if (contentType.includes('jpg') || contentType.includes('jpeg')) extension = 'jpg';
                    else if (contentType.includes('svg')) extension = 'svg';
                    else extension = 'img';
                }
                
                // También inferir de la URL si no se pudo determinar por content-type
                if (type === 'unknown') {
                    if (url.endsWith('.js')) {
                        type = 'js';
                        extension = 'js';
                    } else if (url.endsWith('.css')) {
                        type = 'css';
                        extension = 'css';
                    } else if (url.endsWith('.html')) {
                        type = 'html';
                        extension = 'html';
                    } else if (url.endsWith('.json')) {
                        type = 'json';
                        extension = 'json';
                    }
                }
                
                // Solo procesar tipos de recursos de interés (text/code)
                if (['js', 'css', 'html', 'json'].includes(type)) {
                    // Ignorar errores 404 y similares
                    if (response.ok()) {
                        try {
                            const content = await response.text();
                            
                            // Generar un nombre de archivo seguro basado en la URL
                            let fileName = url
                                .replace(/https?:\/\//, '')
                                .replace(/[^a-z0-9]/gi, '_')
                                .substring(0, 100);
                                
                            if (fileName.length > 100) {
                                fileName = fileName.substring(0, 100);
                            }
                            
                            resources[url] = {
                                type,
                                fileName: `${fileName}.${extension}`,
                                content,
                                contentType,
                                status: response.status()
                            };
                        } catch (err) {
                            // Ignorar errores al obtener texto (como recursos binarios)
                        }
                    }
                }
            } catch (err) {
                console.log(`⚠️ Error procesando respuesta de ${url}: ${err.message}`);
            }
        });
        
        // Capturar console.logs
        page.on('console', message => {
            const type = message.type();
            console.log(`[Navegador ${type}] ${message.text()}`);
        });
        
        // Navegar a la aplicación
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log('🔑 Intentando iniciar sesión si es necesario...');
        
        // Comprobar si estamos en una página de login
        const loginForm = await page.evaluate(() => {
            const usernameInput = document.querySelector('input[type="text"]');
            const passwordInput = document.querySelector('input[type="password"]');
            const submitButton = document.querySelector('button[type="submit"]');
            return !!(usernameInput && passwordInput && submitButton);
        });
        
        if (loginForm) {
            console.log('🔐 Detectado formulario de login, iniciando sesión...');
            await page.type('input[type="text"]', 'admin');
            await page.type('input[type="password"]', 'admin123');
            
            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation({ waitUntil: 'networkidle2' })
            ]);
            
            console.log('✅ Sesión iniciada correctamente');
        }
        
        // Esperar un poco para que se carguen recursos adicionales
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Función para analizar una sección específica
        async function analizarSeccion(rutaConfig) {
            console.log(`\n🧐 Analizando sección: ${rutaConfig.name} (${rutaConfig.path})`);
            
            // Navegar a la ruta
            await page.goto(url + rutaConfig.path, { waitUntil: 'networkidle2', timeout: 60000 });
            
            // Esperar a que se cargue el contenido
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Capturar screenshot de la sección
            const seccionDir = path.join(seccionesDir, rutaConfig.name.toLowerCase().replace(/ /g, '-'));
            
            if (!fs.existsSync(seccionDir)) {
                fs.mkdirSync(seccionDir, { recursive: true });
            }
            
            await page.screenshot({ 
                path: path.join(seccionDir, 'screenshot.png'),
                fullPage: true
            });
            
            // Inyectar código para detección de fuentes y componentes
            await page.evaluate(() => {
                // Función para registrar endpoints detectados
                window.allEndpointsDetected = window.allEndpointsDetected || [];
                
                // Interceptar fetch y XMLHttpRequest para detectar endpoints
                const originalFetch = window.fetch;
                window.fetch = function() {
                    const url = arguments[0];
                    if (typeof url === 'string' && url.includes('/api/')) {
                        const method = arguments[1]?.method || 'GET';
                        window.allEndpointsDetected.push({
                            ruta: url,
                            metodo: method
                        });
                    }
                    return originalFetch.apply(this, arguments);
                };
                
                // Función para extraer estructura componentes React
                window.extractReactComponents = function() {
                    const components = [];
                    const reactElements = document.querySelectorAll('[data-reactroot], [data-reactid]');
                    
                    if (reactElements.length === 0) {
                        // Intentar detectar por nombres de clase típicos de componentes React
                        document.querySelectorAll('*').forEach(el => {
                            const classNames = Array.from(el.classList || []);
                            if (classNames.some(c => c.includes('react-') || c.includes('-component'))) {
                                components.push({
                                    tipo: 'react-component',
                                    nombre: el.tagName.toLowerCase(),
                                    id: el.id || null,
                                    clases: classNames
                                });
                            }
                        });
                    } else {
                        reactElements.forEach(el => {
                            components.push({
                                tipo: 'react-component',
                                nombre: el.tagName.toLowerCase(),
                                id: el.id || null,
                                clases: Array.from(el.classList || [])
                            });
                        });
                    }
                    
                    return components;
                };
            });
            
            // Extraer recursos específicos de la sección
            const seccionRecursos = await page.evaluate((seccionName) => {
                // Detectar componentes React si es posible
                let reactComponents = [];
                try {
                    if (typeof window.extractReactComponents === 'function') {
                        reactComponents = window.extractReactComponents();
                    }
                } catch (e) {
                    console.error('Error al extraer componentes React:', e);
                }
                
                // Detectar si hay source maps disponibles
                const sourceMaps = Array.from(document.querySelectorAll('script[src]'))
                    .filter(s => s.src.includes('.map'))
                    .map(s => s.src);
                
                return {
                    nombre: seccionName,
                    titulo: document.title,
                    url: window.location.href,
                    scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
                    estilos: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(s => s.href),
                    componentes: Array.from(document.querySelectorAll('[id]')).map(el => ({
                        id: el.id,
                        tipo: el.tagName.toLowerCase(),
                        clases: Array.from(el.classList || [])
                    })),
                    reactComponents: reactComponents,
                    sourceMaps: sourceMaps,
                    endpoints: window.allEndpointsDetected || []
                };
            }, rutaConfig.name);
            
            // Guardar resultados de la sección
            fs.writeFileSync(
                path.join(seccionDir, 'datos.json'),
                JSON.stringify(seccionRecursos, null, 2)
            );
            
            return seccionRecursos;
        }
        
        // Navegar por todas las secciones principales
        console.log('🧭 Iniciando navegación por todas las secciones...');
        
        for (const rutaConfig of RUTAS_PRINCIPALES) {
            try {
                const datosSeccion = await analizarSeccion(rutaConfig);
                infoGlobal.seccionesAnalizadas.push(datosSeccion);
            } catch (error) {
                console.error(`❌ Error analizando sección ${rutaConfig.name}: ${error.message}`);
            }
        }
        
        // Extraer scripts, estilos y otros elementos del DOM actual
        console.log('📊 Analizando elementos del DOM...');
        
        const domResources = await page.evaluate(() => {
            const result = {
                scripts: [],
                styles: [],
                links: [],
                images: []
            };
            
            // Extraer scripts
            document.querySelectorAll('script').forEach(script => {
                if (script.src) {
                    result.scripts.push({
                        url: script.src,
                        type: script.type || 'text/javascript',
                        async: script.async,
                        defer: script.defer
                    });
                } else if (script.textContent) {
                    result.scripts.push({
                        inline: true,
                        content: script.textContent,
                        type: script.type || 'text/javascript'
                    });
                }
            });
            
            // Extraer estilos
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                result.styles.push({
                    url: link.href,
                    type: 'text/css'
                });
            });
            
            document.querySelectorAll('style').forEach(style => {
                result.styles.push({
                    inline: true,
                    content: style.textContent,
                    type: 'text/css'
                });
            });
            
            // Extraer enlaces
            document.querySelectorAll('a').forEach(a => {
                if (a.href) {
                    result.links.push({
                        url: a.href,
                        text: a.textContent.trim(),
                        isNavigation: !a.target || a.target !== '_blank'
                    });
                }
            });
            
            // Extraer imágenes
            document.querySelectorAll('img').forEach(img => {
                if (img.src) {
                    result.images.push({
                        url: img.src,
                        alt: img.alt,
                        width: img.width,
                        height: img.height
                    });
                }
            });
            
            return result;
        });
        
        console.log(`📄 Recursos extraídos: ${Object.keys(resources).length}`);
        console.log(`- Scripts: ${domResources.scripts.length}`);
        console.log(`- Estilos: ${domResources.styles.length}`);
        console.log(`- Enlaces: ${domResources.links.length}`);
        
        // Capturar screenshot de la página principal
        await page.screenshot({ 
            path: path.join(outputDir, 'screenshot.png'),
            fullPage: true
        });
        
        // Guardar recursos extraídos
        console.log('💾 Guardando recursos...');
        
        // Crear subdirectorios por tipo
        const jsDir = path.join(outputDir, 'js');
        const cssDir = path.join(outputDir, 'css');
        const htmlDir = path.join(outputDir, 'html');
        const jsonDir = path.join(outputDir, 'json');
        
        fs.mkdirSync(jsDir, { recursive: true });
        fs.mkdirSync(cssDir, { recursive: true });
        fs.mkdirSync(htmlDir, { recursive: true });
        fs.mkdirSync(jsonDir, { recursive: true });
        
        // Guardar recursos por tipo
        for (const [url, resource] of Object.entries(resources)) {
            try {
                let targetDir = outputDir;
                switch (resource.type) {
                    case 'js': targetDir = jsDir; break;
                    case 'css': targetDir = cssDir; break;
                    case 'html': targetDir = htmlDir; break;
                    case 'json': targetDir = jsonDir; break;
                }
                
                fs.writeFileSync(
                    path.join(targetDir, resource.fileName),
                    resource.content
                );
            } catch (err) {
                console.log(`⚠️ Error guardando ${url}: ${err.message}`);
            }
        }
        
        // Guardar scripts inline
        domResources.scripts
            .filter(script => script.inline && script.content)
            .forEach((script, index) => {
                try {
                    fs.writeFileSync(
                        path.join(jsDir, `inline_script_${index}.js`),
                        script.content
                    );
                } catch (err) {
                    console.log(`⚠️ Error guardando script inline ${index}: ${err.message}`);
                }
            });
        
        // Guardar estilos inline
        domResources.styles
            .filter(style => style.inline && style.content)
            .forEach((style, index) => {
                try {
                    fs.writeFileSync(
                        path.join(cssDir, `inline_style_${index}.css`),
                        style.content
                    );
                } catch (err) {
                    console.log(`⚠️ Error guardando estilo inline ${index}: ${err.message}`);
                }
            });
        
        // Crear informe JSON
        const report = {
            url,
            timestamp: new Date().toISOString(),
            stats: {
                resourceCount: Object.keys(resources).length,
                scriptCount: domResources.scripts.length,
                styleCount: domResources.styles.length,
                linkCount: domResources.links.length,
                imageCount: domResources.images.length
            },
            resourcesByType: {
                js: Object.values(resources).filter(r => r.type === 'js').map(r => r.fileName),
                css: Object.values(resources).filter(r => r.type === 'css').map(r => r.fileName),
                html: Object.values(resources).filter(r => r.type === 'html').map(r => r.fileName),
                json: Object.values(resources).filter(r => r.type === 'json').map(r => r.fileName)
            },
            domResources: domResources
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Crear informe Markdown estructurado por secciones
        let markdown = `# Informe de Recursos Web por Secciones\n\n`;
        markdown += `**URL Base**: ${url}\n`;
        markdown += `**Fecha**: ${new Date().toLocaleString('es-ES')}\n\n`;
        
        markdown += `## Resumen Global\n\n`;
        markdown += `- **Recursos Totales**: ${Object.keys(resources).length}\n`;
        markdown += `- **Scripts**: ${domResources.scripts.length}\n`;
        markdown += `- **Estilos**: ${domResources.styles.length}\n`;
        markdown += `- **Enlaces**: ${domResources.links.length}\n`;
        markdown += `- **Imágenes**: ${domResources.images.length}\n`;
        markdown += `- **Secciones Analizadas**: ${infoGlobal.seccionesAnalizadas.length}\n\n`;
        
        // Agregar resumen por cada sección analizada
        markdown += `## Secciones Analizadas\n\n`;
        
        infoGlobal.seccionesAnalizadas.forEach(seccion => {
            markdown += `### ${seccion.nombre}\n\n`;
            markdown += `- **URL**: ${seccion.url}\n`;
            markdown += `- **Título**: ${seccion.titulo}\n\n`;
            
            // Componentes de la sección
            markdown += `#### Componentes\n\n`;
            markdown += `| # | ID | Tipo | Clases |\n`;
            markdown += `|---|----|----|-------|\n`;
            
            // Limitar a los 15 componentes más relevantes para no saturar el informe
            const componentesRelevantes = seccion.componentes
                .filter(c => c.id && c.id.length > 0)
                .slice(0, 15);
                
            componentesRelevantes.forEach((comp, idx) => {
                markdown += `| ${idx + 1} | ${comp.id} | ${comp.tipo} | ${comp.clases.join(' ')} |\n`;
            });
            
            // Scripts específicos
            if (seccion.scripts && seccion.scripts.length > 0) {
                markdown += `\n#### Scripts\n\n`;
                markdown += `- ${seccion.scripts.filter(s => !s.includes('vite')).length} scripts cargados\n`;
                
                // Mostrar solo scripts relevantes (no de desarrollo)
                const scriptsRelevantes = seccion.scripts
                    .filter(s => !s.includes('vite') && !s.includes('node_modules'))
                    .slice(0, 5);
                    
                if (scriptsRelevantes.length > 0) {
                    markdown += `- Ejemplos:\n`;
                    scriptsRelevantes.forEach(s => {
                        markdown += `  - ${s}\n`;
                    });
                }
            }
            
            // Endpoints detectados
            if (seccion.endpoints && seccion.endpoints.length > 0) {
                markdown += `\n#### Endpoints API\n\n`;
                markdown += `| Método | Ruta |\n`;
                markdown += `|--------|------|\n`;
                seccion.endpoints.forEach(ep => {
                    markdown += `| ${ep.metodo || 'GET'} | ${ep.ruta} |\n`;
                });
            }
            
            markdown += `\n---\n\n`;
        });
        
        // Agregar tablas de recursos globales
        markdown += `## Recursos Globales\n\n`;
        
        markdown += `### Scripts\n\n`;
        markdown += `| # | Tipo | Origen | URL |\n`;
        markdown += `|---|------|--------|-----|\n`;
        
        // Filtrar scripts duplicados por URL
        const scriptsUnicos = Array.from(new Map(domResources.scripts
            .filter(s => !s.inline)
            .map(s => [s.url, s])).values());
            
        scriptsUnicos.forEach((script, index) => {
            const tipo = script.type || 'text/javascript';
            const origen = script.inline ? 'Inline' : 'Externo';
            const scriptUrl = script.inline ? '(código embebido)' : script.url;
            
            markdown += `| ${index + 1} | ${tipo} | ${origen} | ${scriptUrl} |\n`;
        });
        
        markdown += `\n### Estilos\n\n`;
        markdown += `| # | Origen | URL |\n`;
        markdown += `|---|--------|-----|\n`;
        
        // Filtrar estilos duplicados
        const estilosUnicos = Array.from(new Map(domResources.styles
            .filter(s => !s.inline)
            .map(s => [s.url, s])).values());
            
        estilosUnicos.forEach((style, index) => {
            const origen = style.inline ? 'Inline' : 'Externo';
            const styleUrl = style.inline ? '(código embebido)' : style.url;
            
            markdown += `| ${index + 1} | ${origen} | ${styleUrl} |\n`;
        });
        
        markdown += `\n### Enlaces de Navegación\n\n`;
        markdown += `| # | Texto | URL |\n`;
        markdown += `|---|-------|-----|\n`;
        
        // Filtrar enlaces duplicados
        const enlacesUnicos = Array.from(new Map(domResources.links
            .filter(link => link.isNavigation)
            .map(link => [link.url, link])).values());
            
        enlacesUnicos.forEach((link, index) => {
            markdown += `| ${index + 1} | ${link.text || '(sin texto)'} | ${link.url} |\n`;
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'report.md'),
            markdown
        );
        
        // Guardar informe global en JSON
        fs.writeFileSync(
            path.join(outputDir, 'informe-global.json'),
            JSON.stringify({
                ...infoGlobal,
                recursos: {
                    total: Object.keys(resources).length,
                    scripts: domResources.scripts.length,
                    estilos: domResources.styles.length,
                    enlaces: domResources.links.length,
                    imagenes: domResources.images.length
                }
            }, null, 2)
        );
        
        // Crear el archivo de resumen simple
        const resumenSimple = `# RESUMEN DE ANÁLISIS DE ${RUTAS_PRINCIPALES.length} SECCIONES

`;
        let resumen = resumenSimple;
        resumen += `* URL Base: ${url}
`;
        resumen += `* Fecha: ${new Date().toLocaleString('es-ES')}
`;
        resumen += `* Secciones analizadas: ${infoGlobal.seccionesAnalizadas.length} de ${RUTAS_PRINCIPALES.length}

`;
        
        resumen += `## Secciones

`;
        infoGlobal.seccionesAnalizadas.forEach(s => {
            resumen += `* ${s.nombre}: ${s.url}
`;
            resumen += `  - Componentes: ${s.componentes.filter(c => c.id && c.id.length > 0).length}
`;
            resumen += `  - Scripts: ${(s.scripts || []).length}
`;
            if (s.endpoints && s.endpoints.length > 0) {
                resumen += `  - Endpoints: ${s.endpoints.length}
`;
            }
            resumen += `\n`;
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'resumen.md'),
            resumen
        );
        
        console.log('✅ Informes generados correctamente');
        console.log(`📂 Resultados guardados en: ${outputDir}`);
        
    } catch (error) {
        console.error('❌ Error durante la extracción:', error);
    } finally {
        await browser.close();
    }
}

// Ejecutar la función principal
extraerRecursosWeb()
    .then(() => console.log('🏁 Proceso completado'))
    .catch(error => console.error('❌ Error en el proceso principal:', error));
