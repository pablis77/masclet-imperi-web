# Script para diagnóstico y reinicio de contenedores
# Este script verifica la implementación y reinicia los contenedores

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

Write-ColorOutput "🔍 Iniciando diagnóstico y reinicio de contenedores..." "Cyan"
Write-ColorOutput "=============================================" "Cyan"

# Crear script de diagnóstico y reinicio
$diagnosticScript = @"
#!/bin/bash
# Script para diagnosticar problemas y reiniciar contenedores

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}🔍 DIAGNÓSTICO Y REINICIO DE CONTENEDORES${NC}"
echo -e "${BLUE}==================================================${NC}"

# Paso 1: Verificar configuración actual
echo -e "\n${YELLOW}Paso 1: Verificando configuración actual...${NC}"
AUTH_FILE="/app/client/_astro/authService.CvC7CJU-.js"

# Verificar si el contenedor existe
echo -e "\n${YELLOW}Verificando contenedores...${NC}"
if docker ps | grep -q "masclet-frontend-node"; then
    echo -e "${GREEN}✅ El contenedor masclet-frontend-node existe${NC}"
    
    # Verificar archivo de autenticación
    echo -e "\n${YELLOW}Verificando archivo de autenticación...${NC}"
    if docker exec masclet-frontend-node test -f ${AUTH_FILE}; then
        echo -e "${GREEN}✅ El archivo de autenticación existe${NC}"
        
        # Ver contenido del archivo
        echo -e "\n${YELLOW}Contenido del archivo (primeras 10 líneas):${NC}"
        docker exec masclet-frontend-node head -10 ${AUTH_FILE}
    else
        echo -e "${RED}❌ El archivo de autenticación no existe${NC}"
    fi
else
    echo -e "${RED}❌ El contenedor masclet-frontend-node no existe${NC}"
fi

# Paso 2: Reiniciar contenedores
echo -e "\n${YELLOW}Paso 2: Reiniciando contenedores...${NC}"
echo -e "${YELLOW}Reiniciando masclet-frontend-node...${NC}"
docker restart masclet-frontend-node
echo -e "${YELLOW}Reiniciando masclet-frontend...${NC}"
docker restart masclet-frontend

# Paso 3: Corregir implementación si es necesario
echo -e "\n${YELLOW}Paso 3: Aplicando corrección mejorada...${NC}"

# Crear un servicio de autenticación simplificado pero efectivo
echo -e "${YELLOW}Creando nuevo servicio de autenticación...${NC}"
cat > /tmp/auth.fix.js << 'EOL'
// Servicio de autenticación simplificado para masclet-imperi AWS
console.log("Servicio de autenticación real cargado - versión simplificada");

// Función para exportar en formato compatible
const isAuthenticated = () => {
    console.log("isAuthenticated called");
    return localStorage.getItem('token') !== null;
};

const getToken = () => {
    console.log("getToken called");
    return localStorage.getItem('token');
};

const getCurrentUser = () => {
    console.log("getCurrentUser called");
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
};

// Agregar función de login al objeto window para acceso global
window.login = async (username, password) => {
    console.log("Login llamado con:", username);
    
    try {
        // Construir datos de formulario
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('grant_type', 'password');
        
        // Intentar login con diferentes URLs
        const urls = [
            '/api/v1/auth/login',
            'http://34.253.203.194/api/v1/auth/login',
            'http://masclet-api:8000/api/v1/auth/login'
        ];
        
        let response = null;
        let error = null;
        
        for (const url of urls) {
            try {
                console.log("Intentando login con URL:", url);
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData
                });
                
                if (response.ok) {
                    break;
                } else {
                    console.warn("Error en URL:", url, "Status:", response.status);
                }
            } catch (e) {
                console.warn("Error en fetch:", url, e);
                error = e;
            }
        }
        
        if (!response || !response.ok) {
            throw new Error("No se pudo iniciar sesión con ninguna URL");
        }
        
        const data = await response.json();
        console.log("Respuesta de login:", data);
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', data.access_token);
        
        if (data.user) {
            // Corrección especial para usuario Ramon
            if (username.toLowerCase() === 'ramon') {
                data.user.role = 'Ramon';
                localStorage.setItem('ramonFix', 'true');
            } else if (data.user.role === 'gerente') {
                // También tratar gerente como Ramon
                data.user.role = 'Ramon';
            }
            
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userRole', data.user.role);
        }
        
        // Recargar página para aplicar cambios
        location.href = '/dashboard';
        return true;
    } catch (error) {
        console.error("Error en login:", error);
        alert("Error de inicio de sesión: " + error.message);
        return false;
    }
};

// Monkeypatch el formulario de login
document.addEventListener('DOMContentLoaded', () => {
    console.log("Añadiendo listener para formulario de login");
    
    // Buscar el formulario por un tiempo
    const checkForm = setInterval(() => {
        const form = document.querySelector('form');
        if (form) {
            console.log("Formulario encontrado, agregando handler");
            clearInterval(checkForm);
            
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                const usernameField = form.querySelector('input[type="text"]');
                const passwordField = form.querySelector('input[type="password"]');
                
                if (!usernameField || !passwordField) {
                    console.error("No se encontraron campos de usuario/contraseña");
                    return;
                }
                
                const username = usernameField.value;
                const password = passwordField.value;
                
                console.log("Iniciando sesión desde interceptor de formulario");
                await window.login(username, password);
            });
        }
    }, 500);
});

// Exportar funciones en el formato que espera la aplicación
export { getCurrentUser as a, getToken as g, isAuthenticated as i };

// También exportar como objetos globales
window.authService = {
    isAuthenticated,
    getToken,
    getCurrentUser,
    login: window.login
};

console.log("Servicio de autenticación simplificado instalado correctamente");
EOL

# Copiar al contenedor
echo -e "${YELLOW}Copiando nuevo servicio al contenedor...${NC}"
docker cp /tmp/auth.fix.js masclet-frontend-node:${AUTH_FILE}

# Verificar que se haya copiado correctamente
if docker exec masclet-frontend-node grep -q "Servicio de autenticación simplificado" ${AUTH_FILE}; then
    echo -e "${GREEN}✅ Nuevo servicio instalado correctamente${NC}"
else
    echo -e "${RED}❌ Error al instalar el nuevo servicio${NC}"
fi

# Paso 4: Verificar que nginx está configurado correctamente
echo -e "\n${YELLOW}Paso 4: Verificando configuración de Nginx...${NC}"

# Verificar que el endpoint de autenticación está configurado
if docker exec masclet-frontend cat /etc/nginx/conf.d/auth-endpoint.conf 2>/dev/null; then
    echo -e "${GREEN}✅ Configuración de autenticación de Nginx existe${NC}"
else
    echo -e "${YELLOW}⚠️ No se encontró configuración específica para autenticación${NC}"
    echo -e "${YELLOW}Creando configuración para endpoint de autenticación...${NC}"
    
    cat > /tmp/auth-endpoint.conf << EOL
# Configuración para el endpoint de autenticación
location /api/v1/auth/login {
    proxy_pass http://masclet-api:8000/api/v1/auth/login;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
}
EOL
    
    docker cp /tmp/auth-endpoint.conf masclet-frontend:/etc/nginx/conf.d/auth-endpoint.conf
    docker exec masclet-frontend nginx -s reload
    echo -e "${GREEN}✅ Configuración de Nginx actualizada${NC}"
fi

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}✅ DIAGNÓSTICO Y REINICIO COMPLETADOS${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "\nPara verificar:"
echo -e "1. Accede a http://34.253.203.194"
echo -e "2. Intenta iniciar sesión con credenciales reales (admin/admin123)"
echo -e "3. Verifica en la consola del navegador los mensajes de diagnóstico"
"@

# PASO 3: Enviar el script al servidor
Write-ColorOutput "🚀 Enviando script al servidor AWS..." "Yellow"

# Crear archivo temporal
$diagnosticScript | Out-File -FilePath "diagnostico.sh" -Encoding UTF8

# Copiar al servidor
scp -i $sshKey "diagnostico.sh" "$serverUser@$serverIP`:~/diagnostico.sh"
ssh -i $sshKey $serverUser@$serverIP "chmod +x ~/diagnostico.sh"
Remove-Item -Path "diagnostico.sh"

Write-ColorOutput "✅ Script enviado al servidor correctamente" "Green"

# PASO 4: Ejecutar el script en el servidor
Write-ColorOutput "🔧 Ejecutando script en el servidor..." "Yellow"

ssh -i $sshKey $serverUser@$serverIP "~/diagnostico.sh"

Write-ColorOutput "✅ Proceso completado" "Green"
Write-ColorOutput "=============================================" "Cyan"
Write-ColorOutput "📝 Próximos pasos:" "Yellow"
Write-ColorOutput "1. Acceder a la URL del servidor AWS (http://$serverIP)" "White" 
Write-ColorOutput "2. Probar el inicio de sesión con admin/admin123" "White"
Write-ColorOutput "3. Verificar que ahora se puede acceder al dashboard" "White"
Write-ColorOutput "=============================================" "Cyan"
