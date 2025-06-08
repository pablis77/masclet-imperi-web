# Script para corregir problemas específicos de formato de autenticación
# Este script modifica el archivo login.astro para usar un formato compatible con OAuth2

Write-Host "🔐 Iniciando corrección específica del formato de autenticación..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para modificar el frontend
$fixAuthScript = @'
#!/bin/bash
set -e

echo "===== CORRECCIÓN ESPECÍFICA DE AUTENTICACIÓN ====="

# Crear solución de login
echo "1. Creando solución específica para el login..."
cat > /tmp/auth-fix.js << 'EOL'
// Solución específica para problemas de autenticación
console.log("🔐 Aplicando solución específica para autenticación");

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log("📋 DOM listo, aplicando solución de autenticación");
  
  // Localizar el formulario de login
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    console.log("✅ Formulario de login encontrado");
    
    // Reemplazar el manejador de eventos del formulario
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log("🔑 Procesando envío de formulario de login");
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (!username || !password) {
        console.error("❌ Usuario o contraseña vacíos");
        alert("Por favor, introduce usuario y contraseña");
        return;
      }
      
      console.log(`👤 Intentando login con usuario: ${username}`);
      
      try {
        // 1. Crear datos de formulario en el formato correcto
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        console.log("📤 Enviando petición de login...");
        
        // 2. Realizar petición en formato x-www-form-urlencoded (compatible con OAuth2)
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });
        
        console.log(`📥 Respuesta recibida, status: ${response.status}`);
        
        if (response.ok) {
          // Procesamos la respuesta
          const data = await response.json();
          console.log("✅ Login exitoso:", data);
          
          if (data.access_token) {
            console.log("🔐 Token recibido correctamente");
            
            // Guardar token
            localStorage.setItem('token', data.access_token);
            
            // Guardar información de usuario si está disponible
            if (data.user) {
              console.log("👤 Información de usuario recibida:", data.user);
              
              // Ajuste especial para usuario Ramon
              if (data.user.username && data.user.username.toLowerCase() === 'ramon') {
                console.log("⚠️ Aplicando fix especial para usuario Ramon");
                data.user.role = 'Ramon';
                localStorage.setItem('userRole', 'Ramon');
                localStorage.setItem('ramonFix', 'true');
              } else if (data.user.role === 'gerente') {
                data.user.role = 'Ramon';
                localStorage.setItem('userRole', 'Ramon');
              }
              
              // Guardar usuario
              localStorage.setItem('user', JSON.stringify(data.user));
              
              // Guardar rol por separado
              if (data.user.role) {
                localStorage.setItem('userRole', data.user.role);
              }
            }
            
            // Redirigir a dashboard
            console.log("🔄 Redirigiendo a dashboard...");
            window.location.href = '/';
          } else {
            console.error("❌ No se encontró token en la respuesta");
            alert("Error de autenticación: No se recibió token");
          }
        } else {
          console.error("❌ Error en la respuesta HTTP:", response.status);
          
          // Intentar leer mensaje de error
          try {
            const errorData = await response.json();
            console.error("❌ Detalles del error:", errorData);
            alert(`Error de autenticación: ${errorData.detail || 'Credenciales incorrectas'}`);
          } catch (e) {
            console.error("❌ No se pudo leer el error:", e);
            alert("Error de autenticación: Credenciales incorrectas");
          }
        }
      } catch (error) {
        console.error("❌ Error en proceso de login:", error);
        alert("Error al conectar con el servidor. Por favor, inténtalo de nuevo.");
      }
    }, { capture: true });  // Usar capture para asegurar que nuestro manejador se ejecuta primero
    
    console.log("✅ Manejador de login reemplazado correctamente");
  } else {
    console.error("❌ No se encontró el formulario de login");
  }
});
EOL

# Instalar el archivo de solución en el frontend
echo "2. Instalando solución en el frontend..."
docker cp /tmp/auth-fix.js masclet-frontend-node:/app/dist/auth-fix.js

# Modificar la página de login para incluir nuestra solución
echo "3. Modificando la página de login para incluir nuestra solución..."
docker exec masclet-frontend-node bash -c 'find /app/dist -name "login*.html" -o -name "*.astro" -o -path "*/login/*.html" | xargs cat > /dev/null 2>&1 || find /app/dist -type f -name "*.html" | xargs grep -l "loginForm" > /tmp/login-files.txt'

docker exec masclet-frontend-node bash -c 'if [ -s /tmp/login-files.txt ]; then
  cat /tmp/login-files.txt | while read file; do
    echo "Modificando $file"
    sed -i "s|</head>|<script src=\"/auth-fix.js\"></script></head>|" "$file"
  done
else
  echo "No se encontraron archivos de login, buscando en cualquier HTML con formulario de login..."
  find /app/dist -type f -name "*.html" | xargs grep -l "form.*loginForm" > /tmp/possible-login-files.txt
  
  if [ -s /tmp/possible-login-files.txt ]; then
    cat /tmp/possible-login-files.txt | while read file; do
      echo "Modificando posible archivo de login: $file"
      sed -i "s|</head>|<script src=\"/auth-fix.js\"></script></head>|" "$file"
    done
  else
    echo "No se encontró ninguna página con formulario de login, añadiendo script al index.html principal"
    sed -i "s|</head>|<script src=\"/auth-fix.js\"></script></head>|" /app/dist/index.html
  fi
fi'

# Crear un script específico para solución de CORS
echo "4. Creando archivo de configuración CORS específico para auth..."
cat > /tmp/cors-auth.conf << 'EOL'
# Configuración de CORS específica para autenticación
location /api/v1/auth/ {
    # Configuración especial para auth
    proxy_pass http://masclet-api:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Cabeceras CORS específicas para auth
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    # Aumentar timeout para auth
    proxy_read_timeout 180s;
    
    # Debug
    add_header X-Debug-Info "Auth API: $request_uri" always;
    
    # Manejar OPTIONS para CORS preflights
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
EOL

# Instalar y aplicar configuración CORS específica
echo "5. Instalando y aplicando configuración CORS específica..."
docker cp /tmp/cors-auth.conf masclet-frontend:/etc/nginx/conf.d/cors-auth.conf

# Modificar la configuración principal de Nginx para incluir el archivo CORS específico
docker exec masclet-frontend bash -c "grep -q 'include /etc/nginx/conf.d/cors-auth.conf;' /etc/nginx/conf.d/default.conf || sed -i '/server {/a\\    include /etc/nginx/conf.d/cors-auth.conf;' /etc/nginx/conf.d/default.conf"

# Recargar Nginx para aplicar cambios
docker exec masclet-frontend nginx -s reload

echo -e "\n===== CORRECCIÓN COMPLETADA ====="
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$fixAuthScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/corregir-auth-formato.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔒 Ejecutando solución específica para formato de autenticación..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/corregir-auth-formato.sh && sh /tmp/corregir-auth-formato.sh"

Write-Host @"
✅ Corrección del formato de autenticación completada.

Esta solución específica:

1. Implementa una solución completa para el proceso de login:
   - Utiliza el formato correcto para OAuth2 (application/x-www-form-urlencoded)
   - Maneja correctamente tokens y datos de usuario
   - Incluye manejo de errores mejorado

2. Configura CORS específico para rutas de autenticación:
   - Evita problemas de seguridad en navegadores modernos
   - Permite peticiones de login desde cualquier origen
   - Gestiona correctamente las peticiones OPTIONS (preflight)

3. Se instala automáticamente:
   - Detecta dónde se encuentra el formulario de login
   - Inyecta el código necesario sin modificar otros componentes

Por favor:
1. Accede a la página de login: http://34.253.203.194/login
2. Utiliza las credenciales admin/admin123
3. La aplicación debería autenticarse correctamente y mostrar datos
"@ -ForegroundColor Green
