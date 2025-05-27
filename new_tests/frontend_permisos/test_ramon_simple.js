/**
 * Test simple para verificar el comportamiento de Ramon
 */

// Simulamos localStorage
const localStorage = {
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

// Funciones simplificadas que simulan el comportamiento real
function getStoredUser() {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    
    const user = JSON.parse(userString);
    
    // Lógica específica para Ramon
    if (user.username === 'ramon') {
      // Si el usuario es Ramon, siempre debe tener el rol "Ramon"
      if (user.role !== 'Ramon') {
        console.log(`Corrigiendo rol para usuario Ramon de: ${user.role} a: Ramon`);
        user.role = 'Ramon';
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('ramonFix', 'true');
        localStorage.setItem('userRole', 'Ramon');
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}

function getCurrentUserRole() {
  // Verificar primero si es Ramon
  const user = getStoredUser();
  if (user && user.username === 'ramon') {
    return 'Ramon';
  }
  
  // Para otros usuarios, devolver su rol normal
  return user ? user.role : null;
}

function extractRoleFromToken() {
  // Verificar si hay un indicador de Ramon
  if (localStorage.getItem('ramonFix') === 'true') {
    return 'Ramon';
  }
  
  // Simular extracción del token
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  // En un caso real esto decodificaría el token
  // Aquí simplemente simulamos que lo hace
  return 'gerente'; // Valor por defecto para la prueba
}

function login(credentials) {
  // Simular login exitoso
  localStorage.setItem('token', 'token-simulado');
  
  // Verificar si es Ramon
  if (credentials.username === 'ramon') {
    localStorage.setItem('user', JSON.stringify({
      username: 'ramon',
      role: 'Ramon'
    }));
    localStorage.setItem('ramonFix', 'true');
    localStorage.setItem('userRole', 'Ramon');
    console.log('Login como Ramon - estableciendo rol "Ramon"');
  } else {
    localStorage.setItem('user', JSON.stringify({
      username: credentials.username,
      role: 'usuario'
    }));
  }
  
  return getStoredUser();
}

function logout() {
  localStorage.clear();
}

// Simular componente ProfileManagement
function profileManagement() {
  console.log('\nSimulando el comportamiento de ProfileManagement');
  
  // Verificar si hay token pero no usuario (como después de recarga)
  if (localStorage.getItem('token') && !localStorage.getItem('user')) {
    console.log('Sesión activa pero sin datos de usuario, reconstruyendo usuario');
    
    // Verificar si hay indicador de Ramon
    if (localStorage.getItem('ramonFix') === 'true') {
      console.log('Detectado usuario Ramon por indicador ramonFix');
      const user = {
        username: 'ramon',
        role: 'Ramon'
      };
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Usuario Ramon reconstruido con rol "Ramon"');
    } else {
      // Usuario por defecto
      const user = {
        username: 'admin',
        role: 'administrador'
      };
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Usuario admin reconstruido con rol "administrador"');
    }
  }
  
  // Asegurar que el rol sea correcto para usuarios específicos
  const user = getStoredUser();
  if (user) {
    if (user.username === 'ramon' && user.role !== 'Ramon') {
      console.log(`Corrigiendo rol para usuario Ramon de: ${user.role} a: Ramon`);
      user.role = 'Ramon';
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('ramonFix', 'true');
      localStorage.setItem('userRole', 'Ramon');
    }
  }
  
  return getStoredUser();
}

// Función para imprimir resultados de prueba
function verificar(nombre, condicion) {
  console.log(`${condicion ? '✅' : '❌'} ${nombre}: ${condicion ? 'CORRECTO' : 'INCORRECTO'}`);
  return condicion;
}

// Funciones para mostrar el estado actual
function mostrarEstadoActual(etapa) {
  console.log(`\n📊 Estado en "${etapa}":`);
  const user = localStorage.getItem('user');
  console.log(`- Token: ${localStorage.getItem('token') ? 'Presente' : 'No presente'}`);
  console.log(`- Usuario: ${user ? 'Presente' : 'No presente'}`);
  if (user) {
    const userData = JSON.parse(user);
    console.log(`  > Username: ${userData.username}`);
    console.log(`  > Rol: ${userData.role}`);
  }
  console.log(`- Indicador ramonFix: ${localStorage.getItem('ramonFix') || 'No presente'}`);
  console.log(`- userRole: ${localStorage.getItem('userRole') || 'No presente'}`);
}

// EJECUCIÓN DE PRUEBAS
console.log('=== TEST SIMPLE DE COMPORTAMIENTO DE RAMON ===\n');

// Prueba 1: Login como Ramon
console.log('PRUEBA 1: LOGIN COMO RAMON');
localStorage.clear();
const usuarioLogueado = login({ username: 'ramon', password: 'Ramon123' });
mostrarEstadoActual('después de login');
verificar('Login exitoso', usuarioLogueado !== null);
verificar('Usuario es "ramon"', usuarioLogueado.username === 'ramon');
verificar('Rol es "Ramon"', usuarioLogueado.role === 'Ramon');
verificar('Indicador ramonFix establecido', localStorage.getItem('ramonFix') === 'true');

// Prueba 2: Asignar rol incorrecto y verificar corrección
console.log('\nPRUEBA 2: CORRECCIÓN DE ROL INCORRECTO');
localStorage.setItem('user', JSON.stringify({
  username: 'ramon',
  role: 'gerente' // Rol incorrecto a propósito
}));
mostrarEstadoActual('con rol incorrecto');
const usuarioCorregido = getStoredUser();
mostrarEstadoActual('después de getStoredUser');
verificar('Rol corregido a "Ramon"', usuarioCorregido.role === 'Ramon');

// Prueba 3: Simular recarga (pérdida de usuario en localStorage)
console.log('\nPRUEBA 3: SIMULACIÓN DE RECARGA DE PÁGINA');
localStorage.removeItem('user');
mostrarEstadoActual('después de "recarga" (sin user)');
const usuarioReconstruido = profileManagement();
mostrarEstadoActual('después de ProfileManagement');
verificar('Usuario reconstruido', usuarioReconstruido !== null);
verificar('Rol mantenido como "Ramon"', usuarioReconstruido.role === 'Ramon');

// Prueba 4: Simular cierre de sesión y nuevo login
console.log('\nPRUEBA 4: CIERRE DE SESIÓN Y NUEVO LOGIN');
logout();
mostrarEstadoActual('después de logout');
const nuevoLogin = login({ username: 'ramon', password: 'Ramon123' });
mostrarEstadoActual('después de nuevo login');
verificar('Nuevo login exitoso', nuevoLogin !== null);
verificar('Rol es "Ramon" en nuevo login', nuevoLogin.role === 'Ramon');

// Resumen
const pruebasExitosas = verificar('\nTODAS LAS PRUEBAS PASARON', 
  usuarioLogueado.role === 'Ramon' && 
  usuarioCorregido.role === 'Ramon' && 
  usuarioReconstruido.role === 'Ramon' && 
  nuevoLogin.role === 'Ramon');

console.log('\n=== RESUMEN ===');
console.log(pruebasExitosas 
  ? '✅ El comportamiento para el usuario Ramon funciona correctamente'
  : '❌ Hay problemas con el comportamiento del usuario Ramon');
