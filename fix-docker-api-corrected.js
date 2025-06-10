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
    const configContent = `
// Configuracion API simplificada para entorno de produccion
const API_CONFIG = {
  baseURL: "${API_CONFIG.baseURL}",
  timeout: ${API_CONFIG.timeout},
  withCredentials: true,
  backendURL: "${API_CONFIG.backendURL}"
};

// Logs para diagnóstico
console.log("[API Config] Modo: PRODUCCIÓN");
console.log("[API Config] BackendURL: ${API_CONFIG.backendURL}");
console.log("[API Config] Base URL: ${API_CONFIG.baseURL}");

// Exportar configuración
export { API_CONFIG as A };
`;

    // 3. Usar la API del sistema de archivos con promesas
    const { writeFile } = await import('fs/promises');
    const { join } = await import('path');
    
    // 4. Escribir el archivo de configuración
    await writeFile('/app/server/chunks/apiConfig_Qu2HXU2s.mjs', configContent, 'utf8');
    console.log('✅ Archivo de configuración del servidor actualizado');
    
    // 5. También actualizamos el archivo de configuración del cliente
    const clientConfigContent = `
/**
 * Configuración de la API corregida para AWS con Docker
 */
const apiConfig = {
  baseURL: "${API_CONFIG.baseURL}",
  timeout: ${API_CONFIG.timeout},
  withCredentials: true,
  backendURL: "${API_CONFIG.backendURL}"
};

// Exportar para compatibilidad con módulos
if (typeof window !== 'undefined') {
  window.apiConfig = apiConfig;
  console.log("Configuración API inicializada para entorno de producción Docker:");
  console.log("- backendURL:", apiConfig.backendURL);
  console.log("- baseURL:", apiConfig.baseURL);
}

// Exportar como valor predeterminado
export default apiConfig;
`;

    // 6. Escribir la configuración del cliente
    await writeFile('/app/client/js/fix/apiConfig.js', clientConfigContent, 'utf8');
    console.log('✅ Archivo de configuración del cliente actualizado');
    
    console.log('🎉 Proceso de corrección de API completado con éxito.');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error al aplicar corrección de API:', error);
    return { success: false, error };
  }
}

// Ejecutar la función principal
applyFix().then(result => {
  if (result.success) {
    console.log('✅ Script de corrección API ejecutado correctamente');
  } else {
    console.error('❌ Script de corrección API falló:', result.error);
    process.exit(1);
  }
});
