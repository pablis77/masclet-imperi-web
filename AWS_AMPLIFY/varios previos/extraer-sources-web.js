/**
 * Script mejorado para extraer recursos del navegador de Masclet Imperi Web
 * Este script conecta con la webapp y extrae recursos como scripts, estilos y otros assets
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extraerRecursosWeb(url = 'http://localhost:3000') {
    console.log(`🔍 Iniciando extracción de recursos desde: ${url}`);
    
    // Crear directorio para resultados
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join(__dirname, 'output-sources-web', `run-${timestamp}`);
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📂 Resultados se guardarán en: ${outputDir}`);
    
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
        
        // Crear informe Markdown
        let markdown = `# Informe de Recursos Web\n\n`;
        markdown += `**URL**: ${url}\n`;
        markdown += `**Fecha**: ${new Date().toLocaleString()}\n\n`;
        
        markdown += `## Resumen\n\n`;
        markdown += `- **Recursos Totales**: ${Object.keys(resources).length}\n`;
        markdown += `- **Scripts**: ${domResources.scripts.length}\n`;
        markdown += `- **Estilos**: ${domResources.styles.length}\n`;
        markdown += `- **Enlaces**: ${domResources.links.length}\n`;
        markdown += `- **Imágenes**: ${domResources.images.length}\n\n`;
        
        markdown += `## Scripts\n\n`;
        markdown += `| # | Tipo | Origen | URL |\n`;
        markdown += `|---|------|--------|-----|\n`;
        
        domResources.scripts.forEach((script, index) => {
            const tipo = script.type || 'text/javascript';
            const origen = script.inline ? 'Inline' : 'Externo';
            const url = script.inline ? '(código embebido)' : script.url;
            
            markdown += `| ${index + 1} | ${tipo} | ${origen} | ${url} |\n`;
        });
        
        markdown += `\n## Estilos\n\n`;
        markdown += `| # | Origen | URL |\n`;
        markdown += `|---|--------|-----|\n`;
        
        domResources.styles.forEach((style, index) => {
            const origen = style.inline ? 'Inline' : 'Externo';
            const url = style.inline ? '(código embebido)' : style.url;
            
            markdown += `| ${index + 1} | ${origen} | ${url} |\n`;
        });
        
        markdown += `\n## Enlaces de Navegación\n\n`;
        markdown += `| # | Texto | URL |\n`;
        markdown += `|---|-------|-----|\n`;
        
        const navLinks = domResources.links.filter(link => link.isNavigation);
        navLinks.forEach((link, index) => {
            markdown += `| ${index + 1} | ${link.text || '(sin texto)'} | ${link.url} |\n`;
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'report.md'),
            markdown
        );
        
        console.log('✅ Informe generado correctamente');
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
