import { messagesStore, removeMessage } from "/src/stores/messageStore.ts";
function createMessageElement(message) {
  let bgColor, borderColor, textColor, iconSvg;
  switch (message.type) {
    case "success":
      bgColor = "bg-green-50 dark:bg-green-900/20";
      borderColor = "border-green-500 dark:border-green-700";
      textColor = "text-green-800 dark:text-green-300";
      iconSvg = `<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`;
      break;
    case "error":
      bgColor = "bg-red-50 dark:bg-red-900/20";
      borderColor = "border-red-500 dark:border-red-700";
      textColor = "text-red-800 dark:text-red-300";
      iconSvg = `<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`;
      break;
    case "warning":
      bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
      borderColor = "border-yellow-500 dark:border-yellow-700";
      textColor = "text-yellow-800 dark:text-yellow-300";
      iconSvg = `<svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`;
      break;
    default:
      bgColor = "bg-blue-50 dark:bg-blue-900/20";
      borderColor = "border-blue-500 dark:border-blue-700";
      textColor = "text-blue-800 dark:text-blue-300";
      iconSvg = `<svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`;
  }
  const messageElement = document.createElement("div");
  messageElement.id = `message-${message.id}`;
  messageElement.className = `message-alert rounded-lg border ${borderColor} ${bgColor} p-4 shadow-lg transform transition-all duration-300 ease-in-out opacity-0 translate-x-4`;
  messageElement.setAttribute("role", "alert");
  messageElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${iconSvg}
        </div>
        <div class="ml-3 flex-grow">
          ${message.title ? `<h3 class="text-sm font-medium ${textColor}">${message.title}</h3>` : ""}
          <div class="mt-1 text-sm ${textColor}">
            <p>${message.content}</p>
          </div>
        </div>
        ${message.dismissible ? `
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button 
                type="button" 
                class="inline-flex rounded-md p-1.5 text-gray-500 hover:text-gray-600 focus:outline-none" 
                aria-label="Cerrar"
                onclick="document.dispatchEvent(new CustomEvent('dismiss-message', { detail: { id: '${message.id}' } }))"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  return messageElement;
}
function showMessage(message) {
  const container = document.getElementById("message-container");
  if (!container) return;
  const messageElement = createMessageElement(message);
  container.appendChild(messageElement);
  setTimeout(() => {
    messageElement.classList.remove("opacity-0", "translate-x-4");
    messageElement.classList.add("opacity-100", "translate-x-0");
  }, 10);
  return messageElement;
}
function hideMessage(id) {
  const messageElement = document.getElementById(`message-${id}`);
  if (!messageElement) return;
  messageElement.classList.add("opacity-0", "translate-x-4");
  setTimeout(() => {
    messageElement.remove();
  }, 300);
}
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dismiss-message", (event) => {
    const { id } = event.detail;
    removeMessage(id);
  });
  messagesStore.subscribe((messages) => {
    const container = document.getElementById("message-container");
    if (!container) return;
    const currentMessageIds = Array.from(container.children).map(
      (el) => el.id.replace("message-", "")
    );
    messages.forEach((message) => {
      if (!currentMessageIds.includes(message.id)) {
        showMessage(message);
      }
    });
    currentMessageIds.forEach((id) => {
      if (!messages.some((message) => message.id === id)) {
        hideMessage(id);
      }
    });
  });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lc3NhZ2VDb250YWluZXIuYXN0cm8iXSwic291cmNlc0NvbnRlbnQiOlsiLS0tXG4vKipcbiAqIENvbnRlbmVkb3IgcGFyYSBtb3N0cmFyIG1lbnNhamVzIHkgbm90aWZpY2FjaW9uZXMgZGUgbGEgYXBsaWNhY2nDs25cbiAqL1xuLS0tXG5cbjxkaXYgaWQ9XCJtZXNzYWdlLWNvbnRhaW5lclwiIGNsYXNzPVwiZml4ZWQgdG9wLTQgcmlnaHQtNCB6LTUwIHNwYWNlLXktNCBtYXgtdy1tZFwiPjwvZGl2PlxuXG48c2NyaXB0PlxuICBpbXBvcnQgeyBtZXNzYWdlc1N0b3JlLCByZW1vdmVNZXNzYWdlIH0gZnJvbSAnLi4vLi4vc3RvcmVzL21lc3NhZ2VTdG9yZSc7XG4gIFxuICAvLyBGdW5jacOzbiBwYXJhIGNyZWFyIHVuIGVsZW1lbnRvIGRlIG1lbnNhamVcbiAgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZUVsZW1lbnQobWVzc2FnZSkge1xuICAgIC8vIENvbmZpZ3VyYXIgY2xhc2VzIHkgaWNvbm9zIHNlZ8O6biBlbCB0aXBvIGRlIGFsZXJ0YVxuICAgIGxldCBiZ0NvbG9yLCBib3JkZXJDb2xvciwgdGV4dENvbG9yLCBpY29uU3ZnO1xuICAgIFxuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgICAgYmdDb2xvciA9ICdiZy1ncmVlbi01MCBkYXJrOmJnLWdyZWVuLTkwMC8yMCc7XG4gICAgICAgIGJvcmRlckNvbG9yID0gJ2JvcmRlci1ncmVlbi01MDAgZGFyazpib3JkZXItZ3JlZW4tNzAwJztcbiAgICAgICAgdGV4dENvbG9yID0gJ3RleHQtZ3JlZW4tODAwIGRhcms6dGV4dC1ncmVlbi0zMDAnO1xuICAgICAgICBpY29uU3ZnID0gYDxzdmcgY2xhc3M9XCJoLTUgdy01IHRleHQtZ3JlZW4tNDAwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjAgMjBcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgPHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGQ9XCJNMTAgMThhOCA4IDAgMTAwLTE2IDggOCAwIDAwMCAxNnptMy43MDctOS4yOTNhMSAxIDAgMDAtMS40MTQtMS40MTRMOSAxMC41ODYgNy43MDcgOS4yOTNhMSAxIDAgMDAtMS40MTQgMS40MTRsMiAyYTEgMSAwIDAwMS40MTQgMGw0LTR6XCIgY2xpcC1ydWxlPVwiZXZlbm9kZFwiIC8+XG4gICAgICAgIDwvc3ZnPmA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICBiZ0NvbG9yID0gJ2JnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAnO1xuICAgICAgICBib3JkZXJDb2xvciA9ICdib3JkZXItcmVkLTUwMCBkYXJrOmJvcmRlci1yZWQtNzAwJztcbiAgICAgICAgdGV4dENvbG9yID0gJ3RleHQtcmVkLTgwMCBkYXJrOnRleHQtcmVkLTMwMCc7XG4gICAgICAgIGljb25TdmcgPSBgPHN2ZyBjbGFzcz1cImgtNSB3LTUgdGV4dC1yZWQtNDAwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjAgMjBcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgPHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGQ9XCJNMTAgMThhOCA4IDAgMTAwLTE2IDggOCAwIDAwMCAxNnpNOC43MDcgNy4yOTNhMSAxIDAgMDAtMS40MTQgMS40MTRMOC41ODYgMTBsLTEuMjkzIDEuMjkzYTEgMSAwIDEwMS40MTQgMS40MTRMMTAgMTEuNDE0bDEuMjkzIDEuMjkzYTEgMSAwIDAwMS40MTQtMS40MTRMMTEuNDE0IDEwbDEuMjkzLTEuMjkzYTEgMSAwIDAwLTEuNDE0LTEuNDE0TDEwIDguNTg2IDguNzA3IDcuMjkzelwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiAvPlxuICAgICAgICA8L3N2Zz5gO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICBiZ0NvbG9yID0gJ2JnLXllbGxvdy01MCBkYXJrOmJnLXllbGxvdy05MDAvMjAnO1xuICAgICAgICBib3JkZXJDb2xvciA9ICdib3JkZXIteWVsbG93LTUwMCBkYXJrOmJvcmRlci15ZWxsb3ctNzAwJztcbiAgICAgICAgdGV4dENvbG9yID0gJ3RleHQteWVsbG93LTgwMCBkYXJrOnRleHQteWVsbG93LTMwMCc7XG4gICAgICAgIGljb25TdmcgPSBgPHN2ZyBjbGFzcz1cImgtNSB3LTUgdGV4dC15ZWxsb3ctNDAwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjAgMjBcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+XG4gICAgICAgICAgPHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGQ9XCJNOC4yNTcgMy4wOTljLjc2NS0xLjM2IDIuNzIyLTEuMzYgMy40ODYgMGw1LjU4IDkuOTJjLjc1IDEuMzM0LS4yMTMgMi45OC0xLjc0MiAyLjk4SDQuNDJjLTEuNTMgMC0yLjQ5My0xLjY0Ni0xLjc0My0yLjk4bDUuNTgtOS45MnpNMTEgMTNhMSAxIDAgMTEtMiAwIDEgMSAwIDAxMiAwem0tMS04YTEgMSAwIDAwLTEgMXYzYTEgMSAwIDAwMiAwVjZhMSAxIDAgMDAtMS0xelwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiAvPlxuICAgICAgICA8L3N2Zz5gO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vIGluZm9cbiAgICAgICAgYmdDb2xvciA9ICdiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAnO1xuICAgICAgICBib3JkZXJDb2xvciA9ICdib3JkZXItYmx1ZS01MDAgZGFyazpib3JkZXItYmx1ZS03MDAnO1xuICAgICAgICB0ZXh0Q29sb3IgPSAndGV4dC1ibHVlLTgwMCBkYXJrOnRleHQtYmx1ZS0zMDAnO1xuICAgICAgICBpY29uU3ZnID0gYDxzdmcgY2xhc3M9XCJoLTUgdy01IHRleHQtYmx1ZS00MDBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyMCAyMFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj5cbiAgICAgICAgICA8cGF0aCBmaWxsLXJ1bGU9XCJldmVub2RkXCIgZD1cIk0xOCAxMGE4IDggMCAxMS0xNiAwIDggOCAwIDAxMTYgMHptLTctNGExIDEgMCAxMS0yIDAgMSAxIDAgMDEyIDB6TTkgOWExIDEgMCAwMDAgMnYzYTEgMSAwIDAwMSAxaDFhMSAxIDAgMTAwLTJoLTFWOWExIDEgMCAwMC0xLTF6XCIgY2xpcC1ydWxlPVwiZXZlbm9kZFwiIC8+XG4gICAgICAgIDwvc3ZnPmA7XG4gICAgfVxuICAgIFxuICAgIC8vIENyZWFyIGVsZW1lbnRvIGRlIG1lbnNhamVcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1lc3NhZ2VFbGVtZW50LmlkID0gYG1lc3NhZ2UtJHttZXNzYWdlLmlkfWA7XG4gICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lID0gYG1lc3NhZ2UtYWxlcnQgcm91bmRlZC1sZyBib3JkZXIgJHtib3JkZXJDb2xvcn0gJHtiZ0NvbG9yfSBwLTQgc2hhZG93LWxnIHRyYW5zZm9ybSB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgZWFzZS1pbi1vdXQgb3BhY2l0eS0wIHRyYW5zbGF0ZS14LTRgO1xuICAgIG1lc3NhZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsICdhbGVydCcpO1xuICAgIFxuICAgIC8vIENvbnRlbmlkbyBkZWwgbWVuc2FqZVxuICAgIG1lc3NhZ2VFbGVtZW50LmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLXN0YXJ0XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4LXNocmluay0wXCI+XG4gICAgICAgICAgJHtpY29uU3ZnfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1sLTMgZmxleC1ncm93XCI+XG4gICAgICAgICAgJHttZXNzYWdlLnRpdGxlID8gYDxoMyBjbGFzcz1cInRleHQtc20gZm9udC1tZWRpdW0gJHt0ZXh0Q29sb3J9XCI+JHttZXNzYWdlLnRpdGxlfTwvaDM+YCA6ICcnfVxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdC0xIHRleHQtc20gJHt0ZXh0Q29sb3J9XCI+XG4gICAgICAgICAgICA8cD4ke21lc3NhZ2UuY29udGVudH08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAke21lc3NhZ2UuZGlzbWlzc2libGUgPyBgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1sLWF1dG8gcGwtM1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIi1teC0xLjUgLW15LTEuNVwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIiBcbiAgICAgICAgICAgICAgICBjbGFzcz1cImlubGluZS1mbGV4IHJvdW5kZWQtbWQgcC0xLjUgdGV4dC1ncmF5LTUwMCBob3Zlcjp0ZXh0LWdyYXktNjAwIGZvY3VzOm91dGxpbmUtbm9uZVwiIFxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJDZXJyYXJcIlxuICAgICAgICAgICAgICAgIG9uY2xpY2s9XCJkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZGlzbWlzcy1tZXNzYWdlJywgeyBkZXRhaWw6IHsgaWQ6ICcke21lc3NhZ2UuaWR9JyB9IH0pKVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiaC01IHctNVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPlxuICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGQ9XCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiAvPlxuICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgIDogJyd9XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICAgIFxuICAgIHJldHVybiBtZXNzYWdlRWxlbWVudDtcbiAgfVxuICBcbiAgLy8gRnVuY2nDs24gcGFyYSBtb3N0cmFyIHVuIG1lbnNhamUgY29uIGFuaW1hY2nDs25cbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2UobWVzc2FnZSkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXNzYWdlLWNvbnRhaW5lcicpO1xuICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XG4gICAgXG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBjcmVhdGVNZXNzYWdlRWxlbWVudChtZXNzYWdlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpO1xuICAgIFxuICAgIC8vIEFwbGljYXIgYW5pbWFjacOzbiBkZSBlbnRyYWRhXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdvcGFjaXR5LTAnLCAndHJhbnNsYXRlLXgtNCcpO1xuICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3BhY2l0eS0xMDAnLCAndHJhbnNsYXRlLXgtMCcpO1xuICAgIH0sIDEwKTtcbiAgICBcbiAgICByZXR1cm4gbWVzc2FnZUVsZW1lbnQ7XG4gIH1cbiAgXG4gIC8vIEZ1bmNpw7NuIHBhcmEgb2N1bHRhciB1biBtZW5zYWplIGNvbiBhbmltYWNpw7NuXG4gIGZ1bmN0aW9uIGhpZGVNZXNzYWdlKGlkKSB7XG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgbWVzc2FnZS0ke2lkfWApO1xuICAgIGlmICghbWVzc2FnZUVsZW1lbnQpIHJldHVybjtcbiAgICBcbiAgICAvLyBBcGxpY2FyIGFuaW1hY2nDs24gZGUgc2FsaWRhXG4gICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3BhY2l0eS0wJywgJ3RyYW5zbGF0ZS14LTQnKTtcbiAgICBcbiAgICAvLyBFbGltaW5hciBlbGVtZW50byBkZXNwdcOpcyBkZSBsYSBhbmltYWNpw7NuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBtZXNzYWdlRWxlbWVudC5yZW1vdmUoKTtcbiAgICB9LCAzMDApO1xuICB9XG4gIFxuICAvLyBJbmljaWFsaXphciBlbCBjb250ZW5lZG9yIGRlIG1lbnNhamVzXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAgLy8gTWFuZWphciBldmVudG8gcGFyYSBkZXNjYXJ0YXIgbWVuc2FqZXNcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkaXNtaXNzLW1lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgaWQgfSA9IGV2ZW50LmRldGFpbDtcbiAgICAgIHJlbW92ZU1lc3NhZ2UoaWQpO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFN1c2NyaWJpcnNlIGEgY2FtYmlvcyBlbiBlbCBzdG9yZSBkZSBtZW5zYWplc1xuICAgIG1lc3NhZ2VzU3RvcmUuc3Vic2NyaWJlKChtZXNzYWdlcykgPT4ge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lc3NhZ2UtY29udGFpbmVyJyk7XG4gICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuICAgICAgXG4gICAgICAvLyBPYnRlbmVyIElEcyBkZSBtZW5zYWplcyBhY3R1YWxlcyBlbiBlbCBET01cbiAgICAgIGNvbnN0IGN1cnJlbnRNZXNzYWdlSWRzID0gQXJyYXkuZnJvbShjb250YWluZXIuY2hpbGRyZW4pLm1hcChcbiAgICAgICAgZWwgPT4gZWwuaWQucmVwbGFjZSgnbWVzc2FnZS0nLCAnJylcbiAgICAgICk7XG4gICAgICBcbiAgICAgIC8vIE1vc3RyYXIgbnVldm9zIG1lbnNhamVzXG4gICAgICBtZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2UgPT4ge1xuICAgICAgICBpZiAoIWN1cnJlbnRNZXNzYWdlSWRzLmluY2x1ZGVzKG1lc3NhZ2UuaWQpKSB7XG4gICAgICAgICAgc2hvd01lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBPY3VsdGFyIG1lbnNhamVzIGVsaW1pbmFkb3NcbiAgICAgIGN1cnJlbnRNZXNzYWdlSWRzLmZvckVhY2goaWQgPT4ge1xuICAgICAgICBpZiAoIW1lc3NhZ2VzLnNvbWUobWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBpZCkpIHtcbiAgICAgICAgICBoaWRlTWVzc2FnZShpZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbjwvc2NyaXB0PiJdLCJtYXBwaW5ncyI6IkFBU0UsU0FBUyxlQUFlLHFCQUFxQjtBQUc3QyxTQUFTLHFCQUFxQixTQUFTO0FBRXJDLE1BQUksU0FBUyxhQUFhLFdBQVc7QUFFckMsVUFBUSxRQUFRLE1BQU07SUFDcEIsS0FBSztBQUNILGdCQUFVO0FBQ1Ysb0JBQWM7QUFDZCxrQkFBWTtBQUNaLGdCQUFVOzs7QUFHVjtJQUNGLEtBQUs7QUFDSCxnQkFBVTtBQUNWLG9CQUFjO0FBQ2Qsa0JBQVk7QUFDWixnQkFBVTs7O0FBR1Y7SUFDRixLQUFLO0FBQ0gsZ0JBQVU7QUFDVixvQkFBYztBQUNkLGtCQUFZO0FBQ1osZ0JBQVU7OztBQUdWO0lBQ0Y7QUFDRSxnQkFBVTtBQUNWLG9CQUFjO0FBQ2Qsa0JBQVk7QUFDWixnQkFBVTs7O0VBR2Q7QUFHQSxRQUFNLGlCQUFpQixTQUFTLGNBQWMsS0FBSztBQUNuRCxpQkFBZSxLQUFLLFdBQVcsUUFBUSxFQUFFO0FBQ3pDLGlCQUFlLFlBQVksbUNBQW1DLFdBQVcsSUFBSSxPQUFPO0FBQ3BGLGlCQUFlLGFBQWEsUUFBUSxPQUFPO0FBRzNDLGlCQUFlLFlBQVk7OztZQUduQixPQUFPOzs7WUFHUCxRQUFRLFFBQVEsa0NBQWtDLFNBQVMsS0FBSyxRQUFRLEtBQUssVUFBVSxFQUFFO3FDQUNoRSxTQUFTO2lCQUM3QixRQUFRLE9BQU87OztVQUd0QixRQUFRLGNBQWM7Ozs7Ozs7c0dBT3NFLFFBQVEsRUFBRTs7Ozs7Ozs7WUFRcEcsRUFBRTs7O0FBSVYsU0FBTztBQUNUO0FBR0EsU0FBUyxZQUFZLFNBQVM7QUFDNUIsUUFBTSxZQUFZLFNBQVMsZUFBZSxtQkFBbUI7QUFDN0QsTUFBSSxDQUFDLFVBQVc7QUFFaEIsUUFBTSxpQkFBaUIscUJBQXFCLE9BQU87QUFDbkQsWUFBVSxZQUFZLGNBQWM7QUFHcEMsYUFBVyxNQUFNO0FBQ2YsbUJBQWUsVUFBVSxPQUFPLGFBQWEsZUFBZTtBQUM1RCxtQkFBZSxVQUFVLElBQUksZUFBZSxlQUFlO0VBQzdELEdBQUcsRUFBRTtBQUVMLFNBQU87QUFDVDtBQUdBLFNBQVMsWUFBWSxJQUFJO0FBQ3ZCLFFBQU0saUJBQWlCLFNBQVMsZUFBZSxXQUFXLEVBQUUsRUFBRTtBQUM5RCxNQUFJLENBQUMsZUFBZ0I7QUFHckIsaUJBQWUsVUFBVSxJQUFJLGFBQWEsZUFBZTtBQUd6RCxhQUFXLE1BQU07QUFDZixtQkFBZSxPQUFPO0VBQ3hCLEdBQUcsR0FBRztBQUNSO0FBR0EsU0FBUyxpQkFBaUIsb0JBQW9CLE1BQU07QUFFbEQsV0FBUyxpQkFBaUIsbUJBQW1CLENBQUMsVUFBVTtBQUN0RCxVQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU07QUFDckIsa0JBQWMsRUFBRTtFQUNsQixDQUFDO0FBR0QsZ0JBQWMsVUFBVSxDQUFDLGFBQWE7QUFDcEMsVUFBTSxZQUFZLFNBQVMsZUFBZSxtQkFBbUI7QUFDN0QsUUFBSSxDQUFDLFVBQVc7QUFHaEIsVUFBTSxvQkFBb0IsTUFBTSxLQUFLLFVBQVUsUUFBUSxFQUFFO01BQ3ZELFFBQU0sR0FBRyxHQUFHLFFBQVEsWUFBWSxFQUFFO0lBQ3BDO0FBR0EsYUFBUyxRQUFRLGFBQVc7QUFDMUIsVUFBSSxDQUFDLGtCQUFrQixTQUFTLFFBQVEsRUFBRSxHQUFHO0FBQzNDLG9CQUFZLE9BQU87TUFDckI7SUFDRixDQUFDO0FBR0Qsc0JBQWtCLFFBQVEsUUFBTTtBQUM5QixVQUFJLENBQUMsU0FBUyxLQUFLLGFBQVcsUUFBUSxPQUFPLEVBQUUsR0FBRztBQUNoRCxvQkFBWSxFQUFFO01BQ2hCO0lBQ0YsQ0FBQztFQUNILENBQUM7QUFDSCxDQUFDOyIsIm5hbWVzIjpbXX0=