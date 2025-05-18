import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARPETAS_IMAGENES = [
  path.join(__dirname, '../../public/images'),
  path.join(__dirname, '../../public/assets/images')
];

// Configuración de calidad para cada formato
const CALIDAD_WEBP = 80;
const CALIDAD_JPG = 85;
const CALIDAD_PNG = 80;

// Función para convertir una imagen a WebP y también optimizar en su formato original
async function optimizarImagen(rutaImagen) {
  try {
    const extension = path.extname(rutaImagen).toLowerCase();
    const carpeta = path.dirname(rutaImagen);
    const nombreSinExtension = path.basename(rutaImagen, extension);
    
    // Ruta para la nueva imagen WebP
    const rutaWebP = path.join(carpeta, `${nombreSinExtension}.webp`);
    
    // Convertir a WebP (para todos los formatos)
    console.log(`Convirtiendo a WebP: ${rutaImagen}`);
    await sharp(rutaImagen)
      .webp({ quality: CALIDAD_WEBP })
      .toFile(rutaWebP);
    
    // Si es JPG o PNG, también optimizamos en su formato original
    if (extension === '.jpg' || extension === '.jpeg') {
      const rutaOptimizada = path.join(carpeta, `${nombreSinExtension}${extension}`);
      console.log(`Optimizando JPG: ${rutaImagen}`);
      
      // Crear una copia temporal antes de sobrescribir
      const datosOriginales = await fs.promises.readFile(rutaImagen);
      
      await sharp(rutaImagen)
        .jpeg({ quality: CALIDAD_JPG, progressive: true })
        .toBuffer()
        .then(async buffer => {
          // Si el buffer optimizado es más grande que el original, mantener original
          if (buffer.length >= datosOriginales.length) {
            console.log(`  → La optimización no redujo el tamaño de ${path.basename(rutaImagen)}, manteniendo original`);
            return;
          }
          await fs.promises.writeFile(rutaImagen, buffer);
          const reduccion = ((1 - buffer.length / datosOriginales.length) * 100).toFixed(2);
          console.log(`  → Optimizado: ${reduccion}% más pequeño`);
        });
    } 
    else if (extension === '.png') {
      console.log(`Optimizando PNG: ${rutaImagen}`);
      
      // Crear una copia temporal antes de sobrescribir
      const datosOriginales = await fs.promises.readFile(rutaImagen);
      
      await sharp(rutaImagen)
        .png({ quality: CALIDAD_PNG, compressionLevel: 9 })
        .toBuffer()
        .then(async buffer => {
          // Si el buffer optimizado es más grande que el original, mantener original
          if (buffer.length >= datosOriginales.length) {
            console.log(`  → La optimización no redujo el tamaño de ${path.basename(rutaImagen)}, manteniendo original`);
            return;
          }
          await fs.promises.writeFile(rutaImagen, buffer);
          const reduccion = ((1 - buffer.length / datosOriginales.length) * 100).toFixed(2);
          console.log(`  → Optimizado: ${reduccion}% más pequeño`);
        });
    }
    
    return true;
  } catch (error) {
    console.error(`Error al procesar ${rutaImagen}:`, error);
    return false;
  }
}

// Procesar todas las imágenes en las carpetas
async function procesarImagenes() {
  let totalProcesadas = 0;
  let totalExitosas = 0;

  // Crear un informe para guardar detalles
  let informe = "# Informe de optimización de imágenes\n\n";
  informe += `Fecha: ${new Date().toLocaleString()}\n\n`;
  informe += "| Archivo | Tamaño original (KB) | Tamaño WebP (KB) | Reducción (%) |\n";
  informe += "|---------|---------------------|------------------|---------------|\n";

  for (const carpeta of CARPETAS_IMAGENES) {
    try {
      const archivos = await fs.promises.readdir(carpeta);
      
      for (const archivo of archivos) {
        // Saltar la carpeta 'originales' y las imágenes WebP existentes
        if (archivo === 'originales' || path.extname(archivo).toLowerCase() === '.webp') {
          continue;
        }
        
        const rutaCompleta = path.join(carpeta, archivo);
        
        // Verificar que sea un archivo y no un directorio
        const stat = await fs.promises.stat(rutaCompleta);
        if (!stat.isFile()) {
          continue;
        }
        
        const extension = path.extname(archivo).toLowerCase();
        // Solo procesar imágenes
        if (['.jpg', '.jpeg', '.png'].includes(extension)) {
          totalProcesadas++;
          
          // Obtener tamaño original
          const tamanoOriginalBytes = stat.size;
          const tamanoOriginalKB = (tamanoOriginalBytes / 1024).toFixed(2);
          
          // Optimizar la imagen
          const resultado = await optimizarImagen(rutaCompleta);
          
          if (resultado) {
            totalExitosas++;
            
            // Obtener tamaño de la versión WebP
            const nombreSinExtension = path.basename(archivo, extension);
            const rutaWebP = path.join(carpeta, `${nombreSinExtension}.webp`);
            const statWebP = await fs.promises.stat(rutaWebP);
            const tamanoWebPKB = (statWebP.size / 1024).toFixed(2);
            
            // Calcular reducción de tamaño
            const reduccion = ((1 - statWebP.size / tamanoOriginalBytes) * 100).toFixed(2);
            
            // Añadir al informe
            informe += `| ${archivo} | ${tamanoOriginalKB} | ${tamanoWebPKB} | ${reduccion}% |\n`;
          }
        }
      }
    } catch (error) {
      console.error(`Error al procesar la carpeta ${carpeta}:`, error);
    }
  }
  
  // Añadir resumen al informe
  informe += `\n## Resumen\n\n`;
  informe += `- Total de imágenes procesadas: ${totalProcesadas}\n`;
  informe += `- Optimizaciones exitosas: ${totalExitosas}\n`;
  informe += `- Tasa de éxito: ${(totalExitosas / totalProcesadas * 100).toFixed(2)}%\n\n`;
  informe += `## Notas\n\n`;
  informe += `- Se han creado versiones WebP de todas las imágenes\n`;
  informe += `- Las imágenes originales se han optimizado en su formato nativo\n`;
  informe += `- Las imágenes originales sin modificar se han guardado en la carpeta 'originales'\n`;
  
  // Guardar el informe
  await fs.promises.writeFile(
    path.join(__dirname, 'informe_optimizacion.md'),
    informe
  );
  
  console.log("\n--- RESUMEN DE OPTIMIZACIÓN ---");
  console.log(`Imágenes procesadas: ${totalProcesadas}`);
  console.log(`Optimizaciones exitosas: ${totalExitosas}`);
  console.log(`Se ha generado un informe detallado en scripts/optimizar-imagenes/informe_optimizacion.md`);
}

// Ejecutar el script
procesarImagenes().catch(console.error);
