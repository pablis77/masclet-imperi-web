# Script simplificado para solucionar el problema de autenticación en AWS
# Este script reemplaza directamente el servicio de autenticación simulado por uno real

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

Write-ColorOutput "🚀 Iniciando corrección de autenticación en AWS..." "Cyan"
Write-ColorOutput "=============================================" "Cyan"

# PASO 1: Crear script de autenticación real completo
Write-ColorOutput "📝 Creando servicio de autenticación real..." "Yellow"

$authServiceJs = @'
// Servicio de autenticación real para reemplazar al simulado
console.log("Servicio de autenticación REAL cargado");

// Configuración de API
const API_CONFIG = {
    // Intentamos varias opciones de endpoint para mayor robustez
    ENDPOINTS: [
        "http://34.253.203.194/api/v1",
        "/api/v1",
        "http://masclet-api:8000/api/v1"
    ]
};

// Servicio de autenticación real
const authServiceReal = {
    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    },

    /**
     * Obtiene el token del localStorage
     */
    getToken() {
        try {
            return localStorage.getItem('token');
        } catch (error) {
            console.error('Error accediendo al token:', error);
            return null;
        }
    },

    /**
     * Verifica si el token ha expirado
     */
    isTokenExpired(token) {
        try {
            if (!token) return true;
            // Los tokens JWT tienen 3 partes separadas por puntos
            const parts = token.split('.');
            if (parts.length !== 3) return true;
            
            // Decodificamos la parte de payload
            const payload = JSON.parse(atob(parts[1]));
            const exp = payload.exp * 1000; // Convertir a milisegundos
            return Date.now() >= exp;
        } catch (error) {
            console.error('Error verificando expiración del token:', error);
            return true;
        }
    },

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    },

    /**
     * Obtiene el rol del usuario
     */
    getUserRole() {
        try {
            return localStorage.getItem('userRole');
        } catch (error) {
            console.error('Error obteniendo rol de usuario:', error);
            return null;
        }
    },

    /**
     * Realiza el proceso de login
     */
    async login(credentials) {
        console.log('Iniciando login con credenciales reales');
        if (!credentials.username || !credentials.password) {
            throw new Error('Usuario y contraseña son obligatorios');
        }

        // Construir datos de formulario
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('grant_type', 'password');

        // Configuración de cabeceras
        const config = { 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };

        // Intentar los endpoints en secuencia
        let lastError = null;
        for (const endpoint of API_CONFIG.ENDPOINTS) {
            try {
                const loginUrl = `${endpoint}/auth/login`;
                console.log(`Intentando login con URL: ${loginUrl}`);
                
                const response = await fetch(loginUrl, {
                    method: 'POST',
                    headers: config.headers,
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                console.log('Login exitoso', data);

                // Guardar token y datos de usuario
                localStorage.setItem('token', data.access_token);
                
                // Manejar datos de usuario
                if (data.user) {
                    // Corrección especial para usuario Ramon o rol gerente
                    if (credentials.username.toLowerCase() === 'ramon') {
                        data.user.role = 'Ramon';
                        localStorage.setItem('ramonFix', 'true');
                    } else if (data.user.role === 'gerente') {
                        data.user.role = 'Ramon';
                    }
                    
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.user.role) {
                        localStorage.setItem('userRole', data.user.role);
                        if (data.user.role === 'Ramon') {
                            localStorage.setItem('ramonFix', 'true');
                        }
                    }
                }
                
                return data;
            } catch (error) {
                console.warn(`Error con endpoint ${endpoint}:`, error.message);
                lastError = error;
                // Continuar con el siguiente endpoint
            }
        }

        // Si llegamos aquí, todos los endpoints fallaron
        console.error('Todos los endpoints de login fallaron');
        throw lastError || new Error('No se pudo conectar con el servidor');
    },

    /**
     * Cierra la sesión del usuario
     */
    logout() {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('ramonFix');
            console.log('Sesión cerrada correctamente');
            return true;
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return false;
        }
    }
};

// Reemplazar el servicio original con nuestro servicio real
console.log('Instalando el servicio de autenticación real...');
window.authServiceReal = authServiceReal;

// Reemplazar las funciones exportadas
const isAuthenticated = () => window.authServiceReal.isAuthenticated();
const getToken = () => window.authServiceReal.getToken();
const getCurrentUser = () => window.authServiceReal.getCurrentUser();

// Exportar las mismas funciones que el servicio original para mantener compatibilidad
export { getCurrentUser as a, getToken as g, isAuthenticated as i };

// Monkeypatch global para permitir login directo desde cualquier parte
window.performLogin = async (username, password) => {
    try {
        await window.authServiceReal.login({ username, password });
        return true;
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error de login: ' + error.message);
        return false;
    }
};

console.log('Servicio de autenticación real instalado y listo');
'@

# PASO 2: Crear script para enviar y aplicar la solución
Write-ColorOutput "💼 Creando script de implementación..." "Yellow"

$deployScript = @"
#!/bin/bash
# Script para aplicar la solución de autenticación en AWS

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}🔐 SCRIPT DE CORRECCIÓN DE AUTENTICACIÓN AWS${NC}"
echo -e "${BLUE}==================================================${NC}"

# Paso 1: Verificar contenedor
echo -e "\n${YELLOW}Paso 1: Verificando contenedores...${NC}"
if ! docker ps | grep -q "masclet-frontend-node"; then
    echo -e "${RED}❌ El contenedor masclet-frontend-node no está en ejecución${NC}"
    exit 1
fi
echo -e "${GREEN}✅ El contenedor masclet-frontend-node está en ejecución${NC}"

# Paso 2: Crear respaldo
echo -e "\n${YELLOW}Paso 2: Creando respaldo del archivo original...${NC}"
AUTH_FILE="/app/client/_astro/authService.CvC7CJU-.js"
BACKUP_DIR="/app/auth-backup"
docker exec masclet-frontend-node mkdir -p ${BACKUP_DIR}
docker exec masclet-frontend-node cp ${AUTH_FILE} ${BACKUP_DIR}/authService.original.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al crear respaldo${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Respaldo creado en ${BACKUP_DIR}/authService.original.js${NC}"

# Paso 3: Reemplazar el servicio de autenticación
echo -e "\n${YELLOW}Paso 3: Reemplazando el servicio de autenticación...${NC}"
cat > /tmp/authService.new.js << 'EOL'
$authServiceJs
EOL

# Copiar al contenedor
docker cp /tmp/authService.new.js masclet-frontend-node:${AUTH_FILE}
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al reemplazar el servicio de autenticación${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Servicio de autenticación reemplazado con éxito${NC}"

# Paso 4: Crear script de restauración
echo -e "\n${YELLOW}Paso 4: Creando script de restauración...${NC}"
cat > ~/restore-auth.sh << EOL
#!/bin/bash
echo "Restaurando servicio de autenticación original..."
docker exec masclet-frontend-node cp ${BACKUP_DIR}/authService.original.js ${AUTH_FILE}
echo "Restauración completada"
EOL
chmod +x ~/restore-auth.sh
echo -e "${GREEN}✅ Script de restauración creado: ~/restore-auth.sh${NC}"

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}✅ CORRECCIÓN DE AUTENTICACIÓN COMPLETADA${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "\nPara verificar:"
echo -e "1. Accede a http://$serverIP"
echo -e "2. Intenta iniciar sesión con credenciales reales"
echo -e "\nPara restaurar:"
echo -e "Ejecuta: ~/restore-auth.sh"
"@

# PASO 3: Enviar el script al servidor
Write-ColorOutput "🚀 Enviando script al servidor AWS..." "Yellow"

# Crear los archivos temporales
$deployScript | Out-File -FilePath "deploy-auth-fix.sh" -Encoding UTF8

# Copiar al servidor
scp -i $sshKey "deploy-auth-fix.sh" "$serverUser@$serverIP`:~/deploy-auth-fix.sh"
ssh -i $sshKey $serverUser@$serverIP "chmod +x ~/deploy-auth-fix.sh"
Remove-Item -Path "deploy-auth-fix.sh"

Write-ColorOutput "✅ Script enviado al servidor correctamente" "Green"

# PASO 4: Ejecutar el script en el servidor
Write-ColorOutput "🔧 Ejecutando script en el servidor..." "Yellow"

ssh -i $sshKey $serverUser@$serverIP "~/deploy-auth-fix.sh"

Write-ColorOutput "✅ Proceso completado" "Green"
Write-ColorOutput "=============================================" "Cyan"
Write-ColorOutput "📝 Próximos pasos:" "Yellow"
Write-ColorOutput "1. Acceder a la URL del servidor AWS (http://$serverIP)" "White"
Write-ColorOutput "2. Verificar que se puede iniciar sesión con usuarios reales" "White"
Write-ColorOutput "3. Si necesitas restaurar la configuración original, ejecuta en el servidor: ~/restore-auth.sh" "White"
Write-ColorOutput "=============================================" "Cyan"
