/**
 * Script para arreglar el problema de login de Ramon
 * 
 * Este script debe ejecutarse después de la carga de la página
 * para asegurar que el usuario Ramon mantenga su rol correcto.
 */

(function() {
  // Esta función se ejecuta automáticamente
  console.log('=== CORRECTOR DE ROLES INICIADO ===');
  
  // Solo ejecutar si localStorage está disponible
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage no disponible, no se puede corregir el rol');
    return;
  }
  
  // Obtener el usuario actual
  const userJson = localStorage.getItem('user');
  if (!userJson) {
    console.log('No hay usuario en localStorage, nada que corregir');
    return;
  }
  
  try {
    // Parsear el usuario
    const user = JSON.parse(userJson);
    
    // Comprobar si es el usuario Ramon
    if (user.username && user.username.toLowerCase() === 'ramon') {
      console.log('¡Usuario Ramon detectado! Verificando rol...');
      
      // Corregir el rol si es necesario
      if (user.role !== 'Ramon') {
        console.log(`Corrigiendo rol de ${user.role || 'desconocido'} a 'Ramon'`);
        user.role = 'Ramon';
        
        // Guardar el usuario actualizado
        localStorage.setItem('user', JSON.stringify(user));
        
        // También guardar el rol por separado
        localStorage.setItem('userRole', 'Ramon');
        
        console.log('✅ Rol corregido correctamente');
        console.log('Por favor, recarga la página para aplicar los cambios');
      } else {
        console.log('✅ El rol ya es correcto: Ramon');
      }
    } else {
      console.log(`Usuario actual: ${user.username || 'desconocido'}, Rol: ${user.role || 'desconocido'}`);
    }
  } catch (error) {
    console.error('Error al procesar el usuario:', error);
  }
  
  console.log('=== CORRECTOR DE ROLES FINALIZADO ===');
})();
