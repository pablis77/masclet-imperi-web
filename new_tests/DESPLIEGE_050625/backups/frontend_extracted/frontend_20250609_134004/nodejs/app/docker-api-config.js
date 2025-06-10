/**
 * docker-api-config.js
 * Módulo para generar configuración y archivos de inyección para el frontend
 */
const fs = require('fs');
const path = require('path');

// Exportamos funciones
module.exports = {
  generateApiConfig,
  modifyServerEntry
};

/**
 * Genera los archivos de configuración para la API
 * @param {string} backendUrl - URL completa del backend (http://IP:8000)
 */
async function generateApiConfig(backendUrl) {
  try {
    // Establecemos variables de entorno para que las use el servidor
    process.env.API_URL = backendUrl;
    process.env.VITE_API_URL = backendUrl;
    process.env.PUBLIC_API_URL = backendUrl;
    
    console.log(`✅ Variables de entorno configuradas:
      - API_URL: ${process.env.API_URL}
      - VITE_API_URL: ${process.env.VITE_API_URL}
      - PUBLIC_API_URL: ${process.env.PUBLIC_API_URL}`);
    
    // Creamos un script JS para sobrescribir la URL en el cliente
    const configContent = `
      // Archivo generado automáticamente por docker-api-config.js
      console.log('--- DIAGNÓSTICO DE CONFIGURACIÓN API EN DOCKER ---', 'background: #0db7ed; color: white; font-size: 12px; padding: 4px;');
      
      console.log('>> Variables antes de sobrescritura:');
      console.log(' - window.API_URL =', window.API_URL || 'no definida');
      console.log(' - window.VITE_API_URL =', window.VITE_API_URL || 'no definida');
      console.log(' - window.PUBLIC_API_URL =', window.PUBLIC_API_URL || 'no definida');
      console.log(' - window.__API_CONFIG__ =', window.__API_CONFIG__ ? JSON.stringify(window.__API_CONFIG__) : 'no definido');
      
      // Sobrescribimos variables globales
      console.log('>> Aplicando nueva configuración de API: ${backendUrl}');
      window.API_URL = '${backendUrl}';
      window.VITE_API_URL = '${backendUrl}';
      window.PUBLIC_API_URL = '${backendUrl}';
      
      console.log('>> Configuración GLOBAL aplicada:');
      console.log(' - window.API_URL =', window.API_URL);
      console.log(' - window.VITE_API_URL =', window.VITE_API_URL);
      console.log(' - window.PUBLIC_API_URL =', window.PUBLIC_API_URL);
      
      // Sobrescribimos configuración de la API
      if (window.__API_CONFIG__) {
        console.log('>> Configuración API encontrada, actualizando...');
        const configAnterior = JSON.stringify(window.__API_CONFIG__);
        window.__API_CONFIG__.apiUrl = '${backendUrl}';
        window.__API_CONFIG__.baseUrl = '${backendUrl}/api/v1';
        console.log(' - Antes:', configAnterior);
        console.log(' - Después:', JSON.stringify(window.__API_CONFIG__));
      } else {
        console.warn('AVISO: No se encontró configuración de API, creando nueva...');
        window.__API_CONFIG__ = {
          apiUrl: '${backendUrl}',
          baseUrl: '${backendUrl}/api/v1'
        };
        console.log(' - Nueva configuración:', JSON.stringify(window.__API_CONFIG__));
      }
      
      // Intentamos realizar una prueba básica de conexión
      console.log('>> Realizando prueba de conexión al backend...');
      fetch('${backendUrl}/api/v1/health')
        .then(function(response) {
          console.log('>> Conexión exitosa: Status ' + response.status);
          return response.text();
        })
        .then(function(data) {
          console.log('>> Respuesta:', data);
        })
        .catch(function(error) {
          console.error('ERROR: Error de conexión: ' + error.message);
          console.log('NOTA: Si el error es de CORS, esto es normal en el navegador pero no indica un problema de red real.');
        });
    `;
    
    // Guardamos el archivo de configuración
    const configPath = path.join(__dirname, 'docker-api-config.js');
    fs.writeFileSync(configPath, configContent);
    console.log(`✅ Archivo de configuración creado: ${configPath}`);
    
    // Creamos un archivo HTML para inyección 
    const injectionContent = `<script src="/docker-api-config.js" type="text/javascript"></script><script>console.log('🔌 Script de configuración Docker inyectado');</script>`;
    const injectionFile = path.join(__dirname, 'docker-api-injection.html');
    fs.writeFileSync(injectionFile, injectionContent);
    console.log(`✅ Script de inyección HTML creado: ${injectionFile}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al generar configuración: ${error.message}`);
    return false;
  }
}

/**
 * Modifica el archivo de entrada del servidor para usar la URL del backend
 * @param {string} backendUrl - URL completa del backend (http://IP:8000)
 * @returns {boolean} true si se completó correctamente
 */
function modifyServerEntry(backendUrl) {
  try {
    // Ruta al archivo de entrada del servidor
    const entryPath = path.join(__dirname, 'server', 'entry.mjs');
    
    // Comprobar que existe
    if (!fs.existsSync(entryPath)) {
      console.warn(`⚠️ No se encontró archivo de entrada: ${entryPath}`);
      return false;
    }
    
    // Leer el contenido
    let content = fs.readFileSync(entryPath, 'utf8');
    
    // Verificar si ya tiene nuestra modificación
    if (content.includes('// Modificado por docker-api-fix')) {
      console.log('✅ El archivo de entrada ya está modificado');
      return true;
    }
    
    // Reemplazar URLs localhost por la IP del backend
    content = content.replace(/http:\/\/localhost:8000/g, backendUrl);
    
    // Añadir código para establecer variables de entorno al inicio del archivo
    const envSetup = `
// Modificado por docker-api-fix para usar URL del backend: ${backendUrl}
process.env.API_URL = '${backendUrl}';
process.env.VITE_API_URL = '${backendUrl}';
process.env.PUBLIC_API_URL = '${backendUrl}';
console.log('🌎 Modo de conexión: Docker (server-side)');
console.log('🔌 API Base URL: ' + process.env.API_URL + '/api/v1');
`;
    
    // Insertar después de las importaciones
    const importEndIndex = content.indexOf('import');
    if (importEndIndex !== -1) {
      // Encontrar donde terminan las importaciones buscando la primera línea en blanco después
      let endOfImports = content.indexOf('\n\n', importEndIndex);
      if (endOfImports === -1) {
        endOfImports = content.indexOf('\n', importEndIndex);
      }
      if (endOfImports !== -1) {
        content = content.substring(0, endOfImports + 1) + envSetup + content.substring(endOfImports + 1);
      } else {
        content = envSetup + content;
      }
    } else {
      content = envSetup + content;
    }
    
    // Guardar el archivo modificado
    fs.writeFileSync(entryPath, content, 'utf8');
    console.log(`✅ Archivo de entrada modificado: ${entryPath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al modificar archivo de entrada: ${error.message}`);
    return false;
  }
}
