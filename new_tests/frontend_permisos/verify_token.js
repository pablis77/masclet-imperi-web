/**
 * Script para verificar el token JWT y extraer información
 * de roles y permisos.
 */

// Esta función se ejecuta inmediatamente
(function() {
    console.log('🔍 VERIFICADOR DE TOKEN JWT Y ROLES');
    console.log('==================================');
    
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ No se encontró token JWT en localStorage');
        return;
    }
    
    console.log('✅ Token encontrado en localStorage');
    console.log('📝 Token (primeros 25 caracteres):', token.substring(0, 25) + '...');
    
    try {
        // Separar el token en sus tres partes
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.error('❌ El token no tiene el formato JWT esperado (header.payload.signature)');
            return;
        }
        
        // Decodificar la parte payload (segunda parte)
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('📋 Contenido del token:');
        console.log(payload);
        
        // Verificar específicamente el rol
        if (payload.role) {
            console.log('👤 Rol en el token:', payload.role, `(tipo: ${typeof payload.role})`);
            
            // Si el rol es una cadena que incluye "UserRole."
            if (typeof payload.role === 'string' && payload.role.includes('UserRole.')) {
                const rolePart = payload.role.split('.')[1];
                console.log('⚙️ Rol normalizado debería ser:', rolePart === 'ADMIN' ? 'administrador' : 
                                                             rolePart === 'GERENTE' ? 'Ramon' : 
                                                             rolePart === 'EDITOR' ? 'editor' : 'usuario');
            }
        } else {
            console.error('❌ El token no contiene información de rol');
        }
        
        // Verificar información del usuario
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            console.log('👤 Información de usuario en localStorage:');
            console.log(userData);
            
            if (userData.role) {
                console.log('🛡️ Rol del usuario en localStorage:', userData.role);
            } else {
                console.error('❌ La información del usuario no contiene rol');
            }
        } else {
            console.error('❌ No se encontró información de usuario en localStorage');
        }
        
    } catch (error) {
        console.error('❌ Error al decodificar el token:', error);
    }
    
    // Verificar la función getCurrentRole si está disponible
    if (window.roleService && window.roleService.getCurrentRole) {
        try {
            const currentRole = window.roleService.getCurrentRole();
            console.log('🛡️ Resultado de getCurrentRole():', currentRole);
        } catch (error) {
            console.error('❌ Error al ejecutar getCurrentRole():', error);
        }
    } else {
        console.log('ℹ️ La función roleService.getCurrentRole() no está disponible en el ámbito global');
    }
    
    console.log('==================================');
})();
