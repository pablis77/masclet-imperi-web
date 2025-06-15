// Script para extraer los recursos cargados por una página web usando Puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// URLs de las diferentes secciones a analizar
const secciones = [
  { nombre: 'dashboard', url: 'http://localhost:3000/' },
  { nombre: 'explotaciones', url: 'http://localhost:3000/explotaciones-react' },
  { nombre: 'animales', url: 'http://localhost:3000/animals' },
  { nombre: 'listados', url: 'http://localhost:3000/listings' },
  { nombre: 'importaciones', url: 'http://localhost:3000/imports' },
  { nombre: 'backup', url: 'http://localhost:3000/backup' },
  { nombre: 'usuarios', url: 'http://localhost:3000/users' }
];

// Directorio de salida
const OUTPUT_DIR = path.join(__dirname, '../analisis-navegador-recursos');

// Función principal
async function extraerRecursos() {
  console.log('Iniciando extracción de recursos del navegador...');
  
  // Crear directorio de salida si no existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const runDir = path.join(OUTPUT_DIR, `run-${timestamp}`);
  fs.mkdirSync(runDir, { recursive: true });

  // Iniciar navegador
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    console.log(`Directorio creado: ${runDir}`);
    let informeCompleto = '# Análisis de recursos por sección\n\n';
    informeCompleto += `Fecha: ${new Date().toLocaleString()}\n\n`;
    
    // Procesar cada sección
    for (const seccion of secciones) {
      console.log(`Analizando sección: ${seccion.nombre} (${seccion.url})`);
      informeCompleto += `## Sección: ${seccion.nombre}\n\n`;
      
      const page = await browser.newPage();
      
      // Capturar todas las solicitudes de red
      const recursos = [];
      page.on('response', async response => {
        const url = response.url();
        if (url.startsWith('data:')) return; // Ignorar URLs de datos (base64)
        
        const tipo = response.request().resourceType();
        
        let extension = '';
        const urlParts = url.split('?')[0].split('.');
        if (urlParts.length > 1) {
          extension = urlParts[urlParts.length - 1];
        }
        
        recursos.push({
          url: url,
          tipo: tipo,
          extension: extension,
          status: response.status()
        });
      });
      
      // Navegar a la URL y esperar a que cargue completamente
      await page.goto(seccion.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      // Esperar un tiempo adicional para scripts asíncronos
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Obtener todos los scripts de la página
      const scriptUrls = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        return scripts.map(script => script.src);
      });
      
      // Obtener todos los estilos de la página
      const cssUrls = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        return links.map(link => link.href);
      });
      
      // Obtener todos los imports dinámicos (puede requerir ejecución de JavaScript)
      const dynamicImports = await page.evaluate(() => {
        // Buscar en window.__VITE_PRELOAD_MAP si existe (Vite usa esto)
        if (window.__VITE_PRELOAD_MAP) {
          return Object.keys(window.__VITE_PRELOAD_MAP);
        }
        return [];
      });
      
      // Organizar recursos por tipo
      const resourcesByType = {
        script: scriptUrls,
        stylesheet: cssUrls,
        dynamic: dynamicImports,
        otros: recursos.filter(r => !scriptUrls.includes(r.url) && !cssUrls.includes(r.url))
      };
      
      // Generar informe para esta sección
      let seccionReport = `### Scripts (${resourcesByType.script.length})\n\n`;
      resourcesByType.script.forEach(url => {
        seccionReport += `- ${url}\n`;
      });
      
      seccionReport += `\n### Estilos CSS (${resourcesByType.stylesheet.length})\n\n`;
      resourcesByType.stylesheet.forEach(url => {
        seccionReport += `- ${url}\n`;
      });
      
      seccionReport += `\n### Imports dinámicos (${resourcesByType.dynamic.length})\n\n`;
      resourcesByType.dynamic.forEach(url => {
        seccionReport += `- ${url}\n`;
      });
      
      seccionReport += `\n### Otros recursos (${resourcesByType.otros.length})\n\n`;
      resourcesByType.otros.forEach(r => {
        seccionReport += `- [${r.tipo}] ${r.url}\n`;
      });
      
      // Realizar análisis de módulos
      const modulesAnalysis = await page.evaluate(() => {
        const moduleStructure = {};
        
        // Función para encontrar todos los módulos definidos por Vite/Astro
        function findModules() {
          // Buscar en diferentes ubicaciones según el bundler
          const viteModules = window.__vite_plugin_react_preamble_installed__ || {};
          const astroModules = window.astroModules || {};
          
          // También buscar en importMaps si existe
          const importMaps = document.querySelector('script[type="importmap"]');
          let importMapModules = {};
          if (importMaps) {
            try {
              importMapModules = JSON.parse(importMaps.textContent).imports || {};
            } catch (e) {
              console.error('Error parsing import map:', e);
            }
          }
          
          return { ...viteModules, ...astroModules, ...importMapModules };
        }
        
        return findModules();
      });
      
      seccionReport += `\n### Análisis de módulos\n\n\`\`\`json\n${JSON.stringify(modulesAnalysis, null, 2)}\n\`\`\`\n\n`;
      
      // Guardar resultados para esta sección
      fs.writeFileSync(path.join(runDir, `recursos-${seccion.nombre}.md`), seccionReport);
      
      // Agregar al informe completo
      informeCompleto += seccionReport + '\n\n';
      
      // Tomar screenshot
      await page.screenshot({ path: path.join(runDir, `${seccion.nombre}.png`), fullPage: true });
      
      console.log(`Completado análisis de sección: ${seccion.nombre}`);
      await page.close();
    }
    
    // Intentar ejecutar script dentro del navegador para imprimir estructura de Sources
    try {
      const page = await browser.newPage();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      
      // Script para simular abrir DevTools y extraer información
      const inspectorScript = `
        // Este script intentará inspeccionar los recursos cargados por el navegador
        // a través de la Performance API
        
        let resourceReport = '# Informe de recursos del navegador\\n\\n';
        
        // Obtener recursos mediante Performance API
        const resources = performance.getEntriesByType('resource');
        
        // Agrupar por tipo
        const byType = {};
        resources.forEach(res => {
          const url = res.name;
          let type = 'unknown';
          
          if (url.endsWith('.js')) type = 'javascript';
          else if (url.endsWith('.css')) type = 'css';
          else if (url.match(/\\.(png|jpg|jpeg|gif|svg|webp)/)) type = 'image';
          else if (url.match(/\\.(woff|woff2|ttf|otf)/)) type = 'font';
          else if (url.endsWith('.json')) type = 'json';
          
          if (!byType[type]) byType[type] = [];
          byType[type].push(url);
        });
        
        // Generar reporte
        Object.keys(byType).forEach(type => {
          resourceReport += \`## ${type} (${byType[type].length})\\n\\n\`;
          byType[type].forEach(url => {
            resourceReport += \`- ${url}\\n\`;
          });
          resourceReport += '\\n';
        });
        
        resourceReport;
      `;
      
      // Ejecutar el script y obtener el reporte
      const resourceReport = await page.evaluate(inspectorScript);
      
      // Guardar el informe de recursos
      fs.writeFileSync(path.join(runDir, 'resources-performance-api.md'), resourceReport);
      
      await page.close();
    } catch (error) {
      console.log('Error al ejecutar script de inspector:', error);
    }
    
    // Guardar informe completo
    fs.writeFileSync(path.join(runDir, 'analisis-recursos-completo.md'), informeCompleto);
    
    console.log(`Análisis completo guardado en: ${path.join(runDir, 'analisis-recursos-completo.md')}`);
    
  } catch (error) {
    console.error('Error durante la extracción:', error);
  } finally {
    await browser.close();
    console.log('Proceso completado.');
  }
}

// Ejecutar script
extraerRecursos().catch(console.error);
