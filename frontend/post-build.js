// Script post-build simplificado
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function postBuild() {
  console.log('Ejecutando script post-build simplificado...');
  
  // Verificamos que todo esté correcto
  try {
    // Ruta al archivo de entrada original generado por Astro
    const entryPath = path.join(__dirname, 'dist/server/entry.mjs');
    
    // Verificamos si existe el archivo de entrada
    await fs.access(entryPath);
    console.log(`✅ Verificado que ${entryPath} existe correctamente`);
    
    // Añadimos un archivo health-check.txt para documentación
    const healthCheckInfoPath = path.join(__dirname, 'dist/health-check.txt');
    const healthCheckInfo = `
Health Check en Masclet-Imperi-Web
==============================

Endpoint: /health
Método: GET
Respuesta esperada: 200 OK
Cuerpo de respuesta: "OK"

Este endpoint se usa para verificar que la aplicación está funcionando correctamente.
Si recibes un código 200, la aplicación está lista para recibir solicitudes.

Configurando en Render.com:
-------------------------
Asegúrate de que la URL del health check sea:
{DEPLOY_URL}/health

Donde {DEPLOY_URL} es la URL de tu aplicación desplegada.
`;
    
    await fs.writeFile(healthCheckInfoPath, healthCheckInfo, 'utf8');
    console.log(`✅ Documentación de health check creada en ${healthCheckInfoPath}`);
    
    console.log('✅ Post-build completado con éxito!');
  } catch (error) {
    console.error('❌ Error en script post-build:', error);
    process.exit(1);
  }
}

// Ejecutamos la función principal
postBuild();
