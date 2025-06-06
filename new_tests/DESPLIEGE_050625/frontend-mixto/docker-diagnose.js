/**
 * Script de diagnóstico para problemas de red en Docker
 * Este script es independiente y está diseñado para ser ejecutado directamente
 * en el contenedor frontend para identificar problemas de red con el backend.
 */

// Dependencias
const http = require('http');
const dns = require('dns').promises;
const os = require('os');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

// Archivo para guardar resultados del diagnóstico
const DIAGNOSTICS_FILE = path.join('/app', 'docker-diagnostics.json');

// Configuración
const CONFIG = {
  backendServices: [
    { name: 'masclet-backend', port: 8000, endpoint: '/api/v1/health' },
    { name: 'masclet-db', port: 5432, type: 'postgres' }
  ],
  networkTests: [
    'dns-lookup',
    'ping',
    'http-request',
    'tcp-connect'
  ],
  outputFile: DIAGNOSTICS_FILE,
  runIntervalSeconds: 60, // Ejecutar diagnóstico cada minuto
};

// Guardar resultados
async function saveResults(results) {
  try {
    // Añadimos un timestamp
    results.timestamp = new Date().toISOString();
    results.hostname = os.hostname();
    
    // Guardamos resultados
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));
    console.log(`Diagnóstico guardado en ${CONFIG.outputFile}`);
    
    // También mostramos en consola
    console.log('='.repeat(80));
    console.log('RESUMEN DE DIAGNÓSTICO:');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(results, null, 2));
    console.log('='.repeat(80));
  } catch (error) {
    console.error(`Error al guardar resultados: ${error.message}`);
  }
}

// Ejecutar comando y devolver salida
async function execCommand(command) {
  return new Promise((resolve) => {
    try {
      const output = child_process.execSync(command, { timeout: 5000 }).toString();
      resolve({ success: true, output });
    } catch (error) {
      resolve({ 
        success: false, 
        error: error.message,
        code: error.code,
        stdout: error.stdout ? error.stdout.toString() : null,
        stderr: error.stderr ? error.stderr.toString() : null
      });
    }
  });
}

// Prueba de ping
async function testPing(host) {
  console.log(`Probando ping a ${host}...`);
  return await execCommand(`ping -c 3 ${host}`);
}

// Prueba de DNS
async function testDns(host) {
  console.log(`Resolviendo DNS para ${host}...`);
  try {
    const result = await dns.lookup(host);
    console.log(`✅ DNS OK: ${host} -> ${result.address}`);
    return { success: true, ip: result.address, family: result.family };
  } catch (error) {
    console.log(`❌ ERROR DNS: ${host} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Prueba de HTTP
async function testHttp(host, port, endpoint = '/') {
  const url = `http://${host}:${port}${endpoint}`;
  console.log(`Probando conexión HTTP a ${url}...`);
  
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ HTTP OK: ${url} - Status: ${res.statusCode}`);
        resolve({
          success: true,
          statusCode: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 500) // Solo los primeros 500 caracteres
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ERROR HTTP: ${url} - ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ERROR HTTP: ${url} - Timeout después de 5 segundos`);
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Prueba de TCP
async function testTcpConnect(host, port) {
  console.log(`Probando conexión TCP a ${host}:${port}...`);
  return await execCommand(`nc -zv ${host} ${port} -w 5`);
}

// Recopilar información del sistema
async function getSystemInfo() {
  console.log('Recopilando información del sistema...');
  
  const networkInterfaces = os.networkInterfaces();
  const env = { ...process.env };
  
  // Eliminamos información sensible
  delete env.PATH;
  delete env.HOME;
  delete env.PWD;
  
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    networkInterfaces,
    environment: env,
    routes: await execCommand('ip route'),
    hosts: await execCommand('cat /etc/hosts'),
    dockerNetworks: await execCommand('ls -l /etc/docker/network')
  };
}

// Ejecutar todas las pruebas
async function runDiagnostics() {
  console.log('Iniciando diagnóstico completo de red...');
  
  const results = {
    system: await getSystemInfo(),
    services: {},
    timestamp: new Date().toISOString()
  };
  
  // Probar cada servicio
  for (const service of CONFIG.backendServices) {
    console.log(`\nDiagnosticando servicio: ${service.name}`);
    
    const serviceResults = {
      dns: await testDns(service.name),
      ping: await testPing(service.name)
    };
    
    // Si el DNS fue exitoso, probamos conexión HTTP
    if (serviceResults.dns.success && service.port) {
      if (!service.type || service.type === 'http') {
        serviceResults.http = await testHttp(
          service.name, 
          service.port,
          service.endpoint || '/'
        );
      }
      
      // Prueba de conexión TCP
      serviceResults.tcp = await testTcpConnect(service.name, service.port);
    }
    
    results.services[service.name] = serviceResults;
  }
  
  // Guardar los resultados
  await saveResults(results);
  return results;
}

// Punto de entrada
if (require.main === module) {
  console.log('Ejecutando diagnóstico independiente...');
  
  // Test explícito de conectividad completo
  console.log('===== TEST DE CONECTIVIDAD COMPLETO =====');
  
  // Prueba de DNS
  dns.lookup('masclet-db', (err, address) => {
    console.log(err ? '❌ ERROR DNS' : '✅ DNS OK:', address);
    
    // Prueba HTTP solo si DNS funciona
    if (!err) {
      const http = require('http');
      console.log('Intentando conectar al backend masclet-db:8000/api/v1/health...');
      const req = http.get('http://masclet-db:8000/api/v1/health', { timeout: 5000 }, (res) => {
        console.log(`✅ API CONECTADA - Status: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('Respuesta:', data);
        });
      });
      
      req.on('error', (error) => {
        console.log(`❌ ERROR API: ${error.message}`);
      });
    }
  });
  
  // La primera ejecución es inmediata
  runDiagnostics().then(() => {
    console.log('Diagnóstico inicial completado.');
    
    // Luego ejecutamos periódicamente
    const interval = CONFIG.runIntervalSeconds * 1000;
    setInterval(async () => {
      console.log(`\nEjecutando diagnóstico periódico (cada ${CONFIG.runIntervalSeconds} segundos)...`);
      await runDiagnostics();
    }, interval);
  });
}

module.exports = {
  runDiagnostics,
  testHttp,
  testDns,
  testPing,
  testTcpConnect
};
