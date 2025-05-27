// Script para verificar el almacenamiento y uso de tokens en el frontend
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuración
const CONFIG = {
    BACKEND_URL: 'http://localhost:8000/api/v1',
    USERNAME: 'Ramon',
    PASSWORD: 'Ramon123',
    TOKEN_KEYS: ['token', 'accessToken', 'auth_token', 'jwt_token']
};

// Variables para almacenar datos
let accessToken = '';
let decodedToken = null;

// Función para iniciar sesión y obtener token
async function login() {
    console.log('\n=== 1. INICIANDO SESIÓN COMO RAMON ===');
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', CONFIG.USERNAME);
        formData.append('password', CONFIG.PASSWORD);

        const response = await axios.post(`${CONFIG.BACKEND_URL}/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        accessToken = response.data.access_token;
        console.log('✅ Login exitoso');
        console.log(`Token: ${accessToken.substring(0, 20)}...`);
        return true;
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        if (error.response) {
            console.error('Detalle:', error.response.data);
        }
        return false;
    }
}

// Decodificar y analizar el token
function analyzeToken() {
    console.log('\n=== 2. ANALIZANDO TOKEN JWT ===');
    
    try {
        // Decodificar sin verificar la firma (solo para análisis)
        decodedToken = jwt.decode(accessToken);
        console.log('Contenido del token JWT:');
        console.log(JSON.stringify(decodedToken, null, 2));
        
        // Verificar formato del rol
        if (decodedToken.role) {
            console.log(`\nRol en token: "${decodedToken.role}"`);
            if (decodedToken.role === 'Ramon') {
                console.log('✅ Formato del rol correcto');
            } else {
                console.log('❌ Formato del rol incorrecto');
            }
        } else {
            console.log('❌ No se encontró rol en el token');
        }
        
        return decodedToken;
    } catch (error) {
        console.error('❌ Error al decodificar token:', error.message);
        return null;
    }
}

// Verificar acceso a endpoints protegidos
async function verifyProtectedEndpoints() {
    console.log('\n=== 3. PROBANDO ACCESO A ENDPOINTS PROTEGIDOS ===');
    
    const endpoints = [
        '/animals',
        '/explotacions',
        '/dashboard/stats',
        '/dashboard-detallado/animales-detallado'
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nProbando acceso a: ${endpoint}`);
            const response = await axios.get(`${CONFIG.BACKEND_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            console.log(`✅ Acceso exitoso a ${endpoint}`);
            console.log(`Código de estado: ${response.status}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error al acceder a ${endpoint}:`, error.message);
            if (error.response) {
                console.error(`Código de estado: ${error.response.status}`);
                console.error('Detalle:', error.response.data);
            }
            failCount++;
        }
    }
    
    console.log(`\nResumen de endpoints: ${successCount} exitosos, ${failCount} fallidos`);
    return { success: successCount, fail: failCount };
}

// Simular almacenamiento en localStorage para probar frontend
function simulateLocalStorage() {
    console.log('\n=== 4. SIMULANDO ALMACENAMIENTO EN FRONTEND ===');
    
    // Crear un objeto que simule el localStorage del frontend
    const mockStorage = {};
    
    // Probar almacenar el token con diferentes claves
    for (const key of CONFIG.TOKEN_KEYS) {
        mockStorage[key] = accessToken;
        console.log(`Almacenado token con clave "${key}"`);
    }
    
    // Almacenar también un objeto de usuario
    const userObject = {
        username: CONFIG.USERNAME,
        role: 'Ramon',
        id: 14,
        is_active: true
    };
    
    mockStorage['user'] = JSON.stringify(userObject);
    console.log('Almacenado objeto de usuario');
    
    // Generar código JavaScript para el frontend
    const frontendCode = `
// Código para probar en la consola del navegador
// Para depurar problemas de autenticación en el frontend

// 1. Limpiar almacenamiento actual
localStorage.clear();
sessionStorage.clear();
console.log('Almacenamiento limpiado');

// 2. Almacenar token y datos de usuario
localStorage.setItem('accessToken', '${accessToken}');
localStorage.setItem('userRole', 'Ramon');
localStorage.setItem('user', '${JSON.stringify(userObject)}');
console.log('Token y datos de usuario almacenados');

// 3. Para verificar:
console.log('Token almacenado:', localStorage.getItem('accessToken'));
console.log('Rol almacenado:', localStorage.getItem('userRole'));
console.log('Usuario almacenado:', JSON.parse(localStorage.getItem('user')));

// 4. Realizar una petición de prueba
fetch('/api/v1/dashboard/stats', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(response => {
  console.log('Estado de respuesta:', response.status);
  return response.json();
})
.then(data => console.log('Datos recibidos:', data))
.catch(err => console.error('Error en petición:', err));
`;
    
    // Guardar el código en un archivo
    const filePath = path.join(__dirname, 'frontend_fix_code.js');
    fs.writeFileSync(filePath, frontendCode);
    console.log(`\nCódigo para el frontend guardado en: ${filePath}`);
    
    return mockStorage;
}

// Función principal
async function main() {
    console.log('====== VERIFICACIÓN DE TOKEN Y FRONTEND ======\n');
    
    // Paso 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.error('❌ No se puede continuar sin token');
        return;
    }
    
    // Paso 2: Analizar token
    const tokenData = analyzeToken();
    if (!tokenData) {
        console.error('❌ No se puede continuar sin datos del token');
        return;
    }
    
    // Paso 3: Verificar endpoints protegidos
    const endpointResults = await verifyProtectedEndpoints();
    
    // Paso 4: Simular localStorage
    const mockStorage = simulateLocalStorage();
    
    // Resumen final
    console.log('\n====== RESUMEN DE VERIFICACIÓN ======');
    console.log(`- Login exitoso: ${loginSuccess ? '✅ SÍ' : '❌ NO'}`);
    console.log(`- Token analizado: ${tokenData ? '✅ SÍ' : '❌ NO'}`);
    console.log(`- Rol en token: ${tokenData?.role || 'No encontrado'}`);
    console.log(`- Endpoints accesibles: ${endpointResults.success} de ${endpointResults.success + endpointResults.fail}`);
    
    console.log('\n====== INSTRUCCIONES PARA FRONTEND ======');
    console.log('1. Abre el navegador y ve a la aplicación frontend');
    console.log('2. Abre la consola de desarrollador (F12)');
    console.log('3. Copia y pega el código del archivo frontend_fix_code.js');
    console.log('4. Recarga la página y verifica que puedes acceder a todas las secciones');
}

// Ejecutar
main().catch(error => {
    console.error('Error en la ejecución del script:', error);
});
