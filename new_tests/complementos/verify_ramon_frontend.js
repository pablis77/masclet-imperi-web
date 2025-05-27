/**
 * Script para verificar consistencia del usuario Ramon en el frontend
 * Ejecutar desde la consola del navegador en la aplicación
 */

function verificarConsistenciaRamon() {
    console.log('====== VERIFICACIÓN DE CONSISTENCIA DE RAMON ======');
    
    // 1. Verificar localStorage
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    const userJSON = localStorage.getItem('user');
    
    console.log('--- VALORES EN LOCALSTORAGE ---');
    console.log('token existe:', !!token);
    console.log('username:', username);
    console.log('userRole:', userRole);
    
    // 2. Verificar objeto de usuario en localStorage
    let user = null;
    try {
        if (userJSON) {
            user = JSON.parse(userJSON);
            console.log('--- USUARIO EN LOCALSTORAGE ---');
            console.log('ID:', user.id);
            console.log('username:', user.username);
            console.log('email:', user.email);
            console.log('role:', user.role);
            console.log('full_name:', user.full_name);
        } else {
            console.log('No hay usuario en localStorage');
        }
    } catch (e) {
        console.error('Error al procesar usuario de localStorage:', e);
    }
    
    // 3. Analizar token JWT
    if (token) {
        try {
            // Función simple para decodificar JWT sin librerías externas
            function parseJwt(token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64).split('').map(c => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join('')
                );
                return JSON.parse(jsonPayload);
            }
            
            const decoded = parseJwt(token);
            console.log('--- TOKEN JWT DECODIFICADO ---');
            console.log('sub:', decoded.sub);
            console.log('role:', decoded.role);
            console.log('exp:', new Date(decoded.exp * 1000).toISOString());
        } catch (e) {
            console.error('Error al decodificar token:', e);
        }
    }
    
    // 4. Sugerir correcciones
    console.log('--- ANÁLISIS ---');
    if (username && username.toLowerCase() === 'ramon' && username !== 'Ramon') {
        console.log('⚠️ PROBLEMA: username en localStorage está como "' + username + '" pero debe ser "Ramon"');
        console.log('Solución: localStorage.setItem("username", "Ramon");');
    }
    
    if (user && user.username && user.username.toLowerCase() === 'ramon' && user.username !== 'Ramon') {
        console.log('⚠️ PROBLEMA: username en el objeto user está como "' + user.username + '" pero debe ser "Ramon"');
        console.log('Corrección manual:');
        console.log('1. user.username = "Ramon";');
        console.log('2. localStorage.setItem("user", JSON.stringify(user));');
    }
    
    console.log('============================================');
    console.log('RECOMENDACIONES:');
    console.log('1. Asegurar que en TODO el código se use "Ramon" (con R mayúscula)');
    console.log('2. Evitar el uso de toLowerCase() para comparaciones de nombres de usuario');
    console.log('3. Actualizar la interfaz para reflejar consistentemente "Ramon"');
}

// Ejecutar función
verificarConsistenciaRamon();
