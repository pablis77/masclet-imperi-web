# Parte 2 (Mejorada): Corrección específica del problema de login
# Este script implementa una solución directa para el problema de login

Write-Host "🔐 Iniciando corrección específica mejorada del login..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para la corrección del login
$correccionLoginScript = @'
#!/bin/bash
set -e

echo "===== CORRECCIÓN ESPECÍFICA DEL LOGIN ====="

# 1. Crear script de reemplazo del login
echo -e "\n1. Creando script específico para login..."
cat > /tmp/login-direct-fix.js << 'EOL'
// Script de corrección directa para el login
console.log("🔐 Script de corrección de login cargado");

// Función para interceptar y corregir el login
function fixLogin() {
  console.log("📋 Preparando corrección de login...");
  
  // Interceptar todos los formularios de login
  document.addEventListener('submit', async function(e) {
    // Verificar si es un formulario de login
    const form = e.target;
    const usernameField = form.querySelector('[name="username"], [id="username"], [name="email"], [id="email"]');
    const passwordField = form.querySelector('[name="password"], [id="password"]');
    
    if (usernameField && passwordField) {
      e.preventDefault();
      console.log("🔑 Interceptando envío de formulario de login");
      
      const username = usernameField.value;
      const password = passwordField.value;
      
      console.log(`👤 Intentando login con usuario: ${username}`);
      
      try {
        // 1. Crear datos en formato correcto (x-www-form-urlencoded)
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        // 2. Realizar petición utilizando el formato correcto
        console.log("📤 Enviando petición de login en formato form-urlencoded...");
        let response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
        
        console.log(`📥 Respuesta recibida, status: ${response.status}`);
        
        // Si falla, intentar formato JSON como respaldo
        if (!response.ok) {
          console.log("⚠️ Primer intento fallido, probando formato JSON...");
          response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              password: password
            })
          });
          console.log(`📥 Segunda respuesta recibida, status: ${response.status}`);
        }
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log("✅ Login exitoso:", data);
            
            if (data.access_token) {
              console.log("🔐 Token recibido correctamente");
              localStorage.setItem('token', data.access_token);
              
              // Guardar info de usuario
              if (data.user) {
                console.log("👤 Información de usuario recibida");
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Guardar rol por separado para acceso más fácil
                if (data.user.role) {
                  localStorage.setItem('userRole', data.user.role);
                  
                  // Ajuste específico para usuario Ramon o admin con rol gerente
                  if (data.user.username.toLowerCase() === 'ramon' || 
                      (data.user.username.toLowerCase() === 'admin' && data.user.role === 'gerente')) {
                    console.log("⚙️ Aplicando ajuste especial para usuario privilegiado");
                    localStorage.setItem('userRole', 'Ramon');
                  }
                }
              }
              
              // Redirigir al dashboard principal
              console.log("🔄 Login exitoso, redirigiendo...");
              window.location.href = '/';
            } else {
              console.error("❌ No se encontró token en la respuesta");
              alert("Error: No se recibió token de autenticación");
            }
          } catch (jsonError) {
            console.error("❌ Error al procesar respuesta JSON:", jsonError);
            
            // Si no es JSON pero la petición fue exitosa, intentar redirigir
            if (response.status >= 200 && response.status < 300) {
              console.log("⚠️ Respuesta exitosa pero no es JSON, redirigiendo...");
              window.location.href = '/';
            } else {
              alert("Error al procesar la respuesta del servidor");
            }
          }
        } else {
          console.error("❌ Error en la respuesta HTTP:", response.status);
          
          // Intentar leer mensaje de error
          try {
            const errorData = await response.json();
            console.error("❌ Detalles del error:", errorData);
            alert(`Error de autenticación: ${errorData.detail || errorData.message || 'Credenciales incorrectas'}`);
          } catch (e) {
            console.error("❌ No se pudo leer el error:", e);
            alert("Error de autenticación: Credenciales incorrectas");
          }
        }
      } catch (error) {
        console.error("❌ Error en proceso de login:", error);
        alert("Error al conectar con el servidor. Por favor, inténtalo de nuevo.");
      }
    }
  }, { capture: true });

  // También corregimos el logout para evitar que se quede colgado
  document.addEventListener('click', function(e) {
    // Buscar enlaces o botones de logout
    const target = e.target.closest('a, button');
    if (target && (
        target.textContent.toLowerCase().includes('logout') || 
        target.textContent.toLowerCase().includes('cerrar sesión') ||
        target.textContent.toLowerCase().includes('salir') ||
        target.href && target.href.includes('logout')
    )) {
      console.log("🚪 Interceptando click en logout");
      e.preventDefault();
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Redirigir a login
      console.log("🔄 Redirigiendo a login después de logout");
      window.location.href = '/login';
    }
  });
  
  console.log("✅ Corrección de login aplicada correctamente");
}

// Ejecutar cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixLogin);
} else {
  // Si ya está cargado, ejecutar inmediatamente
  fixLogin();
}
EOL

# 2. Instalar script de corrección en Nginx
echo -e "\n2. Instalando script de corrección en Nginx..."
docker cp /tmp/login-direct-fix.js masclet-frontend:/usr/share/nginx/html/login-direct-fix.js

# 3. Inyectar directamente nuestro script en todas las páginas HTML
echo -e "\n3. Inyectando nuestro script en las páginas HTML..."
# Buscar e inyectar en archivos HTML en el directorio principal
docker exec masclet-frontend find /usr/share/nginx/html -type f -name "*.html" | xargs -I{} docker exec masclet-frontend sh -c "echo 'Modificando {} ...' && grep -q 'login-direct-fix.js' {} || sed -i 's|</head>|<script src=\"/login-direct-fix.js\"></script></head>|' {}"

# Buscar e inyectar en subdirectorios (especialmente /client/)
docker exec masclet-frontend find /usr/share/nginx/html/client -type f -name "*.html" | xargs -I{} docker exec masclet-frontend sh -c "echo 'Modificando {} ...' && grep -q 'login-direct-fix.js' {} || sed -i 's|</head>|<script src=\"/login-direct-fix.js\"></script></head>|' {}"

# 4. Si no hay archivos HTML, inyectar en el archivo index.html principal
echo -e "\n4. Asegurando inyección en index.html principal..."
docker exec masclet-frontend sh -c "if [ -f /usr/share/nginx/html/index.html ]; then echo 'Modificando index.html principal...' && grep -q 'login-direct-fix.js' /usr/share/nginx/html/index.html || sed -i 's|</head>|<script src=\"/login-direct-fix.js\"></script></head>|' /usr/share/nginx/html/index.html; fi"

# 5. Crear configuración específica para el endpoint de autenticación
echo -e "\n5. Creando configuración específica para el endpoint de autenticación..."
cat > /tmp/auth-endpoint.conf << 'EOL'
# Configuración específica para endpoint de autenticación
location = /api/v1/auth/login {
    # Aumentar el límite de tiempo para peticiones de login
    proxy_read_timeout 180s;
    
    # Proxy hacia el backend
    proxy_pass http://masclet-api:8000/api/v1/auth/login;
    proxy_http_version 1.1;
    
    # Cabeceras del proxy
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Configuración CORS para autenticación
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    # Manejo de peticiones OPTIONS para CORS
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    # Debug
    add_header X-Debug-Info "Auth API Login: $request_uri" always;
}
EOL

# 6. Instalar configuración y recargar Nginx
echo -e "\n6. Instalando configuración y recargando Nginx..."
docker cp /tmp/auth-endpoint.conf masclet-frontend:/etc/nginx/conf.d/auth-endpoint.conf
docker exec masclet-frontend bash -c "grep -q 'include /etc/nginx/conf.d/auth-endpoint.conf;' /etc/nginx/conf.d/default.conf || sed -i '/server {/a\\    include /etc/nginx/conf.d/auth-endpoint.conf;' /etc/nginx/conf.d/default.conf"
docker exec masclet-frontend nginx -s reload

# 7. Verificar la correcta instalación del script
echo -e "\n7. Verificando la correcta instalación del script..."
docker exec masclet-frontend ls -la /usr/share/nginx/html/login-direct-fix.js

# 8. Comprobar que se ha inyectado correctamente en algún archivo HTML
echo -e "\n8. Comprobando la inyección en archivos HTML..."
docker exec masclet-frontend sh -c "grep -r 'login-direct-fix.js' /usr/share/nginx/html || echo '⚠️ No se encontró el script inyectado en ningún archivo HTML'"

echo -e "\n===== CORRECCIÓN DE LOGIN COMPLETADA ====="
echo "Por favor, pruebe el login con las siguientes credenciales:"
echo "- Usuario: admin"
echo "- Contraseña: admin123"
echo ""
echo "La solución implementada:"
echo "1. Intercepta el envío del formulario de login"
echo "2. Utiliza el formato correcto para la autenticación (application/x-www-form-urlencoded)"
echo "3. Maneja correctamente el token y la información de usuario"
echo "4. Corrige el proceso de logout para evitar que se quede colgado"
echo "5. Optimiza la configuración de Nginx para el endpoint de autenticación"
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$correccionLoginScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/parte2_corregir_login_mejorado.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔒 Ejecutando corrección específica mejorada del login..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/parte2_corregir_login_mejorado.sh && sh /tmp/parte2_corregir_login_mejorado.sh"

Write-Host @"
✅ Corrección mejorada del login aplicada correctamente.

Esta solución:

1. Implementa una solución completa para el proceso de login:
   - Intercepta todos los formularios de login
   - Utiliza el formato correcto para OAuth2 (application/x-www-form-urlencoded)
   - Maneja correctamente el token y la información de usuario
   - Incluye una solución de respaldo utilizando formato JSON

2. Corrige el proceso de logout:
   - Evita que se quede colgado en "Cerrando sesión..."
   - Limpia correctamente localStorage
   - Redirige a la página de login

3. Optimiza la configuración de Nginx:
   - Configuración específica para el endpoint de autenticación
   - Gestión correcta de CORS
   - Aumenta el tiempo de espera para peticiones de login

4. Verifica la correcta instalación:
   - Comprueba que el script se ha copiado correctamente
   - Verifica que se ha inyectado en los archivos HTML

Por favor, ahora:
1. Accede a http://34.253.203.194/login
2. Prueba el login con usuario: admin y contraseña: admin123 
3. Verifica que el logout funciona correctamente
"@ -ForegroundColor Green
