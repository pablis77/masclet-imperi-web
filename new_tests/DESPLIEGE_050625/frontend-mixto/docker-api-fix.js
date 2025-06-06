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

// Creamos el archivo de inyección HTML con etiquetas script
const injectionFile = path.join(__dirname, 'docker-api-injection.html');
const injectionContent = `<script src="/docker-api-config.js" type="text/javascript"></script><script>console.log('🔌 Script de configuración Docker inyectado');</script>`;

fs.writeFileSync(injectionFile, injectionContent);
console.log(`✅ Script de inyección HTML creado: ${injectionFile}`);

// Interceptamos las respuestas HTTP para inyectar nuestro script en páginas HTML
try {
  // Solo intentamos modificar módulos Node si aún no estamos en el proceso de importación
  // Creamos la función para interceptar y modificar las respuestas
  const setupHttpInterceptor = () => {
    const http = require('http');
    const originalCreateServer = http.createServer;
    
    // Reemplazamos el método createServer para interceptar las respuestas
    http.createServer = function(requestListener) {
      // Si no hay listener, devolvemos el servidor original
      if (!requestListener) {
        return originalCreateServer();
      }
      
      // Envolvemos el listener original para interceptar respuestas
      const wrappedListener = (req, res) => {
        // Guardamos los métodos originales
        const originalWrite = res.write;
        const originalEnd = res.end;
        
        // Solo modificamos respuestas HTML
        const isHtml = (res.getHeader('content-type') || '').includes('html');
        
        if (isHtml) {
          let body = '';
          
          // Interceptamos el método write
          res.write = function(chunk, encoding, callback) {
            // Capturamos el contenido
            body += chunk.toString();
            return true; // Indicamos que se procesó correctamente
          };
          
          // Interceptamos el método end
          res.end = function(chunk, encoding, callback) {
            // Añadimos el último chunk si existe
            if (chunk) {
              body += chunk.toString();
            }
            
            try {
              // Leemos el contenido de inyección
              const injectionPath = path.join(__dirname, 'docker-api-injection.html');
              const injectionScript = fs.readFileSync(injectionPath, 'utf8');
              
              // Inyectamos justo antes del cierre del body usando template literals para manejar correctamente el string
              body = body.replace('</body>', `${injectionScript}</body>`);
              
              // Restauramos los métodos originales
              res.write = originalWrite;
              res.end = originalEnd;
              
              // Enviamos el contenido modificado
              return originalEnd.call(res, body, encoding, callback);
            } catch (error) {
              console.error(`❌ Error al inyectar script: ${error.message}`);
              // En caso de error, enviamos el contenido original
              res.write = originalWrite;
              res.end = originalEnd;
              return originalEnd.call(res, body, encoding, callback);
            }
          };
        }
        
        // Llamamos al listener original con la request y la response modificada
        return requestListener(req, res);
      };
      
      // Creamos el servidor con nuestro listener modificado
      return originalCreateServer(wrappedListener);
    };
    
    console.log('✅ Interceptor HTTP instalado correctamente');
  };
  
  // Ejecutamos la función para instalar el interceptor
  setupHttpInterceptor();
  
  // Si estamos usando Express, también interceptamos su método estático
  try {
    const expressPath = path.join(__dirname, 'node_modules', 'express');
    if (fs.existsSync(expressPath)) {
      console.log('🔍 Detectado Express, configurando middleware...');
      const express = require('express');
      const originalStatic = express.static;
      
      // Envolvemos el método static de Express
      express.static = function(root, options) {
        const originalMiddleware = originalStatic(root, options);
        
        // Creamos un nuevo middleware para inyectar nuestro script
        return function(req, res, next) {
          // Guardamos el método original send
          const originalSend = res.send;
          
          // Solo interceptamos respuestas HTML
          res.send = function(body) {
            // Si es una respuesta HTML, inyectamos nuestro script
            if (typeof body === 'string' && body.includes('</body>') && 
                (res.get('Content-Type') || '').includes('html')) {
              try {
                const injectionPath = path.join(__dirname, 'docker-api-injection.html');
                const injectionScript = fs.readFileSync(injectionPath, 'utf8');
                body = body.replace('</body>', `${injectionScript}</body>`);
              } catch (error) {
                console.error(`❌ Error al inyectar script en Express: ${error.message}`);
              }
            }
            
            // Llamamos al método original con el contenido modificado
            return originalSend.call(this, body);
          };
          
          // Continuamos con el middleware original
          return originalMiddleware(req, res, next);
        };
      };
      
      console.log('✅ Middleware Express configurado correctamente');
    }
  } catch (expressError) {
    console.log(`ℹ️ Express no encontrado o no requiere modificación: ${expressError.message}`);
  }
} catch (error) {
  console.error(`❌ Error al configurar interceptor HTTP: ${error.message}`);
}

console.log('✅ Corrección de URLs de API completada');
