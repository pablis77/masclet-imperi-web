# Script para analizar la estructura del navegador usando Puppeteer
# Versión avanzada: Detecta relaciones precisas entre componentes y endpoints
# Genera mapeo automático de botones, formularios y sus llamadas API
# Analiza cada vista y captura todos los sources, enlaces y llamadas API

param (
    [string]$BaseUrl = "http://172.20.160.1:3000",
    [string]$OutputDir = "./navegador-analisis",
    [string[]]$Rutas = @(
        "/",
        "/dashboard",
        "/explotaciones-react",
        "/animales",
        "/usuarios",
        "/importacion",
        "/copias-de-seguridad",
        "/listados"
    )
)

# Crear directorio de salida si no existe
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "📁 Directorio de salida creado: $OutputDir" -ForegroundColor Cyan
}

# Verificar que npm e instalaciones necesarias estén disponibles
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: npm no está disponible. Asegúrate de tener Node.js instalado." -ForegroundColor Red
    exit 1
}

# Instalar puppeteer si no está disponible
$puppeteerPath = "./node_modules/puppeteer"
if (-not (Test-Path $puppeteerPath)) {
    Write-Host "📦 Instalando Puppeteer... (esto puede tardar unos minutos)" -ForegroundColor Yellow
    npm install puppeteer
}

# Crear el script JavaScript temporal para Puppeteer
$tempScriptPath = "$OutputDir/temp-puppeteer-script.js"
$scriptContent = @"
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const baseUrl = '$BaseUrl';
const rutas = $($Rutas | ConvertTo-Json);
const outputDir = '$OutputDir';

(async () => {
    // Iniciar navegador
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
    });

    console.log('🔍 Navegador iniciado');
    const results = {};

    try {
        const page = await browser.newPage();

        // Habilitar seguimiento de red y consola
        await page.setRequestInterception(true);
        const apiCalls = new Set();
        
        // Almacenar componentes que han iniciado solicitudes API
        const componentApiMapping = {};
        const clickToApiMapping = {};
        let lastClickedElement = null;
        let lastClickTime = 0;
        
        // Interceptar solicitudes para capturar API calls
        page.on('request', request => {
            const url = request.url();
            if (url.includes('/api/v1/') || url.includes('/api/')) {
                apiCalls.add(url);
                
                // Relacionar la API call con el último elemento clickeado (si ocurrió en los últimos 500ms)
                const now = Date.now();
                if (lastClickedElement && (now - lastClickTime) < 500) {
                    if (!clickToApiMapping[lastClickedElement]) {
                        clickToApiMapping[lastClickedElement] = [];
                    }
                    clickToApiMapping[lastClickedElement].push(url);
                }
            }
            request.continue();
        });
        
        // Monitorear eventos de clic
        await page.evaluateOnNewDocument(() => {
            window.clickedElements = {};
            document.addEventListener('click', (event) => {
                let target = event.target;
                // Subir en el DOM hasta encontrar un elemento clicable significativo
                while (target && target !== document) {
                    if (target.tagName === 'BUTTON' || target.tagName === 'A' || 
                        target.onclick || target.id || target.className) {
                        break;
                    }
                    target = target.parentNode;
                }
                
                if (target && target !== document) {
                    const elementInfo = {
                        tagName: target.tagName,
                        id: target.id,
                        className: target.className,
                        innerText: target.innerText,
                        componentName: target.dataset?.componentName || 
                                      target.closest('[data-component-name]')?.dataset.componentName,
                        timestamp: Date.now()
                    };
                    
                    const identifier = elementInfo.tagName + '_' + (elementInfo.id || '_') + '_' + (elementInfo.componentName || '_') + '_' + elementInfo.innerText;
                    window.clickedElements[identifier] = elementInfo;
                    
                    // Notificar que se hizo clic en este elemento
                    window.postMessage({ 
                        type: 'PUPPETEER_ELEMENT_CLICKED', 
                        elementInfo 
                    }, '*');
                }
            }, true);
        });
        
        // Detectar mensajes de elementos clickeados
        page.on('console', msg => {
            console.log(`[Consola] ${msg.text()}`);
        });
        
        // Escuchar mensajes de elementos clickeados
        page.on('message', async (msg) => {
            if (msg && msg.type === 'PUPPETEER_ELEMENT_CLICKED') {
                const elementInfo = msg.elementInfo;
                lastClickedElement = elementInfo.tagName + '_' + (elementInfo.id || '') + '_' + (elementInfo.componentName || '');
                lastClickTime = Date.now();
                console.log('👆 Elemento clickeado: ' + lastClickedElement + ' - ' + elementInfo.innerText);
            }
        });
        
        page.on('console', msg => console.log('[Consola] ' + msg.text()));

        // Analizar cada ruta
        for (const ruta of rutas) {
            const fullUrl = `\${baseUrl}\${ruta}`;
            console.log(`\n📄 Analizando: \${fullUrl}`);
            
            try {
                // Navegar a la página
                await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await page.waitForTimeout(2000); // Esperar a que cargue todo

                // Capturar screenshot
                await page.screenshot({ path: `\${outputDir}/screenshot-\${ruta.replace(/\\//g, '-').replace(/^-/, '')}.png` });
                
                // Identificar todos los elementos interactivos y su estructura
                const interactiveElements = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('button, a, [role="button"], input[type="submit"], [data-component-name]'))
                        .map(el => {
                            const component = el.closest('[data-component-name]');
                            return {
                                tagName: el.tagName,
                                id: el.id,
                                text: el.innerText?.trim() || el.value,
                                href: el.href,
                                onClick: el.getAttribute('onClick'),
                                component: component ? component.dataset.componentName : null,
                                class: el.className,
                                type: el.type,
                                selectors: [
                                    el.id ? `#${el.id}` : null,
                                    el.className ? `.${el.className.split(' ').join('.')}` : null
                                ].filter(Boolean)
                            };
                        });
                });
                
                // Simular navegación interactiva - hacer clic en botones identificables y capturar llamadas API
                console.log('\n🔍 Analizando interacciones en: ' + fullUrl);
                
                // Intentar clic en elementos interactivos principales (uno por uno)
                const mainInteractions = interactiveElements.filter(el => 
                    (el.text && (el.text.includes('Exportar') || el.text.includes('Editar') || 
                                el.text.includes('Eliminar') || el.text.includes('Crear') || 
                                el.text.includes('Ver') || el.text.includes('Detalles')))
                );
                
                // Para cada elemento interactivo principal, haremos clic y registraremos las llamadas API
                for (const el of mainInteractions.slice(0, 3)) { // Limitar a los primeros 3 para no hacer demasiadas interacciones
                    try {
                        console.log('  📌 Intentando clic en: ' + el.text + ' (' + el.tagName + ' - ' + (el.id || 'sin ID') + ')');
                        
                        // Limpiar registro de API calls antes
                        apiCalls.clear();
                        
                        // Si tiene selectores válidos, intentamos hacer clic
                        if (el.selectors && el.selectors.length > 0) {
                            for (const selector of el.selectors) {
                                try {
                                    await page.click(selector);
                                    console.log('  ✅ Clic exitoso en ' + selector);
                                    await page.waitForTimeout(1000); // Esperar a ver si hay llamadas API
                                    
                                    // Registrar llamadas API después del clic
                                    if (apiCalls.size > 0) {
                                        console.log('  🌐 API calls detectadas después del clic en ' + el.text + ':');
                                        apiCalls.forEach(call => console.log('    - ' + call));
                                        
                                        // Guardar esta relación
                                        if (!componentApiMapping[ruta]) componentApiMapping[ruta] = {};
                                        if (!componentApiMapping[ruta][el.text]) componentApiMapping[ruta][el.text] = [];
                                        componentApiMapping[ruta][el.text].push([...apiCalls]);
                                    } else {
                                        console.log('  ℹ️ No se detectaron API calls después del clic');
                                    }
                                    
                                    // Navegamos de vuelta a la página original si hubo redirección
                                    if (page.url() !== fullUrl) {
                                        console.log('  🔙 Volviendo a la página original después del clic');
                                        await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                                        await page.waitForTimeout(1000);
                                    }
                                    
                                    break; // Si el clic fue exitoso, pasamos al siguiente elemento
                                } catch (error) {
                                    console.log('  ⚠️ No se pudo hacer clic con selector ' + selector + ': ' + error.message);
                                    // Continuar con el siguiente selector si este falla
                                }
                            }
                        }
                    } catch (error) {
                        console.log('  ❌ Error al interactuar con ' + el.text + ': ' + error.message);
                    }
                }

                // Extraer recursos
                const pageData = await page.evaluate(() => {
                    // Extraer scripts
                    const scripts = Array.from(document.scripts)
                        .map(s => s.src)
                        .filter(s => s && s.length > 0);
                    
                    // Extraer hojas de estilo
                    const styles = Array.from(document.styleSheets)
                        .map(s => s.href)
                        .filter(s => s && s.length > 0);
                    
                    // Extraer enlaces
                    const links = Array.from(document.querySelectorAll('a'))
                        .map(a => ({ href: a.href, text: a.innerText.trim() }))
                        .filter(a => a.href && a.href.length > 0);
                    
                    // Extraer componentes React (si hay React DevTools)
                    const reactComponents = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ? 
                        'Disponible (necesita inspección manual)' : 'No detectado';

                    // Extraer estructura DOM simplificada
                    const domStructure = {
                        title: document.title,
                        mainContainers: Array.from(document.querySelectorAll('div.container, div.main, main, section'))
                            .map(el => ({ 
                                id: el.id, 
                                classes: el.className,
                                childCount: el.children.length 
                            }))
                    };

                    return {
                        title: document.title,
                        scripts,
                        styles,
                        links,
                        reactComponents,
                        domStructure
                    };
                });

                // Añadir llamadas API detectadas
                // Guardar información de mapeos
                pageData.apiCalls = Array.from(apiCalls);
                pageData.interactiveElements = interactiveElements;
                pageData.componentApiMapping = componentApiMapping[ruta] || {};
                apiCalls.clear(); // Limpiar para la siguiente página
                
                // Guardar resultados
                results[ruta] = pageData;
                
                console.log('✅ Análisis completado para: ' + fullUrl);
                console.log('   - Scripts: ' + pageData.scripts.length);
                console.log('   - Estilos: ' + pageData.styles.length);
                console.log('   - Enlaces: ' + pageData.links.length);
                console.log('   - Llamadas API: ' + pageData.apiCalls.length);
                
            } catch (error) {
                console.error('❌ Error analizando ' + fullUrl + ': ' + error.message);
                results[ruta] = { error: error.message };
            }
        }
        
        // Guardar resultados
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
            
            for (const [interaction, apiCallArrays] of Object.entries(interactions)) {
                const apiCalls = apiCallArrays.flat();
                const uniqueEndpoints = [...new Set(apiCalls.map(url => {
                    // Convertir URL completa a formato de endpoint API
                    const match = url.match(/\/api\/v1\/[^?]*/i);
                    return match ? match[0] : url;
                }))];
                
                componentEndpointMap += `| ${interaction} | ${uniqueEndpoints.join('<br>')} |\n`;
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
        
        console.log(`\n✅ Análisis completo guardado en: \${path.join(outputDir, 'analisis-navegador.json')}`);
        console.log(`✅ Informe Markdown guardado en: \${path.join(outputDir, 'analisis-navegador.md')}`);
        
    } catch (error) {
        console.error(`❌ Error general: \${error.message}`);
    } finally {
        await browser.close();
        console.log('🔍 Navegador cerrado');
    }
})();
"@

# Guardar el script JavaScript
$scriptContent | Out-File -FilePath $tempScriptPath -Encoding utf8
Write-Host "📝 Script JavaScript generado en: $tempScriptPath" -ForegroundColor Green

# Ejecutar el script con Node.js
Write-Host "🚀 Ejecutando análisis de navegador..." -ForegroundColor Yellow
node $tempScriptPath

# Verificar resultados
$jsonResultPath = "$OutputDir/analisis-navegador.json"
$mdResultPath = "$OutputDir/analisis-navegador.md"

if ((Test-Path $jsonResultPath) -and (Test-Path $mdResultPath)) {
    Write-Host "`n✅ Análisis completado exitosamente!" -ForegroundColor Green
    Write-Host "📊 Resultados en formato JSON: $jsonResultPath" -ForegroundColor Cyan
    Write-Host "📝 Informe en formato Markdown: $mdResultPath" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Error al generar resultados. Verifica los logs anteriores." -ForegroundColor Red
}
