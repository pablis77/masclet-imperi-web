// Script de verificación completa para el usuario Ramon
// Este script verifica el flujo completo de autenticación y autorización
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuración
const BASE_URL = 'http://localhost:8000/api/v1';
const USERNAME = 'Ramon';
const PASSWORD = 'Ramon123'; // Contraseña correcta según lo que ha indicado el usuario

// Variables globales para almacenar el token y la información del usuario
let accessToken = '';
let userData = null;
let tokenData = null;

// Función para imprimir información de depuración
function debug(message) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] ${message}`);
}

// Función para iniciar sesión
async function login() {
    console.log('\n=== 1. INICIANDO SESIÓN COMO RAMON ===');
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', USERNAME);
        formData.append('password', PASSWORD);

        const response = await axios.post(`${BASE_URL}/auth/login`, formData, {
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

// Función para decodificar el token JWT
function decodeToken() {
    console.log('\n=== 2. ANALIZANDO TOKEN JWT ===');
    
    try {
        // Decodificar sin verificar la firma (solo para análisis)
        const decoded = jwt.decode(accessToken);
        console.log('Contenido del token JWT:');
        console.log(JSON.stringify(decoded, null, 2));
        
        return decoded;
    } catch (error) {
        console.error('❌ Error al decodificar token:', error.message);
        return null;
    }
}

// Función para obtener información del usuario
async function getUserInfo() {
    console.log('\n=== 3. OBTENIENDO INFORMACIÓN DEL USUARIO CON /auth/me ===');
    
    try {
        const response = await axios.get(`${BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        userData = response.data;
        console.log('Información del usuario:');
        console.log(JSON.stringify(userData, null, 2));
        return userData;
    } catch (error) {
        console.error('❌ Error al obtener información del usuario:', error.message);
        if (error.response) {
            console.error('Detalle:', error.response.data);
        }
        return null;
    }
}

// Función para verificar coincidencia de roles
function compareRoles(tokenData, userData) {
    console.log('\n=== 4. VERIFICANDO COINCIDENCIA DE ROLES ===');
    
    const tokenRole = tokenData.role;
    const userRole = userData.role;
    
    console.log(`- Rol en token JWT: ${tokenRole}`);
    console.log(`- Rol en respuesta de /auth/me: ${userRole}`);
    
    if (tokenRole === userRole) {
        console.log('✅ Los roles coinciden correctamente');
        return true;
    } else {
        console.log('❌ Los roles no coinciden');
        return false;
    }
}

// Función para probar acceso a rutas protegidas
async function testProtectedRoutes() {
    console.log('\n=== 5. PROBANDO ACCESO A RUTAS PROTEGIDAS ===');
    
    // Lista de rutas a probar que Ramon debería poder acceder
    const routesToTest = [
        '/animals',
        '/explotacions'
        // Añadir más rutas relevantes según sea necesario
    ];
    
    let allSuccessful = true;
    
    for (const route of routesToTest) {
        try {
            console.log(`\nProbando acceso a: ${route}`);
            const response = await axios.get(`${BASE_URL}${route}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            console.log(`✅ Acceso exitoso a ${route}`);
            console.log(`Código de estado: ${response.status}`);
        } catch (error) {
            console.error(`❌ Error al acceder a ${route}:`, error.message);
            if (error.response) {
                console.error(`Código de estado: ${error.response.status}`);
                console.error('Detalle:', error.response.data);
            }
            allSuccessful = false;
        }
    }
    
    return allSuccessful;
}

// Función principal que ejecuta todo el proceso
async function main() {
    console.log('====== VERIFICACIÓN COMPLETA DE RAMON ======\n');
    
    // Paso 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.error('❌ La verificación no puede continuar debido a fallo en login');
        return;
    }
    
    // Paso 2: Decodificar token
    const tokenData = decodeToken();
    if (!tokenData) {
        console.error('❌ La verificación no puede continuar debido a fallo en decodificación del token');
        return;
    }
    
    // Paso 3: Obtener información del usuario
    const userInfo = await getUserInfo();
    if (!userInfo) {
        console.error('❌ La verificación no puede continuar debido a fallo al obtener información del usuario');
        return;
    }
    
    // Paso 4: Verificar coincidencia de roles
    const rolesMatch = compareRoles(tokenData, userInfo);
    
    // Paso 5: Probar rutas protegidas
    const routesAccessible = await testProtectedRoutes();
    
    // Resumen final
    console.log('\n====== RESUMEN DE VERIFICACIÓN ======');
    console.log(`- Login exitoso: ${loginSuccess ? '✅ SÍ' : '❌ NO'}`);
    console.log(`- Token decodificado correctamente: ${tokenData ? '✅ SÍ' : '❌ NO'}`);
    console.log(`- Información de usuario obtenida: ${userInfo ? '✅ SÍ' : '❌ NO'}`);
    console.log(`- Roles coinciden: ${rolesMatch ? '✅ SÍ' : '❌ NO'}`);
    console.log(`- Acceso a rutas protegidas: ${routesAccessible ? '✅ SÍ' : '❌ NO'}`);
    
    const allSuccessful = loginSuccess && tokenData && userInfo && rolesMatch && routesAccessible;
    console.log(`\nResultado final: ${allSuccessful ? '✅ VERIFICACIÓN EXITOSA' : '❌ VERIFICACIÓN FALLIDA'}`);
}

// Ejecutar la prueba
main().catch(error => {
    console.error('Error en la ejecución del script:', error);
});
