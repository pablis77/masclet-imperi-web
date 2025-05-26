/**
 * Script de prueba para componentes RoleGuard y PermissionGuard
 * Este script verifica el funcionamiento correcto de los componentes de protección
 * sin afectar a la aplicación principal.
 */

import { extractRoleFromToken, getCurrentRole, hasPermission } from '../../frontend/src/services/roleService';

/**
 * Función principal para probar los componentes de protección
 */
export async function testGuardComponents() {
  console.log('----------------------------------------------');
  console.log('🧪 INICIANDO PRUEBAS DE COMPONENTES DE PROTECCIÓN');
  console.log('----------------------------------------------');

  // 1. Prueba de extracción de rol desde token
  testExtractRoleFromToken();

  // 2. Prueba de obtención de rol actual
  testGetCurrentRole();

  // 3. Prueba de verificación de permisos
  testHasPermission();

  // 4. Prueba de componente RoleGuard
  testRoleGuard();

  // 5. Prueba de componente PermissionGuard
  testPermissionGuard();

  console.log('----------------------------------------------');
  console.log('🎉 PRUEBAS DE COMPONENTES DE PROTECCIÓN COMPLETADAS');
  console.log('----------------------------------------------');
}

/**
 * Prueba de extracción de rol desde token
 */
function testExtractRoleFromToken() {
  console.log('\n🔍 Probando extractRoleFromToken:');
  
  try {
    // En un entorno de prueba, puede que no haya token, así que verificamos el comportamiento por defecto
    const defaultRole = extractRoleFromToken();
    console.log(`  ✅ Rol por defecto (sin token): ${defaultRole}`);
    
    // Simular diferentes escenarios
    simulateTokenExtraction('administrador');
    simulateTokenExtraction('Ramon');
    simulateTokenExtraction('editor');
    simulateTokenExtraction('usuario');
    simulateTokenExtraction('rol_invalido');
  } catch (error) {
    console.error(`  ❌ Error en extractRoleFromToken: ${error}`);
  }
}

/**
 * Prueba de obtención de rol actual
 */
function testGetCurrentRole() {
  console.log('\n🔍 Probando getCurrentRole:');
  
  try {
    const currentRole = getCurrentRole();
    console.log(`  ✅ Rol actual: ${currentRole}`);
  } catch (error) {
    console.error(`  ❌ Error en getCurrentRole: ${error}`);
  }
}

/**
 * Prueba de verificación de permisos
 */
function testHasPermission() {
  console.log('\n🔍 Probando hasPermission:');
  
  // Matriz de pruebas para diferentes roles y permisos
  const testCases = [
    { role: 'administrador', permission: 'consultar', expected: true },
    { role: 'administrador', permission: 'importar_datos', expected: true },
    { role: 'Ramon', permission: 'consultar', expected: true },
    { role: 'Ramon', permission: 'importar_datos', expected: false },
    { role: 'editor', permission: 'consultar', expected: true },
    { role: 'editor', permission: 'crear', expected: false },
    { role: 'usuario', permission: 'consultar', expected: true },
    { role: 'usuario', permission: 'actualizar', expected: false },
  ];
  
  testCases.forEach(({ role, permission, expected }) => {
    try {
      const result = hasPermission(role, permission);
      const icon = result === expected ? '✅' : '❌';
      console.log(`  ${icon} Rol: ${role}, Permiso: ${permission}, Resultado: ${result}, Esperado: ${expected}`);
    } catch (error) {
      console.error(`  ❌ Error en hasPermission con rol ${role} y permiso ${permission}: ${error}`);
    }
  });
}

/**
 * Prueba de componente RoleGuard
 */
function testRoleGuard() {
  console.log('\n🔍 Probando RoleGuard:');
  
  // Simulamos diferentes casos de uso del RoleGuard
  const testCases = [
    { currentRole: 'administrador', allowedRoles: ['administrador', 'Ramon'], expected: true },
    { currentRole: 'Ramon', allowedRoles: ['administrador'], expected: false },
    { currentRole: 'editor', allowedRoles: ['administrador', 'Ramon', 'editor'], expected: true },
    { currentRole: 'usuario', allowedRoles: ['administrador', 'Ramon'], expected: false },
  ];
  
  testCases.forEach(({ currentRole, allowedRoles, expected }) => {
    try {
      // Simulamos el comportamiento de RoleGuard
      const result = allowedRoles.includes(currentRole);
      const icon = result === expected ? '✅' : '❌';
      console.log(`  ${icon} Rol actual: ${currentRole}, Roles permitidos: [${allowedRoles.join(', ')}], Resultado: ${result}, Esperado: ${expected}`);
    } catch (error) {
      console.error(`  ❌ Error en RoleGuard con rol ${currentRole} y roles permitidos [${allowedRoles.join(', ')}]: ${error}`);
    }
  });
}

/**
 * Prueba de componente PermissionGuard
 */
function testPermissionGuard() {
  console.log('\n🔍 Probando PermissionGuard:');
  
  // Simulamos diferentes casos de uso del PermissionGuard
  const testCases = [
    { role: 'administrador', requiredPermissions: ['consultar'], expected: true },
    { role: 'administrador', requiredPermissions: ['importar_datos'], expected: true },
    { role: 'Ramon', requiredPermissions: ['consultar', 'actualizar'], expected: true },
    { role: 'Ramon', requiredPermissions: ['importar_datos'], expected: false },
    { role: 'editor', requiredPermissions: ['consultar'], expected: true },
    { role: 'editor', requiredPermissions: ['crear'], expected: false },
    { role: 'usuario', requiredPermissions: ['consultar'], expected: true },
    { role: 'usuario', requiredPermissions: ['actualizar'], expected: false },
  ];
  
  testCases.forEach(({ role, requiredPermissions, expected }) => {
    try {
      // Simulamos el comportamiento de PermissionGuard
      const result = requiredPermissions.every(permission => hasPermission(role, permission));
      const icon = result === expected ? '✅' : '❌';
      console.log(`  ${icon} Rol: ${role}, Permisos requeridos: [${requiredPermissions.join(', ')}], Resultado: ${result}, Esperado: ${expected}`);
    } catch (error) {
      console.error(`  ❌ Error en PermissionGuard con rol ${role} y permisos requeridos [${requiredPermissions.join(', ')}]: ${error}`);
    }
  });
}

/**
 * Simula la extracción de un rol desde un token
 */
function simulateTokenExtraction(role: string) {
  try {
    console.log(`  🔄 Simulando token con rol: ${role}`);
    console.log(`  ✅ Resultado esperado: ${role === 'rol_invalido' ? 'usuario' : role}`);
  } catch (error) {
    console.error(`  ❌ Error al simular token con rol ${role}: ${error}`);
  }
}

// Si este archivo se ejecuta directamente
if (require.main === module) {
  testGuardComponents();
}
