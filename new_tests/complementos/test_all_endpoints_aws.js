// Script para probar múltiples endpoints en el servidor AWS
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

// Configuración para JSON (resto de endpoints)
const jsonConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Lista de endpoints a probar
const endpoints = [
  // Grupo 1: Autenticación y usuarios
  { 
    name: 'Login', 
    url: `/api/v1/auth/login`, 
    method: 'post',
    data: querystring.stringify(credentials),
    config: formConfig
  },
  { 
    name: 'Mi perfil', 
    url: `/api/v1/users/me`, 
    method: 'get',
    requiresAuth: true
  },
  
  // Grupo 2: Animales
  { 
    name: 'Listar animales', 
    url: `/api/v1/animals/`, 
    method: 'get',
    requiresAuth: true
  },
  { 
    name: 'Obtener un animal', 
    url: `/api/v1/animals/1`, 
    method: 'get',
    requiresAuth: true
  },
  
  // Grupo 3: Partos
  { 
    name: 'Listar partos', 
    url: `/api/v1/partos/`, 
    method: 'get',
    requiresAuth: true
  },
  { 
    name: 'Obtener un parto', 
    url: `/api/v1/partos/1`, 
    method: 'get',
    requiresAuth: true
  },
  
  // Grupo 4: Dashboard
  { 
    name: 'Estadísticas', 
    url: `/api/v1/dashboard/stats`, 
    method: 'get',
    requiresAuth: true
  },
  
  // Grupo 5: Importación
  { 
    name: 'Estado de importación', 
    url: `/api/v1/import/status`, 
    method: 'get',
    requiresAuth: true
  }
];

// Prueba de cada endpoint con y sin doble prefijo
async function testAllEndpoints() {
  console.log('🔍 Iniciando pruebas de todos los endpoints en AWS...');
  console.log('Servidor: ' + baseUrl);
  console.log('\n=== COMENZANDO PRUEBAS ===\n');

  // Primero obtenemos un token de autenticación
  let accessToken = null;
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const loginResponse = await axios.post(
      `${baseUrl}/api/v1/auth/login`, 
      querystring.stringify(credentials), 
      formConfig
    );
    
    if (loginResponse.status === 200 && loginResponse.data.access_token) {
      accessToken = loginResponse.data.access_token;
      console.log('✅ Token obtenido correctamente: ' + accessToken.substring(0, 10) + '...');
    } else {
      console.log('❌ No se pudo obtener token. Respuesta:', loginResponse.data);
      return;
    }
  } catch (error) {
    console.log('❌ Error al obtener token:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mensaje:', error.response.data.detail || JSON.stringify(error.response.data));
    }
    return;
  }

  // Configuración con token para endpoints autenticados
  const authConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  };

  // Ejecutar pruebas para cada endpoint
  for (const endpoint of endpoints) {
    if (endpoint.name === 'Login') {
      console.log(`\n✅ Login ya probado exitosamente durante la obtención del token`);
      continue;
    }

    console.log(`\n\n📡 PROBANDO ENDPOINT: ${endpoint.name}`);
    
    // Probar con URL normal (1 prefijo)
    const normalUrl = `${baseUrl}${endpoint.url}`;
    await testEndpoint(
      `URL normal: ${normalUrl}`, 
      normalUrl, 
      endpoint.method, 
      endpoint.data, 
      endpoint.requiresAuth ? authConfig : (endpoint.config || jsonConfig)
    );
    
    // Probar con URL doble prefijo
    const doubleUrl = `${baseUrl}/api${endpoint.url}`;
    await testEndpoint(
      `URL doble prefijo: ${doubleUrl}`, 
      doubleUrl, 
      endpoint.method, 
      endpoint.data, 
      endpoint.requiresAuth ? authConfig : (endpoint.config || jsonConfig)
    );
    
    console.log('\n==========================================');
  }
  
  console.log('\n\n💯 PRUEBAS FINALIZADAS');
}

// Función para probar un endpoint individual
async function testEndpoint(description, url, method, data, config) {
  try {
    console.log(`\n🧪 ${description}`);
    
    let response;
    if (method === 'get') {
      response = await axios.get(url, config);
    } else if (method === 'post') {
      response = await axios.post(url, data || {}, config);
    } else if (method === 'put') {
      response = await axios.put(url, data || {}, config);
    } else {
      response = await axios.delete(url, config);
    }
    
    console.log('✅ ÉXITO:');
    console.log('Status:', response.status);
    
    // Limitar la cantidad de datos mostrados para evitar sobrecarga
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        console.log(`Datos: Array con ${response.data.length} elementos`);
        if (response.data.length > 0) {
          console.log('Primer elemento:', JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...');
        }
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        console.log('Datos:', dataStr.length > 300 ? dataStr.substring(0, 300) + '...' : dataStr);
      }
    } else {
      console.log('Datos:', response.data);
    }
  } catch (error) {
    console.log('❌ ERROR:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mensaje:', error.response.data.detail || JSON.stringify(error.response.data));
    } else {
      console.log('Error de red:', error.message);
    }
  }
}

// Ejecutar todas las pruebas
testAllEndpoints().catch(err => {
  console.error('Error global:', err.message);
});
