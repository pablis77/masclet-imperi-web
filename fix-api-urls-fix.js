// Script para corregir URLs de API en entorno de producción
// Versión compatible con ES Modules

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verificar ambiente
const environment = process.env.NODE_ENV || 'development';
console.log('🔍 Entorno detectado:', environment);

// Solo aplicar correcciones en producción
if (environment === 'production') {
  console.log('🔧 Aplicando correcciones para entorno de producción...');
  
  // Archivos a procesar
  const clientDir = path.resolve(__dirname, 'dist/client/_astro');
  
  try {
    const files = fs.readdirSync(clientDir);
    let filesFixed = 0;

    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(clientDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Reemplazar URLs absolutas con relativas para que funcione el proxy
        // Ejemplo: cambiar http://127.0.0.1:8000/api/v1/endpoint por /api/v1/endpoint
        const originalContent = content;
        content = content.replace(/http:\/\/127\.0\.0\.1:8000\/api\/v1\//g, '/api/v1/');
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          filesFixed++;
          console.log(`✅ Fixed: ${file}`);
        }
      }
    });

    console.log(`🎉 Corrección completada! ${filesFixed} archivos modificados.`);
  } catch (error) {
    console.error('❌ Error procesando archivos:', error);
  }
} else {
  console.log('ℹ️ No se requieren correcciones en entorno de desarrollo');
}
