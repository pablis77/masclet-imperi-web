/**
 * Script para verificar por qué el rol de Ramon no se está modificando correctamente
 */

const axios = require('axios');

// Configuración
const BACKEND_URL = 'http://localhost:8000';

async function testRamonRole() {
    console.log('=== VERIFICACIÓN DE ROL DE RAMON ===');
    
    try {
        // 1. Hacer login como Ramon
        console.log('\n1. Iniciando sesión como Ramon');
        const params = new URLSearchParams();
        params.append('username', 'Ramon');
        params.append('password', 'Ramon123');
        
        const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('✅ Login exitoso');
        const token = loginResponse.data.access_token;
        console.log(`Token: ${token.substring(0, 20)}...`);
        
        // 2. Obtener información del usuario
        console.log('\n2. Obteniendo información del usuario con /auth/me');
        const userResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Información del usuario:');
        console.log(JSON.stringify(userResponse.data, null, 2));
        
        // 3. Decodificar el token JWT para ver qué contiene
        console.log('\n3. Verificando token JWT');
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log('Contenido del token JWT:');
            console.log(JSON.stringify(payload, null, 2));
            
            console.log('\nComparando roles:');
            console.log(`- Rol en token JWT: ${payload.role}`);
            console.log(`- Rol en respuesta de /auth/me: ${userResponse.data.role}`);
            
            if (payload.role !== userResponse.data.role) {
                console.log('❌ Los roles no coinciden');
            } else {
                console.log('✅ Los roles coinciden');
            }
        } else {
            console.log('❌ Formato de token inválido');
        }
        
    } catch (error) {
        console.error('Error en la prueba:', error.message);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.status, error.response.data);
        }
    }
}

testRamonRole().then(() => {
    console.log('\n=== VERIFICACIÓN COMPLETADA ===');
});
