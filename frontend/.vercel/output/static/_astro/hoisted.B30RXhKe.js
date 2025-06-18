import{a as l}from"./apiService.DFT83caO.js";import"./vendor.DPE1g--N.js";import"./apiConfigAdapter.B0N4Zv2p.js";window.showPasswordErrorModal=function(){document.dispatchEvent(new CustomEvent("show-password-error"))};document.addEventListener("DOMContentLoaded",()=>{const r=document.getElementById("loginForm"),a=document.createElement("script");a.textContent=`
      // Esta función se ejecutará cuando el componente React esté listo
      document.addEventListener('astro:page-load', () => {
        // Escuchar el evento personalizado para mostrar el modal
        document.addEventListener('show-password-error', () => {
          // Buscar el elemento modal por su ID
          const modal = document.getElementById('passwordErrorModal');
          if (modal) {
            // Enviar mensaje al componente React para cambiar su estado
            const event = new CustomEvent('update-modal-state', { 
              detail: { isOpen: true } 
            });
            modal.dispatchEvent(event);
          }
        });
      });
    `,document.head.appendChild(a),r.addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("username").value,d=document.getElementById("password").value;try{const e=await l.login(s,d),t=e.data?.access_token||e.access_token;if(t){if(console.log("Login exitoso, token recibido:",t),localStorage.setItem("token",t),e.data?.user||e.user){const o=e.data?.user||e.user;o.username&&o.username.toLowerCase()==="ramon"?(console.log("🔴 Usuario Ramon detectado, FORZANDO rol Ramon"),o.role="Ramon",localStorage.setItem("userRole","Ramon"),console.log("🔴 Rol Ramon guardado separadamente para mayor seguridad"),localStorage.setItem("ramonFix","true")):o.role==="gerente"&&(console.log("Rol gerente detectado, convirtiendo a Ramon"),o.role="Ramon",localStorage.setItem("userRole","Ramon")),localStorage.setItem("user",JSON.stringify(o)),o.role&&localStorage.setItem("userRole",o.role)}console.log("Redirigiendo a la página principal (dashboard)"),window.location.href="/";return}else console.error("Error de autenticación: No se encontró token en la respuesta:",e),window.showPasswordErrorModal()}catch(e){console.error("Error al iniciar sesión:",e),window.showPasswordErrorModal()}})});
