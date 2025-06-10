/**
 * docker-api-detector.js
 * Módulo para detectar entorno Docker y localizar la IP del backend
 */
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Exportamos la configuración
module.exports = {
  isDockerEnvironment,
  getBackendIP
};

/**
 * Comprueba si estamos ejecutando en un entorno Docker
 * @returns {boolean} true si es entorno Docker
 */
function isDockerEnvironment() {
  try {
    // Comprobamos variables de entorno típicas de Docker
    if (process.env.DOCKER_CONTAINER === 'true' || 
        process.env.HOSTNAME && process.env.HOSTNAME.includes('docker') || 
        process.env.CONTAINER_NAME) {
      console.log('✅ Detectado entorno Docker por variables de entorno');
      return true;
    }
    
    // Comprobamos archivos típicos de Docker
    if (fs.existsSync('/.dockerenv') || fs.existsSync('/proc/1/cgroup') && 
        fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker')) {
      console.log('✅ Detectado entorno Docker por archivos del sistema');
      return true;
    }
    
    console.log('ℹ️ No se detectó entorno Docker');
    return false;
  } catch (error) {
    console.error(`❌ Error al verificar entorno Docker: ${error.message}`);
    return false;
  }
}

/**
 * Obtiene la IP del backend dentro de la red Docker
 * @returns {string} URL completa del backend (http://<IP>:8000)
 */
async function getBackendIP() {
  try {
    console.log('--- INICIANDO DIAGNÓSTICO EXTENSO DE RED DOCKER ---');
    console.log('=======================================================');
    
    // Recopilar información de contexto
    try {
      console.log('\n📌 VARIABLES DE ENTORNO:');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('API_URL:', process.env.API_URL);
      console.log('PUBLIC_API_URL:', process.env.PUBLIC_API_URL);
      console.log('VITE_API_URL:', process.env.VITE_API_URL);
      console.log('HOSTNAME:', process.env.HOSTNAME);
      console.log('HOST:', process.env.HOST);
      console.log('PORT:', process.env.PORT);
    } catch (e) {
      console.log('Error obteniendo variables de entorno:', e.message);
    }
    
    // Información de red
    try {
      console.log('\n📌 INTERFACES DE RED:');
      const { networkInterfaces } = require('os');
      const nets = networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4') {
            console.log(`Interface ${name}: ${net.address}`);
          }
        }
      }
    } catch (e) {
      console.log('Error obteniendo interfaces de red:', e.message);
    }
    
    // Prueba de conectividad básica
    try {
      console.log('\n📌 PRUEBA DE CONECTIVIDAD DNS:');
      console.log('Resolviendo masclet-backend...');
      const dns = require('dns').promises;
      try {
        const result = await dns.lookup('masclet-backend');
        console.log('DNS lookup exitoso:', result);
      } catch (e) {
        console.log('DNS lookup falló:', e.message);
      }
    } catch (e) {
      console.log('Error en prueba DNS:', e.message);
    }
    
    // Intentamos varias estrategias para obtener la IP del backend
    console.log('\n📌 INTENTANDO MÚLTIPLES MÉTODOS DE DETECCIÓN:');
    let backendIP = await tryGetBackendIPWithGetent() || 
                    await tryGetBackendIPWithNslookup() ||
                    await tryGetBackendIPWithPing() ||
                    await tryGetBackendIPWithDockerInspect();
    
    // Probar conexión HTTP directa
    console.log('\n📌 PRUEBA DE CONECTIVIDAD HTTP:');
    try {
      const http = require('http');
      const testIPs = [
        backendIP || 'masclet-backend',
        'masclet-backend',
        '127.0.0.1'
      ];
      
      for (const ip of testIPs) {
        console.log(`Intentando conectar a http://${ip}:8000/api/v1/health...`);
        try {
          await new Promise((resolve, reject) => {
            const req = http.get(`http://${ip}:8000/api/v1/health`, (res) => {
              let data = '';
              res.on('data', chunk => data += chunk);
              res.on('end', () => {
                console.log(`Respuesta de ${ip}: Status ${res.statusCode}, Body: ${data.substring(0, 100)}`);
                resolve(data);
              });
            });
            req.on('error', (e) => {
              console.log(`Error conectando a ${ip}: ${e.message}`);
              reject(e);
            });
            req.setTimeout(3000, () => {
              console.log(`Timeout conectando a ${ip}`);
              req.abort();
              reject(new Error('Timeout'));
            });
          });
        } catch (e) {
          console.log(`Falló conexión a ${ip}: ${e.message}`);
        }
      }
    } catch (e) {
      console.log('Error en prueba HTTP:', e.message);
    }
    
    // Si todo falló, usamos la IP por defecto
    if (!backendIP) {
      console.warn('⚠️ No se pudo detectar la IP del backend, usando fallback: masclet-backend');
      backendIP = 'masclet-backend';
    }
    
    const backendUrl = `http://${backendIP}:8000`;
    console.log(`\n✅ URL del backend seleccionada: ${backendUrl}`);
    console.log('=======================================================\n');
    return backendUrl;
  } catch (error) {
    console.error(`❌ Error al obtener IP del backend: ${error.message}`);
    return 'http://masclet-backend:8000'; // Fallback seguro
  }
}

/**
 * Intenta obtener la IP del backend con getent
 * @returns {Promise<string|null>} La IP si se encuentra, null en caso contrario
 */
async function tryGetBackendIPWithGetent() {
  try {
    const output = execSync('getent hosts masclet-backend').toString().trim();
    const ipMatch = output.match(/^(\d+\.\d+\.\d+\.\d+)/);
    if (ipMatch && ipMatch[1]) {
      console.log(`✅ IP del backend encontrada con getent: ${ipMatch[1]}`);
      return ipMatch[1];
    }
  } catch (error) {
    console.log('ℹ️ No se pudo obtener la IP con getent, intentando otro método...');
  }
  return null;
}

/**
 * Intenta obtener la IP del backend con nslookup
 * @returns {Promise<string|null>} La IP si se encuentra, null en caso contrario
 */
async function tryGetBackendIPWithNslookup() {
  try {
    const output = execSync('nslookup masclet-backend').toString().trim();
    const ipMatch = output.match(/Address:\s+(\d+\.\d+\.\d+\.\d+)/);
    if (ipMatch && ipMatch[1]) {
      console.log(`✅ IP del backend encontrada con nslookup: ${ipMatch[1]}`);
      return ipMatch[1];
    }
  } catch (error) {
    console.log('ℹ️ No se pudo obtener la IP con nslookup, intentando otro método...');
  }
  return null;
}

/**
 * Intenta obtener la IP del backend con ping
 * @returns {Promise<string|null>} La IP si se encuentra, null en caso contrario
 */
async function tryGetBackendIPWithPing() {
  try {
    const output = execSync('ping -c 1 masclet-backend').toString().trim();
    const ipMatch = output.match(/\((\d+\.\d+\.\d+\.\d+)\)/);
    if (ipMatch && ipMatch[1]) {
      console.log(`✅ IP del backend encontrada con ping: ${ipMatch[1]}`);
      return ipMatch[1];
    }
  } catch (error) {
    console.log('ℹ️ No se pudo obtener la IP con ping, intentando otro método...');
  }
  return null;
}

/**
 * Intenta obtener la IP del backend con docker inspect
 * @returns {Promise<string|null>} La IP si se encuentra, null en caso contrario
 */
async function tryGetBackendIPWithDockerInspect() {
  try {
    const output = execSync('docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" masclet-backend').toString().trim();
    if (/\d+\.\d+\.\d+\.\d+/.test(output)) {
      console.log(`✅ IP del backend encontrada con docker inspect: ${output}`);
      return output;
    }
  } catch (error) {
    console.log('ℹ️ No se pudo obtener la IP con docker inspect');
  }
  return null;
}
