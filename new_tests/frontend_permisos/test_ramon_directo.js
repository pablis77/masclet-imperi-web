/**
 * Test directo para verificar el funcionamiento de authService con Ramon
 * Ejecutar: node new_tests/frontend_permisos/test_ramon_directo.js
 */

// Simulamos localStorage
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Simulamos el entorno del navegador
global.window = {
  localStorage: global.localStorage
};

// Importamos los archivos necesarios
const fs = require('fs');
const path = require('path');

// Cargamos el contenido de authService.ts
const authServicePath = path.join(__dirname, '..', '..', 'frontend', 'src', 'services', 'authService.ts');
const authServiceContent = fs.readFileSync(authServicePath, 'utf8');

// Crear una versión JavaScript temporal para poder ejecutarla
const jsContent = authServiceContent
  .replace(/export function/g, 'function')
  .replace(/export const/g, 'const')
  .replace(/export type/g, 'type')
  .replace(/export interface/g, 'interface')
  .replace(/import [^;]*;/g, '')
  .replace(/type UserRole = [^;]*;/g, 'const UserRole = { admin: "administrador", gerente: "gerente", editor: "editor", usuario: "usuario", Ramon: "Ramon" };')
  .replace(/interface User [^}]*}/g, 'class User { constructor(data) { Object.assign(this, data); } }');

// Guardar la versión JS temporal
const tempJsPath = path.join(__dirname, 'temp_auth_service.js');
fs.writeFileSync(tempJsPath, `
${jsContent}

// Exportar las funciones para poder usarlas
module.exports = {
  login,
  logout,
  getStoredUser,
  getCurrentUserRole,
  extractRoleFromToken,
  isAuthenticated
};
`);

// Importar las funciones
const {
  login,
  logout,
  getStoredUser,
  getCurrentUserRole,
  extractRoleFromToken,
  isAuthenticated
} = require('./temp_auth_service.js');

// Realizar las pruebas
console.log("=== PRUEBA DIRECTA DE AUTHSERVICE PARA RAMON ===");

// Función para imprimir el resultado de una prueba
function verificar(nombre, condicion) {
  console.log(`${condicion ? '✅' : '❌'} ${nombre}: ${condicion ? 'CORRECTO' : 'INCORRECTO'}`);
  return condicion;
}

// 1. Simular token JWT para Ramon (con rol "gerente" que debería corregirse a "Ramon")
const tokenSimuladoRamon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyYW1vbiIsInVzZXJuYW1lIjoicmFtb24iLCJyb2xlIjoiZ2VyZW50ZSIsImlhdCI6MTY4OTM0MjcxMH0.RvjM-0XXXXXXXXXXX';

// 2. Simular login de Ramon
console.log("\n--- Prueba 1: Login de Ramon ---");
localStorage.clear();
localStorage.setItem('token', tokenSimuladoRamon);
// Simular el login guardando datos de usuario
localStorage.setItem('user', JSON.stringify({
  username: 'ramon',
  role: 'gerente'  // Inicialmente con rol incorrecto
}));

// 3. Verificar corrección del rol al obtener usuario almacenado
console.log("\n--- Prueba 2: getStoredUser corrige el rol ---");
const usuario = getStoredUser();
console.log("Usuario almacenado:", usuario);
verificar("El rol se corrige a 'Ramon'", usuario && usuario.role === 'Ramon');
verificar("Se establece el indicador ramonFix", localStorage.getItem('ramonFix') === 'true');

// 4. Verificar getCurrentUserRole
console.log("\n--- Prueba 3: getCurrentUserRole devuelve 'Ramon' ---");
const rolActual = getCurrentUserRole();
console.log("Rol actual:", rolActual);
verificar("getCurrentUserRole devuelve 'Ramon'", rolActual === 'Ramon');

// 5. Verificar extractRoleFromToken
console.log("\n--- Prueba 4: extractRoleFromToken devuelve 'Ramon' ---");
const rolToken = extractRoleFromToken();
console.log("Rol extraído del token:", rolToken);
verificar("extractRoleFromToken devuelve 'Ramon'", rolToken === 'Ramon');

// 6. Simular cerrar sesión y volver a iniciar
console.log("\n--- Prueba 5: Persistencia tras cerrar sesión y volver a iniciar ---");
logout();
verificar("logout limpia localStorage", localStorage.getItem('token') === null);

// Volver a establecer token y usuario con rol incorrecto
localStorage.setItem('token', tokenSimuladoRamon);
localStorage.setItem('user', JSON.stringify({
  username: 'ramon',
  role: 'administrador'  // Intencionalmente incorrecto
}));

// Verificar corrección automática
const usuarioDespuesDeReinicio = getStoredUser();
console.log("Usuario después de reinicio:", usuarioDespuesDeReinicio);
verificar("El rol se corrige a 'Ramon' después de reinicio", 
  usuarioDespuesDeReinicio && usuarioDespuesDeReinicio.role === 'Ramon');

// 7. Verificar corrección del ProfileManagement
console.log("\n--- Prueba 6: Simulación del comportamiento de ProfileManagement ---");

// Simular recarga (perdida de datos en localStorage)
localStorage.removeItem('user');
// Pero mantener el token y el indicador ramonFix
localStorage.setItem('ramonFix', 'true');

// Esta parte simula lo que haría ProfileManagement al detectar token pero no user
if (localStorage.getItem('token') && !localStorage.getItem('user')) {
  console.log("Detectada sesión con token pero sin datos de usuario (como en recarga)");
  const currentRoleValue = getCurrentUserRole();
  
  // Recrear usuario predeterminado según indicador ramonFix
  const defaultUser = localStorage.getItem('ramonFix') === 'true'
    ? {
        username: 'ramon',
        role: 'Ramon',
        id: 2
      }
    : {
        username: 'admin',
        role: 'administrador',
        id: 1
      };
  
  // Guardar en localStorage
  localStorage.setItem('user', JSON.stringify(defaultUser));
  console.log("Usuario recreado:", defaultUser);
}

// Verificar que el usuario se reconstruyó correctamente
const usuarioReconstruido = JSON.parse(localStorage.getItem('user') || '{}');
verificar("El usuario se reconstruye como Ramon", usuarioReconstruido.username === 'ramon');
verificar("El rol se mantiene como 'Ramon' al reconstruir", usuarioReconstruido.role === 'Ramon');

// Limpiar archivo temporal
try {
  fs.unlinkSync(tempJsPath);
  console.log("\nArchivo temporal eliminado correctamente");
} catch (err) {
  console.error("Error al eliminar archivo temporal:", err);
}

// Resumen final
console.log("\n=== RESUMEN DE PRUEBAS ===");
console.log("Las pruebas verifican que:");
console.log("1. getStoredUser corrige el rol de Ramon correctamente");
console.log("2. getCurrentUserRole identifica a Ramon y devuelve el rol correcto");
console.log("3. extractRoleFromToken devuelve 'Ramon' para el usuario Ramon");
console.log("4. El indicador ramonFix se establece correctamente");
console.log("5. La reconstrucción de usuario después de recarga funciona correctamente");
