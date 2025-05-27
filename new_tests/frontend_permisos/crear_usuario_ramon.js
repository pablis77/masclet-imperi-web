/**
 * Script para crear el usuario Ramon en la base de datos
 * con el rol correcto de "Ramon"
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

// Primero vamos a iniciar sesión como admin para obtener un token
async function loginAsAdmin() {
    console.log('Iniciando sesión como admin para obtener token...');
    
    try {
        const params = new URLSearchParams();
        params.append('username', 'admin');
        params.append('password', 'admin123');
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('✅ Login como admin exitoso');
        return response.data.access_token;
    } catch (error) {
        console.log(`❌ Error al iniciar sesión como admin: ${error.message}`);
        throw error;
    }
}

// Verificar si el usuario Ramon ya existe
async function checkIfRamonExists(token) {
    console.log('Verificando si el usuario Ramon ya existe...');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/auth/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const users = response.data;
        console.log(`Total de usuarios encontrados: ${users.length}`);
        
        const ramonUser = users.find(user => 
            user.username.toLowerCase() === 'ramon' && 
            user.username !== 'admin'
        );
        
        if (ramonUser) {
            console.log('✅ Usuario Ramon encontrado:');
            console.log(JSON.stringify(ramonUser, null, 2));
            return ramonUser;
        } else {
            console.log('❌ Usuario Ramon no encontrado');
            return null;
        }
    } catch (error) {
        console.log(`❌ Error al verificar usuario Ramon: ${error.message}`);
        throw error;
    }
}

// Crear usuario Ramon con el rol correcto
async function createRamonUser(token) {
    console.log('Creando nuevo usuario Ramon...');
    
    try {
        const userData = {
            username: 'ramon',
            password: 'Ramon123',
            email: 'ramon@mascletimperi.com',
            role: 'Ramon'  // Intentamos usar el rol Ramon que añadimos en config.py
        };
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/register`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Usuario Ramon creado exitosamente:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.log(`❌ Error al crear usuario Ramon: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Datos: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        
        // Intentar con rol GERENTE si falla
        console.log('Intentando crear usuario Ramon con rol GERENTE...');
        
        try {
            const userData = {
                username: 'ramon',
                password: 'Ramon123',
                email: 'ramon@mascletimperi.com',
                role: 'gerente'  // Usando el rol GERENTE que existe en ambas definiciones
            };
            
            const response = await axios.post(`${BACKEND_URL}/api/v1/auth/register`, userData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Usuario Ramon creado exitosamente con rol GERENTE:');
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (secondError) {
            console.log(`❌ Error al crear usuario Ramon con rol GERENTE: ${secondError.message}`);
            if (secondError.response) {
                console.log(`   Status: ${secondError.response.status}`);
                console.log(`   Datos: ${JSON.stringify(secondError.response.data, null, 2)}`);
            }
            throw secondError;
        }
    }
}

// Probar el login del nuevo usuario Ramon
async function testRamonLogin() {
    console.log('\nProbando login con el usuario Ramon...');
    
    try {
        const params = new URLSearchParams();
        params.append('username', 'ramon');
        params.append('password', 'Ramon123');
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('✅ Login como Ramon exitoso');
        
        // Verificar información del usuario
        const userResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${response.data.access_token}`
            }
        });
        
        console.log('\n📊 Información del usuario Ramon:');
        console.log(JSON.stringify(userResponse.data, null, 2));
        
        return userResponse.data;
    } catch (error) {
        console.log(`❌ Error al iniciar sesión como Ramon: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Datos: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return null;
    }
}

// Ejecutar el proceso completo
async function main() {
    console.log('=== CREACIÓN Y VERIFICACIÓN DE USUARIO RAMON ===\n');
    
    try {
        // 1. Login como admin
        const adminToken = await loginAsAdmin();
        
        // 2. Verificar si Ramon ya existe
        const existingRamon = await checkIfRamonExists(adminToken);
        
        // 3. Crear usuario Ramon si no existe
        if (!existingRamon) {
            await createRamonUser(adminToken);
        }
        
        // 4. Probar login con el usuario Ramon
        await testRamonLogin();
        
        console.log('\n=== PROCESO COMPLETADO ===');
    } catch (error) {
        console.error('\n❌ ERROR GENERAL:', error.message);
    }
}

// Ejecutar el script
main();
