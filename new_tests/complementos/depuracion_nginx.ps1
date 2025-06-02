# Script para depurar específicamente el problema de Nginx en AWS
# Esta prueba es altamente específica y controlada

$TEST_DIR = ".\new_tests\complementos\depuracion_nginx"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Limpieza previa si existe el directorio
if (Test-Path $TEST_DIR) {
    Write-ColorText "Limpiando prueba anterior..." "Yellow"
    Remove-Item -Recurse -Force $TEST_DIR
}

# Crear estructura de directorios para la prueba
Write-ColorText "Creando directorio para depuración..." "Cyan"
New-Item -ItemType Directory -Path $TEST_DIR | Out-Null

# Primero limpiamos cualquier contenedor anterior
Write-ColorText "Limpiando contenedores previos..." "Yellow"
docker rm -f nginx-test-comillas nginx-test-sin-comillas 2>$null

# Crear dos versiones diferentes de la configuración para comparar
Write-ColorText "Creando versiones de prueba de configuración de Nginx..." "Cyan"

# 1. Versión con variables con comillas
@'
server {
    listen 80;
    
    # Configuración mínima para prueba
    location / {
        # Usamos un host inexistente para aislar el error de sintaxis
        proxy_pass http://host-inexistente:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade "$http_upgrade";
        proxy_set_header Connection "upgrade";
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
    }
}
'@ | Out-File -FilePath "$TEST_DIR\nginx_comillas.conf" -Encoding utf8

# 2. Versión sin comillas (exactamente como en AWS)
@'
server {
    listen 80;
    
    # Configuración mínima para prueba
    location / {
        # Usamos un host inexistente para aislar el error de sintaxis
        proxy_pass http://host-inexistente:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
'@ | Out-File -FilePath "$TEST_DIR\nginx_sin_comillas.conf" -Encoding utf8

# Función para probar una configuración específica
function Test-NginxConfig {
    param(
        [string]$ConfigPath,
        [string]$ContainerName,
        [string]$Description
    )
    
    Write-ColorText "`nProbando configuración: $Description" "Magenta"
    
    # Crear contenedor con la configuración
    docker run --name $ContainerName -v "${TEST_DIR}\${ConfigPath}:/etc/nginx/conf.d/default.conf" -d nginx:alpine
    
    # Esperar un momento para que el contenedor inicie
    Start-Sleep -Seconds 2
    
    # Verificar si el contenedor está corriendo
    $status = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
    
    if ($status -match "Up") {
        Write-ColorText "✅ Contenedor iniciado correctamente" "Green"
        
        # Verificar logs
        Write-ColorText "📋 Logs del contenedor:" "Cyan"
        docker logs $ContainerName
        
        # Verificar sintaxis de Nginx
        Write-ColorText "🔍 Verificando sintaxis de Nginx:" "Cyan"
        docker exec $ContainerName nginx -t 2>&1
        
        return $true
    }
    else {
        Write-ColorText "❌ Contenedor falló al iniciar" "Red"
        
        # Mostrar logs para ver el error
        Write-ColorText "📋 Logs de error:" "Red"
        docker logs $ContainerName
        
        return $false
    }
}

# Ejecutar pruebas
Write-ColorText "`n==== PRUEBA 1: CONFIGURACIÓN CON COMILLAS ====" "Green"
$test1 = Test-NginxConfig -ConfigPath "nginx_comillas.conf" -ContainerName "nginx-test-comillas" -Description "Variables con comillas"

Write-ColorText "`n==== PRUEBA 2: CONFIGURACIÓN SIN COMILLAS (COMO EN AWS) ====" "Green"
$test2 = Test-NginxConfig -ConfigPath "nginx_sin_comillas.conf" -ContainerName "nginx-test-sin-comillas" -Description "Variables sin comillas"

# Mostrar resultados comparativos
Write-ColorText "`n==== RESULTADOS DE LA DEPURACIÓN ====" "Yellow"
Write-ColorText "Configuración con comillas: $(if ($test1) { '✅ FUNCIONA' } else { '❌ FALLA' })" "Cyan"
Write-ColorText "Configuración sin comillas: $(if ($test2) { '✅ FUNCIONA' } else { '❌ FALLA' })" "Cyan"

if ($test1 -eq $test2) {
    if ($test1) {
        Write-ColorText "`n🧪 RESULTADO: Ambas configuraciones funcionan. Las comillas no afectan el funcionamiento." "Green"
        Write-ColorText "El problema en AWS debe ser otro, posiblemente relacionado con la resolución de nombres de host." "Green"
    }
    else {
        Write-ColorText "`n🧪 RESULTADO: Ambas configuraciones fallan, pero NO por la sintaxis de variables." "Yellow"
        Write-ColorText "El problema es probablemente el host inexistente usado en la configuración." "Yellow"
    }
}
else {
    if ($test1) {
        Write-ColorText "`n🧪 RESULTADO: CONFIRMADO - Se requieren comillas en las variables." "Green"
        Write-ColorText "La configuración sin comillas falla, esto explica el problema en AWS." "Green"
    }
    else {
        Write-ColorText "`n🧪 RESULTADO: Resultado inesperado - La configuración con comillas falla pero sin comillas funciona." "Red"
        Write-ColorText "Esto es contrario a nuestra hipótesis inicial." "Red"
    }
}

# Instrucciones para limpiar
Write-ColorText "`n🧹 Para limpiar la prueba:" "Yellow"
Write-ColorText "docker rm -f nginx-test-comillas nginx-test-sin-comillas" "Gray"
Write-ColorText "Remove-Item -Recurse -Force $TEST_DIR" "Gray"
