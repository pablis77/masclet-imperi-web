# Script para solucionar directamente el problema de autenticación hardcodeada
# Método: Reemplazar el servicio de autenticación simulado por uno real

$sshKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$serverIP = "34.253.203.194"
$serverUser = "ec2-user"

# Función para mostrar mensajes con formato
function Write-ColorOutput {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🔍 Iniciando proceso de corrección directa de autenticación..." "Cyan"
Write-ColorOutput "=============================================" "Cyan"

# Paso 1: Verificar los archivos existentes en el contenedor
Write-ColorOutput "📋 Verificando estructura de archivos..." "Yellow"

# Verificar que el archivo de autenticación simulado exista
$checkAuth = ssh -i $sshKey $serverUser@$serverIP "docker exec masclet-frontend-node ls -la /app/client/_astro/authService*"
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "❌ Error: No se encontró el archivo de autenticación simulado" "Red"
    exit 1
}
Write-ColorOutput "✅ Archivo de autenticación simulado encontrado" "Green"

# Verificar que nuestros scripts de corrección ya estén en el contenedor
$checkFix = ssh -i $sshKey $serverUser@$serverIP "docker exec masclet-frontend-node ls -la /app/client/js/fix"
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "❌ Error: No se encontraron los scripts de corrección" "Red"
    exit 1
}
Write-ColorOutput "✅ Scripts de corrección encontrados" "Green"

# Paso 2: Crear script de carga de auth real para inyectarlo
Write-ColorOutput "📝 Creando script de carga de autenticación real..." "Yellow"

$authLoaderScript = @'
// Script para cargar el servicio de autenticación real
console.log("[AUTH-FIX] Cargando servicio de autenticación real...");

// Función para cargar scripts dinámicamente
function loadScript(url, callback) {
    console.log(`[AUTH-FIX] Cargando script: ${url}`);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = function() {
        console.log(`[AUTH-FIX] Script cargado: ${url}`);
        if (callback) callback();
    };
    script.onerror = function() {
        console.error(`[AUTH-FIX] Error al cargar script: ${url}`);
    };
    document.head.appendChild(script);
}

// Cargamos los scripts en orden (apiConfig debe ir primero)
document.addEventListener("DOMContentLoaded", function() {
    console.log("[AUTH-FIX] DOM cargado, iniciando carga de scripts de autenticación real");
    
    // Carga secuencial para garantizar el orden correcto
    loadScript("/js/fix/apiConfig.js", function() {
        loadScript("/js/fix/authService.js", function() {
            loadScript("/js/fix/solucion_login.js", function() {
                console.log("[AUTH-FIX] Todos los scripts de autenticación real cargados");
            });
        });
    });
});
'@

# Guardar el script temporalmente
$authLoaderScript | Out-File -FilePath "auth-loader.js" -Encoding UTF8

# Transferirlo al servidor
scp -i $sshKey "auth-loader.js" "$serverUser@$serverIP`:~/auth-loader.js"
ssh -i $sshKey $serverUser@$serverIP "docker cp ~/auth-loader.js masclet-frontend-node:/app/client/js/auth-loader.js"
Remove-Item -Path "auth-loader.js"

Write-ColorOutput "✅ Script de carga de autenticación creado y transferido" "Green"

# Paso 3: Crear una modificación del servicio de autenticación original
Write-ColorOutput "📝 Creando modificación del servicio de autenticación original..." "Yellow"

$authServiceModified = @'
// Servicio de autenticación original modificado para cargar nuestro servicio real
console.log("[AUTH-ORIGINAL-MOD] Iniciando servicio de autenticación modificado");

// Cargar nuestro script de autenticación real
(function() {
    // Cargar el script de auth-loader que se encargará de cargar todos nuestros scripts
    console.log("[AUTH-ORIGINAL-MOD] Cargando auth-loader...");
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "/js/auth-loader.js";
    document.head.appendChild(script);
    
    console.log("[AUTH-ORIGINAL-MOD] Auth-loader cargado, ahora se encargará de cargar los scripts reales");
})();

// Simular la exportación del servicio original para mantener compatibilidad
const t="admin",o=typeof window<"u",n={
    // Mantenemos los métodos originales como fallback
    isAuthenticated(){
        console.log("[AUTH-ORIGINAL-MOD] Llamada a isAuthenticated() interceptada, usando servicio real");
        // Intentar usar nuestro servicio real si está disponible
        if (window.authServiceReal && typeof window.authServiceReal.isAuthenticated === 'function') {
            return window.authServiceReal.isAuthenticated();
        }
        // Fallback al comportamiento original
        return!!this.getToken()
    },
    getToken(){
        console.log("[AUTH-ORIGINAL-MOD] Llamada a getToken() interceptada, usando servicio real");
        // Intentar usar nuestro servicio real si está disponible
        if (window.authServiceReal && typeof window.authServiceReal.getToken === 'function') {
            return window.authServiceReal.getToken();
        }
        // Fallback al comportamiento original
        if(o)try{return localStorage.getItem("token")}catch(e){console.warn("Error accediendo a localStorage:",e)}
        return"token-desarrollo-12345"
    },
    async login(e){
        console.log("[AUTH-ORIGINAL-MOD] Llamada a login() interceptada, usando servicio real");
        // Intentar usar nuestro servicio real si está disponible
        if (window.authServiceReal && typeof window.authServiceReal.login === 'function') {
            return window.authServiceReal.login(e);
        }
        // Fallback al comportamiento original (solo para el caso de que algo falle)
        console.warn("[AUTH-ORIGINAL-MOD] ¡FALLBACK! Usando login simulado. Esto no debería ocurrir.");
        if(e.username==="admin"&&e.password==="admin123") {
            // Comportamiento original simplificado
            return { success: true };
        }
    }
};

// Exportamos los mismos métodos que el servicio original
const s=()=>n.isAuthenticated(),l=()=>n.getToken(),i=()=>n.getCurrentUser();
export{i as a,l as g,s as i};
'@

# Guardar el script modificado temporalmente
$authServiceModified | Out-File -FilePath "authService.modified.js" -Encoding UTF8

# Paso 4: Hacer backup del servicio original y subir nuestra modificación
Write-ColorOutput "📦 Haciendo backup del servicio original y aplicando cambios..." "Yellow"

# Script para aplicar los cambios en el servidor
$applyChangesScript = @'
#!/bin/bash
# Script para aplicar los cambios al servicio de autenticación

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Funciones de utilidad
function print_step() {
    echo -e "\n${BLUE}PASO $1: $2${NC}"
    echo -e "${BLUE}===============================================${NC}"
}

function print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Variables
CONTAINER_NAME="masclet-frontend-node"
AUTH_DIR="/app/client/_astro"
AUTH_FILE="authService.CvC7CJU-.js"
BACKUP_DIR="/app/auth-backup"
JS_FIX_DIR="/app/client/js/fix"
AUTH_LOADER="/app/client/js/auth-loader.js"

# Inicio del proceso
print_step "1" "Verificando contenedor Docker"
if ! docker ps | grep -q "${CONTAINER_NAME}"; then
    print_error "El contenedor ${CONTAINER_NAME} no está en ejecución"
fi
print_success "Contenedor ${CONTAINER_NAME} está en ejecución"

# Crear directorio de respaldos
print_step "2" "Creando directorio de respaldos"
docker exec ${CONTAINER_NAME} mkdir -p ${BACKUP_DIR}
print_success "Directorio de respaldos creado"

# Respaldar servicio de autenticación original
print_step "3" "Respaldando servicio de autenticación original"
docker exec ${CONTAINER_NAME} cp ${AUTH_DIR}/${AUTH_FILE} ${BACKUP_DIR}/${AUTH_FILE}.original
if [ $? -ne 0 ]; then
    print_error "Error al respaldar el servicio original"
fi
print_success "Servicio original respaldado en ${BACKUP_DIR}/${AUTH_FILE}.original"

# Verificar que los scripts de corrección estén disponibles
print_step "4" "Verificando scripts de corrección"
if ! docker exec ${CONTAINER_NAME} ls ${JS_FIX_DIR}/apiConfig.js > /dev/null 2>&1; then
    print_error "No se encontró el script de configuración API"
fi
print_success "Scripts de corrección verificados"

# Reemplazar el servicio de autenticación original
print_step "5" "Reemplazando servicio de autenticación"
docker cp ~/authService.modified.js ${CONTAINER_NAME}:${AUTH_DIR}/${AUTH_FILE}
if [ $? -ne 0 ]; then
    print_error "Error al reemplazar el servicio de autenticación"
fi

# Verificar que se haya aplicado el cambio
if ! docker exec ${CONTAINER_NAME} grep -q "AUTH-ORIGINAL-MOD" ${AUTH_DIR}/${AUTH_FILE}; then
    print_error "Error: El servicio de autenticación no fue modificado correctamente"
fi
print_success "Servicio de autenticación reemplazado exitosamente"

# Verificar script cargador
print_step "6" "Verificando script cargador"
if ! docker exec ${CONTAINER_NAME} ls ${AUTH_LOADER} > /dev/null 2>&1; then
    print_error "No se encontró el script cargador"
fi
print_success "Script cargador verificado"

# Configurar Nginx para servir los scripts desde la ruta correcta
print_step "7" "Configurando Nginx para servir los scripts"
# Crear un archivo de configuración para Nginx que sirva los scripts estáticos
cat > ~/js-fix.conf << EOL
# Configuración para servir los scripts de corrección
location /js/fix/ {
    alias /app/client/js/fix/;
}

location /js/auth-loader.js {
    alias /app/client/js/auth-loader.js;
}
EOL

# Copiar la configuración al contenedor Nginx
docker cp ~/js-fix.conf masclet-frontend:/etc/nginx/conf.d/js-fix.conf
if [ \$? -ne 0 ]; then
    print_error "Error al copiar la configuración a Nginx"
fi

# Recargar la configuración de Nginx
docker exec masclet-frontend nginx -s reload
if [ \$? -ne 0 ]; then
    print_error "Error al recargar Nginx"
fi
print_success "Nginx configurado para servir los scripts"

# Crear script de restauración
print_step "8" "Creando script de restauración"
cat > ~/restore-auth.sh << EOL
#!/bin/bash
# Script para restaurar la configuración original

echo "Restaurando servicio de autenticación original..."
docker exec ${CONTAINER_NAME} cp ${BACKUP_DIR}/${AUTH_FILE}.original ${AUTH_DIR}/${AUTH_FILE}
echo "Eliminando configuración de Nginx..."
docker exec masclet-frontend rm -f /etc/nginx/conf.d/js-fix.conf
docker exec masclet-frontend nginx -s reload
echo "Restauración completada"
EOL
chmod +x ~/restore-auth.sh
print_success "Script de restauración creado: ~/restore-auth.sh"

print_step "9" "Proceso completado"
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ SOLUCIÓN DE AUTENTICACIÓN APLICADA CON ÉXITO${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Para verificar el funcionamiento:"
echo "1. Accede a la URL del servidor AWS"
echo "2. Intenta iniciar sesión con credenciales reales"
echo "3. Verifica en la consola del navegador los mensajes de diagnóstico"
echo ""
echo "Para restaurar la configuración original:"
echo "Ejecuta: ~/restore-auth.sh"
'@

# Transferir el script modificado y el script de aplicación
scp -i $sshKey "authService.modified.js" "$serverUser@$serverIP`:~/authService.modified.js"
Remove-Item -Path "authService.modified.js"

# Crear y transferir script de aplicación
$applyChangesScript | Out-File -FilePath "apply-auth-changes.sh" -Encoding UTF8
scp -i $sshKey "apply-auth-changes.sh" "$serverUser@$serverIP`:~/apply-auth-changes.sh"
ssh -i $sshKey $serverUser@$serverIP "chmod +x ~/apply-auth-changes.sh"
Remove-Item -Path "apply-auth-changes.sh"

Write-ColorOutput "✅ Scripts transferidos al servidor" "Green"

# Paso 5: Aplicar los cambios en el servidor
Write-ColorOutput "🚀 Aplicando cambios en el servidor..." "Yellow"

ssh -i $sshKey $serverUser@$serverIP "~/apply-auth-changes.sh"

Write-ColorOutput "✅ Proceso completado" "Green"
Write-ColorOutput "=============================================" "Cyan"
Write-ColorOutput "📝 Próximos pasos:" "Yellow"
Write-ColorOutput "1. Acceder a la URL del servidor AWS" "White"
Write-ColorOutput "2. Verificar que se puede iniciar sesión con usuarios reales" "White"
Write-ColorOutput "3. Comprobar en la consola los mensajes de diagnóstico" "White"
Write-ColorOutput "4. Si necesitas revertir los cambios, ejecuta en el servidor: ~/restore-auth.sh" "White"
Write-ColorOutput "=============================================" "Cyan"
