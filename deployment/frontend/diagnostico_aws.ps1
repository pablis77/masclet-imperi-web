# Script de diagnóstico y corrección para el despliegue en AWS
# Este script se centra en verificar y corregir la comunicación entre contenedores

# Configuración
$SSH_KEY = "~\.ssh\masclet-web.pem"
$SSH_USER = "ec2-user"
$SSH_HOST = "108.129.139.119"
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
    
    try {
        Invoke-Expression $fullCommand
        return $true
    } catch {
        Write-ColorText "Error ejecutando comando: $_" "Red"
        return $false
    }
}

# Verificar si tenemos acceso SSH
Write-ColorText "Comprobando acceso SSH a la instancia AWS..." "Yellow"
if (-not (Test-Path $SSH_KEY)) {
    Write-ColorText "❌ No se encuentra la clave SSH: $SSH_KEY" "Red"
    Write-ColorText "Intentaremos diagnóstico remoto sin SSH" "Yellow"
    $SSH_AVAILABLE = $false
} else {
    $SSH_AVAILABLE = Execute-SSH "echo 'Conexión SSH establecida'"
}

if ($SSH_AVAILABLE) {
    # DIAGNÓSTICO COMPLETO VÍA SSH
    Write-ColorText "`n==== DIAGNÓSTICO COMPLETO VÍA SSH ====" "Green"
    
    # 1. Verificar estado de la red Docker
    Write-ColorText "`n1. Verificando red Docker..." "Magenta"
    Execute-SSH "docker network ls | grep masclet"
    Execute-SSH "docker network inspect masclet-network"
    
    # 2. Verificar estado de los contenedores
    Write-ColorText "`n2. Verificando contenedores..." "Magenta"
    Execute-SSH "docker ps -a"
    
    # 3. Verificar logs de los contenedores
    Write-ColorText "`n3. Verificando logs de Nginx..." "Magenta"
    Execute-SSH "docker logs masclet-frontend --tail 20"
    
    Write-ColorText "`n4. Verificando logs de Node.js..." "Magenta"
    Execute-SSH "docker logs masclet-frontend-node --tail 20"
    
    # 5. Verificar DNS entre contenedores
    Write-ColorText "`n5. Verificando resolución DNS entre contenedores..." "Magenta"
    Execute-SSH "docker exec masclet-frontend ping -c 2 masclet-frontend-node || echo 'Error de resolución DNS'"
    Execute-SSH "docker exec masclet-frontend ping -c 2 masclet-api || echo 'Error de resolución DNS'"
    
    # 6. Verificar configuración de Nginx
    Write-ColorText "`n6. Verificando configuración de Nginx..." "Magenta"
    Execute-SSH "docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf"
    Execute-SSH "docker exec masclet-frontend nginx -t"
    
    # 7. Crear script de corrección
    Write-ColorText "`n7. Preparando script de corrección..." "Magenta"
    
    $fixScript = @'
#!/bin/bash

echo "==== SCRIPT DE CORRECCIÓN DE RED DOCKER ===="

# 1. Verificar si la red existe
NETWORK_EXISTS=$(docker network ls | grep masclet-network)
if [ -z "$NETWORK_EXISTS" ]; then
    echo "Creando red masclet-network..."
    docker network create masclet-network
else
    echo "Red masclet-network ya existe"
fi

# 2. Verificar si los contenedores están en la red correcta
echo "Reconectando contenedores a la red..."
docker network disconnect masclet-network masclet-frontend 2>/dev/null
docker network disconnect masclet-network masclet-frontend-node 2>/dev/null
docker network disconnect masclet-network masclet-api 2>/dev/null

docker network connect masclet-network masclet-frontend 2>/dev/null
docker network connect masclet-network masclet-frontend-node 2>/dev/null
docker network connect masclet-network masclet-api 2>/dev/null

# 3. Reiniciar contenedores para asegurar reconexión
echo "Reiniciando contenedores..."
docker restart masclet-frontend masclet-frontend-node

# 4. Verificar estado final
echo "Estado final de la red:"
docker network inspect masclet-network

echo "Estado final de los contenedores:"
docker ps -a | grep masclet

echo "==== CORRECCIÓN COMPLETADA ===="
'@
    
    $fixScript | Out-File -FilePath ".\deployment\frontend\fix-docker-network.sh" -Encoding utf8
    
    # Transferir y ejecutar script de corrección
    Write-ColorText "`n8. Transfiriendo script de corrección..." "Magenta"
    $scpFixCommand = "scp -i $SSH_KEY .\deployment\frontend\fix-docker-network.sh $SSH_USER@$SSH_HOST`:$REMOTE_DIR/"
    Invoke-Expression $scpFixCommand
    
    Execute-SSH "chmod +x $REMOTE_DIR/fix-docker-network.sh"
    Execute-SSH "$REMOTE_DIR/fix-docker-network.sh"
    
    # 9. Verificar estado después de la corrección
    Write-ColorText "`n9. Verificando estado después de la corrección..." "Magenta"
    Execute-SSH "docker logs masclet-frontend --tail 10"
    Execute-SSH "curl -s http://localhost/api/v1/health || echo 'Error accediendo a la API a través del frontend'"
    
} else {
    # DIAGNÓSTICO LIMITADO SIN SSH
    Write-ColorText "`n==== DIAGNÓSTICO LIMITADO (SIN SSH) ====" "Yellow"
    
    # Verificar acceso HTTP a la aplicación
    Write-ColorText "`n1. Verificando acceso HTTP a la aplicación..." "Magenta"
    try {
        $response = Invoke-WebRequest -Uri "http://$SSH_HOST" -TimeoutSec 10 -ErrorAction Stop
        Write-ColorText "✅ Frontend accesible! Código: $($response.StatusCode)" "Green"
    } catch {
        Write-ColorText "❌ No se puede acceder al frontend: $_" "Red"
    }
    
    # Verificar acceso directo a la API
    Write-ColorText "`n2. Verificando acceso directo a la API..." "Magenta"
    try {
        $response = Invoke-WebRequest -Uri "http://$SSH_HOST:8000/api/v1/health" -TimeoutSec 10 -ErrorAction Stop
        Write-ColorText "✅ API accesible directamente! Código: $($response.StatusCode)" "Green"
        Write-ColorText "Respuesta: $($response.Content)" "Gray"
    } catch {
        Write-ColorText "❌ No se puede acceder directamente a la API: $_" "Red"
    }
    
    # Verificar acceso a la API a través del frontend
    Write-ColorText "`n3. Verificando acceso a la API a través del frontend..." "Magenta"
    try {
        $response = Invoke-WebRequest -Uri "http://$SSH_HOST/api/v1/health" -TimeoutSec 10 -ErrorAction Stop
        Write-ColorText "✅ API accesible a través del frontend! Código: $($response.StatusCode)" "Green"
        Write-ColorText "Respuesta: $($response.Content)" "Gray"
    } catch {
        Write-ColorText "❌ No se puede acceder a la API a través del frontend: $_" "Red"
    }
}

# RECOMENDACIONES FINALES
Write-ColorText "`n==== RECOMENDACIONES ====" "Cyan"

if ($SSH_AVAILABLE) {
    Write-ColorText "1. Si persiste el problema, modifica el archivo de configuración de Nginx:" "Yellow"
    Write-ColorText "   ssh -i $SSH_KEY $SSH_USER@$SSH_HOST 'nano $REMOTE_DIR/nginx-linux.conf'" "Gray"
    Write-ColorText "2. Después de modificar la configuración, actualiza el contenedor:" "Yellow"
    Write-ColorText "   ssh -i $SSH_KEY $SSH_USER@$SSH_HOST 'docker restart masclet-frontend'" "Gray"
} else {
    Write-ColorText "1. Para diagnósticos más detallados, necesitarás configurar acceso SSH" "Yellow"
    Write-ColorText "2. Verifica la configuración del grupo de seguridad en AWS EC2:" "Yellow"
    Write-ColorText "   - Puerto 80 abierto para HTTP" "Gray"
    Write-ColorText "   - Puerto 22 abierto para SSH" "Gray"
    Write-ColorText "   - Puerto 8000 abierto para API directa" "Gray"
}

Write-ColorText "`nPara una prueba completa desde el navegador, abre:" "Green"
Write-ColorText "http://$SSH_HOST" "Cyan"
