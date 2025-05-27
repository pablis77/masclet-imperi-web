/**
 * Script para depurar el problema del token JWT y la autenticación de Ramon
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuración
const BACKEND_URL = 'http://localhost:8000';

// Función para decodificar un token JWT (sin verificar firma)
function decodeJwt(token) {
    try {
        // Decodificamos sin verificar la firma
        return jwt.decode(token);
    } catch (error) {
        console.error('Error al decodificar token:', error);
        return null;
    }
}

async function loginAndAnalyze(username, password) {
    console.log(`\n=== ANALIZANDO LOGIN PARA ${username} ===`);
    
    try {
        // 1. Realizar login
        console.log(`1. Iniciando sesión con ${username}/${password}`);
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        
        const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('✅ Login exitoso');
        const token = loginResponse.data.access_token;
        console.log(`Token JWT: ${token.substring(0, 20)}...`);
        
        // 2. Decodificar el token para ver qué contiene
        console.log('\n2. Decodificando token JWT:');
        const decodedToken = decodeJwt(token);
        console.log(JSON.stringify(decodedToken, null, 2));
        
        // 3. Obtener información del usuario con /auth/me
        console.log('\n3. Consultando información del usuario con /auth/me:');
        const userResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Información del usuario desde /auth/me:');
        console.log(JSON.stringify(userResponse.data, null, 2));
        
        // 4. Verificar si hay inconsistencias
        console.log('\n4. Verificando consistencia:');
        console.log(`Username en token: ${decodedToken.sub}`);
        console.log(`Username en /auth/me: ${userResponse.data.username}`);
        
        if (decodedToken.sub !== userResponse.data.username) {
            console.log('❌ INCONSISTENCIA DETECTADA: El username en el token no coincide con el devuelto por /auth/me');
        } else {
            console.log('✅ Los usernames coinciden');
        }
        
        return {
            token: token,
            decodedToken: decodedToken,
            userInfo: userResponse.data
        };
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Datos: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return null;
    }
}

// Función principal
async function main() {
    try {
        // Primero analizamos el caso de admin para tener una referencia
        await loginAndAnalyze('admin', 'admin123');
        
        // Luego analizamos el caso problemático de Ramon
        await loginAndAnalyze('Ramon', 'Ramon123');
        
        console.log('\n=== ANÁLISIS COMPLETADO ===');
    } catch (error) {
        console.error('Error general:', error);
    }
}

main();
