/**
 * Script para cargar y mostrar el historial de cambios de un animal
 * Este archivo debe incluirse en la página de detalles del animal
 */

// Variable global para evitar configurar listeners múltiples veces
let eventosHistorialConfigurados = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando cargador de historial de cambios');
    
    // Configuración y traducciones
    const translations = {
        es: {
            no_changes: "No hay cambios registrados para este animal",
            error_loading: "Error al cargar el historial de cambios",
            retry: "Reintentar",
            loading: "Cargando historial de cambios...",
            date: "Fecha",
            user: "Usuario",
            field: "Campo",
            old_value: "Valor Anterior",
            new_value: "Valor Nuevo",
            description: "Descripción"
        },
        ca: {
            no_changes: "No hi ha canvis registrats per a aquest animal",
            error_loading: "Error al carregar l'historial de canvis",
            retry: "Tornar a intentar",
            loading: "Carregant historial de canvis...",
            date: "Data",
            user: "Usuari",
            field: "Camp",
            old_value: "Valor Anterior",
            new_value: "Valor Nou",
            description: "Descripció"
        }
    };

    // Obtener idioma actual
    const getCurrentLang = () => localStorage.getItem('userLanguage') || 'es';
    
    // Función para traducir textos
    const t = (key) => {
        const lang = getCurrentLang();
        return translations[lang]?.[key] || translations.es[key] || key;
    };
    
    // Función para inicializar componentes una vez cargado el DOM
    function initializeHistoryLoader() {
        // Obtener contenedor de historial de cambios
        const historyContainer = document.getElementById('content-changes');
        if (!historyContainer) {
            return;
        }
        
        // Obtener ID del animal de la URL
        const animalId = window.location.pathname.split('/').pop();
        if (!animalId || isNaN(animalId)) {
            return;
        }
        
        // Crear una función para cargar el historial
        const loadAnimalHistory = async () => {
            try {
                // Mostrar indicador de carga
                showLoadingIndicator();
                
                // Obtener token de autenticación
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No hay token de autenticación');
                }
                
                // Obtener URL base de la API
                const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000/api/v1';
                
                // URL completa del endpoint
                const apiUrl = `${apiBaseUrl}/animals/${animalId}/history`;
                
                // Configuración de la petición con autenticación
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Historial cargado correctamente:', data);
                
                // Mostrar los datos en la interfaz
                displayHistoryData(data.data || []);
            } catch (error) {
                console.error('ERROR en fetchHistorial:', error);
                showErrorMessage(error);
            }
        };
        
        // Función para mostrar indicador de carga
        const showLoadingIndicator = () => {
            historyContainer.innerHTML = `
                <div class="mb-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">${t('changes_history')}</h3>
                    <p class="text-gray-500 dark:text-gray-400">${t('changes_registry')}</p>
                </div>
                <div class="flex items-center justify-center p-8">
                    <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="ml-3 text-gray-600 dark:text-gray-300">${t('loading')}</span>
                </div>
                <!-- Botón Volver -->
                <div class="mt-6 text-center">
                    <a href="/animals" id="changes-back-btn" class="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">
                        <span class="mr-2">←</span> ${t('back_to_animal_list')}
                    </a>
                </div>
            `;
        };
        
        // Función para mostrar mensaje de error
        const showErrorMessage = (error) => {
            historyContainer.innerHTML = `
                <div class="mb-4">
                    <h3 class="text-lg font-medium text-text-red-600 dark:text-red-400">${t('error_loading')}</h3>
                    <p class="text-gray-500 dark:text-gray-400">${error.message}</p>
                </div>
                <div class="p-6 text-center">
                    <button id="retry-history-btn" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none">
                        ${t('retry')}
                    </button>
                </div>
                <!-- Botón Volver -->
                <div class="mt-6 text-center">
                    <a href="/animals" id="changes-back-btn" class="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">
                        <span class="mr-2">←</span> ${t('back_to_animal_list')}
                    </a>
                </div>
            `;
            
            // Agregar evento al botón de reintentar
            const retryBtn = document.getElementById('retry-history-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadAnimalHistory);
            }
        };
        
        // Función para mostrar los datos de historial
        const displayHistoryData = (historyData) => {
            if (!Array.isArray(historyData) || historyData.length === 0) {
                // No hay datos para mostrar
                historyContainer.innerHTML = `
                    <div class="mb-4">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">${t('changes_history')}</h3>
                        <p class="text-gray-500 dark:text-gray-400">${t('changes_registry')}</p>
                    </div>
                    <div class="p-6 text-center text-gray-500 dark:text-gray-400">
                        <p>${t('no_changes')}</p>
                    </div>
                    <!-- Botón Volver -->
                    <div class="mt-6 text-center">
                        <a href="/animals" id="changes-back-btn" class="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">
                            <span class="mr-2">←</span> ${t('back_to_animal_list')}
                        </a>
                    </div>
                `;
                return;
            }
            
            // Hay datos para mostrar, crear tabla
            let tableHTML = `
                <div class="mb-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">${t('changes_history')}</h3>
                    <p class="text-gray-500 dark:text-gray-400">${t('changes_registry')}</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="tabla-historial">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ${t('date')}
                                </th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ${t('user')}
                                </th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ${t('field')}
                                </th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ${t('old_value')}
                                </th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ${t('new_value')}
                                </th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ${t('description')}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
            `;
            
            // Recorrer y agregar cada registro
            historyData.forEach(record => {
                // Formatear la fecha si está disponible
                let formattedDate = record.timestamp || 'N/A';
                if (formattedDate && formattedDate !== 'N/A') {
                    try {
                        const date = new Date(formattedDate);
                        formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                    } catch (e) {
                        console.warn('Error al formatear fecha:', e);
                    }
                }
                
                // Agregar fila con los datos
                tableHTML += `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${formattedDate}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${record.usuario || 'N/A'}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${record.campo || record.field || 'N/A'}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${record.valor_anterior || record.old_value || 'N/A'}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${record.valor_nuevo || record.new_value || 'N/A'}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${record.cambio || record.description || 'N/A'}
                        </td>
                    </tr>
                `;
            });
            
            // Cerrar tabla y agregar botón de volver
            tableHTML += `
                        </tbody>
                    </table>
                </div>
                <!-- Botón Volver -->
                <div class="mt-6 text-center">
                    <a href="/animals" id="changes-back-btn" class="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">
                        <span class="mr-2">←</span> ${t('back_to_animal_list')}
                    </a>
                </div>
            `;
            
            // Actualizar el contenedor con la tabla
            historyContainer.innerHTML = tableHTML;
        };
        
        // Buscar la pestaña de historial
        const historyTab = document.getElementById('tab-changes');
        if (historyTab && !eventosHistorialConfigurados) {
            // Agregar evento para cargar historial al hacer clic en la pestaña
            historyTab.addEventListener('click', () => {
                loadAnimalHistory();
            });
            
            // Marcar que ya configuramos los eventos para no repetir
            eventosHistorialConfigurados = true;
        }
        
        // Cargar inmediatamente si la pestaña de cambios está activa inicialmente
        if (window.location.hash === '#changes') {
            // Simular clic en la pestaña
            if (historyTab) {
                historyTab.click();
            }
        }
    }
    
    // Inicializar el cargador de historial
    initializeHistoryLoader();
    
    // Reinicializar si cambia el idioma
    window.addEventListener('languageChanged', () => {
        initializeHistoryLoader();
    });
});
