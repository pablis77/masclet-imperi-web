import { notificationService } from "/src/services/notificationService.ts";
let currentSkip = 0;
let currentLimit = 20;
let currentFilter = "all";
let hasMore = false;
const container = document.getElementById("notifications-container");
const countElement = document.getElementById("notifications-count");
const loadMoreBtn = document.getElementById("load-more-btn");
const filterSelect = document.getElementById("filter-type");
const markAllReadBtn = document.getElementById("mark-all-read-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
function createNotificationElement(notification) {
  const notificationEl = document.createElement("div");
  notificationEl.className = `p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${notification.read ? "opacity-70" : ""}`;
  let bgColorClass = "bg-blue-100 dark:bg-blue-900/30";
  let textColorClass = "text-blue-600 dark:text-blue-400";
  switch (notification.type) {
    case "system":
      bgColorClass = "bg-amber-100 dark:bg-amber-900/30";
      textColorClass = "text-amber-600 dark:text-amber-400";
      break;
    case "backup":
      bgColorClass = "bg-green-100 dark:bg-green-900/30";
      textColorClass = "text-green-600 dark:text-green-400";
      break;
    case "animal":
      bgColorClass = "bg-blue-100 dark:bg-blue-900/30";
      textColorClass = "text-blue-600 dark:text-blue-400";
      break;
    case "import":
      bgColorClass = "bg-purple-100 dark:bg-purple-900/30";
      textColorClass = "text-purple-600 dark:text-purple-400";
      break;
    default:
      break;
  }
  notificationEl.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0 ${bgColorClass} p-3 rounded-full">
            <span class="${textColorClass} text-lg">${notification.icon}</span>
          </div>
          <div class="ml-4 flex-1">
            <div class="flex justify-between">
              <h3 class="text-sm font-medium text-gray-800 dark:text-white">${notification.title}</h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">${notification.relative_time}</span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${notification.message}</p>
            <div class="mt-2 flex">
              <button class="text-xs text-primary hover:underline mr-3 mark-read-btn" data-id="${notification.id}">
                ${notification.read ? "Ya leído" : "Marcar como leído"}
              </button>
              <button class="text-xs text-red-500 hover:underline delete-btn" data-id="${notification.id}">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
  const markReadBtn = notificationEl.querySelector(".mark-read-btn");
  if (markReadBtn) {
    markReadBtn.addEventListener("click", async () => {
      const id = parseInt(markReadBtn.getAttribute("data-id"));
      await notificationService.markAsRead(id);
      loadNotifications(currentSkip, currentLimit, currentFilter);
    });
  }
  const deleteBtn = notificationEl.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = parseInt(deleteBtn.getAttribute("data-id"));
      await notificationService.deleteNotification(id);
      loadNotifications(0, currentLimit, currentFilter);
    });
  }
  return notificationEl;
}
async function loadNotifications(skip = 0, limit = 20, type = "all") {
  if (container) {
    if (skip === 0) {
      container.innerHTML = `
            <div class="text-center py-12 text-gray-500 dark:text-gray-400">
              <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-4" role="status">
                <span class="sr-only">Cargando...</span>
              </div>
              <p>Cargando notificaciones...</p>
            </div>
          `;
    }
    try {
      const unreadOnly = false;
      const response = await notificationService.getNotifications(unreadOnly, limit, skip);
      if (!response || typeof response !== "object") {
        console.error("La respuesta del servidor no es válida:", response);
        container.innerHTML = `
              <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Error al cargar notificaciones. Respuesta inválida.</p>
              </div>
            `;
        return;
      }
      if (skip === 0) {
        container.innerHTML = "";
      }
      const items = response.items || [];
      if (countElement) {
        countElement.textContent = response.total || 0;
      }
      if (loadMoreBtn) {
        if (response.has_more) {
          loadMoreBtn.classList.remove("hidden");
          hasMore = true;
        } else {
          loadMoreBtn.classList.add("hidden");
          hasMore = false;
        }
      }
      if (items.length === 0 && skip === 0) {
        container.innerHTML = `
              <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No hay notificaciones para mostrar</p>
              </div>
            `;
        return;
      }
      let filteredItems = items;
      if (type !== "all") {
        filteredItems = items.filter((item) => item && item.type === type);
      }
      if (filteredItems.length === 0 && skip === 0) {
        container.innerHTML = `
              <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No hay notificaciones de este tipo</p>
              </div>
            `;
        return;
      }
      filteredItems.forEach((notification) => {
        const notificationElement = createNotificationElement(notification);
        container.appendChild(notificationElement);
      });
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      container.innerHTML = `
            <div class="text-center py-12 text-red-500">
              <p>Error al cargar notificaciones. Por favor, inténtalo de nuevo.</p>
            </div>
          `;
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadNotifications(0, currentLimit, currentFilter);
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      currentFilter = filterSelect.value;
      currentSkip = 0;
      loadNotifications(0, currentLimit, currentFilter);
    });
  }
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      if (hasMore) {
        currentSkip += currentLimit;
        loadNotifications(currentSkip, currentLimit, currentFilter);
      }
    });
  }
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", async () => {
      await notificationService.markAllAsRead();
      loadNotifications(0, currentLimit, currentFilter);
    });
  }
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", async () => {
      if (confirm("¿Estás seguro de que quieres eliminar todas las notificaciones?")) {
        loadNotifications(0, currentLimit, currentFilter);
      }
    });
  }
});
notificationService.startPolling(6e4);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vdGlmaWNhdGlvbnMuYXN0cm8iXSwic291cmNlc0NvbnRlbnQiOlsiLS0tXG4vLyBJbXBvcnRhciBlbCBsYXlvdXRcbmltcG9ydCBNYWluTGF5b3V0IGZyb20gJy4uL2NvbXBvbmVudHMvbGF5b3V0L01haW5MYXlvdXQuYXN0cm8nO1xuaW1wb3J0IHsgdCB9IGZyb20gJy4uL2kxOG4vY29uZmlnJztcblxuLy8gRGVmaW5pciByb2wgZGUgdXN1YXJpbyAoZXN0byBldmVudHVhbG1lbnRlIHZlbmRyw6EgZGUgbGEgYXV0ZW50aWNhY2nDs24pXG5jb25zdCB1c2VyUm9sZSA9IFwiYWRtaW5pc3RyYWRvclwiOyAvLyBTaW11bGFjacOzbiBkZSByb2xcbi0tLVxuXG48TWFpbkxheW91dCB0aXRsZT17dCgnbm90aWZpY2F0aW9uLnN5c3RlbV9hbGVydHMnKX0gdXNlclJvbGU9e3VzZXJSb2xlfT5cbiAgPGRpdiBjbGFzcz1cImNvbnRhaW5lciBteC1hdXRvIHB4LTQgcHktNlwiPlxuICAgIDxkaXYgY2xhc3M9XCJtYi02XCI+XG4gICAgICA8aDEgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTgwMCBkYXJrOnRleHQtd2hpdGVcIj57dCgnbm90aWZpY2F0aW9uLnN5c3RlbV9hbGVydHMnKX08L2gxPlxuICAgICAgPHAgY2xhc3M9XCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPnt0KCdub3RpZmljYXRpb24udmlld19hbGxfZGVzY3JpcHRpb24nKX08L3A+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBzaGFkb3ctbWQgcm91bmRlZC1sZyBwLTZcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItNlwiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDBcIj57dCgnbm90aWZpY2F0aW9uLmZpbHRlcl9ieScpfTo8L3NwYW4+XG4gICAgICAgICAgPHNlbGVjdCBpZD1cImZpbHRlci10eXBlXCIgY2xhc3M9XCJtbC0yIHAtMiBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHJvdW5kZWQtbWQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMFwiPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImFsbFwiPnt0KCdub3RpZmljYXRpb24uYWxsX3R5cGVzJyl9PC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwic3lzdGVtXCI+e3QoJ25vdGlmaWNhdGlvbi50eXBlcy5zeXN0ZW0nKX08L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJiYWNrdXBcIj57dCgnbm90aWZpY2F0aW9uLnR5cGVzLmJhY2t1cCcpfTwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImFuaW1hbFwiPnt0KCdub3RpZmljYXRpb24udHlwZXMuYW5pbWFsJyl9PC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiaW1wb3J0XCI+e3QoJ25vdGlmaWNhdGlvbi50eXBlcy5pbXBvcnQnKX08L29wdGlvbj5cbiAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGJ1dHRvbiBpZD1cIm1hcmstYWxsLXJlYWQtYnRuXCIgY2xhc3M9XCJweC00IHB5LTIgYmctcHJpbWFyeSB0ZXh0LXdoaXRlIHJvdW5kZWQtbWQgaG92ZXI6YmctcHJpbWFyeS1kYXJrXCI+XG4gICAgICAgICAgICB7dCgnbm90aWZpY2F0aW9uLm1hcmtfYWxsX3JlYWQnKX1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGlkPVwiY2xlYXItYWxsLWJ0blwiIGNsYXNzPVwibWwtMiBweC00IHB5LTIgYmctcmVkLTUwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtbWQgaG92ZXI6YmctcmVkLTYwMFwiPlxuICAgICAgICAgICAge3QoJ25vdGlmaWNhdGlvbi5jbGVhcl9hbGwnKX1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBpZD1cIm5vdGlmaWNhdGlvbnMtY29udGFpbmVyXCIgY2xhc3M9XCJkaXZpZGUteSBkaXZpZGUtZ3JheS0xMDAgZGFyazpkaXZpZGUtZ3JheS03MDBcIj5cbiAgICAgICAgPCEtLSBMYXMgbm90aWZpY2FjaW9uZXMgc2UgY2FyZ2Fyw6FuIGRpbsOhbWljYW1lbnRlIGRlc2RlIGVsIGJhY2tlbmQgLS0+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlciBweS0xMiB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJhbmltYXRlLXNwaW4gaW5saW5lLWJsb2NrIHctOCBoLTggYm9yZGVyLTQgYm9yZGVyLWN1cnJlbnQgYm9yZGVyLXQtdHJhbnNwYXJlbnQgcm91bmRlZC1mdWxsIG1iLTRcIiByb2xlPVwic3RhdHVzXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5DYXJnYW5kby4uLjwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cD57dCgnbm90aWZpY2F0aW9uLmxvYWRpbmcnKX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJtdC02IGZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPlxuICAgICAgICAgIDxzcGFuIGlkPVwibm90aWZpY2F0aW9ucy1jb3VudFwiPjA8L3NwYW4+IHt0KCdub3RpZmljYXRpb24udG90YWxfY291bnQnKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGJ1dHRvbiBpZD1cImxvYWQtbW9yZS1idG5cIiBjbGFzcz1cInB4LTQgcHktMiBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwIHJvdW5kZWQtbWQgaG92ZXI6YmctZ3JheS0zMDAgZGFyazpob3ZlcjpiZy1ncmF5LTYwMCBoaWRkZW5cIj5cbiAgICAgICAgICAgIHt0KCdub3RpZmljYXRpb24ubG9hZF9tb3JlJyl9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuXG4gIDxzY3JpcHQ+XG4gICAgaW1wb3J0IHsgbm90aWZpY2F0aW9uU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL25vdGlmaWNhdGlvblNlcnZpY2UnO1xuXG4gICAgLy8gRXN0YWRvIHBhcmEgbGEgcGFnaW5hY2nDs24geSBmaWx0cmFkb1xuICAgIGxldCBjdXJyZW50U2tpcCA9IDA7XG4gICAgbGV0IGN1cnJlbnRMaW1pdCA9IDIwO1xuICAgIGxldCBjdXJyZW50RmlsdGVyID0gJ2FsbCc7XG4gICAgbGV0IGhhc01vcmUgPSBmYWxzZTtcblxuICAgIC8vIFJlZmVyZW5jaWFzIGEgZWxlbWVudG9zIERPTVxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub3RpZmljYXRpb25zLWNvbnRhaW5lcicpO1xuICAgIGNvbnN0IGNvdW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub3RpZmljYXRpb25zLWNvdW50Jyk7XG4gICAgY29uc3QgbG9hZE1vcmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZC1tb3JlLWJ0bicpO1xuICAgIGNvbnN0IGZpbHRlclNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXItdHlwZScpO1xuICAgIGNvbnN0IG1hcmtBbGxSZWFkQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcmstYWxsLXJlYWQtYnRuJyk7XG4gICAgY29uc3QgY2xlYXJBbGxCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXItYWxsLWJ0bicpO1xuXG4gICAgLy8gQ3JlYXIgZWxlbWVudG8gSFRNTCBwYXJhIHVuYSBub3RpZmljYWNpw7NuXG4gICAgZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uRWxlbWVudChub3RpZmljYXRpb24pIHtcbiAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBub3RpZmljYXRpb25FbC5jbGFzc05hbWUgPSBgcC00IGhvdmVyOmJnLWdyYXktNTAgZGFyazpob3ZlcjpiZy1ncmF5LTcwMCAke25vdGlmaWNhdGlvbi5yZWFkID8gJ29wYWNpdHktNzAnIDogJyd9YDtcbiAgICAgIFxuICAgICAgLy8gRGVmaW5pciBjb2xvciBkZSBmb25kbyBzZWfDum4gdGlwb1xuICAgICAgbGV0IGJnQ29sb3JDbGFzcyA9ICdiZy1ibHVlLTEwMCBkYXJrOmJnLWJsdWUtOTAwLzMwJztcbiAgICAgIGxldCB0ZXh0Q29sb3JDbGFzcyA9ICd0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCc7XG4gICAgICBcbiAgICAgIHN3aXRjaCAobm90aWZpY2F0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3lzdGVtJzpcbiAgICAgICAgICBiZ0NvbG9yQ2xhc3MgPSAnYmctYW1iZXItMTAwIGRhcms6YmctYW1iZXItOTAwLzMwJztcbiAgICAgICAgICB0ZXh0Q29sb3JDbGFzcyA9ICd0ZXh0LWFtYmVyLTYwMCBkYXJrOnRleHQtYW1iZXItNDAwJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmFja3VwJzpcbiAgICAgICAgICBiZ0NvbG9yQ2xhc3MgPSAnYmctZ3JlZW4tMTAwIGRhcms6YmctZ3JlZW4tOTAwLzMwJztcbiAgICAgICAgICB0ZXh0Q29sb3JDbGFzcyA9ICd0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYW5pbWFsJzpcbiAgICAgICAgICBiZ0NvbG9yQ2xhc3MgPSAnYmctYmx1ZS0xMDAgZGFyazpiZy1ibHVlLTkwMC8zMCc7XG4gICAgICAgICAgdGV4dENvbG9yQ2xhc3MgPSAndGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbXBvcnQnOlxuICAgICAgICAgIGJnQ29sb3JDbGFzcyA9ICdiZy1wdXJwbGUtMTAwIGRhcms6YmctcHVycGxlLTkwMC8zMCc7XG4gICAgICAgICAgdGV4dENvbG9yQ2xhc3MgPSAndGV4dC1wdXJwbGUtNjAwIGRhcms6dGV4dC1wdXJwbGUtNDAwJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgbm90aWZpY2F0aW9uRWwuaW5uZXJIVE1MID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1zdGFydFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4LXNocmluay0wICR7YmdDb2xvckNsYXNzfSBwLTMgcm91bmRlZC1mdWxsXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIiR7dGV4dENvbG9yQ2xhc3N9IHRleHQtbGdcIj4ke25vdGlmaWNhdGlvbi5pY29ufTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWwtNCBmbGV4LTFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS04MDAgZGFyazp0ZXh0LXdoaXRlXCI+JHtub3RpZmljYXRpb24udGl0bGV9PC9oMz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+JHtub3RpZmljYXRpb24ucmVsYXRpdmVfdGltZX08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwibXQtMSB0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktMzAwXCI+JHtub3RpZmljYXRpb24ubWVzc2FnZX08L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtMiBmbGV4XCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ0ZXh0LXhzIHRleHQtcHJpbWFyeSBob3Zlcjp1bmRlcmxpbmUgbXItMyBtYXJrLXJlYWQtYnRuXCIgZGF0YS1pZD1cIiR7bm90aWZpY2F0aW9uLmlkfVwiPlxuICAgICAgICAgICAgICAgICR7bm90aWZpY2F0aW9uLnJlYWQgPyAnWWEgbGXDrWRvJyA6ICdNYXJjYXIgY29tbyBsZcOtZG8nfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInRleHQteHMgdGV4dC1yZWQtNTAwIGhvdmVyOnVuZGVybGluZSBkZWxldGUtYnRuXCIgZGF0YS1pZD1cIiR7bm90aWZpY2F0aW9uLmlkfVwiPlxuICAgICAgICAgICAgICAgIEVsaW1pbmFyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgYDtcblxuICAgICAgLy8gQcOxYWRpciBldmVudCBsaXN0ZW5lcnNcbiAgICAgIGNvbnN0IG1hcmtSZWFkQnRuID0gbm90aWZpY2F0aW9uRWwucXVlcnlTZWxlY3RvcignLm1hcmstcmVhZC1idG4nKTtcbiAgICAgIGlmIChtYXJrUmVhZEJ0bikge1xuICAgICAgICBtYXJrUmVhZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zdCBpZCA9IHBhcnNlSW50KG1hcmtSZWFkQnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcbiAgICAgICAgICBhd2FpdCBub3RpZmljYXRpb25TZXJ2aWNlLm1hcmtBc1JlYWQoaWQpO1xuICAgICAgICAgIGxvYWROb3RpZmljYXRpb25zKGN1cnJlbnRTa2lwLCBjdXJyZW50TGltaXQsIGN1cnJlbnRGaWx0ZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGVsZXRlQnRuID0gbm90aWZpY2F0aW9uRWwucXVlcnlTZWxlY3RvcignLmRlbGV0ZS1idG4nKTtcbiAgICAgIGlmIChkZWxldGVCdG4pIHtcbiAgICAgICAgZGVsZXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQoZGVsZXRlQnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcbiAgICAgICAgICBhd2FpdCBub3RpZmljYXRpb25TZXJ2aWNlLmRlbGV0ZU5vdGlmaWNhdGlvbihpZCk7XG4gICAgICAgICAgbG9hZE5vdGlmaWNhdGlvbnMoMCwgY3VycmVudExpbWl0LCBjdXJyZW50RmlsdGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub3RpZmljYXRpb25FbDtcbiAgICB9XG5cbiAgICAvLyBDYXJnYXIgbm90aWZpY2FjaW9uZXNcbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkTm90aWZpY2F0aW9ucyhza2lwID0gMCwgbGltaXQgPSAyMCwgdHlwZSA9ICdhbGwnKSB7XG4gICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgIC8vIE1vc3RyYXIgZXN0YWRvIGRlIGNhcmdhIHNvbG8gZW4gbGEgcHJpbWVyYSBjYXJnYVxuICAgICAgICBpZiAoc2tpcCA9PT0gMCkge1xuICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXIgcHktMTIgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFuaW1hdGUtc3BpbiBpbmxpbmUtYmxvY2sgdy04IGgtOCBib3JkZXItNCBib3JkZXItY3VycmVudCBib3JkZXItdC10cmFuc3BhcmVudCByb3VuZGVkLWZ1bGwgbWItNFwiIHJvbGU9XCJzdGF0dXNcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5DYXJnYW5kby4uLjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxwPkNhcmdhbmRvIG5vdGlmaWNhY2lvbmVzLi4uPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gRGV0ZXJtaW5hciBzaSBzZSBkZWJlIGZpbHRyYXIgcG9yIHRpcG9cbiAgICAgICAgICBjb25zdCB1bnJlYWRPbmx5ID0gZmFsc2U7IC8vIE1vc3RyYXIgdG9kYXMsIG5vIHNvbG8gbGFzIG5vIGxlw61kYXNcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBPYnRlbmVyIG5vdGlmaWNhY2lvbmVzXG4gICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBub3RpZmljYXRpb25TZXJ2aWNlLmdldE5vdGlmaWNhdGlvbnModW5yZWFkT25seSwgbGltaXQsIHNraXApO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFZlcmlmaWNhciBxdWUgbGEgcmVzcHVlc3RhIGVzIHbDoWxpZGFcbiAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8IHR5cGVvZiByZXNwb25zZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xhIHJlc3B1ZXN0YSBkZWwgc2Vydmlkb3Igbm8gZXMgdsOhbGlkYTonLCByZXNwb25zZSk7XG4gICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXIgcHktMTIgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cbiAgICAgICAgICAgICAgICA8cD5FcnJvciBhbCBjYXJnYXIgbm90aWZpY2FjaW9uZXMuIFJlc3B1ZXN0YSBpbnbDoWxpZGEuPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGA7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFNpIGVzIGxhIHByaW1lcmEgY2FyZ2EgKHNraXA9MCksIGxpbXBpYXIgZWwgY29udGVuZWRvclxuICAgICAgICAgIGlmIChza2lwID09PSAwKSB7XG4gICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQXNlZ3VyYXIgcXVlIGl0ZW1zIGV4aXN0ZSB5IGVzIHVuIGFycmF5XG4gICAgICAgICAgY29uc3QgaXRlbXMgPSByZXNwb25zZS5pdGVtcyB8fCBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBBY3R1YWxpemFyIGNvbnRhZG9yXG4gICAgICAgICAgaWYgKGNvdW50RWxlbWVudCkge1xuICAgICAgICAgICAgY291bnRFbGVtZW50LnRleHRDb250ZW50ID0gcmVzcG9uc2UudG90YWwgfHwgMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBNb3N0cmFyIGJvdMOzbiBkZSBjYXJnYXIgbcOhcyBzaSBoYXkgbcOhcyBub3RpZmljYWNpb25lc1xuICAgICAgICAgIGlmIChsb2FkTW9yZUJ0bikge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmhhc19tb3JlKSB7XG4gICAgICAgICAgICAgIGxvYWRNb3JlQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICBoYXNNb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxvYWRNb3JlQnRuLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICBoYXNNb3JlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU2kgbm8gaGF5IG5vdGlmaWNhY2lvbmVzLCBtb3N0cmFyIG1lbnNhamVcbiAgICAgICAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwICYmIHNraXAgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlciBweS0xMiB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPlxuICAgICAgICAgICAgICAgIDxwPk5vIGhheSBub3RpZmljYWNpb25lcyBwYXJhIG1vc3RyYXI8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBGaWx0cmFyIG5vdGlmaWNhY2lvbmVzIHBvciB0aXBvIHNpIGVzIG5lY2VzYXJpb1xuICAgICAgICAgIGxldCBmaWx0ZXJlZEl0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgaWYgKHR5cGUgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZEl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbSAmJiBpdGVtLnR5cGUgPT09IHR5cGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNpIGRlc3B1w6lzIGRlIGZpbHRyYXIgbm8gaGF5IG5vdGlmaWNhY2lvbmVzLCBtb3N0cmFyIG1lbnNhamVcbiAgICAgICAgICBpZiAoZmlsdGVyZWRJdGVtcy5sZW5ndGggPT09IDAgJiYgc2tpcCA9PT0gMCkge1xuICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyIHB5LTEyIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XG4gICAgICAgICAgICAgICAgPHA+Tm8gaGF5IG5vdGlmaWNhY2lvbmVzIGRlIGVzdGUgdGlwbzwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEHDsWFkaXIgbm90aWZpY2FjaW9uZXMgYWwgY29udGVuZWRvclxuICAgICAgICAgIGZpbHRlcmVkSXRlbXMuZm9yRWFjaChub3RpZmljYXRpb24gPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRWxlbWVudCA9IGNyZWF0ZU5vdGlmaWNhdGlvbkVsZW1lbnQobm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub3RpZmljYXRpb25FbGVtZW50KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFsIGNhcmdhciBub3RpZmljYWNpb25lczonLCBlcnJvcik7XG4gICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlciBweS0xMiB0ZXh0LXJlZC01MDBcIj5cbiAgICAgICAgICAgICAgPHA+RXJyb3IgYWwgY2FyZ2FyIG5vdGlmaWNhY2lvbmVzLiBQb3IgZmF2b3IsIGludMOpbnRhbG8gZGUgbnVldm8uPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyc1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAgICAvLyBDYXJnYXIgbm90aWZpY2FjaW9uZXMgaW5pY2lhbGVzXG4gICAgICBsb2FkTm90aWZpY2F0aW9ucygwLCBjdXJyZW50TGltaXQsIGN1cnJlbnRGaWx0ZXIpO1xuXG4gICAgICAvLyBGaWx0cmFyIHBvciB0aXBvXG4gICAgICBpZiAoZmlsdGVyU2VsZWN0KSB7XG4gICAgICAgIGZpbHRlclNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgY3VycmVudEZpbHRlciA9IGZpbHRlclNlbGVjdC52YWx1ZTtcbiAgICAgICAgICBjdXJyZW50U2tpcCA9IDA7IC8vIFJlc2V0ZWFyIHBhZ2luYWNpw7NuXG4gICAgICAgICAgbG9hZE5vdGlmaWNhdGlvbnMoMCwgY3VycmVudExpbWl0LCBjdXJyZW50RmlsdGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENhcmdhciBtw6FzIG5vdGlmaWNhY2lvbmVzXG4gICAgICBpZiAobG9hZE1vcmVCdG4pIHtcbiAgICAgICAgbG9hZE1vcmVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc01vcmUpIHtcbiAgICAgICAgICAgIGN1cnJlbnRTa2lwICs9IGN1cnJlbnRMaW1pdDtcbiAgICAgICAgICAgIGxvYWROb3RpZmljYXRpb25zKGN1cnJlbnRTa2lwLCBjdXJyZW50TGltaXQsIGN1cnJlbnRGaWx0ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcmNhciB0b2RhcyBjb21vIGxlw61kYXNcbiAgICAgIGlmIChtYXJrQWxsUmVhZEJ0bikge1xuICAgICAgICBtYXJrQWxsUmVhZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBub3RpZmljYXRpb25TZXJ2aWNlLm1hcmtBbGxBc1JlYWQoKTtcbiAgICAgICAgICBsb2FkTm90aWZpY2F0aW9ucygwLCBjdXJyZW50TGltaXQsIGN1cnJlbnRGaWx0ZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gTGltcGlhciB0b2RhcyBsYXMgbm90aWZpY2FjaW9uZXNcbiAgICAgIGlmIChjbGVhckFsbEJ0bikge1xuICAgICAgICBjbGVhckFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAoY29uZmlybSgnwr9Fc3TDoXMgc2VndXJvIGRlIHF1ZSBxdWllcmVzIGVsaW1pbmFyIHRvZGFzIGxhcyBub3RpZmljYWNpb25lcz8nKSkge1xuICAgICAgICAgICAgLy8gQXF1w60gaXLDrWEgbGEgbGxhbWFkYSBhbCBzZXJ2aWNpbyBwYXJhIGVsaW1pbmFyIHRvZGFzIGxhcyBub3RpZmljYWNpb25lc1xuICAgICAgICAgICAgLy8gUG9yIGFob3JhLCBzaW1wbGVtZW50ZSByZWNhcmdhbW9zIGxhIHDDoWdpbmFcbiAgICAgICAgICAgIGxvYWROb3RpZmljYXRpb25zKDAsIGN1cnJlbnRMaW1pdCwgY3VycmVudEZpbHRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEluaWNpYXIgZWwgc2VydmljaW8gZGUgbm90aWZpY2FjaW9uZXNcbiAgICBub3RpZmljYXRpb25TZXJ2aWNlLnN0YXJ0UG9sbGluZyg2MDAwMCk7IC8vIEFjdHVhbGl6YXIgY2FkYSBtaW51dG9cbiAgPC9zY3JpcHQ+XG48L01haW5MYXlvdXQ+Il0sIm1hcHBpbmdzIjoiQUE4REksU0FBUywyQkFBMkI7QUFHcEMsSUFBSSxjQUFjO0FBQ2xCLElBQUksZUFBZTtBQUNuQixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLFVBQVU7QUFHZCxNQUFNLFlBQVksU0FBUyxlQUFlLHlCQUF5QjtBQUNuRSxNQUFNLGVB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