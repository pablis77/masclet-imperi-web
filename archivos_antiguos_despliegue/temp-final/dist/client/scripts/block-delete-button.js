/**
 * Utilidades para bloquear botones según permisos de usuario
 * Este script contiene solo funciones auxiliares y no ejecuta código directamente
 */

// Función para aplicar estilo y comportamiento de botón bloqueado
function deshabilitarBoton(boton, mensaje) {
  if (!boton) return;
  
  // Deshabilitar el botón
  boton.disabled = true;
  boton.style.opacity = "0.5";
  boton.style.cursor = "not-allowed";
  boton.style.pointerEvents = "none";
  boton.title = mensaje;
  
  // Añadir icono de candado si no existe ya
  if (!boton.querySelector(".lock-icon")) {
    const lockIcon = document.createElement("span");
    lockIcon.textContent = " 🔒";
    lockIcon.className = "ml-1 lock-icon";
    boton.appendChild(lockIcon);
  }
  
  // Reemplazar onclick para evitar que se ejecute
  boton.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    alert(mensaje);
    return false;
  };
}

// Función para obtener el rol del usuario actual desde el token JWT
function obtenerRolUsuario() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.role || "").toLowerCase();
  } catch (e) {
    console.error("Error al decodificar token:", e);
    return null;
  }
}
