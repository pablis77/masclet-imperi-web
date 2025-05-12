// Script post-build para reemplazar el archivo de entrada
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function postBuild() {
  console.log('Ejecutando script post-build...');
  
  try {
    // Ruta al archivo de entrada original generado por Astro
    const originalEntryPath = path.join(__dirname, 'dist/server/entry.mjs');
    
    // Ruta donde guardaremos una copia del archivo original
    const backupEntryPath = path.join(__dirname, 'dist/server/entry.original.mjs');
    
    // Ruta a nuestro archivo de entrada personalizado con health check
    const healthEntryPath = path.join(__dirname, 'health-entry.mjs');
    
    // Verificamos si existe el archivo de entrada original
    console.log(`Verificando si existe ${originalEntryPath}...`);
    await fs.access(originalEntryPath);
    
    // Creamos una copia de seguridad del archivo original
    console.log('Creando copia de seguridad del entry.mjs original...');
    await fs.copyFile(originalEntryPath, backupEntryPath);
    
    // Leemos nuestro archivo de entrada personalizado
    console.log('Leyendo archivo de entrada personalizado...');
    const healthEntryContent = await fs.readFile(healthEntryPath, 'utf8');
    
    // Sobrescribimos el archivo original con nuestro archivo personalizado
    console.log('Reemplazando archivo de entrada con versión que soporta health check...');
    await fs.writeFile(originalEntryPath, healthEntryContent, 'utf8');
    
    console.log('✅ Post-build completado con éxito!');
  } catch (error) {
    console.error('❌ Error en script post-build:', error);
    process.exit(1);
  }
}

// Ejecutamos la función principal
postBuild();
