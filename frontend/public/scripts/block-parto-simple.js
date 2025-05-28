/**
 * Script simple y directo para bloquear botones de eliminar parto
 */
document.addEventListener("DOMContentLoaded", function() {
  console.log("Script de bloqueo de partos iniciado");
  
  function checkButtonsAndBlock() {
    try {
      // Verificar rol del usuario
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = (payload.role || "").toLowerCase();
      
      // Solo bloquear para roles editor y usuario
      if (role === "editor" || role === "usuario") {
        // Buscar botones por título específico
        const buttons = document.querySelectorAll("button[title=\"Eliminar parto\"]");
        
        buttons.forEach(function(btn) {
          // Saltar si ya está bloqueado
          if (btn.getAttribute("data-blocked") === "true") return;
          
          // Marcar como bloqueado
          btn.setAttribute("data-blocked", "true");
          
          // Aplicar bloqueo visual
          btn.disabled = true;
          btn.style.opacity = "0.5";
          btn.style.cursor = "not-allowed";
          btn.style.pointerEvents = "none";
          btn.title = "NO TIENES PERMISOS PARA ELIMINAR PARTOS";
          
          // Añadir icono de candado
          const lockIcon = document.createElement("span");
          lockIcon.textContent = " 🔒";
          lockIcon.className = "ml-1 lock-icon";
          btn.appendChild(lockIcon);
          
          // Reemplazar evento click
          btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            alert("NO TIENES PERMISOS PARA ELIMINAR PARTOS");
            return false;
          };
          
          console.log("Botón de eliminar parto bloqueado");
        });
      }
    } catch (e) {
      console.error("Error al bloquear botones:", e);
    }
  }
  
  // Comprobar al cargar la página
  checkButtonsAndBlock();
  
  // Comprobar periódicamente
  setInterval(checkButtonsAndBlock, 1000);
  
  // Comprobar al cambiar de pestaña
  document.addEventListener("click", function(e) {
    if (e.target && e.target.closest("#tab-partos")) {
      setTimeout(checkButtonsAndBlock, 200);
    }
  });
});
