/**
 * Script de prueba para verificar el sistema de autenticación y roles actual
 * 
 * Este script permite probar el login con diferentes usuarios y verificar cómo
 * se manejan los roles y permisos sin modificar el código existente.
 */

// Importamos el servicio de autenticación
import { login, getCurrentUserRole, isAuthenticated } from '../../frontend/src/services/authService.ts';

// Función para probar diferentes usuarios
async function testAuthWithDifferentUsers() {
  console.log("=== PRUEBA DE AUTENTICACIÓN Y ROLES ===");
  console.log("Fecha y hora:", new Date().toLocaleString());
  
  // Array de usuarios de prueba (modificar según usuarios existentes en el sistema)
  const testUsers = [
    { username: "admin", password: "admin123", expectedRole: "administrador" },
    { username: "ramon", password: "ramon123", expectedRole: "gerente" },
    { username: "editor", password: "editor123", expectedRole: "editor" },
    { username: "usuario", password: "usuario123", expectedRole: "usuario" }
  ];
  
  // Probar cada usuario
  for (const user of testUsers) {
    console.log(`\n--- Probando usuario: ${user.username} ---`);
    
    try {
      // Intentar login
      console.log(`Intentando login con usuario ${user.username}...`);
      const response = await login({
        username: user.username,
        password: user.password
      });
      
      // Verificar respuesta
      console.log("Respuesta de login:", JSON.stringify({
        token_type: response.token_type,
        access_token: response.access_token ? response.access_token.substring(0, 15) + '...' : null,
        user: response.user
      }, null, 2));
      
      // Verificar si hay token
      const isAuth = isAuthenticated();
      console.log("¿Usuario autenticado?:", isAuth);
      
      // Verificar el rol detectado
      const detectedRole = getCurrentUserRole();
      console.log("Rol detectado:", detectedRole);
      console.log("¿Coincide con el esperado?:", detectedRole === user.expectedRole);
      
      // Verificar datos en localStorage
      if (typeof window !== 'undefined') {
        console.log("Datos en localStorage:");
        console.log(" - token:", localStorage.getItem('token') ? "PRESENTE" : "NO PRESENTE");
        console.log(" - user:", localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : "NO PRESENTE");
        console.log(" - userRole:", localStorage.getItem('userRole'));
      }
      
      // Limpiar datos para el siguiente usuario
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
      
    } catch (error) {
      console.error(`Error al probar usuario ${user.username}:`, error.message);
    }
  }
  
  console.log("\n=== FIN DE LA PRUEBA ===");
}

// Ejecutar la prueba
testAuthWithDifferentUsers();
