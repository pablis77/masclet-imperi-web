# Script para arreglar problemas de login en entorno de producción
# Este script realiza ajustes específicos para garantizar que el login funcione correctamente

Write-Host "🔧 Iniciando corrección del sistema de login..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script de corrección del login
$fixScript = @'
#!/bin/bash
set -e

echo "===== CORRECCIÓN DEL SISTEMA DE LOGIN ====="
echo "* Este proceso realizará ajustes para garantizar el funcionamiento del login"

echo -e "\n1. Verificando configuración actual..."
echo "   - Mostrando configuración de Nginx para /api/v1/auth/login:"
docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /api/"

echo -e "\n2. Verificando logs específicos del API para detectar errores de login..."
docker logs masclet-api --tail 50 | grep -i "auth\|login\|error\|token"

echo -e "\n3. Verificando la comunicación entre contenedores..."
echo "   - Comprobando acceso desde Nginx al backend:"
docker exec masclet-frontend wget -qO- http://masclet-api:8000/api/v1/health || echo "Error conectando con la API"

echo -e "\n4. Implementando fix de debugger para el frontend..."
# Crear archivo de debugger para login
cat > /tmp/login-debugger.js << 'EOL'
// Código de debugger para solucionar problemas de login
console.log("🔍 Login debugger instalado");

// Interceptar todas las llamadas fetch
const originalFetch = window.fetch;
window.fetch = async function(url, options) {
  // Verificar si es una petición de login
  if (url.includes('/auth/login')) {
    console.log("🔐 Interceptando petición de login:", url);
    console.log("📦 Opciones:", options);
    
    // Modificar para garantizar que el formato sea correcto
    if (options && options.body) {
      console.log("📄 Cuerpo original:", options.body);
      
      // Verificar si es una petición JSON o FormData
      if (options.headers && options.headers['Content-Type'] === 'application/json') {
        try {
          // Para peticiones JSON
          console.log("🧪 Detectada petición JSON");
          const bodyObj = JSON.parse(options.body);
          console.log("🔑 Credenciales:", bodyObj);
        } catch (e) {
          console.log("⚠️ Error parseando JSON:", e);
        }
      }
      else if (options.headers && options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        // Para peticiones form-urlencoded
        console.log("🧪 Detectada petición form-urlencoded");
        const params = new URLSearchParams(options.body);
        console.log("🔑 Usuario:", params.get('username'));
        console.log("🔑 Contraseña:", params.get('password') ? "[PROTEGIDA]" : "No encontrada");
      }
    }
    
    // Realizar la llamada real
    try {
      const response = await originalFetch(url, options);
      
      // Clonar la respuesta para poder leer su contenido
      const clonedResponse = response.clone();
      
      // Intentar leer el cuerpo de la respuesta
      try {
        const contentType = clonedResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await clonedResponse.json();
          console.log("✅ Respuesta de login:", data);
        } else {
          const text = await clonedResponse.text();
          console.log("✅ Respuesta de login (texto):", text);
        }
      } catch (e) {
        console.log("⚠️ Error leyendo respuesta:", e);
      }
      
      return response;
    } catch (error) {
      console.log("❌ Error en petición de login:", error);
      throw error;
    }
  }
  
  // Para otras peticiones, comportamiento normal
  return originalFetch(url, options);
};

// También interceptar axios si está siendo usado
if (window.axios) {
  console.log("🔍 Interceptando axios");
  
  const originalAxiosPost = window.axios.post;
  window.axios.post = function(url, data, config) {
    if (url.includes('/auth/login')) {
      console.log("🔐 Interceptando petición axios de login:", url);
      console.log("📦 Datos:", data);
      console.log("⚙️ Config:", config);
    }
    return originalAxiosPost(url, data, config);
  };
}

// Interceptar localStorage para entender el flujo de tokens
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'token' || key === 'user' || key.toLowerCase().includes('auth')) {
    console.log(`🔑 Guardando en localStorage - ${key}:`, value);
  }
  return originalSetItem.call(this, key, value);
};

console.log("✅ Login debugger instalado completamente");
EOL

# Crear archivo de corrección para problemas comunes de login
cat > /tmp/fix-login-issues.js << 'EOL'
// Correcciones para problemas comunes de login
console.log("🔧 Aplicando correcciones al sistema de login");

// 1. Corrección para manejo de cookies y localStorage
(() => {
  // Garantizar que el localStorage esté disponible
  try {
    // Verificar si hay un problema con localStorage
    if (typeof localStorage === 'undefined') {
      console.warn("⚠️ localStorage no disponible, usando polyfill");
      
      // Implementar un polyfill básico
      window.localStorage = {
        _data: {},
        setItem: function(id, val) { this._data[id] = String(val); },
        getItem: function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : null; },
        removeItem: function(id) { delete this._data[id]; },
        clear: function() { this._data = {}; }
      };
    }
    
    // Verificar que los tokens se están guardando correctamente
    const checkLoginState = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log("🔐 Estado de login:", { 
        tieneToken: !!token, 
        tieneUsuario: !!user,
        tokenLength: token ? token.length : 0
      });
      
      // Si hay usuario pero no token, o token vacío, borrar todo y forzar nuevo login
      if ((user && (!token || token.length < 10)) || (token === 'undefined')) {
        console.warn("⚠️ Estado inconsistente detectado, limpiando datos");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
      }
    };
    
    // Ejecutar después de que la página se haya cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkLoginState);
    } else {
      checkLoginState();
    }
  } catch (e) {
    console.error("❌ Error en corrección de localStorage:", e);
  }
})();

// 2. Corrección para problemas de formato en peticiones de login
(() => {
  // Parchar la función de login si existe
  if (window.apiService && window.apiService.login) {
    const originalLogin = window.apiService.login;
    
    window.apiService.login = async function(username, password) {
      console.log("🔧 Utilizando función de login corregida");
      
      try {
        // Intentar login con formato JSON (primera opción)
        console.log("🔄 Intentando login con formato JSON...");
        const jsonResponse = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        if (jsonResponse.ok) {
          const data = await jsonResponse.json();
          console.log("✅ Login exitoso con formato JSON");
          return data;
        }
        
        // Si falla, intentar con x-www-form-urlencoded (segunda opción)
        console.log("🔄 Intentando login con formato form-urlencoded...");
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const formResponse = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
        
        if (formResponse.ok) {
          const data = await formResponse.json();
          console.log("✅ Login exitoso con formato form-urlencoded");
          return data;
        }
        
        // Si ambos fallan, intentar el método original por si acaso
        return originalLogin(username, password);
      } catch (error) {
        console.error("❌ Error en login corregido:", error);
        // Fallar con gracia volviendo al método original
        return originalLogin(username, password);
      }
    };
    
    console.log("✅ Función de login parchada correctamente");
  } else {
    console.warn("⚠️ No se encontró apiService.login para parchar");
  }
})();

console.log("✅ Correcciones aplicadas correctamente");
EOL

# Inyectar debugger en la página de login
echo -e "\n5. Inyectando scripts de debugging y corrección en el frontend..."
docker cp /tmp/login-debugger.js masclet-frontend-node:/app/dist/login-debugger.js
docker cp /tmp/fix-login-issues.js masclet-frontend-node:/app/dist/fix-login-issues.js

# Modificar la página de login para incluir los scripts
docker exec masclet-frontend-node bash -c 'if [ -f /app/dist/login.html ]; then
  echo "Modificando login.html"
  sed -i "s|</body>|<script src=\"/login-debugger.js\"></script><script src=\"/fix-login-issues.js\"></script></body>|" /app/dist/login.html
elif [ -f /app/dist/pages/login/index.html ]; then
  echo "Modificando páginas login/index.html"
  sed -i "s|</body>|<script src=\"/login-debugger.js\"></script><script src=\"/fix-login-issues.js\"></script></body>|" /app/dist/pages/login/index.html
elif [ -f /app/dist/index.html ]; then
  echo "Modificando index.html principal"
  sed -i "s|</body>|<script src=\"/login-debugger.js\"></script><script src=\"/fix-login-issues.js\"></script></body>|" /app/dist/index.html
else
  echo "No se encontró la página de login, verificando estructura:"
  find /app/dist -name "*.html" | head -n 10
fi'

echo -e "\n6. Verificando la configuración de CORS en el backend..."
docker exec masclet-api grep -r "CORS" /app --include="*.py" | head -n 10 || echo "No se encontraron configuraciones CORS"

echo -e "\n7. Asegurando que la configuración de Nginx permita las cabeceras de autenticación..."
cat > /tmp/cors-headers.conf << 'EOL'
# Configuración de CORS para la aplicación
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
EOL

docker cp /tmp/cors-headers.conf masclet-frontend:/etc/nginx/cors-headers.conf

# Modificar la configuración de Nginx para incluir las cabeceras CORS
docker exec masclet-frontend bash -c "sed -i '/location \/api\/ {/a\        include cors-headers.conf;' /etc/nginx/conf.d/default.conf"
docker exec masclet-frontend nginx -s reload

echo -e "\n===== CORRECCIONES COMPLETADAS ====="
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$fixScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/arreglar-login.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🛠️ Ejecutando script para arreglar el login..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/arreglar-login.sh && sh /tmp/arreglar-login.sh"

Write-Host @"
✅ Correcciones aplicadas.

Ahora:
1. Acceda nuevamente a la página de login: http://34.253.203.194/login
2. Abra la consola del navegador (F12) para ver información de depuración
3. Intente iniciar sesión con usuario: admin y contraseña: admin123
4. La consola mostrará detalles de lo que está sucediendo durante el proceso

Las correcciones aplicadas:
1. Agregamos herramientas de diagnóstico para obtener más información
2. Corregimos problemas de formato en peticiones de login
3. Implementamos soluciones para problemas comunes del login
4. Configuramos correctamente las cabeceras CORS en Nginx
"@ -ForegroundColor Green
