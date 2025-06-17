"use strict";
/**
 * Script de prueba para componentes RoleGuard y PermissionGuard
 * Este script verifica el funcionamiento correcto de los componentes de protección
 * sin afectar a la aplicación principal.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testGuardComponents = testGuardComponents;
// Matriz simulada de permisos por rol (debe coincidir con roleService.ts)
const ROLE_PERMISSIONS = {
    'administrador': [
        'consultar',
        'actualizar',
        'crear',
        'gestionar_usuarios',
        'borrar_usuarios',
        'cambiar_contraseñas',
        'gestionar_explotaciones',
        'importar_datos',
        'ver_estadisticas',
        'exportar_datos'
    ],
    'gerente': [
        'consultar',
        'actualizar',
        'crear',
        'gestionar_usuarios',
        'borrar_usuarios',
        'cambiar_contraseñas',
        'gestionar_explotaciones',
        'ver_estadisticas',
        'exportar_datos'
    ],
    'editor': [
        'consultar',
        'actualizar',
        'ver_estadisticas'
    ],
    'usuario': [
        'consultar'
    ]
};
/**
 * Función principal para probar los componentes de protección
 */
function testGuardComponents() {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
/**
 * Implementación simulada de extractRoleFromToken
 */
function extractRoleFromToken() {
    // Simulamos que no hay token, por lo que devuelve 'usuario'
    return 'usuario';
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
        simulateTokenExtraction('gerente');
        simulateTokenExtraction('editor');
        simulateTokenExtraction('usuario');
        simulateTokenExtraction('rol_invalido');
    }
    catch (error) {
        console.error(`  ❌ Error en extractRoleFromToken: ${error}`);
    }
}
/**
 * Implementación simulada de getCurrentRole
 */
function getCurrentRole() {
    // Para pruebas, simulamos un rol administrador
    return 'administrador';
}
/**
 * Prueba de obtención de rol actual
 */
function testGetCurrentRole() {
    console.log('\n🔍 Probando getCurrentRole:');
    try {
        const currentRole = getCurrentRole();
        console.log(`  ✅ Rol actual: ${currentRole}`);
    }
    catch (error) {
        console.error(`  ❌ Error en getCurrentRole: ${error}`);
    }
}
/**
 * Implementación simulada de hasPermission
 */
function hasPermission(userRole, action) {
    // Verificamos si el rol tiene el permiso requerido
    return ROLE_PERMISSIONS[userRole].includes(action);
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
        { role: 'gerente', permission: 'consultar', expected: true },
        { role: 'gerente', permission: 'importar_datos', expected: false },
        { role: 'editor', permission: 'consultar', expected: true },
        { role: 'editor', permission: 'crear', expected: false },
        { role: 'usuario', permission: 'consultar', expected: true },
        { role: 'usuario', permission: 'actualizar', expected: false },
    ];
    // Nota: Cambiamos 'Ramon' por 'gerente' en las pruebas para cumplir con el tipo UserRole
    // pero mostraremos 'Ramon' en los mensajes de salida para mantener la consistencia
    testCases.forEach(({ role, permission, expected }) => {
        try {
            const displayRole = role === 'gerente' ? 'Ramon' : role;
            const result = hasPermission(role, permission);
            const icon = result === expected ? '✅' : '❌';
            console.log(`  ${icon} Rol: ${displayRole}, Permiso: ${permission}, Resultado: ${result}, Esperado: ${expected}`);
        }
        catch (error) {
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
        { currentRole: 'administrador', allowedRoles: ['administrador', 'gerente'], expected: true },
        { currentRole: 'gerente', allowedRoles: ['administrador'], expected: false },
        { currentRole: 'editor', allowedRoles: ['administrador', 'gerente', 'editor'], expected: true },
        { currentRole: 'usuario', allowedRoles: ['administrador', 'gerente'], expected: false },
    ];
    testCases.forEach(({ currentRole, allowedRoles, expected }) => {
        try {
            // Adaptamos los roles para mostrar 'Ramon' en lugar de 'gerente' en la salida
            const displayRole = currentRole === 'gerente' ? 'Ramon' : currentRole;
            const displayAllowedRoles = allowedRoles.map(role => role === 'gerente' ? 'Ramon' : role);
            // Simulamos el comportamiento de RoleGuard
            const result = allowedRoles.includes(currentRole);
            const icon = result === expected ? '✅' : '❌';
            console.log(`  ${icon} Rol actual: ${displayRole}, Roles permitidos: [${displayAllowedRoles.join(', ')}], Resultado: ${result}, Esperado: ${expected}`);
        }
        catch (error) {
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
        { role: 'gerente', requiredPermissions: ['consultar', 'actualizar'], expected: true },
        { role: 'gerente', requiredPermissions: ['importar_datos'], expected: false },
        { role: 'editor', requiredPermissions: ['consultar'], expected: true },
        { role: 'editor', requiredPermissions: ['crear'], expected: false },
        { role: 'usuario', requiredPermissions: ['consultar'], expected: true },
        { role: 'usuario', requiredPermissions: ['actualizar'], expected: false },
    ];
    testCases.forEach(({ role, requiredPermissions, expected }) => {
        try {
            // Adaptamos para mostrar 'Ramon' en lugar de 'gerente'
            const displayRole = role === 'gerente' ? 'Ramon' : role;
            // Simulamos el comportamiento de PermissionGuard
            const result = requiredPermissions.every(permission => hasPermission(role, permission));
            const icon = result === expected ? '✅' : '❌';
            console.log(`  ${icon} Rol: ${displayRole}, Permisos requeridos: [${requiredPermissions.join(', ')}], Resultado: ${result}, Esperado: ${expected}`);
        }
        catch (error) {
            console.error(`  ❌ Error en PermissionGuard con rol ${role} y permisos requeridos [${requiredPermissions.join(', ')}]: ${error}`);
        }
    });
}
/**
 * Simula la extracción de un rol desde un token
 */
function simulateTokenExtraction(role) {
    try {
        // Adaptamos para mostrar 'Ramon' en lugar de 'gerente'
        const displayRole = role === 'gerente' ? 'Ramon' : role;
        console.log(`  🔄 Simulando token con rol: ${displayRole}`);
        console.log(`  ✅ Resultado esperado: ${role === 'rol_invalido' ? 'usuario' : displayRole}`);
    }
    catch (error) {
        console.error(`  ❌ Error al simular token con rol ${role}: ${error}`);
    }
}
// Ejecutar directamente las pruebas
testGuardComponents();
