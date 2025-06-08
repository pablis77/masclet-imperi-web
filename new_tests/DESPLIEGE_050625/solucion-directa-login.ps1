# Script para solucionar directamente el problema de login
# Este script realiza modificaciones específicas en el frontend para arreglar el login

Write-Host "🔐 Aplicando solución directa para el problema de login..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script de solución para el problema de login
$fixLoginScript = @'
#!/bin/bash
set -e

echo "===== SOLUCIÓN DIRECTA PARA PROBLEMA DE LOGIN ====="

echo -e "\n1. Analizando archivos de login en Nginx..."
docker exec masclet-frontend find /usr/share/nginx/html -name "login*" -o -name "*auth*" | grep -v "node_modules"

echo -e "\n2. Creando archivo de solución específica para login..."
cat > /tmp/login-fix.js << 'EOL'
// Script para arreglar problemas de login
console.log("🔐 Script de arreglo de login inyectado");

// Función principal que se ejecutará cuando se detecte un intento de login
function fixLogin() {
  console.log("🔍 Interceptando intentos de login");
  
  // Buscar formularios de login
  document.querySelectorAll('form').forEach(form => {
    console.log(`📝 Encontrado formulario: ${form.id || 'sin ID'}`);
    
    // Si parece un formulario de login (tiene campos username/password)
    const hasUsername = form.querySelector('[name="username"], [id="username"], [name="email"], [id="email"]');
    const hasPassword = form.querySelector('[name="password"], [id="password"]');
    
    if (hasUsername && hasPassword) {
      console.log("✅ Detectado formulario de login, aplicando fix");
      
      // Reemplazar el manejador de eventos
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("🔑 Interceptando envío de formulario de login");
        
        // Obtener los valores
        const usernameField = form.querySelector('[name="username"], [id="username"], [name="email"], [id="email"]');
        const passwordField = form.querySelector('[name="password"], [id="password"]');
        
        const username = usernameField.value;
        const password = passwordField.value;
        
        console.log(`👤 Intentando login con usuario: ${username}`);
        
        try {
          // 1. Crear datos en el formato correcto
          const formData = new URLSearchParams();
          formData.append('username', username);
          formData.append('password', password);
          
          // 2. Realizar petición con el formato adecuado
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
          });
          
          console.log(`📥 Respuesta recibida, status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Login exitoso:", data);
            
            if (data.access_token) {
              console.log("🔐 Token recibido correctamente");
              
              // Guardar token
              localStorage.setItem('token', data.access_token);
              
              // Guardar info de usuario si está disponible
              if (data.user) {
                console.log("👤 Información de usuario recibida");
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.role) {
                  localStorage.setItem('userRole', data.user.role);
                }
                
                // Fix especial para usuario Ramon
                if (data.user.username && data.user.username.toLowerCase() === 'ramon') {
                  console.log("⚠️ Aplicando fix especial para usuario Ramon");
                  data.user.role = 'Ramon';
                  localStorage.setItem('userRole', 'Ramon');
                  localStorage.setItem('ramonFix', 'true');
                }
              }
              
              // Redirigir al dashboard
              window.location.href = '/';
            } else {
              console.error("❌ No se encontró token en la respuesta");
              alert("Error de autenticación: No se recibió token");
            }
          } else {
            console.error("❌ Error en la respuesta HTTP:", response.status);
            alert("Error de autenticación: Credenciales incorrectas");
          }
        } catch (error) {
          console.error("❌ Error en proceso de login:", error);
          alert("Error al conectar con el servidor");
        }
      }, { capture: true });
    }
  });
}

// Ejecutar la función cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixLogin);
} else {
  fixLogin();
}

// También ejecutar cuando cambie la URL (para SPAs)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(fixLogin, 500);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

console.log("✅ Script de arreglo de login instalado correctamente");
EOL

echo -e "\n3. Instalando la solución en Nginx..."
docker cp /tmp/login-fix.js masclet-frontend:/usr/share/nginx/html/login-fix.js

echo -e "\n4. Creando script de inyección para insertar nuestro fix en todas las páginas HTML..."
cat > /tmp/inject-login-fix.sh << 'EOL'
#!/bin/bash
find /usr/share/nginx/html -name "*.html" | while read file; do
  echo "Modificando $file..."
  grep -q 'login-fix.js' "$file" || sed -i 's|</head>|<script src="/login-fix.js"></script></head>|' "$file"
done

# Si no hay archivos HTML en la raíz, buscar en subdirectorios
if [ ! -f /usr/share/nginx/html/index.html ]; then
  find /usr/share/nginx/html -type f -name "index.html" | while read file; do
    echo "Modificando $file..."
    grep -q 'login-fix.js' "$file" || sed -i 's|</head>|<script src="/login-fix.js"></script></head>|' "$file"
  done
fi
EOL

echo -e "\n5. Ejecutando script de inyección en Nginx..."
docker cp /tmp/inject-login-fix.sh masclet-frontend:/tmp/inject-login-fix.sh
docker exec masclet-frontend chmod +x /tmp/inject-login-fix.sh
docker exec masclet-frontend /tmp/inject-login-fix.sh

echo -e "\n6. Configurando CORS específicamente para /api/v1/auth/login..."
cat > /tmp/auth-location.conf << 'EOL'
# Configuración específica para autenticación
location /api/v1/auth/login {
    proxy_pass http://masclet-api:8000/api/v1/auth/login;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    # Manejar preflight request
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

echo -e "\n7. Instalando configuración CORS..."
docker cp /tmp/auth-location.conf masclet-frontend:/etc/nginx/conf.d/auth-location.conf
docker exec masclet-frontend bash -c "grep -q 'include /etc/nginx/conf.d/auth-location.conf;' /etc/nginx/conf.d/default.conf || sed -i '/server {/a\\    include /etc/nginx/conf.d/auth-location.conf;' /etc/nginx/conf.d/default.conf"
docker exec masclet-frontend nginx -s reload

echo -e "\n8. Reiniciando masclet-frontend-node para asegurar que los cambios surtan efecto..."
docker restart masclet-frontend-node

echo -e "\n===== SOLUCIÓN APLICADA EXITOSAMENTE ====="
echo "- Se ha inyectado un script de corrección de login en todas las páginas"
echo "- Se ha optimizado la ruta de autenticación en Nginx"
echo "- Se ha reiniciado el servicio Node.js para garantizar consistencia"
echo -e "\nPor favor, acceda a http://34.253.203.194/ y realice un nuevo intento de login"
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$fixLoginScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/solucion-directa-login.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔒 Ejecutando solución directa para el problema de login..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/solucion-directa-login.sh && sh /tmp/solucion-directa-login.sh"

Write-Host @"
✅ Solución directa para el problema de login aplicada exitosamente.

Esta solución:

1. Inyecta un script de arreglo de login en todas las páginas HTML
   - Intercepta los formularios de login
   - Usa el formato correcto para la autenticación (application/x-www-form-urlencoded)
   - Maneja correctamente el token y la información de usuario

2. Configura una ruta específica en Nginx para el endpoint de login
   - Configura correctamente CORS para evitar problemas de seguridad
   - Optimiza el proxy hacia el backend

3. Reinicia los servicios necesarios
   - Asegura que todos los cambios se apliquen correctamente

Por favor:
1. Accede a http://34.253.203.194/
2. Intenta iniciar sesión con admin/admin123
3. La aplicación debería autenticarse correctamente y mostrar los datos

Si continúas viendo problemas, por favor envía una captura de la consola del navegador (F12)
para analizar más detalles sobre lo que está sucediendo.
"@ -ForegroundColor Green
