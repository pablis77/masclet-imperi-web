/**
 * docker-api-master.js
 * Archivo principal que coordina todos los módulos del sistema de ajuste de API para Docker
 * 
 * Este coordinador permite una estructura modular donde cada módulo se encarga de una 
 * funcionalidad específica, haciendo el sistema más mantenible y escalable.
 */
const fs = require('fs');
const path = require('path');

// Importar módulos especializados
const detector = require('./docker-api-detector');
const config = require('./docker-api-config');
const injector = require('./docker-api-injector');

console.log(`
████████████████████████████████████████████████████████████████
█ MASCLET IMPERI - CONFIGURADOR AUTOMÁTICO DE API PARA DOCKER █
████████████████████████████████████████████████████████████████
`);

// Función principal asíncrona
async function main() {
  try {
    console.log('🚀 Iniciando configuración de conexión API para Docker...');
    
    // PASO 1: Comprobar si estamos en entorno Docker
    const isDocker = detector.isDockerEnvironment();
    if (!isDocker) {
      console.log('ℹ️ No estamos en entorno Docker. Finalizando sin cambios.');
      return;
    }
    
    console.log('✅ Entorno Docker confirmado, aplicando configuración...');
    
    // PASO 2: Obtener IP del backend
    const backendUrl = await detector.getBackendIP();
    console.log(`🔌 URL del backend detectada: ${backendUrl}`);
    
    // PASO 3: Generar configuración y archivos de inyección
    const configGenerated = await config.generateApiConfig(backendUrl);
    if (!configGenerated) {
      console.error('❌ Error al generar configuración. Abortando.');
      return;
    }
    
    // PASO 4: Modificar servidor para usar la URL del backend
    const entryModified = config.modifyServerEntry(backendUrl);
    if (!entryModified) {
      console.warn('⚠️ No se pudo modificar el punto de entrada del servidor.');
      // Continuamos igualmente, no es fatal
    }
    
    // PASO 5: Configurar interceptores HTTP
    const httpInterceptorSetup = injector.setupHttpInterceptor();
    if (!httpInterceptorSetup) {
      console.warn('⚠️ No se pudo configurar el interceptor HTTP.');
      // Continuamos igualmente, no es fatal
    }
    
    // PASO 6: Configurar middleware para Express (si está disponible)
    injector.setupExpressMiddleware();
    
    // Crear un archivo con la configuración aplicada para diagnóstico
    const statusInfo = {
      timestamp: new Date().toISOString(),
      environment: 'Docker',
      backendUrl,
      configGenerated,
      entryModified,
      httpInterceptorSetup
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'docker-api-status.json'),
      JSON.stringify(statusInfo, null, 2)
    );
    
    console.log(`
✅✅✅ CONFIGURACIÓN COMPLETADA CON ÉXITO ✅✅✅
- URL del backend: ${backendUrl}
- Archivos de configuración: Generados correctamente
- Servidor: ${entryModified ? 'Configurado' : 'No modificado'}
- Interceptores: ${httpInterceptorSetup ? 'Activos' : 'No configurados'}

La aplicación usará la API del backend correctamente dentro de Docker.
    `);
  } catch (error) {
    console.error(`
❌❌❌ ERROR EN LA CONFIGURACIÓN ❌❌❌
${error.message}
${error.stack}

Intentaremos seguir con la configuración por defecto.
    `);
  }
}

// Ejecutar función principal
main().catch(error => {
  console.error(`❌ Error fatal en docker-api-master: ${error.message}`);
  process.exit(1);
});
