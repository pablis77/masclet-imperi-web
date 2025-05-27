/**
 * Diagnóstico directo del problema de roles para el usuario Ramon
 * Este script analiza los archivos del frontend para identificar exactamente el problema
 */

const fs = require('fs');
const path = require('path');

console.log('=== DIAGNÓSTICO DEL SISTEMA DE ROLES PARA RAMON ===');

// Analizamos los archivos clave relacionados con la autenticación y roles
const archivosACronicar = [
  { ruta: 'frontend/src/services/roleService.ts', descripcion: 'Servicio de roles' },
  { ruta: 'frontend/src/services/authService.ts', descripcion: 'Servicio de autenticación' },
  { ruta: 'frontend/src/middlewares/authUtils.ts', descripcion: 'Utilidades de autenticación' },
  { ruta: 'frontend/src/pages/login.astro', descripcion: 'Página de login' }
];

// Funciones a buscar y analizar en el código
const funcionesABuscar = [
  { nombre: 'extractRoleFromToken', descripcion: 'Extracción de rol del token JWT' },
  { nombre: 'getCurrentUserRole', descripcion: 'Obtención del rol del usuario actual' },
  { nombre: 'login', descripcion: 'Proceso de inicio de sesión' },
  { nombre: 'getStoredUser', descripcion: 'Obtención del usuario almacenado' }
];

// Patrones de problemas conocidos
const patronesProblemas = [
  { patron: /decoded\.username\s*===\s*['"]admin['"]\s*\|\|\s*decoded\.sub\s*===\s*['"]admin['"]/, descripcion: 'Problema: Se está asignando rol "administrador" cuando sub o username es "admin"' },
  { patron: /Ramon/i, descripcion: 'Comprobación de usuario Ramon' },
  { patron: /gerente/i, descripcion: 'Compatibilidad con rol "gerente"' },
  { patron: /localStorage\.setItem\(['"]user['"]/, descripcion: 'Almacenamiento del usuario en localStorage' }
];

// Revisar cada archivo
archivosACronicar.forEach(archivo => {
  const rutaCompleta = path.join(process.cwd(), archivo.ruta);
  console.log(`\n\n==== ANALIZANDO: ${archivo.descripcion} (${archivo.ruta}) ====`);
  
  try {
    // Comprobar si el archivo existe
    if (!fs.existsSync(rutaCompleta)) {
      console.log(`  ❌ ERROR: El archivo no existe: ${rutaCompleta}`);
      return;
    }
    
    // Leer el contenido del archivo
    const contenido = fs.readFileSync(rutaCompleta, 'utf8');
    console.log(`  ✅ Archivo encontrado (${contenido.length} bytes)`);
    
    // Buscar las funciones relevantes
    funcionesABuscar.forEach(funcion => {
      // Modificada para ser más flexible en la detección
      const regex = new RegExp(`(function\\s+${funcion.nombre}|const\\s+${funcion.nombre}|export\\s+function\\s+${funcion.nombre}|export\\s+const\\s+${funcion.nombre}|${funcion.nombre}\\s*[:=]|${funcion.nombre}\\s*\\()`, "i");
      const encontrada = regex.test(contenido);
      
      if (encontrada) {
        console.log(`  ✅ Función encontrada: ${funcion.nombre} - ${funcion.descripcion}`);
        
        // Intentar extraer la función completa para análisis
        const inicioRegex = regex;
        const inicioMatch = contenido.match(inicioRegex);
        
        if (inicioMatch && inicioMatch.index !== undefined) {
          const inicio = inicioMatch.index;
          let texto = contenido.substring(inicio, inicio + 1000); // Mostrar los primeros 1000 caracteres
          texto = texto.replace(/\n\s*\n/g, '\n'); // Eliminar líneas vacías extras
          
          console.log('  --- Código relevante (primeras líneas) ---');
          console.log(`  ${texto.split('\n').slice(0, 15).join('\n  ')}...`);
          console.log('  --- Fin del código relevante ---');
        }
      } else {
        console.log(`  ❌ Función NO encontrada: ${funcion.nombre}`);
      }
    });
    
    // Buscar patrones de problemas conocidos
    console.log('\n  --- Buscando patrones de problemas ---');
    patronesProblemas.forEach(patron => {
      const encontrado = patron.patron.test(contenido);
      if (encontrado) {
        console.log(`  ⚠️ PATRÓN DETECTADO: ${patron.descripcion}`);
        
        // Encontrar la línea exacta donde está el patrón
        const lineas = contenido.split('\n');
        const lineasConPatron = lineas.filter(linea => patron.patron.test(linea));
        
        if (lineasConPatron.length > 0) {
          console.log('  --- Líneas con el patrón ---');
          lineasConPatron.forEach(linea => {
            console.log(`  ${linea.trim()}`);
          });
        }
      } else {
        console.log(`  ✅ No se encontró el patrón: ${patron.descripcion}`);
      }
    });
    
  } catch (error) {
    console.error(`  ❌ ERROR al analizar el archivo: ${error.message}`);
  }
});

// Generar propuesta de corrección
console.log('\n\n==== DIAGNÓSTICO FINAL Y PROPUESTA DE SOLUCIÓN ====');
console.log('\nEl problema probablemente está en alguna de estas áreas:');
console.log('1. El proceso de login no está asignando correctamente el rol a Ramon');
console.log('2. La función extractRoleFromToken está priorizando incorrectamente la detección de "admin"');
console.log('3. El objeto de usuario guardado en localStorage tiene información incorrecta');

console.log('\nSOLUCIÓN PROPUESTA:');
console.log('1. Modificar roleService.ts para priorizar la detección de Ramon por nombre de usuario');
console.log('2. Corregir el proceso de login para asignar explícitamente el rol Ramon cuando corresponda');
console.log('3. Revisar cómo se guarda el usuario en localStorage después del login');

console.log('\n=== FIN DEL DIAGNÓSTICO ===');
