// Script corrector para la configuración de la API en Docker
// Este script funciona con módulos ES

console.log('🐳 Iniciando script de corrección de API para Docker...');

// Configuración principal
const API_CONFIG = {
  baseURL: '/api/v1',
  timeout: 15000,
  withCredentials: true,
  backendURL: 'http://masclet-api:8000'
};

// Función principal
async function applyFix() {
  try {
    console.log('🔧 Aplicando configuración directa para API en Docker...');
    
    // 1. Mostrar la configuración que vamos a aplicar
    console.log('📋 Configuración a aplicar:');
    console.log('- backendURL:', API_CONFIG.backendURL);
    console.log('- baseURL:', API_CONFIG.baseURL);
    
    // 2. Crear archivo de configuración con import/export
    const configContent = 
// Configuracion API simplificada para entorno de produccion
const API_CONFIG = {
  baseURL: '',
  timeout: ,
  withCredentials: true,
  backendURL: ''
};

// Logs para diagnóstico
console.log('[API Config] Modo: PRODUCCION');
console.log(\[API Config] BackendURL: \\);
console.log(\[API Config] Base URL: \\);

// Exportar configuración
export { API_CONFIG as A };
;

    // 3. Usar la API del sistema de archivos con promesas
    const { writeFile } = await import('fs/promises');
    const { join } = await import('path');
    
    // 4. Escribir el archivo de configuración
    await writeFile('/app/server/chunks/apiConfig_Qu2HXU2s.mjs', configContent, 'utf8');
    console.log('✅ Archivo de configuración del servidor actualizado');
    
    // 5. También actualizamos el archivo de configuración del cliente
    const clientConfigContent = 
// Configuración para API de producción
const apiConfig = {
  baseURL: '',
  timeout: ,
  withCredentials: true,
  backendURL: ''
};

// Exportar la configuración
export { apiConfig as A };
;
    
    await writeFile('/app/client/_astro/apiConfig.BYL0hBvc.js', clientConfigContent, 'utf8');
    console.log('✅ Archivo de configuración del cliente actualizado');
    
    console.log('🚀 Corrección aplicada con éxito');
    console.log('⚠️ IMPORTANTE: Es necesario reiniciar el contenedor para aplicar los cambios');
    
    return true;
  } catch (error) {
    console.error('❌ Error al aplicar la corrección:', error.message);
    return false;
  }
}

// Ejecutar la función principal
applyFix().then(success => {
  if (success) {
    console.log('✨ Script de corrección completado exitosamente');
  } else {
    console.error('❌ Script de corrección falló');
    process.exit(1);
  }
});
