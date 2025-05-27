// Script para verificar la autenticación tanto para admin como para Ramon
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuración
const BASE_URL = 'http://localhost:8000/api/v1';
const USUARIOS = [
    { username: 'admin', password: 'admin123', nombre: 'Administrador' },
    { username: 'Ramon', password: 'Ramon123', nombre: 'Ramon' }
];

// Variables globales
let tokens = {};
let decodedTokens = {};

// Función para iniciar sesión con un usuario
async function login(username, password) {
    console.log(`\n=== INICIANDO SESIÓN COMO ${username} ===`);
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await axios.post(`${BASE_URL}/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = response.data.access_token;
        console.log(`✅ Login exitoso para ${username}`);
        console.log(`Token: ${token.substring(0, 20)}...`);
        return token;
    } catch (error) {
        console.error(`❌ Error en login para ${username}:`, error.message);
        if (error.response) {
            console.error('Detalle:', error.response.data);
        }
        return null;
    }
}

// Función para decodificar el token JWT
function decodeToken(token, username) {
    console.log(`\n=== ANALIZANDO TOKEN JWT DE ${username} ===`);
    
    try {
        // Decodificar sin verificar la firma (solo para análisis)
        const decoded = jwt.decode(token);
        console.log('Contenido del token JWT:');
        console.log(JSON.stringify(decoded, null, 2));
        
        return decoded;
    } catch (error) {
        console.error(`❌ Error al decodificar token de ${username}:`, error.message);
        return null;
    }
}

// Función para obtener información del usuario
async function getUserInfo(token, username) {
    console.log(`\n=== OBTENIENDO INFORMACIÓN DE ${username} CON /auth/me ===`);
    
    try {
        const response = await axios.get(`${BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const userData = response.data;
        console.log('Información del usuario:');
        console.log(JSON.stringify(userData, null, 2));
        return userData;
    } catch (error) {
        console.error(`❌ Error al obtener información de ${username}:`, error.message);
        if (error.response) {
            console.error('Detalle:', error.response.data);
        }
        return null;
    }
}

// Función para verificar acceso a rutas protegidas
async function testEndpoint(token, username, endpoint) {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ ${username} puede acceder a ${endpoint} (${response.status})`);
        return true;
    } catch (error) {
        console.error(`❌ ${username} no puede acceder a ${endpoint}: ${error.message}`);
        if (error.response) {
            console.error(`Estado: ${error.response.status}`);
        }
        return false;
    }
}

// Función principal que ejecuta todo el proceso
async function main() {
    console.log('====== VERIFICACIÓN DE AUTENTICACIÓN MÚLTIPLE ======\n');
    
    // Iniciar sesión con cada usuario
    for (const usuario of USUARIOS) {
        const token = await login(usuario.username, usuario.password);
        if (token) {
            tokens[usuario.username] = token;
            
            // Decodificar token
            decodedTokens[usuario.username] = decodeToken(token, usuario.username);
            
            // Obtener información del usuario
            const userInfo = await getUserInfo(token, usuario.username);
            
            // Probar acceso a endpoints comunes
            console.log(`\n=== PROBANDO ACCESO A ENDPOINTS PARA ${usuario.username} ===`);
            await testEndpoint(token, usuario.username, '/animals');
            await testEndpoint(token, usuario.username, '/explotacions');
            await testEndpoint(token, usuario.username, '/dashboard/stats');
        }
    }
    
    // Resumen final
    console.log('\n====== RESUMEN DE VERIFICACIÓN ======');
    for (const usuario of USUARIOS) {
        const loginSuccess = !!tokens[usuario.username];
        const tokenDecoded = !!decodedTokens[usuario.username];
        
        console.log(`\n${usuario.nombre} (${usuario.username}):`);
        console.log(`- Login exitoso: ${loginSuccess ? '✅ SÍ' : '❌ NO'}`);
        console.log(`- Token decodificado: ${tokenDecoded ? '✅ SÍ' : '❌ NO'}`);
        
        if (tokenDecoded) {
            console.log(`- Rol en token: ${decodedTokens[usuario.username].role || 'No encontrado'}`);
        }
    }
    
    console.log('\n====== CONCLUSIÓN ======');
    let todosExitosos = USUARIOS.every(u => !!tokens[u.username] && !!decodedTokens[u.username]);
    console.log(`Estado general: ${todosExitosos ? '✅ TODOS LOS USUARIOS VERIFICADOS CORRECTAMENTE' : '❌ HAY PROBLEMAS CON ALGÚN USUARIO'}`);
}

// Ejecutar la prueba
main().catch(error => {
    console.error('Error en la ejecución del script:', error);
});
