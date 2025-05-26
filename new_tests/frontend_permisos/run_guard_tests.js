/**
 * Script ejecutable para las pruebas de componentes de protección
 * Este script transpila y ejecuta las pruebas TypeScript
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando pruebas de componentes de protección...');

try {
  // Comprobar que tenemos acceso a las dependencias necesarias
  const frontendDir = path.resolve(__dirname, '../../frontend');
  
  if (!fs.existsSync(frontendDir)) {
    throw new Error(`No se encuentra el directorio frontend en: ${frontendDir}`);
  }
  
  console.log('📂 Directorio frontend encontrado');
  
  // Intentar ejecutar el test con ts-node si está disponible
  try {
    console.log('🔄 Intentando ejecutar con ts-node...');
    execSync('npx ts-node ./test_guards.ts', { 
      cwd: __dirname, 
      stdio: 'inherit' 
    });
  } catch (error) {
    // Si falla, intentar instalarlo y volver a ejecutar
    console.log('⚠️ ts-node no disponible, instalando temporalmente...');
    execSync('npm install -D ts-node typescript @types/node', { 
      cwd: path.resolve(__dirname, '../../'), 
      stdio: 'inherit' 
    });
    
    console.log('🔄 Ejecutando pruebas con ts-node recién instalado...');
    execSync('npx ts-node ./test_guards.ts', { 
      cwd: __dirname, 
      stdio: 'inherit' 
    });
  }
  
  console.log('✅ Pruebas completadas exitosamente');
} catch (error) {
  console.error('❌ Error al ejecutar las pruebas:', error.message);
  console.error('Por favor, verifica que todas las dependencias están instaladas y que los archivos de servicio existen.');
  process.exit(1);
}
