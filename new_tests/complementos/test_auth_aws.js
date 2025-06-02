// Script para probar la autenticación en el servidor AWS
const axios = require('axios');
const querystring = require('querystring');

// Configura la URL base del servidor AWS
const baseUrl = 'http://108.129.139.119:8000';

// Credenciales de prueba
const credentials = {
  username: 'admin',
  password: 'admin123'
};

// Credenciales en formato de formulario
const formData = querystring.stringify(credentials);

// Configuración para JSON
const jsonConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Configuración para formulario
const formConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }
};

// Lista de URLs a probar
const endpoints = [
  { name: 'URL Directa', url: `${baseUrl}/api/v1/auth/login` },
  { name: 'URL con Doble Prefijo', url: `${baseUrl}/api/api/v1/auth/login` },
  { name: 'URL Sin Prefijo', url: `${baseUrl}/auth/login` }
];

// Función para probar la autenticación con diferentes configuraciones de URL
async function testAuthentication() {
  console.log('🔍 Iniciando pruebas de autenticación en AWS...');
  console.log('Servidor: ' + baseUrl);
  console.log('Credenciales: ' + JSON.stringify(credentials));
  console.log('\n=== COMENZANDO PRUEBAS ===\n');

  // Probar cada endpoint con JSON y con Form Data
  for (const endpoint of endpoints) {
    // Prueba con JSON
    try {
      console.log(`\n\n🧪 PRUEBA CON JSON: ${endpoint.name}`);
      console.log(`URL: ${endpoint.url}`);
      console.log('Datos enviados (JSON):', JSON.stringify(credentials, null, 2));
      
      const response = await axios.post(endpoint.url, credentials, jsonConfig);
      console.log('\n✅ ÉXITO:');
      console.log('Status:', response.status);
      console.log('Token:', response.data.access_token ? '[TOKEN RECIBIDO]' : 'No token');
      console.log('Tipo:', response.data.token_type || 'N/A');
    } catch (error) {
      console.log('\n❌ ERROR:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Mensaje:', error.response.data.detail || JSON.stringify(error.response.data));
      } else {
        console.log('Error de red:', error.message);
      }
    }
    
    console.log('\n------------------------------------------');
    
    // Prueba con Form Data
    try {
      console.log(`\n🧪 PRUEBA CON FORM: ${endpoint.name}`);
      console.log(`URL: ${endpoint.url}`);
      console.log('Datos enviados (Form):', formData);
      
      const response = await axios.post(endpoint.url, formData, formConfig);
      console.log('\n✅ ÉXITO:');
      console.log('Status:', response.status);
      console.log('Token:', response.data.access_token ? '[TOKEN RECIBIDO]' : 'No token');
      console.log('Tipo:', response.data.token_type || 'N/A');
    } catch (error) {
      console.log('\n❌ ERROR:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Mensaje:', error.response.data.detail || JSON.stringify(error.response.data));
      } else {
        console.log('Error de red:', error.message);
      }
    }
    
    console.log('\n==========================================');
  }
  
  console.log('\n\n PRUEBAS FINALIZADAS');
}

// Ejecutar las pruebas
testAuthentication().catch(error => {
  console.error('Error global en el script:', error);
});
