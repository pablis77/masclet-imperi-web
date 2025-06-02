// Script para verificar la solución del problema de doble prefijo
const axios = require('axios');
const querystring = require('querystring');

// Configura la URL base del servidor AWS
const baseUrl = 'http://108.129.139.119:8000';

// Credenciales para autenticación
const credentials = {
  username: 'admin',
  password: 'admin123'
};

// Configuración para form-data (login)
const formConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }
};

// Prueba de autenticación para verificar que todo funciona
async function verificarSolucion() {
  console.log('🔍 Verificando solución del problema de prefijos en AWS...');
  console.log(`Servidor: ${baseUrl}`);
  console.log('\n=== INICIANDO VERIFICACIÓN ===\n');

  try {
    console.log('🔐 1. Probando autenticación con formato form-urlencoded...');
    const loginUrl = `${baseUrl}/api/v1/auth/login`;
    console.log(`URL: ${loginUrl}`);
    
    const formData = querystring.stringify(credentials);
    console.log('Datos enviados:', formData);
    
    const loginResponse = await axios.post(loginUrl, formData, formConfig);
    
    if (loginResponse.status === 200 && loginResponse.data.access_token) {
      console.log('✅ AUTENTICACIÓN EXITOSA');
      console.log('Token recibido: ' + loginResponse.data.access_token.substring(0, 10) + '...');
      
      // Configuración con token para probar endpoint de perfil
      const token = loginResponse.data.access_token;
      const authConfig = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      };
      
      // Prueba 2: Obtener perfil de usuario
      console.log('\n🧪 2. Probando endpoint de perfil de usuario...');
      const profileUrl = `${baseUrl}/api/v1/users/me`;
      console.log(`URL: ${profileUrl}`);
      
      const profileResponse = await axios.get(profileUrl, authConfig);
      
      if (profileResponse.status === 200) {
        console.log('✅ PERFIL OBTENIDO CORRECTAMENTE');
        console.log('Usuario:', profileResponse.data.username);
        console.log('Rol:', profileResponse.data.role);
        
        // Prueba 3: Obtener estadísticas del dashboard
        console.log('\n🧪 3. Probando endpoint de estadísticas...');
        const statsUrl = `${baseUrl}/api/v1/dashboard/stats`;
        console.log(`URL: ${statsUrl}`);
        
        const statsResponse = await axios.get(statsUrl, authConfig);
        
        if (statsResponse.status === 200) {
          console.log('✅ ESTADÍSTICAS OBTENIDAS CORRECTAMENTE');
          console.log('Total de animales:', statsResponse.data.animales.total);
          console.log('\n✅ TODAS LAS PRUEBAS PASARON CORRECTAMENTE');
          console.log('La solución del problema de prefijos está funcionando!');
        } else {
          console.log('❌ ERROR AL OBTENER ESTADÍSTICAS');
        }
      } else {
        console.log('❌ ERROR AL OBTENER PERFIL');
      }
    } else {
      console.log('❌ ERROR DE AUTENTICACIÓN');
      console.log('Respuesta:', loginResponse.data);
    }
  } catch (error) {
    console.log('❌ ERROR EN LA VERIFICACIÓN:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mensaje:', error.response.data.detail || JSON.stringify(error.response.data));
    } else {
      console.log('Error de red:', error.message);
    }
  }
}

// Ejecutar verificación
verificarSolucion().catch(err => {
  console.error('Error global:', err.message);
});
