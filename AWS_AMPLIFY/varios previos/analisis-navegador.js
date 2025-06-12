// Script directo de Puppeteer para analizar la estructura del navegador
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuración - MODIFICAR SEGÚN NECESIDAD
const baseUrl = 'http://172.20.160.1:3000';
const outputDir = './navegador-analisis/resultados';
const rutas = [
    '/',                    // Dashboard
    '/explotaciones',       // Listado de explotaciones
    '/animal',              // Gestión de animales
    '/importar',            // Importación de datos
    '/usuarios',            // Gestión de usuarios
    '/backup'               // Sistema de backups
];

// Asegurarse de que existe el directorio de salida
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function analizarEstructura() {
    console.log('\n🚀 Iniciando análisis de estructura del navegador...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = {};
    const componentApiMapping = {};
    
    try {
        const page = await browser.newPage();
        
        // Habilitar intercepción de peticiones
        await page.setRequestInterception(true);
        const apiCalls = new Set();
        
        // Interceptar peticiones para capturar llamadas API
        page.on('request', request => {
            const url = request.url();
            if (url.includes('/api/v1/') || url.includes('/api/')) {
                apiCalls.add(url);
            }
            request.continue();
        });
        
        // Monitorear eventos de consola
        page.on('console', msg => console.log('[Consola] ' + msg.text()));
        
        // Analizar cada ruta
        for (const ruta of rutas) {
            try {
                const fullUrl = baseUrl + ruta;
                console.log('\n📄 Analizando: ' + fullUrl);
                
                // Navegar a la URL
                await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await page.waitForTimeout(2000); // Esperar a que cargue completamente
                
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
                
                const buttonsToClick = await page.$$eval('button, [role="button"], input[type="submit"]', buttons => {
                    return buttons.map(btn => {
                        const text = btn.innerText?.trim() || btn.value;
                        return {
                            text: text,
                            id: btn.id,
                            classList: Array.from(btn.classList || []),
                            hasExport: text && (
                                text.toLowerCase().includes('export') || 
                                text.toLowerCase().includes('pdf') || 
                                text.toLowerCase().includes('csv')
                            )
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
                }
                
                // Intentar hacer clic en botones de exportación para ver qué endpoints se activan
                for (const btn of buttonsToClick.filter(b => b.hasExport)) {
                    try {
                        // Limpiar APIs registradas
                        apiCalls.clear();
                        
                        // Intentar hacer clic por ID
                        if (btn.id) {
                            try {
                                await page.click('#' + btn.id);
                                await page.waitForTimeout(1000);
                                
                                // Registrar APIs llamadas
                                if (apiCalls.size > 0) {
                                    console.log(`  🌐 API calls tras clic en '${btn.text}':`);
                                    apiCalls.forEach(call => console.log('    - ' + call));
                                    
                                    componentApiMapping[ruta][btn.text] = Array.from(apiCalls);
                                }
                                
                                // Volver a la página si hubo redirección
                                if (page.url() !== fullUrl) {
                                    await page.goto(fullUrl, { waitUntil: 'networkidle2' });
                                    await page.waitForTimeout(1000);
                                }
                            } catch (e) {
                                console.log(`  ⚠️ No se pudo hacer clic en '${btn.text}': ${e.message}`);
                            }
                        }
                    } catch (error) {
                        console.log(`  ❌ Error interactuando con '${btn.text}': ${error.message}`);
                    }
                }
                
                // Añadir llamadas API detectadas
                pageData.apiCalls = Array.from(apiCalls);
                apiCalls.clear(); // Limpiar para la siguiente página
                
                // Guardar resultados
                results[ruta] = pageData;
                
                console.log('✅ Análisis completado para: ' + ruta);
                console.log('   - Scripts: ' + pageData.scripts.length);
                console.log('   - Estilos: ' + pageData.styles.length);
                console.log('   - Enlaces: ' + pageData.links.length);
                console.log('   - Llamadas API: ' + pageData.apiCalls.length);
                
            } catch (error) {
                console.error('❌ Error analizando ' + ruta + ': ' + error.message);
                results[ruta] = { error: error.message };
            }
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
