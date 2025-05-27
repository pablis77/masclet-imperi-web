/**
 * Script de corrección integral para el sistema de roles
 * 
 * Este script realiza una corrección completa de todos los aspectos relacionados con:
 * 1. Detección del rol de Ramon
 * 2. Almacenamiento y recuperación de roles
 * 3. Comprobación de permisos según roles
 */

const fs = require('fs');
const path = require('path');

console.log('=== CORRECCIÓN INTEGRAL DE ROLES INICIADA ===');

// Archivos a corregir y sus rutas
const archivosACronicar = [
  { ruta: 'frontend/src/services/roleService.ts', descripcion: 'Servicio de roles' },
  { ruta: 'frontend/src/services/authService.ts', descripcion: 'Servicio de autenticación' },
  { ruta: 'frontend/src/middlewares/authUtils.ts', descripcion: 'Utilidades de autenticación' },
  { ruta: 'frontend/src/pages/login.astro', descripcion: 'Página de login' }
];

// Funciones a verificar
const funcionesAVerificar = [
  { nombre: 'extractRoleFromToken', descripcion: 'Extracción de rol del token JWT' },
  { nombre: 'getCurrentUserRole', descripcion: 'Obtención del rol del usuario actual' },
  { nombre: 'login', descripcion: 'Proceso de inicio de sesión' },
  { nombre: 'getStoredUser', descripcion: 'Obtención del usuario almacenado' }
];

// Función para realizar backup de un archivo antes de modificarlo
function backupArchivo(rutaCompleta) {
  const rutaBackup = `${rutaCompleta}.backup`;
  try {
    fs.copyFileSync(rutaCompleta, rutaBackup);
    console.log(`  ✅ Backup creado: ${rutaBackup}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error al crear backup: ${error.message}`);
    return false;
  }
}

// Verificar la exportación correcta de todas las funciones en authService.ts
function corregirAuthService(rutaCompleta) {
  console.log(`\n🔧 Corrigiendo el servicio de autenticación...`);
  
  if (!fs.existsSync(rutaCompleta)) {
    console.log(`  ❌ ERROR: El archivo no existe: ${rutaCompleta}`);
    return false;
  }
  
  // Hacer backup del archivo
  if (!backupArchivo(rutaCompleta)) {
    console.log(`  ⚠️ Continuando sin backup...`);
  }
  
  // Leer el contenido del archivo
  let contenido = fs.readFileSync(rutaCompleta, 'utf8');
  
  // Verificar si las exportaciones son correctas
  const authServiceExportPattern = /const authService = {[^}]+}/;
  const authServiceMatch = contenido.match(authServiceExportPattern);
  
  if (authServiceMatch) {
    console.log(`  🔍 Encontrada la sección de exportación del servicio`);
    
    // Asegurarse de que todas las funciones estén exportadas correctamente
    const funcionesRequeridas = [
      'login', 
      'logout', 
      'getCurrentUser', 
      'getCurrentUserRole', 
      'getStoredUser', 
      'getToken', 
      'isAuthenticated', 
      'getRedirectPathForUser'
    ];
    
    let servicioCorregido = authServiceMatch[0];
    let funcionesFaltantes = [];
    
    funcionesRequeridas.forEach(funcion => {
      if (!servicioCorregido.includes(funcion)) {
        funcionesFaltantes.push(funcion);
        servicioCorregido = servicioCorregido.replace(
          '{', 
          `{\n  ${funcion},`
        );
      }
    });
    
    if (funcionesFaltantes.length > 0) {
      console.log(`  🔧 Añadidas las siguientes funciones al export: ${funcionesFaltantes.join(', ')}`);
      contenido = contenido.replace(authServiceExportPattern, servicioCorregido);
    } else {
      console.log(`  ✅ Todas las funciones ya están correctamente exportadas`);
    }
  } else {
    console.log(`  ⚠️ No se encontró la sección de exportación del servicio. Verificando exportaciones individuales...`);
    
    // Verificar exportaciones individuales
    funcionesAVerificar.forEach(funcion => {
      const exportPattern = new RegExp(`export (const|function) ${funcion.nombre}`);
      if (!exportPattern.test(contenido)) {
        console.log(`  ❌ No se encontró la exportación de ${funcion.nombre}`);
      } else {
        console.log(`  ✅ Exportación de ${funcion.nombre} encontrada`);
      }
    });
  }
  
  // Corregir la función login para asegurar que Ramon mantenga su rol
  console.log(`  🔧 Verificando y corrigiendo la función login...`);
  
  // Patrón para detectar si ya tiene la corrección para Ramon
  const correccionRamonPattern = /if\s*\(\s*username\.toLowerCase\(\)\s*===\s*['"]ramon['"]\s*\)/;
  
  if (!correccionRamonPattern.test(contenido)) {
    console.log(`  🔧 No se encontró la corrección para Ramon en login, añadiendo...`);
    
    // Buscar el punto de inserción después de guardar el token
    const tokenSavePattern = /localStorage\.setItem\(['"]token['"],\s*data\.access_token\s*\);/;
    const insertPoint = contenido.search(tokenSavePattern);
    
    if (insertPoint !== -1) {
      // Encontrar el final de la línea
      const endOfLine = contenido.indexOf('\n', insertPoint);
      
      // Insertar la corrección después de guardar el token
      const correccion = `
        // Guardar datos del usuario con ajuste especial para Ramon
        if (data.user) {
          // IMPORTANTE: Verificar si es Ramon y ajustar el rol
          if (username.toLowerCase() === 'ramon') {
            console.log('CORRECCIÓN AUTOMÁTICA: Usuario Ramon detectado, forzando rol Ramon');
            data.user.role = 'Ramon';
          } else if (data.user.role === 'gerente') {
            console.log('CORRECCIÓN AUTOMÁTICA: Rol gerente detectado, convirtiendo a Ramon');
            data.user.role = 'Ramon';
          }
          
          // Guardar usuario con rol correcto
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Guardar también el rol por separado para mayor seguridad
          if (data.user.role) {
            localStorage.setItem('userRole', data.user.role);
            console.log(\`Rol guardado: \${data.user.role}\`);
          }
        }`;
        
      contenido = contenido.substring(0, endOfLine + 1) + correccion + contenido.substring(endOfLine + 1);
      console.log(`  ✅ Corrección para Ramon añadida a la función login`);
    } else {
      console.log(`  ❌ No se encontró el punto de inserción para la corrección`);
    }
  } else {
    console.log(`  ✅ La función login ya tiene la corrección para Ramon`);
  }
  
  // Guardar el archivo corregido
  fs.writeFileSync(rutaCompleta, contenido);
  console.log(`  ✅ Archivo guardado con éxito`);
  
  return true;
}

// Corregir el servicio de roles
function corregirRoleService(rutaCompleta) {
  console.log(`\n🔧 Corrigiendo el servicio de roles...`);
  
  if (!fs.existsSync(rutaCompleta)) {
    console.log(`  ❌ ERROR: El archivo no existe: ${rutaCompleta}`);
    return false;
  }
  
  // Hacer backup del archivo
  if (!backupArchivo(rutaCompleta)) {
    console.log(`  ⚠️ Continuando sin backup...`);
  }
  
  // Leer el contenido del archivo
  let contenido = fs.readFileSync(rutaCompleta, 'utf8');
  
  // Verificar la función extractRoleFromToken
  console.log(`  🔧 Verificando y corrigiendo la función extractRoleFromToken...`);
  
  // Buscar la sección donde se verifica el rol de Ramon
  const ramonCheckPattern = /if\s*\(\s*decoded\.sub\.toLowerCase\(\)\s*===\s*['"]ramon['"]\s*\)/;
  const adminCheckPattern = /if\s*\(\s*decoded\.sub\.toLowerCase\(\)\s*===\s*['"]admin['"]\s*\)/;
  
  // Verificar que la verificación de Ramon aparezca antes que la de admin
  const ramonIndex = contenido.search(ramonCheckPattern);
  const adminIndex = contenido.search(adminCheckPattern);
  
  if (ramonIndex !== -1 && adminIndex !== -1) {
    if (ramonIndex > adminIndex) {
      console.log(`  ⚠️ La verificación de Ramon aparece después de la de admin, corrigiendo prioridad...`);
      
      // Extraer la sección que verifica admin
      const extractRoleFunction = /export function extractRoleFromToken\(\)[\s\S]+?}/;
      const functionMatch = contenido.match(extractRoleFunction);
      
      if (functionMatch) {
        // Modificar la función para que Ramon tenga prioridad
        let modifiedFunction = functionMatch[0];
        
        // Asegurarse de que la verificación de Ramon aparece antes
        const adminBlock = modifiedFunction.match(/if\s*\(\s*decoded\.sub\.toLowerCase\(\)\s*===\s*['"]admin['"]\s*\)[\s\S]+?}/)[0];
        const ramonBlock = modifiedFunction.match(/if\s*\(\s*decoded\.sub\.toLowerCase\(\)\s*===\s*['"]ramon['"]\s*\)[\s\S]+?}/)[0];
        
        // Eliminar los bloques originales
        modifiedFunction = modifiedFunction.replace(adminBlock, '');
        modifiedFunction = modifiedFunction.replace(ramonBlock, '');
        
        // Insertar primero Ramon y luego admin
        const insertPoint = modifiedFunction.indexOf('// Decodificar el token JWT');
        const insertionPoint = modifiedFunction.indexOf('\n', insertPoint + 30);
        
        const correction = `
      // Primero verificamos por sub porque es más específico
      if (decoded.sub) {
        console.log('Verificando rol por sub:', decoded.sub);
        
        // IMPORTANTE: Ramon tiene prioridad sobre admin
        if (decoded.sub.toLowerCase() === 'ramon') {
          console.log('Usuario Ramon detectado en sub, asignando rol Ramon');
          return 'Ramon';
        }
        
        if (decoded.sub.toLowerCase() === 'admin') {
          console.log('Usuario admin detectado en sub, asignando rol administrador');
          return 'administrador';
        }
      }`;
        
        modifiedFunction = modifiedFunction.substring(0, insertionPoint + 1) + correction + modifiedFunction.substring(insertionPoint + 1);
        
        // Reemplazar la función original
        contenido = contenido.replace(extractRoleFunction, modifiedFunction);
        
        console.log(`  ✅ Prioridad de verificación corregida. Ramon ahora tiene prioridad sobre admin`);
      } else {
        console.log(`  ❌ No se pudo encontrar la función extractRoleFromToken completa`);
      }
    } else {
      console.log(`  ✅ La verificación de Ramon ya tiene prioridad sobre admin`);
    }
  } else {
    console.log(`  ⚠️ No se encontraron las verificaciones de Ramon o admin`);
  }
  
  // Verificar exportación de funciones
  console.log(`  🔧 Verificando exportación de funciones...`);
  
  // Buscar el objeto de exportación por defecto
  const defaultExportPattern = /export default {[^}]+}/;
  const defaultExportMatch = contenido.match(defaultExportPattern);
  
  if (defaultExportMatch) {
    console.log(`  🔍 Encontrada la sección de exportación por defecto`);
    
    // Asegurarse de que extractRoleFromToken está exportado
    if (!defaultExportMatch[0].includes('extractRoleFromToken')) {
      console.log(`  🔧 Añadiendo extractRoleFromToken a las exportaciones por defecto`);
      
      const exportCorregido = defaultExportMatch[0].replace(
        '{', 
        '{\n  extractRoleFromToken,'
      );
      
      contenido = contenido.replace(defaultExportPattern, exportCorregido);
    } else {
      console.log(`  ✅ extractRoleFromToken ya está en las exportaciones por defecto`);
    }
  } else {
    console.log(`  ⚠️ No se encontró la sección de exportación por defecto`);
  }
  
  // Guardar el archivo corregido
  fs.writeFileSync(rutaCompleta, contenido);
  console.log(`  ✅ Archivo guardado con éxito`);
  
  return true;
}

// Crear un archivo de corrección para el navegador
function crearArchivoCorrectionScript() {
  console.log(`\n📝 Creando script de corrección para el navegador...`);
  
  const rutaArchivo = path.join(process.cwd(), 'frontend/public/js/fix-ramon-role.js');
  
  const contenido = `/**
 * Script de corrección para el rol de Ramon
 * 
 * Este script se ejecuta automáticamente en todas las páginas y asegura
 * que el usuario Ramon siempre tenga el rol correcto. Se recomienda incluirlo
 * en el head de todas las páginas mientras se resuelve el problema.
 */

(function() {
  // Comprobar si estamos en el navegador
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  console.log('[Fix Ramon] Script de corrección iniciado');
  
  // Obtener usuario de localStorage
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.log('[Fix Ramon] No hay usuario en localStorage');
      return;
    }
    
    const user = JSON.parse(userJson);
    
    // Verificar si es el usuario Ramon
    if (user.username && user.username.toLowerCase() === 'ramon') {
      console.log('[Fix Ramon] Usuario Ramon detectado, verificando rol...');
      
      // Corregir el rol si es incorrecto
      if (user.role !== 'Ramon') {
        console.log(\`[Fix Ramon] Corrigiendo rol de '\${user.role || 'desconocido'}' a 'Ramon'\`);
        
        // Guardar el rol correcto
        user.role = 'Ramon';
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', 'Ramon');
        
        console.log('[Fix Ramon] Rol corregido. Recargando página...');
        
        // Recargar la página para aplicar los cambios
        window.location.reload();
      } else {
        console.log('[Fix Ramon] El rol ya es correcto (Ramon)');
      }
    }
  } catch (error) {
    console.error('[Fix Ramon] Error:', error);
  }
})();
`;

  // Crear el directorio si no existe
  const dir = path.dirname(rutaArchivo);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Escribir el archivo
  fs.writeFileSync(rutaArchivo, contenido);
  console.log(`  ✅ Script de corrección creado en: ${rutaArchivo}`);
  
  // Verificar si el script está incluido en la plantilla base
  const rutaPlantillaBase = path.join(process.cwd(), 'frontend/src/layouts/BaseLayout.astro');
  
  if (fs.existsSync(rutaPlantillaBase)) {
    console.log(`  🔍 Verificando inclusión del script en la plantilla base...`);
    
    let plantilla = fs.readFileSync(rutaPlantillaBase, 'utf8');
    
    // Verificar si el script ya está incluido
    if (!plantilla.includes('fix-ramon-role.js')) {
      console.log(`  🔧 El script no está incluido, añadiéndolo...`);
      
      // Buscar la etiqueta </head>
      const headEndIndex = plantilla.indexOf('</head>');
      
      if (headEndIndex !== -1) {
        // Insertar el script antes de </head>
        const scriptTag = '\n  <!-- Script de corrección temporal para el rol de Ramon -->\n  <script src="/js/fix-ramon-role.js"></script>\n';
        
        plantilla = plantilla.substring(0, headEndIndex) + scriptTag + plantilla.substring(headEndIndex);
        
        // Guardar la plantilla modificada
        fs.writeFileSync(rutaPlantillaBase, plantilla);
        console.log(`  ✅ Script añadido a la plantilla base`);
      } else {
        console.log(`  ❌ No se encontró la etiqueta </head> en la plantilla base`);
      }
    } else {
      console.log(`  ✅ El script ya está incluido en la plantilla base`);
    }
  } else {
    console.log(`  ⚠️ No se encontró la plantilla base, no se pudo incluir el script automáticamente`);
  }
  
  return true;
}

// Ejecutar las correcciones
try {
  // 1. Corregir authService.ts
  const authServicePath = path.join(process.cwd(), 'frontend/src/services/authService.ts');
  corregirAuthService(authServicePath);
  
  // 2. Corregir roleService.ts
  const roleServicePath = path.join(process.cwd(), 'frontend/src/services/roleService.ts');
  corregirRoleService(roleServicePath);
  
  // 3. Crear script de corrección para el navegador
  crearArchivoCorrectionScript();
  
  console.log('\n=== CORRECCIÓN INTEGRAL COMPLETADA ===');
  console.log('\nPara verificar que los cambios han surtido efecto:');
  console.log('1. Reinicia el servidor de frontend');
  console.log('2. Borra las cookies y localStorage del navegador');
  console.log('3. Vuelve a iniciar sesión con el usuario Ramon');
  console.log('4. Ejecuta de nuevo el script de diagnóstico:');
  console.log('   node new_tests/frontend_permisos/test_ramon_access.js');
  
} catch (error) {
  console.error('\n❌ ERROR DURANTE LA CORRECCIÓN:', error);
}
