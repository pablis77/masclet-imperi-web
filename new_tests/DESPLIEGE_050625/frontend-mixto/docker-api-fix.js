/**
 * Script para corregir la configuración de la API en entorno Docker
 * Este script se ejecuta solo dentro del contenedor Docker y no afecta al desarrollo local
 * 
 * Problema: El frontend está intentando conectarse a http://localhost:8000 dentro de Docker,
 * pero debe usar http://masclet-backend:8000 para comunicarse con el contenedor del backend.
 */

// Importamos los módulos usando sintaxis ES
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenemos el directorio actual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Iniciando corrección de URLs de API para entorno Docker...');

// Detectar si estamos en Docker (este script solo debe ejecutarse en Docker)
const isInDocker = process.env.DOCKER_CONTAINER === 'true' || 
                   process.env.HOSTNAME?.includes('docker') ||
                   process.env.CONTAINER_NAME?.includes('masclet');

if (!isInDocker) {
  console.log('⚠️ No estamos en Docker, no se aplicarán cambios');
  process.exit(0);
}

// Función para obtener la IP del backend dinámicamente
async function getBackendIP() {
  try {
    console.log('🔍 Intentando resolver masclet-backend usando comandos del sistema...');
    // Intentamos usar diferentes comandos para resolver el nombre, en orden de preferencia
    const commands = [
      'getent hosts masclet-backend',
      'nslookup masclet-backend | grep Address | tail -n1',
      'ping -c 1 masclet-backend | grep PING | head -n1'
    ];
    
    for (const cmd of commands) {
      try {
        const { spawn } = await import('child_process');
        const process = spawn('sh', ['-c', cmd]);
        
        let output = '';
        for await (const chunk of process.stdout) {
          output += chunk;
        }
        
        if (output) {
          // Extraemos la IP basándonos en patrones comunes de los comandos
          const ipMatch = output.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
          if (ipMatch && ipMatch[0]) {
            console.log(`✅ Encontrada IP para masclet-backend: ${ipMatch[0]}`);
            return ipMatch[0];
          }
        }
      } catch (cmdError) {
        console.log(`⚠️ Comando ${cmd} falló: ${cmdError.message}`);
        // Continuamos con el siguiente comando
      }
    }
    
    throw new Error('Ningún comando pudo resolver la IP');
  } catch (error) {
    console.error(`❌ Error al resolver masclet-backend: ${error.message}`);
    console.log('⚠️ Usando IP predeterminada como fallback: 172.18.0.2');
    return '172.18.0.2';  // IP de fallback
  }
}

// Obtenemos la IP y construimos la URL del backend
const backendIP = await getBackendIP();
const DOCKER_API_URL = `http://${backendIP}:8000`;
console.log(`🌐 Configurando API_URL para Docker: ${DOCKER_API_URL}`);

// Sobreescribir las variables de entorno globales
process.env.API_URL = DOCKER_API_URL;
process.env.VITE_API_URL = DOCKER_API_URL;
process.env.PUBLIC_API_URL = DOCKER_API_URL;

// Archivo para almacenar la configuración global que se cargará en tiempo de ejecución
const configFile = path.join(__dirname, 'docker-api-config.js');

// Texto del archivo de configuración con la URL del backend
const configContent = `
// Configuración API generada automáticamente para entorno Docker
window.DOCKER_ENV = true;
window.API_URL = "${DOCKER_API_URL}";
window.API_BASE_URL = "${DOCKER_API_URL}/api/v1";
console.log('🔌 API configurada para Docker:', window.API_BASE_URL);
`;

// Guardar el archivo de configuración
fs.writeFileSync(configFile, configContent);
console.log(`✅ Archivo de configuración generado: ${configFile}`);

// También intentamos modificar el script de entrada del servidor si existe
const serverEntryPath = path.join(__dirname, 'server', 'entry.mjs');
if (fs.existsSync(serverEntryPath)) {
  try {
    let serverContent = fs.readFileSync(serverEntryPath, 'utf8');
    
    // Reemplazar cualquier referencia a localhost:8000 con masclet-backend:8000
    serverContent = serverContent.replace(
      /(['"] ?)http:\/\/localhost:8000([^'"]*['"] ?)/g, 
      `$1${DOCKER_API_URL}$2`
    );
    
    // Agregar código al inicio para sobrescribir las variables
    const injectedCode = `
// Configuración API para Docker (auto-generado)
process.env.API_URL = '${DOCKER_API_URL}';
process.env.VITE_API_URL = '${DOCKER_API_URL}';
process.env.PUBLIC_API_URL = '${DOCKER_API_URL}';
console.log('🌎 Modo de conexión: server');
console.log('🔌 API Base URL: ${DOCKER_API_URL}/api/v1');
console.log('🔗 URLs Relativas: NO');
`;

    // Insertar el código justo después del primer import
    const modifiedContent = serverContent.replace(
      /(import[^;]*;)/,
      `$1
${injectedCode}`
    );
    
    fs.writeFileSync(serverEntryPath, modifiedContent);
    console.log(`✅ Archivo de servidor modificado: ${serverEntryPath}`);
  } catch (error) {
    console.error(`❌ Error al modificar el archivo del servidor: ${error.message}`);
  }
}

console.log('✅ Corrección de URLs de API completada');
