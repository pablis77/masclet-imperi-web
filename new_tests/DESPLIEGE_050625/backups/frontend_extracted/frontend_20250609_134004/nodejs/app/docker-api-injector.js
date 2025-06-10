/**
 * docker-api-injector.js
 * Módulo para inyectar configuración en respuestas HTTP y Express
 */
const fs = require('fs');
const path = require('path');

// Exportamos funciones
module.exports = {
  setupHttpInterceptor,
  setupExpressMiddleware
};

/**
 * Configura un interceptor HTTP para inyectar nuestro script en las respuestas
 * @returns {boolean} true si se configuró correctamente
 */
function setupHttpInterceptor() {
  try {
    console.log('--- CONFIGURANDO INTERCEPTOR HTTP PARA DOCKER API ---');
    
    const http = require('http');
    const originalCreateServer = http.createServer;
    
    // Comprobar que existe el archivo de inyección
    const injectionPath = path.join(__dirname, 'docker-api-injection.html');
    if (!fs.existsSync(injectionPath)) {
      console.error(`❌ No se encontró archivo de inyección: ${injectionPath}`);
      // Generamos uno básico para no fallar
      console.log('🔧 Creando archivo de inyección básico...');
      
      const basicInjection = `<script>
        console.log('%c🐳 DOCKER API INJECTOR (EMERGENCIA)', 'background: red; color: white; font-size: 12px;');
        console.log('API_URL sobrescrita a:', window.API_URL);
        console.log('Configuración actuando en modo de emergencia, puede haber problemas de conectividad');
      </script>`;
      
      fs.writeFileSync(injectionPath, basicInjection, 'utf8');
      console.log('✅ Archivo de inyección de emergencia creado');
    }
    
    // Crear una ruta de diagnóstico para pruebas de conectividad
    console.log('🔧 Configurando ruta de diagnóstico /docker-api-health...');
    
    // Reemplazamos el método createServer para interceptar respuestas
    http.createServer = function(requestListener) {
      // Si no hay listener, devolvemos el servidor original
      if (!requestListener) {
        return originalCreateServer();
      }
      
      // Envolvemos el listener original para interceptar respuestas
      const wrappedListener = (req, res) => {
        // Interceptamos la ruta de diagnóstico
        if (req.url === '/docker-api-health') {
          console.log('💬 Solicitud de diagnóstico recibida');
          
          // Creamos un informe de estado
          const statusReport = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'desconocido',
            apiUrl: process.env.API_URL || 'no configurado',
            hostname: process.env.HOSTNAME || 'desconocido',
            dockerContainer: process.env.DOCKER_CONTAINER || 'desconocido'
          };
          
          // Enviamos el informe como JSON
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(statusReport, null, 2));
          return;
        }
        
        // Guardamos los métodos originales
        const originalWrite = res.write;
        const originalEnd = res.end;
        
        // Solo modificamos respuestas HTML
        const contentType = res.getHeader('content-type') || '';
        const isHtml = contentType.includes('html');
        
        if (isHtml) {
          console.log(`💬 Solicitud HTML detectada: ${req.url} [${contentType}]`);
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
              const injectionScript = fs.readFileSync(injectionPath, 'utf8');
              
              // Comprobamos si el HTML tiene etiqueta body
              if (body.includes('</body>')) {
                console.log('✅ Inyectando script en </body>');
                body = body.replace('</body>', `${injectionScript}</body>`);
              } else if (body.includes('</html>')) {
                console.log('⚠️ No se encontró </body>, inyectando antes de </html>');
                body = body.replace('</html>', `${injectionScript}</html>`);
              } else {
                console.log('⚠️ No se encontró </body> ni </html>, añadiendo al final');
                body += injectionScript;
              }
              
              // Añadimos un comentario para verificar que la inyección se realizó
              body += `\n<!-- Docker API Injector activo: ${new Date().toISOString()} -->\n`;
              
              // Restauramos los métodos originales
              res.write = originalWrite;
              res.end = originalEnd;
              
              // Enviamos el contenido modificado
              console.log('✅ Contenido HTML modificado correctamente');
              return originalEnd.call(res, body, encoding, callback);
            } catch (error) {
              console.error(`❌ Error al inyectar script: ${error.message}`);
              // En caso de error, enviamos el contenido original
              res.write = originalWrite;
              res.end = originalEnd;
              return originalEnd.call(res, body, encoding, callback);
            }
          };
        } else {
          console.log(`ℹ️ Solicitud no-HTML: ${req.url} [${contentType}]`);
        }
        
        // Llamamos al listener original con la request y response modificada
        return requestListener(req, res);
      };
      
      // Creamos el servidor con nuestro listener modificado
      const server = originalCreateServer(wrappedListener);
      
      // Capturamos errores del servidor
      server.on('error', (err) => {
        console.error(`❌ ERROR EN SERVIDOR HTTP: ${err.message}`);
      });
      
      return server;
    };
    
    console.log('✅ Interceptor HTTP instalado correctamente');
    console.log('👉 Endpoint de diagnóstico disponible en /docker-api-health');
    return true;
  } catch (error) {
    console.error(`❌ ERROR CRÍTICO al configurar interceptor HTTP: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

/**
 * Configura middleware para Express si está disponible
 * @returns {boolean} true si se configuró correctamente o no se requiere
 */
function setupExpressMiddleware() {
  try {
    const expressPath = path.join(__dirname, 'node_modules', 'express');
    if (!fs.existsSync(expressPath)) {
      console.log('ℹ️ Express no encontrado, no se requiere configuración adicional');
      return true;
    }
    
    console.log('🔍 Detectado Express, configurando middleware...');
    const express = require('express');
    const originalStatic = express.static;
    
    // Comprobar que existe el archivo de inyección
    const injectionPath = path.join(__dirname, 'docker-api-injection.html');
    if (!fs.existsSync(injectionPath)) {
      console.error(`❌ No se encontró archivo de inyección: ${injectionPath}`);
      return false;
    }
    
    // Envolvemos el método static de Express
    express.static = function(root, options) {
      const originalMiddleware = originalStatic(root, options);
      
      // Creamos un nuevo middleware para inyectar nuestro script
      return function(req, res, next) {
        // Guardamos el método original send
        const originalSend = res.send;
        
        // Interceptamos el método send
        res.send = function(body) {
          // Si es una respuesta HTML, inyectamos nuestro script
          if (typeof body === 'string' && body.includes('</body>') && 
              (res.get('Content-Type') || '').includes('html')) {
            try {
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
    return true;
  } catch (error) {
    console.log(`ℹ️ Express no requiere modificación: ${error.message}`);
    return true;
  }
}
