/**
 * Script para probar directamente el login de Ramon contra el backend
 */

const axios = require('axios');

// Configuración
const BACKEND_URL = 'http://localhost:8000';

async function testBackendLogin(username, password) {
    console.log(`Probando login con ${username}/${password}`);
    
    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log(`✅ Login exitoso para ${username}`);
        console.log(`Token JWT: ${response.data.access_token.substring(0, 20)}...`);
        
        // Usar el token para obtener información del usuario
        const userResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${response.data.access_token}`
            }
        });
        
        console.log('\n📊 Información del usuario:');
        console.log(JSON.stringify(userResponse.data, null, 2));
        
        return {
            success: true,
            user: userResponse.data
        };
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Datos: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return { success: false };
    }
}

// Intentar con diferentes combinaciones de credenciales
async function runTests() {
    console.log('=== TEST DE AUTENTICACIÓN BACKEND PARA RAMON ===\n');
    
    // Probar con Ramon/Ramon123
    console.log('\n=== Test #1: Ramon/Ramon123 ===');
    await testBackendLogin('Ramon', 'Ramon123');
    
    // Probar con admin/admin123 (sabemos que estas funcionan)
    console.log('\n=== Test #2: admin/admin123 ===');
    await testBackendLogin('admin', 'admin123');
    
    // Probar con ramon minúsculas
    console.log('\n=== Test #3: ramon/Ramon123 ===');
    await testBackendLogin('ramon', 'Ramon123');
    
    // Probar otra contraseña
    console.log('\n=== Test #4: Ramon/admin123 ===');
    await testBackendLogin('Ramon', 'admin123');
}

runTests().then(() => {
    console.log('\n=== TESTS COMPLETADOS ===');
}).catch(err => {
    console.error('Error general:', err);
});
