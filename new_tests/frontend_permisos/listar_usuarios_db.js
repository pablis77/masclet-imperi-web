/**
 * Script para listar todos los usuarios en la base de datos y sus roles reales
 */

const axios = require('axios');

// Configuración
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

// Listar todos los usuarios
async function listAllUsers(token) {
    console.log('\n=== LISTA DE USUARIOS EN BASE DE DATOS ===');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/auth/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Mostrar la respuesta completa para ver su estructura
        console.log('Respuesta del endpoint /users:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Extraer los usuarios - verificar si es un array o está dentro de alguna propiedad
        let users = [];
        if (Array.isArray(response.data)) {
            users = response.data;
        } else if (response.data && typeof response.data === 'object') {
            // Buscar alguna propiedad que podría contener los usuarios
            const possibleArrayProps = Object.keys(response.data).filter(key => 
                Array.isArray(response.data[key]));
            
            if (possibleArrayProps.length > 0) {
                users = response.data[possibleArrayProps[0]];
            } else {
                // Si es un único usuario, convertirlo en array
                if (response.data.username) {
                    users = [response.data];
                }
            }
        }
        
        console.log(`Total de usuarios encontrados: ${users.length}`);
        
        // Mostrar todos los usuarios y sus roles
        users.forEach((user, index) => {
            console.log(`\n-- Usuario #${index + 1} --`);
            console.log(`ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Rol: ${user.role}`);
            console.log(`Activo: ${user.is_active}`);
            
            // Mostrar todo el objeto para debugging
            console.log('\nObjeto completo:');
            console.log(JSON.stringify(user, null, 2));
        });
        
        // Verificar específicamente si existe Ramon
        const ramonUser = users.find(user => 
            user.username.toLowerCase() === 'ramon'
        );
        
        if (ramonUser) {
            console.log('\n=== INFORMACIÓN ESPECÍFICA DE RAMON ===');
            console.log(JSON.stringify(ramonUser, null, 2));
        } else {
            console.log('\n❌ No se encontró ningún usuario con nombre "ramon"');
        }
        
        return users;
    } catch (error) {
        console.log(`❌ Error al listar usuarios: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Datos: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        throw error;
    }
}

// Probemos el login de Ramon para ver qué devuelve
async function testRamonLogin() {
    console.log('\n=== PRUEBA DE LOGIN COMO RAMON ===');
    console.log('Probando login con Ramon/Ramon123');
    
    try {
        const params = new URLSearchParams();
        params.append('username', 'Ramon');
        params.append('password', 'Ramon123');
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('✅ Login exitoso para Ramon');
        console.log(`Token JWT: ${response.data.access_token.substring(0, 20)}...`);
        
        // Usar el token para obtener información del usuario
        const userResponse = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${response.data.access_token}`
            }
        });
        
        console.log('\n📊 Información del usuario con login como Ramon:');
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

// Ejecutar los tests
async function main() {
    try {
        // 1. Iniciar sesión como admin
        const adminToken = await loginAsAdmin();
        
        // 2. Listar todos los usuarios
        await listAllUsers(adminToken);
        
        // 3. Probar login como Ramon
        await testRamonLogin();
        
        console.log('\n=== ANÁLISIS COMPLETADO ===');
    } catch (error) {
        console.error('Error general:', error);
    }
}

main();
