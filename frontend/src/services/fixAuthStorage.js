/**
 * Script para corregir problemas de almacenamiento del token JWT
 * 
 * Este script debe incluirse en el código principal (main.js/index.js)
 * o ejecutarse como parte del proceso de inicialización.
 */

/**
 * Verifica y corrige el almacenamiento del token de autenticación
 * 
 * Problemas que corrige:
 * 1. Formato incorrecto del token
 * 2. Token almacenado con clave incorrecta
 * 3. Inconsistencia entre token y datos de usuario
 */
export const fixAuthStorage = () => {
  console.log('Ejecutando corrección de almacenamiento de autenticación...');
  
  // Verificar si hay token en localStorage
  const storedToken = localStorage.getItem('token');
  const storedTokenAlt = localStorage.getItem('access_token'); // Nombre alternativo
  const storedUser = localStorage.getItem('user');
  
  console.log('Estado actual de autenticación:');
  console.log('- Token principal:', storedToken ? 'PRESENTE' : 'AUSENTE');
  console.log('- Token alternativo:', storedTokenAlt ? 'PRESENTE' : 'AUSENTE');
  console.log('- Datos de usuario:', storedUser ? 'PRESENTES' : 'AUSENTES');
  
  // Verificar si estamos en la página de login
  const isLoginPage = window.location.pathname.includes('/login');
  console.log('Página actual:', isLoginPage ? 'LOGIN' : 'OTRA');
  
  // Si no hay token pero estamos fuera del login, ir al login
  if (!storedToken && !storedTokenAlt && !isLoginPage) {
    console.warn('No hay token y estamos fuera del login - Redirigiendo a login');
    window.location.href = '/login';
    return;
  }
  
  // Si hay token alternativo pero no principal, corregir
  if (!storedToken && storedTokenAlt) {
    console.log('Corrigiendo: Copiando token alternativo a formato principal');
    localStorage.setItem('token', storedTokenAlt);
  }
  
  // Si hay token pero no datos de usuario, intentar crear datos básicos
  if ((storedToken || storedTokenAlt) && !storedUser) {
    console.log('Corrigiendo: Creando datos de usuario básicos');
    const basicUser = {
      username: 'admin',
      role: 'administrador'
    };
    localStorage.setItem('user', JSON.stringify(basicUser));
  }
  
  // Verificar formato del token y datos de usuario
  try {
    // Verificar datos de usuario
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (!userData.username) {
        console.log('Corrigiendo: Datos de usuario incompletos');
        userData.username = 'admin';
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
    
    // Verificar token
    const token = storedToken || storedTokenAlt;
    if (token) {
      // Validar que el token tenga formato JWT (xxx.yyy.zzz)
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.warn('Token con formato incorrecto - Limpiando y redirigiendo a login');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
    }
    
    console.log('Verificación y corrección de autenticación completada');
  } catch (error) {
    console.error('Error al procesar datos de autenticación:', error);
    
    // En caso de error, limpiar todo y volver a login
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    if (!isLoginPage) {
      window.location.href = '/login';
    }
  }
};

/**
 * Función para uso directo en la consola del navegador
 * Arregla el token y fuerza la recarga de la página
 */
export const fixAuthAndReload = () => {
  fixAuthStorage();
  window.location.reload();
};

// Si se ejecuta directamente en el navegador
if (typeof window !== 'undefined') {
  window.fixAuthStorage = fixAuthStorage;
  window.fixAuthAndReload = fixAuthAndReload;
  
  // Auto-ejecutar verificación al cargar
  document.addEventListener('DOMContentLoaded', fixAuthStorage);
}
