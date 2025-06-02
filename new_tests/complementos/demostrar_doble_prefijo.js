// Script para demostrar el problema del doble prefijo
const axios = require('axios');
const querystring = require('querystring');

// Configura la URL base del servidor AWS
const baseUrl = 'http://108.129.139.119:8000';

// Credenciales para autenticación
const credentials = {
  username: 'admin',
  password: 'admin123'
};

// Datos en formato formulario
const formData = querystring.stringify(credentials);

// Configuración para formulario
const formConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }
};

// Lista de rutas a probar
const rutas = [
  { nombre: "FRONTEND (apiConfig)", url: `/api/api/v1/auth/login`, descripcion: "URL con doble prefijo como envía el frontend" },
  { nombre: "NGINX (location /api/)", url: `/api/auth/login`, descripcion: "URL con prefijo simple que Nginx transforma" },
  { nombre: "BACKEND (directo)", url: `/api/v1/auth/login`, descripcion: "URL correcta directa al backend" }
];

// Función principal para demostrar el problema
async function demostrarProblema() {
  console.log('\n🔍 DEMOSTRANDO EL ORIGEN DEL DOBLE PREFIJO EN AWS');
  console.log('====================================================\n');
  
  console.log('Este script demuestra cómo tanto el frontend como Nginx contribuyen al problema:');
  console.log('1. El frontend está configurado para enviar URLs con doble prefijo (/api/api/v1)');
  console.log('2. Nginx está configurado para añadir /api/v1 a peticiones que solo llevan /api\n');
  
  // Probar cada ruta
  for (const ruta of rutas) {
    console.log(`\n📌 PRUEBA: ${ruta.nombre}`);
    console.log(`Descripción: ${ruta.descripcion}`);
    console.log(`URL: ${baseUrl}${ruta.url}`);
    
    try {
      const response = await axios.post(
        `${baseUrl}${ruta.url}`, 
        formData, 
        formConfig
      );
      
      console.log('✅ ÉXITO - Status:', response.status);
      console.log('Token recibido:', response.data.access_token ? '✓ SI' : '✗ NO');
      
      // Mostrar headers relevantes
      console.log('\nHeaders respuesta:');
      console.log('- Content-Type:', response.headers['content-type']);
      if (response.headers['location']) {
        console.log('- Location:', response.headers['location']);
      }
      
    } catch (error) {
      console.log('❌ ERROR - Status:', error.response?.status || 'No response');
      if (error.response) {
        console.log('Mensaje:', error.response.data.detail || JSON.stringify(error.response.data));
        
        // Mostrar headers relevantes (especialmente redirecciones)
        console.log('\nHeaders respuesta:');
        console.log('- Content-Type:', error.response.headers['content-type']);
        if (error.response.headers['location']) {
          console.log('- Location:', error.response.headers['location']);
        }
      } else {
        console.log('Error:', error.message);
      }
    }
    
    console.log('--------------------------------------------------');
  }
  
  console.log('\n✨ CONCLUSIÓN:');
  console.log('1. El frontend envía URLs con doble prefijo por configuración en apiConfig.ts');
  console.log('2. Nginx está configurado para convertir /api/* en /api/v1/* (añadiendo v1)');
  console.log('3. La solución requiere corregir ambos puntos');
}

// Ejecutar demostración
demostrarProblema().catch(err => {
  console.error('Error global:', err.message);
});
