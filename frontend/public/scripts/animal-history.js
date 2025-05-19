/**
 * Script para cargar el historial de cambios de un animal
 */

// Se ejecuta inmediatamente y configura un observador de mutación
(function() {
    console.log('🔄 Script de historial de animales cargado');
    
    // Primero intentamos configurar los eventos directamente
    setupHistoryTab();
    
    // Como alternativa, configuramos un observador de mutación para detectar cuando el DOM cambie
    const observer = new MutationObserver((mutations) => {
        // Intentar configurar los eventos cada vez que el DOM cambie
        setupHistoryTab();
    });
    
    // Configurar el observador para vigilar cambios en el cuerpo del documento
    observer.observe(document.body, { 
        childList: true,
        subtree: true 
    });
    
    // También agregar un evento global para detectar clics
    document.body.addEventListener('click', (event) => {
        // Comprobar si el clic fue en la pestaña de historial
        if (event.target && (event.target.id === 'tab-changes' || 
                           (event.target.closest && event.target.closest('#tab-changes')))) {
            console.log('🔄 DETECTADO: Clic en pestaña de historial mediante evento global');
            loadAnimalHistory();
        }
    });
})();

/**
 * Configura los eventos para cargar el historial cuando se selecciona la pestaña
 */
function setupHistoryTab() {
    // Obtener la pestaña de historial directamente
    const historyTab = document.getElementById('tab-changes');
    
    if (historyTab) {
        console.log('🔄 Pestaña de historial encontrada, configurando evento');
        
        // Eliminar todos los listeners antiguos para evitar duplicaciones
        historyTab.removeEventListener('click', loadAnimalHistory);
        
        // Agregar el nuevo listener
        historyTab.addEventListener('click', function() {
            console.log('🔄 EVENTO: Clic en pestaña de historial');
            loadAnimalHistory();
        });
        
        console.log('🔄 Eventos para historial configurados correctamente');
    } else {
        console.log('📡 Pestaña de historial aún no disponible en el DOM');
    }
}

/**
 * Carga el historial de cambios del animal actual
 */
function loadAnimalHistory() {
    console.log('🟡 INICIO: Cargando historial de cambios...');
    
    try {
        // Obtener el ID del animal de la URL
        const url = window.location.pathname;
        const parts = url.split('/');
        const animalId = parts[parts.length - 1];
        
        console.log('🔍 ID de animal extraído de URL:', animalId);
        
        if (!animalId || isNaN(animalId)) {
            console.error('❌ No se pudo obtener un ID de animal válido de la URL:', url);
            showErrorMessage('No se pudo obtener el ID del animal');
            return;
        }
        
        // Mostrar indicador de carga
        showLoadingIndicator();
        
        console.log('🔎 Iniciando solicitud de historial para animal ID:', animalId);
        
        // Hacer la solicitud directamente aquí en lugar de usar getAnimalHistory
        const fetchHistorial = async () => {
            try {
                // Obtener token
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No hay token de autenticación disponible');
                }
                
                // URL para la petición - Usar la URL completa del backend
                const apiUrl = `http://localhost:8000/api/v1/animals/${animalId}/history`;
                console.log('🔗 URL de petición:', apiUrl);
                
                // Mostrar versión corta del token para debugging
                console.log('🔑 Token (primeros caracteres):', token.substring(0, 10) + '...');
                
                // Realizar la petición
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.trim()}`,
                        'Cache-Control': 'no-cache'
                    },
                    credentials: 'same-origin'
                });
                
                console.log('📡 Respuesta recibida del servidor:', response.status, response.statusText);
                
                // Verificar respuesta
                if (!response.ok) {
                    // Intentar leer el cuerpo del error
                    const errorText = await response.text();
                    console.error('❌ Error del servidor:', errorText);
                    throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
                }
                
                // Procesar respuesta
                const data = await response.json();
                console.log('✅ Datos de historial recibidos:', data);
                
                // Mostrar los datos en la interfaz
                displayHistoryData(data.data || data);
            } catch (error) {
                console.error('❌ ERROR en fetchHistorial:', error);
                showErrorMessage(error.message || 'Error al cargar el historial');
            } finally {
                hideLoadingIndicator();
            }
        };
        
        // Ejecutar la función
        fetchHistorial();
        
    } catch (outerError) {
        console.error('❌ ERROR CRÍTICO en loadAnimalHistory:', outerError);
        showErrorMessage('Error inesperado al cargar el historial');
        hideLoadingIndicator();
    }
}

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string} - Token JWT o cadena vacía
 */
function getAuthToken() {
    const token = localStorage.getItem('token');
    console.log('🔑 Token:', token ? 'Disponible' : 'No disponible');
    return token || '';
}

/**
 * Obtiene el historial de un animal desde la API
 * @param {number} animalId - ID del animal
 * @returns {Promise<Array>} - Datos del historial
 */
async function getAnimalHistory(animalId) {
    try {
        // Obtener token de autenticación
        const token = getAuthToken();
        
        // Si no hay token, mostrar mensaje en consola
        if (!token) {
            console.warn('⚠️ No hay token de autenticación disponible');
            throw new Error('No hay token de autenticación');
        }
        
        // URL base de la API
        const apiBaseUrl = '/api/v1';
        
        console.log(`🔗 Enviando petición GET a: ${apiBaseUrl}/animals/${animalId}/history`);
        console.log('🔑 Token utilizado:', token.substring(0, 20) + '...');
        
        // Usar fetch con el token obtenido (sin espacios adicionales)
        const response = await fetch(`${apiBaseUrl}/animals/${animalId}/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`
            },
            credentials: 'same-origin'
        });
        
        console.log('📡 Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('💾 Datos recibidos:', responseData);
        return responseData.data || responseData;
    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        throw error;
    }
}

/**
 * Muestra los datos del historial en la interfaz
 * @param {Array} historyData - Datos del historial
 */
function displayHistoryData(historyData) {
    const contentContainer = document.getElementById('content-changes');
    
    if (!contentContainer) {
        console.error('❌ No se encontró el contenedor para el historial');
        return;
    }
    
    // Si no hay datos de historial
    if (!historyData || historyData.length === 0) {
        contentContainer.innerHTML = `
            <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Historial de Cambios</h3>
                <p class="text-gray-500 dark:text-gray-400">Registro de modificaciones del animal</p>
            </div>
            <div class="p-6 text-center text-gray-500 dark:text-gray-400">
                <p>No se han registrado cambios para este animal.</p>
            </div>
        `;
        return;
    }
    
    // Si hay datos, crear la tabla
    let tableHTML = `
        <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Historial de Cambios</h3>
            <p class="text-gray-500 dark:text-gray-400">Registro de modificaciones del animal</p>
        </div>
        <div class="overflow-x-auto relative">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="py-3 px-6">Fecha</th>
                        <th scope="col" class="py-3 px-6">Usuario</th>
                        <th scope="col" class="py-3 px-6">Campo</th>
                        <th scope="col" class="py-3 px-6">Cambio</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Agregar cada registro a la tabla
    historyData.forEach(item => {
        const date = new Date(item.created_at).toLocaleString();
        tableHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="py-4 px-6">${date}</td>
                <td class="py-4 px-6">${item.usuario || 'Sistema'}</td>
                <td class="py-4 px-6">${item.campo || '-'}</td>
                <td class="py-4 px-6">${item.cambio || '-'}</td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    contentContainer.innerHTML = tableHTML;
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error
 */
function showErrorMessage(message) {
    const contentContainer = document.getElementById('content-changes');
    
    if (!contentContainer) {
        console.error('❌ No se encontró el contenedor para el historial');
        return;
    }
    
    contentContainer.innerHTML = `
        <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Historial de Cambios</h3>
            <p class="text-gray-500 dark:text-gray-400">Registro de modificaciones del animal</p>
        </div>
        <div class="p-6 text-center text-red-500">
            <p>Error: ${message}</p>
        </div>
    `;
}

/**
 * Muestra un indicador de carga mientras se obtienen los datos
 */
function showLoadingIndicator() {
    const contentContainer = document.getElementById('content-changes');
    
    if (!contentContainer) return;
    
    contentContainer.innerHTML = `
        <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Historial de Cambios</h3>
            <p class="text-gray-500 dark:text-gray-400">Registro de modificaciones del animal</p>
        </div>
        <div class="p-6 text-center">
            <div role="status">
                <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span class="sr-only">Cargando...</span>
            </div>
            <p class="mt-2 text-gray-500">Cargando historial...</p>
        </div>
    `;
}

/**
 * Oculta el indicador de carga
 */
function hideLoadingIndicator() {
    // No necesitamos hacer nada aquí, 
    // ya que al cargar los datos o mostrar un error 
    // se reemplaza todo el contenido
}
