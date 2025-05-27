// Script de verificación completa para Ramon y Admin
// Este script comprueba todos los aspectos de la autenticación de forma realista

const axios = require('axios');

// Configuración
const config = {
    backendUrl: 'http://localhost:8000',
    adminUser: {
        username: 'admin',
        password: 'admin123'
    },
    ramonUser: {
        username: 'ramon',
        password: 'ramon123'
    }
};

async function verificarAutenticacion() {
    console.log('=== VERIFICACIÓN DE AUTENTICACIÓN PARA ADMIN Y RAMON ===');
    console.log('Este script prueba todo el flujo de autenticación de forma realista\n');
    
    // Función para obtener token
    async function getToken(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        try {
            const response = await axios.post(`${config.backendUrl}/api/v1/auth/login`, 
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            
            return {
                success: true,
                token: response.data.access_token,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response ? error.response.data : error.message
            };
        }
    }
    
    // Función para verificar endpoint protegido
    async function verificarEndpoint(token, endpoint) {
        try {
            const response = await axios.get(`${config.backendUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return {
                success: true,
                status: response.status,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                status: error.response ? error.response.status : 'Sin respuesta',
                error: error.response ? error.response.data : error.message
            };
        }
    }
    
    // Función para decodificar token JWT
    function decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            return { error: 'No se pudo decodificar el token' };
        }
    }
    
    // 1. Verificar autenticación de ADMIN
    console.log('1. Verificando autenticación de ADMIN...');
    const adminAuth = await getToken(config.adminUser.username, config.adminUser.password);
    
    if (adminAuth.success) {
        console.log('✅ ADMIN autenticado correctamente');
        console.log(`   Token: ${adminAuth.token.substring(0, 20)}...`);
        
        // Decodificar token
        const adminTokenData = decodeToken(adminAuth.token);
        console.log('   Datos del token:');
        console.log(`   - Usuario: ${adminTokenData.sub}`);
        console.log(`   - Rol: ${adminTokenData.role}`);
        console.log(`   - Expiración: ${new Date(adminTokenData.exp * 1000).toLocaleString()}`);
        
        // Verificar endpoint /auth/me con admin
        console.log('\n2. Verificando endpoint /api/v1/auth/me con ADMIN...');
        const adminMe = await verificarEndpoint(adminAuth.token, '/api/v1/auth/me');
        
        if (adminMe.success) {
            console.log('✅ Endpoint /auth/me funciona correctamente para ADMIN');
            console.log('   Datos devueltos:');
            console.log(`   - Usuario: ${adminMe.data.username}`);
            console.log(`   - Rol: ${adminMe.data.role}`);
        } else {
            console.log('❌ Error al acceder a /auth/me con ADMIN');
            console.log(`   Estado: ${adminMe.status}`);
            console.log(`   Error: ${JSON.stringify(adminMe.error)}`);
        }
        
        // Verificar endpoint protegido con admin
        console.log('\n3. Verificando endpoint protegido con ADMIN...');
        const adminProtected = await verificarEndpoint(adminAuth.token, '/api/v1/dashboard/stats');
        
        if (adminProtected.success) {
            console.log('✅ Endpoint protegido funciona correctamente para ADMIN');
            console.log('   Estado: ' + adminProtected.status);
        } else {
            console.log('❌ Error al acceder a endpoint protegido con ADMIN');
            console.log(`   Estado: ${adminProtected.status}`);
            console.log(`   Error: ${JSON.stringify(adminProtected.error)}`);
        }
    } else {
        console.log('❌ Error al autenticar ADMIN');
        console.log(`   Error: ${JSON.stringify(adminAuth.error)}`);
    }
    
    // 2. Verificar autenticación de RAMON
    console.log('\n4. Verificando autenticación de RAMON...');
    const ramonAuth = await getToken(config.ramonUser.username, config.ramonUser.password);
    
    if (ramonAuth.success) {
        console.log('✅ RAMON autenticado correctamente');
        console.log(`   Token: ${ramonAuth.token.substring(0, 20)}...`);
        
        // Decodificar token
        const ramonTokenData = decodeToken(ramonAuth.token);
        console.log('   Datos del token:');
        console.log(`   - Usuario: ${ramonTokenData.sub}`);
        console.log(`   - Rol: ${ramonTokenData.role}`);
        console.log(`   - Expiración: ${new Date(ramonTokenData.exp * 1000).toLocaleString()}`);
        
        // Verificar endpoint /auth/me con ramon
        console.log('\n5. Verificando endpoint /api/v1/auth/me con RAMON...');
        const ramonMe = await verificarEndpoint(ramonAuth.token, '/api/v1/auth/me');
        
        if (ramonMe.success) {
            console.log('✅ Endpoint /auth/me funciona correctamente para RAMON');
            console.log('   Datos devueltos:');
            console.log(`   - Usuario: ${ramonMe.data.username}`);
            console.log(`   - Rol: ${ramonMe.data.role}`);
        } else {
            console.log('❌ Error al acceder a /auth/me con RAMON');
            console.log(`   Estado: ${ramonMe.status}`);
            console.log(`   Error: ${JSON.stringify(ramonMe.error)}`);
        }
        
        // Verificar endpoint protegido con ramon
        console.log('\n6. Verificando endpoint protegido con RAMON...');
        const ramonProtected = await verificarEndpoint(ramonAuth.token, '/api/v1/dashboard/stats');
        
        if (ramonProtected.success) {
            console.log('✅ Endpoint protegido funciona correctamente para RAMON');
            console.log('   Estado: ' + ramonProtected.status);
        } else {
            console.log('❌ Error al acceder a endpoint protegido con RAMON');
            console.log(`   Estado: ${ramonProtected.status}`);
            console.log(`   Error: ${JSON.stringify(ramonProtected.error)}`);
        }
    } else {
        console.log('❌ Error al autenticar RAMON');
        console.log(`   Error: ${JSON.stringify(ramonAuth.error)}`);
    }
    
    console.log('\n=== VERIFICACIÓN COMPLETADA ===');
}

// Ejecutar verificación
verificarAutenticacion().catch(error => {
    console.error('Error durante la verificación:', error);
});
