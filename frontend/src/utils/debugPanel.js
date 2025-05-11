/**
 * Sistema de depuración global para Masclet Imperi
 * Este archivo proporciona funciones para registrar información de depuración
 * en un panel visible que persiste entre diferentes partes de la aplicación.
 */

// Función para obtener o crear el panel de depuración
function getDebugPanel() {
    let debugInfo = document.getElementById('debug-info');
    let debugContent = document.getElementById('debug-content');
    
    // Si no existe, lo creamos
    if (!debugInfo) {
        debugInfo = document.createElement('div');
        debugInfo.id = 'debug-info';
        debugInfo.className = 'p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sticky top-0 z-50';
        debugInfo.style.display = 'block';
        
        // Crear cabecera
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-2';
        
        const title = document.createElement('p');
        title.className = 'font-bold text-red-700';
        title.textContent = '⚠️ MODO DEPURACIÓN ACTIVO - NO OCULTAR';
        
        const expandBtn = document.createElement('button');
        expandBtn.id = 'toggle-debug';
        expandBtn.className = 'text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded';
        expandBtn.textContent = 'Ampliar';
        expandBtn.type = 'button';
        
        // Agregar a la cabecera
        header.appendChild(title);
        header.appendChild(expandBtn);
        
        // Crear contenido
        debugContent = document.createElement('div');
        debugContent.id = 'debug-content';
        debugContent.className = 'whitespace-pre-wrap overflow-auto max-h-96 border border-yellow-300 p-2 bg-white';
        
        // Agregar todo al panel
        debugInfo.appendChild(header);
        debugInfo.appendChild(debugContent);
        
        // Insertar al principio del body
        document.body.insertBefore(debugInfo, document.body.firstChild);
        
        // Configurar botón para ampliar/reducir
        expandBtn.addEventListener('click', () => {
            if (debugContent.classList.contains('max-h-96')) {
                debugContent.classList.remove('max-h-96');
                debugContent.classList.add('max-h-[600px]');
                expandBtn.textContent = 'Reducir';
            } else {
                debugContent.classList.remove('max-h-[600px]');
                debugContent.classList.add('max-h-96');
                expandBtn.textContent = 'Ampliar';
            }
        });
    }
    
    return { panel: debugInfo, content: debugContent };
}

/**
 * Registra un mensaje en el panel de depuración
 * @param {string} message - Mensaje a mostrar
 * @param {any} data - Datos adicionales (opcional)
 */
export function debugLog(message, data = null) {
    // Siempre registrar en consola
    console.log(message, data);
    
    // Obtener o crear panel
    const { panel, content } = getDebugPanel();
    
    // Asegurar que el panel esté visible
    panel.style.display = 'block';
    
    // Formatear mensaje
    const timestamp = new Date().toLocaleTimeString();
    let logMessage = `[${timestamp}] ${message}`;
    
    // Formatear datos adicionales
    if (data !== null && data !== undefined) {
        try {
            if (typeof data === 'object') {
                try {
                    // Intentar JSON.stringify con formato
                    logMessage += ':\n' + JSON.stringify(data, null, 2);
                } catch (jsonError) {
                    // Alternativa: mostrar propiedades
                    try {
                        logMessage += ':\n' + Object.keys(data)
                            .map(key => `  ${key}: ${typeof data[key] === 'object' ? '[Objeto]' : data[key]}`)
                            .join('\n');
                    } catch (e) {
                        logMessage += ': [Objeto complejo]';
                    }
                }
            } else {
                logMessage += ': ' + data;
            }
        } catch (e) {
            logMessage += ': [Error al formatear datos: ' + e.message + ']';
        }
    }
    
    // Añadir formato según tipo de mensaje
    let formattedMessage = logMessage;
    
    if (message.includes('ERROR') || message.includes('⚠️')) {
        formattedMessage = '🔴 ' + logMessage;
        content.innerHTML += formattedMessage + '\n\n';
    } else if (message.includes('INICIANDO') || message.includes('ENVIANDO')) {
        formattedMessage = '🔵 ' + logMessage;
        content.innerHTML += formattedMessage + '\n';
    } else if (message.includes('✅') || message.includes('ÉXITO')) {
        formattedMessage = '✅ ' + logMessage;
        content.innerHTML += formattedMessage + '\n\n';
    } else {
        content.innerHTML += formattedMessage + '\n';
    }
    
    // Auto-scroll
    content.scrollTop = content.scrollHeight;
}

/**
 * Registra un error en el panel de depuración
 * @param {string} title - Título del error
 * @param {Error} error - Objeto de error
 */
export function debugError(title, error) {
    console.error(title, error);
    
    debugLog('⚠️ ' + title);
    
    if (error) {
        if (error.message) debugLog('Mensaje: ' + error.message);
        if (error.stack) debugLog('Stack: ' + error.stack.split('\n')[0]);
        
        // Analizar errores conocidos
        const errorMsg = error.message?.toLowerCase() || '';
        
        if (errorMsg.includes('explotaci')) {
            debugLog('🐞 ERROR CONOCIDO: Posible discrepancia de campos en la base de datos');
            debugLog('El backend espera "explotacio" pero podría haber un error con "explotaci"');
            debugLog('Esto coincide con el error #2 identificado en los endpoints de animales');
        }
        
        if (errorMsg.includes('alletar') || errorMsg.includes('amamantamiento')) {
            debugLog('🐞 ERROR CONOCIDO: Formato incorrecto del campo alletar');
            debugLog('El backend espera un booleano pero el modelo usa strings ("0", "1", "2")');
            debugLog('Esto coincide con el error #1 identificado en los endpoints de animales');
        }
    }
}

/**
 * Limpia el contenido del panel de depuración
 */
export function clearDebugPanel() {
    const { content } = getDebugPanel();
    content.innerHTML = '';
}

// Exportar funciones
export default {
    debugLog,
    debugError,
    clearDebugPanel
};
