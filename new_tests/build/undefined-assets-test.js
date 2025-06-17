/**
 * Test para verificar que organizeSectionAssets maneja correctamente el caso de assets.js undefined
 *
 * Este test simula el caso específico que causó el fallo en Build 28 de Amplify:
 * - assets tiene allJs pero no tiene js
 */

const { organizeSectionAssets } = require('../../frontend/build-modules/section-loader.cjs');

/**
 * Prueba que la función organizeSectionAssets maneja correctamente assets.js undefined
 */
function testUndefinedAssetsJs() {
  console.log('[TEST] Iniciando prueba para assets.js undefined...');

  // Crear un objeto assets que tenga allJs pero no js (simular el caso de fallo)
  const mockAssets = {
    allJs: ['vendor.12345.js', 'client.67890.js', 'apiConfig.abcde.js'],
    allCss: ['styles.12345.css']
    // Intencionalmente no definimos assets.js para simular el error
  };

  try {
    // Ejecutar la función con el objeto simulado
    const result = organizeSectionAssets(mockAssets, 'DASHBOARD');
    
    // Verificar que no hay errores y que el resultado tiene la estructura esperada
    if (!result) {
      console.error('❌ ERROR: organizeSectionAssets devolvió un resultado vacío');
      return false;
    }

    if (!result.core || !Array.isArray(result.core.js)) {
      console.error('❌ ERROR: El resultado no tiene la estructura esperada (core.js)');
      return false;
    }

    // Comprobar que al menos algunos scripts fueron procesados correctamente
    if (result.core.js.length === 0) {
      console.error('❌ ERROR: No se encontraron scripts core en el resultado');
      console.error('Resultado:', JSON.stringify(result, null, 2));
      return false;
    }

    console.log('✅ ÉXITO: La función maneja correctamente el caso de assets.js undefined');
    console.log('✅ Scripts core detectados:', result.core.js.length);
    console.log(result.core.js);
    
    return true;
  } catch (error) {
    console.error(`❌ ERROR: La prueba falló con el error: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

// Ejecutar el test
const success = testUndefinedAssetsJs();
process.exit(success ? 0 : 1);
