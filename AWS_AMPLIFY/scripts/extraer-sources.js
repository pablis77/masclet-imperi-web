// Script para extraer la estructura de Sources del navegador usando Puppeteer
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
const OUTPUT_DIR = path.join(__dirname, '../analisis-navegador-sources');

// Función principal
async function extraerStructuraSources() {
  console.log('Iniciando extracción de estructura Sources del navegador...');
  
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
    let informeCompleto = '# Análisis de Sources por sección\n\n';
    informeCompleto += `Fecha: ${new Date().toLocaleString()}\n\n`;
    
    // Procesar cada sección
    for (const seccion of secciones) {
      console.log(`Analizando sección: ${seccion.nombre} (${seccion.url})`);
      informeCompleto += `## Sección: ${seccion.nombre}\n\n`;
      
      const page = await browser.newPage();
      await page.goto(seccion.url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Esperar a que la página cargue completamente
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Abrir DevTools y capturar los Sources
      await page.evaluate(() => {
        // Esta función se ejecuta en el contexto del navegador
        return new Promise((resolve) => {
          // Dar tiempo para que el DevTools se cargue
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      });
      
      // Extraer estructura de sources
      const sourcesList = await page.evaluate(() => {
        // Función para extraer toda la estructura de sources
        function extraerRecursivo(elemento, nivel = 0) {
          if (!elemento) return '';
          
          const indentacion = '  '.repeat(nivel);
          let resultado = '';
          
          // Si es un elemento de árbol
          const texto = elemento.textContent ? elemento.textContent.trim() : '';
          if (texto) {
            // Determinar si es carpeta o archivo
            const esFolder = elemento.classList.contains('folder') || 
                            elemento.querySelectorAll('li, ol').length > 0 ||
                            elemento.querySelector('.arrow-icon');
            
            const tipo = esFolder ? '📁' : '📄';
            resultado += `${indentacion}${tipo} ${texto}\n`;
          }
          
          // Procesar elementos hijos
          const hijos = elemento.children;
          if (hijos && hijos.length > 0) {
            for (let i = 0; i < hijos.length; i++) {
              resultado += extraerRecursivo(hijos[i], nivel + 1);
            }
          }
          
          return resultado;
        }
        
        // Intentar encontrar el panel de sources
        const sourcesPanel = document.querySelector('.navigator-tabbed-pane');
        if (!sourcesPanel) return 'No se encontró el panel de Sources';
        
        return extraerRecursivo(sourcesPanel);
      });
      
      // Guardar resultados para esta sección
      fs.writeFileSync(path.join(runDir, `sources-${seccion.nombre}.txt`), sourcesList);
      
      // Agregar al informe completo
      informeCompleto += sourcesList + '\n\n';
      
      // Tomar screenshot
      await page.screenshot({ path: path.join(runDir, `${seccion.nombre}.png`) });
      
      console.log(`Completado análisis de sección: ${seccion.nombre}`);
      await page.close();
    }
    
    // Guardar informe completo
    fs.writeFileSync(path.join(runDir, 'analisis-sources-completo.md'), informeCompleto);
    
    console.log(`Análisis completo guardado en: ${path.join(runDir, 'analisis-sources-completo.md')}`);
    
  } catch (error) {
    console.error('Error durante la extracción:', error);
  } finally {
    await browser.close();
    console.log('Proceso completado.');
  }
}

// Ejecutar script
extraerStructuraSources().catch(console.error);
