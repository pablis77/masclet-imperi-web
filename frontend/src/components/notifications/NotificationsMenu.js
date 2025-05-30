/**
 * Componente para gestionar las notificaciones del sistema
 * Este componente muestra el icono de campana y el menú desplegable con las notificaciones
 */

// Importar el servicio de notificaciones
import { notificationService } from '../../services/notificationService';

// Configurar el componente
function initializeNotifications() {
  const notificationsButton = document.getElementById('notifications-button');
  const notificationsMenu = document.getElementById('notifications-menu');
  const notificationsCount = document.querySelector('#notifications-button .absolute');
  const notificationsContainer = document.querySelector('#notifications-menu .max-h-80');
  const markAllReadButton = document.getElementById('mark-all-read');
  const notificationTitle = document.querySelector('#notifications-menu .font-bold');
  
  if (!notificationsButton || !notificationsMenu || !notificationsCount || 
      !notificationsContainer || !markAllReadButton || !notificationTitle) {
    console.error('No se encontraron todos los elementos necesarios para las notificaciones');
    return;
  }

  // Activar/desactivar el menú de notificaciones
  notificationsButton.addEventListener('click', () => {
    notificationsMenu.classList.toggle('hidden');
    
    // Si el menú está visible, actualizar las notificaciones
    if (!notificationsMenu.classList.contains('hidden')) {
      refreshNotifications();
    }
  });

  // Cerrar el menú al hacer clic fuera de él
  document.addEventListener('click', (e) => {
    if (!notificationsButton.contains(e.target) && !notificationsMenu.contains(e.target)) {
      notificationsMenu.classList.add('hidden');
    }
  });

  // Marcar todas como leídas
  markAllReadButton.addEventListener('click', async () => {
    await notificationService.markAllAsRead();
    refreshNotifications();
  });

  // Actualizar el contador y contenido de notificaciones
  function updateNotificationsUI(data) {
    // Actualizar contador
    const unreadCount = data.unread_count;
    notificationsCount.textContent = unreadCount;
    
    // Mostrar/ocultar contador según haya notificaciones o no
    if (unreadCount === 0) {
      notificationsCount.classList.add('hidden');
    } else {
      notificationsCount.classList.remove('hidden');
    }
    
    // Título según idioma
    const lang = document.documentElement.lang || 'es';
    notificationTitle.textContent = lang === 'ca' ? 'Alertes del sistema' : 'Alertas del sistema';
    
    // Actualizar contenido de notificaciones
    updateNotificationsList(data.items);
  }

  // Actualizar lista de notificaciones
  function updateNotificationsList(notifications) {
    // Limpiar contenedor
    notificationsContainer.innerHTML = '';
    
    // Si no hay notificaciones, mostrar mensaje
    if (notifications.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'p-4 text-center text-gray-500 dark:text-gray-400';
      emptyMessage.textContent = document.documentElement.lang === 'ca' 
        ? 'No hi ha notificacions' 
        : 'No hay notificaciones';
      notificationsContainer.appendChild(emptyMessage);
      return;
    }
    
    // Crear elementos para cada notificación
    notifications.forEach(notification => {
      const notificationElement = createNotificationElement(notification);
      notificationsContainer.appendChild(notificationElement);
    });
  }

  // Crear elemento HTML para una notificación
  function createNotificationElement(notification) {
    const container = document.createElement('div');
    container.className = `p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${notification.read ? 'opacity-70' : ''}`;
    
    // Definir color de fondo según tipo
    let bgColorClass = 'bg-blue-100 dark:bg-blue-900/30';
    let textColorClass = 'text-blue-600 dark:text-blue-400';
    
    switch (notification.type) {
      case 'system':
        bgColorClass = 'bg-amber-100 dark:bg-amber-900/30';
        textColorClass = 'text-amber-600 dark:text-amber-400';
        break;
      case 'backup':
        bgColorClass = 'bg-green-100 dark:bg-green-900/30';
        textColorClass = 'text-green-600 dark:text-green-400';
        break;
      case 'animal':
        bgColorClass = 'bg-blue-100 dark:bg-blue-900/30';
        textColorClass = 'text-blue-600 dark:text-blue-400';
        break;
      case 'import':
        bgColorClass = 'bg-purple-100 dark:bg-purple-900/30';
        textColorClass = 'text-purple-600 dark:text-purple-400';
        break;
      default:
        break;
    }
    
    container.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 ${bgColorClass} p-2 rounded-full">
          <span class="${textColorClass} text-sm">${notification.icon}</span>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-200">${notification.title}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${notification.message}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">${notification.relative_time}</p>
        </div>
        <div class="ml-2 flex flex-col gap-1">
          <button class="mark-read-btn text-xs text-primary hover:text-primary-dark p-1" data-id="${notification.id}" title="Marcar como leída">
            ${notification.read ? '✓' : '👁️'}
          </button>
          <button class="delete-btn text-xs text-red-500 hover:text-red-700 p-1" data-id="${notification.id}" title="Eliminar">
            🗑️
          </button>
        </div>
      </div>
    `;
    
    // Añadir event listeners
    container.querySelector('.mark-read-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(e.currentTarget.getAttribute('data-id'));
      await notificationService.markAsRead(id);
      refreshNotifications();
    });
    
    container.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(e.currentTarget.getAttribute('data-id'));
      await notificationService.deleteNotification(id);
      refreshNotifications();
    });
    
    // Marcar como leída al hacer clic en la notificación
    container.addEventListener('click', async () => {
      if (!notification.read) {
        await notificationService.markAsRead(notification.id);
        refreshNotifications();
      }
      
      // Redirigir según el tipo de notificación
      handleNotificationClick(notification);
    });
    
    return container;
  }

  // Manejar clic en notificación
  function handleNotificationClick(notification) {
    // Cerrar el menú
    notificationsMenu.classList.add('hidden');
    
    // Redirigir según el tipo de notificación y entidad relacionada
    switch (notification.type) {
      case 'animal':
        if (notification.related_entity_id) {
          window.location.href = `/animals/${notification.related_entity_id}`;
        } else {
          window.location.href = '/animals';
        }
        break;
      case 'backup':
        window.location.href = '/backup';
        break;
      case 'import':
        window.location.href = '/imports';
        break;
      case 'system':
        // No hacer nada especial para notificaciones del sistema
        break;
      default:
        break;
    }
  }

  // Actualizar notificaciones desde el servidor
  async function refreshNotifications() {
    try {
      await notificationService.getNotifications(false, 10, 0);
    } catch (error) {
      console.error('Error al actualizar notificaciones:', error);
    }
  }

  // Suscribirse a cambios en las notificaciones
  notificationService.subscribe(updateNotificationsUI);
  
  // Iniciar polling de notificaciones
  notificationService.startPolling(60000); // Actualizar cada minuto
  
  // Cargar notificaciones iniciales
  refreshNotifications();
  
  // Botón de prueba para desarrollo (solo visible en entorno de desarrollo)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const testButton = document.createElement('button');
    testButton.textContent = 'Crear notificaciones de prueba';
    testButton.className = 'w-full mt-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 py-1 rounded';
    testButton.addEventListener('click', async () => {
      await notificationService.createTestNotifications();
    });
    
    const container = document.querySelector('#notifications-menu .p-2');
    if (container) {
      container.appendChild(testButton);
    }
  }
}

// Exportar la función de inicialización
export default initializeNotifications;
