# Fase 2: Análisis JavaScript del comportamiento del login
# Este script analiza el comportamiento JavaScript del formulario de login
# para identificar cómo se maneja la autenticación

Write-Host "🔍 Fase 2: Analizando comportamiento JavaScript del login..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para analizar el comportamiento JavaScript
$diagnosticoJs = @'
#!/bin/bash
set -e

echo "===== ANÁLISIS JAVASCRIPT DEL LOGIN ====="

# 1. Encontrar todos los archivos JavaScript relevantes
echo -e "\n1. Buscando archivos JavaScript relevantes..."
FRONTEND_PATH="/usr/share/nginx/html"
echo "Archivos JS en el directorio principal:"
find $FRONTEND_PATH -maxdepth 1 -name "*.js" | xargs ls -la

echo -e "\nArchivos JS en subdirectorios de _astro:"
find $FRONTEND_PATH/_astro -name "*.js" | xargs ls -la

# 2. Extraer script principal de Astro mencionado en la página de login
echo -e "\n2. Extrayendo el script principal de Astro..."
if [ -f "$FRONTEND_PATH/_astro/hoisted.C9TktLA-.js" ]; then
    echo "Contenido del script principal (primeras 50 líneas):"
    head -50 "$FRONTEND_PATH/_astro/hoisted.C9TktLA-.js"
else
    echo "Buscando script hoisted de Astro:"
    find $FRONTEND_PATH/_astro -name "hoisted*.js" | xargs ls -la
    HOISTED_FILE=$(find $FRONTEND_PATH/_astro -name "hoisted*.js" | head -1)
    if [ ! -z "$HOISTED_FILE" ]; then
        echo "Encontrado: $HOISTED_FILE"
        echo "Contenido (primeras 50 líneas):"
        head -50 "$HOISTED_FILE"
    fi
fi

# 3. Buscar código relacionado con login en los archivos JS
echo -e "\n3. Buscando código relacionado con login en archivos JS..."
echo "Patrones de autenticación en archivos JS:"
find $FRONTEND_PATH -name "*.js" -exec grep -l "login\|auth\|fetch\|axios\|/api/v1\|token" {} \; | head -10

# 4. Extraer fragmentos de código relacionados con auth de esos archivos
echo -e "\n4. Extrayendo fragmentos de código relacionados con autenticación..."
for file in $(find $FRONTEND_PATH -name "*.js" -exec grep -l "login\|auth\|fetch\|axios\|/api/v1\|token" {} \; | head -5); do
    echo -e "\nEn archivo: $file"
    grep -A10 -B2 "login\|auth\|fetch\|axios\|/api/v1\|token" "$file" | head -20
done

# 5. Crear un script de inyección para monitorizar el proceso de login
echo -e "\n5. Creando script de monitorización de login..."
cat > /tmp/login-monitor.js << 'EOL'
// Script de monitorización del proceso de login
console.log("🔍 Monitor de login cargado y activo");

// Monitorizar envíos de formularios
document.addEventListener('DOMContentLoaded', () => {
    console.log("🔎 Monitor de login: DOM cargado, buscando formulario de login");
    
    // Buscar formulario de login
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        console.log("✅ Formulario de login encontrado", loginForm);
        
        loginForm.addEventListener('submit', function(e) {
            console.log("🔐 Intentando enviar formulario de login", {
                target: e.target,
                username: document.getElementById('username')?.value,
                hasPassword: !!document.getElementById('password')?.value
            });
            
            // No prevenimos el envío para observar el comportamiento normal
        });
    } else {
        console.log("❌ No se encontró formulario con id 'loginForm'");
        
        // Buscar otros posibles formularios
        const allForms = document.querySelectorAll('form');
        console.log(`🔍 Se encontraron ${allForms.length} formularios en la página:`, allForms);
    }
});

// Monitorizar peticiones fetch/XHR
const originalFetch = window.fetch;
window.fetch = async function() {
    console.log("🌐 Petición fetch detectada", {
        url: arguments[0],
        options: arguments[1]
    });
    
    try {
        const response = await originalFetch.apply(this, arguments);
        
        // Clonar la respuesta para poder leerla y luego devolver una nueva respuesta con el mismo contenido
        const clone = response.clone();
        
        // Procesar la respuesta de forma asíncrona
        clone.text().then(text => {
            try {
                const data = JSON.parse(text);
                console.log("📥 Respuesta fetch:", {
                    url: arguments[0],
                    status: response.status,
                    data: data
                });
            } catch (e) {
                console.log("📥 Respuesta fetch (texto):", {
                    url: arguments[0],
                    status: response.status,
                    text: text.substring(0, 150) + (text.length > 150 ? "..." : "")
                });
            }
        }).catch(err => {
            console.log("❌ Error al procesar respuesta:", err);
        });
        
        return response;
    } catch (error) {
        console.log("❌ Error en fetch:", error);
        throw error;
    }
};

// Monitorizar XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function() {
    this._url = arguments[1];
    this._method = arguments[0];
    console.log("🌐 XHR abierto", {
        method: this._method,
        url: this._url
    });
    return originalXHROpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    
    const originalOnReadyStateChange = xhr.onreadystatechange;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log("📥 Respuesta XHR:", {
                url: xhr._url,
                status: xhr.status,
                response: xhr.responseText.substring(0, 150) + (xhr.responseText.length > 150 ? "..." : "")
            });
        }
        
        if (originalOnReadyStateChange) {
            originalOnReadyStateChange.apply(this, arguments);
        }
    };
    
    console.log("🌐 XHR enviado", {
        method: xhr._method,
        url: xhr._url,
        data: arguments[0]
    });
    
    return originalXHRSend.apply(this, arguments);
};

// Monitorear cambios en localStorage (para tokens)
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function() {
    console.log("🔑 localStorage.setItem", {
        key: arguments[0],
        value: arguments[1].substring(0, 50) + (arguments[1].length > 50 ? "..." : "")
    });
    originalSetItem.apply(this, arguments);
};

console.log("✅ Monitor de login completamente instalado");
EOL

# 6. Inyectar el script de monitorización en la página de login
echo -e "\n6. Inyectando script de monitorización en la página de login..."
cp /tmp/login-monitor.js $FRONTEND_PATH/login-monitor.js
cat > /tmp/inject-monitor.sh << 'EOL'
#!/bin/sh
find /usr/share/nginx/html -name "*.html" | while read file; do
  echo "Inyectando monitor en $file"
  grep -q "login-monitor.js" "$file" || sed -i 's|</head>|<script src="/login-monitor.js"></script></head>|' "$file"
done
EOL
chmod +x /tmp/inject-monitor.sh
sh /tmp/inject-monitor.sh

# 7. Resumen
echo -e "\n===== ANÁLISIS JAVASCRIPT COMPLETADO ====="
echo "Se ha instalado un script de monitorización que permitirá ver en la consola del navegador:"
echo "1. Cuándo se envía el formulario de login"
echo "2. Qué peticiones fetch/XHR se realizan durante el proceso"
echo "3. Las respuestas recibidas de la API"
echo "4. Las operaciones de almacenamiento en localStorage"
echo -e "\nPara probar, acceda a http://34.253.203.194/login y abra la consola del navegador (F12)"
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$diagnosticoJs | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/fase2_analisis_js.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔎 Ejecutando análisis JavaScript..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/fase2_analisis_js.sh && sh /tmp/fase2_analisis_js.sh"

Write-Host @"
✅ Análisis JavaScript completado.

Este diagnóstico:
1. Identifica los scripts JavaScript relacionados con el login
2. Analiza el código de autenticación presente
3. Ha inyectado un monitor avanzado de login que permitirá:
   - Ver exactamente qué sucede cuando se intenta hacer login
   - Monitorizar las peticiones fetch/XHR
   - Observar las respuestas recibidas
   - Detectar errores en el proceso

Por favor, para probar:
1. Acceda a http://34.253.203.194/login
2. Abra la consola del navegador (F12)
3. Intente hacer login
4. Observe los mensajes de diagnóstico en la consola

Esta información nos ayudará a identificar exactamente dónde está fallando el proceso.
"@ -ForegroundColor Green
