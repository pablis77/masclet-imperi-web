/**
 * Script para extraer todos los sources visibles en la consola del navegador
 * Este script se conecta a una página web y extrae todos los archivos fuente visibles
 * en las herramientas de desarrollo del navegador (Sources panel)
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extraerSourcesNavegador(url = 'http://localhost:3000') {
    console.log(`🔍 Iniciando extracción de sources desde: ${url}`);

    // Crear directorio para resultados
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join(__dirname, 'output-sources-browser', `run-${timestamp}`);
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📂 Resultados se guardarán en: ${outputDir}`);

    // Iniciar navegador
    const browser = await puppeteer.launch({
        headless: false, // Usar false para ver el navegador en acción
        args: ['--window-size=1920,1080'],
        defaultViewport: null
    });

    try {
        const page = await browser.newPage();
        
        // Habilitar CDP para acceder a los sources y otros recursos
        const client = await page.target().createCDPSession();
        
        // Habilitar protocolos necesarios
        await client.send('Network.enable');
        await client.send('Debugger.enable');
        await client.send('Page.enable');
        await client.send('Runtime.enable');
        
        // Almacenar todos los recursos por URL
        const resources = new Map();
        
        client.on('Network.responseReceived', async (event) => {
            const { requestId, response } = event;
            resources.set(requestId, response);
        });

        // Configurar evento para Console API
        client.on('Runtime.consoleAPICalled', async (event) => {
            console.log(`[Consola] ${event.args.map(arg => arg.value || arg.description).join(' ')}`);
        });
        
        // Navegar a la URL
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        
        console.log('🔑 Intentando iniciar sesión si es necesario...');
        
        // Comprobar si estamos en una página de login
        const loginForm = await page.evaluate(() => {
            const usernameInput = document.querySelector('input[type="text"]');
            const passwordInput = document.querySelector('input[type="password"]');
            const loginButton = Array.from(document.querySelectorAll('button')).find(button => 
                button.textContent.toLowerCase().includes('login') || 
                button.textContent.toLowerCase().includes('iniciar') ||
                button.textContent.toLowerCase().includes('acceder')
            );
            
            return !!(usernameInput && passwordInput && loginButton);
        });
        
        if (loginForm) {
            console.log('🔐 Formulario de login detectado, iniciando sesión...');
            
            await page.type('input[type="text"]', 'admin');
            await page.type('input[type="password"]', 'admin123');
            
            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
            
            console.log('✅ Sesión iniciada');
        }
        
        // Extraer todos los recursos JS - Este es el enfoque principal
        console.log('📊 Extrayendo recursos JavaScript...');
        
        // Obtener todos los scripts y módulos
        const jsSources = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const scriptSources = scripts.map(s => s.src);
            
            // También intentar extraer módulos dinámicos (puede requerir más procesamiento)
            const moduleImports = [];
            try {
                if (window.__VITE_INFO__ && window.__VITE_INFO__.modules) {
                    Object.keys(window.__VITE_INFO__.modules).forEach(m => moduleImports.push(m));
                }
            } catch (e) {
                console.error('Error extrayendo módulos:', e);
            }
            
            return {
                scripts: scriptSources,
                modules: moduleImports
            };
        });
        
        console.log(`📔 Encontrados ${jsSources.scripts.length} scripts y ${jsSources.modules.length} módulos`);
        
        // Extraer fuentes de Chrome DevTools (usando Debugger en vez de Runtime)
        console.log('🔍 Extrayendo fuentes del panel de DevTools...');
        
        // Activar el listener para scripts antes de navegar
        const scriptIds = new Set();
        const scriptSources = {};
        let processedCount = 0;
        }
        
        // Obtener también sources que aparecen en el panel de Sources pero no son scripts
        console.log('📊 Extrayendo recursos adicionales (CSS, HTML, etc.)...');
        
        // Procesar todos los recursos capturados
        for (const [requestId, response] of resources.entries()) {
            if (response.url && !scriptSources[response.url]) {
                try {
                    // Obtener el contenido del recurso
                    const result = await client.send('Network.getResponseBody', { requestId });
                    
                    if (result.body) {
                        // Determinar tipo de archivo basado en la URL o encabezados
                        let extension = 'txt';
                        if (response.url.endsWith('.js')) extension = 'js';
                        else if (response.url.endsWith('.css')) extension = 'css';
                        else if (response.url.endsWith('.html')) extension = 'html';
                        else if (response.mimeType) {
                            if (response.mimeType.includes('javascript')) extension = 'js';
                            else if (response.mimeType.includes('css')) extension = 'css';
                            else if (response.mimeType.includes('html')) extension = 'html';
                        }
                        
                        // Limpiar la URL para usarla como nombre de archivo
                        let fileName = response.url.replace(/[^a-z0-9]/gi, '_').slice(0, 100);
                        if (fileName.length > 100) fileName = fileName.slice(0, 100);
                        
                        // Guardar el recurso
                        scriptSources[response.url] = {
                            content: result.body,
                            fileName: `${fileName}.${extension}`
                        };
                    }
                } catch (error) {
                    // Ignorar errores al obtener algunos recursos
                }
            }
        }
        
        console.log(`✅ Procesados ${Object.keys(scriptSources).length} archivos fuente`);
        
        // Guardar todos los sources en el directorio de salida
        for (const [url, data] of Object.entries(scriptSources)) {
            try {
                fs.writeFileSync(
                    path.join(outputDir, data.fileName),
                    data.content
                );
            } catch (error) {
                console.log(`⚠️ Error guardando ${url}: ${error.message}`);
            }
        }
        
        // Crear reporte JSON con todos los sources encontrados
        const sourceReport = {
            timestamp: new Date().toISOString(),
            url: url,
            totalSources: Object.keys(scriptSources).length,
            sources: Object.keys(scriptSources).map(url => ({
                url,
                fileName: scriptSources[url].fileName,
                size: scriptSources[url].content.length
            }))
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'sources-report.json'),
            JSON.stringify(sourceReport, null, 2)
        );
        
        // Crear reporte Markdown
        let markdownReport = `# Reporte de Sources del Navegador\n\n`;
        markdownReport += `**Fecha**: ${new Date().toLocaleString()}\n`;
        markdownReport += `**URL analizada**: ${url}\n\n`;
        markdownReport += `## Resumen\n\n`;
        markdownReport += `- **Total de archivos source encontrados**: ${Object.keys(scriptSources).length}\n`;
        markdownReport += `- **Scripts detectados**: ${jsSources.scripts.length}\n`;
        markdownReport += `- **Módulos detectados**: ${jsSources.modules.length}\n\n`;
        
        markdownReport += `## Archivos Source por Tipo\n\n`;
        
        // Contar por extensión
        const countByType = {};
        Object.values(scriptSources).forEach(source => {
            const extension = source.fileName.split('.').pop();
            countByType[extension] = (countByType[extension] || 0) + 1;
        });
        
        Object.entries(countByType).forEach(([type, count]) => {
            markdownReport += `- **${type}**: ${count} archivos\n`;
        });
        
        markdownReport += `\n## Lista Completa de Sources\n\n`;
        markdownReport += `| # | Tipo | Tamaño | URL |\n|---|------|--------|------|\n`;
        
        Object.entries(scriptSources).forEach(([url, data], index) => {
            const extension = data.fileName.split('.').pop();
            const sizeKB = Math.round(data.content.length / 1024 * 100) / 100;
            markdownReport += `| ${index + 1} | ${extension} | ${sizeKB} KB | ${url} |\n`;
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'sources-report.md'),
            markdownReport
        );
        
        console.log('✅ Reporte generado correctamente');
        console.log(`📊 Total de sources extraídos: ${Object.keys(scriptSources).length}`);
        console.log(`📂 Resultados guardados en: ${outputDir}`);
        
    } catch (error) {
        console.error('❌ Error durante la extracción:', error);
    } finally {
        await browser.close();
    }
}

// Ejecutar la función principal
extraerSourcesNavegador()
    .then(() => console.log('🏁 Proceso completado'))
    .catch(error => console.error('❌ Error en el proceso principal:', error));
