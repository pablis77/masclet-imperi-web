/**
 * Script de inyección de autenticación real para el servidor Astro
 * Este script modifica directamente el middleware de Astro para inyectar nuestros scripts
 */

// Crear una función para inyectar nuestros scripts en todas las páginas HTML
function injectAuthScripts(html) {
    // Buscar el cierre del head para insertar nuestros scripts
    const headCloseIndex = html.indexOf('</head>');
    if (headCloseIndex === -1) return html;
    
    // Scripts a inyectar (orden importante: config primero, luego auth, finalmente solución)
    const scriptsToInject = `
    <!-- Scripts de autenticación real inyectados por script corrector -->
    <script src="/js/fix/apiConfig.js"></script>
    <script src="/js/fix/authService.js"></script>
    <script src="/js/fix/solucion_login.js"></script>
    `;
    
    // Insertar los scripts justo antes del cierre del head
    return html.slice(0, headCloseIndex) + scriptsToInject + html.slice(headCloseIndex);
}

// Interceptar el middleware de Astro
module.exports = async function(req, res, next) {
    // Guardar la función original res.send
    const originalSend = res.send;
    
    // Sobrescribir la función send para modificar la respuesta HTML
    res.send = function(body) {
        // Solo modificar respuestas HTML
        if (typeof body === 'string' && body.includes('<!DOCTYPE html>') || body.includes('<html')) {
            try {
                // Inyectar nuestros scripts
                const modifiedBody = injectAuthScripts(body);
                
                // Llamar a la función original con el HTML modificado
                return originalSend.call(this, modifiedBody);
            } catch (error) {
                console.error('Error al inyectar scripts de autenticación:', error);
                // En caso de error, continuar con el HTML original
                return originalSend.call(this, body);
            }
        }
        
        // Para respuestas no-HTML, continuar normalmente
        return originalSend.call(this, body);
    };
    
    // Continuar con el siguiente middleware
    next();
};
