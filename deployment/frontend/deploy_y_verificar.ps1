# Script de despliegue con verificación automática
# Este script despliega el frontend y luego verifica que esté funcionando correctamente

# Configuración
$SSH_KEY = "~\.ssh\masclet-web.pem"
$SSH_USER = "ec2-user"
$SSH_HOST = "108.129.139.119"
$DIST_DIR = ".\frontend\dist"
$REMOTE_DIR = "/home/ec2-user/frontend"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

function Execute-SSH {
    param(
        [string]$Command,
        [string]$Description = ""
    )
    
    if ($Description) {
        Write-ColorText $Description "Cyan"
    }
    
    $fullCommand = "ssh -i $SSH_KEY $SSH_USER@$SSH_HOST '$Command'"
    Write-ColorText "Ejecutando: $fullCommand" "Gray"
    
    Invoke-Expression $fullCommand
}

# Comprobar que los archivos de frontend existen
if (-not (Test-Path $DIST_DIR)) {
    Write-ColorText "❌ ERROR: El directorio de distribución no existe: $DIST_DIR" "Red"
    Write-ColorText "Primero debes construir el frontend con 'npm run build'" "Yellow"
    exit 1
}

# 1. Crear una copia de nginx-linux.conf con las variables correctamente escapadas
Write-ColorText "🔧 Preparando configuración de Nginx con variables escapadas..." "Cyan"

$nginxConfig = Get-Content ".\deployment\frontend\nginx-linux.conf" -Raw
$configCorregido = $nginxConfig -replace '(\$[a-zA-Z_]+)', '"$1"'
$configCorregido | Out-File ".\deployment\frontend\nginx-linux-fixed.conf" -Encoding utf8

# Mostrar los cambios para verificación
Write-ColorText "Cambios en la configuración de Nginx:" "Yellow"
$diff = Compare-Object (Get-Content ".\deployment\frontend\nginx-linux.conf") (Get-Content ".\deployment\frontend\nginx-linux-fixed.conf")
$diff | ForEach-Object {
    if ($_.SideIndicator -eq "=>") {
        Write-ColorText "+ $($_.InputObject)" "Green"
    } else {
        Write-ColorText "- $($_.InputObject)" "Red"
    }
}

# 2. Crear script de corrección de URLs en el servidor
Write-ColorText "🔧 Preparando script de corrección de URLs..." "Cyan"

$fixScript = @'
const fs = require('fs');
const path = require('path');

// Patrones a buscar y reemplazar
const patterns = [
  { search: /http[s]?:\/\/108\.129\.139\.119(:\d+)?\/api\/v1/g, replace: '/api/v1' },
  { search: /\/api\/api\/v1/g, replace: '/api/v1' },
  { search: /\/api\/v1\/api\/v1/g, replace: '/api/v1' }
];

// Función para procesar un archivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    let replaced = false;
    patterns.forEach(pattern => {
      if (pattern.search.test(newContent)) {
        newContent = newContent.replace(pattern.search, pattern.replace);
        replaced = true;
        console.log(`✅ Reemplazado en: ${filePath}`);
      }
    });
    
    if (replaced) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  } catch (err) {
    console.error(`❌ Error procesando ${filePath}:`, err);
  }
}

// Función para recorrer directorios recursivamente
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.mjs'))) {
      processFile(filePath);
    }
  });
}

// Directorio a procesar (asumiendo que el script se ejecuta desde el directorio que contiene dist)
const distDir = path.join(process.cwd(), 'dist');
console.log(`🔍 Procesando archivos en: ${distDir}`);

walkDir(distDir);
console.log('✅ Procesamiento completado.');
'@

$fixScript | Out-File ".\deployment\frontend\fix-api-urls.cjs" -Encoding utf8

# 3. Crear script de verificación post-despliegue
Write-ColorText "🔍 Preparando script de verificación post-despliegue..." "Cyan"

$verifyScript = @'
#!/bin/bash

echo "==== VERIFICACIÓN DE DESPLIEGUE ===="
echo "Comprobando servicios Docker..."

# 1. Verificar que los contenedores están corriendo
echo -e "\n1. Estado de contenedores Docker:"
docker ps

# 2. Verificar logs de Nginx
echo -e "\n2. Últimas 10 líneas de logs de Nginx:"
docker logs masclet-frontend --tail 10

# 3. Verificar logs de Node.js
echo -e "\n3. Últimas 10 líneas de logs de Node.js:"
docker logs masclet-frontend-node --tail 10

# 4. Verificar que Nginx puede resolver los nombres de host
echo -e "\n4. Prueba de resolución DNS desde contenedor Nginx:"
docker exec masclet-frontend ping -c 2 masclet-frontend-node
docker exec masclet-frontend ping -c 2 masclet-api

# 5. Verificar sintaxis de la configuración de Nginx
echo -e "\n5. Verificación de sintaxis de Nginx:"
docker exec masclet-frontend nginx -t

# 6. Verificar que las rutas de la API funcionan
echo -e "\n6. Prueba de conexión a la API:"
curl -s http://localhost:8000/api/v1/health

echo -e "\n==== VERIFICACIÓN COMPLETADA ===="
'@

$verifyScript | Out-File ".\deployment\frontend\verify-deployment.sh" -Encoding utf8

# 4. Transferir archivos al servidor
Write-ColorText "📤 Transfiriendo archivos al servidor..." "Green"

# Verificar conexión SSH
try {
    Execute-SSH "echo 'Conexión SSH establecida correctamente'" "Verificando conexión SSH..."
} catch {
    Write-ColorText "❌ ERROR: No se pudo conectar al servidor mediante SSH. Revisa la clave y el host." "Red"
    exit 1
}

# Crear directorio remoto si no existe
Execute-SSH "mkdir -p $REMOTE_DIR/dist" "Creando directorios remotos..."

# Transferir archivos de frontend
Write-ColorText "Transfiriendo archivos del frontend (puede tardar unos minutos)..." "Yellow"
$scpCommand = "scp -i $SSH_KEY -r $DIST_DIR/* $SSH_USER@$SSH_HOST`:$REMOTE_DIR/dist/"
Invoke-Expression $scpCommand

# Transferir configuración de Nginx y scripts
Write-ColorText "Transfiriendo configuración y scripts..." "Yellow"
$scpConfigCommand = "scp -i $SSH_KEY .\deployment\frontend\nginx-linux-fixed.conf $SSH_USER@$SSH_HOST`:$REMOTE_DIR/nginx-linux.conf"
Invoke-Expression $scpConfigCommand

$scpFixScriptCommand = "scp -i $SSH_KEY .\deployment\frontend\fix-api-urls.cjs $SSH_USER@$SSH_HOST`:$REMOTE_DIR/"
Invoke-Expression $scpFixScriptCommand

$scpVerifyScriptCommand = "scp -i $SSH_KEY .\deployment\frontend\verify-deployment.sh $SSH_USER@$SSH_HOST`:$REMOTE_DIR/"
Invoke-Expression $scpVerifyScriptCommand

# 5. Ejecutar comandos en el servidor
Write-ColorText "🚀 Ejecutando scripts en el servidor..." "Green"

# Corregir URLs en archivos JS
Execute-SSH "cd $REMOTE_DIR && node fix-api-urls.cjs" "Corrigiendo URLs en archivos JS..."

# Dar permisos de ejecución al script de verificación
Execute-SSH "chmod +x $REMOTE_DIR/verify-deployment.sh" "Configurando permisos de scripts..."

# Parar y eliminar contenedores existentes
Execute-SSH "docker rm -f masclet-frontend masclet-frontend-node" "Limpiando contenedores existentes..."

# Iniciar contenedor Node.js
Execute-SSH @"
docker run -d --name masclet-frontend-node \
  -v $REMOTE_DIR/dist:/app \
  -e PORT=10000 \
  -e BACKEND_URL=http://masclet-api:8000 \
  -e API_PREFIX="" \
  -e NODE_ENV=production \
  --network masclet-network \
  node:18-alpine sh -c "cd /app && npx serve -s -l 10000"
"@ "Iniciando contenedor Node.js..."

# Iniciar contenedor Nginx
Execute-SSH @"
docker run -d --name masclet-frontend \
  -p 80:80 \
  -v $REMOTE_DIR/nginx-linux.conf:/etc/nginx/conf.d/default.conf \
  -v $REMOTE_DIR/dist:/usr/share/nginx/html \
  --network masclet-network \
  nginx:alpine
"@ "Iniciando contenedor Nginx..."

# 6. Verificar el despliegue
Write-ColorText "🔍 Verificando el despliegue..." "Cyan"
Execute-SSH "$REMOTE_DIR/verify-deployment.sh" "Ejecutando verificación completa..."

# 7. Mostrar información de acceso
Write-ColorText "`n✅ DESPLIEGUE COMPLETADO!" "Green"
Write-ColorText "El frontend debería estar disponible en: http://$SSH_HOST" "Cyan"
Write-ColorText "Si encuentras problemas, ejecuta la verificación manualmente:" "Yellow"
Write-ColorText "ssh -i $SSH_KEY $SSH_USER@$SSH_HOST '$REMOTE_DIR/verify-deployment.sh'" "Gray"

# Opcionalmente, abrir el sitio en el navegador
$openSite = Read-Host "¿Quieres abrir el sitio en el navegador? (s/n)"
if ($openSite -eq "s") {
    Start-Process "http://$SSH_HOST"
}
