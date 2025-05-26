/**
 * Script de prueba para verificar el sistema de autenticación y roles actual
 * 
 * Este script permite probar el login con diferentes usuarios y verificar cómo
 * se manejan los roles y permisos sin modificar el código existente.
 */

// Configuración para simular entorno del navegador
global.localStorage = {
  _data: {},
  setItem(key, value) {
    this._data[key] = value;
  },
  getItem(key) {
    return this._data[key] || null;
  },
  removeItem(key) {
    delete this._data[key];
  },
  clear() {
    this._data = {};
  }
};

// Configurar cross-fetch para Node.js
import fetch from 'node-fetch';
global.fetch = fetch;

// Simulación básica del objeto window
if (typeof window === 'undefined') {
  global.window = {
    location: {
      hostname: 'localhost'
    }
  };
}

// Función para simular credenciales de login
async function testLogin(username, password, backendUrl = 'http://127.0.0.1:8000/api/v1') {
  console.log(`\n--- Probando usuario: ${username} ---`);
  
  try {
    // Preparar datos para autenticación
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    // Realizar petición de login
    console.log(`Intentando login con usuario ${username}...`);
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    // Procesar respuesta
    const data = await response.json();
    
    // Mostrar resultado
    console.log("Status:", response.status);
    console.log("Respuesta:", JSON.stringify({
      token_type: data.token_type,
      access_token: data.access_token ? data.access_token.substring(0, 15) + '...' : null,
      user: data.user || 'No disponible'
    }, null, 2));
    
    // Almacenar token en localStorage simulado
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      console.log("Token guardado en localStorage");
    }
    
    // Verificar información del JWT (opcional)
    if (data.access_token) {
      try {
        const tokenParts = data.access_token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log("Información del token JWT:", payload);
        }
      } catch (error) {
        console.error("Error al decodificar token:", error.message);
      }
    }
    
    // Extraer información potencial del rol
    const detectedRole = detectUserRole(username, data);
    console.log("Rol detectado basado en lógica actual:", detectedRole);
    
    // Limpiar localStorage para la siguiente prueba
    localStorage.clear();
    
    return data;
  } catch (error) {
    console.error(`Error al probar usuario ${username}:`, error.message);
    return null;
  }
}

// Función para detectar rol del usuario basada en la lógica existente
function detectUserRole(username, loginResponse) {
  // Verificar si el rol está en la respuesta
  if (loginResponse.user && loginResponse.user.role) {
    return loginResponse.user.role;
  }
  
  // Lógica basada en nombre de usuario (según authService.ts)
  if (username === 'admin') {
    return 'administrador';
  } else if (username === 'ramon') {
    return 'gerente';
  } else if (username.includes('editor')) {
    return 'editor';
  }
  
  // Valor por defecto
  return 'usuario';
}

// Función principal para probar todos los usuarios
async function runTests() {
  console.log("=== PRUEBA DE AUTENTICACIÓN Y ROLES ===");
  console.log("Fecha y hora:", new Date().toLocaleString());
  
  // Configurar URL del backend
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000/api/v1';
  console.log(`Usando backend: ${backendUrl}`);
  
  // Array de usuarios de prueba
  const testUsers = [
    { username: "admin", password: "admin123", expectedRole: "administrador" },
    { username: "ramon", password: "ramon123", expectedRole: "gerente" },
    { username: "editor", password: "editor123", expectedRole: "editor" },
    { username: "usuario", password: "usuario123", expectedRole: "usuario" }
  ];
  
  // Probar cada usuario
  for (const user of testUsers) {
    await testLogin(user.username, user.password, backendUrl);
  }
  
  console.log("\n=== FIN DE LA PRUEBA ===");
}

// Ejecutar pruebas
runTests().catch(console.error);
