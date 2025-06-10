/**
 * proxy-healthcheck.js - Script para verificar la conectividad al backend
 * Este script hace solicitudes al endpoint de health del backend y reporta el estado
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración
const API_URL = process.env.API_URL || 'http://masclet-api:8000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const HEALTH_ENDPOINT = `${API_URL}${API_PREFIX}/health`;
const CHECK_INTERVAL = 30000; // 30 segundos
const LOG_FILE = path.join(__dirname, 'connectivity.log');

// Función para escribir en el log
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  console.log(logEntry.trim());
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    console.error(`Error al escribir en el log: ${err.message}`);
  }
}

// Función para verificar la conectividad
function checkConnectivity() {
  writeLog(`Verificando conectividad a: ${HEALTH_ENDPOINT}`);
  
  // Elegir el cliente HTTP adecuado según el protocolo
  const client = HEALTH_ENDPOINT.startsWith('https') ? https : http;
  
  const req = client.get(HEALTH_ENDPOINT, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        writeLog(`Conexión exitosa (${res.statusCode}): ${data}`);
      } else {
        writeLog(`Respuesta inesperada (${res.statusCode}): ${data}`);
      }
    });
  });
  
  req.on('error', (error) => {
    writeLog(`Error de conexión: ${error.message}`);
  });
  
  req.end();
}

// Primera verificación inmediata
checkConnectivity();

// Verificaciones periódicas
setInterval(checkConnectivity, CHECK_INTERVAL);

writeLog('Script de verificación de conectividad iniciado');

// Para que el script no termine
process.stdin.resume();

// Manejar señales para un cierre limpio
process.on('SIGTERM', () => {
  writeLog('Señal SIGTERM recibida, terminando script de verificación');
  process.exit(0);
});
